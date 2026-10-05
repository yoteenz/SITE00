/**
 * P0.VR.PAGE-FAMILY-INTERACTION-MAP-AND-HANDOFF-GATE1 — founder review model
 */

import type {
  PageFamilyInteractionMap,
  PageFamilyInteractionRecord,
} from './pageConceptPageFamilyInteractionMap.js';
import type { PageFamilyBlueprint } from './pageConceptPageFamilyBlueprint.js';

export type InteractionReviewGrouping = 'BY_PAGE' | 'BY_TYPE' | 'BY_PATTERN' | 'UNMAPPED' | 'OVERRIDES';

export type PageInteractionRollup = {
  pageId: string;
  pageName: string;
  pageDepth: 0 | 1 | 2;
  total: number;
  mapped: number;
  unmapped: number;
  inherited: number;
};

export type InteractionReviewCompactRow = {
  interactionId: string;
  controlLabel: string;
  actionType: string;
  destinationOrEffect: string;
  patternId: string | null;
  responsiveSummary: string;
  status: string;
  pageId: string;
  pageName: string;
};

export type PageFamilyInteractionReviewPresentation = {
  summary: {
    total: number;
    mapped: number;
    unmapped: number;
    inherited: number;
    pageSpecific: number;
    overridden: number;
    orphaned: number;
    errorBlocked: number;
    experiencePatternCoverage: string;
  };
  byPage: readonly PageInteractionRollup[];
  records: readonly PageFamilyInteractionRecord[];
  compactRows: readonly InteractionReviewCompactRow[];
  readyForApproval: boolean;
  approved: boolean;
  buildReadinessReadyForOpus: boolean;
};

function compactRow(record: PageFamilyInteractionRecord): InteractionReviewCompactRow {
  const destinationOrEffect =
    record.destination ??
    record.stateMutation ??
    record.targetObject ??
    '—';
  return {
    interactionId: record.interactionId,
    controlLabel: record.controlLabel,
    actionType: record.actionType,
    destinationOrEffect,
    patternId: record.experiencePatternId,
    responsiveSummary: `M:${record.responsiveBehavior.mobile} · T:${record.responsiveBehavior.tablet} · D:${record.responsiveBehavior.desktop}`,
    status: record.status,
    pageId: record.pageId,
    pageName: record.pageName,
  };
}

export function buildPageFamilyInteractionReviewPresentation(input: {
  blueprint: PageFamilyBlueprint | null;
  interactionMap: PageFamilyInteractionMap | null;
}): PageFamilyInteractionReviewPresentation | null {
  const { interactionMap } = input;
  if (!interactionMap) return null;
  const s = interactionMap.coverageMatrix.summary;
  return {
    summary: {
      total: s.totalInteractiveControls,
      mapped: s.mappedControls,
      unmapped: s.unmappedControls,
      inherited: s.inheritedControls,
      pageSpecific: s.pageSpecificControls,
      overridden: s.overriddenControls,
      orphaned: s.orphanedControls,
      errorBlocked: s.unmappedControls + s.orphanedControls,
      experiencePatternCoverage: `${s.experiencePatternLinked} / ${s.totalInteractiveControls}`,
    },
    byPage: interactionMap.coverageMatrix.rows.map((row) => ({
      pageId: row.pageId,
      pageName: row.pageName,
      pageDepth: row.pageDepth,
      total: row.totalInteractiveControls,
      mapped: row.mappedControls,
      unmapped: row.unmappedControls,
      inherited: row.inheritedControls,
    })),
    records: interactionMap.records,
    compactRows: interactionMap.records.map(compactRow),
    readyForApproval: s.coveragePercent === 100 && s.unmappedControls === 0 && s.orphanedControls === 0,
    approved: Boolean(interactionMap.approvedAt),
    buildReadinessReadyForOpus: interactionMap.buildReadiness.readyForOpus,
  };
}

export function filterInteractionReviewRows(
  presentation: PageFamilyInteractionReviewPresentation,
  grouping: InteractionReviewGrouping,
  pageId?: string | null,
): readonly InteractionReviewCompactRow[] {
  let rows = presentation.compactRows;
  if (pageId) rows = rows.filter((r) => r.pageId === pageId);
  switch (grouping) {
    case 'UNMAPPED':
      return rows.filter((r) => r.status === 'UNMAPPED' || r.status === 'ORPHANED_INTERACTION');
    case 'OVERRIDES':
      return rows.filter((r) => presentation.records.find((rec) => rec.interactionId === r.interactionId)?.lineageKind === 'OVERRIDDEN');
    case 'BY_PATTERN':
      return rows.filter((r) => r.patternId);
    case 'BY_TYPE':
      return [...rows].sort((a, b) => a.actionType.localeCompare(b.actionType));
    case 'BY_PAGE':
    default:
      return [...rows].sort((a, b) => a.pageName.localeCompare(b.pageName));
  }
}
