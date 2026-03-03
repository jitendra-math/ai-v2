<!-- src/lib/components/FolderNode.svelte -->
<script>
    import { slide } from 'svelte/transition';
    import FileNode from './FileNode.svelte';
    import { fileMap } from '../stores/appState.js';

    export let node; // { name, path, children }

    let isOpen = true;

    function toggleFolder() {
        isOpen = !isOpen;
    }

    // Count pasted files in this folder (for potential UI indicator)
    $: pastedCount = (node.children || []).filter(child => {
        if (child.type === 'file') {
            return $fileMap[child.path]?.status === 'pasted';
        }
        return false;
    }).length;
</script>

<div class="flex flex-col select-none">
    <div 
        class="flex items-center gap-2 py-2 px-2 rounded-lg active:bg-gray-200/50 dark:active:bg-gray-800/50 hover:bg-gray-100/30 dark:hover:bg-gray-800/30 transition-colors duration-200 cursor-pointer group"
        on:click={toggleFolder}
    >
        <!-- Expand/collapse icon -->
        <svg 
            class="w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 {isOpen ? 'rotate-90' : ''}" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
        >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>

        <!-- Folder icon -->
        <svg 
            class="w-5 h-5 text-blue-500 dark:text-blue-400 transition-transform duration-200 {isOpen ? 'scale-105' : ''}" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
        >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>

        <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
            {node.name}
        </span>

        {#if pastedCount > 0}
            <span class="ml-auto text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                {pastedCount}
            </span>
        {/if}
    </div>

    {#if isOpen && node.children && node.children.length > 0}
        <div 
            class="flex flex-col ml-[22px] border-l border-gray-200/80 dark:border-gray-800/80 pl-1 mt-1"
            transition:slide={{ duration: 200 }}
        >
            {#each node.children as child}
                {#if child.type === 'folder'}
                    <svelte:self node={child} />
                {:else}
                    <FileNode node={child} />
                {/if}
            {/each}
        </div>
    {/if}
</div>

<style>
    div {
        -webkit-tap-highlight-color: transparent;
    }
</style>