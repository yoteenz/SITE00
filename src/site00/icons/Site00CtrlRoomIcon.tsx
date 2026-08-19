import { Site00IconFrame, Site00IconNode, site00IconStrokeProps, type Site00LineIconProps } from './Site00IconFrame';

/** Operational console mark — CTRL ROOM. */
export function Site00CtrlRoomIcon({ size, className }: Site00LineIconProps) {
  const s = site00IconStrokeProps();
  return (
    <Site00IconFrame size={size} className={className}>
      <rect x={11} y={13} width={26} height={17} rx={1.5} {...s} />
      <path d="M18 36 V39 M30 36 V39" {...s} />
      <path d="M16 20 H32 M16 24 H28" {...s} opacity={0.7} />
      <Site00IconNode cx={18} cy={36} />
      <Site00IconNode cx={30} cy={36} />
    </Site00IconFrame>
  );
}
