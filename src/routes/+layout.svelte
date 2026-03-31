<!-- src/routes/+layout.svelte -->
<script>
  import { projectTree, fileMap } from '$lib/stores/appState.js';
  import Toast from '$lib/components/Toast.svelte';
  import { derived } from 'svelte/store';

  const isLoading = derived(
    [projectTree.loading, fileMap.loading],
    ([$treeLoading, $mapLoading]) => $treeLoading || $mapLoading
  );
</script>

{#if $isLoading}
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="flex flex-col items-center gap-3">
      <div class="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      <p class="text-sm text-gray-500 font-medium">Loading workspace...</p>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-gray-50 text-gray-900 antialiased">
    <Toast />
    <slot />
  </div>
{/if}

<style>
  :global(html, body) {
    height: 100%;
    margin: 0;
    padding: 0;
  }
</style>