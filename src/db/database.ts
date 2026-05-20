import Dexie, { type Table } from 'dexie';
import type { Kindergarten } from '../types/kindergarten';

export class HokatsuDB extends Dexie {
  kindergartens!: Table<Kindergarten, string>;

  constructor() {
    super('hokatsu');
    this.version(1).stores({
      kindergartens: 'id, name, visitedAt, updatedAt',
    });
  }
}

export const db = new HokatsuDB();
