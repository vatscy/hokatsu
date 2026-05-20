import { db } from './database';
import type { Kindergarten } from '../types/kindergarten';
import { newId } from '../lib/id';

export const kindergartenRepo = {
  async listAll(): Promise<Kindergarten[]> {
    return db.kindergartens.toArray();
  },

  async getById(id: string): Promise<Kindergarten | undefined> {
    return db.kindergartens.get(id);
  },

  async create(patch: Partial<Kindergarten>): Promise<Kindergarten> {
    const now = new Date().toISOString();
    const record: Kindergarten = {
      ...patch,
      id: patch.id ?? newId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.kindergartens.add(record);
    return record;
  },

  async update(id: string, patch: Partial<Kindergarten>): Promise<Kindergarten> {
    const existing = await db.kindergartens.get(id);
    if (!existing) {
      throw new Error(`Kindergarten not found: ${id}`);
    }
    const next: Kindergarten = {
      ...existing,
      ...patch,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    await db.kindergartens.put(next);
    return next;
  },

  async remove(id: string): Promise<void> {
    await db.kindergartens.delete(id);
  },

  async replaceAll(records: Kindergarten[]): Promise<number> {
    return db.transaction('rw', db.kindergartens, async () => {
      await db.kindergartens.clear();
      if (records.length > 0) {
        await db.kindergartens.bulkAdd(records);
      }
      return records.length;
    });
  },

  async clearAll(): Promise<void> {
    await db.kindergartens.clear();
  },
};
