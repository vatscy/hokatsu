import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useKindergartensStore } from './kindergartensStore';
import { db } from '../db/database';

beforeEach(async () => {
  await db.kindergartens.clear();
  // replace=true にするとメソッドが消えるため merge モードでデータ部分のみリセット
  useKindergartensStore.setState({ list: [], loaded: false, sortKey: 'visitedAt', sortDir: 'desc' });
});

describe('useKindergartensStore', () => {
  it('load: DBから全件をリストに読み込む', async () => {
    const { result } = renderHook(() => useKindergartensStore());
    await act(() => result.current.create({ name: 'テスト1' }));
    useKindergartensStore.setState({ list: [], loaded: false });
    await act(() => result.current.load());
    expect(result.current.list).toHaveLength(1);
    expect(result.current.loaded).toBe(true);
  });

  it('create: 新しいレコードをlistの末尾に追加し、idを返す', async () => {
    const { result } = renderHook(() => useKindergartensStore());
    let id = '';
    await act(async () => {
      id = await result.current.create({ name: '新園' });
    });
    expect(id).toBeTruthy();
    expect(result.current.list).toHaveLength(1);
    expect(result.current.list[0].name).toBe('新園');
  });

  it('update: 対象レコードを更新する', async () => {
    const { result } = renderHook(() => useKindergartensStore());
    let id = '';
    await act(async () => { id = await result.current.create({ name: '更新前' }); });
    await act(() => result.current.update(id, { name: '更新後' }));
    expect(result.current.list[0].name).toBe('更新後');
  });

  it('remove: 対象レコードをlistから削除する', async () => {
    const { result } = renderHook(() => useKindergartensStore());
    let id = '';
    await act(async () => { id = await result.current.create({ name: '削除対象' }); });
    await act(() => result.current.remove(id));
    expect(result.current.list).toHaveLength(0);
  });

  it('setSort: sortKey/sortDirを更新する', () => {
    const { result } = renderHook(() => useKindergartensStore());
    act(() => result.current.setSort('name', 'asc'));
    expect(result.current.sortKey).toBe('name');
    expect(result.current.sortDir).toBe('asc');
  });

  it('exportJson: パース可能なJSONを返す', async () => {
    const { result } = renderHook(() => useKindergartensStore());
    await act(() => result.current.create({ name: 'エクスポート園' }));
    let json = '';
    await act(async () => { json = await result.current.exportJson(); });
    const parsed = JSON.parse(json);
    expect(parsed.appName).toBe('hokatsu');
    expect(parsed.kindergartens).toHaveLength(1);
  });

  it('importJson: 正常なJSONでlistを置換し件数を返す', async () => {
    const { result } = renderHook(() => useKindergartensStore());
    const json = JSON.stringify({
      appName: 'hokatsu',
      version: 1,
      exportedAt: '',
      kindergartens: [
        { id: 'imp-1', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z', name: 'インポート園' },
      ],
    });
    let ret = { count: 0 };
    await act(async () => { ret = await result.current.importJson(json); });
    expect(ret.count).toBe(1);
    expect(result.current.list).toHaveLength(1);
    expect(result.current.list[0].id).toBe('imp-1');
  });

  it('importJson: 不正なJSONはエラーをthrowする', async () => {
    const { result } = renderHook(() => useKindergartensStore());
    await expect(act(() => result.current.importJson('invalid'))).rejects.toThrow();
  });

  it('clearAll: listを空にする', async () => {
    const { result } = renderHook(() => useKindergartensStore());
    await act(() => result.current.create({}));
    await act(() => result.current.clearAll());
    expect(result.current.list).toHaveLength(0);
  });
});
