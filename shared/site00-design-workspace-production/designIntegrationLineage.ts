/**
 * P0.VR.DESIGN-INTEGRATION1 — Twin → production DESIGN workspace lineage.
 */

export const DESIGN_INTEGRATION_SOURCE_DESIGN = 'twin-opus-direct' as const;

export const DESIGN_INTEGRATION_PROMOTED_TO = 'production-design-workspace' as const;

export const DESIGN_INTEGRATION_LINEAGE = {
  sourceDesign: DESIGN_INTEGRATION_SOURCE_DESIGN,
  promotedTo: DESIGN_INTEGRATION_PROMOTED_TO,
  interactionContractVersion: '2.0.0',
  designAuthorityVersion: 'design-authority-v1',
  assetManifestVersion: 'twin-opus-direct-assets-v1',
  sprint: 'P0.VR.DESIGN-INTEGRATION1',
} as const;

export type DesignProductionSection =
  | 'references'
  | 'assets'
  | 'pages'
  | 'skins'
  | 'history'
  | 'more';

export const DESIGN_PRODUCTION_PRIMARY_NAV_SECTIONS: readonly DesignProductionSection[] = [
  'references',
  'assets',
  'pages',
  'skins',
  'history',
] as const;
