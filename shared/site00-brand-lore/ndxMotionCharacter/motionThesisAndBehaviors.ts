/**
 * P0.5E.2 — NDX Motion Character adapter — motion thesis + behavior library.
 */

import { randomUUID } from 'node:crypto';
import {
  NDX_MOTION_BEHAVIOR_MODES,
  NDX_MOTION_THESIS_CHAIN,
  NDX_MOTION_THESIS_COMPRESSED,
  NDXBOOK_MOTION_CHARACTER_SYSTEM_ID,
} from '../ndxBookCulturalLanguage/constants.js';
import type { NdxMotionBehaviorMode, NdxMotionBehaviorSpec } from '../ndxBookCulturalLanguage/types.js';
import {
  buildGenericMotionBehaviorChain,
  buildMotionCharacterSystem,
} from '../../site00-studio-world-production/motionCharacter/motionCharacterSystem.js';
import type { MotionCharacterSystem } from '../../site00-studio-world-production/motionCharacter/types.js';

export function buildNdxMotionCharacterSystem(projectId: string): MotionCharacterSystem {
  const brandId = projectId;
  const chains = [
    buildGenericMotionBehaviorChain({
      brandId,
      stages: [...NDX_MOTION_THESIS_COMPRESSED],
      description: 'NDX compressed motion chain — notice through document',
    }),
    buildGenericMotionBehaviorChain({
      brandId,
      stages: [...NDX_MOTION_THESIS_CHAIN],
      description: 'NDX full behavioral chain including bookmark/dog-ear/errata',
    }),
  ];
  const system = buildMotionCharacterSystem({ brandId, behaviorChains: chains });
  return { ...system, systemId: NDXBOOK_MOTION_CHARACTER_SYSTEM_ID };
}

export function buildNdxMotionThesis(): { full: string[]; compressed: string[] } {
  return {
    full: [...NDX_MOTION_THESIS_CHAIN],
    compressed: [...NDX_MOTION_THESIS_COMPRESSED],
  };
}

const BEHAVIOR_SPECS: Record<NdxMotionBehaviorMode, Omit<NdxMotionBehaviorSpec, 'mode'>> = {
  RABBIT_HOLE: {
    trigger: 'Small observation escalates',
    emotionalTemperature: 'CURIOUS → OBSESSIVE',
    researchDepth: 'DEEP',
    motionBehavior: 'Searching, scrolling, comparing, tab accumulation',
    founderCharacterPresence: 'EMBODIED_OR_VOICE — process visible',
    evidenceBehavior: 'Screenshots, links, receipts accumulate',
    humorOpportunity: 'Absurd specificity of research path',
    endingBehavior: 'Open loop or seed for Page',
    bookTerminology: ['DOG-EAR', 'PAGE STILL OPEN'],
    idealDurationRangeSec: [30, 90],
    platformSuitability: ['REEL', 'TIKTOK'],
    failureModes: ['FAIL_ANIMATED_CAROUSEL', 'FAIL_STOCK_BROLL_EXPLAINER'],
  },
  RECEIPT_CAME_BACK: {
    trigger: 'Current event triggers cultural memory',
    emotionalTemperature: 'RECOGNITION → SATISFACTION',
    researchDepth: 'MEDIUM',
    motionBehavior: 'FLIP BACK to old material, side-by-side comparison',
    founderCharacterPresence: 'REACTION SHOT + archival trace',
    evidenceBehavior: 'Prior Page, old post, saved note',
    humorOpportunity: 'I TALKED SHIT ABOUT THIS SIX MONTHS AGO',
    endingBehavior: 'Callback lands — may become Page or Margin',
    bookTerminology: ['FLIP BACK', 'BOOKMARKED', 'FOOTNOTE'],
    idealDurationRangeSec: [20, 60],
    platformSuitability: ['REEL', 'TIKTOK', 'STORY'],
    failureModes: ['FAIL_MOTION_POSTER'],
  },
  I_HAVE_A_THEORY: {
    trigger: 'Developing personal hypothesis',
    emotionalTemperature: 'SPECULATIVE → CONVICTION OR DOUBT',
    researchDepth: 'MEDIUM-HIGH',
    motionBehavior: 'Talking through theory, testing connections',
    founderCharacterPresence: 'DIRECT TO CAMERA — TikTok-forward',
    evidenceBehavior: 'Partial evidence, spreadsheet, notes',
    humorOpportunity: 'SO NATURALLY I MADE A SPREADSHEET',
    endingBehavior: 'Theory stated — uncertainty allowed',
    bookTerminology: ['PAGE STILL OPEN', 'MARGIN NOTE'],
    idealDurationRangeSec: [15, 90],
    platformSuitability: ['TIKTOK', 'REEL', 'STORY'],
    failureModes: ['FAIL_AI_PRESENTER', 'FAIL_GENERIC_INFLUENCER'],
  },
  BE_SERIOUS: {
    trigger: 'Absurdity demands sharp reaction',
    emotionalTemperature: 'INCREDULOUS → SHARP',
    researchDepth: 'LOW',
    motionBehavior: 'Pause, direct address, minimal cut',
    founderCharacterPresence: 'FACE + VOICE — no over-edit',
    evidenceBehavior: 'Single receipt or screenshot',
    humorOpportunity: 'BE SERIOUS. / WAIT.',
    endingBehavior: 'Punchy stop — may seed Page',
    bookTerminology: ['MARGIN NOTE'],
    idealDurationRangeSec: [7, 30],
    platformSuitability: ['TIKTOK', 'STORY', 'REEL'],
    failureModes: ['FAIL_GENERIC_INFLUENCER'],
  },
  TINY_EXPERIMENT: {
    trigger: 'NDX tests/times/counts/prices/tries something',
    emotionalTemperature: 'PLAYFUL → INFORMED',
    researchDepth: 'HANDS-ON',
    motionBehavior: 'Physical test, timer, price check, comparison',
    founderCharacterPresence: 'HANDS IN FRAME',
    evidenceBehavior: 'Live result on screen or object',
    humorOpportunity: 'Unexpected outcome or absurd method',
    endingBehavior: 'Result shown — conclusion optional',
    bookTerminology: ['MARGIN NOTE', 'FOOTNOTE'],
    idealDurationRangeSec: [15, 45],
    platformSuitability: ['REEL', 'TIKTOK', 'STORY'],
    failureModes: ['FAIL_STOCK_BROLL_EXPLAINER'],
  },
  I_WAS_WRONG: {
    trigger: 'Prior judgment revisited honestly',
    emotionalTemperature: 'HUMBLE → CLEAR',
    researchDepth: 'REFLECTIVE',
    motionBehavior: 'Return to old take, cross-out, errata',
    founderCharacterPresence: 'SELF-AWARE — not performative apology',
    evidenceBehavior: 'Prior Page + correction',
    humorOpportunity: 'Understatement, I HAVE QUESTIONS',
    endingBehavior: 'ERRATA stated',
    bookTerminology: ['ERRATA', 'FLIP BACK'],
    idealDurationRangeSec: [20, 60],
    platformSuitability: ['REEL', 'TIKTOK'],
    failureModes: ['FAIL_AI_PRESENTER'],
  },
  THE_GROUP_CHAT_WAS_RIGHT: {
    trigger: 'Community observation becomes evidence',
    emotionalTemperature: 'SURPRISED → GRUDGING RESPECT',
    researchDepth: 'MEDIUM',
    motionBehavior: 'Reading comments/DMs, verifying claim',
    founderCharacterPresence: 'Y\'ALL WERE RIGHT energy',
    evidenceBehavior: 'Audience tip + verification',
    humorOpportunity: 'Contradiction with prior NDX stance',
    endingBehavior: 'Credit audience — ADD IT TO THE BOOK path',
    bookTerminology: ['ADD IT TO THE BOOK', 'FOOTNOTE'],
    idealDurationRangeSec: [20, 60],
    platformSuitability: ['TIKTOK', 'STORY', 'REEL'],
    failureModes: ['FAIL_GENERIC_INFLUENCER'],
  },
  FLIP_BACK: {
    trigger: 'Old Page becomes relevant again',
    emotionalTemperature: 'NOSTALGIC → RELEVANT',
    researchDepth: 'ARCHIVAL',
    motionBehavior: 'Scroll archive, open old material, compare',
    founderCharacterPresence: 'PROCESS — finding the old Page',
    evidenceBehavior: 'Prior Page reference',
    humorOpportunity: 'THIS AGED INTERESTINGLY',
    endingBehavior: 'Connection made to current moment',
    bookTerminology: ['FLIP BACK', 'BOOKMARKED'],
    idealDurationRangeSec: [20, 75],
    platformSuitability: ['REEL', 'TIKTOK'],
    failureModes: ['FAIL_ANIMATED_CAROUSEL'],
  },
  DOG_EAR_THIS: {
    trigger: 'Developing subject, insufficient evidence',
    emotionalTemperature: 'INTRIGUED → HOLDING',
    researchDepth: 'SHALLOW — watching',
    motionBehavior: 'Notice, flag, pause — no forced conclusion',
    founderCharacterPresence: 'HONEST UNCERTAINTY',
    evidenceBehavior: 'Partial — dog-ear not Page',
    humorOpportunity: 'I HAVE QUESTIONS without answers yet',
    endingBehavior: 'Open — PAGE STILL OPEN',
    bookTerminology: ['DOG-EAR', 'PAGE STILL OPEN'],
    idealDurationRangeSec: [10, 40],
    platformSuitability: ['STORY', 'TIKTOK', 'REEL'],
    failureModes: ['FAIL_MOTION_POSTER'],
  },
  ADD_IT_TO_THE_BOOK: {
    trigger: 'Community-driven discovery enters consideration',
    emotionalTemperature: 'CURIOUS → EVALUATIVE',
    researchDepth: 'VARIABLE',
    motionBehavior: 'Review submission, verify, consider for Book',
    founderCharacterPresence: 'RESPONSIVE — not scripted gratitude',
    evidenceBehavior: 'Audience receipt + NDX verification',
    humorOpportunity: 'Unexpected tip quality',
    endingBehavior: 'Accepted into consideration or Margin — organic only',
    bookTerminology: ['ADD IT TO THE BOOK', 'MARGIN NOTE'],
    idealDurationRangeSec: [15, 60],
    platformSuitability: ['STORY', 'TIKTOK'],
    failureModes: ['FAIL_GENERIC_INFLUENCER', 'FAIL_FAKE_HUMAN_IMPERFECTION'],
  },
  ERRATA: {
    trigger: 'Explicit correction needed',
    emotionalTemperature: 'DIRECT → ACCOUNTABLE',
    researchDepth: 'FACT-CHECK',
    motionBehavior: 'Cross-out, correction overlay, direct address',
    founderCharacterPresence: 'CLEAR — no dodge',
    evidenceBehavior: 'Corrected fact + source',
    humorOpportunity: 'UNFORTUNATELY… understatement',
    endingBehavior: 'Errata published — may update Page',
    bookTerminology: ['ERRATA', 'FOOTNOTE'],
    idealDurationRangeSec: [10, 45],
    platformSuitability: ['STORY', 'REEL', 'TIKTOK'],
    failureModes: ['FAIL_AI_PRESENTER'],
  },
  PAGE_IN_PROGRESS: {
    trigger: 'Thought becoming eventual Page',
    emotionalTemperature: 'FORMING → RESOLVING',
    researchDepth: 'ACTIVE',
    motionBehavior: 'Drafting, annotating, assembling evidence for Page',
    founderCharacterPresence: 'PROCESS DOCUMENTATION',
    evidenceBehavior: 'Work-in-progress artifacts',
    humorOpportunity: 'Real-time mind change visible',
    endingBehavior: 'Tease Page or show partial assembly',
    bookTerminology: ['PAGE STILL OPEN', 'MARGIN NOTE'],
    idealDurationRangeSec: [20, 90],
    platformSuitability: ['REEL', 'TIKTOK', 'STORY'],
    failureModes: ['FAIL_ANIMATED_CAROUSEL', 'FAIL_MOTION_POSTER'],
  },
};

export function buildNdxMotionBehaviorLibrary(): NdxMotionBehaviorSpec[] {
  return NDX_MOTION_BEHAVIOR_MODES.map((mode) => ({
    mode,
    ...BEHAVIOR_SPECS[mode],
  }));
}

export function ndxVideoShowsBookBeingMade(): true {
  return true;
}

export function motionBehaviorsNotRigidTemplates(): true {
  return true;
}

export function getMotionBehaviorSpec(mode: NdxMotionBehaviorMode): NdxMotionBehaviorSpec {
  return { mode, ...BEHAVIOR_SPECS[mode] };
}

export function ndxMotionBehaviorLibraryId(): string {
  return randomUUID();
}
