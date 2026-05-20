import { describe, it, expect } from 'vitest';
import {
  buildExportPayload,
  serializeExport,
  parseImport,
  defaultExportFileName,
  ImportFormatError,
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
