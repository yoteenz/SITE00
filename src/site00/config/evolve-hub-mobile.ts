/**
 * EVOLVE hub — mobile experience config (reference-locked composition).
 */

import type { EvolvePathId } from './evolve';
import type { CapabilityCategory } from './capability-registry';
import { EVOLVE_HUB_SECTIONS } from './evolve';

export const EVOLVE_HUB_MOBILE_COPY = {
  location: 'LOCATION / EVOLVE / 00',
  tagline: 'ENHANCE. INTEGRATE. TRANSFORM WHAT EXISTS.',
  overviewLabel: 'OVERVIEW',
} as const;

export { EVOLVE_DIAGNOSTIC_STAGES } from './evolve-diagnostic';

export type EvolveHubPathCard = {
  pathId: EvolvePathId;
  num: string;
  modeLabel: string;
  descriptor: string;
  capabilities: string[];
  cta: string;
};

export const EVOLVE_HUB_PATH_CARDS: readonly EvolveHubPathCard[] = [
  {
    pathId: 'refine',
    num: '01',
    modeLabel: 'OPTIMIZE',
    descriptor: 'Improve what already exists — design, performance, experience, and conversion.',
    capabilities: [
      'UI/UX improvement',
      'Performance optimization',
      'SEO & conversion',
      'Content enhancement',
    ],
    cta: 'ENTER PATH →',
  },
  {
    pathId: 'install',
    num: '02',
    modeLabel: 'EXPAND',
    descriptor: 'Add powerful SITE 00 systems and capabilities to your current property.',
    capabilities: ['New features', 'Integrations', 'Automation', 'Third-party connectivity'],
    cta: 'ENTER PATH →',
  },
  {
    pathId: 'transform',
    num: '03',
    modeLabel: 'REARCHITECT',
    descriptor: 'Rearchitect, modernize, scale, and future-proof your entire digital foundation.',
    capabilities: [
      'System modernization',
      'Architecture overhaul',
      'Scalability',
      'New technology stack',
    ],
    cta: 'ENTER PATH →',
  },
] as const;

export const EVOLVE_HUB_PROCESS_COPY = {
  title: 'EVOLVE PROCESS ─',
  subtitle: 'EXISTING PROPERTY → STUDIO PRODUCTION',
} as const;

export const EVOLVE_HUB_SYSTEMS_COPY = {
  title: 'EVOLVE SYSTEMS ─',
  subtitle: 'CAPABILITIES WE INSTALL OR ENHANCE',
} as const;

export type EvolveHubSystemModule = {
  num: string;
  category: CapabilityCategory;
  title: string;
  capabilities: string[];
  iconId: 'refine' | 'install' | 'transform';
};

export const EVOLVE_HUB_SYSTEM_MODULES: readonly EvolveHubSystemModule[] = [
  {
    num: '01',
    category: 'EXPERIENCE',
    title: 'EXPERIENCE',
    capabilities: [
      'UI/UX Enhancement',
      'Responsive Systems',
      'Interactive Navigation',
      'Accessibility',
      'Design Systems',
    ],
    iconId: 'refine',
  },
  {
    num: '02',
    category: 'COMMERCE',
    title: 'COMMERCE',
    capabilities: [
      'Custom Storefront',
      'Product Configurator',
      'Checkout Optimization',
      'Memberships & Rewards',
      'Subscriptions',
    ],
    iconId: 'install',
  },
  {
    num: '03',
    category: 'OPERATIONS',
    title: 'OPERATIONS',
    capabilities: [
      'Smart Intake',
      'Client Portals',
      'Admin Tooling',
      'Workflow Automation',
      'Notifications',
    ],
    iconId: 'install',
  },
  {
    num: '04',
    category: 'INTELLIGENCE',
    title: 'INTELLIGENCE',
    capabilities: [
      'AI Assistants',
      'Personalization',
      'Content Recommendation',
      'User Insights',
      'Adaptive Experiences',
    ],
    iconId: 'transform',
  },
  {
    num: '05',
    category: 'CONNECTIONS',
    title: 'CONNECTIONS',
    capabilities: [
      'API Integrations',
      'Analytics & Insights',
      'CRM Connectors',
      'Payment Systems',
      'Third-Party APIs',
    ],
    iconId: 'transform',
  },
] as const;

export const EVOLVE_HUB_CASE_STUDIES_COPY = {
  label: 'CASE STUDIES',
  headlineLines: ['PUBLISHED EVOLVE', 'CASE STUDIES', 'COMING SOON.'],
} as const;

export const EVOLVE_HUB_FAQ_ITEMS = [
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

export const EVOLVE_HUB_FINAL_CTA = {
  headlineLine1: "YOUR PROPERTY DOESN'T NEED",
  headlineLine2: 'TO START OVER.',
  subhead: 'IT NEEDS A DIRECTION.',
  cta: 'START EVOLVE →',
} as const;

export { EVOLVE_HUB_SECTIONS };
