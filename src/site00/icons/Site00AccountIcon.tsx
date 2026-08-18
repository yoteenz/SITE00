import { Site00IconFrame, Site00IconNode, site00IconStrokeProps, type Site00LineIconProps } from './Site00IconFrame';

/** Technical identity marker — ACCOUNT. */
export function Site00AccountIcon({ size, className }: Site00LineIconProps) {
  const s = site00IconStrokeProps();
  return (
    <Site00IconFrame size={size} className={className}>
      <circle cx={24} cy={24} r={13} {...s} />
      <circle cx={24} cy={19} r={3.75} {...s} />
      <path d="M16.5 30.5 Q24 36.5 31.5 30.5" {...s} />
      <path d="M24 11 V37 M11 24 H37" {...s} strokeDasharray="2.5 2.5" opacity={0.45} />
      <Site00IconNode cx={24} cy={11} />
      <Site00IconNode cx={37} cy={24} />
      <Site00IconNode cx={24} cy={37} />
      <Site00IconNode cx={11} cy={24} />
      <Site00IconNode cx={24} cy={19} />
    </Site00IconFrame>
  );
}
