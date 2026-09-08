/**
 * B5.5 — Entry 001 deliverable record store (persistent package outputs).
 */

import type {
  Entry001CampaignAsset,
  Entry001DeliverableRecord,
  Entry001DeliverableStatus,
  Entry001DeliverableVersion,
  Entry001FormatFamily,
} from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import {
  ENTRY001_CAROUSEL_PACKAGE_ID,
  ENTRY001_REQUIRED_DELIVERABLE_TYPES,
  ENTRY001_STORY_PACKAGE_ID,
} from '../../../config/entry001CampaignAssets.js';
import { legacyRoleToAssetType } from './entry001AssetTaxonomy.js';

export const ENTRY001_DELIVERABLES_STORAGE_KEY = 'site00_entry001_deliverables_v1';

export type Entry001DeliverablesPersisted = {
  deliverables: Entry001DeliverableRecord[];
};

const FORMAT_LABELS: Record<Entry001FormatFamily, string> = {
  REEL: 'REEL',
  CAROUSEL: 'CAROUSEL',
  STORY: 'STORY',
  TIKTOK: 'TIKTOK',
  X: 'X / TWITTER',
  HIGHLIGHT: 'HIGHLIGHT',
  STATIC: 'STATIC',
  OTHER: 'OTHER',
};

const PLATFORM_BY_FORMAT: Record<Entry001FormatFamily, string> = {
  REEL: 'INSTAGRAM',
  CAROUSEL: 'INSTAGRAM',
  STORY: 'INSTAGRAM',
  TIKTOK: 'TIKTOK',
  X: 'X',
  HIGHLIGHT: 'INSTAGRAM',
  STATIC: 'INSTAGRAM',
  OTHER: 'OTHER',
};

export function assetTypeToFormatFamily(assetType: Entry001CampaignAsset['assetType']): Entry001FormatFamily {
  const map: Partial<Record<Entry001CampaignAsset['assetType'], Entry001FormatFamily>> = {
    REEL: 'REEL',
    REEL_COVER: 'REEL',
    HIGHLIGHT_ICON: 'HIGHLIGHT',
    CAROUSEL: 'CAROUSEL',
    CAROUSEL_SLIDE: 'CAROUSEL',
    STORY: 'STORY',
    STORY_FRAME: 'STORY',
    CTA_FRAME: 'STORY',
    TIKTOK: 'TIKTOK',
    X_POST: 'X',
    STATIC_POST: 'STATIC',
    QUOTE_POST: 'STATIC',
    INFOGRAPHIC: 'STATIC',
    REFERENCE_ONLY: 'OTHER',
    OTHER: 'OTHER',
  };
  return map[assetType] ?? 'OTHER';
}

export function formatFamilyLabel(family: Entry001FormatFamily): string {
  return FORMAT_LABELS[family];
}

export function formatFamilyPlatform(family: Entry001FormatFamily): string {
  return PLATFORM_BY_FORMAT[family];
}

export const ENTRY001_PACKAGE_FORMAT_FAMILIES: Entry001FormatFamily[] = [
  'REEL',
  'CAROUSEL',
  'STORY',
  'TIKTOK',
  'X',
  'HIGHLIGHT',
];

function deliverableStatusFromAsset(asset: Entry001CampaignAsset): Entry001DeliverableStatus {
  if (asset.status === 'ARCHIVED') return 'ARCHIVED';
  if (asset.status === 'MISSING' || !asset.filePath) return 'PENDING';
  if (asset.status === 'AWAITING_FOUNDER_APPROVAL') return 'AWAITING_REVIEW';
  if (asset.approved) return 'APPROVED';
  return 'UPLOADED';
}

export function createDeliverableFromAsset(
  asset: Entry001CampaignAsset,
  existing?: Entry001DeliverableRecord,
): Entry001DeliverableRecord {
  const assetType = asset.assetType ?? legacyRoleToAssetType(asset.role);
  const now = new Date().toISOString();
  const deliverableId = existing?.deliverableId ?? `entry001-del-${asset.assetId}`;
  const version = existing?.version ?? asset.version ?? 'v001';
  const history: Entry001DeliverableVersion[] = existing?.history?.length
    ? existing.history
    : [
        {
          version,
          assetId: asset.assetId,
          filePath: asset.filePath,
          title: asset.title,
          at: asset.createdAt ?? now,
          status: 'CURRENT',
        },
      ];

  return {
    deliverableId,
    entryId: 'entry-001',
    packageId: asset.packageId ?? null,
    assetId: asset.assetId,
    assetType,
    assetRole: asset.assetRole ?? null,
    formatFamily: assetTypeToFormatFamily(assetType),
    platform: formatFamilyPlatform(assetTypeToFormatFamily(assetType)),
    title: asset.title,
    description: asset.notes ?? null,
    filePath: asset.filePath,
    status: deliverableStatusFromAsset(asset),
    source: asset.source,
    approved: asset.approved,
    founderJudgment: asset.founderJudgment ?? null,
    version,
    sequenceIndex: asset.sequenceIndex ?? null,
    parentFormatId: asset.packageId ?? null,
    createdAt: existing?.createdAt ?? asset.createdAt ?? now,
    updatedAt: now,
    archivedAt: asset.archivedAt ?? null,
    deletedAt: existing?.deletedAt ?? null,
    removedFromPackage: existing?.removedFromPackage ?? false,
    metadata: {},
    lineage: asset.lineage,
    history,
    caption: existing?.caption ?? null,
    format: asset.format,
  };
}

export function isPackageDeliverableAsset(asset: Entry001CampaignAsset): boolean {
  const type = asset.assetType ?? legacyRoleToAssetType(asset.role);
  if (ENTRY001_REQUIRED_DELIVERABLE_TYPES.includes(type as (typeof ENTRY001_REQUIRED_DELIVERABLE_TYPES)[number])) {
    return true;
  }
  if (type === 'CAROUSEL_SLIDE' && asset.packageId === ENTRY001_CAROUSEL_PACKAGE_ID) return true;
  if ((type === 'STORY_FRAME' || type === 'CTA_FRAME') && asset.packageId === ENTRY001_STORY_PACKAGE_ID) {
    return true;
  }
  return false;
}

export function syncDeliverablesFromAssets(
  activeAssets: Entry001CampaignAsset[],
  extraAssets: Entry001CampaignAsset[],
  existing: Entry001DeliverableRecord[] = [],
): Entry001DeliverableRecord[] {
  const byAssetId = new Map(existing.map((d) => [d.assetId, d]));
  const packageAssets = [...activeAssets, ...extraAssets].filter(isPackageDeliverableAsset);
  const synced: Entry001DeliverableRecord[] = [];

  for (const asset of packageAssets) {
    if (asset.removedFromActiveArchive) continue;
    const prev = byAssetId.get(asset.assetId);
    if (prev?.removedFromPackage || prev?.status === 'DELETED') {
      synced.push(prev);
      continue;
    }
    synced.push(createDeliverableFromAsset(asset, prev));
  }

  for (const prev of existing) {
    if (!synced.some((d) => d.deliverableId === prev.deliverableId)) {
      if (prev.status !== 'DELETED') synced.push(prev);
    }
  }

  return synced.sort((a, b) => {
    if (a.formatFamily !== b.formatFamily) {
      return ENTRY001_PACKAGE_FORMAT_FAMILIES.indexOf(a.formatFamily) -
        ENTRY001_PACKAGE_FORMAT_FAMILIES.indexOf(b.formatFamily);
    }
    return (a.sequenceIndex ?? 999) - (b.sequenceIndex ?? 999);
  });
}

export function getDeliverableById(
  deliverables: Entry001DeliverableRecord[],
  deliverableId: string,
): Entry001DeliverableRecord | undefined {
  return deliverables.find((d) => d.deliverableId === deliverableId);
}

export function getActivePackageDeliverables(
  deliverables: Entry001DeliverableRecord[],
): Entry001DeliverableRecord[] {
  return deliverables.filter(
    (d) => !d.removedFromPackage && d.status !== 'DELETED' && d.status !== 'ARCHIVED',
  );
}

export function removeDeliverableFromPackage(
  deliverables: Entry001DeliverableRecord[],
  deliverableId: string,
): Entry001DeliverableRecord[] {
  const now = new Date().toISOString();
  return deliverables.map((d) =>
    d.deliverableId === deliverableId
      ? { ...d, removedFromPackage: true, status: 'REMOVED' as const, updatedAt: now }
      : d,
  );
}

export function archiveDeliverable(
  deliverables: Entry001DeliverableRecord[],
  deliverableId: string,
): Entry001DeliverableRecord[] {
  const now = new Date().toISOString();
  return deliverables.map((d) =>
    d.deliverableId === deliverableId
      ? {
          ...d,
          status: 'ARCHIVED' as const,
          archivedAt: now,
          removedFromPackage: true,
          updatedAt: now,
        }
      : d,
  );
}

export function restoreDeliverableToPackage(
  deliverables: Entry001DeliverableRecord[],
  deliverableId: string,
): Entry001DeliverableRecord[] {
  const now = new Date().toISOString();
  return deliverables.map((d) =>
    d.deliverableId === deliverableId
      ? {
          ...d,
          removedFromPackage: false,
          status: d.approved ? ('APPROVED' as const) : ('UPLOADED' as const),
          archivedAt: null,
          updatedAt: now,
        }
      : d,
  );
}

export function deleteDeliverablePermanently(
  deliverables: Entry001DeliverableRecord[],
  deliverableId: string,
): Entry001DeliverableRecord[] {
  const now = new Date().toISOString();
  return deliverables.map((d) =>
    d.deliverableId === deliverableId
      ? {
          ...d,
          status: 'DELETED' as const,
          deletedAt: now,
          removedFromPackage: true,
          filePath: '',
          updatedAt: now,
        }
      : d,
  );
}

export function replaceDeliverableFile(
  deliverables: Entry001DeliverableRecord[],
  deliverableId: string,
  newFilePath: string,
  newTitle?: string,
): Entry001DeliverableRecord[] {
  const now = new Date().toISOString();
  return deliverables.map((d) => {
    if (d.deliverableId !== deliverableId) return d;
    const nextVersion = `v${String(d.history.length + 1).padStart(3, '0')}`;
    const archivedHistory = d.history.map((h) =>
      h.status === 'CURRENT' ? { ...h, status: 'ARCHIVED' as const } : h,
    );
    return {
      ...d,
      filePath: newFilePath,
      title: newTitle ?? d.title,
      version: nextVersion,
      status: 'AWAITING_REVIEW' as const,
      approved: false,
      updatedAt: now,
      history: [
        ...archivedHistory,
        {
          version: nextVersion,
          assetId: d.assetId,
          filePath: newFilePath,
          title: newTitle ?? d.title,
          at: now,
          status: 'CURRENT' as const,
        },
      ],
    };
  });
}

export function updateDeliverableMetadata(
  deliverables: Entry001DeliverableRecord[],
  deliverableId: string,
  patch: Partial<
    Pick<
      Entry001DeliverableRecord,
      'title' | 'assetType' | 'assetRole' | 'formatFamily' | 'platform' | 'sequenceIndex' | 'caption' | 'description'
    >
  >,
): Entry001DeliverableRecord[] {
  const now = new Date().toISOString();
  return deliverables.map((d) => {
    if (d.deliverableId !== deliverableId) return d;
    const assetType = patch.assetType ?? d.assetType;
    return {
      ...d,
      ...patch,
      formatFamily: patch.formatFamily ?? assetTypeToFormatFamily(assetType),
      platform: patch.platform ?? formatFamilyPlatform(patch.formatFamily ?? assetTypeToFormatFamily(assetType)),
      updatedAt: now,
    };
  });
}

export function reorderDeliverablesInFormat(
  deliverables: Entry001DeliverableRecord[],
  formatFamily: Entry001FormatFamily,
  orderedIds: string[],
): Entry001DeliverableRecord[] {
  const now = new Date().toISOString();
  const indexMap = new Map(orderedIds.map((id, i) => [id, i + 1]));
  return deliverables.map((d) => {
    if (d.formatFamily !== formatFamily) return d;
    const idx = indexMap.get(d.deliverableId);
    if (idx == null) return d;
    return { ...d, sequenceIndex: idx, updatedAt: now };
  });
}

export function loadDeliverablesState(): Entry001DeliverablesPersisted {
  if (typeof window === 'undefined') return { deliverables: [] };
  try {
    const raw = localStorage.getItem(ENTRY001_DELIVERABLES_STORAGE_KEY);
    if (!raw) return { deliverables: [] };
    return JSON.parse(raw) as Entry001DeliverablesPersisted;
  } catch {
    return { deliverables: [] };
  }
}

export function persistDeliverablesState(state: Entry001DeliverablesPersisted): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ENTRY001_DELIVERABLES_STORAGE_KEY, JSON.stringify(state));
}
