/**
 * BLDR / EVOLVE machine scaffolds — live SVG linework.
 *   BuilderTower   → construction / assembly: stacked slabs being assembled, path panels orbiting.
 *   EvolveProperty → controlled intervention in an EXISTING property: three preserved layers with red
 *                    intervention blocks (PRESERVE → INTERVENE → EVOLVE).
 * Final glass/material rendering is Grok (slots MACHINE.BLDR.TOWER / MACHINE.EVOLVE.PROPERTY_TOWER).
 */

const RED = '#e8192c';
const INK = '#1a1a1a';

/*
 * BUILDER tower — drawn in AUTHORITY PAGE COORDINATES (390-wide, 693-high frame). The stage box covers
 * page x 130→320, y 50→310, so viewBox = `130 50 190 260`. Axis x≈210; slabs y≈95→255; the four path
 * panels hug the tower (SITE / SYSTEMS left, WORLD / EXTENSIONS right) as in 01_BLDR_COMMAND_CENTER.
 */
function Slab({ y, w, red = false, dark = false }: { y: number; w: number; red?: boolean; dark?: boolean }) {
  const cx = 210;
  const h = w * 0.2;
  const top = `${cx},${y - h} ${cx + w},${y} ${cx},${y + h} ${cx - w},${y}`;
  return (
    <g>
      <polygon points={top} fill={red ? RED : dark ? '#3a3a3a' : '#ffffff'} fillOpacity={red ? 0.6 : dark ? 0.5 : 0.6} stroke={red ? RED : INK} strokeOpacity={red ? 0.9 : 0.55} strokeWidth="0.5" />
      <path d={`M${cx - w} ${y}v5l${w} ${h}l${w}-${h}v-5`} fill="none" stroke={INK} strokeOpacity="0.45" strokeWidth="0.45" />
      <path d={`M${cx - w * 0.7} ${y + h * 0.3}v${22}M${cx + w * 0.7} ${y + h * 0.3}v${22}`} stroke={INK} strokeOpacity="0.3" strokeWidth="0.4" />
    </g>
  );
}

const PANELS: { label: string; x: number; y: number; w: number; h: number }[] = [
  { label: 'SITE', x: 143, y: 126, w: 38, h: 48 },
  { label: 'SYSTEMS', x: 134, y: 184, w: 42, h: 50 },
  { label: 'WORLD', x: 268, y: 118, w: 38, h: 50 },
  { label: 'EXTENSIONS', x: 276, y: 194, w: 40, h: 50 },
];

export function BuilderTower({ className }: { className?: string }) {
  const slabs = [
    { y: 96, w: 36 },
    { y: 112, w: 40, red: true },
    { y: 132, w: 46 },
    { y: 152, w: 52, red: true },
    { y: 174, w: 56, dark: true },
    { y: 196, w: 58 },
    { y: 218, w: 60, red: true },
    { y: 240, w: 62 },
    { y: 258, w: 64 },
  ];
  return (
    <svg className={className} viewBox="130 50 190 260" preserveAspectRatio="xMidYMid meet" role="img" aria-label="BUILDER ASSEMBLY MACHINE" data-service-machine="builder">
      <line x1="210" y1="52" x2="210" y2="306" stroke={RED} strokeWidth="0.7" />
      {slabs.map((s) => (
        <Slab key={s.y} {...s} />
      ))}
      <path d="M186 80h18v18h-18zM212 66h22v26h-22z" fill={RED} fillOpacity="0.5" stroke={RED} strokeWidth="0.5" />
      <path d="M180 120h24v24h-24zM218 140h26v26h-26zM176 200h20v20h-20zM226 206h22v22h-22z" fill={RED} fillOpacity="0.28" stroke={RED} strokeOpacity="0.8" strokeWidth="0.45" />
      {[58, 76, 104, 142, 186, 230, 266, 284, 298].map((y) => (
        <circle key={y} cx="210" cy={y} r="1.8" fill={RED} />
      ))}
      {PANELS.map((p) => (
        <g key={p.label}>
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx="1.5" fill="#fff" fillOpacity="0.5" stroke={RED} strokeOpacity="0.5" strokeWidth="0.5" />
          <text x={p.x + 3} y={p.y + 7} fontSize="4.2" fontWeight="700" fill={RED} fontFamily="inherit" letterSpacing="0.04em">
            {p.label}
          </text>
          <path d={`M${p.x + p.w / 2 - 7} ${p.y + p.h / 2 + 4}l7-7 7 7-7 7z`} fill={RED} fillOpacity="0.55" stroke={RED} strokeWidth="0.5" />
        </g>
      ))}
    </svg>
  );
}

export function EvolveProperty({ className }: { className?: string }) {
  const layers = [
    { y: 70, w: 92, label: '01' },
    { y: 150, w: 108, label: '02' },
    { y: 230, w: 124, label: '03' },
  ];
  return (
    <svg className={className} viewBox="0 0 400 330" preserveAspectRatio="xMidYMid meet" role="img" aria-label="EVOLVE PROPERTY UNDER INTERVENTION" data-service-machine="evolve">
      <line x1="200" y1="6" x2="200" y2="324" stroke={RED} strokeWidth="1" />
      {layers.map((l, i) => (
        <g key={l.y}>
          <polygon points={`200,${l.y - 16} ${200 + l.w},${l.y} 200,${l.y + 16} ${200 - l.w},${l.y}`} fill="#fff" fillOpacity="0.5" stroke={INK} strokeOpacity="0.6" strokeWidth="0.8" />
          {[-0.66, -0.33, 0, 0.33, 0.66].map((k) => (
            <line key={k} x1={200 + l.w * k} y1={l.y - 14 * (1 - Math.abs(k))} x2={200 + l.w * k} y2={l.y + 40} stroke={INK} strokeOpacity="0.35" strokeWidth="0.7" />
          ))}
          <path d={`M${200 - l.w} ${l.y}v40M${200 + l.w} ${l.y}v40`} stroke={INK} strokeOpacity="0.55" strokeWidth="0.8" />
          <rect x={200 + l.w * (i === 1 ? -0.5 : 0.18)} y={l.y + 8} width={l.w * 0.34} height="26" fill={RED} fillOpacity="0.62" stroke={RED} strokeWidth="0.8" />
          <circle cx={200 + l.w + 22} cy={l.y + 12} r="3" fill={RED} />
        </g>
      ))}
      {[24, 62, 112, 152, 192, 232, 274, 310].map((y) => (
        <circle key={y} cx="200" cy={y} r="2.6" fill={RED} />
      ))}
      <path d="M72 22q90-18 150 6M300 14q60 16 52 60" fill="none" stroke={RED} strokeOpacity="0.4" strokeWidth="0.8" strokeDasharray="2 3" />
    </svg>
  );
}

/** Generic red isometric lattice used in path-panel headers (placeholder for Grok illustration slots). */
export function PathLattice({
  variant,
  className,
}: {
  variant: 'cube' | 'building' | 'terrace' | 'stack' | 'slabs' | 'orbit' | 'layers' | 'star';
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 120 120" role="img" aria-label="PATH ILLUSTRATION" data-path-lattice={variant}>
      {variant === 'orbit' ? (
        <g fill="none" stroke={INK} strokeWidth="0.7">
          {[48, 38, 28, 18].map((r) => (
            <circle key={r} cx="60" cy="60" r={r} strokeOpacity="0.5" />
          ))}
          <path d="M10 60h100M60 10v100" stroke={RED} />
          <circle cx="60" cy="60" r="9" fill={RED} stroke="none" />
          <circle cx="92" cy="40" r="2.6" fill={RED} stroke="none" />
          <circle cx="30" cy="84" r="2.6" fill={INK} stroke="none" />
        </g>
      ) : variant === 'star' ? (
        <g fill="none" stroke={INK} strokeWidth="0.7">
          <circle cx="60" cy="60" r="50" stroke={RED} strokeOpacity="0.45" strokeDasharray="1 3" />
          <path d="M60 14c3 28 14 38 40 46-26 8-37 18-40 46-3-28-14-38-40-46 26-8 37-18 40-46z" fill={RED} fillOpacity="0.55" stroke={RED} />
          <circle cx="60" cy="60" r="5" fill="#fff" stroke="none" />
        </g>
      ) : variant === 'layers' ? (
        <g fill="none" stroke={RED} strokeWidth="0.8">
          {[34, 56, 78].map((y, i) => (
            <path key={y} d={`m60 ${y - 16} 40 16-40 16-40-16z`} fill={i === 1 ? RED : '#fff'} fillOpacity={i === 1 ? 0.5 : 0.3} />
          ))}
          <path d="M60 14v92" stroke={INK} strokeOpacity="0.5" />
        </g>
      ) : variant === 'slabs' ? (
        <g fill="none" stroke={RED} strokeWidth="0.8">
          <path d="m60 14 36 16-36 16-36-16z" fill={RED} fillOpacity="0.55" />
          <path d="m60 48 36 16-36 16-36-16z" fill="#fff" fillOpacity="0.5" stroke={INK} />
          <path d="m60 82 36 16-36 16-36-16z" fill={RED} fillOpacity="0.55" />
        </g>
      ) : (
        <g fill="none" stroke={RED} strokeWidth="0.8">
          <path d="m60 12 44 22v52L60 108 16 86V34z" strokeOpacity="0.7" />
          <path d="m16 34 44 22 44-22M60 56v52" strokeOpacity="0.7" />
          <path d={variant === 'building' ? 'M36 70V44l16 8v26zM68 60V36l20 10v22z' : variant === 'terrace' ? 'M24 80l36-16 36 16M24 66l36-16 36 16' : 'M40 70l20-10 20 10-20 10z'} fill={RED} fillOpacity="0.5" />
          <circle cx="60" cy="56" r="3" fill={RED} stroke="none" />
        </g>
      )}
    </svg>
  );
}

/** Five framework-step glyphs (orbit, layers, rings, hex, helix) shared by every BLDR path panel. */
export function FrameworkGlyph({ index, className }: { index: number; className?: string }) {
  const k = index % 5;
  return (
    <svg className={className} viewBox="0 0 80 80" aria-hidden="true" focusable="false" data-framework-glyph={k}>
      <g fill="none" strokeWidth="0.8" stroke={INK}>
        {k === 0 ? (
          <>
            <circle cx="40" cy="40" r="30" strokeOpacity="0.45" />
            <circle cx="40" cy="40" r="18" strokeOpacity="0.45" />
            <circle cx="40" cy="40" r="8" fill={RED} stroke="none" />
            <circle cx="62" cy="22" r="3" fill={RED} stroke="none" />
          </>
        ) : null}
        {k === 1 ? (
          <>
            <path d="m40 12 28 14-28 14-28-14z" fill={RED} fillOpacity="0.25" stroke={RED} />
            <path d="m12 40 28 14 28-14M12 54l28 14 28-14" strokeOpacity="0.55" />
          </>
        ) : null}
        {k === 2 ? (
          <>
            {[20, 32, 44, 56].map((y) => (
              <ellipse key={y} cx="40" cy={y} rx="26" ry="8" stroke={RED} strokeOpacity="0.7" />
            ))}
            <path d="M40 8v64" />
          </>
        ) : null}
        {k === 3 ? (
          <>
            <path d="m40 8 26 16v32L40 72 14 56V24z" strokeOpacity="0.6" />
            <path d="m14 24 26 16 26-16M40 40v32" strokeOpacity="0.6" />
            <circle cx="40" cy="40" r="5" fill={RED} stroke="none" />
          </>
        ) : null}
        {k === 4 ? (
          <>
            <path d="M20 14c34 4 34 12 0 16s-34 12 0 16 34 12 0 16" stroke={INK} strokeOpacity="0.6" />
            <circle cx="40" cy="22" r="3" fill={RED} stroke="none" />
            <circle cx="40" cy="46" r="3" fill={RED} stroke="none" />
          </>
        ) : null}
      </g>
    </svg>
  );
}
