import type { ForensicUiObjectMap, ForensicUiObjectEntry } from '../p0vrTwinV30R8M2R5/forensicTypes.js';
import type { ForensicBlueprintObjectMap, MergedImplementationObjectMap } from './forensicIngestionTypes.js';
import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';

export function mergedImplementationObjectMapToForensicUiObjectMap(input: {
  merged: MergedImplementationObjectMap;
  coordinateFrame: ForensicBlueprintObjectMap['coordinateFrame'];
  rawObjectMap?: ForensicUiObjectMap;
}): ForensicUiObjectMap {
  const rawBySemantic = new Map(input.rawObjectMap?.objects.map((o) => [o.semanticObjectId, o]) ?? []);
  const objects: ForensicUiObjectEntry[] = input.merged.objects.map((o, index) => ({
    forensicObjectId: o.forensicObjectId,
    semanticObjectId: o.semanticObjectId,
    parentSectionId: o.parentSectionId,
    siblingOrder: o.siblingOrder,
    x: Math.round(o.xRatio * input.coordinateFrame.widthPx),
    y: Math.round(o.yRatio * input.coordinateFrame.heightPx),
    width: Math.round(o.widthRatio * input.coordinateFrame.widthPx),
    height: Math.round(o.heightRatio * input.coordinateFrame.heightPx),
    xRatio: o.xRatio,
    yRatio: o.yRatio,
    widthRatio: o.widthRatio,
    heightRatio: o.heightRatio,
    alignment: o.textRole?.includes('headline') ? 'left' : 'center',
    visualPriority: o.visualImportance,
    objectType: o.objectType,
    textRole: o.textRole,
    assetSlotId: rawBySemantic.get(o.semanticObjectId)?.assetSlotId ?? null,
    functionId: null,
    ownership: 'ACTIVE_PROJECT',
    styleNotes: `ingestion-merge:${o.mergeSource}:${o.validationStatus}`,
    spacingNotes: `confidence:${o.confidence.toFixed(2)}`,
    borderNotes: o.dividerRole ?? '',
    evidence: JSON.stringify(o.sourceEvidence),
    calloutNumber: index + 1,
  }));
  const body = JSON.stringify(objects.map((x) => x.forensicObjectId));
  return {
    id: `fuom-merged-${fnv1aHex(body).slice(0, 8)}`,
    hash: fnv1aHex(body),
    objects,
    canonicalViewport: {
      widthPx: input.coordinateFrame.widthPx,
      heightPx: input.coordinateFrame.heightPx,
    },
  };
}
