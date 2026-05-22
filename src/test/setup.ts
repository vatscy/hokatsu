import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { afterEach } from 'vitest';
import { db } from '../db/database';

// jsdom@29 + Node 26 環境では window.localStorage / globalThis.localStorage が共に未提供。
// 並び替え設定の persist テストで必要なため、in-memory な Storage 互換実装を注入する。
if (typeof window !== 'undefined' && !window.localStorage) {
  const createMemoryStorage = (): Storage => {
    const store = new Map<string, string>();
    return {
      get length() {
        return store.size;
      },
      clear: () => store.clear(),
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      key: (i: number) => Array.from(store.keys())[i] ?? null,
      removeItem: (k: string) => {
        store.delete(k);
      },
      setItem: (k: string, v: string) => {
        store.set(k, String(v));
      },
    };
  };
  Object.defineProperty(window, 'localStorage', {
    value: createMemoryStorage(),
    writable: false,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'localStorage', {
    value: window.localStorage,
    writable: false,
    configurable: true,
  });
}


afterEach(async () => {
  await db.kindergartens.clear();
});
