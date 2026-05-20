import type { ReactNode } from 'react';

interface Props {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Section({ title, defaultOpen = false, children }: Props) {
  return (
    <details
      open={defaultOpen}
      className="rounded-lg border border-slate-200 bg-white shadow-sm group"
    >
      <summary className="cursor-pointer list-none min-h-11 px-4 py-3 flex items-center justify-between font-semibold text-slate-800">
        <span>{title}</span>
        <span className="text-slate-400 group-open:rotate-90 transition-transform">▶</span>
      </summary>
      <div className="px-4 pb-4 pt-2 space-y-4 border-t border-slate-100">{children}</div>
    </details>
  );
}
