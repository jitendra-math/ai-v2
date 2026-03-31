// src/lib/stores/persistentStore.js
import { writable, derived } from 'svelte/store';

/**
 * Creates a persistent Svelte store with IndexedDB synchronization.
 * - Loads initial value asynchronously from the provided load function.
 * - Debounces (300ms) all writes to the save function.
 * - Exposes a `loading` derived store indicating whether initial load is in progress.
 *
 * @template T
 * @param {Object} options
 * @param {() => Promise<T>} options.load - Function to load initial value from IndexedDB.
 * @param {(value: T) => Promise<void>} options.save - Function to save value to IndexedDB.
 * @param {T} options.initialValue - Fallback value if load fails or no data exists.
 * @returns {{
 *   subscribe: (run: (value: T) => void, invalidate?: () => void) => () => void,
 *   set: (value: T) => void,
 *   update: (updater: (value: T) => T) => void,
 *   loading: import('svelte/store').Readable<boolean>
 * }}
 */
export function createPersistentStore({ load, save, initialValue }) {
  let currentValue = initialValue;
  let saveTimer = null;
  let isLoading = true;

  const { subscribe, set, update } = writable(initialValue);

  // Derived store for loading state
  const loading = derived({ subscribe: (run) => subscribe(() => {}) }, () => isLoading, false);

  // Debounced save function
  function debouncedSave(value) {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      save(value).catch(err => {
        console.error('Failed to save to IndexedDB:', err);
      });
      saveTimer = null;
    }, 300);
  }

  // Override set to trigger debounced save
  const originalSet = set;
  const enhancedSet = (value) => {
    currentValue = value;
    originalSet(value);
    debouncedSave(value);
  };

  // Override update to work with enhanced set
  const enhancedUpdate = (updater) => {
    const newValue = updater(currentValue);
    enhancedSet(newValue);
  };

  // Initial async load
  load()
    .then(loadedValue => {
      const value = loadedValue !== undefined && loadedValue !== null ? loadedValue : initialValue;
      currentValue = value;
      originalSet(value);
      isLoading = false;
      // Trigger loading derived update
      loading.subscribe(() => {})();
    })
    .catch(err => {
      console.error('Failed to load from IndexedDB, using initial value:', err);
      isLoading = false;
      loading.subscribe(() => {})();
    });

  return {
    subscribe,
    set: enhancedSet,
    update: enhancedUpdate,
    loading
  };
}