import { Site00IconFrame, Site00IconNode, site00IconStrokeProps, type Site00LineIconProps } from './Site00IconFrame';

/** Architectural project folder — PROJECTS. */
export function Site00ProjectsIcon({ size, className }: Site00LineIconProps) {
  const s = site00IconStrokeProps();
  return (
    <Site00IconFrame size={size} className={className}>
      <path d="M12 20 V38 H36 V27 H28 L24 19 H12 V20 Z" {...s} />
      <path d="M12 20 H24 L28 27 H36" {...s} />
      <path d="M12 26 H36" {...s} opacity={0.7} />
      <Site00IconNode cx={12} cy={38} />
      <Site00IconNode cx={36} cy={38} />
      <Site00IconNode cx={12} cy={20} />
      <Site00IconNode cx={24} cy={19} />
      <circle cx={37} cy={12} r={5.5} {...s} />
      <path d="M37 8.5 V15.5 M33.5 12 H40.5" {...s} />
      <Site00IconNode cx={37} cy={12} />
    </Site00IconFrame>
  );
}
