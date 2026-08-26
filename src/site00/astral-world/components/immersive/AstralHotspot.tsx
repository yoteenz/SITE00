import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type AstralHotspotProps = {
  to: string;
  label: string;
  className?: string;
  children?: ReactNode;
};

export function AstralHotspot({ to, label, className = '', children }: AstralHotspotProps) {
  return (
    <Link to={to} className={`aw-hotspot ${className}`.trim()} aria-label={label}>
      {children ?? <span className="aw-hotspot__label">{label}</span>}
    </Link>
  );
}
