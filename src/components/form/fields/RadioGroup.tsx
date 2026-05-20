import { labelClass } from './fieldStyles';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  label?: string;
  value: T | null | undefined;
  onChange: (v: T | null) => void;
  options: readonly Option<T>[];
  allowClear?: boolean;
  className?: string;
}

export function RadioGroup<T extends string>({
  label,
  value,
  onChange,
  options,
  allowClear = true,
  className,
}: Props<T>) {
  return (
    <div className={className}>
      {label && <span className={labelClass}>{label}</span>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              type="button"
              key={opt.value}
              role="radio"
              aria-checked={active}
              onClick={() => {
                if (active && allowClear) onChange(null);
                else onChange(opt.value);
              }}
              className={
                'min-h-11 px-3 py-2 rounded-md border text-sm font-medium ' +
                (active
                  ? 'bg-sky-600 border-sky-600 text-white'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50')
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface BoolRadioProps {
  label?: string;
  value: boolean | null | undefined;
  onChange: (v: boolean | null) => void;
  trueLabel?: string;
  falseLabel?: string;
  allowClear?: boolean;
  className?: string;
}

export function BoolRadioGroup({
  label,
  value,
  onChange,
  trueLabel = '有',
  falseLabel = '無',
  allowClear = true,
  className,
}: BoolRadioProps) {
  return (
    <div className={className}>
      {label && <span className={labelClass}>{label}</span>}
      <div className="flex flex-wrap gap-2">
        {[
          { v: true, label: trueLabel },
          { v: false, label: falseLabel },
        ].map((opt) => {
          const active = value === opt.v;
          return (
            <button
              type="button"
              key={String(opt.v)}
              role="radio"
              aria-checked={active}
              onClick={() => {
                if (active && allowClear) onChange(null);
                else onChange(opt.v);
              }}
              className={
                'min-h-11 px-3 py-2 rounded-md border text-sm font-medium ' +
                (active
                  ? 'bg-sky-600 border-sky-600 text-white'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50')
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
