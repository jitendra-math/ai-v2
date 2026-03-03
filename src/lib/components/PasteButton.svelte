<!-- src/lib/components/PasteButton.svelte -->
<script>
    import { createEventDispatcher } from 'svelte';
    import { isProcessing, toastMessage } from '../stores/appState.js';
    import { readClipboard, extractFilePathFromComment, cleanPath } from '../utils/clipboardHandler.js';
    import { pasteFileContent, getReadableSize } from '../utils/fileManager.js';

    export let filePath; // The path of the file this button belongs to
    export let disabled = false;

    const dispatch = createEventDispatcher();
    let isLoading = false;

    async function handlePaste() {
        if (isLoading || $isProcessing) return;

        isLoading = true;
        dispatch('pasteStart');

        try {
            // Read clipboard content
            const clipboardText = await readClipboard();
            
            // Extract path from first line comment
            const extractedPath = extractFilePathFromComment(clipboardText);
            
            if (!extractedPath) {
                throw new Error('First line mein valid file path comment nahi mila');
            }

            const cleanedPath = cleanPath(extractedPath);
            
            // Verify that the extracted path matches this button's file path
            // This is a safety check to prevent pasting to wrong file
            if (cleanedPath !== filePath) {
                // Try to see if it's just a prefix difference (e.g., src/lib/Button vs lib/Button)
                const filePathParts = filePath.split('/');
                const cleanedParts = cleanedPath.split('/');
                const lastPartMatch = filePathParts[filePathParts.length - 1] === cleanedParts[cleanedParts.length - 1];
                
                if (!lastPartMatch) {
                    throw new Error(`Path mismatch: Clipboard file "${cleanedPath}" doesn't match this file "${filePath}"`);
                }
            }

            // Calculate size and paste
            const size = getReadableSize(clipboardText);
            pasteFileContent(filePath, clipboardText);
            
            toastMessage.set({
                show: true,
                message: `✅ Pasted: ${filePath} (${size})`,
                type: 'success'
            });

            dispatch('pasteSuccess', { path: filePath, size });
            
        } catch (error) {
            console.error('Paste error:', error);
            toastMessage.set({
                show: true,
                message: error.message || 'Paste failed',
                type: 'error'
            });
            dispatch('pasteError', { error: error.message });
        } finally {
            isLoading = false;
        }
    }
</script>

<button
    on:click={handlePaste}
    disabled={disabled || isLoading || $isProcessing}
    class="px-3 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
    class:opacity-75={isLoading}
>
    {#if isLoading}
        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Pasting...</span>
    {:else}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span>Paste</span>
    {/if}
</button>

<style>
    button {
        -webkit-tap-highlight-color: transparent;
    }
</style>
