/**
 * P0.VR.DIAG.1R5A — Founder-readable current vs authority structure lines.
 */

import type { RegionInternalStructureSummary } from '../p0vrDiag1/types.js';
import type { RegionInternalStructure, RegionChildAnchorR5 } from './types.js';

export type AnchorSideStatus =
  | 'RESOLVED'
  | 'PARTIAL'
  | 'UNRESOLVED'
  | 'AMBIGUOUS'
  | 'NOT_REQUIRED';

export type RegionAnchorSideSummary = {
  current: AnchorSideStatus;
  authority: AnchorSideStatus;
  currentDetail: string;
  authorityDetail: string;
  failureCode?: string;
};

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

const UI_VERSION = 'R5B';
const ENGINE_VERSION = 'R5';

export function summarizeAnchorSideStatus(input: {
  current: RegionInternalStructure | null;
  authority: RegionInternalStructure | null;
}): RegionAnchorSideSummary {
  const curChildren = input.current?.childAnchors.filter((a) => a.anchorType !== 'CONTAINER').length ?? 0;
  const authChildren = input.authority?.childAnchors.filter((a) => a.anchorType !== 'CONTAINER').length ?? 0;

  const side = (count: number, status?: string): AnchorSideStatus => {
    if (status === 'AMBIGUOUS') return 'AMBIGUOUS';
    if (count >= 3) return 'RESOLVED';
    if (count > 0) return 'PARTIAL';
    return 'UNRESOLVED';
  };

  const current = side(curChildren, input.current?.status);
  const authority = side(authChildren, input.authority?.status);

  let failureCode: string | undefined;
  if (current !== 'UNRESOLVED' && authority === 'UNRESOLVED') failureCode = 'AUTHORITY_ANCHORS_UNRESOLVED';

  const active = input.current?.childAnchors.find((a) => a.anchorType === 'ACTIVE_ITEM');
  const curDetail =
    curChildren === 0
      ? '0 ANCHORS'
      : `${curChildren} ITEMS${active ? ' · ACTIVE ITEM FOUND' : ''}`;
  const authDetail = authChildren === 0 ? 'UNRESOLVED' : `${authChildren} ITEM BOXES`;

  return {
    current,
    authority,
    currentDetail: curDetail,
    authorityDetail: authDetail,
    failureCode,
  };
}

function sideStatus(anchor: RegionChildAnchorR5 | undefined): AnchorSideStatus {
  if (!anchor) return 'UNRESOLVED';
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

  const lines: StructureAnchorLine[] = [];
  for (const key of [...keys].sort()) {
    const cur = currentAnchors.find((a) => anchorKey(a) === key);
    const auth = authorityAnchors.find((a) => anchorKey(a) === key);
    const ref = cur ?? auth!;
    lines.push({
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

  const currentLines = lines.filter((l) => l.current !== 'UNRESOLVED' || l.authority !== 'UNRESOLVED');
  const authorityLines = lines.map((l) => ({ ...l }));

  const relationshipsSummary = input.current ? summarizeGroup(input.current, 'current') : [];

  return {
    regionId: input.regionId,
    regionName: input.regionName,
    structureStatus: input.summary.status,
    subtype: input.summary.subtype,
    failureCode: input.failureCode,
    failureDetail: input.failureDetail,
    currentLines,
    authorityLines,
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
