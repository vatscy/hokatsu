import type { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

export function DetailSection({ title, children }: Props) {
  return (
    <section className="border-t border-slate-100 pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0">
      <h4 className="text-sm font-semibold text-slate-700 mb-1">{title}</h4>
      {children}
    </section>
  );
}
