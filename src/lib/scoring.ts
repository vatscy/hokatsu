import type { Impressions, Kindergarten, Rating } from '../types/kindergarten';
import { IMPRESSION_KEYS } from '../types/kindergarten';

export function averageImpression(impressions: Impressions | undefined): number | null {
  if (!impressions) return null;
  const values: number[] = [];
  for (const key of IMPRESSION_KEYS) {
    const v = impressions[key];
    if (typeof v === 'number') values.push(v);
  }
  if (values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

export function formatAverage(value: number | null): string {
  if (value === null) return '-';
  return value.toFixed(1);
}

export function isRating(v: unknown): v is Rating {
  return v === null || v === 1 || v === 2 || v === 3 || v === 4 || v === 5;
}

export type CompareKey =
  | 'visitedAt'
  | 'averageImpression'
  | 'name'
  | 'distanceFromHomeKm'
  | 'distanceFromHomeMin';

export function compareKindergartens(
  a: Kindergarten,
  b: Kindergarten,
  key: CompareKey,
): number {
  if (key === 'name') {
    return (a.name ?? '').localeCompare(b.name ?? '', 'ja');
  }
  if (key === 'visitedAt') {
    return compareNullableString(a.visitedAt, b.visitedAt);
  }
  if (key === 'distanceFromHomeKm') {
    return compareNullableNumber(a.distanceFromHomeKm ?? null, b.distanceFromHomeKm ?? null);
  }
  if (key === 'distanceFromHomeMin') {
    return compareNullableNumber(a.distanceFromHomeMin ?? null, b.distanceFromHomeMin ?? null);
  }
  // averageImpression
  return compareNullableNumber(averageImpression(a.impressions), averageImpression(b.impressions));
}

function compareNullableString(a: string | undefined, b: string | undefined): number {
  const aEmpty = !a;
  const bEmpty = !b;
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1; // null/未入力を後ろへ
  if (bEmpty) return -1;
  return a!.localeCompare(b!);
}

function compareNullableNumber(a: number | null, b: number | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1; // null は後ろへ
  if (b === null) return -1;
  return a - b;
}
