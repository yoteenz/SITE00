import { Site00IconFrame, Site00IconNode, site00IconStrokeProps, type Site00LineIconProps } from './Site00IconFrame';

/** Technical crosshair / coordinate marker. */
export function Site00CrosshairIcon({ size, className }: Site00LineIconProps) {
  const s = site00IconStrokeProps();
  return (
    <Site00IconFrame size={size} className={className}>
      <circle cx={24} cy={24} r={11} {...s} />
      <path d="M24 10 V18 M24 30 V38 M10 24 H18 M30 24 H38" {...s} />
      <Site00IconNode cx={24} cy={24} />
    </Site00IconFrame>
  );
}
