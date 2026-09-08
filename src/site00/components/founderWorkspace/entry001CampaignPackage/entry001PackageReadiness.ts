/**
 * B5.2 — Entry 001 package readiness (archive + missing deliverables).
 */

import type {
  Entry001CampaignAsset,
  Entry001AssetRole,
  Entry001PackageReadiness,
} from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import {
  ENTRY001_APPROVED_ARCHIVE,
  ENTRY001_REQUIRED_DELIVERABLE_ROLES,
} from '../../../config/entry001CampaignAssets.js';
import { styleContinuityLockedFromArchive } from './entry001VisualContinuity.js';

export type Entry001WhatsLeftItem = {
  id: string;
  label: string;
  complete: boolean;
};

export function buildEntry001PackageReadiness(
  extraAssets: Entry001CampaignAsset[] = [],
): Entry001PackageReadiness {
  const allApproved = [
    ...ENTRY001_APPROVED_ARCHIVE,
    ...extraAssets.filter((a) => a.approved && a.filePath && a.status === 'APPROVED'),
  ];

  const approvedRoles = new Set<Entry001AssetRole>();
  for (const asset of allApproved) {
    if (ENTRY001_REQUIRED_DELIVERABLE_ROLES.includes(asset.role as (typeof ENTRY001_REQUIRED_DELIVERABLE_ROLES)[number])) {
      approvedRoles.add(asset.role);
    }
  }

  const requiredRoles = [...ENTRY001_REQUIRED_DELIVERABLE_ROLES] as Entry001AssetRole[];
  const missingRoles = requiredRoles.filter((r) => !approvedRoles.has(r));
  const approvedDeliverableCount = requiredRoles.length - missingRoles.length;

  const archiveCount = allApproved.filter(
    (a) => !ENTRY001_REQUIRED_DELIVERABLE_ROLES.includes(a.role as (typeof ENTRY001_REQUIRED_DELIVERABLE_ROLES)[number]),
  ).length;

  const styleContinuityLocked = styleContinuityLockedFromArchive(archiveCount);
  const derivationReady = styleContinuityLocked && missingRoles.length > 0;

  let packageStatus: Entry001PackageReadiness['packageStatus'] = 'INCOMPLETE';
  if (missingRoles.length === 0) {
    packageStatus = 'COMPLETE';
  } else if (derivationReady) {
    packageStatus = 'READY_FOR_DERIVATION';
  } else if (approvedDeliverableCount > 0) {
    packageStatus = 'IN_PROGRESS';
  }

  const campaignBoardEligible = packageStatus === 'COMPLETE';

  return {
    requiredAssetCount: requiredRoles.length,
    approvedAssetCount: approvedDeliverableCount,
    missingAssetCount: missingRoles.length,
    requiredRoles,
    approvedRoles: [...approvedRoles],
    missingRoles,
    packageStatus,
    nextRequiredRole: missingRoles[0] ?? null,
    campaignBoardEligible,
    styleContinuityLocked,
    derivationReady,
  };
}

export function buildEntry001WhatsLeft(readiness: Entry001PackageReadiness): Entry001WhatsLeftItem[] {
  const labelMap: Record<string, string> = {
    FINAL_REEL: 'Final reel',
    TIKTOK_POST: 'TikTok post',
    X_POST: 'X / Twitter post',
    REEL_COVER: 'Reel cover',
    HIGHLIGHT_ICON: 'Highlight icon',
  };

  const items: Entry001WhatsLeftItem[] = readiness.requiredRoles.map((role) => ({
    id: role,
    label: labelMap[role] ?? role,
    complete: readiness.approvedRoles.includes(role),
  }));

  items.push({
    id: 'social-package',
    label: 'Social package incomplete',
    complete: readiness.packageStatus === 'COMPLETE',
  });

  return items;
}

export function resolvePlaceholderForRole(
  role: Entry001AssetRole,
  extraAssets: Entry001CampaignAsset[],
): Entry001CampaignAsset | undefined {
  return extraAssets.find((a) => a.role === role && a.approved && a.filePath);
}
