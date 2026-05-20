import { describe, it, expect, vi, afterEach } from 'vitest';
import { newId } from './id';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('newId', () => {
  it('crypto.randomUUIDが利用可能な場合はUUID形式を返す', () => {
    const id = newId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('crypto.randomUUIDがない場合はフォールバック文字列を返す', () => {
    vi.stubGlobal('crypto', {});
    const id = newId();
    expect(id).toMatch(/^id-/);
  });

  it('複数呼び出しで異なるIDを返す（ユニーク性スモーク）', () => {
    const ids = new Set(Array.from({ length: 10 }, () => newId()));
    expect(ids.size).toBe(10);
  });
});
