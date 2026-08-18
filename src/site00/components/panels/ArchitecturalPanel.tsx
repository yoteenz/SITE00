import type { ReactNode } from 'react';

type ArchitecturalPanelProps = {
  children: ReactNode;
  className?: string;
  variant?: 'glass' | 'workflow';
};

export function ArchitecturalPanel({ children, className = '', variant = 'glass' }: ArchitecturalPanelProps) {
  const panelClass =
    variant === 'workflow' ? 'site00-glass-panel site00-glass-panel--workflow' : 'site00-glass-panel';
  return <div className={`${panelClass} ${className}`.trim()}>{children}</div>;
}
