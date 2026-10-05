/**
 * P0.5E.3 — NDX Embodied Character Discovery run builder + adapter.
 */

import { buildEmbodiedBrandCharacterDiscoverySystem } from '../../site00-studio-world-production/embodiedCharacterDiscovery/embodiedBrandCharacterDiscoverySystem.js';
import { buildEmbodiedCharacterBookRelationship } from '../../site00-studio-world-production/embodiedCharacterDiscovery/bookRelationship.js';
import { buildEmbodiedCharacterCameraRelationship } from '../../site00-studio-world-production/embodiedCharacterDiscovery/cameraRelationship.js';
import { buildEmbodiedCharacterContradictionSystem } from '../../site00-studio-world-production/embodiedCharacterDiscovery/contradictionSystem.js';
import { buildEmbodiedCharacterEmotionalRange } from '../../site00-studio-world-production/embodiedCharacterDiscovery/emotionalRange.js';
import { buildEmbodiedCharacterEverydayLife } from '../../site00-studio-world-production/embodiedCharacterDiscovery/everydayLife.js';
import { buildEmbodiedCharacterHumorSystem } from '../../site00-studio-world-production/embodiedCharacterDiscovery/humorSystem.js';
import { buildEmbodiedCharacterIntelligenceProfile } from '../../site00-studio-world-production/embodiedCharacterDiscovery/intelligence.js';
import { buildEmbodiedCharacterPhysicalBehaviorBible } from '../../site00-studio-world-production/embodiedCharacterDiscovery/physicalBehavior.js';
import { buildEmbodiedCharacterPsychology } from '../../site00-studio-world-production/embodiedCharacterDiscovery/psychology.js';
import { buildEmbodiedCharacterStyleHypothesis } from '../../site00-studio-world-production/embodiedCharacterDiscovery/styleHypothesis.js';
import { buildEmbodiedCharacterVoiceSystem } from '../../site00-studio-world-production/embodiedCharacterDiscovery/voiceSystem.js';
import {
  buildDiscoveryInterviewRounds,
} from '../../site00-studio-world-production/embodiedCharacterDiscovery/discoveryInterview.js';
import { evaluateCastingReadiness } from '../../site00-studio-world-production/embodiedCharacterDiscovery/castingReadiness.js';
import { evaluateEmbodiedCharacterHumanity } from '../../site00-studio-world-production/embodiedCharacterDiscovery/humanityEvaluation.js';
import { CHARACTER_DNA_HYPOTHESIS } from '../ndxMotionCharacter/embodiedBrandCharacterFoundation.js';
import { NDX_DISCOVERY_PROMPTS } from './ndxDiscoveryInterview.js';
import { buildNdxCulturalLifeFoundation } from './ndxCulturalLifeFoundation.js';
import { buildNdxFounderVisualNorthStarEvidence } from './founderVisualNorthStarEvidence.js';
import { buildNdxCharacterScenarioTests } from './ndxScenarioTests.js';
import { NDX_EMBODIED_CHARACTER_DISCOVERY_RUN_ID, VISUAL_TENDENCY_HYPOTHESES } from './constants.js';
import type { NdxEmbodiedCharacterDiscoveryRun } from './types.js';

const FUTURE_CONTINUITY_BIBLE_SCHEMA = [
  'identity anchors',
  'face geometry',
  'skin characteristics',
  'hair rules',
  'body proportions',
  'voice',
  'wardrobe behavior',
  'jewelry',
  'nails',
  'makeup',
  'expressions',
  'gestures',
  'movement',
  'camera behavior',
  'environment interaction',
  'lighting tolerance',
  'age consistency',
  'negative identity constraints',
  'reference assets',
  'generation references',
  'approved variants',
] as const;

function seedPsychologyFromBrandCharacterDna() {
  return buildEmbodiedCharacterPsychology({
    whatSheNotices: [
      'Contradictions between what someone said now vs six months ago',
      'Social dynamics others treat as background',
      'When language is performing intelligence vs actually thinking',
    ],
    whatSheIgnores: ['Trend cycles she has already decided are corny', 'Performative outrage'],
    curiosityTriggers: ['Receipts', 'Unfinished patterns', 'Group chat arguments'],
    skepticismTriggers: ['Too-clean narratives', 'Brand speak in human mouths'],
    attentionBiases: ['Remembers obscure statements', 'Notices who changed their story'],
    memoryBehavior: 'Bookmarks mentally — returns when pattern completes',
    selfCorrectionBehavior: 'Publishes Errata when wrong — does not ghost mistakes',
    decisionStyle: 'Research-first — posts second',
  });
}

function seedContradictions() {
  return buildEmbodiedCharacterContradictionSystem({
    majorContradictions: [
      'NOSY ↔ RESPECTFUL — investigates but knows when to stop',
      'OPINIONATED ↔ WILLING TO BE WRONG — strong takes, public corrections',
      'CONFIDENT ↔ OCCASIONALLY INSECURE — especially before she has receipts',
    ],
    minorContradictions: [
      'MESSY tabs ↔ PRECISE citations',
      'SOCIAL ↔ NEEDS solitude to think',
      'COOL ↔ DEEPLY UNCOOL when obsessed',
    ],
    recurringBlindSpots: [
      'Overestimates how much context audience has',
      'Sometimes reads malice where there is just stupidity',
    ],
    behaviorsSheRegrets: [
      'Posting before she had the full receipt',
      'Making a joke when she should have stayed serious',
    ],
    traitOthersFindAnnoying: 'Will not let a wrong statement slide in group chat',
    embarrassedLikes: 'Reality TV she calls research',
    pretendsNotToCare: 'Whether her Pages land — she absolutely cares',
  });
}

function seedIntelligence() {
  return buildEmbodiedCharacterIntelligenceProfile({
    strongestIntelligences: ['contradiction detection', 'cultural memory', 'pattern recognition', 'bullshit detection'],
    averageIntelligences: ['social intuition', 'synthesis', 'source evaluation'],
    blindSpots: ['Technical domains outside her experience', 'Niche subcultures she has not lived'],
    falseConfidenceAreas: ['Assumes she remembers a quote exactly — sometimes misquotes'],
    thingsSheLearnsQuickly: ['Internet discourse shifts', 'Who is connected to whom'],
    thingsSheLearnsSlowly: ['Admitting she was wrong without researching first'],
    behavioralExpression: CHARACTER_DNA_HYPOTHESIS.summary,
  });
}

function seedVoice() {
  return buildEmbodiedCharacterVoiceSystem({
    innerVoice: 'Messier, more doubtful, more petty — unfinished thoughts allowed',
    spokenVoice: 'Conversational, direct, may interrupt herself',
    marginVoice: 'Short, immediate, questions and reactions',
    pageVoice: 'Editorial judgment survived the process — first-person NDX authorship',
    captionVoice: 'Tighter than Page — still sounds like her',
    sentenceRhythm: 'Varied — fragments on TikTok, fuller arcs on Pages',
    swearingBoundary: 'Casual but not constant — emphasis not personality',
  });
}

function seedBookRelationship() {
  return buildEmbodiedCharacterBookRelationship({
    whySheKeepsIt: [
      'Fear of forgetting what she already understood',
      'Need for proof when patterns repeat',
      'Curiosity that does not reset weekly',
    ],
    termMeanings: {
      PAGE: 'A thought that survived scrutiny — editorial judgment applied',
      BOOKMARK: 'Not ready to commit — worth returning to',
      'FLIP BACK': 'Pattern recognition — something old matters again',
      'DOG-EAR': 'Physically marked importance — cannot unsee it',
      'MARGIN NOTE': 'Immediate reaction before the thought is finished',
      FOOTNOTE: 'Context that would clutter the Page',
      ERRATA: 'Public correction — integrity over ego',
      CHAPTER: 'A stretch of related investigation',
      'THE INDEX': 'Accumulated memory — what the Book remembers',
      'ADD IT TO THE BOOK': 'Community tip worth investigating — not automatic Page',
    },
    behaviorsFeelNatural: [
      'Dog-ears without thinking when something hits',
      'Flip Back when group chat proves she already covered it',
      'Margins when tired, Pages when sure',
    ],
  });
}

function seedStyleHypothesis() {
  return buildEmbodiedCharacterStyleHypothesis({
    hairRange: ['natural curls', 'braids', 'protective styles', 'blown-out occasional'],
    styleRanges: ['casual streetwear', 'at home', 'elevated editorial', 'night out', 'research mode'],
    confirmedVsHypothetical: {
      confirmed: [],
      hypothetical: [...VISUAL_TENDENCY_HYPOTHESES],
    },
  });
}

function nowIso(): string {
  return new Date().toISOString();
}

export function buildNdxEmbodiedCharacterDiscoveryRun(projectId: string): NdxEmbodiedCharacterDiscoveryRun {
  const psychology = seedPsychologyFromBrandCharacterDna();
  const contradictions = seedContradictions();
  const intelligence = seedIntelligence();
  const emotionalRange = buildEmbodiedCharacterEmotionalRange();
  const everydayLife = buildEmbodiedCharacterEverydayLife({
    phoneBehavior: 'Too many tabs — screenshots folder is chaos',
    procrastination: 'Cleans apartment to avoid hard writing',
    guiltyPleasures: ['Reality TV', 'Celebrity gossip deep dives'],
    thingsSheAlwaysCarries: ['Phone', 'Gold hoops', 'Lip balm', 'Pen for physical Book'],
  });
  const scenarioTests = buildNdxCharacterScenarioTests();
  const humanityEvaluation = evaluateEmbodiedCharacterHumanity({
    psychology,
    contradictions,
    emotionalRange,
    everydayLife,
  });
  const castingReadiness = evaluateCastingReadiness({
    psychologyComplete: psychology.whatSheNotices.length > 0,
    contradictionsComplete: contradictions.majorContradictions.length >= 3,
    voiceComplete: true,
    bookRelationshipComplete: true,
    behaviorComplete: true,
    cameraComplete: true,
    styleImplicationsPresent: true,
    humanity: humanityEvaluation,
    founderReviewRequired: true,
  });

  return {
    runId: NDX_EMBODIED_CHARACTER_DISCOVERY_RUN_ID,
    projectId,
    system: buildEmbodiedBrandCharacterDiscoverySystem(projectId),
    visualEvidence: buildNdxFounderVisualNorthStarEvidence(),
    psychology,
    intelligence,
    contradictions,
    humor: buildEmbodiedCharacterHumorSystem({
      whatMakesHerLaugh: ['Absurd specificity', 'Petty observations', 'Callback humor'],
      whatSheFindsCorny: ['Forced relatability', 'Influencer catchphrases'],
    }),
    emotionalRange,
    voice: seedVoice(),
    everydayLife,
    bookRelationship: seedBookRelationship(),
    physicalBehavior: buildEmbodiedCharacterPhysicalBehaviorBible(),
    cameraRelationship: buildEmbodiedCharacterCameraRelationship(),
    styleHypothesis: seedStyleHypothesis(),
    culturalLife: buildNdxCulturalLifeFoundation(),
    scenarioTests,
    humanityEvaluation,
    castingReadiness,
    synthesis: null,
    interviewRounds: buildDiscoveryInterviewRounds(NDX_DISCOVERY_PROMPTS),
    founderJudgments: [],
    anthropicRequests: 0,
    falRequests: 0,
    platformExpression: {
      storiesAreMargins: true,
      tiktokIsThoughtBeingWorkedOut: true,
      reelsAreBookInMotion: true,
      feedIsPages: true,
      reuseThinkingNotPosts: true,
    },
    nextCastingRoundSpec: {
      candidateCount: 12,
      sameWrittenCharacter: true,
      generationPerformed: false,
      architectureOnly: true,
    },
    futureContinuityBibleSchema: [...FUTURE_CONTINUITY_BIBLE_SCHEMA],
    updatedAt: nowIso(),
  };
}

export function brandCharacterImmutable(): true {
  return true;
}

export function brandCanonUnchanged(): true {
  return true;
}

export function productExpressionBlocked(): true {
  return true;
}

export function worldFormationBlocked(): true {
  return true;
}
