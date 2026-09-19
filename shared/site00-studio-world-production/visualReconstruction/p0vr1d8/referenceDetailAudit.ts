/**
 * P0.VR.1D.8 — Lab / Experiment 01 reference detail audit.
 */

import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { LabReferenceDetailAudit } from './types.js';

const CHECKLIST: Array<{ detailId: string; label: string; regionId?: string }> = [
  { detailId: 'header', label: 'Header', regionId: 'ndx.header' },
  { detailId: 'lime-diamond', label: 'NDX lime diamond', regionId: 'ndx.header' },
  { detailId: 'breadcrumb', label: 'Breadcrumb', regionId: 'ndx.lab.breadcrumb' },
  { detailId: 'title-row', label: 'Title + status chip', regionId: 'ndx.lab.title' },
  { detailId: 'subject', label: 'Subject block', regionId: 'ndx.lab.subject' },
  { detailId: 'metrics', label: 'Metrics row', regionId: 'ndx.lab.metrics' },
  { detailId: 'grid', label: '3×3 experiment grid', regionId: 'ndx.lab.grid' },
  { detailId: 'card-1', label: 'Card 01 selected', regionId: 'ndx.lab.card.1' },
  { detailId: 'card-2', label: 'Card 02', regionId: 'ndx.lab.card.2' },
  { detailId: 'card-3', label: 'Card 03', regionId: 'ndx.lab.card.3' },
  { detailId: 'card-4', label: 'Card 04', regionId: 'ndx.lab.card.4' },
  { detailId: 'card-5', label: 'Card 05', regionId: 'ndx.lab.card.5' },
  { detailId: 'card-6', label: 'Card 06', regionId: 'ndx.lab.card.6' },
  { detailId: 'card-7', label: 'Card 07', regionId: 'ndx.lab.card.7' },
  { detailId: 'card-8', label: 'Card 08', regionId: 'ndx.lab.card.8' },
  { detailId: 'card-9', label: 'Card 09', regionId: 'ndx.lab.card.9' },
  { detailId: 'direction', label: 'Current Direction', regionId: 'ndx.lab.direction' },
  { detailId: 'inspect', label: 'Inspect Experiment', regionId: 'ndx.lab.inspect' },
  { detailId: 'bottom-nav', label: 'Bottom nav Lab active', regionId: 'ndx.bottom-nav' },
];

export type BuildLabReferenceDetailAuditInput = {
  projectRoot?: string;
  domRegionIds?: string[];
  limeDiamondPresent?: boolean;
  artworkBound?: Record<string, boolean>;
  selectedCardBorder?: boolean;
};

export function buildLabReferenceDetailAudit(
  input: BuildLabReferenceDetailAuditInput = {},
): LabReferenceDetailAudit {
  const root = input.projectRoot ?? process.cwd();
  const referencePath = join(root, 'visual-references/founder/ndxbook/mobile-lab-experiment-01-reference.png');
  const domSet = new Set(input.domRegionIds ?? []);

  const entries = CHECKLIST.map((item) => {
    let status: LabReferenceDetailAudit['entries'][number]['status'] = 'MATCHED';

    if (item.detailId === 'lime-diamond' && input.limeDiamondPresent === false) {
      status = 'MISSING';
    } else if (item.detailId === 'card-1' && input.selectedCardBorder === false) {
      status = 'BORDER_MISSING';
    } else if (item.detailId.startsWith('card-') && item.detailId !== 'card-1') {
      const key = item.detailId.replace('card-', 'exp-card-0');
      if (input.artworkBound && !input.artworkBound[key]) status = 'ASSET_MISSING';
    } else if (item.detailId === 'card-1' && input.artworkBound && !input.artworkBound['exp-card-01']) {
      status = 'ASSET_MISSING';
    } else if (item.regionId && domSet.size > 0 && !domSet.has(item.regionId)) {
      status = 'MISSING';
    }

    if (!existsSync(referencePath) && status === 'MATCHED') status = 'MISSING';

    return { ...item, status };
  });

  return {
    auditId: randomUUID(),
    screenId: 'MOBILE_LAB_EXPERIMENT_01',
    referencePath,
    entries,
    matched: entries.filter((e) => e.status === 'MATCHED').length,
    missing: entries.filter((e) => e.status !== 'MATCHED').length,
  };
}
