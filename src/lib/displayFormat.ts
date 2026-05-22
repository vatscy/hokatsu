// 読み取り専用ビュー（一覧画面のアコーディオン詳細）で値を可読化する整形関数群。
// 既存 src/lib/format.ts は日付整形に閉じているため、責務を分けてこのファイルに集約する。
import type { ClassCapacity, CostItem } from '../types/kindergarten';

export function yesNo(v: boolean | null | undefined): string {
  if (v === true) return '有';
  if (v === false) return '無';
  return '';
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

/** 距離(km)と時間(分)を「1.2km / 8分」のように合成。両方欠けたら空文字。 */
export function distance(
  km: number | null | undefined,
  min: number | null | undefined,
): string {
  const parts: string[] = [];
  if (isFiniteNumber(km)) parts.push(`${km}km`);
  if (isFiniteNumber(min)) parts.push(`${min}分`);
  return parts.join(' / ');
}

/** 時刻範囲を「09:00 〜 17:00」のように整形。片方欠けても可。両方空なら空文字。 */
export function timeRange(
  from: string | null | undefined,
  to: string | null | undefined,
): string {
  const f = from ?? '';
  const t = to ?? '';
  if (!f && !t) return '';
  return `${f} 〜 ${t}`;
}

/** 'MM-DD' を 'MM/DD' に。範囲は '01/04 〜 01/05' 形式。両方空なら空文字。 */
export function monthDayRange(
  from: string | null | undefined,
  to: string | null | undefined,
): string {
  const f = monthDay(from);
  const t = monthDay(to);
  if (!f && !t) return '';
  return `${f} 〜 ${t}`;
}

function monthDay(v: string | null | undefined): string {
  if (!v) return '';
  // 'MM-DD' 想定。ハイフン区切りなら / に置換、それ以外は素通し。
  return v.includes('-') ? v.replace('-', '/') : v;
}

/** クラス定員 / 空き人数の配列を「1才: 6人」の行配列に整形。両方欠ける要素は除外。 */
export function classCapacityList(items: ClassCapacity[] | undefined): string[] {
  if (!items?.length) return [];
  return items
    .map((it) => {
      const age = isFiniteNumber(it.age) ? `${it.age}才` : '';
      const count = isFiniteNumber(it.count) ? `${it.count}人` : '';
      if (!age && !count) return '';
      if (!age) return count;
      if (!count) return age;
      return `${age}: ${count}`;
    })
    .filter(Boolean);
}

/** 月々の費用配列を「給食費: 8000円」の行配列に整形。両方欠ける要素は除外。 */
export function costList(items: CostItem[] | undefined): string[] {
  if (!items?.length) return [];
  return items
    .map((it) => {
      const label = (it.label ?? '').trim();
      const amount = isFiniteNumber(it.amountYen) ? `${it.amountYen}円` : '';
      if (!label && !amount) return '';
      if (!label) return amount;
      if (!amount) return label;
      return `${label}: ${amount}`;
    })
    .filter(Boolean);
}
