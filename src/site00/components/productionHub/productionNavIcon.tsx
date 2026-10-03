/**
 * Production bottom-nav glyph system — P0.STUDIOOS.PRODUCTION.BOTTOM-NAV.ICON-SYSTEM.GROK1
 * Visual authority: founder BOTTOM BAR ICON SYSTEM sheet.
 * Inactive ink is black. SITE00 red is an active accent only. Notification dots stay outside the glyph.
 */
import type { SVGProps } from 'react';

export type ProductionNavGlyph =
  | 'hub'
  | 'inbox'
  | 'design'
  | 'experience'
  | 'expression'
  | 'library'
  | 'activity';

const INK = '#141414';
const MUTE = '#8d8d93';
const RED = '#eb1c24';

const frame: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 32 32',
  fill: 'none',
  'aria-hidden': true,
};

const line = {
  stroke: INK,
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function ProductionNavIcon({
  variant,
  active = false,
  size = 26,
  className,
  ariaHidden = true,
}: {
  variant: ProductionNavGlyph;
  active?: boolean;
  size?: number;
  className?: string;
  ariaHidden?: boolean;
}) {
  const accent = active ? RED : INK;
  const props: SVGProps<SVGSVGElement> = {
    ...frame,
    width: size,
    height: size,
    className: `bnav-ico${className ? ` ${className}` : ''}`,
    'aria-hidden': ariaHidden,
    'data-nav-glyph': variant,
    'data-nav-state': active ? 'active' : 'inactive',
  };
  switch (variant) {
    case 'hub':
      return <Hub {...props} accent={accent} active={active} />;
    case 'inbox':
      return <Inbox {...props} />;
    case 'design':
      return <Design {...props} accent={accent} active={active} />;
    case 'experience':
      return <Experience {...props} accent={accent} active={active} />;
    case 'expression':
      return <Expression {...props} accent={accent} active={active} />;
    case 'library':
      return <Library {...props} accent={accent} active={active} />;
    case 'activity':
      return <Activity {...props} accent={accent} active={active} />;
  }
}

type GlyphProps = SVGProps<SVGSVGElement> & { accent: string; active: boolean };

function Hub({ accent, active, ...svg }: GlyphProps) {
  return (
    <svg {...svg} data-nav-concept="pavilion">
      <path {...line} d="M4.2 16.5h23.6" />
      <path {...line} d="M5.4 16.3 16 6.4l10.6 9.9" />
      <path {...line} d="M8.4 16.3 16 9.6l7.6 6.7" />
      <path {...line} d="M8.6 16.5v7.4M23.4 16.5v7.4" />
      <path {...line} stroke={MUTE} d="M11 23.9V19M21 23.9V19" />
      <path d="M14.5 16.7h3v7.2h-3z" fill={active ? accent : 'none'} stroke={accent} strokeWidth="1.25" />
      <path {...line} d="M6.2 24.2h19.6M8.4 26.4h15.2M11 28.2h10" />
    </svg>
  );
}

function Inbox(svg: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svg} data-nav-concept="envelope-tray">
      <path {...line} d="M6.4 13.2h19.2v9.6H6.4z" />
      <path {...line} d="M6.6 13.5 16 19.4l9.4-5.9" />
      <path {...line} stroke={MUTE} d="M8.2 22.2h15.6M9.4 23.8h13.2" />
    </svg>
  );
}

function Design({ accent, active, ...svg }: GlyphProps) {
  return (
    <svg {...svg} data-nav-concept="composition-planes">
      <path {...line} stroke={active ? accent : INK} d="M16 4.4 26.2 9.6 16 14.8 5.8 9.6Z" />
      <path {...line} stroke={MUTE} d="M16 6.2 23.4 9.6 16 13 8.6 9.6Z" />
      <path {...line} d="M16 12.2 26.2 17.4 16 22.6 5.8 17.4Z" />
      <path {...line} d="M16 18.2 26.2 23.4 16 28.6 5.8 23.4Z" />
    </svg>
  );
}

function Experience({ accent, active, ...svg }: GlyphProps) {
  return (
    <svg {...svg} data-nav-concept="portal">
      <path {...line} d="M5.2 8.2 10.4 10.4v12.2L5.2 24.6Z" />
      <path {...line} d="M26.8 8.2 21.6 10.4v12.2l4.8 2Z" />
      <circle {...line} stroke={active ? accent : INK} cx="16" cy="15.2" r="3.15" />
      <circle {...line} stroke={MUTE} cx="16" cy="15.2" r="1.15" />
      <path {...line} stroke={MUTE} d="M12.2 26.2h7.6M13.4 28h5.2" />
    </svg>
  );
}

function Expression({ accent, active, ...svg }: GlyphProps) {
  return (
    <svg {...svg} data-nav-concept="prism-stage">
      <path {...line} d="M4.6 9.2 9.2 11.2v11.2l-4.6 2Z" />
      <path {...line} d="M27.4 9.2 22.8 11.2v11.2l4.6 2Z" />
      <path {...line} d="M16 8.4 21.2 11.2v5.6L16 19.6 10.8 16.8v-5.6Z" />
      <path {...line} d="M16 8.4v5.6M10.8 11.2 16 14l5.2-2.8M16 14v5.6" />
      <path d="M16 9.6 19.4 11.4 16 13.2 12.6 11.4Z" fill={active ? accent : 'none'} stroke={accent} strokeWidth="1.1" />
      <path {...line} stroke={MUTE} d="M11.4 24.8h9.2" />
    </svg>
  );
}

function Library({ accent, active, ...svg }: GlyphProps) {
  return (
    <svg {...svg} data-nav-concept="open-book">
      <path {...line} d="M16 8.4C12.6 6.2 8.4 6.4 4.8 8.2v14.2c3.4-1.6 7.4-1.4 11.2 1.2" />
      <path {...line} d="M16 8.4c3.4-2.2 7.6-2 11.2-.2v14.2c-3.4-1.6-7.4-1.4-11.2 1.2" />
      <path {...line} stroke={MUTE} d="M8.2 12.4c2.2-.5 4.6.2 7.8 1.8M23.8 12.4c-2.2-.5-4.6.2-7.8 1.8" />
      <path stroke={active ? accent : INK} strokeWidth="1.7" strokeLinecap="round" d="M16 8.6v15.2" />
    </svg>
  );
}

function Activity({ accent, active, ...svg }: GlyphProps) {
  return (
    <svg {...svg} data-nav-concept="timeline">
      <path {...line} d="M5.2 21.6 11.2 17.2 16.4 19.4 24.6 10.2" />
      <circle {...line} cx="5.2" cy="21.6" r="1.7" fill="#fff" />
      <circle {...line} cx="11.2" cy="17.2" r="1.7" fill={active ? accent : '#fff'} stroke={active ? accent : INK} />
      <circle {...line} cx="16.4" cy="19.4" r="1.7" fill="#fff" />
      <circle {...line} stroke={active ? accent : INK} cx="24.6" cy="10.2" r="2.5" />
      <circle cx="24.6" cy="10.2" r="1.05" fill={active ? accent : INK} />
    </svg>
  );
}

/** @deprecated Use ProductionNavIcon. Kept so older imports keep resolving during the glyph swap. */
export function BottomNavPackIcon({ id, active = false }: { id: ProductionNavGlyph; active?: boolean }) {
  return <ProductionNavIcon variant={id} active={active} />;
}
