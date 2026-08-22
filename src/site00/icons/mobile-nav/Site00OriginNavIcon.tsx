import { Site00MobileNavIconFrame, site00MobileNavStrokeProps, type Site00MobileNavIconProps } from './Site00MobileNavIconFrame';
import { SITE00_MOBILE_NAV_ICON_ACCENT } from './site00MobileNavIconGeometry';

/** 01 — 00 ORIGIN (approved geometric portal mark). SVG geometry supplied verbatim. */
export function Site00OriginNavIcon({ size, className }: Site00MobileNavIconProps) {
  const s = site00MobileNavStrokeProps(1.35);
  const micro = site00MobileNavStrokeProps(1);

  return (
    <Site00MobileNavIconFrame size={size} className={className}>
      <g {...s}>
        <path d="M7 17L11 13H23L27 17V47L23 51H11L7 47V17Z" />
        <path d="M10 20L13 17H21L24 20V44L21 47H13L10 44V20Z" />
        <path d="M37 17L41 13H53L57 17V47L53 51H41L37 47V17Z" />
        <path d="M40 20L43 17H51L54 20V44L51 47H43L40 44V20Z" />
        <path d="M7 22H27M7 42H27M37 22H57M37 42H57" opacity={0.42} />
        <path d="M17 10V54M47 10V54" opacity={0.42} />
        <path d="M4 17H7M27 17H30M34 17H37M57 17H60" opacity={0.42} />
        <path d="M4 47H7M27 47H30M34 47H37M57 47H60" opacity={0.42} />
        <path d="M27 32H37" opacity={0.55} />
      </g>

      <g fill={SITE00_MOBILE_NAV_ICON_ACCENT}>
        <circle cx={17} cy={13} r={1.25} />
        <circle cx={17} cy={32} r={1.25} />
        <circle cx={17} cy={51} r={1.25} />
        <circle cx={47} cy={13} r={1.25} />
        <circle cx={47} cy={32} r={1.25} />
        <circle cx={47} cy={51} r={1.25} />
        <circle cx={32} cy={32} r={1.7} />
      </g>

      <g {...micro} stroke={SITE00_MOBILE_NAV_ICON_ACCENT} opacity={0.72}>
        <path d="M15 9H19" />
        <path d="M45 9H49" />
        <path d="M3 30V34" />
        <path d="M61 30V34" />
      </g>
    </Site00MobileNavIconFrame>
  );
}
