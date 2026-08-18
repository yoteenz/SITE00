/**
 * IDNTY configuration — brand states, framework pillars, investment tiers.
 * Pricing is editable data, never baked into imagery.
 */

import type { IdntyBrandStateIconId } from './idnty-brand-state-icons';

export type IdentityBrandState = {
  id: IdntyBrandStateIconId;
  code: string;
  title: string;
  description: string;
  iconComplexity: 0 | 1 | 2 | 3;
};

export const IDNTY_BRAND_STATES: IdentityBrandState[] = [
  {
    id: 'starting-at-zero',
    code: '00',
    title: 'STARTING AT ZERO',
    description: 'I HAVE THE IDEA.\nI NEED THE IDENTITY.',
    iconComplexity: 0,
  },
  {
    id: 'some-pieces',
    code: '01',
    title: 'SOME PIECES EXIST',
    description: "I HAVE PARTS OF MY BRAND,\nBUT IT ISN'T COMPLETE.",
    iconComplexity: 1,
  },
  {
    id: 'needs-cohesion',
    code: '02',
    title: 'NEEDS COHESION',
    description: 'MY BRAND ELEMENTS EXIST.\nTHEY DON\'T WORK TOGETHER YET.',
    iconComplexity: 2,
  },
  {
    id: 'ready-evolution',
    code: '03',
    title: 'READY FOR EVOLUTION',
    description: 'MY BRAND EXISTS.\nIT NEEDS REFINEMENT.',
    iconComplexity: 2,
  },
  {
    id: 'build-ready',
    code: '04',
    title: 'BUILD READY',
    description: 'MY IDENTITY\nIS COMPLETE.',
    iconComplexity: 3,
  },
];

export type IdentityFrameworkPillar = {
  id: string;
  title: string;
  description: string;
  icon: 'strategy' | 'visual' | 'voice' | 'values' | 'experience';
};

export const IDNTY_FRAMEWORK_PILLARS: IdentityFrameworkPillar[] = [
  {
    id: 'strategy',
    title: 'STRATEGY',
    description: 'CLARIFY PURPOSE, AUDIENCE, AND MARKET POSITION.',
    icon: 'strategy',
  },
  {
    id: 'visual',
    title: 'VISUAL',
    description: 'BUILD A VISUAL LANGUAGE THAT IS TIMELESS AND FLEXIBLE.',
    icon: 'visual',
  },
  {
    id: 'voice',
    title: 'VOICE',
    description: 'SHAPE THE TONE AND LANGUAGE THAT SOUNDS LIKE YOU.',
    icon: 'voice',
  },
  {
    id: 'values',
    title: 'VALUES',
    description: 'DEFINE THE PRINCIPLES THAT GUIDE YOUR BRAND FORWARD.',
    icon: 'values',
  },
  {
    id: 'experience',
    title: 'EXPERIENCE',
    description: 'DESIGN THE FEELING PEOPLE HAVE AT EVERY TOUCHPOINT.',
    icon: 'experience',
  },
];

export type InvestmentTier = {
  id: string;
  label: string;
  priceLabel: string;
  services: string[];
};

export const IDNTY_INVESTMENT_TIERS: InvestmentTier[] = [
  {
    id: 'foundation',
    label: 'FOUNDATION',
    priceLabel: 'FROM $2,500',
    services: ['LOGO', 'VISUAL IDENTITY', 'BRAND GUIDELINES'],
  },
  {
    id: 'refine',
    label: 'REFINE',
    priceLabel: 'FROM $1,750',
    services: ['LOGO ENHANCEMENT', 'GUIDELINES', 'VISUAL SYSTEM'],
  },
  {
    id: 'evolve',
    label: 'EVOLVE',
    priceLabel: 'FROM $3,500',
    services: ['REBRANDING', 'STRATEGY', 'VISUAL EVOLUTION'],
  },
  {
    id: 'build-ready-tier',
    label: 'BUILD READY',
    priceLabel: 'NO IDNTY PURCHASE REQUIRED',
    services: ['ASSET VERIFICATION', 'PROCEED TO BLDR'],
  },
];

export const IDNTY_HOMEPAGE_EXPANDED = {
  number: '01',
  title: 'IDENTITY',
  subtitle: 'DEFINE MY BRAND.',
  overview:
    'IDENTITY IS THE FOUNDATION OF EVERYTHING WE BUILD. IT DEFINES WHO YOU ARE AND HOW YOU SHOW UP IN THE DIGITAL WORLD — BEFORE A SINGLE PAGE IS DESIGNED OR A LINE OF CODE IS WRITTEN.',
  defineItems: [
    'BRAND STRATEGY',
    'VISUAL IDENTITY',
    'VOICE & TONE',
    'VALUES & POSITIONING',
    'EXPERIENCE PRINCIPLES',
  ],
  cta: 'BEGIN IDENTITY',
} as const;

export const IDNTY_STATE_COPY = {
  headline: 'WHERE IS YOUR BRAND RIGHT NOW?',
  subhead:
    "CHOOSE THE STATE THAT BEST DESCRIBES YOUR FOUNDATION. WE'LL DETERMINE WHAT YOU ACTUALLY NEED FROM THERE.",
  investmentHeading: 'IDNTY / INVESTMENT',
  investmentSubhead: 'YOUR BRAND STATE DETERMINES THE SCOPE.',
  footer: 'YOUR STATE TELLS US WHERE TO START. ♦ YOUR ASSESSMENT DETERMINES WHAT YOU NEED.',
  locationLabel: 'LOCATION / IDNTY / 00',
} as const;
