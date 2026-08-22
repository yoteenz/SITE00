/**
 * Identity Brand World / Lore — client-facing question registry.
 *
 * SITE 00 conversational prompts; internal domain labels are NOT shown to clients.
 * Steps are shared across all Identity brand states (starting-at-zero, some-pieces-exist, etc.).
 */

export type LoreQuestionOption = {
  id: string;
  label: string;
  description?: string;
};

export type LoreQuestionStep = {
  id: string;
  /** Client-facing prompt (SITE 00 voice). */
  title: string;
  subtitle?: string;
  helper?: string;
  type: 'single' | 'multi' | 'textarea' | 'language-samples';
  options?: LoreQuestionOption[];
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
  /** Allow SKIP / NOT SURE YET without blocking submission. */
  skippable?: boolean;
  /** Internal domain — for synthesis mapping only. */
  domain: string;
};

export const IDNTY_LORE_FEELING_OPTIONS: LoreQuestionOption[] = [
  { id: 'intrigued', label: 'INTRIGUED' },
  { id: 'seen', label: 'SEEN' },
  { id: 'energized', label: 'ENERGIZED' },
  { id: 'safe', label: 'SAFE' },
  { id: 'challenged', label: 'CHALLENGED' },
  { id: 'desired', label: 'DESIRED' },
  { id: 'informed', label: 'INFORMED' },
  { id: 'entertained', label: 'ENTERTAINED' },
  { id: 'powerful', label: 'POWERFUL' },
  { id: 'curious', label: 'CURIOUS' },
  { id: 'inspired', label: 'INSPIRED' },
  { id: 'calm', label: 'CALM' },
  { id: 'other', label: 'OTHER' },
];

export const IDNTY_LORE_ROLE_OPTIONS: LoreQuestionOption[] = [
  { id: 'friend', label: 'THE FRIEND WHO KNOWS EVERYTHING' },
  { id: 'expert', label: 'THE EXPERT PEOPLE TRUST' },
  { id: 'insider', label: 'THE INSIDER WITH ACCESS' },
  { id: 'challenger', label: "THE CHALLENGER SAYING WHAT OTHERS WON'T" },
  { id: 'guide', label: 'THE GUIDE SHOWING THE WAY' },
  { id: 'world', label: 'THE WORLD THEY WANT TO BELONG TO' },
  { id: 'tastemaker', label: 'THE TASTEMAKER' },
  { id: 'problem-solver', label: 'THE PROBLEM SOLVER' },
  { id: 'entertainer', label: 'THE ENTERTAINER WITH A POINT OF VIEW' },
  { id: 'other', label: 'SOMETHING ELSE' },
];

export const IDNTY_LORE_ENEMY_OPTIONS: LoreQuestionOption[] = [
  { id: 'gatekeeping', label: 'GATEKEEPING' },
  { id: 'misinformation', label: 'MISINFORMATION' },
  { id: 'boring', label: 'BORING' },
  { id: 'sameness', label: 'SAMENESS' },
  { id: 'bad-taste', label: 'BAD TASTE' },
  { id: 'overcomplication', label: 'OVERCOMPLICATION' },
  { id: 'waste', label: 'WASTE' },
  { id: 'old-systems', label: 'OLD SYSTEMS' },
  { id: 'intimidation', label: 'INTIMIDATION' },
  { id: 'disconnection', label: 'DISCONNECTION' },
  { id: 'mediocrity', label: 'MEDIOCRITY' },
  { id: 'other', label: 'OTHER' },
];

export const IDNTY_LORE_TENSION_OPTIONS: LoreQuestionOption[] = [
  { id: 'polished-messy', label: 'POLISHED + MESSY' },
  { id: 'serious-funny', label: 'SERIOUS + FUNNY' },
  { id: 'luxurious-approachable', label: 'LUXURIOUS + APPROACHABLE' },
  { id: 'futuristic-human', label: 'FUTURISTIC + HUMAN' },
  { id: 'loud-intelligent', label: 'LOUD + INTELLIGENT' },
  { id: 'nostalgic-modern', label: 'NOSTALGIC + MODERN' },
  { id: 'strange-familiar', label: 'STRANGE + FAMILIAR' },
  { id: 'refined-raw', label: 'REFINED + RAW' },
  { id: 'playful-authoritative', label: 'PLAYFUL + AUTHORITATIVE' },
  { id: 'minimal-expressive', label: 'MINIMAL + EXPRESSIVE' },
  { id: 'other', label: 'OTHER' },
];

export const IDNTY_LORE_STATUS_OPTIONS: LoreQuestionOption[] = [
  { id: 'know-something', label: 'THEY KNOW SOMETHING' },
  { id: 'good-taste', label: 'THEY HAVE GOOD TASTE' },
  { id: 'in-on-it', label: 'THEY ARE IN ON IT' },
  { id: 'care', label: 'THEY CARE' },
  { id: 'ambitious', label: 'THEY ARE AMBITIOUS' },
  { id: 'smart', label: 'THEY ARE SMART' },
  { id: 'funny', label: 'THEY ARE FUNNY' },
  { id: 'belong', label: 'THEY BELONG HERE' },
  { id: 'discovered-first', label: 'THEY DISCOVERED IT FIRST' },
  { id: 'other', label: 'OTHER' },
];

export const IDNTY_LORE_RITUAL_OPTIONS: LoreQuestionOption[] = [
  { id: 'answers', label: 'ANSWERS' },
  { id: 'laugh', label: 'A LAUGH' },
  { id: 'discovery', label: 'DISCOVERY' },
  { id: 'perspective', label: 'PERSPECTIVE' },
  { id: 'tools', label: 'TOOLS' },
  { id: 'inspiration', label: 'INSPIRATION' },
  { id: 'motivation', label: 'MOTIVATION' },
  { id: 'belonging', label: 'BELONGING' },
  { id: 'updates', label: 'UPDATES' },
  { id: 'taste', label: 'TASTE' },
  { id: 'entertainment', label: 'ENTERTAINMENT' },
  { id: 'other', label: 'OTHER' },
];

export const IDNTY_LORE_OBJECT_TAGS: LoreQuestionOption[] = [
  { id: 'paper', label: 'PAPER' },
  { id: 'metal', label: 'METAL' },
  { id: 'glass', label: 'GLASS' },
  { id: 'wood', label: 'WOOD' },
  { id: 'fabric', label: 'FABRIC' },
  { id: 'stone', label: 'STONE' },
  { id: 'screens', label: 'SCREENS' },
  { id: 'machines', label: 'MACHINES' },
  { id: 'plants', label: 'PLANTS' },
  { id: 'packaging', label: 'PACKAGING' },
  { id: 'architecture', label: 'ARCHITECTURE' },
  { id: 'clothing', label: 'CLOTHING' },
  { id: 'tools', label: 'TOOLS' },
  { id: 'symbols', label: 'SYMBOLS' },
  { id: 'other', label: 'OTHER' },
];

/** All lore steps — order defines the default flow. Adaptive logic may skip subsets. */
export const IDNTY_LORE_QUESTIONS: LoreQuestionStep[] = [
  {
    id: 'feeling',
    domain: 'EMOTIONAL_FIRST_IMPRESSION',
    title: 'BEFORE THEY UNDERSTAND YOU,\nWHAT SHOULD THEY FEEL?',
    type: 'multi',
    options: IDNTY_LORE_FEELING_OPTIONS,
    required: false,
    skippable: true,
  },
  {
    id: 'role',
    domain: 'AUDIENCE_RELATIONSHIP',
    title: 'WHO ARE YOU IN THEIR WORLD?',
    type: 'single',
    options: IDNTY_LORE_ROLE_OPTIONS,
    required: false,
    skippable: true,
  },
  {
    id: 'belief',
    domain: 'BRAND_BELIEF',
    title: 'WHAT DOES YOUR BRAND BELIEVE\nTHAT OTHER PEOPLE KEEP GETTING WRONG?',
    type: 'textarea',
    maxLength: 600,
    placeholder: 'YOUR POINT OF VIEW…',
    required: false,
    skippable: true,
  },
  {
    id: 'enemy',
    domain: 'CULTURAL_OPPOSITION',
    title: 'WHAT ARE WE QUIETLY AT WAR WITH?',
    type: 'multi',
    options: IDNTY_LORE_ENEMY_OPTIONS,
    required: false,
    skippable: true,
  },
  {
    id: 'obsession',
    domain: 'CORE_OBSESSIONS',
    title: 'WHAT COULD THIS BRAND TALK ABOUT FOREVER?',
    subtitle: 'NOT PRODUCTS.',
    helper: 'IDEAS, BEHAVIORS, PROBLEMS, CURIOSITIES, CONVERSATIONS.',
    type: 'textarea',
    maxLength: 500,
    placeholder: 'THE THINGS YOU NEVER GET TIRED OF…',
    required: false,
    skippable: true,
  },
  {
    id: 'world',
    domain: 'WORLD_METAPHOR',
    title: 'IF THIS BRAND WERE A PLACE,\nWHERE DID WE JUST WALK INTO?',
    helper: 'NOT LITERALLY. DESCRIBE THE ATMOSPHERE.',
    type: 'textarea',
    maxLength: 500,
    placeholder: 'THE FEELING OF THE SPACE…',
    required: false,
    skippable: true,
  },
  {
    id: 'objects',
    domain: 'MATERIAL_VOCABULARY',
    title: 'WHAT BELONGS IN THIS WORLD?',
    type: 'multi',
    options: IDNTY_LORE_OBJECT_TAGS,
    required: false,
    skippable: true,
  },
  {
    id: 'lineage',
    domain: 'REFERENCE_LINEAGE',
    title: 'WHAT DID YOU GROW UP LOVING?',
    helper: 'SHOWS. MOVIES. MAGAZINES. MUSIC. STORES. BRANDS. WEBSITES. ERAS. SUBCULTURES.',
    type: 'textarea',
    maxLength: 600,
    placeholder: 'WHAT SHAPED YOUR TASTE…',
    required: false,
    skippable: true,
  },
  {
    id: 'now',
    domain: 'CURRENT_REFERENCE_SIGNALS',
    title: 'WHAT HAS YOUR ATTENTION RIGHT NOW?',
    type: 'textarea',
    maxLength: 500,
    placeholder: 'WHAT YOU ARE LOOKING AT TODAY…',
    required: false,
    skippable: true,
  },
  {
    id: 'contradiction',
    domain: 'CREATIVE_TENSIONS',
    title: 'YOU CAN BE TWO THINGS AT ONCE.\nWHICH TENSIONS FEEL LIKE YOU?',
    type: 'multi',
    options: IDNTY_LORE_TENSION_OPTIONS,
    required: false,
    skippable: true,
  },
  {
    id: 'language',
    domain: 'AUTHENTIC_LANGUAGE',
    title: 'WHAT WOULD YOU ACTUALLY SAY?',
    subtitle: 'WRITE IN YOUR OWN VOICE.',
    type: 'language-samples',
    maxLength: 800,
    placeholder: 'A CAPTION. A CORRECTION. AN EXPLANATION TO A FRIEND…',
    required: false,
    skippable: true,
  },
  {
    id: 'line',
    domain: 'ANTI_LANGUAGE',
    title: 'WHAT WOULD YOU NEVER SAY?',
    type: 'textarea',
    maxLength: 400,
    placeholder: 'PHRASES THAT DO NOT SOUND LIKE YOU…',
    required: false,
    skippable: true,
  },
  {
    id: 'status',
    domain: 'SOCIAL_SIGNAL',
    title: 'WHEN PEOPLE SHARE THIS BRAND,\nWHAT SHOULD IT SAY ABOUT THEM?',
    type: 'single',
    options: IDNTY_LORE_STATUS_OPTIONS,
    required: false,
    skippable: true,
  },
  {
    id: 'ritual',
    domain: 'AUDIENCE_RITUAL',
    title: 'WHAT SHOULD PEOPLE COME BACK HERE FOR?',
    type: 'multi',
    options: IDNTY_LORE_RITUAL_OPTIONS,
    required: false,
    skippable: true,
  },
  {
    id: 'memory',
    domain: 'MEMORY_GOAL',
    title: 'WHEN EVERYTHING ELSE IS GONE,\nWHAT SHOULD THEY REMEMBER?',
    type: 'textarea',
    maxLength: 400,
    placeholder: 'THE ONE THING THAT STICKS…',
    required: false,
    skippable: true,
  },
  {
    id: 'symbol',
    domain: 'SYMBOLIC_VOCABULARY',
    title: 'IF WE COULD OWN ONE SYMBOL,\nOBJECT, MOTION, OR GESTURE,\nWHAT MIGHT IT BE?',
    type: 'textarea',
    maxLength: 300,
    placeholder: 'OPTIONAL — UNCERTAINTY IS FINE.',
    required: false,
    skippable: true,
  },
  {
    id: 'myth',
    domain: 'DESIRED_MYTHOLOGY',
    title: 'WHAT STORY SHOULD PEOPLE\nEVENTUALLY TELL ABOUT THIS BRAND?',
    type: 'textarea',
    maxLength: 500,
    placeholder: 'THE STORY THEY RETELL…',
    required: false,
    skippable: true,
  },
  {
    id: 'future',
    domain: 'FUTURE_WORLD',
    title: 'IF THIS GETS MUCH BIGGER\nTHAN YOU EXPECT,\nWHAT DOES IT BECOME?',
    type: 'textarea',
    maxLength: 500,
    placeholder: 'THE FUTURE YOU CAN IMAGINE…',
    required: false,
    skippable: true,
  },
  {
    id: 'no-go',
    domain: 'CREATIVE_ANTI_PATTERNS',
    title: 'WHAT WOULD MAKE YOU SAY:\n"THAT DOESN\'T FEEL LIKE US."',
    type: 'textarea',
    maxLength: 500,
    placeholder: 'YOUR NO-GO ZONE…',
    required: false,
    skippable: true,
  },
];

export function getLoreQuestion(stepId: string): LoreQuestionStep | undefined {
  return IDNTY_LORE_QUESTIONS.find((q) => q.id === stepId);
}

export function idntyLorePath(stateSlug: string, stepId: string): string {
  return `/idnty/${stateSlug}/world/${stepId}`;
}

export function idntyLoreReviewPath(stateSlug: string): string {
  return `/idnty/${stateSlug}/world-review`;
}

export function idntyLoreCalibratePath(stateSlug: string, stepId: string): string {
  return `/idnty/${stateSlug}/calibrate/${stepId}`;
}

export function idntyLoreNextStep(currentStepId: string): string | null {
  const idx = IDNTY_LORE_QUESTIONS.findIndex((q) => q.id === currentStepId);
  if (idx < 0 || idx >= IDNTY_LORE_QUESTIONS.length - 1) return null;
  return IDNTY_LORE_QUESTIONS[idx + 1]!.id;
}

export function idntyLoreFirstStep(): string {
  return IDNTY_LORE_QUESTIONS[0]!.id;
}
