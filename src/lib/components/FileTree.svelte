<!-- src/lib/components/FileTree.svelte -->
<script>
    import { projectTree } from '../stores/appState.js';
    import FolderNode from './FolderNode.svelte';
    import FileNode from './FileNode.svelte';
    import { fade } from 'svelte/transition';

    // No props needed, reads directly from store
</script>

<div class="w-full h-full overflow-y-auto overflow-x-hidden rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 shadow-inner p-3 sm:p-4 pb-24 custom-scrollbar transition-all duration-300">
    
    {#if $projectTree.length === 0}
        <div class="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-80" in:fade={{ duration: 400 }}>
            <div class="relative w-20 h-20 flex items-center justify-center">
                <div class="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
                <div class="relative bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl shadow-sm border border-gray-200/60 dark:border-gray-700/60">
                    <svg class="w-8 h-8 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
            </div>
            
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">No folder structure</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 max-w-[220px] leading-relaxed">
                Paste a folder structure above to start building your project.
            </p>
        </div>
    {:else}
        <div class="flex flex-col space-y-0.5" in:fade={{ duration: 300 }}>
            {#each $projectTree as node}
                {#if node.type === 'folder'}
                    <FolderNode {node} />
                {:else}
                    <FileNode {node} />
                {/if}
            {/each}
        </div>
    {/if}
</div>

<style>
    /* Custom scrollbar for that premium feel */
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
        height: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(156, 163, 175, 0.3);
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(156, 163, 175, 0.5);
    }
    .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
    }
</style>