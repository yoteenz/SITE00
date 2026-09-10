/**
 * P0.CGO.1 — Campaign coverage matrix.
 */

import type { CampaignCoverageCell, CampaignShotRole } from './types.js';

const CHANNELS = ['INSTAGRAM_FEED', 'STORY', 'REEL', 'EMAIL', 'LANDING_PAGE'];

export function buildCampaignCoverageMatrix(shots: CampaignShotRole[]): CampaignCoverageCell[] {
  const cells: CampaignCoverageCell[] = [];
  for (const shot of shots) {
    for (const channel of CHANNELS) {
      cells.push({
        shotRole: shot.role,
        channel,
        status: 'PLANNED',
      });
    }
  }
  return cells;
}
