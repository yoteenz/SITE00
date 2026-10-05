/**
 * Brand Presentation Direction Development service — Experiment G successor layer.
 */

import { createHash, randomUUID } from 'node:crypto';
import {
  BRAND_PRESENTATION_DIRECTION_CLASSIFICATION,
  BRAND_PRESENTATION_DIRECTION_RUN_ID,
  BRAND_PRESENTATION_DIRECTION_TERRITORY_V1,
  DIRECTIONS_PER_PARENT_CONCEPT,
  TOTAL_DIRECTION_CANDIDATES,
} from '../../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/constants.js';
import type {
  BrandPresentationDirectionCandidate,
  BrandPresentationDirectionFormationRun,
  BrandPresentationDirectionFormationReceipt,
  BrandPresentationDirectionParentGroup,
  FrozenParentConceptSnapshot,
} from '../../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/types.js';
import {
  assertDirectionFormationQuarantined,
  evaluateDirectionRecurrence,
  evaluateDirectionTopicIndependence,
  evaluateParentConceptFidelity,
  evaluateSiblingDistinctiveness,
  evaluateVisualFreedom,
} from '../../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/evaluators.js';
import {
  BRAND_PRESENTATION_DIRECTION_SYSTEM_PROMPT,
  DIRECTION_FORMATION_PROMPT_VERSION,
  buildBrandPresentationDirectionPayload,
} from '../../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/formationPrompt.js';
import { runBrandPresentationDirectionCrossParentAudit } from '../../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/crossParentAudit.js';
import { resolveSelectedParentConcepts } from '../../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/parentConceptSelection.js';
import { registerBrandPresentationDirectionDependencies } from '../../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/invalidationRegistration.js';
import type { StudioWorldDependencyGraph } from '../../../../../shared/site00-studio-world-production/dependencyTypes.js';
import { getBrandPresentationConceptFormationRun } from '../brandPresentationConceptExperiment/experimentGService.js';
import { parseStructuredJson } from '../creativeIntelligence/structuredJson.js';
import { callAnthropicForCompletion } from '../creativeIntelligence/anthropicCompletion.js';
import { ANTHROPIC_CREATIVE_MODEL } from '../creativeIntelligence/config.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import * as directionStore from './storeAdapter.js';

const STALE_FORMING_MS = 15 * 60 * 1000;
const ANTHROPIC_FORMATION_TIMEOUT_MS = 8 * 60 * 1000;
const activeFormationAttempts = new Map<string, string>();

type RawDirectionPayload = {
  directionName: string;
  directionThesis: string;
  directionInterpretation: string;
  brandPosture: string;
  audienceRelationship: string;
  brandBehavior: string;
  editorialBehavior: string;
  publishingBehavior: string;
  knowledgeBehavior: string;
  authorityBehavior: string;
  participationBehavior: string;
  recurrenceBehavior: string;
  artifactBehavior: string;
  temporalBehavior: string;
  informationRevelationLogic: string;
  emotionalTemperature: string;
  culturalPosture: string;
  socialNativeBehavior: string;
  recognitionMechanism: string;
  topicIndependence: string;
  expansionPotential: string;
  visualImplications: string;
  visualFreedom: string;
  possibleExpressionSeeds: Array<{ seed: string; explanation: string }>;
  antiCollapseRules: string[];
  notThis: string[];
};

function shouldRunFormationSynchronously(): boolean {
  return process.env.VITEST === 'true';
}

function nowIso(): string {
  return new Date().toISOString();
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function emptyAccounting(): BrandPresentationDirectionFormationRun['accounting'] {
  return {
    anthropicRequests: 0,
    anthropicInputTokens: 0,
    anthropicOutputTokens: 0,
    anthropicEstimatedCostUsd: 0,
    gptImage2Requests: 0,
    falRequests: 0,
    visualGenerationCostUsd: 0,
  };
}

function initRun(existing?: BrandPresentationDirectionFormationRun | null): BrandPresentationDirectionFormationRun {
  if (existing) return existing;
  return {
    experimentClassification: BRAND_PRESENTATION_DIRECTION_CLASSIFICATION,
    runId: BRAND_PRESENTATION_DIRECTION_RUN_ID,
    organizationId: NDXBOOK_ORG_ID,
    projectId: 'ndxbook',
    methodologyVersion: BRAND_PRESENTATION_DIRECTION_TERRITORY_V1,
    parentExperiment: 'EXPERIMENT_G',
    parentConceptSnapshots: [],
    parentGroups: [],
    directions: [],
    crossParentAudit: null,
    formationReceipt: null,
    status: 'NOT_STARTED',
    formationVersion: 1,
    formationPromptVersion: DIRECTION_FORMATION_PROMPT_VERSION,
    idempotencyKey: null,
    directionDevelopmentAllowed: true,
    visualFormulationAllowed: false,
    visualGenerationAllowed: false,
    falGenerationAllowed: false,
    brandCanonMutationAllowed: false,
    accounting: emptyAccounting(),
    error: null,
    formationStartedAt: null,
    formationAttemptId: null,
    startedAt: nowIso(),
    completedAt: null,
  };
}

export function resetBrandPresentationDirectionFormationWorkers(): void {
  activeFormationAttempts.clear();
}

export function resetBrandPresentationDirectionMemory(): void {
  directionStore.resetBrandPresentationDirectionMemory();
}

export function resetBrandPresentationDirectionStoreModeCache(): void {
  directionStore.resetBrandPresentationDirectionStoreModeCache();
}

function isFormationStale(run: BrandPresentationDirectionFormationRun): boolean {
  if (run.status !== 'FORMING') return false;
  const anchor = run.formationStartedAt ?? run.startedAt;
  if (!anchor) return true;
  return Date.now() - new Date(anchor).getTime() > STALE_FORMING_MS;
}

async function reconcileStaleFormingRun(
  run: BrandPresentationDirectionFormationRun | null,
): Promise<BrandPresentationDirectionFormationRun | null> {
  if (!run || !isFormationStale(run)) return run;
  const updated: BrandPresentationDirectionFormationRun = {
    ...run,
    status: 'FAILED',
    formationStartedAt: null,
    error: 'Direction formation interrupted. Tap DEVELOP TOP 3 DIRECTIONS to retry.',
  };
  return directionStore.saveBrandPresentationDirectionFormationRun(updated);
}

export function buildVitestDirectionFormationPayload(
  parent: FrozenParentConceptSnapshot,
): { directions: RawDirectionPayload[] } {
  const prefix = parent.name.includes('COLLECTOR')
    ? 'Connection'
    : parent.name.includes('ROOM')
      ? 'Room'
      : 'Notice';
  const mk = (idx: number, behavior: string, thesis: string): RawDirectionPayload => ({
    directionName: `${prefix} Direction ${idx}`,
    directionThesis: thesis,
    directionInterpretation: `Interpretation ${idx} of ${parent.name}`,
    brandPosture: behavior,
    audienceRelationship: 'Peer relationship sustained across subjects',
    brandBehavior: behavior,
    editorialBehavior: `Editorial behavior variant ${idx} governed by parent concept`,
    publishingBehavior: 'Publishing rhythm driven by behavioral signals not topic calendar',
    knowledgeBehavior: 'Knowledge staged through recurring behavioral rituals',
    authorityBehavior: 'Authority through consistent behavioral truth-telling',
    participationBehavior: 'Audience participates through defined response rituals',
    recurrenceBehavior: 'Recurrence engine renews with life stages and cultural shifts indefinitely',
    artifactBehavior: 'Artifacts emerge from behavior rules not fixed formats',
    temporalBehavior: 'Temporal layering accumulates context over time',
    informationRevelationLogic: 'Information revealed through behavioral progression',
    emotionalTemperature: idx === 1 ? 'Warm peer intimacy' : idx === 2 ? 'Cool institutional clarity' : 'Restless curious energy',
    culturalPosture: 'Culturally literate without trend-chasing',
    socialNativeBehavior: 'Native to social feeds without reducing to one format',
    recognitionMechanism: `Recognition through ${behavior.toLowerCase()}`,
    topicIndependence: 'Governing behavior persists regardless of subject matter',
    expansionPotential: 'Supports franchises, series, and future interactive experiences',
    visualImplications: 'May eventually demand distinct surface behaviors — not prescribed here',
    visualFreedom: 'Multiple visual interpretations remain valid',
    possibleExpressionSeeds: [
      { seed: 'Institutional surface', explanation: 'Formal public entity tone' },
      { seed: 'Domestic peer surface', explanation: 'Intimate conversational tone' },
      { seed: 'Field document surface', explanation: 'Observational documentary tone' },
    ],
    antiCollapseRules: parent.antiCollapseRules,
    notThis: [...parent.notThis.filter((n) => !/credit utilization/i.test(n)), 'Not a topic campaign', 'Not a visual style mandate'],
  });

  return {
    directions: [
      mk(1, `${prefix} behavioral posture A`, `If NDXBOOK pursued interpretation A of ${parent.name}, it would ${parent.brandBehavior.slice(0, 40)}…`),
      mk(2, `${prefix} behavioral posture B`, `If NDXBOOK pursued interpretation B of ${parent.name}, publishing would emphasize ${parent.publishingLogic.slice(0, 40)}…`),
      mk(3, `${prefix} behavioral posture C`, `If NDXBOOK pursued interpretation C of ${parent.name}, recurrence would center on ${parent.recurrenceEngine.slice(0, 40)}…`),
    ],
  };
}

function normalizeDirection(
  raw: RawDirectionPayload,
  params: {
    parent: FrozenParentConceptSnapshot;
    directionIndex: number;
    formationVersion: number;
    promptFingerprint: string;
    parentDirectionId?: string | null;
  },
): BrandPresentationDirectionCandidate {
  const direction: BrandPresentationDirectionCandidate = {
    directionId: `bpd-${params.formationVersion}-${hash(params.parent.id)}-${params.directionIndex}`,
    parentConceptId: params.parent.id,
    parentConceptName: params.parent.name,
    parentDirectionId: params.parentDirectionId ?? null,
    directionIndex: params.directionIndex,
    directionName: raw.directionName,
    directionThesis: raw.directionThesis,
    directionInterpretation: raw.directionInterpretation,
    brandPosture: raw.brandPosture,
    audienceRelationship: raw.audienceRelationship,
    brandBehavior: raw.brandBehavior,
    editorialBehavior: raw.editorialBehavior,
    publishingBehavior: raw.publishingBehavior,
    knowledgeBehavior: raw.knowledgeBehavior,
    authorityBehavior: raw.authorityBehavior,
    participationBehavior: raw.participationBehavior,
    recurrenceBehavior: raw.recurrenceBehavior,
    artifactBehavior: raw.artifactBehavior,
    temporalBehavior: raw.temporalBehavior,
    informationRevelationLogic: raw.informationRevelationLogic,
    emotionalTemperature: raw.emotionalTemperature,
    culturalPosture: raw.culturalPosture,
    socialNativeBehavior: raw.socialNativeBehavior,
    recognitionMechanism: raw.recognitionMechanism,
    topicIndependence: raw.topicIndependence,
    expansionPotential: raw.expansionPotential,
    visualImplications: raw.visualImplications,
    visualFreedom: raw.visualFreedom,
    possibleExpressionSeeds: raw.possibleExpressionSeeds ?? [],
    antiCollapseRules: raw.antiCollapseRules ?? [],
    notThis: raw.notThis ?? [],
    parentConceptFidelity: null,
    siblingDistinctiveness: null,
    topicIndependenceEval: null,
    recurrenceEval: null,
    formationVersion: params.formationVersion,
    formationFingerprint: params.promptFingerprint,
    providerReceipt: null,
    founderJudgment: null,
    judgmentNote: null,
    revisionNote: null,
    methodologyVersion: BRAND_PRESENTATION_DIRECTION_TERRITORY_V1,
    experimentId: BRAND_PRESENTATION_DIRECTION_RUN_ID,
    createdAt: nowIso(),
  };

  direction.topicIndependenceEval = evaluateDirectionTopicIndependence(direction);
  direction.recurrenceEval = evaluateDirectionRecurrence(direction);
  direction.parentConceptFidelity = evaluateParentConceptFidelity(direction, params.parent);
  const visualFreedom = evaluateVisualFreedom(direction);
  if (visualFreedom.result !== 'PASS') {
    direction.siblingDistinctiveness = { result: visualFreedom.result, notes: visualFreedom.notes };
  }

  return direction;
}

async function dispatchDirectionFormationForParent(params: {
  parent: FrozenParentConceptSnapshot;
  formationVersion: number;
}): Promise<{
  directions: RawDirectionPayload[];
  accountingDelta: Partial<BrandPresentationDirectionFormationRun['accounting']>;
  promptFingerprint: string;
}> {
  const payload = buildBrandPresentationDirectionPayload({ parent: params.parent });
  const promptText = JSON.stringify(payload);
  const promptFingerprint = hash(BRAND_PRESENTATION_DIRECTION_SYSTEM_PROMPT + promptText);

  if (process.env.VITEST === 'true' || !process.env.ANTHROPIC_API_KEY?.trim()) {
    const mock = buildVitestDirectionFormationPayload(params.parent);
    assertDirectionFormationQuarantined(JSON.stringify(mock));
    return { directions: mock.directions, accountingDelta: { anthropicRequests: 0 }, promptFingerprint };
  }

  const { text, usage } = await callAnthropicForCompletion(
    BRAND_PRESENTATION_DIRECTION_SYSTEM_PROMPT,
    payload,
    { maxTokens: 8192, timeoutMs: ANTHROPIC_FORMATION_TIMEOUT_MS },
  );
  assertDirectionFormationQuarantined(text);
  const parsed = parseStructuredJson<{ directions: RawDirectionPayload[] }>(text);
  if (parsed.directions.length !== DIRECTIONS_PER_PARENT_CONCEPT) {
    throw new Error(`Expected ${DIRECTIONS_PER_PARENT_CONCEPT} directions for ${params.parent.name}`);
  }

  return {
    directions: parsed.directions,
    promptFingerprint,
    accountingDelta: {
      anthropicRequests: 1,
      anthropicInputTokens: usage.inputTokens ?? 0,
      anthropicOutputTokens: usage.outputTokens ?? 0,
      anthropicEstimatedCostUsd: 0.05,
    },
  };
}

function buildParentGroups(
  parents: FrozenParentConceptSnapshot[],
  directions: BrandPresentationDirectionCandidate[],
): BrandPresentationDirectionParentGroup[] {
  return parents.map((parent) => {
    const siblings = directions.filter((d) => d.parentConceptId === parent.id);
    for (const d of siblings) {
      d.siblingDistinctiveness = evaluateSiblingDistinctiveness(siblings);
    }
    const siblingDistinctiveness = evaluateSiblingDistinctiveness(siblings);
    const passCount = siblings.filter((d) => d.parentConceptFidelity?.result === 'PASS').length;
    const driftCount = siblings.filter((d) => d.parentConceptFidelity?.result === 'PARENT_CONCEPT_DRIFT').length;
    return {
      parentConceptId: parent.id,
      parentConceptName: parent.name,
      parentSnapshot: parent,
      directionIds: siblings.map((d) => d.directionId),
      siblingDistinctiveness,
      parentFidelitySummary: {
        passCount,
        driftCount,
        notes: driftCount ? ['Some directions flagged for parent drift — founder review'] : ['Parent fidelity heuristics pass'],
      },
    };
  });
}

async function executeDirectionFormationWork(runId: string, attemptId: string): Promise<void> {
  activeFormationAttempts.set(runId, attemptId);
  try {
    let run = await directionStore.getBrandPresentationDirectionFormationRun(runId);
    if (!run || run.status !== 'FORMING' || run.formationAttemptId !== attemptId) return;

    const allDirections: BrandPresentationDirectionCandidate[] = [];
    let totalAccounting = { ...run.accounting };
    const promptFingerprints: string[] = [];

    for (const parent of run.parentConceptSnapshots) {
      run = await directionStore.getBrandPresentationDirectionFormationRun(runId);
      if (!run || run.status !== 'FORMING' || run.formationAttemptId !== attemptId) return;

      const { directions: rawDirections, accountingDelta, promptFingerprint } =
        await dispatchDirectionFormationForParent({
          parent,
          formationVersion: run.formationVersion,
        });
      promptFingerprints.push(promptFingerprint);

      rawDirections.forEach((raw, idx) => {
        allDirections.push(
          normalizeDirection(raw, {
            parent,
            directionIndex: idx + 1,
            formationVersion: run!.formationVersion,
            promptFingerprint,
          }),
        );
      });

      totalAccounting = {
        ...totalAccounting,
        anthropicRequests: totalAccounting.anthropicRequests + (accountingDelta.anthropicRequests ?? 0),
        anthropicInputTokens: totalAccounting.anthropicInputTokens + (accountingDelta.anthropicInputTokens ?? 0),
        anthropicOutputTokens: totalAccounting.anthropicOutputTokens + (accountingDelta.anthropicOutputTokens ?? 0),
        anthropicEstimatedCostUsd:
          totalAccounting.anthropicEstimatedCostUsd + (accountingDelta.anthropicEstimatedCostUsd ?? 0),
        gptImage2Requests: 0,
        falRequests: 0,
        visualGenerationCostUsd: 0,
      };
    }

    const parentGroups = buildParentGroups(run.parentConceptSnapshots, allDirections);
    const crossParentAudit = runBrandPresentationDirectionCrossParentAudit({
      directions: allDirections,
      parentSnapshots: run.parentConceptSnapshots,
    });

    const receipt: BrandPresentationDirectionFormationReceipt = {
      receiptId: randomUUID(),
      provider: 'anthropic',
      model: ANTHROPIC_CREATIVE_MODEL,
      promptFingerprint: hash(promptFingerprints.join(':')),
      parentConceptCount: run.parentConceptSnapshots.length,
      directionsExpected: TOTAL_DIRECTION_CANDIDATES,
      formationVersion: run.formationVersion,
      formationPromptVersion: DIRECTION_FORMATION_PROMPT_VERSION,
      idempotencyKey: hash(`${runId}:v${run.formationVersion}:${promptFingerprints.join(':')}`),
      inputTokens: totalAccounting.anthropicInputTokens,
      outputTokens: totalAccounting.anthropicOutputTokens,
      providerRequestId: null,
      durationMs: null,
      createdAt: nowIso(),
    };

    run = {
      ...run,
      directions: allDirections,
      parentGroups,
      crossParentAudit,
      formationReceipt: receipt,
      status: allDirections.length === TOTAL_DIRECTION_CANDIDATES ? 'EVALUATIONS_COMPLETE' : 'DIRECTIONS_FORMED',
      formationStartedAt: null,
      formationAttemptId: null,
      accounting: totalAccounting,
      completedAt: nowIso(),
      error: null,
    };

    await directionStore.saveBrandPresentationDirectionFormationRun(run);
  } finally {
    activeFormationAttempts.delete(runId);
  }
}

function enqueueDirectionFormationWork(runId: string, attemptId: string): void {
  setImmediate(() => {
    void executeDirectionFormationWork(runId, attemptId);
  });
}

export async function getBrandPresentationDirectionFormationRun(): Promise<BrandPresentationDirectionFormationRun | null> {
  let run = await directionStore.getBrandPresentationDirectionFormationRun();
  return reconcileStaleFormingRun(run);
}

export async function prepareBrandPresentationDirectionParents(): Promise<BrandPresentationDirectionFormationRun> {
  const conceptRun = await getBrandPresentationConceptFormationRun();
  const resolved = resolveSelectedParentConcepts(conceptRun);
  if (!resolved.ok) {
    throw new Error(resolved.error);
  }

  const existing = await directionStore.getBrandPresentationDirectionFormationRun();
  const run = initRun(existing);
  const updated: BrandPresentationDirectionFormationRun = {
    ...run,
    parentConceptSnapshots: resolved.parents,
    status: 'PARENTS_READY',
    startedAt: run.startedAt ?? nowIso(),
  };
  return directionStore.saveBrandPresentationDirectionFormationRun(updated);
}

export async function formBrandPresentationDirections(params?: {
  forceRetry?: boolean;
}): Promise<BrandPresentationDirectionFormationRun> {
  let run = await prepareBrandPresentationDirectionParents();

  if (run.status === 'FORMING' && !params?.forceRetry && !isFormationStale(run)) {
    return run;
  }

  if (
    run.status === 'EVALUATIONS_COMPLETE' &&
    run.directions.length === TOTAL_DIRECTION_CANDIDATES &&
    !params?.forceRetry
  ) {
    return run;
  }

  const attemptId = randomUUID();
  run = {
    ...run,
    status: 'FORMING',
    directions: [],
    parentGroups: [],
    crossParentAudit: null,
    formationReceipt: null,
    error: null,
    formationStartedAt: nowIso(),
    formationAttemptId: attemptId,
    formationVersion: params?.forceRetry ? run.formationVersion + 1 : run.formationVersion,
  };
  await directionStore.saveBrandPresentationDirectionFormationRun(run);

  if (shouldRunFormationSynchronously()) {
    await executeDirectionFormationWork(BRAND_PRESENTATION_DIRECTION_RUN_ID, attemptId);
    return (await directionStore.getBrandPresentationDirectionFormationRun()) ?? run;
  }

  enqueueDirectionFormationWork(BRAND_PRESENTATION_DIRECTION_RUN_ID, attemptId);
  return run;
}

export async function setBrandPresentationDirectionJudgment(params: {
  directionId: string;
  judgment: BrandPresentationDirectionCandidate['founderJudgment'];
  note?: string | null;
}): Promise<BrandPresentationDirectionFormationRun> {
  const run = await directionStore.getBrandPresentationDirectionFormationRun();
  if (!run) throw new Error('Direction formation not initialized');

  const directions = run.directions.map((d) =>
    d.directionId === params.directionId
      ? { ...d, founderJudgment: params.judgment, judgmentNote: params.note ?? null }
      : d,
  );

  const updated: BrandPresentationDirectionFormationRun = {
    ...run,
    directions,
    status: 'FOUNDER_REVIEW',
    visualFormulationAllowed: false,
    visualGenerationAllowed: false,
    falGenerationAllowed: false,
    brandCanonMutationAllowed: false,
  };
  return directionStore.saveBrandPresentationDirectionFormationRun(updated);
}

export async function reviseBrandPresentationDirection(params: {
  directionId: string;
  preserve: string[];
  change: string[];
  doNotBecome: string[];
}): Promise<BrandPresentationDirectionFormationRun> {
  const run = await directionStore.getBrandPresentationDirectionFormationRun();
  if (!run) throw new Error('Direction formation not initialized');
  const parent = run.directions.find((d) => d.directionId === params.directionId);
  if (!parent) throw new Error('Direction not found');

  const parentSnapshot = run.parentConceptSnapshots.find((p) => p.id === parent.parentConceptId);
  if (!parentSnapshot) throw new Error('Parent concept snapshot missing');

  const revisedRaw = buildVitestDirectionFormationPayload(parentSnapshot).directions[0]!;
  const child = normalizeDirection(revisedRaw, {
    parent: parentSnapshot,
    directionIndex: parent.directionIndex,
    formationVersion: run.formationVersion + 1,
    promptFingerprint: hash(JSON.stringify(params)),
    parentDirectionId: parent.directionId,
  });
  child.revisionNote = {
    preserve: params.preserve,
    change: params.change,
    doNotBecome: params.doNotBecome,
  };
  child.founderJudgment = 'PROMISING_DEVELOP';

  const directions = [...run.directions, child];
  const parentGroups = buildParentGroups(run.parentConceptSnapshots, directions);
  const crossParentAudit = runBrandPresentationDirectionCrossParentAudit({
    directions,
    parentSnapshots: run.parentConceptSnapshots,
  });

  const updated: BrandPresentationDirectionFormationRun = {
    ...run,
    directions,
    parentGroups,
    crossParentAudit,
    status: 'FOUNDER_REVIEW',
  };
  return directionStore.saveBrandPresentationDirectionFormationRun(updated);
}

export function registerDirectionRunDependencies(
  graph: StudioWorldDependencyGraph,
  run: BrandPresentationDirectionFormationRun,
): StudioWorldDependencyGraph {
  let next = graph;
  for (const parent of run.parentConceptSnapshots) {
    next = registerBrandPresentationDirectionDependencies({
      graph: next,
      projectId: run.projectId,
      parentConceptId: parent.id,
      directionRunId: run.runId,
    });
  }
  return next;
}

export function estimateDirectionFormationCost(parentCount: number): {
  parentConcepts: number;
  directionsExpected: number;
  anthropicRequestsEstimate: number;
  falRequests: 0;
  imageCostUsd: 0;
} {
  return {
    parentConcepts: parentCount,
    directionsExpected: parentCount * DIRECTIONS_PER_PARENT_CONCEPT,
    anthropicRequestsEstimate: parentCount,
    falRequests: 0,
    imageCostUsd: 0,
  };
}
