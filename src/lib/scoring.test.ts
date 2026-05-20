import { describe, it, expect } from 'vitest';
import { averageImpression, formatAverage, isRating, compareKindergartens } from './scoring';
import type { Impressions, Kindergarten } from '../types/kindergarten';

const baseKindergarten = (): Kindergarten => ({
  id: 'test-id',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

describe('averageImpression', () => {
  it('undefinedはnullを返す', () => {
    expect(averageImpression(undefined)).toBeNull();
  });

  it('全フィールドnullはnullを返す', () => {
    const imp: Impressions = { teacher: null, childCare: null, facility: null, toysBooks: null, principal: null };
    expect(averageImpression(imp)).toBeNull();
  });

  it('一部nullは数値のみで平均を計算する', () => {
    const imp: Impressions = { teacher: 4, childCare: null, facility: 2, toysBooks: null, principal: null };
    expect(averageImpression(imp)).toBe(3);
  });

  it('全フィールド数値の場合の平均を返す', () => {
    const imp: Impressions = { teacher: 5, childCare: 4, facility: 3, toysBooks: 2, principal: 1 };
    expect(averageImpression(imp)).toBe(3);
  });

  it('単一フィールドの場合その値を返す', () => {
    const imp: Impressions = { teacher: 3, childCare: null, facility: null, toysBooks: null, principal: null };
    expect(averageImpression(imp)).toBe(3);
  });
});

describe('formatAverage', () => {
  it('nullは"-"を返す', () => {
    expect(formatAverage(null)).toBe('-');
  });

  it('数値を小数点1桁の文字列に変換する', () => {
    expect(formatAverage(3)).toBe('3.0');
    expect(formatAverage(3.567)).toBe('3.6');
    expect(formatAverage(5)).toBe('5.0');
  });
});

describe('isRating', () => {
  it('有効なRating値を判定する', () => {
    expect(isRating(null)).toBe(true);
    expect(isRating(1)).toBe(true);
    expect(isRating(2)).toBe(true);
    expect(isRating(3)).toBe(true);
    expect(isRating(4)).toBe(true);
    expect(isRating(5)).toBe(true);
  });

  it('無効な値を弾く', () => {
    expect(isRating(0)).toBe(false);
    expect(isRating(6)).toBe(false);
    expect(isRating('3')).toBe(false);
    expect(isRating(undefined)).toBe(false);
  });
});

describe('compareKindergartens', () => {
  it('name: 日本語でソートする', () => {
    const a = { ...baseKindergarten(), name: 'あいう保育園' };
    const b = { ...baseKindergarten(), name: 'かきく保育園' };
    expect(compareKindergartens(a, b, 'name')).toBeLessThan(0);
    expect(compareKindergartens(b, a, 'name')).toBeGreaterThan(0);
  });

  it('name: 名前未入力は後ろへ', () => {
    const a = { ...baseKindergarten(), name: 'あいう保育園' };
    const b = { ...baseKindergarten() };
    expect(compareKindergartens(b, a, 'name')).toBeGreaterThan(0);
  });

  it('visitedAt: 文字列比較（ISO日付）', () => {
    const a = { ...baseKindergarten(), visitedAt: '2024-01-01' };
    const b = { ...baseKindergarten(), visitedAt: '2024-02-01' };
    expect(compareKindergartens(a, b, 'visitedAt')).toBeLessThan(0);
  });

  it('visitedAt: 未入力は後ろへ', () => {
    const a = { ...baseKindergarten(), visitedAt: '2024-01-01' };
    const b = { ...baseKindergarten() };
    expect(compareKindergartens(b, a, 'visitedAt')).toBeGreaterThan(0);
  });

  it('distanceFromHomeKm: 数値昇順', () => {
    const a = { ...baseKindergarten(), distanceFromHomeKm: 1.0 };
    const b = { ...baseKindergarten(), distanceFromHomeKm: 2.0 };
    expect(compareKindergartens(a, b, 'distanceFromHomeKm')).toBeLessThan(0);
  });

  it('distanceFromHomeKm: nullは後ろへ', () => {
    const a = { ...baseKindergarten(), distanceFromHomeKm: 1.0 };
    const b = { ...baseKindergarten(), distanceFromHomeKm: null };
    expect(compareKindergartens(b, a, 'distanceFromHomeKm')).toBeGreaterThan(0);
  });

  it('averageImpression: スコア昇順', () => {
    const a = { ...baseKindergarten(), impressions: { teacher: 2, childCare: null, facility: null, toysBooks: null, principal: null } };
    const b = { ...baseKindergarten(), impressions: { teacher: 4, childCare: null, facility: null, toysBooks: null, principal: null } };
    expect(compareKindergartens(a, b, 'averageImpression')).toBeLessThan(0);
  });

  it('averageImpression: 印象未入力は後ろへ', () => {
    const a = { ...baseKindergarten(), impressions: { teacher: 3, childCare: null, facility: null, toysBooks: null, principal: null } };
    const b = { ...baseKindergarten() };
    expect(compareKindergartens(b, a, 'averageImpression')).toBeGreaterThan(0);
  });
});
