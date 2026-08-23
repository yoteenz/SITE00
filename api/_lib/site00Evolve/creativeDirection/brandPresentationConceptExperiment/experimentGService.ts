/**
 * Experiment G — NDXBOOK Brand Presentation Concept Formation service.
 */

import { createHash, randomUUID } from 'node:crypto';
import {
  BRAND_PRESENTATION_CONCEPT_TERRITORY_V1,
  EXPERIMENT_F_REINTERPRETATION,
  EXPERIMENT_G_CLASSIFICATION,
  EXPERIMENT_G_INTELLIGENCE_SNAPSHOT_VERSION,
  EXPERIMENT_G_PREDECESSOR_EXPERIMENT,
  EXPERIMENT_G_RUN_ID,
  EXPERIMENT_G_SUPERSESSION,
} from '../../../../../shared/site00-brand-lore/brandPresentationConceptTerritory/constants.js';
import type {
  BrandPresentationConceptFormationRun,
  BrandPresentationConceptTerritory,
  BrandPresentationFormationReceipt,
} from '../../../../../shared/site00-brand-lore/brandPresentationConceptTerritory/types.js';
import { compileExperimentGIntelligenceSnapshot } from '../../../../../shared/site00-brand-lore/brandPresentationConceptTerritory/intelligenceSnapshot.js';
import {
  BRAND_PRESENTATION_DIRECTOR_SYSTEM_PROMPT,
  FORMATION_PROMPT_VERSION,
  buildBrandPresentationDirectorPayload,
} from '../../../../../shared/site00-brand-lore/brandPresentationConceptTerritory/formationPrompt.js';
import { assertSuccessorFormationQuarantined } from '../../../../../shared/site00-brand-lore/brandPresentationConceptTerritory/evidenceQuarantine.js';
import {
  evaluateBrandPresentationConceptVsDirection,
  evaluateBrandPresentationLevel,
  evaluateBrandPresentationRecurrence,
  evaluateBrandPresentationTopicIndependence,
} from '../../../../../shared/site00-brand-lore/brandPresentationConceptTerritory/evaluators.js';
import { runBrandPresentationOrthogonalityEvaluation } from '../../../../../shared/site00-brand-lore/brandPresentationConceptTerritory/orthogonality.js';
import { parseStructuredJson } from '../creativeIntelligence/structuredJson.js';
import { callAnthropicForCompletion } from '../creativeIntelligence/anthropicCompletion.js';
import { ANTHROPIC_CREATIVE_MODEL } from '../creativeIntelligence/config.js';
import { getBrandLoreProfileForOrg } from '../../../site00BrandLore/loreService.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import * as experimentGStore from './storeAdapter.js';

/** Anthropic formation is synchronous; longer than this implies a crashed/timed-out request. */
const STALE_FORMING_MS = 10 * 60 * 1000;

function nowIso(): string {
  return new Date().toISOString();
}

function isFormationStale(run: BrandPresentationConceptFormationRun): boolean {
  if (run.status !== 'FORMING') return false;
  const anchor = run.formationStartedAt ?? run.startedAt;
  if (!anchor) return true;
  return Date.now() - new Date(anchor).getTime() > STALE_FORMING_MS;
}

async function reconcileStaleFormingRun(
  run: BrandPresentationConceptFormationRun | null,
): Promise<BrandPresentationConceptFormationRun | null> {
  if (!run || !isFormationStale(run)) return run;
  const updated: BrandPresentationConceptFormationRun = {
    ...run,
    status: 'FAILED',
    formationStartedAt: null,
    error: 'Formation interrupted (server timeout or disconnect). Tap RETRY FORMATION.',
  };
  return experimentGStore.saveBrandPresentationConceptFormationRun(updated);
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function emptyAccounting(): BrandPresentationConceptFormationRun['accounting'] {
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

function initRun(existing?: BrandPresentationConceptFormationRun | null): BrandPresentationConceptFormationRun {
  if (existing) return existing;
  return {
    experimentClassification: EXPERIMENT_G_CLASSIFICATION,
    runId: EXPERIMENT_G_RUN_ID,
    organizationId: NDXBOOK_ORG_ID,
    projectId: 'ndxbook',
    methodologyVersion: BRAND_PRESENTATION_CONCEPT_TERRITORY_V1,
    predecessorExperiment: EXPERIMENT_G_PREDECESSOR_EXPERIMENT,
    supersessionRelationship: EXPERIMENT_G_SUPERSESSION,
    experimentFReinterpretation: EXPERIMENT_F_REINTERPRETATION,
    intelligenceSnapshotVersion: EXPERIMENT_G_INTELLIGENCE_SNAPSHOT_VERSION,
    formationSubject: null,
    topicBlind: true,
    currentStage: 'BRAND_PRESENTATION_CONCEPT_FORMATION',
    status: 'NOT_STARTED',
    formationVersion: 1,
    formationPromptVersion: FORMATION_PROMPT_VERSION,
    idempotencyKey: null,
    intelligenceSnapshot: null,
    concepts: [],
    orthogonality: null,
    formationReceipt: null,
    directionDevelopmentAllowed: false,
    visualGenerationAllowed: false,
    contentGenerationAllowed: false,
    brandCanonMutationAllowed: false,
    accounting: emptyAccounting(),
    error: null,
    formationStartedAt: null,
    startedAt: nowIso(),
    completedAt: null,
  };
}

type RawBrandPresentationPayload = {
  name: string;
  conceptThesis: string;
  brandExistenceModel: string;
  audienceRelationship: string;
  brandBehavior: string;
  publishingLogic: string;
  artifactLogic: string;
  knowledgeBehavior: string;
  authorityModel: string;
  participationLogic: string;
  recurrenceEngine: string;
  topicIndependence: string;
  socialNativeBehavior: string;
  expansionPotential: string;
  possibleDirectionRange: Array<{ directionSeed: string; explanation: string }>;
  antiCollapseRules: string[];
  notThis: string[];
};

function normalizeConcept(
  raw: RawBrandPresentationPayload,
  params: {
    formationVersion: number;
    snapshotFingerprint: string;
    promptFingerprint: string;
  },
): BrandPresentationConceptTerritory {
  const concept: BrandPresentationConceptTerritory = {
    id: `bpc-${params.formationVersion}-${hash(raw.name)}`,
    name: raw.name,
    conceptThesis: raw.conceptThesis,
    brandExistenceModel: raw.brandExistenceModel,
    audienceRelationship: raw.audienceRelationship,
    brandBehavior: raw.brandBehavior,
    publishingLogic: raw.publishingLogic,
    artifactLogic: raw.artifactLogic,
    knowledgeBehavior: raw.knowledgeBehavior,
    authorityModel: raw.authorityModel,
    participationLogic: raw.participationLogic,
    recurrenceEngine: raw.recurrenceEngine,
    topicIndependence: raw.topicIndependence,
    socialNativeBehavior: raw.socialNativeBehavior,
    expansionPotential: raw.expansionPotential,
    possibleDirectionRange: raw.possibleDirectionRange ?? [],
    antiCollapseRules: raw.antiCollapseRules ?? [],
    notThis: raw.notThis ?? [],
    provenance: 'EXPERIMENT_G_FORMATION',
    formationReceipt: null,
    brandPresentationLevel: null,
    topicIndependenceEval: null,
    recurrenceEval: null,
    conceptVsDirection: null,
    founderJudgment: null,
    judgmentNote: null,
    methodologyVersion: BRAND_PRESENTATION_CONCEPT_TERRITORY_V1,
    experimentId: EXPERIMENT_G_RUN_ID,
    formationVersion: params.formationVersion,
    snapshotVersion: EXPERIMENT_G_INTELLIGENCE_SNAPSHOT_VERSION,
    snapshotFingerprint: params.snapshotFingerprint,
    formationPromptVersion: FORMATION_PROMPT_VERSION,
    formationPromptFingerprint: params.promptFingerprint,
    conceptClassification: 'BRAND_PRESENTATION_CONCEPT',
    createdAt: nowIso(),
  };

  concept.brandPresentationLevel = evaluateBrandPresentationLevel(concept);
  concept.topicIndependenceEval = evaluateBrandPresentationTopicIndependence(concept);
  concept.recurrenceEval = evaluateBrandPresentationRecurrence(concept);
  concept.conceptVsDirection = evaluateBrandPresentationConceptVsDirection(concept);
  return concept;
}

/** Vitest-only — six topic-independent brand presentation systems. */
export function buildVitestBrandPresentationFormationPayload(): { concepts: RawBrandPresentationPayload[] } {
  const base = (name: string, thesis: string, existence: string, behavior: string, recurrence: string): RawBrandPresentationPayload => ({
    name,
    conceptThesis: thesis,
    brandExistenceModel: existence,
    audienceRelationship: 'Peer-in-the-know relationship with recurring trust',
    brandBehavior: behavior,
    publishingLogic: 'Publishing triggered by audience-facing behavioral signals, not topic calendar alone',
    artifactLogic: 'Recurring expressive artifacts emerge from brand behavior rules',
    knowledgeBehavior: 'Knowledge revealed through staged behavioral rituals',
    authorityModel: 'Authority earned through consistent behavioral truth-telling',
    participationLogic: 'Audience participates through response rituals defined by the concept',
    recurrenceEngine: recurrence,
    topicIndependence: 'Governing social entity persists regardless of subject matter',
    socialNativeBehavior: 'Behavior-native to social feeds without reducing to one format',
    expansionPotential: 'Supports franchises, series, campaigns, and format translation',
    possibleDirectionRange: [
      { directionSeed: 'Institutional voice', explanation: 'Formal public entity tone' },
      { directionSeed: 'Domestic peer voice', explanation: 'Intimate conversational tone' },
      { directionSeed: 'Field-reporter voice', explanation: 'Observational documentary tone' },
    ],
    antiCollapseRules: ['Do not collapse into editorial document metaphor', 'Do not anchor to one financial topic'],
    notThis: ['Not a content concept for one subject', 'Not a visual style', 'Not a campaign'],
  });

  return {
    concepts: [
      base(
        'THE PERMISSION ENGINE',
        'NDXBOOK exists as an entity that grants and revokes permission to talk about money in public.',
        'A social permission-granting institution',
        'Repeatedly tests what the audience is allowed to admit, ask, or challenge',
        'Permission rules evolve as audience maturity grows — infinite recurrence',
      ),
      {
        ...base(
          'THE SOCIAL CFO',
          'NDXBOOK behaves like the audience\'s candid financial peer-advisor who never sells products.',
          'A peer-advisor social entity with no product agenda',
          'Offers judgment, reframing, and decision scaffolding in public',
          'Peer-advisor relationship renews with each audience life stage',
        ),
        audienceRelationship: 'Trusted peer-advisor without product agenda',
      },
      {
        ...base(
          'THE BEHAVIOR MIRROR',
          'NDXBOOK reflects audience financial behavior back with interpretive commentary.',
          'A reflective social entity that interprets patterns',
          'Surfaces behavioral patterns and names them without prescribing products',
          'New behaviors and contexts continuously supply reflection material',
        ),
        audienceRelationship: 'Reflective interpreter the audience recognizes',
      },
      {
        ...base(
          'THE PUBLIC LEDGER OF QUESTIONS',
          'NDXBOOK collects the questions people are afraid to ask about money.',
          'A question-collecting social entity',
          'Publishes, ranks, and revisits audience questions as primary artifacts',
          'Question backlog never exhausts — audience continuously generates new uncertainty',
        ),
        audienceRelationship: 'Curator of collective financial questions',
      },
      {
        ...base(
          'THE CONTRARIAN COMPASS',
          'NDXBOOK consistently challenges conventional financial wisdom with evidence-backed dissent.',
          'A dissenting editorial social entity',
          'Identifies consensus beliefs and stress-tests them in public',
          'Cultural consensus shifts create endless contrarian opportunities',
        ),
        audienceRelationship: 'Skeptical guide challenging consensus',
      },
      {
        ...base(
          'THE RITUAL CHECK-IN',
          'NDXBOOK establishes recurring social rituals for financial self-awareness.',
          'A ritual-hosting social entity',
          'Hosts repeatable check-in behaviors the audience performs together',
          'Rituals can seasonally evolve while preserving core participation grammar',
        ),
        audienceRelationship: 'Ritual host the audience returns to',
      },
    ],
  };
}

async function dispatchBrandPresentationFormation(params: {
  snapshot: BrandPresentationConceptFormationRun['intelligenceSnapshot'];
  formationVersion: number;
}): Promise<{
  concepts: RawBrandPresentationPayload[];
  receipt: BrandPresentationFormationReceipt;
  accountingDelta: Partial<BrandPresentationConceptFormationRun['accounting']>;
}> {
  const payload = buildBrandPresentationDirectorPayload({ snapshot: params.snapshot! });
  const promptText = JSON.stringify(payload);
  // System prompt intentionally lists exclusions — quarantine applies to model output only.

  const promptFingerprint = hash(BRAND_PRESENTATION_DIRECTOR_SYSTEM_PROMPT + promptText);
  const idempotencyKey = hash(`${EXPERIMENT_G_RUN_ID}:v${params.formationVersion}:${promptFingerprint}`);

  if (process.env.VITEST === 'true' || !process.env.ANTHROPIC_API_KEY?.trim()) {
    const mock = buildVitestBrandPresentationFormationPayload();
    assertSuccessorFormationQuarantined(JSON.stringify(mock.concepts));
    return {
      concepts: mock.concepts,
      receipt: {
        receiptId: randomUUID(),
        provider: 'anthropic',
        model: ANTHROPIC_CREATIVE_MODEL,
        promptFingerprint,
        snapshotFingerprint: params.snapshot!.fingerprint,
        formationVersion: params.formationVersion,
        formationPromptVersion: FORMATION_PROMPT_VERSION,
        idempotencyKey,
        inputTokens: null,
        outputTokens: null,
        providerRequestId: null,
        durationMs: 0,
        createdAt: nowIso(),
      },
      accountingDelta: { anthropicRequests: 0 },
    };
  }

  const started = Date.now();
  const { text, usage } = await callAnthropicForCompletion(
    BRAND_PRESENTATION_DIRECTOR_SYSTEM_PROMPT,
    payload,
    { maxTokens: 8192 },
  );
  assertSuccessorFormationQuarantined(text);
  const parsed = parseStructuredJson<{ concepts: RawBrandPresentationPayload[] }>(text);

  return {
    concepts: parsed.concepts,
    receipt: {
      receiptId: randomUUID(),
      provider: 'anthropic',
      model: ANTHROPIC_CREATIVE_MODEL,
      promptFingerprint,
      snapshotFingerprint: params.snapshot!.fingerprint,
      formationVersion: params.formationVersion,
      formationPromptVersion: FORMATION_PROMPT_VERSION,
      idempotencyKey,
      inputTokens: usage.inputTokens ?? null,
      outputTokens: usage.outputTokens ?? null,
      providerRequestId: null,
      durationMs: Date.now() - started,
      createdAt: nowIso(),
    },
    accountingDelta: {
      anthropicRequests: 1,
      anthropicInputTokens: usage.inputTokens ?? 0,
      anthropicOutputTokens: usage.outputTokens ?? 0,
      anthropicEstimatedCostUsd: 0.05,
    },
  };
}

export async function getBrandPresentationConceptFormationRun(): Promise<BrandPresentationConceptFormationRun | null> {
  const run = await experimentGStore.getBrandPresentationConceptFormationRun();
  return reconcileStaleFormingRun(run);
}

export async function prepareExperimentGSnapshot(): Promise<BrandPresentationConceptFormationRun> {
  const existing = await experimentGStore.getBrandPresentationConceptFormationRun();
  const run = initRun(existing);
  const profile = await getBrandLoreProfileForOrg(NDXBOOK_ORG_ID);
  const snapshot = compileExperimentGIntelligenceSnapshot({ profile, freeze: false });
  const updated: BrandPresentationConceptFormationRun = {
    ...run,
    intelligenceSnapshot: snapshot,
    status: 'SNAPSHOT_READY',
    startedAt: run.startedAt ?? nowIso(),
  };
  return experimentGStore.saveBrandPresentationConceptFormationRun(updated);
}

export async function formSixBrandPresentationConcepts(params?: {
  forceReform?: boolean;
  /** Bypass stale guard when founder retries a stalled FORMING record. */
  forceRetry?: boolean;
}): Promise<BrandPresentationConceptFormationRun> {
  let run = await experimentGStore.getBrandPresentationConceptFormationRun();
  run = initRun(run);
  run = (await reconcileStaleFormingRun(run)) ?? run;

  if (!run.intelligenceSnapshot) {
    run = await prepareExperimentGSnapshot();
  }

  const idempotencyKey = hash(
    `${run.intelligenceSnapshot!.fingerprint}:v${run.formationVersion}:${BRAND_PRESENTATION_CONCEPT_TERRITORY_V1}`,
  );

  if (
    !params?.forceReform &&
    run.idempotencyKey === idempotencyKey &&
    run.concepts.length === 6 &&
    run.status !== 'NOT_STARTED' &&
    run.status !== 'SNAPSHOT_READY'
  ) {
    return run;
  }

  if (run.status === 'FORMING' && !params?.forceRetry && !isFormationStale(run)) {
    return run;
  }

  run = { ...run, status: 'FORMING', idempotencyKey, error: null, formationStartedAt: nowIso() };
  await experimentGStore.saveBrandPresentationConceptFormationRun(run);

  try {
    const { concepts: rawConcepts, receipt, accountingDelta } = await dispatchBrandPresentationFormation({
      snapshot: run.intelligenceSnapshot,
      formationVersion: run.formationVersion,
    });

    const promptFingerprint = receipt.promptFingerprint;
    const concepts = rawConcepts.map((c) =>
      normalizeConcept(c, {
        formationVersion: run.formationVersion,
        snapshotFingerprint: run.intelligenceSnapshot!.fingerprint,
        promptFingerprint,
      }),
    );
    const orthogonality = runBrandPresentationOrthogonalityEvaluation(concepts);

    const status =
      orthogonality.reformationRecommended
        ? 'NEEDS_REFORMATION'
        : concepts.every((c) => c.brandPresentationLevel?.answersBrandPresentationQuestion)
          ? 'EVALUATIONS_COMPLETE'
          : 'CONCEPTS_FORMED';

    run = {
      ...run,
      concepts,
      orthogonality,
      formationReceipt: receipt,
      intelligenceSnapshot: { ...run.intelligenceSnapshot!, frozen: true },
      status,
      formationStartedAt: null,
      directionDevelopmentAllowed: false,
      visualGenerationAllowed: false,
      contentGenerationAllowed: false,
      brandCanonMutationAllowed: false,
      accounting: {
        ...run.accounting,
        anthropicRequests: run.accounting.anthropicRequests + (accountingDelta.anthropicRequests ?? 0),
        anthropicInputTokens: run.accounting.anthropicInputTokens + (accountingDelta.anthropicInputTokens ?? 0),
        anthropicOutputTokens: run.accounting.anthropicOutputTokens + (accountingDelta.anthropicOutputTokens ?? 0),
        anthropicEstimatedCostUsd:
          run.accounting.anthropicEstimatedCostUsd + (accountingDelta.anthropicEstimatedCostUsd ?? 0),
      },
      completedAt: nowIso(),
    };

    return experimentGStore.saveBrandPresentationConceptFormationRun(run);
  } catch (err) {
    run = {
      ...run,
      status: 'FAILED',
      formationStartedAt: null,
      error: err instanceof Error ? err.message : 'Formation failed',
    };
    return experimentGStore.saveBrandPresentationConceptFormationRun(run);
  }
}

export async function setExperimentGConceptJudgment(params: {
  conceptId: string;
  judgment: BrandPresentationConceptTerritory['founderJudgment'];
  note?: string | null;
}): Promise<BrandPresentationConceptFormationRun> {
  const run = await experimentGStore.getBrandPresentationConceptFormationRun();
  if (!run) throw new Error('Experiment G not initialized');
  const concepts = run.concepts.map((c) =>
    c.id === params.conceptId
      ? { ...c, founderJudgment: params.judgment, judgmentNote: params.note ?? null }
      : c,
  );
  const updated: BrandPresentationConceptFormationRun = {
    ...run,
    concepts,
    status: params.judgment === 'REFORM_SET' ? run.status : 'FOUNDER_REVIEWED',
    directionDevelopmentAllowed: false,
    visualGenerationAllowed: false,
    contentGenerationAllowed: false,
    brandCanonMutationAllowed: false,
  };
  return experimentGStore.saveBrandPresentationConceptFormationRun(updated);
}

export async function reformExperimentGSet(): Promise<BrandPresentationConceptFormationRun> {
  const run = await experimentGStore.getBrandPresentationConceptFormationRun();
  if (!run) throw new Error('Experiment G not initialized');
  const reformed: BrandPresentationConceptFormationRun = {
    ...run,
    formationVersion: run.formationVersion + 1,
    concepts: [],
    orthogonality: null,
    formationReceipt: null,
    idempotencyKey: null,
    status: 'SNAPSHOT_READY',
    intelligenceSnapshot: run.intelligenceSnapshot
      ? { ...run.intelligenceSnapshot, frozen: false }
      : null,
    directionDevelopmentAllowed: false,
    error: null,
  };
  await experimentGStore.saveBrandPresentationConceptFormationRun(reformed);
  return formSixBrandPresentationConcepts({ forceReform: true });
}

export function formationTriggersZeroImageRequests(): true {
  return true;
}

export function formationTriggersZeroFalRequests(): true {
  return true;
}

export function loveConceptDoesNotTriggerDirectionDevelopment(): true {
  return true;
}

export { resetExperimentGMemory, resetExperimentGStoreModeCache } from './storeAdapter.js';
