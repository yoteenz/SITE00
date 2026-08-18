/**
 * IDNTY assessment engine — branch configs, steps, options, process strips.
 * Structured data isolated from UI components.
 */

import { SITE00_ROUTES } from './routes';
import type { IdntyBrandStateIconId } from './idnty-brand-state-icons';

export type IdntyAssessmentStateId =
  | 'starting-at-zero'
  | 'some-pieces-exist'
  | 'needs-cohesion'
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
  landingType: 'question-list' | 'option-grid' | 'pathway-grid' | 'service-grid';
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

export const IDNTY_PROJECT_TYPE_OPTIONS: IdntyAssessmentOption[] = [
  { id: 'site', label: 'SITE', description: 'WEBSITES, PORTFOLIOS, LANDING PAGES' },
  { id: 'ecommerce', label: 'ECOMMERCE', description: 'ONLINE STORES AND PRODUCT SALES' },
  { id: 'portfolio', label: 'PORTFOLIO', description: 'SHOWCASE WORK AND CREATIVE OUTPUT' },
  { id: 'booking', label: 'BOOKING / APPOINTMENTS', description: 'SCHEDULING AND CLIENT BOOKINGS' },
  { id: 'membership', label: 'MEMBERSHIP', description: 'MEMBER PORTALS AND SUBSCRIPTIONS' },
  { id: 'web-app', label: 'WEB APPLICATION', description: 'CUSTOM DIGITAL PRODUCTS AND TOOLS' },
  { id: 'other', label: 'OTHER', description: 'SOMETHING ELSE — DESCRIBE IN NEXT STEPS' },
];

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

export const IDNTY_EVOLUTION_PATHWAYS: IdntyAssessmentOption[] = [
  { id: 'brand-strategy', label: 'BRAND STRATEGY', description: 'POSITIONING, AUDIENCE, DIFFERENTIATION' },
  { id: 'visual-identity', label: 'VISUAL IDENTITY', description: 'LOGO, COLOR, TYPOGRAPHY, SYSTEM' },
  { id: 'digital-experience', label: 'DIGITAL EXPERIENCE', description: 'WEBSITE, UX, CONVERSION, PRODUCT' },
  { id: 'brand-messaging', label: 'BRAND MESSAGING', description: 'VOICE, COPY, POSITIONING LANGUAGE' },
  { id: 'growth-systems', label: 'GROWTH SYSTEMS', description: 'ACQUISITION, ANALYTICS, CAMPAIGNS' },
  { id: 'launch-evolve', label: 'LAUNCH & EVOLVE', description: 'RELAUNCH, ROLLOUT, OPTIMIZATION' },
];

export const IDNTY_BUILD_READY_SERVICES: IdntyAssessmentOption[] = [
  { id: 'strategy', label: 'STRATEGY & PLANNING', description: 'ROADMAP, PRIORITIES, LAUNCH GOALS' },
  { id: 'brand-design', label: 'BRAND & DESIGN', description: 'VISUAL SYSTEM, CREATIVE DIRECTION' },
  { id: 'website', label: 'WEBSITE & DIGITAL', description: 'SITES, ECOMMERCE, DIGITAL PRODUCTS' },
  { id: 'content', label: 'CONTENT & MESSAGING', description: 'COPY, CONTENT INVENTORY, VOICE' },
  { id: 'marketing', label: 'MARKETING & GROWTH', description: 'CHANNELS, LAUNCH, ACQUISITION' },
  { id: 'launch', label: 'LAUNCH & SUPPORT', description: 'DEPLOYMENT, QA, ONGOING SUPPORT' },
];

export const IDNTY_COHESION_GAP_OPTIONS: IdntyAssessmentOption[] = [
  { id: 'inconsistent-visual', label: 'INCONSISTENT VISUAL SYSTEM' },
  { id: 'unclear-messaging', label: 'UNCLEAR MESSAGING' },
  { id: 'disconnected-touchpoints', label: 'DISCONNECTED TOUCHPOINTS' },
  { id: 'outdated-assets', label: 'OUTDATED ASSETS' },
  { id: 'no-guidelines', label: 'NO BRAND GUIDELINES' },
  { id: 'team-misalignment', label: 'TEAM MISALIGNMENT' },
];

const STARTING_AT_ZERO_QUESTIONS: IdntyAssessmentOption[] = [
  { id: 'project', label: 'WHAT ARE YOU BUILDING?', description: 'SELECT THE OPTION THAT BEST DESCRIBES YOUR PROJECT.' },
  { id: 'goal', label: 'WHAT IS THE PRIMARY GOAL?', description: 'HELP US UNDERSTAND THE MAIN OBJECTIVE.' },
  { id: 'audience', label: 'WHO IS YOUR AUDIENCE?', description: "TELL US WHO YOU'RE BUILDING FOR." },
  { id: 'timeline', label: 'WHAT IS YOUR TIMELINE?', description: 'WHEN ARE YOU LOOKING TO LAUNCH?' },
  { id: 'budget', label: 'WHAT IS YOUR BUDGET RANGE?', description: 'THIS HELPS US ALIGN THE RIGHT RESOURCES.' },
];

export const IDNTY_ASSESSMENT_STATES: Record<IdntyAssessmentStateId, IdntyAssessmentStateConfig> = {
  'starting-at-zero': {
    id: 'starting-at-zero',
    slug: 'starting-at-zero',
    stageMarker: '[ 00 / 05 ]',
    title: 'STARTING AT ZERO',
    declaration: 'EVERY GREAT PROJECT BEGINS WITH CLARITY.',
    editorialBody:
      'WE START BY UNDERSTANDING YOU, YOUR VISION, AND WHAT SUCCESS LOOKS LIKE.',
    editorialCta: "LET'S BUILD THE FOUNDATION TOGETHER.",
    breadcrumb: 'IDENTITY / STARTING AT ZERO',
    iconId: 'starting-at-zero',
    landingTitle: 'TELL US ABOUT YOUR PROJECT',
    landingSubtitle: 'ANSWER A FEW QUESTIONS SO WE CAN TAILOR THE RIGHT STRATEGY AND ROADMAP FOR YOU.',
    landingType: 'question-list',
    landingOptions: STARTING_AT_ZERO_QUESTIONS,
    steps: [
      { id: 'project', title: 'WHAT ARE YOU BUILDING?', subtitle: 'SELECT ALL THAT APPLY.', type: 'multi', options: IDNTY_PROJECT_TYPE_OPTIONS, required: true },
      { id: 'goal', title: 'WHAT IS THE PRIMARY GOAL?', subtitle: 'WHAT DOES SUCCESS LOOK LIKE?', type: 'multi', options: IDNTY_GOAL_OPTIONS, required: true },
      { id: 'audience', title: 'WHO IS YOUR AUDIENCE?', subtitle: 'DESCRIBE YOUR IDEAL CUSTOMER OR USER.', type: 'textarea', maxLength: 500, required: true, placeholder: 'DESCRIBE YOUR AUDIENCE, MARKET, AND GEOGRAPHIC SCOPE…' },
      { id: 'timeline', title: 'WHAT IS YOUR TIMELINE?', type: 'single', options: IDNTY_TIMELINE_OPTIONS, required: true },
      { id: 'budget', title: 'WHAT IS YOUR BUDGET RANGE?', type: 'single', options: IDNTY_BUDGET_OPTIONS, required: true },
    ],
    processStrip: {
      id: 'vision',
      leadTitle: 'YOUR VISION. OUR EXPERTISE.',
      leadBody: 'FROM STRATEGY TO LAUNCH, WE PARTNER WITH YOU AT EVERY STEP TO BRING YOUR IDEAS TO LIFE.',
      leadHref: SITE00_ROUTES.support,
      leadLinkLabel: 'HOW WE WORK →',
      steps: [
        { id: 'strategy', label: 'STRATEGY FIRST', description: 'WE START WITH CLARITY AND A SOLID PLAN.' },
        { id: 'scale', label: 'BUILT TO SCALE', description: 'SOLUTIONS DESIGNED TO GROW WITH YOU.' },
        { id: 'transparent', label: 'TRANSPARENT PROCESS', description: 'CLEAR COMMUNICATION EVERY STEP OF THE WAY.' },
        { id: 'impact', label: 'FOCUSED ON IMPACT', description: 'WE BUILD WITH PURPOSE AND MEASURABLE RESULTS.' },
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
    stageMarker: '[ 01 / 05 ]',
    title: 'SOME PIECES EXIST',
    declaration: "I HAVE PARTS OF MY BRAND, BUT IT ISN'T COMPLETE.",
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
      { id: 'assets', title: 'WHAT DO YOU ALREADY HAVE?', type: 'multi', options: IDNTY_EXISTING_ASSET_OPTIONS, required: true },
      { id: 'other-specify', title: 'OTHER (PLEASE SPECIFY)', type: 'textarea', maxLength: 300, placeholder: 'DESCRIBE WHAT YOU HAVE…' },
      { id: 'description', title: 'HOW WOULD YOU DESCRIBE WHAT YOU HAVE TODAY?', subtitle: 'THIS HELPS US UNDERSTAND YOUR STARTING POINT.', type: 'textarea', maxLength: 500, required: true, placeholder: 'SHARE DETAILS ABOUT YOUR EXISTING BRAND ASSETS…' },
      { id: 'gaps', title: 'WHAT FEELS INCOMPLETE?', type: 'multi', options: IDNTY_COHESION_GAP_OPTIONS },
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
  'needs-cohesion': {
    id: 'needs-cohesion',
    slug: 'needs-cohesion',
    stageMarker: '[ 02 / 05 ]',
    title: 'NEEDS COHESION',
    declaration: 'MY BRAND ELEMENTS EXIST. THEY DON\'T WORK TOGETHER YET.',
    editorialBody:
      'YOU HAVE PIECES IN PLACE — NOW WE ALIGN THEM INTO ONE COHESIVE SYSTEM THAT COMMUNICATES CLEARLY ACROSS EVERY TOUCHPOINT.',
    editorialCta: "LET'S BRING IT ALL TOGETHER.",
    breadcrumb: 'IDENTITY / NEEDS COHESION',
    landingTitle: 'WHERE DOES YOUR BRAND FEEL DISCONNECTED?',
    landingSubtitle: 'SELECT THE AREAS THAT NEED ALIGNMENT.',
    landingType: 'option-grid',
    landingOptions: IDNTY_COHESION_GAP_OPTIONS,
    steps: [
      { id: 'gaps', title: 'WHERE DOES YOUR BRAND FEEL DISCONNECTED?', type: 'multi', options: IDNTY_COHESION_GAP_OPTIONS, required: true },
      { id: 'assets', title: 'WHAT ASSETS DO YOU CURRENTLY HAVE?', type: 'multi', options: IDNTY_EXISTING_ASSET_OPTIONS },
      { id: 'priority', title: 'WHAT SHOULD WE ALIGN FIRST?', type: 'textarea', maxLength: 500, required: true, placeholder: 'DESCRIBE YOUR TOP PRIORITY FOR BRAND COHESION…' },
      { id: 'description', title: 'HOW WOULD YOU DESCRIBE THE CURRENT STATE?', type: 'textarea', maxLength: 500, placeholder: 'SHARE CONTEXT ABOUT INCONSISTENCIES OR GAPS…' },
    ],
    processStrip: {
      id: 'process',
      leadTitle: 'YOUR IDENTITY. OUR PROCESS.',
      leadHref: SITE00_ROUTES.support,
      leadLinkLabel: 'HOW WE WORK →',
      steps: [
        { id: 'discover', label: 'DISCOVER', description: 'WE AUDIT WHAT EXISTS AND WHERE IT BREAKS DOWN.' },
        { id: 'strategize', label: 'STRATEGIZE', description: 'WE DEFINE THE SYSTEM THAT CONNECTS EVERYTHING.' },
        { id: 'design', label: 'DESIGN', description: 'WE REFINE AND UNIFY YOUR BRAND TOUCHPOINTS.' },
        { id: 'deliver', label: 'DELIVER', description: 'YOU LEAVE WITH A COHESIVE, USABLE IDENTITY.' },
      ],
    },
    primaryCta: 'NEXT STEP →',
    secondaryCta: 'BACK',
    completionTitle: 'YOUR COHESION PATH IS DEFINED.',
    completionSubtitle: 'WE KNOW WHAT TO ALIGN AND WHAT TO BUILD NEXT.',
    recommendedActions: [
      { id: 'bldr', label: 'CONTINUE TO BLDR →', href: SITE00_ROUTES.bldrState },
      { id: 'support', label: 'BOOK DISCOVERY CALL →', href: SITE00_ROUTES.support },
    ],
  },
  'ready-for-evolution': {
    id: 'ready-for-evolution',
    slug: 'ready-for-evolution',
    stageMarker: '[ 03 / 05 ]',
    title: 'READY FOR EVOLUTION',
    declaration: 'MY BRAND EXISTS. IT NEEDS REFINEMENT.',
    editorialBody:
      "YOU'RE READY TO EVOLVE WHAT YOU'VE BUILT AND TURN IT INTO A STRONGER, MORE ALIGNED, FUTURE-READY BRAND.",
    editorialCta: "LET'S EVOLVE YOUR BRAND TOGETHER.",
    breadcrumb: 'IDENTITY / READY FOR EVOLUTION',
    iconId: 'ready-evolution',
    landingTitle: 'HOW WE CAN HELP YOU EVOLVE',
    landingSubtitle: 'WE REFINE YOUR BRAND, ELEVATE YOUR PRESENCE, AND BUILD SYSTEMS THAT POSITION YOU FOR WHAT\'S NEXT.',
    landingType: 'pathway-grid',
    landingOptions: IDNTY_EVOLUTION_PATHWAYS,
    steps: [
      { id: 'pathways', title: 'HOW WE CAN HELP YOU EVOLVE', type: 'multi', options: IDNTY_EVOLUTION_PATHWAYS, required: true },
      { id: 'goals', title: 'WHAT ARE YOUR EVOLUTION GOALS?', type: 'textarea', maxLength: 500, required: true, placeholder: 'DESCRIBE WHAT YOU WANT TO ACHIEVE WITH THIS EVOLUTION…' },
      { id: 'timeline', title: 'WHAT IS YOUR TIMELINE?', type: 'single', options: IDNTY_TIMELINE_OPTIONS, required: true },
    ],
    processStrip: {
      id: 'next',
      leadTitle: 'WHAT HAPPENS NEXT',
      steps: [
        { id: 'discovery', label: 'DISCOVERY CALL', description: 'WE LEARN ABOUT YOUR BRAND, GOALS, AND CHALLENGES.' },
        { id: 'strategy', label: 'STRATEGY & PLAN', description: 'WE CREATE A TAILORED ROADMAP FOR YOUR EVOLUTION.' },
        { id: 'design', label: 'DESIGN & BUILD', description: 'WE REFINE, BUILD, AND BRING YOUR BRAND TO LIFE.' },
        { id: 'launch', label: 'LAUNCH & GROW', description: 'WE LAUNCH WITH PURPOSE AND SUPPORT YOUR CONTINUED GROWTH.' },
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
    stageMarker: '[ 04 / 05 ]',
    title: 'BUILD READY',
    declaration: "MY IDENTITY IS COMPLETE. IT'S TIME TO BUILD.",
    editorialBody:
      'YOUR FOUNDATION IS SET. NOW WE BRING IT TO LIFE WITH STRATEGY, DESIGN, AND PRECISION.',
    editorialCta: "LET'S BUILD SOMETHING EXTRAORDINARY.",
    breadcrumb: 'IDENTITY / BUILD READY',
    iconId: 'build-ready',
    landingTitle: 'YOUR BRAND. YOUR BLUEPRINT. OUR EXECUTION.',
    landingSubtitle: 'SELECT THE CAPABILITIES YOU NEED TO BUILD YOUR VISION.',
    landingType: 'service-grid',
    landingOptions: IDNTY_BUILD_READY_SERVICES,
    steps: [
      { id: 'services', title: 'HOW CAN SITE 00 BUILD YOUR VISION?', type: 'multi', options: IDNTY_BUILD_READY_SERVICES, required: true },
      { id: 'scope', title: 'DESCRIBE WHAT NEEDS TO BE BUILT', type: 'textarea', maxLength: 500, required: true, placeholder: 'PAGES, FEATURES, INTEGRATIONS, LAUNCH TARGETS…' },
      { id: 'timeline', title: 'WHAT IS YOUR TIMELINE?', type: 'single', options: IDNTY_TIMELINE_OPTIONS, required: true },
    ],
    processStrip: {
      id: 'journey',
      leadTitle: 'THE BUILD JOURNEY',
      steps: [
        { id: 'discover', label: 'DISCOVER', description: 'ALIGN ON GOALS, SCOPE, AND SUCCESS METRICS.' },
        { id: 'strategize', label: 'STRATEGIZE', description: 'DEFINE ARCHITECTURE, CONTENT, AND ROADMAP.' },
        { id: 'design', label: 'DESIGN', description: 'CRAFT THE EXPERIENCE AND VISUAL SYSTEM.' },
        { id: 'build', label: 'BUILD', description: 'DEVELOP, INTEGRATE, AND PREPARE FOR LAUNCH.' },
        { id: 'launch', label: 'LAUNCH', description: 'DEPLOY, QA, AND HAND OFF WITH CONFIDENCE.' },
      ],
    },
    primaryCta: 'BOOK DISCOVERY CALL →',
    secondaryCta: 'BACK',
    completionTitle: 'READY TO START BUILDING.',
    completionSubtitle: 'YOUR BUILD-READY ASSESSMENT IS COMPLETE.',
    recommendedActions: [
      { id: 'support', label: 'BOOK DISCOVERY CALL →', href: SITE00_ROUTES.support },
      { id: 'bldr', label: 'CONTINUE TO BLDR →', href: SITE00_ROUTES.bldrState },
    ],
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
