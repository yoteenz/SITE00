/**
 * Post-generation revision compliance — requested changes vs unrequested drift.
 */

import type { CreativeAssetRecord } from './types.js';
import type {
  CreativeRevisionDiff,
  CreativeRevisionSpec,
  RevisionComplianceCategory,
  RevisionComplianceResult,
  RevisionGenerationBrief,
} from './revisionTypes.js';

function worstResult(results: RevisionComplianceResult[]): RevisionComplianceResult {
  if (results.some((r) => r === 'FAIL')) return 'FAIL';
  if (results.some((r) => r === 'PARTIAL')) return 'PARTIAL';
  if (results.every((r) => r === 'NOT_EVALUATED')) return 'NOT_EVALUATED';
  return 'PASS';
}

function evaluateCopy(params: {
  spec: CreativeRevisionSpec;
  brief: RevisionGenerationBrief;
}): RevisionComplianceCategory {
  const requested =
    params.brief.copyRevision ?? (params.spec.requestedCopyChanges.join('; ') || null);
  if (!requested?.trim()) {
    return { category: 'COPY', requestedChange: null, result: 'NOT_EVALUATED', evidence: 'No copy change requested' };
  }
  const exactRequested = params.spec.requestedCopyChanges;
  if (exactRequested.length > 0) {
    return {
      category: 'COPY',
      requestedChange: requested,
      result: 'NOT_EVALUATED',
      evidence: 'Exact copy fidelity requires vision evaluation — deterministic check unavailable',
    };
  }
  return {
    category: 'COPY',
    requestedChange: requested,
    result: 'NOT_EVALUATED',
    evidence: 'Copy change noted — semantic verification required',
  };
}

function evaluateLockedComposition(spec: CreativeRevisionSpec): RevisionComplianceCategory {
  if (!spec.lockedElements.includes('COMPOSITION')) {
    return { category: 'COMPOSITION', requestedChange: null, result: 'NOT_EVALUATED', evidence: 'Composition not locked' };
  }
  if (spec.mutableElements.includes('COMPOSITION') || spec.categoryNotes.composition?.trim()) {
    return {
      category: 'COMPOSITION',
      requestedChange: 'preserve composition exactly',
      result: 'NOT_EVALUATED',
      evidence: 'Composition lock with requested composition notes — vision evaluation required',
    };
  }
  return {
    category: 'COMPOSITION',
    requestedChange: 'preserve composition exactly',
    result: 'NOT_EVALUATED',
    evidence: 'Composition locked — drift detection requires vision evaluation',
  };
}

function evaluateFormat(parent: CreativeAssetRecord, child: CreativeAssetRecord): RevisionComplianceCategory {
  const parentFormat = parent.contentLineage.format;
  const sameFormat = parentFormat === child.contentLineage.format;
  const sameSlide = parent.contentLineage.slideNumber === child.contentLineage.slideNumber;
  if (sameFormat && sameSlide) {
    return { category: 'FORMAT', requestedChange: null, result: 'PASS', evidence: 'Format and slide metadata preserved' };
  }
  return {
    category: 'FORMAT',
    requestedChange: 'preserve format',
    result: 'FAIL',
    evidence: 'Child format/slide metadata differs from parent',
  };
}

function evaluateColor(spec: CreativeRevisionSpec, brief: RevisionGenerationBrief): RevisionComplianceCategory {
  const requested = brief.colorRevision ?? (spec.requestedColorChanges.join('; ') || null);
  if (!requested?.trim()) {
    return { category: 'COLOR', requestedChange: null, result: 'NOT_EVALUATED', evidence: 'No color change requested' };
  }
  return {
    category: 'COLOR',
    requestedChange: requested,
    result: 'NOT_EVALUATED',
    evidence: 'Color delta noted — pixel-level verification unavailable',
  };
}

export function evaluateRevisionCompliance(params: {
  spec: CreativeRevisionSpec;
  brief: RevisionGenerationBrief;
  parent: CreativeAssetRecord;
  child: CreativeAssetRecord;
}): CreativeRevisionDiff {
  const { spec, brief, parent, child } = params;

  const categoryResults: RevisionComplianceCategory[] = [
    evaluateCopy({ spec, brief }),
    evaluateColor(spec, brief),
    evaluateLockedComposition(spec),
    evaluateFormat(parent, child),
    {
      category: 'TYPOGRAPHY',
      requestedChange: brief.typographyRevision,
      result: brief.typographyRevision ? 'NOT_EVALUATED' : 'NOT_EVALUATED',
      evidence: brief.typographyRevision
        ? 'Typography change requested — exact font preservation not reliably detectable'
        : 'No typography change requested',
    },
    {
      category: 'WORLD DNA',
      requestedChange: 'preserve world DNA',
      result: parent.directionLineage.worldId === child.directionLineage.worldId ? 'PASS' : 'FAIL',
      evidence:
        parent.directionLineage.worldId === child.directionLineage.worldId
          ? 'World ID preserved'
          : 'World ID drift detected',
    },
    {
      category: 'BRAND DNA',
      requestedChange: 'preserve brand constraints',
      result: parent.brandSlug === child.brandSlug ? 'PASS' : 'FAIL',
      evidence: parent.brandSlug === child.brandSlug ? 'Brand scope preserved' : 'Cross-brand contamination',
    },
  ];

  const requestedChanges = categoryResults
    .filter((c) => c.requestedChange)
    .map((c) => ({
      requestedChange: c.requestedChange!,
      result: c.result,
      evidence: c.evidence,
    }));

  const lockedElementsPreserved = spec.lockedElements.map((el) => ({
    requestedChange: `LOCK: ${el}`,
    result: 'NOT_EVALUATED' as RevisionComplianceResult,
    evidence: 'Lock preservation requires vision evaluation where not deterministically checked',
  }));

  const unrequestedDrift: CreativeRevisionDiff['unrequestedDrift'] = [];
  if (spec.preserveUnspecified) {
    unrequestedDrift.push({
      requestedChange: 'preserve unspecified dimensions',
      result: 'NOT_EVALUATED',
      evidence: 'Unrequested drift detection requires vision evaluation',
    });
  }

  const summaryCompliance = worstResult(categoryResults.map((c) => c.result));

  return {
    revisionId: spec.revisionId,
    parentAssetId: spec.parentAssetId,
    childAssetId: child.assetId,
    requestedChanges,
    lockedElementsPreserved,
    unrequestedDrift,
    categoryResults,
    preserveUnspecified: spec.preserveUnspecified,
    visualDriftDetected: summaryCompliance === 'FAIL',
    summaryCompliance,
    copyProvenance: {
      parentCopy: brief.copyRevision ?? null,
      requestedCopy: spec.requestedCopyChanges.join('; ') || spec.categoryNotes.copy || null,
      generatedCopyNote: 'Image-rendered copy requires founder visual verification',
    },
  };
}
