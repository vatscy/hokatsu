import { describe, it, expect } from 'vitest';
import {
  ImportFormatError,
  compressToShareString,
  decompressFromShareString,
  defaultShareFileName,
  extractShareStringFromFileText,
} from './shareIO';
import type { Kindergarten } from '../types/kindergarten';

const makeRecord = (overrides?: Partial<Kindergarten>): Kindergarten => ({
  id: 'abc123',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('compressToShareString / decompressFromShareString', () => {
  it('空配列のラウンドトリップが成功する', async () => {
    const str = await compressToShareString([]);
    expect(str).toMatch(/^h1:/);
    expect(await decompressFromShareString(str)).toEqual([]);
  });

  it('1件のラウンドトリップが成功する', async () => {
    const records = [makeRecord({ name: 'テスト保育園' })];
    const result = await decompressFromShareString(await compressToShareString(records));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('abc123');
    expect(result[0].name).toBe('テスト保育園');
  });

  it('複数件のラウンドトリップが成功する', async () => {
    const records = [
      makeRecord({ id: 'r1', name: 'あいう保育園', generalMemo: 'テストメモ' }),
      makeRecord({ id: 'r2', name: 'かきく保育園', distanceFromHomeKm: 1.5 }),
    ];
    const result = await decompressFromShareString(await compressToShareString(records));
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('あいう保育園');
    expect(result[1].distanceFromHomeKm).toBe(1.5);
  });

  it('h1: プレフィックスなしは ImportFormatError をスローする', async () => {
    await expect(decompressFromShareString('invalid')).rejects.toThrow(ImportFormatError);
    await expect(decompressFromShareString('v1:abc')).rejects.toThrow(ImportFormatError);
  });

  it('不正な base64url は ImportFormatError をスローする', async () => {
    await expect(decompressFromShareString('h1:!!!invalid!!!')).rejects.toThrow(ImportFormatError);
  });

  it('正常な base64url だが解凍できないデータは ImportFormatError をスローする', async () => {
    const garbage = btoa('not compressed').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    await expect(decompressFromShareString('h1:' + garbage)).rejects.toThrow(ImportFormatError);
  });

  it('元の JSON より文字列が短い（圧縮効果あり）', async () => {
    const records = Array.from({ length: 5 }, (_, i) =>
      makeRecord({ id: `id-${i}`, name: `保育園${i}`, generalMemo: 'メモ'.repeat(20) }),
    );
    const shareStr = await compressToShareString(records);
    expect(shareStr.length).toBeLessThan(JSON.stringify(records).length);
  });

  // 旧フォーマット ({ appName, version, kindergartens }) の h1: 文字列が
  // 互換切れにより新 parser で必ず拒否されることを検証する。
  it('旧フォーマット ({appName, version, kindergartens}) の h1: は ImportFormatError', async () => {
    const legacyJson = JSON.stringify({
      appName: 'hokatsu',
      version: 1,
      exportedAt: '2024-01-01T00:00:00.000Z',
      kindergartens: [
        { id: 'r1', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
      ],
    });
    const legacyShareStr = await buildLegacyH1(legacyJson);
    await expect(decompressFromShareString(legacyShareStr)).rejects.toThrow(ImportFormatError);
  });
});

// 旧形式の h1: 文字列をテスト目的で組み立てるヘルパ（shareIO.ts の内部処理を最小限再現）。
async function buildLegacyH1(json: string): Promise<string> {
  const cs = new CompressionStream('deflate-raw');
  const writer = cs.writable.getWriter();
  const writeDone = (async () => {
    await writer.write(new TextEncoder().encode(json));
    await writer.close();
  })();
  const chunks: Uint8Array[] = [];
  const reader = cs.readable.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  await writeDone;
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const bytes = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    bytes.set(c, off);
    off += c.length;
  }
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  const b64url = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return 'h1:' + b64url;
}

describe('defaultShareFileName', () => {
  it('指定日付から .txt ファイル名を生成する', () => {
    const date = new Date(2024, 2, 5);
    expect(defaultShareFileName(date)).toBe('hokatsu-20240305.txt');
  });
});

describe('extractShareStringFromFileText', () => {
  it('前後の空白と内部の改行を除去して返す', () => {
    expect(extractShareStringFromFileText('  h1:abc def\n ')).toBe('h1:abcdef');
  });

  it('h1: で始まらない場合は ImportFormatError をスローする', () => {
    expect(() => extractShareStringFromFileText('not share')).toThrow(ImportFormatError);
  });

  it('空文字列は ImportFormatError をスローする', () => {
    expect(() => extractShareStringFromFileText('   ')).toThrow(ImportFormatError);
  });
});
