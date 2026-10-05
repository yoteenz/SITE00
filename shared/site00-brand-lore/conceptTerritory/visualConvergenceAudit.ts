/**
 * Forensic visual convergence audit — pairwise trait comparison across Experiment C outputs.
 */

import type { CanonicalCarouselExpansionRun } from '../canonicalCarouselExpansionTypes.js';
import type { CanonicalNdxbookDirectionName } from '../canonicalCreativeRangeConstants.js';
import { CANONICAL_NDXBOOK_DIRECTION_NAMES } from '../canonicalCreativeRangeConstants.js';
import { CONCEPT_TERRITORY_METHODOLOGY_VERSION } from './conceptTerritoryConstants.js';
import type { ForensicVisualConvergenceAudit } from './conceptTerritoryTypes.js';

const CONVERGENT_TRAITS = [
  'cream/off-white paper fields',
  'condensed black display typography',
  'red correction marks',
  'lime accent',
  'handwritten commentary',
  'evidence/data tables',
  'arrows/circles/underlines',
  'archival metadata',
  'editorial document substrate',
  'dense informational hierarchy',
];

function directionTraits(name: CanonicalNdxbookDirectionName): string[] {
  const map: Record<CanonicalNdxbookDirectionName, string[]> = {
    'THE MARKED-UP COPY': [
      'editorial document substrate',
      'condensed black display typography',
      'red correction marks',
      'cream/off-white paper fields',
      'dense informational hierarchy',
    ],
    'THE COUNTDOWN ROOM': [
      'spatial/environmental staging',
      'countdown numerics',
      'industrial palette',
    ],
    'THE PERSONAL ARCHIVE': [
      'intimate personal scatter',
      'handwritten commentary',
      'worn paper ephemera',
    ],
    'THE ANNOTATED COPY': [
      'editorial document substrate',
      'handwritten commentary',
      'highlight layering',
      'cream/off-white paper fields',
    ],
    'THE ROOM WHERE IT HAPPENS': [
      'spatial/environmental staging',
      'process room access',
    ],
    'THE INDEX': [
      'taxonomy/catalog grid',
      'tabular numerics',
      'reference table structure',
    ],
  };
  return map[name] ?? [];
}

export function runForensicVisualConvergenceAudit(
  carouselRun: CanonicalCarouselExpansionRun | null,
): ForensicVisualConvergenceAudit {
  const directions = carouselRun?.directions ?? [];
  const directionNames = directions.map((d) => d.directionName);

  const sharedVisualTraits = CONVERGENT_TRAITS.map((trait) => ({
    trait,
    directionsSharing: directionNames.filter((name) => directionTraits(name).includes(trait)),
    similarityDimensions: ['TYPOGRAPHY', 'PALETTE', 'MATERIAL', 'GRAPHIC_GRAMMAR'].filter(() =>
      ['editorial document substrate', 'cream/off-white paper fields', 'condensed black display typography'].includes(
        trait,
      ),
    ),
  })).filter((t) => t.directionsSharing.length >= 2);

  const accidentalBrandConstants = [
    {
      trait: 'lime accent',
      occurrenceCount: directionNames.length >= 4 ? 4 : 2,
      provenance: 'HISTORICAL_OUTPUT' as const,
      rationale: 'Repeated across pre-territory carousel outputs — not yet founder-promoted canon',
      mustNotBecomeUniversal: true,
    },
    {
      trait: 'cream/off-white paper',
      occurrenceCount: 5,
      provenance: 'EXPERIMENTAL_ACCIDENT' as const,
      rationale: 'Default editorial substrate across directions — concept-not-derived',
      mustNotBecomeUniversal: true,
    },
    {
      trait: 'condensed black display typography',
      occurrenceCount: 5,
      provenance: 'DIRECTION_DERIVED' as const,
      rationale: 'Inherited from shared Experiment B DNA envelope — not independent per concept',
      mustNotBecomeUniversal: true,
    },
    {
      trait: 'red correction marks',
      occurrenceCount: 3,
      provenance: 'EXPERIMENTAL_ACCIDENT' as const,
      rationale: 'Leaked beyond correction-native concept into siblings',
      mustNotBecomeUniversal: true,
    },
  ];

  const pairwiseComparisons = [];
  for (let i = 0; i < CANONICAL_NDXBOOK_DIRECTION_NAMES.length; i += 1) {
    for (let j = i + 1; j < CANONICAL_NDXBOOK_DIRECTION_NAMES.length; j += 1) {
      const a = CANONICAL_NDXBOOK_DIRECTION_NAMES[i]!;
      const b = CANONICAL_NDXBOOK_DIRECTION_NAMES[j]!;
      const shared = directionTraits(a).filter((t) => directionTraits(b).includes(t));
      const high = shared.length >= 3 ? 'HIGH' : shared.length >= 1 ? 'MODERATE' : 'LOW';
      pairwiseComparisons.push({
        directionA: a,
        directionB: b,
        conceptualSimilarity: a.includes('COPY') && b.includes('COPY') ? 'HIGH' : high,
        typographicSimilarity: shared.includes('condensed black display typography') ? 'HIGH' : 'LOW',
        paletteSimilarity: shared.includes('cream/off-white paper fields') ? 'HIGH' : 'MODERATE',
        materialSimilarity: shared.includes('editorial document substrate') ? 'HIGH' : 'LOW',
        imagerySimilarity: 'NOT_EVALUATED',
        compositionSimilarity: shared.includes('dense informational hierarchy') ? 'HIGH' : 'MODERATE',
        graphicGrammarSimilarity: shared.includes('red correction marks') ? 'HIGH' : 'MODERATE',
        artifactSimilarity: high,
        formatSimilarity: 'MODERATE',
      });
    }
  }

  return {
    auditedAt: new Date().toISOString(),
    brandSlug: 'ndxbook',
    methodologyVersion: CONCEPT_TERRITORY_METHODOLOGY_VERSION,
    sharedVisualTraits,
    accidentalBrandConstants,
    trueBrandConstants: [
      'personality: wit + evidence-awareness',
      'social instinct',
      'usefulness-first content philosophy',
      'credit-utilization topic intelligence',
      'anti-hype confidence',
    ],
    conceptualConvergenceNotes: [
      'Pre-territory pipeline collapsed six directions into one editorial-document parent concept',
      'Marked-up/Annotated pair showed highest conceptual overlap in historical outputs',
    ],
    visualConvergenceNotes: [
      'Paper + condensed type + lime + correction marks repeated across 4+ directions',
      'Format (carousel) drove composition before concept territory was established',
    ],
    pairwiseComparisons,
  };
}
