<!-- src/lib/components/DeleteButton.svelte -->
<script>
    import { createEventDispatcher } from 'svelte';
    import { isProcessing, toastMessage } from '../stores/appState.js';
    import { deleteFileContent } from '../utils/fileManager.js';

    export let filePath;
    export let disabled = false;

    const dispatch = createEventDispatcher();
    let showConfirm = false;

    function handleDeleteClick() {
        showConfirm = true;
    }

    function cancelDelete() {
        showConfirm = false;
    }

    async function confirmDelete() {
        if (disabled || $isProcessing) return;

        dispatch('deleteStart');
        showConfirm = false;

        try {
            deleteFileContent(filePath);
            
            toastMessage.set({
                show: true,
                message: `🗑️ Deleted: ${filePath}`,
                type: 'info'
            });

            dispatch('deleteSuccess', { path: filePath });
        } catch (error) {
            console.error('Delete error:', error);
            toastMessage.set({
                show: true,
                message: error.message || 'Delete failed',
                type: 'error'
            });
            dispatch('deleteError', { error: error.message });
        }
    }
</script>

{#if showConfirm}
    <div class="flex items-center gap-1">
        <span class="text-xs text-gray-600 dark:text-gray-300 mr-1">Sure?</span>
        <button
            on:click={confirmDelete}
            disabled={disabled || $isProcessing}
            class="px-2 py-1 text-xs font-medium rounded bg-red-500 hover:bg-red-600 text-white transition-colors"
        >
            Yes
        </button>
        <button
            on:click={cancelDelete}
            disabled={disabled || $isProcessing}
            class="px-2 py-1 text-xs font-medium rounded bg-gray-300 hover:bg-gray-400 text-gray-800 transition-colors"
        >
            No
        </button>
    </div>
{:else}
    <button
        on:click={handleDeleteClick}
        disabled={disabled || $isProcessing}
        class="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete file content"
    >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    </button>
{/if}