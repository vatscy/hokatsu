import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  size?: 'md' | 'lg';
}

export function Container({ children, size = 'md' }: Props) {
  const maxW = size === 'lg' ? 'max-w-screen-lg' : 'max-w-screen-md';
  return <div className={`mx-auto w-full ${maxW} px-4 py-4`}>{children}</div>;
}
