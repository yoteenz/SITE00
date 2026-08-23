/**
 * Pre-generation readiness for canonical creative range validation — no image API calls.
 */

import type { BrandLoreProfile } from './types.js';
import { deriveFormatNativeExpressionProfile } from './formatNativeExpression.js';
import { deriveNativeFormatForDirection } from './directionNativeFormatSelection.js';
import { compileDirectionDnaEnvelope } from './directionDnaEnvelope.js';
import {
  resolveCanonicalCreativeRangeDirectionsFromFormations,
  runCanonicalSixDirectionRosterTest,
  type CanonicalCreativeRangeRosterEntry,
} from './canonicalCreativeRangeResolver.js';
import {
  CANONICAL_CREATIVE_RANGE_EXPERIMENT,
  CANONICAL_SIX_DIRECTION_SPEC,
} from './canonicalCreativeRangeConstants.js';
import type { CanonicalRangeGenerationPreflight } from './canonicalCreativeRangeTypes.js';
import type { CoreDirectionFormationRecord } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/types.js';

export async function buildCanonicalRangeGenerationPreflight(params: {
  brandSlug: string;
  profile: BrandLoreProfile | null;
  v1: CoreDirectionFormationRecord | null;
  v2: CoreDirectionFormationRecord | null;
}): Promise<CanonicalRangeGenerationPreflight> {
  const blockers: string[] = [];
  if (params.brandSlug !== 'ndxbook') blockers.push('NDXBOOK-only experiment');
  if (!params.v1) blockers.push('Canonical formation v1 unavailable');
  if (!params.v2) blockers.push('Canonical formation v2 unavailable');

  let roster: CanonicalCreativeRangeRosterEntry[] = [];
  if (params.v1 && params.v2) {
    try {
      roster = resolveCanonicalCreativeRangeDirectionsFromFormations({ v1: params.v1, v2: params.v2 });
    } catch (err) {
      blockers.push(err instanceof Error ? err.message : 'Roster resolution failed');
    }
  }

  const rosterTest = runCanonicalSixDirectionRosterTest({ roster, shadowRosterUsed: false });
  if (!rosterTest.passed) {
    blockers.push(...rosterTest.notes);
  }

  const formatProfile = params.profile
    ? deriveFormatNativeExpressionProfile({
        context: 'SOCIAL_FIRST_EDITORIAL',
        profile: params.profile,
        personality: params.profile.brandPersonality,
      })
    : null;

  const provenanceReports = roster.map((r) => r.provenance);
  for (const p of provenanceReports) {
    if (p.missingLayers.length > 0) {
      blockers.push(`${p.canonicalName}: missing layers — ${p.missingLayers.join(', ')}`);
    }
  }

  let formatDerived = true;
  let paletteDerived = true;
  let typographyDerived = true;
  if (formatProfile && roster.length === 6) {
    for (const entry of roster) {
      const fmt = deriveNativeFormatForDirection({ direction: entry.direction, formatProfile });
      const dna = compileDirectionDnaEnvelope({
        direction: entry.direction,
        canonicalName: entry.canonicalName,
        comparisonIndex: entry.comparisonIndex,
        formatSelection: fmt,
      });
      if (!fmt.formatSelectionDerivedFromDirection) formatDerived = false;
      if (!dna.paletteDerivedFromDirection) paletteDerived = false;
      if (!dna.typographyDerivedFromDirection) typographyDerived = false;
    }
  } else if (roster.length === 6) {
    blockers.push('Brand Lore profile unavailable — cannot verify per-direction format/palette derivation');
    formatDerived = false;
    paletteDerived = false;
    typographyDerived = false;
  }

  if (!formatDerived) blockers.push('Format selection not derived from direction intelligence for all six directions');
  if (!paletteDerived) blockers.push('Palette not derived from canonical direction intelligence for all six directions');
  if (!typographyDerived) {
    blockers.push('Typography not derived from canonical direction intelligence for all six directions');
  }

  return {
    canonicalRangeGenerationReady: blockers.length === 0 && rosterTest.passed,
    experimentClassification: CANONICAL_CREATIVE_RANGE_EXPERIMENT,
    directions: CANONICAL_SIX_DIRECTION_SPEC.map((s) => ({
      comparisonIndex: s.comparisonIndex,
      canonicalName: s.canonicalName,
    })),
    canonicalDirectionCount: roster.length,
    uniqueDirectionCount: rosterTest.uniqueCanonicalDirectionCount,
    shadowRosterUsed: false,
    nearMissNamesPresent: rosterTest.nearMissNamesPresent,
    crossDirectionIsolation: true,
    hostTypographyExcluded: true,
    formatSelectionDerivedPerDirection: formatDerived,
    paletteDerivedPerDirection: paletteDerived,
    typographyDerivedPerDirection: typographyDerived,
    rosterTest,
    provenanceReports,
    blockers,
    anthropicRequests: 0,
    gptImageRequests: 0,
    falRequests: 0,
  };
}
