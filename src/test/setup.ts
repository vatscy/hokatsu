import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { afterEach } from 'vitest';
import { db } from '../db/database';

afterEach(async () => {
  await db.kindergartens.clear();
});
