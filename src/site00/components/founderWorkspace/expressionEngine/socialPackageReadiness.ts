/**
 * B5.0R1 — Canonical Social Package readiness (derived from blueprint config).
 */

import type {
  Entry002ProductionBlueprint,
  EntryFormat,
  FormatExpression,
} from '../../../../../shared/site00-expression-engine/types.js';
import type { DerivedContentCard, DerivedContentStatus } from './derivedContentState.js';

/** Upstream reel-production formats — not social-package derivatives. */
const UPSTREAM_FORMATS = new Set<EntryFormat>(['REEL', 'COVER', 'HIGHLIGHT']);

export type SocialPackageStatus = 'LOCKED' | 'INCOMPLETE' | 'IN_PROGRESS' | 'COMPLETE';

export type SocialPackageReadiness = {
  requiredDerivativeCount: number;
  readyDerivativeCount: number;
  approvedDerivativeCount: number;
  missingDerivativeCount: number;
  packageStatus: SocialPackageStatus;
  campaignBoardEligible: boolean;
  requiredFormats: EntryFormat[];
  derivatives: DerivedContentCard[];
};

export function getRequiredDerivativeFormats(
  blueprint: Entry002ProductionBlueprint,
): EntryFormat[] {
  const configured = new Set<EntryFormat>();

  for (const translation of blueprint.platformTranslations) {
    if (translation.platform === 'INSTAGRAM') {
      configured.add('CAROUSEL');
      configured.add('STORY');
    }
    if (translation.platform === 'TIKTOK') configured.add('TIKTOK');
    if (translation.platform === 'X') configured.add('X');
  }

  for (const expr of blueprint.formatExpressions) {
    if (UPSTREAM_FORMATS.has(expr.format)) continue;
    if (configured.has(expr.format)) continue;
    if (['CAROUSEL', 'STORY', 'TIKTOK', 'X'].includes(expr.format)) {
      configured.add(expr.format);
    }
  }

  const order: EntryFormat[] = ['CAROUSEL', 'STORY', 'X', 'TIKTOK'];
  return order.filter((f) => configured.has(f));
}

function mapBlueprintFormatStatus(
  expr: FormatExpression | undefined,
  finalReelApproved: boolean,
): DerivedContentStatus {
  if (!finalReelApproved) return 'LOCKED';
  const status = expr?.status ?? 'PLANNED';
  if (status === 'COMPLETE') return 'APPROVED';
  if (status === 'QA_FAIL') return 'REVISION_REQUIRED';
  if (status === 'QA_PASS') return 'AWAITING_REVIEW';
  if (status === 'IN_PRODUCTION') return 'IN_PROGRESS';
  return 'READY';
}

const FORMAT_LABELS: Record<string, { label: string; platform: string }> = {
  CAROUSEL: { label: 'CAROUSEL', platform: 'INSTAGRAM' },
  STORY: { label: 'STORY', platform: 'INSTAGRAM' },
  X: { label: 'X / TWITTER', platform: 'X' },
  TIKTOK: { label: 'TIKTOK', platform: 'TIKTOK' },
  CTA_STORY: { label: 'CTA STORY', platform: 'INSTAGRAM' },
};

export function buildDerivedContentCardsFromBlueprint(
  blueprint: Entry002ProductionBlueprint,
  finalReelApproved: boolean,
): DerivedContentCard[] {
  const required = getRequiredDerivativeFormats(blueprint);
  return required.map((format) => {
    const expr = blueprint.formatExpressions.find((f) => f.format === format);
    const translation = blueprint.platformTranslations.find(
      (t) => t.sourceFormat === format || (t.platform === 'X' && format === 'X') || (t.platform === 'TIKTOK' && format === 'TIKTOK'),
    );
    const meta = FORMAT_LABELS[format] ?? { label: format, platform: translation?.platform ?? 'SOCIAL' };
    const status = mapBlueprintFormatStatus(expr, finalReelApproved);
    return {
      id: format,
      label: meta.label,
      platform: meta.platform,
      format,
      status,
      lockedReason: !finalReelApproved ? 'FINAL REEL REQUIRED' : undefined,
      nextAction: resolveDerivativeNextAction(status),
      lineageSource: 'FINAL REEL',
    };
  });
}

function resolveDerivativeNextAction(status: DerivedContentStatus): string {
  switch (status) {
    case 'LOCKED':
      return 'AWAIT FINAL REEL';
    case 'READY':
      return 'READY TO GENERATE';
    case 'IN_PROGRESS':
      return 'GENERATION IN PROGRESS';
    case 'AWAITING_REVIEW':
      return 'FOUNDER REVIEW';
    case 'REVISION_REQUIRED':
      return 'REVISE';
    case 'APPROVED':
      return 'APPROVED';
    default:
      return 'PENDING';
  }
}

function isDerivativeApproved(status: DerivedContentStatus): boolean {
  return status === 'APPROVED';
}

function isDerivativeReady(status: DerivedContentStatus): boolean {
  return status === 'READY' || status === 'IN_PROGRESS' || status === 'AWAITING_REVIEW' || status === 'APPROVED';
}

export function buildSocialPackageReadiness(
  blueprint: Entry002ProductionBlueprint,
  finalReelApproved: boolean,
): SocialPackageReadiness {
  const derivatives = buildDerivedContentCardsFromBlueprint(blueprint, finalReelApproved);
  const requiredDerivativeCount = derivatives.length;
  const approvedDerivativeCount = derivatives.filter((d) => isDerivativeApproved(d.status)).length;
  const readyDerivativeCount = derivatives.filter((d) => isDerivativeReady(d.status)).length;
  const missingDerivativeCount = requiredDerivativeCount - approvedDerivativeCount;

  let packageStatus: SocialPackageStatus = 'LOCKED';
  if (finalReelApproved) {
    if (approvedDerivativeCount === requiredDerivativeCount && requiredDerivativeCount > 0) {
      packageStatus = 'COMPLETE';
    } else if (derivatives.some((d) => d.status === 'IN_PROGRESS' || d.status === 'AWAITING_REVIEW')) {
      packageStatus = 'IN_PROGRESS';
    } else {
      packageStatus = 'INCOMPLETE';
    }
  }

  const campaignBoardEligible = packageStatus === 'COMPLETE';

  return {
    requiredDerivativeCount,
    readyDerivativeCount,
    approvedDerivativeCount,
    missingDerivativeCount,
    packageStatus,
    campaignBoardEligible,
    requiredFormats: getRequiredDerivativeFormats(blueprint),
    derivatives,
  };
}

export function socialPackageStatusToJourneyStatus(
  readiness: SocialPackageReadiness,
): 'LOCKED' | 'ACTIVE' | 'READY' | 'APPROVED' | 'PENDING' {
  if (readiness.packageStatus === 'LOCKED') return 'LOCKED';
  if (readiness.packageStatus === 'COMPLETE') return 'APPROVED';
  if (readiness.packageStatus === 'IN_PROGRESS') return 'ACTIVE';
  if (readiness.approvedDerivativeCount > 0) return 'PENDING';
  return 'READY';
}

export function derivedSocialStatusToJourneyStatus(
  readiness: SocialPackageReadiness,
): 'LOCKED' | 'ACTIVE' | 'READY' | 'APPROVED' | 'PENDING' {
  if (!readiness.derivatives.length || readiness.packageStatus === 'LOCKED') return 'LOCKED';
  if (readiness.packageStatus === 'COMPLETE') return 'APPROVED';
  if (readiness.derivatives.some((d) => d.status === 'IN_PROGRESS' || d.status === 'AWAITING_REVIEW')) {
    return 'ACTIVE';
  }
  if (readiness.derivatives.every((d) => d.status === 'READY' || d.status === 'APPROVED')) return 'READY';
  return 'PENDING';
}
