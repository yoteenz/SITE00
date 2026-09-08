/**
 * Reference-fidelity — derived content / social package state from canonical blueprint.
 */

import type { Entry002ProductionBlueprint } from '../../../../../shared/site00-expression-engine/types.js';

export type DerivedContentStatus = 'LOCKED' | 'PENDING' | 'IN_PROGRESS' | 'READY' | 'APPROVED';

export type DerivedContentCard = {
  id: string;
  label: string;
  platform: string;
  format: string;
  status: DerivedContentStatus;
  lockedReason?: string;
};

const DERIVED_FORMATS: Array<{ format: string; label: string; platform: string }> = [
  { format: 'CAROUSEL', label: 'CAROUSEL', platform: 'INSTAGRAM' },
  { format: 'STORY', label: 'STORY', platform: 'INSTAGRAM' },
  { format: 'X', label: 'X / TWITTER', platform: 'X' },
  { format: 'TIKTOK', label: 'TIKTOK', platform: 'TIKTOK' },
];

function mapFormatStatus(
  blueprintStatus: string,
  finalReelApproved: boolean,
): DerivedContentStatus {
  if (!finalReelApproved) return 'LOCKED';
  if (blueprintStatus === 'COMPLETE' || blueprintStatus === 'QA_PASS') return 'READY';
  if (blueprintStatus === 'IN_PRODUCTION') return 'IN_PROGRESS';
  if (blueprintStatus === 'PLANNED') return 'PENDING';
  return 'PENDING';
}

export function buildDerivedContentCards(
  blueprint: Entry002ProductionBlueprint,
  finalReelApproved: boolean,
): DerivedContentCard[] {
  return DERIVED_FORMATS.map(({ format, label, platform }) => {
    const expr = blueprint.formatExpressions.find((f) => f.format === format);
    const translation = blueprint.platformTranslations.find(
      (t) => t.sourceFormat === format || t.platform === platform,
    );
    const status = mapFormatStatus(expr?.status ?? translation?.status ?? 'PLANNED', finalReelApproved);
    return {
      id: format,
      label,
      platform,
      format,
      status,
      lockedReason: !finalReelApproved ? 'FINAL REEL REQUIRED' : undefined,
    };
  });
}

export function resolveSocialPackageStatus(
  cards: DerivedContentCard[],
  finalReelApproved: boolean,
): DerivedContentStatus {
  if (!finalReelApproved) return 'LOCKED';
  if (cards.every((c) => c.status === 'READY' || c.status === 'APPROVED')) return 'APPROVED';
  if (cards.some((c) => c.status === 'IN_PROGRESS' || c.status === 'READY')) return 'IN_PROGRESS';
  return 'PENDING';
}

export function resolveCampaignBoardDerivedStatus(
  socialPackageStatus: DerivedContentStatus,
  campaignReady: boolean,
): DerivedContentStatus {
  if (campaignReady) return 'READY';
  if (socialPackageStatus === 'APPROVED') return 'PENDING';
  return 'LOCKED';
}
