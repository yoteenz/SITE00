import type {
  EvolveEvolutionPath,
  EvolveServiceArea,
  EvolveServiceHubSectionId,
  EvolveServiceProcessStep,
} from './types.js';

export const EVOLVE_SERVICE_HERO = {
  title: 'EVOLVE',
  tagline: 'ENHANCE. INTEGRATE. TRANSFORM WHAT EXISTS.',
  overview:
    'YOUR DIGITAL PROPERTY ALREADY EXISTS. SITE 00 WORKS WITH ITS EXISTING FOUNDATION TO IMPROVE THE EXPERIENCE, INTRODUCE NEW CAPABILITIES, MODERNIZE THE UNDERLYING SYSTEM, OR TRANSFORM THE PRODUCT WITHOUT AUTOMATICALLY STARTING FROM ZERO.',
} as const;

export const EVOLVE_SERVICE_DIAGNOSTIC_STAGES = [
  {
    id: 'existing',
    num: '01',
    title: 'EXISTING PROPERTY',
    body: 'YOUR DIGITAL PLACE ALREADY EXISTS.',
    iconId: 'existing-property' as const,
  },
  {
    id: 'assessment',
    num: '02',
    title: 'ASSESSMENT',
    body: 'WE EVALUATE YOUR CURRENT FOUNDATION.',
    iconId: 'assessment' as const,
  },
  {
    id: 'path',
    num: '03',
    title: 'EVOLUTION PATH',
    body: 'CHOOSE HOW DEEPLY WE INTERVENE.',
    iconId: 'evolution-path' as const,
  },
] as const;

export const EVOLVE_SERVICE_HUB_SECTIONS: readonly { id: EvolveServiceHubSectionId; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'paths', label: 'PATHS' },
  { id: 'process', label: 'PROCESS' },
  { id: 'systems', label: 'SYSTEMS' },
  { id: 'cases', label: 'CASE STUDIES' },
  { id: 'faq', label: 'FAQ' },
  { id: 'start', label: 'START EVOLVE' },
] as const;

export const EVOLVE_SERVICE_EVOLUTION_PATHS: readonly EvolveEvolutionPath[] = [
  {
    id: 'refine',
    num: '01',
    title: 'REFINE',
    modeLabel: 'OPTIMIZE',
    descriptor:
      'IMPROVE WHAT ALREADY EXISTS — DESIGN, PERFORMANCE, EXPERIENCE, AND CONVERSION.',
    capabilities: ['UI/UX IMPROVEMENT', 'PERFORMANCE OPTIMIZATION', 'SEO & CONVERSION', 'CONTENT ENHANCEMENT'],
    cta: 'ENTER PATH →',
    iconId: 'refine',
  },
  {
    id: 'install',
    num: '02',
    title: 'INSTALL',
    modeLabel: 'EXPAND',
    descriptor: 'ADD POWERFUL SITE 00 SYSTEMS AND CAPABILITIES TO YOUR CURRENT PROPERTY.',
    capabilities: ['NEW FEATURES', 'INTEGRATIONS', 'AUTOMATION', 'THIRD-PARTY CONNECTIVITY'],
    cta: 'ENTER PATH →',
    iconId: 'install',
  },
  {
    id: 'transform',
    num: '03',
    title: 'TRANSFORM',
    modeLabel: 'REARCHITECT',
    descriptor: 'REARCHITECT, MODERNIZE, SCALE, AND FUTURE-PROOF YOUR ENTIRE DIGITAL FOUNDATION.',
    capabilities: ['SYSTEM MODERNIZATION', 'ARCHITECTURE OVERHAUL', 'SCALABILITY', 'NEW TECHNOLOGY STACK'],
    cta: 'ENTER PATH →',
    iconId: 'transform',
  },
] as const;

export const EVOLVE_SERVICE_PROCESS_STEPS: readonly EvolveServiceProcessStep[] = [
  {
    num: '01',
    title: 'PROPERTY',
    body: 'IDENTIFY YOUR EXISTING DIGITAL PROPERTY AND CURRENT STACK.',
    iconId: 'property',
  },
  {
    num: '02',
    title: 'DIAGNOSE',
    body: 'CLARIFY WHAT TO IMPROVE, PRESERVE, AND MEASURE AS SUCCESS.',
    iconId: 'diagnose',
  },
  {
    num: '03',
    title: 'SYSTEM PLAN',
    body: 'DEFINE SOLUTION, SCOPE, AND TECHNICAL APPROACH.',
    iconId: 'system-plan',
  },
  {
    num: '04',
    title: 'BUILD',
    body: 'IMPLEMENT, INTEGRATE, AND OPTIMIZE.',
    iconId: 'build',
  },
  {
    num: '05',
    title: 'LAUNCH / MEASURE',
    body: 'DEPLOY, MEASURE IMPACT, AND PLAN WHAT\'S NEXT.',
    iconId: 'launch-measure',
  },
] as const;

export const EVOLVE_SERVICE_AREAS: readonly EvolveServiceArea[] = [
  {
    id: 'EXPERIENCE',
    num: '01',
    title: 'EXPERIENCE',
    iconId: 'experience',
    capabilities: ['UI/UX ENHANCEMENT', 'INTERACTIVE NAVIGATION', 'DESIGN SYSTEMS', 'ACCESSIBILITY'],
  },
  {
    id: 'COMMERCE',
    num: '02',
    title: 'COMMERCE',
    iconId: 'commerce',
    capabilities: ['CUSTOM STOREFRONT', 'CHECKOUT OPTIMIZATION', 'SUBSCRIPTIONS', 'MEMBERSHIPS & REWARDS'],
  },
  {
    id: 'OPERATIONS',
    num: '03',
    title: 'OPERATIONS',
    iconId: 'operations',
    capabilities: ['SMART INTAKE', 'ADMIN TOOLING', 'CLIENT PORTALS', 'WORKFLOW AUTOMATION'],
  },
  {
    id: 'INTELLIGENCE',
    num: '04',
    title: 'INTELLIGENCE',
    iconId: 'intelligence',
    capabilities: ['AI ASSISTANTS', 'CONTENT RECOMMENDATION', 'PERSONALIZATION', 'USER INSIGHTS'],
  },
  {
    id: 'CONNECTIONS',
    num: '05',
    title: 'CONNECTIONS',
    iconId: 'connections',
    capabilities: ['API INTEGRATIONS', 'CRM CONNECTORS', 'THIRD-PARTY APIS', 'ANALYTICS & PAYMENTS'],
  },
] as const;

export const EVOLVE_SERVICE_FAQ = [
  {
    id: 'rebuild',
    question: 'DO I NEED TO REBUILD FROM ZERO?',
    answer: 'NO — EVOLVE WORKS WITH YOUR EXISTING PROPERTY.',
  },
  {
    id: 'assessment',
    question: 'WHEN IS TECHNICAL ASSESSMENT REQUIRED?',
    answer: 'BEFORE FINAL SCOPE FOR INSTALL AND TRANSFORM ENGAGEMENTS.',
  },
] as const;

export const EVOLVE_SERVICE_FINAL_CTA = {
  headlineLine1: "YOUR PROPERTY DOESN'T NEED",
  headlineLine2: 'TO START OVER.',
  subhead: 'IT NEEDS A DIRECTION.',
  cta: 'START EVOLVE →',
} as const;
