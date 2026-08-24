/**
 * P0.5E.4 — Build generic founder discovery system shell.
 */

import { EMBODIED_CHARACTER_FOUNDER_DISCOVERY_VERSION } from './constants.js';
import { buildCharacterDiscoveryDomains } from './discoveryDomains.js';
import { buildDefaultIntelligenceMap } from './intelligenceMap.js';
import { buildForensicReport } from './forensicAudit.js';
import { evaluateExtendedHumanity } from './humanityEvaluation.js';
import { evaluateCharacterCastingReadiness } from './castingReadiness.js';
import { buildVoiceLabSample } from './voiceLab.js';
import type {
  EmbodiedCharacterFounderDiscoveryRun,
  EmbodiedCharacterFounderDiscoverySystem,
  CharacterRelationshipModel,
} from './types.js';

export function buildEmbodiedCharacterFounderDiscoverySystem(brandId: string): EmbodiedCharacterFounderDiscoverySystem {
  return {
    systemId: `founder-discovery-${brandId}`,
    version: EMBODIED_CHARACTER_FOUNDER_DISCOVERY_VERSION,
    brandId,
    falRequired: false,
    characterGenerationPerformed: false,
    finalFaceSelected: false,
    visualDesignFinalized: false,
  };
}

export function buildEmptyFounderDiscoveryRun(params: {
  runId: string;
  projectId: string;
  brandId: string;
}): EmbodiedCharacterFounderDiscoveryRun {
  const forensicReport = buildForensicReport([]);
  const flawProfile = {
    profileId: 'flaws-default',
    flaws: [],
    bestFriendWouldRoastHerFor: [],
    knowsItsAnnoying: [],
    doesNotRealizeAnnoying: [],
    defendedBadHabit: [],
    learnedMoreThanOnce: [],
    procrastinates: [],
    hypocriticalAreas: [],
  };
  const intelligenceMap = buildDefaultIntelligenceMap();
  const relationships = {
    modelId: 'relationships-default',
    classes: ['BEST_FRIEND', 'GROUP_CHAT', 'COWORKER'] as CharacterRelationshipModel['classes'],
    firstScreenshotGoesTo: null,
    canTellHerShesWrong: null,
    alwaysAnswersCall: null,
    leavesOnRead: null,
    immediatelySuspiciousOf: null,
    embarrassingSoftSpotFor: null,
    whenSheLikesSomeone: null,
    whenMadButClaimsNot: null,
  };
  const publicPrivate = {
    differenceId: 'public-private-default',
    strangersThink: [],
    friendsKnow: [],
    performsUnintentionally: [],
    protects: [],
    embarrassesHer: [],
    sharesEasily: [],
    refusesToShare: [],
    changesWhenCameraOn: null,
    changesWhenCameraForgotten: null,
  };
  const humanityEvaluation = evaluateExtendedHumanity({
    contradictions: [],
    flawProfile,
    intelligenceMap,
    relationships,
    culturalBoundaries: [],
    publicPrivate,
    privateHumanityPresent: false,
  });
  const founderRecognition = {
    evaluationId: 'founder-recognition',
    response: null,
    note: null,
    evaluatedAt: null,
    inferred: false as const,
  };

  return {
    runId: params.runId,
    projectId: params.projectId,
    system: buildEmbodiedCharacterFounderDiscoverySystem(params.brandId),
    forensicReport,
    domains: buildCharacterDiscoveryDomains(),
    scenarios: [],
    ledger: [],
    contradictions: [],
    flawProfile,
    intelligenceMap,
    humorBehavior: {
      behaviorId: 'humor-default',
      mechanisms: ['THE_PAUSE', 'PETTY_OBSERVATION', 'SILENT_REACTION'],
      whatMakesHerLaugh: [],
      neverMakesThisJoke: [],
      funnyIntentionally: null,
      funniestWhenSerious: null,
      laughsAtInappropriateMoments: null,
      absurdReaction: null,
      sarcasmLevel: 'UNSET',
      canLaughAtSelf: null,
      nonverbalFirstHypothesis: true,
    },
    relationships,
    culturalBoundaries: [],
    publicPrivate,
    voiceLabSamples: [buildVoiceLabSample('She noticed the contradiction before anyone else in the group chat did.')],
    visualHypothesisReviews: [],
    styleReasonings: [],
    bookDiscovery: {
      discoveryId: 'book-discovery-default',
      whySheWritesThingsDown: null,
      whyNotTrustMemory: null,
      whenHabitStarted: null,
      bookmarksInsteadOfCommitting: [],
      earnsDogEar: [],
      makesHerFlipBack: [],
      hatesErrata: [],
      bookProvedHerWrong: null,
      resistsAddingBecauseImplies: null,
      revisitsAndCringes: null,
      attachedToPhysicalPages: null,
      refusesToRemove: [],
    },
    truthConfidence: [],
    humanityEvaluation,
    synthesisPreview: null,
    founderRecognition,
    castingReadiness: evaluateCharacterCastingReadiness({
      forensicReport,
      contradictions: [],
      flawProfile,
      intelligenceMap,
      privateHumanityEstablished: false,
      voiceDifferentiationEstablished: false,
      bookRelationshipEstablished: false,
      culturalBoundaryEstablished: false,
      visualHypothesesReviewed: false,
      humanityEvaluation,
      founderRecognition,
    }),
    founderJudgments: [],
    anthropicRequests: 0,
    falRequests: 0,
    updatedAt: new Date().toISOString(),
  };
}

export function noFalInFounderDiscovery(run: EmbodiedCharacterFounderDiscoveryRun): boolean {
  return run.falRequests === 0 && run.system.falRequired === false;
}
