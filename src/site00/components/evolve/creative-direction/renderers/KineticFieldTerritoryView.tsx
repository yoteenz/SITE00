import type { ComponentType } from 'react';
import type { TerritoryViewProps } from '../TerritoryRendererRegistry';
import { paletteFromGrayscale, SpecimenFrame } from '../shared/SpecimenFrame';
import { NDXBOOK_VOLUMES, PAGE_001_REFERENCE } from '../shared/volumes';

function KineticTitleFrame({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, { primary: '#0F172A', secondary: '#E2E8F0', accent: '#666' });
  return (
    <svg viewBox="0 0 360 120" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="360" height="120" fill={c.primary} />
      <text x="20" y="72" fill={c.secondary} fontSize="48" fontWeight="900" letterSpacing="-2">NDX</text>
      <text x="140" y="72" fill={c.accent} fontSize="48" fontWeight="900" opacity="0.9">BOOK</text>
      <line x1="20" y1="88" x2="340" y2="88" stroke={c.accent} strokeWidth="2" opacity="0.6" />
    </svg>
  );
}

function KineticHook916({ gs, imageUrl }: { gs?: boolean; imageUrl?: string }) {
  const c = paletteFromGrayscale(gs, { primary: '#0F172A', secondary: '#E2E8F0', accent: '#666' });
  return (
    <svg viewBox="0 0 108 192" className="site00-cd-specimen__svg site00-cd-specimen__svg--imaged" aria-hidden="true">
      {imageUrl ? (
        <>
          <defs>
            <clipPath id="ndx-kf-hook-clip"><rect width="108" height="192" /></clipPath>
          </defs>
          <g clipPath="url(#ndx-kf-hook-clip)">
            <image href={imageUrl} x="0" y="0" width="108" height="192" preserveAspectRatio="xMidYMid slice" />
            <rect x="0" y="0" width="108" height="192" fill={c.primary} opacity={gs ? 0.32 : 0.18} />
          </g>
        </>
      ) : (
        <rect width="108" height="192" fill={c.primary} />
      )}
      <text x="-8" y="100" fill={c.secondary} fontSize="36" fontWeight="900" transform="rotate(-90 54 100)">DEBT?</text>
      <rect x="8" y="150" width="92" height="28" fill={c.accent} opacity="0.25" />
      <text x="14" y="168" fill={c.secondary} fontSize="6">HOOK FRAME · 9:16</text>
    </svg>
  );
}

function KineticPage001({ gs, imageUrl }: { gs?: boolean; imageUrl?: string }) {
  const c = paletteFromGrayscale(gs, { primary: '#0F172A', secondary: '#E2E8F0', accent: '#666' });
  return (
    <svg viewBox="0 0 108 192" className="site00-cd-specimen__svg site00-cd-specimen__svg--imaged" aria-hidden="true">
      {imageUrl ? (
        <>
          <defs>
            <clipPath id="ndx-kf-p001-clip"><rect width="108" height="192" /></clipPath>
          </defs>
          <g clipPath="url(#ndx-kf-p001-clip)">
            <image href={imageUrl} x="0" y="0" width="108" height="192" preserveAspectRatio="xMidYMid slice" />
            <rect x="0" y="0" width="108" height="192" fill={c.primary} opacity={gs ? 0.34 : 0.22} />
          </g>
        </>
      ) : (
        <rect width="108" height="192" fill={c.primary} />
      )}
      <text x="8" y="40" fill={c.accent} fontSize="28" fontWeight="900">{PAGE_001_REFERENCE.id.split(' ')[1]}</text>
      <text x="8" y="100" fill={c.secondary} fontSize="11" fontWeight="700">CREDIT</text>
      <text x="8" y="118" fill={c.secondary} fontSize="11" fontWeight="700">SCORE</text>
      <path d="M8 130 L100 130" stroke={c.accent} strokeWidth="3" />
      <text x="8" y="168" fill={c.secondary} fontSize="5" opacity="0.7">{PAGE_001_REFERENCE.volume}</text>
    </svg>
  );
}

function KineticMotionSequence({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, { primary: '#0F172A', secondary: '#E2E8F0', accent: '#666' });
  return (
    <svg viewBox="0 0 360 120" className="site00-cd-specimen__svg site00-cd-specimen__svg--scroll" aria-hidden="true">
      {[
        { label: 'A', size: 28, x: 0 },
        { label: 'B', size: 36, x: 1 },
        { label: 'C', size: 22, x: 2 },
      ].map((frame, i) => (
        <g key={frame.label} transform={`translate(${8 + i * 118}, 8)`}>
          <rect width="110" height="104" fill={c.primary} stroke={c.accent} strokeWidth="0.75" />
          <text x="12" y={60 + frame.x * 4} fill={c.secondary} fontSize={frame.size} fontWeight="900">{frame.label}</text>
          <text x="12" y="92" fill={c.accent} fontSize="6">FRAME {frame.label}</text>
        </g>
      ))}
    </svg>
  );
}

function KineticPageTransition({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, { primary: '#0F172A', secondary: '#E2E8F0', accent: '#666' });
  return (
    <svg viewBox="0 0 280 80" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="280" height="80" fill={c.primary} />
      <text x="24" y="52" fill={c.secondary} fontSize="32" fontWeight="900">001</text>
      <path d="M120 40 L160 40" stroke={c.accent} strokeWidth="2" markerEnd="url(#arr)" />
      <text x="180" y="52" fill={c.accent} fontSize="32" fontWeight="900">002</text>
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill={c.accent} />
        </marker>
      </defs>
    </svg>
  );
}

function KineticVolumeStinger({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, { primary: '#0F172A', secondary: '#E2E8F0', accent: '#666' });
  return (
    <svg viewBox="0 0 400 60" className="site00-cd-specimen__svg site00-cd-specimen__svg--scroll" aria-hidden="true">
      {NDXBOOK_VOLUMES.map((vol, i) => (
        <g key={vol} transform={`translate(${8 + i * 78}, 8)`}>
          <rect width="70" height="44" fill={c.primary} stroke={c.accent} strokeWidth="0.75" />
          <text x="8" y="28" fill={c.secondary} fontSize="9" fontWeight="800">{vol}</text>
        </g>
      ))}
    </svg>
  );
}

function KineticFeedTile({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, { primary: '#0F172A', secondary: '#E2E8F0', accent: '#666' });
  return (
    <svg viewBox="0 0 120 120" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="120" height="120" fill={c.primary} />
      <text x="8" y="64" fill={c.secondary} fontSize="22" fontWeight="900">NDX</text>
      <rect x="8" y="72" width="48" height="4" fill={c.accent} />
    </svg>
  );
}

function KineticSignalGraphic({ gs, imageUrl }: { gs?: boolean; imageUrl?: string }) {
  const c = paletteFromGrayscale(gs, { primary: '#0F172A', secondary: '#E2E8F0', accent: '#666' });
  if (imageUrl) {
    return (
      <svg viewBox="0 0 280 120" className="site00-cd-specimen__svg site00-cd-specimen__svg--imaged" aria-hidden="true">
        <defs>
          <clipPath id="ndx-kf-signal-clip"><rect width="280" height="120" /></clipPath>
        </defs>
        <g clipPath="url(#ndx-kf-signal-clip)">
          <image href={imageUrl} x="0" y="0" width="280" height="120" preserveAspectRatio="xMidYMid slice" />
        </g>
        <text x="14" y="18" fill={c.secondary} fontSize="7" fontWeight="700" letterSpacing="1">TECH</text>
      </svg>
    );
  }
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
  const c = paletteFromGrayscale(gs, { primary: '#0F172A', secondary: '#E2E8F0', accent: '#666' });
  return (
    <svg viewBox="0 0 320 140" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="320" height="140" fill={c.primary} />
      <text x="16" y="56" fill={c.secondary} fontSize="36" fontWeight="900" letterSpacing="-1">DISPLAY</text>
      <text x="16" y="88" fill={c.accent} fontSize="14" fontWeight="800">COMPRESSED HOOK</text>
      <text x="16" y="112" fill={c.secondary} fontSize="7" opacity="0.6">utility label · microcopy</text>
    </svg>
  );
}

function KineticDarkLight({ gs, imageUrl }: { gs?: boolean; imageUrl?: string }) {
  const c = paletteFromGrayscale(gs, { primary: '#0F172A', secondary: '#E2E8F0', accent: '#666' });
  if (imageUrl) {
    return (
      <svg viewBox="0 0 280 100" className="site00-cd-specimen__svg site00-cd-specimen__svg--imaged" aria-hidden="true">
        <defs>
          <clipPath id="ndx-kf-darklight-clip"><rect width="280" height="100" /></clipPath>
        </defs>
        <g clipPath="url(#ndx-kf-darklight-clip)">
          <image href={imageUrl} x="0" y="0" width="280" height="100" preserveAspectRatio="xMidYMid slice" />
        </g>
        <text x="14" y="18" fill={c.secondary} fontSize="7" fontWeight="700" letterSpacing="1">BODY</text>
      </svg>
    );
  }
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
  const c = paletteFromGrayscale(gs, { primary: '#0F172A', secondary: '#E2E8F0', accent: '#666' });
  return (
    <svg viewBox="0 0 600 100" className="site00-cd-specimen__svg site00-cd-specimen__svg--scroll" aria-hidden="true">
      {['IMPACT', 'COMPRESS', 'REVEAL', 'SETTLE', 'STAMP', 'OUT'].map((frame, i) => (
        <g key={frame} transform={`translate(${8 + i * 98}, 8)`}>
          <rect width="90" height="84" fill={c.primary} stroke={c.accent} strokeWidth="0.5" />
          <text x="8" y="48" fill={c.secondary} fontSize="7" fontWeight="800">{frame}</text>
          <text x="8" y="72" fill={c.accent} fontSize="5">{i * 120}ms</text>
        </g>
      ))}
    </svg>
  );
}

function KineticWordmark({ gs }: { gs?: boolean }) {
  return <KineticTitleFrame gs={gs} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SPECIMEN_MAP: Record<string, ComponentType<any>> = {
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
};

export function KineticFieldTerritoryView({ specimens, options }: TerritoryViewProps) {
  const gs = options?.grayscale || options?.structuralDiffMode;
  const hide = options?.hideLabels || options?.structuralDiffMode;

  return (
    <div className="site00-cd-territory site00-cd-territory--kinetic-field">
      <div className="site00-cd-territory__motion-board">
        {specimens.map((spec) => {
          const Comp = SPECIMEN_MAP[spec.specimenType] ?? KineticTitleFrame;
          const layout =
            spec.specimenType === 'hook_frame_916' || spec.specimenType === 'page_001_kinetic'
              ? 'tall'
              : spec.specimenType.includes('storyboard') || spec.specimenType.includes('sequence') || spec.specimenType === 'volume_stinger' || spec.specimenType === 'motion_title_frame'
                ? 'wide'
                : spec.specimenType === 'dark_light_inversion'
                  ? 'wide'
                  : 'default';
          return (
            <SpecimenFrame
              key={spec.id}
              title={spec.title}
              status={spec.status}
              hideLabels={hide}
              layout={layout}
              provenance={spec.imageAsset ?? undefined}
            >
              <Comp gs={gs} imageUrl={spec.imageAsset?.url} />
            </SpecimenFrame>
          );
        })}
      </div>
    </div>
  );
}
