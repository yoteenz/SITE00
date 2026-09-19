/**
 * Forensic audit of NDXBOOK creative production records — Phase 0.
 * Read-only; produces migration/normalization plan without mutation.
 */

import type { ForensicAuditReport } from './types.js';

export const NDXBOOK_STORAGE_PATH_REGISTRY = {
  personalityReplayHero: 'site00/validation/ndxbook/personality-replay/{replayId}/{heroAssetId}.webp',
  sixDirectionHero: 'site00/validation/ndxbook/personality-replay/{replayId}/six-direction/{01-06}/hero.webp',
  canonicalRangeHero: 'site00/validation/ndxbook/canonical-creative-range/{01-06}/hero.webp',
  carouselExpansionSlide: 'site00/validation/ndxbook/canonical-carousel-expansion/{01-06}/slide-{01-06}.webp',
  boardAsset: 'site00/creative-direction/ndxbook/boards/{01-06}/',
  comparisonProof: 'site00/creative-direction/ndxbook/proofs/{01-06}/',
  territorySpecimen: 'site00/creative-direction/ndxbook/{territoryKey}/',
  asstsPilot: 'site00/assts/batches/ndxbook-*/generated/',
} as const;

export const NDXBOOK_RECORD_STORE_REGISTRY = {
  methodologyValidationRuns: 'site00_methodology_validation_runs (JSONB record)',
  coreDirectionFormations: 'site00_core_direction_formations (visual_proof_plans, final_directions)',
  brandLoreProfiles: 'site00_brand_lore_profiles (upstream intelligence)',
  filesystemManifests: 'api/_lib/site00Evolve/creativeDirection/generatedAssets/*.json',
  engagementFounderDecision: 'engagementService in-memory Map (EPHEMERAL)',
} as const;

export function buildForensicAuditReport(params: {
  brandSlug: string;
  assetCount: number;
  conceptCount: number;
  experimentCounts?: Record<string, number>;
}): ForensicAuditReport {
  const ephemeralRisks = [
    'Engagement founder decisions live in process memory — lost on Railway redeploy',
    'Validation runs fall back to in-memory store when Supabase unavailable',
    'Filesystem manifests (boards, proofs, pilots) not durable across redeploy unless re-seeded',
    'Storage blobs have no FK — orphanable if run metadata lost (Exp B recovery mitigates heroes)',
    'FAL URLs expire — mitigated by download+re-upload to Supabase storage',
  ];

  const missingLineage = [
    'No unified CreativeAssetRecord table before this sprint — assets embedded in JSONB runs',
    'Prompts stored as hashes/receipts only — full prompt text in manifests/board entries only',
    'Cross-experiment asset relationships not explicitly linked (cover → carousel slide 01 manual)',
    'Founder judgments scattered across experiment-specific fields',
  ];

  const historicalPreservation = [
    'site00_methodology_validation_runs JSONB records MUST NOT be mutated or deleted',
    'Experiment classification guards: SHADOW vs CANONICAL_CREATIVE_RANGE vs CAROUSEL_EXPANSION',
    'Preserved carousel covers reference Experiment B hero storage paths — immutable',
    'Formation records remain source of truth for direction intelligence',
  ];

  const migrationPlan = [
    '1. Apply site00_creative_lineage migration — new normalized tables alongside existing JSONB',
    '2. Run normalizeNdxbookCreativeLineage() — upsert CreativeAssetRecords from existing runs (idempotent)',
    '3. Derive CreativeConceptRecords from direction world bibles and DNA envelopes',
    '4. Create CreativeFamily per topic+direction (never merge same-topic across directions)',
    '5. Link parent/child: carousel cover (preserved hero) → slides 02-06',
    '6. Preserve historicalSourceRef pointing to original JSONB path — no overwrite',
    '7. Do NOT delete methodology_validation_runs or storage blobs',
    '8. Persist engagement founder decisions to durable store in future sprint',
  ];

  return {
    auditedAt: new Date().toISOString(),
    brandSlug: params.brandSlug,
    assetsDiscovered: params.assetCount,
    conceptsDiscovered: params.conceptCount,
    ephemeralRisks,
    missingLineage,
    historicalPreservation,
    migrationPlan,
    storagePaths: { ...NDXBOOK_STORAGE_PATH_REGISTRY },
    experimentRecords: params.experimentCounts ?? {},
  };
}

export function runHistoricalProvenanceImmutabilityTest(record: { immutable?: boolean; historicalSourceRef?: string | null }): {
  passed: boolean;
  notes: string[];
} {
  const notes: string[] = [];
  if (record.immutable !== true) notes.push('Record not marked immutable');
  if (!record.historicalSourceRef) notes.push('Missing historicalSourceRef');
  return { passed: notes.length === 0, notes };
}
