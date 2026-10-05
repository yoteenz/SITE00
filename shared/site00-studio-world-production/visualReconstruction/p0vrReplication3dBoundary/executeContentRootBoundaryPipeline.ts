import type { AuthorityCoordinateMap } from '../p0vrReplication3d/types.js';
import type { ReplicationAssetSlot } from '../p0vrReplication3c/types.js';
import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import { buildReplicationRenderBoundaryReceipt } from './buildReplicationRenderBoundaryReceipt.js';
import { enforceHeroSlotBindings } from './enforceHeroSlotBindings.js';
import type { ReplicationRenderBoundaryReceipt } from './types.js';

export type ContentRootBoundaryResult = {
  report: ReplicationRenderBoundaryReceipt;
  sessionPatch: Partial<ReconstructionTwinSession>;
};

export function executeContentRootBoundaryPipeline(input: {
  session: ReconstructionTwinSession;
  assetSlots: ReplicationAssetSlot[];
  coordinateMap: AuthorityCoordinateMap | null;
}): ContentRootBoundaryResult {
  const enforced = enforceHeroSlotBindings(input.assetSlots);
  const report = buildReplicationRenderBoundaryReceipt({
    session: input.session,
    assetSlots: enforced.slots,
    coordinateMap: input.coordinateMap,
    strippedHeroSlotIds: enforced.strippedSlotIds,
  });

  return {
    report,
    sessionPatch: {
      replicationAssetSlots: enforced.slots,
      replicationRenderBoundaryReport: report,
    },
  };
}
