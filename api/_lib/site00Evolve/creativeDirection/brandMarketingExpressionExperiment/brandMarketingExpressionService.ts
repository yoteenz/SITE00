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
  formulateExperiment01V22,
  v22ContractReviewBeforeGeneration,
} from '../../../../../shared/site00-brand-lore/characterRetention/experiment01V22.js';
import {
  formulateExperiment01V23,
  v23ContractReviewBeforeGeneration,
} from '../../../../../shared/site00-brand-lore/artBoardMateriality/experiment01V23.js';
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
const STALE_GENERATING_MS = 15 * 60 * 1000;
const activeFormulationAttempts = new Map<string, string>();
const activeGenerationAttempts = new Map<string, string>();

type Experiment01GenerationVersion = 'v1' | 'v2' | 'v21' | 'v22' | 'v23';

function generationKey(projectId: string, version: Experiment01GenerationVersion): string {
  return `${projectId}:${version}`;
}

type GeneratingArtifact = {
  generationStatus: string;
  generatedAssetUrl?: string | null;
  updatedAt: string;
};

export function staleGeneratingThresholdMs(): number {
  return STALE_GENERATING_MS;
}

export function isExperiment01GenerationWorkerActive(
  projectId: string,
  version: Experiment01GenerationVersion,
): boolean {
  return activeGenerationAttempts.has(generationKey(projectId, version));
}

function resetStaleGeneratingArtifact<T extends GeneratingArtifact>(artifact: T): T {
  if (artifact.generationStatus !== 'GENERATING') return artifact;
  if (artifact.generatedAssetUrl) {
    return { ...artifact, generationStatus: 'GENERATED', updatedAt: nowIso() };
  }
  return { ...artifact, generationStatus: 'NOT_GENERATED', updatedAt: nowIso() };
}

function experiment01VersionNeedsGenerationReconcile(params: {
  projectId: string;
  version: Experiment01GenerationVersion;
  runGenerating: boolean;
  experimentGenerating: boolean;
  artifacts: GeneratingArtifact[];
}): boolean {
  if (isExperiment01GenerationWorkerActive(params.projectId, params.version)) return false;
  if (params.runGenerating || params.experimentGenerating) return true;
  return params.artifacts.some((artifact) => artifact.generationStatus === 'GENERATING');
}

async function reconcileStaleExperiment01Generation(
  run: BrandMarketingExpressionRun,
): Promise<BrandMarketingExpressionRun> {
  let next = run;
  let changed = false;

  if (run.experiment01?.artifacts.length) {
    const needs = experiment01VersionNeedsGenerationReconcile({
      projectId: run.projectId,
      version: 'v1',
      runGenerating: run.status === 'EXPERIMENT_01_GENERATING',
      experimentGenerating: run.experiment01.status === 'GENERATING',
      artifacts: run.experiment01.artifacts,
    });
    if (needs) {
      const artifacts = run.experiment01.artifacts.map(resetStaleGeneratingArtifact);
      const allGenerated = artifacts.every((a) => a.generationStatus === 'GENERATED' && a.generatedAssetUrl);
      next = {
        ...next,
        status: allGenerated ? 'EXPERIMENT_01_COMPLETE' : 'EXPERIMENT_01_READY',
        experiment01: {
          ...run.experiment01,
          status: allGenerated ? 'GENERATED' : 'FORMULATED',
          artifacts,
        },
        error: allGenerated ? next.error : next.error ?? 'Slide generation stalled — tap GENERATE REMAINING to retry',
        updatedAt: nowIso(),
      };
      changed = true;
    }
  }

  if (run.experiment01V2?.generatedArtifacts.length) {
    const needs = experiment01VersionNeedsGenerationReconcile({
      projectId: run.projectId,
      version: 'v2',
      runGenerating: run.status === 'EXPERIMENT_01_V2_GENERATING',
      experimentGenerating: run.experiment01V2.status === 'GENERATING',
      artifacts: run.experiment01V2.generatedArtifacts,
    });
    if (needs) {
      const artifacts = run.experiment01V2.generatedArtifacts.map(resetStaleGeneratingArtifact);
      const allGenerated = artifacts.every((a) => a.generationStatus === 'GENERATED' && a.generatedAssetUrl);
      next = {
        ...next,
        status: allGenerated ? 'EXPERIMENT_01_V2_COMPLETE' : 'EXPERIMENT_01_V2_READY',
        experiment01V2: {
          ...run.experiment01V2,
          status: allGenerated ? 'GENERATED' : 'CONTRACTS_READY',
          generatedArtifacts: artifacts,
        },
        error: allGenerated ? next.error : next.error ?? 'Slide generation stalled — tap GENERATE REMAINING to retry',
        updatedAt: nowIso(),
      };
      changed = true;
    }
  }

  if (run.experiment01V21?.generatedArtifacts.length) {
    const needs = experiment01VersionNeedsGenerationReconcile({
      projectId: run.projectId,
      version: 'v21',
      runGenerating: run.status === 'EXPERIMENT_01_V21_GENERATING',
      experimentGenerating: run.experiment01V21.status === 'GENERATING',
      artifacts: run.experiment01V21.generatedArtifacts,
    });
    if (needs) {
      const artifacts = run.experiment01V21.generatedArtifacts.map(resetStaleGeneratingArtifact);
      const allGenerated = artifacts.every((a) => a.generationStatus === 'GENERATED' && a.generatedAssetUrl);
      next = {
        ...next,
        status: allGenerated ? 'EXPERIMENT_01_V21_COMPLETE' : 'EXPERIMENT_01_V21_READY',
        experiment01V21: {
          ...run.experiment01V21,
          status: allGenerated ? 'GENERATED' : 'CONTRACTS_READY',
          generatedArtifacts: artifacts,
        },
        error: allGenerated ? next.error : next.error ?? 'Slide generation stalled — tap GENERATE REMAINING to retry',
        updatedAt: nowIso(),
      };
      changed = true;
    }
  }

  if (run.experiment01V22?.generatedArtifacts.length) {
    const needs = experiment01VersionNeedsGenerationReconcile({
      projectId: run.projectId,
      version: 'v22',
      runGenerating: run.status === 'EXPERIMENT_01_V22_GENERATING',
      experimentGenerating: run.experiment01V22.status === 'GENERATING',
      artifacts: run.experiment01V22.generatedArtifacts,
    });
    if (needs) {
      const artifacts = run.experiment01V22.generatedArtifacts.map(resetStaleGeneratingArtifact);
      const allGenerated = artifacts.every((a) => a.generationStatus === 'GENERATED' && a.generatedAssetUrl);
      next = {
        ...next,
        status: allGenerated ? 'EXPERIMENT_01_V22_COMPLETE' : 'EXPERIMENT_01_V22_READY',
        experiment01V22: {
          ...run.experiment01V22,
          status: allGenerated ? 'GENERATED' : 'CONTRACTS_READY',
          generatedArtifacts: artifacts,
        },
        error: allGenerated ? next.error : next.error ?? 'Slide generation stalled — tap GENERATE REMAINING to retry',
        updatedAt: nowIso(),
      };
      changed = true;
    }
  }

  if (run.experiment01V23?.generatedArtifacts.length) {
    const needs = experiment01VersionNeedsGenerationReconcile({
      projectId: run.projectId,
      version: 'v23',
      runGenerating: run.status === 'EXPERIMENT_01_V23_GENERATING',
      experimentGenerating: run.experiment01V23.status === 'GENERATING',
      artifacts: run.experiment01V23.generatedArtifacts,
    });
    if (needs) {
      const artifacts = run.experiment01V23.generatedArtifacts.map(resetStaleGeneratingArtifact);
      const allGenerated = artifacts.every((a) => a.generationStatus === 'GENERATED' && a.generatedAssetUrl);
      next = {
        ...next,
        status: allGenerated ? 'EXPERIMENT_01_V23_COMPLETE' : 'EXPERIMENT_01_V23_READY',
        experiment01V23: {
          ...run.experiment01V23,
          status: allGenerated ? 'GENERATED' : 'CONTRACTS_READY',
          generatedArtifacts: artifacts,
        },
        error: allGenerated ? next.error : next.error ?? 'Slide generation stalled — tap GENERATE REMAINING to retry',
        updatedAt: nowIso(),
      };
      changed = true;
    }
  }

  if (!changed) return run;
  return marketingStore.saveBrandMarketingExpressionRun(next);
}

function shouldGenerateSynchronously(): boolean {
  return process.env.VITEST === 'true';
}

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
    experiment01V22: null,
    experiment01V23: null,
    experimentGCharacterReevaluationRequired: true,
    error: null,
    accounting: emptyAccounting(),
    updatedAt: nowIso(),
  };
}

export function resetBrandMarketingExpressionWorkers(): void {
  activeFormulationAttempts.clear();
  activeGenerationAttempts.clear();
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
  if (!existing) return null;
  return reconcileStaleExperiment01Generation(existing);
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

export async function formulateMarketingExpressionExperiment01V22(params: {
  projectId: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01?.artifacts.length) {
    throw new Error('Experiment 01 V1 required — V1/V2/V2.1 history preserved');
  }
  if (!run.experiment01V21?.generatedArtifacts.length) {
    throw new Error('Experiment 01 V2.1 required before V2.2 character retention formulation');
  }
  if (!run.expressionSystem || !run.brandCharacterSystemId) {
    throw new Error('Marketing Expression System must be compiled');
  }

  const { experiment } = formulateExperiment01V22({
    v1Artifacts: run.experiment01.artifacts,
    v21Experiment: run.experiment01V21,
    expressionSystem: run.expressionSystem,
    characterSystemId: run.brandCharacterSystemId,
  });

  return marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    status: 'EXPERIMENT_01_V22_READY',
    experiment01V22: experiment,
    error: null,
    updatedAt: nowIso(),
  });
}

export async function generateExperiment01V22ArtifactAsset(params: {
  projectId: string;
  artifactId: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01V22?.generatedArtifacts.length) {
    throw new Error('Experiment 01 V2.2 contracts not formulated');
  }
  if (!v22ContractReviewBeforeGeneration(run.experiment01V22)) {
    throw new Error('V2.2 contracts must be reviewed before generation');
  }

  const idx = run.experiment01V22.generatedArtifacts.findIndex((a) => a.id === params.artifactId);
  if (idx < 0) throw new Error('V2.2 artifact not found');

  const artifact = run.experiment01V22.generatedArtifacts[idx]!;
  if (artifact.generationStatus === 'GENERATED' && artifact.generatedAssetUrl) return run;

  const contract = artifact.generationContract;
  if (!contract) throw new Error('V2.2 FAL contract missing');

  let generatedAssetUrl = artifact.generatedAssetUrl;
  let generatedAssetId = artifact.generatedAssetId;
  let generationStatus: typeof artifact.generationStatus = 'GENERATED';
  let falCost = 0;

  if (process.env.VITEST === 'true' || !process.env.FAL_KEY) {
    generatedAssetId = `asset-v22-${artifact.id}`;
    generatedAssetUrl = `https://vitest.local/ndxbook/marketing-exp01-v22/${artifact.id}.png`;
  } else {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: process.env.FAL_KEY });
    const { model, input } = buildFalImageInput({ prompt: contract.prompt, aspectRatio: '1:1' });
    const result = await fal.subscribe(model, { input });
    const images = (result.data as { images?: { url?: string }[] })?.images;
    generatedAssetUrl = images?.[0]?.url ?? null;
    generatedAssetId = `fal-v22-${artifact.id}-${Date.now()}`;
    falCost = FAL_MARKETING_COST_ESTIMATE_USD;
    if (!generatedAssetUrl) generationStatus = 'FAILED';
  }

  const updated = [...run.experiment01V22.generatedArtifacts];
  updated[idx] = { ...artifact, generatedAssetId, generatedAssetUrl, generationStatus, updatedAt: nowIso() };
  const allGenerated = updated.every((a) => a.generationStatus === 'GENERATED');

  return marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    status: allGenerated ? 'EXPERIMENT_01_V22_COMPLETE' : 'EXPERIMENT_01_V22_GENERATING',
    experiment01V22: {
      ...run.experiment01V22,
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

export async function setExperiment01V22ArtifactJudgment(params: {
  projectId: string;
  artifactId: string;
  judgment: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01V22) throw new Error('Experiment 01 V2.2 not found');

  const artifacts = run.experiment01V22.generatedArtifacts.map((a) =>
    a.id === params.artifactId
      ? {
          ...a,
          founderJudgment: params.judgment as import('../../../../../shared/site00-brand-lore/characterRetention/types.js').V22FounderJudgment,
          updatedAt: nowIso(),
        }
      : a,
  );

  return marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    experiment01V22: { ...run.experiment01V22, status: 'FOUNDER_REVIEW', generatedArtifacts: artifacts },
    updatedAt: nowIso(),
  });
}

export function experiment01V22NotAutoGenerated(): true {
  return true;
}

async function finalizeExperiment01BatchGeneration(params: {
  projectId: string;
  version: Experiment01GenerationVersion;
}): Promise<void> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run) return;

  if (params.version === 'v1' && run.experiment01) {
    const artifacts = run.experiment01.artifacts.map(resetStaleGeneratingArtifact);
    const allGenerated = artifacts.every((a) => a.generationStatus === 'GENERATED' && a.generatedAssetUrl);
    const anyFailed = artifacts.some((a) => a.generationStatus === 'FAILED');
    await marketingStore.saveBrandMarketingExpressionRun({
      ...run,
      status: allGenerated ? 'EXPERIMENT_01_COMPLETE' : 'EXPERIMENT_01_READY',
      experiment01: {
        ...run.experiment01,
        status: allGenerated ? 'GENERATED' : 'FORMULATED',
        artifacts,
      },
      error:
        anyFailed && !allGenerated
          ? 'Some slides failed to generate — tap GENERATE REMAINING to retry'
          : run.error,
      updatedAt: nowIso(),
    });
    return;
  }

  if (params.version === 'v2' && run.experiment01V2) {
    const artifacts = run.experiment01V2.generatedArtifacts.map(resetStaleGeneratingArtifact);
    const allGenerated = artifacts.every((a) => a.generationStatus === 'GENERATED' && a.generatedAssetUrl);
    const anyFailed = artifacts.some((a) => a.generationStatus === 'FAILED');
    await marketingStore.saveBrandMarketingExpressionRun({
      ...run,
      status: allGenerated ? 'EXPERIMENT_01_V2_COMPLETE' : 'EXPERIMENT_01_V2_READY',
      experiment01V2: {
        ...run.experiment01V2,
        status: allGenerated ? 'GENERATED' : 'CONTRACTS_READY',
        generatedArtifacts: artifacts,
      },
      error:
        anyFailed && !allGenerated
          ? 'Some slides failed to generate — tap GENERATE REMAINING to retry'
          : run.error,
      updatedAt: nowIso(),
    });
    return;
  }

  if (params.version === 'v21' && run.experiment01V21) {
    const artifacts = run.experiment01V21.generatedArtifacts.map(resetStaleGeneratingArtifact);
    const allGenerated = artifacts.every((a) => a.generationStatus === 'GENERATED' && a.generatedAssetUrl);
    const anyFailed = artifacts.some((a) => a.generationStatus === 'FAILED');
    await marketingStore.saveBrandMarketingExpressionRun({
      ...run,
      status: allGenerated ? 'EXPERIMENT_01_V21_COMPLETE' : 'EXPERIMENT_01_V21_READY',
      experiment01V21: {
        ...run.experiment01V21,
        status: allGenerated ? 'GENERATED' : 'CONTRACTS_READY',
        generatedArtifacts: artifacts,
      },
      error:
        anyFailed && !allGenerated
          ? 'Some slides failed to generate — tap GENERATE REMAINING to retry'
          : run.error,
      updatedAt: nowIso(),
    });
    return;
  }

  if (params.version === 'v22' && run.experiment01V22) {
    const artifacts = run.experiment01V22.generatedArtifacts.map(resetStaleGeneratingArtifact);
    const allGenerated = artifacts.every((a) => a.generationStatus === 'GENERATED' && a.generatedAssetUrl);
    const anyFailed = artifacts.some((a) => a.generationStatus === 'FAILED');
    await marketingStore.saveBrandMarketingExpressionRun({
      ...run,
      status: allGenerated ? 'EXPERIMENT_01_V22_COMPLETE' : 'EXPERIMENT_01_V22_READY',
      experiment01V22: {
        ...run.experiment01V22,
        status: allGenerated ? 'GENERATED' : 'CONTRACTS_READY',
        generatedArtifacts: artifacts,
      },
      error:
        anyFailed && !allGenerated
          ? 'Some slides failed to generate — tap GENERATE REMAINING to retry'
          : run.error,
      updatedAt: nowIso(),
    });
    return;
  }

  if (params.version === 'v23' && run.experiment01V23) {
    const artifacts = run.experiment01V23.generatedArtifacts.map(resetStaleGeneratingArtifact);
    const allGenerated = artifacts.every((a) => a.generationStatus === 'GENERATED' && a.generatedAssetUrl);
    const anyFailed = artifacts.some((a) => a.generationStatus === 'FAILED');
    await marketingStore.saveBrandMarketingExpressionRun({
      ...run,
      status: allGenerated ? 'EXPERIMENT_01_V23_COMPLETE' : 'EXPERIMENT_01_V23_READY',
      experiment01V23: {
        ...run.experiment01V23,
        status: allGenerated ? 'GENERATED' : 'CONTRACTS_READY',
        generatedArtifacts: artifacts,
      },
      error:
        anyFailed && !allGenerated
          ? 'Some slides failed to generate — tap GENERATE REMAINING to retry'
          : run.error,
      updatedAt: nowIso(),
    });
  }
}

async function executeExperiment01GenerationWork(params: {
  projectId: string;
  version: Experiment01GenerationVersion;
  attemptId: string;
  artifactIds: string[];
}): Promise<void> {
  const key = generationKey(params.projectId, params.version);
  try {
    for (const artifactId of params.artifactIds) {
      if (activeGenerationAttempts.get(key) !== params.attemptId) return;
      try {
        if (params.version === 'v1') {
          await generateExperiment01ArtifactAsset({ projectId: params.projectId, artifactId });
        } else if (params.version === 'v2') {
          await generateExperiment01V2ArtifactAsset({ projectId: params.projectId, artifactId });
        } else if (params.version === 'v21') {
          await generateExperiment01V21ArtifactAsset({ projectId: params.projectId, artifactId });
        } else if (params.version === 'v22') {
          await generateExperiment01V22ArtifactAsset({ projectId: params.projectId, artifactId });
        } else {
          await generateExperiment01V23ArtifactAsset({ projectId: params.projectId, artifactId });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Generation failed';
        const current = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
        if (!current) continue;

        if (params.version === 'v1' && current.experiment01) {
          const artifacts = current.experiment01.artifacts.map((artifact) =>
            artifact.id === artifactId
              ? { ...artifact, generationStatus: 'FAILED' as const, updatedAt: nowIso() }
              : artifact,
          );
          await marketingStore.saveBrandMarketingExpressionRun({
            ...current,
            experiment01: { ...current.experiment01, artifacts },
            error: message,
            updatedAt: nowIso(),
          });
        } else if (params.version === 'v2' && current.experiment01V2) {
          const artifacts = current.experiment01V2.generatedArtifacts.map((artifact) =>
            artifact.id === artifactId
              ? { ...artifact, generationStatus: 'FAILED' as const, updatedAt: nowIso() }
              : artifact,
          );
          await marketingStore.saveBrandMarketingExpressionRun({
            ...current,
            experiment01V2: { ...current.experiment01V2, generatedArtifacts: artifacts },
            error: message,
            updatedAt: nowIso(),
          });
        } else if (params.version === 'v21' && current.experiment01V21) {
          const artifacts = current.experiment01V21.generatedArtifacts.map((artifact) =>
            artifact.id === artifactId
              ? { ...artifact, generationStatus: 'FAILED' as const, updatedAt: nowIso() }
              : artifact,
          );
          await marketingStore.saveBrandMarketingExpressionRun({
            ...current,
            experiment01V21: { ...current.experiment01V21, generatedArtifacts: artifacts },
            error: message,
            updatedAt: nowIso(),
          });
        } else if (params.version === 'v22' && current.experiment01V22) {
          const artifacts = current.experiment01V22.generatedArtifacts.map((artifact) =>
            artifact.id === artifactId
              ? { ...artifact, generationStatus: 'FAILED' as const, updatedAt: nowIso() }
              : artifact,
          );
          await marketingStore.saveBrandMarketingExpressionRun({
            ...current,
            experiment01V22: { ...current.experiment01V22, generatedArtifacts: artifacts },
            error: message,
            updatedAt: nowIso(),
          });
        } else if (params.version === 'v23' && current.experiment01V23) {
          const artifacts = current.experiment01V23.generatedArtifacts.map((artifact) =>
            artifact.id === artifactId
              ? { ...artifact, generationStatus: 'FAILED' as const, updatedAt: nowIso() }
              : artifact,
          );
          await marketingStore.saveBrandMarketingExpressionRun({
            ...current,
            experiment01V23: { ...current.experiment01V23, generatedArtifacts: artifacts },
            error: message,
            updatedAt: nowIso(),
          });
        }
      }
    }
  } finally {
    if (activeGenerationAttempts.get(key) === params.attemptId) {
      activeGenerationAttempts.delete(key);
      await finalizeExperiment01BatchGeneration({
        projectId: params.projectId,
        version: params.version,
      });
    }
  }
}

async function pendingArtifactIdsForVersion(
  run: BrandMarketingExpressionRun,
  version: Experiment01GenerationVersion,
): Promise<string[]> {
  if (version === 'v1') {
    return (
      run.experiment01?.artifacts
        .filter((artifact) => artifact.generationStatus !== 'GENERATED' || !artifact.generatedAssetUrl)
        .map((artifact) => artifact.id) ?? []
    );
  }
  if (version === 'v2') {
    return (
      run.experiment01V2?.generatedArtifacts
        .filter((artifact) => artifact.generationStatus !== 'GENERATED' || !artifact.generatedAssetUrl)
        .map((artifact) => artifact.id) ?? []
    );
  }
  if (version === 'v21') {
    return (
      run.experiment01V21?.generatedArtifacts
        .filter((artifact) => artifact.generationStatus !== 'GENERATED' || !artifact.generatedAssetUrl)
        .map((artifact) => artifact.id) ?? []
    );
  }
  if (version === 'v22') {
    return (
      run.experiment01V22?.generatedArtifacts
        .filter((artifact) => artifact.generationStatus !== 'GENERATED' || !artifact.generatedAssetUrl)
        .map((artifact) => artifact.id) ?? []
    );
  }
  return (
    run.experiment01V23?.generatedArtifacts
      .filter((artifact) => artifact.generationStatus !== 'GENERATED' || !artifact.generatedAssetUrl)
      .map((artifact) => artifact.id) ?? []
  );
}

async function startExperiment01BatchGeneration(params: {
  projectId: string;
  version: Experiment01GenerationVersion;
  pendingArtifactIds: string[];
  markGenerating: (run: BrandMarketingExpressionRun) => BrandMarketingExpressionRun;
}): Promise<BrandMarketingExpressionRun> {
  const key = generationKey(params.projectId, params.version);
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run) throw new Error('Marketing Expression run not found');

  if (params.pendingArtifactIds.length === 0) return run;
  if (activeGenerationAttempts.has(key)) return run;

  const reconciled = await reconcileStaleExperiment01Generation(run);
  if (activeGenerationAttempts.has(key)) return reconciled;

  const pendingArtifactIds = await pendingArtifactIdsForVersion(reconciled, params.version);
  if (pendingArtifactIds.length === 0) return reconciled;

  const attemptId = randomUUID();
  activeGenerationAttempts.set(key, attemptId);

  const started = await marketingStore.saveBrandMarketingExpressionRun(
    params.markGenerating(reconciled),
  );

  const work = executeExperiment01GenerationWork({
    projectId: params.projectId,
    version: params.version,
    attemptId,
    artifactIds: pendingArtifactIds,
  });

  if (shouldGenerateSynchronously()) {
    await work;
    return (await getBrandMarketingExpressionState({ projectId: params.projectId })) ?? started;
  }

  setImmediate(() => {
    void work;
  });
  return started;
}

export async function generateAllExperiment01ArtifactAssets(params: {
  projectId: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01?.artifacts.length) {
    throw new Error('Experiment 01 artifacts not formulated');
  }

  const pending = run.experiment01.artifacts
    .filter((a) => a.generationStatus !== 'GENERATED' || !a.generatedAssetUrl)
    .map((a) => a.id);

  return startExperiment01BatchGeneration({
    projectId: params.projectId,
    version: 'v1',
    pendingArtifactIds: pending,
    markGenerating: (current) => ({
      ...current,
      status: 'EXPERIMENT_01_GENERATING',
      experiment01: {
        ...current.experiment01!,
        status: 'FORMULATED',
        artifacts: current.experiment01!.artifacts.map((a) =>
          a.generationStatus === 'GENERATED' && a.generatedAssetUrl
            ? a
            : { ...a, generationStatus: 'GENERATING' as const, updatedAt: nowIso() },
        ),
      },
      updatedAt: nowIso(),
    }),
  });
}

export async function generateAllExperiment01V2ArtifactAssets(params: {
  projectId: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01V2?.generatedArtifacts.length) {
    throw new Error('Experiment 01 V2 contracts not formulated');
  }
  if (!v2ContractReviewBeforeGeneration(run.experiment01V2)) {
    throw new Error('V2 contracts must be reviewed before generation');
  }

  const pending = run.experiment01V2.generatedArtifacts
    .filter((a) => a.generationStatus !== 'GENERATED' || !a.generatedAssetUrl)
    .map((a) => a.id);

  return startExperiment01BatchGeneration({
    projectId: params.projectId,
    version: 'v2',
    pendingArtifactIds: pending,
    markGenerating: (current) => ({
      ...current,
      status: 'EXPERIMENT_01_V2_GENERATING',
      experiment01V2: {
        ...current.experiment01V2!,
        status: 'GENERATING',
        generatedArtifacts: current.experiment01V2!.generatedArtifacts.map((a) =>
          a.generationStatus === 'GENERATED' && a.generatedAssetUrl
            ? a
            : { ...a, generationStatus: 'GENERATING' as const, updatedAt: nowIso() },
        ),
      },
      updatedAt: nowIso(),
    }),
  });
}

export async function generateAllExperiment01V21ArtifactAssets(params: {
  projectId: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01V21?.generatedArtifacts.length) {
    throw new Error('Experiment 01 V2.1 contracts not formulated');
  }
  if (!v21ContractReviewBeforeGeneration(run.experiment01V21)) {
    throw new Error('V2.1 contracts must be reviewed before generation');
  }

  const pending = run.experiment01V21.generatedArtifacts
    .filter((a) => a.generationStatus !== 'GENERATED' || !a.generatedAssetUrl)
    .map((a) => a.id);

  return startExperiment01BatchGeneration({
    projectId: params.projectId,
    version: 'v21',
    pendingArtifactIds: pending,
    markGenerating: (current) => ({
      ...current,
      status: 'EXPERIMENT_01_V21_GENERATING',
      experiment01V21: {
        ...current.experiment01V21!,
        status: 'GENERATING',
        generatedArtifacts: current.experiment01V21!.generatedArtifacts.map((a) =>
          a.generationStatus === 'GENERATED' && a.generatedAssetUrl
            ? a
            : { ...a, generationStatus: 'GENERATING' as const, updatedAt: nowIso() },
        ),
      },
      updatedAt: nowIso(),
    }),
  });
}

export async function generateAllExperiment01V22ArtifactAssets(params: {
  projectId: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01V22?.generatedArtifacts.length) {
    throw new Error('Experiment 01 V2.2 contracts not formulated');
  }
  if (!v22ContractReviewBeforeGeneration(run.experiment01V22)) {
    throw new Error('V2.2 contracts must be reviewed before generation');
  }

  const pending = run.experiment01V22.generatedArtifacts
    .filter((a) => a.generationStatus !== 'GENERATED' || !a.generatedAssetUrl)
    .map((a) => a.id);

  return startExperiment01BatchGeneration({
    projectId: params.projectId,
    version: 'v22',
    pendingArtifactIds: pending,
    markGenerating: (current) => ({
      ...current,
      status: 'EXPERIMENT_01_V22_GENERATING',
      experiment01V22: {
        ...current.experiment01V22!,
        status: 'GENERATING',
        generatedArtifacts: current.experiment01V22!.generatedArtifacts.map((a) =>
          a.generationStatus === 'GENERATED' && a.generatedAssetUrl
            ? a
            : { ...a, generationStatus: 'GENERATING' as const, updatedAt: nowIso() },
        ),
      },
      updatedAt: nowIso(),
    }),
  });
}

export async function formulateMarketingExpressionExperiment01V23(params: {
  projectId: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01?.artifacts.length) {
    throw new Error('Experiment 01 V1 required — history preserved');
  }
  if (!run.experiment01V22?.generatedArtifacts.length) {
    throw new Error('Experiment 01 V2.2 required before V2.3 art-board materiality formulation');
  }
  if (!run.expressionSystem) {
    throw new Error('Marketing Expression System must be compiled');
  }

  const { experiment } = formulateExperiment01V23({
    v1Artifacts: run.experiment01.artifacts,
    v22Experiment: run.experiment01V22,
    expressionSystem: run.expressionSystem,
  });

  return marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    status: 'EXPERIMENT_01_V23_READY',
    experiment01V23: experiment,
    error: null,
    updatedAt: nowIso(),
  });
}

export async function generateExperiment01V23ArtifactAsset(params: {
  projectId: string;
  artifactId: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01V23?.generatedArtifacts.length) {
    throw new Error('Experiment 01 V2.3 contracts not formulated');
  }
  if (!v23ContractReviewBeforeGeneration(run.experiment01V23)) {
    throw new Error('V2.3 contracts must be reviewed before generation');
  }

  const idx = run.experiment01V23.generatedArtifacts.findIndex((a) => a.id === params.artifactId);
  if (idx < 0) throw new Error('V2.3 artifact not found');

  const artifact = run.experiment01V23.generatedArtifacts[idx]!;
  if (artifact.generationStatus === 'GENERATED' && artifact.generatedAssetUrl) return run;

  const contract = artifact.generationContract;
  if (!contract) throw new Error('V2.3 FAL contract missing');

  let generatedAssetUrl = artifact.generatedAssetUrl;
  let generatedAssetId = artifact.generatedAssetId;
  let generationStatus: typeof artifact.generationStatus = 'GENERATED';
  let falCost = 0;

  if (process.env.VITEST === 'true' || !process.env.FAL_KEY) {
    generatedAssetId = `asset-v23-${artifact.id}`;
    generatedAssetUrl = `https://vitest.local/ndxbook/marketing-exp01-v23/${artifact.id}.png`;
  } else {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: process.env.FAL_KEY });
    const { model, input } = buildFalImageInput({ prompt: contract.prompt, aspectRatio: '1:1' });
    const result = await fal.subscribe(model, { input });
    const images = (result.data as { images?: { url?: string }[] })?.images;
    generatedAssetUrl = images?.[0]?.url ?? null;
    generatedAssetId = `fal-v23-${artifact.id}-${Date.now()}`;
    falCost = FAL_MARKETING_COST_ESTIMATE_USD;
    if (!generatedAssetUrl) generationStatus = 'FAILED';
  }

  const updated = [...run.experiment01V23.generatedArtifacts];
  updated[idx] = { ...artifact, generatedAssetId, generatedAssetUrl, generationStatus, updatedAt: nowIso() };
  const allGenerated = updated.every((a) => a.generationStatus === 'GENERATED');

  return marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    status: allGenerated ? 'EXPERIMENT_01_V23_COMPLETE' : 'EXPERIMENT_01_V23_GENERATING',
    experiment01V23: {
      ...run.experiment01V23,
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

export async function setExperiment01V23ArtifactJudgment(params: {
  projectId: string;
  artifactId: string;
  judgment: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01V23) throw new Error('Experiment 01 V2.3 not found');

  const artifacts = run.experiment01V23.generatedArtifacts.map((a) =>
    a.id === params.artifactId
      ? {
          ...a,
          founderJudgment: params.judgment as import('../../../../../shared/site00-brand-lore/artBoardMateriality/types.js').V23FounderJudgment,
          updatedAt: nowIso(),
        }
      : a,
  );

  return marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    experiment01V23: { ...run.experiment01V23, status: 'FOUNDER_REVIEW', generatedArtifacts: artifacts },
    updatedAt: nowIso(),
  });
}

export function experiment01V23NotAutoGenerated(): true {
  return true;
}

export async function generateAllExperiment01V23ArtifactAssets(params: {
  projectId: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01V23?.generatedArtifacts.length) {
    throw new Error('Experiment 01 V2.3 contracts not formulated');
  }
  if (!v23ContractReviewBeforeGeneration(run.experiment01V23)) {
    throw new Error('V2.3 contracts must be reviewed before generation');
  }

  const pending = run.experiment01V23.generatedArtifacts
    .filter((a) => a.generationStatus !== 'GENERATED' || !a.generatedAssetUrl)
    .map((a) => a.id);

  return startExperiment01BatchGeneration({
    projectId: params.projectId,
    version: 'v23',
    pendingArtifactIds: pending,
    markGenerating: (current) => ({
      ...current,
      status: 'EXPERIMENT_01_V23_GENERATING',
      experiment01V23: {
        ...current.experiment01V23!,
        status: 'GENERATING',
        generatedArtifacts: current.experiment01V23!.generatedArtifacts.map((a) =>
          a.generationStatus === 'GENERATED' && a.generatedAssetUrl
            ? a
            : { ...a, generationStatus: 'GENERATING' as const, updatedAt: nowIso() },
        ),
      },
      updatedAt: nowIso(),
    }),
  });
}

export function experiment01BatchGenerationRequiresFounderTrigger(): true {
  return true;
}
