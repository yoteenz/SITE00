/**
 * ASSET-FIRST production methodology (registered P0.JURNL.SITE00-INGEST-F01-DESIGN-WORKSPACE-PROOF1).
 *
 * Learned from JURNL F01: PARENT → REVERSE-EXTRACT ASSETS failed formal proof (14 attempted, 7 isolated, 50%).
 * From the second family of any project onward, an asset that must exist independently at runtime must exist
 * independently BEFORE composition. Buttons / inputs / drawers / cards are COMPONENTS, never raster assets.
 */

export const ASSET_FIRST_REQUIRED = true as const;

export const ASSET_CLASSES = [
  'GLOBAL_INHERITED',
  'FAMILY_BACKGROUND',
  'ARCHITECTURAL_LAYER',
  'ISOLATED_OBJECT',
  'BOTANICAL',
  'MATERIAL_TEXTURE',
  'LIGHT_OVERLAY',
  'ICON',
  'IMPLEMENTATION_COMPONENT',
  'DATA_VISUALIZATION',
  'NO_ASSET_REQUIRED',
] as const;
export type AssetClass = (typeof ASSET_CLASSES)[number];

/** Classes that are built in code and must never be rasterised from a composite. */
export const NON_RASTER_ASSET_CLASSES: readonly AssetClass[] = ['IMPLEMENTATION_COMPONENT', 'DATA_VISUALIZATION', 'NO_ASSET_REQUIRED'];

export const isRasterEligibleAssetClass = (c: AssetClass) => !NON_RASTER_ASSET_CLASSES.includes(c);

/** UI building blocks that are components, not assets — whatever a generated sheet shows. */
export const COMPONENT_NOT_ASSET = ['BUTTON', 'INPUT', 'CHECKBOX', 'TOGGLE', 'DRAWER', 'SHEET', 'MODAL', 'CARD', 'TOAST', 'PANEL'] as const;

export type AssetPolicyResolution = 'RESOLVED' | 'LEGACY_EXCEPTION' | 'UNRESOLVED';

export type AssetPolicy = {
  assetFirstRequired: boolean;
  resolution: AssetPolicyResolution;
  /** Required when resolution is LEGACY_EXCEPTION. */
  reason: string | null;
  /** Asset libraries explicitly excluded from runtime (failed harvests, screenshot crops). */
  excludedSources: string[];
  /** Proof lines behind the resolution (e.g. a failed harvest measurement). */
  evidence?: string[];
};

/** The canonical 17-stage product-design pipeline for asset-first families. */
export const ASSET_FIRST_PIPELINE = [
  'FAMILY_PRODUCT_CONTRACT',
  'ASSET_INVENTORY',
  'CANONICAL_ASSET_GENERATION',
  'ASSET_QA_GATE',
  'PARENT_COMPOSITION',
  'FOUNDER_PARENT_APPROVAL',
  'CHILD_EXPANSION',
  'GRANDCHILD_EXPANSION',
  'STATE_AUTHORITIES',
  'INTERACTION_AUDIT',
  'INTERACTION_AUTHORITIES',
  'ICON_PACK',
  'COMPONENT_MANIFEST',
  'IMPLEMENTATION_PACKAGE',
  'OPUS_IMPLEMENTATION',
  'LIVE_RUNTIME_QA',
  'FOUNDER_APPROVAL',
] as const;
export type AssetFirstPipelineStage = (typeof ASSET_FIRST_PIPELINE)[number];

/**
 * Policy for a family. `legacyPilot` families (built before asset-first was discovered) may carry
 * LEGACY_EXCEPTION with a documented reason; every later family must resolve the asset stage.
 */
export function assetPolicyFor(args: { legacyPilot: boolean; reason?: string; excludedSources?: string[]; evidence?: string[] }): AssetPolicy {
  if (args.legacyPilot) {
    if (!args.reason) throw new Error('LEGACY_EXCEPTION requires a documented reason');
    return { assetFirstRequired: false, resolution: 'LEGACY_EXCEPTION', reason: args.reason, excludedSources: args.excludedSources ?? [], evidence: args.evidence ?? [] };
  }
  return { assetFirstRequired: ASSET_FIRST_REQUIRED, resolution: 'UNRESOLVED', reason: null, excludedSources: args.excludedSources ?? [], evidence: args.evidence ?? [] };
}

export function isAssetPolicyResolved(p: AssetPolicy): boolean {
  return p.resolution === 'RESOLVED' || (p.resolution === 'LEGACY_EXCEPTION' && !!p.reason);
}
