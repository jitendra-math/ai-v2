// src/lib/utils/fileManager.js
import { get } from 'svelte/store';
import { fileMap } from '../stores/appState.js';

/**
 * Calculate human-readable file size from content string.
 * @param {string} content - File content.
 * @returns {string} e.g., "1.2 KB", "45 Bytes"
 */
export function getReadableSize(content) {
    const bytes = new Blob([content]).size;
    if (bytes < 1024) return `${bytes} Bytes`;
    return `${(bytes / 1024).toFixed(2)} KB`;
}

/**
 * Paste content into a file at the given path.
 * Updates the store with content, size, and sets status to 'pasted'.
 * @param {string} path - The file path.
 * @param {string} content - The full file content (including the first line comment).
 * @returns {void}
 */
export function pasteFileContent(path, content) {
    if (!content) return;
    const size = getReadableSize(content);
    fileMap.update(current => ({
        ...current,
        [path]: {
            content,
            size,
            status: 'pasted'
        }
    }));
}

/**
 * Delete (clear) the content of a file.
 * Sets status to 'deleted' and removes content.
 * @param {string} path - The file path.
 * @returns {void}
 */
export function deleteFileContent(path) {
    fileMap.update(current => ({
        ...current,
        [path]: {
            content: null,
            size: null,
            status: 'deleted'
        }
    }));
}

/**
 * Check if a file has pasted content (status === 'pasted').
 * @param {string} path - The file path.
 * @returns {boolean}
 */
export function isFilePasted(path) {
    const map = get(fileMap);
    const entry = map[path];
    return entry && entry.status === 'pasted';
}

/**
 * Get all files that have pasted content (status === 'pasted') and are not empty.
 * Used for ZIP export.
 * @returns {Array<{path: string, content: string}>}
 */
export function getPastedFiles() {
    const map = get(fileMap);
    return Object.entries(map)
        .filter(([_, data]) => data.status === 'pasted' && data.content && data.content.trim() !== '')
        .map(([path, data]) => ({ path, content: data.content }));
}