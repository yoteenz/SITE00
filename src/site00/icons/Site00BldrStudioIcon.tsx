import { Site00IconFrame, Site00IconNode, site00IconStrokeProps, type Site00LineIconProps } from './Site00IconFrame';

/** Technical isometric build module — BLDR STUDIO. */
export function Site00BldrStudioIcon({ size, className }: Site00LineIconProps) {
  const s = site00IconStrokeProps();
  return (
    <Site00IconFrame size={size} className={className}>
      <path
        d="M24 9 L37 17 L37 31 L24 39 L11 31 L11 17 Z"
        {...s}
      />
      <path d="M24 9 L24 24 M37 17 L24 24 M11 17 L24 24" {...s} />
      <path
        d="M24 24 L37 31 M24 24 L24 39 M24 24 L11 31"
        {...s}
        strokeDasharray="3 2.5"
        opacity={0.55}
      />
      <Site00IconNode cx={24} cy={9} />
      <Site00IconNode cx={37} cy={17} />
      <Site00IconNode cx={11} cy={17} />
      <Site00IconNode cx={24} cy={24} />
    </Site00IconFrame>
  );
}
