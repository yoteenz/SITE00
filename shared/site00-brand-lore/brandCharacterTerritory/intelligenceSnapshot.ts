/**
 * Brand Character intelligence snapshot — upstream evidence only; topic-blind.
 */

import { createHash } from 'node:crypto';
import type { BrandLoreProfile } from '../types.js';
import {
  buildContentBrainPersonalityInput,
  summarizeContentBrainPersonalityInput,
} from '../contentBrainPersonalityBridge.js';
import { shouldIncludeCreativeAppetiteInFormation } from '../founderCreativeAppetite/experimentExclusion.js';
import {
  BURN_BOOK_CHARACTER_CALIBRATION_PURPOSE,
  BURN_BOOK_CHARACTER_EVIDENCE_CLASSIFICATION,
  BRAND_CHARACTER_INTELLIGENCE_SNAPSHOT_VERSION,
  NDXBOOK_CHARACTER_FORMATION_RUN_ID,
  UPSTREAM_CHARACTER_LAYER_MISSING,
} from './constants.js';
import type { BrandCharacterIntelligenceSnapshot, BrandCharacterIntelligenceProvenanceEntry } from './types.js';

function fingerprint(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16);
}

export function compileBrandCharacterIntelligenceSnapshot(params: {
  profile: BrandLoreProfile | null;
  freeze?: boolean;
  characterDiscoveryMode?: 'CHARACTER_DISCOVERY_REQUIRED' | 'CHARACTER_PARTIALLY_ESTABLISHED' | 'CHARACTER_ESTABLISHED';
}): BrandCharacterIntelligenceSnapshot {
  const { profile } = params;
  const appetiteIncluded = shouldIncludeCreativeAppetiteInFormation({
    experimentId: NDXBOOK_CHARACTER_FORMATION_RUN_ID,
    intelligenceSnapshotVersion: BRAND_CHARACTER_INTELLIGENCE_SNAPSHOT_VERSION,
  });

  const brandLevelTruth: string[] = [];
  if (profile?.brandBelief?.value) brandLevelTruth.push(String(profile.brandBelief.value));
  if (profile?.brandWorld?.value) brandLevelTruth.push(String(profile.brandWorld.value));
  if (profile?.audienceRelationship?.value) brandLevelTruth.push(String(profile.audienceRelationship.value));
  if (profile?.culturalOpposition?.value?.length) {
    brandLevelTruth.push((profile.culturalOpposition.value as string[]).join('; '));
  }

  const personalityEvidence: string[] = [];
  const personalityInput = buildContentBrainPersonalityInput(profile?.brandPersonality);
  if (personalityInput) {
    personalityEvidence.push(summarizeContentBrainPersonalityInput(personalityInput));
  }

  const provenanceEntries: BrandCharacterIntelligenceProvenanceEntry[] = [
    ...brandLevelTruth.map((s) => ({
      source: 'BRAND_LORE',
      classification: 'BRAND_INTELLIGENCE' as const,
      summary: s,
    })),
    ...(personalityInput
      ? [
          {
            source: 'BRAND_PERSONALITY',
            classification: 'PERSONALITY_EVIDENCE' as const,
            summary: 'Structured personality evidence — evidence layer, not character answer',
          },
        ]
      : []),
  ];

  const snapshot: BrandCharacterIntelligenceSnapshot = {
    snapshotVersion: BRAND_CHARACTER_INTELLIGENCE_SNAPSHOT_VERSION,
    fingerprint: '',
    compiledAt: new Date().toISOString(),
    frozen: params.freeze ?? false,
    provenanceEntries,
    brandLevelTruth,
    personalityEvidence,
    founderCreativeLatitude: appetiteIncluded ? 'FOUNDER_CREATIVE_LATITUDE' : null,
    culturalCalibrationEvidence: [
      {
        source: 'BURN_BOOK_CALIBRATION_EVIDENCE',
        purpose: BURN_BOOK_CHARACTER_CALIBRATION_PURPOSE,
        policy: 'CALIBRATION_ONLY',
        dimensions: [
          'ARTIFACT_BEHAVIOR',
          'CHARACTER_CALIBRATION',
          'HUMOR_CALIBRATION',
          'CULTURAL_CALIBRATION',
          'SOCIAL_BEHAVIOR',
        ],
      },
    ],
    excludedHistoricalEvidence: [
      'EXPERIMENT_F_SIX_CONTENT_CONCEPTS',
      'EXPERIMENT_G_SIX_BRAND_PRESENTATION_CONCEPTS',
      'EXPERIMENT_G_NINE_DIRECTIONS',
      'EXPERIMENT_G_SIX_BENCHMARK_VISUALS',
      'CREDIT_UTILIZATION_FRAMING',
      'SITE_00_PROJECTS_UX',
      'ACTIVE_WORKBENCH',
      'DOSSIER',
      'HOST_VISUAL_MEMORY',
      'BURN_BOOK_LITERAL_STYLE_MANDATE',
      'WORLD_FORMATION_EXAMPLES',
    ],
    topicBlind: true,
    characterDiscoveryMode: params.characterDiscoveryMode ?? 'CHARACTER_DISCOVERY_REQUIRED',
    upstreamCharacterLayerMissingNote: UPSTREAM_CHARACTER_LAYER_MISSING,
  };

  snapshot.fingerprint = fingerprint({
    version: snapshot.snapshotVersion,
    brandLevelTruth,
    personalityEvidence,
    appetiteIncluded,
    excluded: snapshot.excludedHistoricalEvidence,
    referenceClassification: BURN_BOOK_CHARACTER_EVIDENCE_CLASSIFICATION,
  });

  return snapshot;
}

export function experimentFExcludedFromCharacterFormation(): true {
  return true;
}

export function experimentGExcludedAsCharacterAnswers(): true {
  return true;
}

export function benchmarkVisualsExcludedAsPositiveCharacterAnswers(): true {
  return true;
}

export function creditUtilizationExcludedFromCharacterFormation(): true {
  return true;
}
