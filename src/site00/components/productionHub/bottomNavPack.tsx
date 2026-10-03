/**
 * Production bottom nav — founder icon pack (stacked plates, envelope, play, cube, books, pulse).
 * Line work follows currentColor. Red dots stay SITE00 red in every state.
 */
import { useId, type SVGProps } from 'react';

const svg: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 32 32',
  className: 'bnav-ico',
  'aria-hidden': true,
  fill: 'none',
};

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.45,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
};

function StackOutlines() {
  return (
    <>
      <path {...stroke} d="M16 11.15 26.4 16.85 16 22.55 5.6 16.85Z" />
      <path {...stroke} d="M16 16.55 26.4 22.25 16 27.95 5.6 22.25Z" />
    </>
  );
}

export function BottomNavHubIcon() {
  const id = useId().replace(/:/g, '');
  return (
    <svg {...svg}>
      <mask id={id}>
        <path fill="#fff" d="M16 3.35 26.4 9.05 16 14.75 5.6 9.05Z" />
        <path stroke="#000" strokeWidth="1.15" d="M8.1 8.15h15.8M8.1 10.05h15.8" />
      </mask>
      <path fill="currentColor" d="M16 3.35 26.4 9.05 16 14.75 5.6 9.05Z" mask={`url(#${id})`} />
      <StackOutlines />
    </svg>
  );
}

export function BottomNavInboxIcon() {
  return (
    <svg {...svg}>
      <path {...stroke} d="M7.2 11.2h17.6v11.4H7.2Z" />
      <path {...stroke} d="M7.4 11.6 16 17.7l8.6-6.1" />
      <circle className="bnav-dot" cx="24.6" cy="8.2" r="2.15" />
    </svg>
  );
}

export function BottomNavDesignIcon() {
  return (
    <svg {...svg}>
      <path {...stroke} d="M16 4.2 26.4 9.9 16 15.6 5.6 9.9Z" />
      <StackOutlines />
    </svg>
  );
}

export function BottomNavExperienceIcon() {
  return (
    <svg {...svg}>
      <circle {...stroke} cx="16" cy="16" r="9.2" />
      <path {...stroke} d="M13.6 11.7v8.6l7.1-4.3Z" />
    </svg>
  );
}

export function BottomNavExpressionIcon() {
  return (
    <svg {...svg}>
      <path {...stroke} d="M16 5.2 25.6 10.6v10.8L16 26.8 6.4 21.4V10.6Z" />
      <path {...stroke} d="M16 5.2v10.4M6.4 10.6 16 15.6l9.6-5M16 15.6v11.2" />
      <path {...stroke} d="M16 17.4v4.6M14.3 19.5 16 21.6l1.7-2.1" />
    </svg>
  );
}

export function BottomNavLibraryIcon() {
  return (
    <svg {...svg}>
      <path {...stroke} d="M7.4 12.4h4.3v12.2H7.4Z" />
      <path {...stroke} d="M13.85 7.6h4.3v17H13.85Z" />
      <path {...stroke} d="M20.3 11.1h4.3v13.5h-4.3Z" />
    </svg>
  );
}

export function BottomNavActivityIcon() {
  return (
    <svg {...svg}>
      <path {...stroke} d="M3.2 18.2H8.4l2.2.1 2.5-8.4 3.6 14.2 3.1-8.6 2.2 2.7H28.8" />
      <circle className="bnav-dot" cx="26.7" cy="11.4" r="2.15" />
    </svg>
  );
}

const ICONS = {
  hub: BottomNavHubIcon,
  inbox: BottomNavInboxIcon,
  design: BottomNavDesignIcon,
  experience: BottomNavExperienceIcon,
  expression: BottomNavExpressionIcon,
  library: BottomNavLibraryIcon,
  activity: BottomNavActivityIcon,
} as const;

export function BottomNavPackIcon({ id }: { id: keyof typeof ICONS }) {
  const Icon = ICONS[id];
  return <Icon />;
}
