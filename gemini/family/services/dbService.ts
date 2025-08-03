import { ChatMessage } from '../types';

const DB_NAME = 'CassaVegasDB';
const DB_VERSION = 1;
const STORE_NAME = 'chatHistory';

interface ChatHistory {
    agentName: string;
    messages: ChatMessage[];
}

let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(true);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('Database error:', request.error);
            reject(false);
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(true);
        };

        request.onupgradeneeded = (event) => {
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
                dbInstance.createObjectStore(STORE_NAME, { keyPath: 'agentName' });
            }
        };
    });
};

export const saveMessages = (agentName: string, messages: ChatMessage[]): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        if (!db) {
            try {
                await initDB();
            } catch (error) {
                return reject(error);
            }
        }
        
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const data: ChatHistory = { agentName, messages };

        const request = store.put(data);

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error saving messages:', request.error);
            reject(request.error);
        };
    });
};

export const loadMessages = (agentName: string): Promise<ChatMessage[]> => {
     return new Promise(async (resolve, reject) => {
        if (!db) {
            try {
                await initDB();
            } catch (error) {
                return reject(error);
            }
        }

        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(agentName);

        request.onsuccess = () => {
            const result: ChatHistory | undefined = request.result;
            resolve(result ? result.messages : []);
        };

        request.onerror = () => {
            console.error('Error loading messages:', request.error);
            reject(request.error);
        };
    });
};
