import type { ReactNode } from 'react';

type AstralHUDProps = {
  children: ReactNode;
  position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
};

export function AstralHUD({ children, position = 'top', className = '' }: AstralHUDProps) {
  return (
    <div className={`aw-hud aw-hud--${position} ${className}`.trim()} role="status">
      {children}
    </div>
  );
}

export function AstralHUDChip({ children, live }: { children: ReactNode; live?: boolean }) {
  return (
    <span className={`aw-hud-chip${live ? ' aw-hud-chip--live' : ''}`}>
      {live ? <span className="aw-hud-chip__dot" aria-hidden /> : null}
      {children}
    </span>
  );
}
