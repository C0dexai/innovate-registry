import { Track } from './types';

const DB_NAME = 'radio-player-db';
const DB_VERSION = 1;
const TRACKS_STORE_NAME = 'tracks';
const KEYVAL_STORE_NAME = 'keyval';
const FAVORITES_KEY = 'favorites';

let db: IDBDatabase;

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(TRACKS_STORE_NAME)) {
        db.createObjectStore(TRACKS_STORE_NAME, { keyPath: 'id' });
      }
       if (!db.objectStoreNames.contains(KEYVAL_STORE_NAME)) {
        db.createObjectStore(KEYVAL_STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
  });
};

export const addTrack = (track: Track): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const transaction = db.transaction(TRACKS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(TRACKS_STORE_NAME);
    // The url property is a temporary object URL and cannot be stored in IndexedDB.
    // It will be recreated from the file blob when tracks are loaded.
    const { url, ...trackToStore } = track;
    const request = store.put(trackToStore);

    request.onsuccess = () => resolve();
    request.onerror = () => {
        console.error('Error adding track:', request.error);
        reject('Error adding track');
    };
  });
};

export const getTracks = (): Promise<Track[]> => {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const transaction = db.transaction(TRACKS_STORE_NAME, 'readonly');
    const store = transaction.objectStore(TRACKS_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      // Recreate object URLs for playback
      const tracksWithUrls = request.result.map(track => {
        if (track.file instanceof File || track.file instanceof Blob) {
            return {...track, url: URL.createObjectURL(track.file)};
        }
        return track;
      });
      resolve(tracksWithUrls);
    };
    request.onerror = () => {
        console.error('Error getting tracks:', request.error);
        reject('Error getting tracks');
    };
  });
};

export const saveFavorites = (favorites: (string | number)[]): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction(KEYVAL_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(KEYVAL_STORE_NAME);
        const request = store.put(favorites, FAVORITES_KEY);

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error saving favorites:', request.error);
            reject('Error saving favorites');
        };
    });
};

export const getFavorites = (): Promise<(string | number)[]> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction(KEYVAL_STORE_NAME, 'readonly');
        const store = transaction.objectStore(KEYVAL_STORE_NAME);
        const request = store.get(FAVORITES_KEY);

        request.onsuccess = () => {
            resolve(request.result || []);
        };
        request.onerror = () => {
            console.error('Error getting favorites:', request.error);
            reject('Error getting favorites');
        };
    });
};
