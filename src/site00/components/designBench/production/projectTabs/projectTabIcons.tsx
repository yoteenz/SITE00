/**
 * P0.VR.DESIGN.OPUS-PROJECT-TABS1 — line marks for the project tab surfaces.
 *
 * Drawn at a 16-unit box with a 1.3 stroke so they sit at the same optical
 * weight as the workspace chrome icons. Nothing here is decorative: every mark
 * labels a destination or an action the founder can take.
 */

type IconProps = { className?: string };

function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const PsIconHome = ({ className }: IconProps) => (
  <Frame className={className}>
    <path d="M2.5 7 8 2.5 13.5 7v6.5h-11z" />
  </Frame>
);

export const PsIconGrid = ({ className }: IconProps) => (
  <Frame className={className}>
    <rect x="2.5" y="2.5" width="4.5" height="4.5" />
    <rect x="9" y="2.5" width="4.5" height="4.5" />
    <rect x="2.5" y="9" width="4.5" height="4.5" />
    <rect x="9" y="9" width="4.5" height="4.5" />
  </Frame>
);

export const PsIconDoc = ({ className }: IconProps) => (
  <Frame className={className}>
    <path d="M4 2.5h5L12 5.5v8H4z" />
    <path d="M9 2.5v3h3" />
  </Frame>
);

export const PsIconImage = ({ className }: IconProps) => (
  <Frame className={className}>
    <rect x="2.5" y="3.5" width="11" height="9" />
    <path d="m2.5 10 3-2.5 3 2.5 2-1.5 3 2" />
  </Frame>
);

export const PsIconLink = ({ className }: IconProps) => (
  <Frame className={className}>
    <path d="M6.5 9.5 9.5 6.5" />
    <path d="M7 4.5 8.5 3a2.8 2.8 0 0 1 4 4L11 8.5" />
    <path d="M9 11.5 7.5 13a2.8 2.8 0 0 1-4-4L5 7.5" />
  </Frame>
);

export const PsIconLayers = ({ className }: IconProps) => (
  <Frame className={className}>
    <path d="m8 2.5 5.5 3L8 8.5 2.5 5.5z" />
    <path d="m2.5 9 5.5 3 5.5-3" />
  </Frame>
);

export const PsIconPalette = ({ className }: IconProps) => (
  <Frame className={className}>
    <rect x="2.5" y="2.5" width="11" height="11" />
    <path d="M6 2.5v11M9.5 2.5v11" />
  </Frame>
);

export const PsIconClock = ({ className }: IconProps) => (
  <Frame className={className}>
    <circle cx="8" cy="8" r="5.5" />
    <path d="M8 4.5V8l2.5 1.5" />
  </Frame>
);

export const PsIconDots = ({ className }: IconProps) => (
  <Frame className={className}>
    <circle cx="3.5" cy="8" r="1" />
    <circle cx="8" cy="8" r="1" />
    <circle cx="12.5" cy="8" r="1" />
  </Frame>
);

export const PsIconUpload = ({ className }: IconProps) => (
  <Frame className={className}>
    <path d="M8 11V3.5M5 6.5 8 3.5l3 3" />
    <path d="M2.5 11v2.5h11V11" />
  </Frame>
);

export const PsIconSearch = ({ className }: IconProps) => (
  <Frame className={className}>
    <circle cx="7" cy="7" r="4.5" />
    <path d="m10.5 10.5 3 3" />
  </Frame>
);

export const PsIconCompare = ({ className }: IconProps) => (
  <Frame className={className}>
    <rect x="2.5" y="4" width="6" height="8" />
    <rect x="7.5" y="2.5" width="6" height="8" />
  </Frame>
);

export const PsIconChart = ({ className }: IconProps) => (
  <Frame className={className}>
    <path d="M3 13.5V7M6.5 13.5V3.5M10 13.5V9M13.5 13.5V5.5" />
  </Frame>
);

export const PsIconPlus = ({ className }: IconProps) => (
  <Frame className={className}>
    <path d="M8 3v10M3 8h10" />
  </Frame>
);

export const PsIconCheck = ({ className }: IconProps) => (
  <Frame className={className}>
    <path d="m3.5 8.5 3 3 6-7" />
  </Frame>
);

export const PsIconFilter = ({ className }: IconProps) => (
  <Frame className={className}>
    <path d="M2.5 4h11M4.5 8h7M6.5 12h3" />
  </Frame>
);

export const PsIconBox = ({ className }: IconProps) => (
  <Frame className={className}>
    <path d="m8 2.5 5.5 2.8v5.4L8 13.5 2.5 10.7V5.3z" />
  </Frame>
);

export const PsIconBell = ({ className }: IconProps) => (
  <Frame className={className}>
    <path d="M4.5 11V7a3.5 3.5 0 0 1 7 0v4" />
    <path d="M3 11h10M7 13h2" />
  </Frame>
);

export const PsIconSliders = ({ className }: IconProps) => (
  <Frame className={className}>
    <path d="M2.5 5h11M2.5 11h11" />
    <circle cx="6" cy="5" r="1.4" />
    <circle cx="10.5" cy="11" r="1.4" />
  </Frame>
);

export const PsIconMonitor = ({ className }: IconProps) => (
  <Frame className={className}>
    <rect x="2.5" y="3" width="11" height="7.5" />
    <path d="M6 13.5h4" />
  </Frame>
);

export const PsIconExit = ({ className }: IconProps) => (
  <Frame className={className}>
    <path d="M9.5 3H3v10h6.5" />
    <path d="M7 8h6.5M11 5.5 13.5 8 11 10.5" />
  </Frame>
);

export const PsIconUser = ({ className }: IconProps) => (
  <Frame className={className}>
    <circle cx="8" cy="6" r="2.6" />
    <path d="M3.5 13.5c.6-2.4 2.3-3.6 4.5-3.6s3.9 1.2 4.5 3.6" />
  </Frame>
);

export const PsIconShield = ({ className }: IconProps) => (
  <Frame className={className}>
    <path d="M8 2.5 13 4.3v4c0 2.8-2.1 4.6-5 5.2-2.9-.6-5-2.4-5-5.2v-4z" />
  </Frame>
);

export const PsIconArchive = ({ className }: IconProps) => (
  <Frame className={className}>
    <rect x="2.5" y="3" width="11" height="3" />
    <path d="M3.5 6v7.5h9V6M6.5 9h3" />
  </Frame>
);
