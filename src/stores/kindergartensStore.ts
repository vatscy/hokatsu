import { create } from 'zustand';
import { kindergartenRepo } from '../db/repository';
import type { Kindergarten } from '../types/kindergarten';
import { compareKindergartens } from '../lib/scoring';
import {
  parseImport,
  serializeExport,
  type ExportPayload,
} from '../lib/jsonIO';

export type SortKey = 'visitedAt' | 'averageImpression' | 'name';
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

  exportJson: () => Promise<string>;
  importJson: (text: string) => Promise<{ count: number }>;
  clearAll: () => Promise<void>;
}

export const useKindergartensStore = create<KindergartensState>((set, get) => ({
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

  exportJson: async () => {
    const list = await kindergartenRepo.listAll();
    return serializeExport(list);
  },

  importJson: async (text) => {
    const records = parseImport(text);
    const count = await kindergartenRepo.replaceAll(records);
    set({ list: records, loaded: true });
    return { count };
  },

  clearAll: async () => {
    await kindergartenRepo.clearAll();
    set({ list: [], loaded: true });
  },
}));

export type { ExportPayload };

export function selectSortedList(state: KindergartensState): Kindergarten[] {
  const sorted = [...state.list].sort((a, b) =>
    compareKindergartens(a, b, state.sortKey),
  );
  if (state.sortDir === 'desc') sorted.reverse();
  return sorted;
}
