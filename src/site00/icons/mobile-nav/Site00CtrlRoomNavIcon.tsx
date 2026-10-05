import { Site00MobileNavIconFrame, site00MobileNavStrokeProps, type Site00MobileNavIconProps } from './Site00MobileNavIconFrame';
import { SITE00_MOBILE_NAV_ICON_ACCENT } from './site00MobileNavIconGeometry';

/** 05 — CTRL ROOM (concentric hex chamber mark). */
export function Site00CtrlRoomNavIcon({ size, className }: Site00MobileNavIconProps) {
  const s = site00MobileNavStrokeProps(1.35);

  return (
    <Site00MobileNavIconFrame size={size} className={className}>
      <g {...s}>
        <path d="M32 10 L51 20 V44 L32 54 L13 44 V20 Z" opacity={0.75} />
        <path d="M32 16 L45 24 V40 L32 48 L19 40 V24 Z" />
        <path d="M32 22 L39 27 V37 L32 42 L25 37 V27 Z" opacity={0.85} />
        <path d="M32 10 V54 M13 20 L51 44 M51 20 L13 44" opacity={0.35} />
        <path d="M32 16 L51 20 M32 16 L13 20 M51 20 V44 M13 20 V44 M32 48 L51 44 M32 48 L13 44" opacity={0.42} />
      </g>

      <g fill="none" stroke="currentColor" strokeWidth={1.2} vectorEffect="non-scaling-stroke" opacity={0.55}>
        <circle cx={32} cy={10} r={1.4} />
        <circle cx={51} cy={20} r={1.4} />
        <circle cx={51} cy={44} r={1.4} />
        <circle cx={32} cy={54} r={1.4} />
        <circle cx={13} cy={44} r={1.4} />
        <circle cx={13} cy={20} r={1.4} />
      </g>

      <circle cx={32} cy={32} r={1.7} fill={SITE00_MOBILE_NAV_ICON_ACCENT} />
    </Site00MobileNavIconFrame>
  );
}
