import { Site00IconFrame, site00IconStrokeProps, type Site00LineIconProps } from './Site00IconFrame';

/** Identity geometric mark — IDNTY navigation / header language. */
export function Site00IdntyIcon({ size, className }: Site00LineIconProps) {
  const s = site00IconStrokeProps();
  return (
    <Site00IconFrame size={size} className={className}>
      <path d="M14 14 H34 V34 H14 V14 Z" {...s} />
      <path d="M14 24 H34 M24 14 V34" {...s} opacity={0.75} />
      <path d="M18 18 L30 30 M30 18 L18 30" {...s} opacity={0.45} />
    </Site00IconFrame>
  );
}
