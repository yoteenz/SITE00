type IdentityTargetControlProps = {
  selected?: boolean;
  className?: string;
};

/** Technical crosshair target — selection indicator for calibration rows. */
export function IdentityTargetControl({ selected = false, className = '' }: IdentityTargetControlProps) {
  return (
    <span
      className={`site00-idnty-calibration-target ${selected ? 'site00-idnty-calibration-target--selected' : ''} ${className}`.trim()}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="site00-idnty-calibration-target__svg">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="12" cy="12" r="2.5" fill={selected ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="0.75" />
        <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="0.75" />
        <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="0.75" />
        <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="0.75" />
        <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="0.75" />
      </svg>
    </span>
  );
}
