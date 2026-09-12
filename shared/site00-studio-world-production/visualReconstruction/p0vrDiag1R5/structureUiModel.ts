/**
 * P0.VR.DIAG.1R5A — Founder-readable current vs authority structure lines.
 */

import type { RegionInternalStructureSummary } from '../p0vrDiag1/types.js';
import type { RegionInternalStructure, RegionChildAnchorR5 } from './types.js';

export type AnchorSideStatus = 'RESOLVED' | 'MISSING' | 'AMBIGUOUS';

export type StructureAnchorLine = {
  anchorKey: string;
  label: string;
  anchorType: string;
  current: AnchorSideStatus;
  authority: AnchorSideStatus;
  orderIndex?: number;
  confidence?: string;
  source?: string;
};

export type RegionStructureViewModel = {
  regionId: string;
  regionName: string;
  structureStatus: RegionInternalStructureSummary['status'];
  subtype?: RegionInternalStructureSummary['subtype'];
  failureCode?: string;
  failureDetail?: string;
  currentLines: StructureAnchorLine[];
  authorityLines: StructureAnchorLine[];
  relationshipsSummary: string[];
  compactHierarchy: string[];
  forensicsEngine: string;
  structureUiVersion: string;
};

const UI_VERSION = 'R5A';
const ENGINE_VERSION = 'R5';

function sideStatus(anchor: RegionChildAnchorR5 | undefined): AnchorSideStatus {
  if (!anchor) return 'MISSING';
  if (anchor.confidence === 'LOW') return 'AMBIGUOUS';
  return 'RESOLVED';
}

function anchorKey(a: RegionChildAnchorR5): string {
  return `${a.anchorType}:${a.orderIndex}:${a.label}`;
}

function summarizeGroup(structure: RegionInternalStructure, side: 'current' | 'authority'): string[] {
  const lines: string[] = [];
  const nav = structure.groups.find((g) => g.groupType === 'NAV_ITEMS');
  const cells = structure.groups.find((g) => g.groupType === 'METRIC_CELLS');
  const cards = structure.groups.find((g) => g.groupType === 'CARDS');

  if (nav) {
    lines.push(`ITEMS ×${nav.count}`);
    lines.push(`SPACING: ${Math.round(nav.spacingProfile.meanGap)}px`);
  }
  if (cells) {
    lines.push(`CELLS ×${cells.count}`);
    lines.push(`SPACING: ${Math.round(cells.spacingProfile.meanGap)}px`);
  }
  if (cards) {
    lines.push(`CARDS ×${cards.count}`);
  }

  const active = structure.childAnchors.find((a) => a.anchorType === 'ACTIVE_ITEM');
  const indicator = structure.childAnchors.find((a) => a.anchorType === 'ACTIVE_INDICATOR');
  if (active && indicator) {
    lines.push(`ACTIVE INDICATOR: under item ${active.orderIndex}`);
  }

  if (!lines.length && side === 'current') {
    lines.push(`${structure.childAnchors.filter((a) => a.anchorType !== 'CONTAINER').length} child anchors`);
  }
  return lines;
}

export function buildRegionStructureViewModel(input: {
  regionId: string;
  regionName: string;
  summary: RegionInternalStructureSummary;
  current: RegionInternalStructure | null;
  authority: RegionInternalStructure | null;
  failureCode?: string;
  failureDetail?: string;
}): RegionStructureViewModel {
  const currentAnchors = input.current?.childAnchors ?? [];
  const authorityAnchors = input.authority?.childAnchors ?? [];
  const keys = new Set<string>();
  for (const a of [...currentAnchors, ...authorityAnchors]) keys.add(anchorKey(a));

  const currentLines: StructureAnchorLine[] = [];
  for (const key of [...keys].sort()) {
    const cur = currentAnchors.find((a) => anchorKey(a) === key);
    const auth = authorityAnchors.find((a) => anchorKey(a) === key);
    const ref = cur ?? auth!;
    currentLines.push({
      anchorKey: key,
      label: ref.label,
      anchorType: ref.anchorType,
      current: sideStatus(cur),
      authority: sideStatus(auth),
      orderIndex: ref.orderIndex,
      confidence: cur?.confidence ?? auth?.confidence,
      source: cur?.source ?? auth?.source,
    });
  }

  const relationshipsSummary = input.current ? summarizeGroup(input.current, 'current') : [];

  return {
    regionId: input.regionId,
    regionName: input.regionName,
    structureStatus: input.summary.status,
    subtype: input.summary.subtype,
    failureCode: input.failureCode,
    failureDetail: input.failureDetail,
    currentLines,
    authorityLines: currentLines,
    relationshipsSummary,
    compactHierarchy: input.summary.anchorHierarchy ?? [],
    forensicsEngine: ENGINE_VERSION,
    structureUiVersion: UI_VERSION,
  };
}

export function formatAnchorLine(line: StructureAnchorLine, side: 'current' | 'authority'): string {
  const status = side === 'current' ? line.current : line.authority;
  const mark = status === 'RESOLVED' ? '✓' : status === 'AMBIGUOUS' ? '?' : '✕';
  return `${line.label} ${mark}`;
}
