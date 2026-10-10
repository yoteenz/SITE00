/**
 * Digital Foundation threshold architecture (DF-A01 hero, DF-A02 crown, DF-A03 corner fragment).
 *
 * Interim vector renditions of the approved architecture: white chamber, glass Foundation Plate with the
 * "01 DIGITAL FOUNDATION" etching, red translucent threshold plates, stone plinth. When Grok delivers the
 * photoreal renders (GROK_ASSET_REQUEST_MANIFEST DF-G01..G05) set their paths in DF_ARCHITECTURE_RENDERS and
 * the slot swaps to the raster without layout change. Purely decorative: never carries client data.
 */
import { useId } from 'react';

export const DF_ARCHITECTURE_RENDERS: { hero: string | null; crown: string | null; corner: string | null } = {
  hero: '/site00/idnty/digital-foundation/architecture/df-g01-hero-chamber.jpg',
  crown: '/site00/idnty/digital-foundation/architecture/df-g02-crown-fragment.jpg',
  corner: '/site00/idnty/digital-foundation/architecture/df-g03-corner-fragment.jpg',
};

const RED = '#E50107';

function RedGlass({ id, top = '#f0474d', bottom = '#a80c13' }: { id: string; top?: string; bottom?: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={top} />
      <stop offset="0.55" stopColor={RED} />
      <stop offset="1" stopColor={bottom} />
    </linearGradient>
  );
}

/** P01 — the threshold chamber with the glass Foundation Plate. */
export function DfThresholdHero() {
  const uid = useId().replace(/:/g, '');
  const id = (n: string) => `dfh-${uid}-${n}`;
  if (DF_ARCHITECTURE_RENDERS.hero) {
    return <img className="df-object__render" src={DF_ARCHITECTURE_RENDERS.hero} alt="" aria-hidden="true" />;
  }
  return (
    <svg className="df-object__svg" viewBox="0 0 390 312" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id('wall')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f3f0" stopOpacity="0" />
          <stop offset="0.25" stopColor="#efeeeb" />
          <stop offset="1" stopColor="#e2e1dd" />
        </linearGradient>
        <linearGradient id={id('floor')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3e2de" />
          <stop offset="1" stopColor="#d6d4cf" />
        </linearGradient>
        <linearGradient id={id('plinthTop')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7f6f3" />
          <stop offset="1" stopColor="#e6e4df" />
        </linearGradient>
        <linearGradient id={id('plinthFront')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9d7d2" />
          <stop offset="1" stopColor="#c4c2bd" />
        </linearGradient>
        <linearGradient id={id('glassL')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.62" />
          <stop offset="1" stopColor="#e9edef" stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id={id('glassR')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#dfe4e6" stopOpacity="0.18" />
        </linearGradient>
        <RedGlass id={id('red')} />
        <RedGlass id={id('redSide')} top="#c0161d" bottom="#7d080d" />
        <linearGradient id={id('reflect')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={RED} stopOpacity="0.32" />
          <stop offset="1" stopColor={RED} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('ray')} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Chamber: back wall, side panels, floor */}
      <rect x="0" y="0" width="390" height="330" fill={`url(#${id('wall')})`} />
      <path d="M0 74 L58 86 L58 300 L0 318 Z" fill="#e7e6e2" />
      <path d="M58 86 L58 300" stroke="#d3d1cc" strokeWidth="0.8" />
      <path d="M318 28 L390 14 L390 300 L318 296 Z" fill="#e5e4e0" />
      <path d="M342 24 V298 M366 19 V299" stroke="#d6d4cf" strokeWidth="0.7" />
      <path d="M0 300 L390 292 L390 330 L0 330 Z" fill={`url(#${id('floor')})`} />
      <path d="M0 312 L390 304 M120 330 L170 296 M260 330 L250 294" stroke="#cfcdc8" strokeWidth="0.6" />
      <path d="M390 0 L300 0 L150 330 L230 330 Z" fill={`url(#${id('ray')})`} opacity="0.55" />

      {/* Stone plinth */}
      <path d="M8 262 L272 246 L352 268 L74 288 Z" fill={`url(#${id('plinthTop')})`} />
      <path d="M74 288 L352 268 L352 290 L74 312 Z" fill={`url(#${id('plinthFront')})`} />
      <path d="M8 262 L74 288 L74 312 L8 284 Z" fill="#cdcbc6" />
      <path
        d="M30 266 C70 262 96 274 140 270 S210 258 250 262 M110 282 C150 276 190 284 236 276 M120 296 C170 292 210 302 300 290 M20 276 C34 282 52 280 64 290"
        fill="none"
        stroke="#b9b7b2"
        strokeWidth="0.6"
        opacity="0.7"
      />
      <path d="M352 268 L390 262 L390 284 L352 290 Z" fill="#f2f1ee" />
      <path d="M352 290 L390 284 L390 300 L352 306 Z" fill="#d2d0cb" />

      {/* Red threshold plates behind the glass */}
      <path d="M244 46 L290 36 L290 266 L244 274 Z" fill={`url(#${id('red')})`} opacity="0.9" />
      <path d="M290 36 L303 42 L303 262 L290 266 Z" fill={`url(#${id('redSide')})`} opacity="0.9" />
      <path d="M244 46 L290 36 L303 42 L257 52 Z" fill="#f26a6f" opacity="0.85" />
      <path d="M226 150 L242 147 L242 276 L226 279 Z" fill={RED} opacity="0.35" />

      {/* Glass Foundation Plate (cube) */}
      <path d="M117 106 L117 250" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="0.8" />
      <path d="M60 262 L117 250 L262 268" fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="0.8" />
      <path d="M60 116 L205 132 L205 282 L60 262 Z" fill={`url(#${id('glassL')})`} />
      <path d="M205 132 L262 122 L262 268 L205 282 Z" fill={`url(#${id('glassR')})`} />
      <path d="M60 116 L117 106 L262 122 L205 132 Z" fill="#ffffff" fillOpacity="0.55" />
      <path
        d="M60 116 L205 132 L262 122 M205 132 L205 282 M60 116 L60 262 L205 282 L262 268 L262 122 L117 106 L60 116"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M64 120 L201 135 M64 258 L201 277" stroke="#b8bcbf" strokeWidth="0.5" opacity="0.7" />
      <g transform="matrix(1 0.11 0 1 92 182)" fill="#2a2a2a" fillOpacity="0.72">
        <text x="0" y="0" className="df-object__etch-num">01</text>
        <text x="0" y="22" className="df-object__etch">DIGITAL</text>
        <text x="0" y="33" className="df-object__etch">FOUNDATION</text>
      </g>

      {/* Front threshold plate, over the glass */}
      <path d="M286 118 L332 110 L332 272 L286 280 Z" fill={`url(#${id('red')})`} opacity="0.72" />
      <path d="M332 110 L342 115 L342 268 L332 272 Z" fill={`url(#${id('redSide')})`} opacity="0.75" />
      <path d="M286 118 L332 110 L342 115 L296 123 Z" fill="#f47a7e" opacity="0.8" />
      <path d="M290 122 L290 276 M336 113 L336 270" stroke="#ff9a9d" strokeWidth="0.6" opacity="0.6" />

      {/* Red reflection on the plinth */}
      <path d="M230 270 L344 262 L356 286 L246 296 Z" fill={`url(#${id('reflect')})`} />
    </svg>
  );
}

/** P04–P06 — red glass columns among stone blocks, behind the headline. */
export function DfCrownObject({ variant = 'P04' }: { variant?: 'P04' | 'P05' | 'P06' | 'OVERVIEW' }) {
  const uid = useId().replace(/:/g, '');
  const id = (n: string) => `dfc-${uid}-${n}`;
  if (DF_ARCHITECTURE_RENDERS.crown) {
    return <img className="df-object__render" src={DF_ARCHITECTURE_RENDERS.crown} alt="" aria-hidden="true" />;
  }
  const lift = variant === 'P06' ? -14 : variant === 'P05' ? 18 : 0;
  return (
    <svg className="df-object__svg" viewBox="0 0 180 320" preserveAspectRatio="xMaxYMin meet" aria-hidden="true" focusable="false">
      <defs>
        <RedGlass id={id('red')} />
        <RedGlass id={id('redSide')} top="#b8141b" bottom="#6f070b" />
        <linearGradient id={id('stone')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e4e3df" />
          <stop offset="1" stopColor="#cfcdc8" />
        </linearGradient>
        <linearGradient id={id('fadeB')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.55" stopColor="#f3f2ef" stopOpacity="0" />
          <stop offset="1" stopColor="#f3f2ef" stopOpacity="1" />
        </linearGradient>
        <linearGradient id={id('fadeL')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f3f2ef" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#f3f2ef" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Stone mass */}
      <path d="M72 0 L180 0 L180 228 L72 244 Z" fill={`url(#${id('stone')})`} />
      <path d="M52 8 L72 0 L72 244 L52 236 Z" fill="#c9c7c2" />
      <path d="M24 46 L120 34 L120 74 L24 86 Z" fill="#e9e8e4" />
      <path d="M24 86 L120 74 L120 84 L24 96 Z" fill="#cfcdc8" />
      <path d="M96 14 C120 20 140 12 170 24 M84 150 C110 146 130 160 172 150 M90 200 C120 196 150 206 176 198" stroke="#b9b7b2" strokeWidth="0.6" fill="none" opacity="0.6" />
      {/* Red glass column */}
      <path d={`M78 ${46 + lift} L128 ${36 + lift} L128 262 L78 274 Z`} fill={`url(#${id('red')})`} opacity="0.9" />
      <path d={`M128 ${36 + lift} L144 ${44 + lift} L144 256 L128 262 Z`} fill={`url(#${id('redSide')})`} opacity="0.88" />
      <path d={`M78 ${46 + lift} L128 ${36 + lift} L144 ${44 + lift} L94 ${54 + lift} Z`} fill="#f26a6f" opacity="0.85" />
      <path d={`M84 ${52 + lift} L84 270 M122 ${42 + lift} L122 262`} stroke="#ff9a9d" strokeWidth="0.7" opacity="0.55" />
      {variant === 'P06' && <path d="M140 120 L172 114 L172 268 L140 274 Z" fill={`url(#${id('red')})`} opacity="0.6" />}
      {variant === 'P05' && <path d="M60 150 L82 146 L82 280 L60 284 Z" fill={RED} opacity="0.4" />}
      {/* Glass panes */}
      <path d="M36 104 L82 96 L82 300 L36 310 Z" fill="#ffffff" fillOpacity="0.38" stroke="#ffffff" strokeWidth="1" />
      <path d="M118 136 L172 126 L172 310 L118 318 Z" fill="#ffffff" fillOpacity="0.3" stroke="#ffffff" strokeWidth="1" />
      <path d="M150 170 L180 166 L180 320 L150 320 Z" fill="#d8d6d1" />
      <rect x="0" y="0" width="180" height="320" fill={`url(#${id('fadeL')})`} />
      <rect x="0" y="0" width="180" height="320" fill={`url(#${id('fadeB')})`} />
    </svg>
  );
}

/** P02 onward — the red prism fragment at the bottom-right corner. */
export function DfCornerFragment() {
  const uid = useId().replace(/:/g, '');
  const id = (n: string) => `dff-${uid}-${n}`;
  if (DF_ARCHITECTURE_RENDERS.corner) {
    return <img className="df-object__render" src={DF_ARCHITECTURE_RENDERS.corner} alt="" aria-hidden="true" />;
  }
  return (
    <svg className="df-object__svg" viewBox="0 0 120 90" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">
      <defs>
        <RedGlass id={id('red')} />
        <linearGradient id={id('fade')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f3f2ef" stopOpacity="1" />
          <stop offset="0.4" stopColor="#f3f2ef" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M20 60 L120 30 L120 90 L0 90 Z" fill="#e6e5e1" />
      <path d="M36 70 L84 52 L120 62 L72 82 Z" fill="#ffffff" fillOpacity="0.7" />
      <path d="M66 28 L96 18 L96 90 L66 90 Z" fill={`url(#${id('red')})`} opacity="0.88" />
      <path d="M96 18 L106 24 L106 90 L96 90 Z" fill="#8f0a10" opacity="0.85" />
      <path d="M66 28 L96 18 L106 24 L76 34 Z" fill="#f26a6f" opacity="0.85" />
      <path d="M104 44 L120 40 L120 90 L104 90 Z" fill={RED} opacity="0.55" />
      <path d="M48 58 L66 52 L66 90 L48 90 Z" fill={RED} opacity="0.3" />
      <rect x="0" y="0" width="120" height="90" fill={`url(#${id('fade')})`} />
    </svg>
  );
}
