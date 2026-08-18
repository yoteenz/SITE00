/**
 * BLDR configuration — build classes, framework pillars, investment guide.
 */

import type { BldrBuildClassIconId } from './bldr-build-class-icons';

export type BuildClass = {
  id: BldrBuildClassIconId;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  icon: 'site' | 'world' | 'enterprise' | 'discovery';
  cta: string;
};

export const BLDR_BUILD_CLASSES: BuildClass[] = [
  {
    id: 'site',
    code: '01',
    title: 'SITE',
    subtitle: 'STRUCTURED DIGITAL BUILD.',
    description:
      'WEBSITES, ONLINE STORES, PORTFOLIOS, BOOKING SYSTEMS, MEMBERSHIPS, BROCHURES, AND MORE.',
    icon: 'site',
    cta: 'SELECT SITE →',
  },
  {
    id: 'world',
    code: '02',
    title: 'WORLD',
    subtitle: 'BESPOKE DIGITAL EXPERIENCE.',
    description:
      'IMMERSIVE EXPERIENCES, PLATFORMS, CUSTOM SYSTEMS, CONFIGURATORS, ADVANCED INTERACTION, AND MORE.',
    icon: 'world',
    cta: 'SELECT WORLD →',
  },
  {
    id: 'enterprise',
    code: '03',
    title: 'ENTERPRISE',
    subtitle: 'COMPLEX DIGITAL SYSTEMS.',
    description:
      'LARGE-SCALE SYSTEMS, MULTI-USER PLATFORMS, CUSTOM INFRASTRUCTURE, INTEGRATIONS, AND ADVANCED SECURITY.',
    icon: 'enterprise',
    cta: 'SELECT ENTERPRISE →',
  },
  {
    id: 'not-sure',
    code: '04',
    title: 'NOT SURE?',
    subtitle: 'LET BLDR DETERMINE.',
    description: "ANSWER A FEW QUESTIONS AND WE'LL RECOMMEND THE RIGHT BUILD CLASS FOR YOU.",
    icon: 'discovery',
    cta: 'START DISCOVERY →',
  },
];

export type BldrFrameworkPillar = {
  id: string;
  title: string;
  description: string;
  icon: 'direction' | 'structure' | 'function' | 'experience' | 'scope';
};

export const BLDR_FRAMEWORK_PILLARS: BldrFrameworkPillar[] = [
  {
    id: 'direction',
    title: 'DIRECTION',
    description: 'CLARIFY PURPOSE, GOALS, TARGET AUDIENCE, AND SUCCESS METRICS.',
    icon: 'direction',
  },
  {
    id: 'structure',
    title: 'STRUCTURE',
    description: 'DEFINE CONTENT ARCHITECTURE, PAGE HIERARCHY, USER FLOWS, AND NAVIGATIONAL LOGIC.',
    icon: 'structure',
  },
  {
    id: 'function',
    title: 'FUNCTION',
    description: 'IDENTIFY FEATURES, INTEGRATIONS, AND SYSTEM REQUIREMENTS.',
    icon: 'function',
  },
  {
    id: 'experience',
    title: 'EXPERIENCE',
    description: 'SHAPE THE USER EXPERIENCE, INTERACTIONS, MOOD, AND OVERALL VIBE.',
    icon: 'experience',
  },
  {
    id: 'scope',
    title: 'SCOPE',
    description: 'DEFINE TIMELINE, BUDGET RANGE, PRIORITIES, AND PROJECT SCALE.',
    icon: 'scope',
  },
];

export type BldrInvestmentTier = {
  id: string;
  label: string;
  priceLabel: string;
  keywords: string[];
};

export const BLDR_INVESTMENT_TIERS: BldrInvestmentTier[] = [
  {
    id: 'site-tier',
    label: 'SITE',
    priceLabel: '$4K+',
    keywords: ['WEBSITES', 'COMMERCE', 'PORTFOLIOS', 'BOOKINGS', 'MEMBERSHIPS', 'MORE'],
  },
  {
    id: 'world-tier',
    label: 'WORLD',
    priceLabel: '$10K+',
    keywords: ['IMMERSIVE', 'CONFIGURATORS', 'PLATFORMS', 'CUSTOM SYSTEMS', 'INTERACTION', 'MORE'],
  },
  {
    id: 'enterprise-tier',
    label: 'ENTERPRISE',
    priceLabel: '$25K+',
    keywords: ['MULTI-SYSTEM', 'CUSTOM', 'INTEGRATIONS', 'SECURITY', 'ADVANCED', 'MORE'],
  },
  {
    id: 'discovery-tier',
    label: 'NOT SURE?',
    priceLabel: '—',
    keywords: ['QUESTIONNAIRE', 'RECOMMENDATION', 'EXPERT REVIEW', 'CLARITY'],
  },
];

export const BLDR_HOMEPAGE_EXPANDED = {
  number: '02',
  title: 'BLDR',
  subtitle: 'START MY BUILD.',
  overview:
    'BLDR IS THE BLUEPRINT ENGINE. IT GATHERS EVERYTHING WE NEED TO PLAN, STRUCTURE, AND DESIGN YOUR SITE OR WORLD. THE INFORMATION YOU PROVIDE HERE SHAPES YOUR PROJECT\'S FUNCTION, DESIGN, AND OVERALL EXPERIENCE. ONCE COMPLETE, BLDR POWERS THE CREATION OF THREE STRATEGIC BLUEPRINT DIRECTIONS FOR YOUR REVIEW AND SELECTION.',
  offerings: [
    {
      code: '01',
      title: 'SITE',
      description:
        'STRUCTURED DIGITAL BUILD. WEBSITES, ECOMMERCE, PORTFOLIOS, LANDING PAGES, BOOKINGS, MEMBERSHIPS, AND MORE.',
      price: 'FROM $4K+',
    },
    {
      code: '02',
      title: 'WORLD',
      description:
        'BESPOKE DIGITAL EXPERIENCE. IMMERSIVE EXPERIENCES, PLATFORMS, CUSTOM SYSTEMS, CONFIGURATORS, ADVANCED INTERACTION, AND MORE.',
      price: 'FROM $10K+',
    },
  ],
  cta: 'BEGIN BLDR',
} as const;

export const BLDR_STATE_COPY = {
  headline: 'WHAT ARE WE BUILDING?',
  subhead: 'CHOOSE THE TYPE OF DIGITAL PLACE YOU NEED.',
  helper: "NOT SURE? WE'LL HELP YOU DETERMINE THE RIGHT BUILD.",
  investmentHeading: 'BLDR / INVESTMENT GUIDE',
  investmentSubhead: 'YOUR BUILD CLASS DETERMINES THE INVESTMENT SCOPE.',
  footer:
    'YOUR VISION SETS THE DIRECTION. ♦ YOUR CHOICES SHAPE THE BUILD. ♦ OUR FRAMEWORK BRINGS IT TO LIFE.',
  locationLabel: 'LOCATION / BLDR / 00',
} as const;
