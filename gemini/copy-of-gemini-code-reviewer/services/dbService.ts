const DB_NAME = 'gemini-ide-db';
const DB_VERSION = 2; // Incremented version for new schema
const STORE_NAME = 'keyval';
let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = (event) => {
                const db = request.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
                // Handle potential future upgrades here
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };
        });
    }
    return dbPromise;
}

export async function dbGet<T>(key: IDBValidKey): Promise<T | undefined> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
    });
}

export async function dbSet(key: IDBValidKey, val: any): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(val, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}
