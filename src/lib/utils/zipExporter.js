// src/lib/utils/zipExporter.js
import JSZip from 'jszip';
import { get } from 'svelte/store';
import { isProcessing } from '../stores/appState.js';
import { getPastedFiles } from './fileManager.js';

/**
 * Generates a ZIP file containing all pasted files and triggers download.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function exportProjectAsZip() {
    isProcessing.set(true);

    const files = getPastedFiles();
    if (files.length === 0) {
        isProcessing.set(false);
        return { success: false, error: 'No pasted files to export.' };
    }

    const zip = new JSZip();

    // Add each file to the zip preserving folder structure
    files.forEach(({ path, content }) => {
        zip.file(path, content);
    });

    try {
        const blob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });

        // Trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'project.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        isProcessing.set(false);
        return { success: true };
    } catch (error) {
        console.error('ZIP generation failed:', error);
        isProcessing.set(false);
        return { success: false, error: 'Failed to create ZIP file.' };
    }
}