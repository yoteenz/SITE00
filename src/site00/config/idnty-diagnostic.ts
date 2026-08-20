/**
 * IDNTY mobile diagnostic — state classifications, investment CTAs, handoff copy.
 * Pricing/services remain sourced from IDNTY_INVESTMENT_TIERS in identity.ts.
 */

import type { IdntyBrandStateIconId } from './idnty-brand-state-icons';
import { brandStateToAssessmentSlug } from './idnty-assessment-brand-map';
import { idntyAssessmentPath } from './idnty-assessment';
import { SITE00_ROUTES, site00IdntyAssessmentDesktopPath } from './routes';

export const IDNTY_STATE_CLASSIFICATIONS: Record<IdntyBrandStateIconId, string> = {
  'starting-at-zero': 'FOUNDATION STATE',
  'some-pieces': 'PARTIAL STATE',
  'ready-evolution': 'EVOLUTION STATE',
  'build-ready': 'BUILD-READY STATE',
};

export const IDNTY_INVESTMENT_RAIL_LABELS = ['FOUNDATION', 'REFINE', 'EVOLVE', 'BUILD READY'] as const;

export type IdntyInvestmentAction = {
  code: string;
  tierLabel: string;
  statusLabel: string;
  cta: string;
  verified?: boolean;
};

export const IDNTY_INVESTMENT_ACTIONS: Record<IdntyBrandStateIconId, IdntyInvestmentAction> = {
  'starting-at-zero': {
    code: '00',
    tierLabel: 'FOUNDATION',
    statusLabel: 'IDENTITY REQUIRED',
    cta: 'BEGIN FOUNDATION →',
  },
  'some-pieces': {
    code: '01',
    tierLabel: 'REFINE',
    statusLabel: 'IDENTITY REQUIRED',
    cta: 'REFINE IDENTITY →',
  },
  'ready-evolution': {
    code: '02',
    tierLabel: 'EVOLVE',
    statusLabel: 'IDENTITY REQUIRED',
    cta: 'EVOLVE IDENTITY →',
  },
  'build-ready': {
    code: '03',
    tierLabel: 'BUILD READY',
    statusLabel: 'IDENTITY VERIFIED',
    cta: 'ENTER BLDR →',
    verified: true,
  },
};

export type IdntyHandoffCopy = {
  stateSummary: string;
  requirement: string;
  recommendedLabel: string;
  cta: string;
  nextSystemLabel: string;
  nextSystemTitle: string;
  nextSystemBody: string;
};

export const IDNTY_HANDOFF_COPY: Record<IdntyBrandStateIconId, IdntyHandoffCopy> = {
  'starting-at-zero': {
    stateSummary: '00 FOUNDATION',
    requirement: 'IDENTITY REQUIRED',
    recommendedLabel: 'RECOMMENDED NEXT STEP',
    cta: 'START IDNTY INTAKE →',
    nextSystemLabel: 'NEXT SYSTEM',
    nextSystemTitle: 'IDNTY INTAKE',
    nextSystemBody: 'BEGIN YOUR IDENTITY BUILD',
  },
  'some-pieces': {
    stateSummary: '01 REFINE',
    requirement: 'IDENTITY REQUIRED',
    recommendedLabel: 'RECOMMENDED NEXT STEP',
    cta: 'START IDNTY INTAKE →',
    nextSystemLabel: 'NEXT SYSTEM',
    nextSystemTitle: 'IDNTY INTAKE',
    nextSystemBody: 'REFINE YOUR IDENTITY SYSTEM',
  },
  'ready-evolution': {
    stateSummary: '02 EVOLVE',
    requirement: 'IDENTITY REQUIRED',
    recommendedLabel: 'RECOMMENDED NEXT STEP',
    cta: 'START IDNTY INTAKE →',
    nextSystemLabel: 'NEXT SYSTEM',
    nextSystemTitle: 'IDNTY INTAKE',
    nextSystemBody: 'EVOLVE YOUR BRAND IDENTITY',
  },
  'build-ready': {
    stateSummary: '03 BUILD READY',
    requirement: 'IDENTITY VERIFIED',
    recommendedLabel: 'RECOMMENDED NEXT STEP',
    cta: 'ENTER BLDR →',
    nextSystemLabel: 'NEXT SYSTEM',
    nextSystemTitle: 'BLDR',
    nextSystemBody: 'BEGIN YOUR DIGITAL BUILD',
  },
};

export function resolveIdntyStateDestination(
  brandStateId: IdntyBrandStateIconId,
  isDesktopArtboard: boolean,
): string {
  if (brandStateId === 'build-ready') {
    return SITE00_ROUTES.bldrStart;
  }
  const slug = brandStateToAssessmentSlug(brandStateId);
  if (!slug) return SITE00_ROUTES.idntyState;
  const path = idntyAssessmentPath(slug);
  return isDesktopArtboard ? site00IdntyAssessmentDesktopPath(path) : path;
}

export const IDNTY_DEFAULT_BRAND_STATE: IdntyBrandStateIconId = 'starting-at-zero';
