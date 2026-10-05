/**
 * IDNTY assessment engine — branch configs, steps, options, process strips.
 * Structured data isolated from UI components.
 */

import { SITE00_ROUTES } from './routes';
import type { IdntyBrandStateIconId } from './idnty-brand-state-icons';

export type IdntyAssessmentStateId =
  | 'starting-at-zero'
  | 'some-pieces-exist'
  | 'ready-for-evolution'
  | 'build-ready';

export type IdntyProcessStep = {
  id: string;
  label: string;
  description: string;
};

export type IdntyProcessStrip = {
  id: string;
  leadTitle?: string;
  leadBody?: string;
  leadHref?: string;
  leadLinkLabel?: string;
  steps: IdntyProcessStep[];
};

export type IdntyAssessmentOption = {
  id: string;
  label: string;
  description?: string;
};

export type IdntyAssessmentStep = {
  id: string;
  title: string;
  subtitle?: string;
  type: 'single' | 'multi' | 'textarea' | 'custom';
  options?: IdntyAssessmentOption[];
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
  /**
   * Public redesign: selecting the OTHER option expands a conditional field inside the same
   * working panel. The answer is stored under this key in the state's answers (never its own page).
   */
  conditionalOtherKey?: string;
};

export type IdntyAssessmentStateConfig = {
  id: IdntyAssessmentStateId;
  slug: string;
  stageMarker: string;
  title: string;
  declaration: string;
  editorialBody: string;
  editorialCta: string;
  breadcrumb: string;
  iconId?: IdntyBrandStateIconId;
  landingTitle: string;
  landingSubtitle?: string;
  landingType: 'question-list' | 'option-grid' | 'pathway-grid' | 'service-grid' | 'verification';
  landingOptions?: IdntyAssessmentOption[];
  steps: IdntyAssessmentStep[];
  processStrip: IdntyProcessStrip;
  primaryCta: string;
  secondaryCta?: string;
  completionTitle: string;
  completionSubtitle: string;
  recommendedActions: { id: string; label: string; href: string }[];
};

export const IDNTY_ASSESSMENT_STORAGE_KEY = 'site00_idnty_assessment_v1';

export const IDNTY_GOAL_OPTIONS: IdntyAssessmentOption[] = [
  { id: 'launch-brand', label: 'LAUNCH A NEW BRAND' },
  { id: 'digital-presence', label: 'ESTABLISH DIGITAL PRESENCE' },
  { id: 'sell-online', label: 'SELL ONLINE' },
  { id: 'generate-leads', label: 'GENERATE LEADS' },
  { id: 'showcase-work', label: 'SHOWCASE WORK' },
  { id: 'book-appointments', label: 'BOOK APPOINTMENTS' },
  { id: 'build-community', label: 'BUILD COMMUNITY' },
  { id: 'digital-product', label: 'CREATE A DIGITAL PRODUCT' },
  { id: 'reposition', label: 'REPOSITION AN EXISTING IDEA' },
  { id: 'other', label: 'OTHER' },
];

export const IDNTY_TIMELINE_OPTIONS: IdntyAssessmentOption[] = [
  { id: 'asap', label: 'AS SOON AS POSSIBLE' },
  { id: '1-2', label: '1–2 MONTHS' },
  { id: '3-4', label: '3–4 MONTHS' },
  { id: '5-6', label: '5–6 MONTHS' },
  { id: '6plus', label: '6+ MONTHS' },
  { id: 'flexible', label: 'FLEXIBLE / NOT SURE' },
];

export const IDNTY_BUDGET_OPTIONS: IdntyAssessmentOption[] = [
  { id: 'under-5k', label: 'UNDER $5,000' },
  { id: '5k-10k', label: '$5,000 – $10,000' },
  { id: '10k-25k', label: '$10,000 – $25,000' },
  { id: '25k-50k', label: '$25,000 – $50,000' },
  { id: '50k-plus', label: '$50,000+' },
  { id: 'unsure', label: 'NOT SURE YET' },
];

export const IDNTY_EXISTING_ASSET_OPTIONS: IdntyAssessmentOption[] = [
  { id: 'logo', label: 'LOGO' },
  { id: 'color', label: 'COLOR PALETTE' },
  { id: 'typography', label: 'TYPOGRAPHY' },
  { id: 'tagline', label: 'TAGLINE / MESSAGING' },
  { id: 'website', label: 'WEBSITE' },
  { id: 'social', label: 'SOCIAL MEDIA' },
  { id: 'marketing', label: 'MARKETING MATERIALS' },
  { id: 'photography', label: 'PHOTOGRAPHY / IMAGERY' },
  { id: 'other', label: 'OTHER (PLEASE SPECIFY)' },
];

/**
 * READY FOR EVOLUTION areas — IDNTY-owned identity domains only (public redesign authority).
 * Legacy cross-domain ids (digital-experience, growth-systems, launch-evolve) may still exist in
 * previously stored answers; they are never offered here and render by raw id if encountered.
 */
export const IDNTY_EVOLUTION_PATHWAYS: IdntyAssessmentOption[] = [
  { id: 'brand-strategy', label: 'BRAND STRATEGY', description: 'CLARITY CREATES DIRECTION.' },
  { id: 'visual-identity', label: 'VISUAL IDENTITY', description: 'A STRONGER EXPRESSION.' },
  { id: 'brand-messaging', label: 'BRAND MESSAGING', description: 'A CLEARER STORY.' },
];

export const IDNTY_COHESION_GAP_OPTIONS: IdntyAssessmentOption[] = [
  { id: 'inconsistent-visual', label: 'INCONSISTENT VISUAL SYSTEM' },
  { id: 'unclear-messaging', label: 'UNCLEAR MESSAGING' },
  { id: 'disconnected-touchpoints', label: 'DISCONNECTED TOUCHPOINTS' },
  { id: 'outdated-assets', label: 'OUTDATED ASSETS' },
  { id: 'no-guidelines', label: 'NO BRAND GUIDELINES' },
  { id: 'team-misalignment', label: 'TEAM MISALIGNMENT' },
];

/** Internal diagnostic — selected inside SOME PIECES EXIST, not a top-level state. */
export const IDNTY_PIECES_DIAGNOSTIC_OPTIONS: IdntyAssessmentOption[] = [
  {
    id: 'scattered-pieces',
    label: 'SCATTERED PIECES',
    description: 'I HAVE SOME ASSETS, BUT THEY DON\'T CONNECT YET.',
  },
  {
    id: 'mostly-cohesive',
    label: 'MOSTLY COHESIVE',
    description: 'I HAVE A DIRECTION, BUT IT NEEDS REFINEMENT AND CONSISTENCY.',
  },
  {
    id: 'missing-key-pieces',
    label: 'MISSING KEY PIECES',
    description: 'SOME ELEMENTS EXIST, BUT IMPORTANT PARTS ARE STILL MISSING.',
  },
];

const STARTING_AT_ZERO_QUESTIONS: IdntyAssessmentOption[] = [
  { id: 'goal', label: 'WHAT IS THE PRIMARY GOAL?', description: 'WHAT DOES SUCCESS LOOK LIKE?' },
  { id: 'audience', label: 'WHO IS YOUR AUDIENCE?', description: 'DESCRIBE YOUR IDEAL CUSTOMER OR USER.' },
  { id: 'timeline', label: 'WHAT IS YOUR TIMELINE?', description: 'WHEN ARE YOU LOOKING TO LAUNCH?' },
  { id: 'budget', label: 'WHAT IS YOUR BUDGET RANGE?', description: 'SELECT THE RANGE THAT BEST FITS YOUR PROJECT.' },
];

export const IDNTY_ASSESSMENT_STATES: Record<IdntyAssessmentStateId, IdntyAssessmentStateConfig> = {
  'starting-at-zero': {
    id: 'starting-at-zero',
    slug: 'starting-at-zero',
    stageMarker: '[ 00 / 04 ]',
    title: 'STARTING AT ZERO',
    declaration: 'I HAVE THE IDEA. I NEED THE IDENTITY.',
    editorialBody:
      "GOOD. WE'LL BUILD THE FOUNDATION WITH YOU FROM THE BEGINNING. WE'LL DEFINE WHAT YOUR BRAND IS, WHO IT'S FOR, HOW IT SHOULD FEEL, AND HOW IT SHOULD SHOW UP BEFORE WE DESIGN THE SYSTEM AROUND IT.",
    editorialCta: "LET'S BUILD YOUR FOUNDATION.",
    breadcrumb: 'IDENTITY / STARTING AT ZERO',
    iconId: 'starting-at-zero',
    landingTitle: 'TELL US ABOUT YOUR PROJECT',
    landingSubtitle: 'ANSWER A FEW QUESTIONS SO WE CAN TAILOR THE RIGHT STRATEGY AND ROADMAP FOR YOU.',
    landingType: 'question-list',
    landingOptions: STARTING_AT_ZERO_QUESTIONS,
    steps: [
      { id: 'goal', title: 'WHAT IS THE PRIMARY GOAL?', subtitle: 'WHAT DOES SUCCESS LOOK LIKE?', type: 'single', options: IDNTY_GOAL_OPTIONS, required: true, conditionalOtherKey: 'goal-other' },
      { id: 'audience', title: 'WHO IS YOUR AUDIENCE?', subtitle: 'DESCRIBE YOUR IDEAL CUSTOMER OR USER.', type: 'textarea', maxLength: 500, required: true, placeholder: 'DESCRIBE YOUR AUDIENCE, MARKET, AND GEOGRAPHIC SCOPE…' },
      { id: 'timeline', title: 'WHAT IS YOUR TIMELINE?', type: 'single', options: IDNTY_TIMELINE_OPTIONS, required: true },
      { id: 'budget', title: 'WHAT IS YOUR BUDGET RANGE?', subtitle: 'SELECT THE RANGE THAT BEST FITS YOUR PROJECT.', type: 'single', options: IDNTY_BUDGET_OPTIONS, required: true },
    ],
    processStrip: {
      id: 'process',
      leadTitle: 'YOUR IDENTITY. OUR PROCESS.',
      leadHref: SITE00_ROUTES.support,
      leadLinkLabel: 'HOW WE WORK →',
      steps: [
        { id: 'discover', label: 'DISCOVER', description: 'WE LEARN ABOUT YOUR BUSINESS, AUDIENCE, AND GOALS.' },
        { id: 'strategize', label: 'STRATEGIZE', description: 'WE CREATE A STRATEGIC FOUNDATION THAT GUIDES EVERY DECISION.' },
        { id: 'design', label: 'DESIGN', description: 'WE CRAFT A COHESIVE IDENTITY THAT BRINGS YOUR BRAND TO LIFE.' },
        { id: 'deliver', label: 'DELIVER', description: 'YOU GET EVERYTHING YOU NEED TO LAUNCH WITH CONFIDENCE.' },
      ],
    },
    primaryCta: 'NEXT STEP →',
    secondaryCta: 'SAVE & EXIT',
    completionTitle: 'YOUR FOUNDATION IS TAKING SHAPE.',
    completionSubtitle: 'YOUR DISCOVERY ASSESSMENT IS COMPLETE.',
    recommendedActions: [
      { id: 'bldr', label: 'CONTINUE TO BLDR →', href: SITE00_ROUTES.bldrState },
      { id: 'support', label: 'BOOK DISCOVERY CALL →', href: SITE00_ROUTES.support },
    ],
  },
  'some-pieces-exist': {
    id: 'some-pieces-exist',
    slug: 'some-pieces-exist',
    stageMarker: '[ 01 / 04 ]',
    title: 'SOME PIECES EXIST',
    declaration: "I HAVE PARTS OF MY BRAND, BUT IT ISN'T COMPLETE OR COHESIVE YET.",
    editorialBody:
      "GREAT — WE'LL HELP YOU BUILD ON WHAT YOU ALREADY HAVE AND CREATE A COMPLETE, COHESIVE IDENTITY. TELL US WHAT YOU ALREADY HAVE SO WE CAN GET A CLEAR PICTURE.",
    editorialCta: "LET'S COMPLETE YOUR IDENTITY.",
    breadcrumb: 'IDENTITY / SOME PIECES EXIST',
    iconId: 'some-pieces',
    landingTitle: 'WHAT DO YOU ALREADY HAVE?',
    landingSubtitle: "SELECT ALL THAT APPLY. WE'LL HELP YOU FILL IN THE GAPS.",
    landingType: 'option-grid',
    landingOptions: IDNTY_EXISTING_ASSET_OPTIONS,
    steps: [
      { id: 'assets', title: 'WHAT DO YOU ALREADY HAVE?', subtitle: 'SELECT ALL THAT APPLY.', type: 'multi', options: IDNTY_EXISTING_ASSET_OPTIONS, required: true, conditionalOtherKey: 'other-specify' },
      {
        id: 'cohesion-diagnostic',
        title: 'HOW WOULD YOU DESCRIBE WHAT YOU HAVE TODAY?',
        subtitle: 'THIS HELPS US UNDERSTAND YOUR STARTING POINT.',
        type: 'single',
        options: IDNTY_PIECES_DIAGNOSTIC_OPTIONS,
        required: true,
      },
      { id: 'gaps', title: 'WHAT FEELS INCOMPLETE?', subtitle: 'SELECT ALL THAT APPLY.', type: 'multi', options: IDNTY_COHESION_GAP_OPTIONS },
    ],
    processStrip: {
      id: 'process',
      leadTitle: 'YOUR IDENTITY. OUR PROCESS.',
      leadHref: SITE00_ROUTES.support,
      leadLinkLabel: 'HOW WE WORK →',
      steps: [
        { id: 'discover', label: 'DISCOVER', description: 'WE LEARN ABOUT YOUR BUSINESS, AUDIENCE, AND GOALS.' },
        { id: 'strategize', label: 'STRATEGIZE', description: 'WE CREATE A STRATEGIC FOUNDATION THAT GUIDES EVERY DECISION.' },
        { id: 'design', label: 'DESIGN', description: 'WE CRAFT A COHESIVE IDENTITY THAT BRINGS YOUR BRAND TO LIFE.' },
        { id: 'deliver', label: 'DELIVER', description: 'YOU GET EVERYTHING YOU NEED TO LAUNCH WITH CONFIDENCE.' },
      ],
    },
    primaryCta: 'NEXT STEP →',
    secondaryCta: 'BACK',
    completionTitle: 'YOUR STARTING POINT IS CLEAR.',
    completionSubtitle: 'WE KNOW WHAT EXISTS AND WHAT STILL NEEDS TO BE BUILT.',
    recommendedActions: [
      { id: 'bldr', label: 'CONTINUE TO BLDR →', href: SITE00_ROUTES.bldrState },
      { id: 'support', label: 'BOOK DISCOVERY CALL →', href: SITE00_ROUTES.support },
    ],
  },
  'ready-for-evolution': {
    id: 'ready-for-evolution',
    slug: 'ready-for-evolution',
    stageMarker: '[ 02 / 04 ]',
    title: 'READY FOR EVOLUTION',
    declaration: 'MY BRAND EXISTS. IT NEEDS REFINEMENT.',
    editorialBody:
      "WE'LL IDENTIFY WHAT SHOULD STAY, WHAT SHOULD EVOLVE, AND WHERE THE IDENTITY SYSTEM IS HOLDING THE BRAND BACK.",
    editorialCta: "LET'S DIAGNOSE WHAT'S NEXT.",
    breadcrumb: 'IDENTITY / READY FOR EVOLUTION',
    iconId: 'ready-evolution',
    landingTitle: 'WHAT NEEDS TO EVOLVE?',
    landingSubtitle: 'SELECT THE AREAS THAT REQUIRE REFINEMENT OR EVOLUTION.',
    landingType: 'pathway-grid',
    landingOptions: IDNTY_EVOLUTION_PATHWAYS,
    steps: [
      { id: 'pathways', title: 'WHAT NEEDS TO EVOLVE?', subtitle: 'SELECT THE AREAS THAT REQUIRE REFINEMENT OR EVOLUTION.', type: 'multi', options: IDNTY_EVOLUTION_PATHWAYS, required: true },
      { id: 'goals', title: 'WHAT ARE YOUR EVOLUTION GOALS?', subtitle: 'DESCRIBE WHAT YOU WANT TO ACHIEVE WITH THIS EVOLUTION.', type: 'textarea', maxLength: 500, required: true, placeholder: 'DESCRIBE WHAT YOU WANT TO ACHIEVE WITH THIS EVOLUTION…' },
      { id: 'timeline', title: 'WHAT IS YOUR TIMELINE?', subtitle: 'SELECT THE OPTION THAT BEST FITS YOUR PLANS.', type: 'single', options: IDNTY_TIMELINE_OPTIONS, required: true },
    ],
    processStrip: {
      id: 'process',
      leadTitle: 'YOUR IDENTITY. OUR PROCESS.',
      leadHref: SITE00_ROUTES.support,
      leadLinkLabel: 'HOW WE WORK →',
      steps: [
        { id: 'discover', label: 'DISCOVER', description: 'WE LEARN ABOUT YOUR BUSINESS, AUDIENCE, AND GOALS.' },
        { id: 'strategize', label: 'STRATEGIZE', description: 'WE CREATE A STRATEGIC FOUNDATION THAT GUIDES EVERY DECISION.' },
        { id: 'design', label: 'DESIGN', description: 'WE CRAFT A COHESIVE IDENTITY THAT BRINGS YOUR BRAND TO LIFE.' },
        { id: 'deliver', label: 'DELIVER', description: 'YOU GET EVERYTHING YOU NEED TO LAUNCH WITH CONFIDENCE.' },
      ],
    },
    primaryCta: 'START MY EVOLUTION →',
    secondaryCta: 'BACK',
    completionTitle: 'READY TO START YOUR EVOLUTION.',
    completionSubtitle: 'YOUR EVOLUTION ASSESSMENT IS COMPLETE.',
    recommendedActions: [
      { id: 'support', label: 'BOOK DISCOVERY CALL →', href: SITE00_ROUTES.support },
      { id: 'bldr', label: 'CONTINUE TO BLDR →', href: SITE00_ROUTES.bldrState },
    ],
  },
  'build-ready': {
    id: 'build-ready',
    slug: 'build-ready',
    stageMarker: '[ 03 / 04 ]',
    title: 'BUILD READY',
    declaration: "MY IDENTITY IS COMPLETE. IT'S TIME TO BUILD.",
    editorialBody:
      "BUILD READY MEANS YOUR IDENTITY ALREADY EXISTS AS A COMPLETE SYSTEM. BEFORE BLDR CAN BEGIN, SITE 00 VERIFIES THE EVIDENCE BEHIND EACH IDENTITY DOMAIN SO NOTHING HAS TO BE INVENTED.",
    editorialCta: "LET'S VERIFY YOUR IDENTITY AUTHORITY.",
    breadcrumb: 'IDENTITY / BUILD READY',
    iconId: 'build-ready',
    landingTitle: 'IS YOUR IDENTITY READY TO BUILD FROM?',
    landingSubtitle: 'SITE 00 MUST CONFIRM ENOUGH BRAND AUTHORITY TO BUILD WITHOUT INVENTING YOUR IDENTITY.',
    landingType: 'verification',
    /**
     * Identity-authority verification flow (public redesign). Replaces the legacy
     * services / scope / timeline branch, which was BLDR intake — not identity verification.
     * Step bodies are rendered by the verification components, not the generic step form.
     */
    steps: [
      { id: 'verification', title: 'IS YOUR IDENTITY READY TO BUILD FROM?', subtitle: 'SITE 00 MUST CONFIRM ENOUGH BRAND AUTHORITY TO BUILD WITHOUT INVENTING YOUR IDENTITY.', type: 'custom' },
      { id: 'evidence', title: 'PROVIDE YOUR IDENTITY EVIDENCE', subtitle: 'ADD OR CONFIRM THE SOURCE MATERIAL SITE 00 SHOULD USE TO VERIFY EACH IDENTITY DOMAIN.', type: 'custom' },
      { id: 'authority-check', title: 'WHAT STILL NEEDS AUTHORITY?', subtitle: 'REVIEW WHERE EVIDENCE IS MISSING OR STILL NEEDS CONFIRMATION BEFORE BLDR CAN UNLOCK.', type: 'custom' },
    ],
    processStrip: {
      id: 'process',
      leadTitle: 'YOUR IDENTITY. OUR PROCESS.',
      leadHref: SITE00_ROUTES.support,
      leadLinkLabel: 'HOW WE WORK →',
      steps: [
        { id: 'discover', label: 'DISCOVER', description: 'WE LEARN ABOUT YOUR BUSINESS, AUDIENCE, AND GOALS.' },
        { id: 'strategize', label: 'STRATEGIZE', description: 'WE CREATE A STRATEGIC FOUNDATION THAT GUIDES EVERY DECISION.' },
        { id: 'design', label: 'DESIGN', description: 'WE CRAFT A COHESIVE IDENTITY THAT BRINGS YOUR BRAND TO LIFE.' },
        { id: 'deliver', label: 'DELIVER', description: 'YOU GET EVERYTHING YOU NEED TO LAUNCH WITH CONFIDENCE.' },
      ],
    },
    primaryCta: 'BEGIN VERIFICATION →',
    secondaryCta: 'BACK',
    completionTitle: 'REVIEW VERIFICATION',
    completionSubtitle: 'REVIEW YOUR IDENTITY AUTHORITY BEFORE SUBMITTING FOR VERIFICATION.',
    /** No BLDR route here: BLDR is never unlocked from a client-side status. */
    recommendedActions: [{ id: 'support', label: 'BOOK DISCOVERY CALL →', href: SITE00_ROUTES.support }],
  },
};

export const IDNTY_ASSESSMENT_STATE_LIST = Object.values(IDNTY_ASSESSMENT_STATES);

export function idntyAssessmentPath(stateSlug: string, step?: string): string {
  const base = `${SITE00_ROUTES.idnty}/${stateSlug}`;
  if (!step) return base;
  return `${base}/${step}`;
}

export function idntyAssessmentReviewPath(stateSlug: string): string {
  return `${SITE00_ROUTES.idnty}/${stateSlug}/review`;
}

export function idntyAssessmentCompletePath(stateSlug: string): string {
  return `${SITE00_ROUTES.idnty}/${stateSlug}/complete`;
}

export function idntyDiscoveryResultPath(stateSlug: string): string {
  return `${SITE00_ROUTES.idnty}/${stateSlug}/discovery-result`;
}

export function getIdntyAssessmentState(slug: string): IdntyAssessmentStateConfig | undefined {
  return IDNTY_ASSESSMENT_STATE_LIST.find((s) => s.slug === slug);
}

export function idntyAssessmentStepIndex(state: IdntyAssessmentStateConfig, stepId: string): number {
  return state.steps.findIndex((s) => s.id === stepId);
}

export function idntyAssessmentNextStep(state: IdntyAssessmentStateConfig, currentStepId: string): IdntyAssessmentStep | null {
  const idx = idntyAssessmentStepIndex(state, currentStepId);
  if (idx < 0 || idx >= state.steps.length - 1) return null;
  return state.steps[idx + 1] ?? null;
}

export function idntyAssessmentPrevStep(state: IdntyAssessmentStateConfig, currentStepId: string): IdntyAssessmentStep | null {
  const idx = idntyAssessmentStepIndex(state, currentStepId);
  if (idx <= 0) return null;
  return state.steps[idx - 1] ?? null;
}

/** Legacy top-level state — migrated into some-pieces-exist diagnostic flow. */
export const IDNTY_LEGACY_NEEDS_COHESION_SLUG = 'needs-cohesion' as const;

export function migrateLegacyNeedsCohesionSlug(slug: string): IdntyAssessmentStateId | null {
  if (slug === IDNTY_LEGACY_NEEDS_COHESION_SLUG) return 'some-pieces-exist';
  return null;
}

export function migrateLegacyNeedsCohesionStep(stepId: string | null): string | null {
  if (!stepId || stepId === 'complete' || stepId === 'review') return stepId;
  if (stepId === 'priority' || stepId === 'description') return 'cohesion-diagnostic';
  return stepId;
}
