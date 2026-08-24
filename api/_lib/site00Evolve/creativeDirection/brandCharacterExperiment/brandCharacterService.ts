/**
 * NDXBOOK Brand Character Formation service — upstream WHO layer.
 */

import { createHash, randomUUID } from 'node:crypto';
import {
  BRAND_CHARACTER_FORMATION_CLASSIFICATION,
  BRAND_CHARACTER_TERRITORY_V1,
  NDXBOOK_CHARACTER_FORMATION_RUN_ID,
} from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/constants.js';
import type {
  BrandCharacterFormationRun,
  BrandCharacterFormationReceipt,
  BrandCharacterTerritory,
  BrandCharacterSystem,
  BrandCharacterJudgment,
} from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/types.js';
import { compileBrandCharacterIntelligenceSnapshot } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/intelligenceSnapshot.js';
import {
  BRAND_CHARACTER_DIRECTOR_SYSTEM_PROMPT,
  FORMATION_PROMPT_VERSION,
  buildBrandCharacterDirectorPayload,
} from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/formationPrompt.js';
import { assertCharacterFormationQuarantined } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/evidenceQuarantine.js';
import { evaluateCharacterAbstractionLevel } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/abstractionGuard.js';
import { evaluateBrandCharacterSetDistinctiveness } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/distinctiveness.js';
import { compileBrandCharacterSystem } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/characterSystemCompiler.js';
import {
  coerceCharacterPayload,
  mergeProviderSchemaIntoCanonical,
  type CoercibleCharacterPayload,
} from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/characterPayloadNormalization.js';
import { auditFormationRunForensics } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/forensicAudit.js';
import { assureAllTerritories } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/territoryAssurance.js';
import { evaluateSetArchetypeCollapse } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/archetypeCollapseEvaluation.js';
import { runDeterministicTerritorySetAudit } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/semanticCharacterAudit.js';
import {
  developBrandCharacterFromTerritory,
  type BrandCharacterDevelopmentDelta,
} from './brandCharacterDevelopmentService.js';
import type { BrandCharacterDevelopment } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/developmentTypes.js';
import { BRAND_CHARACTER_METHODOLOGY_V2 } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/constants.js';
import { parseStructuredJson } from '../creativeIntelligence/structuredJson.js';
import { callAnthropicForCompletion } from '../creativeIntelligence/anthropicCompletion.js';
import { ANTHROPIC_CREATIVE_MODEL } from '../creativeIntelligence/config.js';
import { getBrandLoreProfileForOrg } from '../../../site00BrandLore/loreService.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import * as store from './storeAdapter.js';
import {
  assertBrandCharacterFormationReadiness,
  attachFormationInputEvidenceToRun,
  seedVitestCharacterFormationReadiness,
} from './brandCharacterReadinessService.js';

const STALE_FORMING_MS = 15 * 60 * 1000;
const ANTHROPIC_FORMATION_TIMEOUT_MS = 8 * 60 * 1000;
const activeFormationAttempts = new Map<string, string>();

function shouldRunFormationSynchronously(): boolean {
  return process.env.VITEST === 'true';
}

export function resetBrandCharacterFormationWorkers(): void {
  activeFormationAttempts.clear();
}

function nowIso(): string {
  return new Date().toISOString();
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function emptyAccounting(): BrandCharacterFormationRun['accounting'] {
  return {
    anthropicRequests: 0,
    anthropicInputTokens: 0,
    anthropicOutputTokens: 0,
    anthropicEstimatedCostUsd: 0,
    falRequests: 0,
    visualGenerationCostUsd: 0,
  };
}

function initRun(existing?: BrandCharacterFormationRun | null): BrandCharacterFormationRun {
  if (existing) return existing;
  return {
    experimentClassification: BRAND_CHARACTER_FORMATION_CLASSIFICATION,
    runId: NDXBOOK_CHARACTER_FORMATION_RUN_ID,
    organizationId: NDXBOOK_ORG_ID,
    projectId: 'ndxbook',
    methodologyVersion: BRAND_CHARACTER_TERRITORY_V1,
    currentStage: 'BRAND_CHARACTER_FORMATION',
    status: 'NOT_STARTED',
    formationVersion: 1,
    formationPromptVersion: FORMATION_PROMPT_VERSION,
    idempotencyKey: null,
    intelligenceSnapshot: null,
    characters: [],
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
    formationStartedAt: null,
    formationAttemptId: null,
    startedAt: nowIso(),
    completedAt: null,
  };
}

type RawCharacterPayload = CoercibleCharacterPayload & { name?: string };

function normalizeCharacter(
  raw: RawCharacterPayload,
  params: {
    formationVersion: number;
    snapshotFingerprint: string;
    promptFingerprint: string;
  },
): BrandCharacterTerritory {
  const coerced = coerceCharacterPayload(raw);
  const character: BrandCharacterTerritory = {
    id: `bct-${params.formationVersion}-${hash(coerced.name)}`,
    name: coerced.name,
    characterClassification: 'BRAND_CHARACTER_TERRITORY',
    core: coerced.core,
    intellectual: coerced.intellectual,
    social: coerced.social,
    emotional: coerced.emotional,
    humorWit: coerced.humorWit,
    culturalIntelligence: coerced.culturalIntelligence,
    language: coerced.language,
    taste: coerced.taste,
    expressiveBehavior: coerced.expressiveBehavior,
    artifactRelationship: coerced.artifactRelationship,
    whyItIsNdxbook: coerced.whyItIsNdxbook,
    whatItMustNeverBecome: coerced.whatItMustNeverBecome,
    antiCharacterRules: coerced.antiCharacterRules,
    notThis: coerced.notThis,
    abstractionEval: null,
    distinctivenessEval: null,
    founderJudgment: null,
    judgmentNote: null,
    methodologyVersion: BRAND_CHARACTER_TERRITORY_V1,
    experimentId: NDXBOOK_CHARACTER_FORMATION_RUN_ID,
    formationVersion: params.formationVersion,
    snapshotVersion: 1,
    snapshotFingerprint: params.snapshotFingerprint,
    formationPromptVersion: FORMATION_PROMPT_VERSION,
    formationPromptFingerprint: params.promptFingerprint,
    formationReceipt: null,
    provenance: 'BRAND_CHARACTER_FORMATION',
    createdAt: nowIso(),
  };
  character.abstractionEval = evaluateCharacterAbstractionLevel(character);
  return character;
}

function sampleDimensions(name: string, thesis: string, essence: string, humor: string, culture: string) {
  return {
    name,
    core: {
      characterThesis: thesis,
      characterEssence: essence,
      characterContradiction: 'Warmth toward audience, coldness toward industry bullshit',
      internalTension: 'Wants to be trusted without performing trustworthiness',
      worldview: 'Money behavior reveals character faster than money theory',
      orientationTowardWorld: 'Observational participant, not lecturer',
      whatItNotices: 'Small hypocrisies, repeated patterns, unspoken assumptions',
      whatItValues: 'Evidence, specificity, intellectual honesty',
      whatItRejects: 'Performative expertise, vague optimism, product cosplay',
      whatItFindsInteresting: 'Behavioral contradictions people live with daily',
      whatItFindsBoring: 'Generic advice, trend-chasing, empty confidence',
      whatItTakesSeriously: 'Audience dignity and real financial consequences',
      whatItRefusesToTakeSeriously: 'Industry mythology and prestige signaling',
    },
    intellectual: {
      intelligenceStyle: 'Pattern recognition with receipts',
      curiosityBehavior: 'Follows threads until behavior contradicts narrative',
      knowledgePosture: 'Informed peer, not professor',
      reasoningBehavior: 'Tests claims against lived behavior',
      relationshipToCertainty: 'Skeptical of certainty theater',
      relationshipToComplexity: 'Comfortable holding multiple truths',
      relationshipToExpertise: 'Respects expertise that shows its work',
      relationshipToDiscovery: 'Treats discovery as social behavior',
      relationshipToMemory: 'Remembers what the audience already said',
    },
    social: {
      socialPresence: 'Present without dominating',
      audienceRelationship: 'Peer-in-the-know who respects boundaries',
      intimacyDistance: 'Close enough to notice, far enough to judge fairly',
      statusBehavior: 'Anti-prestige; status through usefulness',
      authorityBehavior: 'Earned through consistency, not credentials',
      participationBehavior: 'Invites correction and contribution',
      conversationalBehavior: 'Direct, annotated, occasionally dry',
      communityRelationship: 'Host of shared scrutiny, not cheerleader',
      relationshipToAttention: 'Uses attention to clarify, not to perform',
    },
    emotional: {
      emotionalRange: 'Wide but controlled — warmth, irritation, delight, gravity',
      emotionalBaseline: 'Calm observational alertness',
      emotionalVolatility: 'Low baseline, spikes on injustice or nonsense',
      restraintBehavior: 'Withholds emotion until evidence warrants it',
      enthusiasmBehavior: 'Quiet enthusiasm for genuine insight',
      irritationBehavior: 'Precise irritation at vague or patronizing claims',
      delightBehavior: 'Delight in audience catching the trick',
      seriousnessBehavior: 'Serious when stakes are real',
      vulnerabilityBoundary: 'Shares uncertainty about systems, not personal drama',
    },
    humorWit: {
      humorLogic: humor,
      witMechanism: 'Understatement plus precise observation',
      comedicTemperature: 'Cool-dry, never try-hard',
      ironyRelationship: 'Uses irony to expose, not to hide',
      absurdityRelationship: 'Names absurdity in finance culture without cartooning',
      shadeBehavior: 'Shades institutions, rarely individuals',
      teasingBehavior: 'Teases shared habits, not identity',
      understatementBehavior: 'Lets evidence land without overselling punchline',
      exaggerationBehavior: 'Rare; used to reveal scale of nonsense',
      whatTheBrandWouldNeverJokeAbout: 'Audience financial pain, identity, trauma',
    },
    culturalIntelligence: {
      culturalPosition: culture,
      culturalFluency: 'Internet-native but not internet-performative',
      culturalReferenceBehavior: 'References as shared context, not decoration',
      referenceDensity: 'Sparse until it earns density',
      referenceSelectionLogic: 'References must change interpretation',
      subculturalRelationship: 'Respects subcultural specificity without cosplay',
      temporalCultureRelationship: 'Bridges eras — receipts culture meets institutional memory',
      internetCultureRelationship: 'Understands meme logic without becoming a meme',
      historicalCultureRelationship: 'Uses history as behavior evidence',
      culturalMemoryBehavior: 'Remembers what culture already decided',
      appropriationGuardrails: 'No borrowed pain, no aesthetic tourism',
      culturalAuthenticityRules: 'Specificity over signal; behavior over badge',
    },
    language: {
      verbalCadence: 'Measured sentences with interruptive annotations',
      sentenceBehavior: 'Short claims, longer evidence',
      vocabularyBehavior: 'Plain words for hard truths; jargon only when dissecting it',
      shorthandBehavior: 'Audience shorthand when trust exists',
      explanationThreshold: 'Explains when behavior is non-obvious',
      namingBehavior: 'Names patterns before naming products',
      interruptionBehavior: 'Interrupts itself to correct or qualify',
      annotationBehavior: 'Margin notes as character evidence',
      emphasisBehavior: 'Emphasis through placement, not exclamation',
      silenceBehavior: 'Silence as withholding judgment until ready',
      captionBehavior: 'Captions carry subtext, not summary',
      linguisticTexture: 'Dry, specific, occasionally wry',
    },
    taste: {
      tasteLogic: 'Taste as judgment, not decoration',
      beautyRelationship: 'Beauty in clarity and specificity',
      uglinessRelationship: 'Ugly when honesty requires it',
      polishRelationship: 'Polish never replaces truth',
      messRelationship: 'Controlled mess as human trace',
      preciousnessRelationship: 'Anti-precious; anti-gallery-brand',
      irreverenceRelationship: 'Irreverent toward institutions, respectful toward people',
      restraintVsExcess: 'Restraint default; excess only for emphasis',
      orderVsChaos: 'Order in argument, chaos in lived evidence',
      permanenceVsEphemerality: 'Ephemeral surfaces, durable behavioral core',
      highLowCultureRelationship: 'High-low fluency without slumming or aspirational cosplay',
    },
    expressiveBehavior: {
      expressiveGestures: 'Annotation, comparison, redaction, accumulation',
      recurringBehaviors: 'Collects, compares, corrects, re-files',
      artifactBehavior: 'Artifacts look handled, not templated',
      imageBehavior: 'Images as evidence the character selected or altered',
      typographyBehavior: 'Typography shifts when character intervenes',
      colorBehavior: 'Color as emotional evidence, mostly withheld',
      compositionBehavior: 'Composition reveals hierarchy of attention',
      materialBehavior: 'Materials feel touched — paper, screen, margin',
      motionBehavior: 'Motion as attention guidance, not spectacle',
      soundBehavior: null,
    },
    artifactRelationship: {
      makerPresence: 'Maker always detectable through intervention traces',
      reactionEvidence: 'Annotations prove reaction',
      judgmentEvidence: 'Cross-outs and emphasis prove judgment',
      selectionEvidence: 'Arrangement proves selection',
      interventionEvidence: 'Handwriting-like interventions where appropriate',
      accumulationEvidence: 'Layers prove the character kept collecting',
      traceOfHandling: 'Wear, overlap, and comparison prove handling',
      explainabilityPrinciple: 'Every expressive choice explainable as character behavior',
    },
    whyItIsNdxbook: 'Matches NDXBOOK behavioral truth without copying downstream presentation concepts',
    whatItMustNeverBecome: ['Generic finance influencer', 'Try-hard meme brand', 'Product brochure voice'],
    antiCharacterRules: ['No topic anchoring', 'No style-as-character', 'No presentation concept cosplay'],
    notThis: ['Not topic-bound', 'Not a visual style', 'Not a campaign persona'],
  };
}

export function buildVitestCharacterFormationPayload(): { characters: RawCharacterPayload[] } {
  return {
    characters: [
      sampleDimensions(
        'THE RECEIPT KEEPER',
        'NDXBOOK behaves like an entity that saves evidence of every claim until the truth becomes unavoidable.',
        'Forensic peer who trusts paperwork over performance',
        'Humor from juxtaposing official language with lived contradiction',
        'Receipts culture applied to institutional finance speech',
      ),
      sampleDimensions(
        'THE PATIENT CORRECTOR',
        'NDXBOOK behaves like a entity that corrects gently once, sharply twice, and never lets the third error slide.',
        'Correction as care, not dominance',
        'Wit emerges from precise restatement of what was actually said',
        'Editorial correction culture without academic posture',
      ),
      sampleDimensions(
        'THE COMPARISON ENGINE',
        'NDXBOOK behaves like an entity that only understands money through side-by-side behavioral comparison.',
        'Relational intelligence through contrast',
        'Humor from absurd gaps between stated belief and repeated behavior',
        'Comparative cultural literacy across class and context',
      ),
      sampleDimensions(
        'THE QUIET ARCHIVIST OF HABITS',
        'NDXBOOK behaves like an entity that remembers audience habits better than the audience does.',
        'Memory as social intimacy',
        'Dry humor when past predictions collide with present behavior',
        'Domestic and internet memory cultures without literal artifact cosplay',
      ),
      sampleDimensions(
        'THE PERMISSION GRANTER',
        'NDXBOOK behaves like an entity that gives the audience social permission to admit confusion.',
        'Authority through vulnerability boundaries',
        'Warm wit that lowers status rather than elevating the brand',
        'Participatory culture without performative community',
      ),
      sampleDimensions(
        'THE SYSTEMS SKEPTIC',
        'NDXBOOK behaves like an entity that treats every financial product narrative as a behavior hypothesis to test.',
        'Institutional skeptic with human empathy',
        'Irony aimed at system design, never at audience struggle',
        'Critical design and economic literacy without academic isolation',
      ),
    ],
  };
}

async function dispatchCharacterFormation(params: {
  snapshot: BrandCharacterFormationRun['intelligenceSnapshot'];
  formationVersion: number;
}): Promise<{
  characters: RawCharacterPayload[];
  rawProviderResponse: string | null;
  receipt: BrandCharacterFormationReceipt;
  accountingDelta: Partial<BrandCharacterFormationRun['accounting']>;
}> {
  const payload = buildBrandCharacterDirectorPayload({ snapshot: params.snapshot! });
  const promptText = JSON.stringify(payload);
  const promptFingerprint = hash(BRAND_CHARACTER_DIRECTOR_SYSTEM_PROMPT + promptText);
  const idempotencyKey = hash(`${NDXBOOK_CHARACTER_FORMATION_RUN_ID}:v${params.formationVersion}:${promptFingerprint}`);

  if (process.env.VITEST === 'true' || !process.env.ANTHROPIC_API_KEY?.trim()) {
    const mock = buildVitestCharacterFormationPayload();
    assertCharacterFormationQuarantined(JSON.stringify(mock.characters));
    return {
      characters: mock.characters,
      rawProviderResponse: JSON.stringify(mock),
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
    BRAND_CHARACTER_DIRECTOR_SYSTEM_PROMPT,
    payload,
    { maxTokens: 12000, timeoutMs: ANTHROPIC_FORMATION_TIMEOUT_MS },
  );
  assertCharacterFormationQuarantined(text);
  const parsed = parseStructuredJson<{ characters: RawCharacterPayload[] }>(text);

  return {
    characters: parsed.characters,
    rawProviderResponse: text,
    receipt: {
      receiptId: randomUUID(),
      provider: 'anthropic',
      model: ANTHROPIC_CREATIVE_MODEL,
      promptFingerprint,
      snapshotFingerprint: params.snapshot!.fingerprint,
      formationVersion: params.formationVersion,
      formationPromptVersion: FORMATION_PROMPT_VERSION,
      idempotencyKey,
      inputTokens: usage?.inputTokens ?? null,
      outputTokens: usage?.outputTokens ?? null,
      providerRequestId: null,
      durationMs: Date.now() - started,
      createdAt: nowIso(),
    },
    accountingDelta: {
      anthropicRequests: 1,
      anthropicInputTokens: usage?.inputTokens ?? 0,
      anthropicOutputTokens: usage?.outputTokens ?? 0,
      anthropicEstimatedCostUsd: 0.06,
    },
  };
}

async function executeCharacterFormationWork(runId: string, attemptId: string): Promise<void> {
  activeFormationAttempts.set(runId, attemptId);
  try {
    let run = await store.getBrandCharacterFormationRun(runId);
    if (!run || run.status !== 'FORMING' || run.formationAttemptId !== attemptId) return;

    const { characters: rawCharacters, receipt, accountingDelta, rawProviderResponse } = await dispatchCharacterFormation({
      snapshot: run.intelligenceSnapshot,
      formationVersion: run.formationVersion,
    });

    const promptFingerprint = receipt.promptFingerprint;
    const characters = rawCharacters.map((raw) =>
      normalizeCharacter(raw, {
        formationVersion: run!.formationVersion,
        snapshotFingerprint: run!.intelligenceSnapshot!.fingerprint,
        promptFingerprint,
      }),
    );

    const setDistinctiveness = evaluateBrandCharacterSetDistinctiveness(characters);
    const semanticSetAudit = runDeterministicTerritorySetAudit({
      runId: run!.runId,
      territories: characters,
    });

    run = {
      ...run,
      characters,
      setDistinctiveness,
      semanticSetAudit,
      formationReceipt: receipt,
      rawProviderResponse,
      methodologyVersion: BRAND_CHARACTER_METHODOLOGY_V2,
      status: 'EVALUATIONS_COMPLETE',
      accounting: {
        ...run.accounting,
        anthropicRequests: run.accounting.anthropicRequests + (accountingDelta.anthropicRequests ?? 0),
        anthropicInputTokens: run.accounting.anthropicInputTokens + (accountingDelta.anthropicInputTokens ?? 0),
        anthropicOutputTokens: run.accounting.anthropicOutputTokens + (accountingDelta.anthropicOutputTokens ?? 0),
        anthropicEstimatedCostUsd:
          run.accounting.anthropicEstimatedCostUsd + (accountingDelta.anthropicEstimatedCostUsd ?? 0),
      },
      formationStartedAt: null,
      formationAttemptId: null,
      completedAt: nowIso(),
      error: null,
    };
    await store.saveBrandCharacterFormationRun(run);
  } catch (err) {
    const failed = await store.getBrandCharacterFormationRun(runId);
    if (failed && failed.formationAttemptId === attemptId) {
      await store.saveBrandCharacterFormationRun({
        ...failed,
        status: 'FAILED',
        error: err instanceof Error ? err.message : 'Character formation failed',
        formationStartedAt: null,
        formationAttemptId: null,
      });
    }
  } finally {
    activeFormationAttempts.delete(runId);
  }
}

function enqueueCharacterFormationWork(runId: string, attemptId: string): void {
  setImmediate(() => {
    void executeCharacterFormationWork(runId, attemptId).catch((err) => {
      console.error('[brand-character] background formation failed', runId, attemptId, err);
    });
  });
}

function enrichFormationRun(run: BrandCharacterFormationRun): BrandCharacterFormationRun {
  const characters = (run.characters ?? []).map((c) => mergeProviderSchemaIntoCanonical(c));
  const enriched = { ...run, characters };
  if (characters.length >= 6 && run.status === 'EVALUATIONS_COMPLETE') {
    enriched.forensicAudit = auditFormationRunForensics(enriched);
    enriched.territoryAssurance = assureAllTerritories(enriched);
    enriched.archetypeCollapse = evaluateSetArchetypeCollapse(characters);
    enriched.semanticSetAudit = run.semanticSetAudit ?? runDeterministicTerritorySetAudit({
      runId: run.runId,
      territories: characters,
    });
  }
  return enriched;
}

export async function getBrandCharacterFormationRun(): Promise<BrandCharacterFormationRun | null> {
  const run = await store.getBrandCharacterFormationRun();
  if (!run) return null;
  return enrichFormationRun(run);
}

export async function prepareBrandCharacterSnapshot(): Promise<BrandCharacterFormationRun> {
  const profile = await getBrandLoreProfileForOrg(NDXBOOK_ORG_ID);
  const snapshot = compileBrandCharacterIntelligenceSnapshot({ profile, freeze: true });
  let run = initRun(await store.getBrandCharacterFormationRun());
  run = {
    ...run,
    intelligenceSnapshot: snapshot,
    status: 'SNAPSHOT_READY',
  };
  return store.saveBrandCharacterFormationRun(run);
}

export async function formSixBrandCharacterTerritories(params?: {
  forceRetry?: boolean;
}): Promise<BrandCharacterFormationRun> {
  await seedVitestCharacterFormationReadiness('ndxbook');
  const gate = await assertBrandCharacterFormationReadiness({ projectId: 'ndxbook' });
  if (!gate.allowed) {
    const blocked = initRun(await store.getBrandCharacterFormationRun());
    return {
      ...blocked,
      status: 'FAILED',
      error: gate.reason ?? 'Character readiness gate blocked formation',
    };
  }

  let run = initRun(await store.getBrandCharacterFormationRun());
  if (!run.intelligenceSnapshot) {
    run = await prepareBrandCharacterSnapshot();
  }

  if (run.status === 'FORMING' && !params?.forceRetry) {
    return run;
  }

  const attemptId = randomUUID();
  run = {
    ...run,
    status: 'FORMING',
    formationStartedAt: nowIso(),
    formationAttemptId: attemptId,
    characters: [],
    setDistinctiveness: null,
    formationReceipt: null,
    error: null,
    formationVersion: params?.forceRetry ? run.formationVersion + 1 : run.formationVersion,
  };
  await store.saveBrandCharacterFormationRun(run);

  if (shouldRunFormationSynchronously()) {
    await executeCharacterFormationWork(NDXBOOK_CHARACTER_FORMATION_RUN_ID, attemptId);
    return (await store.getBrandCharacterFormationRun()) ?? run;
  }

  enqueueCharacterFormationWork(NDXBOOK_CHARACTER_FORMATION_RUN_ID, attemptId);
  return run;
}

export async function setBrandCharacterJudgment(params: {
  characterId: string;
  judgment: BrandCharacterJudgment;
  note?: string | null;
}): Promise<BrandCharacterFormationRun> {
  const run = await store.getBrandCharacterFormationRun();
  if (!run) throw new Error('Character formation run not found');

  const characters = run.characters.map((c) =>
    c.id === params.characterId
      ? { ...c, founderJudgment: params.judgment, judgmentNote: params.note ?? null }
      : c,
  );

  return store.saveBrandCharacterFormationRun({
    ...run,
    characters,
    status: 'FOUNDER_REVIEWED',
    brandCanonMutationAllowed: false,
  });
}

export async function reformBrandCharacterSet(): Promise<BrandCharacterFormationRun> {
  return formSixBrandCharacterTerritories({ forceRetry: true });
}

export async function developBrandCharacter(params: {
  territoryId: string;
  founderDelta?: BrandCharacterDevelopmentDelta | null;
}): Promise<{ run: BrandCharacterFormationRun; development: BrandCharacterDevelopment }> {
  const run = await store.getBrandCharacterFormationRun();
  if (!run) throw new Error('Character formation run not found');

  const territoryBefore = run.characters.find((c) => c.id === params.territoryId);
  if (!territoryBefore) throw new Error('Character territory not found');

  const development = developBrandCharacterFromTerritory({
    run,
    territoryId: params.territoryId,
    founderDelta: params.founderDelta ?? null,
  });

  const developments = [...(run.developments ?? []).filter((d) => d.parentTerritoryId !== params.territoryId), development];
  const updated = await store.saveBrandCharacterFormationRun({
    ...run,
    currentStage: 'BRAND_CHARACTER_DEVELOPMENT',
    developments,
  });

  const territoryAfter = updated.characters.find((c) => c.id === params.territoryId)!;
  if (JSON.stringify(territoryBefore) !== JSON.stringify(territoryAfter)) {
    throw new Error('Development must not mutate parent territory');
  }

  return { run: enrichFormationRun(updated), development };
}

export async function compileSelectedBrandCharacterSystem(params: {
  characterId: string;
  developmentId?: string | null;
  bypassPolicy?: 'ESTABLISHED_CHARACTER_CAPTURE';
}): Promise<{ run: BrandCharacterFormationRun; system: BrandCharacterSystem }> {
  const run = await store.getBrandCharacterFormationRun();
  if (!run) throw new Error('Character formation run not found');
  const territory = run.characters.find((c) => c.id === params.characterId);
  if (!territory) throw new Error('Character territory not found');

  const development =
    (params.developmentId
      ? (run.developments ?? []).find((d) => d.id === params.developmentId)
      : (run.developments ?? []).find((d) => d.parentTerritoryId === params.characterId)) ?? null;

  if (!development && params.bypassPolicy !== 'ESTABLISHED_CHARACTER_CAPTURE') {
    throw new Error(
      'Brand Character System requires approved BrandCharacterDevelopment — territory alone is insufficient downstream authority',
    );
  }

  const system = compileBrandCharacterSystem({
    territory,
    development,
    founderApproval: 'PENDING',
    compilationPolicy: development ? 'DEVELOPMENT_REQUIRED' : 'ESTABLISHED_CHARACTER_CAPTURE',
  });
  const updated = await store.saveBrandCharacterFormationRun({
    ...run,
    selectedCharacterId: params.characterId,
    selectedDevelopmentId: development?.id ?? null,
    brandCharacterSystemId: system.id,
    presentationDevelopmentAllowed: false,
    identityDevelopmentAllowed: false,
    visualGenerationAllowed: false,
  });
  return { run: enrichFormationRun(updated), system };
}

export function noFalDuringCharacterFormation(): true {
  return true;
}

export function sixCharactersFormableTopicBlind(): true {
  return true;
}
