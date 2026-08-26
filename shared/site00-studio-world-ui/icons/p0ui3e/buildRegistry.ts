import type { NDXIconName, NdxIconDefinition } from '../types.js';
import { NDX_ICON_VIEWBOX, NDX_ICON_STROKE_DEFAULT } from '../tokens.js';
import { NDX_ICON_GEOMETRY_V2 } from '../p0ui3b/geometry/ndxIconGeometryV2PixelTraced.js';
import { buildPixelTracedSpec } from '../p0ui3b/geometry/ndxIconGeometryV2PixelTraced.js';
import { NDX_ICON_VISUAL_CANON_V3, P0_UI_3D_TARGET_ICONS } from '../p0ui3d/constants.js';
import { NDX_ICON_GEOMETRY_V3 } from '../p0ui3d/geometry/ndxIconGeometryV3ReferenceLocked.js';
import { computeOpticalBoundsFromPaths, computeOpticalCalibration } from '../p0ui3b/footprint.js';
import { NDX_V3_ASSET_REGISTRY, type V3AssetRegistryEntry } from './v3AssetRegistry.generated.js';
import { activeDefinitionContainsLegacySignature } from './authorityState.js';

function assetToDefinition(asset: V3AssetRegistryEntry): NdxIconDefinition {
  const name = asset.iconName;
  const geom = NDX_ICON_GEOMETRY_V3[name];
  const bounds = computeOpticalBoundsFromPaths(asset.paths, asset.circles);
  const optical = computeOpticalCalibration(bounds, geom?.opticalScale ?? 1);
  if (geom?.opticalOffsetX) optical.opticalOffsetX = geom.opticalOffsetX;
  if (geom?.opticalOffsetY) optical.opticalOffsetY = geom.opticalOffsetY;

  if (activeDefinitionContainsLegacySignature(name, asset.paths)) {
    throw new Error(`FAIL_OLD_PATH_SIGNATURE_STILL_ACTIVE: ${name}`);
  }

  const hostCanonical =
    name === 'projects' || name === 'origin' || name === 'back_to_projects' || name === 'return_to_origin';

  return {
    name,
    paths: asset.paths.map((d) => ({ d })),
    circles: asset.circles.length ? asset.circles.map((c) => ({ ...c })) : undefined,
    hostCanonical: hostCanonical || undefined,
    visualVersion: NDX_ICON_VISUAL_CANON_V3,
    traceClassification: 'REFERENCE_LOCKED',
    visualMatchStatus: 'VISUAL_MATCH',
    referenceSampleId: asset.referenceId,
    strokeWidth: asset.strokeWidth,
    optical: {
      opticalScale: geom?.opticalScale ?? 1,
      opticalOffsetX: geom?.opticalOffsetX ?? 0,
      opticalOffsetY: geom?.opticalOffsetY ?? 0,
      bounds,
    },
    activeBehavior: 'color-only',
    supersededGeometryId: 'SUPERSEDED_BY_P0_UI_3E',
    sourcePath: asset.sourcePath,
    sourceHash: asset.sourceHash,
    publicPath: asset.publicPath,
    runtimeVersion: 'v3',
    runtimeSource: 'reference-canon',
    geometryAuthority: 'ACTIVE_CANONICAL',
  };
}

function buildV2LegacyDefinition(name: NDXIconName): NdxIconDefinition {
  const raw = NDX_ICON_GEOMETRY_V2[name];
  const trace = buildPixelTracedSpec(name, `${name}-v2-legacy`, raw);
  return {
    name,
    paths: trace.pathData.map((d) => ({ d })),
    circles: trace.circleData?.map((c) => ({ ...c })),
    visualVersion: trace.visualVersion,
    traceClassification: 'PIXEL_TRACED',
    visualMatchStatus: trace.visualMatchStatus,
    referenceSampleId: trace.referenceSampleId,
    strokeWidth: trace.strokeWidth,
    optical: {
      opticalScale: raw.opticalScale ?? 1,
      opticalOffsetX: raw.opticalOffsetX ?? 0,
      opticalOffsetY: raw.opticalOffsetY ?? 0,
      bounds: trace.opticalBounds,
    },
    activeBehavior: 'color-only',
    supersededGeometryId: trace.supersededGeometryId,
    geometryAuthority: 'LEGACY',
  };
}

/**
 * P0.UI.3E — Registry backed exclusively by physical V3 SVG assets for target icons.
 * NO fallback to V1/V2 inline geometry for targets.
 */
export function buildV3AssetBackedIconRegistry(): Record<NDXIconName, NdxIconDefinition> {
  const registry = {} as Record<NDXIconName, NdxIconDefinition>;

  for (const name of P0_UI_3D_TARGET_ICONS) {
    const asset = NDX_V3_ASSET_REGISTRY[name];
    if (!asset) {
      throw new Error(`FAIL_BUILD_EXCLUDES_V3_ICON: missing V3 asset for ${name}`);
    }
    registry[name] = assetToDefinition(asset);
  }

  for (const name of Object.keys(NDX_ICON_GEOMETRY_V3) as NDXIconName[]) {
    if (P0_UI_3D_TARGET_ICONS.includes(name)) continue;
    registry[name] = buildV2LegacyDefinition(name);
  }

  return registry;
}

export function getV3AssetManifest() {
  return Object.values(NDX_V3_ASSET_REGISTRY);
}

export { NDX_ICON_VIEWBOX, NDX_ICON_STROKE_DEFAULT, NDX_V3_ASSET_REGISTRY };
