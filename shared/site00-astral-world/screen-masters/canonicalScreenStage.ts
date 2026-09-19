/**
 * P0.E.FT5.2D — Canonical screen stage coordinate system.
 * One intrinsic geometry plane per viewport; background + overlays share one uniform transform.
 */

export type AstralAssetResolutionType =
  | 'SCREEN_REFERENCE'
  | 'BACKGROUND_SHELL'
  | 'ICON_ASSET'
  | 'AVATAR_ASSET'
  | 'DECORATIVE_ASSET';

export type CanonicalStageConfig = {
  screenId: string;
  referenceWidth: number;
  referenceHeight: number;
  backgroundSlot: string;
};

/** Normalized rect — top-left origin, 0–1 relative to canonical reference dimensions */
export type CanonicalNormRect = {
  xNorm: number;
  yNorm: number;
  wNorm: number;
  hNorm: number;
  /** Baked visual region this overlay belongs to */
  region?: string;
};

/** Center-x + top-y percentage rect (legacy-friendly within stage) */
export type CanonicalPctRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  region?: string;
};

export const AW_M_01_CANONICAL_STAGE: CanonicalStageConfig = {
  screenId: 'AW_M_01_WORLD_ENTRY',
  referenceWidth: 854,
  referenceHeight: 1842,
  backgroundSlot: 'AW_M_01_WORLD_ENTRY_BACKGROUND_V2',
};

export const AW_D_01_CANONICAL_STAGE: CanonicalStageConfig = {
  screenId: 'AW_D_01_WORLD_ENTRY',
  referenceWidth: 1536,
  referenceHeight: 1024,
  backgroundSlot: 'AW_D_01_WORLD_ENTRY_BACKGROUND_V2',
};

export const Z_INDEX_CONTRACT = {
  BACKGROUND_SHELL: 0,
  DECORATIVE_ASSET: 10,
  ICON_AVATAR: 20,
  LIVE_TEXT: 30,
  INTERACTION_HIT: 40,
  TRANSIENT_OVERLAY: 50,
} as const;

/** Mobile shell source before normalization (941×1672) */
export const AW_M_01_SHELL_SOURCE = { width: 941, height: 1672 } as const;
/** Desktop shell source before normalization (1672×941) */
export const AW_D_01_SHELL_SOURCE = { width: 1672, height: 941 } as const;

/** Uniform scale factors used during V2 shell normalization */
export const AW_M_01_NORMALIZATION_SCALE = 854 / 941;
export const AW_D_01_NORMALIZATION_SCALE = 1536 / 1672;

export function pctRectToNorm(rect: CanonicalPctRect): CanonicalNormRect {
  return {
    xNorm: (rect.x - rect.w / 2) / 100,
    yNorm: rect.y / 100,
    wNorm: rect.w / 100,
    hNorm: rect.h / 100,
    region: rect.region,
  };
}

export function normRectToPct(rect: CanonicalNormRect): CanonicalPctRect {
  return {
    x: (rect.xNorm + rect.wNorm / 2) * 100,
    y: rect.yNorm * 100,
    w: rect.wNorm * 100,
    h: rect.hNorm * 100,
    region: rect.region,
  };
}

/** Resolve normalized rect to pixel values at rendered stage size */
export function resolveNormRectPixels(
  rect: CanonicalNormRect,
  stageWidth: number,
  stageHeight: number,
): { left: number; top: number; width: number; height: number } {
  return {
    left: rect.xNorm * stageWidth,
    top: rect.yNorm * stageHeight,
    width: rect.wNorm * stageWidth,
    height: rect.hNorm * stageHeight,
  };
}

/** CSS percentage style from normalized rect (stage fills container uniformly) */
export function canonicalNormRectStyle(rect: CanonicalNormRect): Record<string, string | number> {
  return {
    position: 'absolute',
    left: `${rect.xNorm * 100}%`,
    top: `${rect.yNorm * 100}%`,
    width: `${rect.wNorm * 100}%`,
    height: `${rect.hNorm * 100}%`,
  };
}

/** Center-x + top-y percentage style (compatible with existing overlay components) */
export function canonicalPctRectStyle(rect: CanonicalPctRect): Record<string, string | number> {
  return {
    position: 'absolute',
    left: `${rect.x - rect.w / 2}%`,
    top: `${rect.y}%`,
    width: `${rect.w}%`,
    height: `${rect.h}%`,
  };
}

/** Panel-relative inset positioning within a parent row bounds */
export function panelRelativeStyle(
  parent: CanonicalNormRect,
  inset: { left: number; top: number; right: number; bottom: number },
): Record<string, string | number> {
  const innerW = parent.wNorm * (1 - inset.left - inset.right);
  const innerH = parent.hNorm * (1 - inset.top - inset.bottom);
  return {
    position: 'absolute',
    left: `${(parent.xNorm + parent.wNorm * inset.left) * 100}%`,
    top: `${(parent.yNorm + parent.hNorm * inset.top) * 100}%`,
    width: `${innerW * 100}%`,
    height: `${innerH * 100}%`,
  };
}

export type AssetResolverKind = 'BACKGROUND_V2' | 'USER_PORTRAIT' | 'ICON_ASSET' | 'INLINE_SVG';

export function assertAssetResolutionType(
  resolver: AssetResolverKind,
  resolutionType: AstralAssetResolutionType,
  slotKey: string,
): void {
  if (resolutionType === 'SCREEN_REFERENCE' && resolver !== 'BACKGROUND_V2') {
    throw new Error(
      `Asset slot ${slotKey}: SCREEN_REFERENCE cannot resolve as ${resolver}. Use ICON_ASSET or AVATAR_ASSET.`,
    );
  }
}

export function validateManifestResolvers(
  manifest: Record<string, { resolver: AssetResolverKind; resolutionType?: AstralAssetResolutionType }>,
): void {
  for (const [slotKey, entry] of Object.entries(manifest)) {
    if (entry.resolutionType) {
      assertAssetResolutionType(entry.resolver, entry.resolutionType, slotKey);
    }
  }
}
