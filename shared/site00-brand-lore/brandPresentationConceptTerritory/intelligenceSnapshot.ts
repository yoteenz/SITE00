/**
 * Experiment G intelligence snapshot — topic-blind brand-level inputs only.
 */

import { createHash } from 'node:crypto';
import type { BrandLoreProfile } from '../types.js';
import { shouldIncludeCreativeAppetiteInFormation } from '../founderCreativeAppetite/experimentExclusion.js';
import {
  BURN_BOOK_EVIDENCE_CLASSIFICATION,
  BURN_BOOK_REFERENCE_PURPOSE,
  EXPERIMENT_G_INTELLIGENCE_SNAPSHOT_VERSION,
  EXPERIMENT_G_RUN_ID,
} from './constants.js';
import type { BrandPresentationIntelligenceSnapshot, IntelligenceProvenanceEntry } from './types.js';

function fingerprint(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16);
}

export function compileExperimentGIntelligenceSnapshot(params: {
  profile: BrandLoreProfile | null;
  freeze?: boolean;
}): BrandPresentationIntelligenceSnapshot {
  const { profile } = params;
  const appetiteIncluded = shouldIncludeCreativeAppetiteInFormation({
    experimentId: EXPERIMENT_G_RUN_ID,
    intelligenceSnapshotVersion: EXPERIMENT_G_INTELLIGENCE_SNAPSHOT_VERSION,
  });

  const brandLevelTruth: string[] = [];
  if (profile?.brandBelief?.value) brandLevelTruth.push(profile.brandBelief.value);
  if (profile?.brandWorld?.value) brandLevelTruth.push(profile.brandWorld.value);
  if (profile?.culturalOpposition?.value?.length) {
    brandLevelTruth.push(profile.culturalOpposition.value.join('; '));
  }

  const brandPersonality: string[] = [];
  if (profile?.brandPersonality) {
    brandPersonality.push('BRAND_PERSONALITY_PRESENT');
  }

  const primaryExpressionContext: string[] = [];
  if (profile?.contextClassification) {
    primaryExpressionContext.push(String(profile.contextClassification));
  }

  const preferenceEvidence: string[] = [];
  if (profile?.founderCreativeAppetite) {
    const summary =
      (profile.founderCreativeAppetite as { synthesizedSummary?: string }).synthesizedSummary ??
      'FOUNDER_CREATIVE_APPETITE_PRESENT';
    preferenceEvidence.push(summary);
  }

  const provenanceEntries: IntelligenceProvenanceEntry[] = [
    ...brandLevelTruth.map((s) => ({
      source: 'BRAND_LORE',
      classification: 'BRAND_INTELLIGENCE' as const,
      summary: s,
    })),
    ...brandPersonality.map((s) => ({
      source: 'BRAND_PERSONALITY',
      classification: 'BRAND_INTELLIGENCE' as const,
      summary: s,
    })),
    ...primaryExpressionContext.map((s) => ({
      source: 'PRIMARY_EXPRESSION_CONTEXT',
      classification: 'PRIMARY_EXPRESSION_CONTEXT' as const,
      summary: s,
    })),
  ];

  const snapshot: BrandPresentationIntelligenceSnapshot = {
    snapshotVersion: EXPERIMENT_G_INTELLIGENCE_SNAPSHOT_VERSION,
    fingerprint: '',
    compiledAt: new Date().toISOString(),
    frozen: params.freeze ?? false,
    provenanceEntries,
    brandLevelTruth,
    brandPersonality,
    primaryExpressionContext,
    founderCreativeLatitude: appetiteIncluded ? 'FOUNDER_CREATIVE_LATITUDE' : null,
    preferenceEvidence,
    referenceEvidence: [
      {
        source: 'BURN_BOOK_CALIBRATION_EVIDENCE',
        purpose: BURN_BOOK_REFERENCE_PURPOSE,
        policy: 'CALIBRATION_ONLY',
      },
    ],
    excludedHistoricalEvidence: [
      'EXPERIMENT_D_SIX_CONCEPTS',
      'EXPERIMENT_D_WORLD_EXPRESSION',
      'EXPERIMENT_F_SIX_CONTENT_CONCEPTS',
      'CREDIT_UTILIZATION_FRAMING',
      'SITE_00_PROJECTS_UX',
      'ACTIVE_WORKBENCH',
      'DOSSIER',
      'HOST_VISUAL_MEMORY',
      'FRONTAL_SLAYER',
      'WORLD_FORMATION_EXAMPLES',
      'TAROT_EXAMPLES',
      'BURN_BOOK_LITERAL_IMPLEMENTATION',
    ],
    topicBlind: true,
    appetiteIncluded,
  };

  snapshot.fingerprint = fingerprint({
    version: snapshot.snapshotVersion,
    brandLevelTruth,
    brandPersonality,
    primaryExpressionContext,
    appetiteIncluded,
    excluded: snapshot.excludedHistoricalEvidence,
    referenceClassification: BURN_BOOK_EVIDENCE_CLASSIFICATION,
  });

  return snapshot;
}

export function successorSnapshotIndependentFromExperimentF(): true {
  return true;
}

export function topicEvidenceExcludedFromFormation(): true {
  return true;
}
