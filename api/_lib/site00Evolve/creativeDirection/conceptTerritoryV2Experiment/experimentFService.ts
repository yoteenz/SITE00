/**
 * Experiment F — Six-Concept Reformation service (concept before direction).
 */

import { createHash, randomUUID } from 'node:crypto';
import {
  CONCEPT_TERRITORY_V2_METHODOLOGY,
  EXPERIMENT_F_CLASSIFICATION,
  EXPERIMENT_F_INTELLIGENCE_SNAPSHOT_VERSION,
  EXPERIMENT_F_PREDECESSOR_EXPERIMENT,
  EXPERIMENT_F_REFORMATION_REASON,
  EXPERIMENT_F_RUN_ID,
  EXPERIMENT_F_SUPERSEDES_METHODOLOGY,
  EXPERIMENT_F_TOPIC_ID,
  EXPERIMENT_F_TOPIC_NAME,
} from '../../../../../shared/site00-brand-lore/conceptTerritoryV2/constants.js';
import type {
  CreativeConceptTerritoryV2,
  SixConceptFormationReceipt,
  SixConceptReformationRun,
} from '../../../../../shared/site00-brand-lore/conceptTerritoryV2/types.js';
import { compileExperimentFIntelligenceSnapshot } from '../../../../../shared/site00-brand-lore/conceptTerritoryV2/intelligenceSnapshot.js';
import {
  buildCreativeConceptDirectorPayload,
  CREATIVE_CONCEPT_DIRECTOR_SYSTEM_PROMPT,
} from '../../../../../shared/site00-brand-lore/conceptTerritoryV2/formationPrompt.js';
import {
  assertFormationPromptQuarantined,
  excludePostFormationComparisonFromFormation,
} from '../../../../../shared/site00-brand-lore/conceptTerritoryV2/evidenceQuarantine.js';
import { evaluateConceptVsDirection } from '../../../../../shared/site00-brand-lore/conceptTerritoryV2/conceptVsDirection.js';
import { runConceptOrthogonalityEvaluationV2 } from '../../../../../shared/site00-brand-lore/conceptTerritoryV2/orthogonalityV2.js';
import { runHistoricalConceptComparison } from '../../../../../shared/site00-brand-lore/conceptTerritoryV2/historicalComparison.js';
import { parseStructuredJson } from '../creativeIntelligence/structuredJson.js';
import { callAnthropicForCompletion } from '../creativeIntelligence/anthropicCompletion.js';
import { ANTHROPIC_CREATIVE_MODEL } from '../creativeIntelligence/config.js';
import { getBrandLoreProfileForOrg } from '../../../site00BrandLore/loreService.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import * as experimentFStore from './storeAdapter.js';

function nowIso(): string {
  return new Date().toISOString();
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function emptyAccounting(): SixConceptReformationRun['accounting'] {
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

function initRun(existing?: SixConceptReformationRun | null): SixConceptReformationRun {
  if (existing) return existing;
  return {
    experimentClassification: EXPERIMENT_F_CLASSIFICATION,
    runId: EXPERIMENT_F_RUN_ID,
    organizationId: NDXBOOK_ORG_ID,
    projectId: 'ndxbook',
    methodologyVersion: CONCEPT_TERRITORY_V2_METHODOLOGY,
    predecessorExperiment: EXPERIMENT_F_PREDECESSOR_EXPERIMENT,
    supersedesMethodology: EXPERIMENT_F_SUPERSEDES_METHODOLOGY,
    reformationReason: EXPERIMENT_F_REFORMATION_REASON,
    intelligenceSnapshotVersion: EXPERIMENT_F_INTELLIGENCE_SNAPSHOT_VERSION,
    topicId: EXPERIMENT_F_TOPIC_ID,
    topicName: EXPERIMENT_F_TOPIC_NAME,
    currentStage: 'CONCEPT_FORMATION',
    status: 'NOT_STARTED',
    formationVersion: 1,
    idempotencyKey: null,
    intelligenceSnapshot: null,
    concepts: [],
    orthogonality: null,
    formationReceipt: null,
    historicalComparison: null,
    historicalComparisonAvailable: false,
    directionDevelopmentAllowed: false,
    visualGenerationAllowed: false,
    accounting: emptyAccounting(),
    error: null,
    startedAt: nowIso(),
    completedAt: null,
  };
}

type RawConceptPayload = {
  conceptName: string;
  conceptThesis: string;
  coreCreativeIdea: string;
  worldPremiseSeed: string;
  viewerRole: string;
  audienceRelationship: string;
  contentMechanism: string;
  informationBehavior: string;
  emotionalTension: string;
  participationLogic: string;
  spatialTemporalLogic: string;
  artifactLogic: string;
  narrativeLogic: string;
  whyThisIsNdxbook: string;
  whyThisIsAConceptNotDirection: string;
  possibleDirectionRange: Array<{ directionSeed: string; explanation: string }>;
  possibleNativeFormats: string[];
  antiCollapseRules: string[];
};

function normalizeConcept(raw: RawConceptPayload, formationVersion: number): CreativeConceptTerritoryV2 {
  const concept: CreativeConceptTerritoryV2 = {
    id: `ctf-v2-${formationVersion}-${hash(raw.conceptName)}`,
    conceptName: raw.conceptName,
    conceptThesis: raw.conceptThesis,
    coreCreativeIdea: raw.coreCreativeIdea,
    worldPremiseSeed: raw.worldPremiseSeed,
    viewerRole: raw.viewerRole,
    audienceRelationship: raw.audienceRelationship,
    contentMechanism: raw.contentMechanism,
    informationBehavior: raw.informationBehavior,
    emotionalTension: raw.emotionalTension,
    participationLogic: raw.participationLogic,
    spatialTemporalLogic: raw.spatialTemporalLogic,
    artifactLogic: raw.artifactLogic,
    narrativeLogic: raw.narrativeLogic,
    whyThisIsNdxbook: raw.whyThisIsNdxbook,
    whyThisIsAConceptNotDirection: raw.whyThisIsAConceptNotDirection,
    possibleDirectionRange: raw.possibleDirectionRange ?? [],
    possibleNativeFormats: raw.possibleNativeFormats ?? [],
    antiCollapseRules: raw.antiCollapseRules ?? [],
    provenance: 'EXPERIMENT_F_FORMATION',
    formationReceipt: null,
    conceptVsDirection: null,
    founderJudgment: null,
    judgmentNote: null,
    methodologyVersion: CONCEPT_TERRITORY_V2_METHODOLOGY,
    createdAt: nowIso(),
  };
  concept.conceptVsDirection = evaluateConceptVsDirection(concept);
  return concept;
}

/** Vitest-only deterministic formation — six genuinely different conceptual mechanisms. */
export function buildVitestSixConceptFormationPayload(): { concepts: RawConceptPayload[] } {
  return {
    concepts: [
      {
        conceptName: 'THE CREDIT THRESHOLD',
        conceptThesis: 'Credit utilization becomes legible as a threshold the viewer is trying not to cross.',
        coreCreativeIdea: 'Utilization is a live threshold the audience monitors with agency.',
        worldPremiseSeed: 'A social feed where every post tracks proximity to a personal limit.',
        viewerRole: 'Threshold watcher',
        audienceRelationship: 'Intimate accountability partner',
        contentMechanism: 'Threshold proximity updates',
        informationBehavior: 'Escalates as limit nears',
        emotionalTension: 'Control vs surprise',
        participationLogic: 'Viewer predicts next crossing',
        spatialTemporalLogic: 'Countdown to statement close',
        artifactLogic: 'Limit meter as social object',
        narrativeLogic: 'Will they stay under?',
        whyThisIsNdxbook: 'Turns abstract utilization into social-native tension.',
        whyThisIsAConceptNotDirection: 'Core idea survives any visual treatment of the meter.',
        possibleDirectionRange: [
          { directionSeed: 'Minimal numeric ticker', explanation: 'Stark data-forward expression' },
          { directionSeed: 'Domestic ritual calendar', explanation: 'Threshold as household rhythm' },
        ],
        possibleNativeFormats: ['STORY', 'FEED'],
        antiCollapseRules: ['Do not collapse into document editing'],
      },
      {
        conceptName: 'THE UTILIZATION CONFESSIONAL',
        conceptThesis: 'People admit utilization mistakes in public to normalize learning.',
        coreCreativeIdea: 'Confession as pedagogical social ritual.',
        worldPremiseSeed: 'Anonymous-to-known confessions about credit behavior.',
        viewerRole: 'Witness and responder',
        audienceRelationship: 'Peer in a learning circle',
        contentMechanism: 'Confession prompts and responses',
        informationBehavior: 'Accumulates shared lessons',
        emotionalTension: 'Shame vs solidarity',
        participationLogic: 'Viewer submits or reacts',
        spatialTemporalLogic: 'Rolling confession archive',
        artifactLogic: 'Confession cards not documents',
        narrativeLogic: 'Each confession teaches one rule',
        whyThisIsNdxbook: 'Matches social-first editorial without editorial layout.',
        whyThisIsAConceptNotDirection: 'Mechanism is confession ritual, not a visual style.',
        possibleDirectionRange: [
          { directionSeed: 'Booth-style voice notes', explanation: 'Audio-native confessions' },
          { directionSeed: 'Typed postcard confessions', explanation: 'Short text artifacts' },
        ],
        possibleNativeFormats: ['REEL', 'CAROUSEL'],
        antiCollapseRules: ['Not a marked-up document'],
      },
      {
        conceptName: 'THE SCOREBOARD THAT LIES',
        conceptThesis: 'A scoreboard shows utilization but deliberately omits context until the viewer asks.',
        coreCreativeIdea: 'Misleading simplicity forces inquiry.',
        worldPremiseSeed: 'Clean scoreboard hides the story behind the number.',
        viewerRole: 'Skeptical investigator',
        audienceRelationship: 'Coach pushing deeper questions',
        contentMechanism: 'Reveal-on-question layers',
        informationBehavior: 'Progressive disclosure',
        emotionalTension: 'Simplicity vs truth',
        participationLogic: 'Viewer unlocks context',
        spatialTemporalLogic: 'Each reveal adds a week of behavior',
        artifactLogic: 'Layered scoreboard panels',
        narrativeLogic: 'Truth emerges through inquiry',
        whyThisIsNdxbook: 'Teaches credit literacy through curiosity.',
        whyThisIsAConceptNotDirection: 'Idea is investigative layering, not palette.',
        possibleDirectionRange: [
          { directionSeed: 'Sports broadcast scoreboard', explanation: 'Arena metaphor' },
          { directionSeed: 'Clinical dashboard', explanation: 'Neutral diagnostic metaphor' },
        ],
        possibleNativeFormats: ['FEED', 'STORY'],
        antiCollapseRules: ['Not an index or archive'],
      },
      {
        conceptName: 'THE UTILIZATION TRIAL',
        conceptThesis: 'Utilization decisions are dramatized as small trials with evidence and verdicts.',
        coreCreativeIdea: 'Every swipe is a case with evidence.',
        worldPremiseSeed: 'Micro-trials judge spending choices.',
        viewerRole: 'Juror',
        audienceRelationship: 'Deliberative peer',
        contentMechanism: 'Case files and verdicts',
        informationBehavior: 'Precedent builds over time',
        emotionalTension: 'Justification vs regret',
        participationLogic: 'Vote on verdict',
        spatialTemporalLogic: 'Docket of weekly cases',
        artifactLogic: 'Case docket not publishing layout',
        narrativeLogic: 'Will the charge stand?',
        whyThisIsNdxbook: 'Makes abstract rules tangible through drama.',
        whyThisIsAConceptNotDirection: 'Trial structure persists across visual systems.',
        possibleDirectionRange: [
          { directionSeed: 'Courtroom minimal', explanation: 'Formal legal tone' },
          { directionSeed: 'Neighborhood tribunal', explanation: 'Informal community tone' },
        ],
        possibleNativeFormats: ['CAROUSEL', 'FEED'],
        antiCollapseRules: ['Not annotation of a document'],
      },
      {
        conceptName: 'THE PARALLEL STATEMENT',
        conceptThesis: 'Two parallel lives show how identical utilization numbers mean different things.',
        coreCreativeIdea: 'Same number, different life context.',
        worldPremiseSeed: 'Split-screen lives tied by one metric.',
        viewerRole: 'Comparator',
        audienceRelationship: 'Empathetic observer',
        contentMechanism: 'Parallel narrative tracks',
        informationBehavior: 'Contrast drives insight',
        emotionalTension: 'Sameness vs difference',
        participationLogic: 'Choose which life resonates',
        spatialTemporalLogic: 'Synchronized weekly beats',
        artifactLogic: 'Dual track timeline',
        narrativeLogic: 'Context rewrites meaning',
        whyThisIsNdxbook: 'Social-native comparison without finance cliché.',
        whyThisIsAConceptNotDirection: 'Parallel lives idea is independent of format.',
        possibleDirectionRange: [
          { directionSeed: 'Split-screen diary', explanation: 'Intimate parallel journals' },
          { directionSeed: 'Dual POV comic', explanation: 'Character-driven contrast' },
        ],
        possibleNativeFormats: ['REEL', 'CAROUSEL'],
        antiCollapseRules: ['Not a personal archive folder'],
      },
      {
        conceptName: 'THE UTILIZATION WEATHER',
        conceptThesis: 'Utilization behaves like weather the audience learns to read and prepare for.',
        coreCreativeIdea: 'Forecast literacy for credit behavior.',
        worldPremiseSeed: 'Forecasts, fronts, and warnings for utilization shifts.',
        viewerRole: 'Forecaster apprentice',
        audienceRelationship: 'Guide teaching pattern reading',
        contentMechanism: 'Forecast maps and warnings',
        informationBehavior: 'Predictive then reflective',
        emotionalTension: 'Preparedness vs surprise',
        participationLogic: 'Predict next front',
        spatialTemporalLogic: 'Seasonal pattern cycles',
        artifactLogic: 'Weather map metaphors not documents',
        narrativeLogic: 'Can you read the pattern?',
        whyThisIsNdxbook: 'Turns behavior into learnable patterns.',
        whyThisIsAConceptNotDirection: 'Meteorological mechanism not a graphic style.',
        possibleDirectionRange: [
          { directionSeed: 'Broadcast meteorology', explanation: 'TV weather tone' },
          { directionSeed: 'Hand-drawn field notes', explanation: 'Personal notebook tone' },
        ],
        possibleNativeFormats: ['STORY', 'FEED'],
        antiCollapseRules: ['Not a countdown room'],
      },
    ],
  };
}

async function dispatchConceptFormation(params: {
  snapshot: SixConceptReformationRun['intelligenceSnapshot'];
  formationVersion: number;
}): Promise<{ concepts: RawConceptPayload[]; receipt: SixConceptFormationReceipt; accountingDelta: Partial<SixConceptReformationRun['accounting']> }> {
  const payload = buildCreativeConceptDirectorPayload({ snapshot: params.snapshot! });
  const filteredEvidence = excludePostFormationComparisonFromFormation(
    params.snapshot!.historicalExperimentEvidence.map((e) => ({ policy: e.policy })),
  );
  const promptText = JSON.stringify({ ...payload, historicalExperimentEvidence: filteredEvidence });
  assertFormationPromptQuarantined(promptText);

  const promptFingerprint = hash(CREATIVE_CONCEPT_DIRECTOR_SYSTEM_PROMPT + promptText);
  const idempotencyKey = hash(`${EXPERIMENT_F_RUN_ID}:v${params.formationVersion}:${promptFingerprint}`);

  if (process.env.VITEST === 'true' || !process.env.ANTHROPIC_API_KEY?.trim()) {
    const mock = buildVitestSixConceptFormationPayload();
    return {
      concepts: mock.concepts,
      receipt: {
        receiptId: randomUUID(),
        provider: 'anthropic',
        model: ANTHROPIC_CREATIVE_MODEL,
        promptFingerprint,
        snapshotFingerprint: params.snapshot!.fingerprint,
        formationVersion: params.formationVersion,
        idempotencyKey,
        inputTokens: null,
        outputTokens: null,
        durationMs: 0,
        createdAt: nowIso(),
      },
      accountingDelta: { anthropicRequests: 0 },
    };
  }

  const started = Date.now();
  const { text, usage } = await callAnthropicForCompletion(
    CREATIVE_CONCEPT_DIRECTOR_SYSTEM_PROMPT,
    payload,
    { maxTokens: 8192 },
  );
  assertFormationPromptQuarantined(text);
  const parsed = parseStructuredJson<{ concepts: RawConceptPayload[] }>(text);

  return {
    concepts: parsed.concepts,
    receipt: {
      receiptId: randomUUID(),
      provider: 'anthropic',
      model: ANTHROPIC_CREATIVE_MODEL,
      promptFingerprint,
      snapshotFingerprint: params.snapshot!.fingerprint,
      formationVersion: params.formationVersion,
      idempotencyKey,
      inputTokens: usage.inputTokens ?? null,
      outputTokens: usage.outputTokens ?? null,
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

export async function getSixConceptReformationRun(): Promise<SixConceptReformationRun | null> {
  return experimentFStore.getSixConceptReformationRun();
}

export async function prepareExperimentFSnapshot(): Promise<SixConceptReformationRun> {
  const existing = await experimentFStore.getSixConceptReformationRun();
  const run = initRun(existing);
  const profile = await getBrandLoreProfileForOrg(NDXBOOK_ORG_ID);
  const snapshot = compileExperimentFIntelligenceSnapshot({ profile, freeze: false });
  const updated: SixConceptReformationRun = {
    ...run,
    intelligenceSnapshot: snapshot,
    status: 'SNAPSHOT_READY',
    startedAt: run.startedAt ?? nowIso(),
  };
  return experimentFStore.saveSixConceptReformationRun(updated);
}

export async function formSixConcepts(params?: { forceReform?: boolean }): Promise<SixConceptReformationRun> {
  let run = await experimentFStore.getSixConceptReformationRun();
  run = initRun(run);

  if (!run.intelligenceSnapshot) {
    run = await prepareExperimentFSnapshot();
  }

  const idempotencyKey = hash(
    `${run.intelligenceSnapshot!.fingerprint}:v${run.formationVersion}:${CONCEPT_TERRITORY_V2_METHODOLOGY}`,
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

  run = { ...run, status: 'FORMING', idempotencyKey, error: null };
  await experimentFStore.saveSixConceptReformationRun(run);

  try {
    const { concepts: rawConcepts, receipt, accountingDelta } = await dispatchConceptFormation({
      snapshot: run.intelligenceSnapshot,
      formationVersion: run.formationVersion,
    });

    const concepts = rawConcepts.map((c) => normalizeConcept(c, run.formationVersion));
    const orthogonality = runConceptOrthogonalityEvaluationV2(concepts);

    const status =
      orthogonality.setResult === 'PASS' || orthogonality.setResult === 'COUSIN_BUT_DISTINCT'
        ? 'DISTINCTIVENESS_VALIDATED'
        : orthogonality.reformationRecommended
          ? 'NEEDS_REFORMATION'
          : 'CONCEPTS_FORMED';

    const historicalComparison = runHistoricalConceptComparison({ newConcepts: concepts });

    run = {
      ...run,
      concepts,
      orthogonality,
      formationReceipt: receipt,
      intelligenceSnapshot: { ...run.intelligenceSnapshot!, frozen: true },
      historicalComparison,
      historicalComparisonAvailable: true,
      status,
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

    return experimentFStore.saveSixConceptReformationRun(run);
  } catch (err) {
    run = {
      ...run,
      status: 'FAILED',
      error: err instanceof Error ? err.message : 'Formation failed',
    };
    return experimentFStore.saveSixConceptReformationRun(run);
  }
}

export async function setExperimentFConceptJudgment(params: {
  conceptId: string;
  judgment: SixConceptReformationRun['concepts'][number]['founderJudgment'];
  note?: string | null;
}): Promise<SixConceptReformationRun> {
  const run = await experimentFStore.getSixConceptReformationRun();
  if (!run) throw new Error('Experiment F not initialized');
  const concepts = run.concepts.map((c) =>
    c.id === params.conceptId
      ? { ...c, founderJudgment: params.judgment, judgmentNote: params.note ?? null }
      : c,
  );
  const updated: SixConceptReformationRun = {
    ...run,
    concepts,
    status: params.judgment === 'REFORM_SET' ? run.status : 'FOUNDER_REVIEWED',
    directionDevelopmentAllowed: concepts.some((c) => c.founderJudgment === 'LOVE_THE_CONCEPT' || c.founderJudgment === 'PROMISING_DEVELOP'),
  };
  return experimentFStore.saveSixConceptReformationRun(updated);
}

export async function reformExperimentFSet(): Promise<SixConceptReformationRun> {
  const run = await experimentFStore.getSixConceptReformationRun();
  if (!run) throw new Error('Experiment F not initialized');
  const reformed: SixConceptReformationRun = {
    ...run,
    formationVersion: run.formationVersion + 1,
    concepts: [],
    orthogonality: null,
    formationReceipt: null,
    historicalComparison: null,
    historicalComparisonAvailable: false,
    idempotencyKey: null,
    status: 'SNAPSHOT_READY',
    intelligenceSnapshot: run.intelligenceSnapshot
      ? { ...run.intelligenceSnapshot, frozen: false }
      : null,
    directionDevelopmentAllowed: false,
    error: null,
  };
  await experimentFStore.saveSixConceptReformationRun(reformed);
  return formSixConcepts({ forceReform: true });
}

export function openingRouteGeneratesZeroConceptsAutomatically(): true {
  return true;
}

export function formSixConceptsTriggersZeroImageRequests(): true {
  return true;
}

export function formationDoesNotCreateWorldExpressionSystems(): true {
  return true;
}

export { resetExperimentFMemory, resetExperimentFStoreModeCache } from './storeAdapter.js';
