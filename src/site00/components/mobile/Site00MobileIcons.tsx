import { site00IconStrokeProps, type Site00LineIconProps } from '../../icons/Site00IconFrame';

export function Site00HamburgerIcon({ size = 20, className }: Site00LineIconProps) {
  const s = { ...site00IconStrokeProps(), strokeWidth: 1.5 };
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 5 H17 M3 10 H17 M3 15 H17" {...s} />
    </svg>
  );
}

export function Site00DirectoryArrowIcon({ size = 18, className }: Site00LineIconProps) {
  const s = { ...site00IconStrokeProps(), strokeWidth: 1.25 };
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 18 14"
      fill="none"
      aria-hidden="true"
    >
      <path d="M0 7 H14 M14 7 L9 2 M14 7 L9 12" {...s} />
    </svg>
  );
}

/** Bottom nav — active LOCATIONS target mark. */
export function Site00LocationsTargetIcon({ size = 22, className, active = false }: Site00LineIconProps & { active?: boolean }) {
  const s = { ...site00IconStrokeProps(), strokeWidth: 1.25, stroke: active ? 'var(--site-red)' : 'currentColor' };
  const fill = active ? 'var(--site-red)' : 'currentColor';
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <circle cx={11} cy={11} r={7.5} {...s} />
      <path d="M11 2 V6 M11 16 V20 M2 11 H6 M16 11 H20" {...s} />
      <circle cx={11} cy={11} r={1.75} fill={fill} stroke="none" />
    </svg>
  );
}

export function Site00DirectorySpineNodeIcon({ size = 10, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" className={className} aria-hidden="true">
      <circle cx={5} cy={5} r={4} fill="var(--site-red)" />
    </svg>
  );
}

/** Build direction card — circular white action with right arrow. */
export function Site00BuildDirectionArrowIcon({ size = 16, className }: Site00LineIconProps) {
  const s = { ...site00IconStrokeProps(), strokeWidth: 1.35 };
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 8 H11 M11 8 L8 5 M11 8 L8 11" {...s} />
    </svg>
  );
}

export function Site00LockIcon({ size = 12, className }: Site00LineIconProps) {
  const s = { ...site00IconStrokeProps(), strokeWidth: 1.25, stroke: 'var(--site-red)' };
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x={2.5} y={5} width={7} height={5.5} rx={1} {...s} />
      <path d="M4 5 V3.75 C4 2.23 5.12 1 6.5 1 C7.88 1 9 2.23 9 3.75 V5" {...s} />
    </svg>
  );
}

/** Decorative vertical interchange marker between SITE and WORLD cards. */
export function Site00DirectionInterchangeIcon({ size = 14, className }: Site00LineIconProps) {
  const s = { ...site00IconStrokeProps(), strokeWidth: 1.25 };
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2 V12 M7 2 L4.5 4.5 M7 2 L9.5 4.5 M7 12 L4.5 9.5 M7 12 L9.5 9.5" {...s} />
    </svg>
  );
}
