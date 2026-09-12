/**
 * P0.VR.DIAG.1R5B — Explicit diagnostics when internal anchor count is zero.
 */

import type { PageRegionLayoutDefinition } from '../p0vrDiag1/pageRegionLayoutProfiles.js';
import type { DomRegionMeasurement } from '../p0vrDiag1/types.js';
import type { EvidenceRecoveryFailureCode, RegionInternalStructure } from './types.js';
import { collectMeaningfulChildCandidates } from './meaningfulChildTraversal.js';
import { resolveMetricRegionSubtype } from './metricRegionSubtypeResolver.js';
import { founderMessageForFailureCode } from './founderStructureCopy.js';

export type ZeroAnchorDiagnosis = {
  regionId: string;
  regionType: string;
  currentContainerResolved: boolean;
  authorityContainerResolved: boolean;
  domTargetResolved: boolean;
  childCandidateCount: number;
  childCandidatesRejected: number;
  rejectionReasons: string[];
  authorityCandidateCount: number;
  authorityCandidatesRejected: number;
  expectedAnchorTypes: string[];
  failureCode: EvidenceRecoveryFailureCode;
  recommendedRecovery: string;
  founderSummary: string;
  metricSubtype?: string;
  metricSubtypeCandidates?: string[];
};

function expectedAnchorsForType(regionType: string): string[] {
  switch (regionType) {
    case 'NAVIGATION':
      return ['CONTAINER', 'ITEM', 'ACTIVE_ITEM', 'ACTIVE_INDICATOR'];
    case 'METRICS':
      return ['CONTAINER', 'CELL', 'VALUE', 'LABEL', 'DIVIDER'];
    case 'STATUS':
      return ['CONTAINER', 'TRACK', 'FILL', 'PHASE_BLOCK', 'DIVIDER'];
    case 'LIST':
      return ['CONTAINER', 'TITLE', 'LIST_ROW', 'LABEL', 'DIVIDER'];
    default:
      return ['CONTAINER'];
  }
}

export function buildZeroAnchorDiagnosis(input: {
  def: PageRegionLayoutDefinition;
  dom: DomRegionMeasurement | null | undefined;
  relatedDom: DomRegionMeasurement[];
  currentStructure: RegionInternalStructure;
  authorityStructure: RegionInternalStructure;
  failureCode?: EvidenceRecoveryFailureCode;
}): ZeroAnchorDiagnosis | null {
  const nonContainer = input.currentStructure.childAnchors.filter((a) => a.anchorType !== 'CONTAINER');
  if (nonContainer.length > 0) return null;

  const { accepted, rejected } = input.dom
    ? collectMeaningfulChildCandidates({ container: input.dom, relatedDom: input.relatedDom })
    : { accepted: [], rejected: [] };

  const rejectionReasons = [...new Set(rejected.map((r) => r.rejectionReason ?? 'LOW_CONFIDENCE'))];
  const authNonContainer = input.authorityStructure.childAnchors.filter((a) => a.anchorType !== 'CONTAINER');

  let failureCode: EvidenceRecoveryFailureCode =
    input.failureCode ??
    (input.currentStructure.subtype === 'AMBIGUOUS' ? 'REGION_TYPE_AMBIGUOUS' : 'DOM_CHILDREN_UNRESOLVED');

  if (authNonContainer.length === 0 && input.currentStructure.status !== 'UNRESOLVED') {
    failureCode = 'AUTHORITY_ANCHORS_UNRESOLVED';
  }

  let metricSubtype: string | undefined;
  let metricSubtypeCandidates: string[] | undefined;
  if (input.def.regionType === 'METRICS' && input.dom) {
    const metric = resolveMetricRegionSubtype({ def: input.def, dom: input.dom, relatedDom: input.relatedDom });
    metricSubtype = metric.subtype;
    if (metric.ambiguousCandidates) metricSubtypeCandidates = [...metric.ambiguousCandidates];
    if (metric.subtype === 'AMBIGUOUS') failureCode = 'REGION_TYPE_AMBIGUOUS';
  }

  const founderSummary = founderMessageForFailureCode(failureCode, input.def.regionName);

  return {
    regionId: input.def.regionId,
    regionType: input.def.regionType,
    currentContainerResolved: Boolean(input.currentStructure.container),
    authorityContainerResolved: Boolean(input.authorityStructure.container),
    domTargetResolved: Boolean(input.dom && input.dom.actualHeight >= 4),
    childCandidateCount: accepted.length,
    childCandidatesRejected: rejected.length,
    rejectionReasons,
    authorityCandidateCount: authNonContainer.length,
    authorityCandidatesRejected: Math.max(0, 4 - authNonContainer.length),
    expectedAnchorTypes: expectedAnchorsForType(input.def.regionType),
    failureCode,
    recommendedRecovery: founderSummary.action,
    founderSummary: founderSummary.headline,
    metricSubtype,
    metricSubtypeCandidates,
  };
}
