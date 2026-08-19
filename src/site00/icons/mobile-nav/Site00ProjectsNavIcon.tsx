import { Site00MobileNavIconFrame, site00MobileNavStrokeProps, type Site00MobileNavIconProps } from './Site00MobileNavIconFrame';
import { SITE00_MOBILE_NAV_ICON_ACCENT } from './site00MobileNavIconGeometry';

/** 04 — PROJECTS (stacked isometric planes in hex frame). */
export function Site00ProjectsNavIcon({ size, className }: Site00MobileNavIconProps) {
  const s = site00MobileNavStrokeProps(1.35);

  return (
    <Site00MobileNavIconFrame size={size} className={className}>
      <g {...s}>
        <path d="M32 9 L52.8 21 V43 L32 55 L11.2 43 V21 Z" opacity={0.75} />
        <path d="M32 9 L52.8 21 M32 9 L11.2 21 M52.8 21 V43 M11.2 21 V43 M32 55 L52.8 43 M32 55 L11.2 43" opacity={0.42} />
        <path d="M32 9 V55 M11.2 21 L52.8 43 M52.8 21 L11.2 43" opacity={0.35} />
        <path d="M18 30 L32 22 L46 30 L32 38 Z" />
        <path d="M20 34 L32 27 L44 34 L32 41 Z" opacity={0.85} />
        <path d="M22 38 L32 32 L42 38 L32 44 Z" opacity={0.7} />
      </g>

      <g fill="none" stroke="currentColor" strokeWidth={1.2} vectorEffect="non-scaling-stroke" opacity={0.55}>
        <circle cx={32} cy={9} r={1.4} />
        <circle cx={52.8} cy={21} r={1.4} />
        <circle cx={52.8} cy={43} r={1.4} />
        <circle cx={32} cy={55} r={1.4} />
        <circle cx={11.2} cy={43} r={1.4} />
        <circle cx={11.2} cy={21} r={1.4} />
      </g>

      <circle cx={32} cy={34} r={1.7} fill={SITE00_MOBILE_NAV_ICON_ACCENT} />
    </Site00MobileNavIconFrame>
  );
}
