import type {
  ActualVisualAnalysis,
  BlueprintVisualAnalysis,
  ImplementationAuthorityConflict,
} from './implementationExpressionTypes.js';

export function mergeVisualAuthorityEvidence(input: {
  objectId: string;
  actual: ActualVisualAnalysis;
  blueprint: BlueprintVisualAnalysis;
}): {
  actualRegion: string | null;
  blueprintRegion: string | null;
  evidenceConfidence: number;
  conflicts: ImplementationAuthorityConflict[];
} {
  const actualObj = input.actual.perObject[input.objectId];
  const bpObj = input.blueprint.perObject[input.objectId];
  const conflicts: ImplementationAuthorityConflict[] = [];

  if (actualObj && bpObj) {
    const areaDelta = Math.abs(bpObj.widthRatio * bpObj.heightRatio - 0.04);
    if (areaDelta > 0.12 && bpObj.widthRatio > 0.35) {
      conflicts.push({
        objectId: input.objectId,
        property: 'geometry_emphasis',
        actualValue: actualObj.visualRole,
        blueprintValue: `${bpObj.widthRatio.toFixed(3)}x${bpObj.heightRatio.toFixed(3)}`,
        resolution: 'UNRESOLVED',
      });
    }
  }

  const region =
    input.actual.regions.find((r) => r.regionId.includes('HERO') || r.regionId.includes('AUTHORITY'))?.regionId ??
    null;

  return {
    actualRegion: actualObj ? region : null,
    blueprintRegion: bpObj ? region : null,
    evidenceConfidence: actualObj && bpObj ? 0.88 : 0.5,
    conflicts,
  };
}
