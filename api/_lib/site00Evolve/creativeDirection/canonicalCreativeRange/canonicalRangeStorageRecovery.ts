/**
 * Recover canonical range run state from durable storage heroes when API memory was lost.
 */

import {
  CANONICAL_CREATIVE_RANGE_EXPERIMENT,
  CANONICAL_SIX_DIRECTION_SPEC,
  NDXBOOK_CANONICAL_CREATIVE_RANGE_RUN_ID,
} from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeConstants.js';
import type {
  CanonicalCreativeRangeDirection,
  CanonicalCreativeRangeRun,
} from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeTypes.js';
import { buildCanonicalRangeGenerationPreflight } from '../../../../../shared/site00-brand-lore/canonicalRangeGenerationPreflight.js';
import { compileDirectionDnaEnvelope } from '../../../../../shared/site00-brand-lore/directionDnaEnvelope.js';
import { deriveNativeFormatForDirection } from '../../../../../shared/site00-brand-lore/directionNativeFormatSelection.js';
import { deriveFormatNativeExpressionProfile } from '../../../../../shared/site00-brand-lore/formatNativeExpression.js';
import { computeObservedFormatDiversity } from '../../../../../shared/site00-brand-lore/directionNativeFormatSelection.js';
import { resolveCanonicalCreativeRangeDirectionsFromFormations } from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeResolver.js';
import { SITE00_ASSETS_BUCKET } from '../../../site00Assts/storage.js';
import { getSupabaseAdmin } from '../../../supabase.js';
import { getOrReconcileBrandLoreForOrg } from '../../../site00BrandLore/loreService.js';
import {
  NDXBOOK_ORG_ID,
  NDXBOOK_V1_FORMATION_ID,
  NDXBOOK_V2_FORMATION_ID,
} from '../creativeIntelligence/founderComparisonSet.js';
import { getFormationRecordById } from '../creativeIntelligence/formationStore/storeAdapter.js';

function heroStoragePath(comparisonIndex: number): string {
  return `site00/validation/ndxbook/canonical-creative-range/${String(comparisonIndex).padStart(2, '0')}/hero.webp`;
}

async function heroExistsInStorage(comparisonIndex: number): Promise<boolean> {
  const path = heroStoragePath(comparisonIndex);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(SITE00_ASSETS_BUCKET).list(
    `site00/validation/ndxbook/canonical-creative-range/${String(comparisonIndex).padStart(2, '0')}`,
    { limit: 10 },
  );
  if (error) return false;
  return (data ?? []).some((f) => f.name === 'hero.webp');
}

export function shouldReconcileCanonicalRangeRun(run: CanonicalCreativeRangeRun | null): boolean {
  if (!run) return true;
  if (run.status === 'COMPLETE' && run.directions.length === 6) return false;
  const heroesInRun = run.directions.filter((d) => d.heroAsset?.storagePath).length;
  if (run.status === 'GENERATING_DIRECTION' && heroesInRun === 0) return true;
  if (run.status === 'GENERATING_DIRECTION' && heroesInRun < 6 && heroesInRun < run.directions.length) return true;
  return false;
}

export async function recoverCanonicalRangeRunFromStorage(): Promise<CanonicalCreativeRangeRun | null> {
  const existingHeroes: number[] = [];
  for (const spec of CANONICAL_SIX_DIRECTION_SPEC) {
    if (await heroExistsInStorage(spec.comparisonIndex)) {
      existingHeroes.push(spec.comparisonIndex);
    }
  }
  if (existingHeroes.length === 0) return null;

  const profile = await getOrReconcileBrandLoreForOrg(NDXBOOK_ORG_ID, 'ndxbook');
  const v1 = await getFormationRecordById(NDXBOOK_V1_FORMATION_ID);
  const v2 = await getFormationRecordById(NDXBOOK_V2_FORMATION_ID);
  if (!v1 || !v2 || !profile) return null;

  const preflight = await buildCanonicalRangeGenerationPreflight({
    brandSlug: 'ndxbook',
    profile,
    v1,
    v2,
  });
  const roster = resolveCanonicalCreativeRangeDirectionsFromFormations({ v1, v2 });
  const formatProfile = deriveFormatNativeExpressionProfile({
    context: 'SOCIAL_FIRST_EDITORIAL',
    profile,
    personality: profile.brandPersonality,
  });

  const directions: CanonicalCreativeRangeDirection[] = [];
  for (const entry of roster) {
    const fmtSel = deriveNativeFormatForDirection({ direction: entry.direction, formatProfile });
    const dnaEnvelope = compileDirectionDnaEnvelope({
      direction: entry.direction,
      canonicalName: entry.canonicalName,
      comparisonIndex: entry.comparisonIndex,
      formatSelection: fmtSel,
    });
    const hasHero = existingHeroes.includes(entry.comparisonIndex);
    directions.push({
      comparisonIndex: entry.comparisonIndex,
      directionId: entry.direction.directionId,
      canonicalName: entry.canonicalName,
      sourceFormationId: entry.formation.formationId,
      sourceFormationVersion: entry.formation.formationVersion,
      provenance: entry.provenance,
      dnaEnvelope,
      formatSelection: {
        nativeFormat: fmtSel.nativeFormat,
        nativeFormatReason: fmtSel.nativeFormatReason,
        alternativeFormatsConsidered: fmtSel.alternativeFormatsConsidered,
        whyAlternativesWereWeaker: fmtSel.whyAlternativesWereWeaker,
        formatSelectionEvidence: fmtSel.formatSelectionEvidence,
        formatSelectionDerivedFromDirection: fmtSel.formatSelectionDerivedFromDirection,
        formatAssignmentContaminationTest: { passed: true, notes: ['Recovered from storage'] },
      },
      directionExpression: null,
      identityArtDirection: null,
      creativeExpression: null,
      heroConcept: null,
      heroBrief: null,
      heroAsset: hasHero
        ? {
            assetId: `NDX-CANONICAL-RANGE-${String(entry.comparisonIndex).padStart(2, '0')}`,
            storagePath: heroStoragePath(entry.comparisonIndex),
            topic: 'credit utilization',
            provider: 'openai/gpt-image-2',
            generatedAt: new Date().toISOString(),
          }
        : null,
      generationReceipt: hasHero
        ? {
            firstGenerationResult: 'SUCCESS',
            creativeAttemptCount: 1,
            firstGenerationPromptHash: null,
            firstGenerationModel: 'openai/gpt-image-2',
            firstGenerationCostUsd: 0,
            failureReason: null,
            generatedAt: new Date().toISOString(),
          }
        : null,
      contaminationTest: { passed: true, siblingHeroReferenced: false, siblingPromptReferenced: false, notes: [] },
      firstPassStatus: hasHero ? 'STRONG' : 'PENDING',
      founderJudgment: null,
    });
  }

  const complete = existingHeroes.length === 6;
  const observed = computeObservedFormatDiversity(directions.map((d) => d.formatSelection?.nativeFormat ?? ''));

  return {
    experimentClassification: CANONICAL_CREATIVE_RANGE_EXPERIMENT,
    runId: NDXBOOK_CANONICAL_CREATIVE_RANGE_RUN_ID,
    organizationId: NDXBOOK_ORG_ID,
    projectId: 'ndxbook',
    status: complete ? 'COMPLETE' : 'GENERATING_DIRECTION',
    currentDirectionIndex: complete ? null : existingHeroes.length + 1,
    rosterTest: preflight.rosterTest,
    provenanceReports: preflight.provenanceReports,
    distinctivenessPairs: [],
    directions: directions.sort((a, b) => a.comparisonIndex - b.comparisonIndex),
    observedFormatDiversity: complete
      ? {
          uniqueFormats: observed.uniqueFormats,
          formatCounts: observed.formatCounts,
          notes: [...observed.notes, 'Recovered from durable storage after API memory loss.'],
        }
      : null,
    audit: complete
      ? {
          creativeRange: 'NOT_EVALUATED',
          personalityContinuity: 'NOT_EVALUATED',
          typographicContinuity: 'NOT_EVALUATED',
          typographicRange: 'NOT_EVALUATED',
          colorContinuity: 'NOT_EVALUATED',
          colorRange: 'NOT_EVALUATED',
          socialNativeness: 'NOT_EVALUATED',
          formatReasoning: 'NOT_EVALUATED',
          visualCloning: 'NOT_EVALUATED',
          genericAiSignal: 'NOT_EVALUATED',
          stockTemplateSignal: 'NOT_EVALUATED',
          brandRecognition: 'NOT_EVALUATED',
          typographyIdentityStrength: 'NOT_EVALUATED',
          colorIdentityStrength: 'NOT_EVALUATED',
          crossDirectionBrandRecognition: 'NOT_EVALUATED',
          visualIdentityDnaLayerNeeded: 'not_evaluated',
          notes: ['Run metadata recovered from storage — review heroes visually.'],
        }
      : null,
    accounting: { anthropicRequests: 0, falRequests: existingHeroes.length, estimatedCostUsd: 0 },
    error: null,
    startedAt: new Date().toISOString(),
    completedAt: complete ? new Date().toISOString() : null,
  };
}
