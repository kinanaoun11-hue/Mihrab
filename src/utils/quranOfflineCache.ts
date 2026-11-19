import type { MushafPageData, SurahSummary } from '../types/islamic';
import {
  buildMushafPagesFromFullQuran,
  clampQuranPage,
  TOTAL_QURAN_PAGES,
  type FullQuranApiSurah,
  type FullQuranBundle,
} from './quranLogic';

export type QuranOfflineStatus = 'idle' | 'caching' | 'ready' | 'unavailable';

const FULL_QURAN_API_URL = 'https://api.alquran.cloud/v1/quran/quran-uthmani';
const DB_NAME = 'mihrab_quran_offline_db';
const DB_VERSION = 1;
const STORE_PAGES = 'pages';
const STORE_META = 'meta';
const META_STATUS_KEY = 'full_quran_status';
const CACHE_SCHEMA_VERSION = 2;
const LS_FALLBACK_KEY = 'mihrab_quran_offline_fallback_v2';

interface OfflineMetaRecord {
  key: string;
  version: number;
  totalPages: number;
  cachedAt: string;
  surahs: SurahSummary[];
}

interface CompactFallbackAyah {
  n: number; // global number
  t: string; // text
  i: number; // numberInSurah
  j: number; // juz
  h: number; // hizbQuarter
  s: number; // surah number
}

interface CompactFallbackPayload {
  version: number;
  totalPages: number;
  cachedAt: string;
  surahs: SurahSummary[];
  pages: Record<number, CompactFallbackAyah[]>;
}

let currentStatus: QuranOfflineStatus = 'idle';
let inFlightPromise: Promise<QuranOfflineStatus> | null = null;
const listeners = new Set<(status: QuranOfflineStatus) => void>();

const memoryPages = new Map<number, MushafPageData>();
let memorySurahs: SurahSummary[] | null = null;

function setStatus(next: QuranOfflineStatus): void {
  if (currentStatus === next) return;
  currentStatus = next;
  listeners.forEach((cb) => cb(next));
}

export function getQuranOfflineStatus(): QuranOfflineStatus {
  return currentStatus;
}

export function subscribeQuranOfflineStatus(
  listener: (status: QuranOfflineStatus) => void
): () => void {
  listeners.add(listener);
  listener(currentStatus);
  return () => {
    listeners.delete(listener);
  };
}

function openQuranDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_PAGES)) {
        db.createObjectStore(STORE_PAGES, { keyPath: 'number' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open error'));
  });
}

async function readIdbMeta(db: IDBDatabase): Promise<OfflineMetaRecord | null> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_META, 'readonly');
      const store = tx.objectStore(STORE_META);
      const req = store.get(META_STATUS_KEY);
      req.onsuccess = () => resolve((req.result as OfflineMetaRecord | undefined) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function countIdbPages(db: IDBDatabase): Promise<number> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_PAGES, 'readonly');
      const store = tx.objectStore(STORE_PAGES);
      const req = store.count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(0);
    } catch {
      resolve(0);
    }
  });
}

async function readIdbPage(db: IDBDatabase, pageNumber: number): Promise<MushafPageData | null> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_PAGES, 'readonly');
      const store = tx.objectStore(STORE_PAGES);
      const req = store.get(pageNumber);
      req.onsuccess = () => resolve((req.result as MushafPageData | undefined) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function writeBundleToIdb(db: IDBDatabase, bundle: FullQuranBundle): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORE_PAGES, STORE_META], 'readwrite');
      const pageStore = tx.objectStore(STORE_PAGES);
      const metaStore = tx.objectStore(STORE_META);

      for (let p = 1; p <= TOTAL_QURAN_PAGES; p++) {
        const pageData = bundle.pages[p];
        if (pageData) {
          pageStore.put(pageData);
        }
      }

      const meta: OfflineMetaRecord = {
        key: META_STATUS_KEY,
        version: CACHE_SCHEMA_VERSION,
        totalPages: bundle.pageCount,
        cachedAt: new Date().toISOString(),
        surahs: bundle.surahs,
      };
      metaStore.put(meta);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

function writeBundleToLocalStorage(bundle: FullQuranBundle): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    const compactPages: Record<number, CompactFallbackAyah[]> = {};
    for (let p = 1; p <= TOTAL_QURAN_PAGES; p++) {
      const page = bundle.pages[p];
      if (page) {
        compactPages[p] = page.ayahs.map((a) => ({
          n: a.number,
          t: a.text,
          i: a.numberInSurah,
          j: a.juz,
          h: a.hizbQuarter,
          s: a.surah.number,
        }));
      }
    }
    const payload: CompactFallbackPayload = {
      version: CACHE_SCHEMA_VERSION,
      totalPages: bundle.pageCount,
      cachedAt: new Date().toISOString(),
      surahs: bundle.surahs,
      pages: compactPages,
    };
    localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

function readLocalStorageBundle(): FullQuranBundle | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(LS_FALLBACK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CompactFallbackPayload;
    if (
      !parsed ||
      parsed.version !== CACHE_SCHEMA_VERSION ||
      !Array.isArray(parsed.surahs) ||
      !parsed.pages
    )
      return null;

    const surahMap = new Map<number, SurahSummary>();
    for (const s of parsed.surahs) {
      surahMap.set(s.number, s);
    }

    const pages: Record<number, MushafPageData> = {};
    for (let p = 1; p <= TOTAL_QURAN_PAGES; p++) {
      const compactAyahs = parsed.pages[p];
      if (Array.isArray(compactAyahs) && compactAyahs.length > 0) {
        pages[p] = {
          number: p,
          ayahs: compactAyahs.map((ca) => ({
            number: ca.n,
            text: ca.t,
            numberInSurah: ca.i,
            juz: ca.j,
            page: p,
            hizbQuarter: ca.h,
            surah: surahMap.get(ca.s) ?? parsed.surahs[0],
          })),
        };
      }
    }
    const pageCount = Object.keys(pages).length;
    if (pageCount < TOTAL_QURAN_PAGES) return null;
    return {
      surahs: parsed.surahs,
      pages,
      pageCount,
    };
  } catch {
    return null;
  }
}

function hydrateMemoryBundle(bundle: FullQuranBundle): void {
  memorySurahs = bundle.surahs;
  for (let p = 1; p <= TOTAL_QURAN_PAGES; p++) {
    const page = bundle.pages[p];
    if (page) {
      memoryPages.set(p, page);
    }
  }
}

export async function getCachedMushafPage(pageNumber: number): Promise<MushafPageData | null> {
  const safePage = clampQuranPage(pageNumber);
  const mem = memoryPages.get(safePage);
  if (mem) return mem;

  try {
    const db = await openQuranDb();
    try {
      const idbPage = await readIdbPage(db, safePage);
      if (idbPage && Array.isArray(idbPage.ayahs) && idbPage.ayahs.length > 0) {
        memoryPages.set(safePage, idbPage);
        return idbPage;
      }
    } finally {
      db.close();
    }
  } catch {
    // Fallback to localStorage below
  }

  const lsBundle = readLocalStorageBundle();
  if (lsBundle) {
    hydrateMemoryBundle(lsBundle);
    return memoryPages.get(safePage) ?? null;
  }
  return null;
}

export async function getCachedSurahList(): Promise<SurahSummary[] | null> {
  if (memorySurahs && memorySurahs.length >= 114) return memorySurahs;

  try {
    const db = await openQuranDb();
    try {
      const meta = await readIdbMeta(db);
      if (meta?.surahs && meta.surahs.length >= 114) {
        memorySurahs = meta.surahs;
        return meta.surahs;
      }
    } finally {
      db.close();
    }
  } catch {
    // Fallback to localStorage below
  }

  const lsBundle = readLocalStorageBundle();
  if (lsBundle) {
    hydrateMemoryBundle(lsBundle);
    return lsBundle.surahs;
  }
  return null;
}

export async function ensureFullQuranCached(): Promise<QuranOfflineStatus> {
  if (currentStatus === 'ready') return 'ready';
  if (inFlightPromise) return inFlightPromise;

  inFlightPromise = (async (): Promise<QuranOfflineStatus> => {
    try {
      // 1. Check if IndexedDB already holds all 604 pages
      try {
        const db = await openQuranDb();
        try {
          const [meta, pageCount] = await Promise.all([
            readIdbMeta(db),
            countIdbPages(db),
          ]);
          if (
            meta &&
            meta.version === CACHE_SCHEMA_VERSION &&
            meta.totalPages >= TOTAL_QURAN_PAGES &&
            pageCount >= TOTAL_QURAN_PAGES
          ) {
            if (Array.isArray(meta.surahs) && meta.surahs.length >= 114) {
              memorySurahs = meta.surahs;
            }
            setStatus('ready');
            return 'ready';
          }
        } finally {
          db.close();
        }
      } catch {
        // Check localStorage fallback before fetching
      }

      // 2. Check localStorage fallback
      const existingLs = readLocalStorageBundle();
      if (existingLs && existingLs.pageCount >= TOTAL_QURAN_PAGES) {
        hydrateMemoryBundle(existingLs);
        setStatus('ready');
        return 'ready';
      }

      // 3. Silently fetch complete Uthmani Quran in the background
      setStatus('caching');
      const res = await fetch(FULL_QURAN_API_URL);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = (await res.json()) as {
        data?: { surahs?: FullQuranApiSurah[] };
      };
      const apiSurahs = json.data?.surahs;
      if (!Array.isArray(apiSurahs) || apiSurahs.length === 0) {
        throw new Error('Invalid full Quran payload');
      }

      const bundle = buildMushafPagesFromFullQuran(apiSurahs);
      if (bundle.pageCount < TOTAL_QURAN_PAGES) {
        throw new Error(`Incomplete Mushaf pages: ${bundle.pageCount}`);
      }

      hydrateMemoryBundle(bundle);

      // 4. Persist to IndexedDB (with localStorage fallback)
      let persisted = false;
      try {
        const db = await openQuranDb();
        try {
          persisted = await writeBundleToIdb(db, bundle);
        } finally {
          db.close();
        }
      } catch {
        persisted = false;
      }

      if (!persisted) {
        persisted = writeBundleToLocalStorage(bundle);
      }

      // Even if storage quota blocked persistence, in-memory cache holds all 604 pages for this session;
      // mark ready only when persisted to durable offline storage (or memory fallback succeeded).
      setStatus(persisted ? 'ready' : 'unavailable');
      return persisted ? 'ready' : 'unavailable';
    } catch {
      setStatus('unavailable');
      return 'unavailable';
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
}
