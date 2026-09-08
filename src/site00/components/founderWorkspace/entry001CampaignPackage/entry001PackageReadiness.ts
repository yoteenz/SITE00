/**
 * B5.2 / B5.4 — Entry 001 package readiness (type-aware archive + missing deliverables).
 */

import type {
  Entry001CampaignAsset,
  Entry001AssetRole,
  Entry001AssetType,
  Entry001PackageReadiness,
} from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import {
  ENTRY001_REQUIRED_DELIVERABLE_TYPES,
  ENTRY001_REQUIRED_DELIVERABLE_ROLES,
} from '../../../config/entry001CampaignAssets.js';
import { buildActiveArchive, countActiveArchive } from './entry001ArchiveIntelligence.js';
import { assetTypeToLegacyRole, legacyRoleToAssetType } from './entry001AssetTaxonomy.js';
import { styleContinuityLockedFromArchive } from './entry001VisualContinuity.js';

export type Entry001WhatsLeftItem = {
  id: string;
  label: string;
  complete: boolean;
};

export function buildEntry001PackageReadiness(
  activeArchive: Entry001CampaignAsset[] = buildActiveArchive(),
  extraDeliverables: Entry001CampaignAsset[] = [],
): Entry001PackageReadiness {
  const archiveOnly = activeArchive.filter(
    (a) =>
      !ENTRY001_REQUIRED_DELIVERABLE_TYPES.includes(
        (a.assetType ?? legacyRoleToAssetType(a.role)) as (typeof ENTRY001_REQUIRED_DELIVERABLE_TYPES)[number],
      ),
  );

  const deliverableApproved = [
    ...extraDeliverables.filter((a) => a.approved && a.filePath && a.status === 'APPROVED'),
    ...activeArchive.filter((a) =>
      ENTRY001_REQUIRED_DELIVERABLE_TYPES.includes(
        (a.assetType ?? legacyRoleToAssetType(a.role)) as (typeof ENTRY001_REQUIRED_DELIVERABLE_TYPES)[number],
      ),
    ),
  ];

  const approvedTypes = new Set<Entry001AssetType>();
  for (const asset of deliverableApproved) {
    approvedTypes.add(asset.assetType ?? legacyRoleToAssetType(asset.role));
  }

  const requiredTypes = [...ENTRY001_REQUIRED_DELIVERABLE_TYPES] as Entry001AssetType[];
  const missingTypes = requiredTypes.filter((t) => !approvedTypes.has(t));
  const approvedDeliverableCount = requiredTypes.length - missingTypes.length;

  const typedCoverage: Partial<Record<Entry001AssetType, number>> = {};
  for (const a of archiveOnly) {
    const t = a.assetType ?? legacyRoleToAssetType(a.role);
    typedCoverage[t] = (typedCoverage[t] ?? 0) + 1;
  }

  const activeCount = countActiveArchive(activeArchive);
  const styleContinuityLocked = styleContinuityLockedFromArchive(activeCount);
  const derivationReady = styleContinuityLocked && missingTypes.length > 0;

  let packageStatus: Entry001PackageReadiness['packageStatus'] = 'INCOMPLETE';
  if (missingTypes.length === 0) {
    packageStatus = 'COMPLETE';
  } else if (derivationReady) {
    packageStatus = 'READY_FOR_DERIVATION';
  } else if (approvedDeliverableCount > 0) {
    packageStatus = 'IN_PROGRESS';
  }

  const missingRoles = missingTypes.map((t) => assetTypeToLegacyRole(t)) as Entry001AssetRole[];
  const approvedRoles = [...approvedTypes].map((t) => assetTypeToLegacyRole(t)) as Entry001AssetRole[];

  return {
    requiredAssetCount: requiredTypes.length,
    approvedAssetCount: approvedDeliverableCount,
    missingAssetCount: missingTypes.length,
    requiredTypes,
    approvedTypes: [...approvedTypes],
    missingTypes,
    requiredRoles: [...ENTRY001_REQUIRED_DELIVERABLE_ROLES] as Entry001AssetRole[],
    approvedRoles,
    missingRoles,
    packageStatus,
    nextRequiredType: missingTypes[0] ?? null,
    nextRequiredRole: missingRoles[0] ?? null,
    campaignBoardEligible: packageStatus === 'COMPLETE',
    styleContinuityLocked,
    derivationReady,
    activeArchiveCount: activeCount,
    typedCoverage,
  };
}

export function buildEntry001WhatsLeft(readiness: Entry001PackageReadiness): Entry001WhatsLeftItem[] {
  const labelMap: Record<string, string> = {
    REEL: 'Final reel',
    TIKTOK: 'TikTok post',
    X_POST: 'X / Twitter post',
    REEL_COVER: 'Reel cover',
    HIGHLIGHT_ICON: 'Highlight icon',
    FINAL_REEL: 'Final reel',
    TIKTOK_POST: 'TikTok post',
  };

  const items: Entry001WhatsLeftItem[] = readiness.requiredTypes.map((type) => ({
    id: type,
    label: labelMap[type] ?? type,
    complete: readiness.approvedTypes.includes(type),
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
