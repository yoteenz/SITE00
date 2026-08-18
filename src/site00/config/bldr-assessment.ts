/**
 * BLDR assessment engine — branch configs, steps, options, process strips.
 */

import { SITE00_ROUTES } from './routes';
import type { BldrBuildClassIconId } from './bldr-build-class-icons';
import { IDNTY_TIMELINE_OPTIONS, IDNTY_BUDGET_OPTIONS } from './idnty-assessment';

export type BldrAssessmentStateId = 'site' | 'world' | 'enterprise' | 'not-sure';

export type BldrAssessmentOption = {
  id: string;
  label: string;
  description?: string;
};

export type BldrAssessmentStep = {
  id: string;
  title: string;
  subtitle?: string;
  type: 'single' | 'multi' | 'textarea' | 'audience-row';
  options?: BldrAssessmentOption[];
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
  gridColumns?: 2 | 3 | 4;
};

export type BldrProcessStep = {
  id: string;
  label: string;
  description: string;
};

export type BldrProcessStrip = {
  id: string;
  leadTitle?: string;
  leadBody?: string;
  leadHref?: string;
  leadLinkLabel?: string;
  steps: BldrProcessStep[];
};

export type BldrAssessmentStateConfig = {
  id: BldrAssessmentStateId;
  slug: string;
  stageMarker: string;
  title: string;
  declaration: string;
  editorialBody: string;
  editorialCta?: string;
  breadcrumb: string;
  iconId: BldrBuildClassIconId;
  contextLabel: string;
  landingTitle: string;
  landingSubtitle?: string;
  /** Fields rendered together on the branch landing screen */
  landingFields: BldrAssessmentStep[];
  steps: BldrAssessmentStep[];
  processStrip: BldrProcessStrip;
  primaryCta: string;
  secondaryCta?: string;
  completionTitle: string;
  completionSubtitle: string;
  recommendedActions: { id: string; label: string; href: string }[];
};

export const BLDR_ASSESSMENT_STORAGE_KEY = 'site00_bldr_assessment_v1';

export const BLDR_SITE_TYPE_OPTIONS: BldrAssessmentOption[] = [
  { id: 'business', label: 'BUSINESS WEBSITE', description: 'SERVICES, COMPANY INFO, LEAD GENERATION' },
  { id: 'ecommerce', label: 'E-COMMERCE STORE', description: 'PRODUCTS, CHECKOUT, INVENTORY' },
  { id: 'portfolio', label: 'PORTFOLIO SITE', description: 'PROJECTS, CASE STUDIES, CREATIVE WORK' },
  { id: 'booking', label: 'BOOKING / APPOINTMENTS', description: 'SCHEDULING, CALENDAR, INTAKE' },
  { id: 'membership', label: 'MEMBERSHIP / COMMUNITY', description: 'GATED CONTENT, ACCOUNTS, SUBSCRIPTIONS' },
  { id: 'web-app', label: 'WEB APPLICATION', description: 'CUSTOM LOGIC, DASHBOARDS, TOOLS' },
  { id: 'other', label: 'OTHER (PLEASE SPECIFY)', description: 'DESCRIBE BELOW IF NEEDED' },
];

export const BLDR_WORLD_TYPE_OPTIONS: BldrAssessmentOption[] = [
  { id: 'custom-platform', label: 'CUSTOM PLATFORM', description: 'TAILORED DIGITAL PRODUCT OR SERVICE' },
  { id: 'web-app', label: 'WEB APPLICATION', description: 'ACCOUNTS, WORKFLOWS, DATA' },
  { id: 'immersive', label: 'IMMERSIVE EXPERIENCE', description: 'INTERACTIVE, EXPLORATORY, RICH MEDIA' },
  { id: 'configurator', label: 'CONFIGURATOR / BUILDER', description: 'CUSTOMIZE, COMPOSE, GENERATE' },
  { id: 'service-system', label: 'DIGITAL SERVICE SYSTEM', description: 'END-TO-END SERVICE DELIVERY' },
  { id: 'community', label: 'ONLINE COMMUNITY', description: 'MEMBERS, CONTENT, COLLABORATION' },
  { id: 'api-hub', label: 'API / INTEGRATION HUB', description: 'CONNECT SYSTEMS AND DATA' },
  { id: 'other', label: 'OTHER (PLEASE SPECIFY)' },
];

export const BLDR_ENTERPRISE_NEED_OPTIONS: BldrAssessmentOption[] = [
  { id: 'custom-platform', label: 'CUSTOM PLATFORM', description: 'TAILORED ENTERPRISE SOFTWARE' },
  { id: 'multi-user', label: 'MULTI-USER SYSTEM', description: 'ROLES, PERMISSIONS, COLLABORATION' },
  { id: 'integration-hub', label: 'INTEGRATION HUB', description: 'CONNECT INTERNAL AND EXTERNAL SYSTEMS' },
  { id: 'security', label: 'ENTERPRISE SECURITY', description: 'SSO, COMPLIANCE, ACCESS CONTROL' },
  { id: 'data-analytics', label: 'DATA & ANALYTICS', description: 'REPORTING, DASHBOARDS, INSIGHTS' },
  { id: 'automation', label: 'WORKFLOW AUTOMATION', description: 'PROCESS, APPROVALS, HANDOFFS' },
  { id: 'global-scale', label: 'GLOBAL SCALE', description: 'MULTI-REGION, HIGH AVAILABILITY' },
  { id: 'other', label: 'OTHER (PLEASE SPECIFY)' },
];

export const BLDR_AUDIENCE_B2_OPTIONS: BldrAssessmentOption[] = [
  { id: 'b2c', label: 'B2C', description: 'SELLING TO INDIVIDUALS' },
  { id: 'b2b', label: 'B2B', description: 'SELLING TO BUSINESSES' },
  { id: 'both', label: 'BOTH', description: 'BUSINESSES AND INDIVIDUALS' },
  { id: 'internal', label: 'INTERNAL', description: 'PRIVATE / INTERNAL USE ONLY' },
];

export const BLDR_ENTERPRISE_AUDIENCE_OPTIONS: BldrAssessmentOption[] = [
  { id: 'enterprise', label: 'ENTERPRISE', description: '10+ EMPLOYEES OR MULTI-DEPARTMENT' },
  { id: 'team', label: 'TEAM / DIVISION', description: '2–50 PEOPLE WITHIN ONE DEPARTMENT' },
  { id: 'internal', label: 'INTERNAL USE', description: 'INTERNAL TOOLS AND OPERATIONS ONLY' },
  { id: 'external', label: 'EXTERNAL CLIENTS', description: 'CLIENT-FACING OR CUSTOMER PORTALS' },
];

export const BLDR_SITE_FEATURE_OPTIONS: BldrAssessmentOption[] = [
  { id: 'forms', label: 'FORMS' },
  { id: 'search', label: 'SEARCH' },
  { id: 'blog', label: 'BLOG / CONTENT' },
  { id: 'ecommerce', label: 'E-COMMERCE' },
  { id: 'booking', label: 'BOOKING' },
  { id: 'membership', label: 'MEMBERSHIP' },
  { id: 'accounts', label: 'USER ACCOUNTS' },
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'upload', label: 'FILE UPLOAD' },
  { id: 'payments', label: 'PAYMENTS' },
  { id: 'email', label: 'EMAIL' },
  { id: 'analytics', label: 'ANALYTICS' },
  { id: 'seo', label: 'SEO' },
  { id: 'cms', label: 'CMS' },
  { id: 'multilingual', label: 'MULTILINGUAL' },
  { id: 'integrations', label: 'INTEGRATIONS' },
];

export const BLDR_WORLD_EXPERIENCE_OPTIONS: BldrAssessmentOption[] = [
  { id: 'create', label: 'CREATE' },
  { id: 'configure', label: 'CONFIGURE' },
  { id: 'purchase', label: 'PURCHASE' },
  { id: 'collaborate', label: 'COLLABORATE' },
  { id: 'explore', label: 'EXPLORE' },
  { id: 'manage', label: 'MANAGE' },
  { id: 'learn', label: 'LEARN' },
  { id: 'communicate', label: 'COMMUNICATE' },
  { id: 'analyze', label: 'ANALYZE' },
  { id: 'customize', label: 'CUSTOMIZE' },
  { id: 'automate', label: 'AUTOMATE' },
];

export const BLDR_USER_ROLE_OPTIONS: BldrAssessmentOption[] = [
  { id: 'customers', label: 'CUSTOMERS' },
  { id: 'members', label: 'MEMBERS' },
  { id: 'admins', label: 'ADMINS' },
  { id: 'editors', label: 'EDITORS' },
  { id: 'creators', label: 'CREATORS' },
  { id: 'vendors', label: 'VENDORS' },
  { id: 'partners', label: 'PARTNERS' },
  { id: 'staff', label: 'STAFF' },
  { id: 'guests', label: 'GUESTS' },
];

export const BLDR_INTEGRATION_OPTIONS: BldrAssessmentOption[] = [
  { id: 'payments', label: 'PAYMENTS' },
  { id: 'crm', label: 'CRM' },
  { id: 'email', label: 'EMAIL' },
  { id: 'analytics', label: 'ANALYTICS' },
  { id: 'database', label: 'DATABASE' },
  { id: 'cms', label: 'CMS' },
  { id: 'auth', label: 'AUTHENTICATION' },
  { id: 'ai', label: 'AI SERVICES' },
  { id: 'apis', label: 'THIRD-PARTY APIs' },
  { id: 'internal', label: 'INTERNAL SYSTEMS' },
];

export const BLDR_SECURITY_OPTIONS: BldrAssessmentOption[] = [
  { id: 'sso', label: 'SSO' },
  { id: 'rbac', label: 'ROLE-BASED ACCESS' },
  { id: 'audit', label: 'AUDIT LOGS' },
  { id: 'encryption', label: 'DATA ENCRYPTION' },
  { id: 'mfa', label: 'MFA' },
  { id: 'compliance', label: 'COMPLIANCE REQUIREMENTS' },
  { id: 'residency', label: 'DATA RESIDENCY' },
];

export const BLDR_NOT_SURE_Q1_OPTIONS: BldrAssessmentOption[] = [
  { id: 'scratch', label: "I'M STARTING FROM SCRATCH", description: 'I HAVE AN IDEA BUT NEED HELP BUILDING EVERYTHING.' },
  { id: 'pieces', label: 'I HAVE SOME PIECES', description: 'PARTS EXIST BUT NOTHING IS COMPLETE.' },
  { id: 'scale', label: 'I NEED TO SCALE', description: 'SOMETHING EXISTS AND NEEDS TO GROW.' },
  { id: 'exploring', label: "I'M EXPLORING OPTIONS", description: 'RESEARCHING WHAT IS POSSIBLE.' },
  { id: 'other', label: 'SOMETHING ELSE', description: 'MY SITUATION IS DIFFERENT.' },
];

export const BLDR_NOT_SURE_Q2_OPTIONS: BldrAssessmentOption[] = [
  { id: 'website', label: 'WEBSITE / STOREFRONT / PORTFOLIO' },
  { id: 'application', label: 'APPLICATION / PLATFORM' },
  { id: 'immersive', label: 'IMMERSIVE / CUSTOM EXPERIENCE' },
  { id: 'internal', label: 'INTERNAL BUSINESS SYSTEM' },
  { id: 'complex', label: 'LARGE-SCALE / COMPLEX SYSTEM' },
  { id: 'unsure', label: 'NOT SURE YET' },
];

export const BLDR_NOT_SURE_Q3_OPTIONS: BldrAssessmentOption[] = [
  { id: 'browse', label: 'MOSTLY BROWSE / READ' },
  { id: 'purchase', label: 'PURCHASE / BOOK' },
  { id: 'accounts', label: 'CREATE ACCOUNTS' },
  { id: 'configure', label: 'CUSTOMIZE / CONFIGURE' },
  { id: 'collaborate', label: 'COLLABORATE / MANAGE' },
  { id: 'workflows', label: 'COMPLEX WORKFLOWS / PERMISSIONS' },
];

export const BLDR_NOT_SURE_Q4_OPTIONS: BldrAssessmentOption[] = [
  { id: 'simple', label: 'SIMPLE CONTENT' },
  { id: 'forms-payments', label: 'FORMS / PAYMENTS' },
  { id: 'custom-logic', label: 'CUSTOM LOGIC' },
  { id: 'multi-role', label: 'MULTIPLE USER ROLES' },
  { id: 'integrations', label: 'INTEGRATIONS / DATA' },
  { id: 'enterprise-infra', label: 'ENTERPRISE INFRASTRUCTURE' },
];

export const BLDR_NOT_SURE_Q5_OPTIONS: BldrAssessmentOption[] = [
  { id: 'personal', label: 'PERSONAL / SMALL BUSINESS' },
  { id: 'growing', label: 'GROWING BRAND' },
  { id: 'community', label: 'COMMUNITY / PLATFORM' },
  { id: 'team', label: 'TEAM / INTERNAL SYSTEM' },
  { id: 'large-org', label: 'LARGE ORGANIZATION' },
  { id: 'unsure', label: 'NOT SURE' },
];

const BLDR_VISION_STRIP: BldrProcessStrip = {
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
};

export const BLDR_ASSESSMENT_STATES: Record<BldrAssessmentStateId, BldrAssessmentStateConfig> = {
  site: {
    id: 'site',
    slug: 'site',
    stageMarker: '[ 01 / 04 ]',
    title: 'SITE',
    declaration: 'STRUCTURED DIGITAL BUILD.',
    editorialBody:
      'WEBSITES, ONLINE STORES, PORTFOLIOS, BOOKING SYSTEMS, MEMBERSHIPS, BROCHURES, AND MORE.',
    editorialCta: 'SELECTED',
    breadcrumb: 'LOCATION / BLDR / 01',
    iconId: 'site',
    contextLabel: 'SITE BUILDER / INVESTMENT GUIDE',
    landingTitle: 'DEFINE THE SCOPE OF YOUR SITE',
    landingSubtitle: 'HELP US UNDERSTAND WHAT KIND OF SITE YOU NEED.',
    landingFields: [
      { id: 'type', title: 'WHAT TYPE OF SITE ARE YOU BUILDING?', type: 'single', options: BLDR_SITE_TYPE_OPTIONS, required: true, gridColumns: 3 },
      { id: 'audience', title: 'WHO IS THIS SITE FOR?', type: 'audience-row', options: BLDR_AUDIENCE_B2_OPTIONS, required: true, gridColumns: 4 },
    ],
    steps: [
      { id: 'features', title: 'WHAT FEATURES DO YOU NEED?', subtitle: 'SELECT ALL THAT APPLY.', type: 'multi', options: BLDR_SITE_FEATURE_OPTIONS, required: true },
      { id: 'content', title: 'CONTENT / PAGE SCOPE', subtitle: 'PAGES, COPY, AND ASSETS.', type: 'textarea', maxLength: 500, required: true, placeholder: 'ESTIMATED PAGES, CONTENT STATUS, COPY/imagery NEEDS…' },
      { id: 'technical', title: 'TECHNICAL REQUIREMENTS', type: 'textarea', maxLength: 500, placeholder: 'DOMAIN, MIGRATIONS, INTEGRATIONS, CONSTRAINTS…' },
      { id: 'timeline', title: 'WHAT IS YOUR TIMELINE?', type: 'single', options: IDNTY_TIMELINE_OPTIONS, required: true },
      { id: 'budget', title: 'WHAT IS YOUR BUDGET RANGE?', type: 'single', options: IDNTY_BUDGET_OPTIONS, required: true },
    ],
    processStrip: BLDR_VISION_STRIP,
    primaryCta: 'NEXT STEP →',
    secondaryCta: 'SAVE & EXIT',
    completionTitle: 'YOUR SITE BUILD BLUEPRINT IS READY.',
    completionSubtitle: 'YOUR SITE SCOPE ASSESSMENT IS COMPLETE.',
    recommendedActions: [
      { id: 'projects', label: 'CREATE PROJECT →', href: SITE00_ROUTES.projects },
      { id: 'support', label: 'BOOK DISCOVERY CALL →', href: SITE00_ROUTES.support },
    ],
  },
  world: {
    id: 'world',
    slug: 'world',
    stageMarker: '[ 02 / 04 ]',
    title: 'WORLD',
    declaration: 'BESPOKE DIGITAL EXPERIENCE.',
    editorialBody:
      'IMMERSIVE EXPERIENCES, PLATFORMS, CUSTOM SYSTEMS, CONFIGURATORS, ADVANCED INTERACTION, AND MORE.',
    editorialCta: 'SELECTED',
    breadcrumb: 'LOCATION / BLDR / 02',
    iconId: 'world',
    contextLabel: 'SITE BUILDER / INVESTMENT GUIDE',
    landingTitle: 'DEFINE THE SCOPE OF YOUR WORLD',
    landingSubtitle: 'HELP US UNDERSTAND WHAT KIND OF DIGITAL WORLD YOU\'RE BUILDING.',
    landingFields: [
      { id: 'type', title: 'WHAT BEST DESCRIBES YOUR DIGITAL WORLD?', type: 'single', options: BLDR_WORLD_TYPE_OPTIONS, required: true, gridColumns: 3 },
      { id: 'audience', title: 'WHO IS THIS WORLD FOR?', type: 'audience-row', options: BLDR_AUDIENCE_B2_OPTIONS, required: true, gridColumns: 4 },
    ],
    steps: [
      { id: 'experience', title: 'WHAT SHOULD USERS BE ABLE TO DO?', type: 'multi', options: BLDR_WORLD_EXPERIENCE_OPTIONS, required: true },
      { id: 'roles', title: 'WHAT USER ROLES ARE NEEDED?', type: 'multi', options: BLDR_USER_ROLE_OPTIONS },
      { id: 'integrations', title: 'SYSTEMS / INTEGRATIONS', type: 'multi', options: BLDR_INTEGRATION_OPTIONS },
      { id: 'scale', title: 'SCALE & REACH', type: 'textarea', maxLength: 500, placeholder: 'USER VOLUME, GEOGRAPHIC REACH, GROWTH EXPECTATIONS…' },
      { id: 'timeline', title: 'WHAT IS YOUR TIMELINE?', type: 'single', options: IDNTY_TIMELINE_OPTIONS, required: true },
      { id: 'budget', title: 'WHAT IS YOUR BUDGET RANGE?', type: 'single', options: IDNTY_BUDGET_OPTIONS, required: true },
    ],
    processStrip: BLDR_VISION_STRIP,
    primaryCta: 'NEXT STEP →',
    secondaryCta: 'SAVE & EXIT',
    completionTitle: 'YOUR WORLD BUILD BLUEPRINT IS READY.',
    completionSubtitle: 'YOUR WORLD SCOPE ASSESSMENT IS COMPLETE.',
    recommendedActions: [
      { id: 'projects', label: 'CREATE PROJECT →', href: SITE00_ROUTES.projects },
      { id: 'support', label: 'BOOK DISCOVERY CALL →', href: SITE00_ROUTES.support },
    ],
  },
  enterprise: {
    id: 'enterprise',
    slug: 'enterprise',
    stageMarker: '[ 03 / 04 ]',
    title: 'ENTERPRISE',
    declaration: 'COMPLEX DIGITAL SYSTEMS.',
    editorialBody:
      'LARGE-SCALE SYSTEMS, MULTI-USER PLATFORMS, CUSTOM INFRASTRUCTURE, INTEGRATIONS, AND ADVANCED SECURITY.',
    editorialCta: 'SELECTED',
    breadcrumb: 'LOCATION / BLDR / 03',
    iconId: 'enterprise',
    contextLabel: 'SITE BUILDER / INVESTMENT GUIDE',
    landingTitle: 'DEFINE THE SCOPE OF YOUR ENTERPRISE',
    landingSubtitle: 'HELP US UNDERSTAND YOUR ENTERPRISE REQUIREMENTS.',
    landingFields: [
      { id: 'need', title: 'WHAT BEST DESCRIBES YOUR ENTERPRISE NEED?', type: 'single', options: BLDR_ENTERPRISE_NEED_OPTIONS, required: true, gridColumns: 3 },
      { id: 'audience', title: 'WHO IS THIS SOLUTION FOR?', type: 'audience-row', options: BLDR_ENTERPRISE_AUDIENCE_OPTIONS, required: true, gridColumns: 4 },
      { id: 'context', title: 'ADDITIONAL CONTEXT', type: 'textarea', maxLength: 800, placeholder: 'OPTIONAL — SHARE RELEVANT CONTEXT…' },
    ],
    steps: [
      { id: 'workflows', title: 'CORE WORKFLOWS & PAIN POINTS', type: 'textarea', maxLength: 500, required: true, placeholder: 'PROCESSES, AUTOMATION, APPROVALS, HANDOFFS…' },
      { id: 'data', title: 'DATA REQUIREMENTS', type: 'textarea', maxLength: 500, placeholder: 'DATABASES, REPORTING, MIGRATIONS, REAL-TIME DATA…' },
      { id: 'integrations', title: 'INTEGRATIONS', type: 'multi', options: BLDR_INTEGRATION_OPTIONS },
      { id: 'security', title: 'SECURITY / COMPLIANCE', type: 'multi', options: BLDR_SECURITY_OPTIONS },
      { id: 'scale', title: 'SCALE & PRIORITY', type: 'textarea', maxLength: 500, placeholder: 'USERS, DEPARTMENTS, AVAILABILITY, PERFORMANCE…' },
      { id: 'timeline', title: 'TIMELINE & PRIORITY', type: 'single', options: IDNTY_TIMELINE_OPTIONS, required: true },
    ],
    processStrip: BLDR_VISION_STRIP,
    primaryCta: 'NEXT STEP →',
    secondaryCta: 'SAVE & EXIT',
    completionTitle: 'YOUR ENTERPRISE BLUEPRINT IS READY.',
    completionSubtitle: 'YOUR ENTERPRISE SCOPE ASSESSMENT IS COMPLETE.',
    recommendedActions: [
      { id: 'support', label: 'REQUEST DISCOVERY →', href: SITE00_ROUTES.support },
      { id: 'projects', label: 'CREATE PROJECT →', href: SITE00_ROUTES.projects },
    ],
  },
  'not-sure': {
    id: 'not-sure',
    slug: 'not-sure',
    stageMarker: '[ 04 / 04 ]',
    title: 'NOT SURE?',
    declaration: "LET'S FIND THE RIGHT DIRECTION TOGETHER.",
    editorialBody:
      "ANSWER A FEW QUESTIONS AND WE'LL RECOMMEND THE RIGHT BUILD CLASS FOR YOU.",
    editorialCta: 'START DISCOVERY →',
    breadcrumb: 'LOCATION / BLDR / 04',
    iconId: 'not-sure',
    contextLabel: 'SITE BUILDER / INVESTMENT GUIDE',
    landingTitle: "LET'S FIND THE RIGHT DIRECTION",
    landingSubtitle: 'ANSWER A FEW QUICK QUESTIONS SO WE CAN RECOMMEND THE BEST PATH FOR YOU.',
    landingFields: [
      { id: 'q1', title: 'WHAT BEST DESCRIBES YOU?', type: 'single', options: BLDR_NOT_SURE_Q1_OPTIONS, required: true },
    ],
    steps: [
      { id: 'q2', title: 'WHAT ARE YOU TRYING TO CREATE?', type: 'single', options: BLDR_NOT_SURE_Q2_OPTIONS, required: true },
      { id: 'q3', title: 'HOW SHOULD PEOPLE INTERACT WITH IT?', type: 'single', options: BLDR_NOT_SURE_Q3_OPTIONS, required: true },
      { id: 'q4', title: 'HOW COMPLEX IS THE SYSTEM BEHIND IT?', type: 'single', options: BLDR_NOT_SURE_Q4_OPTIONS, required: true },
      { id: 'q5', title: 'WHAT SCALE ARE YOU PLANNING FOR?', type: 'single', options: BLDR_NOT_SURE_Q5_OPTIONS, required: true },
    ],
    processStrip: BLDR_VISION_STRIP,
    primaryCta: 'NEXT QUESTION →',
    secondaryCta: 'SAVE & EXIT',
    completionTitle: 'YOUR RECOMMENDATION IS READY.',
    completionSubtitle: 'WE\'VE MATCHED YOUR ANSWERS TO THE BEST BUILD CLASS.',
    recommendedActions: [
      { id: 'support', label: 'BOOK DISCOVERY →', href: SITE00_ROUTES.support },
    ],
  },
};

export const BLDR_ASSESSMENT_STATE_LIST = Object.values(BLDR_ASSESSMENT_STATES);

export function bldrAssessmentPath(stateSlug: string, step?: string): string {
  const base = `${SITE00_ROUTES.bldr}/${stateSlug}`;
  if (!step) return base;
  return `${base}/${step}`;
}

export function bldrAssessmentReviewPath(stateSlug: string): string {
  return `${SITE00_ROUTES.bldr}/${stateSlug}/review`;
}

export function bldrAssessmentCompletePath(stateSlug: string): string {
  return `${SITE00_ROUTES.bldr}/${stateSlug}/complete`;
}

export function bldrAssessmentRecommendationPath(): string {
  return `${SITE00_ROUTES.bldr}/not-sure/recommendation`;
}

export function getBldrAssessmentState(slug: string): BldrAssessmentStateConfig | undefined {
  return BLDR_ASSESSMENT_STATE_LIST.find((s) => s.slug === slug);
}

export function bldrAssessmentAllSteps(state: BldrAssessmentStateConfig): BldrAssessmentStep[] {
  return [...state.landingFields, ...state.steps];
}

export function bldrAssessmentStepIndex(state: BldrAssessmentStateConfig, stepId: string): number {
  return bldrAssessmentAllSteps(state).findIndex((s) => s.id === stepId);
}

export function bldrAssessmentNextStep(state: BldrAssessmentStateConfig, currentStepId: string): BldrAssessmentStep | null {
  const all = bldrAssessmentAllSteps(state);
  const idx = bldrAssessmentStepIndex(state, currentStepId);
  if (idx < 0 || idx >= all.length - 1) return null;
  return all[idx + 1] ?? null;
}

export function bldrAssessmentPrevStep(state: BldrAssessmentStateConfig, currentStepId: string): BldrAssessmentStep | null {
  const idx = bldrAssessmentStepIndex(state, currentStepId);
  if (idx <= 0) return null;
  return bldrAssessmentAllSteps(state)[idx - 1] ?? null;
}

export function bldrAssessmentFirstStepId(state: BldrAssessmentStateConfig): string | null {
  const first = state.steps[0];
  return first?.id ?? null;
}
