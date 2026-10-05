import type { ComponentType } from 'react';
import type { SpecimenImageAsset, TerritoryViewProps } from '../TerritoryRendererRegistry';
import { AssetProvenanceTag, HybridAssetLayer, paletteFromGrayscale, SpecimenFrame } from '../shared/SpecimenFrame';
import { NDXBOOK_VOLUMES, PAGE_001_REFERENCE } from '../shared/volumes';

// KINETIC FIELD — terminal black field, rose/orange/deep-purple momentum spectrum.
// Distinct from Editorial's lime and Signal's cobalt — motion is the governing grammar, not neon decoration.
const KF = { primary: '#0A0A0C', secondary: '#F2F0EC', accent: '#FF2E7E', accent2: '#FF7A2E', accent3: '#5B21B6' };

function KineticTitleFrame({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, KF);
  return (
    <svg viewBox="0 0 360 120" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="360" height="120" fill={c.primary} />
      <text x="20" y="72" fill={c.secondary} fontSize="48" fontWeight="900" letterSpacing="-2">NDX</text>
      <text x="140" y="72" fill={c.accent} fontSize="48" fontWeight="900" opacity="0.95">BOOK</text>
      <line x1="20" y1="88" x2="340" y2="88" stroke={c.accent} strokeWidth="2" opacity="0.7" />
      <text x="20" y="106" fill={c.secondary} fontSize="7" letterSpacing="3" opacity="0.6">EVERYTHING MOVES SOMETHING</text>
    </svg>
  );
}

function KineticHook916({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, KF);
  return (
    <svg viewBox="0 0 108 192" className="site00-cd-specimen__svg" aria-hidden="true">
      <defs>
        <radialGradient id="kfhook" cx="30%" cy="70%" r="70%">
          <stop offset="0%" stopColor={c.accent} stopOpacity="0.55" />
          <stop offset="100%" stopColor={c.primary} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="108" height="192" fill={c.primary} />
      <rect width="108" height="192" fill="url(#kfhook)" />
      <text x="-8" y="100" fill={c.secondary} fontSize="30" fontWeight="900" transform="rotate(-90 54 100)">DEBT HAS GRAVITY</text>
      <rect x="8" y="150" width="92" height="28" fill={c.accent} opacity="0.25" />
      <text x="14" y="168" fill={c.secondary} fontSize="6">MASSIVE MOMENTUM · 9:16</text>
    </svg>
  );
}

function KineticPage001({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, KF);
  return (
    <svg viewBox="0 0 108 192" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="108" height="192" fill={c.primary} />
      <text x="8" y="40" fill={c.accent} fontSize="28" fontWeight="900">{PAGE_001_REFERENCE.id.split(' ')[1]}</text>
      <text x="8" y="100" fill={c.secondary} fontSize="11" fontWeight="700">ONE DECISION</text>
      <text x="8" y="118" fill={c.secondary} fontSize="11" fontWeight="700">CHANGES TRAJECTORY</text>
      <path d="M8 130 Q54 110 100 130" stroke={c.accent} strokeWidth="3" fill="none" />
      <text x="8" y="168" fill={c.secondary} fontSize="5" opacity="0.7">{PAGE_001_REFERENCE.volume}</text>
    </svg>
  );
}

function KineticMotionSequence({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, KF);
  return (
    <svg viewBox="0 0 360 120" className="site00-cd-specimen__svg site00-cd-specimen__svg--scroll" aria-hidden="true">
      {[
        { label: 'SPARK', accent: c.accent },
        { label: 'IGNITE', accent: c.accent2 },
        { label: 'BURN', accent: c.accent3 },
      ].map((frame, i) => (
        <g key={frame.label} transform={`translate(${8 + i * 118}, 8)`}>
          <rect width="110" height="104" fill={c.primary} stroke={frame.accent} strokeWidth="0.75" />
          <circle cx={30 + i * 8} cy="52" r={8 + i * 6} fill={frame.accent} opacity="0.7" />
          <text x="12" y="92" fill={frame.accent} fontSize="6">{frame.label}</text>
        </g>
      ))}
    </svg>
  );
}

function KineticPageTransition({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, KF);
  return (
    <svg viewBox="0 0 280 80" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="280" height="80" fill={c.primary} />
      <text x="24" y="52" fill={c.secondary} fontSize="32" fontWeight="900">001</text>
      <path d="M120 40 L160 40" stroke={c.accent} strokeWidth="2" markerEnd="url(#kfarr)" />
      <text x="180" y="52" fill={c.accent} fontSize="32" fontWeight="900">002</text>
      <defs>
        <marker id="kfarr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill={c.accent} />
        </marker>
      </defs>
    </svg>
  );
}

function KineticVolumeStinger({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, KF);
  const hues = [c.accent, c.accent2, c.accent3];
  return (
    <svg viewBox="0 0 400 60" className="site00-cd-specimen__svg site00-cd-specimen__svg--scroll" aria-hidden="true">
      {NDXBOOK_VOLUMES.map((vol, i) => (
        <g key={vol} transform={`translate(${8 + i * 78}, 8)`}>
          <rect width="70" height="44" fill={c.primary} stroke={hues[i % hues.length]} strokeWidth="0.75" />
          <text x="8" y="28" fill={c.secondary} fontSize="9" fontWeight="800">{vol}</text>
        </g>
      ))}
    </svg>
  );
}

function KineticFeedTile({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, KF);
  return (
    <svg viewBox="0 0 120 120" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="120" height="120" fill={c.primary} />
      <text x="8" y="64" fill={c.secondary} fontSize="22" fontWeight="900">NDX</text>
      <rect x="8" y="72" width="48" height="4" fill={c.accent} />
    </svg>
  );
}

function KineticSignalGraphic({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, KF);
  return (
    <svg viewBox="0 0 280 120" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="280" height="120" fill={c.primary} />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={20 + i * 50} y1="100" x2={40 + i * 50} y2={30 + (i % 3) * 15} stroke={c.accent} strokeWidth="1.5" opacity="0.7" />
      ))}
      <circle cx="240" cy="40" r="12" fill="none" stroke={c.secondary} strokeWidth="1" />
    </svg>
  );
}

function KineticTypography({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, KF);
  return (
    <svg viewBox="0 0 320 140" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="320" height="140" fill={c.primary} />
      <text x="16" y="56" fill={c.secondary} fontSize="36" fontWeight="900" letterSpacing="-1">MOMENTUM</text>
      <text x="16" y="88" fill={c.accent} fontSize="14" fontWeight="800">COMPRESSED HOOK</text>
      <text x="16" y="112" fill={c.secondary} fontSize="7" opacity="0.6">tabular nums · velocity metadata</text>
    </svg>
  );
}

function KineticDarkLight({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, KF);
  return (
    <svg viewBox="0 0 280 100" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect x="0" y="0" width="130" height="100" fill={c.primary} />
      <text x="16" y="56" fill={c.secondary} fontSize="14" fontWeight="800">DARK</text>
      <rect x="150" y="0" width="130" height="100" fill={c.secondary} />
      <text x="166" y="56" fill={c.primary} fontSize="14" fontWeight="800">LIGHT</text>
    </svg>
  );
}

function KineticMotionStoryboard({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, KF);
  const hues = [c.accent, c.accent2, c.accent3, c.accent, c.accent2, c.accent3];
  return (
    <svg viewBox="0 0 600 100" className="site00-cd-specimen__svg site00-cd-specimen__svg--scroll" aria-hidden="true">
      {['FORCE APPLIED', 'RESISTANCE', 'IMPACT', 'BREAKPOINT', 'NEW TRAJECTORY'].map((frame, i) => (
        <g key={frame} transform={`translate(${8 + i * 118}, 8)`}>
          <rect width="110" height="84" fill={c.primary} stroke={hues[i]} strokeWidth="0.5" />
          <text x="8" y="48" fill={c.secondary} fontSize="7" fontWeight="800">{frame}</text>
          <text x="8" y="72" fill={hues[i]} fontSize="5">{i * 120}ms</text>
        </g>
      ))}
    </svg>
  );
}

function KineticWordmark({ gs }: { gs?: boolean }) {
  return <KineticTitleFrame gs={gs} />;
}

// ----------------------------------------------------------------- MOTION-PRINCIPLE BRANCHES (Section II.03)

function MotionPush({ gs, asset }: { gs?: boolean; asset?: SpecimenImageAsset }) {
  const c = paletteFromGrayscale(gs, KF);
  return (
    <div className="site00-cd-specimen__stage" style={{ aspectRatio: '3 / 4', background: c.primary }}>
      {asset ? <HybridAssetLayer asset={asset} gs={gs} /> : null}
      <svg viewBox="0 0 280 373" className="site00-cd-specimen__svg" aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        <rect x="0" y="0" width="280" height="60" fill={c.primary} opacity="0.78" />
        <text x="16" y="26" fill={c.secondary} fontSize="8" letterSpacing="2">01 · THE PUSH</text>
        <text x="16" y="48" fill={c.accent} fontSize="14" fontWeight="800">YOU PUSH FIRST.</text>
      </svg>
    </div>
  );
}

function MotionPull({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, KF);
  return (
    <svg viewBox="0 0 260 160" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="260" height="160" fill={c.primary} />
      <text x="16" y="24" fill={c.secondary} fontSize="7" letterSpacing="2">02 · THE PULL</text>
      <circle cx="200" cy="90" r="4" fill={c.accent2} />
      {[70, 100, 130, 160].map((r, i) => (
        <circle key={r} cx="200" cy="90" r={r * 0.5} fill="none" stroke={c.accent2} strokeWidth="0.75" opacity={0.6 - i * 0.12} />
      ))}
      <text x="16" y="140" fill={c.secondary} fontSize="6" opacity="0.75">SOME THINGS PULL YOU BACK.</text>
    </svg>
  );
}

function MotionRipple({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, KF);
  return (
    <svg viewBox="0 0 260 160" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="260" height="160" fill={c.primary} />
      <text x="16" y="24" fill={c.secondary} fontSize="7" letterSpacing="2">03 · THE RIPPLE</text>
      {[18, 34, 50, 66].map((r, i) => (
        <circle key={r} cx="80" cy="100" r={r} fill="none" stroke={c.accent} strokeWidth="1" opacity={0.85 - i * 0.18} />
      ))}
      <text x="150" y="104" fill={c.secondary} fontSize="6" opacity="0.75">ONE CHOICE AFFECTS MORE THAN YOU THINK.</text>
    </svg>
  );
}

function MotionCollision({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, KF);
  return (
    <svg viewBox="0 0 260 160" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="260" height="160" fill={c.primary} />
      <text x="16" y="24" fill={c.secondary} fontSize="7" letterSpacing="2">04 · THE COLLISION</text>
      <circle cx="90" cy="100" r="22" fill={c.accent} opacity="0.8" />
      <circle cx="160" cy="100" r="16" fill={c.accent3} opacity="0.8" />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1="125" y1="100" x2={140 + i * 14} y2={100 - 18 + i * 9} stroke={c.accent2} strokeWidth="1.5" />
      ))}
      <text x="16" y="140" fill={c.secondary} fontSize="6" fontFamily="monospace">A + B = CHOICE COLLIDES. CONSEQUENCES TRAVEL FARTHER THAN YOU EXPECT.</text>
    </svg>
  );
}

function MotionCurrent({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, KF);
  return (
    <svg viewBox="0 0 300 140" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="300" height="140" fill={c.primary} />
      <text x="16" y="24" fill={c.secondary} fontSize="7" letterSpacing="2">05 · THE CURRENT</text>
      <path d="M16 90 C 80 60, 120 120, 180 80 S 260 60, 284 90" fill="none" stroke={c.accent3} strokeWidth="2" />
      <path d="M16 100 C 80 70, 120 130, 180 90 S 260 70, 284 100" fill="none" stroke={c.accent3} strokeWidth="1" opacity="0.5" />
      <text x="16" y="122" fill={c.secondary} fontSize="6" opacity="0.75">LIFE HAS CURRENTS. YOU CAN FIGHT THEM OR MOVE WITH THEM.</text>
    </svg>
  );
}

function MotionTrajectory({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, KF);
  return (
    <svg viewBox="0 0 280 160" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="280" height="160" fill={c.primary} />
      <text x="16" y="24" fill={c.secondary} fontSize="7" letterSpacing="2">06 · THE TRAJECTORY</text>
      <path d="M16 130 L100 100 L180 110 L260 40" fill="none" stroke={c.accent2} strokeWidth="2" strokeLinecap="round" />
      <circle cx="260" cy="40" r="5" fill={c.accent2} />
      <text x="16" y="148" fill={c.secondary} fontSize="6" fontFamily="monospace">DIRECTION IS EVERYTHING. SMALL SHIFTS CHANGE THE ENTIRE PATH.</text>
    </svg>
  );
}

function MotionBuild({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, KF);
  return (
    <svg viewBox="0 0 240 160" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="240" height="160" fill={c.primary} />
      <text x="16" y="24" fill={c.secondary} fontSize="7" letterSpacing="2">07 · THE BUILD</text>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={20 + i * 40} y={130 - i * 18} width="30" height={i * 18 + 10} fill={c.accent} opacity={0.5 + i * 0.1} />
      ))}
      <text x="16" y="148" fill={c.secondary} fontSize="6" fontFamily="monospace">CONSISTENT MOVES STACK. STACK IT.</text>
    </svg>
  );
}

function MotionBreak({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, KF);
  return (
    <svg viewBox="0 0 240 160" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="240" height="160" fill={c.primary} />
      <text x="16" y="24" fill={c.secondary} fontSize="7" letterSpacing="2">08 · THE BREAK</text>
      <path d="M40 100 L100 60 L120 100 L160 40 L200 90" fill="none" stroke={c.accent2} strokeWidth="2" />
      <path d="M118 96 L124 104 L112 108" fill="none" stroke={c.accent2} strokeWidth="1.5" opacity="0.8" />
      <text x="16" y="140" fill={c.secondary} fontSize="6" fontFamily="monospace">PRESSURE BREAKS WEAK THINGS. STRONG THINGS BREAK THROUGH.</text>
    </svg>
  );
}

function MotionAftermath({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, KF);
  return (
    <svg viewBox="0 0 240 160" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="240" height="160" fill={c.primary} />
      <text x="16" y="24" fill={c.secondary} fontSize="7" letterSpacing="2">09 · THE AFTERMATH</text>
      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const r = 20 + (i % 3) * 18;
        return (
          <circle key={i} cx={120 + Math.cos(angle) * r} cy={95 + Math.sin(angle) * r} r={1.5 + (i % 3)} fill={c.accent3} opacity="0.75" />
        );
      })}
      <text x="16" y="144" fill={c.secondary} fontSize="6" fontFamily="monospace">EVERY ACTION LEAVES A MARK. LEARN. ADJUST. KEEP MOVING.</text>
    </svg>
  );
}

function MotionMomentum({ gs, asset }: { gs?: boolean; asset?: SpecimenImageAsset }) {
  const c = paletteFromGrayscale(gs, KF);
  return (
    <div className="site00-cd-specimen__stage" style={{ aspectRatio: '4 / 3', background: c.primary }}>
      <svg viewBox="0 0 320 240" className="site00-cd-specimen__svg" aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
        <text x="16" y="24" fill={c.secondary} fontSize="7" letterSpacing="2">10 · THE MOMENTUM</text>
        <path d="M16 210 Q 160 40 300 30" fill="none" stroke={c.accent2} strokeWidth="1.5" strokeDasharray="2 5" opacity="0.7" />
      </svg>
      {asset ? <HybridAssetLayer asset={asset} gs={gs} /> : null}
      <svg viewBox="0 0 320 240" className="site00-cd-specimen__svg" aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        <text x="16" y="228" fill={c.secondary} fontSize="6" fontFamily="monospace" opacity="0.75">YOU DON'T STAY IN MOTION BY ACCIDENT. YOU STAY BY DECISION.</text>
      </svg>
    </div>
  );
}

const SPECIMEN_MAP: Record<string, ComponentType<{ gs?: boolean; asset?: SpecimenImageAsset }>> = {
  motion_title_frame: KineticTitleFrame,
  hook_frame_916: KineticHook916,
  page_001_kinetic: KineticPage001,
  motion_sequence_3frame: KineticMotionSequence,
  page_number_transition: KineticPageTransition,
  volume_stinger: KineticVolumeStinger,
  social_feed_tile: KineticFeedTile,
  signal_graphic: KineticSignalGraphic,
  typography_system: KineticTypography,
  dark_light_inversion: KineticDarkLight,
  motion_storyboard: KineticMotionStoryboard,
  wordmark: KineticWordmark,
  motion_push: MotionPush,
  motion_pull: MotionPull,
  motion_ripple: MotionRipple,
  motion_collision: MotionCollision,
  motion_current: MotionCurrent,
  motion_trajectory: MotionTrajectory,
  motion_build: MotionBuild,
  motion_break: MotionBreak,
  motion_aftermath: MotionAftermath,
  motion_momentum: MotionMomentum,
};

const IMAGE_AWARE_TYPES = new Set(['motion_push', 'motion_momentum']);

export function KineticFieldTerritoryView({ specimens, options }: TerritoryViewProps) {
  const gs = options?.grayscale || options?.structuralDiffMode;
  const hide = options?.hideLabels || options?.structuralDiffMode;

  return (
    <div className="site00-cd-territory site00-cd-territory--kinetic-field">
      <div className="site00-cd-territory__motion-board">
        {specimens.map((spec) => {
          const Comp = SPECIMEN_MAP[spec.specimenType] ?? KineticTitleFrame;
          const layout =
            spec.specimenType === 'hook_frame_916' || spec.specimenType === 'page_001_kinetic' || spec.specimenType === 'motion_push'
              ? 'tall'
              : spec.specimenType.includes('storyboard') ||
                  spec.specimenType.includes('sequence') ||
                  spec.specimenType === 'volume_stinger' ||
                  spec.specimenType === 'motion_title_frame' ||
                  spec.specimenType === 'motion_momentum'
                ? 'wide'
                : spec.specimenType === 'dark_light_inversion'
                  ? 'wide'
                  : 'default';
          const usesImage = IMAGE_AWARE_TYPES.has(spec.specimenType) && spec.imageAsset;
          return (
            <SpecimenFrame key={spec.id} title={spec.title} status={spec.status} hideLabels={hide} layout={layout}>
              {usesImage ? <Comp gs={gs} asset={spec.imageAsset} /> : <Comp gs={gs} />}
              <AssetProvenanceTag asset={spec.imageAsset} hidden={hide} />
            </SpecimenFrame>
          );
        })}
      </div>
    </div>
  );
}
