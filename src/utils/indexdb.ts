import { EpisodeFile } from '../types';

const dbName = 'podcast';
const dbVersion = 2;
const storeName = 'downloads';
const storeKeyPath = 'id';

let db: IDBDatabase;
let isReady: boolean;

export const getStore = (): Promise<{
  set: (file: EpisodeFile) => Promise<EpisodeFile>;
  get: (id: string) => Promise<EpisodeFile>;
  remove: (id: string) => Promise<void>;
  getKeys: () => Promise<string[]>;
}> => {
  return new Promise((resolve, reject) => {
    const get = (id: string): Promise<EpisodeFile> => {
      return new Promise((resolve, reject) => {
        const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
        const getRequest = store.get(id);
        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () => reject(getRequest.error);
      });
    };

    const set = (file: EpisodeFile): Promise<EpisodeFile> => {
      return new Promise((resolve, reject) => {
        const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
        const addRequest = store.add(file);
        addRequest.onsuccess = () => resolve(file);
        addRequest.onerror = () => reject(addRequest.error);
      });
    };

    const remove = (id: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
        const removeRequest = store.delete(id);
        removeRequest.onsuccess = () => resolve(removeRequest.result);
        removeRequest.onerror = () => reject(removeRequest.error);
      });
    };

    const getKeys = (): Promise<string[]> => {
      return new Promise((resolve, reject) => {
        const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
        const getRequest = store.getAllKeys();
        getRequest.onsuccess = () => resolve(getRequest.result.map(key => key.toString()));
        getRequest.onerror = () => reject(getRequest.error);
      });
    };

    const iface = { set, get, remove, getKeys };

    if (isReady) return void resolve(iface);

    const openRequest = indexedDB.open(dbName, dbVersion);

    openRequest.onupgradeneeded = function (event) {
      //const objectStore = (event?.target as any)?.result.createObjectStore(storeName, { keyPath: storeKeyPath });
      //objectStore.createIndex(store.keyPath, store.keyPath, { unique: true });
      //db.createObjectStore(storeName, { keyPath: storeKeyPath });
      db = openRequest.result;
      //console.log('onupgradeneeded', openRequest.result);
      console.log(db.objectStoreNames);
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: storeKeyPath });
      }
    };

    openRequest.onerror = () => reject(openRequest.error);
    openRequest.onsuccess = () => {
      //console.log('onsuccess', openRequest.result);
      db = openRequest.result;
      //db.createObjectStore(storeName, { keyPath: storeKeyPath });
      isReady = true;
      resolve(iface);
    };
  });
};
