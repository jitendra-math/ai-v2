<!-- src/lib/components/FileNode.svelte -->
<script>
    import { fileMap } from '../stores/appState.js';
    import PasteButton from './PasteButton.svelte';
    import DeleteButton from './DeleteButton.svelte';
    import { slide } from 'svelte/transition';

    export let node; // { name, path, type }

    // Reactive: get file data from store
    $: fileData = $fileMap[node.path];
    $: isPasted = fileData?.status === 'pasted';
    $: isDeleted = fileData?.status === 'deleted';
    $: status = fileData?.status || 'pending';
</script>

<div class="flex items-center justify-between py-2 px-2 ml-6 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg group transition-colors duration-200">
    <div class="flex items-center gap-2 overflow-hidden">
        <!-- File icon -->
        <svg class="w-4 h-4 shrink-0 {isPasted ? 'text-blue-500' : 'text-gray-400 dark:text-gray-600'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span class="text-sm truncate {isPasted ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}">
            {node.name}
        </span>
    </div>

    <div class="flex items-center gap-1 shrink-0">
        {#if isPasted}
            <!-- Show file size and delete button -->
            <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                {fileData.size}
            </span>
            <DeleteButton filePath={node.path} on:deleteSuccess={() => {}} />
        {:else if isDeleted}
            <!-- Show nothing? Or maybe a ghost button? We'll just show PasteButton again -->
            <PasteButton filePath={node.path} />
        {:else}
            <!-- Pending: show Paste button -->
            <PasteButton filePath={node.path} />
        {/if}
    </div>
</div>