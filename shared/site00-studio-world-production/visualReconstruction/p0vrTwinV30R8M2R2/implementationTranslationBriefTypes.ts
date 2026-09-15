import type { CriticalTranslationSectionId } from './constants.js';

export type TranslationAuthorityEvidence = {
  actualRegionIds: string[];
  blueprintRegionIds: string[];
  structuredObjectIds: string[];
  assetIds: string[];
  featureIds: string[];
};

export type TranslationSectionBlock = {
  sectionId: CriticalTranslationSectionId | string;
  title: string;
  implementationGuidance: string;
  evidence: TranslationAuthorityEvidence;
};

export type TranslationConflictRecord = {
  kind: 'TRANSLATION_GEOMETRY_CONFLICT' | 'TRANSLATION_VISUAL_EVIDENCE_CONFLICT' | 'TRANSLATION_FUNCTION_CONFLICT';
  sectionId: string;
  objectId?: string;
  message: string;
  resolution: 'STRUCTURED_TRUTH_WINS' | 'BLUEPRINT_WINS' | 'ACTUAL_WINS' | 'UNRESOLVED';
};

export type ImplementationTranslationBrief = {
  id: string;
  projectId: string;
  workspaceType: string;
  viewport: 'MOBILE';
  packageId: string;
  compositionStateId: string;
  compositionHash: string;
  actualAuthorityId: string;
  blueprintAuthorityId: string;
  actualVisualAnalysisId: string;
  blueprintVisualAnalysisId: string;
  expressionVersion: string;
  briefVersion: string;
  globalTranslation: string;
  sectionTranslations: TranslationSectionBlock[];
  typographyTranslation: string;
  colorMaterialTranslation: string;
  assetTranslation: string;
  controlTranslation: string;
  interactionTranslation: string;
  responsiveTranslation: string;
  doNotDo: string;
  unresolvedTranslationItems: string[];
  authorityEvidence: TranslationAuthorityEvidence;
  translationConflicts: TranslationConflictRecord[];
  hash: string;
  status: 'DRAFT' | 'READY' | 'REVIEW_REQUIRED' | 'BLOCKED';
};

export type VisualImplementationCodingPrompt = {
  id: string;
  translationBriefId: string;
  briefVersion: string;
  promptVersion: string;
  preamble: string;
  body: string;
  fullText: string;
  hash: string;
};

export type ImplementationTranslationReadinessReceipt = {
  id: string;
  translationBriefId: string;
  criticalSectionsTranslated: boolean;
  criticalRegionsHaveEvidence: boolean;
  typographyDirectivePresent: boolean;
  materialDirectivePresent: boolean;
  assetDirectivePresent: boolean;
  controlHierarchyPresent: boolean;
  responsiveDirectivePresent: boolean;
  doNotDoPresent: boolean;
  unresolvedCriticalConflicts: number;
  status: 'READY' | 'REVIEW_REQUIRED' | 'BLOCKED';
  blockers: string[];
};

export type ImplementationTranslationFidelityReceipt = {
  buildId: string;
  translationBriefId: string;
  codingPromptId: string;
  criticalSectionMatch: boolean;
  controlHierarchyMatch: boolean;
  visualDensityMatch: boolean;
  typographyHierarchyMatch: boolean;
  assetTreatmentMatch: boolean;
  materialMatch: boolean;
  responsiveMatch: boolean;
  result: 'PASS' | 'REVIEW_REQUIRED' | 'FAIL';
  founderReviewRequired: boolean;
};

export type TranslationPromptTraceLink = {
  runtimeObjectId: string;
  expressionObjectId: string;
  translationBriefSectionId: string;
  actualEvidence: string | null;
  blueprintEvidence: string | null;
  structuredObjectId: string;
};
