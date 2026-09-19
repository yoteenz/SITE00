/**
 * Guest discovery intake questions — founder-friendly, brand-agnostic.
 * Reuses canonical question IDs from Brand Lore / Personality / Creative Appetite where noted.
 */

import { IDNTY_LORE_QUESTIONS } from '../site00-brand-lore/idnty-lore-questions.js';
import { IDNTY_PERSONALITY_QUESTIONS } from '../site00-brand-lore/idnty-personality-questions.js';
import { FOUNDER_CREATIVE_APPETITE_QUESTIONS } from '../site00-brand-lore/founderCreativeAppetite/questions.js';
import type { WorldIntakeSection } from './constants.js';

export type WorldIntakeStep = {
  id: string;
  section: WorldIntakeSection;
  title: string;
  subtitle?: string;
  helper?: string;
  responseMode: 'SINGLE_SELECT' | 'MULTI_SELECT' | 'TEXTAREA' | 'OFFERING_LIST';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ id: string; label: string }>;
  /** When set, reuses an existing methodology question — no duplicate identity truth. */
  reusesQuestionId?: string;
  reusesSource?: 'BRAND_LORE' | 'PERSONALITY' | 'CREATIVE_APPETITE';
};

const BUSINESS_STEPS: WorldIntakeStep[] = [
  {
    id: 'business-model',
    section: 'BUSINESS',
    title: 'HOW DOES YOUR BUSINESS MAKE MONEY?',
    helper: 'Describe the real business — not how you wish it worked.',
    responseMode: 'TEXTAREA',
    required: true,
    placeholder: 'Products, services, bookings, memberships, events…',
  },
  {
    id: 'revenue-sources',
    section: 'BUSINESS',
    title: 'WHAT ARE YOUR MAIN REVENUE SOURCES?',
    responseMode: 'TEXTAREA',
    required: true,
  },
  {
    id: 'operational-constraints',
    section: 'BUSINESS',
    title: 'ANY LEGAL, LOCATION, OR OPERATIONAL CONSTRAINTS WE SHOULD KNOW?',
    responseMode: 'TEXTAREA',
    required: false,
  },
];

const AUDIENCE_STEPS: WorldIntakeStep[] = [
  {
    id: 'audience-who',
    section: 'AUDIENCE',
    title: 'WHO IS THIS FOR?',
    responseMode: 'TEXTAREA',
    required: true,
  },
  {
    id: 'audience-need',
    section: 'AUDIENCE',
    title: 'WHAT DO THEY NEED FROM YOU?',
    responseMode: 'TEXTAREA',
    required: true,
  },
];

const OFFERING_STEPS: WorldIntakeStep[] = [
  {
    id: 'offerings-primary',
    section: 'OFFERINGS',
    title: 'WHAT DO YOU OFFER?',
    subtitle: 'List your main products, services, bookings, or experiences.',
    responseMode: 'TEXTAREA',
    required: true,
    placeholder: 'One offering per line is fine — we will structure this.',
  },
  {
    id: 'offerings-live',
    section: 'OFFERINGS',
    title: 'ANY LIVE SERVICES, READINGS, CONSULTATIONS, OR APPOINTMENTS?',
    responseMode: 'TEXTAREA',
    required: false,
  },
];

function reuseLoreSteps(): WorldIntakeStep[] {
  return IDNTY_LORE_QUESTIONS.slice(0, 6).map((q) => ({
    id: q.id,
    section: 'BRAND_LORE' as const,
    title: q.title,
    subtitle: q.subtitle,
    helper: q.helper,
    responseMode: q.responseMode === 'MULTI_SELECT' ? 'MULTI_SELECT' : q.responseMode === 'SINGLE_SELECT' ? 'SINGLE_SELECT' : 'TEXTAREA',
    required: q.required,
    placeholder: q.placeholder,
    options: q.options?.map((o) => ({ id: o.id, label: o.label })),
    reusesQuestionId: q.id,
    reusesSource: 'BRAND_LORE' as const,
  }));
}

function reusePersonalitySteps(): WorldIntakeStep[] {
  return IDNTY_PERSONALITY_QUESTIONS.slice(0, 6).map((q) => ({
    id: q.id,
    section: 'PERSONALITY' as const,
    title: q.title,
    subtitle: q.subtitle,
    helper: q.helper,
    responseMode: 'SINGLE_SELECT' as const,
    required: q.required,
    options: q.options?.map((o) => ({ id: o.id, label: o.label })),
    reusesQuestionId: q.id,
    reusesSource: 'PERSONALITY' as const,
  }));
}

function reuseAppetiteSteps(): WorldIntakeStep[] {
  return FOUNDER_CREATIVE_APPETITE_QUESTIONS.slice(0, 6).map((q) => ({
    id: q.id,
    section: 'CREATIVE_APPETITE' as const,
    title: q.title,
    subtitle: q.subtitle,
    helper: q.helper,
    responseMode: 'SINGLE_SELECT' as const,
    required: q.required,
    options: q.options?.map((o) => ({ id: o.id, label: o.label })),
    reusesQuestionId: q.id,
    reusesSource: 'CREATIVE_APPETITE' as const,
  }));
}

const WORLD_READINESS_STEPS: WorldIntakeStep[] = [
  {
    id: 'entry-experience',
    section: 'WORLD_READINESS',
    title: 'WHEN SOMEONE ARRIVES, WHAT SHOULD THEY FEEL JUST HAPPENED?',
    helper: 'They entered another place? Your real-world business? A fantasy? Something private?',
    responseMode: 'TEXTAREA',
    required: true,
  },
  {
    id: 'spatial-expectation',
    section: 'WORLD_READINESS',
    title: 'SHOULD PEOPLE FEEL LIKE THEY MOVE BETWEEN PLACES TO DO DIFFERENT THINGS?',
    responseMode: 'SINGLE_SELECT',
    required: true,
    options: [
      { id: 'spatial-yes', label: 'YES — DIFFERENT PLACES FOR DIFFERENT THINGS' },
      { id: 'spatial-menu', label: 'MORE MENU-DRIVEN THAN SPATIAL' },
      { id: 'spatial-mixed', label: 'A MIX' },
      { id: 'spatial-unknown', label: 'NOT SURE YET' },
    ],
  },
  {
    id: 'spatial-examples',
    section: 'WORLD_READINESS',
    title: 'IF YES — DESCRIBE IN YOUR OWN WORDS (OPTIONAL)',
    responseMode: 'TEXTAREA',
    required: false,
  },
  {
    id: 'customer-identity',
    section: 'WORLD_READINESS',
    title: 'HOW SHOULD CUSTOMERS EXIST INSIDE THE EXPERIENCE?',
    responseMode: 'SINGLE_SELECT',
    required: true,
    options: [
      { id: 'themselves', label: 'AS THEMSELVES' },
      { id: 'profile', label: 'PROFILE ONLY' },
      { id: 'avatar', label: 'CUSTOMIZABLE AVATAR' },
      { id: 'character', label: 'STYLIZED CHARACTER' },
      { id: 'anonymous', label: 'ANONYMOUS VISITOR' },
      { id: 'persona', label: 'SELECTABLE PERSONA' },
      { id: 'undecided', label: 'UNDECIDED' },
    ],
  },
  {
    id: 'avatar-customization',
    section: 'WORLD_READINESS',
    title: 'WHAT WOULD YOU WANT THEM TO CUSTOMIZE? (IF AVATAR/CHARACTER)',
    responseMode: 'TEXTAREA',
    required: false,
  },
  {
    id: 'founder-presence',
    section: 'WORLD_READINESS',
    title: 'HOW SHOULD YOU EXIST INSIDE THE EXPERIENCE?',
    responseMode: 'SINGLE_SELECT',
    required: true,
    options: [
      { id: 'not-present', label: 'NOT VISIBLY PRESENT' },
      { id: 'real-media', label: 'REAL PHOTOS / VIDEO' },
      { id: 'live-camera', label: 'LIVE CAMERA' },
      { id: 'avatar', label: 'STYLIZED AVATAR' },
      { id: 'ai-likeness', label: 'AI-GENERATED LIKENESS / CHARACTER' },
      { id: 'voice', label: 'VOICE ONLY' },
      { id: 'guide', label: 'GUIDE / HOST CHARACTER' },
      { id: 'multiple', label: 'MULTIPLE FORMS' },
      { id: 'undecided', label: 'UNDECIDED' },
    ],
  },
  {
    id: 'ai-representation',
    section: 'WORLD_READINESS',
    title: 'IF AI REPRESENTATION — ROLE, TONE, AND BOUNDARIES',
    responseMode: 'TEXTAREA',
    required: false,
  },
  {
    id: 'live-interaction',
    section: 'WORLD_READINESS',
    title: 'ANY LIVE VIDEO, AUDIO, CHAT, READINGS, OR SESSIONS?',
    responseMode: 'TEXTAREA',
    required: false,
  },
  {
    id: 'commerce-feel',
    section: 'WORLD_READINESS',
    title: 'HOW SHOULD BUYING OR BOOKING FEEL?',
    responseMode: 'TEXTAREA',
    required: true,
  },
  {
    id: 'navigation-philosophy',
    section: 'WORLD_READINESS',
    title: 'CLEAR DIRECT PATHS VS EXPLORATORY DISCOVERY?',
    responseMode: 'TEXTAREA',
    required: true,
  },
  {
    id: 'persistence-intent',
    section: 'WORLD_READINESS',
    title: 'WHAT SHOULD VISITORS RETAIN BETWEEN VISITS?',
    responseMode: 'TEXTAREA',
    required: false,
  },
  {
    id: 'social-presence',
    section: 'WORLD_READINESS',
    title: 'SHOULD VISITORS SEE OR INTERACT WITH EACH OTHER?',
    responseMode: 'TEXTAREA',
    required: true,
  },
  {
    id: 'content-creation',
    section: 'WORLD_READINESS',
    title: 'SHOULD THE WORLD ENABLE SHARING OR CREATION? (SCREENSHOTS, RESULTS, POSTS…)',
    responseMode: 'TEXTAREA',
    required: false,
  },
  {
    id: 'realism-fantasy',
    section: 'WORLD_READINESS',
    title: 'HOW CLOSE TO A REAL PLACE VS SOMETHING IMPOSSIBLE?',
    responseMode: 'TEXTAREA',
    required: true,
  },
  {
    id: 'gaming-depth',
    section: 'WORLD_READINESS',
    title: 'ANY GAME-LIKE DEPTH? (COLLECTIBLES, QUESTS, UNLOCKS…)',
    responseMode: 'SINGLE_SELECT',
    required: true,
    options: [
      { id: 'none', label: 'NONE' },
      { id: 'light', label: 'LIGHT' },
      { id: 'moderate', label: 'MODERATE' },
      { id: 'deep', label: 'DEEP' },
      { id: 'undecided', label: 'UNDECIDED' },
    ],
  },
  {
    id: 'hard-boundaries',
    section: 'WORLD_READINESS',
    title: 'WHAT WOULD MAKE THIS FEEL GIMMICKY, EMBARRASSING, OR WRONG?',
    responseMode: 'TEXTAREA',
    required: true,
  },
  {
    id: 'founder-world-hypothesis',
    section: 'WORLD_READINESS',
    title: 'DO YOU ALREADY HAVE A PICTURE IN YOUR HEAD? TELL US EVERYTHING.',
    helper: 'This is your hypothesis — not final canon.',
    responseMode: 'TEXTAREA',
    required: false,
  },
];

const EXPERIENCE_STEPS: WorldIntakeStep[] = [
  {
    id: 'expression-context',
    section: 'EXPERIENCE',
    title: 'WHERE DOES YOUR BRAND PRIMARILY LIVE?',
    responseMode: 'SINGLE_SELECT',
    required: true,
    options: [
      { id: 'ecommerce', label: 'SELLING PRODUCTS / SERVICES ONLINE' },
      { id: 'service', label: 'BOOKINGS & LIVE SERVICE' },
      { id: 'social', label: 'SOCIAL / COMMUNITY FIRST' },
      { id: 'content', label: 'CONTENT FIRST' },
      { id: 'experience', label: 'EXPERIENCE FIRST' },
      { id: 'world', label: 'IMMERSIVE WORLD FIRST' },
      { id: 'hybrid', label: 'A MIX' },
    ],
  },
];

export const WORLD_INTAKE_STEPS: WorldIntakeStep[] = [
  ...BUSINESS_STEPS,
  ...AUDIENCE_STEPS,
  ...OFFERING_STEPS,
  ...reuseLoreSteps(),
  ...reusePersonalitySteps(),
  ...EXPERIENCE_STEPS,
  ...reuseAppetiteSteps(),
  ...WORLD_READINESS_STEPS,
];

export function stepsForSection(section: WorldIntakeSection): WorldIntakeStep[] {
  if (section === 'REVIEW') return [];
  return WORLD_INTAKE_STEPS.filter((s) => s.section === section);
}

export function allStepIds(): string[] {
  return WORLD_INTAKE_STEPS.map((s) => s.id);
}

export function reusedIdentityQuestionIds(): string[] {
  return WORLD_INTAKE_STEPS.filter((s) => s.reusesQuestionId).map((s) => s.reusesQuestionId!);
}
