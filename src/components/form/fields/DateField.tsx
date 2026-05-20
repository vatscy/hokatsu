import type { ChangeEvent } from 'react';
import { inputClass, labelClass } from './fieldStyles';

interface Props {
  label?: string;
  value?: string;
  onChange: (v: string) => void;
  className?: string;
}

export function DateField({ label, value = '', onChange, className }: Props) {
  const handle = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);
  return (
    <label className={className}>
      {label && <span className={labelClass}>{label}</span>}
      <input type="date" className={inputClass} value={value} onChange={handle} />
    </label>
  );
}
