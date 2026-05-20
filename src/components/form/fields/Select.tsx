import type { ChangeEvent } from 'react';
import { inputClass, labelClass } from './fieldStyles';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  label?: string;
  value: T | null | undefined;
  onChange: (v: T | null) => void;
  options: readonly Option<T>[];
  placeholder?: string;
  className?: string;
}

export function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  placeholder = '（選択なし）',
  className,
}: Props<T>) {
  const handle = (e: ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === '') onChange(null);
    else onChange(v as T);
  };
  return (
    <label className={className}>
      {label && <span className={labelClass}>{label}</span>}
      <select className={inputClass} value={value ?? ''} onChange={handle}>
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
