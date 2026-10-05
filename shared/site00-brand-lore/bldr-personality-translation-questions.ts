/**
 * Builder Personality Translation — how upstream Identity personality behaves digitally.
 *
 * Builder does NOT redefine personality canon — it translates inherited behavior.
 */

export type PersonalityTranslationOption = {
  id: string;
  label: string;
};

export type PersonalityTranslationStep = {
  id: string;
  title: string;
  subtitle?: string;
  type: 'single' | 'multi' | 'textarea';
  options?: PersonalityTranslationOption[];
  maxLength?: number;
  skippable?: boolean;
  placeholder?: string;
  domain: string;
};

export const BLDR_DIGITAL_PRESENCE_OPTIONS: PersonalityTranslationOption[] = [
  { id: 'instantly', label: 'INSTANTLY' },
  { id: 'gradually', label: 'GRADUALLY' },
  { id: 'through-details', label: 'THROUGH DETAILS' },
  { id: 'through-copy', label: 'THROUGH COPY' },
  { id: 'through-interaction', label: 'THROUGH INTERACTION' },
  { id: 'through-motion', label: 'THROUGH MOTION' },
  { id: 'through-surprise', label: 'THROUGH SURPRISE' },
  { id: 'through-utility', label: 'THROUGH UTILITY' },
  { id: 'through-atmosphere', label: 'THROUGH ATMOSPHERE' },
  { id: 'other', label: 'OTHER' },
];

export const BLDR_UI_ATTITUDE_OPTIONS: PersonalityTranslationOption[] = [
  { id: 'guide-quietly', label: 'GUIDE QUIETLY' },
  { id: 'talk-back', label: 'TALK BACK' },
  { id: 'celebrate', label: 'CELEBRATE' },
  { id: 'challenge', label: 'CHALLENGE' },
  { id: 'reveal', label: 'REVEAL THINGS' },
  { id: 'reward-curiosity', label: 'REWARD CURIOSITY' },
  { id: 'stay-out', label: 'STAY OUT OF THE WAY' },
  { id: 'interrupt-right-moment', label: 'INTERRUPT AT THE RIGHT MOMENT' },
  { id: 'surprise', label: 'SURPRISE PEOPLE' },
  { id: 'other', label: 'OTHER' },
];

export const BLDR_MICROCOPY_LEVEL_OPTIONS: PersonalityTranslationOption[] = [
  { id: 'almost-none', label: 'ALMOST NONE' },
  { id: 'subtle', label: 'SUBTLE' },
  { id: 'noticeable', label: 'NOTICEABLE' },
  { id: 'everywhere', label: 'EVERYWHERE IT MAKES SENSE' },
  { id: 'very-expressive', label: 'VERY EXPRESSIVE' },
];

export const BLDR_ERROR_STATE_OPTIONS: PersonalityTranslationOption[] = [
  { id: 'calm', label: 'CALM' },
  { id: 'useful', label: 'USEFUL' },
  { id: 'apologetic', label: 'APOLOGETIC' },
  { id: 'witty', label: 'WITTY' },
  { id: 'direct', label: 'DIRECT' },
  { id: 'reassuring', label: 'REASSURANT' },
  { id: 'playful', label: 'PLAYFUL' },
  { id: 'other', label: 'OTHER' },
];

export const BLDR_MOTION_PERSONALITY_OPTIONS: PersonalityTranslationOption[] = [
  { id: 'precise', label: 'PRECISE' },
  { id: 'elastic', label: 'ELASTIC' },
  { id: 'abrupt', label: 'ABRUPT' },
  { id: 'graceful', label: 'GRACEFUL' },
  { id: 'playful', label: 'PLAYFUL' },
  { id: 'cinematic', label: 'CINEMATIC' },
  { id: 'mechanical', label: 'MECHANICAL' },
  { id: 'organic', label: 'ORGANIC' },
  { id: 'energetic', label: 'ENERGETIC' },
  { id: 'restrained', label: 'RESTRAINED' },
  { id: 'other', label: 'OTHER' },
];

export const BLDR_INTERACTION_CONFIDENCE_OPTIONS: PersonalityTranslationOption[] = [
  { id: 'never', label: 'NEVER' },
  { id: 'important-only', label: 'ONLY FOR SOMETHING IMPORTANT' },
  { id: 'adds-personality', label: 'YES, IF IT ADDS PERSONALITY' },
  { id: 'improves-experience', label: 'YES, IF IT IMPROVES THE EXPERIENCE' },
  { id: 'surprise-me', label: 'SURPRISE ME' },
];

/** Builder personality translation steps — after core experience questions. */
export const BLDR_PERSONALITY_TRANSLATION_QUESTIONS: PersonalityTranslationStep[] = [
  {
    id: 'digital-presence',
    domain: 'DIGITAL_PRESENCE',
    title: 'WHEN SOMEONE ENTERS YOUR DIGITAL WORLD,\nHOW SHOULD YOUR PERSONALITY SHOW UP?',
    type: 'multi',
    options: BLDR_DIGITAL_PRESENCE_OPTIONS,
    skippable: true,
  },
  {
    id: 'ui-attitude',
    domain: 'UI_ATTITUDE',
    title: 'IF THE INTERFACE COULD HAVE AN ATTITUDE,\nWHAT WOULD IT DO?',
    type: 'multi',
    options: BLDR_UI_ATTITUDE_OPTIONS,
    skippable: true,
  },
  {
    id: 'microcopy-level',
    domain: 'MICROCOPY_PERSONALITY',
    title: 'HOW MUCH PERSONALITY SHOULD LIVE IN THE SMALL STUFF?',
    type: 'single',
    options: BLDR_MICROCOPY_LEVEL_OPTIONS,
    skippable: true,
  },
  {
    id: 'error-state',
    domain: 'ERROR_STATE_BEHAVIOR',
    title: 'WHEN SOMETHING GOES WRONG,\nHOW SHOULD THE BRAND REACT?',
    type: 'multi',
    options: BLDR_ERROR_STATE_OPTIONS,
    skippable: true,
  },
  {
    id: 'motion-personality',
    domain: 'MOTION_PERSONALITY',
    title: 'IF THIS BRAND MOVED, HOW WOULD IT MOVE?',
    type: 'multi',
    options: BLDR_MOTION_PERSONALITY_OPTIONS,
    skippable: true,
  },
  {
    id: 'interaction-confidence',
    domain: 'INTERACTION_CONFIDENCE',
    title: 'SHOULD THE EXPERIENCE EVER INTERRUPT THE USER?',
    type: 'single',
    options: BLDR_INTERACTION_CONFIDENCE_OPTIONS,
    skippable: true,
  },
  {
    id: 'repeat-visit-personality',
    domain: 'REPEAT_VISIT_PERSONALITY',
    title: 'WHAT SHOULD FEEL DIFFERENT\nTHE SECOND TIME SOMEONE COMES BACK?',
    type: 'textarea',
    placeholder: 'THE DETAIL, THE REVEAL, THE SHIFT…',
    maxLength: 400,
    skippable: true,
  },
  {
    id: 'personality-signature',
    domain: 'PERSONALITY_SIGNATURE',
    title: 'WHAT INTERACTION WOULD MAKE SOMEONE SAY\n"THAT IS SO THEM"?',
    type: 'textarea',
    placeholder: 'THE MOMENT, THE COPY, THE BEHAVIOR…',
    maxLength: 400,
    skippable: true,
  },
];

export const BUILDER_INHERITED_PERSONALITY_FIELDS = [
  'socialInstinct',
  'confidenceBehavior',
  'witBehavior',
  'humanityBehavior',
  'disagreementBehavior',
  'antiPersonality',
] as const;

export function getPersonalityTranslationQuestion(stepId: string): PersonalityTranslationStep | undefined {
  return BLDR_PERSONALITY_TRANSLATION_QUESTIONS.find((q) => q.id === stepId);
}
