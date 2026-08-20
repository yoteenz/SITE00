/**
 * BLDR Build Classification — mobile classification page data.
 */

import type { BldrBuildClassIconId } from './bldr-build-class-icons';

export const BLDR_CLASSIFICATION_COPY = {
  location: 'BLDR / BUILD CLASSIFICATION',
  headline: 'WHAT ARE WE BUILDING?',
  subhead: 'CHOOSE THE SCALE OF YOUR DIGITAL PLACE.',
  subheadAccent: 'BLDR WILL DEFINE THE SYSTEM FROM THERE.',
  resumeLabel: 'CONTINUE BUILD',
  scaleTitle: 'BLDR / BUILD SCALE',
  scaleSubhead: 'THE CLASS DETERMINES THE STARTING ARCHITECTURE.',
  scaleSubhead2: 'FINAL SCOPE IS DEFINED THROUGH DISCOVERY.',
} as const;

export type BldrScaleRailStep = {
  num: string;
  title: string;
  subtitle: string;
};

export const BLDR_SCALE_RAIL: readonly BldrScaleRailStep[] = [
  { num: '01', title: 'SITE', subtitle: 'PROPERTY' },
  { num: '02', title: 'WORLD', subtitle: 'EXPERIENCE' },
  { num: '03', title: 'ENTERPRISE', subtitle: 'INFRASTRUCTURE' },
] as const;

export type BldrClassificationCard = {
  id: BldrBuildClassIconId;
  num: string;
  title: string;
  descriptor: string;
  explanation: string;
  listLabel: string;
  capabilities: string[];
  priceLabel?: string;
  cta: string;
  ctaFilled?: boolean;
  isDiscovery?: boolean;
  discoverySteps?: { num: string; label: string }[];
};

export const BLDR_CLASSIFICATION_CARDS: readonly BldrClassificationCard[] = [
  {
    id: 'site',
    num: '01',
    title: 'SITE',
    descriptor: 'FOCUSED DIGITAL PROPERTY.',
    explanation: 'ONE PRIMARY DIGITAL DESTINATION BUILT AROUND A DEFINED CUSTOMER JOURNEY.',
    listLabel: 'COMMON BUILDS',
    capabilities: ['COMMERCE', 'BOOKING', 'MEMBERSHIP', 'PORTFOLIO', 'SERVICE BUSINESS', 'MORE'],
    priceLabel: 'STARTING SCALE / $4K+',
    cta: 'SELECT SITE →',
  },
  {
    id: 'world',
    num: '02',
    title: 'WORLD',
    descriptor: 'IMMERSIVE DIGITAL ENVIRONMENT.',
    explanation: 'MULTIPLE EXPERIENCES, CUSTOM INTERACTION, AND CONNECTED SYSTEMS BUILT INTO ONE DIGITAL WORLD.',
    listLabel: 'COMMON BUILDS',
    capabilities: ['IMMERSIVE EXPERIENCES', 'CONFIGURATORS', 'CUSTOM PLATFORMS', 'INTERACTIVE SYSTEMS', 'MORE'],
    priceLabel: 'STARTING SCALE / $10K+',
    cta: 'SELECT WORLD →',
  },
  {
    id: 'enterprise',
    num: '03',
    title: 'ENTERPRISE',
    descriptor: 'CONNECTED DIGITAL INFRASTRUCTURE.',
    explanation: 'MULTI-SYSTEM ARCHITECTURE FOR COMPLEX OPERATIONS, USERS, DATA, INTEGRATIONS, AND SECURITY.',
    listLabel: 'SYSTEM SCALE',
    capabilities: ['MULTI-USER', 'MULTI-SYSTEM', 'CUSTOM INFRASTRUCTURE', 'INTEGRATIONS', 'ADVANCED SECURITY', 'MORE'],
    priceLabel: 'STARTING SCALE / $25K+',
    cta: 'SELECT ENTERPRISE →',
  },
  {
    id: 'not-sure',
    num: '04',
    title: 'NOT SURE?',
    descriptor: "THAT'S WHAT BLDR IS FOR.",
    explanation:
      "YOU DON'T NEED TO KNOW WHETHER YOUR IDEA IS A SITE, WORLD, OR ENTERPRISE. TELL US WHAT YOU WANT TO CREATE. WE'LL MAP THE RIGHT BUILD CLASS.",
    listLabel: '',
    capabilities: [],
    cta: 'START BLDR DISCOVERY →',
    ctaFilled: true,
    isDiscovery: true,
    discoverySteps: [
      { num: '01', label: 'TELL US THE IDEA' },
      { num: '02', label: 'BLDR MAPS THE REQUIREMENTS' },
      { num: '03', label: 'WE RECOMMEND THE BUILD CLASS' },
    ],
  },
] as const;

export type BldrScaleComparisonColumn = {
  id: BldrBuildClassIconId | 'discovery';
  num: string;
  scale: string;
  price: string;
  hint: string;
  activeDots: number;
};

export const BLDR_SCALE_COMPARISON: readonly BldrScaleComparisonColumn[] = [
  { id: 'site', num: '01', scale: 'PROPERTY', price: '$4K+', hint: 'Focused build', activeDots: 1 },
  { id: 'world', num: '02', scale: 'ENVIRONMENT', price: '$10K+', hint: 'Custom / immersive system', activeDots: 2 },
  { id: 'enterprise', num: '03', scale: 'INFRASTRUCTURE', price: '$25K+', hint: 'Complex connected architecture', activeDots: 3 },
  {
    id: 'discovery',
    num: '',
    scale: 'BLDR DISCOVERY',
    price: '—',
    hint: 'Let us determine the right build for your idea.',
    activeDots: 0,
  },
] as const;

export const BLDR_DISCOVERY_COPY = {
  location: 'BLDR / DISCOVERY',
  headline: "LET'S CLASSIFY THE BUILD.",
  subhead: 'YOU BRING THE IDEA.',
  subheadAccent: 'BLDR MAPS THE ARCHITECTURE.',
  resultLocation: 'BLDR / CLASSIFICATION RESULT',
  resultHeading: 'RECOMMENDED BUILD',
  reviewCta: 'REVIEW ANSWERS',
} as const;

export function bldrClassificationPosition(classId: BldrBuildClassIconId): string {
  if (classId === 'site') return '01 / 03';
  if (classId === 'world') return '02 / 03';
  if (classId === 'enterprise') return '03 / 03';
  return 'DISCOVERY';
}
