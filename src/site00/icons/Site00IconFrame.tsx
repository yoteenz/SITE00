import type { ReactNode } from 'react';
import { SITE00_ICON_STROKE, SITE00_ICON_VIEWBOX } from './site00IconGeometry';

export type Site00LineIconProps = {
  size?: number;
  className?: string;
};

type Site00IconFrameProps = Site00LineIconProps & {
  children: ReactNode;
};

/** Normalized SVG shell — viewBox, stroke family, currentColor. */
export function Site00IconFrame({ size = 28, className = '', children }: Site00IconFrameProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${SITE00_ICON_VIEWBOX} ${SITE00_ICON_VIEWBOX}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      data-site00-icon-viewbox={SITE00_ICON_VIEWBOX}
      data-site00-icon-stroke={SITE00_ICON_STROKE}
    >
      {children}
    </svg>
  );
}

export function site00IconStrokeProps() {
  return {
    stroke: 'currentColor' as const,
    strokeWidth: SITE00_ICON_STROKE,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

export function Site00IconNode({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={1.25} fill="currentColor" stroke="none" />;
}
