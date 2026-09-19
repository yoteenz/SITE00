/** Production inheritance metadata for child / grandchild design pages (Composer-owned). */

export const DESIGN_CHILD_INHERITANCE_CONTRACT_VERSION = 'design-child-inheritance-v1' as const;

export type DesignRegionClassification = 'INHERITED' | 'OVERRIDDEN' | 'NEW';

export type DesignChildInheritanceContract = {
  version: typeof DESIGN_CHILD_INHERITANCE_CONTRACT_VERSION;
  parentPageId: 'design-twin-opus-direct';
  inherits: readonly [
    'HOST_SHELL',
    'DESIGN_GRAMMAR',
    'RESPONSIVE_AUTHORITY_MODEL',
    'INTERACTION_PATTERNS',
    'ASSET_AUTHORITY_RULES',
    'PROVENANCE_BEHAVIOR',
    'READINESS_MODEL',
    'BUILD_TRANSITION_MODEL',
  ];
  defaultRegionClassification: DesignRegionClassification;
  opusRequiredFor: readonly ['NEW_PAGE_INCEPTION', 'NEW_DESIGN_FRAMEWORK', 'MAJOR_CREATIVE_RESET'];
  composerMinorTweakAllowed: readonly [
    'border_strength',
    'spacing_corrections',
    'typography_legibility',
    'responsive_cleanup',
    'alignment_fixes',
    'minor_ui_polish',
  ];
};

export const NDXBOOK_DESIGN_CHILD_INHERITANCE: DesignChildInheritanceContract = {
  version: DESIGN_CHILD_INHERITANCE_CONTRACT_VERSION,
  parentPageId: 'design-twin-opus-direct',
  inherits: [
    'HOST_SHELL',
    'DESIGN_GRAMMAR',
    'RESPONSIVE_AUTHORITY_MODEL',
    'INTERACTION_PATTERNS',
    'ASSET_AUTHORITY_RULES',
    'PROVENANCE_BEHAVIOR',
    'READINESS_MODEL',
    'BUILD_TRANSITION_MODEL',
  ],
  defaultRegionClassification: 'INHERITED',
  opusRequiredFor: ['NEW_PAGE_INCEPTION', 'NEW_DESIGN_FRAMEWORK', 'MAJOR_CREATIVE_RESET'],
  composerMinorTweakAllowed: [
    'border_strength',
    'spacing_corrections',
    'typography_legibility',
    'responsive_cleanup',
    'alignment_fixes',
    'minor_ui_polish',
  ],
};
