import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useKindergartensStore } from './kindergartensStore';
import { db } from '../db/database';

beforeEach(async () => {
  await db.kindergartens.clear();
  // Node 26 では globalThis.localStorage が experimental 実装で未提供のため window 経由でクリアする。
  window.localStorage.clear();
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

  it('setSort: 並び替え設定は localStorage に永続化される', () => {
    const { result } = renderHook(() => useKindergartensStore());
    act(() => result.current.setSort('averageImpression', 'asc'));
    const raw = window.localStorage.getItem('hokatsu-list-prefs');
    expect(raw).not.toBeNull();
    const persisted = JSON.parse(raw!);
    expect(persisted.state).toEqual({ sortKey: 'averageImpression', sortDir: 'asc' });
    // list / loaded は決して永続化しないこと
    expect(persisted.state).not.toHaveProperty('list');
    expect(persisted.state).not.toHaveProperty('loaded');
  });

  it('clearAll: listを空にする', async () => {
    const { result } = renderHook(() => useKindergartensStore());
    await act(() => result.current.create({}));
    await act(() => result.current.clearAll());
    expect(result.current.list).toHaveLength(0);
  });

  it('getShareString: 圧縮文字列を返す', async () => {
    const { result } = renderHook(() => useKindergartensStore());
    await act(() => result.current.create({ name: '共有テスト園' }));
    let str = '';
    await act(async () => { str = await result.current.getShareString(); });
    expect(str).toMatch(/^h1:/);
  });

  it('importFromShare: 共有文字列でlistを置換し件数を返す', async () => {
    const { result } = renderHook(() => useKindergartensStore());
    await act(() => result.current.create({ name: '既存園' }));
    let shareStr = '';
    await act(async () => {
      await result.current.create({ name: '共有元園' });
      shareStr = await result.current.getShareString();
    });
    await act(() => result.current.clearAll());
    let ret = { count: 0 };
    await act(async () => { ret = await result.current.importFromShare(shareStr); });
    expect(ret.count).toBe(2);
    expect(result.current.list).toHaveLength(2);
  });

  it('importFromShare: 不正な文字列はエラーをthrowする', async () => {
    const { result } = renderHook(() => useKindergartensStore());
    await expect(act(() => result.current.importFromShare('invalid'))).rejects.toThrow();
  });
});
