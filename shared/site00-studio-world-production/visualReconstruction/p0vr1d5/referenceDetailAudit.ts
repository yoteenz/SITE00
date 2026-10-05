/**
 * P0.VR.1D.5 — Reference detail audit for mobile overview micro-fidelity.
 */

import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ReferenceDetailAudit, ReferenceDetailAuditEntry } from './types.js';

const OVERVIEW_DETAIL_CHECKLIST: Array<{ detailId: string; label: string; regionId?: string }> = [
  { detailId: 'header', label: 'Header', regionId: 'ndx.header' },
  { detailId: 'overview-eyebrow', label: 'Overview eyebrow', regionId: 'ndx.overview.hero' },
  { detailId: 'page-title', label: 'Page title', regionId: 'ndx.overview.hero' },
  { detailId: 'supporting-copy', label: 'Supporting copy', regionId: 'ndx.overview.hero' },
  { detailId: 'today-label', label: 'Today at NDX label', regionId: 'ndx.overview.kpis' },
  { detailId: 'today-date', label: 'Today date', regionId: 'ndx.overview.kpis' },
  { detailId: 'kpi-being-made', label: 'KPI Being Made', regionId: 'ndx.overview.kpis' },
  { detailId: 'kpi-need-eye', label: 'KPI Need Your Eye', regionId: 'ndx.overview.kpis' },
  { detailId: 'kpi-developing', label: 'KPI Developing', regionId: 'ndx.overview.kpis' },
  { detailId: 'kpi-audience', label: 'KPI From Audience', regionId: 'ndx.overview.kpi.audience' },
  { detailId: 'kpi-divider', label: 'KPI section divider', regionId: 'ndx.overview.kpis' },
  { detailId: 'production-heading', label: 'In Production heading', regionId: 'ndx.overview.production' },
  { detailId: 'production-view-all', label: 'In Production view all', regionId: 'ndx.overview.production' },
  { detailId: 'card-subscription', label: 'Subscription card', regionId: 'ndx.overview.production.card.subscription' },
  { detailId: 'card-layoff', label: 'Layoff memo card', regionId: 'ndx.overview.production.card.layoff' },
  { detailId: 'card-late-fees', label: 'Late fees card', regionId: 'ndx.overview.production.card.late-fees' },
  { detailId: 'radar-heading', label: 'Radar heading', regionId: 'ndx.overview.radar' },
  { detailId: 'radar-view-all', label: 'Radar view all', regionId: 'ndx.overview.radar' },
  { detailId: 'radar-rows', label: 'Radar list rows', regionId: 'ndx.overview.radar' },
  { detailId: 'bottom-nav', label: 'Bottom nav', regionId: 'ndx.bottom-nav' },
];

export type BuildReferenceDetailAuditInput = {
  projectRoot?: string;
  domRegionIds?: string[];
  metrics?: { fromAudience: number | null };
  artworkBound?: Record<string, boolean>;
  bordersPresent?: Record<string, boolean>;
};

export function buildReferenceDetailAudit(input: BuildReferenceDetailAuditInput = {}): ReferenceDetailAudit {
  const root = input.projectRoot ?? process.cwd();
  const referencePath = join(root, 'visual-references/founder/ndxbook/mobile-overview-menu-open.png');
  const domSet = new Set(input.domRegionIds ?? []);
  const entries: ReferenceDetailAuditEntry[] = [];

  for (const item of OVERVIEW_DETAIL_CHECKLIST) {
    let status: ReferenceDetailAuditEntry['status'] = 'MATCHED';

    if (item.detailId === 'kpi-audience') {
      if (input.metrics?.fromAudience == null || input.metrics.fromAudience === undefined) {
        status = 'TEXT_MISSING';
      }
    } else if (item.detailId.startsWith('card-')) {
      const key = item.detailId.replace('card-', '');
      if (input.artworkBound && !input.artworkBound[key]) {
        status = 'ASSET_MISSING';
      }
    } else if (item.detailId === 'kpi-divider' && input.bordersPresent && !input.bordersPresent.kpi) {
      status = 'BORDER_MISSING';
    } else if (item.regionId && domSet.size > 0 && !domSet.has(item.regionId)) {
      status = 'MISSING';
    }

    if (!existsSync(referencePath) && status === 'MATCHED') {
      status = 'MISSING';
    }

    entries.push({ ...item, status });
  }

  const count = (s: ReferenceDetailAuditEntry['status']) => entries.filter((e) => e.status === s).length;

  return {
    auditId: randomUUID(),
    screenId: 'MOBILE_OVERVIEW',
    referencePath,
    entries,
    matched: count('MATCHED'),
    missing: count('MISSING') + count('TEXT_MISSING') + count('ASSET_MISSING'),
    spacingDrift: count('SPACING_DRIFT'),
    typographyDrift: count('TYPOGRAPHY_DRIFT'),
    borderDrift: count('BORDER_MISSING'),
    assetDrift: count('ASSET_MISSING'),
  };
}
