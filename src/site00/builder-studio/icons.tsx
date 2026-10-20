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

/* Blueprint tabs — capability, page and timing glyphs (same hairline grammar). */
export const DocumentIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4M9 11h6M9 14h6M9 17h4" />
  </Icon>
);

export const BagIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5.5 8h13l-1 13h-11z" />
    <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
  </Icon>
);

export const CardIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
    <path d="M3 9.5h18M7 14.5h4" />
  </Icon>
);

export const PersonIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20.5c.9-3.9 3.8-6 7.5-6s6.6 2.1 7.5 6" />
  </Icon>
);

export const PeopleIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="9" cy="8.5" r="3" />
    <path d="M3 19.5c.7-3.2 3-5 6-5s5.3 1.8 6 5" />
    <circle cx="16.5" cy="9" r="2.4" />
    <path d="M16 14.6c2.6.1 4.4 1.7 5 4.4" />
  </Icon>
);

export const FolderIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6.5h6l2 2.2h10V19H3z" />
  </Icon>
);

export const BarsIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="12" width="4" height="8" />
    <rect x="10" y="8" width="4" height="12" />
    <rect x="16" y="4" width="4" height="16" />
  </Icon>
);

export const CalendarIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4M8 13.5h2M12 13.5h2M16 13.5h1M8 16.5h2" />
  </Icon>
);

export const BadgeIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="9.5" r="5.5" />
    <path d="m9 14.3-1.5 6.2L12 18l4.5 2.5-1.5-6.2" />
  </Icon>
);

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="m15 15 5 5" />
  </Icon>
);

export const BellIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" />
    <path d="M10 20.5a2 2 0 0 0 4 0" />
  </Icon>
);

export const MailIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="1" />
    <path d="m3.5 6.5 8.5 7 8.5-7" />
  </Icon>
);

export const GlobeIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.2 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.2-3.5-8.5s1.1-6.1 3.5-8.5z" />
  </Icon>
);

export const LinkIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2" />
  </Icon>
);

export const BoltIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6z" />
  </Icon>
);

export const UploadIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4 15v5h16v-5" />
  </Icon>
);

export const DatabaseIcon = (p: IconProps) => (
  <Icon {...p}>
    <ellipse cx="12" cy="6" rx="7" ry="2.8" />
    <path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8" />
  </Icon>
);

export const SparkIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z" />
    <path d="M18.5 16v4M16.5 18h4" />
  </Icon>
);

export const StoreIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 9.5 5.5 4h13L20 9.5M4 9.5h16v1a2.7 2.7 0 0 1-5.3 0 2.7 2.7 0 0 1-5.4 0 2.7 2.7 0 0 1-5.3 0zM5.5 12.5V20h13v-7.5M10 20v-4.5h4V20" />
  </Icon>
);

export const GridIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" />
  </Icon>
);

export const LockIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5" />
  </Icon>
);

export const LayersIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 4 9 4.5-9 4.5-9-4.5z" />
    <path d="m3 12.5 9 4.5 9-4.5M3 16.5l9 4.5 9-4.5" />
  </Icon>
);

export const ImageIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
    <circle cx="9" cy="9.5" r="1.8" />
    <path d="m4 17.5 5.5-5 4 3.5 2.5-2 4 3.5" />
  </Icon>
);

export const ArrowsIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 8h14M14.5 4.5 18 8l-3.5 3.5M20 16H6M9.5 12.5 6 16l3.5 3.5" />
  </Icon>
);
