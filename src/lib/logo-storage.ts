// src/lib/logo-storage.ts
// Small IndexedDB helper for storing logo Blobs locally.
// No external dependencies.

const DB_NAME = 'projectflow-logos-db';
const STORE_NAME = 'logos';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveLogo(file: File): Promise<string> {
  const id = `logo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const putReq = store.put(file, id);
    putReq.onsuccess = () => {
      resolve(id);
      db.close();
    };
    putReq.onerror = () => {
      reject(putReq.error);
      db.close();
    };
  });
}

export async function getLogoBlob(id: string): Promise<Blob | null> {
  if (!id) return null;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => {
      resolve(req.result ?? null);
      db.close();
    };
    req.onerror = () => {
      reject(req.error);
      db.close();
    };
  });
}

// Returns a blob URL (created via URL.createObjectURL) or null if missing.
export async function getLogoUrl(id: string): Promise<string | null> {
  try {
    const blob = await getLogoBlob(id);
    if (!blob) return null;
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('getLogoUrl error', err);
    return null;
  }
}

export async function deleteLogo(id: string): Promise<void> {
  if (!id) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => {
      resolve();
      db.close();
    };
    req.onerror = () => {
      reject(req.error);
      db.close();
    };
  });
}
