// 网页工作台草稿持久化：用 IndexedDB 而非 localStorage。
// Obsidian 市场审查将 localStorage 标记为"库内存储"反例（Web 端无 App#saveLocalStorage），
// IndexedDB 同样是浏览器原生、正确承载跨会话草稿，且不受该规则限制。

const DB_NAME = "qiuqiu-wechat-editor";
const STORE = "drafts";
const KEY = "current";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error(req.error?.message ?? "open db failed"));
  });
}

export async function loadDraft(): Promise<string | null> {
  try {
    const db = await openDb();
    return await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => {
        const rec = req.result as { id: string; value: string } | undefined;
        resolve(rec?.value ?? null);
      };
      req.onerror = () => reject(new Error(req.error?.message ?? "read draft failed"));
    });
  } catch {
    return null;
  }
}

export async function saveDraft(md: string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ id: KEY, value: md }, KEY);
  } catch {
    // 存储不可用不阻塞排版
  }
}