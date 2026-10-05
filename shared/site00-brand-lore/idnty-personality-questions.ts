/**
 * Identity Brand Personality — client-facing question registry.
 *
 * Integrated after Brand World / Lore capture. SITE 00 voice — discovery, not testing.
 */

import type { LoreResponseMode } from './loreAnswerTypes.js';

export type PersonalityQuestionOption = {
  id: string;
  label: string;
  description?: string;
};

export type PersonalityQuestionStep = {
  id: string;
  title: string;
  subtitle?: string;
  helper?: string;
  responseMode: LoreResponseMode;
  type: 'single' | 'multi' | 'textarea';
  options?: PersonalityQuestionOption[];
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
  skippable?: boolean;
  minSelections?: number;
  maxSelections?: number;
  selectionGuidance?: string;
  allowOther?: boolean;
  domain: string;
};

export const IDNTY_PERSONALITY_SOCIAL_INSTINCT_OPTIONS: PersonalityQuestionOption[] = [
  { id: 'notices-missed', label: 'NOTICES WHAT EVERYONE MISSED' },
  { id: 'makes-laugh', label: 'MAKES PEOPLE LAUGH' },
  { id: 'uncomfortable-question', label: 'ASKS THE UNCOMFORTABLE QUESTION' },
  { id: 'makes-sense', label: 'MAKES THINGS MAKE SENSE' },
  { id: 'raises-energy', label: 'RAISES THE ENERGY' },
  { id: 'calms-room', label: 'CALMS THE ROOM' },
  { id: 'challenges-room', label: 'CHALLENGES THE ROOM' },
  { id: 'includes-people', label: 'MAKES PEOPLE FEEL INCLUDED' },
  { id: 'says-thinking', label: 'SAYS WHAT EVERYONE WAS THINKING' },
  { id: 'changes-subject', label: 'CHANGES THE SUBJECT IN A GOOD WAY' },
  { id: 'watches-first', label: 'WATCHES FIRST, SPEAKS LATER' },
  { id: 'other', label: 'SOMETHING ELSE' },
];

export const IDNTY_PERSONALITY_CONFIDENCE_OPTIONS: PersonalityQuestionOption[] = [
  { id: 'facts-first', label: 'FACTS FIRST' },
  { id: 'instinct-first', label: 'INSTINCT FIRST' },
  { id: 'lived-experience', label: 'LIVED EXPERIENCE' },
  { id: 'taste', label: 'TASTE' },
  { id: 'expertise', label: 'EXPERTISE' },
  { id: 'receipts', label: 'RECEIPTS' },
  { id: 'curiosity', label: 'CURIOSITY' },
  { id: 'pattern-recognition', label: 'PATTERN RECOGNITION' },
  { id: 'room-to-be-wrong', label: 'IT LEAVES ROOM TO BE WRONG' },
  { id: 'says-anyway', label: 'IT SAYS IT ANYWAY' },
  { id: 'other', label: 'OTHER' },
];

export const IDNTY_PERSONALITY_HUMOR_OPTIONS: PersonalityQuestionOption[] = [
  { id: 'dry-observation', label: 'DRY OBSERVATION' },
  { id: 'deadpan', label: 'DEADPAN' },
  { id: 'contradiction', label: 'CONTRADICTION' },
  { id: 'exaggeration', label: 'EXAGGERATION' },
  { id: 'understatement', label: 'UNDERSTATEMENT' },
  { id: 'cultural-references', label: 'CULTURAL REFERENCES' },
  { id: 'unexpected-specificity', label: 'UNEXPECTED SPECIFICITY' },
  { id: 'playful-chaos', label: 'PLAYFUL CHAOS' },
  { id: 'self-awareness', label: 'SELF-AWARENESS' },
  { id: 'sarcasm', label: 'SARCASM' },
  { id: 'clever-wording', label: 'CLEVER WORDING' },
  { id: 'not-trying-funny', label: "IT ISN'T TRYING TO BE FUNNY" },
  { id: 'other', label: 'OTHER' },
];

export const IDNTY_PERSONALITY_HUMANITY_OPTIONS: PersonalityQuestionOption[] = [
  { id: 'polished-alive', label: 'POLISHED BUT ALIVE' },
  { id: 'openly-imperfect', label: 'OPENLY IMPERFECT' },
  { id: 'emotionally-honest', label: 'EMOTIONALLY HONEST' },
  { id: 'very-personal', label: 'VERY PERSONAL' },
  { id: 'warm-private', label: 'WARM BUT PRIVATE' },
  { id: 'candid', label: 'CANDID' },
  { id: 'composed', label: 'COMPOSED' },
  { id: 'unfiltered', label: 'UNFILTERED' },
  { id: 'vulnerable-small-doses', label: 'VULNERABLE IN SMALL DOSES' },
  { id: 'almost-anonymous', label: 'ALMOST ANONYMOUS' },
  { id: 'other', label: 'OTHER' },
];

export const IDNTY_PERSONALITY_DISAGREEMENT_OPTIONS: PersonalityQuestionOption[] = [
  { id: 'corrects-record', label: 'CORRECTS THE RECORD' },
  { id: 'better-question', label: 'ASKS A BETTER QUESTION' },
  { id: 'shows-evidence', label: 'SHOWS THE EVIDENCE' },
  { id: 'jokes-about-it', label: 'JOKES ABOUT IT' },
  { id: 'challenges-directly', label: 'CHALLENGES DIRECTLY' },
  { id: 'reframes', label: 'REFRAMES IT' },
  { id: 'audience-decides', label: 'LETS THE AUDIENCE DECIDE' },
  { id: 'stays-quiet', label: 'STAYS QUIET' },
  { id: 'admits-uncertainty', label: 'ADMITS UNCERTAINTY' },
  { id: 'changes-mind', label: 'CHANGES ITS MIND PUBLICLY' },
  { id: 'other', label: 'OTHER' },
];

export const IDNTY_PERSONALITY_EDGE_OPTIONS: PersonalityQuestionOption[] = [
  { id: 'safe', label: 'SAFE' },
  { id: 'sharp', label: 'SHARP' },
  { id: 'provocative', label: 'PROVOCATIVE' },
  { id: 'mischievous', label: 'MISCHIEVOUS' },
  { id: 'irreverent', label: 'IRREVERENT' },
  { id: 'confrontational', label: 'CONFRONTATIONAL' },
  { id: 'polarizing', label: 'POLARIZING' },
  { id: 'blunt', label: 'BLUNT' },
  { id: 'culturally-daring', label: 'CULTURALLY DARING' },
  { id: 'never-reckless', label: 'NEVER RECKLESS' },
  { id: 'other', label: 'OTHER' },
];

export const IDNTY_PERSONALITY_CHARM_OPTIONS: PersonalityQuestionOption[] = [
  { id: 'warmth', label: 'WARMTH' },
  { id: 'wit', label: 'WIT' },
  { id: 'honesty', label: 'HONESTY' },
  { id: 'confidence', label: 'CONFIDENCE' },
  { id: 'usefulness', label: 'USEFULNESS' },
  { id: 'curiosity', label: 'CURIOSITY' },
  { id: 'taste', label: 'TASTE' },
  { id: 'vulnerability', label: 'VULNERABILITY' },
  { id: 'unpredictability', label: 'UNPREDICTABILITY' },
  { id: 'generosity', label: 'GENEROSITY' },
  { id: 'intelligence', label: 'INTELLIGENCE' },
  { id: 'relatability', label: 'RELATABILITY' },
  { id: 'other', label: 'OTHER' },
];

export const IDNTY_PERSONALITY_EMOTIONAL_RANGE_OPTIONS: PersonalityQuestionOption[] = [
  { id: 'amused', label: 'AMUSED' },
  { id: 'frustrated', label: 'FRUSTRATED' },
  { id: 'excited', label: 'EXCITED' },
  { id: 'skeptical', label: 'SKEPTICAL' },
  { id: 'tender', label: 'TENDER' },
  { id: 'angry', label: 'ANGRY' },
  { id: 'proud', label: 'PROUD' },
  { id: 'curious', label: 'CURIOUS' },
  { id: 'nostalgic', label: 'NOSTALGIC' },
  { id: 'hopeful', label: 'HOPEFUL' },
  { id: 'serious', label: 'SERIOUS' },
  { id: 'mischievous', label: 'MISCHIEVOUS' },
  { id: 'calm', label: 'CALM' },
  { id: 'other', label: 'OTHER' },
];

export const IDNTY_PERSONALITY_RESTRAINT_OPTIONS: PersonalityQuestionOption[] = [
  { id: 'needs-clarity', label: 'WHEN THE AUDIENCE NEEDS CLARITY' },
  { id: 'emotion-too-high', label: 'WHEN EMOTION IS TOO HIGH' },
  { id: 'facts-unclear', label: "WHEN FACTS AREN'T CLEAR" },
  { id: 'humor-cheapens', label: 'WHEN HUMOR WOULD CHEAPEN IT' },
  { id: 'not-our-subject', label: "WHEN THE SUBJECT ISN'T OURS" },
  { id: 'silence-stronger', label: 'WHEN SILENCE IS STRONGER' },
  { id: 'other', label: 'OTHER' },
];

export const IDNTY_PERSONALITY_TENSION_OPTIONS: PersonalityQuestionOption[] = [
  { id: 'polished-nosy', label: 'POLISHED + NOSY' },
  { id: 'intelligent-playful', label: 'INTELLIGENT + PLAYFUL' },
  { id: 'warm-blunt', label: 'WARM + BLUNT' },
  { id: 'confident-self-aware', label: 'CONFIDENT + SELF-AWARE' },
  { id: 'elegant-weird', label: 'ELEGANT + WEIRD' },
  { id: 'serious-funny', label: 'SERIOUS + FUNNY' },
  { id: 'exclusive-welcoming', label: 'EXCLUSIVE + WELCOMING' },
  { id: 'calm-provocative', label: 'CALM + PROVOCATIVE' },
  { id: 'precise-messy', label: 'PRECISE + MESSY' },
  { id: 'authoritative-curious', label: 'AUTHORITATIVE + CURIOUS' },
  { id: 'refined-irreverent', label: 'REFINED + IRREVERENT' },
  { id: 'other', label: 'OTHER' },
];

export const IDNTY_PERSONALITY_SOCIAL_REACTION_OPTIONS: PersonalityQuestionOption[] = [
  { id: 'correct-politely', label: 'CORRECT THEM POLITELY' },
  { id: 'bring-receipts', label: 'BRING RECEIPTS' },
  { id: 'make-funny', label: 'MAKE IT FUNNY' },
  { id: 'ask-what-mean', label: 'ASK WHAT THEY MEAN' },
  { id: 'ignore', label: 'IGNORE IT' },
  { id: 'turn-into-content', label: 'TURN IT INTO CONTENT' },
  { id: 'challenge', label: 'CHALLENGE THEM' },
  { id: 'agree-if-right', label: "AGREE IF THEY'RE RIGHT" },
  { id: 'other', label: 'OTHER' },
];

export const IDNTY_PERSONALITY_SELF_CORRECTION_OPTIONS: PersonalityQuestionOption[] = [
  { id: 'quietly-fix', label: 'QUIETLY FIX IT' },
  { id: 'publicly-correct', label: 'PUBLICLY CORRECT IT' },
  { id: 'explain-changed', label: 'EXPLAIN WHAT CHANGED' },
  { id: 'laugh-at-self', label: 'LAUGH AT ITSELF' },
  { id: 'show-process', label: 'SHOW THE PROCESS' },
  { id: 'apologize-clearly', label: 'APOLOGIZE CLEARLY' },
  { id: 'update-record', label: 'UPDATE THE RECORD' },
  { id: 'other', label: 'OTHER' },
];

/** Personality steps — after Brand World lore, before final review. */
export const IDNTY_PERSONALITY_QUESTIONS: PersonalityQuestionStep[] = [
  {
    id: 'social-instinct',
    domain: 'SOCIAL_INSTINCT',
    title: 'WHEN THIS BRAND WALKS INTO THE ROOM,\nWHAT DOES IT DO FIRST?',
    responseMode: 'MULTI_SELECT',
    type: 'multi',
    options: IDNTY_PERSONALITY_SOCIAL_INSTINCT_OPTIONS,
    maxSelections: 4,
    selectionGuidance: 'PICK UP TO FOUR — YOUR STRONGEST INSTINCTS.',
    skippable: true,
    allowOther: true,
  },
  {
    id: 'confidence',
    domain: 'CONFIDENCE_BEHAVIOR',
    title: 'HOW DOES THIS BRAND KNOW IT\'S RIGHT?',
    responseMode: 'MULTI_SELECT',
    type: 'multi',
    options: IDNTY_PERSONALITY_CONFIDENCE_OPTIONS,
    maxSelections: 3,
    selectionGuidance: 'PICK UP TO THREE.',
    skippable: true,
  },
  {
    id: 'humor',
    domain: 'WIT_BEHAVIOR',
    title: 'WHAT MAKES THIS BRAND FUNNY — IF IT IS?',
    responseMode: 'MULTI_SELECT',
    type: 'multi',
    options: IDNTY_PERSONALITY_HUMOR_OPTIONS,
    maxSelections: 4,
    selectionGuidance: 'MULTI-SELECT — OR SKIP IF HUMOR ISN\'T YOUR THING.',
    skippable: true,
  },
  {
    id: 'humanity',
    domain: 'HUMANITY',
    title: 'HOW HUMAN SHOULD THIS BRAND FEEL?',
    responseMode: 'MULTI_SELECT',
    type: 'multi',
    options: IDNTY_PERSONALITY_HUMANITY_OPTIONS,
    maxSelections: 3,
    skippable: true,
  },
  {
    id: 'disagreement',
    domain: 'DISAGREEMENT_BEHAVIOR',
    title: 'WHEN THIS BRAND DISAGREES,\nWHAT DOES IT DO?',
    responseMode: 'MULTI_SELECT',
    type: 'multi',
    options: IDNTY_PERSONALITY_DISAGREEMENT_OPTIONS,
    maxSelections: 3,
    skippable: true,
  },
  {
    id: 'edge',
    domain: 'EDGE',
    title: 'HOW FAR CAN THIS BRAND PUSH?',
    responseMode: 'SINGLE_SELECT',
    type: 'single',
    options: IDNTY_PERSONALITY_EDGE_OPTIONS,
    skippable: true,
  },
  {
    id: 'charm',
    domain: 'CHARM',
    title: 'WHAT MAKES PEOPLE LIKE THIS BRAND?',
    responseMode: 'MULTI_SELECT',
    type: 'multi',
    options: IDNTY_PERSONALITY_CHARM_OPTIONS,
    maxSelections: 4,
    skippable: true,
  },
  {
    id: 'observation',
    domain: 'OBSERVATION',
    title: 'WHAT DOES THIS BRAND NOTICE\nTHAT OTHER PEOPLE MISS?',
    responseMode: 'FREE_TEXT',
    type: 'textarea',
    placeholder: 'THE SMALL THING, THE PATTERN, THE DETAIL…',
    maxLength: 400,
    skippable: true,
  },
  {
    id: 'memorability',
    domain: 'MEMORABILITY',
    title: 'WHAT SHOULD SOMEONE QUOTE, SCREENSHOT,\nOR REPEAT AFTER LEAVING?',
    subtitle: 'NOT A TAGLINE — THE KIND OF THING THAT STICKS.',
    responseMode: 'FREE_TEXT',
    type: 'textarea',
    placeholder: 'THE LINE, THE MOMENT, THE DETAIL…',
    maxLength: 400,
    skippable: true,
  },
  {
    id: 'emotional-range',
    domain: 'EMOTIONAL_RANGE',
    title: 'WHAT EMOTIONS IS THIS BRAND ALLOWED TO HAVE?',
    responseMode: 'MULTI_SELECT',
    type: 'multi',
    options: IDNTY_PERSONALITY_EMOTIONAL_RANGE_OPTIONS,
    maxSelections: 5,
    skippable: true,
  },
  {
    id: 'restraint',
    domain: 'RESTRAINT',
    title: 'WHEN SHOULD THIS BRAND HOLD BACK?',
    responseMode: 'MULTI_SELECT',
    type: 'multi',
    options: IDNTY_PERSONALITY_RESTRAINT_OPTIONS,
    maxSelections: 3,
    skippable: true,
  },
  {
    id: 'personality-tension',
    domain: 'PERSONALITY_TENSION',
    title: 'WHICH CONTRADICTIONS FEEL MOST LIKE YOU?',
    subtitle: 'PERSONALITY TENSION — NOT JUST VISUAL.',
    responseMode: 'MULTI_SELECT',
    type: 'multi',
    options: IDNTY_PERSONALITY_TENSION_OPTIONS,
    maxSelections: 3,
    skippable: true,
  },
  {
    id: 'social-reaction',
    domain: 'SOCIAL_REACTION',
    title: 'IF SOMEONE COMMENTS SOMETHING WRONG,\nWHAT WOULD THIS BRAND DO?',
    responseMode: 'MULTI_SELECT',
    type: 'multi',
    options: IDNTY_PERSONALITY_SOCIAL_REACTION_OPTIONS,
    maxSelections: 2,
    skippable: true,
  },
  {
    id: 'self-correction',
    domain: 'SELF_CORRECTION',
    title: 'WHAT HAPPENS WHEN THE BRAND GETS IT WRONG?',
    responseMode: 'MULTI_SELECT',
    type: 'multi',
    options: IDNTY_PERSONALITY_SELF_CORRECTION_OPTIONS,
    maxSelections: 3,
    skippable: true,
  },
  {
    id: 'anti-personality',
    domain: 'ANTI_PERSONALITY',
    title: 'WHAT WOULD MAKE THIS BRAND\nCRINGE AT ITSELF?',
    responseMode: 'FREE_TEXT',
    type: 'textarea',
    placeholder: 'TRY-HARD SLANG, FAKE LUXURY, FORCED RELATABILITY…',
    maxLength: 500,
    skippable: true,
  },
];

export function getPersonalityQuestion(stepId: string): PersonalityQuestionStep | undefined {
  return IDNTY_PERSONALITY_QUESTIONS.find((q) => q.id === stepId);
}

export function idntyPersonalityPath(stateSlug: string, stepId: string): string {
  return `/idnty/${stateSlug}/personality/${stepId}`;
}

export function idntyPersonalityReviewPath(stateSlug: string): string {
  return `/idnty/${stateSlug}/personality/review`;
}

export function idntyPersonalityCalibratePath(stateSlug: string, stepId: string): string {
  return `/idnty/${stateSlug}/calibrate-personality/${stepId}`;
}

export function personalityFirstStep(): PersonalityQuestionStep {
  return IDNTY_PERSONALITY_QUESTIONS[0]!;
}

export function personalityNextStep(currentId: string): PersonalityQuestionStep | null {
  const idx = IDNTY_PERSONALITY_QUESTIONS.findIndex((q) => q.id === currentId);
  if (idx < 0 || idx >= IDNTY_PERSONALITY_QUESTIONS.length - 1) return null;
  return IDNTY_PERSONALITY_QUESTIONS[idx + 1] ?? null;
}
