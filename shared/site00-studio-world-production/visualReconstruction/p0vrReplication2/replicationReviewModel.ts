/**
 * P0.VR.REPLICATION.2 — Simplified review model for PAGE UPGRADE.
 */

import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import { canPromote } from '../p0vrUpgrade2/promotionReadiness.js';
import type { ShellMatchResult } from './shellMatchResult.js';

export type ReplicationReviewModel = {
  authorityPreviewUrl: string | null;
  twinPreviewUrl: string | null;
  route: string;
  viewport: string;
  authorityStatusLabel: string;
  shellMatchLabel: string;
  shellMatchPass: boolean;
  macroFidelityLabel: string;
  functionPreserved: boolean;
  unresolvedAreas: string[];
  promoteReady: boolean;
  liveUnchangedNote: string;
};

export function buildReplicationReviewModel(input: {
  session: ReconstructionTwinSession;
  authorityScreenshot: string | null;
  shellMatch: ShellMatchResult | null;
}): ReplicationReviewModel {
  const shellPass = input.shellMatch?.status === 'PASS';
  const composition = input.session.convergenceAfter?.composition;
  return {
    authorityPreviewUrl: input.authorityScreenshot,
    twinPreviewUrl: input.session.twinRoute,
    route: input.session.canonicalRoute,
    viewport: input.session.viewport,
    authorityStatusLabel: input.session.authorityVersionId ? 'Reference approved' : 'Reference pending',
    shellMatchLabel: input.shellMatch?.gateLabel ?? 'Shell match pending',
    shellMatchPass: shellPass === true,
    macroFidelityLabel:
      composition != null
        ? composition >= 75
          ? 'Macro fidelity strong'
          : composition >= 55
            ? 'Macro fidelity partial'
            : 'Macro fidelity low'
        : 'Macro fidelity pending',
    functionPreserved: true,
    unresolvedAreas: input.shellMatch?.blockingReasons ?? [],
    promoteReady: Boolean(
      shellPass && input.session.promotionReadiness && canPromote(input.session.promotionReadiness),
    ),
    liveUnchangedNote: 'Live page unchanged until you promote.',
  };
}
