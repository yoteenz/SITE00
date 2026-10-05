/**
 * P0.5E.7 — NDX content seed model + pilot seeds.
 */

import { randomUUID } from 'node:crypto';
import { CREDIT_UTILIZATION_GOLDEN_PILOT_ID } from './constants.js';
import type {
  CharacterBeatContract,
  NDXContentSeed,
  NDXContentSeedSourceType,
  NDXThoughtArc,
} from './types.js';

export type CharacterFirstSeedSpec = {
  sourceType: NDXContentSeedSourceType;
  legacyTopicSubject: string;
  spokenPremise: string;
  topicMetadata: string[];
  categoryMetadata: string[];
  notice: string;
  firstReaction: string;
  initialBelief: string;
  question: string;
  whySheCares: string;
  investigationTrigger: string;
  currentView: string;
  characterBeat: CharacterBeatContract;
  bookTrace: NDXContentSeed['bookTrace'];
  candidateSurface: NDXContentSeed['candidateSurface'];
  experienceMode?: NDXContentSeed['premise']['experienceMode'];
  isGoldenPilot?: boolean;
  seedId?: string;
};

function buildThoughtArc(spec: CharacterFirstSeedSpec): NDXThoughtArc {
  return {
    arcId: `arc-${randomUUID().slice(0, 8)}`,
    beatsPresent: ['NOTICE', 'REACT', 'ASSUME', 'QUESTION', 'INVESTIGATE', 'REVISE_OR_CONFIRM', 'DOCUMENT'],
    notice: spec.notice,
    firstReaction: spec.firstReaction,
    initialBelief: spec.initialBelief,
    question: spec.question,
    investigationTrigger: spec.investigationTrigger,
    evidenceNeeded: ['Primary source', 'System behavior evidence'],
    evidenceFound: [],
    contradictions: [],
    beliefRevision: spec.currentView.includes('WAS WRONG') ||
      spec.currentView.includes('NOT ONLY') ||
      spec.currentView.includes('NOT BALANCE ALONE')
      ? 'PARTIALLY_REVISED'
      : spec.currentView.includes('OWE')
        ? 'REVERSED'
        : 'STRENGTHENED',
    currentView: spec.currentView,
    knowledgeState: spec.isGoldenPilot || spec.currentView.includes('NOW')
      ? 'LEARNS'
      : spec.currentView.includes('TESTING') || spec.currentView.includes('NOT READY')
        ? 'TESTING'
        : spec.currentView.includes('WAS WRONG')
          ? 'CHANGED_MIND'
          : 'SUSPECTS',
  };
}

export function buildNDXContentSeed(projectId: string, spec: CharacterFirstSeedSpec): NDXContentSeed {
  const thoughtArc = buildThoughtArc(spec);
  return {
    seedId: spec.seedId ?? `seed-${randomUUID().slice(0, 8)}`,
    projectId,
    createdAt: new Date().toISOString(),
    sourceType: spec.sourceType,
    sourceIds: [],
    topicMetadata: spec.topicMetadata,
    categoryMetadata: spec.categoryMetadata,
    liveSignalIds: [],
    personalExperience: spec.sourceType === 'PERSONAL_EXPERIENCE' ? spec.notice : null,
    audiencePrompt: spec.sourceType === 'AUDIENCE_QUESTION' ? spec.question : null,
    historicalCallback: spec.sourceType === 'HISTORICAL_CALLBACK' ? spec.legacyTopicSubject : null,
    notice: spec.notice,
    firstReaction: spec.firstReaction,
    initialBelief: spec.initialBelief,
    friction: spec.whySheCares,
    question: spec.question,
    whySheCares: spec.whySheCares,
    investigationTrigger: spec.investigationTrigger,
    evidenceNeeded: thoughtArc.evidenceNeeded,
    evidenceFound: [],
    contradictions: [],
    changedMind: thoughtArc.beliefRevision === 'REVERSED' || thoughtArc.beliefRevision === 'PARTIALLY_REVISED',
    strengthenedBelief: thoughtArc.beliefRevision === 'STRENGTHENED',
    currentView: spec.currentView,
    bookTrace: spec.bookTrace,
    contentOpportunity: spec.spokenPremise,
    candidateSurface: spec.candidateSurface,
    candidateFormat: spec.candidateSurface === 'PAGE' ? 'CAROUSEL' : 'SHORT_FORM',
    characterBeat: spec.characterBeat,
    humorPotential: spec.characterBeat === 'WE_OWE_HER_AN_APOLOGY' ? 'MODERATE' : 'SUBTLE',
    culturalRelevance: 'HIGH',
    temporalRelevance: 'HIGH',
    saveability: spec.bookTrace === 'BOOKMARK' ? 'HIGH' : 'MEDIUM',
    conversationPotential: 'HIGH',
    founderNotes: null,
    thoughtArc,
    premise: {
      spokenPremise: spec.spokenPremise,
      internalTopic: spec.legacyTopicSubject,
      topicMetadata: spec.topicMetadata,
      categoryMetadata: spec.categoryMetadata,
      experienceMode: spec.experienceMode ?? 'CULTURAL_OBSERVATION',
    },
    migrationStatus: 'REFORMULATED',
    legacyTopicSubject: spec.legacyTopicSubject,
    isGoldenPilot: spec.isGoldenPilot ?? false,
  };
}

export const CHARACTER_FIRST_PILOT_SEEDS: CharacterFirstSeedSpec[] = [
  {
    seedId: CREDIT_UTILIZATION_GOLDEN_PILOT_ID,
    sourceType: 'PERSONAL_EXPERIENCE',
    legacyTopicSubject: 'credit utilization',
    spokenPremise: 'I PAID IT DOWN. WHY DID MY SCORE DROP?',
    topicMetadata: ['MONEY', 'CREDIT UTILIZATION', 'CONSUMER FINANCE'],
    categoryMetadata: ['PERSONAL CONTRADICTION', 'SYSTEM CONTRADICTION'],
    notice: 'Credit score dropped after paying balance down',
    firstReaction: 'THAT CANNOT BE RIGHT.',
    initialBelief: 'LOWER BALANCE = BETTER SCORE',
    question: 'WHY DID PAYING IT DOWN NOT PRODUCE THE RESULT I EXPECTED?',
    whySheCares: 'She did the responsible thing and still got punished by the system',
    investigationTrigger: 'Credit utilization ratio + statement close timing',
    currentView: 'BALANCE + LIMIT + TIMING MATTER — NOT BALANCE ALONE',
    characterBeat: 'THAT_CANNOT_BE_RIGHT',
    bookTrace: 'BOOKMARK',
    candidateSurface: 'PAGE',
    experienceMode: 'PERSONALLY_EXPERIENCED',
    isGoldenPilot: true,
  },
  {
    sourceType: 'CULTURAL_MOMENT',
    legacyTopicSubject: 'subscription normalization',
    spokenPremise: 'WHY DOES EVERYTHING HAVE A SUBSCRIPTION NOW?',
    topicMetadata: ['MONEY', 'CONSUMER BEHAVIOR'],
    categoryMetadata: ['SUBSCRIPTION ECONOMY'],
    notice: 'Another formerly one-time purchase moved to recurring billing',
    firstReaction: 'WAIT.',
    initialBelief: 'YOU USED TO JUST BUY THINGS ONCE',
    question: 'WHEN DID ONE-TIME PURCHASE BECOME THE EXCEPTION?',
    whySheCares: 'The pattern keeps repeating across unrelated categories',
    investigationTrigger: 'Subscription stack audit across household',
    currentView: 'NORMALIZATION IS QUIET — YOU NOTICE IT LATE',
    characterBeat: 'WAIT',
    bookTrace: 'MARGIN_TRACE',
    candidateSurface: 'PAGE',
  },
  {
    sourceType: 'CULTURAL_MOMENT',
    legacyTopicSubject: 'corporate layoff memo language',
    spokenPremise: 'WHY DO ALL THESE LAYOFF EMAILS SOUND LIKE THEY WERE WRITTEN BY THE SAME PERSON?',
    topicMetadata: ['WORK', 'CORPORATE COMMUNICATION'],
    categoryMetadata: ['INSTITUTIONAL LANGUAGE'],
    notice: 'Leadership memo uses "we remain confident" during layoffs',
    firstReaction: 'BE SERIOUS.',
    initialBelief: 'COMPANIES HAVE THEIR OWN DIALECT FOR BAD NEWS',
    question: 'WHY DOES THE LANGUAGE FEEL COPY-PASTED ACROSS INDUSTRIES?',
    whySheCares: 'Euphemism hides accountability',
    investigationTrigger: 'Memo language pattern comparison',
    currentView: 'THERE IS A SHARED CORPORATE SCRIPT FOR PAIN',
    characterBeat: 'BE_SERIOUS',
    bookTrace: 'NEW_PAGE',
    candidateSurface: 'PAGE',
    experienceMode: 'OBSERVED',
  },
  {
    sourceType: 'HISTORICAL_CALLBACK',
    legacyTopicSubject: 'late fees across decades',
    spokenPremise: 'I STARTED LOOKING AT WHAT THIS FEE USED TO COST. NOW I\'M ANNOYED.',
    topicMetadata: ['MONEY', 'HISTORY', 'CONSUMER BEHAVIOR'],
    categoryMetadata: ['HISTORICAL CALLBACK'],
    notice: 'Blockbuster late fees vs streaming cancellation windows',
    firstReaction: 'LOOK AT THIS.',
    initialBelief: 'LATE FEES ARE JUST A MODERN ANNOYANCE',
    question: 'WHAT DID THIS SAME BEHAVIOR COST IN A DIFFERENT ERA?',
    whySheCares: 'Structural similarity across decades',
    investigationTrigger: 'Fee history archive',
    currentView: 'THE MECHANISM CHANGES — THE IRRITATION RHYMES',
    characterBeat: 'LOOK_AT_THIS',
    bookTrace: 'FLIP_BACK',
    candidateSurface: 'PAGE',
  },
  {
    sourceType: 'AUDIENCE_QUESTION',
    legacyTopicSubject: 'airline loyalty devaluation',
    spokenPremise: 'I KNOW I DIDN\'T IMAGINE THESE POINTS BEING WORTH MORE.',
    topicMetadata: ['TRAVEL', 'LOYALTY ECONOMY'],
    categoryMetadata: ['POINTS DEVALUATION'],
    notice: 'Audience asked NDX to investigate points program changes',
    firstReaction: 'I KNOW I DIDN\'T MAKE THAT UP.',
    initialBelief: 'THE OLD REDEMPTION MATH WAS REAL',
    question: 'WHEN DID THE VALUE QUIETLY CHANGE?',
    whySheCares: 'Memory vs current terms mismatch',
    investigationTrigger: 'Historical award chart comparison',
    currentView: 'DEVALUATION IS OFTEN QUIET — YOU NOTICE LATE',
    characterBeat: 'NO_BECAUSE',
    bookTrace: 'DOG_EAR',
    candidateSurface: 'REEL',
    experienceMode: 'AUDIENCE_TRIGGERED',
  },
  {
    sourceType: 'PERSONAL_EXPERIENCE',
    legacyTopicSubject: 'standing desk reconsideration',
    spokenPremise: 'I MADE FUN OF THESE FOR YEARS. I MAY OWE THEM AN APOLOGY.',
    topicMetadata: ['LIFESTYLE', 'WORK'],
    categoryMetadata: ['SELF CORRECTION'],
    notice: 'Founder dismissed standing desks, then changed mind with evidence',
    firstReaction: 'I THOUGHT THIS WAS STUPID.',
    initialBelief: 'STANDING DESKS WERE A FAD',
    question: 'WHAT EVIDENCE CHANGED MY MIND?',
    whySheCares: 'Public prior mockery creates revision pressure',
    investigationTrigger: 'Personal ergonomics evidence review',
    currentView: 'I WAS WRONG ABOUT THE CATEGORY — NOT EVERY VARIANT',
    characterBeat: 'WE_OWE_HER_AN_APOLOGY',
    bookTrace: 'ERRATA',
    candidateSurface: 'PAGE',
    experienceMode: 'PERSONALLY_EXPERIENCED',
  },
  {
    sourceType: 'NDX_SELF_OBSERVATION',
    legacyTopicSubject: 'attention economy pattern',
    spokenPremise: 'I SWEAR MY ATTENTION SPAN USED TO BE BETTER.',
    topicMetadata: ['INTERNET', 'CULTURE'],
    categoryMetadata: ['ATTENTION ECONOMY'],
    notice: 'Same engagement pattern across unrelated feeds',
    firstReaction: 'INTERESTING. FAIR.',
    initialBelief: 'MY ATTENTION USED TO HOLD LONGER',
    question: 'IS THIS ME OR THE SYSTEM?',
    whySheCares: 'Personal experience of drift',
    investigationTrigger: 'Cross-platform feed behavior audit',
    currentView: 'STILL TESTING — NOT READY TO CONCLUDE',
    characterBeat: 'UNRESOLVED',
    bookTrace: 'DOG_EAR',
    candidateSurface: 'MARGIN',
    experienceMode: 'PERSONALLY_EXPERIENCED',
  },
  {
    sourceType: 'CULTURAL_MOMENT',
    legacyTopicSubject: 'self-checkout time promise',
    spokenPremise: 'WHEN DID I BECOME AN EMPLOYEE?',
    topicMetadata: ['CONSUMER BEHAVIOR', 'TECHNOLOGY'],
    categoryMetadata: ['SELF CHECKOUT'],
    notice: 'Self-checkout took longer than staffed lane in timed observation',
    firstReaction: 'THAT CANNOT BE RIGHT.',
    initialBelief: 'SELF CHECKOUT = FASTER',
    question: 'WHO BENEFITS WHEN I DO THE WORK?',
    whySheCares: 'Failed efficiency promise',
    investigationTrigger: 'Timed lane comparison',
    currentView: 'EFFICIENCY CLAIM ≠ CUSTOMER EXPERIENCE',
    characterBeat: 'THAT_CANNOT_BE_RIGHT',
    bookTrace: 'MARGIN_TRACE',
    candidateSurface: 'TIKTOK',
    experienceMode: 'OBSERVED',
  },
];

export const CREDIT_UTILIZATION_PAGE_ROLES = [
  { slideNumber: 1, role: 'PERSONAL_CONTRADICTION' as const, copy: 'I PAID IT DOWN.\nWHY DID MY SCORE DROP?' },
  { slideNumber: 2, role: 'INITIAL_ASSUMPTION' as const, copy: 'I THOUGHT LOWER BALANCE = BETTER.' },
  { slideNumber: 3, role: 'WHAT_I_MISSED' as const, copy: 'HERE IS WHAT I MISSED.' },
  { slideNumber: 4, role: 'SYSTEM_LOGIC' as const, copy: 'THEY CARE ABOUT THE RATIO.' },
  { slideNumber: 5, role: 'TIMING_COMPLICATION' as const, copy: 'TIMING MATTERS TOO.' },
  { slideNumber: 6, role: 'BELIEF_REVISION' as const, copy: "THE BALANCE ALONE WAS NOT THE WHOLE STORY." },
  { slideNumber: 7, role: 'BEHAVIOR_CHANGE' as const, copy: 'WATCH REPORTING / UTILIZATION / STATEMENT TIMING.' },
  { slideNumber: 8, role: 'BOOKMARK' as const, copy: 'BOOKMARK THIS.' },
];

export function seedCharacterFirstContentSeeds(projectId: string): NDXContentSeed[] {
  return CHARACTER_FIRST_PILOT_SEEDS.map((spec) => buildNDXContentSeed(projectId, spec));
}

export function getGoldenPilotSeed(seeds: NDXContentSeed[]): NDXContentSeed | null {
  return seeds.find((seed) => seed.isGoldenPilot || seed.seedId === CREDIT_UTILIZATION_GOLDEN_PILOT_ID) ?? null;
}
