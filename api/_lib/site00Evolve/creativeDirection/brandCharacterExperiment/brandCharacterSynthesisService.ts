/**
 * NDXBOOK Composite Brand Character Synthesis + Artifact Proof service — P0.5B.3
 */

import { createHash, randomUUID } from 'node:crypto';
import type { BrandCharacterTerritory } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/types.js';
import {
  NDXBOOK_CHARACTER_SYNTHESIS_RUN_ID,
  FAL_CHARACTER_PROOF_COST_ESTIMATE_USD,
  BRAND_CHARACTER_SYNTHESIS_V1,
} from '../../../../../shared/site00-brand-lore/brandCharacterSynthesis/constants.js';
import {
  buildTerritoryRoleMap,
  resolveNdxbookSynthesisSourceTerritories,
  facultyHypothesisForTerritory,
} from '../../../../../shared/site00-brand-lore/brandCharacterSynthesis/territoryRole.js';
import {
  captureFounderCharacterHypothesis,
  NDXBOOK_FOUNDER_CHARACTER_HYPOTHESIS_RAW,
} from '../../../../../shared/site00-brand-lore/brandCharacterSynthesis/founderHypothesis.js';
import {
  evaluateBrandCharacterSynthesis,
} from '../../../../../shared/site00-brand-lore/brandCharacterSynthesis/synthesisEvaluation.js';
import { evaluateCharacterMaturationContinuity } from '../../../../../shared/site00-brand-lore/brandCharacterSynthesis/maturationContinuity.js';
import { compileBrandCharacterSystemFromSynthesis } from '../../../../../shared/site00-brand-lore/brandCharacterSynthesis/characterSystemFromSynthesis.js';
import {
  buildVitestBrandCharacterSynthesis,
  buildVitestArtifactProofs,
} from '../../../../../shared/site00-brand-lore/brandCharacterSynthesis/vitestFixtures.js';
import {
  BRAND_CHARACTER_SYNTHESIS_SYSTEM_PROMPT,
  buildBrandCharacterSynthesisPayload,
} from '../../../../../shared/site00-brand-lore/brandCharacterSynthesis/synthesisPrompt.js';
import type {
  BrandCharacterSynthesis,
  BrandCharacterSynthesisRun,
  SynthesisFounderJudgment,
  ArtifactProofFounderJudgment,
  SourceContributionEntry,
} from '../../../../../shared/site00-brand-lore/brandCharacterSynthesis/types.js';
import { inventoryCharacterEvidence } from '../../../../../shared/site00-brand-lore/brandCharacterReadiness/evidenceInventory.js';
import { callAnthropicForCompletion } from '../creativeIntelligence/anthropicCompletion.js';
import { parseStructuredJson } from '../creativeIntelligence/structuredJson.js';
import { ANTHROPIC_CREATIVE_MODEL } from '../creativeIntelligence/config.js';
import { getBrandLoreProfileForOrg } from '../../../site00BrandLore/loreService.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import * as formationStore from './storeAdapter.js';
import {
  evaluateAndPersistBrandCharacterReadiness,
  getBrandCharacterReadinessState,
} from './brandCharacterReadinessService.js';
import * as synthesisStore from './brandCharacterSynthesisStoreAdapter.js';
import { buildFalImageInput } from '../../../../../shared/site00-visual-generation/falImageModels.js';

function nowIso(): string {
  return new Date().toISOString();
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function emptyAccounting(): BrandCharacterSynthesisRun['accounting'] {
  return {
    anthropicRequests: 0,
    anthropicInputTokens: 0,
    anthropicOutputTokens: 0,
    anthropicEstimatedCostUsd: 0,
    falRequests: 0,
    falEstimatedCostUsd: 0,
    falActualCostUsd: 0,
  };
}

function initRun(projectId: string, formationRunId: string): BrandCharacterSynthesisRun {
  return {
    runId: NDXBOOK_CHARACTER_SYNTHESIS_RUN_ID,
    projectId,
    organizationId: NDXBOOK_ORG_ID,
    formationRunId,
    status: 'NOT_STARTED',
    territoryRoles: {},
    sourceTerritoryIds: [],
    sourceDevelopmentIds: [],
    founderHypothesis: null,
    readinessRefresh: null,
    synthesis: null,
    synthesisEvaluation: null,
    maturationEvaluation: null,
    characterSystem: null,
    artifactProofs: [],
    artifactRevisions: [],
    experimentGCharacterReevaluationRequired: false,
    error: null,
    accounting: emptyAccounting(),
    updatedAt: nowIso(),
  };
}

function canProceedToSynthesis(state: string, override: boolean): boolean {
  if (override) return true;
  return state === 'CHARACTER_READY' || state === 'CHARACTER_PARTIAL';
}

function buildSourceContributionMap(territories: BrandCharacterTerritory[]): SourceContributionEntry[] {
  return territories.map((t) => ({
    territoryId: t.id,
    territoryName: t.name,
    role: 'CHARACTER_COMPONENT',
    facultyHypothesis: facultyHypothesisForTerritory(t.name),
    contributedDimensions: [facultyHypothesisForTerritory(t.name)],
    evidenceUsed: [t.core?.characterThesis ?? t.whyItIsNdxbook].filter(Boolean),
  }));
}

function mapAnthropicSynthesis(
  raw: Record<string, unknown>,
  params: {
    projectId: string;
    formationRunId: string;
    sourceTerritoryIds: string[];
    sourceContributionMap: SourceContributionEntry[];
    founderHypothesisRelationship: string;
  },
): BrandCharacterSynthesis {
  const id = `bcs-${randomUUID().slice(0, 8)}`;
  const now = nowIso();
  const str = (k: string) => String(raw[k] ?? '');
  const arr = (k: string) => (Array.isArray(raw[k]) ? (raw[k] as string[]) : []);
  return {
    id,
    projectId: params.projectId,
    brandId: params.projectId,
    sourceTerritoryIds: params.sourceTerritoryIds,
    sourceDevelopmentIds: [],
    formationRunId: params.formationRunId,
    version: 1,
    status: 'SYNTHESIZED',
    characterName: str('characterName') || 'NDXBOOK',
    characterEssence: str('characterEssence'),
    characterThesis: str('characterThesis'),
    characterWorldview: str('characterWorldview'),
    characterInternalLogic: str('characterInternalLogic'),
    characterHistoryOrArc: str('characterHistoryOrArc'),
    intellectualIdentity: str('intellectualIdentity'),
    socialIdentity: str('socialIdentity'),
    culturalIdentity: str('culturalIdentity'),
    emotionalIdentity: str('emotionalIdentity'),
    judgmentIdentity: str('judgmentIdentity'),
    humorIdentity: str('humorIdentity'),
    languageIdentity: str('languageIdentity'),
    tasteIdentity: str('tasteIdentity'),
    expressiveIdentity: str('expressiveIdentity'),
    artifactIdentity: str('artifactIdentity'),
    youngerInstincts: arr('youngerInstincts'),
    maturedInstincts: arr('maturedInstincts'),
    continuities: arr('continuities'),
    growthEdges: arr('growthEdges'),
    productiveTensions: arr('productiveTensions'),
    resolvedContradictions: arr('resolvedContradictions'),
    unresolvedContradictions: arr('unresolvedContradictions'),
    contextualModulationRules: arr('contextualModulationRules'),
    likes: arr('likes'),
    dislikes: arr('dislikes'),
    delights: arr('delights'),
    irritations: arr('irritations'),
    obsessions: arr('obsessions'),
    blindSpots: arr('blindSpots'),
    boundaries: arr('boundaries'),
    socialInstincts: arr('socialInstincts'),
    intellectualInstincts: arr('intellectualInstincts'),
    culturalInstincts: arr('culturalInstincts'),
    makerBehaviors: arr('makerBehaviors'),
    artifactBehaviors: arr('artifactBehaviors'),
    recognitionSignals: arr('recognitionSignals'),
    neverBecome: arr('neverBecome'),
    whyTheseThreeBelongTogether: str('whyTheseThreeBelongTogether'),
    sourceContributionMap: params.sourceContributionMap,
    founderHypothesisRelationship: params.founderHypothesisRelationship,
    maturationContinuitySummary: null,
    founderJudgment: null,
    judgmentNote: null,
    fingerprint: hash(JSON.stringify(raw)),
    methodologyVersion: BRAND_CHARACTER_SYNTHESIS_V1,
    providerReceipt: { model: ANTHROPIC_CREATIVE_MODEL },
    createdAt: now,
    updatedAt: now,
  };
}

export async function getBrandCharacterSynthesisState(
  projectId: string,
): Promise<BrandCharacterSynthesisRun | null> {
  return synthesisStore.getBrandCharacterSynthesisRun(projectId);
}

export async function prepareBrandCharacterSynthesis(params: {
  projectId: string;
}): Promise<BrandCharacterSynthesisRun> {
  const formationRun = await formationStore.getBrandCharacterFormationRun();
  if (!formationRun?.characters.length) {
    throw new Error('Historical character territories required before synthesis');
  }

  const previousReadiness = await getBrandCharacterReadinessState(params.projectId);
  const previousState = previousReadiness?.latestEvaluation?.overallState ?? null;

  const refreshed = await evaluateAndPersistBrandCharacterReadiness({
    projectId: params.projectId,
    attachFirstFormationEvidence: false,
  });
  const newState = refreshed.latestEvaluation?.overallState ?? 'CHARACTER_NOT_EVALUATED';
  const deepeningCount = refreshed.deepeningModule?.answers.length ?? 0;
  const override = Boolean(refreshed.override);

  const profile = await getBrandLoreProfileForOrg(NDXBOOK_ORG_ID);
  const brandLoreReadiness = profile?.readinessState ?? null;
  const remainingBlockers: string[] = [];
  if (brandLoreReadiness && brandLoreReadiness !== 'CORE_DIRECTION_READY') {
    const inventory = inventoryCharacterEvidence(profile);
    const hasEquivalent =
      inventory.founderLanguage.length >= 3 &&
      inventory.brandLore.length >= 2 &&
      deepeningCount >= 3;
    if (!hasEquivalent) {
      remainingBlockers.push(`Brand Lore readiness: ${brandLoreReadiness}`);
    }
  }
  if (!canProceedToSynthesis(newState, override)) {
    remainingBlockers.push(`Character readiness: ${newState}`);
  }

  const territoryRoles = buildTerritoryRoleMap(formationRun.characters);
  const sources = resolveNdxbookSynthesisSourceTerritories(formationRun.characters);
  if (sources.length < 3) {
    const found = formationRun.characters.map((c) => c.name).filter(Boolean).join('; ');
    throw new Error(
      `Primary synthesis territories missing (need Cultural Accomplice, Committed Contrarian, Relentless Synthesizer). Historical formation has: ${found || 'none'}`,
    );
  }

  const hypothesis = captureFounderCharacterHypothesis({ projectId: params.projectId });

  let run =
    (await synthesisStore.getBrandCharacterSynthesisRun(params.projectId)) ??
    initRun(params.projectId, formationRun.runId);

  run = {
    ...run,
    status: remainingBlockers.length && !override ? 'FAILED' : 'PREPARING',
    territoryRoles,
    sourceTerritoryIds: sources.map((s) => s.id),
    sourceDevelopmentIds: [],
    founderHypothesis: hypothesis,
    readinessRefresh: {
      previousState,
      newState,
      deepeningAnswerCount: deepeningCount,
      brandLoreReadiness,
      remainingBlockers,
      founderOverride: override,
    },
    error: remainingBlockers.length && !override ? remainingBlockers.join('; ') : null,
    updatedAt: nowIso(),
  };

  return synthesisStore.saveBrandCharacterSynthesisRun(run);
}

export async function runCompositeBrandCharacterSynthesis(params: {
  projectId: string;
}): Promise<BrandCharacterSynthesisRun> {
  let run = await prepareBrandCharacterSynthesis({ projectId: params.projectId });
  const override = run.readinessRefresh?.founderOverride ?? false;
  const state = run.readinessRefresh?.newState ?? 'CHARACTER_NOT_EVALUATED';
  if (!canProceedToSynthesis(state, override)) {
    throw new Error(run.error ?? 'Character readiness insufficient for synthesis');
  }

  const formationRun = (await formationStore.getBrandCharacterFormationRun())!;
  const sources = resolveNdxbookSynthesisSourceTerritories(formationRun.characters);
  const contributionMap = buildSourceContributionMap(sources);
  const readiness = await getBrandCharacterReadinessState(params.projectId);
  const deepeningAnswers =
    readiness?.deepeningModule?.answers.map((a) => ({ domain: a.domain, rawAnswer: a.rawAnswer })) ?? [];
  const profile = await getBrandLoreProfileForOrg(NDXBOOK_ORG_ID);
  const inventory = inventoryCharacterEvidence(profile);

  run = { ...run, status: 'SYNTHESIZING', updatedAt: nowIso() };
  await synthesisStore.saveBrandCharacterSynthesisRun(run);

  let synthesis: BrandCharacterSynthesis;
  const hypothesis = run.founderHypothesis ?? captureFounderCharacterHypothesis({ projectId: params.projectId });

  if (process.env.VITEST === 'true' || !process.env.ANTHROPIC_API_KEY) {
    synthesis = buildVitestBrandCharacterSynthesis({
      projectId: params.projectId,
      formationRunId: formationRun.runId,
    });
  } else {
    const payload = buildBrandCharacterSynthesisPayload({
      sourceTerritories: sources.map((s) => ({
        name: s.name,
        role: 'CHARACTER_COMPONENT',
        faculty: facultyHypothesisForTerritory(s.name),
        coreThesis: s.core?.characterThesis,
      })),
      deepeningAnswers,
      founderHypothesisRaw: hypothesis.rawWording,
      brandLoreSummary: inventory.brandLore.slice(0, 6).join('; '),
      personalitySummary: inventory.brandPersonality.slice(0, 6).join('; '),
    });
    const { text, usage } = await callAnthropicForCompletion(
      BRAND_CHARACTER_SYNTHESIS_SYSTEM_PROMPT,
      payload,
      { maxTokens: 12000, timeoutMs: 8 * 60 * 1000 },
    );
    const parsed = parseStructuredJson<Record<string, unknown>>(text);
    synthesis = mapAnthropicSynthesis(parsed, {
      projectId: params.projectId,
      formationRunId: formationRun.runId,
      sourceTerritoryIds: sources.map((s) => s.id),
      sourceContributionMap: contributionMap,
      founderHypothesisRelationship: hypothesis.normalizedInterpretation,
    });
    run = {
      ...run,
      accounting: {
        ...run.accounting,
        anthropicRequests: run.accounting.anthropicRequests + 1,
        anthropicInputTokens: run.accounting.anthropicInputTokens + (usage?.inputTokens ?? 0),
        anthropicOutputTokens: run.accounting.anthropicOutputTokens + (usage?.outputTokens ?? 0),
        anthropicEstimatedCostUsd: run.accounting.anthropicEstimatedCostUsd + 0.15,
      },
    };
  }

  const synthesisEvaluation = {
    evaluationId: `eval-${synthesis.id}`,
    synthesisId: synthesis.id,
    ...evaluateBrandCharacterSynthesis({ synthesis }),
    evaluatedAt: nowIso(),
  };
  const maturationEvaluation = evaluateCharacterMaturationContinuity({
    synthesis,
    founderHypothesisRaw: hypothesis.rawWording,
  });
  synthesis = {
    ...synthesis,
    maturationContinuitySummary: maturationEvaluation.notes.join(' '),
  };

  run = {
    ...run,
    status: 'SYNTHESIZED',
    synthesis,
    synthesisEvaluation,
    maturationEvaluation,
    error: null,
    updatedAt: nowIso(),
  };
  return synthesisStore.saveBrandCharacterSynthesisRun(run);
}

export async function setBrandCharacterSynthesisJudgment(params: {
  projectId: string;
  judgment: SynthesisFounderJudgment;
  note?: string | null;
}): Promise<BrandCharacterSynthesisRun> {
  const run = await synthesisStore.getBrandCharacterSynthesisRun(params.projectId);
  if (!run?.synthesis) throw new Error('Synthesis not found');

  const approved = params.judgment === 'THATS_NDX' || params.judgment === 'LOVE_THIS_CHARACTER';
  const updatedSynthesis = {
    ...run.synthesis,
    founderJudgment: params.judgment,
    judgmentNote: params.note ?? null,
    status: approved ? ('APPROVED' as const) : ('FOUNDER_REVIEWED' as const),
    updatedAt: nowIso(),
  };

  return synthesisStore.saveBrandCharacterSynthesisRun({
    ...run,
    synthesis: updatedSynthesis,
    updatedAt: nowIso(),
  });
}

export async function compileSynthesisBrandCharacterSystem(params: {
  projectId: string;
}): Promise<BrandCharacterSynthesisRun> {
  const run = await synthesisStore.getBrandCharacterSynthesisRun(params.projectId);
  if (!run?.synthesis) throw new Error('Synthesis required');
  const approved =
    run.synthesis.founderJudgment === 'THATS_NDX' ||
    run.synthesis.founderJudgment === 'LOVE_THIS_CHARACTER' ||
    run.synthesis.status === 'APPROVED';
  if (!approved) {
    throw new Error('Founder approval required before compiling Brand Character System');
  }

  const system = compileBrandCharacterSystemFromSynthesis({
    synthesis: run.synthesis,
    founderApproval: 'APPROVED',
  });

  return synthesisStore.saveBrandCharacterSynthesisRun({
    ...run,
    status: 'SYSTEM_COMPILED',
    characterSystem: system,
    experimentGCharacterReevaluationRequired: true,
    updatedAt: nowIso(),
  });
}

export async function formulateBrandCharacterArtifactProofs(params: {
  projectId: string;
}): Promise<BrandCharacterSynthesisRun> {
  const run = await synthesisStore.getBrandCharacterSynthesisRun(params.projectId);
  if (!run?.synthesis || !run.characterSystem) {
    throw new Error('Approved synthesis and compiled character system required');
  }

  const proofs = buildVitestArtifactProofs(run.synthesis).map((p) => ({
    ...p,
    characterSystemId: run.characterSystem!.id,
  }));

  return synthesisStore.saveBrandCharacterSynthesisRun({
    ...run,
    status: 'PROOFS_FORMULATED',
    artifactProofs: proofs,
    accounting: {
      ...run.accounting,
      anthropicRequests: run.accounting.anthropicRequests + (process.env.VITEST === 'true' ? 0 : 1),
    },
    updatedAt: nowIso(),
  });
}

export async function generateBrandCharacterArtifactProofAsset(params: {
  projectId: string;
  proofId: string;
}): Promise<BrandCharacterSynthesisRun> {
  const run = await synthesisStore.getBrandCharacterSynthesisRun(params.projectId);
  if (!run?.artifactProofs.length) throw new Error('Artifact proofs not formulated');

  const proofIndex = run.artifactProofs.findIndex((p) => p.id === params.proofId);
  if (proofIndex < 0) throw new Error('Proof not found');

  const proof = run.artifactProofs[proofIndex]!;
  if (proof.asset?.status === 'GENERATED') return run;

  let asset = proof.asset;
  if (process.env.VITEST === 'true' || !process.env.FAL_KEY) {
    asset = {
      assetId: `asset-${proof.id}`,
      proofId: proof.id,
      storagePath: null,
      publicUrl: `https://vitest.local/ndxbook/character-proof/${proof.id}.png`,
      falRequestId: `vitest-${proof.id}`,
      provider: 'fal',
      model: 'vitest-mock',
      promptHash: proof.falPromptContract.promptHash,
      costUsd: 0,
      status: 'GENERATED',
      generatedAt: nowIso(),
      error: null,
    };
  } else {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: process.env.FAL_KEY });
    const { model, input } = buildFalImageInput({
      prompt: proof.falPromptContract.prompt,
      aspectRatio: '16:9',
    });
    const result = (await fal.subscribe(model, { input: input as never, logs: false })) as {
      data?: { images?: Array<{ url?: string }> };
      requestId?: string;
    };
    asset = {
      assetId: `asset-${proof.id}`,
      proofId: proof.id,
      storagePath: null,
      publicUrl: result.data?.images?.[0]?.url ?? null,
      falRequestId: result.requestId ?? null,
      provider: 'fal',
      model,
      promptHash: proof.falPromptContract.promptHash,
      costUsd: FAL_CHARACTER_PROOF_COST_ESTIMATE_USD,
      status: result.data?.images?.[0]?.url ? 'GENERATED' : 'FAILED',
      generatedAt: nowIso(),
      error: result.data?.images?.[0]?.url ? null : 'FAL returned no image',
    };
  }

  const proofs = [...run.artifactProofs];
  proofs[proofIndex] = { ...proof, asset };

  const allGenerated = proofs.every((p) => p.asset?.status === 'GENERATED');
  return synthesisStore.saveBrandCharacterSynthesisRun({
    ...run,
    status: allGenerated ? 'PROOFS_GENERATED' : run.status,
    artifactProofs: proofs,
    accounting: {
      ...run.accounting,
      falRequests: run.accounting.falRequests + 1,
      falEstimatedCostUsd: run.accounting.falEstimatedCostUsd + FAL_CHARACTER_PROOF_COST_ESTIMATE_USD,
      falActualCostUsd: run.accounting.falActualCostUsd + (asset.costUsd ?? 0),
    },
    updatedAt: nowIso(),
  });
}

export async function setBrandCharacterArtifactProofJudgment(params: {
  projectId: string;
  proofId: string;
  judgment: ArtifactProofFounderJudgment;
  note?: string | null;
}): Promise<BrandCharacterSynthesisRun> {
  const run = await synthesisStore.getBrandCharacterSynthesisRun(params.projectId);
  if (!run) throw new Error('Synthesis run not found');
  const proofs = run.artifactProofs.map((p) =>
    p.id === params.proofId
      ? { ...p, founderJudgment: params.judgment, judgmentNote: params.note ?? null }
      : p,
  );
  return synthesisStore.saveBrandCharacterSynthesisRun({ ...run, artifactProofs: proofs, updatedAt: nowIso() });
}

export function historicalTerritoriesRemainImmutable(): true {
  return true;
}

export function founderHypothesisDefaultRaw(): string {
  return NDXBOOK_FOUNDER_CHARACTER_HYPOTHESIS_RAW;
}

/** Vitest — seed historical six territories + synthesis-ready readiness. */
export async function seedVitestNdxbookSynthesisPrerequisites(): Promise<void> {
  if (process.env.VITEST !== 'true') return;

  const {
    buildVitestCharacterFormationPayload,
    resetBrandCharacterFormationWorkers,
  } = await import('./brandCharacterService.js');
  const { coerceCharacterPayload } = await import(
    '../../../../../shared/site00-brand-lore/brandCharacterTerritory/characterPayloadNormalization.js'
  );
  const { BRAND_CHARACTER_FORMATION_CLASSIFICATION, BRAND_CHARACTER_TERRITORY_V1, NDXBOOK_CHARACTER_FORMATION_RUN_ID } =
    await import('../../../../../shared/site00-brand-lore/brandCharacterTerritory/constants.js');
  const { seedVitestCharacterFormationReadiness } = await import('./brandCharacterReadinessService.js');

  resetBrandCharacterFormationWorkers();
  await seedVitestCharacterFormationReadiness('ndxbook');

  const historicalNames = [
    'The Relentless Synthesizer',
    'The Committed Contrarian',
    'The Devoted Observer',
    'The Generous Expert',
    'The Cultural Accomplice',
    'The Precise Enthusiast',
  ];
  const payloads = buildVitestCharacterFormationPayload().characters;
  const characters = historicalNames.map((name, i) => {
    const coerced = coerceCharacterPayload(payloads[i % payloads.length]!);
    return {
      ...coerced,
      id: `bct-hist-${i}`,
      name,
      characterClassification: 'BRAND_CHARACTER_TERRITORY' as const,
      founderJudgment: null,
      judgmentNote: null,
      methodologyVersion: BRAND_CHARACTER_TERRITORY_V1,
      experimentId: 'experiment-h',
      formationVersion: 1,
      snapshotVersion: 1,
      snapshotFingerprint: 'vitest',
      formationPromptVersion: 'vitest',
      formationPromptFingerprint: 'vitest',
      formationReceipt: null,
      provenance: 'vitest-historical-six',
      createdAt: nowIso(),
    };
  });

  await formationStore.saveBrandCharacterFormationRun({
    experimentClassification: BRAND_CHARACTER_FORMATION_CLASSIFICATION,
    runId: NDXBOOK_CHARACTER_FORMATION_RUN_ID,
    organizationId: NDXBOOK_ORG_ID,
    projectId: 'ndxbook',
    methodologyVersion: BRAND_CHARACTER_TERRITORY_V1,
    currentStage: 'BRAND_CHARACTER_FORMATION',
    status: 'EVALUATIONS_COMPLETE',
    formationVersion: 1,
    formationPromptVersion: 'vitest',
    idempotencyKey: 'vitest',
    intelligenceSnapshot: null,
    characters,
    setDistinctiveness: null,
    formationReceipt: null,
    selectedCharacterId: null,
    brandCharacterSystemId: null,
    systemCompilationPolicy: 'DEVELOPMENT_REQUIRED',
    developments: [],
    selectedDevelopmentId: null,
    rawProviderResponse: null,
    forensicAudit: null,
    territoryAssurance: null,
    semanticSetAudit: null,
    archetypeCollapse: null,
    characterDiscoveryMode: 'CHARACTER_DISCOVERY_REQUIRED',
    presentationDevelopmentAllowed: false,
    identityDevelopmentAllowed: false,
    visualGenerationAllowed: false,
    brandCanonMutationAllowed: false,
    accounting: emptyAccounting(),
    error: null,
    formationStartedAt: nowIso(),
    formationCompletedAt: nowIso(),
    updatedAt: nowIso(),
  });
}
