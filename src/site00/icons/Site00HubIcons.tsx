import type { Site00LineIconProps } from './Site00IconFrame';

const STROKE = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function Site00LockIcon({ size = 20, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect {...STROKE} x="5" y="11" width="14" height="10" rx="1" />
      <path {...STROKE} d="M8 11V8a4 4 0 118 0v3" />
    </svg>
  );
}

export function Site00UserIcon({ size = 20, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle {...STROKE} cx="12" cy="8" r="3" />
      <path {...STROKE} d="M5 20c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" />
    </svg>
  );
}

export function Site00KeyIcon({ size = 20, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle {...STROKE} cx="8" cy="8" r="3" />
      <path {...STROKE} d="M11 8h10M16 8v3M19 8v2" />
    </svg>
  );
}

export function Site00MonitorIcon({ size = 20, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect {...STROKE} x="3" y="5" width="18" height="12" rx="1" />
      <path {...STROKE} d="M8 21h8M12 17v4" />
    </svg>
  );
}

export function Site00BellIcon({ size = 20, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...STROKE} d="M12 4a5 5 0 00-5 5v3l-2 2h14l-2-2V9a5 5 0 00-5-5z" />
      <path {...STROKE} d="M10 20a2 2 0 004 0" />
    </svg>
  );
}

export function Site00ShieldIcon({ size = 20, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...STROKE} d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
    </svg>
  );
}

export function Site00TokenIcon({ size = 20, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle {...STROKE} cx="12" cy="12" r="8" />
      <path {...STROKE} d="M12 8v4l3 2" />
    </svg>
  );
}

export function Site00TrashIcon({ size = 20, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...STROKE} d="M4 7h16M9 7V5h6v2M7 7l1 12h8l1-12" />
    </svg>
  );
}

export function Site00CubeIcon({ size = 20, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...STROKE} d="M4 8l8-4 8 4v8l-8 4-8-4V8zM12 4v16M4 8l8 4 8-4" />
    </svg>
  );
}

export function Site00LayersIcon({ size = 20, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...STROKE} d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 18l9 5 9-5" />
    </svg>
  );
}

export function Site00DeployIcon({ size = 20, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...STROKE} d="M12 3v12M8 11l4 4 4-4M5 21h14" />
    </svg>
  );
}

export function Site00GlobeIcon({ size = 20, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle {...STROKE} cx="12" cy="12" r="9" />
      <path {...STROKE} d="M3 12h18M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9" />
    </svg>
  );
}
