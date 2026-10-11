/** Builder studio line icons. Black hairline strokes, as in the approved references. */
import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 24, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const MenuIcon = (p: IconProps) => (
  <Icon {...p} viewBox="0 0 32 20">
    <path d="M2 6h28M8 14h22" />
  </Icon>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Icon {...p} viewBox="0 0 28 12">
    <path d="M1 6h25M21 1.5 26 6l-5 4.5" />
  </Icon>
);

export const ArrowLeftIcon = (p: IconProps) => (
  <Icon {...p} viewBox="0 0 28 12">
    <path d="M27 6H2M7 1.5 2 6l5 4.5" />
  </Icon>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Icon {...p} viewBox="0 0 12 24">
    <path d="M10 2 2 12l8 10" />
  </Icon>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Icon {...p} viewBox="0 0 12 24">
    <path d="m2 2 8 10-8 10" />
  </Icon>
);

export const ChevronSmallRightIcon = (p: IconProps) => (
  <Icon {...p} viewBox="0 0 8 12">
    <path d="m2 1.5 4 4.5-4 4.5" />
  </Icon>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Icon {...p} viewBox="0 0 12 8">
    <path d="m1.5 2 4.5 4 4.5-4" />
  </Icon>
);

export const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 7v10M7 12h10" />
  </Icon>
);

export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m6.5 12.5 3.5 3.5 7.5-8" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

/* Core included */
export const WebsiteIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5" y="3" width="14" height="18" rx="1.5" />
    <path d="M8 7h8M8 10.5h8M8 14h5" />
    <circle cx="12" cy="18.2" r="0.6" />
  </Icon>
);

export const MobileIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="7" y="2.5" width="10" height="19" rx="2" />
    <path d="M10.5 5h3" />
    <circle cx="12" cy="18.5" r="0.6" />
  </Icon>
);

export const SeoIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="m15 15 5 5" />
    <circle cx="10.5" cy="9" r="1.6" />
    <path d="M7.6 13.4c.8-1.4 1.8-2 2.9-2s2.1.6 2.9 2" />
  </Icon>
);

export const AnalyticsIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 4v16h15" />
    <path d="M9 16v-5M13 16V8M17 16v-3" />
  </Icon>
);

/* Pace */
export const StandardIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 2.8 19.5 7v10L12 21.2 4.5 17V7z" />
    <path d="M12 8.2v4.3l2.8 1.6" />
  </Icon>
);

export const ExpeditedIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 3 3 10.5l7 2.5 2.5 7z" />
    <path d="m10 13 4.5-4.5" />
  </Icon>
);

export const FlexibleIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 2.8 2.2 2.1 3-.4.6 3 2.6 1.6-1.3 2.9 1.3 2.9-2.6 1.6-.6 3-3-.4L12 21.2l-2.2-2.1-3 .4-.6-3-2.6-1.6 1.3-2.9-1.3-2.9 2.6-1.6.6-3 3 .4z" />
    <path d="m9.5 9.5 5 5M14.5 9.5l-5 5" />
  </Icon>
);

/* Blueprint */
export const BuildTypeIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="7.5" width="18" height="12" rx="1" />
    <path d="M9 7.5V5h6v2.5M3 12.5h18M7 15.5h1M10 15.5h1M13 15.5h1M16 15.5h1" />
  </Icon>
);

export const ClockIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5l3.2 2" />
  </Icon>
);

export const InvestmentIcon = (p: IconProps) => (
  <Icon {...p}>
    <ellipse cx="10" cy="6.5" rx="6" ry="2.5" />
    <path d="M4 6.5v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4M4 10.5v4c0 1.4 2.7 2.5 6 2.5" />
    <ellipse cx="15.5" cy="14.5" rx="4.5" ry="2" />
    <path d="M11 14.5v3c0 1.1 2 2 4.5 2s4.5-.9 4.5-2v-3" />
  </Icon>
);

export const SlidersIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h10M18 7h2M4 12h3M11 12h9M4 17h12M20 17h0" />
    <circle cx="16" cy="7" r="1.8" />
    <circle cx="9" cy="12" r="1.8" />
    <circle cx="18" cy="17" r="1.8" />
  </Icon>
);

export const CubeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9z" />
    <path d="M4 7.5 12 12l8-4.5M12 12v9" />
  </Icon>
);

export const FullscreenIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
  </Icon>
);

export const RecenterIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
    <path d="M4.5 4v4h4" />
  </Icon>
);
