
import type { Iteration, VirtualFile } from '../types';

const DB_NAME = 'PromptWhispererDB';
const DB_VERSION = 1;
const ITERATIONS_STORE = 'iterations';
const FILES_STORE = 'files';

let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(true);
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening IndexedDB');
      reject(false);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(ITERATIONS_STORE)) {
        const iterationStore = dbInstance.createObjectStore(ITERATIONS_STORE, { keyPath: 'id' });
        iterationStore.createIndex('bookmarked', 'bookmarked', { unique: false });
      }
      if (!dbInstance.objectStoreNames.contains(FILES_STORE)) {
        dbInstance.createObjectStore(FILES_STORE, { keyPath: 'name' });
      }
    };
  });
};

// Iteration-related functions
export const addIteration = (iteration: Iteration): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ITERATIONS_STORE], 'readwrite');
    const store = transaction.objectStore(ITERATIONS_STORE);
    const request = store.put(iteration);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const updateIteration = (iteration: Iteration): Promise<void> => addIteration(iteration);

export const getAllIterations = (): Promise<Iteration[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ITERATIONS_STORE], 'readonly');
    const store = transaction.objectStore(ITERATIONS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};


// File-related functions
export const saveFile = (file: VirtualFile): Promise<void> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([FILES_STORE], 'readwrite');
        const store = transaction.objectStore(FILES_STORE);
        const request = store.put(file);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const getFile = (name: string): Promise<VirtualFile | undefined> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([FILES_STORE], 'readonly');
        const store = transaction.objectStore(FILES_STORE);
        const request = store.get(name);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const getAllFiles = (): Promise<VirtualFile[]> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([FILES_STORE], 'readonly');
        const store = transaction.objectStore(FILES_STORE);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const deleteFile = (name: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([FILES_STORE], 'readwrite');
        const store = transaction.objectStore(FILES_STORE);
        const request = store.delete(name);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};
