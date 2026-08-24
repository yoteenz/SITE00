/**
 * Brand Presentation Visual Formulation service — parent scan (2×3×1) + legacy deep dive (2×3).
 */

import { createHash, randomUUID } from 'node:crypto';
import {
  BRAND_PRESENTATION_VISUAL_FORMULATION_CLASSIFICATION,
  BRAND_PRESENTATION_VISUAL_FORMULATION_RUN_ID,
  BRAND_PRESENTATION_VISUAL_FORMULATION_V1,
  BRAND_PRESENTATION_VISUAL_FORMULATION_V2,
  DIRECTION_BENCHMARK_SUMMARIES,
  FAL_COST_ESTIMATE_USD,
  NDXBOOK_DIRECTION_DEEP_DIVE_POLICY,
  NDXBOOK_VISUAL_EXPLORATION_POLICY,
  PARENT_CONCEPT_METAPHOR_GUARDS,
} from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/constants.js';
import type {
  BrandPresentationDirectionVisualBenchmark,
  BrandPresentationParentDeferredRecord,
  BrandPresentationParentVisualFinalistSelection,
  BrandPresentationVisualExpressionCandidate,
  BrandPresentationVisualFinalistSelection,
  BrandPresentationVisualFormulationRun,
  BrandPresentationVisualReferencePackage,
  BrandPresentationWinnerSelection,
  DirectionBenchmarkRevisionDelta,
  VisualExpressionRevisionDelta,
} from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/types.js';
import {
  directionBenchmarkVisionQaUnavailable,
  evaluateBenchmarkDirectionDrift,
  evaluateCrossFinalistCollapse,
  evaluateExpressionDirectionDrift,
  evaluateReferenceExclusions,
  evaluateSiblingBenchmarkDistinctiveness,
  evaluateWithinFinalistDistinctiveness,
  visionQaUnavailable,
} from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/evaluators.js';
import {
  canBeginVisualGeneration,
  evaluateFinalistGate,
  isDirectionDeepDivePolicy,
} from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/finalistGate.js';
import {
  canBeginBenchmarkFormulation,
  canBeginBenchmarkGeneration,
  evaluateParentFinalistGate,
  isParentFinalistScanPolicy,
} from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/parentFinalistGate.js';
import {
  compileBenchmarkRevisionPrompt,
  compileBrandPresentationVisualPrompt,
  compileDirectionBenchmarkPrompt,
  compileRevisionPrompt,
  DIRECTION_BENCHMARK_PROMPT_VERSION,
  VISUAL_FORMULATION_PROMPT_VERSION,
} from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/promptCompiler.js';
import {
  buildExpressionFormationPayload,
  EXPRESSION_FORMATION_SYSTEM_PROMPT,
  type RawExpressionPayload,
} from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/formationPrompt.js';
import {
  buildDirectionBenchmarkFormationPayload,
  DIRECTION_BENCHMARK_FORMATION_SYSTEM_PROMPT,
  type RawDirectionBenchmarkPayload,
} from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/directionBenchmarkPrompt.js';
import type { BrandPresentationDirectionCandidate } from '../../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/types.js';
import { BRAND_PRESENTATION_DIRECTION_RUN_ID } from '../../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/constants.js';
import { getBrandPresentationDirectionFormationRun } from '../brandPresentationDirectionExperiment/directionService.js';
import { parseStructuredJson } from '../creativeIntelligence/structuredJson.js';
import { callAnthropicForCompletion } from '../creativeIntelligence/anthropicCompletion.js';
import { ANTHROPIC_CREATIVE_MODEL } from '../creativeIntelligence/config.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import {
  EXPERIENCE_FAL_MODEL,
  EXPERIENCE_FAL_PROVIDER,
} from '../../../../../shared/site00-brand-lore/experienceExpression/experienceAssetFalProvider.js';
import { buildFalImageInput } from '../../../../../shared/site00-visual-generation/falImageModels.js';
import {
  assertReferenceConditioningSupported,
  getCurrentExperienceProviderCapability,
} from '../../../../../shared/site00-visual-reference/providerCapabilityRegistry.js';
import {
  downloadUrlToBuffer,
  getSite00AssetPublicUrl,
  site00StorageObjectExists,
  uploadSite00AssetBuffer,
} from '../../../site00Assts/storage.js';
import * as store from './storeAdapter.js';

const EXPRESSION_LABELS: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C'];

function nowIso(): string {
  return new Date().toISOString();
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function emptyAccounting(): BrandPresentationVisualFormulationRun['accounting'] {
  return {
    anthropicRequests: 0,
    anthropicInputTokens: 0,
    anthropicOutputTokens: 0,
    anthropicEstimatedCostUsd: 0,
    falRequests: 0,
    falRequestsExpected: NDXBOOK_VISUAL_EXPLORATION_POLICY.totalInitialVisuals,
    visualGenerationCostUsd: 0,
    hiddenVariantRequests: 0,
  };
}

function migrateRun(run: BrandPresentationVisualFormulationRun): BrandPresentationVisualFormulationRun {
  const policy =
    process.env.SITE00_EXPERIMENT_G_VISUAL_DEEP_DIVE === '1'
      ? { ...NDXBOOK_DIRECTION_DEEP_DIVE_POLICY }
      : isParentFinalistScanPolicy(run.explorationPolicy)
        ? run.explorationPolicy
        : { ...NDXBOOK_VISUAL_EXPLORATION_POLICY };

  return {
    ...run,
    explorationPolicy: policy,
    methodologyVersion:
      run.methodologyVersion === BRAND_PRESENTATION_VISUAL_FORMULATION_V1
        ? BRAND_PRESENTATION_VISUAL_FORMULATION_V2
        : run.methodologyVersion,
    parentFinalists: run.parentFinalists ?? [],
    deferredParents: run.deferredParents ?? [],
    directionBenchmarks: run.directionBenchmarks ?? [],
    benchmarkRevisions: run.benchmarkRevisions ?? [],
    siblingCollapseEval: run.siblingCollapseEval ?? null,
    finalists: run.finalists ?? [],
    expressions: run.expressions ?? [],
    referencePackages: run.referencePackages ?? [],
    revisions: run.revisions ?? [],
  };
}

function initRun(existing?: BrandPresentationVisualFormulationRun | null): BrandPresentationVisualFormulationRun {
  if (existing) return migrateRun(existing);
  const policy =
    process.env.SITE00_EXPERIMENT_G_VISUAL_DEEP_DIVE === '1'
      ? { ...NDXBOOK_DIRECTION_DEEP_DIVE_POLICY }
      : { ...NDXBOOK_VISUAL_EXPLORATION_POLICY };
  return {
    experimentClassification: BRAND_PRESENTATION_VISUAL_FORMULATION_CLASSIFICATION,
    runId: BRAND_PRESENTATION_VISUAL_FORMULATION_RUN_ID,
    organizationId: NDXBOOK_ORG_ID,
    projectId: 'ndxbook',
    projectSlug: 'ndxbook',
    methodologyVersion: BRAND_PRESENTATION_VISUAL_FORMULATION_V2,
    parentExperiment: 'EXPERIMENT_G',
    parentDirectionRunId: BRAND_PRESENTATION_DIRECTION_RUN_ID,
    explorationPolicy: policy,
    finalists: [],
    parentFinalists: [],
    deferredParents: [],
    directionBenchmarks: [],
    benchmarkRevisions: [],
    expressions: [],
    referencePackages: [],
    revisions: [],
    winner: null,
    crossFinalistCollapseEval: null,
    siblingCollapseEval: null,
    status: 'NOT_STARTED',
    formationVersion: 1,
    formationPromptVersion: DIRECTION_BENCHMARK_PROMPT_VERSION,
    visualFormulationAllowed: true,
    visualGenerationAllowed: false,
    falGenerationAllowed: false,
    brandCanonMutationAllowed: false,
    expressionSystemDevelopmentAllowed: false,
    accounting: emptyAccounting(),
    error: null,
    formationStartedAt: null,
    generationStartedAt: null,
    startedAt: nowIso(),
    completedAt: null,
  };
}

export function resetBrandPresentationVisualFormulationMemory(): void {
  store.resetBrandPresentationVisualFormulationMemory();
}

export function resetBrandPresentationVisualFormulationStoreModeCache(): void {
  store.resetBrandPresentationVisualFormulationStoreModeCache();
}

export async function getBrandPresentationVisualFormulationRun(): Promise<BrandPresentationVisualFormulationRun | null> {
  const run = await store.getBrandPresentationVisualFormulationRun();
  return run ? migrateRun(run) : null;
}

async function ensureRun(): Promise<BrandPresentationVisualFormulationRun> {
  const existing = await store.getBrandPresentationVisualFormulationRun();
  let run = initRun(existing);
  if (!existing) {
    run = await store.saveBrandPresentationVisualFormulationRun(run);
  }
  if (isParentFinalistScanPolicy(run.explorationPolicy)) {
    run = await seedParentFinalistSelection(run);
  }
  return run;
}

function getDirectionRunOrThrow(
  directionRun: Awaited<ReturnType<typeof getBrandPresentationDirectionFormationRun>>,
) {
  if (!directionRun || directionRun.directions.length === 0) {
    throw new Error('Direction formation required before visual formulation');
  }
  return directionRun;
}

function findDirection(
  directionRun: NonNullable<Awaited<ReturnType<typeof getBrandPresentationDirectionFormationRun>>>,
  directionId: string,
): BrandPresentationDirectionCandidate {
  const d = directionRun.directions.find((x) => x.directionId === directionId);
  if (!d) throw new Error('Direction not found');
  return d;
}

function findParentSnapshot(
  directionRun: NonNullable<Awaited<ReturnType<typeof getBrandPresentationDirectionFormationRun>>>,
  parentConceptId: string,
) {
  const p = directionRun.parentConceptSnapshots.find((x) => x.id === parentConceptId);
  if (!p) throw new Error('Parent concept snapshot missing');
  return p;
}

export async function seedParentFinalistSelection(
  run: BrandPresentationVisualFormulationRun,
): Promise<BrandPresentationVisualFormulationRun> {
  if (!isParentFinalistScanPolicy(run.explorationPolicy)) return run;
  if (run.parentFinalists.some((p) => p.status === 'SELECTED')) return run;

  const directionRun = await getBrandPresentationDirectionFormationRun();
  if (!directionRun || directionRun.directions.length === 0) return run;

  const policy = run.explorationPolicy;
  const parentFinalists: BrandPresentationParentVisualFinalistSelection[] = [];
  const deferredParents: BrandPresentationParentDeferredRecord[] = [];

  for (let i = 0; i < policy.selectedParentNames.length; i++) {
    const name = policy.selectedParentNames[i]!;
    const snapshot = directionRun.parentConceptSnapshots.find((s) => s.name === name);
    const group = directionRun.parentGroups.find((g) => g.parentConceptName === name);
    if (!snapshot) continue;
    parentFinalists.push({
      selectionId: randomUUID(),
      projectId: run.projectId,
      projectSlug: run.projectSlug,
      experimentId: run.runId,
      parentConceptId: snapshot.id,
      parentConceptName: name,
      parentFormationFingerprint: group?.parentSnapshot.formationFingerprint ?? null,
      selectedBy: 'founder@ndxbook',
      selectedAt: nowIso(),
      selectionOrder: (i + 1) as 1 | 2,
      status: 'SELECTED',
      version: 1,
    });
  }

  for (const name of policy.deferredParentNames) {
    const snapshot = directionRun.parentConceptSnapshots.find((s) => s.name === name);
    if (!snapshot) continue;
    deferredParents.push({
      deferredId: randomUUID(),
      projectId: run.projectId,
      projectSlug: run.projectSlug,
      parentConceptId: snapshot.id,
      parentConceptName: name,
      status: 'FOUNDER_DEFERRED_VISUALIZATION',
      salvageEligible: true,
      historicalRecordsPreserved: true,
      deferredAt: nowIso(),
      deferredBy: 'founder@ndxbook',
      reason: 'Founder deferred visual development — salvage eligible, records preserved',
    });
  }

  const gate = evaluateParentFinalistGate({
    parentFinalists,
    deferredParents,
    directions: directionRun.directions,
    policy,
  });

  const updated: BrandPresentationVisualFormulationRun = {
    ...run,
    parentFinalists,
    deferredParents,
    status: gate.ok ? 'FINALISTS_READY' : 'FINALISTS_INCOMPLETE',
    error: gate.ok ? null : run.error,
  };
  return store.saveBrandPresentationVisualFormulationRun(updated);
}

export async function setVisualFinalistSelection(params: {
  directionId: string;
  selected: boolean;
  selectedBy: string;
}): Promise<BrandPresentationVisualFormulationRun> {
  let run = await ensureRun();
  if (isParentFinalistScanPolicy(run.explorationPolicy)) {
    throw new Error(
      'DIRECTION_FINALIST_SELECTION_NOT_APPLICABLE — NDXBOOK uses parent finalist scan. Parent finalists are pre-selected.',
    );
  }

  const directionRun = getDirectionRunOrThrow(await getBrandPresentationDirectionFormationRun());
  const direction = findDirection(directionRun, params.directionId);

  let finalists = [...run.finalists];

  if (!params.selected) {
    finalists = finalists.map((f) =>
      f.directionId === params.directionId && f.status === 'SELECTED'
        ? { ...f, status: 'WITHDRAWN' as const, version: f.version + 1 }
        : f,
    );
  } else {
    const active = finalists.filter((f) => f.status === 'SELECTED');
    const already = active.find((f) => f.directionId === params.directionId);
    if (!already && isDirectionDeepDivePolicy(run.explorationPolicy) && active.length >= run.explorationPolicy.finalistCount) {
      throw new Error(
        `FINALIST_GATE_BLOCKED — ${active.length} active finalists. Withdraw one before selecting another.`,
      );
    }

    if (!already) {
      const order = (active.length + 1) as 1 | 2;
      finalists.push({
        selectionId: randomUUID(),
        projectId: run.projectId,
        projectSlug: run.projectSlug,
        experimentId: run.runId,
        directionId: direction.directionId,
        parentConceptId: direction.parentConceptId,
        parentConceptName: direction.parentConceptName,
        directionName: direction.directionName,
        directionFormationFingerprint: direction.formationFingerprint,
        founderJudgmentId: direction.founderJudgment,
        selectedBy: params.selectedBy,
        selectedAt: nowIso(),
        selectionOrder: order,
        status: 'SELECTED',
        version: 1,
      });
    }
  }

  const gate = evaluateFinalistGate({ finalists, policy: run.explorationPolicy });
  const status = gate.ok ? 'FINALISTS_READY' : activeFinalistCount(finalists) > 0 ? 'FINALISTS_INCOMPLETE' : 'NOT_STARTED';

  run = {
    ...run,
    finalists,
    status,
    visualGenerationAllowed: false,
    falGenerationAllowed: false,
    error: gate.ok ? null : run.error,
  };
  return store.saveBrandPresentationVisualFormulationRun(run);
}

function activeFinalistCount(finalists: BrandPresentationVisualFinalistSelection[]): number {
  return finalists.filter((f) => f.status === 'SELECTED').length;
}

export function buildVitestBenchmarkPayload(
  direction: BrandPresentationDirectionCandidate,
): RawDirectionBenchmarkPayload {
  const summary = DIRECTION_BENCHMARK_SUMMARIES[direction.directionName] ?? direction.directionThesis;
  return {
    benchmarkThesis: `Visual benchmark for ${direction.directionName}: ${summary}`,
    visualTranslation: `Behavioral visual translation of ${direction.brandBehavior}`,
    compositionBehavior: 'Asymmetric focal hierarchy with authored evidence bands',
    typographyBehavior: 'Display anchor with supporting micro-label system',
    imageryBehavior: 'Documentary fragments integrated into editorial flow',
    graphicBehavior: 'Rule-based dividers and index marks',
    artifactBehavior: 'Behavioral artifacts emerge from layout rules',
    informationBehavior: 'Progressive disclosure with confident compression',
    densityBehavior: 'Medium-high density with deliberate breathing room',
    rhythmBehavior: 'Alternating tension and release across the frame',
    socialNativeBehavior: 'Recognizable without platform chrome — feed-native composition',
    recognitionMechanism: direction.recognitionMechanism,
    recurrenceEvidence: direction.recurrenceBehavior,
    directionFidelityRequirements: direction.antiCollapseRules,
    antiLiteralizationRules: [
      'Do not literalize parent concept name',
      'Behavioral translation only',
    ],
    negativeDirection: [...(direction.notThis ?? []), 'generic moodboard', 'SITE 00 Projects UX'],
  };
}

function normalizeBenchmark(
  raw: RawDirectionBenchmarkPayload,
  params: {
    run: BrandPresentationVisualFormulationRun;
    direction: BrandPresentationDirectionCandidate;
    parentBenchmarkId?: string | null;
    revisionNumber?: number;
  },
): BrandPresentationDirectionVisualBenchmark {
  const benchmark: BrandPresentationDirectionVisualBenchmark = {
    benchmarkId: randomUUID(),
    projectId: params.run.projectId,
    projectSlug: params.run.projectSlug,
    experimentId: params.run.runId,
    parentConceptId: params.direction.parentConceptId,
    parentConceptName: params.direction.parentConceptName,
    directionId: params.direction.directionId,
    directionName: params.direction.directionName,
    directionFingerprint: params.direction.formationFingerprint,
    benchmarkThesis: raw.benchmarkThesis,
    visualTranslation: raw.visualTranslation,
    compositionBehavior: raw.compositionBehavior,
    typographyBehavior: raw.typographyBehavior,
    imageryBehavior: raw.imageryBehavior,
    graphicBehavior: raw.graphicBehavior,
    artifactBehavior: raw.artifactBehavior,
    informationBehavior: raw.informationBehavior,
    densityBehavior: raw.densityBehavior,
    rhythmBehavior: raw.rhythmBehavior,
    socialNativeBehavior: raw.socialNativeBehavior,
    recognitionMechanism: raw.recognitionMechanism,
    recurrenceEvidence: raw.recurrenceEvidence,
    directionFidelityRequirements: raw.directionFidelityRequirements,
    antiLiteralizationRules: raw.antiLiteralizationRules,
    negativeDirection: raw.negativeDirection,
    referencePackageId: null,
    promptFingerprint: null,
    providerReceipt: null,
    assetId: null,
    assetStoragePath: null,
    assetPublicUrl: null,
    assetFingerprint: null,
    visionEvaluation: directionBenchmarkVisionQaUnavailable(),
    founderJudgment: null,
    judgmentNote: null,
    directionDriftEval: null,
    siblingDistinctivenessEval: null,
    parentBenchmarkId: params.parentBenchmarkId ?? null,
    revisionNumber: params.revisionNumber ?? 0,
    status: 'FORMULATED',
    formationVersion: params.run.formationVersion,
    createdAt: nowIso(),
  };
  const driftEval = evaluateBenchmarkDirectionDrift({ direction: params.direction, benchmark });
  benchmark.directionDriftEval = driftEval;
  if (driftEval.result === 'DIRECTION_DRIFT') {
    benchmark.status = 'REVISION_REQUIRED';
  }
  return benchmark;
}

function compileBenchmarkReferencePackage(params: {
  directionId: string;
  benchmarkId: string;
}): BrandPresentationVisualReferencePackage {
  const excluded = [
    'SITE00_HOST_VISUAL_MEMORY',
    'PROJECTS_UX',
    'EXPERIMENT_F_VISUAL',
    'EXPERIMENT_D_VISUAL',
    'BURN_BOOK_LITERAL',
  ];
  return {
    packageId: randomUUID(),
    directionId: params.directionId,
    expressionId: null,
    benchmarkId: params.benchmarkId,
    references: [],
    excludedSources: excluded,
    referenceConditioned: false,
    strictConditioningRequired: false,
    compiledAt: nowIso(),
    fingerprint: hash(`${params.directionId}:${params.benchmarkId}:empty`),
  };
}

async function formulateBenchmarkForDirection(params: {
  run: BrandPresentationVisualFormulationRun;
  directionRun: NonNullable<Awaited<ReturnType<typeof getBrandPresentationDirectionFormationRun>>>;
  direction: BrandPresentationDirectionCandidate;
}): Promise<{
  benchmark: BrandPresentationDirectionVisualBenchmark;
  referencePackage: BrandPresentationVisualReferencePackage;
  accountingDelta: Partial<BrandPresentationVisualFormulationRun['accounting']>;
}> {
  const parent = findParentSnapshot(params.directionRun, params.direction.parentConceptId);
  let accountingDelta: Partial<BrandPresentationVisualFormulationRun['accounting']> = {};

  let raw: RawDirectionBenchmarkPayload;
  if (process.env.VITEST === 'true') {
    raw = buildVitestBenchmarkPayload(params.direction);
  } else {
    const payload = buildDirectionBenchmarkFormationPayload({ parentConcept: parent, direction: params.direction });
    const result = await callAnthropicForCompletion({
      system: DIRECTION_BENCHMARK_FORMATION_SYSTEM_PROMPT,
      user: payload,
      model: ANTHROPIC_CREATIVE_MODEL,
      maxTokens: 4096,
    });
    accountingDelta = {
      anthropicRequests: 1,
      anthropicInputTokens: result.inputTokens ?? 0,
      anthropicOutputTokens: result.outputTokens ?? 0,
      anthropicEstimatedCostUsd: result.estimatedCostUsd ?? 0.03,
    };
    const parsed = parseStructuredJson<{ benchmark: RawDirectionBenchmarkPayload }>(result.text);
    if (!parsed.benchmark) {
      throw new Error(`Benchmark formulation failed for direction ${params.direction.directionId}`);
    }
    raw = parsed.benchmark;
  }

  const benchmark = normalizeBenchmark(raw, { run: params.run, direction: params.direction });
  const refPkg = compileBenchmarkReferencePackage({
    directionId: params.direction.directionId,
    benchmarkId: benchmark.benchmarkId,
  });
  benchmark.referencePackageId = refPkg.packageId;

  return { benchmark, referencePackage: refPkg, accountingDelta };
}

export async function formulateDirectionBenchmarks(): Promise<BrandPresentationVisualFormulationRun> {
  let run = await ensureRun();
  if (!isParentFinalistScanPolicy(run.explorationPolicy)) {
    throw new Error('Use formulateVisualExpressions for DIRECTION_FINALIST_DEEP_DIVE mode');
  }

  const directionRun = getDirectionRunOrThrow(await getBrandPresentationDirectionFormationRun());
  const gate = evaluateParentFinalistGate({
    parentFinalists: run.parentFinalists,
    deferredParents: run.deferredParents,
    directions: directionRun.directions,
    policy: run.explorationPolicy,
  });
  if (!canBeginBenchmarkFormulation(gate)) {
    throw new Error(gate.reason);
  }

  run = {
    ...run,
    status: 'FORMULATING_BENCHMARKS',
    formationStartedAt: nowIso(),
    directionBenchmarks: run.directionBenchmarks.filter(
      (b) => !gate.eligibleDirections.some((d) => d.directionId === b.directionId && b.revisionNumber === 0),
    ),
    referencePackages: run.referencePackages.filter(
      (p) => !gate.eligibleDirections.some((d) => d.directionId === p.directionId),
    ),
  };

  let allBenchmarks = [...run.directionBenchmarks];
  let allRefPackages = [...run.referencePackages];
  let accounting = { ...run.accounting };

  for (const direction of gate.eligibleDirections) {
    const { benchmark, referencePackage, accountingDelta } = await formulateBenchmarkForDirection({
      run,
      directionRun,
      direction,
    });
    allBenchmarks.push(benchmark);
    allRefPackages.push(referencePackage);
    accounting = {
      ...accounting,
      anthropicRequests: accounting.anthropicRequests + (accountingDelta.anthropicRequests ?? 0),
      anthropicInputTokens: accounting.anthropicInputTokens + (accountingDelta.anthropicInputTokens ?? 0),
      anthropicOutputTokens: accounting.anthropicOutputTokens + (accountingDelta.anthropicOutputTokens ?? 0),
      anthropicEstimatedCostUsd:
        accounting.anthropicEstimatedCostUsd + (accountingDelta.anthropicEstimatedCostUsd ?? 0),
    };
  }

  const roomName = 'THE ROOM THAT KNOWS';
  const noticingName = 'THE THING THAT KEEPS NOTICING';
  const roomBenchmarks = allBenchmarks.filter(
    (b) => b.revisionNumber === 0 && b.parentConceptName === roomName,
  );
  const noticingBenchmarks = allBenchmarks.filter(
    (b) => b.revisionNumber === 0 && b.parentConceptName === noticingName,
  );

  const roomEval = evaluateSiblingBenchmarkDistinctiveness(roomBenchmarks);
  const noticingEval = evaluateSiblingBenchmarkDistinctiveness(noticingBenchmarks);

  allBenchmarks = allBenchmarks.map((b) => {
    if (b.revisionNumber !== 0) return b;
    const siblingEval =
      b.parentConceptName === roomName ? roomEval : b.parentConceptName === noticingName ? noticingEval : null;
    return siblingEval ? { ...b, siblingDistinctivenessEval: siblingEval } : b;
  });

  run = {
    ...run,
    directionBenchmarks: allBenchmarks,
    referencePackages: allRefPackages,
    siblingCollapseEval: {
      room: roomEval,
      noticing: noticingEval,
    },
    status: 'BENCHMARKS_READY',
    visualGenerationAllowed: true,
    falGenerationAllowed: false,
    accounting,
    formationStartedAt: null,
    error: null,
  };
  return store.saveBrandPresentationVisualFormulationRun(run);
}

export function buildVitestExpressionPayload(
  direction: BrandPresentationDirectionCandidate,
  label: 'A' | 'B' | 'C',
): RawExpressionPayload {
  const idx = label === 'A' ? 1 : label === 'B' ? 2 : 3;
  return {
    expressionLabel: label,
    expressionName: `${direction.directionName} Expression ${label}`,
    expressionThesis: `Visual system ${label} for ${direction.directionName} — ${idx === 1 ? 'layered editorial rhythm' : idx === 2 ? 'dense information choreography' : 'sparse recurrence-forward surface'}`,
    directionInterpretation: direction.directionInterpretation,
    visualBehavior: direction.brandBehavior,
    compositionBehavior:
      idx === 1
        ? 'Asymmetric focal column with staggered evidence bands'
        : idx === 2
          ? 'Grid-adjacent modules with interrupting judgment inserts'
          : 'Single dominant artifact with peripheral recurrence markers',
    typographyBehavior:
      idx === 1
        ? 'Display headline anchors with supporting micro-label system'
        : idx === 2
          ? 'Typographic density as primary hierarchy engine'
          : 'Minimal type participation — image-led recognition',
    imageryBehavior:
      idx === 1
        ? 'Documentary fragments integrated into editorial flow'
        : idx === 2
          ? 'Composite evidence collage with consistent crop grammar'
          : 'Isolated hero material with recurring motif echo',
    graphicLanguage:
      idx === 1 ? 'Rule-based dividers and index marks' : idx === 2 ? 'Systematic annotation layer' : 'Single signature mark repeated',
    artifactLanguage:
      idx === 1 ? 'Behavioral artifacts emerge from layout rules' : idx === 2 ? 'Stacked proof objects' : 'One persistent artifact shape',
    informationBehavior:
      idx === 1 ? 'Progressive disclosure down-scroll' : idx === 2 ? 'Parallel scan lanes' : 'Single focal revelation',
    densityBehavior: idx === 1 ? 'Medium density' : idx === 2 ? 'High density' : 'Low density',
    rhythmBehavior: idx === 1 ? 'Alternating tension/release' : idx === 2 ? 'Staccato punctuated beats' : 'Slow sustained pulse',
    recurrenceBehavior: direction.recurrenceBehavior,
    socialSurfaceBehavior: 'Recognizable without platform chrome — feed-native composition logic',
    motionPotential: 'Subtle layer transitions implied in static frame',
    materialPotential: 'Paper-like depth without literal notebook',
    recognitionMechanism: direction.recognitionMechanism,
    variationLogic: 'Same behavioral rules, different visual density postures',
    brandFidelity: 'NDXBOOK peer intimacy with institutional clarity',
    directionFidelity: 'Locked to parent direction behavior',
    visualDistinctiveness: `Expression ${label} explores distinct composition/typography axis`,
    antiCollapseRules: direction.antiCollapseRules,
    notThis: [...direction.notThis, 'generic moodboard', 'SITE 00 Projects UX'],
  };
}

function normalizeExpression(
  raw: RawExpressionPayload,
  params: {
    run: BrandPresentationVisualFormulationRun;
    direction: BrandPresentationDirectionCandidate;
    expressionIndex: 1 | 2 | 3;
    parentExpressionId?: string | null;
    revisionNumber?: number;
  },
): BrandPresentationVisualExpressionCandidate {
  const expr: BrandPresentationVisualExpressionCandidate = {
    expressionId: randomUUID(),
    projectId: params.run.projectId,
    projectSlug: params.run.projectSlug,
    parentConceptId: params.direction.parentConceptId,
    parentConceptName: params.direction.parentConceptName,
    parentDirectionId: params.direction.directionId,
    parentDirectionName: params.direction.directionName,
    expressionIndex: params.expressionIndex,
    expressionLabel: raw.expressionLabel,
    expressionName: raw.expressionName,
    expressionThesis: raw.expressionThesis,
    directionInterpretation: raw.directionInterpretation,
    visualBehavior: raw.visualBehavior,
    compositionBehavior: raw.compositionBehavior,
    typographyBehavior: raw.typographyBehavior,
    imageryBehavior: raw.imageryBehavior,
    graphicLanguage: raw.graphicLanguage,
    artifactLanguage: raw.artifactLanguage,
    informationBehavior: raw.informationBehavior,
    densityBehavior: raw.densityBehavior,
    rhythmBehavior: raw.rhythmBehavior,
    recurrenceBehavior: raw.recurrenceBehavior,
    socialSurfaceBehavior: raw.socialSurfaceBehavior,
    motionPotential: raw.motionPotential,
    materialPotential: raw.materialPotential,
    recognitionMechanism: raw.recognitionMechanism,
    variationLogic: raw.variationLogic,
    brandFidelity: raw.brandFidelity,
    directionFidelity: raw.directionFidelity,
    visualDistinctiveness: raw.visualDistinctiveness,
    antiCollapseRules: raw.antiCollapseRules,
    notThis: raw.notThis,
    referencePackageId: null,
    promptFingerprint: null,
    generationReceipt: null,
    assetId: null,
    assetStoragePath: null,
    assetPublicUrl: null,
    assetFingerprint: null,
    founderJudgment: null,
    judgmentNote: null,
    directionDriftEval: null,
    siblingDistinctivenessEval: null,
    visionEval: visionQaUnavailable(),
    parentExpressionId: params.parentExpressionId ?? null,
    revisionNumber: params.revisionNumber ?? 0,
    status: 'FORMULATED',
    formationVersion: params.run.formationVersion,
    createdAt: nowIso(),
  };
  const driftEval = evaluateExpressionDirectionDrift({ direction: params.direction, expression: expr });
  expr.directionDriftEval = driftEval;
  if (driftEval.result === 'DIRECTION_DRIFT') {
    expr.status = 'REVISION_REQUIRED';
  }
  return expr;
}

function compileReferencePackage(params: {
  directionId: string;
  expressionId: string;
}): BrandPresentationVisualReferencePackage {
  const excluded = [
    'SITE00_HOST_VISUAL_MEMORY',
    'PROJECTS_UX',
    'EXPERIMENT_F_VISUAL',
    'BURN_BOOK_LITERAL',
  ];
  return {
    packageId: randomUUID(),
    directionId: params.directionId,
    expressionId: params.expressionId,
    benchmarkId: null,
    references: [],
    excludedSources: excluded,
    referenceConditioned: false,
    strictConditioningRequired: false,
    compiledAt: nowIso(),
    fingerprint: hash(`${params.directionId}:${params.expressionId}:empty`),
  };
}

async function formulateExpressionsForFinalist(params: {
  run: BrandPresentationVisualFormulationRun;
  directionRun: NonNullable<Awaited<ReturnType<typeof getBrandPresentationDirectionFormationRun>>>;
  finalist: BrandPresentationVisualFinalistSelection;
}): Promise<{
  expressions: BrandPresentationVisualExpressionCandidate[];
  referencePackages: BrandPresentationVisualReferencePackage[];
  accountingDelta: Partial<BrandPresentationVisualFormulationRun['accounting']>;
}> {
  const direction = findDirection(params.directionRun, params.finalist.directionId);
  const parent = findParentSnapshot(params.directionRun, direction.parentConceptId);
  const expressions: BrandPresentationVisualExpressionCandidate[] = [];
  const referencePackages: BrandPresentationVisualReferencePackage[] = [];
  let accountingDelta: Partial<BrandPresentationVisualFormulationRun['accounting']> = {};

  if (process.env.VITEST === 'true') {
    for (let i = 0; i < 3; i++) {
      const label = EXPRESSION_LABELS[i]!;
      const raw = buildVitestExpressionPayload(direction, label);
      const expr = normalizeExpression(raw, {
        run: params.run,
        direction,
        expressionIndex: (i + 1) as 1 | 2 | 3,
      });
      const refPkg = compileReferencePackage({ directionId: direction.directionId, expressionId: expr.expressionId });
      expr.referencePackageId = refPkg.packageId;
      referencePackages.push(refPkg);
      expressions.push(expr);
    }
  } else {
    const payload = buildExpressionFormationPayload({ parentConcept: parent, direction });
    const result = await callAnthropicForCompletion({
      system: EXPRESSION_FORMATION_SYSTEM_PROMPT,
      user: payload,
      model: ANTHROPIC_CREATIVE_MODEL,
      maxTokens: 8192,
    });
    accountingDelta = {
      anthropicRequests: 1,
      anthropicInputTokens: result.inputTokens ?? 0,
      anthropicOutputTokens: result.outputTokens ?? 0,
      anthropicEstimatedCostUsd: result.estimatedCostUsd ?? 0.05,
    };
    const parsed = parseStructuredJson<{ expressions: RawExpressionPayload[] }>(result.text);
    if (!parsed.expressions || parsed.expressions.length !== 3) {
      throw new Error('Expression formulation must return exactly 3 expressions');
    }
    for (let i = 0; i < 3; i++) {
      const raw = parsed.expressions[i]!;
      const expr = normalizeExpression(raw, {
        run: params.run,
        direction,
        expressionIndex: (i + 1) as 1 | 2 | 3,
      });
      const refPkg = compileReferencePackage({ directionId: direction.directionId, expressionId: expr.expressionId });
      expr.referencePackageId = refPkg.packageId;
      referencePackages.push(refPkg);
      expressions.push(expr);
    }
  }

  const distinctiveness = evaluateWithinFinalistDistinctiveness(expressions);
  for (const expr of expressions) {
    expr.siblingDistinctivenessEval = distinctiveness;
  }

  return { expressions, referencePackages, accountingDelta };
}

async function formulateVisualExpressionsDeepDive(): Promise<BrandPresentationVisualFormulationRun> {
  let run = await ensureRun();
  const directionRun = getDirectionRunOrThrow(await getBrandPresentationDirectionFormationRun());
  const gate = evaluateFinalistGate({ finalists: run.finalists, policy: run.explorationPolicy });
  if (!gate.ok) {
    throw new Error(gate.reason);
  }

  run = {
    ...run,
    status: 'FORMULATING_EXPRESSIONS',
    formationStartedAt: nowIso(),
    expressions: run.expressions.filter(
      (e) => !gate.activeFinalists.some((f) => f.directionId === e.parentDirectionId),
    ),
    referencePackages: run.referencePackages.filter(
      (p) => !gate.activeFinalists.some((f) => f.directionId === p.directionId),
    ),
  };

  let allExpressions = [...run.expressions];
  let allRefPackages = [...run.referencePackages];
  let accounting = { ...run.accounting };

  for (const finalist of gate.activeFinalists) {
    const { expressions, referencePackages, accountingDelta } = await formulateExpressionsForFinalist({
      run,
      directionRun,
      finalist,
    });
    allExpressions = [...allExpressions, ...expressions];
    allRefPackages = [...allRefPackages, ...referencePackages];
    accounting = {
      ...accounting,
      anthropicRequests: accounting.anthropicRequests + (accountingDelta.anthropicRequests ?? 0),
      anthropicInputTokens: accounting.anthropicInputTokens + (accountingDelta.anthropicInputTokens ?? 0),
      anthropicOutputTokens: accounting.anthropicOutputTokens + (accountingDelta.anthropicOutputTokens ?? 0),
      anthropicEstimatedCostUsd:
        accounting.anthropicEstimatedCostUsd + (accountingDelta.anthropicEstimatedCostUsd ?? 0),
    };
  }

  const f1 = gate.activeFinalists[0]!;
  const f2 = gate.activeFinalists[1]!;
  const crossEval = evaluateCrossFinalistCollapse({
    finalist1Expressions: allExpressions.filter((e) => e.parentDirectionId === f1.directionId),
    finalist2Expressions: allExpressions.filter((e) => e.parentDirectionId === f2.directionId),
  });

  run = {
    ...run,
    expressions: allExpressions,
    referencePackages: allRefPackages,
    crossFinalistCollapseEval: crossEval,
    status: 'EXPRESSIONS_READY',
    visualGenerationAllowed: true,
    falGenerationAllowed: false,
    accounting,
    formationStartedAt: null,
    error: null,
  };
  return store.saveBrandPresentationVisualFormulationRun(run);
}

export async function formulateVisualExpressions(): Promise<BrandPresentationVisualFormulationRun> {
  const run = await ensureRun();
  if (isParentFinalistScanPolicy(run.explorationPolicy)) {
    return formulateDirectionBenchmarks();
  }
  return formulateVisualExpressionsDeepDive();
}

async function runFalGeneration(params: {
  prompt: string;
  negativePrompt: string;
  promptFingerprint: string;
  storagePath: string;
  entityId: string;
  referenceConditioned: boolean;
  referenceUrls?: string[];
}): Promise<{
  ok: true;
  storagePath: string;
  publicUrl: string;
  requestId: string | null;
  costUsd: number;
  provider: string;
  model: string;
} | { ok: false; error: string }> {
  if (process.env.VITEST === 'true') {
    return {
      ok: true,
      storagePath: params.storagePath,
      publicUrl: `https://vitest.local/${params.storagePath}`,
      requestId: `vitest-${params.entityId}`,
      costUsd: 0,
      provider: 'vitest-mock',
      model: 'vitest-mock',
    };
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) {
    return { ok: false, error: 'FAL_KEY not configured on server' };
  }

  if (params.referenceConditioned) {
    const profile = getCurrentExperienceProviderCapability();
    const support = assertReferenceConditioningSupported({
      providerId: profile.providerId,
      modelId: profile.modelId,
      referenceCount: params.referenceUrls?.length ?? 0,
      strictHostRequired: false,
    });
    if (!support.ok) {
      return { ok: false, error: support.error };
    }
    if ((params.referenceUrls?.length ?? 0) === 0) {
      return { ok: false, error: 'REFERENCE_CONDITIONED generation required but no references available — BLOCKED' };
    }
  }

  if (await site00StorageObjectExists(params.storagePath)) {
    return {
      ok: true,
      storagePath: params.storagePath,
      publicUrl: getSite00AssetPublicUrl(params.storagePath),
      requestId: null,
      costUsd: 0,
      provider: 'storage-reuse',
      model: 'existing-object',
    };
  }

  try {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });
    const fullPrompt = `${params.prompt}\n\nAvoid: ${params.negativePrompt}`;
    const { model, input } = buildFalImageInput({
      prompt: fullPrompt,
      aspectRatio: '16:9',
      outputFormat: 'webp',
      referenceImageUrls: params.referenceUrls?.filter(Boolean),
    });
    const result = (await fal.subscribe(model, { input: input as never, logs: false })) as {
      request_id?: string;
      data?: { images?: Array<{ url?: string }> };
    };
    const imageUrl = result?.data?.images?.[0]?.url;
    if (!imageUrl) return { ok: false, error: 'FAL returned no image URL' };
    const buffer = await downloadUrlToBuffer(imageUrl);
    const upload = await uploadSite00AssetBuffer(params.storagePath, buffer, 'image/webp', { upsert: true });
    return {
      ok: true,
      storagePath: upload.storagePath,
      publicUrl: upload.publicUrl,
      requestId: result.request_id ?? null,
      costUsd: FAL_COST_ESTIMATE_USD,
      provider: EXPERIENCE_FAL_PROVIDER,
      model,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'FAL generation failed' };
  }
}

export function estimateVisualGenerationCost(run: BrandPresentationVisualFormulationRun): {
  mode: string;
  parentFinalists?: number;
  directionsPerParent?: number;
  benchmarksPerDirection?: number;
  finalists?: number;
  expressionsPerFinalist?: number;
  totalVisuals: number;
  falRequestsExpected: number;
  anthropicRequestsExpected?: number;
  estimatedCostUsd: number;
  referenceConditionedPerVisual: boolean[];
} {
  if (isParentFinalistScanPolicy(run.explorationPolicy)) {
    const policy = run.explorationPolicy;
    const benchmarks = run.directionBenchmarks.filter((b) => b.status !== 'SUPERSEDED' && b.revisionNumber === 0);
    const referenceConditionedPerVisual = benchmarks.map((b) => {
      const pkg = run.referencePackages.find((p) => p.packageId === b.referencePackageId);
      return Boolean(pkg?.referenceConditioned);
    });
    return {
      mode: policy.mode,
      parentFinalists: policy.parentFinalistCount,
      directionsPerParent: policy.directionsPerParent,
      benchmarksPerDirection: policy.benchmarksPerDirection,
      totalVisuals: policy.totalInitialVisuals,
      falRequestsExpected: policy.totalInitialVisuals,
      anthropicRequestsExpected: policy.totalInitialVisuals,
      estimatedCostUsd: policy.totalInitialVisuals * FAL_COST_ESTIMATE_USD,
      referenceConditionedPerVisual,
    };
  }

  const gate = evaluateFinalistGate({ finalists: run.finalists, policy: run.explorationPolicy });
  const policy = isDirectionDeepDivePolicy(run.explorationPolicy)
    ? run.explorationPolicy
    : NDXBOOK_DIRECTION_DEEP_DIVE_POLICY;
  const totalVisuals = gate.ok
    ? gate.activeFinalists.length * policy.expressionsPerFinalist
    : policy.totalInitialVisuals;
  const expressions = run.expressions.filter((e) => e.status !== 'SUPERSEDED');
  const referenceConditionedPerVisual = expressions.map((e) => {
    const pkg = run.referencePackages.find((p) => p.packageId === e.referencePackageId);
    return Boolean(pkg?.referenceConditioned);
  });
  return {
    mode: policy.mode,
    finalists: gate.ok ? gate.activeFinalists.length : policy.finalistCount,
    expressionsPerFinalist: policy.expressionsPerFinalist,
    totalVisuals,
    falRequestsExpected: totalVisuals,
    estimatedCostUsd: totalVisuals * FAL_COST_ESTIMATE_USD,
    referenceConditionedPerVisual,
  };
}

export async function generateDirectionBenchmarkVisuals(): Promise<BrandPresentationVisualFormulationRun> {
  let run = await ensureRun();
  if (!isParentFinalistScanPolicy(run.explorationPolicy)) {
    throw new Error('Use generateFinalistVisuals for DIRECTION_FINALIST_DEEP_DIVE mode');
  }

  const directionRun = getDirectionRunOrThrow(await getBrandPresentationDirectionFormationRun());
  const gate = evaluateParentFinalistGate({
    parentFinalists: run.parentFinalists,
    deferredParents: run.deferredParents,
    directions: directionRun.directions,
    policy: run.explorationPolicy,
  });
  const genGate = canBeginBenchmarkGeneration({
    gate,
    benchmarks: run.directionBenchmarks,
    policy: run.explorationPolicy,
  });
  if (!genGate.ok) {
    throw new Error(genGate.reason);
  }

  run = {
    ...run,
    status: 'GENERATING_VISUALS',
    generationStartedAt: nowIso(),
    falGenerationAllowed: true,
  };
  await store.saveBrandPresentationVisualFormulationRun(run);

  const benchmarksToGenerate = run.directionBenchmarks.filter(
    (b) =>
      b.status === 'FORMULATED' &&
      b.revisionNumber === 0 &&
      gate.eligibleDirections.some((d) => d.directionId === b.directionId) &&
      !b.assetStoragePath,
  );

  if (benchmarksToGenerate.length !== run.explorationPolicy.totalInitialVisuals) {
    throw new Error(
      `Expected ${run.explorationPolicy.totalInitialVisuals} direction benchmarks before generation, got ${benchmarksToGenerate.length}`,
    );
  }

  let accounting = { ...run.accounting };
  const updatedBenchmarks = [...run.directionBenchmarks];

  const generationTasks = benchmarksToGenerate.map(async (benchmark) => {
    const direction = findDirection(directionRun, benchmark.directionId);
    const parent = findParentSnapshot(directionRun, direction.parentConceptId);
    const refPkg = run.referencePackages.find((p) => p.packageId === benchmark.referencePackageId) ?? null;

    for (const ref of refPkg?.references ?? []) {
      const exclusion = evaluateReferenceExclusions(ref.sourceLabel);
      if (!exclusion.allowed) {
        throw new Error(exclusion.reason ?? 'Reference excluded');
      }
    }

    const compiled = compileDirectionBenchmarkPrompt({
      parentConcept: parent,
      direction,
      benchmark,
      referencePackage: refPkg,
      antiDirectionEvidence: direction.notThis,
      parentMetaphorGuards: PARENT_CONCEPT_METAPHOR_GUARDS[parent.name],
      socialPresentationRequirements: [
        'Show recognizable NDXBOOK presentation behavior on a social-native surface',
        'Demonstrate hierarchy, recurrence, and information behavior in action',
        'This is direction visualization — not finished canon or production post',
      ],
    });

    const slug = direction.directionName.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 40);
    const storagePath = `site00/brand-presentation-visual/${run.runId}/${slug}-benchmark.webp`;
    const falResult = await runFalGeneration({
      prompt: compiled.prompt,
      negativePrompt: compiled.negativePrompt,
      promptFingerprint: compiled.promptFingerprint,
      storagePath,
      entityId: benchmark.benchmarkId,
      referenceConditioned: Boolean(refPkg?.referenceConditioned),
      referenceUrls: refPkg?.references.map((r) => r.publicUrl).filter((u): u is string => Boolean(u)),
    });

    if (!falResult.ok) {
      throw new Error(falResult.error);
    }

    return {
      benchmarkId: benchmark.benchmarkId,
      promptFingerprint: compiled.promptFingerprint,
      assetId: randomUUID(),
      assetStoragePath: falResult.storagePath,
      assetPublicUrl: falResult.publicUrl,
      assetFingerprint: hash(compiled.promptFingerprint + falResult.storagePath),
      providerReceipt: {
        provider: falResult.provider,
        model: falResult.model,
        requestId: falResult.requestId,
        costUsd: falResult.costUsd,
        promptFingerprint: compiled.promptFingerprint,
        createdAt: nowIso(),
      },
      costUsd: falResult.costUsd,
    };
  });

  const results = await Promise.all(generationTasks);

  for (const result of results) {
    const idx = updatedBenchmarks.findIndex((b) => b.benchmarkId === result.benchmarkId);
    if (idx >= 0) {
      updatedBenchmarks[idx] = {
        ...updatedBenchmarks[idx]!,
        promptFingerprint: result.promptFingerprint,
        assetId: result.assetId,
        assetStoragePath: result.assetStoragePath,
        assetPublicUrl: result.assetPublicUrl,
        assetFingerprint: result.assetFingerprint,
        providerReceipt: result.providerReceipt,
        status: 'GENERATED',
      };
      accounting = {
        ...accounting,
        falRequests: accounting.falRequests + 1,
        visualGenerationCostUsd: accounting.visualGenerationCostUsd + result.costUsd,
        hiddenVariantRequests: 0,
      };
    }
  }

  run = {
    ...run,
    directionBenchmarks: updatedBenchmarks,
    status: 'VISUALS_READY',
    visualGenerationAllowed: true,
    falGenerationAllowed: true,
    accounting,
    generationStartedAt: null,
    completedAt: nowIso(),
    error: null,
  };
  return store.saveBrandPresentationVisualFormulationRun(run);
}

async function generateFinalistVisualsDeepDive(): Promise<BrandPresentationVisualFormulationRun> {
  let run = await ensureRun();
  const directionRun = getDirectionRunOrThrow(await getBrandPresentationDirectionFormationRun());
  const gate = evaluateFinalistGate({ finalists: run.finalists, policy: run.explorationPolicy });
  const genGate = canBeginVisualGeneration({ gate, expressions: run.expressions, policy: run.explorationPolicy });
  if (!genGate.ok) {
    throw new Error(genGate.reason);
  }

  run = {
    ...run,
    status: 'GENERATING_VISUALS',
    generationStartedAt: nowIso(),
    falGenerationAllowed: true,
  };
  await store.saveBrandPresentationVisualFormulationRun(run);

  const expressionsToGenerate = run.expressions.filter(
    (e) =>
      e.status === 'FORMULATED' &&
      gate.activeFinalists.some((f) => f.directionId === e.parentDirectionId) &&
      !e.assetStoragePath,
  );

  if (!isDirectionDeepDivePolicy(run.explorationPolicy)) {
    throw new Error('Deep dive policy required');
  }
  if (expressionsToGenerate.length !== run.explorationPolicy.totalInitialVisuals) {
    throw new Error(
      `Expected ${run.explorationPolicy.totalInitialVisuals} sibling expressions before generation, got ${expressionsToGenerate.length}`,
    );
  }

  let accounting = { ...run.accounting };
  const updatedExpressions = [...run.expressions];

  const generationTasks = expressionsToGenerate.map(async (expr) => {
    const direction = findDirection(directionRun, expr.parentDirectionId);
    const parent = findParentSnapshot(directionRun, direction.parentConceptId);
    const refPkg = run.referencePackages.find((p) => p.packageId === expr.referencePackageId) ?? null;

    for (const ref of refPkg?.references ?? []) {
      const exclusion = evaluateReferenceExclusions(ref.sourceLabel);
      if (!exclusion.allowed) {
        throw new Error(exclusion.reason ?? 'Reference excluded');
      }
    }

    const compiled = compileBrandPresentationVisualPrompt({
      parentConcept: parent,
      direction,
      expression: expr,
      referencePackage: refPkg,
      antiDirectionEvidence: direction.notThis,
      socialPresentationRequirements: [
        'Show recognizable NDXBOOK presentation behavior on a social-native surface',
        'Demonstrate hierarchy, recurrence, and information behavior in action',
      ],
    });

    const storagePath = `site00/brand-presentation-visual/${run.runId}/${expr.parentDirectionId}-expr-${expr.expressionLabel}.webp`;
    const falResult = await runFalGeneration({
      prompt: compiled.prompt,
      negativePrompt: compiled.negativePrompt,
      promptFingerprint: compiled.promptFingerprint,
      storagePath,
      entityId: expr.expressionId,
      referenceConditioned: Boolean(refPkg?.referenceConditioned),
      referenceUrls: refPkg?.references.map((r) => r.publicUrl).filter((u): u is string => Boolean(u)),
    });

    if (!falResult.ok) {
      throw new Error(falResult.error);
    }

    return {
      expressionId: expr.expressionId,
      promptFingerprint: compiled.promptFingerprint,
      assetId: randomUUID(),
      assetStoragePath: falResult.storagePath,
      assetPublicUrl: falResult.publicUrl,
      assetFingerprint: hash(compiled.promptFingerprint + falResult.storagePath),
      generationReceipt: {
        provider: falResult.provider,
        model: falResult.model,
        requestId: falResult.requestId,
        costUsd: falResult.costUsd,
        promptFingerprint: compiled.promptFingerprint,
        createdAt: nowIso(),
      },
      costUsd: falResult.costUsd,
    };
  });

  const results = await Promise.all(generationTasks);

  for (const result of results) {
    const idx = updatedExpressions.findIndex((e) => e.expressionId === result.expressionId);
    if (idx >= 0) {
      updatedExpressions[idx] = {
        ...updatedExpressions[idx]!,
        promptFingerprint: result.promptFingerprint,
        assetId: result.assetId,
        assetStoragePath: result.assetStoragePath,
        assetPublicUrl: result.assetPublicUrl,
        assetFingerprint: result.assetFingerprint,
        generationReceipt: result.generationReceipt,
        status: 'GENERATED',
      };
      accounting = {
        ...accounting,
        falRequests: accounting.falRequests + 1,
        visualGenerationCostUsd: accounting.visualGenerationCostUsd + result.costUsd,
        hiddenVariantRequests: 0,
      };
    }
  }

  run = {
    ...run,
    expressions: updatedExpressions,
    status: 'VISUALS_READY',
    visualGenerationAllowed: true,
    falGenerationAllowed: true,
    accounting,
    generationStartedAt: null,
    completedAt: nowIso(),
    error: null,
  };
  return store.saveBrandPresentationVisualFormulationRun(run);
}

export async function generateFinalistVisuals(): Promise<BrandPresentationVisualFormulationRun> {
  const run = await ensureRun();
  if (isParentFinalistScanPolicy(run.explorationPolicy)) {
    return generateDirectionBenchmarkVisuals();
  }
  return generateFinalistVisualsDeepDive();
}

export async function setDirectionBenchmarkJudgment(params: {
  benchmarkId: string;
  judgment: BrandPresentationDirectionVisualBenchmark['founderJudgment'];
  note?: string | null;
}): Promise<BrandPresentationVisualFormulationRun> {
  const run = await ensureRun();
  const directionBenchmarks = run.directionBenchmarks.map((b) =>
    b.benchmarkId === params.benchmarkId
      ? { ...b, founderJudgment: params.judgment, judgmentNote: params.note ?? null }
      : b,
  );
  const updated: BrandPresentationVisualFormulationRun = {
    ...run,
    directionBenchmarks,
    status: run.status === 'VISUALS_READY' || run.status === 'FOUNDER_REVIEW' ? 'FOUNDER_REVIEW' : run.status,
  };
  return store.saveBrandPresentationVisualFormulationRun(updated);
}

export async function setVisualExpressionJudgment(params: {
  expressionId: string;
  judgment: BrandPresentationVisualExpressionCandidate['founderJudgment'];
  note?: string | null;
}): Promise<BrandPresentationVisualFormulationRun> {
  const run = await ensureRun();
  const expressions = run.expressions.map((e) =>
    e.expressionId === params.expressionId
      ? { ...e, founderJudgment: params.judgment, judgmentNote: params.note ?? null }
      : e,
  );
  const updated: BrandPresentationVisualFormulationRun = {
    ...run,
    expressions,
    status: run.status === 'VISUALS_READY' || run.status === 'FOUNDER_REVIEW' ? 'FOUNDER_REVIEW' : run.status,
  };
  return store.saveBrandPresentationVisualFormulationRun(updated);
}

export async function reviseDirectionBenchmark(params: {
  benchmarkId: string;
  preserve: string[];
  change: string[];
  doNotBecome: string[];
}): Promise<BrandPresentationVisualFormulationRun> {
  const run = await ensureRun();
  const directionRun = getDirectionRunOrThrow(await getBrandPresentationDirectionFormationRun());
  const parentBenchmark = run.directionBenchmarks.find((b) => b.benchmarkId === params.benchmarkId);
  if (!parentBenchmark) throw new Error('Benchmark not found');
  if (parentBenchmark.founderJudgment !== 'PROMISING_REVISE') {
    throw new Error('Revision requires PROMISING — REVISE judgment');
  }

  const direction = findDirection(directionRun, parentBenchmark.directionId);
  const parentSnapshot = findParentSnapshot(directionRun, direction.parentConceptId);
  const refPkg = run.referencePackages.find((p) => p.packageId === parentBenchmark.referencePackageId) ?? null;

  const basePrompt = compileDirectionBenchmarkPrompt({
    parentConcept: parentSnapshot,
    direction,
    benchmark: parentBenchmark,
    referencePackage: refPkg,
    antiDirectionEvidence: direction.notThis,
    parentMetaphorGuards: PARENT_CONCEPT_METAPHOR_GUARDS[parentSnapshot.name],
    socialPresentationRequirements: ['Revision — surgical change only'],
  });

  const revisionPrompt = compileBenchmarkRevisionPrompt({
    base: basePrompt,
    delta: { preserve: params.preserve, change: params.change, doNotBecome: params.doNotBecome },
  });

  const raw = buildVitestBenchmarkPayload(direction);
  raw.benchmarkThesis = `${raw.benchmarkThesis} (revision ${parentBenchmark.revisionNumber + 1})`;
  for (const c of params.change) {
    raw.compositionBehavior += ` — ${c}`;
  }

  const childBenchmark = normalizeBenchmark(raw, {
    run,
    direction,
    parentBenchmarkId: parentBenchmark.benchmarkId,
    revisionNumber: parentBenchmark.revisionNumber + 1,
  });
  childBenchmark.referencePackageId = parentBenchmark.referencePackageId;

  const slug = direction.directionName.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 40);
  const storagePath = `site00/brand-presentation-visual/${run.runId}/${slug}-benchmark-rev-${childBenchmark.revisionNumber}.webp`;
  const falResult = await runFalGeneration({
    prompt: revisionPrompt.prompt,
    negativePrompt: revisionPrompt.negativePrompt,
    promptFingerprint: revisionPrompt.promptFingerprint,
    storagePath,
    entityId: childBenchmark.benchmarkId,
    referenceConditioned: Boolean(refPkg?.referenceConditioned),
  });

  if (!falResult.ok) throw new Error(falResult.error);

  childBenchmark.promptFingerprint = revisionPrompt.promptFingerprint;
  childBenchmark.assetId = randomUUID();
  childBenchmark.assetStoragePath = falResult.storagePath;
  childBenchmark.assetPublicUrl = falResult.publicUrl;
  childBenchmark.assetFingerprint = hash(revisionPrompt.promptFingerprint);
  childBenchmark.providerReceipt = {
    provider: falResult.provider,
    model: falResult.model,
    requestId: falResult.requestId,
    costUsd: falResult.costUsd,
    revision: true,
    parentBenchmarkId: parentBenchmark.benchmarkId,
    parentAssetId: parentBenchmark.assetId,
  };
  childBenchmark.status = 'GENERATED';

  const revisionDelta: DirectionBenchmarkRevisionDelta = {
    revisionId: randomUUID(),
    parentBenchmarkId: parentBenchmark.benchmarkId,
    parentAssetId: parentBenchmark.assetId,
    childBenchmarkId: childBenchmark.benchmarkId,
    revisionNumber: childBenchmark.revisionNumber,
    preserve: params.preserve,
    change: params.change,
    doNotBecome: params.doNotBecome,
    revisionPromptFingerprint: revisionPrompt.promptFingerprint,
    createdAt: nowIso(),
  };

  const updated: BrandPresentationVisualFormulationRun = {
    ...run,
    directionBenchmarks: [...run.directionBenchmarks, childBenchmark],
    benchmarkRevisions: [...run.benchmarkRevisions, revisionDelta],
    accounting: {
      ...run.accounting,
      falRequests: run.accounting.falRequests + 1,
      visualGenerationCostUsd: run.accounting.visualGenerationCostUsd + falResult.costUsd,
    },
  };
  return store.saveBrandPresentationVisualFormulationRun(updated);
}

export async function reviseVisualExpression(params: {
  expressionId: string;
  preserve: string[];
  change: string[];
  doNotBecome: string[];
}): Promise<BrandPresentationVisualFormulationRun> {
  const run = await ensureRun();
  const directionRun = getDirectionRunOrThrow(await getBrandPresentationDirectionFormationRun());
  const parentExpr = run.expressions.find((e) => e.expressionId === params.expressionId);
  if (!parentExpr) throw new Error('Expression not found');
  if (parentExpr.founderJudgment !== 'PROMISING_REVISE') {
    throw new Error('Revision requires PROMISING — REVISE judgment');
  }

  const direction = findDirection(directionRun, parentExpr.parentDirectionId);
  const parentSnapshot = findParentSnapshot(directionRun, direction.parentConceptId);
  const refPkg = run.referencePackages.find((p) => p.packageId === parentExpr.referencePackageId) ?? null;

  const basePrompt = compileBrandPresentationVisualPrompt({
    parentConcept: parentSnapshot,
    direction,
    expression: parentExpr,
    referencePackage: refPkg,
    antiDirectionEvidence: direction.notThis,
    socialPresentationRequirements: ['Revision — surgical change only'],
  });

  const revisionPrompt = compileRevisionPrompt({
    base: basePrompt,
    delta: { preserve: params.preserve, change: params.change, doNotBecome: params.doNotBecome },
  });

  const raw = buildVitestExpressionPayload(direction, parentExpr.expressionLabel);
  raw.expressionThesis = `${raw.expressionThesis} (revision ${parentExpr.revisionNumber + 1})`;
  for (const c of params.change) {
    raw.compositionBehavior += ` — ${c}`;
  }

  const childExpr = normalizeExpression(raw, {
    run,
    direction,
    expressionIndex: parentExpr.expressionIndex,
    parentExpressionId: parentExpr.expressionId,
    revisionNumber: parentExpr.revisionNumber + 1,
  });
  childExpr.referencePackageId = parentExpr.referencePackageId;

  const storagePath = `site00/brand-presentation-visual/${run.runId}/${parentExpr.parentDirectionId}-expr-${parentExpr.expressionLabel}-rev-${childExpr.revisionNumber}.webp`;
  const falResult = await runFalGeneration({
    prompt: revisionPrompt.prompt,
    negativePrompt: revisionPrompt.negativePrompt,
    promptFingerprint: revisionPrompt.promptFingerprint,
    storagePath,
    entityId: childExpr.expressionId,
    referenceConditioned: Boolean(refPkg?.referenceConditioned),
  });

  if (!falResult.ok) throw new Error(falResult.error);

  childExpr.promptFingerprint = revisionPrompt.promptFingerprint;
  childExpr.assetId = randomUUID();
  childExpr.assetStoragePath = falResult.storagePath;
  childExpr.assetPublicUrl = falResult.publicUrl;
  childExpr.assetFingerprint = hash(revisionPrompt.promptFingerprint);
  childExpr.generationReceipt = {
    provider: falResult.provider,
    model: falResult.model,
    requestId: falResult.requestId,
    costUsd: falResult.costUsd,
    revision: true,
    parentExpressionId: parentExpr.expressionId,
    parentAssetId: parentExpr.assetId,
  };
  childExpr.status = 'GENERATED';

  const revisionDelta: VisualExpressionRevisionDelta = {
    revisionId: randomUUID(),
    parentExpressionId: parentExpr.expressionId,
    parentAssetId: parentExpr.assetId,
    childExpressionId: childExpr.expressionId,
    revisionNumber: childExpr.revisionNumber,
    preserve: params.preserve,
    change: params.change,
    doNotBecome: params.doNotBecome,
    revisionPromptFingerprint: revisionPrompt.promptFingerprint,
    createdAt: nowIso(),
  };

  const updated: BrandPresentationVisualFormulationRun = {
    ...run,
    expressions: [...run.expressions, childExpr],
    revisions: [...run.revisions, revisionDelta],
    accounting: {
      ...run.accounting,
      falRequests: run.accounting.falRequests + 1,
      visualGenerationCostUsd: run.accounting.visualGenerationCostUsd + falResult.costUsd,
    },
  };
  return store.saveBrandPresentationVisualFormulationRun(updated);
}

export async function selectBrandPresentationWinner(params: {
  expressionId?: string;
  benchmarkId?: string;
  selectedBy: string;
}): Promise<BrandPresentationVisualFormulationRun> {
  const run = await ensureRun();
  if (run.status !== 'VISUALS_READY' && run.status !== 'FOUNDER_REVIEW') {
    throw new Error('Winner selection requires completed visual review');
  }

  if (params.benchmarkId) {
    const benchmark = run.directionBenchmarks.find(
      (b) => b.benchmarkId === params.benchmarkId && b.status === 'GENERATED',
    );
    if (!benchmark || !benchmark.assetStoragePath) {
      throw new Error('Winning benchmark must have a generated visual asset');
    }

    const winner: BrandPresentationWinnerSelection = {
      winnerId: randomUUID(),
      projectId: run.projectId,
      projectSlug: run.projectSlug,
      parentConceptId: benchmark.parentConceptId,
      parentConceptName: benchmark.parentConceptName,
      directionId: benchmark.directionId,
      directionName: benchmark.directionName,
      expressionId: null,
      benchmarkId: benchmark.benchmarkId,
      expressionLabel: null,
      assetId: benchmark.assetId,
      assetStoragePath: benchmark.assetStoragePath,
      founderJudgment: 'FOUNDER_SELECTED_BRAND_PRESENTATION_DIRECTION',
      selectionTimestamp: nowIso(),
      methodologyVersion: run.methodologyVersion,
      directionFormationFingerprint: benchmark.directionFingerprint,
      expressionFormationFingerprint: benchmark.promptFingerprint,
      referenceFingerprint: benchmark.referencePackageId,
      generationReceiptLineage: benchmark.providerReceipt,
      brandCanonMutated: false,
      implementationStarted: false,
      eligibleForExpressionSystemDevelopment: true,
    };

    const updated: BrandPresentationVisualFormulationRun = {
      ...run,
      winner,
      status: 'WINNER_SELECTED',
      expressionSystemDevelopmentAllowed: false,
      brandCanonMutationAllowed: false,
    };
    return store.saveBrandPresentationVisualFormulationRun(updated);
  }

  if (!params.expressionId) {
    throw new Error('expressionId or benchmarkId required');
  }

  const expression = run.expressions.find((e) => e.expressionId === params.expressionId && e.status === 'GENERATED');
  if (!expression || !expression.assetStoragePath) {
    throw new Error('Winning expression must have a generated visual asset');
  }

  const winner: BrandPresentationWinnerSelection = {
    winnerId: randomUUID(),
    projectId: run.projectId,
    projectSlug: run.projectSlug,
    parentConceptId: expression.parentConceptId,
    parentConceptName: expression.parentConceptName,
    directionId: expression.parentDirectionId,
    directionName: expression.parentDirectionName,
    expressionId: expression.expressionId,
    benchmarkId: null,
    expressionLabel: expression.expressionLabel,
    assetId: expression.assetId,
    assetStoragePath: expression.assetStoragePath,
    founderJudgment: 'FOUNDER_SELECTED_BRAND_PRESENTATION_DIRECTION',
    selectionTimestamp: nowIso(),
    methodologyVersion: run.methodologyVersion,
    directionFormationFingerprint: null,
    expressionFormationFingerprint: expression.promptFingerprint,
    referenceFingerprint: expression.referencePackageId,
    generationReceiptLineage: expression.generationReceipt,
    brandCanonMutated: false,
    implementationStarted: false,
    eligibleForExpressionSystemDevelopment: true,
  };

  const updated: BrandPresentationVisualFormulationRun = {
    ...run,
    winner,
    status: 'WINNER_SELECTED',
    expressionSystemDevelopmentAllowed: false,
    brandCanonMutationAllowed: false,
  };
  return store.saveBrandPresentationVisualFormulationRun(updated);
}

export async function prepareVisualFormulationRun(): Promise<BrandPresentationVisualFormulationRun> {
  return ensureRun();
}

export const BRAND_PRESENTATION_VISUAL_FAL_MODEL = EXPERIENCE_FAL_MODEL;
