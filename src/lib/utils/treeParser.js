// src/lib/utils/treeParser.js

/**
 * Parses an ASCII folder structure (like from `tree` command or AI output) into a nested JSON tree.
 * Handles indentation, tree characters (├, └, │, ─), and automatically detects/strips a common root folder.
 * @param {string} rawText - The pasted folder structure text.
 * @returns {Array} - Array of root nodes (each with name, type, path, children if folder).
 */
export function parseFolderStructure(rawText) {
    // 1. Clean input: remove empty lines and markdown code block fences
    const lines = rawText
        .split('\n')
        .filter(line => line.trim() !== '' && !line.trim().startsWith('```'));

    const root = [];
    // Stack to track current path: each entry = { level, children, path }
    const stack = [{ level: -1, children: root, path: '' }];

    for (const line of lines) {
        // Separate the tree symbols from the actual name
        const match = line.match(/^([│├└─\s]*)(.*)$/);
        if (!match) continue;

        const symbols = match[1];
        let name = match[2].trim();

        // Detect if it's a folder (ends with '/' or no extension)
        const isFolderHint = name.endsWith('/');
        if (isFolderHint) name = name.slice(0, -1);

        // Determine level by counting leading spaces or tree symbols? Simpler: use the index of the name in the original line.
        // But tree symbols may include spaces, so we compute level as the number of characters before the name starts.
        const level = line.indexOf(match[2]);

        // Heuristic: if name contains a dot, it's likely a file, unless it's a folder hint.
        const isFolder = isFolderHint || !name.includes('.');

        // Adjust stack: pop until we find the parent at this level
        while (stack.length > 1 && stack[stack.length - 1].level >= level) {
            stack.pop();
        }

        const parent = stack[stack.length - 1];
        const currentPath = parent.path ? `${parent.path}/${name}` : name;

        const node = {
            name,
            type: isFolder ? 'folder' : 'file',
            path: currentPath,
            ...(isFolder && { children: [] })
        };

        parent.children.push(node);

        if (isFolder) {
            stack.push({ level, children: node.children, path: currentPath });
        }
    }

    // 2. Strip common root folder if all top-level items are inside a single folder
    if (root.length === 1 && root[0].type === 'folder') {
        const possibleRoot = root[0];
        // Check if there are any files directly at root level
        const hasFilesAtRoot = root.some(item => item.type === 'file');
        if (!hasFilesAtRoot) {
            console.log(`Stripping common root folder: "${possibleRoot.name}"`);
            return possibleRoot.children || [];
        }
    }

    return root;
}