/**
 * P0.VR.DIAG.1R4 — Child anchor extraction for nav, metrics, progress, cards.
 */

import type { PageRegionLayoutDefinition } from '../p0vrDiag1/pageRegionLayoutProfiles.js';
import type { DomRegionMeasurement, VisualRegionType } from '../p0vrDiag1/types.js';
import type { RegionChildAnchor } from './types.js';

function parseGap(gap: string | null | undefined): number | null {
  if (!gap) return null;
  const m = /^([\d.]+)/.exec(gap.trim());
  return m ? Number(m[1]) : null;
}

export function extractRegionChildAnchors(input: {
  def: PageRegionLayoutDefinition;
  dom?: DomRegionMeasurement | null;
  relatedDom?: DomRegionMeasurement[];
}): RegionChildAnchor[] {
  const anchors: RegionChildAnchor[] = [];
  const dom = input.dom;
  if (!dom || dom.actualHeight < 4) return anchors;

  const type = input.def.regionType;
  const push = (role: string, x: number, y: number, w: number, h: number, confidence: RegionChildAnchor['confidence']) => {
    anchors.push({
      anchorId: `${input.def.regionId}:${role}`,
      role,
      x,
      y,
      width: w,
      height: h,
      source: 'CHILD_ANCHOR',
      confidence,
    });
  };

  if (type === 'NAVIGATION') {
    const itemCount = Math.max(2, Math.min(6, Math.round(dom.actualWidth / 72)));
    const gap = parseGap(dom.computedGap) ?? 8;
    const itemW = (dom.actualWidth - gap * (itemCount - 1)) / itemCount;
    for (let i = 0; i < itemCount; i++) {
      const x = dom.actualX + i * (itemW + gap);
      push(`nav-item-${i}`, x, dom.actualY, itemW, dom.actualHeight, 'MEDIUM');
    }
    push('active-indicator', dom.actualX, dom.actualY + dom.actualHeight - 3, itemW, 3, 'MEDIUM');
  }

  if (type === 'STATUS') {
    push('progress-track', dom.actualX + 8, dom.actualY + dom.actualHeight * 0.55, dom.actualWidth - 16, 4, 'MEDIUM');
    push('progress-fill', dom.actualX + 8, dom.actualY + dom.actualHeight * 0.55, (dom.actualWidth - 16) * 0.45, 4, 'MEDIUM');
    push('phase-divider', dom.actualX + dom.actualWidth * 0.5, dom.actualY, 1, dom.actualHeight, 'LOW');
  }

  if (type === 'METRICS') {
    const cells = input.relatedDom?.length ? input.relatedDom : [dom];
    const cellCount = cells.length;
    cells.forEach((cell, i) => {
      push(`metric-cell-${i}`, cell.actualX, cell.actualY, cell.actualWidth, cell.actualHeight, 'HIGH');
      if (i > 0) {
        const prev = cells[i - 1]!;
        push(`divider-${i}`, prev.actualX + prev.actualWidth, cell.actualY, 1, cell.actualHeight, 'MEDIUM');
      }
    });
    if (cellCount === 1) {
      const gap = parseGap(dom.computedGap) ?? 12;
      const cellW = (dom.actualWidth - gap) / 2;
      push('metric-cell-0', dom.actualX, dom.actualY, cellW, dom.actualHeight, 'MEDIUM');
      push('metric-cell-1', dom.actualX + cellW + gap, dom.actualY, cellW, dom.actualHeight, 'MEDIUM');
    }
  }

  if (type === 'CARD_RAIL') {
    const gap = parseGap(dom.computedGap) ?? 10;
    const cardW = Math.min(280, dom.actualWidth * 0.72);
    push('card-0', dom.actualX, dom.actualY, cardW, dom.actualHeight, 'MEDIUM');
    push('card-1', dom.actualX + cardW + gap, dom.actualY, cardW, dom.actualHeight, 'LOW');
  }

  if (type === 'LIST') {
    push('list-row-0', dom.actualX, dom.actualY, dom.actualWidth, Math.min(48, dom.actualHeight), 'MEDIUM');
  }

  return anchors;
}

export function enrichDomFromChildAnchors(
  dom: DomRegionMeasurement,
  anchors: RegionChildAnchor[],
  regionType: VisualRegionType,
): DomRegionMeasurement {
  const enriched: DomRegionMeasurement = { ...dom };
  if (regionType === 'NAVIGATION') {
    const items = anchors.filter((a) => a.role.startsWith('nav-item'));
    if (items.length >= 2) {
      const gap = Math.round(items[1]!.x - (items[0]!.x + items[0]!.width));
      if (gap > 0) enriched.computedGap = `${gap}px`;
    }
    const active = anchors.find((a) => a.role === 'active-indicator');
    if (active) {
      enriched.computedPadding = enriched.computedPadding ?? '0 0 3px 0';
    }
  }
  if (regionType === 'METRICS' && !enriched.computedGap) {
    enriched.computedGap = '12px';
  }
  if (regionType === 'STATUS' && !enriched.computedPadding) {
    enriched.computedPadding = '8px 12px';
  }
  return enriched;
}
