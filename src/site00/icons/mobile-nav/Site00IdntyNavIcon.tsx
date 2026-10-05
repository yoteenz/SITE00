import { Site00MobileNavIconFrame, site00MobileNavStrokeProps, type Site00MobileNavIconProps } from './Site00MobileNavIconFrame';
import { SITE00_MOBILE_NAV_ICON_ACCENT } from './site00MobileNavIconGeometry';

/** 02 — IDNTY (diamond identity mark with construction guides). */
export function Site00IdntyNavIcon({ size, className }: Site00MobileNavIconProps) {
  const s = site00MobileNavStrokeProps(1.35);

  return (
    <Site00MobileNavIconFrame size={size} className={className}>
      <g {...s}>
        <path d="M32 10 L54 32 L32 54 L10 32 Z" />
        <path d="M32 16 L48 32 L32 48 L16 32 Z" />
        <path d="M32 22 L42 32 L32 42 L22 32 Z" />
        <path d="M32 10 V54 M10 32 H54" opacity={0.42} />
        <path d="M10 10 L54 54 M54 10 L10 54" opacity={0.35} />
      </g>

      <g fill="none" stroke="currentColor" strokeWidth={1.2} vectorEffect="non-scaling-stroke" opacity={0.55}>
        <circle cx={32} cy={10} r={1.6} />
        <circle cx={54} cy={32} r={1.6} />
        <circle cx={32} cy={54} r={1.6} />
        <circle cx={10} cy={32} r={1.6} />
      </g>

      <circle cx={32} cy={32} r={1.7} fill={SITE00_MOBILE_NAV_ICON_ACCENT} />
    </Site00MobileNavIconFrame>
  );
}
