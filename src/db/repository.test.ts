import { describe, it, expect, beforeEach } from 'vitest';
import { kindergartenRepo } from './repository';
import { db } from './database';

beforeEach(async () => {
  await db.kindergartens.clear();
});

const makeRecord = () => ({
  id: 'test-id-1',
  name: 'テスト保育園',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

describe('kindergartenRepo.create', () => {
  it('idとcreatedAt/updatedAtを自動付与してレコードを生成する', async () => {
    const record = await kindergartenRepo.create({ name: 'テスト保育園' });
    expect(record.id).toBeTruthy();
    expect(record.createdAt).toBeTruthy();
    expect(record.updatedAt).toBeTruthy();
    expect(record.name).toBe('テスト保育園');
  });

  it('idを指定した場合はそのidを使用する', async () => {
    const record = await kindergartenRepo.create({ id: 'custom-id', name: 'テスト' });
    expect(record.id).toBe('custom-id');
  });
});

describe('kindergartenRepo.getById', () => {
  it('存在するidで取得できる', async () => {
    await kindergartenRepo.create({ id: 'find-me', name: '見つけて' });
    const result = await kindergartenRepo.getById('find-me');
    expect(result?.name).toBe('見つけて');
  });

  it('存在しないidはundefinedを返す', async () => {
    const result = await kindergartenRepo.getById('not-exist');
    expect(result).toBeUndefined();
  });
});

describe('kindergartenRepo.update', () => {
  it('パッチを適用してupdatedAtを更新する', async () => {
    await kindergartenRepo.create({ id: 'upd-id', name: '更新前' });
    const result = await kindergartenRepo.update('upd-id', { name: '更新後' });
    expect(result.name).toBe('更新後');
    expect(result.updatedAt).not.toBe('2024-01-01T00:00:00.000Z');
  });

  it('createdAtは変更しない', async () => {
    const created = await kindergartenRepo.create({ id: 'ts-id' });
    const updated = await kindergartenRepo.update('ts-id', { name: 'new' });
    expect(updated.createdAt).toBe(created.createdAt);
  });

  it('存在しないidはErrorをthrowする', async () => {
    await expect(kindergartenRepo.update('no-such', {})).rejects.toThrow('not found');
  });
});

describe('kindergartenRepo.remove', () => {
  it('指定idのレコードを削除する', async () => {
    await kindergartenRepo.create({ id: 'del-id' });
    await kindergartenRepo.remove('del-id');
    const result = await kindergartenRepo.getById('del-id');
    expect(result).toBeUndefined();
  });
});

describe('kindergartenRepo.listAll', () => {
  it('登録した全レコードを返す', async () => {
    await kindergartenRepo.create({ id: 'a' });
    await kindergartenRepo.create({ id: 'b' });
    const list = await kindergartenRepo.listAll();
    expect(list).toHaveLength(2);
  });
});

describe('kindergartenRepo.replaceAll', () => {
  it('既存レコードをクリアして新しいレコードを一括追加し件数を返す', async () => {
    await kindergartenRepo.create({ id: 'old' });
    const count = await kindergartenRepo.replaceAll([makeRecord(), { ...makeRecord(), id: 'test-id-2' }]);
    expect(count).toBe(2);
    const list = await kindergartenRepo.listAll();
    expect(list.map((r) => r.id)).not.toContain('old');
  });
});

describe('kindergartenRepo.clearAll', () => {
  it('全レコードを削除する', async () => {
    await kindergartenRepo.create({ id: 'c1' });
    await kindergartenRepo.clearAll();
    expect(await kindergartenRepo.listAll()).toHaveLength(0);
  });
});
