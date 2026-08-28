import { ComicBook, ReadingSettings } from '../types';

const DB_NAME = 'ComicReaderDB';
const DB_VERSION = 1;
const STORE_BOOKS = 'books';
const STORE_ARCHIVES = 'archives';
const STORE_SETTINGS = 'settings';

export const DEFAULT_SETTINGS: ReadingSettings = {
  viewMode: 'single',
  fitMode: 'fit-height',
  readingDirection: 'ltr',
  doublePageOffset: true,
  theme: 'dark',
  brightness: 100,
  contrast: 100,
  sepia: 0,
  grayscale: false,
  invert: false,
  autoHideHud: true,
  pageTransition: 'fade',
  zoomLevel: 1,
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_BOOKS)) {
        db.createObjectStore(STORE_BOOKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_ARCHIVES)) {
        db.createObjectStore(STORE_ARCHIVES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllBooks(): Promise<ComicBook[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_BOOKS, 'readonly');
      const store = tx.objectStore(STORE_BOOKS);
      const req = store.getAll();
      req.onsuccess = () => {
        const books = (req.result as ComicBook[]) || [];
        // Sort by lastRead descending (most recently read first)
        books.sort((a, b) => (b.lastRead || b.addedAt) - (a.lastRead || a.addedAt));
        resolve(books);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get books from IndexedDB:', err);
    return [];
  }
}

export async function saveBook(book: ComicBook): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_BOOKS, 'readwrite');
      const store = tx.objectStore(STORE_BOOKS);
      const req = store.put(book);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save book:', err);
  }
}

export async function deleteBook(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_BOOKS, STORE_ARCHIVES], 'readwrite');
      tx.objectStore(STORE_BOOKS).delete(id);
      tx.objectStore(STORE_ARCHIVES).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to delete book:', err);
  }
}

export async function saveBookArchive(id: string, buffer: ArrayBuffer): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_ARCHIVES, 'readwrite');
      const store = tx.objectStore(STORE_ARCHIVES);
      const req = store.put({ id, data: buffer, savedAt: Date.now() });
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => {
        console.warn('Could not cache full archive in IndexedDB (likely quota limit):', e);
        resolve(false);
      };
    });
  } catch {
    return false;
  }
}

export async function getBookArchive(id: string): Promise<ArrayBuffer | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_ARCHIVES, 'readonly');
      const store = tx.objectStore(STORE_ARCHIVES);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          resolve(req.result.data as ArrayBuffer);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function loadSettings(): Promise<ReadingSettings> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SETTINGS, 'readonly');
      const store = tx.objectStore(STORE_SETTINGS);
      const req = store.get('reading_settings');
      req.onsuccess = () => {
        if (req.result && req.result.value) {
          resolve({ ...DEFAULT_SETTINGS, ...req.result.value });
        } else {
          resolve(DEFAULT_SETTINGS);
        }
      };
      req.onerror = () => resolve(DEFAULT_SETTINGS);
    });
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: ReadingSettings): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SETTINGS, 'readwrite');
      const store = tx.objectStore(STORE_SETTINGS);
      const req = store.put({ key: 'reading_settings', value: settings });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}
