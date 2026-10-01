/**
 * IDNTY public redesign — presentation metadata for the Diagnostic family.
 *
 * Questions, options and persistence stay in `idnty-assessment.ts` (single source of truth).
 * This file only adds how each state/step is PRESENTED inside the selected-state environment:
 * machine identity, copy, option icons, selector grammar.
 */

import type { IdntyAssessmentStateId, IdntyAssessmentStateConfig } from './idnty-assessment';
import { getIdntyAssessmentState } from './idnty-assessment';
import { IDNTY_INVESTMENT_TIERS } from './identity';
import type { IdntyBrandStateIconId } from './idnty-brand-state-icons';

export type IdentityStateCode = '00' | '01' | '02' | '03';
export type IdentityMachineId = 'foundation' | 'partial' | 'evolution' | 'authority';

export type IdentityPublicStateMeta = {
  slug: IdntyAssessmentStateId;
  code: IdentityStateCode;
  brandStateId: IdntyBrandStateIconId;
  title: string;
  classification: string;
  quote: string;
  machine: IdentityMachineId;
  /** Right-hand margin note beside the hero. */
  sideNote: string;
  whatThisMeans: string;
  deliverables: string[];
  investmentLabel: string;
  /** Detail-mode CTA. */
  detailCta: string;
  /** Red eyebrow inside the working panel (REFINE IDENTITY / EVOLVE IDENTITY). */
  workingEyebrow: string | null;
  /** Grey sub-label under the classification during review mode. */
  reviewSubLabel: string;
};

const tier = (id: string) => IDNTY_INVESTMENT_TIERS.find((t) => t.id === id);

export const IDENTITY_STATE_ORDER: IdntyAssessmentStateId[] = [
  'starting-at-zero',
  'some-pieces-exist',
  'ready-for-evolution',
  'build-ready',
];

export const IDENTITY_PUBLIC_STATES: Record<IdntyAssessmentStateId, IdentityPublicStateMeta> = {
  'starting-at-zero': {
    slug: 'starting-at-zero',
    code: '00',
    brandStateId: 'starting-at-zero',
    title: 'STARTING AT ZERO',
    classification: 'FOUNDATION STATE',
    quote: '“I HAVE THE IDEA. I NEED THE IDENTITY.”',
    machine: 'foundation',
    sideNote: 'IDENTITY IS THE FOUNDATION OF EVERYTHING THAT FOLLOWS.',
    whatThisMeans:
      "YOU'RE AT THE BEGINNING. WE'LL BUILD THE FOUNDATION OF YOUR BRAND IDENTITY FROM THE GROUND UP — DEFINING WHO YOU ARE, HOW YOU SHOW UP, AND THE VISUAL SYSTEM THAT BRINGS IT TO LIFE.",
    deliverables: ['LOGO', 'VISUAL IDENTITY', 'BRAND GUIDELINES'],
    investmentLabel: tier('foundation')?.priceLabel ?? 'FROM $2,500',
    detailCta: 'BEGIN FOUNDATION',
    workingEyebrow: null,
    reviewSubLabel: 'FOUNDATION REVIEW ASSESSMENT',
  },
  'some-pieces-exist': {
    slug: 'some-pieces-exist',
    code: '01',
    brandStateId: 'some-pieces',
    title: 'SOME PIECES EXIST',
    classification: 'PARTIAL STATE',
    quote: '“I HAVE PARTS OF MY BRAND, BUT IT ISN\'T COMPLETE YET.”',
    machine: 'partial',
    sideNote: 'CLARITY CREATES DIRECTION.',
    whatThisMeans:
      "YOU HAVE EXISTING ELEMENTS, BUT THEY NEED REFINEMENT AND ALIGNMENT. WE'LL AUDIT WHAT YOU HAVE, IDENTIFY GAPS, AND CREATE A COHESIVE, ELEVATED IDENTITY SYSTEM.",
    deliverables: ['LOGO ENHANCEMENT', 'GUIDELINES', 'VISUAL SYSTEM'],
    investmentLabel: tier('refine')?.priceLabel ?? 'FROM $1,750',
    detailCta: 'REFINE IDENTITY',
    workingEyebrow: 'REFINE IDENTITY',
    reviewSubLabel: 'REFINE IDENTITY',
  },
  'ready-for-evolution': {
    slug: 'ready-for-evolution',
    code: '02',
    brandStateId: 'ready-evolution',
    title: 'READY FOR EVOLUTION',
    classification: 'EVOLUTION STATE',
    quote: '“MY BRAND EXISTS. IT NEEDS REFINEMENT.”',
    machine: 'evolution',
    sideNote: 'EVOLUTION CREATES EXPANSION.',
    whatThisMeans:
      "YOUR IDENTITY IS ESTABLISHED, BUT IT'S TIME TO EVOLVE. WE'LL STRATEGICALLY ELEVATE YOUR BRAND WITH A REFINED DIRECTION, UPDATED VISUALS, AND A MORE POWERFUL, COHESIVE EXPRESSION.",
    deliverables: ['REBRANDING', 'STRATEGY', 'VISUAL EVOLUTION'],
    investmentLabel: tier('evolve')?.priceLabel ?? 'FROM $3,500',
    detailCta: 'EVOLVE IDENTITY',
    workingEyebrow: 'EVOLVE IDENTITY',
    reviewSubLabel: 'EVOLVE IDENTITY',
  },
  'build-ready': {
    slug: 'build-ready',
    code: '03',
    brandStateId: 'build-ready',
    title: 'BUILD READY',
    classification: 'BUILD-READY STATE',
    quote: '“MY IDENTITY IS COMPLETE. IT\'S TIME TO BUILD.”',
    machine: 'authority',
    sideNote: 'A COMPLETE IDENTITY UNLOCKS EXECUTION.',
    // HONEST copy: the authority image says "locked and verified"; no verification exists yet.
    whatThisMeans:
      "YOUR IDENTITY ALREADY EXISTS AS A COMPLETE SYSTEM. BEFORE BLDR CAN BEGIN, SITE 00 VERIFIES THE EVIDENCE BEHIND EACH IDENTITY DOMAIN SO NOTHING HAS TO BE INVENTED.",
    deliverables: ['ASSET VERIFICATION', 'PRODUCTION FILES REVIEW', 'BLDR ACCESS AFTER VERIFICATION'],
    investmentLabel: tier('build-ready-tier')?.priceLabel ?? 'NO IDNTY PURCHASE REQUIRED',
    detailCta: 'BEGIN VERIFICATION',
    workingEyebrow: null,
    reviewSubLabel: 'REVIEW VERIFICATION',
  },
};

export function identityStateMeta(slug: IdntyAssessmentStateId): IdentityPublicStateMeta {
  return IDENTITY_PUBLIC_STATES[slug];
}

export function identityStateMetaByCode(code: IdentityStateCode): IdentityPublicStateMeta {
  return IDENTITY_STATE_ORDER.map((s) => IDENTITY_PUBLIC_STATES[s]).find((m) => m.code === code)!;
}

/* -------------------------------------------------------------------------- */
/* Working-surface (question) presentation                                     */
/* -------------------------------------------------------------------------- */

export type IdentityOptionIconId =
  | 'launch' | 'globe' | 'cart' | 'bars' | 'image' | 'calendar' | 'people' | 'cube' | 'refresh' | 'dots'
  | 'palette' | 'type' | 'chat' | 'monitor' | 'social' | 'docs' | 'book' | 'layers' | 'target' | 'bolt'
  | 'wave' | 'coin-1' | 'coin-2' | 'coin-3' | 'coin-4' | 'coin-5' | 'question' | 'scatter' | 'cohesive' | 'missing'
  | 'diamond' | 'messaging' | 'strategy' | 'visual' | 'voice' | 'values' | 'experience';

export type IdentityStepPresentation = {
  /** tiles: icon tiles · cards: large descriptive cards · rows: radio rows · timeline: 2-col rows w/ icon · text: textarea */
  kind: 'tiles' | 'cards' | 'rows' | 'timeline' | 'text';
  columns?: 2 | 3 | 5;
  /** Textarea label (authority: YOUR RESPONSE) */
  fieldLabel?: string;
  /** Option id → icon */
  icons?: Record<string, IdentityOptionIconId>;
};

const GOAL_ICONS: Record<string, IdentityOptionIconId> = {
  'launch-brand': 'launch',
  'digital-presence': 'globe',
  'sell-online': 'cart',
  'generate-leads': 'bars',
  'showcase-work': 'image',
  'book-appointments': 'calendar',
  'build-community': 'people',
  'digital-product': 'cube',
  reposition: 'refresh',
  other: 'dots',
};

const BUDGET_ICONS: Record<string, IdentityOptionIconId> = {
  'under-5k': 'coin-1',
  '5k-10k': 'coin-2',
  '10k-25k': 'coin-3',
  '25k-50k': 'coin-4',
  '50k-plus': 'coin-5',
  unsure: 'question',
};

const ASSET_ICONS: Record<string, IdentityOptionIconId> = {
  logo: 'cube',
  color: 'palette',
  typography: 'type',
  tagline: 'chat',
  website: 'monitor',
  social: 'social',
  marketing: 'docs',
  photography: 'image',
  other: 'dots',
};

const GAP_ICONS: Record<string, IdentityOptionIconId> = {
  'inconsistent-visual': 'visual',
  'unclear-messaging': 'chat',
  'disconnected-touchpoints': 'palette',
  'outdated-assets': 'docs',
  'no-guidelines': 'book',
  'team-misalignment': 'people',
};

const EVOLUTION_AREA_ICONS: Record<string, IdentityOptionIconId> = {
  'brand-strategy': 'target',
  'visual-identity': 'diamond',
  'brand-messaging': 'messaging',
};

const TIMELINE_ICONS: Record<string, IdentityOptionIconId> = {
  asap: 'bolt',
  '1-2': 'calendar',
  '3-4': 'calendar',
  '5-6': 'calendar',
  '6plus': 'calendar',
  flexible: 'wave',
};

const CONDITION_ICONS: Record<string, IdentityOptionIconId> = {
  'scattered-pieces': 'scatter',
  'mostly-cohesive': 'cohesive',
  'missing-key-pieces': 'missing',
};

/** key = `${stateSlug}:${stepId}` */
export const IDENTITY_STEP_PRESENTATION: Record<string, IdentityStepPresentation> = {
  'starting-at-zero:goal': { kind: 'tiles', columns: 5, icons: GOAL_ICONS },
  'starting-at-zero:audience': { kind: 'text', fieldLabel: 'YOUR RESPONSE' },
  'starting-at-zero:timeline': { kind: 'rows' },
  'starting-at-zero:budget': { kind: 'tiles', columns: 3, icons: BUDGET_ICONS },
  'some-pieces-exist:assets': { kind: 'tiles', columns: 5, icons: ASSET_ICONS },
  'some-pieces-exist:cohesion-diagnostic': { kind: 'cards', columns: 3, icons: CONDITION_ICONS },
  'some-pieces-exist:gaps': { kind: 'tiles', columns: 3, icons: GAP_ICONS },
  'ready-for-evolution:pathways': { kind: 'cards', columns: 3, icons: EVOLUTION_AREA_ICONS },
  'ready-for-evolution:goals': { kind: 'text' },
  'ready-for-evolution:timeline': { kind: 'timeline', columns: 2, icons: TIMELINE_ICONS },
};

export function identityStepPresentation(
  slug: IdntyAssessmentStateId,
  stepId: string,
): IdentityStepPresentation | undefined {
  return IDENTITY_STEP_PRESENTATION[`${slug}:${stepId}`];
}

/** Steps of the redesigned working flow (excludes review, which is its own mode). */
export function identityFlowSteps(slug: IdntyAssessmentStateId): IdntyAssessmentStateConfig['steps'] {
  return getIdntyAssessmentState(slug)?.steps ?? [];
}

/** Compact secondary progress: QUESTION 01 OF 04. Never competes with the 00–03 state rail. */
export function identityQuestionCounter(slug: IdntyAssessmentStateId, stepId: string): string | null {
  const steps = identityFlowSteps(slug);
  const index = steps.findIndex((s) => s.id === stepId);
  if (index < 0) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `QUESTION ${pad(index + 1)} OF ${pad(steps.length)}`;
}

/** Whether the conditional OTHER field should be visible for a step's current value. */
export function isOtherSelected(value: string | string[] | undefined): boolean {
  if (Array.isArray(value)) return value.includes('other');
  return value === 'other';
}

/** 5-segment condition meter for the REFINE review (visual only — not a score). */
export const CONDITION_SEGMENTS: Record<string, number> = {
  'missing-key-pieces': 1,
  'scattered-pieces': 2,
  'mostly-cohesive': 3,
};

export type IdentityFlowMode = 'overview' | 'detail' | 'question' | 'review';
