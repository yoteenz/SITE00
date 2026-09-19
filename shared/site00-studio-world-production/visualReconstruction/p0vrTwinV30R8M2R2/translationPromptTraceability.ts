import type { ImplementationExpressionIR } from '../p0vrTwinV30R8M2R1/implementationExpressionTypes.js';
import type { ImplementationTranslationBrief, TranslationPromptTraceLink } from './implementationTranslationBriefTypes.js';

export function buildTranslationPromptTraceLinks(input: {
  compositionObjectIds: string[];
  expressionIr: ImplementationExpressionIR;
  brief: ImplementationTranslationBrief;
}): TranslationPromptTraceLink[] {
  const exprById = new Map(input.expressionIr.objectExpressions.map((o) => [o.objectId, o]));

  return input.compositionObjectIds.map((objectId) => {
    const expr = exprById.get(objectId);
    const section =
      input.brief.sectionTranslations.find((s) => s.evidence.structuredObjectIds.includes(objectId))?.sectionId ??
      expr?.regionId ??
      'GLOBAL_PAGE_CHARACTER';

    return {
      runtimeObjectId: objectId,
      expressionObjectId: expr?.objectId ?? objectId,
      translationBriefSectionId: section,
      actualEvidence: expr?.authorityEvidence.actualRegion ?? null,
      blueprintEvidence: expr?.authorityEvidence.blueprintRegion ?? null,
      structuredObjectId: objectId,
    };
  });
}
