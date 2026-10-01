import type { IdentityMachineId } from '../../config/idnty-public-redesign';
import type { IdentityAuthorityDomain } from '../../lib/identityAuthorityVerification';

/**
 * IDNTY machine scaffolds — live SVG linework, one distinct functional grammar per state:
 *   foundation → orientation / definition (orb on a measured axis)
 *   partial    → components not yet cohering (hex lattice, partial fill)
 *   evolution  → established identity under intervention (concentric waveform)
 *   authority  → verification (star with five identity-domain nodes)
 * Shared primitives only; the final glossy/material treatment is a Grok asset slot.
 */

const RED = '#e8192c';
const INK = '#1a1a1a';

type MachineProps = {
  /** Authority machine only: which domains the USER has supplied evidence for (provisional). */
  domainsWithEvidence?: Partial<Record<IdentityAuthorityDomain, boolean>>;
  className?: string;
};

function Beads({ x, ys, r = 4 }: { x: number; ys: number[]; r?: number }) {
  return (
    <>
      {ys.map((y, i) => (
        <circle key={y} cx={x} cy={y} r={i % 3 === 0 ? r + 1.5 : r} fill={RED} />
      ))}
    </>
  );
}

function FoundationMachine() {
  return (
    <g>
      <defs>
        <radialGradient id="s00pr-orb" cx="42%" cy="38%" r="70%">
          <stop offset="0" stopColor="#ff6a6a" />
          <stop offset="0.45" stopColor={RED} />
          <stop offset="1" stopColor="#9d0f1e" />
        </radialGradient>
        <radialGradient id="s00pr-orb-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={RED} stopOpacity="0.28" />
          <stop offset="1" stopColor={RED} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="270" rx="150" ry="230" fill="none" stroke={RED} strokeOpacity="0.45" strokeWidth="0.9" />
      <ellipse cx="200" cy="270" rx="118" ry="178" fill="none" stroke={INK} strokeOpacity="0.55" strokeWidth="0.8" strokeDasharray="1 3" />
      <line x1="200" y1="20" x2="200" y2="520" stroke={RED} strokeWidth="0.9" />
      <circle cx="200" cy="270" r="96" fill="url(#s00pr-orb-glow)" />
      <circle cx="200" cy="270" r="84" fill="none" stroke={RED} strokeOpacity="0.5" strokeWidth="0.8" />
      <circle cx="200" cy="270" r="66" fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="0.8" />
      <ellipse cx="200" cy="270" rx="150" ry="26" fill="none" stroke={INK} strokeOpacity="0.7" strokeWidth="0.9" />
      <line x1="60" y1="270" x2="340" y2="270" stroke={RED} strokeWidth="0.8" />
      <circle cx="200" cy="270" r="44" fill="url(#s00pr-orb)" />
      <circle cx="188" cy="256" r="10" fill="#fff" fillOpacity="0.55" />
      <Beads x={200} ys={[48, 78, 104, 136, 168, 196, 340, 372, 408, 444, 482]} />
      <circle cx="104" cy="270" r="4" fill={RED} />
      <circle cx="296" cy="270" r="4" fill={RED} />
      <circle cx="140" cy="270" r="3" fill={RED} />
      <circle cx="260" cy="270" r="3" fill={RED} />
    </g>
  );
}

function PartialMachine() {
  const hex = '200,150 282,200 282,300 200,350 118,300 118,200';
  return (
    <g>
      <line x1="200" y1="10" x2="200" y2="470" stroke={RED} strokeWidth="0.9" />
      <Beads x={200} ys={[40, 70, 100, 132, 168, 205]} r={4.5} />
      <polygon points={hex} fill="none" stroke={INK} strokeOpacity="0.75" strokeWidth="0.9" />
      <polygon points="200,178 258,212 258,288 200,322 142,288 142,212" fill={RED} fillOpacity="0.12" stroke={RED} strokeOpacity="0.7" strokeWidth="0.8" />
      <polygon points="200,226 246,252 200,278 154,252" fill={RED} fillOpacity="0.45" stroke={RED} strokeWidth="0.9" />
      <path d="M118 200 200 250 282 200M118 300 200 250 282 300M200 150v200" fill="none" stroke={RED} strokeOpacity="0.6" strokeWidth="0.8" />
      <path d="M142 212v76M258 212v76" stroke={INK} strokeOpacity="0.5" strokeWidth="0.8" />
      <circle cx="200" cy="150" r="5" fill={RED} />
      <circle cx="200" cy="250" r="5" fill={RED} />
      <circle cx="200" cy="350" r="5" fill={RED} />
      <circle cx="118" cy="200" r="3" fill={INK} />
      <circle cx="282" cy="300" r="3" fill={INK} />
      {[96, 150, 232, 286, 330].map((x, i) => (
        <line key={x} x1={x + 4 * i} y1="300" x2={x + 4 * i} y2={420 + (i % 2) * 24} stroke={RED} strokeOpacity="0.4" strokeWidth="0.7" />
      ))}
    </g>
  );
}

function EvolutionMachine() {
  const ellipses = [
    { rx: 60, ry: 190 },
    { rx: 44, ry: 150 },
    { rx: 30, ry: 112 },
    { rx: 18, ry: 78 },
    { rx: 8, ry: 46 },
  ];
  const lobes = [-170, -140, -112, -86, -62, -42, 42, 62, 86, 112, 140, 170];
  return (
    <g>
      <line x1="200" y1="14" x2="200" y2="520" stroke={RED} strokeWidth="0.9" />
      {ellipses.map((e) => (
        <ellipse key={e.rx} cx="200" cy="270" rx={e.rx} ry={e.ry} fill="none" stroke={INK} strokeOpacity="0.7" strokeWidth="0.85" />
      ))}
      <ellipse cx="200" cy="270" rx="5" ry="40" fill={RED} />
      <line x1="30" y1="270" x2="370" y2="270" stroke={RED} strokeWidth="0.9" />
      {lobes.map((dx, i) => {
        const a = Math.abs(dx);
        const ry = Math.max(14, 76 - a * 0.34);
        return (
          <g key={dx}>
            <ellipse cx={200 + dx} cy="270" rx={Math.max(3, 16 - a * 0.05)} ry={ry} fill="none" stroke={i % 3 === 0 ? RED : INK} strokeOpacity="0.7" strokeWidth="0.8" />
            <circle cx={200 + dx} cy="270" r={i % 2 === 0 ? 4 : 2.6} fill={RED} />
          </g>
        );
      })}
      <Beads x={200} ys={[32, 74, 120, 168, 372, 420, 468, 504]} r={4} />
    </g>
  );
}

const AUTHORITY_NODES: { domain: IdentityAuthorityDomain; x: number; y: number; label: string; anchor: 'start' | 'middle' | 'end'; dx: number; dy: number }[] = [
  { domain: 'STRATEGY', x: 200, y: 56, label: 'STRATEGY', anchor: 'middle', dx: 0, dy: -18 },
  { domain: 'VISUAL', x: 318, y: 142, label: 'VISUAL', anchor: 'start', dx: 14, dy: 4 },
  { domain: 'VOICE', x: 274, y: 282, label: 'VOICE', anchor: 'start', dx: 14, dy: 18 },
  { domain: 'VALUES', x: 126, y: 282, label: 'VALUES', anchor: 'end', dx: -14, dy: 18 },
  { domain: 'EXPERIENCE', x: 82, y: 142, label: 'EXPERIENCE', anchor: 'end', dx: -14, dy: 4 },
];

function AuthorityMachine({ domainsWithEvidence }: MachineProps) {
  return (
    <g>
      <defs>
        <linearGradient id="s00pr-star" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff5b5b" />
          <stop offset="0.5" stopColor={RED} />
          <stop offset="1" stopColor="#a30f20" />
        </linearGradient>
      </defs>
      <line x1="200" y1="10" x2="200" y2="400" stroke={RED} strokeWidth="0.9" />
      <circle cx="200" cy="170" r="140" fill="none" stroke={RED} strokeOpacity="0.5" strokeWidth="0.8" />
      <circle cx="200" cy="170" r="112" fill="none" stroke={INK} strokeOpacity="0.3" strokeWidth="0.7" strokeDasharray="1 3" />
      <polygon points={AUTHORITY_NODES.map((n) => `${n.x},${n.y}`).join(' ')} fill="none" stroke={RED} strokeOpacity="0.55" strokeWidth="0.8" />
      <path d="M200 170 318 142M200 170 274 282M200 170 126 282M200 170 82 142M200 170 200 56" stroke={RED} strokeOpacity="0.4" strokeWidth="0.7" />
      <path d="M200 98c6 40 22 56 62 72-40 16-56 32-62 72-6-40-22-56-62-72 40-16 56-32 62-72z" fill="url(#s00pr-star)" />
      <circle cx="200" cy="170" r="9" fill="#fff" fillOpacity="0.7" />
      {AUTHORITY_NODES.map((n) => {
        const has = Boolean(domainsWithEvidence?.[n.domain]);
        return (
          <g key={n.domain}>
            <circle cx={n.x} cy={n.y} r="12" fill="none" stroke={RED} strokeWidth="1" />
            <circle cx={n.x} cy={n.y} r="6" fill={has ? RED : '#fff'} stroke={RED} strokeWidth={has ? 0 : 1} />
            <text x={n.x + n.dx} y={n.y + n.dy} textAnchor={n.anchor} fontSize="10" fill={INK} fontFamily="inherit" letterSpacing="0.04em">
              {n.label}
            </text>
          </g>
        );
      })}
      <Beads x={200} ys={[320, 352, 382]} r={4} />
    </g>
  );
}

const VIEWBOX: Record<IdentityMachineId, string> = {
  foundation: '0 0 400 540',
  partial: '0 0 400 480',
  evolution: '0 0 400 540',
  authority: '0 0 400 400',
};

export function IdentityMachine({
  machine,
  domainsWithEvidence,
  className,
}: MachineProps & { machine: IdentityMachineId }) {
  return (
    <svg
      className={className}
      viewBox={VIEWBOX[machine]}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`IDENTITY ${machine.toUpperCase()} MACHINE`}
      data-identity-machine={machine}
    >
      {machine === 'foundation' ? <FoundationMachine /> : null}
      {machine === 'partial' ? <PartialMachine /> : null}
      {machine === 'evolution' ? <EvolutionMachine /> : null}
      {machine === 'authority' ? <AuthorityMachine domainsWithEvidence={domainsWithEvidence} /> : null}
    </svg>
  );
}

/** Overview machine — the spine all four states hang from: axis, orb, orbit, four state nodes. */
export function IdentityOverviewMachine({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 540" preserveAspectRatio="xMidYMid meet" role="img" aria-label="IDENTITY STATE MACHINE" data-identity-machine="overview">
      <FoundationMachine />
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
