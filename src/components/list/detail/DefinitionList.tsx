import type { ReactNode } from 'react';

interface RowProps {
  label: string;
  value: ReactNode;
}

// dl は呼び出し側で 1 つ用意し、その中に複数の Row を並べる構造。
// 値が空相当（undefined/null/空文字/空配列）なら呼び出し側で row 自体を出さない方針だが、
// 念のためこのコンポーネント側でも何も描画しないようガードする。
export function DefinitionRow({ label, value }: RowProps) {
  if (isEmptyValue(value)) return null;
  return (
    <div className="py-1.5 grid grid-cols-1 md:grid-cols-[8rem_1fr] md:gap-3">
      <dt className="text-xs text-slate-500 md:text-sm md:text-slate-600 md:pt-0.5">
        {label}
      </dt>
      <dd className="text-sm text-slate-800 break-words whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

interface ListProps {
  children: ReactNode;
}

export function DefinitionList({ children }: ListProps) {
  return <dl className="divide-y divide-slate-100">{children}</dl>;
}

function isEmptyValue(v: ReactNode): boolean {
  if (v == null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0 || v.every(isEmptyValue);
  return false;
}
