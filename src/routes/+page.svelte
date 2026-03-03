<!-- src/routes/+page.svelte -->
<script>
    import { onMount } from 'svelte';
    import { projectTree, fileMap, isProcessing, toastMessage } from '$lib/stores/appState.js';
    import { parseFolderStructure } from '$lib/utils/treeParser.js';
    import { readClipboard } from '$lib/utils/clipboardHandler.js';
    import { exportProjectAsZip } from '$lib/utils/zipExporter.js';
    import FileTree from '$lib/components/FileTree.svelte';
    import Toast from '$lib/components/Toast.svelte';

    let structureInput = ''; // for manual paste (optional)
    let showManualInput = false;

    async function handlePasteStructure() {
        try {
            isProcessing.set(true);
            const text = await readClipboard();
            if (!text || text.trim() === '') {
                throw new Error('Clipboard is empty');
            }
            const tree = parseFolderStructure(text);
            if (tree.length === 0) {
                throw new Error('No valid folder structure found');
            }
            projectTree.set(tree);
            // Reset fileMap? Or preserve? We'll reset to avoid stale data.
            fileMap.set({});
            toastMessage.set({ show: true, message: 'Folder structure pasted successfully!', type: 'success' });
        } catch (error) {
            toastMessage.set({ show: true, message: error.message || 'Failed to parse structure', type: 'error' });
        } finally {
            isProcessing.set(false);
        }
    }

    function handleManualPaste() {
        if (!structureInput.trim()) return;
        try {
            const tree = parseFolderStructure(structureInput);
            if (tree.length === 0) throw new Error('Invalid structure');
            projectTree.set(tree);
            fileMap.set({});
            toastMessage.set({ show: true, message: 'Structure parsed!', type: 'success' });
            showManualInput = false;
            structureInput = '';
        } catch (error) {
            toastMessage.set({ show: true, message: error.message, type: 'error' });
        }
    }

    function handleClear() {
        if (confirm('Clear entire workspace?')) {
            projectTree.set([]);
            fileMap.set({});
            toastMessage.set({ show: true, message: 'Workspace cleared', type: 'info' });
        }
    }

    async function handleDownload() {
        const result = await exportProjectAsZip();
        if (result.success) {
            toastMessage.set({ show: true, message: 'ZIP download started', type: 'success' });
        } else {
            toastMessage.set({ show: true, message: result.error || 'Download failed', type: 'error' });
        }
    }
</script>

<Toast />

<div class="flex flex-col h-screen max-w-2xl mx-auto bg-white dark:bg-gray-950">
    <!-- Header -->
    <header class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">AI Project Builder</h1>
        <button
            on:click={handleClear}
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Clear workspace"
        >
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>
    </header>

    <!-- Main content -->
    <div class="flex-1 overflow-hidden p-4">
        <!-- Action buttons -->
        <div class="flex flex-col gap-3 mb-4">
            <button
                on:click={handlePasteStructure}
                disabled={$isProcessing}
                class="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-xl transition-colors"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Paste Folder Structure</span>
            </button>

            <button
                on:click={() => showManualInput = !showManualInput}
                class="text-sm text-blue-600 dark:text-blue-400 underline"
            >
                {showManualInput ? 'Hide manual input' : 'Or paste manually'}
            </button>

            {#if showManualInput}
                <div class="flex flex-col gap-2">
                    <textarea
                        bind:value={structureInput}
                        rows="6"
                        placeholder="Paste your folder structure here..."
                        class="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm"
                    ></textarea>
                    <button
                        on:click={handleManualPaste}
                        disabled={$isProcessing}
                        class="self-end py-2 px-4 bg-gray-200 dark:bg-gray-800 rounded-lg text-sm"
                    >
                        Parse
                    </button>
                </div>
            {/if}
        </div>

        <!-- File tree -->
        <div class="h-[calc(100%-12rem)] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/50">
            <FileTree />
        </div>
    </div>

    <!-- Bottom bar with download button -->
    <div class="border-t border-gray-200 dark:border-gray-800 p-4">
        <button
            on:click={handleDownload}
            disabled={$projectTree.length === 0 || $isProcessing}
            class="flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium rounded-xl transition-colors"
        >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download Project ZIP</span>
        </button>
    </div>
</div>

<style>
    /* Ensure full height layout */
    :global(html, body) {
        height: 100%;
        margin: 0;
        padding: 0;
    }
</style>