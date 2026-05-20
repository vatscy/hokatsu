import { describe, it, expect } from 'vitest';
import {
  buildExportPayload,
  serializeExport,
  parseImport,
  defaultExportFileName,
  ImportFormatError,
  compressToShareString,
  decompressFromShareString,
} from './jsonIO';
import type { Kindergarten } from '../types/kindergarten';

const makeRecord = (overrides?: Partial<Kindergarten>): Kindergarten => ({
  id: 'abc123',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('buildExportPayload', () => {
  it('appNameとversionを含むペイロードを生成する', () => {
    const payload = buildExportPayload([makeRecord()]);
    expect(payload.appName).toBe('hokatsu');
    expect(payload.version).toBe(1);
    expect(payload.kindergartens).toHaveLength(1);
    expect(payload.exportedAt).toBeTruthy();
  });
});

describe('serializeExport', () => {
  it('整形されたJSONを返す', () => {
    const json = serializeExport([makeRecord()]);
    const parsed = JSON.parse(json);
    expect(parsed.appName).toBe('hokatsu');
    expect(parsed.kindergartens).toHaveLength(1);
  });
});

describe('parseImport', () => {
  it('正常なJSONをパースしてKindergarten配列を返す', () => {
    const json = serializeExport([makeRecord()]);
    const result = parseImport(json);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('abc123');
  });

  it('不正なJSONはImportFormatErrorをthrowする', () => {
    expect(() => parseImport('not json')).toThrow(ImportFormatError);
  });

  it('トップレベルが配列はImportFormatErrorをthrowする', () => {
    expect(() => parseImport('[]')).toThrow(ImportFormatError);
  });

  it('appNameが違うはImportFormatErrorをthrowする', () => {
    const json = JSON.stringify({ appName: 'other', version: 1, exportedAt: '', kindergartens: [] });
    expect(() => parseImport(json)).toThrow(ImportFormatError);
  });

  it('versionが違うはImportFormatErrorをthrowする', () => {
    const json = JSON.stringify({ appName: 'hokatsu', version: 2, exportedAt: '', kindergartens: [] });
    expect(() => parseImport(json)).toThrow(ImportFormatError);
  });

  it('kindergartensがない場合はImportFormatErrorをthrowする', () => {
    const json = JSON.stringify({ appName: 'hokatsu', version: 1, exportedAt: '' });
    expect(() => parseImport(json)).toThrow(ImportFormatError);
  });

  it('要素にidがない場合はImportFormatErrorをthrowする', () => {
    const json = JSON.stringify({
      appName: 'hokatsu',
      version: 1,
      exportedAt: '',
      kindergartens: [{ createdAt: '2024', updatedAt: '2024' }],
    });
    expect(() => parseImport(json)).toThrow(ImportFormatError);
  });

  it('要素にcreatedAt/updatedAtがない場合はImportFormatErrorをthrowする', () => {
    const json = JSON.stringify({
      appName: 'hokatsu',
      version: 1,
      exportedAt: '',
      kindergartens: [{ id: 'x' }],
    });
    expect(() => parseImport(json)).toThrow(ImportFormatError);
  });
});

describe('defaultExportFileName', () => {
  it('指定日付からファイル名を生成する', () => {
    const date = new Date(2024, 2, 5); // 2024-03-05
    expect(defaultExportFileName(date)).toBe('hokatsu-20240305.json');
  });
});

describe('compressToShareString / decompressFromShareString', () => {
  it('空配列のラウンドトリップが成功する', async () => {
    const str = await compressToShareString([]);
    expect(str).toMatch(/^v1:/);
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

  it('v1: プレフィックスなしは ImportFormatError をスローする', async () => {
    await expect(decompressFromShareString('invalid')).rejects.toThrow(ImportFormatError);
    await expect(decompressFromShareString('v2:abc')).rejects.toThrow(ImportFormatError);
  });

  it('不正な base64url は ImportFormatError をスローする', async () => {
    await expect(decompressFromShareString('v1:!!!invalid!!!')).rejects.toThrow(ImportFormatError);
  });

  it('正常な base64url だが解凍できないデータは ImportFormatError をスローする', async () => {
    const garbage = btoa('not compressed').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    await expect(decompressFromShareString('v1:' + garbage)).rejects.toThrow(ImportFormatError);
  });

  it('元の JSON より文字列が短い（圧縮効果あり）', async () => {
    const records = Array.from({ length: 5 }, (_, i) =>
      makeRecord({ id: `id-${i}`, name: `保育園${i}`, generalMemo: 'メモ'.repeat(20) }),
    );
    const shareStr = await compressToShareString(records);
    expect(shareStr.length).toBeLessThan(JSON.stringify(records).length);
  });
});
