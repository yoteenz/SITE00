
export type TranslationDrivenLayoutMode =
  | 'host-bar'
  | 'context-strip'
  | 'hero-editorial-grid'
  | 'authority-rail'
  | 'gallery-contact-sheet'
  | 'decision-row'
  | 'structured-band'
  | 'readiness-system-row'
  | 'metadata-strip'
  | 'bottom-nav-compact';

export type TranslationDrivenPlanSection = {
  regionId: string;
  translationSectionId: string;
  expressionRegionId: string;
  structuredRegionId: string;
  layoutMode: TranslationDrivenLayoutMode;
  responsiveRule: string;
  componentTreeNodeIds: string[];
  styleContractIds: string[];
  assetBindings: string[];
  functionBindings: string[];
};

export type TranslationDrivenImplementationPlan = {
  id: string;
  translationBriefId: string;
  codingPromptId: string;
  expressionIrId: string;
  packageId: string;
  pageComposition: string;
  sections: TranslationDrivenPlanSection[];
  typographyPlan: string;
  spacingPlan: string;
  controlHierarchyPlan: string;
  responsivePlan: string;
  hash: string;
};

export type TranslationDrivenComponentTreeNode = {
  componentId: string;
  componentType: string;
  translationSource: string;
  expressionSource: string;
  structuredSource: string;
  assetSource: string | null;
  functionSource: string | null;
  ownership: string;
  layoutRole: string;
  visualRole: string;
  cssClass: string;
  parentComponentId: string | null;
  structuredObjectId: string;
};

export type TranslationDrivenComponentTree = {
  id: string;
  planId: string;
  nodes: TranslationDrivenComponentTreeNode[];
  hash: string;
};

export type TranslationDrivenStyleSystem = {
  id: string;
  palette: Record<string, string>;
  typographyHierarchy: Record<string, string>;
  surfaceClasses: string[];
  borderSystem: string;
  selectedStateSystem: string;
  controlHierarchy: Record<string, string>;
  spacingSystem: Record<string, number>;
  densitySystem: string;
  hash: string;
};

export type TranslationDrivenCssContract = {
  id: string;
  styleSystemId: string;
  rootClass: string;
  rulesAdded: string[];
  selectorsRemoved: string[];
  layoutRulesRemoved: string[];
  genericDefaultsRemoved: string[];
  hash: string;
};

export type TranslationMaterialityReceipt = {
  priorRenderTreeHash: string;
  newRenderTreeHash: string;
  priorComponentCompositionHash: string;
  newComponentCompositionHash: string;
  priorLayoutContractHash: string;
  newLayoutContractHash: string;
  priorStyleContractHash: string;
  newStyleContractHash: string;
  sectionStructureChanged: boolean;
  controlGroupingChanged: boolean;
  typographyMappingChanged: boolean;
  spacingSystemChanged: boolean;
  result: 'PASS' | 'FAIL';
  failureReason?: string;
};

export type TranslationDrivenRegionConvergenceReceipt = {
  regionId: string;
  compositionMatch: boolean;
  hierarchyMatch: boolean;
  visualDensityMatch: boolean;
  controlHierarchyMatch: boolean;
  typographyMatch: boolean;
  assetTreatmentMatch: boolean;
  spacingMatch: boolean;
};
