/**
 * db.ts — Double-Tier Local Storage System: IndexedDB Engine (GOD MODE v3 Layer 2)
 *
 * Implements a pure-JS IndexedDB wrapper for high-volume local user data
 * (Notes, Paragraph Highlights, SRS schedules, and XP event logs) to avoid
 * localStorage quota issues and ensure fast offline execution.
 */

const DB_NAME = "KnowledgeOS_LocalData";
const DB_VERSION = 1;

export type UserNote = {
  id: string;
  topicId: string;
  text: string;
  timestamp: string;
};

export type UserHighlight = {
  id: string;
  topicId: string;
  text: string;
  partIdx: number;
};

export type SRSState = {
  topicId: string;
  cardId: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: string;
  lastReviewedAt?: string;
  reviewCount: number;
  lapseCount: number;
  qualityHistory: number[];
};

export type XPEvent = {
  eventId: string; // e.g. "read-topic:hashmap-internals"
  xpAwarded: number;
  timestamp: string;
};

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB is only available in the browser"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      // 1. Notes Store
      if (!db.objectStoreNames.contains("notes")) {
        const store = db.createObjectStore("notes", { keyPath: "id" });
        store.createIndex("topicId", "topicId", { unique: false });
      }

      // 2. Highlights Store
      if (!db.objectStoreNames.contains("highlights")) {
        const store = db.createObjectStore("highlights", { keyPath: "id" });
        store.createIndex("topicId", "topicId", { unique: false });
      }

      // 3. SRS Cards Store
      if (!db.objectStoreNames.contains("srs")) {
        // Compound key {topicId, cardId}
        db.createObjectStore("srs", { keyPath: ["topicId", "cardId"] });
      }

      // 4. XP Events Store
      if (!db.objectStoreNames.contains("xpEvents")) {
        db.createObjectStore("xpEvents", { keyPath: "eventId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ── NOTES UTILITIES ──────────────────────────────────────────────────────────
export async function getNotes(topicId: string): Promise<UserNote[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("notes", "readonly");
    const store = tx.objectStore("notes");
    const index = store.index("topicId");
    const request = index.getAll(topicId);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllNotes(): Promise<UserNote[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("notes", "readonly");
    const store = tx.objectStore("notes");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function saveNote(note: UserNote): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("notes", "readwrite");
    const store = tx.objectStore("notes");
    const request = store.put(note);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("notes", "readwrite");
    const store = tx.objectStore("notes");
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ── HIGHLIGHTS UTILITIES ──────────────────────────────────────────────────────
export async function getHighlights(topicId: string): Promise<UserHighlight[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("highlights", "readonly");
    const store = tx.objectStore("highlights");
    const index = store.index("topicId");
    const request = index.getAll(topicId);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllHighlights(): Promise<UserHighlight[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("highlights", "readonly");
    const store = tx.objectStore("highlights");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function saveHighlight(highlight: UserHighlight): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("highlights", "readwrite");
    const store = tx.objectStore("highlights");
    const request = store.put(highlight);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteHighlight(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("highlights", "readwrite");
    const store = tx.objectStore("highlights");
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ── SRS CARDS UTILITIES ────────────────────────────────────────────────────────
export async function getSRSCard(topicId: string, cardId: string): Promise<SRSState | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("srs", "readonly");
    const store = tx.objectStore("srs");
    const request = store.get([topicId, cardId]);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveSRSCard(state: SRSState): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("srs", "readwrite");
    const store = tx.objectStore("srs");
    const request = store.put(state);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllSRSCards(): Promise<SRSState[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("srs", "readonly");
    const store = tx.objectStore("srs");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// ── XP EVENTS UTILITIES (IDEMPOTENCY ENGINE) ──────────────────────────────────
export async function hasXPEvent(eventId: string): Promise<boolean> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("xpEvents", "readonly");
    const store = tx.objectStore("xpEvents");
    const request = store.get(eventId);

    request.onsuccess = () => resolve(!!request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function logXPEvent(eventId: string, xpAwarded: number): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("xpEvents", "readwrite");
    const store = tx.objectStore("xpEvents");
    const request = store.put({
      eventId,
      xpAwarded,
      timestamp: new Date().toISOString()
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllLocalData(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["notes", "highlights", "srs", "xpEvents"], "readwrite");
    tx.objectStore("notes").clear();
    tx.objectStore("highlights").clear();
    tx.objectStore("srs").clear();
    tx.objectStore("xpEvents").clear();

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
