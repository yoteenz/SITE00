/**
 * Public redesign — page copy for BLDR / EVOLVE command centers and path panels, and Origin panel notes.
 *
 * Copy is transcribed from the approved authority screens and is rendered uppercase by CSS. Prices are
 * authority copy, NOT wired to a pricing source (none exists for these panels yet).
 *
 * STRUCTURAL MISMATCH (documented, not hidden): the authority BLDR hierarchy is SITE / WORLD / SYSTEMS /
 * EXTENSIONS, while the current build classes are SITE / WORLD / ENTERPRISE / NOT SURE. Function is kept:
 * SYSTEMS → `enterprise` assessment, EXTENSIONS → `not-sure` discovery (no dedicated class exists yet).
 */

import { SITE00_ROUTES } from './routes';
import type { EvolvePathId } from './evolve';

/* ------------------------------------------------------------------ BLDR */

export type BuilderPathId = 'site' | 'world' | 'systems' | 'extensions';
export type BuilderPanelId = 'overview' | BuilderPathId;

export const BUILDER_PANEL_ORDER: BuilderPanelId[] = ['overview', 'site', 'world', 'systems', 'extensions'];

export type FrameworkStep = { title: string; description: string };
export type BuildItem = { title: string; description: string };

export type BuilderPanelCopy = {
  id: BuilderPanelId;
  /** 02 / 02.01 … */
  code: string;
  title: string;
  tagline: string;
  /** Right-hand margin note lines. */
  sideNote: string;
  overview: string;
  /** Section heading for the item row: THE BUILDER PATH / WHAT WE BUILD */
  itemsHeading: string;
  items: BuildItem[];
  frameworkHeading: string;
  framework: FrameworkStep[];
  cta: string;
};

const FRAMEWORK_SITE: FrameworkStep[] = [
  { title: 'STRATEGY', description: 'DEFINE GOALS, AUDIENCE, AND OPPORTUNITY.' },
  { title: 'ARCHITECTURE', description: 'STRUCTURE CONTENT, PAGES, AND USER FLOWS.' },
  { title: 'DESIGN', description: 'SHAPE THE LOOK, FEEL, AND INTERACTION EXPERIENCE.' },
  { title: 'DEVELOPMENT', description: 'BRING IT TO LIFE WITH PERFORMANCE, FLEXIBILITY, AND INTEGRATION.' },
  { title: 'LAUNCH', description: 'DEPLOY, OPTIMIZE, AND SCALE FOR LONG-TERM GROWTH.' },
];

export const BUILDER_PANELS: Record<BuilderPanelId, BuilderPanelCopy> = {
  overview: {
    id: 'overview',
    code: '02.01',
    title: 'OVERVIEW',
    tagline: 'YOUR BUILDER COMMAND CENTER.',
    sideNote: 'IDEAS STRUCTURE SYSTEMS EXPERIENCES AND BEYOND.',
    overview:
      'BUILDER IS THE BLUEPRINT ENGINE. IT GATHERS EVERYTHING YOU NEED TO PLAN, STRUCTURE, AND DESIGN YOUR SITE OR WORLD. FROM CONTENT AND DESIGN TO SYSTEMS AND INTEGRATIONS, BUILDER GIVES YOU A CLEAR PATH TO BRING YOUR VISION TO LIFE — AT ANY SCALE.',
    itemsHeading: 'THE BUILDER PATH',
    items: [
      { title: 'SITE', description: 'BUILD YOUR DIGITAL PLACE.|WEBSITES, ECOMMERCE, LANDING PAGES, BOOKING, AND MORE.' },
      { title: 'WORLD', description: 'CREATE BESPOKE ENVIRONMENTS.|PLATFORMS, MEMBERSHIPS, INTERACTIVE EXPERIENCES, AND COMMUNITIES.' },
      { title: 'SYSTEMS', description: 'POWER YOUR INFRASTRUCTURE.|CMS, INTEGRATIONS, AUTOMATIONS, AND WORKFLOWS.' },
      { title: 'EXTENSIONS', description: 'ADD. INTEGRATE. SCALE.|TOOLS, FEATURES, THIRD-PARTY SERVICES, AND CUSTOM BUILD.' },
    ],
    frameworkHeading: 'BUILDER FRAMEWORK',
    framework: FRAMEWORK_SITE,
    cta: 'BEGIN BUILDER',
  },
  site: {
    id: 'site',
    code: '02',
    title: 'SITE',
    tagline: 'BUILD YOUR DIGITAL PLACE.',
    sideNote: 'IDEAS STRUCTURE SYSTEMS EXPERIENCES THAT SCALE.',
    overview:
      'SITE TURNS YOUR VISION INTO A FULLY REALIZED DIGITAL PLACE. FROM STRATEGY AND STRUCTURE TO DESIGN AND DEVELOPMENT, WE HELP YOU CREATE WEBSITES, PLATFORMS, AND DIGITAL EXPERIENCES THAT BRING YOUR BRAND TO LIFE AND SCALE WITH YOUR GOALS.',
    itemsHeading: 'WHAT WE BUILD',
    items: [
      { title: 'WEBSITES', description: 'BRAND SITES, LANDING PAGES, ECOMMERCE, AND MORE.' },
      { title: 'PLATFORMS', description: 'CUSTOM DIGITAL EXPERIENCES, MEMBERSHIPS, AND INTERACTIVE ENVIRONMENTS.' },
      { title: 'APPLICATIONS', description: 'WEB APPS, TOOLS, SYSTEMS AND INTEGRATIONS BUILT FOR YOUR WORKFLOW.' },
      { title: 'EXPERIENCES', description: 'IMMERSIVE, CONTENT-RICH DIGITAL PLACES THAT ENGAGE AND CONVERT.' },
    ],
    frameworkHeading: 'THE SITE FRAMEWORK',
    framework: FRAMEWORK_SITE,
    cta: 'BEGIN SITE',
  },
  world: {
    id: 'world',
    code: '02.02',
    title: 'WORLD',
    tagline: 'CREATE BESPOKE DIGITAL EXPERIENCES.',
    sideNote: 'ENVIRONMENTS PLATFORMS EXPERIENCES COMMUNITIES THAT EXTEND YOUR BRAND.',
    overview:
      'WORLD DESIGNS AND DEVELOPS CUSTOM DIGITAL ENVIRONMENTS THAT BRING YOUR BRAND TO LIFE. FROM IMMERSIVE WEBSITES AND INTERACTIVE PLATFORMS TO BRANDED MICROSITES, COMMUNITIES, AND CAMPAIGN EXPERIENCES, WE CREATE PLACES THAT ENGAGE YOUR AUDIENCE AND SCALE WITH YOUR VISION.',
    itemsHeading: 'WHAT WE BUILD',
    items: [
      { title: 'DIGITAL PLATFORMS', description: 'BRAND WORLDS, WEBSITES, LANDING PAGES, AND MICROSITES.' },
      { title: 'INTERACTIVE EXPERIENCES', description: 'IMMERSIVE STORYTELLING, VIRTUAL ENVIRONMENTS, AND ENGAGEMENT PLATFORMS.' },
      { title: 'COMMUNITIES', description: 'MEMBERSHIP SPACES, SOCIAL ENVIRONMENTS, AND AUDIENCE ECOSYSTEMS.' },
      { title: 'CAMPAIGNS', description: 'LAUNCH EXPERIENCES, SEASONAL WORLDS, AND BRANDED INTERACTIONS.' },
    ],
    frameworkHeading: 'THE WORLD FRAMEWORK',
    framework: [
      { title: 'CONCEPT', description: 'DEFINE PURPOSE, AUDIENCE, STORY, AND EXPERIENCE OBJECTIVES.' },
      { title: 'ENVIRONMENT', description: 'DESIGN THE WORLD, STRUCTURE, FLOW, AND KEY INTERACTION MOMENTS.' },
      { title: 'INTERACTION', description: 'BUILD ENGAGEMENT PATHS, CONTENT SYSTEMS, AND COMMUNITY LAYERS.' },
      { title: 'INTEGRATION', description: 'CONNECT TO TOOLS, DATA, MEMBERSHIPS, AND THIRD-PARTY SYSTEMS.' },
      { title: 'EVOLUTION', description: 'LAUNCH, MEASURE, OPTIMIZE, AND EXPAND OVER TIME.' },
    ],
    cta: 'BEGIN WORLD',
  },
  systems: {
    id: 'systems',
    code: '02.03',
    title: 'SYSTEMS',
    tagline: 'POWER YOUR DIGITAL INFRASTRUCTURE.',
    sideNote: 'CONNECT AUTOMATE INTEGRATE SCALE OPTIMIZE OPERATE.',
    overview:
      'SYSTEMS GIVES YOUR DIGITAL PLACE ITS POWER. WE CONFIGURE, INTEGRATE, AND AUTOMATE THE TOOLS, SERVICES, AND WORKFLOWS THAT RUN YOUR SITE, PLATFORM, OR WORLD — SO YOU CAN OPERATE AT SCALE WITH LESS FRICTION.',
    itemsHeading: 'WHAT WE BUILD',
    items: [
      { title: 'CORE SYSTEMS', description: 'CMS, DATABASES, USER SYSTEMS, AND PLATFORM INFRASTRUCTURE.' },
      { title: 'INTEGRATIONS', description: 'THIRD-PARTY TOOLS, APIS, SERVICES, AND CUSTOM CONNECTIONS.' },
      { title: 'AUTOMATIONS', description: 'WORKFLOWS, TRIGGERS, CONTENT PIPELINES, AND OPERATIONAL EFFICIENCY.' },
      { title: 'SCALABILITY', description: 'PERFORMANCE, SECURITY, MONITORING, AND INFRASTRUCTURE FOR GROWTH.' },
    ],
    frameworkHeading: 'THE SYSTEMS FRAMEWORK',
    framework: [
      { title: 'REQUIREMENTS', description: 'DEFINE FUNCTIONAL NEEDS, INTEGRATIONS, AND OPERATIONAL GOALS.' },
      { title: 'ARCHITECTURE', description: 'DESIGN SYSTEM STRUCTURE, DATA FLOW, AND SERVICE LAYERS.' },
      { title: 'INTEGRATION', description: 'CONNECT TOOLS, APIS, PLATFORMS, AND EXTERNAL SERVICES.' },
      { title: 'AUTOMATION', description: 'BUILD WORKFLOWS, TRIGGERS, AND INTELLIGENT PROCESSES.' },
      { title: 'DEPLOYMENT', description: 'LAUNCH, OPTIMIZE, MONITOR, AND SCALE FOR LONG-TERM GROWTH.' },
    ],
    cta: 'BEGIN SYSTEMS',
  },
  extensions: {
    id: 'extensions',
    code: '02.04',
    title: 'EXTENSIONS',
    tagline: 'ADD. INTEGRATE. SCALE.',
    sideNote: 'ADD-ONS TOOLS AUTOMATIONS INTEGRATIONS SCALABLE FEATURES.',
    overview:
      'EXTENSIONS LET YOU ADD POWERFUL CAPABILITIES TO YOUR SITE, PLATFORM, OR WORLD. BROWSE, CONFIGURE, AND INTEGRATE ADD-ONS, TOOLS, AUTOMATIONS, AND THIRD-PARTY SERVICES TO CUSTOMIZE YOUR EXPERIENCE AND SCALE AS YOU GROW.',
    itemsHeading: 'WHAT WE BUILD',
    items: [
      { title: 'ADD-ONS', description: 'FEATURE PACKS, MODULAR TOOLS, AND PLUG-INS.' },
      { title: 'AUTOMATIONS', description: 'WORKFLOWS, TRIGGERS, AND SMART SYSTEMS.' },
      { title: 'INTEGRATIONS', description: 'THIRD-PARTY APIS, SERVICES, AND CUSTOM CONNECTIONS.' },
      { title: 'SCALABLE FEATURES', description: 'ADVANCED FUNCTIONS THAT GROW WITH YOUR BRAND.' },
    ],
    frameworkHeading: 'THE EXTENSIONS FRAMEWORK',
    framework: [
      { title: 'IDENTIFY', description: 'FIND THE RIGHT TOOLS FOR YOUR GOALS.' },
      { title: 'CONFIGURE', description: 'SET UP FEATURES AND CUSTOMIZE SETTINGS.' },
      { title: 'INTEGRATE', description: 'CONNECT TO YOUR EXISTING SYSTEMS AND WORKFLOWS.' },
      { title: 'OPTIMIZE', description: 'TEST, REFINE, AND IMPROVE PERFORMANCE.' },
      { title: 'SCALE', description: 'EXPAND CAPABILITIES AND UNLOCK NEW OPPORTUNITIES.' },
    ],
    cta: 'BEGIN EXTENSIONS',
  },
};

/** Command-center path cards (authority 01). */
export const BUILDER_PATH_CARDS: {
  id: BuilderPathId;
  code: string;
  title: string;
  tagline: string;
  lines: string[];
  cta: string;
  slotId: string;
}[] = [
  { id: 'site', code: '01', title: 'SITE', tagline: 'BUILD YOUR DIGITAL PLACE.', lines: ['WEBSITES', 'LANDING PAGES', 'ECOMMERCE', 'BOOKING', 'AND MORE.'], cta: 'ENTER SITE', slotId: 'CARD.BLDR.PATH.SITE' },
  { id: 'world', code: '02', title: 'WORLD', tagline: 'CREATE BESPOKE ENVIRONMENTS.', lines: ['PLATFORMS', 'MEMBERSHIPS', 'INTERACTIVE EXPERIENCES', 'COMMUNITIES', 'AND MORE.'], cta: 'ENTER WORLD', slotId: 'CARD.BLDR.PATH.WORLD' },
  { id: 'systems', code: '03', title: 'SYSTEMS', tagline: 'POWER YOUR INFRASTRUCTURE.', lines: ['CMS', 'INTEGRATIONS', 'AUTOMATIONS', 'WORKFLOWS', 'AND MORE.'], cta: 'ENTER SYSTEMS', slotId: 'CARD.BLDR.PATH.SYSTEMS' },
  { id: 'extensions', code: '04', title: 'EXTENSIONS', tagline: 'ADD. INTEGRATE. SCALE.', lines: ['ADD-ONS', 'TOOLS', 'FEATURES', 'THIRD-PARTY SERVICES', 'AND MORE.'], cta: 'ENTER EXTENSIONS', slotId: 'CARD.BLDR.PATH.EXTENSIONS' },
];

export const BUILDER_CENTER_COPY = {
  crumb: 'BUILDER /',
  title: ['BUILDER', 'COMMAND CENTER'],
  question: ['TURN IDEAS', 'INTO DIGITAL PLACES.'],
  body: 'PLAN, DESIGN, AND BUILD WEBSITES, WORLDS, SYSTEMS, AND EXTENSIONS THAT BRING YOUR BRAND TO LIFE — AT ANY SCALE.',
  sideTop: 'FOUR BUILD PATHS. ENDLESS POSSIBILITIES.',
  sideMid: 'SAME FOUNDATION. DIFFERENT SCALE. BUILT FOR WHAT\'S NEXT.',
  choose: 'CHOOSE YOUR BUILD PATH',
  viewFramework: 'VIEW FRAMEWORK',
  notSure: 'NOT SURE WHERE TO START?',
  notSureBody: "ANSWER A FEW QUESTIONS AND WE'LL RECOMMEND THE RIGHT BUILD PATH FOR YOUR GOALS.",
  assessmentCta: 'TAKE THE BUILDER ASSESSMENT',
} as const;

/**
 * Where BEGIN <PATH> goes — current product truth, not authority invention.
 * `waiting` marks a path with no dedicated build class yet (flagged in the handoff).
 */
export const BUILDER_PATH_DESTINATIONS: Record<BuilderPanelId, { href: string; waiting?: boolean }> = {
  overview: { href: SITE00_ROUTES.bldrStart },
  site: { href: '/bldr/site' },
  world: { href: '/bldr/world' },
  systems: { href: '/bldr/enterprise' },
  extensions: { href: '/bldr/not-sure', waiting: true },
};

/* ---------------------------------------------------------------- EVOLVE */

export type EvolvePanelCopy = {
  id: EvolvePathId;
  code: string;
  title: string;
  tagline: string;
  overview: string;
  includes: string[];
  idealFor: string[];
  deliverables: string[];
  timeline: string;
  investment: string;
  cta: string;
  sideLeft: string[];
  sideRight: string[];
};

export const EVOLVE_PATH_ORDER: EvolvePathId[] = ['refine', 'install', 'transform'];

export const EVOLVE_PANELS: Record<EvolvePathId, EvolvePanelCopy> = {
  refine: {
    id: 'refine',
    code: '03.01',
    title: 'REFINE',
    tagline: 'IMPROVE WHAT ALREADY EXISTS.',
    overview:
      "YOU HAVE AN EXISTING IDENTITY, BUT IT NEEDS REFINEMENT AND ALIGNMENT. WE'LL ANALYZE WHAT YOU HAVE, IDENTIFY GAPS, AND ELEVATE YOUR BRAND WITH A MORE COHESIVE, STRATEGIC, AND POWERFUL IDENTITY SYSTEM.",
    includes: ['BRAND AUDIT & ANALYSIS', 'VISUAL REFINEMENT', 'MESSAGING ALIGNMENT', 'GUIDELINE ENHANCEMENT', 'ASSET OPTIMIZATION', 'IMPLEMENTATION SUPPORT'],
    idealFor: ['OUTDATED VISUALS', 'INCONSISTENT BRAND', 'MISSING GUIDELINES', 'NEED FOR COHESION', 'EXPANDING BRAND PRESENCE', 'PREPARING FOR GROWTH'],
    deliverables: ['REFINED VISUAL IDENTITY', 'UPDATED BRAND GUIDELINES', 'OPTIMIZED ASSETS', 'MESSAGING FRAMEWORK', 'APPLICATION EXAMPLES', 'IMPLEMENTATION PLAN'],
    timeline: '4–6 WEEKS',
    investment: 'FROM $1,750',
    cta: 'CHOOSE REFINE',
    sideLeft: ['IMPROVE', 'ALIGN', 'OPTIMIZE', 'ELEVATE', 'WHAT EXISTS'],
    sideRight: ['EXISTING', 'ELEMENTS', 'ANALYZED.', 'REFINED.', 'ALIGNED.', 'ELEVATED.'],
  },
  install: {
    id: 'install',
    code: '03.02',
    title: 'INSTALL',
    tagline: 'ADD POWERFUL SYSTEMS.',
    overview:
      'ADD ESSENTIAL SITE 00 SYSTEMS AND CAPABILITIES TO YOUR CURRENT PLATFORM. INTEGRATE ADVANCED FUNCTIONALITY, UNLOCK NEW TOOLS, AND EXPAND WHAT YOUR DIGITAL PLACE CAN DO WITHOUT A FULL REBUILD.',
    includes: ['SYSTEM ARCHITECTURE', 'FEATURE INTEGRATION', 'THIRD-PARTY CONNECTIONS', 'AUTOMATION & WORKFLOWS', 'PERFORMANCE OPTIMIZATION', 'TRAINING & DOCUMENTATION'],
    idealFor: ['ADDING NEW FUNCTIONALITY', 'INTEGRATING TOOLS', 'IMPROVING PERFORMANCE', 'AUTOMATING WORKFLOWS', 'EXPANDING CAPABILITIES', 'SCALING OPERATIONS'],
    deliverables: ['INTEGRATED SYSTEMS', 'CONFIGURED TOOLS', 'AUTOMATION WORKFLOWS', 'THIRD-PARTY CONNECTIONS', 'PERFORMANCE OPTIMIZATION', 'DOCUMENTATION & TRAINING'],
    timeline: '4–8 WEEKS',
    investment: 'FROM $2,500',
    cta: 'CHOOSE INSTALL',
    sideLeft: ['IMPROVE', 'ALIGN', 'OPTIMIZE', 'ELEVATE', 'WHAT EXISTS'],
    sideRight: [],
  },
  transform: {
    id: 'transform',
    code: '03.03',
    title: 'TRANSFORM',
    tagline: 'REARCHITECT AND MODERNIZE.',
    overview:
      "REIMAGINE AND MODERNIZE YOUR ENTIRE DIGITAL FOUNDATION. WE'LL STRATEGICALLY EVOLVE YOUR EXISTING BRAND AND PLATFORM WITH A NEW ARCHITECTURE, ELEVATED DESIGN, AND FUTURE-PROOF SYSTEMS BUILT FOR SCALE.",
    includes: ['STRATEGIC RE-ARCHITECTURE', 'VISUAL & EXPERIENCE REDESIGN', 'SYSTEM MODERNIZATION', 'DATA & CONTENT MIGRATION', 'ADVANCED INTEGRATIONS', 'LAUNCH & GROWTH SUPPORT'],
    idealFor: ['MAJOR BRAND EVOLUTION', 'OUTDATED PLATFORM', 'SCALING TO NEW MARKETS', 'MODERNIZING TECHNOLOGY', 'EXPANDING DIGITAL CAPABILITIES', 'PREPARING FOR FUTURE GROWTH'],
    deliverables: ['NEW DIGITAL ARCHITECTURE', 'MODERNIZED VISUAL IDENTITY', 'ENHANCED USER EXPERIENCE', 'SYSTEM MIGRATION PLAN', 'SCALABLE INFRASTRUCTURE', 'POST-LAUNCH OPTIMIZATION'],
    timeline: '8–12 WEEKS',
    investment: 'FROM $5,000',
    cta: 'CHOOSE TRANSFORM',
    sideLeft: ['IMPROVE', 'ALIGN', 'OPTIMIZE', 'ELEVATE', 'WHAT EXISTS'],
    sideRight: ['REARCHITECT', 'MODERNIZE', 'SCALE', 'EXPAND', 'TRANSFORM.'],
  },
};

export const EVOLVE_CENTER_COPY = {
  crumb: 'EVOLVE /',
  title: ['INTERVENTION', 'CENTER'],
  question: ['HOW DEEPLY SHOULD', 'SITE 00 INTERVENE', 'IN WHAT ALREADY', 'EXISTS?'],
  body: 'YOUR DIGITAL PROPERTY ALREADY EXISTS. CHOOSE HOW DEEPLY SITE 00 SHOULD INTERVENE IN ITS CURRENT FOUNDATION.',
  side: 'PRESERVE WHAT WORKS. CHANGE WHAT SHOULD. REBUILD ONLY WHEN NECESSARY.',
  layers: [
    { code: '01', label: 'SURFACE / EXPERIENCE LAYER' },
    { code: '02', label: 'SYSTEM / CAPABILITY LAYER' },
    { code: '03', label: 'FOUNDATION / ARCHITECTURE LAYER' },
  ],
  choose: 'CHOOSE YOUR EVOLUTION PATH',
  viewApproach: 'VIEW APPROACH',
  cards: [
    { id: 'refine' as const, code: '01', title: 'REFINE', tagline: 'OPTIMIZE WHAT ALREADY EXISTS.', lines: ['EXPERIENCE', 'DESIGN', 'PERFORMANCE', 'CONVERSION.'], cta: 'ENTER REFINE', slotId: 'CARD.EVOLVE.PATH.REFINE' },
    { id: 'install' as const, code: '02', title: 'INSTALL', tagline: 'ADD NEW CAPABILITY.', lines: ['SITE 00 SYSTEMS', 'FEATURES', 'INTEGRATIONS', 'AUTOMATION.'], cta: 'ENTER INSTALL', slotId: 'CARD.EVOLVE.PATH.INSTALL' },
    { id: 'transform' as const, code: '03', title: 'TRANSFORM', tagline: 'REARCHITECT THE FOUNDATION.', lines: ['MODERNIZATION', 'ARCHITECTURE', 'SCALABILITY', 'TECHNOLOGY.'], cta: 'ENTER TRANSFORM', slotId: 'CARD.EVOLVE.PATH.TRANSFORM' },
  ],
  notSure: 'NOT SURE HOW DEEPLY TO INTERVENE?',
  notSureBody: "WE'LL ASSESS YOUR EXISTING PROPERTY AND RECOMMEND THE RIGHT PATH.",
  assessmentCta: 'TAKE THE EVOLVE ASSESSMENT',
  /** No standalone Evolve assessment route exists; the hub carries the diagnostic. */
  assessmentHref: SITE00_ROUTES.evolve,
} as const;

/** Origin expanded-panel margin notes (authority 02–04). */
export const ORIGIN_PANEL_SIDE_NOTES = {
  idnty: 'CLARITY CREATES EVERYTHING THAT FOLLOWS.',
  bldr: 'IDEAS STRUCTURE SYSTEMS EXPERIENCES THAT SCALE.',
  evolve: 'IMPROVE INTEGRATE MODERNIZE EXPAND TRANSFORM',
} as const;

export const ORIGIN_EXPANDED_TITLES = {
  idnty: { number: '01', title: 'IDENTITY' },
  bldr: { number: '02', title: 'BUILDER' },
  evolve: { number: '03', title: 'EVOLVE' },
} as const;
