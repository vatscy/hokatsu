import type { ReactNode } from 'react';
import { labelClass } from './fieldStyles';

interface Props<T> {
  label?: string;
  value: T[] | undefined;
  onChange: (v: T[]) => void;
  emptyItem: () => T;
  renderRow: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
  addLabel?: string;
  className?: string;
}

export function RepeatableRows<T>({
  label,
  value,
  onChange,
  emptyItem,
  renderRow,
  addLabel = '行を追加',
  className,
}: Props<T>) {
  const rows = value ?? [];

  const updateAt = (index: number, patch: Partial<T>) => {
    const next = rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange(next);
  };

  const removeAt = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...rows, emptyItem()]);
  };

  return (
    <div className={className}>
      {label && <span className={labelClass}>{label}</span>}
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex items-start gap-2 p-2 rounded-md border border-slate-200 bg-slate-50"
          >
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {renderRow(row, (patch) => updateAt(i, patch))}
            </div>
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="min-h-11 px-3 rounded-md text-sm text-rose-600 hover:bg-rose-50"
              aria-label="行を削除"
            >
              削除
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 min-h-11 px-3 rounded-md border border-dashed border-slate-300 text-sm text-slate-600 hover:bg-slate-50"
      >
        ＋ {addLabel}
      </button>
    </div>
  );
}
