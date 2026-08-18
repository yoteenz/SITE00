import { site00IconStrokeProps, type Site00LineIconProps } from './Site00IconFrame';

/** SITE 00 navigation arrow — thin shaft, angled head. */
export function Site00ArrowRightIcon({ size = 20, className }: Site00LineIconProps) {
  const s = site00IconStrokeProps();
  return (
    <svg
      className={className}
      width={size}
      height={Math.round(size * 0.55)}
      viewBox="0 0 48 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      data-site00-icon-viewbox="48 26"
      data-site00-icon-stroke={s.strokeWidth}
    >
      <path d="M6 13 H38 M38 13 L30 6 M38 13 L30 20" {...s} />
    </svg>
  );
}
