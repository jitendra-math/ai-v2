// src/lib/utils/treeParser.js

/**
 * Parses an ASCII folder structure into a nested JSON tree.
 * Uses lookahead logic for accurate folder detection and safely strips common roots from paths.
 * @param {string} rawText - The pasted folder structure text.
 * @returns {Array} - Array of root nodes (each with name, type, path, children if folder).
 */
export function parseFolderStructure(rawText) {
    // 1. Clean input: remove empty lines and markdown code block fences
    const lines = rawText
        .split('\n')
        .filter(line => line.trim() !== '' && !line.trim().startsWith('```'));

    const nodes = [];

    // Pass 1: Extract basic info and indentation levels
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/^([│├└─\s]*)(.*)$/);
        if (!match) continue;

        let name = match[2].trim();
        const isFolderHint = name.endsWith('/');
        if (isFolderHint) name = name.slice(0, -1);

        // Compute level as the number of characters before the name starts
        const level = line.indexOf(match[2]);
        nodes.push({ name, level, isFolderHint, originalLine: line });
    }

    // Pass 2: Determine actual type using lookahead (bulletproof folder detection)
    for (let i = 0; i < nodes.length; i++) {
        const current = nodes[i];
        const next = nodes[i + 1];
        
        // It is a folder if it explicitly has a '/' OR the next item is indented deeper
        if (current.isFolderHint || (next && next.level > current.level)) {
            current.type = 'folder';
        } else {
            current.type = 'file';
        }
    }

    // Pass 3: Build the tree and true paths
    const root = [];
    const stack = [{ level: -1, children: root, path: '' }];

    for (const node of nodes) {
        // Adjust stack: pop until we find the parent at this level
        while (stack.length > 1 && stack[stack.length - 1].level >= node.level) {
            stack.pop();
        }

        const parent = stack[stack.length - 1];
        const currentPath = parent.path ? `${parent.path}/${node.name}` : node.name;

        const treeNode = {
            name: node.name,
            type: node.type,
            path: currentPath,
            ...(node.type === 'folder' && { children: [] })
        };

        parent.children.push(treeNode);

        if (node.type === 'folder') {
            stack.push({ level: node.level, children: treeNode.children, path: currentPath });
        }
    }

    // Pass 4: Strip common root folder completely and fix paths
    if (root.length === 1 && root[0].type === 'folder') {
        const possibleRoot = root[0];
        // Check if there are any files directly at root level
        const hasFilesAtRoot = root.some(item => item.type === 'file');
        
        if (!hasFilesAtRoot) {
            console.log(`Stripping common root folder: "${possibleRoot.name}"`);
            const rootPrefix = possibleRoot.name + '/';
            
            // Recursive function to strip the root folder's name from all child paths
            function stripRootFromPaths(items) {
                items.forEach(item => {
                    if (item.path.startsWith(rootPrefix)) {
                        item.path = item.path.substring(rootPrefix.length);
                    }
                    if (item.children) {
                        stripRootFromPaths(item.children);
                    }
                });
            }
            
            if (possibleRoot.children) {
                stripRootFromPaths(possibleRoot.children);
            }
            return possibleRoot.children || [];
        }
    }

    return root;
}
