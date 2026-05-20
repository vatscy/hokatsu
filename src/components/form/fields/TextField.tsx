import type { ChangeEvent } from 'react';
import { inputClass, labelClass } from './fieldStyles';

interface Props {
  label?: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email' | 'url';
  className?: string;
}

export function TextField({
  label,
  value = '',
  onChange,
  placeholder,
  inputMode,
  className,
}: Props) {
  const handle = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);
  return (
    <label className={className}>
      {label && <span className={labelClass}>{label}</span>}
      <input
        type="text"
        className={inputClass}
        value={value}
        onChange={handle}
        placeholder={placeholder}
        inputMode={inputMode}
      />
    </label>
  );
}
