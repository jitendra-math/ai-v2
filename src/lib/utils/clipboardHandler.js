// src/lib/utils/clipboardHandler.js

/**
 * Reads the clipboard text.
 * Requires browser permissions; should be called within a user-initiated event (like click).
 * @returns {Promise<string>} The clipboard text.
 */
export async function readClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        return text;
    } catch (error) {
        console.error('Clipboard read failed:', error);
        throw new Error('Clipboard access denied. Please allow permission or paste manually.');
    }
}

/**
 * Extracts file path from the first line of the clipboard text.
 * Supports comments: // path, <!-- path -->, # path, /* path * / (closing optional)
 * @param {string} text - Full clipboard content.
 * @returns {string|null} Extracted file path or null if not found.
 */
export function extractFilePathFromComment(text) {
    if (!text) return null;
    const lines = text.trim().split('\n');
    const firstLine = lines[0].trim();

    // Regex to capture the path from various comment styles
    // Group 1: the path (including slashes, dots, etc.)
    const commentRegex = /^(?:\/\/|<!--|#|\/\*)\s*(.+?)\s*(?:-->|\*\/)?$/;
    const match = firstLine.match(commentRegex);

    if (match && match[1]) {
        return match[1].trim();
    }
    return null;
}

/**
 * Validates that the extracted path matches the existing tree structure (optional).
 * For now, just returns the path.
 * @param {string} path - Extracted path.
 * @returns {string} Cleaned path (remove leading/trailing slashes).
 */
export function cleanPath(path) {
    if (!path) return '';
    // Remove leading/trailing slashes and collapse multiple slashes
    let cleaned = path.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');
    return cleaned;
}