import type { EvolvePricingMode, EvolvePricingPlan } from './types.js';

export const EVOLVE_PRICING_HERO = {
  title: 'EVOLVE',
  subtitle: 'HOW DO YOU WANT TO EVOLVE?',
  intro:
    'SAME POWERFUL SYSTEM. TWO WAYS FORWARD. CHOOSE HOW YOU WANT TO PUT EVOLVE TO WORK.',
  diagramLabel: 'SAME FOUNDATION. GREATER POTENTIAL.',
  smartLabel: 'EVOLVE SMARTER.',
} as const;

export const EVOLVE_PRICING_MODE_COPY: Record<
  EvolvePricingMode,
  { label: string; sublabel: string; description: string; sectionTitle: string; sectionSubtitle: string }
> = {
  SELF_DIRECTED: {
    label: 'SELF-DIRECTED',
    sublabel: 'USE THE SYSTEM YOURSELF.',
    description: 'FLEXIBLE PLANS FOR CREATORS, FOUNDERS, AND TEAMS.',
    sectionTitle: 'SELF-DIRECTED PLANS',
    sectionSubtitle: 'PLANS FOR EVERY STAGE',
  },
  SITE00_DIRECTED: {
    label: 'SITE 00 DIRECTED',
    sublabel: 'WE USE THE SYSTEM FOR YOU.',
    description: 'FIVE WAYS TO EVOLVE. A CLEAR PATH FROM INSIGHT TO IMPACT.',
    sectionTitle: 'DIRECTED PRICING',
    sectionSubtitle: 'DIFFERENT NEEDS. A CLEARER PATH FOR WHAT’S NEXT.',
  },
};

export const EVOLVE_SELF_DIRECTED_PLANS: EvolvePricingPlan[] = [
  {
    id: 'evolve-solo',
    index: '01',
    name: 'EVOLVE SOLO',
    subtitle: 'BUILD YOUR BRAND',
    price: '$39/MO',
    priceDetail: '1 ACTIVE BRAND',
    bullets: ['10 CREATIVE RUNS', '1 REVIEWER', 'BEST FOR SOLO FOUNDERS'],
    iconId: 'solo',
    ctaLabel: 'GET STARTED →',
    ctaRoute: '/origin/sign-in?plan=evolve-solo',
    featured: true,
  },
  {
    id: 'evolve-studio',
    index: '02',
    name: 'EVOLVE STUDIO',
    subtitle: 'EXPAND YOUR WORK',
    price: '$89/MO',
    priceDetail: 'UP TO 5 PROJECTS',
    bullets: ['30 CREATIVE RUNS', 'CLIENT REVIEWS', 'BEST FOR CREATORS'],
    iconId: 'studio',
    ctaLabel: 'GET STARTED →',
    ctaRoute: '/origin/sign-in?plan=evolve-studio',
  },
  {
    id: 'evolve-pro',
    index: '03',
    name: 'EVOLVE PRO',
    subtitle: 'SCALE WITH CONFIDENCE',
    price: '$179/MO',
    priceDetail: 'UP TO 15 PROJECTS',
    bullets: ['75 CREATIVE RUNS', 'TEAM / CLIENT ACCESS', 'BEST FOR SMALL AGENCIES'],
    iconId: 'pro',
    ctaLabel: 'GET STARTED →',
    ctaRoute: '/origin/sign-in?plan=evolve-pro',
  },
  {
    id: 'project-pass',
    index: '04',
    name: 'PROJECT PASS',
    subtitle: 'ONE PROJECT. ZERO COMMITMENT.',
    price: '$99 ONE TIME',
    priceDetail: '30 DAYS • 1 PROJECT',
    bullets: ['FULL CREATIVE RUN', 'NO RETAINER', 'BEST FOR A SINGLE PUSH'],
    iconId: 'project-pass',
    ctaLabel: 'GET STARTED →',
    ctaRoute: '/origin/sign-in?plan=project-pass',
  },
  {
    id: 'agency-enterprise',
    index: '05',
    name: 'AGENCY / ENTERPRISE',
    subtitle: 'CUSTOM SOLUTIONS AT SCALE.',
    price: 'TALK TO SITE 00',
    priceDetail: 'TAILORED PRICING',
    bullets: ['CUSTOM SCOPE', 'AGENCY-LEVEL SUPPORT', 'IDEAL FOR COMPLEX INITIATIVES'],
    iconId: 'agency-enterprise',
    ctaLabel: 'TALK TO SITE 00 →',
    ctaRoute: '/contact',
  },
];

export const EVOLVE_DIRECTED_PLANS: EvolvePricingPlan[] = [
  {
    id: 'discovery-sprint',
    index: '01',
    name: 'DISCOVERY SPRINT',
    subtitle: 'AUDIT + STRATEGY + ROADMAP',
    price: '$750',
    priceDetail: 'ONE-TIME',
    bullets: ['FOUNDATION REVIEW', 'ACTION PLAN', 'BEST FOR FIRST STEP'],
    footer: 'THE STARTING STEP FOR CLIENTS WHO NEED CLARITY BEFORE A BUILD.',
    badge: 'ONE-TIME',
    iconId: 'discovery-sprint',
    ctaLabel: 'GET STARTED →',
    ctaRoute: '/contact?offer=discovery-sprint',
    featured: true,
  },
  {
    id: 'directed-build',
    index: '02',
    name: 'DIRECTED BUILD',
    subtitle: 'EXECUTION-FOCUSED',
    price: '$2,500/MO',
    priceDetail: 'MONTHLY',
    bullets: ['1 ACTIVE PROJECT', 'WEEKLY DIRECTION', 'BEST FOR DEFINED BUILDS'],
    footer: 'EXECUTION OF A DEFINED BUILD OR EVOLUTION SCOPE.',
    iconId: 'directed-build',
    ctaLabel: 'GET STARTED →',
    ctaRoute: '/contact?offer=directed-build',
  },
  {
    id: 'growth-partner',
    index: '03',
    name: 'GROWTH PARTNER',
    subtitle: 'ONGOING EVOLUTION',
    price: '$4,800/MO+',
    priceDetail: 'MONTHLY',
    bullets: ['STRATEGY + CREATIVE', 'DIGITAL OVERSIGHT', 'BEST FOR SCALING BRANDS'],
    footer: 'ONGOING STRATEGY + CREATIVE + DIGITAL OVERSIGHT.',
    iconId: 'growth-partner',
    ctaLabel: 'GET STARTED →',
    ctaRoute: '/contact?offer=growth-partner',
  },
  {
    id: 'marketing-retainer',
    index: '04',
    name: 'MARKETING RETAINER',
    subtitle: 'CAMPAIGNS + CONTENT',
    price: 'FROM $1,200/MO',
    priceDetail: 'MONTHLY',
    bullets: ['MARKETING-ONLY SUPPORT', 'CAMPAIGN STRATEGY', 'CONTENT SYSTEMS'],
    footer: 'MARKETING-ONLY SUPPORT + CAMPAIGNS + CONTENT.',
    iconId: 'marketing-retainer',
    ctaLabel: 'GET STARTED →',
    ctaRoute: '/contact?offer=marketing-retainer',
  },
  {
    id: 'custom-agency',
    index: '05',
    name: 'CUSTOM / AGENCY',
    subtitle: 'TAILORED FOR LARGER NEEDS',
    price: 'CUSTOM',
    priceDetail: "LET'S TALK",
    bullets: ['CUSTOM SCOPE', 'AGENCY-LEVEL SUPPORT', 'IDEAL FOR COMPLEX INITIATIVES'],
    footer: 'A TAILORED SOLUTION FOR UNIQUE OR ENTERPRISE NEEDS.',
    iconId: 'custom-agency',
    ctaLabel: 'TALK TO SITE 00 →',
    ctaRoute: '/contact?offer=custom-agency',
  },
];

export const EVOLVE_PRICING_FOOTER = {
  tagline: 'ENHANCE. INTEGRATE. TRANSFORM WHAT EXISTS.',
  copyright: '© 2024 SITE 00 / EVOLVE / BUILD WHAT\'S NEXT.',
} as const;

export const EVOLVE_DIRECTED_REINFORCEMENT = {
  title: 'NOT SURE WHERE TO START?',
  body: 'THE DISCOVERY SPRINT IS THE BEST FIRST STEP IF YOU NEED CLARITY ON SCOPE, OPPORTUNITIES, AND A PLAN FOR WHAT\'S NEXT.',
  aside: 'CLARITY CREATES MOMENTUM.',
} as const;

export function plansForMode(mode: EvolvePricingMode): EvolvePricingPlan[] {
  return mode === 'SELF_DIRECTED' ? EVOLVE_SELF_DIRECTED_PLANS : EVOLVE_DIRECTED_PLANS;
}

export function parsePricingModeParam(value: string | null): EvolvePricingMode {
  if (value === 'directed' || value === 'site00-directed' || value === 'SITE00_DIRECTED') {
    return 'SITE00_DIRECTED';
  }
  return 'SELF_DIRECTED';
}

export function pricingModeToParam(mode: EvolvePricingMode): string {
  return mode === 'SITE00_DIRECTED' ? 'directed' : 'self-directed';
}
