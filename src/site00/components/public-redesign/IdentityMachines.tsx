import type { IdentityMachineId } from '../../config/idnty-public-redesign';
import type { IdentityAuthorityDomain } from '../../lib/identityAuthorityVerification';

/**
 * IDNTY machine scaffolds — live SVG linework, one distinct functional grammar per state:
 *   foundation → orientation / definition (orb on a measured axis)
 *   partial    → components not yet cohering (hex lattice, partial fill, offset beaded line)
 *   evolution  → established identity under intervention (concentric waveform)
 *   authority  → verification (four-point star; five identity-domain nodes in the verification flow)
 * Shared primitives only; the final glossy/material treatment is a Grok asset slot.
 */

const RED = '#e8192c';
const INK = '#1a1a1a';

/*
 * OPUS-CONVERGENCE1: every machine is drawn in AUTHORITY PAGE COORDINATES (390-wide frame, 693 high).
 * The stage box covers page y 28→328, so the SVG viewBox is `0 28 390 300` and every number below is
 * a position measured on the approved authority image. Centre axes: 00 x≈195 · 01 x≈200 · 02 x≈195 ·
 * 03 x≈195. Silhouettes are deliberately different per state (orb · hex lattice · waveform · star).
 */
const STAGE_VIEWBOX = '0 28 390 300';

type MachineProps = {
  /** Authority machine only: which domains the USER has supplied evidence for (provisional). */
  domainsWithEvidence?: Partial<Record<IdentityAuthorityDomain, boolean>>;
  /** Authority machine: show the five identity-domain nodes (verification flow) vs the detail rings. */
  showDomains?: boolean;
  /** Partial machine (REFINE GAPS): callouts for the gaps the person selected. */
  callouts?: string[];
  /** Evolution machine (REVIEW): bracketed areas the person selected. */
  areas?: string[];
  className?: string;
};

function Bead({ x, y, r = 3, hollow = false }: { x: number; y: number; r?: number; hollow?: boolean }) {
  return hollow ? (
    <circle cx={x} cy={y} r={r} fill="#fff" stroke={RED} strokeWidth="0.7" />
  ) : (
    <g>
      <circle cx={x} cy={y} r={r} fill="url(#s00pr-bead)" />
      <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.32} fill="#fff" fillOpacity="0.55" />
    </g>
  );
}

/** Shared gradients — glossy red bead / orb material approximated in live SVG (final material is Grok). */
function MachineDefs() {
  return (
    <defs>
      <radialGradient id="s00pr-bead" cx="0.38" cy="0.34" r="0.75">
        <stop offset="0" stopColor="#ff7a7a" />
        <stop offset="0.45" stopColor={RED} />
        <stop offset="1" stopColor="#8f0a17" />
      </radialGradient>
      <radialGradient id="s00pr-orb" cx="0.4" cy="0.36" r="0.72">
        <stop offset="0" stopColor="#ff8a8a" />
        <stop offset="0.35" stopColor="#f2202f" />
        <stop offset="0.8" stopColor="#b70d1c" />
        <stop offset="1" stopColor="#7d0712" />
      </radialGradient>
      <radialGradient id="s00pr-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={RED} stopOpacity="0.3" />
        <stop offset="0.55" stopColor={RED} stopOpacity="0.08" />
        <stop offset="1" stopColor={RED} stopOpacity="0" />
      </radialGradient>
      <linearGradient id="s00pr-star" x1="0.15" y1="0.1" x2="0.85" y2="0.95">
        <stop offset="0" stopColor="#ff6b6b" />
        <stop offset="0.45" stopColor="#ec1a2c" />
        <stop offset="1" stopColor="#9b0b19" />
      </linearGradient>
      <linearGradient id="s00pr-lattice" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={RED} stopOpacity="0.08" />
        <stop offset="1" stopColor={RED} stopOpacity="0.32" />
      </linearGradient>
    </defs>
  );
}

/* 00 — STARTING AT ZERO: orb on a measured axis inside an egg-shaped field (origin / definition). */
function FoundationMachine({ cx = 195, cy = 199 }: { cx?: number; cy?: number }) {
  return (
    <g>
      <line x1={cx} y1={30} x2={cx} y2={292} stroke={RED} strokeWidth="0.8" />
      <ellipse cx={cx} cy={cy - 28} rx="74" ry="119" fill="none" stroke={RED} strokeOpacity="0.5" strokeWidth="0.6" />
      <ellipse cx={cx} cy={cy - 17} rx="55" ry="97" fill="none" stroke={INK} strokeOpacity="0.55" strokeWidth="0.55" strokeDasharray="0.8 2.2" />
      <ellipse cx={cx} cy={cy - 6} rx="38" ry="70" fill="none" stroke={INK} strokeOpacity="0.35" strokeWidth="0.5" />
      <circle cx={cx} cy={cy} r="30" fill="url(#s00pr-glow)" />
      <circle cx={cx} cy={cy} r="46" fill="none" stroke={RED} strokeOpacity="0.45" strokeWidth="0.55" />
      <circle cx={cx} cy={cy} r="34" fill="none" stroke={INK} strokeOpacity="0.55" strokeWidth="0.55" />
      <line x1={cx - 75} y1={cy} x2={cx + 77} y2={cy} stroke={RED} strokeWidth="0.75" />
      <ellipse cx={cx} cy={cy} rx="62" ry="9" fill="none" stroke={INK} strokeOpacity="0.75" strokeWidth="0.6" />
      <circle cx={cx} cy={cy} r="19" fill="url(#s00pr-orb)" />
      <ellipse cx={cx - 6} cy={cy - 7} rx="6" ry="4" fill="#fff" fillOpacity="0.5" />
      <circle cx={cx + 1} cy={cy - 1} r="1.6" fill="#fff" />
      {[
        [33, 1.4],
        [56, 2.4],
        [84, 3.2],
        [106, 2.6],
        [118, 2],
        [134, 3],
        [152, 2],
        [230, 3],
        [238, 2],
        [252, 3.2],
        [266, 2.4],
      ].map(([y, r]) => (
        <Bead key={y} x={cx} y={y} r={r} />
      ))}
      <Bead x={cx} y={287} r={2.2} hollow />
      <Bead x={cx - 33} y={cy} r={3} />
      <Bead x={cx + 33} y={cy} r={3} />
      <circle cx={cx - 57} cy={cy} r="1.8" fill={INK} />
      <circle cx={cx + 57} cy={cy} r="1.8" fill={INK} />
      {[
        [-38, -88],
        [37, -88],
        [-45, -30],
        [45, 27],
        [-35, 28],
        [53, -55],
        [-58, -6],
      ].map(([dx, dy]) => (
        <circle key={`${dx}:${dy}`} cx={cx + dx} cy={cy + dy} r="1.2" fill={RED} />
      ))}
    </g>
  );
}

/* 01 — SOME PIECES EXIST: elongated hex lattice, partially filled cube core, an offset beaded line
 * (pieces not yet on one axis), drop lines to the floor. */
const PARTIAL_HEX = '200,118 247,146 247,226 200,252 153,226 153,146';

function PartialMachine({ callouts = [] }: { callouts?: string[] }) {
  // Gap callouts sit where the authority draws them (around the lattice), one per selected gap (max 4).
  const slots = [
    { x: 133, y: 98, ax: 'end' as const, line: 'M134 101 L168 118' },
    { x: 266, y: 104, ax: 'start' as const, line: 'M265 107 L232 128' },
    { x: 266, y: 196, ax: 'start' as const, line: 'M265 199 L238 214' },
    { x: 133, y: 214, ax: 'end' as const, line: 'M134 217 L158 214' },
  ];
  return (
    <g>
      {[107, 118, 133, 262, 280, 292].map((x, i) => (
        <line key={x} x1={x} y1={140 + (i % 3) * 10} x2={x} y2={272 + (i % 2) * 14} stroke={RED} strokeOpacity="0.32" strokeWidth="0.55" />
      ))}
      <line x1="162" y1="22" x2="162" y2="178" stroke={RED} strokeWidth="0.7" />
      {[
        [40, 1.8],
        [57, 2.6],
        [90, 3.4],
        [141, 3.6],
      ].map(([y, r]) => (
        <Bead key={y} x={162} y={y} r={r} />
      ))}
      <line x1="200" y1="96" x2="200" y2="296" stroke={RED} strokeWidth="0.8" />
      <polygon points={PARTIAL_HEX} fill="none" stroke={INK} strokeOpacity="0.7" strokeWidth="0.6" />
      <path d="M153 146 200 172 247 146M200 172v80" fill="none" stroke={INK} strokeOpacity="0.45" strokeWidth="0.5" />
      <polygon points="200,150 232,168 232,206 200,224 168,206 168,168" fill="url(#s00pr-lattice)" stroke={RED} strokeOpacity="0.6" strokeWidth="0.6" />
      <polygon points="200,172 222,184 200,196 178,184" fill={RED} fillOpacity="0.22" stroke={RED} strokeOpacity="0.7" strokeWidth="0.55" />
      <polygon points="200,212 230,226 200,240 170,226" fill={RED} fillOpacity="0.55" stroke={RED} strokeWidth="0.6" />
      <path d="M168 168v38M232 168v38M178 184v26M222 184v26" stroke={RED} strokeOpacity="0.45" strokeWidth="0.5" />
      <path d="M118 186h164M200 118 118 186M200 118l82 68" fill="none" stroke={RED} strokeOpacity="0.28" strokeWidth="0.5" />
      <Bead x={200} y={120} r={3} />
      <Bead x={200} y={150} r={3.6} />
      <Bead x={200} y={204} r={4.4} />
      <Bead x={200} y={218} r={3} />
      <Bead x={200} y={252} r={3.6} />
      <circle cx="153" cy="186" r="1.8" fill={INK} />
      <circle cx="247" cy="186" r="1.8" fill={INK} />
      <circle cx="118" cy="186" r="1.5" fill={RED} />
      <circle cx="282" cy="186" r="1.5" fill={RED} />
      {callouts.slice(0, 4).map((label, i) => {
        const s = slots[i];
        const words = label.split(' ');
        const mid = Math.ceil(words.length / 2);
        const lines = words.length > 1 ? [words.slice(0, mid).join(' '), words.slice(mid).join(' ')] : [label];
        const w = Math.max(...lines.map((l) => l.length)) * 3.1 + 6;
        const x0 = s.ax === 'end' ? s.x - w : s.x;
        return (
          <g key={label} data-gap-callout={label}>
            <path d={s.line} stroke={RED} strokeWidth="0.5" fill="none" />
            <rect x={x0} y={s.y - 6} width={w} height={lines.length * 6 + 4} fill="#fff" fillOpacity="0.88" stroke={RED} strokeWidth="0.5" />
            {lines.map((l, j) => (
              <text key={l} x={x0 + 3} y={s.y + j * 6} fontSize="4.6" fill={INK} fontFamily="inherit" letterSpacing="0.03em">
                {l}
              </text>
            ))}
          </g>
        );
      })}
    </g>
  );
}

/* 02 — READY FOR EVOLUTION: established waveform (concentric ellipses) under a horizontal signal. */
function EvolutionMachine({ areas = [] }: { areas?: string[] }) {
  const cx = 195;
  const cy = 224;
  const rings = [
    { rx: 26, ry: 87 },
    { rx: 21, ry: 75 },
    { rx: 16, ry: 62 },
    { rx: 11, ry: 49 },
    { rx: 7, ry: 36 },
  ];
  const lobes: [number, number, boolean][] = [
    [-95, 4, true],
    [-75, 9, false],
    [-58, 15, false],
    [-44, 20, true],
    [-33, 30, false],
    [33, 30, false],
    [44, 20, true],
    [58, 15, false],
    [77, 11, true],
    [95, 6, true],
  ];
  const brackets = [
    { x: 128, label: areas[0] },
    { x: 247, label: areas[1] },
    { x: 271, label: areas[2] },
  ].filter((b) => b.label);
  return (
    <g>
      <ellipse cx={cx} cy={cy - 50} rx="50" ry="125" fill="none" stroke={RED} strokeOpacity="0.4" strokeWidth="0.55" />
      <ellipse cx={cx} cy={cy - 40} rx="38" ry="104" fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="0.5" />
      <line x1={cx} y1="34" x2={cx} y2="312" stroke={RED} strokeWidth="0.8" />
      {rings.map((e, i) => (
        <ellipse key={e.rx} cx={cx} cy={cy - 20 + i * 3} rx={e.rx} ry={e.ry} fill="none" stroke={INK} strokeOpacity="0.8" strokeWidth="0.6" />
      ))}
      <line x1={cx - 98} y1={cy} x2={cx + 98} y2={cy} stroke={RED} strokeWidth="0.75" />
      {lobes.map(([dx, ry, red]) => (
        <ellipse key={dx} cx={cx + dx} cy={cy} rx={Math.max(1.6, ry / 6)} ry={ry} fill="none" stroke={red ? RED : INK} strokeOpacity="0.8" strokeWidth="0.55" />
      ))}
      <ellipse cx={cx} cy={cy - 2} rx="4" ry="23" fill="url(#s00pr-orb)" />
      {[-92, -67, -51, -23, 23, 45, 67, 87].map((dx, i) => (
        <Bead key={dx} x={cx + dx} y={cy} r={i % 3 === 1 ? 3.4 : 2.2} />
      ))}
      {[
        [50, 3],
        [72, 2],
        [100, 3],
        [131, 3.6],
        [162, 3],
        [274, 3.6],
        [287, 3.4],
        [305, 2],
      ].map(([y, r]) => (
        <Bead key={y} x={cx} y={y} r={r} />
      ))}
      {brackets.map((b) => (
        <g key={b.label} data-area-bracket={b.label}>
          <rect x={b.x - 8} y={cy - 26} width="16" height="52" fill="none" stroke={RED} strokeWidth="0.6" strokeDasharray="2 1.5" />
          <text x={b.x < cx ? b.x - 10 : b.x + 10} y={b.x < cx ? cy + 18 : cy - 22} textAnchor={b.x < cx ? 'end' : 'start'} fontSize="4.6" fill={RED} fontFamily="inherit" letterSpacing="0.03em">
            {b.label}
          </text>
        </g>
      ))}
    </g>
  );
}

/* 03 — BUILD READY: four-point authority star. Verification flow adds the five identity-domain nodes. */
const AUTHORITY_NODES: { domain: IdentityAuthorityDomain; x: number; y: number; label: string; lx: number; ly: number; anchor: 'start' | 'middle' | 'end' }[] = [
  { domain: 'STRATEGY', x: 195, y: 125, label: 'STRATEGY', lx: 195, ly: 112, anchor: 'middle' },
  { domain: 'VISUAL', x: 256, y: 179, label: 'VISUAL', lx: 262, ly: 170, anchor: 'start' },
  { domain: 'VOICE', x: 233, y: 236, label: 'VOICE', lx: 243, ly: 243, anchor: 'start' },
  { domain: 'VALUES', x: 158, y: 235, label: 'VALUES', lx: 148, ly: 243, anchor: 'end' },
  { domain: 'EXPERIENCE', x: 135, y: 179, label: 'EXPERIENCE', lx: 151, ly: 170, anchor: 'end' },
];

function AuthorityMachine({ domainsWithEvidence, showDomains = false }: MachineProps) {
  const cx = 195;
  const cy = 185;
  const star = `M${cx} ${cy - 35}C${cx + 4} ${cy - 10} ${cx + 10} ${cy - 4} ${cx + 35} ${cy}C${cx + 10} ${cy + 4} ${cx + 4} ${cy + 10} ${cx} ${cy + 35}C${cx - 4} ${cy + 10} ${cx - 10} ${cy + 4} ${cx - 35} ${cy}C${cx - 10} ${cy - 4} ${cx - 4} ${cy - 10} ${cx} ${cy - 35}Z`;
  return (
    <g>
      <line x1={cx} y1="40" x2={cx} y2="308" stroke={RED} strokeWidth="0.8" />
      <circle cx={cx} cy={cy} r="67" fill="none" stroke={RED} strokeOpacity="0.5" strokeWidth="0.6" />
      <circle cx={cx} cy={cy} r="46" fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="0.5" strokeDasharray="0.8 2" />
      <circle cx={cx} cy={cy} r="34" fill="url(#s00pr-glow)" />
      {showDomains ? (
        <>
          <polygon points={AUTHORITY_NODES.map((n) => `${n.x},${n.y}`).join(' ')} fill="none" stroke={RED} strokeOpacity="0.45" strokeWidth="0.55" />
          <path d={AUTHORITY_NODES.map((n) => `M${cx} ${cy} ${n.x} ${n.y}`).join('')} stroke={RED} strokeOpacity="0.3" strokeWidth="0.5" />
        </>
      ) : (
        <>
          <circle cx={cx} cy={cy} r="84" fill="none" stroke={INK} strokeOpacity="0.25" strokeWidth="0.5" />
          <line x1={cx - 95} y1={cy} x2={cx + 95} y2={cy} stroke={RED} strokeOpacity="0.7" strokeWidth="0.6" />
          {[-67, -46, 46, 67].map((d) => (
            <g key={d}>
              <Bead x={cx + d} y={cy} r={2.2} />
              <Bead x={cx} y={cy + d} r={2.2} />
            </g>
          ))}
        </>
      )}
      <path d={star} fill="url(#s00pr-star)" />
      <path d={`M${cx} ${cy - 35}L${cx} ${cy + 35}M${cx - 35} ${cy}L${cx + 35} ${cy}`} stroke="#fff" strokeOpacity="0.35" strokeWidth="0.5" />
      <circle cx={cx} cy={cy} r="3.2" fill="#fff" fillOpacity="0.95" />
      {showDomains
        ? AUTHORITY_NODES.map((n) => {
            const has = Boolean(domainsWithEvidence?.[n.domain]);
            return (
              <g key={n.domain} data-domain-node={n.domain} data-has-evidence={has}>
                <circle cx={n.x} cy={n.y} r="7" fill="#fff" fillOpacity="0.85" stroke={RED} strokeWidth="0.8" />
                {has ? <circle cx={n.x} cy={n.y} r="4.4" fill="url(#s00pr-bead)" /> : <circle cx={n.x} cy={n.y} r="3" fill="none" stroke={RED} strokeWidth="0.6" />}
                <text x={n.lx} y={n.ly} textAnchor={n.anchor} fontSize="5" fontWeight="600" fill={INK} fontFamily="inherit" letterSpacing="0.06em">
                  {n.label}
                </text>
              </g>
            );
          })
        : null}
      <Bead x={cx} y={63} r={2.4} />
      <Bead x={cx} y={256} r={3} />
      <Bead x={cx} y={270} r={2.2} />
      <Bead x={cx} y={283} r={1.8} />
    </g>
  );
}

export function IdentityMachine({
  machine,
  domainsWithEvidence,
  showDomains,
  callouts,
  areas,
  className,
}: MachineProps & { machine: IdentityMachineId }) {
  return (
    <svg
      className={className}
      viewBox={STAGE_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`IDENTITY ${machine.toUpperCase()} MACHINE`}
      data-identity-machine={machine}
    >
      <MachineDefs />
      {machine === 'foundation' ? <FoundationMachine /> : null}
      {machine === 'partial' ? <PartialMachine callouts={callouts} /> : null}
      {machine === 'evolution' ? <EvolutionMachine areas={areas} /> : null}
      {machine === 'authority' ? <AuthorityMachine domainsWithEvidence={domainsWithEvidence} showDomains={showDomains} /> : null}
    </svg>
  );
}

/* Overview — the spine all four states hang from: one axis, orb, a tilted orbit with outlying nodes. */
export function IdentityOverviewMachine({ className }: { className?: string }) {
  const cx = 207;
  const cy = 195;
  return (
    <svg className={className} viewBox={STAGE_VIEWBOX} preserveAspectRatio="xMidYMid meet" role="img" aria-label="IDENTITY STATE MACHINE" data-identity-machine="overview">
      <MachineDefs />
      <rect x={cx - 66} y="62" width="132" height="226" rx="66" fill="none" stroke={INK} strokeOpacity="0.3" strokeWidth="0.5" />
      <ellipse cx={cx} cy={cy - 14} rx="78" ry="104" fill="none" stroke={INK} strokeOpacity="0.28" strokeWidth="0.5" strokeDasharray="0.8 2.2" />
      <line x1={cx} y1="40" x2={cx} y2="318" stroke={RED} strokeWidth="0.8" />
      <ellipse cx={cx} cy={cy - 8} rx="82" ry="22" fill="none" stroke={RED} strokeOpacity="0.75" strokeWidth="0.6" transform={`rotate(-4 ${cx} ${cy})`} />
      <ellipse cx={cx} cy={cy} rx="48" ry="8" fill="none" stroke={INK} strokeOpacity="0.8" strokeWidth="0.6" />
      <circle cx={cx} cy={cy} r="36" fill="none" stroke={INK} strokeOpacity="0.35" strokeWidth="0.5" />
      <circle cx={cx} cy={cy} r="26" fill="url(#s00pr-glow)" />
      <circle cx={cx} cy={cy} r="25" fill="none" stroke={RED} strokeOpacity="0.4" strokeWidth="0.5" />
      <line x1={cx - 52} y1={cy} x2={cx + 52} y2={cy} stroke={RED} strokeWidth="0.6" />
      <circle cx={cx} cy={cy} r="12.5" fill="url(#s00pr-orb)" />
      <ellipse cx={cx - 4} cy={cy - 5} rx="4" ry="2.6" fill="#fff" fillOpacity="0.5" />
      {[
        [58, 1.6],
        [88, 2.6],
        [105, 2.4],
        [118, 2.4],
        [135, 3.4],
        [165, 1.8],
        [225, 1.8],
        [258, 3.2],
        [290, 3.4],
      ].map(([y, r]) => (
        <Bead key={y} x={cx} y={y} r={r} />
      ))}
      <Bead x={cx + 45} y={cy - 15} r={3.4} />
      <Bead x={cx - 40} y={cy} r={2.2} />
      <Bead x={cx + 50} y={cy} r={2.2} />
      <Bead x={cx - 37} y={cy + 41} r={2.6} />
      <Bead x={cx - 34} y={cy + 59} r={2.2} />
      <circle cx={cx + 45} cy={cy + 47} r="2.2" fill={INK} />
    </svg>
  );
}

/** Compact glyph shown in the panel header (right side). */
export function IdentityMachineGlyph({ machine, className }: { machine: IdentityMachineId; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" role="img" aria-label={`IDENTITY ${machine.toUpperCase()} GLYPH`} data-identity-glyph={machine}>
      {machine === 'foundation' ? (
        <g>
          <circle cx="60" cy="60" r="46" fill="none" stroke={RED} strokeOpacity="0.35" strokeWidth="0.8" />
          <circle cx="60" cy="60" r="32" fill="none" stroke={RED} strokeOpacity="0.5" strokeWidth="0.8" />
          <path d="M60 6v108M6 60h108" stroke={INK} strokeWidth="0.8" />
          <circle cx="60" cy="60" r="11" fill={RED} />
          {[14, 106].map((p) => (
            <g key={p}>
              <circle cx={p} cy="60" r="2.4" fill={INK} />
              <circle cx="60" cy={p} r="2.4" fill={INK} />
            </g>
          ))}
        </g>
      ) : null}
      {machine === 'partial' ? (
        <g>
          <path d="m60 14 44 22v48L60 106 16 84V36z" fill="none" stroke={RED} strokeOpacity="0.6" strokeWidth="0.8" />
          <path d="m60 30 30 15-30 15-30-15z" fill={RED} fillOpacity="0.5" stroke={RED} strokeWidth="0.8" />
          <path d="M16 36l44 24 44-24M60 60v46" stroke={RED} strokeOpacity="0.5" strokeWidth="0.7" fill="none" />
        </g>
      ) : null}
      {machine === 'evolution' ? (
        <g fill="none" stroke={INK} strokeWidth="0.8">
          <line x1="4" y1="60" x2="116" y2="60" stroke={RED} />
          <line x1="60" y1="6" x2="60" y2="114" stroke={RED} />
          {[8, 18, 30, 44].map((rx, i) => (
            <ellipse key={rx} cx="60" cy="60" rx={rx} ry={52 - i * 9} />
          ))}
          <ellipse cx="60" cy="60" rx="3" ry="22" fill={RED} stroke="none" />
          <circle cx="8" cy="60" r="3" fill={RED} stroke="none" />
          <circle cx="112" cy="60" r="3" fill={RED} stroke="none" />
        </g>
      ) : null}
      {machine === 'authority' ? (
        <g>
          <circle cx="60" cy="60" r="44" fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="0.8" />
          <circle cx="60" cy="60" r="30" fill="none" stroke={RED} strokeOpacity="0.5" strokeWidth="0.8" />
          <path d="M60 22c3 22 13 31 34 38-21 7-31 16-34 38-3-22-13-31-34-38 21-7 31-16 34-38z" fill={RED} />
          <circle cx="60" cy="60" r="5" fill="#fff" fillOpacity="0.8" />
        </g>
      ) : null}
    </svg>
  );
}
