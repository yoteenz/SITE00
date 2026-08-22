import type { ReactNode } from 'react';

type AccountControlIconFrameProps = {
  children: ReactNode;
  destructive?: boolean;
};

export function AccountControlIconFrame({ children, destructive = false }: AccountControlIconFrameProps) {
  return (
    <span
      className={`site00-idnty-control-icon ${destructive ? 'site00-idnty-control-icon--destructive' : ''}`.trim()}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 40" fill="none" className="site00-idnty-control-icon__ring">
        <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="0.75" opacity="0.35" />
        <line x1="20" y1="6" x2="20" y2="34" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        <line x1="6" y1="20" x2="34" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        <circle cx="20" cy="6" r="1.5" fill="var(--site-red)" />
      </svg>
      <span className="site00-idnty-control-icon__glyph">{children}</span>
    </span>
  );
}
