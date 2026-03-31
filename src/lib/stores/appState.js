// src/lib/stores/appState.js
import { writable } from 'svelte/store';
import { createPersistentStore } from './persistentStore.js';
import { loadProjectTree, saveProjectTree, loadFileMap, saveFileMap } from '$utils/indexedDB.js';

// Persistent store for project tree (folder/file structure)
export const projectTree = createPersistentStore({
  load: loadProjectTree,
  save: saveProjectTree,
  initialValue: []
});

// Persistent store for file content map
export const fileMap = createPersistentStore({
  load: loadFileMap,
  save: saveFileMap,
  initialValue: {}
});

// Non-persisted UI state: async operation flag
export const isProcessing = writable(false);

// Non-persisted UI state: toast notifications
export const toastMessage = writable({ show: false, message: '', type: 'success' });