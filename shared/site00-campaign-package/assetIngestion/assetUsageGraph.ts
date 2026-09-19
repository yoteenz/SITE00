/**
 * B5.7 — Asset usage graph for archive vs package safety.
 */

import type { Entry001CampaignAsset, Entry001DeliverableRecord } from '../../site00-expression-engine/entry001CampaignPackage/types.js';
import type { AssetUsageGraphNode } from './types.js';

export function buildAssetUsageGraph(args: {
  activeArchive: Entry001CampaignAsset[];
  archivedAssets: Entry001CampaignAsset[];
  removedIds: string[];
  deliverables: Entry001DeliverableRecord[];
}): AssetUsageGraphNode[] {
  const { activeArchive, archivedAssets, removedIds, deliverables } = args;
  const removed = new Set(removedIds);
  const allIds = new Set([
    ...activeArchive.map((a) => a.assetId),
    ...archivedAssets.map((a) => a.assetId),
    ...deliverables.map((d) => d.assetId),
  ]);

  const nodes: AssetUsageGraphNode[] = [];
  for (const assetId of allIds) {
    const inArchive = activeArchive.find((a) => a.assetId === assetId);
    const archived = archivedAssets.find((a) => a.assetId === assetId);
    const relatedDeliverables = deliverables.filter((d) => d.assetId === assetId);

    let archiveStatus: AssetUsageGraphNode['archiveStatus'] = 'ACTIVE';
    if (removed.has(assetId) || archived) archiveStatus = archived ? 'ARCHIVED' : 'REMOVED';
    else if (!inArchive) archiveStatus = 'REMOVED';

    nodes.push({
      assetId,
      archiveStatus,
      packageMembership: relatedDeliverables
        .filter((d) => !d.removedFromPackage && d.status !== 'DELETED')
        .map((d) => d.deliverableId),
      formatSequences: relatedDeliverables.map((d) => ({
        formatFamily: d.formatFamily,
        sequenceIndex: d.sequenceIndex ?? null,
      })),
      derivedAssets: [],
      previewUsage: relatedDeliverables.some((d) => d.approved && Boolean(d.filePath)),
      productionUsage: relatedDeliverables.some((d) => d.status === 'APPROVED' || d.approved),
    });
  }
  return nodes;
}

export function packageUsageWarning(
  graph: AssetUsageGraphNode[],
  assetId: string,
): { usedInPackage: boolean; memberships: string[] } {
  const node = graph.find((n) => n.assetId === assetId);
  if (!node) return { usedInPackage: false, memberships: [] };
  return {
    usedInPackage: node.packageMembership.length > 0,
    memberships: node.packageMembership,
  };
}
