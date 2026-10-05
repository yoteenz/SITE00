/**
 * B5.6R1 — Bridge backend deliverables to Entry 001 UI records.
 */

import type {
  CampaignPackageSnapshot,
} from '../../../../../shared/site00-campaign-package/types.js';
import type {
  Entry001DeliverableRecord,
  Entry001DeliverableStatus,
  Entry001FormatFamily,
} from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';

function mapStatus(status: string): Entry001DeliverableStatus {
  const map: Record<string, Entry001DeliverableStatus> = {
    APPROVED: 'APPROVED',
    PENDING: 'PENDING',
    UPLOADED: 'UPLOADED',
    AWAITING_REVIEW: 'AWAITING_REVIEW',
    ARCHIVED: 'ARCHIVED',
    DELETED: 'DELETED',
  };
  return map[status] ?? 'UPLOADED';
}

function mapFormatFamily(f: string): Entry001FormatFamily {
  const allowed: Entry001FormatFamily[] = ['REEL', 'CAROUSEL', 'STORY', 'TIKTOK', 'X', 'HIGHLIGHT', 'STATIC', 'OTHER'];
  return allowed.includes(f as Entry001FormatFamily) ? (f as Entry001FormatFamily) : 'OTHER';
}

export function deliverablesFromSnapshot(
  snapshot: CampaignPackageSnapshot,
): Entry001DeliverableRecord[] {
  return snapshot.deliverables.map((d) => {
    const versions = snapshot.versions.filter((v) => v.deliverableId === d.deliverableId);
    const current = versions.find((v) => v.versionId === d.currentVersionId) ?? versions[versions.length - 1];
    const asset = snapshot.assets.find((a) => a.assetId === d.assetId);
    const title = String(d.metadata?.title ?? asset?.title ?? d.deliverableType);
    const caption = String(d.metadata?.caption ?? current?.caption ?? asset?.caption ?? '');

    return {
      deliverableId: d.deliverableId,
      entryId: 'entry-001',
      packageId: d.packageId,
      assetId: d.assetId ?? '',
      assetType: (current?.assetType ?? asset?.assetType ?? d.deliverableType) as Entry001DeliverableRecord['assetType'],
      assetRole: (current?.assetRole ?? asset?.assetRole ?? null) as Entry001DeliverableRecord['assetRole'],
      formatFamily: mapFormatFamily(d.formatFamily),
      platform: d.platform,
      title,
      description: caption || null,
      filePath: current?.filePath ?? asset?.filePath ?? '',
      status: mapStatus(d.status),
      source: (current?.source ?? asset?.source ?? 'SEED') as Entry001DeliverableRecord['source'],
      approved: d.status === 'APPROVED',
      founderJudgment: asset?.founderJudgment ?? null,
      version: current ? `v${String(current.versionNumber).padStart(3, '0')}` : 'v001',
      sequenceIndex: current?.sequenceIndex ?? asset?.sequenceIndex ?? null,
      parentFormatId: null,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      archivedAt: asset?.archivedAt ?? null,
      deletedAt: d.status === 'DELETED' ? d.updatedAt : null,
      removedFromPackage: d.removedFromPackage,
      metadata: d.metadata,
      lineage: (d.lineage ?? {}) as Entry001DeliverableRecord['lineage'],
      history: versions.map((v) => ({
        version: `v${String(v.versionNumber).padStart(3, '0')}`,
        assetId: d.assetId ?? '',
        filePath: v.filePath,
        title: v.title,
        at: v.createdAt,
        status: v.supersededAt ? ('ARCHIVED' as const) : ('CURRENT' as const),
      })),
      caption,
      format: (asset?.format ?? 'IMAGE') as Entry001DeliverableRecord['format'],
    };
  });
}

export function snapshotHasBackendDeliverables(snapshot: CampaignPackageSnapshot): boolean {
  return snapshot.deliverables.length > 0;
}
