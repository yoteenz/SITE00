import type { ReactNode, SVGProps } from 'react';
import {
  SITE00_MOBILE_NAV_ICON_DEFAULT_SIZE,
  SITE00_MOBILE_NAV_ICON_STROKE,
  SITE00_MOBILE_NAV_ICON_VIEWBOX,
} from './site00MobileNavIconGeometry';

export type Site00MobileNavIconProps = {
  size?: number;
  className?: string;
};

type Site00MobileNavIconFrameProps = Site00MobileNavIconProps & {
  children: ReactNode;
};

export function site00MobileNavStrokeProps(
  strokeWidth: number = SITE00_MOBILE_NAV_ICON_STROKE,
): Pick<SVGProps<SVGPathElement>, 'stroke' | 'strokeWidth' | 'strokeLinecap' | 'strokeLinejoin' | 'vectorEffect'> {
  return {
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    vectorEffect: 'non-scaling-stroke',
  };
}

/** Shared 64×64 shell — currentColor linework controlled by nav active state. */
export function Site00MobileNavIconFrame({
  size = SITE00_MOBILE_NAV_ICON_DEFAULT_SIZE,
  className = '',
  children,
}: Site00MobileNavIconFrameProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${SITE00_MOBILE_NAV_ICON_VIEWBOX} ${SITE00_MOBILE_NAV_ICON_VIEWBOX}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
