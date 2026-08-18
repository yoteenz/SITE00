import { Site00IconFrame, Site00IconNode, site00IconStrokeProps, type Site00LineIconProps } from './Site00IconFrame';

/** System support ring — SUPPORT. */
export function Site00SupportIcon({ size, className }: Site00LineIconProps) {
  const s = site00IconStrokeProps();
  return (
    <Site00IconFrame size={size} className={className}>
      <circle cx={24} cy={24} r={15} {...s} />
      <circle cx={24} cy={24} r={7.5} {...s} />
      <path d="M22.5 9 V15 M25.5 9 V15" {...s} />
      <path d="M22.5 33 V39 M25.5 33 V39" {...s} />
      <path d="M9 22.5 H15 M9 25.5 H15" {...s} />
      <path d="M33 22.5 H39 M33 25.5 H39" {...s} />
      <Site00IconNode cx={24} cy={9} />
      <Site00IconNode cx={39} cy={24} />
      <Site00IconNode cx={24} cy={39} />
      <Site00IconNode cx={9} cy={24} />
    </Site00IconFrame>
  );
}
