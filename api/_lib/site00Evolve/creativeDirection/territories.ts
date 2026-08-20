/** Three structurally distinct Creative Direction territories — territory-native specimen sets */

import { randomUUID } from 'node:crypto';
import type {
  CreativeBrief,
  CreativeTerritory,
  QualitativeRating,
  TerritoryRendererKey,
  TerritorySpecimen,
  TerritorySpecimenType,
} from './types.js';

const COMMON_ANCHORS: TerritorySpecimenType[] = ['wordmark', 'typography_system'];

function buildSpecimens(
  territoryId: string,
  types: TerritorySpecimenType[],
  rendererKey: TerritoryRendererKey,
): TerritorySpecimen[] {
  return types.map((specimenType) => ({
    id: randomUUID(),
    territoryId,
    specimenType,
    title: specimenType.replace(/_/g, ' ').toUpperCase(),
    status: 'SPEC_RENDERED' as const,
    renderSpec: { rendererKey, specimenType },
    generationJobId: null,
    provenance: {
      source: 'EVOLVE_CREATIVE_DIRECTION',
      classification: 'PROPOSED',
      approved: false,
    },
  }));
}

const INDEX_SIGNAL_SPECIMENS: TerritorySpecimenType[] = [
  'brand_index_card',
  'page_catalog_system',
  'page_001_indexed',
  'volume_registry',
  'cross_reference_map',
  'social_knowledge_card_916',
  'feed_index_tile',
  'navigation_archive_strip',
  'typography_system',
  'graphic_language',
  'motion_storyboard',
  'wordmark',
];

const EDITORIAL_UTILITY_SPECIMENS: TerritorySpecimenType[] = [
  'magazine_volume_opener',
  'feature_article_opener',
  'knowledge_page',
  'page_001_editorial',
  'quote_insight_card',
  'social_carousel_cover',
  'instagram_feed_tile',
  'volume_color_system',
  'typography_spread',
  'article_sequence',
  'motion_storyboard',
  'wordmark',
];

const KINETIC_FIELD_SPECIMENS: TerritorySpecimenType[] = [
  'motion_title_frame',
  'hook_frame_916',
  'page_001_kinetic',
  'motion_sequence_3frame',
  'page_number_transition',
  'volume_stinger',
  'social_feed_tile',
  'signal_graphic',
  'typography_system',
  'dark_light_inversion',
  'motion_storyboard',
  'wordmark',
];

export const TERRITORY_SPECIMEN_SETS = {
  index_signal: INDEX_SIGNAL_SPECIMENS,
  editorial_utility: EDITORIAL_UTILITY_SPECIMENS,
  kinetic_field: KINETIC_FIELD_SPECIMENS,
} as const;

export const COMMON_COMPARISON_ANCHORS = ['wordmark', 'page_001_indexed', 'page_001_editorial', 'page_001_kinetic', 'typography_system', 'volume_registry', 'volume_color_system', 'volume_stinger'] as const;

function analysisFor(index: 1 | 2 | 3): Record<string, QualitativeRating> {
  const base: Record<string, QualitativeRating> = {
    STRATEGIC_FIT: 'STRONG',
    DISTINCTIVENESS: 'MODERATE',
    SCALABILITY: 'STRONG',
    EDITORIAL_FLEXIBILITY: 'MODERATE',
    SOCIAL_PERFORMANCE_POTENTIAL: 'MODERATE',
    CROSS_VOLUME_COHERENCE: 'STRONG',
    MOTION_POTENTIAL: 'MODERATE',
    BRAND_OWNERSHIP: 'MODERATE',
  };
  if (index === 1) {
    return { ...base, DISTINCTIVENESS: 'STRONG', BRAND_OWNERSHIP: 'STRONG', MOTION_POTENTIAL: 'MODERATE' };
  }
  if (index === 2) {
    return { ...base, EDITORIAL_FLEXIBILITY: 'STRONG', SOCIAL_PERFORMANCE_POTENTIAL: 'STRONG' };
  }
  return { ...base, MOTION_POTENTIAL: 'STRONG', DISTINCTIVENESS: 'STRONG', SOCIAL_PERFORMANCE_POTENTIAL: 'STRONG' };
}

export function generateTerritories(brief: CreativeBrief): CreativeTerritory[] {
  void brief;
  const definitions: Array<Omit<CreativeTerritory, 'id' | 'specimens'>> = [
    {
      index: 1,
      name: 'INDEX SIGNAL',
      rendererKey: 'index_signal',
      thesis: 'NDXBOOK as a living index — structured knowledge architecture made visible through grid, numbering, and archival precision.',
      strategicRationale:
        'The brand promise “every page makes you smarter” maps to an index metaphor. Readers navigate volumes and pages like a reference system — visual language should make structure feel intelligent and trustworthy.',
      emotionalCharacter: 'Precise, curious, quietly authoritative',
      visualPrinciples: [
        'Visible page/volume indexing devices',
        'High-contrast typographic hierarchy',
        'Grid-forward composition with deliberate density control',
        'Monochrome base with single signal accent',
      ],
      colorLogic: {
        primary: '#0A0A0B',
        secondary: '#F4F4F5',
        accent: '#C41E3A',
        volumeDifferentiation: 'Accent stripe per volume — same neutral base',
      },
      typographyLogic: {
        display: 'Geometric sans — tight tracking for NDXBOOK wordmark',
        headline: 'Neutral grotesk — medium weight, high legibility',
        body: 'Humanist sans for explanations',
        metadata: 'Monospace for page/volume identifiers',
      },
      compositionBehavior: 'Catalog wall — index cards, registry matrix, cross-reference map',
      graphicLanguage: ['Index markers', 'Volume tabs', 'Page rails', 'Thin rules', 'Corner registration marks'],
      imageLanguage: 'Minimal — typographic and diagram-first; photography as accent only',
      informationHierarchy: 'Page ID → Hook → Explanation → Remember-this',
      motionBehavior: 'Sequential reveal — index tick, headline snap, content cascade',
      socialBehavior: '9:16 knowledge card with page index rail; feed tile uses catalog stamp',
      crossVolumeBehavior: 'Shared grid + typography; volume encoded by registry slot',
      strengths: ['Highly scalable page system', 'Strong brand ownership', 'Clear index metaphor'],
      risks: ['Could feel cold if motion/imagery underdeveloped', 'Requires discipline to avoid spreadsheet aesthetic'],
      ndxbookDistinctiveness: 'Owns “index book” literally — not generic explainer layout',
      relationshipToCanon: 'Derives from positioning, taxonomy, and voice — not legacy placeholder palette',
      lifecycleState: 'PROPOSED',
      legacyReferenceUsed: false,
      evolveAnalysis: analysisFor(1),
    },
    {
      index: 2,
      name: 'EDITORIAL UTILITY',
      rendererKey: 'editorial_utility',
      thesis: 'Premium educational editorial — warm intelligence that feels like a trusted modern magazine reinterpreted for short-form knowledge.',
      strategicRationale:
        'Audience seeks practical useful knowledge without academic weight. Editorial utility balances warmth and clarity — approachable but never childish.',
      emotionalCharacter: 'Warm, clear, inviting, confident',
      visualPrinciples: [
        'Generous whitespace and breathable hierarchy',
        'Volume color bands as editorial section breaks',
        'Photography/illustration as humanizing layer',
        'Soft geometry — rounded containers, not playful cartoon',
      ],
      colorLogic: {
        primary: '#1C1917',
        secondary: '#FAFAF9',
        accent: '#B45309',
        volumeDifferentiation: 'Muted volume palettes — proposed bands per volume',
      },
      typographyLogic: {
        display: 'Modern serif-accent for NDXBOOK',
        headline: 'Large confident sans — editorial scale',
        body: 'Comfortable reading size — 16–18px equivalent',
        metadata: 'Small caps labels for volume/chapter',
      },
      compositionBehavior: 'Magazine spread — feature opener, knowledge page, article sequence',
      graphicLanguage: ['Section dividers', 'Volume ribbons', 'Soft cards', 'Underline emphasis', 'Chapter chips'],
      imageLanguage: 'Curated object photography + simple diagrams; people optional, never stock-smile generic',
      informationHierarchy: 'Hook headline → context line → core explanation → remember chip',
      motionBehavior: 'Gentle fades and slide-ups — magazine page-turn energy',
      socialBehavior: 'Cover-style 9:16 with headline dominance; feed uses editorial crop',
      crossVolumeBehavior: 'Shared typography and layout; volume color band is primary differentiator',
      strengths: ['High approachability', 'Strong Instagram feed presence', 'Flexible for varied topics'],
      risks: ['Must guard against generic “explainer brand” look', 'Volume colors need strict governance'],
      ndxbookDistinctiveness: 'Editorial index — not BuzzFeed listicle or textbook',
      relationshipToCanon: 'Voice “useful + curious” drives warmth; rejects preachy/fear tones',
      lifecycleState: 'PROPOSED',
      legacyReferenceUsed: false,
      evolveAnalysis: analysisFor(2),
    },
    {
      index: 3,
      name: 'KINETIC FIELD',
      rendererKey: 'kinetic_field',
      thesis: 'Modern knowledge signal — dynamic typographic energy with data-forward graphics and controlled mystery through depth and motion.',
      strategicRationale:
        '“Slightly mysterious” voice plus TECH/MIND volumes benefit from kinetic systems. Short-form social rewards motion-ready typography and bold hooks without chaos.',
      emotionalCharacter: 'Sharp, energetic, intriguing, future-facing',
      visualPrinciples: [
        'Kinetic typography as primary visual actor',
        'Layered depth — foreground signal, midground content, background field',
        'Data visualization and diagram language',
        'Dark-mode forward with luminous highlights',
      ],
      colorLogic: {
        primary: '#0F172A',
        secondary: '#E2E8F0',
        accent: '#22D3EE',
        volumeDifferentiation: 'Hue shift on accent glow per volume — shared dark field',
      },
      typographyLogic: {
        display: 'Compressed display sans — NDXBOOK as signal block',
        headline: 'Variable weight sans with motion-ready spacing',
        body: 'Clean sans — high contrast on dark',
        metadata: 'Tabular nums for page metrics and index labels',
      },
      compositionBehavior: 'Motion board — frame sequences, asymmetric hook zones, z-axis layering',
      graphicLanguage: ['Signal lines', 'Node graphs', 'Scan lines', 'Glow accents', 'Page telemetry marks'],
      imageLanguage: 'Abstract data imagery, AI-assisted diagrams; no literal stock metaphors',
      informationHierarchy: 'Motion hook → rapid explanation layers → index stamp',
      motionBehavior: 'Kinetic type entrance, staggered reveals, pulse on key data points',
      socialBehavior: '9:16 built for Reels — hook in first 0.5s frame; static fallback for feed',
      crossVolumeBehavior: 'Shared dark field + motion grammar; volume = accent hue only',
      strengths: ['Highest motion/social energy', 'Distinct from generic white editorial', 'Strong TECH/FUTURE fit'],
      risks: ['Accessibility on dark UI', 'Can overwhelm if not governed', 'Production complexity for motion'],
      ndxbookDistinctiveness: 'Knowledge as signal — not neon hustle bro or sci-fi noise',
      relationshipToCanon: 'Interprets “slightly mysterious” + programming cadence; independent of indigo placeholder',
      lifecycleState: 'PROPOSED',
      legacyReferenceUsed: false,
      evolveAnalysis: analysisFor(3),
    },
  ];

  const specimenSets = [INDEX_SIGNAL_SPECIMENS, EDITORIAL_UTILITY_SPECIMENS, KINETIC_FIELD_SPECIMENS] as const;

  return definitions.map((def, i) => {
    const id = randomUUID();
    return {
      ...def,
      id,
      specimens: buildSpecimens(id, [...specimenSets[i]], def.rendererKey),
    };
  });
}

export function buildComparison(territories: CreativeTerritory[]) {
  const dimensions = [
    'STRATEGIC_FIT',
    'DISTINCTIVENESS',
    'SCALABILITY',
    'EDITORIAL_FLEXIBILITY',
    'SOCIAL_PERFORMANCE_POTENTIAL',
    'CROSS_VOLUME_COHERENCE',
    'MOTION_POTENTIAL',
    'BRAND_OWNERSHIP',
  ];
  const recommended = territories.find((t) => t.index === 1)!;
  return {
    dimensions,
    territories: territories.map((t) => ({
      territoryId: t.id,
      name: t.name,
      ratings: t.evolveAnalysis,
    })),
    evolveRecommendation: {
      territoryId: recommended.id,
      rationale:
        'INDEX SIGNAL best encodes the canonical “index book” positioning and scales cleanly across five volumes without visual fragmentation. Recommendation is analysis only — founder approval required.',
      isApproval: false as const,
    },
  };
}

export function specimenSetsAreDistinct(): boolean {
  const a = INDEX_SIGNAL_SPECIMENS.join(',');
  const b = EDITORIAL_UTILITY_SPECIMENS.join(',');
  const c = KINETIC_FIELD_SPECIMENS.join(',');
  return a !== b && b !== c && a !== c;
}
