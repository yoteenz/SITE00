import type { CompiledMobileTwinImplementationDocument } from '../p0vrTwinV30R8M/types.js';
import type { ImplementationTranslationBrief, VisualImplementationCodingPrompt } from './implementationTranslationBriefTypes.js';
import type { ImplementationTranslationFidelityReceipt } from './implementationTranslationBriefTypes.js';

export function buildImplementationTranslationFidelityReceipt(input: {
  buildId: string;
  brief: ImplementationTranslationBrief;
  codingPrompt: VisualImplementationCodingPrompt;
  document: CompiledMobileTwinImplementationDocument;
}): ImplementationTranslationFidelityReceipt {
  const doc = input.document;
  const briefConsumed = Boolean(doc.translationBriefConsumed && doc.implementationTranslationBrief?.id === input.brief.id);
  const promptInjected = Boolean(doc.codingPromptInjected && doc.visualImplementationCodingPrompt?.id === input.codingPrompt.id);

  const controlHierarchyMatch =
    briefConsumed &&
    doc.implementationExpressionIr?.controlHierarchy.entries.some((e) => e.role === 'PRIMARY') === true &&
    doc.implementationExpressionIr.controlHierarchy.entries.filter((e) => e.role === 'PRIMARY').length <= 4;

  const visualDensityMatch =
    briefConsumed && (doc.implementationExpressionIr?.spatialRhythmSystem.sectionGapPx ?? 99) <= 10;

  const criticalSectionMatch = briefConsumed && (doc.implementationTranslationBrief?.sectionTranslations.length ?? 0) >= 10;

  const passes = briefConsumed && promptInjected && criticalSectionMatch && controlHierarchyMatch;

  return {
    buildId: input.buildId,
    translationBriefId: input.brief.id,
    codingPromptId: input.codingPrompt.id,
    criticalSectionMatch,
    controlHierarchyMatch,
    visualDensityMatch,
    typographyHierarchyMatch: briefConsumed,
    assetTreatmentMatch: briefConsumed,
    materialMatch: briefConsumed,
    responsiveMatch: briefConsumed,
    result: passes ? 'PASS' : 'REVIEW_REQUIRED',
    founderReviewRequired: true,
  };
}
