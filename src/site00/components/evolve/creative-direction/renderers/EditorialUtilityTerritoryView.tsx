import type { ComponentType } from 'react';
import type { TerritoryViewProps } from '../TerritoryRendererRegistry';
import { paletteFromGrayscale, SpecimenFrame } from '../shared/SpecimenFrame';
import { NDXBOOK_VOLUMES } from '../shared/volumes';

function EditorialMagazineCover({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, { primary: '#1C1917', secondary: '#FAFAF9', accent: '#666' });
  return (
    <svg viewBox="0 0 280 380" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="280" height="380" fill={c.secondary} />
      <rect x="0" y="0" width="280" height="8" fill={c.primary} />
      <text x="20" y="48" fill={c.accent} fontSize="8" letterSpacing="3">VOLUME · MONEY</text>
      <text x="20" y="120" fill={c.primary} fontSize="32" fontFamily="Georgia, serif" fontWeight="400">ndxbook</text>
      <text x="20" y="160" fill={c.primary} fontSize="11" fontFamily="Georgia, serif">The index book for people who want to understand money.</text>
      <rect x="20" y="200" width="240" height="140" fill={c.primary} opacity="0.06" />
      <text x="28" y="340" fill={c.primary} fontSize="7" opacity="0.5">ISSUE 001 · PROPOSED</text>
    </svg>
  );
}

function EditorialFeatureOpener({ gs, imageUrl }: { gs?: boolean; imageUrl?: string }) {
  const c = paletteFromGrayscale(gs, { primary: '#1C1917', secondary: '#FAFAF9', accent: '#666' });
  return (
    <svg viewBox="0 0 360 240" className="site00-cd-specimen__svg site00-cd-specimen__svg--imaged" aria-hidden="true">
      <rect width="360" height="240" fill={c.secondary} />
      <text x="24" y="32" fill={c.accent} fontSize="7" letterSpacing="2">FEATURE</text>
      <text x="24" y="72" fill={c.primary} fontSize="24" fontFamily="Georgia, serif">Why your credit score is lying to you</text>
      <text x="24" y="96" fill={c.primary} fontSize="10" opacity="0.7">A clear-eyed explainer on debt payoff without fear tactics.</text>
      {imageUrl ? (
        <>
          <defs>
            <clipPath id="ndx-ed-feature-clip"><rect x="24" y="120" width="200" height="100" /></clipPath>
          </defs>
          <g clipPath="url(#ndx-ed-feature-clip)">
            <image href={imageUrl} x="24" y="120" width="200" height="100" preserveAspectRatio="xMidYMid slice" />
          </g>
        </>
      ) : (
        <rect x="24" y="120" width="200" height="100" fill={c.primary} opacity="0.08" />
      )}
      <rect x="240" y="120" width="96" height="100" fill="none" stroke={c.primary} strokeWidth="0.5" />
      <text x="248" y="140" fill={c.primary} fontSize="6">PULL QUOTE ZONE</text>
    </svg>
  );
}

function EditorialKnowledgePage({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, { primary: '#1C1917', secondary: '#FAFAF9', accent: '#666' });
  return (
    <svg viewBox="0 0 280 360" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="280" height="360" fill={c.secondary} />
      <text x="20" y="40" fill={c.primary} fontSize="18" fontFamily="Georgia, serif">Credit score / debt payoff</text>
      <line x1="20" y1="52" x2="120" y2="52" stroke={c.accent} strokeWidth="2" />
      <text x="20" y="80" fill={c.primary} fontSize="9" fontFamily="Georgia, serif">Hook line that invites the reader in.</text>
      <text x="20" y="110" fill={c.primary} fontSize="8" opacity="0.8">Explanation block with warm editorial rhythm and generous leading.</text>
      <rect x="20" y="200" width="240" height="48" fill={c.primary} opacity="0.05" />
      <text x="28" y="228" fill={c.primary} fontSize="7" fontWeight="600">REMEMBER THIS →</text>
    </svg>
  );
}

/** Page 001 — the strongest Editorial Utility specimen: a commissioned still life sharing the frame with the headline. */
function EditorialPage001({ gs, imageUrl }: { gs?: boolean; imageUrl?: string }) {
  const c = paletteFromGrayscale(gs, { primary: '#1C1917', secondary: '#FAFAF9', accent: '#B45309' });
  if (!imageUrl) return <EditorialKnowledgePage gs={gs} />;
  return (
    <svg viewBox="0 0 280 360" className="site00-cd-specimen__svg site00-cd-specimen__svg--imaged" aria-hidden="true">
      <defs>
        <clipPath id="ndx-ed-p001-clip"><rect width="280" height="360" /></clipPath>
      </defs>
      <g clipPath="url(#ndx-ed-p001-clip)">
        <image href={imageUrl} x="0" y="0" width="280" height="360" preserveAspectRatio="xMidYMid slice" />
        <rect x="0" y="0" width="280" height="128" fill={c.secondary} opacity={gs ? 0.88 : 0.8} />
      </g>
      <rect x="0" y="0" width="280" height="4" fill={c.accent} />
      <text x="20" y="34" fill={c.accent} fontSize="8" letterSpacing="3">VOLUME · MONEY</text>
      <text x="20" y="76" fill={c.primary} fontSize="22" fontFamily="Georgia, serif">Credit score / debt payoff</text>
      <text x="20" y="102" fill={c.primary} fontSize="9" fontFamily="Georgia, serif" opacity="0.75">A clear-eyed feature on getting free of debt — without the lecture.</text>
      <rect x="0" y="330" width="280" height="30" fill={c.primary} opacity="0.85" />
      <text x="20" y="350" fill={c.secondary} fontSize="7" fontWeight="600">ISSUE 001 · PROPOSED</text>
    </svg>
  );
}

function EditorialQuoteCard({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, { primary: '#1C1917', secondary: '#FAFAF9', accent: '#666' });
  return (
    <svg viewBox="0 0 200 200" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="200" height="200" fill={c.secondary} />
      <text x="20" y="60" fill={c.primary} fontSize="28" fontFamily="Georgia, serif" opacity="0.3">"</text>
      <text x="32" y="100" fill={c.primary} fontSize="11" fontFamily="Georgia, serif">Every page makes you smarter.</text>
      <line x1="32" y1="120" x2="80" y2="120" stroke={c.accent} strokeWidth="2" />
    </svg>
  );
}

function EditorialSocialCarousel({ gs, imageUrl }: { gs?: boolean; imageUrl?: string }) {
  const c = paletteFromGrayscale(gs, { primary: '#1C1917', secondary: '#FAFAF9', accent: '#666' });
  return (
    <svg viewBox="0 0 108 192" className="site00-cd-specimen__svg site00-cd-specimen__svg--imaged" aria-hidden="true">
      {imageUrl ? (
        <>
          <defs>
            <clipPath id="ndx-ed-carousel-clip"><rect width="108" height="192" /></clipPath>
          </defs>
          <g clipPath="url(#ndx-ed-carousel-clip)">
            <image href={imageUrl} x="0" y="0" width="108" height="192" preserveAspectRatio="xMidYMid slice" />
            <rect x="0" y="90" width="108" height="102" fill={c.secondary} opacity={gs ? 0.9 : 0.82} />
          </g>
        </>
      ) : (
        <rect width="108" height="192" fill={c.secondary} />
      )}
      <text x="12" y="28" fill={c.accent} fontSize="6">TECH</text>
      <text x="12" y="118" fill={c.primary} fontSize="13" fontFamily="Georgia, serif" fontWeight="600">Your phone,</text>
      <text x="12" y="136" fill={c.primary} fontSize="13" fontFamily="Georgia, serif" fontWeight="600">simplified</text>
      {!imageUrl ? (
        <>
          <text x="12" y="92" fill={c.primary} fontSize="8">without the lecture</text>
          <rect x="12" y="120" width="84" height="56" fill={c.primary} opacity="0.07" />
        </>
      ) : null}
    </svg>
  );
}

function EditorialFeedTile({ gs, imageUrl }: { gs?: boolean; imageUrl?: string }) {
  const c = paletteFromGrayscale(gs, { primary: '#1C1917', secondary: '#FAFAF9', accent: '#666' });
  return (
    <svg viewBox="0 0 120 120" className="site00-cd-specimen__svg site00-cd-specimen__svg--imaged" aria-hidden="true">
      {imageUrl ? (
        <>
          <defs>
            <clipPath id="ndx-ed-feedtile-clip"><rect width="120" height="120" /></clipPath>
          </defs>
          <g clipPath="url(#ndx-ed-feedtile-clip)">
            <image href={imageUrl} x="0" y="0" width="120" height="120" preserveAspectRatio="xMidYMid slice" />
            <rect x="0" y="86" width="120" height="34" fill={c.secondary} opacity={gs ? 0.9 : 0.82} />
          </g>
        </>
      ) : (
        <rect width="120" height="120" fill={c.secondary} />
      )}
      <text x="8" y="16" fill={c.accent} fontSize="6">{imageUrl ? 'CONSUMER' : 'MONEY'}</text>
      {!imageUrl ? (
        <>
          <text x="8" y="48" fill={c.primary} fontSize="11" fontFamily="Georgia, serif">Credit</text>
          <rect x="8" y="56" width="40" height="3" fill={c.accent} />
        </>
      ) : (
        <text x="8" y="108" fill={c.primary} fontSize="9" fontFamily="Georgia, serif">Smart spending</text>
      )}
    </svg>
  );
}

function EditorialVolumeColors({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, { primary: '#1C1917', secondary: '#FAFAF9', accent: '#666' });
  const bands = gs ? NDXBOOK_VOLUMES.map(() => '#999') : ['#B45309', '#65A30D', '#7C3AED', '#475569', '#0D9488'];
  return (
    <svg viewBox="0 0 360 80" className="site00-cd-specimen__svg" aria-hidden="true">
      {NDXBOOK_VOLUMES.map((vol, i) => (
        <g key={vol}>
          <rect x={8 + i * 70} y="8" width="64" height="64" fill={bands[i]} opacity="0.35" stroke={c.primary} strokeWidth="0.5" />
          <text x={16 + i * 70} y="44" fill={c.primary} fontSize="6">{vol}</text>
          <text x={16 + i * 70} y="58" fill={c.primary} fontSize="4" opacity="0.6">PROPOSED</text>
        </g>
      ))}
    </svg>
  );
}

function EditorialTypographySpread({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, { primary: '#1C1917', secondary: '#FAFAF9', accent: '#666' });
  return (
    <svg viewBox="0 0 360 180" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="360" height="180" fill={c.secondary} />
      <text x="20" y="40" fill={c.primary} fontSize="26" fontFamily="Georgia, serif">Headline</text>
      <text x="20" y="64" fill={c.primary} fontSize="11" opacity="0.75">Deck / subtitle line</text>
      <text x="20" y="96" fill={c.primary} fontSize="9">Body copy — comfortable reading size with editorial warmth.</text>
      <text x="20" y="130" fill={c.accent} fontSize="7" letterSpacing="2">LABEL · MONEY</text>
      <text x="20" y="152" fill={c.primary} fontSize="6" fontStyle="italic">Annotation caption</text>
    </svg>
  );
}

function EditorialArticleSequence({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, { primary: '#1C1917', secondary: '#FAFAF9', accent: '#666' });
  return (
    <svg viewBox="0 0 480 100" className="site00-cd-specimen__svg site00-cd-specimen__svg--scroll" aria-hidden="true">
      {['HOOK', 'CONTEXT', 'EXPLAIN', 'TAKEAWAY'].map((step, i) => (
        <g key={step} transform={`translate(${8 + i * 118}, 8)`}>
          <rect width="110" height="84" fill={c.secondary} stroke={c.primary} strokeWidth="0.5" />
          <text x="8" y="24" fill={c.accent} fontSize="6">SLIDE {i + 1}</text>
          <text x="8" y="48" fill={c.primary} fontSize="9" fontFamily="Georgia, serif">{step}</text>
        </g>
      ))}
    </svg>
  );
}

function EditorialMotionStoryboard({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, { primary: '#1C1917', secondary: '#FAFAF9', accent: '#666' });
  return (
    <svg viewBox="0 0 480 100" className="site00-cd-specimen__svg site00-cd-specimen__svg--scroll" aria-hidden="true">
      {['PAGE TURN', 'HEADLINE IN', 'QUOTE SHIFT', 'OUTRO'].map((frame, i) => (
        <g key={frame} transform={`translate(${8 + i * 118}, 8)`}>
          <rect width="110" height="84" fill={c.secondary} stroke={c.primary} strokeWidth="0.5" />
          <text x="8" y="48" fill={c.primary} fontSize="8" fontFamily="Georgia, serif">{frame}</text>
        </g>
      ))}
    </svg>
  );
}

function EditorialWordmark({ gs }: { gs?: boolean }) {
  const c = paletteFromGrayscale(gs, { primary: '#1C1917', secondary: '#FAFAF9', accent: '#666' });
  return (
    <svg viewBox="0 0 240 80" className="site00-cd-specimen__svg" aria-hidden="true">
      <rect width="240" height="80" fill={c.secondary} />
      <text x="16" y="52" fill={c.primary} fontSize="28" fontFamily="Georgia, serif">ndxbook</text>
    </svg>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SPECIMEN_MAP: Record<string, ComponentType<any>> = {
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
};

export function EditorialUtilityTerritoryView({ specimens, options }: TerritoryViewProps) {
  const gs = options?.grayscale || options?.structuralDiffMode;
  const hide = options?.hideLabels || options?.structuralDiffMode;

  return (
    <div className="site00-cd-territory site00-cd-territory--editorial-utility">
      <div className="site00-cd-territory__editorial-spread">
        {specimens.map((spec) => {
          const Comp = SPECIMEN_MAP[spec.specimenType] ?? EditorialMagazineCover;
          const layout =
            spec.specimenType === 'magazine_volume_opener' || spec.specimenType === 'knowledge_page' || spec.specimenType === 'page_001_editorial'
              ? 'tall'
              : spec.specimenType === 'feature_article_opener' || spec.specimenType === 'volume_color_system' || spec.specimenType.includes('sequence') || spec.specimenType === 'motion_storyboard'
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
