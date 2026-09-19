/**
 * P0.VR.DIAG.1R5 — Current-side internal region structure from DOM measurements.
 */

import type { PageRegionLayoutDefinition } from '../p0vrDiag1/pageRegionLayoutProfiles.js';
import type { DomRegionMeasurement, VisualRegionType } from '../p0vrDiag1/types.js';
import { resolveComplexRegionSubtype } from './complexRegionSubtypeResolver.js';
import {
  collectMeaningfulChildCandidates,
  detectRepeatedRowGeometry,
} from './meaningfulChildTraversal.js';
import { resolveMetricRegionSubtype } from './metricRegionSubtypeResolver.js';
import type {
  AnchorBounds,
  InternalStructureStatus,
  RegionChildAnchorR5,
  RegionInternalStructure,
  RegionRelationship,
  RepeatedAnchorGroup,
} from './types.js';

function boundsFromDom(dom: DomRegionMeasurement, container?: DomRegionMeasurement): AnchorBounds {
  const b: AnchorBounds = {
    x: dom.actualX,
    y: dom.actualY,
    width: dom.actualWidth,
    height: dom.actualHeight,
  };
  if (container && container.actualWidth > 0 && container.actualHeight > 0) {
    b.xPctWithinRegion = (dom.actualX - container.actualX) / container.actualWidth;
    b.yPctWithinRegion = (dom.actualY - container.actualY) / container.actualHeight;
    b.widthPctOfRegion = dom.actualWidth / container.actualWidth;
    b.heightPctOfRegion = dom.actualHeight / container.actualHeight;
  }
  return b;
}

function parseGap(gap: string | null | undefined): number | null {
  if (!gap) return null;
  const m = /^([\d.]+)/.exec(gap.trim());
  return m ? Number(m[1]) : null;
}

function buildContainerAnchor(def: PageRegionLayoutDefinition, dom: DomRegionMeasurement): RegionChildAnchorR5 {
  return {
    anchorId: `${def.regionId}:container`,
    anchorType: 'CONTAINER',
    label: def.regionName,
    bounds: boundsFromDom(dom),
    source: 'DOM_RECT',
    confidence: 'HIGH',
    parentAnchorId: null,
    orderIndex: 0,
  };
}

function navStructure(
  def: PageRegionLayoutDefinition,
  dom: DomRegionMeasurement,
  related: DomRegionMeasurement[],
): { anchors: RegionChildAnchorR5[]; groups: RepeatedAnchorGroup[]; relationships: RegionRelationship[] } {
  const container = buildContainerAnchor(def, dom);
  const anchors: RegionChildAnchorR5[] = [container];
  const relationships: RegionRelationship[] = [];

  const { accepted: traversed } = collectMeaningfulChildCandidates({ container: dom, relatedDom: related });
  const itemDom = traversed.length >= 2 ? traversed : related.length ? related : [];
  let items: RegionChildAnchorR5[] = [];

  if (itemDom.length >= 2) {
    items = itemDom.map((d, i) => ({
      anchorId: `${def.regionId}:item:${i}`,
      anchorType: 'ITEM' as const,
      label: `ITEM_${i + 1}`,
      bounds: boundsFromDom(d, dom),
      source: 'DOM_RECT' as const,
      confidence: 'HIGH' as const,
      parentAnchorId: container.anchorId,
      orderIndex: i + 1,
    }));
  } else {
    const gap = parseGap(dom.computedGap) ?? 8;
    const count = Math.max(2, Math.min(6, Math.round(dom.actualWidth / 72)));
    const itemW = (dom.actualWidth - gap * (count - 1)) / count;
    for (let i = 0; i < count; i++) {
      const x = dom.actualX + i * (itemW + gap);
      items.push({
        anchorId: `${def.regionId}:item:${i}`,
        anchorType: 'ITEM',
        label: `REPEATED_BLOCK_${i + 1}`,
        bounds: {
          x,
          y: dom.actualY,
          width: itemW,
          height: dom.actualHeight,
          xPctWithinRegion: (x - dom.actualX) / dom.actualWidth,
          widthPctOfRegion: itemW / dom.actualWidth,
        },
        source: 'CHILD_ANCHOR',
        confidence: 'MEDIUM',
        parentAnchorId: container.anchorId,
        orderIndex: i + 1,
      });
    }
  }

  if (items.length === 0) {
    return { anchors: [container], groups: [], relationships: [] };
  }

  const activeItem = items[0]!;
  const activeItemAnchor: RegionChildAnchorR5 = {
    ...activeItem,
    anchorId: `${def.regionId}:active-item`,
    anchorType: 'ACTIVE_ITEM',
    label: 'ACTIVE_ITEM',
    confidence: 'MEDIUM',
  };
  const indicator: RegionChildAnchorR5 = {
    anchorId: `${def.regionId}:active-indicator`,
    anchorType: 'ACTIVE_INDICATOR',
    label: 'ACTIVE_INDICATOR',
    bounds: {
      x: activeItem.bounds.x,
      y: dom.actualY + dom.actualHeight - 3,
      width: activeItem.bounds.width,
      height: 3,
      xPctWithinRegion: activeItem.bounds.xPctWithinRegion,
      widthPctOfRegion: activeItem.bounds.widthPctOfRegion,
    },
    source: 'CHILD_ANCHOR',
    confidence: 'MEDIUM',
    parentAnchorId: activeItemAnchor.anchorId,
    orderIndex: items.length + 1,
  };

  anchors.push(...items, activeItemAnchor, indicator);

  const gaps: number[] = [];
  for (let i = 1; i < items.length; i++) {
    const prev = items[i - 1]!;
    const cur = items[i]!;
    gaps.push(cur.bounds.x - (prev.bounds.x + prev.bounds.width));
    relationships.push({
      fromAnchorId: prev.anchorId,
      toAnchorId: cur.anchorId,
      relationshipType: 'SPACED_BY',
      value: gaps[gaps.length - 1]!,
      confidence: 'MEDIUM',
    });
  }

  const meanGap = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : parseGap(dom.computedGap) ?? 0;
  const group: RepeatedAnchorGroup = {
    groupType: 'NAV_ITEMS',
    anchors: items,
    count: items.length,
    sharedGeometry: items[0] ? { width: items[0].bounds.width, height: items[0].bounds.height } : null,
    spacingProfile: {
      meanGap,
      minGap: gaps.length ? Math.min(...gaps) : meanGap,
      maxGap: gaps.length ? Math.max(...gaps) : meanGap,
      variance: gaps.length > 1 ? Math.max(...gaps) - Math.min(...gaps) : 0,
      equalSpacing: gaps.length <= 1 || Math.max(...gaps) - Math.min(...gaps) <= 2,
    },
    confidence: itemDom.length >= 2 ? 'HIGH' : 'MEDIUM',
  };

  relationships.push({
    fromAnchorId: container.anchorId,
    toAnchorId: activeItemAnchor.anchorId,
    relationshipType: 'ACTIVE_STATE_OF',
    value: 1,
    confidence: 'MEDIUM',
  });

  return { anchors, groups: [group], relationships };
}

function activityListStructure(
  def: PageRegionLayoutDefinition,
  dom: DomRegionMeasurement,
  related: DomRegionMeasurement[],
): { anchors: RegionChildAnchorR5[]; groups: RepeatedAnchorGroup[]; relationships: RegionRelationship[] } {
  const container = buildContainerAnchor(def, dom);
  const { accepted } = collectMeaningfulChildCandidates({ container: dom, relatedDom: related });
  const rowDom = detectRepeatedRowGeometry(accepted) ?? (accepted.length >= 2 ? accepted : []);

  const titleAnchor: RegionChildAnchorR5 | null =
    accepted.length && !rowDom.includes(accepted[0]!)
      ? {
          anchorId: `${def.regionId}:section-title`,
          anchorType: 'TITLE',
          label: 'SECTION_HEADING',
          bounds: boundsFromDom(accepted[0]!, dom),
          source: 'DOM_RECT',
          confidence: 'MEDIUM',
          parentAnchorId: container.anchorId,
          orderIndex: 1,
        }
      : null;

  const rows =
    rowDom.length >= 2
      ? rowDom.map((d, i) => ({
          anchorId: `${def.regionId}:row:${i}`,
          anchorType: 'REPEATED_BLOCK' as const,
          label: `LIST_ROW_${i + 1}`,
          bounds: boundsFromDom(d, dom),
          source: 'DOM_RECT' as const,
          confidence: 'HIGH' as const,
          parentAnchorId: container.anchorId,
          orderIndex: 10 + i,
        }))
      : [];

  const group: RepeatedAnchorGroup | null =
    rows.length >= 3
      ? {
          groupType: 'LIST_ROWS',
          anchors: rows,
          count: rows.length,
          sharedGeometry: rows[0] ? { width: rows[0].bounds.width, height: rows[0].bounds.height } : null,
          spacingProfile: { meanGap: 8, minGap: 4, maxGap: 16, variance: 4, equalSpacing: true },
          confidence: 'HIGH',
        }
      : null;

  const anchors: RegionChildAnchorR5[] = [container];
  if (titleAnchor) anchors.push(titleAnchor);
  anchors.push(...rows);

  return { anchors, groups: group ? [group] : [], relationships: [] };
}

function metricsStructure(
  def: PageRegionLayoutDefinition,
  dom: DomRegionMeasurement,
  related: DomRegionMeasurement[],
): { anchors: RegionChildAnchorR5[]; groups: RepeatedAnchorGroup[]; relationships: RegionRelationship[] } {
  const metricSubtype = resolveMetricRegionSubtype({ def, dom, relatedDom: related });
  if (metricSubtype.subtype === 'AMBIGUOUS' && metricSubtype.ambiguousCandidates) {
    const container = buildContainerAnchor(def, dom);
    return { anchors: [container], groups: [], relationships: [] };
  }

  const container = buildContainerAnchor(def, dom);
  const { accepted } = collectMeaningfulChildCandidates({ container: dom, relatedDom: related });
  const cells =
    accepted.length >= 2
      ? accepted
      : related.length >= 2
      ? related
      : (() => {
          const gap = parseGap(dom.computedGap) ?? 12;
          const cellW = (dom.actualWidth - gap * 3) / 4;
          return [0, 1, 2, 3].map((i) => ({
            regionId: `${def.regionId}:cell:${i}`,
            actualX: dom.actualX + i * (cellW + gap),
            actualY: dom.actualY,
            actualWidth: cellW,
            actualHeight: dom.actualHeight,
          })) as DomRegionMeasurement[];
        })();

  const cellAnchors = cells.map((c, i) => ({
    anchorId: `${def.regionId}:cell:${i}`,
    anchorType: 'CELL' as const,
    label: `CELL_${i + 1}`,
    bounds: boundsFromDom(c, dom),
    source: (related.length >= 2 ? 'DOM_RECT' : 'CHILD_ANCHOR') as 'DOM_RECT' | 'CHILD_ANCHOR',
    confidence: (related.length >= 2 ? 'HIGH' : 'MEDIUM') as 'HIGH' | 'MEDIUM',
    parentAnchorId: container.anchorId,
    orderIndex: i + 1,
  }));

  const dividers: RegionChildAnchorR5[] = [];
  const relationships: RegionRelationship[] = [];
  for (let i = 1; i < cellAnchors.length; i++) {
    const prev = cells[i - 1]!;
    dividers.push({
      anchorId: `${def.regionId}:divider:${i}`,
      anchorType: 'DIVIDER',
      label: `DIVIDER_${i}`,
      bounds: {
        x: prev.actualX + prev.actualWidth,
        y: dom.actualY,
        width: 1,
        height: dom.actualHeight,
      },
      source: 'CHILD_ANCHOR',
      confidence: 'MEDIUM',
      parentAnchorId: container.anchorId,
      orderIndex: 100 + i,
    });
    relationships.push({
      fromAnchorId: cellAnchors[i - 1]!.anchorId,
      toAnchorId: cellAnchors[i]!.anchorId,
      relationshipType: 'DIVIDES',
      value: 1,
      confidence: 'MEDIUM',
    });
  }

  const widths = cellAnchors.map((c) => c.bounds.width);
  const meanW = widths.reduce((a, b) => a + b, 0) / widths.length;
  const variance = widths.reduce((a, w) => a + (w - meanW) ** 2, 0) / widths.length;

  const group: RepeatedAnchorGroup = {
    groupType: 'METRIC_CELLS',
    anchors: cellAnchors,
    count: cellAnchors.length,
    sharedGeometry: { width: meanW, height: dom.actualHeight },
    spacingProfile: { meanGap: parseGap(dom.computedGap) ?? 12, minGap: 0, maxGap: 0, variance, equalSpacing: variance < 4 },
    confidence: related.length >= 2 ? 'HIGH' : 'MEDIUM',
  };

  if (variance < 4) {
    relationships.push({
      fromAnchorId: cellAnchors[0]!.anchorId,
      toAnchorId: cellAnchors[cellAnchors.length - 1]!.anchorId,
      relationshipType: 'EQUAL_WIDTH',
      value: meanW,
      confidence: 'MEDIUM',
    });
  }

  return { anchors: [container, ...cellAnchors, ...dividers], groups: [group], relationships };
}

function progressStructure(
  def: PageRegionLayoutDefinition,
  dom: DomRegionMeasurement,
): { anchors: RegionChildAnchorR5[]; groups: RepeatedAnchorGroup[]; relationships: RegionRelationship[] } {
  const container = buildContainerAnchor(def, dom);
  const track: RegionChildAnchorR5 = {
    anchorId: `${def.regionId}:track`,
    anchorType: 'TRACK',
    label: 'TRACK',
    bounds: {
      x: dom.actualX + 8,
      y: dom.actualY + dom.actualHeight * 0.55,
      width: dom.actualWidth - 16,
      height: 4,
      widthPctOfRegion: (dom.actualWidth - 16) / dom.actualWidth,
    },
    source: 'CHILD_ANCHOR',
    confidence: 'MEDIUM',
    parentAnchorId: container.anchorId,
    orderIndex: 1,
  };
  const fill: RegionChildAnchorR5 = {
    anchorId: `${def.regionId}:fill`,
    anchorType: 'FILL',
    label: 'FILL',
    bounds: { ...track.bounds, width: track.bounds.width * 0.45 },
    source: 'CHILD_ANCHOR',
    confidence: 'MEDIUM',
    parentAnchorId: track.anchorId,
    orderIndex: 2,
  };
  const divider: RegionChildAnchorR5 = {
    anchorId: `${def.regionId}:phase-divider`,
    anchorType: 'DIVIDER',
    label: 'PHASE_DIVIDER',
    bounds: {
      x: dom.actualX + dom.actualWidth * 0.5,
      y: dom.actualY,
      width: 1,
      height: dom.actualHeight,
    },
    source: 'CHILD_ANCHOR',
    confidence: 'LOW',
    parentAnchorId: container.anchorId,
    orderIndex: 3,
  };
  const phaseBlock: RegionChildAnchorR5 = {
    anchorId: `${def.regionId}:phase-block`,
    anchorType: 'LABEL',
    label: 'PHASE_BLOCK',
    bounds: {
      x: dom.actualX + 8,
      y: dom.actualY + 4,
      width: dom.actualWidth - 16,
      height: dom.actualHeight * 0.4,
    },
    source: 'CHILD_ANCHOR',
    confidence: 'MEDIUM',
    parentAnchorId: container.anchorId,
    orderIndex: 4,
  };

  return {
    anchors: [container, track, fill, divider, phaseBlock],
    groups: [],
    relationships: [
      { fromAnchorId: container.anchorId, toAnchorId: track.anchorId, relationshipType: 'CONTAINS', value: null, confidence: 'MEDIUM' },
      { fromAnchorId: track.anchorId, toAnchorId: fill.anchorId, relationshipType: 'CONTAINS', value: null, confidence: 'MEDIUM' },
    ],
  };
}

function cardRailStructure(
  def: PageRegionLayoutDefinition,
  dom: DomRegionMeasurement,
): { anchors: RegionChildAnchorR5[]; groups: RepeatedAnchorGroup[]; relationships: RegionRelationship[] } {
  const container = buildContainerAnchor(def, dom);
  const gap = parseGap(dom.computedGap) ?? 10;
  const cardW = Math.min(280, dom.actualWidth * 0.72);
  const cards: RegionChildAnchorR5[] = [0, 1].map((i) => ({
    anchorId: `${def.regionId}:card:${i}`,
    anchorType: 'CARD',
    label: `REPEATED_BLOCK_${i + 1}`,
    bounds: {
      x: dom.actualX + i * (cardW + gap),
      y: dom.actualY,
      width: cardW,
      height: dom.actualHeight,
    },
    source: 'CHILD_ANCHOR',
    confidence: i === 0 ? 'MEDIUM' : 'LOW',
    parentAnchorId: container.anchorId,
    orderIndex: i + 1,
  }));
  const group: RepeatedAnchorGroup = {
    groupType: 'CARDS',
    anchors: cards,
    count: cards.length,
    sharedGeometry: { width: cardW, height: dom.actualHeight },
    spacingProfile: { meanGap: gap, minGap: gap, maxGap: gap, variance: 0, equalSpacing: true },
    confidence: 'MEDIUM',
  };
  return { anchors: [container, ...cards], groups: [group], relationships: [] };
}

function resolveStatus(anchors: RegionChildAnchorR5[], regionType: VisualRegionType): InternalStructureStatus {
  if (!anchors.length) return 'UNRESOLVED';
  const hasContainer = anchors.some((a) => a.anchorType === 'CONTAINER');
  const childCount = anchors.filter((a) => a.anchorType !== 'CONTAINER').length;
  if (!hasContainer) return 'PARTIAL';
  if (regionType === 'NAVIGATION' && childCount < 4) return 'PARTIAL';
  if (regionType === 'METRICS' && childCount < 3) return 'PARTIAL';
  if (regionType === 'STATUS' && childCount < 3) return 'PARTIAL';
  if (childCount >= 3) return 'RESOLVED';
  return 'PARTIAL';
}

export function extractCurrentRegionStructure(input: {
  def: PageRegionLayoutDefinition;
  dom?: DomRegionMeasurement | null;
  relatedDom?: DomRegionMeasurement[];
}): RegionInternalStructure {
  const dom = input.dom;
  if (!dom || dom.actualHeight < 4) {
    return {
      regionId: input.def.regionId,
      regionType: input.def.regionType,
      subtype: resolveComplexRegionSubtype(input.def),
      container: null,
      childAnchors: [],
      groups: [],
      relationships: [],
      structureConfidence: 'LOW',
      status: 'UNRESOLVED',
    };
  }

  const related = input.relatedDom ?? [];
  let built: { anchors: RegionChildAnchorR5[]; groups: RepeatedAnchorGroup[]; relationships: RegionRelationship[] };

  switch (input.def.regionType) {
    case 'NAVIGATION':
      built = navStructure(input.def, dom, related);
      break;
    case 'METRICS':
      built = metricsStructure(input.def, dom, related);
      break;
    case 'STATUS':
      built = progressStructure(input.def, dom);
      break;
    case 'LIST':
      built = activityListStructure(input.def, dom, related);
      break;
    case 'CARD_RAIL':
      built = cardRailStructure(input.def, dom);
      break;
    default:
      built = {
        anchors: [buildContainerAnchor(input.def, dom)],
        groups: [],
        relationships: [],
      };
  }

  const container = built.anchors.find((a) => a.anchorType === 'CONTAINER') ?? null;
  let status = resolveStatus(built.anchors, input.def.regionType);
  let subtype = resolveComplexRegionSubtype(input.def);
  if (input.def.regionType === 'METRICS') {
    const metric = resolveMetricRegionSubtype({ def: input.def, dom, relatedDom: related });
    if (metric.subtype === 'AMBIGUOUS') status = 'AMBIGUOUS';
  }

  return {
    regionId: input.def.regionId,
    regionType: input.def.regionType,
    subtype,
    container,
    childAnchors: built.anchors,
    groups: built.groups,
    relationships: built.relationships,
    structureConfidence: status === 'RESOLVED' ? 'HIGH' : status === 'PARTIAL' ? 'MEDIUM' : 'LOW',
    status,
  };
}
