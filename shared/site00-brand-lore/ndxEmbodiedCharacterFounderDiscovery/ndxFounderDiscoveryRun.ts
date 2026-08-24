/**
 * P0.5E.4 — Build NDX Founder Character Discovery run from P0.5E.3 foundation.
 */

import { randomUUID } from 'node:crypto';
import { buildEmptyFounderDiscoveryRun } from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/founderDiscoveryRun.js';
import { appendLedgerEntry } from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/discoveryLedger.js';
import { buildVisualHypothesisReview } from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/visualAndStyle.js';
import { evaluateExtendedHumanity } from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/humanityEvaluation.js';
import { evaluateCharacterCastingReadiness } from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/castingReadiness.js';
import { buildVoiceLabSample } from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/voiceLab.js';
import type {
  CharacterContradiction,
  CharacterFlawEntry,
  CulturalKnowledgeBoundary,
  IntelligenceDimension,
} from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/types.js';
import { buildNdxEmbodiedCharacterDiscoveryRun } from '../ndxEmbodiedCharacterDiscovery/ndxEmbodiedCharacterAdapter.js';
import { VISUAL_TENDENCY_HYPOTHESES } from '../ndxEmbodiedCharacterDiscovery/constants.js';
import type { NdxEmbodiedCharacterDiscoveryRun } from '../ndxEmbodiedCharacterDiscovery/types.js';
import { auditNdxEmbodiedCharacterFoundation } from './ndxForensicAudit.js';
import { buildNdxCharacterDiscoveryScenarios } from './ndxDiscoveryScenarios.js';
import { NDX_FOUNDER_CHARACTER_DISCOVERY_RUN_ID } from './constants.js';
import type { NdxFounderCharacterDiscoveryRun } from './types.js';
import { applyScenarioFounderResponse } from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/discoveryScenarios.js';
import { migrateRunToCalibrationState } from './ndxCalibrationAdapter.js';
import { FOUNDER_CHARACTER_CALIBRATION_VERSION } from '../../site00-studio-world-production/founderCharacterCalibration/constants.js';
import type {
  CharacterTruthConfidenceState,
  FounderDiscoveryJudgment,
  TraitAuthorityState,
} from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/types.js';

function seedContradictionsFromBase(base: NdxEmbodiedCharacterDiscoveryRun): CharacterContradiction[] {
  return base.contradictions.majorContradictions.map((c, i) => {
    const parts = c.split(' ↔ ');
    return {
      contradictionId: `seed-contradiction-${i}`,
      traitA: parts[0] ?? c,
      traitB: parts[1] ?? 'context-dependent',
      whyBothAreTrue: 'System-seeded proposal — founder must confirm contextual truth.',
      whenAAppears: 'Under social pressure',
      whenBAppears: 'In private research mode',
      doesSheRecognizeContradiction: true,
      doesSheFindItEmbarrassing: false,
      doesAnyoneCallHerOutOnIt: true,
      founderAuthority: 'SYSTEM_SEEDED',
      confidence: 'HYPOTHESIS',
      genericAdjectivePair: false,
    };
  });
}

function seedFlawsFromBase(base: NdxEmbodiedCharacterDiscoveryRun): CharacterFlawEntry[] {
  return [
    {
      flawId: 'seed-annoying',
      category: 'ANNOYING_TRAIT',
      description: base.contradictions.traitOthersFindAnnoying,
      founderAuthority: 'SYSTEM_SEEDED',
      secretlyFlattering: false,
    },
    {
      flawId: 'seed-regret',
      category: 'ACTUAL_FLAW',
      description: base.contradictions.behaviorsSheRegrets[0] ?? 'Posted before she had the full receipt',
      founderAuthority: 'SYSTEM_SEEDED',
      secretlyFlattering: false,
    },
  ];
}

function seedIntelligenceFromBase(base: NdxEmbodiedCharacterDiscoveryRun) {
  const dimensions = {
    CONTRADICTION_DETECTION: 'STRONG',
    PATTERN_RECOGNITION: 'STRONG',
    CULTURAL_MEMORY: 'STRONG',
    SOCIAL_INTELLIGENCE: 'AVERAGE',
    EMOTIONAL_INTELLIGENCE: 'AVERAGE',
    ACADEMIC_KNOWLEDGE: 'AVERAGE',
    PRACTICAL_PROBLEM_SOLVING: 'AVERAGE',
    FINANCIAL_REASONING: 'WEAK',
    MEDIA_LITERACY: 'STRONG',
    VISUAL_INTELLIGENCE: 'AVERAGE',
    TECHNICAL_REASONING: 'WEAK',
    RELATIONSHIP_JUDGMENT: 'WEAK',
    SELF_AWARENESS: 'AVERAGE',
    SPATIAL_REASONING: 'WEAK',
    MEMORY: 'STRONG',
    RESEARCH_SKILL: 'STRONG',
  } as Record<IntelligenceDimension, 'STRONG' | 'AVERAGE' | 'WEAK' | 'UNSET'>;

  return {
    mapId: 'ndx-intelligence-seed',
    dimensions,
    embarrassinglyBadAt: base.intelligence.blindSpots,
    falseConfidenceAreas: base.intelligence.falseConfidenceAreas,
    researchesInsteadOfPretending: base.culturalLife.thingsSheResearchesInsteadOfPretending,
    couldTalkForHours: base.intelligence.strongestIntelligences,
    admitsNotKnowingEnough: ['Regional subcultures outside her lane', 'Technical domains she has not researched'],
  };
}

function seedCulturalBoundaries(base: NdxEmbodiedCharacterDiscoveryRun): CulturalKnowledgeBoundary[] {
  return [
    {
      boundaryId: 'cultural-lane',
      topic: 'Communities outside her established fictional life',
      level: 'DO_NOT_PRETEND',
      researchNotPretendPhrase: "I don't know enough about that — I need to read more.",
      fabricatedLivedExperience: false,
    },
    {
      boundaryId: 'cultural-fluency',
      topic: base.culturalLife.generationalContext,
      level: 'LIVED_FLUENCY',
      researchNotPretendPhrase: null,
      fabricatedLivedExperience: false,
    },
  ];
}

export function buildNdxFounderCharacterDiscoveryRun(
  base: NdxEmbodiedCharacterDiscoveryRun = buildNdxEmbodiedCharacterDiscoveryRun('ndxbook'),
): NdxFounderCharacterDiscoveryRun {
  const shell = buildEmptyFounderDiscoveryRun({
    runId: NDX_FOUNDER_CHARACTER_DISCOVERY_RUN_ID,
    projectId: base.projectId,
    brandId: 'ndxbook',
  });

  const forensicReport = auditNdxEmbodiedCharacterFoundation(base);
  let ledger = shell.ledger;
  for (const t of forensicReport.traits) {
    ledger = appendLedgerEntry({
      ledger,
      proposal: t.statement,
      source: 'SYSTEM_SEEDED',
      currentStatement: t.statement,
      authority: 'SYSTEM_SEEDED',
      confidence: 'HYPOTHESIS',
    });
  }

  const contradictions = seedContradictionsFromBase(base);
  const flaws = seedFlawsFromBase(base);
  const intelligenceMap = seedIntelligenceFromBase(base);
  const culturalBoundaries = seedCulturalBoundaries(base);
  const visualHypothesisReviews = VISUAL_TENDENCY_HYPOTHESES.map((h) => buildVisualHypothesisReview(h));

  const flawProfile = {
    ...shell.flawProfile,
    flaws,
    bestFriendWouldRoastHerFor: [base.contradictions.traitOthersFindAnnoying],
    knowsItsAnnoying: ['Will not let a wrong statement slide in group chat'],
    procrastinates: [base.everydayLife.procrastination],
    hypocriticalAreas: base.contradictions.recurringBlindSpots,
  };

  const humorBehavior = {
    ...shell.humorBehavior,
    whatMakesHerLaugh: base.humor.whatMakesHerLaugh,
    neverMakesThisJoke: base.humor.thingsSheWouldNeverJokeAbout,
  };

  const publicPrivate = {
    ...shell.publicPrivate,
    strangersThink: ['Cooler and more unbothered than she actually is'],
    friendsKnow: ['She cares deeply whether her Pages land', 'She is funniest when she thinks she is being serious'],
    protects: ['How hard she works before posting anything'],
    changesWhenCameraForgotten: 'Most interesting when she forgets she is being observed',
  };

  const bookDiscovery = {
    ...shell.bookDiscovery,
    whySheWritesThingsDown: base.bookRelationship.whySheKeepsIt.join('; '),
    whyNotTrustMemory: 'Does not trust recall alone — bookmarks mentally and physically',
    bookmarksInsteadOfCommitting: ['Half-formed theories', 'Contradictions she has not resolved'],
    earnsDogEar: ['Pages that changed her mind', 'Receipts that proved her wrong'],
    makesHerFlipBack: ['Old Pages that now embarrass her', 'Predictions she got right'],
    hatesErrata: ['When Errata implies she was careless rather than learning'],
  };

  const humanityEvaluation = evaluateExtendedHumanity({
    contradictions,
    flawProfile,
    intelligenceMap,
    relationships: shell.relationships,
    culturalBoundaries,
    publicPrivate,
    privateHumanityPresent: base.everydayLife.guiltyPleasures.length > 0,
  });

  const founderRecognition = shell.founderRecognition;

  const baseRun: NdxFounderCharacterDiscoveryRun = {
    ...shell,
    runId: NDX_FOUNDER_CHARACTER_DISCOVERY_RUN_ID,
    ndxBookTerminologyIntegrated: true,
    forensicReport,
    scenarios: buildNdxCharacterDiscoveryScenarios(),
    ledger,
    contradictions,
    flawProfile,
    intelligenceMap,
    humorBehavior,
    culturalBoundaries,
    publicPrivate,
    bookDiscovery,
    visualHypothesisReviews,
    voiceLabSamples: [
      buildVoiceLabSample('That cannot be right — someone would have said something by now.'),
    ],
    humanityEvaluation,
    castingReadiness: evaluateCharacterCastingReadiness({
      forensicReport,
      contradictions,
      flawProfile,
      intelligenceMap,
      privateHumanityEstablished: true,
      voiceDifferentiationEstablished: false,
      bookRelationshipEstablished: Boolean(bookDiscovery.whySheWritesThingsDown),
      culturalBoundaryEstablished: true,
      visualHypothesesReviewed: false,
      humanityEvaluation,
      founderRecognition,
    }),
    updatedAt: new Date().toISOString(),
  };

  const calibrationState = migrateRunToCalibrationState(baseRun);
  return {
    ...baseRun,
    calibrationVersion: FOUNDER_CHARACTER_CALIBRATION_VERSION,
    calibrationState,
    humanReadableSynthesis: null,
  };
}

export function applyFounderTraitJudgment(
  run: NdxFounderCharacterDiscoveryRun,
  params: {
    traitId: string;
    judgment: FounderDiscoveryJudgment;
    revision?: string;
    note?: string;
  },
): NdxFounderCharacterDiscoveryRun {
  const trait = run.forensicReport.traits.find((t) => t.traitId === params.traitId);
  if (!trait) throw new Error('Trait not found');

  let authority: TraitAuthorityState = 'INFERRED_PENDING_CONFIRMATION';
  let confidence: CharacterTruthConfidenceState = 'EMERGING';
  let currentStatement = trait.statement;

  if (params.judgment === 'YES_EXACTLY') {
    authority = 'FOUNDER_CONFIRMED';
    confidence = 'STRONG';
  } else if (params.judgment === 'NO' || params.judgment === 'ABSOLUTELY_NOT') {
    authority = 'FOUNDER_REJECTED';
    confidence = 'REJECTED';
  } else if (params.judgment === 'CLOSE_BUT' && params.revision) {
    authority = 'FOUNDER_REVISED';
    confidence = 'STRONG';
    currentStatement = params.revision;
  } else if (params.judgment === 'SOMETHING_ELSE' && params.revision) {
    authority = 'FOUNDER_ADDED';
    confidence = 'EMERGING';
    currentStatement = params.revision;
  } else if (params.judgment === 'I_DONT_KNOW_YET' || params.judgment === 'IT_DEPENDS') {
    authority = 'UNRESOLVED';
    confidence = 'UNRESOLVED';
  }

  const updatedTraits = run.forensicReport.traits.map((t) =>
    t.traitId === params.traitId ? { ...t, authority, confidence, statement: currentStatement } : t,
  );

  const ledger = appendLedgerEntry({
    ledger: run.ledger,
    proposal: trait.statement,
    source: trait.authority,
    currentStatement,
    authority,
    confidence,
    founderJudgment: params.judgment,
    founderRevision: params.revision ?? null,
  });

  const forensicReport = {
    ...run.forensicReport,
    traits: updatedTraits,
    founderConfirmedTraits: updatedTraits.filter(
      (t) => t.authority === 'FOUNDER_CONFIRMED' || t.authority === 'FOUNDER_REVISED' || t.authority === 'FOUNDER_ADDED',
    ).length,
    unresolvedTraits: updatedTraits.filter((t) => t.authority === 'UNRESOLVED' || t.confidence === 'UNRESOLVED').length,
  };

  return {
    ...run,
    forensicReport,
    ledger,
    founderJudgments: [
      ...run.founderJudgments,
      {
        recordId: randomUUID(),
        targetType: 'TRAIT',
        targetId: params.traitId,
        judgment: params.judgment,
        note: params.note ?? '',
        at: new Date().toISOString(),
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export function applyScenarioResponse(
  run: NdxFounderCharacterDiscoveryRun,
  params: {
    scenarioId: string;
    response: string;
    judgment: FounderDiscoveryJudgment;
    notes?: string;
  },
): NdxFounderCharacterDiscoveryRun {
  const scenarios = run.scenarios.map((s) =>
    s.scenarioId === params.scenarioId
      ? applyScenarioFounderResponse(s, params.response, params.judgment, params.notes)
      : s,
  );
  return { ...run, scenarios, updatedAt: new Date().toISOString() };
}
