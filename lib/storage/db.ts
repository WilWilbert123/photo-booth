import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'PhotoBoothDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB(): Promise<IDBPDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB unavailable on server'));
  }

  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (oldVersion < 1) {
          // Photos store
          const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
          photoStore.createIndex('createdAt', 'createdAt');
          photoStore.createIndex('type', 'type');

          // Videos store
          const videoStore = db.createObjectStore('videos', { keyPath: 'id' });
          videoStore.createIndex('createdAt', 'createdAt');
          videoStore.createIndex('type', 'type');

          // Settings store
          db.createObjectStore('settings');

          // Presets store
          db.createObjectStore('presets', { keyPath: 'id' });
        }
      },
    });
  }

  return dbPromise;
}
