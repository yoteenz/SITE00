/**
 * P0.VR.1D.6 — Campaign Board reference detail audit.
 */

import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { CampaignBoardReferenceDetailAudit } from './types.js';

const CHECKLIST: Array<{ detailId: string; label: string; regionId?: string }> = [
  { detailId: 'header', label: 'Header', regionId: 'ndx.header' },
  { detailId: 'lime-diamond', label: 'NDX lime diamond', regionId: 'ndx.header' },
  { detailId: 'campaign-title', label: 'Campaign title block', regionId: 'ndx.campaign.title' },
  { detailId: 'week-01', label: 'WEEK 01', regionId: 'ndx.campaign.title' },
  { detailId: 'date-range', label: 'Date range', regionId: 'ndx.campaign.title' },
  { detailId: 'day-selector', label: 'Day selector', regionId: 'ndx.campaign.day-selector' },
  { detailId: 'pages-section', label: 'The Pages section', regionId: 'ndx.campaign.pages' },
  { detailId: 'pages-card-1', label: 'Pages card 1', regionId: 'ndx.campaign.pages.card.1' },
  { detailId: 'pages-card-2', label: 'Pages card 2', regionId: 'ndx.campaign.pages.card.2' },
  { detailId: 'margins-section', label: 'The Margins section', regionId: 'ndx.campaign.margins' },
  { detailId: 'margins-card-1', label: 'Margins card 1', regionId: 'ndx.campaign.margins.card.1' },
  { detailId: 'margins-card-2', label: 'Margins card 2', regionId: 'ndx.campaign.margins.card.2' },
  { detailId: 'margins-card-3', label: 'Margins card 3', regionId: 'ndx.campaign.margins.card.3' },
  { detailId: 'motion-section', label: 'Book in Motion', regionId: 'ndx.campaign.motion' },
  { detailId: 'bottom-nav', label: 'Bottom nav', regionId: 'ndx.bottom-nav' },
];

export type BuildCampaignBoardReferenceDetailAuditInput = {
  projectRoot?: string;
  domRegionIds?: string[];
  limeDiamondPresent?: boolean;
  artworkBound?: Record<string, boolean>;
};

export function buildCampaignBoardReferenceDetailAudit(
  input: BuildCampaignBoardReferenceDetailAuditInput = {},
): CampaignBoardReferenceDetailAudit {
  const root = input.projectRoot ?? process.cwd();
  const referencePath = join(root, 'visual-references/founder/ndxbook/mobile-campaign-board-reference.png');
  const domSet = new Set(input.domRegionIds ?? []);

  const entries = CHECKLIST.map((item) => {
    let status: CampaignBoardReferenceDetailAudit['entries'][number]['status'] = 'MATCHED';

    if (item.detailId === 'lime-diamond' && input.limeDiamondPresent === false) {
      status = 'MISSING';
    } else if (item.detailId.startsWith('pages-card-') || item.detailId.startsWith('margins-card-')) {
      const key = item.detailId.replace('pages-card-', 'pages-').replace('margins-card-', 'margins-');
      if (input.artworkBound && !input.artworkBound[key]) status = 'ASSET_MISSING';
    } else if (item.regionId && domSet.size > 0 && !domSet.has(item.regionId)) {
      status = 'MISSING';
    }

    if (!existsSync(referencePath) && status === 'MATCHED') status = 'MISSING';

    return { ...item, status };
  });

  return {
    auditId: randomUUID(),
    screenId: 'MOBILE_CAMPAIGN_BOARD',
    referencePath,
    entries,
    matched: entries.filter((e) => e.status === 'MATCHED').length,
    missing: entries.filter((e) => e.status !== 'MATCHED').length,
  };
}
