export const P0_VR_TWIN_V23_BUILD = 'v372' as const;

export const TWIN_V2_BUILD_MODES = [
  'PACKAGE_DRIVEN_SOURCE_GENERATION',
  'INVALID_SEMANTIC_FALLBACK',
  'INVALID_TEMPLATE_FALLBACK',
] as const;

export const TWIN_V2_BUILD_STAGES = ['PACKAGE', 'SOURCE', 'RENDER', 'FIDELITY', 'COMPLETE', 'FAILED'] as const;

export const TWIN_V2_LINEAGE_ERROR_CODES = [
  'TWIN_V2_LINEAGE_MISMATCH',
  'TWIN_V2_EXECUTABLE_PACKAGE_INCOMPLETE',
  'TWIN_V2_PACKAGE_CONSUMPTION_FAILED',
  'TWIN_V2_FULL_PAGE_IMAGE_CHEAT',
  'TWIN_V2_GENERIC_RECOMPOSITION',
  'TWIN_V2_GHOSTED_AUTHORITY_IMAGE',
] as const;

export const DEFAULT_TWIN_V2_BUILD_POLICY = {
  requiresApprovedConcept: true,
  requiresExecutablePackage: true,
  allowsSemanticFallback: false,
  allowsTemplateFallback: false,
  allowsV1Fallback: false,
  allowsGenericSourceGeneration: false,
  allowsCreativeReinterpretation: false,
} as const;
