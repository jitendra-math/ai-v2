// src/lib/utils/indexedDB.js

const DB_NAME = 'AIProjectBuilderDB';
const DB_VERSION = 1;
const PROJECT_TREE_STORE = 'projectTree';
const FILE_MAP_STORE = 'fileMap';

let dbInstance = null;

/**
 * Opens (or creates) the IndexedDB database and returns a singleton connection.
 * @returns {Promise<IDBDatabase>}
 */
export async function openDB() {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      reject(new Error('Failed to open database.'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(PROJECT_TREE_STORE)) {
        db.createObjectStore(PROJECT_TREE_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(FILE_MAP_STORE)) {
        db.createObjectStore(FILE_MAP_STORE, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Saves the project tree to IndexedDB.
 * @param {Array} tree - The folder/file tree array.
 * @returns {Promise<void>}
 */
export async function saveProjectTree(tree) {
  try {
    const db = await openDB();
    const tx = db.transaction(PROJECT_TREE_STORE, 'readwrite');
    const store = tx.objectStore(PROJECT_TREE_STORE);
    store.put({ id: 'root', data: tree });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('saveProjectTree failed:', error);
    throw new Error('Could not save project tree.');
  }
}

/**
 * Loads the project tree from IndexedDB.
 * @returns {Promise<Array>} The tree array, or empty array if none exists.
 */
export async function loadProjectTree() {
  try {
    const db = await openDB();
    const tx = db.transaction(PROJECT_TREE_STORE, 'readonly');
    const store = tx.objectStore(PROJECT_TREE_STORE);
    const request = store.get('root');
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        resolve(result && result.data ? result.data : []);
      };
      request.onerror = () => reject(request.error);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('loadProjectTree failed:', error);
    return [];
  }
}

/**
 * Saves the file map to IndexedDB.
 * @param {Object} map - File path → metadata mapping.
 * @returns {Promise<void>}
 */
export async function saveFileMap(map) {
  try {
    const db = await openDB();
    const tx = db.transaction(FILE_MAP_STORE, 'readwrite');
    const store = tx.objectStore(FILE_MAP_STORE);
    store.put({ id: 'root', data: map });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('saveFileMap failed:', error);
    throw new Error('Could not save file map.');
  }
}

/**
 * Loads the file map from IndexedDB.
 * @returns {Promise<Object>} The file map object, or empty object if none exists.
 */
export async function loadFileMap() {
  try {
    const db = await openDB();
    const tx = db.transaction(FILE_MAP_STORE, 'readonly');
    const store = tx.objectStore(FILE_MAP_STORE);
    const request = store.get('root');
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        resolve(result && result.data ? result.data : {});
      };
      request.onerror = () => reject(request.error);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('loadFileMap failed:', error);
    return {};
  }
}

/**
 * Clears both project tree and file map from IndexedDB.
 * @returns {Promise<void>}
 */
export async function clearAllData() {
  try {
    const db = await openDB();
    const tx = db.transaction([PROJECT_TREE_STORE, FILE_MAP_STORE], 'readwrite');
    const treeStore = tx.objectStore(PROJECT_TREE_STORE);
    const mapStore = tx.objectStore(FILE_MAP_STORE);
    treeStore.delete('root');
    mapStore.delete('root');
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('clearAllData failed:', error);
    throw new Error('Could not clear stored data.');
  }
}