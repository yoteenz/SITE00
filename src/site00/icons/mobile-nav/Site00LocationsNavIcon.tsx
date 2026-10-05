import { Site00MobileNavIconFrame, site00MobileNavStrokeProps, type Site00MobileNavIconProps } from './Site00MobileNavIconFrame';
import { SITE00_MOBILE_NAV_ICON_ACCENT } from './site00MobileNavIconGeometry';

/** 03 — LOCATIONS (coordinate target / crosshair mark). */
export function Site00LocationsNavIcon({ size, className }: Site00MobileNavIconProps) {
  const s = site00MobileNavStrokeProps(1.35);
  const micro = site00MobileNavStrokeProps(1);

  return (
    <Site00MobileNavIconFrame size={size} className={className}>
      <g {...s}>
        <circle cx={32} cy={32} r={14} />
        <circle cx={32} cy={32} r={8.5} opacity={0.75} />
        <circle cx={32} cy={32} r={4.5} opacity={0.55} />
        <path d="M32 8 V18 M32 46 V56 M8 32 H18 M46 32 H56" />
        <path d="M32 10 V54 M10 32 H54" opacity={0.42} />
        <path d="M32 18 V26 M32 38 V46 M18 32 H26 M38 32 H46" opacity={0.42} />
        <path d="M21 21 L27 27 M37 37 L43 43 M43 21 L37 27 M27 37 L21 43" opacity={0.35} />
      </g>

      <g {...micro} stroke={SITE00_MOBILE_NAV_ICON_ACCENT} opacity={0.72}>
        <path d="M23 23 L27 27" />
        <path d="M37 37 L41 41" />
        <path d="M41 23 L37 27" />
        <path d="M27 37 L23 41" />
      </g>

      <circle cx={32} cy={32} r={1.7} fill={SITE00_MOBILE_NAV_ICON_ACCENT} />
    </Site00MobileNavIconFrame>
  );
}
