/**
 * Builder Experience Translation — client-facing question registry.
 */

import { IDNTY_LORE_ROLE_OPTIONS } from './idnty-lore-questions.js';
import { formatCompoundLabels, resolveOptionLabels } from './loreAnswerTypes.js';

export type ExperienceQuestionOption = {
  id: string;
  label: string;
  description?: string;
};

export type ExperienceQuestionStep = {
  id: string;
  title: string;
  subtitle?: string;
  type: 'single' | 'multi' | 'textarea';
  options?: ExperienceQuestionOption[];
  maxLength?: number;
  required?: boolean;
  skippable?: boolean;
  placeholder?: string;
  domain: string;
};

export const BLDR_ARRIVAL_OPTIONS: ExperienceQuestionOption[] = [
  { id: 'explore', label: 'EXPLORE' },
  { id: 'shop', label: 'SHOP' },
  { id: 'understand', label: 'UNDERSTAND' },
  { id: 'watch', label: 'WATCH' },
  { id: 'build', label: 'BUILD' },
  { id: 'book', label: 'BOOK' },
  { id: 'join', label: 'JOIN' },
  { id: 'discover', label: 'DISCOVER' },
  { id: 'play', label: 'PLAY' },
  { id: 'enter', label: 'ENTER' },
  { id: 'compare', label: 'COMPARE' },
  { id: 'custom', label: 'CUSTOM' },
];

export const BLDR_DIGITAL_METAPHOR_OPTIONS: ExperienceQuestionOption[] = [
  { id: 'store', label: 'A STORE' },
  { id: 'tool', label: 'A TOOL' },
  { id: 'publication', label: 'A PUBLICATION' },
  { id: 'world', label: 'A WORLD' },
  { id: 'studio', label: 'A STUDIO' },
  { id: 'dashboard', label: 'A DASHBOARD' },
  { id: 'library', label: 'A LIBRARY' },
  { id: 'showroom', label: 'A SHOWROOM' },
  { id: 'community', label: 'A COMMUNITY' },
  { id: 'system', label: 'A SYSTEM' },
  { id: 'other', label: 'SOMETHING ELSE' },
];

export const BLDR_MOVEMENT_OPTIONS: ExperienceQuestionOption[] = [
  { id: 'guided', label: 'GUIDED JOURNEY' },
  { id: 'explore-freely', label: 'EXPLORE FREELY' },
  { id: 'search', label: 'SEARCH / INDEX' },
  { id: 'rooms', label: 'ROOM TO ROOM' },
  { id: 'feed', label: 'FEED' },
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'choose-path', label: 'CHOOSE YOUR OWN PATH' },
  { id: 'task-driven', label: 'TASK-DRIVEN' },
  { id: 'custom', label: 'CUSTOM' },
];

export const BLDR_ALIVE_OPTIONS: ExperienceQuestionOption[] = [
  { id: 'content', label: 'CONTENT' },
  { id: 'products', label: 'PRODUCTS' },
  { id: 'community', label: 'COMMUNITY' },
  { id: 'data', label: 'DATA' },
  { id: 'movement', label: 'MOVEMENT' },
  { id: 'environment', label: 'ENVIRONMENT' },
  { id: 'story', label: 'STORY' },
  { id: 'personalization', label: 'PERSONALIZATION' },
  { id: 'recommendations', label: 'RECOMMENDATIONS' },
  { id: 'other', label: 'OTHER' },
];

export const BLDR_SIGNATURE_MOMENT_OPTIONS: ExperienceQuestionOption[] = [
  { id: 'product-reveal', label: 'PRODUCT REVEAL' },
  { id: 'booking', label: 'BOOKING' },
  { id: 'analysis', label: 'ANALYSIS' },
  { id: 'transformation', label: 'TRANSFORMATION' },
  { id: 'onboarding', label: 'ONBOARDING' },
  { id: 'checkout', label: 'CHECKOUT' },
  { id: 'portfolio', label: 'PORTFOLIO' },
  { id: 'learning', label: 'LEARNING' },
  { id: 'membership', label: 'MEMBERSHIP' },
  { id: 'building', label: 'BUILDING' },
  { id: 'results', label: 'RESULTS' },
  { id: 'other', label: 'OTHER' },
];

export const BLDR_PHYSICAL_OPTIONS: ExperienceQuestionOption[] = [
  { id: 'packaging', label: 'PACKAGING' },
  { id: 'retail', label: 'RETAIL' },
  { id: 'events', label: 'EVENTS' },
  { id: 'signage', label: 'SIGNAGE' },
  { id: 'print', label: 'PRINT' },
  { id: 'installation', label: 'INSTALLATION' },
  { id: 'environment', label: 'ENVIRONMENT' },
  { id: 'future-locations', label: 'FUTURE LOCATIONS' },
  { id: 'none', label: 'NONE' },
  { id: 'other', label: 'OTHER' },
];

export const BLDR_PERSISTENCE_OPTIONS: ExperienceQuestionOption[] = [
  { id: 'saved-progress', label: 'SAVED PROGRESS' },
  { id: 'preferences', label: 'PREFERENCES' },
  { id: 'recommendations', label: 'RECOMMENDATIONS' },
  { id: 'account-history', label: 'ACCOUNT HISTORY' },
  { id: 'membership', label: 'MEMBERSHIP' },
  { id: 'personalization', label: 'PERSONALIZATION' },
  { id: 'collections', label: 'COLLECTIONS' },
  { id: 'none', label: 'NONE' },
  { id: 'other', label: 'OTHER' },
];

export const BLDR_DEPTH_OPTIONS: ExperienceQuestionOption[] = [
  { id: 'simple', label: 'SIMPLE PRESENTATION' },
  { id: 'interactive', label: 'INTERACTIVE EXPERIENCE' },
  { id: 'functional', label: 'FUNCTIONAL SYSTEM' },
  { id: 'immersive', label: 'IMMERSIVE WORLD' },
  { id: 'custom', label: 'CUSTOM' },
];

export const BLDR_EXPERIENCE_QUESTIONS: ExperienceQuestionStep[] = [
  {
    id: 'arrival',
    domain: 'PRIMARY_ENTRY_BEHAVIOR',
    title: 'WHAT SHOULD HAPPEN\nTHE SECOND THEY ARRIVE?',
    type: 'single',
    options: BLDR_ARRIVAL_OPTIONS,
    skippable: true,
  },
  {
    id: 'digital-metaphor',
    domain: 'DIGITAL_METAPHOR',
    title: 'WHAT IS THIS PLACE?',
    type: 'single',
    options: BLDR_DIGITAL_METAPHOR_OPTIONS,
    skippable: true,
  },
  {
    id: 'movement',
    domain: 'NAVIGATION_BEHAVIOR',
    title: 'HOW SHOULD PEOPLE MOVE THROUGH IT?',
    type: 'single',
    options: BLDR_MOVEMENT_OPTIONS,
    skippable: true,
  },
  {
    id: 'alive',
    domain: 'DYNAMIC_SYSTEM_PRIORITIES',
    title: 'WHAT SHOULD FEEL ALIVE?',
    type: 'multi',
    options: BLDR_ALIVE_OPTIONS,
    skippable: true,
  },
  {
    id: 'anti-website',
    domain: 'DIGITAL_ANTI_PATTERNS',
    title: 'WHAT SHOULD NEVER FEEL\nLIKE A NORMAL WEBSITE?',
    type: 'textarea',
    maxLength: 500,
    placeholder: 'THE THINGS YOU WANT TO AVOID…',
    skippable: true,
  },
  {
    id: 'signature-moment',
    domain: 'SIGNATURE_EXPERIENCES',
    title: 'WHAT DESERVES\nITS OWN MOMENT?',
    type: 'multi',
    options: BLDR_SIGNATURE_MOMENT_OPTIONS,
    skippable: true,
  },
  {
    id: 'physical',
    domain: 'PHYSICAL_EXTENSIONS',
    title: 'WHERE SHOULD THIS WORLD\nBECOME PHYSICAL?',
    type: 'multi',
    options: BLDR_PHYSICAL_OPTIONS,
    skippable: true,
  },
  {
    id: 'persistence',
    domain: 'PERSISTENT_USER_STATE',
    title: 'WHAT SHOULD FOLLOW THEM?',
    type: 'multi',
    options: BLDR_PERSISTENCE_OPTIONS,
    skippable: true,
  },
  {
    id: 'return',
    domain: 'REPEAT_VISIT_BEHAVIOR',
    title: 'WHAT SHOULD CHANGE\nWHEN THEY COME BACK?',
    type: 'textarea',
    maxLength: 400,
    placeholder: 'HOW REPEAT VISITS FEEL DIFFERENT…',
    skippable: true,
  },
  {
    id: 'depth',
    domain: 'EXPERIENCE_DEPTH',
    title: 'HOW DEEP DOES THE WORLD GO?',
    type: 'single',
    options: BLDR_DEPTH_OPTIONS,
    skippable: true,
  },
  {
    id: 'advantage',
    domain: 'SIGNATURE_DIGITAL_ADVANTAGE',
    title: 'WHAT SHOULD FEEL IMPOSSIBLE\nANYWHERE ELSE?',
    type: 'textarea',
    maxLength: 500,
    placeholder: 'YOUR UNFAIR DIGITAL ADVANTAGE…',
    skippable: true,
  },
];

export function getExperienceQuestion(stepId: string): ExperienceQuestionStep | undefined {
  return BLDR_EXPERIENCE_QUESTIONS.find((q) => q.id === stepId);
}

export function bldrExperiencePath(classSlug: string, stepId: string): string {
  return `/bldr/${classSlug}/experience/${stepId}`;
}

export function bldrExperienceFirstStep(): string {
  return BLDR_EXPERIENCE_QUESTIONS[0]!.id;
}

export function bldrExperienceNextStep(currentStepId: string): string | null {
  const idx = BLDR_EXPERIENCE_QUESTIONS.findIndex((q) => q.id === currentStepId);
  if (idx < 0 || idx >= BLDR_EXPERIENCE_QUESTIONS.length - 1) return null;
  return BLDR_EXPERIENCE_QUESTIONS[idx + 1]!.id;
}

/** Identity lore context Builder may inherit from Identity intake (raw answer shape). */
export type BuilderInheritedLoreContext = {
  worldMetaphor?: string | null;
  audienceRelationship?: string | string[] | null;
};

/** Normalize localStorage / server inherited lore snapshot for Builder UI. */
export function parseBuilderInheritedLoreContext(snap: unknown): BuilderInheritedLoreContext | null {
  if (!snap || typeof snap !== 'object') return null;
  const raw = snap as Record<string, unknown>;

  const worldMetaphor = typeof raw.worldMetaphor === 'string' && raw.worldMetaphor.trim()
    ? raw.worldMetaphor
    : null;

  let audienceRelationship: string | string[] | null = null;
  const role = raw.audienceRelationship;
  if (typeof role === 'string' && role.trim()) {
    audienceRelationship = role;
  } else if (Array.isArray(role)) {
    const ids = role.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
    audienceRelationship = ids.length > 0 ? ids : null;
  }

  if (!worldMetaphor && !audienceRelationship) return null;
  return { worldMetaphor, audienceRelationship };
}

/** Format inherited role answer (option ids or synthesized labels) for display. */
export function formatInheritedAudienceRelationship(
  value: string | string[] | null | undefined,
): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value.trim() || null;
  if (!Array.isArray(value) || value.length === 0) return null;
  const labels = resolveOptionLabels(value, IDNTY_LORE_ROLE_OPTIONS);
  return formatCompoundLabels(labels);
}

/** Contextualize Builder prompt when Identity lore is available. */
export function contextualizeExperienceTitle(
  stepId: string,
  inheritedLore: BuilderInheritedLoreContext | null,
): string {
  const base = BLDR_EXPERIENCE_QUESTIONS.find((q) => q.id === stepId)?.title ?? '';
  if (!inheritedLore?.worldMetaphor) return base;
  if (stepId === 'movement') {
    return `HOW SHOULD THIS WORLD BE EXPLORED?`;
  }
  return base;
}

/** Identity lore fields Builder must NOT re-ask. */
export const BUILDER_INHERITED_LORE_FIELDS = [
  'emotionalPromise',
  'worldMetaphor',
  'creativeTensions',
  'materialVocabulary',
  'creativeAntiPatterns',
  'audienceRelationship',
  'socialSignal',
] as const;
