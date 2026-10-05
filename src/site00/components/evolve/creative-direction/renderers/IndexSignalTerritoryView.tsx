import type { ComponentType } from 'react';
import type { SpecimenImageAsset, TerritoryViewProps } from '../TerritoryRendererRegistry';
import { AssetProvenanceTag, HybridAssetLayer, paletteFromGrayscale, SpecimenFrame } from '../shared/SpecimenFrame';
import { NDXBOOK_VOLUMES, PAGE_001_REFERENCE } from '../shared/volumes';

// ELECTRIC COBALT signal foundation — graphite/instrument-white base, distinct from Editorial's lime.
const IS = { primary: '#14151A', secondary: '#EAF4FF', accent: '#2457F7' };

function IndexBrandCard({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, IS);
  return (
    <svg viewBox="0 0 320 200" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="320" height="200" fill={c.secondary} />
      <rect x="0" y="0" width="320" height="24" fill={c.accent} />
      <text x="12" y="16" fill="#fff" fontSize="8" fontFamily="monospace">NDX-IDX-001</text>
      <text x="240" y="16" fill="#fff" fontSize="7" fontFamily="monospace">SIGNAL v0</text>
      <text x="24" y="72" fill={c.primary} fontSize="28" fontWeight="700" letterSpacing="6">NDXBOOK</text>
      <text x="24" y="96" fill={c.accent} fontSize="9" fontFamily="monospace">FIND THE SIGNAL</text>
      <line x1="24" y1="110" x2="296" y2="110" stroke={c.primary} strokeWidth="0.5" />
      <text x="24" y="130" fill={c.primary} fontSize="7" fontFamily="monospace">REF: PAGE/VOL/CHAPTER COORDINATE SYSTEM</text>
      <rect x="24" y="140" width="80" height="40" fill="none" stroke={c.accent} strokeWidth="1" />
      <text x="32" y="158" fill={c.accent} fontSize="6" fontFamily="monospace">VOL-ID</text>
      <text x="32" y="172" fill={c.primary} fontSize="8" fontFamily="monospace">MONEY</text>
      <rect x="112" y="140" width="80" height="40" fill="none" stroke={c.primary} strokeWidth="0.5" />
      <text x="120" y="158" fill={c.primary} fontSize="6" fontFamily="monospace">PAGE-ID</text>
      <text x="120" y="172" fill={c.primary} fontSize="8" fontFamily="monospace">001</text>
    </svg>
  );
}

function IndexPageCatalog({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, IS);
  return (
    <svg viewBox="0 0 280 360" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="280" height="360" fill={c.secondary} stroke={c.primary} strokeWidth="1" />
      <text x="16" y="28" fill={c.accent} fontSize="10" fontFamily="monospace" fontWeight="700">{PAGE_001_REFERENCE.id}</text>
      <text x="16" y="48" fill={c.primary} fontSize="7" fontFamily="monospace">VOL · {PAGE_001_REFERENCE.volume} · {PAGE_001_REFERENCE.chapter}</text>
      <text x="16" y="68" fill={c.primary} fontSize="8" fontWeight="600">{PAGE_001_REFERENCE.topic}</text>
      <rect x="16" y="80" width="248" height="1" fill={c.primary} opacity="0.3" />
      {['XREF: DEBT', 'XREF: CREDIT', 'XREF: SCORE'].map((tag, i) => (
        <g key={tag}>
          <rect x={16 + i * 82} y="92" width="76" height="18" fill="none" stroke={c.accent} strokeWidth="0.5" />
          <text x={20 + i * 82} y="105" fill={c.accent} fontSize="5" fontFamily="monospace">{tag}</text>
        </g>
      ))}
      <text x="16" y="140" fill={c.primary} fontSize="6" fontFamily="monospace">ARCHIVE CODE · NDX-MNY-001-A</text>
      <rect x="16" y="155" width="248" height="180" fill="none" stroke={c.accent} strokeWidth="0.75" strokeDasharray="4 2" />
      <text x="24" y="175" fill={c.primary} fontSize="7">INDEXED KNOWLEDGE CARD — STRUCTURED ENTRY</text>
      <text x="24" y="195" fill={c.primary} fontSize="6" opacity="0.7">Cross-linked metadata · page coordinates · volume registry</text>
    </svg>
  );
}

function IndexVolumeRegistry({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, IS);
  return (
    <svg viewBox="0 0 400 220" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="400" height="220" fill={c.secondary} />
      <text x="16" y="24" fill={c.primary} fontSize="8" fontFamily="monospace" letterSpacing="2">VOLUME REGISTRY</text>
      {NDXBOOK_VOLUMES.map((vol, i) => (
        <g key={vol} transform={`translate(${16 + (i % 3) * 128}, ${40 + Math.floor(i / 3) * 88})`}>
          <rect width="120" height="72" fill="none" stroke={c.accent} strokeWidth="0.75" />
          <text x="8" y="18" fill={c.accent} fontSize="6" fontFamily="monospace">VOL-{String(i + 1).padStart(2, '0')}</text>
          <text x="8" y="38" fill={c.primary} fontSize="11" fontWeight="700">{vol}</text>
          <text x="8" y="54" fill={c.primary} fontSize="5" fontFamily="monospace">INDEX SLOT · ACTIVE</text>
          <line x1="8" y1="62" x2="112" y2="62" stroke={c.primary} strokeWidth="0.25" />
        </g>
      ))}
    </svg>
  );
}

function IndexCrossRefMap({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, IS);
  return (
    <svg viewBox="0 0 360 200" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="360" height="200" fill={c.secondary} />
      <circle cx="60" cy="100" r="28" fill="none" stroke={c.primary} strokeWidth="1" />
      <text x="48" y="104" fill={c.primary} fontSize="7" fontFamily="monospace">PAGE</text>
      <circle cx="180" cy="60" r="22" fill="none" stroke={c.accent} strokeWidth="1.5" />
      <text x="168" y="64" fill={c.accent} fontSize="6" fontFamily="monospace">CH</text>
      <circle cx="180" cy="140" r="22" fill="none" stroke={c.accent} strokeWidth="1.5" />
      <text x="168" y="144" fill={c.accent} fontSize="6" fontFamily="monospace">VOL</text>
      <circle cx="300" cy="100" r="28" fill="none" stroke={c.primary} strokeWidth="1" />
      <text x="282" y="104" fill={c.primary} fontSize="7" fontFamily="monospace">XREF</text>
      <line x1="88" y1="92" x2="158" y2="68" stroke={c.accent} strokeWidth="0.75" />
      <line x1="88" y1="108" x2="158" y2="132" stroke={c.accent} strokeWidth="0.75" />
      <line x1="202" y1="100" x2="272" y2="100" stroke={c.accent} strokeWidth="0.75" strokeDasharray="3 2" />
    </svg>
  );
}

function IndexSocial916({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, IS);
  return (
    <svg viewBox="0 0 108 192" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="108" height="192" fill={c.secondary} />
      <rect x="0" y="0" width="20" height="192" fill={c.accent} />
      <text x="4" y="24" fill="#fff" fontSize="5" fontFamily="monospace" transform="rotate(-90 4 24)">001</text>
      <text x="28" y="32" fill={c.accent} fontSize="7" fontFamily="monospace">MONEY</text>
      <text x="28" y="52" fill={c.primary} fontSize="8" fontWeight="700">CREDIT</text>
      <text x="28" y="64" fill={c.primary} fontSize="8" fontWeight="700">SCORE</text>
      <rect x="28" y="72" width="68" height="1" fill={c.primary} />
      <text x="28" y="88" fill={c.primary} fontSize="5" fontFamily="monospace">INDEX CARD · 9:16</text>
      <rect x="28" y="150" width="68" height="24" fill="none" stroke={c.accent} strokeWidth="0.5" />
      <text x="32" y="166" fill={c.primary} fontSize="5" fontFamily="monospace">NDX-MNY-001</text>
    </svg>
  );
}

function IndexFeedTile({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, IS);
  return (
    <svg viewBox="0 0 120 120" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="120" height="120" fill={c.primary} />
      <text x="8" y="20" fill={c.accent} fontSize="6" fontFamily="monospace">001</text>
      <text x="8" y="40" fill="#fff" fontSize="9" fontWeight="700">NDX</text>
      <line x1="8" y1="48" x2="112" y2="48" stroke={c.accent} strokeWidth="1.5" />
      <text x="8" y="64" fill="#fff" fontSize="5" fontFamily="monospace">MONEY · INDEX</text>
    </svg>
  );
}

function IndexNavStrip({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, IS);
  return (
    <svg viewBox="0 0 400 48" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="400" height="48" fill={c.primary} />
      {['001', '002', '003', '···', 'VOL', 'MONEY', 'BODY'].map((label, i) => (
        <g key={label}>
          <rect x={8 + i * 52} y="8" width="44" height="32" fill="none" stroke={c.accent} strokeWidth="0.5" />
          <text x={16 + i * 52} y="28" fill="#fff" fontSize="7" fontFamily="monospace">{label}</text>
        </g>
      ))}
    </svg>
  );
}

function IndexTypography({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, IS);
  return (
    <svg viewBox="0 0 320 160" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="320" height="160" fill={c.secondary} />
      <text x="16" y="36" fill={c.primary} fontSize="22" fontWeight="700" letterSpacing="4">DISPLAY</text>
      <text x="16" y="64" fill={c.primary} fontSize="12" fontWeight="600">Headline Grotesk</text>
      <text x="16" y="88" fill={c.primary} fontSize="9">Body humanist sans for explanations</text>
      <text x="16" y="120" fill={c.accent} fontSize="8" fontFamily="monospace">001 · VOL-MNY · META</text>
      <text x="16" y="140" fill={c.primary} fontSize="6" fontFamily="monospace">ANNOTATION / CROSS-REF ROLE</text>
    </svg>
  );
}

function IndexGraphicLanguage({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, IS);
  return (
    <svg viewBox="0 0 280 120" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="280" height="120" fill={c.secondary} />
      <rect x="12" y="12" width="24" height="24" fill="none" stroke={c.primary} strokeWidth="0.75" />
      <text x="18" y="28" fill={c.primary} fontSize="6" fontFamily="monospace">#</text>
      <line x1="48" y1="24" x2="120" y2="24" stroke={c.primary} strokeWidth="0.5" />
      <rect x="140" y="12" width="60" height="20" fill="none" stroke={c.accent} strokeWidth="0.75" />
      <text x="148" y="26" fill={c.accent} fontSize="6" fontFamily="monospace">STAMP</text>
      <path d="M12 60 L40 60 L40 88 L12 88 Z" fill="none" stroke={c.primary} strokeWidth="0.5" />
      <text x="52" y="76" fill={c.primary} fontSize="6">Catalog marks · index lines · archive tags</text>
    </svg>
  );
}

function IndexMotionStoryboard({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, IS);
  return (
    <svg viewBox="0 0 480 100" className="site00-cd-specimen__svg site00-cd-specimen__svg--scroll" aria-hidden="true">
      {['RETRIEVE', 'SCAN', 'XREF', 'PAGE #'].map((frame, i) => (
        <g key={frame} transform={`translate(${8 + i * 118}, 8)`}>
          <rect width="110" height="84" fill={c.secondary} stroke={c.accent} strokeWidth="0.75" />
          <text x="8" y="20" fill={c.accent} fontSize="6" fontFamily="monospace">F{i + 1}</text>
          <text x="8" y="48" fill={c.primary} fontSize="8" fontWeight="600">{frame}</text>
          <text x="8" y="72" fill={c.primary} fontSize="5" fontFamily="monospace">signal motion</text>
        </g>
      ))}
    </svg>
  );
}

// ----------------------------------------------------------------- SIGNAL BEHAVIOR BRANCHES

function SignalPulse({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, IS);
  return (
    <svg viewBox="0 0 280 160" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="280" height="160" fill={c.primary} />
      <text x="16" y="24" fill="#fff" fontSize="7" letterSpacing="2">01 · THE PULSE</text>
      <path d="M8 100 L60 100 L72 60 L84 130 L96 100 L280 100" fill="none" stroke={c.accent} strokeWidth="2" />
      <text x="16" y="140" fill="#fff" fontSize="6" fontFamily="monospace" opacity="0.7">LIVE · 09:41:23</text>
    </svg>
  );
}

function SignalReadout({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, IS);
  return (
    <svg viewBox="0 0 240 160" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="240" height="160" fill={c.primary} />
      <text x="16" y="24" fill="#fff" fontSize="7" letterSpacing="2">02 · THE READOUT</text>
      <text x="16" y="104" fill={c.accent} fontSize="42" fontWeight="800">68.4%</text>
      <text x="16" y="128" fill="#fff" fontSize="7" opacity="0.7">OF AMERICANS LIVE PAYCHECK TO PAYCHECK</text>
    </svg>
  );
}

function SignalPattern({ gs, asset }: { gs?: boolean; asset?: SpecimenImageAsset }) {
  const c = paletteFromGrayscale(gs, IS);
  return (
    <div className="site00-cd-specimen__stage" style={{ aspectRatio: '4 / 3', background: c.primary }}>
      {asset ? <HybridAssetLayer asset={asset} gs={gs} /> : null}
      <svg viewBox="0 0 320 240" className="site00-cd-specimen__svg" aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        <text x="16" y="24" fill="#fff" fontSize="7" letterSpacing="2">03 · THE PATTERN</text>
        <line x1="16" y1="200" x2="140" y2="150" stroke={c.accent} strokeWidth="1.5" strokeDasharray="4 3" />
        <circle cx="140" cy="150" r="4" fill={c.accent} />
      </svg>
    </div>
  );
}

function SignalScan({ gs, asset }: { gs?: boolean; asset?: SpecimenImageAsset }) {
  const c = paletteFromGrayscale(gs, IS);
  return (
    <div className="site00-cd-specimen__stage" style={{ aspectRatio: '4 / 3', background: c.primary }}>
      {asset ? <HybridAssetLayer asset={asset} gs={gs} /> : null}
      <svg viewBox="0 0 320 240" className="site00-cd-specimen__svg" aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        <rect x="0" y="0" width="320" height="52" fill={c.primary} opacity="0.82" />
        <text x="16" y="22" fill="#fff" fontSize="7" letterSpacing="2">04 · THE SCAN</text>
        <text x="16" y="42" fill={c.accent} fontSize="10" fontFamily="monospace">SCANNING ARCHIVE···</text>
        <line x1="0" y1="140" x2="320" y2="140" stroke={c.accent} strokeWidth="1" opacity="0.8" />
      </svg>
    </div>
  );
}

function SignalForecast({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, IS);
  return (
    <svg viewBox="0 0 300 180" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="300" height="180" fill={c.secondary} />
      <text x="16" y="24" fill={c.primary} fontSize="7" letterSpacing="2">05 · THE FORECAST</text>
      <path d="M16 140 L80 110 L140 130 L200 70 L280 50" fill="none" stroke={c.accent} strokeWidth="2" />
      <path d="M200 70 L280 50" fill="none" stroke={c.accent} strokeWidth="2" strokeDasharray="4 3" />
      <text x="200" y="44" fill={c.accent} fontSize="6" fontFamily="monospace">PROJECTED</text>
    </svg>
  );
}

function SignalAlert({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, IS);
  return (
    <svg viewBox="0 0 240 160" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="240" height="160" fill={c.accent} />
      <text x="16" y="24" fill="#fff" fontSize="7" letterSpacing="2">06 · THE ALERT</text>
      <text x="16" y="60" fill="#fff" fontSize="12" fontWeight="800">SIGNAL ALERT 0047</text>
      <text x="16" y="88" fill="#fff" fontSize="9">Student loan payments are resetting.</text>
      <text x="16" y="106" fill="#fff" fontSize="9" fontWeight="700">Don't ignore it.</text>
    </svg>
  );
}

function SignalTransmission({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, IS);
  return (
    <svg viewBox="0 0 240 160" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="240" height="160" fill={c.secondary} />
      <text x="16" y="24" fill={c.primary} fontSize="7" letterSpacing="2">07 · THE TRANSMISSION</text>
      <rect x="16" y="40" width="180" height="70" fill="none" stroke={c.accent} strokeWidth="1" />
      <text x="24" y="60" fill={c.primary} fontSize="8" fontWeight="700">A DIRECT MESSAGE FROM NDX</text>
      <text x="24" y="80" fill={c.primary} fontSize="7" opacity="0.75">The most expensive choices don't look expensive at first.</text>
    </svg>
  );
}

function SignalCoordinate({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, IS);
  return (
    <svg viewBox="0 0 200 200" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="200" height="200" fill={c.primary} />
      <text x="16" y="24" fill="#fff" fontSize="7" letterSpacing="2">08 · THE COORDINATE</text>
      <circle cx="100" cy="120" r="60" fill="none" stroke={c.accent} strokeWidth="0.75" opacity="0.5" />
      <circle cx="100" cy="120" r="36" fill="none" stroke={c.accent} strokeWidth="0.75" opacity="0.7" />
      <circle cx="100" cy="120" r="4" fill={c.accent} />
    </svg>
  );
}

function SignalProjection({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, IS);
  return (
    <svg viewBox="0 0 260 160" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="260" height="160" fill={c.secondary} />
      <text x="16" y="24" fill={c.primary} fontSize="7" letterSpacing="2">09 · THE PROJECTION</text>
      <path d="M16 120 L100 90 L180 100 L240 50" fill="none" stroke={c.accent} strokeWidth="1.5" strokeDasharray="1 4" strokeLinecap="round" />
      <circle cx="240" cy="50" r="5" fill={c.accent} />
      <text x="180" y="130" fill={c.primary} fontSize="6" fontFamily="monospace">CURRENT PATH</text>
      <text x="180" y="70" fill={c.accent} fontSize="6" fontFamily="monospace">ALTERNATE PATH</text>
    </svg>
  );
}

function IndexWordmark({ gs }: { gs?: boolean }) {
  return <IndexBrandCard gs={gs} />;
}

const SPECIMEN_MAP: Record<string, ComponentType<{ gs?: boolean; asset?: SpecimenImageAsset }>> = {
  brand_index_card: IndexBrandCard,
  page_catalog_system: IndexPageCatalog,
  page_001_indexed: IndexPageCatalog,
  volume_registry: IndexVolumeRegistry,
  cross_reference_map: IndexCrossRefMap,
  social_knowledge_card_916: IndexSocial916,
  feed_index_tile: IndexFeedTile,
  navigation_archive_strip: IndexNavStrip,
  typography_system: IndexTypography,
  graphic_language: IndexGraphicLanguage,
  motion_storyboard: IndexMotionStoryboard,
  wordmark: IndexWordmark,
  signal_pulse: SignalPulse,
  signal_readout: SignalReadout,
  signal_pattern: SignalPattern,
  signal_scan: SignalScan,
  signal_forecast: SignalForecast,
  signal_alert: SignalAlert,
  signal_transmission: SignalTransmission,
  signal_coordinate: SignalCoordinate,
  signal_projection: SignalProjection,
};

const IMAGE_AWARE_TYPES = new Set(['signal_scan', 'signal_pattern']);

export function IndexSignalTerritoryView({ specimens, options }: TerritoryViewProps) {
  const gs = options?.grayscale || options?.structuralDiffMode;
  const hide = options?.hideLabels || options?.structuralDiffMode;

  return (
    <div className="site00-cd-territory site00-cd-territory--index-signal">
      <div className="site00-cd-territory__catalog-wall">
        {specimens.map((spec) => {
          const Comp = SPECIMEN_MAP[spec.specimenType] ?? IndexBrandCard;
          const layout =
            spec.specimenType === 'navigation_archive_strip' || spec.specimenType === 'motion_storyboard'
              ? 'full'
              : spec.specimenType === 'page_catalog_system' || spec.specimenType === 'page_001_indexed'
                ? 'tall'
                : spec.specimenType === 'volume_registry' ||
                    spec.specimenType === 'cross_reference_map' ||
                    spec.specimenType === 'signal_scan' ||
                    spec.specimenType === 'signal_pattern'
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
