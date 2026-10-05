import type { MobileTwinCompositionState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type { MobileStructuredArtifactBundle } from '../p0vrTwinV30/mobileTwinPipeline/buildMobileTwinStructuredArtifacts.js';
import { buildActualImplementationRegionMap } from '../p0vrTwinV30R8M2/actualImplementationRegionMap.js';
import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type {
  ForensicBlueprintObjectMap,
  ForensicObjectValidationReceipt,
  MergedImplementationObjectMap,
  ObjectMapAuthorityMergeReceipt,
} from './forensicIngestionTypes.js';
import { FORENSIC_OBJECT_MAP_VALIDATION_FAILED, MAX_UNRESOLVED_CRITICAL_OBJECTS } from './constants.js';

function regionIdForObject(
  composition: MobileTwinCompositionState,
  objectId: string,
): string | null {
  const regions = buildActualImplementationRegionMap(composition);
  return regions.find((r) => r.objectIds.includes(objectId))?.regionId ?? null;
}

export function validateAndMergeForensicObjectMap(input: {
  cleanedMap: ForensicBlueprintObjectMap;
  composition: MobileTwinCompositionState;
  bundle: MobileStructuredArtifactBundle;
}): {
  merged: MergedImplementationObjectMap;
  validationReceipt: ForensicObjectValidationReceipt;
  mergeReceipt: ObjectMapAuthorityMergeReceipt;
} {
  let validatedCount = 0;
  let adjustedCount = 0;
  let reviewRequiredCount = 0;
  let rejectedCount = 0;
  let conflictCount = 0;
  let unresolvedCritical = 0;

  const mergedObjects = input.cleanedMap.objects.map((fo) => {
    const pkgObj = input.composition.objectDefinitions.find((o) => o.objectId === fo.semanticObjectId);
    const actualRegion = regionIdForObject(input.composition, fo.semanticObjectId);

    let xRatio = fo.xRatio;
    let yRatio = fo.yRatio;
    let widthRatio = fo.widthRatio;
    let heightRatio = fo.heightRatio;
    let validationStatus = fo.validationStatus;
    let mergeSource: 'actual' | 'forensic' | 'package' | 'merged' = 'forensic';

    if (pkgObj) {
      const dx = Math.abs(pkgObj.normalizedX - fo.xRatio);
      const dy = Math.abs(pkgObj.normalizedY - fo.yRatio);
      if (dx > 0.08 || dy > 0.08) {
        conflictCount += 1;
        xRatio = pkgObj.normalizedX * 0.35 + fo.xRatio * 0.65;
        yRatio = pkgObj.normalizedY * 0.35 + fo.yRatio * 0.65;
        widthRatio = pkgObj.normalizedWidth * 0.25 + fo.widthRatio * 0.75;
        heightRatio = pkgObj.normalizedHeight * 0.25 + fo.heightRatio * 0.75;
        validationStatus = 'VALIDATED_WITH_ADJUSTMENT';
        mergeSource = 'merged';
        adjustedCount += 1;
      } else if (actualRegion) {
        xRatio = pkgObj.normalizedX;
        yRatio = pkgObj.normalizedY;
        widthRatio = pkgObj.normalizedWidth;
        heightRatio = pkgObj.normalizedHeight;
        validationStatus = 'VALIDATED';
        mergeSource = 'actual';
        validatedCount += 1;
      } else {
        validatedCount += 1;
        validationStatus = 'VALIDATED';
      }
    } else {
      rejectedCount += 1;
      validationStatus = 'REJECTED';
    }

    if (fo.validationStatus === 'REVIEW_REQUIRED') reviewRequiredCount += 1;
    if (fo.visualImportance >= 0.9 && validationStatus === 'REJECTED') unresolvedCritical += 1;

    return {
      ...fo,
      xRatio,
      yRatio,
      widthRatio,
      heightRatio,
      validationStatus,
      mergeSource,
      sourceEvidence: {
        ...fo.sourceEvidence,
        actualRegionRef: actualRegion ?? fo.sourceEvidence.actualRegionRef,
        packageObjectRef: fo.semanticObjectId,
      },
    };
  });

  const activeObjects = mergedObjects.filter((o) => o.validationStatus !== 'REJECTED');
  if (activeObjects.length < 10) throw new Error(FORENSIC_OBJECT_MAP_VALIDATION_FAILED);
  if (unresolvedCritical > MAX_UNRESOLVED_CRITICAL_OBJECTS) {
    throw new Error(FORENSIC_OBJECT_MAP_VALIDATION_FAILED);
  }

  const body = JSON.stringify(activeObjects.map((o) => `${o.forensicObjectId}:${o.mergeSource}`));
  return {
    merged: {
      id: `miom-${fnv1aHex(body).slice(0, 12)}`,
      hash: fnv1aHex(body),
      objects: activeObjects,
    },
    validationReceipt: {
      id: `fovr-${fnv1aHex(body).slice(0, 10)}`,
      validatedCount,
      adjustedCount,
      reviewRequiredCount,
      rejectedCount,
    },
    mergeReceipt: {
      id: `omamr-${fnv1aHex(body).slice(0, 10)}`,
      precedenceApplied: ['actual', 'forensic', 'package', 'expression', 'defaults'],
      conflictCount,
    },
  };
}
