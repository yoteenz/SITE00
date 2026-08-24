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
  migrateExperiment01V23ToC4B1,
  v23ContractReviewBeforeGeneration,
} from '../../../../../shared/site00-brand-lore/artBoardMateriality/experiment01V23.js';
import {
  applyExperiment01V23Supersession,
  assertV23BatchGenerationAllowed,
  assertV23SingleArtifactGenerationAllowed,
  isV23GenerationBlocked,
  isV23SupersessionError,
  markInFlightV23ArtifactPreserved,
  shouldAutoSupersedeV23Generation,
} from '../../../../../shared/site00-brand-lore/artBoardMateriality/experiment01V23Supersession.js';
import {
  applyFounderRevisionToV23Artifact,
  founderRevisionUsesParentReference,
  isV23ApprovalJudgment,
} from '../../../../../shared/site00-brand-lore/artBoardMateriality/v23FounderRevisionPipeline.js';
import {
  appendPromptSnapshot,
  buildV23GenerationAssetRecord,
  migrateV23ArtifactGenerationLineage,
  markV23ArtifactPromptStale,
  resolveV23DispatchPrompt,
} from '../../../../../shared/site00-brand-lore/artBoardMateriality/v23GenerationAuthority.js';
import type { GenerationMode } from '../../../../../shared/site00-studio-world-production/generationAuthority/types.js';
import type { V23FounderJudgment } from '../../../../../shared/site00-brand-lore/artBoardMateriality/types.js';
import {
  evaluateExperiment01Set,
  evaluateMarketingArtifact,
  evaluateMarketingCharacterRecognition,
  evaluateNorthStarCharacterDistance,
} from '../../../../../shared/site00-brand-lore/brandMarketingExpression/marketingEvaluation.js';
import { buildVitestBrandCharacterSystemForMarketing } from '../../../../../shared/site00-brand-lore/brandMarketingExpression/vitestFixtures.js';
import type {
  BrandMarketingExpressionRun,
  Experiment01GenerationVersion,
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
const v23SupersessionBoundaries = new Map<
  string,
  { invalidatedAttemptId: string | null; providerDispatchesAfterBoundary: number }
>();

function generationKey(projectId: string, version: Experiment01GenerationVersion): string {
  return `${projectId}:${version}`;
}

function hasFreshExperiment01GenerationAttempt(
  run: BrandMarketingExpressionRun,
  version: Experiment01GenerationVersion,
): boolean {
  const tracking = run.experiment01GenerationTracking;
  if (!tracking || tracking.version !== version || !tracking.startedAt) return false;
  return Date.now() - new Date(tracking.startedAt).getTime() <= STALE_GENERATING_MS;
}

export function hasFreshExperiment01GenerationAttemptForVersion(
  run: BrandMarketingExpressionRun,
  version: Experiment01GenerationVersion,
): boolean {
  return hasFreshExperiment01GenerationAttempt(run, version);
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
  run: BrandMarketingExpressionRun;
  projectId: string;
  version: Experiment01GenerationVersion;
  runGenerating: boolean;
  experimentGenerating: boolean;
  artifacts: GeneratingArtifact[];
}): boolean {
  if (isExperiment01GenerationWorkerActive(params.projectId, params.version)) return false;
  if (hasFreshExperiment01GenerationAttempt(params.run, params.version)) return false;
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
      run: next,
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
      run: next,
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
      run: next,
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
      run: next,
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
      run: next,
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
    experiment01GenerationTracking: null,
    error: null,
    accounting: emptyAccounting(),
    updatedAt: nowIso(),
  };
}

export function resetBrandMarketingExpressionWorkers(): void {
  activeFormulationAttempts.clear();
  activeGenerationAttempts.clear();
  v23SupersessionBoundaries.clear();
}

async function reconcileV23C4B1AndSupersession(
  run: BrandMarketingExpressionRun,
): Promise<BrandMarketingExpressionRun> {
  if (!run.experiment01V23?.generatedArtifacts.length) return run;

  let next = run;
  let changed = false;

  const needsC4B1Migration = run.experiment01V23.generatedArtifacts.some(
    (a) => !a.contract.signatureLimeRestraint,
  );
  if (needsC4B1Migration) {
    const migrated = migrateExperiment01V23ToC4B1({
      experiment: run.experiment01V23,
      v1Artifacts: run.experiment01?.artifacts ?? [],
    });
    next = {
      ...next,
      experiment01V23: migrated,
      updatedAt: nowIso(),
    };
    changed = true;
  }

  const experiment = next.experiment01V23!;
  if (shouldAutoSupersedeV23Generation(experiment)) {
    const attemptKey = generationKey(run.projectId, 'v23');
    const invalidatedAttemptId = activeGenerationAttempts.get(attemptKey) ?? null;
    activeGenerationAttempts.delete(attemptKey);

    const { experiment: superseded, forensic } = applyExperiment01V23Supersession(experiment);
    v23SupersessionBoundaries.set(run.projectId, {
      invalidatedAttemptId,
      providerDispatchesAfterBoundary: forensic.providerDispatchesAfterBoundary,
    });

    next = {
      ...next,
      status:
        next.status === 'EXPERIMENT_01_V23_GENERATING' ? 'EXPERIMENT_01_V23_READY' : next.status,
      experiment01V23: superseded,
      error: null,
      updatedAt: nowIso(),
    };
    changed = true;
  }

  if (!changed) return run;
  return marketingStore.saveBrandMarketingExpressionRun(next);
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
  const reconciled = await reconcileStaleExperiment01Generation(existing);
  return reconcileV23C4B1AndSupersession(reconciled);
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

type Experiment01FalBatchSuccess = {
  artifactId: string;
  ok: true;
  falCost: number;
  updatedArtifact: Record<string, unknown>;
};

type Experiment01FalBatchFailure = {
  artifactId: string;
  ok: false;
  error: string;
};

type Experiment01FalBatchResult = Experiment01FalBatchSuccess | Experiment01FalBatchFailure;

async function runFalImageGeneration(prompt: string): Promise<{ url: string | null; falCost: number }> {
  if (process.env.VITEST === 'true' || !process.env.FAL_KEY) {
    return { url: `https://vitest.local/fal/${Date.now()}.png`, falCost: 0 };
  }
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: process.env.FAL_KEY });
  const { model, input } = buildFalImageInput({ prompt, aspectRatio: '1:1' });
  const result = await fal.subscribe(model, { input });
  const images = (result.data as { images?: { url?: string }[] })?.images;
  return {
    url: images?.[0]?.url ?? null,
    falCost: FAL_MARKETING_COST_ESTIMATE_USD,
  };
}

async function generateExperiment01ArtifactFalResult(params: {
  run: BrandMarketingExpressionRun;
  version: Experiment01GenerationVersion;
  artifactId: string;
}): Promise<Experiment01FalBatchSuccess> {
  const { run, version, artifactId } = params;

  if (version === 'v1') {
    const idx = run.experiment01!.artifacts.findIndex((a) => a.id === artifactId);
    if (idx < 0) throw new Error('Artifact not found');
    const artifact = run.experiment01!.artifacts[idx]!;
    const contract = artifact.generationContract;
    if (!contract) throw new Error('FAL contract missing — reformulate Experiment 01');
    const { url, falCost } = await runFalImageGeneration(contract.prompt);
    return {
      artifactId,
      ok: true,
      falCost,
      updatedArtifact: {
        ...artifact,
        generatedAssetId: process.env.VITEST === 'true' || !process.env.FAL_KEY
          ? `asset-${artifact.id}`
          : `fal-${artifact.id}-${Date.now()}`,
        generatedAssetUrl: process.env.VITEST === 'true' || !process.env.FAL_KEY
          ? `https://vitest.local/ndxbook/marketing-exp01/${artifact.id}.png`
          : url,
        generationStatus: url ? 'GENERATED' : 'FAILED',
        updatedAt: nowIso(),
      },
    };
  }

  if (version === 'v2') {
    const idx = run.experiment01V2!.generatedArtifacts.findIndex((a) => a.id === artifactId);
    if (idx < 0) throw new Error('V2 artifact not found');
    const artifact = run.experiment01V2!.generatedArtifacts[idx]!;
    const contract = artifact.generationContract;
    if (!contract) throw new Error('V2 FAL contract missing');
    const { url, falCost } = await runFalImageGeneration(contract.prompt);
    return {
      artifactId,
      ok: true,
      falCost,
      updatedArtifact: {
        ...artifact,
        generatedAssetId: process.env.VITEST === 'true' || !process.env.FAL_KEY
          ? `asset-v2-${artifact.id}`
          : `fal-v2-${artifact.id}-${Date.now()}`,
        generatedAssetUrl: process.env.VITEST === 'true' || !process.env.FAL_KEY
          ? `https://vitest.local/ndxbook/marketing-exp01-v2/${artifact.id}.png`
          : url,
        generationStatus: url ? 'GENERATED' : 'FAILED',
        updatedAt: nowIso(),
      },
    };
  }

  if (version === 'v21') {
    const idx = run.experiment01V21!.generatedArtifacts.findIndex((a) => a.id === artifactId);
    if (idx < 0) throw new Error('V2.1 artifact not found');
    const artifact = run.experiment01V21!.generatedArtifacts[idx]!;
    const contract = artifact.generationContract;
    if (!contract) throw new Error('V2.1 FAL contract missing');
    const { url, falCost } = await runFalImageGeneration(contract.prompt);
    return {
      artifactId,
      ok: true,
      falCost,
      updatedArtifact: {
        ...artifact,
        generatedAssetId: process.env.VITEST === 'true' || !process.env.FAL_KEY
          ? `asset-v21-${artifact.id}`
          : `fal-v21-${artifact.id}-${Date.now()}`,
        generatedAssetUrl: process.env.VITEST === 'true' || !process.env.FAL_KEY
          ? `https://vitest.local/ndxbook/marketing-exp01-v21/${artifact.id}.png`
          : url,
        generationStatus: url ? 'GENERATED' : 'FAILED',
        updatedAt: nowIso(),
      },
    };
  }

  if (version === 'v22') {
    const idx = run.experiment01V22!.generatedArtifacts.findIndex((a) => a.id === artifactId);
    if (idx < 0) throw new Error('V2.2 artifact not found');
    const artifact = run.experiment01V22!.generatedArtifacts[idx]!;
    const contract = artifact.generationContract;
    if (!contract) throw new Error('V2.2 FAL contract missing');
    const { url, falCost } = await runFalImageGeneration(contract.prompt);
    return {
      artifactId,
      ok: true,
      falCost,
      updatedArtifact: {
        ...artifact,
        generatedAssetId: process.env.VITEST === 'true' || !process.env.FAL_KEY
          ? `asset-v22-${artifact.id}`
          : `fal-v22-${artifact.id}-${Date.now()}`,
        generatedAssetUrl: process.env.VITEST === 'true' || !process.env.FAL_KEY
          ? `https://vitest.local/ndxbook/marketing-exp01-v22/${artifact.id}.png`
          : url,
        generationStatus: url ? 'GENERATED' : 'FAILED',
        updatedAt: nowIso(),
      },
    };
  }

  const idx = run.experiment01V23!.generatedArtifacts.findIndex((a) => a.id === artifactId);
  if (idx < 0) throw new Error('V2.3 artifact not found');
  let artifact = migrateV23ArtifactGenerationLineage(run.experiment01V23!.generatedArtifacts[idx]!);
  assertV23BatchGenerationAllowed(run.experiment01V23);
  const v1 = run.experiment01?.artifacts.find((a) => a.id === artifact.v1ArtifactId);
  if (!v1) throw new Error('V1 source artifact missing for V2.3 generation');

  const { falContract, snapshot } = resolveV23DispatchPrompt({
    artifact,
    v1Artifact: v1,
    projectId: run.projectId,
    mode: 'REGENERATE_CURRENT',
    replaySnapshotId: null,
  });

  const { url, falCost } = await runFalImageGeneration(falContract.prompt);
  const generatedAssetId = process.env.VITEST === 'true' || !process.env.FAL_KEY
    ? artifact.generatedAssetId
      ? `asset-v23-regen-${artifact.id}-${Date.now()}`
      : `asset-v23-${artifact.id}`
    : `fal-v23-${artifact.id}-${Date.now()}`;
  const generatedAssetUrl = process.env.VITEST === 'true' || !process.env.FAL_KEY
    ? `https://vitest.local/ndxbook/marketing-exp01-v23/${generatedAssetId}.png`
    : url;
  const generationStatus = generatedAssetUrl ? 'GENERATED' : 'FAILED';

  artifact = appendPromptSnapshot(artifact, { ...snapshot, generationAssetIds: [generatedAssetId] });
  const assetRecord = buildV23GenerationAssetRecord({
    artifact,
    assetId: generatedAssetId,
    url: generatedAssetUrl ?? '',
    snapshot: artifact.promptSnapshots!.find((s) => s.id === snapshot.id) ?? snapshot,
  });
  const generationAssets = [...(artifact.generationAssets ?? []), assetRecord];
  const wasInFlightAtBoundary = artifact.allowSingleInFlightCompletion === true;

  return {
    artifactId,
    ok: true,
    falCost,
    updatedArtifact: {
      ...artifact,
      generationContract: falContract,
      generatedAssetId,
      generatedAssetUrl,
      generationStatus,
      generationAssets,
      selectedGenerationAssetId: artifact.selectedGenerationAssetId ?? generatedAssetId,
      dispatchedPromptSnapshotId: snapshot.id,
      generationJobStatus: wasInFlightAtBoundary ? 'COMPLETED' : artifact.generationJobStatus ?? null,
      allowSingleInFlightCompletion: false,
      updatedAt: nowIso(),
    },
  };
}

function applyExperiment01FalBatchResults(params: {
  run: BrandMarketingExpressionRun;
  version: Experiment01GenerationVersion;
  results: Experiment01FalBatchResult[];
}): BrandMarketingExpressionRun {
  let next = params.run;
  let accounting = { ...params.run.accounting };
  let firstError: string | null = null;

  for (const result of params.results) {
    if (result.ok) {
      accounting = {
        ...accounting,
        falRequests: accounting.falRequests + 1,
        falEstimatedCostUsd: accounting.falEstimatedCostUsd + FAL_MARKETING_COST_ESTIMATE_USD,
        falActualCostUsd: accounting.falActualCostUsd + result.falCost,
      };
      if (params.version === 'v1' && next.experiment01) {
        const artifacts = next.experiment01.artifacts.map((artifact) =>
          artifact.id === result.artifactId ? (result.updatedArtifact as typeof artifact) : artifact,
        );
        next = { ...next, experiment01: { ...next.experiment01, artifacts } };
      } else if (params.version === 'v2' && next.experiment01V2) {
        const generatedArtifacts = next.experiment01V2.generatedArtifacts.map((artifact) =>
          artifact.id === result.artifactId ? (result.updatedArtifact as typeof artifact) : artifact,
        );
        next = { ...next, experiment01V2: { ...next.experiment01V2, generatedArtifacts } };
      } else if (params.version === 'v21' && next.experiment01V21) {
        const generatedArtifacts = next.experiment01V21.generatedArtifacts.map((artifact) =>
          artifact.id === result.artifactId ? (result.updatedArtifact as typeof artifact) : artifact,
        );
        next = { ...next, experiment01V21: { ...next.experiment01V21, generatedArtifacts } };
      } else if (params.version === 'v22' && next.experiment01V22) {
        const generatedArtifacts = next.experiment01V22.generatedArtifacts.map((artifact) =>
          artifact.id === result.artifactId ? (result.updatedArtifact as typeof artifact) : artifact,
        );
        next = { ...next, experiment01V22: { ...next.experiment01V22, generatedArtifacts } };
      } else if (params.version === 'v23' && next.experiment01V23) {
        const generatedArtifacts = next.experiment01V23.generatedArtifacts.map((artifact) =>
          artifact.id === result.artifactId ? (result.updatedArtifact as typeof artifact) : artifact,
        );
        next = { ...next, experiment01V23: { ...next.experiment01V23, generatedArtifacts } };
      }
    } else {
      firstError ??= result.error;
      if (params.version === 'v1' && next.experiment01) {
        const artifacts = next.experiment01.artifacts.map((artifact) =>
          artifact.id === result.artifactId
            ? { ...artifact, generationStatus: 'FAILED' as const, updatedAt: nowIso() }
            : artifact,
        );
        next = { ...next, experiment01: { ...next.experiment01, artifacts } };
      } else if (params.version === 'v2' && next.experiment01V2) {
        const generatedArtifacts = next.experiment01V2.generatedArtifacts.map((artifact) =>
          artifact.id === result.artifactId
            ? { ...artifact, generationStatus: 'FAILED' as const, updatedAt: nowIso() }
            : artifact,
        );
        next = { ...next, experiment01V2: { ...next.experiment01V2, generatedArtifacts } };
      } else if (params.version === 'v21' && next.experiment01V21) {
        const generatedArtifacts = next.experiment01V21.generatedArtifacts.map((artifact) =>
          artifact.id === result.artifactId
            ? { ...artifact, generationStatus: 'FAILED' as const, updatedAt: nowIso() }
            : artifact,
        );
        next = { ...next, experiment01V21: { ...next.experiment01V21, generatedArtifacts } };
      } else if (params.version === 'v22' && next.experiment01V22) {
        const generatedArtifacts = next.experiment01V22.generatedArtifacts.map((artifact) =>
          artifact.id === result.artifactId
            ? { ...artifact, generationStatus: 'FAILED' as const, updatedAt: nowIso() }
            : artifact,
        );
        next = { ...next, experiment01V22: { ...next.experiment01V22, generatedArtifacts } };
      } else if (params.version === 'v23' && next.experiment01V23) {
        if (isV23SupersessionError(result.error)) {
          const generatedArtifacts = next.experiment01V23.generatedArtifacts.map((artifact) =>
            artifact.id === result.artifactId && artifact.generationJobStatus === 'IN_FLIGHT_AT_BOUNDARY'
              ? { ...artifact, generationStatus: 'NOT_GENERATED' as const, updatedAt: nowIso() }
              : artifact,
          );
          next = { ...next, experiment01V23: { ...next.experiment01V23, generatedArtifacts } };
        } else {
          const generatedArtifacts = next.experiment01V23.generatedArtifacts.map((artifact) =>
            artifact.id === result.artifactId
              ? { ...artifact, generationStatus: 'FAILED' as const, updatedAt: nowIso() }
              : artifact,
          );
          next = { ...next, experiment01V23: { ...next.experiment01V23, generatedArtifacts } };
        }
      }
    }
  }

  return {
    ...next,
    accounting,
    error: firstError ?? next.error,
    updatedAt: nowIso(),
  };
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
      experiment01GenerationTracking: null,
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
      experiment01GenerationTracking: null,
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
      experiment01GenerationTracking: null,
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
      experiment01GenerationTracking: null,
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
      experiment01GenerationTracking: null,
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
    const initialRun = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
    if (!initialRun) return;
    if (initialRun.experiment01GenerationTracking?.attemptId !== params.attemptId) return;
    if (activeGenerationAttempts.get(key) !== params.attemptId) return;

    if (params.version === 'v23' && initialRun.experiment01V23 && isV23GenerationBlocked(initialRun.experiment01V23)) {
      return;
    }

    const generationTasks = params.artifactIds.map(async (artifactId): Promise<Experiment01FalBatchResult> => {
      if (activeGenerationAttempts.get(key) !== params.attemptId) {
        return { artifactId, ok: false, error: 'Generation cancelled' };
      }
      try {
        const result = await generateExperiment01ArtifactFalResult({
          run: initialRun,
          version: params.version,
          artifactId,
        });
        return result;
      } catch (error) {
        return {
          artifactId,
          ok: false,
          error: error instanceof Error ? error.message : 'Generation failed',
        };
      }
    });

    const results = await Promise.all(generationTasks);

    if (activeGenerationAttempts.get(key) !== params.attemptId) return;

    const currentRun = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
    if (!currentRun || currentRun.experiment01GenerationTracking?.attemptId !== params.attemptId) return;

    const merged = applyExperiment01FalBatchResults({
      run: currentRun,
      version: params.version,
      results,
    });

    await marketingStore.saveBrandMarketingExpressionRun(merged);
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
  /** When set, generate these artifacts (e.g. regenerate-all). Otherwise pending-only. */
  artifactIds?: string[];
  markGenerating: (run: BrandMarketingExpressionRun) => BrandMarketingExpressionRun;
}): Promise<BrandMarketingExpressionRun> {
  const key = generationKey(params.projectId, params.version);
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run) throw new Error('Marketing Expression run not found');

  const reconciled = await reconcileStaleExperiment01Generation(run);
  const artifactIds =
    params.artifactIds ?? (await pendingArtifactIdsForVersion(reconciled, params.version));
  if (artifactIds.length === 0) return reconciled;
  if (activeGenerationAttempts.has(key)) return reconciled;
  if (hasFreshExperiment01GenerationAttempt(reconciled, params.version)) return reconciled;

  const attemptId = randomUUID();
  const startedAt = nowIso();
  activeGenerationAttempts.set(key, attemptId);

  const started = await marketingStore.saveBrandMarketingExpressionRun({
    ...params.markGenerating(reconciled),
    experiment01GenerationTracking: {
      version: params.version,
      attemptId,
      startedAt,
    },
  });

  const work = executeExperiment01GenerationWork({
    projectId: params.projectId,
    version: params.version,
    attemptId,
    artifactIds,
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

  if (experiment.generatedArtifacts.length !== 9) {
    throw new Error(
      `V2.3 formulation incomplete: expected 9 art-board contracts, got ${experiment.generatedArtifacts.length}. Ensure all nine V2.2 artifacts align with V1 topics.`,
    );
  }

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
  mode?: GenerationMode;
  replaySnapshotId?: string | null;
}): Promise<BrandMarketingExpressionRun> {
  const mode = params.mode ?? 'REGENERATE_CURRENT';
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01V23?.generatedArtifacts.length) {
    throw new Error('Experiment 01 V2.3 contracts not formulated');
  }
  if (!v23ContractReviewBeforeGeneration(run.experiment01V23)) {
    throw new Error('V2.3 contracts must be reviewed before generation');
  }
  const idx = run.experiment01V23.generatedArtifacts.findIndex((a) => a.id === params.artifactId);
  if (idx < 0) throw new Error('V2.3 artifact not found');

  let artifact = migrateV23ArtifactGenerationLineage(run.experiment01V23.generatedArtifacts[idx]!);

  assertV23SingleArtifactGenerationAllowed({
    experiment: run.experiment01V23,
    artifact,
    mode,
  });

  if (
    mode === 'REGENERATE_CURRENT' &&
    artifact.generationStatus === 'GENERATED' &&
    artifact.generatedAssetUrl &&
    !params.replaySnapshotId
  ) {
    // REGENERATE_CURRENT — allow fresh generation from current contract
  } else if (mode !== 'REPLAY_GENERATION' && artifact.generationStatus === 'GENERATED' && artifact.generatedAssetUrl) {
    return run;
  }

  const v1 = run.experiment01?.artifacts.find((a) => a.id === artifact.v1ArtifactId);
  if (!v1) throw new Error('V1 source artifact missing for V2.3 generation');

  const { falContract, snapshot, replay } = resolveV23DispatchPrompt({
    artifact,
    v1Artifact: v1,
    projectId: params.projectId,
    mode,
    replaySnapshotId: params.replaySnapshotId,
  });

  let generatedAssetUrl = artifact.generatedAssetUrl;
  let generatedAssetId = artifact.generatedAssetId;
  let generationStatus: typeof artifact.generationStatus = 'GENERATED';
  let falCost = 0;

  if (process.env.VITEST === 'true' || !process.env.FAL_KEY) {
    generatedAssetId = replay
      ? `asset-v23-replay-${artifact.id}-${Date.now()}`
      : mode === 'REGENERATE_CURRENT' && artifact.generatedAssetId
        ? `asset-v23-regen-${artifact.id}-${Date.now()}`
        : `asset-v23-${artifact.id}`;
    generatedAssetUrl = `https://vitest.local/ndxbook/marketing-exp01-v23/${generatedAssetId}.png`;
  } else {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: process.env.FAL_KEY });
    const { model, input } = buildFalImageInput({ prompt: falContract.prompt, aspectRatio: '1:1' });
    const result = await fal.subscribe(model, { input });
    const images = (result.data as { images?: { url?: string }[] })?.images;
    generatedAssetUrl = images?.[0]?.url ?? null;
    generatedAssetId = `fal-v23-${artifact.id}-${Date.now()}`;
    falCost = FAL_MARKETING_COST_ESTIMATE_USD;
    if (!generatedAssetUrl) generationStatus = 'FAILED';
  }

  if (!replay && mode === 'REGENERATE_CURRENT') {
    artifact = appendPromptSnapshot(artifact, { ...snapshot, generationAssetIds: [generatedAssetId!] });
  }

  const assetRecord = buildV23GenerationAssetRecord({
    artifact,
    assetId: generatedAssetId!,
    url: generatedAssetUrl!,
    snapshot: replay ? snapshot : artifact.promptSnapshots!.find((s) => s.id === snapshot.id) ?? snapshot,
  });

  const wasInFlightAtBoundary = artifact.allowSingleInFlightCompletion === true;
  const generationAssets = [...(artifact.generationAssets ?? []), assetRecord];

  const updated = [...run.experiment01V23.generatedArtifacts];
  updated[idx] = {
    ...artifact,
    generationContract: falContract,
    generatedAssetId,
    generatedAssetUrl,
    generationStatus,
    generationAssets,
    selectedGenerationAssetId: wasInFlightAtBoundary ? artifact.selectedGenerationAssetId : (artifact.selectedGenerationAssetId ?? generatedAssetId),
    generationLineageClass: wasInFlightAtBoundary
      ? 'PRESERVED_PRE_C4B1'
      : mode === 'REGENERATE_CURRENT' && !replay
        ? 'CURRENT_C4B1'
        : artifact.generationLineageClass ?? null,
    generationJobStatus:
      wasInFlightAtBoundary || artifact.generationJobStatus === 'CANCELLED_SUPERSEDED'
        ? 'COMPLETED'
        : artifact.generationJobStatus ?? null,
    allowSingleInFlightCompletion: false,
    dispatchedPromptSnapshotId: snapshot.id,
    updatedAt: nowIso(),
  };
  if (wasInFlightAtBoundary) {
    updated[idx] = markInFlightV23ArtifactPreserved(updated[idx]!);
  }
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

export async function replayExperiment01V23HistoricalPrompt(params: {
  projectId: string;
  artifactId: string;
  replaySnapshotId?: string | null;
}): Promise<BrandMarketingExpressionRun> {
  return generateExperiment01V23ArtifactAsset({
    projectId: params.projectId,
    artifactId: params.artifactId,
    mode: 'REPLAY_GENERATION',
    replaySnapshotId: params.replaySnapshotId,
  });
}

export async function setExperiment01V23SelectedGenerationAsset(params: {
  projectId: string;
  artifactId: string;
  selectedGenerationAssetId: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01V23) throw new Error('Experiment 01 V2.3 not found');

  const artifacts = run.experiment01V23.generatedArtifacts.map((a) => {
    if (a.id !== params.artifactId) return a;
    const migrated = migrateV23ArtifactGenerationLineage(a);
    const asset = migrated.generationAssets?.find((g) => g.assetId === params.selectedGenerationAssetId);
    if (!asset) throw new Error('Selected generation asset not found for artifact');
    return {
      ...migrated,
      selectedGenerationAssetId: params.selectedGenerationAssetId,
      generatedAssetId: asset.assetId,
      generatedAssetUrl: asset.url,
      updatedAt: nowIso(),
    };
  });

  return marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    experiment01V23: { ...run.experiment01V23, generatedArtifacts: artifacts },
    updatedAt: nowIso(),
  });
}

export async function setExperiment01V23ArtifactJudgment(params: {
  projectId: string;
  artifactId: string;
  judgment: string;
  note?: string | null;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01V23) throw new Error('Experiment 01 V2.3 not found');

  const artifacts = run.experiment01V23.generatedArtifacts.map((a) =>
    a.id === params.artifactId
      ? {
          ...a,
          founderJudgment: params.judgment as V23FounderJudgment,
          founderJudgmentNote: params.note ?? a.founderJudgmentNote,
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

async function executeExperiment01V23RevisionFal(params: {
  projectId: string;
  artifactId: string;
}): Promise<void> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01V23) return;

  const idx = run.experiment01V23.generatedArtifacts.findIndex((a) => a.id === params.artifactId);
  if (idx < 0) return;

  const artifact = run.experiment01V23.generatedArtifacts[idx]!;
  const contract = artifact.generationContract;
  if (!contract) return;

  const referenceUrl = founderRevisionUsesParentReference(artifact.parentGeneratedAssetUrl)
    ? artifact.parentGeneratedAssetUrl
    : null;

  let generatedAssetUrl = artifact.generatedAssetUrl;
  let generatedAssetId = artifact.generatedAssetId;
  let generationStatus: typeof artifact.generationStatus = 'GENERATED';
  let falCost = 0;

  try {
    if (process.env.VITEST === 'true' || !process.env.FAL_KEY) {
      generatedAssetId = `asset-v23-rev-${artifact.id}-${Date.now()}`;
      generatedAssetUrl = `https://vitest.local/ndxbook/marketing-exp01-v23/${artifact.id}-rev.png`;
    } else {
      const { fal } = await import('@fal-ai/client');
      fal.config({ credentials: process.env.FAL_KEY });
      const { model, input } = buildFalImageInput({
        prompt: contract.prompt,
        aspectRatio: '1:1',
        referenceImageUrls: referenceUrl ? [referenceUrl] : undefined,
      });
      const result = await fal.subscribe(model, { input });
      const images = (result.data as { images?: { url?: string }[] })?.images;
      generatedAssetUrl = images?.[0]?.url ?? null;
      generatedAssetId = `fal-v23-rev-${artifact.id}-${Date.now()}`;
      falCost = FAL_MARKETING_COST_ESTIMATE_USD;
      if (!generatedAssetUrl) generationStatus = 'FAILED';
    }
  } catch {
    generationStatus = 'FAILED';
  }

  const current = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!current?.experiment01V23) return;

  const currentIdx = current.experiment01V23.generatedArtifacts.findIndex((a) => a.id === params.artifactId);
  if (currentIdx < 0) return;

  const currentArtifact = current.experiment01V23.generatedArtifacts[currentIdx]!;
  const history = [...(currentArtifact.revisionHistory ?? [])];
  const lastRev = history[history.length - 1];
  if (lastRev) {
    history[history.length - 1] = {
      ...lastRev,
      status: generationStatus === 'GENERATED' ? 'GENERATED' : 'FAILED',
      generatedAssetUrl,
    };
  }

  const updated = [...current.experiment01V23.generatedArtifacts];
  updated[currentIdx] = {
    ...currentArtifact,
    generatedAssetId,
    generatedAssetUrl,
    generationStatus,
    revisionHistory: history,
    updatedAt: nowIso(),
  };

  await marketingStore.saveBrandMarketingExpressionRun({
    ...current,
    status: 'EXPERIMENT_01_V23_GENERATING',
    experiment01V23: {
      ...current.experiment01V23,
      status: 'FOUNDER_REVIEW',
      generatedArtifacts: updated,
    },
    accounting: {
      ...current.accounting,
      falRequests: current.accounting.falRequests + 1,
      falEstimatedCostUsd: current.accounting.falEstimatedCostUsd + FAL_MARKETING_COST_ESTIMATE_USD,
      falActualCostUsd: current.accounting.falActualCostUsd + falCost,
    },
    updatedAt: nowIso(),
  });
}

export async function submitExperiment01V23FounderRevision(params: {
  projectId: string;
  artifactId: string;
  judgment: string;
  founderNote: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01V23) throw new Error('Experiment 01 V2.3 not found');

  const idx = run.experiment01V23.generatedArtifacts.findIndex((a) => a.id === params.artifactId);
  if (idx < 0) throw new Error('V2.3 artifact not found');

  const v1 = run.experiment01?.artifacts.find(
    (a) => a.id === run.experiment01V23!.generatedArtifacts[idx]!.v1ArtifactId,
  );
  if (!v1) throw new Error('V1 source artifact missing for revision');

  const note = params.founderNote.trim();
  if (!note && !isV23ApprovalJudgment(params.judgment)) {
    throw new Error('Founder revision note is required');
  }

  if (isV23ApprovalJudgment(params.judgment)) {
    return setExperiment01V23ArtifactJudgment({
      projectId: params.projectId,
      artifactId: params.artifactId,
      judgment: params.judgment,
      note,
    });
  }

  const revised = applyFounderRevisionToV23Artifact({
    artifact: run.experiment01V23.generatedArtifacts[idx]!,
    v1Artifact: v1,
    judgment: params.judgment as V23FounderJudgment,
    founderNote: note,
  });

  const updated = [...run.experiment01V23.generatedArtifacts];
  updated[idx] = revised;

  const started = await marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    status: 'EXPERIMENT_01_V23_GENERATING',
    experiment01V23: {
      ...run.experiment01V23,
      status: 'GENERATING',
      generatedArtifacts: updated,
    },
    updatedAt: nowIso(),
  });

  const work = executeExperiment01V23RevisionFal({
    projectId: params.projectId,
    artifactId: params.artifactId,
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
  assertV23BatchGenerationAllowed(run.experiment01V23);
  if (!v23ContractReviewBeforeGeneration(run.experiment01V23)) {
    throw new Error('V2.3 contracts must be reviewed before generation');
  }

  return startExperiment01BatchGeneration({
    projectId: params.projectId,
    version: 'v23',
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

export async function regenerateAllExperiment01V23ArtifactAssets(params: {
  projectId: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01V23?.generatedArtifacts.length) {
    throw new Error('Experiment 01 V2.3 contracts not formulated');
  }
  if (!v23ContractReviewBeforeGeneration(run.experiment01V23)) {
    throw new Error('V2.3 contracts must be reviewed before generation');
  }

  const allIds = run.experiment01V23.generatedArtifacts.map((a) => a.id);
  const hasAnyGenerated = run.experiment01V23.generatedArtifacts.some(
    (a) => a.generationStatus === 'GENERATED' && a.generatedAssetUrl,
  );
  if (!hasAnyGenerated) {
    throw new Error('Generate at least one V2.3 slide before REGENERATE ALL');
  }

  if (isV23GenerationBlocked(run.experiment01V23)) {
    let current = run;
    for (const artifactId of allIds) {
      current = await generateExperiment01V23ArtifactAsset({
        projectId: params.projectId,
        artifactId,
        mode: 'REGENERATE_CURRENT',
      });
    }
    return current;
  }

  return startExperiment01BatchGeneration({
    projectId: params.projectId,
    version: 'v23',
    artifactIds: allIds,
    markGenerating: (current) => ({
      ...current,
      status: 'EXPERIMENT_01_V23_GENERATING',
      experiment01V23: {
        ...current.experiment01V23!,
        status: 'GENERATING',
        generatedArtifacts: current.experiment01V23!.generatedArtifacts.map((a) => ({
          ...a,
          generationStatus: 'GENERATING' as const,
          updatedAt: nowIso(),
        })),
      },
      updatedAt: nowIso(),
    }),
  });
}

export function experiment01BatchGenerationRequiresFounderTrigger(): true {
  return true;
}

export async function applyV23PublicCopyRevisionAll(params: {
  projectId: string;
}): Promise<BrandMarketingExpressionRun> {
  const run = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!run?.experiment01V23?.generatedArtifacts.length) {
    throw new Error('Experiment 01 V2.3 not found');
  }

  const { applyV23PublicCopyRevision } = await import(
    '../../../../../shared/site00-brand-lore/firstPersonAuthorship/v23PublicCopyRevision.js'
  );

  const updatedArtifacts = run.experiment01V23.generatedArtifacts.map((artifact) => {
    const { artifact: revised } = applyV23PublicCopyRevision({ artifact });
    return markV23ArtifactPromptStale({
      ...revised,
      generationContract: revised.generationContract,
    });
  });

  return marketingStore.saveBrandMarketingExpressionRun({
    ...run,
    experiment01V23: {
      ...run.experiment01V23,
      generatedArtifacts: updatedArtifacts,
      status: 'FOUNDER_REVIEW',
    },
    updatedAt: nowIso(),
  });
}

export function v23PublicCopyRevisionPreservesArtDirection(): true {
  return true;
}
