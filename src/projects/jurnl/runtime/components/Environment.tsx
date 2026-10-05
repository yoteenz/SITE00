/**
 * JURNL F01 environment — CODE-CONSTRUCTED decorative layers (F01 legacy exception, asset-first not applicable).
 *
 * Reconstructs the approved parent's world from CSS + SVG: warm plaster with sun shafts, the travertine arch onto
 * the coast, the sheer curtain, olive branch, linen sofa + burgundy cushions, travertine plinth, black marble bowl,
 * the JURNL books; plus the flat-lay paper and editorial-collage scenes of the recovery / privacy children.
 * NOTHING here is a harvested raster or a screen crop. The marble bust is deliberately NOT drawn (it would be
 * invented art) — it is recorded as a missing ISOLATED_OBJECT for asset-first production.
 * Every layer is aria-hidden and pointer-events: none. No text, form or control lives in the environment.
 */

import { useId, type CSSProperties } from 'react';

export type JurnlScene =
  | 'welcome'
  | 'create'
  | 'signin'
  | 'unlock'
  | 'verify'
  | 'reset-sent'
  | 'forgot'
  | 'newpw'
  | 'success'
  | 'biometric'
  | 'trust'
  | 'privacy'
  | 'security'
  | 'complete'
  | 'boundary';

type Part =
  | 'wall'
  | 'shafts'
  | 'arch'
  | 'pilaster'
  | 'curtain'
  | 'olive'
  | 'sofa'
  | 'cushions'
  | 'plinth'
  | 'bowl'
  | 'books'
  | 'fore'
  | 'vase'
  | 'faceid'
  | 'journal'
  | 'padlock'
  | 'table'
  | 'envelope'
  | 'seal'
  | 'linen'
  | 'tray'
  | 'collage'
  | 'stack';

const ATRIUM: Part[] = ['wall', 'shafts', 'arch', 'pilaster', 'curtain', 'olive'];

export const SCENE_PARTS: Record<JurnlScene, Part[]> = {
  welcome: [...ATRIUM, 'sofa', 'cushions', 'plinth', 'bowl', 'books', 'fore'],
  create: ['wall', 'shafts', 'arch', 'olive', 'vase', 'plinth', 'books', 'fore'],
  signin: [...ATRIUM, 'sofa', 'plinth', 'bowl', 'books', 'vase', 'fore'],
  unlock: [...ATRIUM, 'sofa', 'cushions', 'plinth', 'bowl', 'books', 'fore'],
  verify: ['table', 'olive', 'tray', 'linen', 'envelope', 'seal'],
  'reset-sent': ['table', 'olive', 'envelope', 'seal', 'fore'],
  forgot: ['wall', 'collage'],
  newpw: ['wall', 'shafts', 'arch', 'curtain', 'olive', 'plinth', 'bowl', 'fore'],
  success: [...ATRIUM, 'plinth', 'bowl', 'books', 'fore'],
  biometric: [...ATRIUM, 'sofa', 'plinth', 'bowl', 'books', 'faceid', 'fore'],
  trust: [...ATRIUM, 'sofa', 'plinth', 'bowl', 'journal', 'fore'],
  privacy: ['table', 'olive', 'collage', 'stack'],
  security: [...ATRIUM, 'sofa', 'plinth', 'bowl', 'padlock', 'fore'],
  complete: [...ATRIUM, 'sofa', 'cushions', 'plinth', 'bowl', 'books', 'fore'],
  boundary: ['wall', 'shafts', 'arch', 'curtain', 'olive', 'plinth', 'fore'],
};

/* deterministic pseudo-random (stable SSR / client markup) */
function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function CoastView({ id, w = 200, h = 300 }: { id: string; w?: number; h?: number }) {
  const horizon = h * 0.6;
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6aa2d8" />
          <stop offset="0.6" stopColor="#b6d1ea" />
          <stop offset="1" stopColor="#e7eef1" />
        </linearGradient>
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4f8cb9" />
          <stop offset="1" stopColor="#2c6189" />
        </linearGradient>
        <linearGradient id={`${id}-rock`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c08a63" />
          <stop offset="1" stopColor="#7d4f37" />
        </linearGradient>
        <filter id={`${id}-soft`}>
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      <rect width={w} height={h} fill={`url(#${id}-sky)`} />
      <g fill="#fff" opacity="0.75" filter={`url(#${id}-soft)`}>
        <ellipse cx={w * 0.3} cy={h * 0.22} rx={w * 0.2} ry={h * 0.025} />
        <ellipse cx={w * 0.72} cy={h * 0.3} rx={w * 0.16} ry={h * 0.02} />
        <ellipse cx={w * 0.55} cy={h * 0.14} rx={w * 0.12} ry={h * 0.016} />
      </g>
      <path
        d={`M0 ${horizon - h * 0.06} L${w * 0.18} ${horizon - h * 0.12} L${w * 0.32} ${horizon - h * 0.08} L${w * 0.5} ${horizon - h * 0.16} L${w * 0.66} ${horizon - h * 0.1} L${w * 0.82} ${horizon - h * 0.19} L${w} ${horizon - h * 0.13} L${w} ${horizon} L0 ${horizon}Z`}
        fill="#b38f78"
        opacity="0.7"
      />
      <rect y={horizon} width={w} height={h - horizon} fill={`url(#${id}-sea)`} />
      <path
        d={`M${w * 0.38} ${h} C${w * 0.42} ${h * 0.86} ${w * 0.5} ${h * 0.78} ${w * 0.6} ${horizon + h * 0.02} C${w * 0.7} ${horizon - h * 0.06} ${w * 0.84} ${horizon - h * 0.14} ${w} ${horizon - h * 0.16} L${w} ${h}Z`}
        fill={`url(#${id}-rock)`}
      />
      <path
        d={`M${w * 0.62} ${h} C${w * 0.66} ${h * 0.9} ${w * 0.78} ${h * 0.8} ${w} ${h * 0.74} L${w} ${h}Z`}
        fill="#6d4330"
        opacity="0.7"
      />
      <g fill="#5d6a3b" opacity="0.85">
        {Array.from({ length: 14 }, (_, i) => {
          const r = rand(i + 3);
          return <ellipse key={i} cx={w * (0.55 + r() * 0.45)} cy={h * (0.72 + r() * 0.26)} rx={w * (0.02 + r() * 0.03)} ry={h * (0.01 + r() * 0.012)} />;
        })}
      </g>
    </>
  );
}

function Arch({ id }: { id: string }) {
  const W = 300;
  const H = 560;
  const ox = 46;
  const ow = 196;
  const r = ow / 2;
  const top = 34;
  const opening = `M${ox} ${H} L${ox} ${top + r} A${r} ${r} 0 0 1 ${ox + ow} ${top + r} L${ox + ow} ${H}Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMin meet" className="jrn-p jrn-p--arch">
      <defs>
        <clipPath id={`${id}-open`}>
          <path d={opening} />
        </clipPath>
        <linearGradient id={`${id}-trav`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#efe2cd" />
          <stop offset="0.55" stopColor="#e6d5bc" />
          <stop offset="1" stopColor="#d7c2a3" />
        </linearGradient>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4" />
          <feColorMatrix values="0 0 0 0 .45 0 0 0 0 .34 0 0 0 0 .22 0 0 0 .55 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id={`${id}-pits`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="11" />
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 0 0 0 0 0 .5 .75" />
          </feComponentTransfer>
          <feColorMatrix values="0 0 0 0 .52 0 0 0 0 .41 0 0 0 0 .29 0 0 0 1 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <path d={`M0 0H${W}V${H}H0Z ${opening}`} fillRule="evenodd" fill={`url(#${id}-trav)`} />
      <path d={`M0 0H${W}V${H}H0Z ${opening}`} fillRule="evenodd" fill="#000" filter={`url(#${id}-grain)`} opacity="0.5" />
      <path d={`M0 0H${W}V${H}H0Z ${opening}`} fillRule="evenodd" fill="#000" filter={`url(#${id}-pits)`} opacity="0.35" />
      <g clipPath={`url(#${id}-open)`}>
        <svg x={ox} y={top} width={ow} height={H - top} viewBox={`0 0 200 ${Math.round(((H - top) / ow) * 200)}`} preserveAspectRatio="xMidYMid slice">
          <CoastView id={`${id}-coast`} w={200} h={Math.round(((H - top) / ow) * 200)} />
        </svg>
        {/* reveal depth on the shaded side */}
        <path d={`M${ox + ow - 14} ${top + r} A${r - 14} ${r - 14} 0 0 0 ${ox + r} ${top + 14} L${ox + r} ${top} A${r} ${r} 0 0 1 ${ox + ow} ${top + r} L${ox + ow} ${H} L${ox + ow - 14} ${H}Z`} fill="#c9b090" opacity="0.85" />
      </g>
      <path d={opening} fill="none" stroke="#f6ecdc" strokeWidth="3" opacity="0.8" />
    </svg>
  );
}

function Curtain({ id }: { id: string }) {
  const folds = [0, 0.08, 0.17, 0.24, 0.33, 0.41, 0.52, 0.6, 0.7, 0.79, 0.88, 1];
  return (
    <svg viewBox="0 0 200 800" preserveAspectRatio="none" className="jrn-p jrn-p--curtain">
      <defs>
        <linearGradient id={`${id}-fold`} x1="0" y1="0" x2="1" y2="0.18">
          {folds.map((o, i) => (
            <stop key={o} offset={o} stopColor="#ffffff" stopOpacity={i % 2 ? 0.92 : 0.5} />
          ))}
        </linearGradient>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.82" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-m`}>
          <rect width="200" height="800" fill={`url(#${id}-fade)`} />
        </mask>
        <filter id={`${id}-blur`}>
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
      </defs>
      <path
        d="M18 0 L118 0 C126 140 150 320 178 470 C190 560 196 660 200 800 L118 800 C104 650 84 540 66 430 C44 300 26 150 18 0Z"
        fill={`url(#${id}-fold)`}
        mask={`url(#${id}-m)`}
        filter={`url(#${id}-blur)`}
        opacity="0.88"
      />
      <path d="M58 0 C70 170 96 330 128 480 C140 560 150 660 156 800" stroke="#fff" strokeOpacity="0.8" strokeWidth="5" fill="none" filter={`url(#${id}-blur)`} />
      <path d="M90 0 C98 160 118 320 150 470" stroke="#e9e3da" strokeOpacity="0.55" strokeWidth="3" fill="none" filter={`url(#${id}-blur)`} />
    </svg>
  );
}

function OliveBranch({ id, flip = false }: { id: string; flip?: boolean }) {
  const r = rand(29);
  const leaves = Array.from({ length: 15 }, (_, i) => {
    const t = i / 14;
    const side = i % 2 ? 1 : -1;
    return { x: 88 - t * 40 + side * 4, y: 18 + t * 380, rot: side * (38 + r() * 30) + 180 * (side < 0 ? 1 : 0), len: 58 + r() * 26, shade: r() };
  });
  return (
    <svg viewBox="0 0 140 420" className="jrn-p jrn-p--olive" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <defs>
        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2c3a21" />
          <stop offset="0.6" stopColor="#4c5c34" />
          <stop offset="1" stopColor="#77845a" />
        </linearGradient>
      </defs>
      <path d="M96 0 C86 120 70 260 44 420" stroke="#4a3b2a" strokeWidth="2.4" fill="none" />
      {leaves.map((l, i) => (
        <path
          key={i}
          d={`M0 0 C${l.len * 0.18} ${-l.len * 0.16} ${l.len * 0.7} ${-l.len * 0.17} ${l.len} 0 C${l.len * 0.7} ${l.len * 0.15} ${l.len * 0.18} ${l.len * 0.14} 0 0Z`}
          transform={`translate(${l.x} ${l.y}) rotate(${l.rot})`}
          fill={l.shade > 0.7 ? '#58673c' : `url(#${id}-leaf)`}
          opacity={0.9 + l.shade * 0.1}
        />
      ))}
    </svg>
  );
}

function Sofa({ id, cushions }: { id: string; cushions: boolean }) {
  return (
    <svg viewBox="0 0 420 220" className="jrn-p jrn-p--sofa">
      <defs>
        <linearGradient id={`${id}-linen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1ebe1" />
          <stop offset="1" stopColor="#d7cdbd" />
        </linearGradient>
        <linearGradient id={`${id}-wine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a333a" />
          <stop offset="1" stopColor="#5b1c24" />
        </linearGradient>
        <pattern id={`${id}-dam`} width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M7 2c2 2 2 4 0 6-2-2-2-4 0-6zM0 9c2 0 3 1 3 3M14 9c-2 0-3 1-3 3" stroke="#a24a50" strokeWidth="0.8" fill="none" opacity="0.6" />
        </pattern>
      </defs>
      <rect x="0" y="40" width="420" height="96" rx="26" fill={`url(#${id}-linen)`} />
      <rect x="6" y="20" width="200" height="86" rx="24" fill="#ece5da" />
      <rect x="196" y="24" width="210" height="84" rx="24" fill="#e8e0d3" />
      <rect x="0" y="118" width="420" height="102" rx="18" fill={`url(#${id}-linen)`} />
      <path d="M0 150 H420" stroke="#cbbfad" strokeWidth="2" opacity="0.6" />
      {cushions ?
        <>
          <path d="M10 92 C40 56 170 52 214 74 C232 98 226 150 206 170 C150 182 50 182 16 166 C2 140 0 110 10 92Z" fill={`url(#${id}-wine)`} />
          <path d="M10 92 C40 56 170 52 214 74 C232 98 226 150 206 170 C150 182 50 182 16 166 C2 140 0 110 10 92Z" fill={`url(#${id}-dam)`} />
          <path d="M196 54 C236 26 330 24 374 44 C388 66 384 108 368 126 C320 138 248 136 212 122 C196 98 190 72 196 54Z" fill={`url(#${id}-wine)`} />
          <path d="M196 54 C236 26 330 24 374 44 C388 66 384 108 368 126 C320 138 248 136 212 122 C196 98 190 72 196 54Z" fill={`url(#${id}-dam)`} />
        </>
      : null}
    </svg>
  );
}

function Bowl({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 200 90" className="jrn-p jrn-p--bowl">
      <defs>
        <radialGradient id={`${id}-b`} cx="0.4" cy="0.2" r="0.9">
          <stop offset="0" stopColor="#4a4642" />
          <stop offset="0.5" stopColor="#1e1c1b" />
          <stop offset="1" stopColor="#0d0c0c" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="84" rx="70" ry="5" fill="#000" opacity="0.18" />
      <path d="M8 22 C14 64 54 86 100 86 C146 86 186 64 192 22Z" fill={`url(#${id}-b)`} />
      <path d="M30 40 C60 52 80 34 112 50 C130 60 150 46 176 40 M44 64 C74 58 96 72 130 62" stroke="#8d857a" strokeWidth="1.2" fill="none" opacity="0.7" />
      <ellipse cx="100" cy="22" rx="92" ry="12" fill="#2a2725" />
      <ellipse cx="100" cy="22" rx="84" ry="8" fill="#141312" />
      <path d="M14 20 C40 12 80 10 110 11" stroke="#d6cfc3" strokeWidth="1.4" fill="none" opacity="0.45" />
    </svg>
  );
}

function ForePlant({ id }: { id: string }) {
  const r = rand(91);
  const leaves = Array.from({ length: 11 }, () => ({ x: 40 + r() * 170, y: 60 + r() * 330, rot: -70 + r() * 140, len: 120 + r() * 110 }));
  return (
    <svg viewBox="0 0 260 420" className="jrn-p jrn-p--fore">
      <defs>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1f2b18" />
          <stop offset="1" stopColor="#4b5a33" />
        </linearGradient>
      </defs>
      {leaves.map((l, i) => (
        <path
          key={i}
          d={`M0 0 C${l.len * 0.25} ${-l.len * 0.16} ${l.len * 0.72} ${-l.len * 0.14} ${l.len} 0 C${l.len * 0.72} ${l.len * 0.13} ${l.len * 0.25} ${l.len * 0.15} 0 0Z`}
          transform={`translate(${l.x} ${l.y}) rotate(${l.rot})`}
          fill={`url(#${id}-l)`}
        />
      ))}
    </svg>
  );
}

function Vase({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 160 260" className="jrn-p jrn-p--vase">
      <defs>
        <linearGradient id={`${id}-v`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f2e8d8" />
          <stop offset="0.6" stopColor="#ddcdb4" />
          <stop offset="1" stopColor="#b9a382" />
        </linearGradient>
        <filter id={`${id}-p`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="2" seed="3" />
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 0 0 0 0 .6 .8" />
          </feComponentTransfer>
          <feColorMatrix values="0 0 0 0 .5 0 0 0 0 .4 0 0 0 0 .28 0 0 0 1 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <path id={`${id}-shape`} d="M58 0 H102 C100 18 96 30 110 46 C150 80 160 130 150 180 C140 226 110 256 80 260 C50 256 20 226 10 180 C0 130 10 80 50 46 C64 30 60 18 58 0Z" fill={`url(#${id}-v)`} />
      <path d="M58 0 H102 C100 18 96 30 110 46 C150 80 160 130 150 180 C140 226 110 256 80 260 C50 256 20 226 10 180 C0 130 10 80 50 46 C64 30 60 18 58 0Z" fill="#000" filter={`url(#${id}-p)`} opacity="0.4" />
    </svg>
  );
}

function FaceIdPlaque() {
  return (
    <span className="jrn-p jrn-p--faceid">
      <svg viewBox="0 0 24 24" aria-hidden>
        <path
          d="M3.5 8V5.5a2 2 0 0 1 2-2H8M16 3.5h2.5a2 2 0 0 1 2 2V8M20.5 16v2.5a2 2 0 0 1-2 2H16M8 20.5H5.5a2 2 0 0 1-2-2V16M8.5 9v1.5M15.5 9v1.5M12 9v4h-1M9 15.5c1.8 1.6 4.2 1.6 6 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function LeafMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 90" className={className} aria-hidden>
      <path d="M22 90 C22 64 21 40 25 14" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <path d="M25 14 C28 6 34 2 38 0 C38 8 33 16 25 20Z M22 48 C14 44 8 36 6 28 C14 30 21 36 23 44Z M23 60 C30 54 36 50 40 48 C38 56 32 62 23 66Z" fill="currentColor" />
    </svg>
  );
}

function Journal() {
  return (
    <span className="jrn-p jrn-p--journal">
      <span className="jrn-journal__spine">
        <LeafMark className="jrn-journal__leaf" />
        <b>JURNL</b>
      </span>
      <span className="jrn-journal__cover">
        <i className="jrn-journal__clasp" />
      </span>
    </span>
  );
}

function Padlock({ id }: { id: string }) {
  return (
    <span className="jrn-p jrn-p--padlock">
      <span className="jrn-padlock__book">
        <b>JURNL</b>
        <LeafMark className="jrn-journal__leaf" />
      </span>
      <svg viewBox="0 0 120 150" className="jrn-padlock__lock">
        <defs>
          <linearGradient id={`${id}-brass`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e2c48a" />
            <stop offset="0.5" stopColor="#b8904f" />
            <stop offset="1" stopColor="#8a6a36" />
          </linearGradient>
        </defs>
        <path d="M30 64 V40 a30 30 0 0 1 60 0 V64" fill="none" stroke={`url(#${id}-brass)`} strokeWidth="11" />
        <rect x="10" y="60" width="100" height="88" rx="10" fill={`url(#${id}-brass)`} />
        <g transform="translate(46 70) scale(0.7)" color="#8a6a36">
          <LeafMark />
        </g>
      </svg>
    </span>
  );
}

function Envelope({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 320 230" className="jrn-p jrn-p--envelope">
      <defs>
        <filter id={`${id}-paper`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="2" />
          <feColorMatrix values="0 0 0 0 .5 0 0 0 0 .44 0 0 0 0 .36 0 0 0 .35 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="6" dy="14" stdDeviation="10" floodColor="#5a4128" floodOpacity="0.22" />
        </filter>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <rect x="6" y="6" width="308" height="218" rx="3" fill="#f6f1e8" />
      </g>
      <rect x="6" y="6" width="308" height="218" rx="3" fill="#000" filter={`url(#${id}-paper)`} opacity="0.5" />
      <path d="M6 6 L160 112 L314 6" stroke="#e1d6c4" strokeWidth="1.5" fill="none" />
      <g transform="translate(74 54) scale(1.25)" color="#e3d8c6">
        <LeafMark />
      </g>
      <g transform="translate(72 52) scale(1.25)" color="#fffdf8" opacity="0.8">
        <LeafMark />
      </g>
      <text x="248" y="200" fontFamily="'JURNL Display', serif" fontSize="17" letterSpacing="4" fill="#b8955f">
        JURNL
      </text>
    </svg>
  );
}

function Seal({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 100 100" className="jrn-p jrn-p--seal">
      <defs>
        <radialGradient id={`${id}-wax`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#efd9ac" />
          <stop offset="0.55" stopColor="#c7a46c" />
          <stop offset="1" stopColor="#8f6e3d" />
        </radialGradient>
      </defs>
      <path d="M50 4 C66 3 78 10 88 20 C97 32 98 46 96 58 C93 74 84 86 70 93 C56 99 40 98 28 91 C14 83 5 70 4 54 C3 38 9 24 20 14 C29 7 39 4 50 4Z" fill={`url(#${id}-wax)`} />
      <g transform="translate(35 22) scale(0.62)" color="#a5844f">
        <LeafMark />
      </g>
    </svg>
  );
}

function Linen({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 300 260" preserveAspectRatio="none" className="jrn-p jrn-p--linen">
      <defs>
        <linearGradient id={`${id}-r`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c0807a" />
          <stop offset="1" stopColor="#8b4a49" />
        </linearGradient>
      </defs>
      <path d="M0 40 C60 20 120 60 170 90 C220 120 260 170 300 260 L0 260Z" fill={`url(#${id}-r)`} />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M0 ${70 + i * 34} C70 ${50 + i * 34} 140 ${100 + i * 30} 220 ${170 + i * 22}`} stroke="#6f3433" strokeOpacity="0.35" strokeWidth="9" fill="none" />
      ))}
    </svg>
  );
}

function Collage({ id, variant }: { id: string; variant: 'forgot' | 'privacy' }) {
  const torn = (x: number, y: number, w: number, h: number, seed: number) => {
    const r = rand(seed);
    const pts: string[] = [];
    const n = 16;
    for (let i = 0; i <= n; i++) pts.push(`${x + (w * i) / n},${y + (r() - 0.5) * 7}`);
    for (let i = 0; i <= n; i++) pts.push(`${x + w + (r() - 0.5) * 7},${y + (h * i) / n}`);
    for (let i = n; i >= 0; i--) pts.push(`${x + (w * i) / n},${y + h + (r() - 0.5) * 7}`);
    for (let i = n; i >= 0; i--) pts.push(`${x + (r() - 0.5) * 7},${y + (h * i) / n}`);
    return pts.join(' ');
  };
  return (
    <svg viewBox="0 0 393 852" preserveAspectRatio="xMidYMid slice" className="jrn-p jrn-p--collage">
      <defs>
        <filter id={`${id}-pits`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="5" />
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 0 0 0 0 .55 .8" />
          </feComponentTransfer>
          <feColorMatrix values="0 0 0 0 .55 0 0 0 0 .43 0 0 0 0 .3 0 0 0 1 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id={`${id}-drop`} x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="2" dy="6" stdDeviation="6" floodColor="#5a4128" floodOpacity="0.2" />
        </filter>
        <clipPath id={`${id}-photo`}>
          <polygon points={torn(0, 610, 118, 240, 8)} />
        </clipPath>
      </defs>
      {variant === 'forgot' ?
        <>
          <polygon points={torn(232, -10, 180, 360, 2)} fill="#d3bd9d" />
          <polygon points={torn(232, -10, 180, 360, 2)} fill="#000" filter={`url(#${id}-pits)`} opacity="0.45" />
          <polygon points={torn(312, 380, 100, 300, 3)} fill="#f3ebde" filter={`url(#${id}-drop)`} />
          <polygon points={torn(296, 650, 120, 220, 4)} fill="#e6c1b6" filter={`url(#${id}-drop)`} />
          <path d="M310 700 C330 740 350 760 390 800 M330 660 C340 700 370 720 400 730" stroke="#f6e3dc" strokeWidth="2" fill="none" opacity="0.7" />
          <polygon points={torn(196, 690, 130, 180, 6)} fill="#d8c3a4" />
          <polygon points={torn(196, 690, 130, 180, 6)} fill="#000" filter={`url(#${id}-pits)`} opacity="0.5" />
          <polygon points={torn(92, 640, 120, 230, 7)} fill="#f6efe3" filter={`url(#${id}-drop)`} />
          <g clipPath={`url(#${id}-photo)`}>
            <svg x="0" y="610" width="118" height="240" viewBox="0 0 118 240" preserveAspectRatio="xMidYMid slice">
              <CoastView id={`${id}-coast`} w={118} h={240} />
            </svg>
          </g>
        </>
      : <>
          <polygon points={torn(-20, 300, 110, 420, 12)} fill="#f2eadc" filter={`url(#${id}-drop)`} />
          <g clipPath={`url(#${id}-photo)`} transform="translate(0 -230)">
            <svg x="0" y="610" width="118" height="240" viewBox="0 0 118 240" preserveAspectRatio="xMidYMid slice">
              <CoastView id={`${id}-coast2`} w={118} h={240} />
            </svg>
          </g>
          <polygon points={torn(320, 300, 120, 520, 13)} fill="#6b2230" filter={`url(#${id}-drop)`} />
          <polygon points={torn(-30, 760, 90, 160, 14)} fill="#7a2a36" />
          <polygon points={torn(300, 0, 140, 220, 15)} fill="#e3d4bf" />
          <polygon points={torn(300, 0, 140, 220, 15)} fill="#000" filter={`url(#${id}-pits)`} opacity="0.4" />
        </>
      }
    </svg>
  );
}

export function JurnlEnvironment({ scene }: { scene: JurnlScene }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const parts = new Set(SCENE_PARTS[scene]);
  const has = (p: Part) => parts.has(p);
  const id = (p: string) => `jrn${uid}${p}`;
  return (
    <div className="jrn-env" data-scene={scene} aria-hidden data-testid="jurnl-environment">
      {has('wall') ? <div className="jrn-p jrn-p--wall" /> : null}
      {has('table') ? <div className="jrn-p jrn-p--table" /> : null}
      {has('shafts') ? <div className="jrn-p jrn-p--shafts" /> : null}
      {has('arch') ? <Arch id={id('arch')} /> : null}
      {has('pilaster') ? <div className="jrn-p jrn-p--pilaster" /> : null}
      {has('olive') ? <OliveBranch id={id('olive')} /> : null}
      {has('collage') ? <Collage id={id('collage')} variant={scene === 'privacy' ? 'privacy' : 'forgot'} /> : null}
      {has('curtain') ? <Curtain id={id('curtain')} /> : null}
      {has('tray') ? <div className="jrn-p jrn-p--tray" /> : null}
      {has('linen') ? <Linen id={id('linen')} /> : null}
      {has('envelope') ? <Envelope id={id('envelope')} /> : null}
      {has('seal') ? <Seal id={id('seal')} /> : null}
      {has('sofa') ? <Sofa id={id('sofa')} cushions={has('cushions')} /> : null}
      {has('vase') ? <Vase id={id('vase')} /> : null}
      {has('plinth') ? <div className="jrn-p jrn-p--plinth" /> : null}
      {has('bowl') ? <Bowl id={id('bowl')} /> : null}
      {has('books') ?
        <span className="jrn-p jrn-p--books">
          <i>
            <b>JURNL</b>
          </i>
          <i />
        </span>
      : null}
      {has('faceid') ? <FaceIdPlaque /> : null}
      {has('journal') ? <Journal /> : null}
      {has('padlock') ? <Padlock id={id('padlock')} /> : null}
      {has('fore') ? <ForePlant id={id('fore')} /> : null}
    </div>
  );
}

export const envStyle = (vars: Record<string, string | number>): CSSProperties => vars as CSSProperties;
