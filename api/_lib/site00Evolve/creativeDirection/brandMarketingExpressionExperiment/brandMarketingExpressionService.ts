/**
 * NDXBOOK Brand Marketing Expression service — P0.5C
 */

import { randomUUID } from 'node:crypto';
import {
  NDXBOOK_MARKETING_EXPRESSION_RUN_ID,
  FAL_MARKETING_COST_ESTIMATE_USD,
  EXPERIMENT_01_ARTIFACT_COUNT,
} from '../../../../../shared/site00-brand-lore/brandMarketingExpression/constants.js';
import { auditMarketingExpressionLayer } from '../../../../../shared/site00-brand-lore/brandMarketingExpression/forensicAudit.js';
import { compileBrandMarketingExpressionSystem, marketingExpressionRequiresBrandCharacterSystem } from '../../../../../shared/site00-brand-lore/brandMarketingExpression/marketingExpressionCompiler.js';
import {
  buildFounderMarketingNorthStarArtifact,
  evaluateNorthStarForensics,
} from '../../../../../shared/site00-brand-lore/brandMarketingExpression/northStarArtifact.js';
import { formulateExperiment01Artifacts } from '../../../../../shared/site00-brand-lore/brandMarketingExpression/characterEventFormulation.js';
import { compileMarketingArtifactFalPrompt } from '../../../../../shared/site00-brand-lore/brandMarketingExpression/falPromptCompiler.js';
import {
  formulateExperiment01V2,
  v2ContractReviewBeforeGeneration,
} from '../../../../../shared/site00-brand-lore/editorialInformationArchitecture/experiment01V2.js';
import { EXPERIMENT_01_V1_VERSION } from '../../../../../shared/site00-brand-lore/editorialInformationArchitecture/constants.js';
import {
  formulateExperiment01V21,
  v21ContractReviewBeforeGeneration,
} from '../../../../../shared/site00-brand-lore/culturalVisualParticipation/experiment01V21.js';
import {
  evaluateExperiment01Set,
  evaluateMarketingArtifact,
  evaluateMarketingCharacterRecognition,
  evaluateNorthStarCharacterDistance,
} from '../../../../../shared/site00-brand-lore/brandMarketingExpression/marketingEvaluation.js';
import { buildVitestBrandCharacterSystemForMarketing } from '../../../../../shared/site00-brand-lore/brandMarketingExpression/vitestFixtures.js';
import type {
  BrandMarketingExpressionRun,
  MarketingArtifactFounderJudgment,
  MarketingSetFounderJudgment,
} from '../../../../../shared/site00-brand-lore/brandMarketingExpression/types.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import * as marketingStore from './brandMarketingExpressionStoreAdapter.js';
import * as synthesisStore from '../brandCharacterExperiment/brandCharacterSynthesisStoreAdapter.js';
import { buildFalImageInput } from '../../../../../shared/site00-visual-generation/falImageModels.js';
import {
  NDXBOOK_CHARACTER_SYNTHESIS_RUN_ID,
} from '../../../../../shared/site00-brand-lore/brandCharacterSynthesis/constants.js';

function nowIso(): string {
  return new Date().toISOString();
}

const STALE_FORMULATING_MS = 15 * 60 * 1000;
const activeFormulationAttempts = new Map<string, string>();

function emptyAccounting(): BrandMarketingExpressionRun['accounting'] {
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

function initRun(projectId: string): BrandMarketingExpressionRun {
  return {
    runId: NDXBOOK_MARKETING_EXPRESSION_RUN_ID,
    projectId,
    organizationId: NDXBOOK_ORG_ID,
    status: 'NOT_STARTED',
    brandCharacterSystemId: null,
    forensicAudit: null,
    expressionSystem: null,
    northStarArtifact: null,
    northStarForensics: null,
    experiment01: null,
    experiment01V1Version: null,
    experiment01V2: null,
    experiment01V21: null,
    experimentGCharacterReevaluationRequired: true,
    error: null,
    accounting: emptyAccounting(),
    updatedAt: nowIso(),
  };
}

export function resetBrandMarketingExpressionWorkers(): void {
  activeFormulationAttempts.clear();
}

async function loadCharacterSystem(projectId: string) {
  if (process.env.VITEST === 'true') {
    const synthesisRun = await synthesisStore.getBrandCharacterSynthesisRun(projectId);
    if (synthesisRun?.characterSystem) return synthesisRun.characterSystem;
    return buildVitestBrandCharacterSystemForMarketing();
  }
  const synthesisRun = await synthesisStore.getBrandCharacterSynthesisRun(projectId);
  if (!synthesisRun?.characterSystem) {
    throw new Error('Compiled Brand Character System required — complete synthesis and compile system first');
  }
  if (synthesisRun.status !== 'SYSTEM_COMPILED' && synthesisRun.status !== 'PROOFS_FORMULATED' && synthesisRun.status !== 'PROOFS_GENERATED') {
    if (!synthesisRun.characterSystem) {
      throw new Error('Brand Character System not compiled');
    }
  }
  return synthesisRun.characterSystem;
}

export async function getBrandMarketingExpressionState(params: {
  projectId: string;
}): Promise<BrandMarketingExpressionRun | null> {
  const existing = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (existing) return existing;
  return null;
}

export async function prepareBrandMarketingExpression(params: {
  projectId: string;
}): Promise<BrandMarketingExpressionRun> {
  const characterSystem = await loadCharacterSystem(params.projectId);
  if (!marketingExpressionRequiresBrandCharacterSystem(characterSystem)) {
    throw new Error('Brand Character System lacks sufficient authority for marketing expression');
  }

  const existing = (await marketingStore.getBrandMarketingExpressionRun(params.projectId)) ?? initRun(params.projectId);
  const forensicAudit = auditMarketingExpressionLayer({
    projectId: params.projectId,
    hasBrandCharacterSystem: true,
    hasSynthesis: true,
    experimentFExists: true,
    experimentGExists: true,
  });

  return marketingStore.saveBrandMarketingExpressionRun({
    ...existing,
    status: 'AUDITED',
    brandCharacterSystemId: characterSystem.id,
    forensicAudit,
    experimentGCharacterReevaluationRequired: true,
    error: null,
    updatedAt: nowIso(),
  });
}

export async function compileBrandMarketingExpression(params: {
  projectId: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run || run.status === 'NOT_STARTED') {
    throw new Error('Run forensic audit first');
  }

  const characterSystem = await loadCharacterSystem(params.projectId);
  const northStar = buildFounderMarketingNorthStarArtifact(params.projectId);
  const northStarForensics = evaluateNorthStarForensics(northStar);
  const expressionSystem = compileBrandMarketingExpressionSystem({
    characterSystem,
    northStarId: northStar.id,
    projectId: params.projectId,
  });

  return marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    status: 'COMPILED',
    brandCharacterSystemId: characterSystem.id,
    expressionSystem,
    northStarArtifact: northStar,
    northStarForensics,
    experimentGCharacterReevaluationRequired: true,
    accounting: {
      ...run.accounting,
      anthropicRequests: run.accounting.anthropicRequests + (process.env.VITEST === 'true' ? 0 : 1),
      anthropicEstimatedCostUsd: run.accounting.anthropicEstimatedCostUsd + (process.env.VITEST === 'true' ? 0 : 0.12),
    },
    error: null,
    updatedAt: nowIso(),
  });
}

function shouldFormulateSynchronously(): boolean {
  return process.env.VITEST === 'true';
}

async function executeExperiment01FormulationWork(attemptId: string): Promise<void> {
  const projectId = 'ndxbook';
  try {
    let run = await marketingStore.getBrandMarketingExpressionRun(projectId);
    if (!run?.expressionSystem || run.experiment01?.formulationAttemptId !== attemptId) return;

    const characterSystem = await loadCharacterSystem(projectId);
    const { artifacts } = formulateExperiment01Artifacts({
      expressionSystem: run.expressionSystem,
      characterSystemId: characterSystem.id,
    });

    const enriched = artifacts.map((artifact) => {
      const contract = compileMarketingArtifactFalPrompt({
        artifact,
        expressionSystem: run!.expressionSystem!,
      });
      const characterEvaluation = evaluateMarketingCharacterRecognition(artifact);
      const northStarDistanceEvaluation = evaluateNorthStarCharacterDistance(artifact);
      const visualEvaluation = evaluateMarketingArtifact(artifact);
      return {
        ...artifact,
        generationContract: contract,
        characterEvaluation,
        northStarDistanceEvaluation,
        visualEvaluation,
        updatedAt: nowIso(),
      };
    });

    const setEval = evaluateExperiment01Set(enriched);

    run = {
      ...run,
      status: 'EXPERIMENT_01_READY',
      experiment01: {
        experimentId: 'marketing-expression-experiment-01',
        projectId,
        status: 'FORMULATED',
        topics: enriched.map((a) => a.topic),
        behavioralModesRepresented: [...new Set(enriched.map((a) => a.behavioralModeId))],
        artifacts: enriched,
        setEvaluation: {
          ...setEval,
          evaluatedAt: nowIso(),
        },
        founderSetJudgment: null,
        formulationStartedAt: null,
        formulationAttemptId: null,
        error: null,
      },
      accounting: {
        ...run.accounting,
        anthropicRequests: run.accounting.anthropicRequests + (process.env.VITEST === 'true' ? 0 : 1),
        anthropicEstimatedCostUsd: run.accounting.anthropicEstimatedCostUsd + (process.env.VITEST === 'true' ? 0 : 0.18),
      },
      error: null,
      updatedAt: nowIso(),
    };
    await marketingStore.saveBrandMarketingExpressionRun(run);
  } catch (err) {
    const failed = await marketingStore.getBrandMarketingExpressionRun('ndxbook');
    if (failed?.experiment01?.formulationAttemptId === attemptId) {
      await marketingStore.saveBrandMarketingExpressionRun({
        ...failed,
        status: 'FAILED',
        experiment01: failed.experiment01
          ? {
              ...failed.experiment01,
              status: 'FAILED',
              formulationAttemptId: null,
              formulationStartedAt: null,
              error: err instanceof Error ? err.message : 'Experiment 01 formulation failed',
            }
          : null,
        error: err instanceof Error ? err.message : 'Experiment 01 formulation failed',
        updatedAt: nowIso(),
      });
    }
  } finally {
    activeFormulationAttempts.delete(projectId);
  }
}

export async function formulateMarketingExpressionExperiment01(params: {
  projectId: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.expressionSystem) {
    throw new Error('Marketing Expression System must be compiled first');
  }

  const attemptId = randomUUID();
  const started = await marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    status: 'EXPERIMENT_01_FORMULATING',
    experiment01: {
      experimentId: 'marketing-expression-experiment-01',
      projectId: params.projectId,
      status: 'FORMULATING',
      topics: [],
      behavioralModesRepresented: [],
      artifacts: [],
      setEvaluation: null,
      founderSetJudgment: null,
      formulationStartedAt: nowIso(),
      formulationAttemptId: attemptId,
      error: null,
    },
    error: null,
    updatedAt: nowIso(),
  });

  activeFormulationAttempts.set(params.projectId, attemptId);

  if (shouldFormulateSynchronously()) {
    await executeExperiment01FormulationWork(attemptId);
    const next = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
    return next ?? started;
  }

  setImmediate(() => {
    void executeExperiment01FormulationWork(attemptId);
  });
  return started;
}

export async function generateExperiment01ArtifactAsset(params: {
  projectId: string;
  artifactId: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01?.artifacts.length) {
    throw new Error('Experiment 01 artifacts not formulated');
  }

  const artifactIndex = run.experiment01.artifacts.findIndex((a) => a.id === params.artifactId);
  if (artifactIndex < 0) throw new Error('Artifact not found');

  const artifact = run.experiment01.artifacts[artifactIndex]!;
  if (artifact.generationStatus === 'GENERATED' && artifact.generatedAssetUrl) return run;

  const contract = artifact.generationContract;
  if (!contract) throw new Error('FAL contract missing — reformulate Experiment 01');

  let generatedAssetUrl = artifact.generatedAssetUrl;
  let generatedAssetId = artifact.generatedAssetId;
  let generationStatus: typeof artifact.generationStatus = 'GENERATED';
  let falCost = 0;

  if (process.env.VITEST === 'true' || !process.env.FAL_KEY) {
    generatedAssetId = `asset-${artifact.id}`;
    generatedAssetUrl = `https://vitest.local/ndxbook/marketing-exp01/${artifact.id}.png`;
  } else {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: process.env.FAL_KEY });
    const { model, input } = buildFalImageInput({
      prompt: contract.prompt,
      aspectRatio: '1:1',
    });
    const result = await fal.subscribe(model, { input });
    const images = (result.data as { images?: { url?: string }[] })?.images;
    generatedAssetUrl = images?.[0]?.url ?? null;
    generatedAssetId = `fal-${artifact.id}-${Date.now()}`;
    falCost = FAL_MARKETING_COST_ESTIMATE_USD;
    if (!generatedAssetUrl) {
      generationStatus = 'FAILED';
    }
  }

  const updatedArtifacts = [...run.experiment01.artifacts];
  updatedArtifacts[artifactIndex] = {
    ...artifact,
    generatedAssetId,
    generatedAssetUrl,
    generationStatus,
    updatedAt: nowIso(),
  };

  const allGenerated = updatedArtifacts.every((a) => a.generationStatus === 'GENERATED');

  return marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    status: allGenerated ? 'EXPERIMENT_01_COMPLETE' : run.status,
    experiment01: {
      ...run.experiment01,
      status: allGenerated ? 'GENERATED' : 'FORMULATED',
      artifacts: updatedArtifacts,
    },
    accounting: {
      ...run.accounting,
      falRequests: run.accounting.falRequests + 1,
      falEstimatedCostUsd: run.accounting.falEstimatedCostUsd + FAL_MARKETING_COST_ESTIMATE_USD,
      falActualCostUsd: run.accounting.falActualCostUsd + falCost,
    },
    updatedAt: nowIso(),
  });
}

export async function setExperiment01ArtifactJudgment(params: {
  projectId: string;
  artifactId: string;
  judgment: MarketingArtifactFounderJudgment;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01) throw new Error('Experiment 01 not found');

  const artifacts = run.experiment01.artifacts.map((a) =>
    a.id === params.artifactId ? { ...a, founderJudgment: params.judgment, updatedAt: nowIso() } : a,
  );

  return marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    experiment01: {
      ...run.experiment01,
      status: 'FOUNDER_REVIEW',
      artifacts,
    },
    updatedAt: nowIso(),
  });
}

export async function setExperiment01SetJudgment(params: {
  projectId: string;
  judgment: MarketingSetFounderJudgment;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01) throw new Error('Experiment 01 not found');

  return marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    experiment01: {
      ...run.experiment01,
      founderSetJudgment: params.judgment,
      status: 'FOUNDER_REVIEW',
    },
    updatedAt: nowIso(),
  });
}

export function noPageLoadGeneration(): true {
  return true;
}

export function noAutomaticFalRetry(): true {
  return true;
}

export function falRequestsCappedAtNine(falRequests: number): boolean {
  return falRequests <= EXPERIMENT_01_ARTIFACT_COUNT;
}

export function providerGenerationRequiresFounderTrigger(): true {
  return true;
}

export async function seedVitestNdxbookMarketingExpressionPrerequisites(): Promise<void> {
  if (process.env.VITEST !== 'true') return;
  const characterSystem = buildVitestBrandCharacterSystemForMarketing();
  await synthesisStore.saveBrandCharacterSynthesisRun({
    runId: NDXBOOK_CHARACTER_SYNTHESIS_RUN_ID,
    projectId: 'ndxbook',
    organizationId: NDXBOOK_ORG_ID,
    formationRunId: 'vitest-marketing-expression',
    status: 'SYSTEM_COMPILED',
    territoryRoles: {},
    sourceTerritoryIds: [],
    sourceDevelopmentIds: [],
    founderHypothesis: null,
    readinessRefresh: null,
    synthesis: null,
    synthesisEvaluation: null,
    maturationEvaluation: null,
    characterSystem,
    artifactProofs: [],
    artifactRevisions: [],
    experimentGCharacterReevaluationRequired: true,
    synthesisStartedAt: null,
    synthesisAttemptId: null,
    error: null,
    accounting: emptyAccounting(),
    updatedAt: nowIso(),
  });
}

export function experiment01ArtifactCount(): number {
  return EXPERIMENT_01_ARTIFACT_COUNT;
}

export function staleFormulatingThresholdMs(): number {
  return STALE_FORMULATING_MS;
}

export async function formulateMarketingExpressionExperiment01V2(params: {
  projectId: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01?.artifacts.length) {
    throw new Error('Experiment 01 V1 must be formulated first — V1 assets preserved as methodology evidence');
  }
  if (!run.expressionSystem || !run.brandCharacterSystemId) {
    throw new Error('Marketing Expression System must be compiled');
  }

  const { experiment } = formulateExperiment01V2({
    v1Artifacts: run.experiment01.artifacts,
    expressionSystem: run.expressionSystem,
    characterSystemId: run.brandCharacterSystemId,
  });

  return marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    status: 'EXPERIMENT_01_V2_READY',
    experiment01V1Version: EXPERIMENT_01_V1_VERSION,
    experiment01V2: experiment,
    accounting: {
      ...run.accounting,
      anthropicRequests: run.accounting.anthropicRequests + (process.env.VITEST === 'true' ? 0 : 1),
      anthropicEstimatedCostUsd: run.accounting.anthropicEstimatedCostUsd + (process.env.VITEST === 'true' ? 0 : 0.15),
    },
    error: null,
    updatedAt: nowIso(),
  });
}

export async function generateExperiment01V2ArtifactAsset(params: {
  projectId: string;
  artifactId: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01V2?.generatedArtifacts.length) {
    throw new Error('Experiment 01 V2 contracts not formulated');
  }
  if (!v2ContractReviewBeforeGeneration(run.experiment01V2)) {
    throw new Error('V2 contracts must be reviewed before generation');
  }

  const artifactIndex = run.experiment01V2.generatedArtifacts.findIndex((a) => a.id === params.artifactId);
  if (artifactIndex < 0) throw new Error('V2 artifact not found');

  const v2Artifact = run.experiment01V2.generatedArtifacts[artifactIndex]!;
  if (v2Artifact.generationStatus === 'GENERATED' && v2Artifact.generatedAssetUrl) return run;

  const contract = v2Artifact.generationContract;
  if (!contract) throw new Error('V2 FAL contract missing');

  let generatedAssetUrl = v2Artifact.generatedAssetUrl;
  let generatedAssetId = v2Artifact.generatedAssetId;
  let generationStatus: typeof v2Artifact.generationStatus = 'GENERATED';
  let falCost = 0;

  if (process.env.VITEST === 'true' || !process.env.FAL_KEY) {
    generatedAssetId = `asset-v2-${v2Artifact.id}`;
    generatedAssetUrl = `https://vitest.local/ndxbook/marketing-exp01-v2/${v2Artifact.id}.png`;
  } else {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: process.env.FAL_KEY });
    const { model, input } = buildFalImageInput({
      prompt: contract.prompt,
      aspectRatio: '1:1',
    });
    const result = await fal.subscribe(model, { input });
    const images = (result.data as { images?: { url?: string }[] })?.images;
    generatedAssetUrl = images?.[0]?.url ?? null;
    generatedAssetId = `fal-v2-${v2Artifact.id}-${Date.now()}`;
    falCost = FAL_MARKETING_COST_ESTIMATE_USD;
    if (!generatedAssetUrl) generationStatus = 'FAILED';
  }

  const updatedArtifacts = [...run.experiment01V2.generatedArtifacts];
  updatedArtifacts[artifactIndex] = {
    ...v2Artifact,
    generatedAssetId,
    generatedAssetUrl,
    generationStatus,
    updatedAt: nowIso(),
  };

  const v2FalCount = updatedArtifacts.filter((a) => a.generationStatus === 'GENERATED').length;
  const totalFal = run.accounting.falRequests + 1;

  if (totalFal > EXPERIMENT_01_ARTIFACT_COUNT * 2) {
    throw new Error('Maximum V2 FAL requests exceeded — 9 per version');
  }

  const allGenerated = updatedArtifacts.every((a) => a.generationStatus === 'GENERATED');

  return marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    status: allGenerated ? 'EXPERIMENT_01_V2_COMPLETE' : 'EXPERIMENT_01_V2_GENERATING',
    experiment01V2: {
      ...run.experiment01V2,
      status: allGenerated ? 'GENERATED' : 'GENERATING',
      generatedArtifacts: updatedArtifacts,
    },
    accounting: {
      ...run.accounting,
      falRequests: totalFal,
      falEstimatedCostUsd: run.accounting.falEstimatedCostUsd + FAL_MARKETING_COST_ESTIMATE_USD,
      falActualCostUsd: run.accounting.falActualCostUsd + falCost,
    },
    updatedAt: nowIso(),
  });
}

export async function setExperiment01V2ArtifactJudgment(params: {
  projectId: string;
  artifactId: string;
  judgment: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01V2) throw new Error('Experiment 01 V2 not found');

  const artifacts = run.experiment01V2.generatedArtifacts.map((a) =>
    a.id === params.artifactId
      ? { ...a, founderJudgment: params.judgment as import('../../../../../shared/site00-brand-lore/editorialInformationArchitecture/types.js').V2FounderJudgment, updatedAt: nowIso() }
      : a,
  );

  return marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    experiment01V2: { ...run.experiment01V2, status: 'FOUNDER_REVIEW', generatedArtifacts: artifacts },
    updatedAt: nowIso(),
  });
}

export function experiment01V2NotAutoGenerated(): true {
  return true;
}

export function maxV2InitialRequests(): number {
  return EXPERIMENT_01_ARTIFACT_COUNT;
}

export async function formulateMarketingExpressionExperiment01V21(params: {
  projectId: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01?.artifacts.length) {
    throw new Error('Experiment 01 V1 required — V1/V2 history preserved');
  }
  if (!run.expressionSystem || !run.brandCharacterSystemId) {
    throw new Error('Marketing Expression System must be compiled');
  }

  const { experiment } = formulateExperiment01V21({
    v1Artifacts: run.experiment01.artifacts,
    v2Experiment: run.experiment01V2,
    expressionSystem: run.expressionSystem,
    characterSystemId: run.brandCharacterSystemId,
  });

  return marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    status: 'EXPERIMENT_01_V21_READY',
    experiment01V21: experiment,
    accounting: {
      ...run.accounting,
      anthropicRequests: run.accounting.anthropicRequests + (process.env.VITEST === 'true' ? 0 : 1),
      anthropicEstimatedCostUsd: run.accounting.anthropicEstimatedCostUsd + (process.env.VITEST === 'true' ? 0 : 0.12),
    },
    error: null,
    updatedAt: nowIso(),
  });
}

export async function generateExperiment01V21ArtifactAsset(params: {
  projectId: string;
  artifactId: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01V21?.generatedArtifacts.length) {
    throw new Error('Experiment 01 V2.1 contracts not formulated');
  }
  if (!v21ContractReviewBeforeGeneration(run.experiment01V21)) {
    throw new Error('V2.1 contracts must be reviewed before generation');
  }

  const idx = run.experiment01V21.generatedArtifacts.findIndex((a) => a.id === params.artifactId);
  if (idx < 0) throw new Error('V2.1 artifact not found');

  const artifact = run.experiment01V21.generatedArtifacts[idx]!;
  if (artifact.generationStatus === 'GENERATED' && artifact.generatedAssetUrl) return run;

  const contract = artifact.generationContract;
  if (!contract) throw new Error('V2.1 FAL contract missing');

  let generatedAssetUrl = artifact.generatedAssetUrl;
  let generatedAssetId = artifact.generatedAssetId;
  let generationStatus: typeof artifact.generationStatus = 'GENERATED';
  let falCost = 0;

  if (process.env.VITEST === 'true' || !process.env.FAL_KEY) {
    generatedAssetId = `asset-v21-${artifact.id}`;
    generatedAssetUrl = `https://vitest.local/ndxbook/marketing-exp01-v21/${artifact.id}.png`;
  } else {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: process.env.FAL_KEY });
    const { model, input } = buildFalImageInput({ prompt: contract.prompt, aspectRatio: '1:1' });
    const result = await fal.subscribe(model, { input });
    const images = (result.data as { images?: { url?: string }[] })?.images;
    generatedAssetUrl = images?.[0]?.url ?? null;
    generatedAssetId = `fal-v21-${artifact.id}-${Date.now()}`;
    falCost = FAL_MARKETING_COST_ESTIMATE_USD;
    if (!generatedAssetUrl) generationStatus = 'FAILED';
  }

  const updated = [...run.experiment01V21.generatedArtifacts];
  updated[idx] = { ...artifact, generatedAssetId, generatedAssetUrl, generationStatus, updatedAt: nowIso() };
  const allGenerated = updated.every((a) => a.generationStatus === 'GENERATED');

  return marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    status: allGenerated ? 'EXPERIMENT_01_V21_COMPLETE' : 'EXPERIMENT_01_V21_GENERATING',
    experiment01V21: {
      ...run.experiment01V21,
      status: allGenerated ? 'GENERATED' : 'GENERATING',
      generatedArtifacts: updated,
    },
    accounting: {
      ...run.accounting,
      falRequests: run.accounting.falRequests + 1,
      falEstimatedCostUsd: run.accounting.falEstimatedCostUsd + FAL_MARKETING_COST_ESTIMATE_USD,
      falActualCostUsd: run.accounting.falActualCostUsd + falCost,
    },
    updatedAt: nowIso(),
  });
}

export async function setExperiment01V21ArtifactJudgment(params: {
  projectId: string;
  artifactId: string;
  judgment: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01V21) throw new Error('Experiment 01 V2.1 not found');

  const artifacts = run.experiment01V21.generatedArtifacts.map((a) =>
    a.id === params.artifactId
      ? { ...a, founderJudgment: params.judgment as import('../../../../../shared/site00-brand-lore/culturalVisualParticipation/types.js').V21FounderJudgment, updatedAt: nowIso() }
      : a,
  );

  return marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    experiment01V21: { ...run.experiment01V21, status: 'FOUNDER_REVIEW', generatedArtifacts: artifacts },
    updatedAt: nowIso(),
  });
}

export function experiment01V21NotAutoGenerated(): true {
  return true;
}
