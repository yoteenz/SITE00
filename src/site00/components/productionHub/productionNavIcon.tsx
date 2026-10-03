/**
 * Production bottom-nav glyphs traced from the founder BOTTOM BAR ICON SYSTEM masters.
 * Signature red is part of each mark. Notification dots stay outside the SVG.
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

const INK = '#111111';
const RED = '#eb1c24';
const WHITE = '#ffffff';
const PAPER = '#f3f3f4';
const GRAY = '#c8c8cc';

const frame: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 64 64',
  fill: 'none',
  'aria-hidden': true,
};

export function ProductionNavIcon({
  variant,
  active = false,
  size = 28,
  className,
  ariaHidden = true,
}: {
  variant: ProductionNavGlyph;
  active?: boolean;
  size?: number;
  className?: string;
  ariaHidden?: boolean;
}) {
  const props: SVGProps<SVGSVGElement> = {
    ...frame,
    width: size,
    height: size,
    className: `bnav-ico${className ? ` ${className}` : ''}`,
    'aria-hidden': ariaHidden,
    'data-nav-glyph': variant,
    'data-nav-state': active ? 'active' : 'inactive',
    'data-nav-fidelity': 'reference-masters',
  };
  switch (variant) {
    case 'hub':
      return <Hub {...props} />;
    case 'inbox':
      return <Inbox {...props} />;
    case 'design':
      return <Design {...props} />;
    case 'experience':
      return <Experience {...props} />;
    case 'expression':
      return <Expression {...props} />;
    case 'library':
      return <Library {...props} />;
    case 'activity':
      return <Activity {...props} />;
  }
}

function Hub(svg: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svg} data-nav-concept="pavilion">
      <path d="M4 48 L18 41 H46 L60 48 L54 55 H10 Z" fill={PAPER} stroke={INK} strokeWidth="2.4" strokeLinejoin="miter" />
      <path d="M16 55 L22 48 H42 L48 55 Z" fill={WHITE} stroke={INK} strokeWidth="2.1" />
      <path d="M20 57.5 H44 M25 60 H39" stroke={INK} strokeWidth="2.1" strokeLinecap="square" />
      <path d="M15 29 H23 V43 H15 Z" fill={INK} />
      <path d="M23 29 H27.5 V43 H23 Z" fill={PAPER} />
      <path d="M27.5 29 H36.5 V43 H27.5 Z" fill={RED} />
      <path d="M31.2 29 H32.8 V43 H31.2 Z" fill={WHITE} />
      <path d="M36.5 29 H41 V43 H36.5 Z" fill={PAPER} />
      <path d="M41 29 H49 V43 H41 Z" fill={INK} />
      <path d="M7 31 L32 9 L57 31 L49 31 L32 17 L15 31 Z" fill={INK} />
      <path d="M13 31 L32 15 L51 31 L45 31 L32 20 L19 31 Z" fill={WHITE} />
      <path d="M19 31 L32 20 L45 31 L40 31 L32 24.5 L24 31 Z" fill={INK} />
      <path d="M32 12 V30" stroke={WHITE} strokeWidth="1.5" />
      <path d="M30.3 1.5 H33.7 V10 H30.3 Z" fill={RED} />
    </svg>
  );
}

function Inbox(svg: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svg} data-nav-concept="envelope-tray">
      <path d="M16 14 H48 L58 24 V42 L48 52 H16 L6 42 V24 Z" fill={INK} />
      <path d="M20 19 H44 L51 26 V39 L44 46 H20 L13 39 V26 Z" fill={WHITE} />
      <path d="M13 26 H20 V40 H13 Z" fill="#d2d2d6" />
      <path d="M15 28.5 H17.4 V37.5 H15 Z" fill={WHITE} />
      <path d="M44 26 H51 V40 H44 Z" fill="#d2d2d6" />
      <path d="M46.6 28.5 H49 V37.5 H46.6 Z" fill={WHITE} />
      <path d="M20 39 H44 V46 H20 Z" fill="#e7e7ea" />
      <path d="M18 27 L32 38.5 L46 27" stroke={RED} strokeWidth="3.3" strokeLinejoin="miter" />
    </svg>
  );
}

function Design(svg: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svg} data-nav-concept="composition-planes">
      <Plane y={40} />
      <Plane y={26} />
      <Plane y={10} red />
    </svg>
  );
}

function Plane({ y, red = false }: { y: number; red?: boolean }) {
  return (
    <g>
      <path d={`M32 ${y} L52 ${y + 8} L32 ${y + 16} L12 ${y + 8} Z`} fill={WHITE} stroke={INK} strokeWidth="3.1" strokeLinejoin="round" />
      <path d={`M32 ${y + 3.2} V${y + 12.6}`} stroke={INK} strokeWidth="1.5" strokeDasharray="1.8 2.1" />
      {red ? <path d={`M32 ${y} L52 ${y + 8}`} stroke={RED} strokeWidth="3.3" strokeLinecap="round" /> : null}
    </g>
  );
}

function Experience(svg: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svg} data-nav-concept="portal">
      <path d="M6 52 L20 46" stroke={INK} strokeWidth="2" />
      <path d="M58 52 L44 46" stroke={INK} strokeWidth="2" />
      <path d="M22 48 H42" stroke={GRAY} strokeWidth="2.4" strokeLinecap="square" />
      <path d="M24 51.5 H40" stroke="#dedee2" strokeWidth="2.2" strokeLinecap="square" />
      <path d="M4 18 L22 14 V48 L4 54 Z" fill={INK} />
      <path d="M9 22 L17 20.2 V44 L9 48 Z" fill={WHITE} />
      <path d="M60 18 L42 14 V48 L60 54 Z" fill={INK} />
      <path d="M55 22 L47 20.2 V44 L55 48 Z" fill={WHITE} />
      <circle cx="32" cy="28" r="7.2" stroke={RED} strokeWidth="3.6" />
    </svg>
  );
}

function Expression(svg: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svg} data-nav-concept="prism-stage">
      <path d="M32 58 L56 46 L32 34 L8 46 Z" fill={WHITE} stroke={INK} strokeWidth="2.6" strokeLinejoin="miter" />
      <path d="M28 50 H36" stroke={RED} strokeWidth="6" opacity="0.35" />
      <path d="M10 16 H17 V44 L10 47 Z" fill={INK} />
      <path d="M12.2 20 H14.8 V40 H12.2 Z" fill={WHITE} />
      <path d="M54 16 H47 V44 L54 47 Z" fill={INK} />
      <path d="M51.8 20 H49.2 V40 H51.8 Z" fill={WHITE} />
      <path d="M22 24 L32 29 L32 44 L22 39 Z" fill="#1a1a1a" />
      <path d="M42 24 L32 29 L32 44 L42 39 Z" fill="#2c2c2c" />
      <path d="M32 14 L43 20 L32 26 L21 20 Z" fill={WHITE} stroke={RED} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M32 17.2 V23" stroke={INK} strokeWidth="1.3" strokeDasharray="1.4 1.6" />
      <path d="M30.6 4 H33.4 V14 H30.6 Z" fill={RED} />
    </svg>
  );
}

function Library(svg: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svg} data-nav-concept="open-book">
      <path d="M30 20 L6 28 L8 52 L30 46 Z" fill={INK} />
      <path d="M30 18 L10 25 L12 48 L30 42 Z" fill={INK} />
      <path d="M30 16 L14 22 L15 44 L30 39 Z" fill={WHITE} stroke={INK} strokeWidth="2.2" />
      <path d="M18 28 V40 M21.5 27 V39 M25 26 V38" stroke={GRAY} strokeWidth="1.5" />
      <path d="M34 20 L58 28 L56 52 L34 46 Z" fill={INK} />
      <path d="M34 18 L54 25 L52 48 L34 42 Z" fill={INK} />
      <path d="M34 16 L50 22 L49 44 L34 39 Z" fill={WHITE} stroke={INK} strokeWidth="2.2" />
      <path d="M46 28 V40 M42.5 27 V39 M39 26 V38" stroke={GRAY} strokeWidth="1.5" />
      <path d="M30.4 12 H33.6 L33.6 50 L32 53 L30.4 50 Z" fill={RED} />
    </svg>
  );
}

function Activity(svg: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svg} data-nav-concept="timeline">
      <path d="M8 46 L22 34" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M22 34 L38 42" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M38 42 L54 18" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
      <Tick x={8} y={46} color={INK} />
      <Tick x={22} y={34} color={RED} />
      <Tick x={38} y={42} color={INK} />
      <Tick x={54} y={18} color={RED} tall />
      <circle cx="8" cy="46" r="4.2" fill={WHITE} stroke={INK} strokeWidth="2.4" />
      <circle cx="22" cy="34" r="6.2" fill="#f6c2c6" opacity="0.9" />
      <circle cx="22" cy="34" r="3.5" fill={RED} />
      <circle cx="22" cy="34" r="1.5" fill={WHITE} />
      <circle cx="38" cy="42" r="4.2" fill={WHITE} stroke={INK} strokeWidth="2.4" />
      <circle cx="54" cy="18" r="8" fill="#f6c2c6" opacity="0.85" />
      <circle cx="54" cy="18" r="4.4" fill={RED} />
      <circle cx="54" cy="18" r="1.8" fill={WHITE} />
    </svg>
  );
}

function Tick({ x, y, color, tall = false }: { x: number; y: number; color: string; tall?: boolean }) {
  const h = tall ? 11 : 8;
  return <path d={`M${x} ${y - h} V${y + h}`} stroke={color} strokeWidth="1.7" strokeLinecap="square" />;
}

export function BottomNavPackIcon({ id, active = false }: { id: ProductionNavGlyph; active?: boolean }) {
  return <ProductionNavIcon variant={id} active={active} />;
}
