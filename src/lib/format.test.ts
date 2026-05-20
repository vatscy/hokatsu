import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime } from './format';

describe('formatDate', () => {
  it('undefinedは空文字を返す', () => {
    expect(formatDate(undefined)).toBe('');
  });

  it('空文字は空文字を返す', () => {
    expect(formatDate('')).toBe('');
  });

  it('ISO日付文字列をそのまま返す', () => {
    expect(formatDate('2024-03-15')).toBe('2024-03-15');
  });
});

describe('formatDateTime', () => {
  it('undefinedは空文字を返す', () => {
    expect(formatDateTime(undefined)).toBe('');
  });

  it('空文字は空文字を返す', () => {
    expect(formatDateTime('')).toBe('');
  });

  it('不正な文字列は空文字を返す', () => {
    expect(formatDateTime('not-a-date')).toBe('');
  });

  it('ISO日付時刻をYYYY-MM-DD HH:mm形式に変換する', () => {
    // タイムゾーンに依存しないようUTC固定で検証
    const utcDate = new Date('2024-03-15T09:05:00.000Z');
    const expected = `${utcDate.getFullYear()}-${String(utcDate.getMonth() + 1).padStart(2, '0')}-${String(utcDate.getDate()).padStart(2, '0')} ${String(utcDate.getHours()).padStart(2, '0')}:${String(utcDate.getMinutes()).padStart(2, '0')}`;
    expect(formatDateTime('2024-03-15T09:05:00.000Z')).toBe(expected);
  });
});
