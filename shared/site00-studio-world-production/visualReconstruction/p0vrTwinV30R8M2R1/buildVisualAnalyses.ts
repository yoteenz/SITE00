import type { MobileTwinCompositionState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import { resolveTemplateKeyFromObjectId } from '../p0vrTwinV30R8M1/ndxbookImplementationCopyCatalog.js';
import { resolveControlVisualRole } from '../p0vrTwinV30R8M2/implementationMaterialStyleResolver.js';
import { resolveAuthorityTextRole } from '../p0vrTwinV30R8M2/implementationTypographyResolverR8M2.js';
import type { ActualVisualAnalysis, BlueprintVisualAnalysis } from './implementationExpressionTypes.js';
import type { IngestedAuthorityContent } from './authorityContentIngestion.js';
import { buildActualImplementationRegionMap } from '../p0vrTwinV30R8M2/actualImplementationRegionMap.js';

export function buildActualVisualAnalysis(input: {
  runId: string;
  composition: MobileTwinCompositionState;
  actual: IngestedAuthorityContent;
}): ActualVisualAnalysis {
  const regionMap = buildActualImplementationRegionMap(input.composition);
  const objById = new Map(input.composition.objectDefinitions.map((o) => [o.objectId, o]));
  const regions = regionMap.map((r) => {
    const objs = r.objectIds.map((id) => objById.get(id)).filter(Boolean);
    const xs = objs.map((o) => o!.normalizedX);
    const ys = objs.map((o) => o!.normalizedY);
    const x2 = objs.map((o) => o!.normalizedX + o!.normalizedWidth);
    const y2 = objs.map((o) => o!.normalizedY + o!.normalizedHeight);
    const minX = xs.length ? Math.min(...xs) : 0;
    const minY = ys.length ? Math.min(...ys) : 0;
    const maxX = x2.length ? Math.max(...x2) : 1;
    const maxY = y2.length ? Math.max(...y2) : 1;
    return {
    regionId: r.regionId,
    bounds: {
      xRatio: minX,
      yRatio: minY,
      widthRatio: Math.max(0.02, maxX - minX),
      heightRatio: Math.max(0.02, maxY - minY),
    },
    backgroundTreatment: r.regionId.includes('HERO') || r.regionId.includes('AUTHORITY') ? '#0f0f0f panel' : '#0a0a0a shell',
    borderTreatment: '1px solid #2a2a2a',
    paddingPx: r.regionId.includes('GALLERY') ? 8 : 10,
    internalSpacingPx: r.regionId.includes('STRUCTURED') ? 4 : 6,
    dominance:
      r.regionId.includes('HERO') || r.regionId.includes('AUTHORITY') ? ('PRIMARY' as const)
      : r.regionId.includes('HOST') ? ('TERTIARY' as const)
      : ('SECONDARY' as const),
    visualWeight: r.regionId.includes('HERO') ? 1 : 0.6,
  };
  });

  const perObject: ActualVisualAnalysis['perObject'] = {};
  for (const obj of input.composition.objectDefinitions) {
    const key = resolveTemplateKeyFromObjectId(obj.objectId);
    const typoRole = resolveAuthorityTextRole(key, obj.objectType);
    const controlRole =
      obj.objectType === 'BUTTON' || obj.objectType === 'CONTROL' || obj.objectType === 'NAV_ITEM' ?
        resolveControlVisualRole(key, obj.objectType)
      : undefined;
    perObject[obj.objectId] = {
      visualRole: obj.semanticRole,
      typographyRole: typoRole,
      controlRole,
      surfaceFill: obj.ownership === 'SITE_00_HOST' ? '#0a0a0a' : '#111111',
      assetFraming: obj.objectType === 'IMAGE' || obj.objectType === 'THUMBNAIL' ? 'cover editorial crop' : undefined,
    };
  }

  return {
    id: `ava-${input.runId}`,
    global: {
      paletteUsage: ['#000000', '#0f0f0f', '#eaeaea', '#c8ff00'],
      contrastHierarchy: 'black-dominant with off-white copy and lime reserved accents',
      density: 'COMPACT',
      visualRhythm: 'technical editorial stacked panels',
      majorEmphasis: ['HERO_WORKSPACE', 'AUTHORITY_PANEL', 'PRIMARY_CONTROLS'],
      whitespaceBehavior: 'tight inner padding; minimal section gaps',
    },
    regions,
    perObject,
  };
}

export function buildBlueprintVisualAnalysis(input: {
  runId: string;
  composition: MobileTwinCompositionState;
  blueprint: IngestedAuthorityContent;
}): BlueprintVisualAnalysis {
  const regionMap = buildActualImplementationRegionMap(input.composition);
  const objById = new Map(input.composition.objectDefinitions.map((o) => [o.objectId, o]));
  const regions = regionMap.map((r) => {
    const objs = r.objectIds.map((id) => objById.get(id)).filter(Boolean);
    const xs = objs.map((o) => o!.normalizedX);
    const ys = objs.map((o) => o!.normalizedY);
    const x2 = objs.map((o) => o!.normalizedX + o!.normalizedWidth);
    const y2 = objs.map((o) => o!.normalizedY + o!.normalizedHeight);
    const minX = xs.length ? Math.min(...xs) : 0;
    const minY = ys.length ? Math.min(...ys) : 0;
    const maxX = x2.length ? Math.max(...x2) : 1;
    const maxY = y2.length ? Math.max(...y2) : 1;
    return {
      regionId: r.regionId,
      geometry: {
        xRatio: minX,
        yRatio: minY,
        widthRatio: Math.max(0.02, maxX - minX),
        heightRatio: Math.max(0.02, maxY - minY),
      },
      alignment: 'LEFT_TOP',
      nestingDepth: r.regionId.includes('STRUCTURED') ? 2 : 1,
    };
  });

  const perObject: BlueprintVisualAnalysis['perObject'] = {};
  for (const obj of input.composition.objectDefinitions) {
    perObject[obj.objectId] = {
      xRatio: obj.normalizedX,
      yRatio: obj.normalizedY,
      widthRatio: obj.normalizedWidth,
      heightRatio: obj.normalizedHeight,
      gridBehavior: obj.objectId.includes('gallery') ? 'HORIZONTAL_THUMB_ROW' : 'STACK',
      baselineRelation: obj.objectType === 'TEXT' ? 'CAP_HEIGHT_ALIGNED' : 'BOX_ALIGNED',
    };
  }

  void input.blueprint;
  return {
    id: `bva-${input.runId}`,
    regions,
    perObject,
  };
}
