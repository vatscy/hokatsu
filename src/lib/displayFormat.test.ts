import { describe, it, expect } from 'vitest';
import {
  yesNo,
  distance,
  timeRange,
  monthDayRange,
  classCapacityList,
  costList,
} from './displayFormat';

describe('yesNo', () => {
  it.each([
    [true, '有'],
    [false, '無'],
    [null, ''],
    [undefined, ''],
  ])('%s -> "%s"', (input, expected) => {
    expect(yesNo(input as boolean | null | undefined)).toBe(expected);
  });
});

describe('distance', () => {
  it('両方あれば結合する', () => {
    expect(distance(1.2, 8)).toBe('1.2km / 8分');
  });
  it('km のみ', () => {
    expect(distance(0.5, null)).toBe('0.5km');
  });
  it('分のみ', () => {
    expect(distance(undefined, 10)).toBe('10分');
  });
  it('両方欠ければ空文字', () => {
    expect(distance(null, undefined)).toBe('');
  });
  it('NaN は欠落扱い', () => {
    expect(distance(NaN, 5)).toBe('5分');
  });
});

describe('timeRange', () => {
  it('両方あれば 〜 で連結', () => {
    expect(timeRange('09:00', '17:00')).toBe('09:00 〜 17:00');
  });
  it('片方欠けても枠を保つ', () => {
    expect(timeRange('09:00', undefined)).toBe('09:00 〜 ');
    expect(timeRange(null, '17:00')).toBe(' 〜 17:00');
  });
  it('両方空なら空文字', () => {
    expect(timeRange(undefined, undefined)).toBe('');
    expect(timeRange('', '')).toBe('');
  });
});

describe('monthDayRange', () => {
  it('MM-DD を MM/DD に変換', () => {
    expect(monthDayRange('12-29', '01-04')).toBe('12/29 〜 01/04');
  });
  it('両方空なら空文字', () => {
    expect(monthDayRange(undefined, undefined)).toBe('');
  });
});

describe('classCapacityList', () => {
  it('age + count を整形', () => {
    expect(classCapacityList([{ age: 1, count: 6 }, { age: 2, count: 12 }])).toEqual([
      '1才: 6人',
      '2才: 12人',
    ]);
  });
  it('片方欠けても保持', () => {
    expect(classCapacityList([{ age: 1 }, { count: 3 }])).toEqual(['1才', '3人']);
  });
  it('両方欠ける要素は除外', () => {
    expect(classCapacityList([{}, { age: 0, count: 5 }])).toEqual(['0才: 5人']);
  });
  it('空 / undefined は空配列', () => {
    expect(classCapacityList([])).toEqual([]);
    expect(classCapacityList(undefined)).toEqual([]);
  });
});

describe('costList', () => {
  it('label + amount を整形', () => {
    expect(costList([{ label: '給食費', amountYen: 8000 }])).toEqual(['給食費: 8000円']);
  });
  it('片方欠けても保持', () => {
    expect(costList([{ label: '雑費' }, { amountYen: 1500 }])).toEqual(['雑費', '1500円']);
  });
  it('両方欠ける要素は除外', () => {
    expect(costList([{ label: '   ' }, { label: '実費', amountYen: 200 }])).toEqual([
      '実費: 200円',
    ]);
  });
});
