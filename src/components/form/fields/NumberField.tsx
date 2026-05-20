import type { ChangeEvent } from 'react';
import { inputClass, labelClass } from './fieldStyles';

interface Props {
  label?: string;
  value?: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
}

export function NumberField({
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  suffix,
  className,
}: Props) {
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(null);
      return;
    }
    const n = Number(raw);
    onChange(Number.isNaN(n) ? null : n);
  };
  return (
    <label className={className}>
      {label && <span className={labelClass}>{label}</span>}
      <div className="flex items-center gap-2">
        <input
          type="number"
          className={inputClass}
          value={value ?? ''}
          onChange={handle}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          inputMode="decimal"
        />
        {suffix && <span className="text-sm text-slate-600 shrink-0">{suffix}</span>}
      </div>
    </label>
  );
}
