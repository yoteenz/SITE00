/**
 * B4 follow-up — consume locked B3.2 annotation system without reimplementing.
 * COVER IDENTITY ≠ REEL SHOT LANGUAGE.
 */

import type {
  CoverAnnotationVariationQAResult,
  CoverHeaderAnnotationPlan,
} from '../../../shared/site00-expression-engine/chapterCoverAnnotationTypes.js';
import {
  buildEntry002CoverAnnotationPlan,
} from './chapterCoverAnnotationPlans.js';
import { CHAPTER_COVER_ANNOTATION_SYSTEM_ID } from './chapterCoverAnnotationVariationSystem.js';
import { runCoverAnnotationVariationQA } from './coverAnnotationVariationQA.js';

export const B4_ANNOTATION_USAGE_RULE = {
  consumesLockedSystem: 'B3.2' as const,
  systemId: CHAPTER_COVER_ANNOTATION_SYSTEM_ID,
  doNotReimplement: true,
  doNotModifyCoreContract: true,
  governs: ['cover art', 'entry identity surfaces', 'cover-adjacent title presentation'],
  doesNotGovern: ['cinematic reel shots', 'edit suite sequences', 'fashion evidence montage'],
  reelIsNotCoverInMotion: true,
  coverIdentityNotReelShotLanguage: true,
  chapterCohesionNotAnnotationRepetition: true,
} as const;

export type CoverAnnotationSurface =
  | 'COVER'
  | 'ENTRY_IDENTITY'
  | 'REEL_TITLE_CARD'
  | 'REEL_CINEMATIC';

/** Returns locked Entry 002 cover plan — never re-selects annotations. */
export function getLockedEntry002CoverAnnotationPlan(): CoverHeaderAnnotationPlan {
  return buildEntry002CoverAnnotationPlan();
}

export type ReelTitleCardAnnotationPolicy = {
  headline: 'OH, NOW IT WAS FUN?';
  coverAuthorityMarks: 'ASTERISK after NOW + ARROW upward toward FUN';
  mayUseApprovedMarks: true;
  maySimplify: true;
  mayOmit: true;
  coverRemainsPrimaryAuthority: true;
  notRequiredToRecreateCoverExactly: true;
};

export function buildEntry002ReelTitleCardAnnotationPolicy(): ReelTitleCardAnnotationPolicy {
  const locked = getLockedEntry002CoverAnnotationPlan();
  return {
    headline: 'OH, NOW IT WAS FUN?',
    coverAuthorityMarks: `${locked.primaryMark} after ${locked.primaryTargetWord} + ${locked.secondaryMark} upward toward ${locked.secondaryTargetWord}`,
    mayUseApprovedMarks: true,
    maySimplify: true,
    mayOmit: true,
    coverRemainsPrimaryAuthority: true,
    notRequiredToRecreateCoverExactly: true,
  };
}

/** Entry 003 annotations are NOT pre-assigned in B4. */
export function entry003AnnotationsPreAssignedInB4(): false {
  return false;
}

/**
 * Run cover annotation QA ONLY for cover / entry-identity surfaces.
 * Cinematic reel shots must not fail for lacking cover markup.
 */
export function runCoverAnnotationQAForSurface(input: {
  surface: CoverAnnotationSurface;
  plan?: CoverHeaderAnnotationPlan;
  entryNumber?: number;
  priorPlan?: CoverHeaderAnnotationPlan | null;
}): CoverAnnotationVariationQAResult | null {
  const identitySurfaces: CoverAnnotationSurface[] = ['COVER', 'ENTRY_IDENTITY', 'REEL_TITLE_CARD'];
  if (!identitySurfaces.includes(input.surface)) {
    return null;
  }
  if (!input.plan) {
    return null;
  }
  return runCoverAnnotationVariationQA({
    plan: input.plan,
    entryNumber: input.entryNumber ?? 2,
    priorPlan: input.priorPlan ?? null,
  });
}

/** Reel must not force cover markup throughout cinematic body. */
export function reelForcesCoverMarkupThroughout(shotDescriptions: string[]): boolean {
  const joined = shotDescriptions.join(' ').toLowerCase();
  const forcePatterns = [
    'asterisk on every',
    'arrow on every',
    'circle every word',
    'underline every',
    'cover markup throughout',
    'recreate cover exactly on every shot',
  ];
  return forcePatterns.some((p) => joined.includes(p));
}

export function reelAnnotationOveruseBlocked(shotDescriptions: string[]): string[] {
  const blockers: string[] = [];
  if (reelForcesCoverMarkupThroughout(shotDescriptions)) {
    blockers.push('reel forces cover annotation markup throughout cinematic body');
  }
  const markupCount = shotDescriptions.filter((d) => {
    const lower = d.toLowerCase();
    return (
      lower.includes('asterisk on') ||
      lower.includes('circle around') ||
      lower.includes('underline beneath') ||
      lower.includes('arrow under')
    );
  }).length;
  if (markupCount > 1) {
    blockers.push('cover-style annotation markup appears on multiple cinematic shots — cover identity ≠ reel shot language');
  }
  return blockers;
}

export type ReelAnnotationUsageContract = {
  rule: typeof B4_ANNOTATION_USAGE_RULE;
  lockedEntry002CoverPlan: CoverHeaderAnnotationPlan;
  titleCardPolicy: ReelTitleCardAnnotationPolicy;
  entry003PreAssigned: false;
  annotationQAAppliesTo: CoverAnnotationSurface[];
  annotationQASecondaryForReel: true;
};

export function buildReelAnnotationUsageContract(): ReelAnnotationUsageContract {
  return {
    rule: B4_ANNOTATION_USAGE_RULE,
    lockedEntry002CoverPlan: getLockedEntry002CoverAnnotationPlan(),
    titleCardPolicy: buildEntry002ReelTitleCardAnnotationPolicy(),
    entry003PreAssigned: false,
    annotationQAAppliesTo: ['COVER', 'ENTRY_IDENTITY', 'REEL_TITLE_CARD'],
    annotationQASecondaryForReel: true,
  };
}
