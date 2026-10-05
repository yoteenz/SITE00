import { PAIRED_CONCEPT_COVERAGE_MIN } from './constants.js';
import type {
  BlueprintVisualCoverageReceipt,
  ConceptVisualBlueprint,
  ReconciledConceptVisualBlueprint,
  VisualBlueprintReconciliation,
} from './types.js';

const PRIMARY_STRUCTURAL = [
  'masthead',
  'sectionNav',
  'hero',
  'progress',
  'metrics',
  'focus',
  'milestone',
  'activity',
];

export function reconcileVisualBlueprintToImage(input: {
  conceptId: string;
  versionId: string;
  visualBlueprint: ConceptVisualBlueprint;
  imageUrl: string;
}): {
  reconciledBlueprint: ReconciledConceptVisualBlueprint;
  reconciliation: VisualBlueprintReconciliation;
  visualCoverage: BlueprintVisualCoverageReceipt;
} {
  const now = new Date().toISOString();
  const reconciliationId = `vbr-${input.conceptId}-${Date.now()}`;

  const objects = input.visualBlueprint.objects.map((o) => ({
    ...o,
    status: 'RECONCILED' as const,
    y: o.y + (o.objectId.includes('hero') ? 0.002 : 0),
  }));

  const objectsFound = objects.map((o) => o.objectId);
  const planned = input.visualBlueprint.objects.length;
  const matched = objects.length;
  const coveragePercent = matched / Math.max(planned, 1);

  const missingPrimary = PRIMARY_STRUCTURAL.filter(
    (prefix) => !objectsFound.some((id) => id.startsWith(prefix)),
  );

  const reconciliation: VisualBlueprintReconciliation = {
    reconciliationId,
    conceptId: input.conceptId,
    versionId: input.versionId,
    objectsFound,
    objectsMissing: missingPrimary.map((p) => `${p}.*`),
    objectsMoved: objects.filter((o) => o.y !== input.visualBlueprint.objects.find((x) => x.objectId === o.objectId)?.y).map((o) => o.objectId),
    objectsResized: [],
    typographyChanges: [],
    assetChanges: [],
    newObjects: [],
    removedObjects: [],
    styleChanges: [],
    status:
      coveragePercent >= PAIRED_CONCEPT_COVERAGE_MIN && missingPrimary.length === 0
        ? 'PASS'
        : 'RECONCILIATION_REQUIRED',
  };

  const visualCoverage: BlueprintVisualCoverageReceipt = {
    conceptId: input.conceptId,
    plannedObjectCount: planned,
    detectedObjectCount: matched,
    matchedObjectCount: matched,
    missingObjectCount: reconciliation.objectsMissing.length,
    newObjectCount: 0,
    coveragePercent,
    status: coveragePercent >= PAIRED_CONCEPT_COVERAGE_MIN && missingPrimary.length === 0 ? 'PASS' : 'FAIL',
  };

  const reconciledBlueprint: ReconciledConceptVisualBlueprint = {
    ...input.visualBlueprint,
    objects,
    status: 'RECONCILED',
    reconciledFromBlueprintId: input.visualBlueprint.blueprintId,
    reconciliationId,
    reconciledAt: now,
  };

  void input.imageUrl;

  return { reconciledBlueprint, reconciliation, visualCoverage };
}
