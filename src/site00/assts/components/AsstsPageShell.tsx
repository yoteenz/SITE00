import type { ReactNode } from 'react';

type AsstsPageShellProps = {
  variant: 'library' | 'batch' | 'inspection' | 'batches';
  children: ReactNode;
};

/** Route-level spatial container + enter transition. */
export function AsstsPageShell({ variant, children }: AsstsPageShellProps) {
  return <div className={`assts-page-shell assts-page-shell--${variant}`}>{children}</div>;
}
