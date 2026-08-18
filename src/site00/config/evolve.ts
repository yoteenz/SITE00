/**
 * EVOLVE configuration — paths, framework pillars, homepage copy, state selection.
 */

import type { EvolveIconId } from './evolve-framework-icons';

export type EvolvePathId = 'refine' | 'install' | 'transform';

export type EvolvePath = {
  id: EvolvePathId;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  icon: EvolveIconId;
  cta: string;
};

export const EVOLVE_PATHS: EvolvePath[] = [
  {
    id: 'refine',
    code: '01',
    title: 'REFINE',
    subtitle: 'IMPROVE WHAT EXISTS.',
    description:
      'VISUAL POLISH, UX/UI ENHANCEMENT, RESPONSIVE REFINEMENT, ACCESSIBILITY, PERFORMANCE, NAVIGATION, CONVERSION, AND EXPERIENCE CLEANUP.',
    icon: 'refine',
    cta: 'SELECT REFINE →',
  },
  {
    id: 'install',
    code: '02',
    title: 'INSTALL',
    subtitle: 'ADD CAPABILITIES.',
    description:
      'AI SYSTEMS, SMART INTAKE, CLIENT PORTALS, DASHBOARDS, CONFIGURATORS, BOOKING, MEMBERSHIPS, REWARDS, AUTOMATION, AND CUSTOM INTEGRATIONS.',
    icon: 'install',
    cta: 'SELECT INSTALL →',
  },
  {
    id: 'transform',
    code: '03',
    title: 'TRANSFORM',
    subtitle: 'MODERNIZE DEEPLY.',
    description:
      'ARCHITECTURE MODERNIZATION, MAJOR UX REDESIGN, FRONTEND RECONSTRUCTION, BACKEND MODERNIZATION, PLATFORM MIGRATION, AND COMPLETE DIGITAL EVOLUTION.',
    icon: 'transform',
    cta: 'SELECT TRANSFORM →',
  },
];

export type EvolveFrameworkPillar = {
  id: string;
  title: string;
  description: string;
  icon: EvolveIconId;
};

export const EVOLVE_FRAMEWORK_PILLARS: EvolveFrameworkPillar[] = [
  {
    id: 'refine',
    title: 'REFINE',
    description: 'IMPROVE WHAT ALREADY EXISTS — EXPERIENCE, DESIGN, PERFORMANCE, AND CONVERSION.',
    icon: 'refine',
  },
  {
    id: 'install',
    title: 'INSTALL',
    description: 'ADD POWERFUL SITE 00 SYSTEMS AND CAPABILITIES TO YOUR CURRENT PROPERTY.',
    icon: 'install',
  },
  {
    id: 'transform',
    title: 'TRANSFORM',
    description: 'REARCHITECT, MODERNIZE, SCALE, AND FUTURE-PROOF YOUR DIGITAL FOUNDATION.',
    icon: 'transform',
  },
];

export const EVOLVE_HOMEPAGE_EXPANDED = {
  number: '03',
  title: 'EVOLVE',
  subtitle: 'ENHANCE. INTEGRATE. TRANSFORM WHAT EXISTS.',
  overview:
    'YOUR DIGITAL PROPERTY ALREADY EXISTS. SITE 00 WORKS WITH ITS EXISTING FOUNDATION TO IMPROVE THE EXPERIENCE, INTRODUCE NEW CAPABILITIES, MODERNIZE THE UNDERLYING SYSTEM, OR TRANSFORM THE PRODUCT WITHOUT AUTOMATICALLY STARTING FROM ZERO.',
  cta: 'START EVOLVE →',
  secondaryCta: 'HOW IT WORKS',
} as const;

export const EVOLVE_ORIGIN_CARD = {
  number: '03',
  title: 'EVOLVE',
  subtitle: "ALREADY BUILT DOESN'T MEAN FINISHED.",
  body: 'BRING US WHAT EXISTS. WE\'LL TAKE IT FURTHER.',
  cta: 'EXPLORE EVOLVE →',
} as const;

export const EVOLVE_STATE_COPY = {
  headline: 'CHOOSE YOUR EVOLVE PATH',
  subhead: 'REFINE WHAT EXISTS, INSTALL NEW CAPABILITIES, OR TRANSFORM THE FOUNDATION.',
  helper: 'SITE 00 WILL ASSESS YOUR PROPERTY BEFORE FINALIZING SCOPE.',
  processHeading: 'EVOLVE / HOW IT WORKS',
  processSubhead: 'SIX STEPS FROM EXISTING PROPERTY TO STUDIO PRODUCTION.',
  footer:
    'YOU DO NOT HAVE TO START FROM ZERO. ♦ BRING WHAT EXISTS. ♦ SITE 00 EVOLVES IT FORWARD.',
  locationLabel: 'LOCATION / EVOLVE / 00',
} as const;

export const EVOLVE_HUB_SECTIONS = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'paths', label: 'PATHS' },
  { id: 'process', label: 'PROCESS' },
  { id: 'systems', label: 'SYSTEMS' },
  { id: 'cases', label: 'CASE STUDIES' },
  { id: 'faq', label: 'FAQ' },
  { id: 'start', label: 'START EVOLVE' },
] as const;

export const EVOLVE_PROCESS_STEPS = [
  { num: '01', title: 'PROPERTY', body: 'IDENTIFY YOUR EXISTING DIGITAL PROPERTY AND CURRENT STACK.' },
  { num: '02', title: 'DIAGNOSE', body: 'CLARIFY WHAT TO IMPROVE, PRESERVE, AND MEASURE AS SUCCESS.' },
  { num: '03', title: 'SYSTEMS', body: 'SELECT SITE 00 CAPABILITIES TO INSTALL OR ENHANCE.' },
  { num: '04', title: 'ACCESS', body: 'CONNECT PROVIDERS SECURELY — NEVER PLAIN-TEXT SECRETS.' },
  { num: '05', title: 'SCOPE', body: 'REVIEW ASSESSMENT, COMPATIBILITY, AND RECOMMENDED PATH.' },
  { num: '06', title: 'ENTER STUDIO', body: 'AUTHORIZE, PAY, AND ENTER THE SITE 00 OPERATING ENVIRONMENT.' },
] as const;

export type EvolveAssessmentStatus =
  | 'PENDING_ASSESSMENT'
  | 'IN_REVIEW'
  | 'COMPATIBILITY_REVIEW'
  | 'READY';

export const EVOLVE_AUDIT_LAYERS = [
  'SITE_AUDIT',
  'STACK_ANALYSIS',
  'REPOSITORY_ANALYSIS',
  'DEPENDENCY_ANALYSIS',
  'DESIGN_AUDIT',
  'RESPONSIVE_AUDIT',
  'ACCESSIBILITY_AUDIT',
  'PERFORMANCE_AUDIT',
  'INTEGRATION_MAP',
  'RISK_ANALYSIS',
] as const;

export function getEvolvePath(id: EvolvePathId): EvolvePath | undefined {
  return EVOLVE_PATHS.find((p) => p.id === id);
}
