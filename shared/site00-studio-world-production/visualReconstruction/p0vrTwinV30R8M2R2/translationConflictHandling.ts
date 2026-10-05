import type { MobileTwinCompositionState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type { ActualVisualAnalysis, BlueprintVisualAnalysis } from '../p0vrTwinV30R8M2R1/implementationExpressionTypes.js';
import type { TranslationConflictRecord, TranslationSectionBlock } from './implementationTranslationBriefTypes.js';

export function detectTranslationConflicts(input: {
  composition: MobileTwinCompositionState;
  actualAnalysis: ActualVisualAnalysis;
  blueprintAnalysis: BlueprintVisualAnalysis;
  sectionTranslations: TranslationSectionBlock[];
}): TranslationConflictRecord[] {
  const conflicts: TranslationConflictRecord[] = [];
  const objById = new Map(input.composition.objectDefinitions.map((o) => [o.objectId, o]));

  for (const section of input.sectionTranslations) {
    for (const objectId of section.evidence.structuredObjectIds) {
      const obj = objById.get(objectId);
      const bp = input.blueprintAnalysis.perObject[objectId];
      const actual = input.actualAnalysis.perObject[objectId];
      if (!obj || !bp) continue;

      const geoMismatch =
        Math.abs(obj.normalizedX - bp.xRatio) > 0.08 || Math.abs(obj.normalizedWidth - bp.widthRatio) > 0.12;
      if (geoMismatch && section.sectionId === 'HERO_WORKSPACE') {
        conflicts.push({
          kind: 'TRANSLATION_GEOMETRY_CONFLICT',
          sectionId: section.sectionId,
          objectId,
          message: `Written hero guidance conflicts with blueprint geometry for ${objectId}`,
          resolution: 'BLUEPRINT_WINS',
        });
      }

      if (actual && actual.controlRole === 'PRIMARY' && section.sectionId === 'AUTHORITY_PANEL') {
        conflicts.push({
          kind: 'TRANSLATION_VISUAL_EVIDENCE_CONFLICT',
          sectionId: section.sectionId,
          objectId,
          message: `Actual shows primary emphasis on ${objectId} but brief limits lime in authority rail`,
          resolution: 'STRUCTURED_TRUTH_WINS',
        });
      }
    }
  }

  return conflicts;
}
