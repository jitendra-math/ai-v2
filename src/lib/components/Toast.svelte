<!-- src/lib/components/Toast.svelte -->
<script>
    import { toastMessage } from '../stores/appState.js';
    import { fly } from 'svelte/transition';
    
    let timeout;

    $: if ($toastMessage.show) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            toastMessage.update(t => ({ ...t, show: false }));
        }, 3000);
    }
</script>

{#if $toastMessage.show}
    <div 
        transition:fly={{ y: -40, duration: 400 }}
        class="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg border max-w-[90vw] w-max
            { $toastMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300' : '' }
            { $toastMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300' : '' }
            { $toastMessage.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300' : '' }
            { $toastMessage.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300' : '' }"
    >
        {#if $toastMessage.type === 'success'}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
        {:else if $toastMessage.type === 'error'}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        {:else if $toastMessage.type === 'warning'}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        {/if}
        
        <span class="text-sm font-medium">{$toastMessage.message}</span>
    </div>
{/if}