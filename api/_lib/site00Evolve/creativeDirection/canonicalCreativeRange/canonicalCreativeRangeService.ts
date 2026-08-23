/**
 * Canonical six-direction creative range validation orchestrator — Experiment B.
 */

import { createHash } from 'node:crypto';
import type { BrandLoreProfile } from '../../../../../shared/site00-brand-lore/types.js';
import {
  CANONICAL_CREATIVE_RANGE_EXPERIMENT,
  NDXBOOK_CANONICAL_CREATIVE_RANGE_RUN_ID,
} from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeConstants.js';
import type {
  CanonicalCreativeRangeDirection,
  CanonicalCreativeRangeRun,
  CanonicalRangeGenerationPreflight,
} from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeTypes.js';
import {
  resolveCanonicalCreativeRangeDirectionsFromFormations,
  runCanonicalSixDirectionRosterTest,
  type CanonicalCreativeRangeRosterEntry,
} from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeResolver.js';
import { buildCanonicalRangeGenerationPreflight } from '../../../../../shared/site00-brand-lore/canonicalRangeGenerationPreflight.js';
import {
  compileDirectionDnaEnvelope,
  compareDnaEnvelopes,
  runCrossDirectionGenerationContaminationTest,
} from '../../../../../shared/site00-brand-lore/directionDnaEnvelope.js';
import {
  deriveNativeFormatForDirection,
  computeObservedFormatDiversity,
} from '../../../../../shared/site00-brand-lore/directionNativeFormatSelection.js';
import { deriveFormatNativeExpressionProfile } from '../../../../../shared/site00-brand-lore/formatNativeExpression.js';
import { assertNoHostFontInPayload } from '../../../../../shared/site00-brand-lore/typographyProvenance.js';
import { buildCoreDirectionFormationInput } from '../creativeIntelligence/formationInputBuilder.js';
import {
  NDXBOOK_ORG_ID,
  NDXBOOK_V1_FORMATION_ID,
  NDXBOOK_V2_FORMATION_ID,
} from '../creativeIntelligence/founderComparisonSet.js';
import { getFormationRecordById } from '../creativeIntelligence/formationStore/storeAdapter.js';
import { getCreativeIntelligenceProvider } from '../creativeIntelligence/providerRegistry.js';
import { runSonnetDirectionExpressionSystem } from '../creativeIntelligence/directionExpressionSystemService.js';
import { runIdentityNativeArtDirector } from '../creativeIntelligence/identityNativeArtDirectorService.js';
import { runCreativeExpressionDirector } from '../creativeIntelligence/creativeExpressionService.js';
import { runCopyQualityGate, resolveHeroConceptAfterCopyGate } from '../creativeIntelligence/copyQualityGate.js';
import { compileIdentityNativeV2VisualBrief } from '../creativeIntelligence/identityNativeVisualBriefV2Compiler.js';
import { generateIdentityNativeImageFromBrief } from '../creativeIntelligence/gptImage2VisualProviderAdapter.js';
import { downloadUrlToBuffer, uploadSite00AssetBuffer } from '../../../site00Assts/storage.js';
import type { BrandNativeAssetRole } from '../creativeIntelligence/brandNativeVisualBriefTypes.js';
import type { DirectionFormatSelectionRecord } from '../../../../../shared/site00-brand-lore/sixDirectionConsistencyTypes.js';
import type { DirectionNativeFormatSelection } from '../../../../../shared/site00-brand-lore/directionNativeFormatSelection.js';
import { runFormatAssignmentContaminationTest } from '../../../../../shared/site00-brand-lore/directionNativeFormatSelection.js';
import { getOrReconcileBrandLoreForOrg } from '../../../site00BrandLore/loreService.js';
import * as rangeStore from './storeAdapter.js';
import {
  recoverCanonicalRangeRunFromStorage,
  shouldReconcileCanonicalRangeRun,
} from './canonicalRangeStorageRecovery.js';

const HERO_TOPIC = 'credit utilization';

function nowIso(): string {
  return new Date().toISOString();
}

function emptyAccounting() {
  return { anthropicRequests: 0, falRequests: 0, estimatedCostUsd: 0 };
}

function hashPrompt(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function heroStoragePath(comparisonIndex: number): string {
  return `site00/validation/ndxbook/canonical-creative-range/${String(comparisonIndex).padStart(2, '0')}/hero.webp`;
}

function nativeAssetRoleForFormat(format: string): BrandNativeAssetRole {
  if (format === 'FEED_TILE' || format === 'CAROUSEL_COVER' || format === 'STORY_FRAME') {
    return 'SOCIAL_APPLICATION_SUBSTRATE';
  }
  return 'HERO_EDITORIAL_WORLD';
}

function aspectRatioForNativeFormat(format: string): string {
  if (format === 'FEED_TILE' || format === 'CAROUSEL_COVER') return '1:1';
  if (format === 'STORY_FRAME' || format === 'REEL_HOOK' || format === 'TIKTOK_VERTICAL') return '9:16';
  return '1:1';
}

function toFormatSelectionRecord(selection: DirectionNativeFormatSelection): DirectionFormatSelectionRecord {
  const contamination = runFormatAssignmentContaminationTest(selection);
  return {
    nativeFormat: selection.nativeFormat,
    nativeFormatReason: selection.nativeFormatReason,
    alternativeFormatsConsidered: selection.alternativeFormatsConsidered,
    whyAlternativesWereWeaker: selection.whyAlternativesWereWeaker,
    formatSelectionEvidence: selection.formatSelectionEvidence,
    formatSelectionDerivedFromDirection: selection.formatSelectionDerivedFromDirection,
    formatAssignmentContaminationTest: { passed: contamination.passed, notes: contamination.notes },
  };
}

function initRun(existing: CanonicalCreativeRangeRun | null): CanonicalCreativeRangeRun {
  return (
    existing ?? {
      experimentClassification: CANONICAL_CREATIVE_RANGE_EXPERIMENT,
      runId: NDXBOOK_CANONICAL_CREATIVE_RANGE_RUN_ID,
      organizationId: NDXBOOK_ORG_ID,
      projectId: 'ndxbook',
      status: 'NOT_STARTED',
      currentDirectionIndex: null,
      rosterTest: null,
      provenanceReports: [],
      distinctivenessPairs: [],
      directions: [],
      observedFormatDiversity: null,
      audit: null,
      accounting: emptyAccounting(),
      error: null,
      startedAt: nowIso(),
      completedAt: null,
    }
  );
}

async function loadCanonicalFormations() {
  const v1 = await getFormationRecordById(NDXBOOK_V1_FORMATION_ID);
  const v2 = await getFormationRecordById(NDXBOOK_V2_FORMATION_ID);
  return { v1, v2 };
}

export async function getCanonicalRangePreflight(): Promise<CanonicalRangeGenerationPreflight> {
  const profile = await getOrReconcileBrandLoreForOrg(NDXBOOK_ORG_ID, 'ndxbook');
  const { v1, v2 } = await loadCanonicalFormations();
  return buildCanonicalRangeGenerationPreflight({
    brandSlug: 'ndxbook',
    profile,
    v1,
    v2,
  });
}

async function generateCanonicalDirectionHero(params: {
  entry: CanonicalCreativeRangeRosterEntry;
  profile: BrandLoreProfile;
  formatSelection: DirectionFormatSelectionRecord;
  dnaEnvelope: ReturnType<typeof compileDirectionDnaEnvelope>;
  accounting: ReturnType<typeof emptyAccounting>;
}): Promise<{ slot: CanonicalCreativeRangeDirection; accounting: ReturnType<typeof emptyAccounting> }> {
  const { entry, profile, formatSelection, dnaEnvelope } = params;
  let accounting = { ...params.accounting };
  const nativeFormat = formatSelection.nativeFormat;
  const formationInput = buildCoreDirectionFormationInput({
    profile,
    orgSlug: 'ndxbook',
    includeLegacyExplorations: false,
  });
  const hostCheck = assertNoHostFontInPayload(formationInput as unknown as Record<string, unknown>);
  if (!hostCheck.passed) throw new Error(`Host typography leakage: ${hostCheck.violations.join('; ')}`);

  const contaminationTest = runCrossDirectionGenerationContaminationTest({
    promptPayload: formationInput as unknown as Record<string, unknown>,
  });

  const des = await runSonnetDirectionExpressionSystem({
    direction: entry.candidate,
    formationInput,
    references: [],
    v2Board: null,
    v2Plan: null,
    expressionContext: 'SOCIAL_FIRST_EDITORIAL',
  });
  accounting.anthropicRequests += des.anthropicRequests;

  const iad = await runIdentityNativeArtDirector({
    expressionSystem: des.system,
    directionId: entry.direction.directionId,
    topic: HERO_TOPIC,
    references: [],
    orgSlug: 'ndxbook',
    expressionContext: 'SOCIAL_FIRST_EDITORIAL',
  });
  accounting.anthropicRequests += iad.anthropicRequests;

  const creative = await runCreativeExpressionDirector({
    expressionSystem: des.system,
    artDirection: iad.artDirection,
    v1Pilot: null,
    topic: HERO_TOPIC,
    upstreamPersonality: profile.brandPersonality,
    expressionContext: 'SOCIAL_FIRST_EDITORIAL',
    brandSlug: 'ndxbook',
  });
  accounting.anthropicRequests += creative.anthropicRequests;

  let heroConcept = { ...creative.heroConcept, primaryProofFormat: nativeFormat };
  const copyGate = await runCopyQualityGate({
    heroConcept,
    creativeExpression: creative.creativeExpression,
  });
  heroConcept = resolveHeroConceptAfterCopyGate(heroConcept, copyGate);

  const brief = compileIdentityNativeV2VisualBrief({
    artDirection: iad.artDirection,
    creativeExpression: creative.creativeExpression,
    heroConcept,
    copyQualityScores: copyGate.scores,
    role: nativeAssetRoleForFormat(nativeFormat),
    topic: HERO_TOPIC,
  });

  const promptHash = hashPrompt(JSON.stringify(brief));
  let heroAsset: CanonicalCreativeRangeDirection['heroAsset'] = null;
  let generationReceipt: CanonicalCreativeRangeDirection['generationReceipt'] = {
    firstGenerationResult: 'BLOCKED',
    creativeAttemptCount: 0,
    firstGenerationPromptHash: promptHash,
    firstGenerationModel: 'openai/gpt-image-2',
    firstGenerationCostUsd: 0,
    failureReason: null,
    generatedAt: null,
  };

  if (process.env.VITEST === 'true' || !process.env.FAL_KEY?.trim()) {
    if (process.env.VITEST === 'true') {
      heroAsset = {
        assetId: `NDX-CANONICAL-RANGE-${String(entry.comparisonIndex).padStart(2, '0')}`,
        storagePath: heroStoragePath(entry.comparisonIndex),
        topic: HERO_TOPIC,
        provider: 'openai/gpt-image-2',
        generatedAt: nowIso(),
      };
      generationReceipt = {
        firstGenerationResult: 'SUCCESS',
        creativeAttemptCount: 1,
        firstGenerationPromptHash: promptHash,
        firstGenerationModel: 'openai/gpt-image-2',
        firstGenerationCostUsd: 0,
        failureReason: null,
        generatedAt: heroAsset.generatedAt,
      };
    } else {
      throw new Error('FAL_KEY not configured — canonical range hero generation blocked');
    }
  } else {
    const generation = await generateIdentityNativeImageFromBrief({
      brief,
      aspectRatio: aspectRatioForNativeFormat(nativeFormat),
    });
    accounting.falRequests += 1;
    accounting.estimatedCostUsd += generation.costEstimateUsd;
    const imageBuffer = await downloadUrlToBuffer(generation.url);
    const storagePath = heroStoragePath(entry.comparisonIndex);
    await uploadSite00AssetBuffer(storagePath, imageBuffer, 'image/webp', { upsert: true });
    heroAsset = {
      assetId: `NDX-CANONICAL-RANGE-${String(entry.comparisonIndex).padStart(2, '0')}`,
      storagePath,
      topic: HERO_TOPIC,
      provider: 'openai/gpt-image-2',
      generatedAt: nowIso(),
    };
    generationReceipt = {
      firstGenerationResult: 'SUCCESS',
      creativeAttemptCount: 1,
      firstGenerationPromptHash: promptHash,
      firstGenerationModel: 'openai/gpt-image-2',
      firstGenerationCostUsd: generation.costEstimateUsd,
      failureReason: null,
      generatedAt: heroAsset.generatedAt,
    };
  }

  return {
    slot: {
      comparisonIndex: entry.comparisonIndex,
      directionId: entry.direction.directionId,
      canonicalName: entry.canonicalName,
      sourceFormationId: entry.formation.formationId,
      sourceFormationVersion: entry.formation.formationVersion,
      provenance: entry.provenance,
      dnaEnvelope,
      formatSelection,
      directionExpression: des.system as unknown as Record<string, unknown>,
      identityArtDirection: iad.artDirection as unknown as Record<string, unknown>,
      creativeExpression: creative.creativeExpression as unknown as Record<string, unknown>,
      heroConcept: heroConcept as unknown as Record<string, unknown>,
      heroBrief: brief as unknown as Record<string, unknown>,
      heroAsset,
      generationReceipt,
      contaminationTest,
      firstPassStatus: heroAsset ? 'STRONG' : 'FAILED',
      founderJudgment: null,
    },
    accounting,
  };
}

function buildDefaultAudit(): CanonicalCreativeRangeRun['audit'] {
  return {
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
    notes: ['Post-generation audit requires founder visual review — semantic evaluators not yet implemented.'],
  };
}

export async function executeCanonicalCreativeRangeValidation(): Promise<CanonicalCreativeRangeRun> {
  let existing = await getCanonicalCreativeRangeRun();
  if (existing?.status === 'COMPLETE') return existing;

  let run = initRun(existing?.status === 'FAILED' ? { ...existing, status: 'NOT_STARTED', error: null } : existing);
  let accounting = { ...run.accounting };

  const provider = getCreativeIntelligenceProvider();
  if (provider.providerId === 'unavailable' && process.env.VITEST !== 'true') {
    throw new Error('ANTHROPIC_API_KEY required for canonical creative range validation');
  }

  try {
    const profile = await getOrReconcileBrandLoreForOrg(NDXBOOK_ORG_ID, 'ndxbook');
    if (!profile) throw new Error('NDXBOOK Brand Lore profile unavailable');

    const { v1, v2 } = await loadCanonicalFormations();
    const preflight = await buildCanonicalRangeGenerationPreflight({
      brandSlug: 'ndxbook',
      profile,
      v1,
      v2,
    });
    if (!preflight.canonicalRangeGenerationReady && process.env.VITEST !== 'true') {
      throw new Error(`Canonical range preflight failed: ${preflight.blockers.join('; ')}`);
    }

    run = {
      ...run,
      status: 'PREFLIGHT',
      rosterTest: preflight.rosterTest,
      provenanceReports: preflight.provenanceReports,
    };
    await rangeStore.saveCanonicalCreativeRangeRun(run);

    const roster = resolveCanonicalCreativeRangeDirectionsFromFormations({ v1: v1!, v2: v2! });
    const formatProfile = deriveFormatNativeExpressionProfile({
      context: 'SOCIAL_FIRST_EDITORIAL',
      profile,
      personality: profile.brandPersonality,
    });

    const dnaEnvelopes = roster.map((entry) => {
      const fmt = deriveNativeFormatForDirection({ direction: entry.direction, formatProfile });
      return compileDirectionDnaEnvelope({
        direction: entry.direction,
        canonicalName: entry.canonicalName,
        comparisonIndex: entry.comparisonIndex,
        formatSelection: fmt,
        formatLineage: formatProfile.primaryFormats,
      });
    });

    const distinctivenessPairs = [];
    for (let i = 0; i < dnaEnvelopes.length; i += 1) {
      for (let j = i + 1; j < dnaEnvelopes.length; j += 1) {
        distinctivenessPairs.push(compareDnaEnvelopes(dnaEnvelopes[i]!, dnaEnvelopes[j]!));
      }
    }
    const collapsed = distinctivenessPairs.filter((p) => p.collapseSuspected);
    if (collapsed.length > 0 && process.env.VITEST !== 'true') {
      throw new Error(
        `Canonical direction record collapse: duplicate canonical names in roster — ${collapsed.map((c) => c.directionA).join(', ')}`,
      );
    }

    run = { ...run, status: 'DNA_ENVELOPES', distinctivenessPairs };
    await rangeStore.saveCanonicalCreativeRangeRun(run);

    for (const entry of roster) {
      if (run.directions.some((d) => d.comparisonIndex === entry.comparisonIndex)) continue;

      run = { ...run, status: 'GENERATING_DIRECTION', currentDirectionIndex: entry.comparisonIndex };
      await rangeStore.saveCanonicalCreativeRangeRun(run);

      const fmtSel = deriveNativeFormatForDirection({ direction: entry.direction, formatProfile });
      const formatSelection = toFormatSelectionRecord(fmtSel);
      const dnaEnvelope = compileDirectionDnaEnvelope({
        direction: entry.direction,
        canonicalName: entry.canonicalName,
        comparisonIndex: entry.comparisonIndex,
        formatSelection: fmtSel,
      });

      if (entry.provenance.missingLayers.some((l) => ['centralThesis', 'governingBehavior', 'visualWorld'].includes(l))) {
        run = {
          ...run,
          directions: [
            ...run.directions,
            {
              comparisonIndex: entry.comparisonIndex,
              directionId: entry.direction.directionId,
              canonicalName: entry.canonicalName,
              sourceFormationId: entry.formation.formationId,
              sourceFormationVersion: entry.formation.formationVersion,
              provenance: entry.provenance,
              dnaEnvelope,
              formatSelection,
              directionExpression: null,
              identityArtDirection: null,
              creativeExpression: null,
              heroConcept: null,
              heroBrief: null,
              heroAsset: null,
              generationReceipt: {
                firstGenerationResult: 'SKIPPED_MISSING_LAYERS',
                creativeAttemptCount: 0,
                firstGenerationPromptHash: null,
                firstGenerationModel: 'openai/gpt-image-2',
                firstGenerationCostUsd: 0,
                failureReason: entry.provenance.missingLayers.join(', '),
                generatedAt: null,
              },
              contaminationTest: null,
              firstPassStatus: 'SKIPPED',
              founderJudgment: null,
            },
          ].sort((a, b) => a.comparisonIndex - b.comparisonIndex),
        };
        await rangeStore.saveCanonicalCreativeRangeRun(run);
        continue;
      }

      const { slot, accounting: nextAccounting } = await generateCanonicalDirectionHero({
        entry,
        profile,
        formatSelection,
        dnaEnvelope,
        accounting,
      });
      accounting = nextAccounting;
      run = {
        ...run,
        directions: [...run.directions, slot].sort((a, b) => a.comparisonIndex - b.comparisonIndex),
        accounting,
      };
      await rangeStore.saveCanonicalCreativeRangeRun(run);
    }

    const observed = computeObservedFormatDiversity(run.directions.map((d) => d.formatSelection?.nativeFormat ?? ''));
    run = {
      ...run,
      status: 'COMPLETE',
      currentDirectionIndex: null,
      observedFormatDiversity: {
        uniqueFormats: observed.uniqueFormats,
        formatCounts: observed.formatCounts,
        notes: observed.notes,
      },
      audit: buildDefaultAudit(),
      completedAt: nowIso(),
      error: null,
      accounting,
    };
    return rangeStore.saveCanonicalCreativeRangeRun(run);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    run = { ...run, status: 'FAILED', error: message, accounting };
    return rangeStore.saveCanonicalCreativeRangeRun(run);
  }
}

export async function getCanonicalCreativeRangeRun(): Promise<CanonicalCreativeRangeRun | null> {
  let run = await rangeStore.getCanonicalCreativeRangeRun();
  if (shouldReconcileCanonicalRangeRun(run)) {
    const recovered = await recoverCanonicalRangeRunFromStorage();
    if (recovered) {
      run = await rangeStore.saveCanonicalCreativeRangeRun(recovered);
    }
  }
  return run;
}

export async function setCanonicalRangeFounderJudgment(params: {
  comparisonIndex: number;
  judgment: CanonicalCreativeRangeDirection['founderJudgment'];
}): Promise<CanonicalCreativeRangeRun> {
  const run = await rangeStore.getCanonicalCreativeRangeRun();
  if (!run) throw new Error('Canonical creative range run not found');
  const directions = run.directions.map((d) =>
    d.comparisonIndex === params.comparisonIndex ? { ...d, founderJudgment: params.judgment } : d,
  );
  return rangeStore.saveCanonicalCreativeRangeRun({ ...run, directions });
}

export { buildCanonicalRangeGenerationPreflight, runCanonicalSixDirectionRosterTest };
