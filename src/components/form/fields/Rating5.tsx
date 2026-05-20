import type { Rating } from '../../../types/kindergarten';
import { labelClass } from './fieldStyles';

interface Props {
  label?: string;
  value: Rating;
  onChange: (v: Rating) => void;
  className?: string;
}

export function Rating5({ label, value, onChange, className }: Props) {
  return (
    <div className={className}>
      {label && <span className={labelClass}>{label}</span>}
      <div role="radiogroup" className="flex items-center gap-2">
        {[5, 4, 3, 2, 1].map((n) => {
          const active = value === n;
          return (
            <button
              type="button"
              key={n}
              role="radio"
              aria-checked={active}
              aria-label={`${n}`}
              onClick={() => onChange(active ? null : (n as Rating))}
              className={
                'min-h-11 min-w-11 px-3 rounded-md border text-base font-semibold ' +
                (active
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-amber-50')
              }
            >
              {n}
            </button>
          );
        })}
        <span className="text-xs text-slate-500 ml-2">
          {value === null ? '未評価' : `${value} / 5`}
        </span>
      </div>
    </div>
  );
}
