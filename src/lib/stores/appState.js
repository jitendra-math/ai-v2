// src/lib/stores/appState.js
import { writable } from 'svelte/store';

// Project tree structure (from pasted folder structure)
export const projectTree = writable([]);

// File data store
// Key: file path (string)
// Value: { content: string, size: string, status: 'pending' | 'pasted' | 'deleted' }
export const fileMap = writable({});

// UI states
export const isProcessing = writable(false);
export const toastMessage = writable({ show: false, message: '', type: 'success' });