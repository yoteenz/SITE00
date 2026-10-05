import type { ComponentType } from 'react';
import type { SpecimenImageAsset, TerritoryViewProps } from '../TerritoryRendererRegistry';
import { AssetProvenanceTag, HybridAssetLayer, paletteFromGrayscale, SpecimenFrame } from '../shared/SpecimenFrame';
import { NDXBOOK_VOLUMES } from '../shared/volumes';

// SIGNAL LIME editorial foundation — modern publication, not archival beige.
const EU = { primary: '#0B0B0B', secondary: '#F7F5F0', accent: '#D6FF3B' };

function EditorialMagazineCover({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, EU);
  return (
    <svg viewBox="0 0 280 380" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="280" height="380" fill={c.secondary} />
      <rect x="0" y="0" width="280" height="8" fill={c.primary} />
      <text x="20" y="48" fill={c.primary} fontSize="8" letterSpacing="3">VOLUME · MONEY</text>
      <text x="20" y="120" fill={c.primary} fontSize="32" fontFamily="'Space Grotesk', system-ui, sans-serif" fontWeight="700">ndxbook</text>
      <rect x="20" y="126" width="140" height="6" fill={c.accent} />
      <text x="20" y="160" fill={c.primary} fontSize="11">The book on everything that shapes your life.</text>
      <rect x="20" y="200" width="240" height="140" fill={c.primary} opacity="0.06" />
      <text x="28" y="340" fill={c.primary} fontSize="7" opacity="0.5">ISSUE 001 · PROPOSED</text>
    </svg>
  );
}

function EditorialFeatureOpener({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, EU);
  return (
    <svg viewBox="0 0 360 240" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="360" height="240" fill={c.secondary} />
      <text x="24" y="32" fill={c.primary} fontSize="7" letterSpacing="2">FEATURE</text>
      <text x="24" y="72" fill={c.primary} fontSize="24" fontFamily="'Space Grotesk', system-ui, sans-serif" fontWeight="700">Why your credit score is lying to you</text>
      <rect x="24" y="82" width="90" height="5" fill={c.accent} />
      <text x="24" y="104" fill={c.primary} fontSize="10" opacity="0.7">A clear-eyed explainer on debt payoff without fear tactics.</text>
      <rect x="24" y="128" width="200" height="92" fill={c.primary} opacity="0.08" />
      <rect x="240" y="128" width="96" height="92" fill="none" stroke={c.primary} strokeWidth="0.5" />
      <text x="248" y="148" fill={c.primary} fontSize="6">PULL QUOTE ZONE</text>
    </svg>
  );
}

function EditorialKnowledgePage({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, EU);
  return (
    <svg viewBox="0 0 280 360" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="280" height="360" fill={c.secondary} />
      <text x="20" y="40" fill={c.primary} fontSize="18" fontFamily="'Space Grotesk', system-ui, sans-serif" fontWeight="700">Credit score / debt payoff</text>
      <line x1="20" y1="52" x2="120" y2="52" stroke={c.accent} strokeWidth="3" />
      <text x="20" y="80" fill={c.primary} fontSize="9">Hook line that invites the reader in.</text>
      <text x="20" y="110" fill={c.primary} fontSize="8" opacity="0.8">Explanation block with confident editorial rhythm and generous leading.</text>
      <rect x="20" y="200" width="240" height="48" fill={c.primary} opacity="0.05" />
      <text x="28" y="228" fill={c.primary} fontSize="7" fontWeight="700">REMEMBER THIS →</text>
    </svg>
  );
}

function EditorialPage001({ gs }: { gs?: boolean }) {
  return <EditorialKnowledgePage gs={gs} />;
}

function EditorialQuoteCard({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, EU);
  return (
    <svg viewBox="0 0 200 200" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="200" height="200" fill={c.secondary} />
      <text x="20" y="60" fill={c.primary} fontSize="28" fontFamily="'Space Grotesk', system-ui, sans-serif" opacity="0.3">"</text>
      <text x="32" y="100" fill={c.primary} fontSize="11" fontWeight="600">Every page makes you smarter.</text>
      <line x1="32" y1="120" x2="80" y2="120" stroke={c.accent} strokeWidth="3" />
    </svg>
  );
}

function EditorialSocialCarousel({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, EU);
  return (
    <svg viewBox="0 0 108 192" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="108" height="192" fill={c.secondary} />
      <text x="12" y="28" fill={c.primary} fontSize="6">MONEY</text>
      <text x="12" y="72" fill={c.primary} fontSize="14" fontWeight="700">Debt payoff</text>
      <text x="12" y="92" fill={c.primary} fontSize="8">without the lecture</text>
      <rect x="12" y="120" width="84" height="56" fill={c.primary} opacity="0.07" />
      <rect x="12" y="180" width="30" height="4" fill={c.accent} />
    </svg>
  );
}

function EditorialFeedTile({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, EU);
  return (
    <svg viewBox="0 0 120 120" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="120" height="120" fill={c.secondary} />
      <text x="8" y="24" fill={c.primary} fontSize="6">MONEY</text>
      <text x="8" y="48" fill={c.primary} fontSize="11" fontWeight="700">Credit</text>
      <rect x="8" y="56" width="40" height="4" fill={c.accent} />
    </svg>
  );
}

function EditorialVolumeColors({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, EU);
  const bands = gs ? NDXBOOK_VOLUMES.map(() => '#999') : ['#D6FF3B', '#0B0B0B', '#8A8A8A', '#F7F5F0', '#D6FF3B'];
  return (
    <svg viewBox="0 0 360 80" className="site00-cd-specimen__svg" aria-hidden="true">
      {NDXBOOK_VOLUMES.map((vol, i) => (
        <g key={vol}>
          <rect x={8 + i * 70} y="8" width="64" height="64" fill={bands[i]} opacity={i % 2 === 0 ? 0.9 : 0.2} stroke={c.primary} strokeWidth="0.5" />
          <text x={16 + i * 70} y="44" fill={i % 2 === 0 ? c.primary : c.primary} fontSize="6">{vol}</text>
          <text x={16 + i * 70} y="58" fill={c.primary} fontSize="4" opacity="0.6">PROPOSED</text>
        </g>
      ))}
    </svg>
  );
}

function EditorialTypographySpread({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, EU);
  return (
    <svg viewBox="0 0 360 180" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="360" height="180" fill={c.secondary} />
      <text x="20" y="40" fill={c.primary} fontSize="26" fontFamily="'Space Grotesk', system-ui, sans-serif" fontWeight="700">Headline</text>
      <text x="20" y="64" fill={c.primary} fontSize="11" opacity="0.75">Deck / subtitle line</text>
      <text x="20" y="96" fill={c.primary} fontSize="9" fontFamily="'IBM Plex Mono', monospace">Body copy — comfortable reading size, editorial confidence.</text>
      <rect x="20" y="112" width="180" height="3" fill={c.accent} />
      <text x="20" y="140" fill={c.primary} fontSize="7" letterSpacing="2">LABEL · MONEY</text>
      <text x="20" y="160" fill={c.primary} fontSize="6" fontFamily="'IBM Plex Mono', monospace">ANNOTATION / CROSS-REF ROLE</text>
    </svg>
  );
}

function EditorialArticleSequence({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, EU);
  return (
    <svg viewBox="0 0 480 100" className="site00-cd-specimen__svg site00-cd-specimen__svg--scroll" aria-hidden="true">
      {['HOOK', 'CONTEXT', 'EXPLAIN', 'TAKEAWAY'].map((step, i) => (
        <g key={step} transform={`translate(${8 + i * 118}, 8)`}>
          <rect width="110" height="84" fill={c.secondary} stroke={c.primary} strokeWidth="0.5" />
          <text x="8" y="24" fill={c.primary} fontSize="6">SLIDE {i + 1}</text>
          <text x="8" y="48" fill={c.primary} fontSize="9" fontWeight="700">{step}</text>
          <rect x="8" y="58" width={20 + i * 6} height="3" fill={c.accent} />
        </g>
      ))}
    </svg>
  );
}

function EditorialMotionStoryboard({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, EU);
  return (
    <svg viewBox="0 0 480 100" className="site00-cd-specimen__svg site00-cd-specimen__svg--scroll" aria-hidden="true">
      {['PAGE TURN', 'HEADLINE IN', 'QUOTE SHIFT', 'OUTRO'].map((frame, i) => (
        <g key={frame} transform={`translate(${8 + i * 118}, 8)`}>
          <rect width="110" height="84" fill={c.secondary} stroke={c.primary} strokeWidth="0.5" />
          <text x="8" y="48" fill={c.primary} fontSize="8" fontWeight="600">{frame}</text>
        </g>
      ))}
    </svg>
  );
}

function EditorialWordmark({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, EU);
  return (
    <svg viewBox="0 0 240 80" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="240" height="80" fill={c.primary} />
      <text x="16" y="52" fill={c.secondary} fontSize="24" fontFamily="'Space Grotesk', system-ui, sans-serif" fontWeight="700">NDX</text>
      <text x="88" y="52" fill={c.accent} fontSize="24" fontFamily="'Space Grotesk', system-ui, sans-serif" fontWeight="700">BOOK</text>
    </svg>
  );
}

// ---------------------------------------------------------------- NINE EDITORIAL BRANCHES

function BranchBurnPage({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, EU);
  return (
    <svg viewBox="0 0 280 280" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="280" height="280" fill={c.primary} />
      <text x="20" y="36" fill={c.secondary} fontSize="7" letterSpacing="2">01 · THE BURN PAGE</text>
      <text x="20" y="90" fill={c.secondary} fontSize="20" fontWeight="700">"Toxic mindset</text>
      <text x="20" y="118" fill={c.secondary} fontSize="20" fontWeight="700">trends."</text>
      <rect x="20" y="128" width="160" height="8" fill={c.accent} opacity="0.9" />
      <text x="20" y="220" fill={c.secondary} fontSize="9" opacity="0.75">Call it out. Start the conversation.</text>
    </svg>
  );
}

function BranchReceipts({ gs, asset }: { gs?: boolean; asset?: SpecimenImageAsset }) {
  const c = paletteFromGrayscale(gs, EU);
  return (
    <div className="site00-cd-specimen__stage" style={{ aspectRatio: '3 / 4', background: c.secondary }}>
      {asset ? <HybridAssetLayer asset={asset} gs={gs} /> : null}
      <svg viewBox="0 0 280 373" className="site00-cd-specimen__svg" aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        <text x="16" y="28" fill={c.primary} fontSize="7" letterSpacing="2">02 · THE RECEIPTS</text>
        <rect x="16" y="300" width="94" height="30" fill={c.accent} transform="rotate(-4 63 315)" />
        <text x="24" y="320" fill={c.primary} fontSize="12" fontWeight="800" transform="rotate(-4 63 315)">FACTS.</text>
        <text x="16" y="356" fill={c.primary} fontSize="7" opacity="0.75">Evidence first. Don't take our word for it.</text>
      </svg>
    </div>
  );
}

function BranchMarginNotes({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, EU);
  return (
    <svg viewBox="0 0 240 200" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="240" height="200" fill={c.secondary} />
      <text x="20" y="24" fill={c.primary} fontSize="7" letterSpacing="2">03 · MARGIN NOTES</text>
      <text x="20" y="90" fill={c.primary} fontSize="15" fontStyle="italic">"The goal is freedom,</text>
      <text x="20" y="114" fill={c.primary} fontSize="15" fontStyle="italic">not approval."</text>
      <rect x="20" y="128" width="70" height="4" fill={c.accent} />
    </svg>
  );
}

function BranchTheList({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, EU);
  const items = ['Overspending', 'People pleasing', 'Toxic comparison', 'Sad boredom'];
  return (
    <svg viewBox="0 0 260 220" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="260" height="220" fill={c.secondary} />
      <text x="20" y="26" fill={c.primary} fontSize="7" letterSpacing="2">04 · THE LIST</text>
      <text x="20" y="54" fill={c.primary} fontSize="13" fontWeight="700">Things we're leaving in 2025</text>
      {items.map((item, i) => (
        <g key={item} transform={`translate(20, ${76 + i * 30})`}>
          <text fill={c.accent} fontSize="11" fontWeight="800">0{i + 1}</text>
          <text x="24" fill={c.primary} fontSize="10">{item}</text>
        </g>
      ))}
    </svg>
  );
}

function BranchTheFile({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, EU);
  return (
    <svg viewBox="0 0 280 360" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="280" height="360" fill={c.primary} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={20 + i * 46} y={40 + (i % 2) * 20} width="34" height={280 - (i % 2) * 40} fill={c.secondary} opacity="0.12" />
      ))}
      <text x="20" y="26" fill={c.secondary} fontSize="7" letterSpacing="2">05 · THE FILE</text>
      <text x="20" y="330" fill={c.accent} fontSize="10" fontWeight="700">0021</text>
      <text x="56" y="330" fill={c.secondary} fontSize="10" fontWeight="700">WHY YOUR CAR PAYMENT FEELS INSANE</text>
    </svg>
  );
}

function BranchTheInsert({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, EU);
  return (
    <svg viewBox="0 0 240 160" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="240" height="160" fill={c.secondary} />
      <text x="20" y="24" fill={c.primary} fontSize="7" letterSpacing="2">06 · THE INSERT</text>
      <rect x="30" y="40" width="180" height="90" fill="none" stroke={c.primary} strokeWidth="1" strokeDasharray="2 3" transform="rotate(2 120 85)" />
      <text x="60" y="80" fill={c.primary} fontSize="9" transform="rotate(2 120 85)">ADMIT ONE — NDX BOOK ARCHIVE</text>
      <rect x="30" y="30" width="24" height="14" fill={c.accent} opacity="0.8" />
    </svg>
  );
}

function BranchRedaction({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, EU);
  return (
    <svg viewBox="0 0 260 200" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="260" height="200" fill={c.secondary} />
      <text x="20" y="24" fill={c.primary} fontSize="7" letterSpacing="2">07 · REDACTION</text>
      {[54, 74, 94, 114, 134].map((y, i) => (
        <rect key={y} x="20" y={y} width={i === 2 ? 60 : 200 - i * 10} height="12" fill={c.primary} />
      ))}
      <text x="20" y="170" fill={c.primary} fontSize="8" opacity="0.7">Some things need to be hidden before they're seen.</text>
    </svg>
  );
}

function BranchCenterfold({ gs, asset }: { gs?: boolean; asset?: SpecimenImageAsset }) {
  return (
    <div className="site00-cd-specimen__stage" style={{ aspectRatio: '3 / 4' }}>
      {asset ? <HybridAssetLayer asset={asset} gs={gs} /> : null}
      <svg viewBox="0 0 300 400" className="site00-cd-specimen__svg" aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        <text x="16" y="28" fill="#F7F5F0" fontSize="7" letterSpacing="2" style={{ paintOrder: 'stroke', stroke: '#0B0B0B', strokeWidth: 3 }}>08 · THE CENTERFOLD</text>
        <rect x="16" y="356" width="90" height="6" fill="#D6FF3B" />
      </svg>
    </div>
  );
}

function BranchBackPage({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, EU);
  return (
    <svg viewBox="0 0 260 220" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="260" height="220" fill={c.secondary} />
      <text x="20" y="24" fill={c.primary} fontSize="7" letterSpacing="2">09 · THE BACK PAGE</text>
      <text x="20" y="56" fill={c.primary} fontSize="11" fontWeight="700">What's the most ridiculous</text>
      <text x="20" y="76" fill={c.primary} fontSize="11" fontWeight="700">thing you paid for this month?</text>
      {['Gym', 'Coffee', 'Subscriptions', 'Other ___'].map((opt, i) => (
        <g key={opt} transform={`translate(20, ${100 + i * 24})`}>
          <rect width="12" height="12" fill="none" stroke={c.primary} strokeWidth="1" />
          <text x="20" y="10" fill={c.primary} fontSize="9">{opt}</text>
        </g>
      ))}
      <circle cx="26" cy="106" r="14" fill="none" stroke={c.accent} strokeWidth="2" />
    </svg>
  );
}

const SPECIMEN_MAP: Record<string, ComponentType<{ gs?: boolean; asset?: SpecimenImageAsset }>> = {
  magazine_volume_opener: EditorialMagazineCover,
  feature_article_opener: EditorialFeatureOpener,
  knowledge_page: EditorialKnowledgePage,
  page_001_editorial: EditorialPage001,
  quote_insight_card: EditorialQuoteCard,
  social_carousel_cover: EditorialSocialCarousel,
  instagram_feed_tile: EditorialFeedTile,
  volume_color_system: EditorialVolumeColors,
  typography_spread: EditorialTypographySpread,
  article_sequence: EditorialArticleSequence,
  motion_storyboard: EditorialMotionStoryboard,
  wordmark: EditorialWordmark,
  branch_burn_page: BranchBurnPage,
  branch_receipts: BranchReceipts,
  branch_margin_notes: BranchMarginNotes,
  branch_the_list: BranchTheList,
  branch_the_file: BranchTheFile,
  branch_the_insert: BranchTheInsert,
  branch_redaction: BranchRedaction,
  branch_centerfold: BranchCenterfold,
  branch_back_page: BranchBackPage,
};

const IMAGE_AWARE_TYPES = new Set(['branch_receipts', 'branch_centerfold']);

export function EditorialUtilityTerritoryView({ specimens, options }: TerritoryViewProps) {
  const gs = options?.grayscale || options?.structuralDiffMode;
  const hide = options?.hideLabels || options?.structuralDiffMode;

  return (
    <div className="site00-cd-territory site00-cd-territory--editorial-utility">
      <div className="site00-cd-territory__editorial-spread">
        {specimens.map((spec) => {
          const Comp = SPECIMEN_MAP[spec.specimenType] ?? EditorialMagazineCover;
          const layout =
            spec.specimenType === 'magazine_volume_opener' ||
            spec.specimenType === 'knowledge_page' ||
            spec.specimenType === 'page_001_editorial' ||
            spec.specimenType === 'branch_receipts' ||
            spec.specimenType === 'branch_centerfold' ||
            spec.specimenType === 'branch_the_file'
              ? 'tall'
              : spec.specimenType === 'feature_article_opener' ||
                  spec.specimenType === 'volume_color_system' ||
                  spec.specimenType.includes('sequence') ||
                  spec.specimenType === 'motion_storyboard'
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
