import type { ChangeEvent } from 'react';
import { labelClass } from './fieldStyles';

interface Props {
  label?: string;
  value?: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
}

export function TextArea({
  label,
  value = '',
  onChange,
  rows = 3,
  placeholder,
  className,
}: Props) {
  const handle = (e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value);
  return (
    <label className={className}>
      {label && <span className={labelClass}>{label}</span>}
      <textarea
        className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
        rows={rows}
        value={value}
        onChange={handle}
        placeholder={placeholder}
      />
    </label>
  );
}
