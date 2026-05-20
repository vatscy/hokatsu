import { labelClass } from './fieldStyles';

interface CheckProps {
  label: string;
  checked?: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}

export function Checkbox({ label, checked = false, onChange, className }: CheckProps) {
  return (
    <label
      className={
        'inline-flex items-center gap-2 min-h-11 px-2 py-1 rounded-md cursor-pointer ' +
        'hover:bg-slate-50 ' +
        (className ?? '')
      }
    >
      <input
        type="checkbox"
        className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

interface GroupProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export function CheckboxGroup({ label, children, className }: GroupProps) {
  return (
    <div className={className}>
      {label && <span className={labelClass}>{label}</span>}
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
