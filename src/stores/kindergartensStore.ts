import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { kindergartenRepo } from '../db/repository';
import type { Kindergarten } from '../types/kindergarten';
import {
  compressToShareString,
  decompressFromShareString,
} from '../lib/shareIO';

export type SortKey =
  | 'visitedAt'
  | 'averageImpression'
  | 'name'
  | 'distanceFromHomeKm'
  | 'distanceFromHomeMin';
export type SortDir = 'asc' | 'desc';

interface KindergartensState {
  list: Kindergarten[];
  loaded: boolean;
  sortKey: SortKey;
  sortDir: SortDir;

  load: () => Promise<void>;
  create: (patch: Partial<Kindergarten>) => Promise<string>;
  update: (id: string, patch: Partial<Kindergarten>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSort: (key: SortKey, dir: SortDir) => void;

  getShareString: () => Promise<string>;
  importFromShare: (text: string) => Promise<{ count: number }>;
  clearAll: () => Promise<void>;
}

// 並び替え設定（sortKey / sortDir）のみ localStorage に永続化する。
// list / loaded は IndexedDB が一次情報のため localStorage に書き出さない（複数タブで不整合の温床になる）。
export const useKindergartensStore = create<KindergartensState>()(
  persist(
    (set, get) => ({
      list: [],
      loaded: false,
      sortKey: 'visitedAt',
      sortDir: 'desc',

      load: async () => {
        const list = await kindergartenRepo.listAll();
        set({ list, loaded: true });
      },

      create: async (patch) => {
        const record = await kindergartenRepo.create(patch);
        set({ list: [...get().list, record] });
        return record.id;
      },

      update: async (id, patch) => {
        const next = await kindergartenRepo.update(id, patch);
        set({ list: get().list.map((k) => (k.id === id ? next : k)) });
      },

      remove: async (id) => {
        await kindergartenRepo.remove(id);
        set({ list: get().list.filter((k) => k.id !== id) });
      },

      setSort: (key, dir) => set({ sortKey: key, sortDir: dir }),

      getShareString: async () => {
        return compressToShareString(await kindergartenRepo.listAll());
      },

      importFromShare: async (text) => {
        const records = await decompressFromShareString(text);
        const count = await kindergartenRepo.replaceAll(records);
        set({ list: records, loaded: true });
        return { count };
      },

      clearAll: async () => {
        await kindergartenRepo.clearAll();
        set({ list: [], loaded: true });
      },
    }),
    {
      name: 'hokatsu-list-prefs',
      version: 1,
      // window.localStorage を明示参照する。Node 26 では globalThis.localStorage が
      // experimental 実装で未提供（--localstorage-file 未指定でアクセス時 undefined）のため、
      // ブラウザでもテスト (jsdom) でも window 経由なら確実に取得できる。
      storage: createJSONStorage(() => window.localStorage),
      partialize: (s) => ({ sortKey: s.sortKey, sortDir: s.sortDir }),
    },
  ),
);
