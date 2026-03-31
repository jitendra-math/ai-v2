<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { projectTree, fileMap, isProcessing, toastMessage } from '$stores/appState.js';
  import { parseFolderStructure } from '$utils/treeParser.js';
  import { readClipboard } from '$utils/clipboardHandler.js';
  import { exportProjectAsZip } from '$utils/zipExporter.js';
  import { clearAllData } from '$utils/indexedDB.js';
  import FileTree from '$components/FileTree.svelte';

  let structureInput = '';
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

  async function handleClear() {
    if (confirm('Clear entire workspace? This action cannot be undone.')) {
      try {
        isProcessing.set(true);
        projectTree.set([]);
        fileMap.set({});
        await clearAllData();
        toastMessage.set({ show: true, message: 'Workspace cleared', type: 'info' });
      } catch (error) {
        toastMessage.set({ show: true, message: 'Failed to clear data', type: 'error' });
      } finally {
        isProcessing.set(false);
      }
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

<div class="flex flex-col h-screen max-w-2xl mx-auto bg-white">
  <!-- Header -->
  <header class="flex items-center justify-between px-4 py-3 border-b border-gray-100/80 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
    <h1 class="text-2xl font-bold text-gray-900 tracking-tight">AI Project Builder</h1>
    <button
      on:click={handleClear}
      disabled={$isProcessing}
      class="p-2 rounded-full hover:bg-gray-100/50 transition-colors duration-200 disabled:opacity-50"
      title="Clear workspace"
      aria-label="Clear workspace"
    >
      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </header>

  <!-- Main content -->
  <div class="flex-1 overflow-hidden p-4 sm:p-6">
    <div class="flex flex-col gap-4 mb-5">
      <button
        on:click={handlePasteStructure}
        disabled={$isProcessing}
        class="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl shadow-sm shadow-gray-200/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span>Paste Folder Structure</span>
      </button>

      <button
        on:click={() => showManualInput = !showManualInput}
        class="text-sm text-blue-600 underline self-start"
      >
        {showManualInput ? 'Hide manual input' : 'Or paste manually'}
      </button>

      {#if showManualInput}
        <div class="flex flex-col gap-2">
          <textarea
            bind:value={structureInput}
            rows="6"
            placeholder="Paste your folder structure here...&#10;Example:&#10;src/&#10;  components/&#10;    Button.js&#10;  utils/&#10;    helpers.js"
            class="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
          ></textarea>
          <button
            on:click={handleManualPaste}
            disabled={$isProcessing}
            class="self-end py-2 px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Parse
          </button>
        </div>
      {/if}
    </div>

    <!-- File tree -->
    <div class="h-[calc(100%-12rem)] border border-gray-100 rounded-xl overflow-hidden bg-gray-50/80 shadow-sm">
      <FileTree />
    </div>
  </div>

  <!-- Bottom bar -->
  <div class="border-t border-gray-100 bg-white/80 backdrop-blur-sm p-4 sticky bottom-0">
    <button
      on:click={handleDownload}
      disabled={$projectTree.length === 0 || $isProcessing}
      class="flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-medium rounded-xl shadow-sm shadow-gray-200/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span>Download Project ZIP</span>
    </button>
  </div>
</div>

<style>
  :global(html, body) {
    height: 100%;
    margin: 0;
    padding: 0;
  }
</style>