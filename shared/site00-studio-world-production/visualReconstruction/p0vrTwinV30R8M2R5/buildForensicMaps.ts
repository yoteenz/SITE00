import type { MobileTwinCompositionState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type { MobileStructuredArtifactBundle } from '../p0vrTwinV30/mobileTwinPipeline/buildMobileTwinStructuredArtifacts.js';
import { resolveTemplateKeyFromObjectId } from '../p0vrTwinV30R8M1/ndxbookImplementationCopyCatalog.js';
import { buildActualImplementationRegionMap } from '../p0vrTwinV30R8M2/actualImplementationRegionMap.js';
import type { CriticalImplementationRegionId } from '../p0vrTwinV30R8M2/constants.js';
import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type { ForensicSectionId } from './constants.js';
import { FORENSIC_OBJECT_MAP_INCOMPLETE } from './constants.js';
import type {
  ForensicAssetPlacementMap,
  ForensicImplementationSpec,
  ForensicSpacingMap,
  ForensicTypographyMap,
  ForensicUiObjectEntry,
  ForensicUiObjectMap,
  ForensicUiSectionEntry,
  ForensicUiSectionMap,
  ForensicVisualStyleMap,
} from './forensicTypes.js';

function mapRegion(id: CriticalImplementationRegionId): ForensicSectionId {
  if (id === 'HOST_HEADER') return 'HOST_SHELL';
  if (id === 'CONCEPT_DATA') return 'CONCEPT_DATA_HISTORY';
  return id as ForensicSectionId;
}

export function buildForensicUiObjectMap(input: {
  composition: MobileTwinCompositionState;
  bundle: MobileStructuredArtifactBundle;
  canonicalViewport: { widthPx: number; heightPx: number };
  blueprintAuthorityId: string;
}): ForensicUiObjectMap {
  const regionMap = buildActualImplementationRegionMap(input.composition);
  const objects: ForensicUiObjectEntry[] = input.composition.objectDefinitions.map((obj, index) => {
    const key = resolveTemplateKeyFromObjectId(obj.objectId);
    const regionEntry = regionMap.find((r) => r.objectIds.includes(obj.objectId));
    const parentSectionId = mapRegion(regionEntry?.regionId ?? 'HERO_WORKSPACE');
    return {
      forensicObjectId: `fobj-${String(index + 1).padStart(3, '0')}`,
      semanticObjectId: obj.objectId,
      parentSectionId,
      siblingOrder: index,
      x: Math.round(obj.normalizedX * input.canonicalViewport.widthPx),
      y: Math.round(obj.normalizedY * input.canonicalViewport.heightPx),
      width: Math.round(obj.normalizedWidth * input.canonicalViewport.widthPx),
      height: Math.round(obj.normalizedHeight * input.canonicalViewport.heightPx),
      xRatio: obj.normalizedX,
      yRatio: obj.normalizedY,
      widthRatio: obj.normalizedWidth,
      heightRatio: obj.normalizedHeight,
      alignment: key.includes('headline') ? 'left' : 'center',
      visualPriority: obj.visualImportance === 'CRITICAL' ? 1 : 0.5,
      objectType: obj.objectType,
      textRole: obj.objectType.includes('TEXT') || obj.objectType.includes('HEADLINE') ? key : null,
      assetSlotId: obj.assetRef,
      functionId: obj.functionTarget,
      ownership: obj.ownership,
      styleNotes: 'forensic-measured-from-actual-composition',
      spacingNotes: 'gap-from-actual',
      borderNotes: '1px #333 unless control-primary',
      evidence: `actual+${input.blueprintAuthorityId}+${parentSectionId}`,
      calloutNumber: index + 1,
    };
  });

  if (objects.length < 10) {
    throw new Error(FORENSIC_OBJECT_MAP_INCOMPLETE);
  }

  const body = JSON.stringify(objects.map((o) => o.forensicObjectId));
  return {
    id: `fuom-${fnv1aHex(body).slice(0, 12)}`,
    hash: fnv1aHex(body),
    objects,
    canonicalViewport: input.canonicalViewport,
  };
}

export function buildForensicUiSectionMap(input: {
  composition: MobileTwinCompositionState;
  objectMap: ForensicUiObjectMap;
}): ForensicUiSectionMap {
  const regionMap = buildActualImplementationRegionMap(input.composition);
  const sections: ForensicUiSectionEntry[] = regionMap.map((r) => {
    const sectionId = mapRegion(r.regionId);
    const objs = input.objectMap.objects.filter((o) => o.parentSectionId === sectionId);
    const xs = objs.map((o) => o.xRatio);
    const ys = objs.map((o) => o.yRatio);
    const x2 = objs.map((o) => o.xRatio + o.widthRatio);
    const y2 = objs.map((o) => o.yRatio + o.heightRatio);
    const minX = xs.length ? Math.min(...xs) : 0;
    const minY = ys.length ? Math.min(...ys) : 0;
    const maxX = x2.length ? Math.max(...x2) : 1;
    const maxY = y2.length ? Math.max(...y2) : 0.1;
    const cols =
      sectionId === 'HERO_WORKSPACE' ? 3
      : sectionId === 'CANDIDATE_GALLERY' ? 4
      : sectionId === 'STRUCTURED_OUTPUT' ? 5
      : sectionId === 'BOTTOM_NAV' ? 5
      : 1;
    return {
      sectionId,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      xRatio: minX,
      yRatio: minY,
      widthRatio: Math.max(0.05, maxX - minX),
      heightRatio: Math.max(0.03, maxY - minY),
      parentSectionId: sectionId === 'HOST_SHELL' ? null : 'HOST_SHELL',
      childSectionIds: [],
      layoutMode: sectionId === 'HERO_WORKSPACE' ? 'grid' : sectionId.includes('GALLERY') ? 'grid' : 'flex',
      columnCount: cols,
      rowCount: sectionId === 'READINESS' ? 2 : 1,
      internalGapPx: sectionId.includes('GALLERY') ? 6 : 8,
      paddingPx: 10,
      visualWeight: sectionId === 'HERO_WORKSPACE' ? 1 : 0.55,
      surfaceTreatment: '#0a0a0a',
      dividerBehavior: '1px #222 between sections',
    };
  });
  const body = JSON.stringify(sections.map((s) => s.sectionId));
  return { id: `fusm-${fnv1aHex(body).slice(0, 10)}`, hash: fnv1aHex(body), sections };
}

export function buildForensicTypographyMap(objectMap: ForensicUiObjectMap): ForensicTypographyMap {
  const entries = objectMap.objects
    .filter((o) => o.textRole)
    .map((o) => ({
      objectId: o.semanticObjectId,
      textRole: o.textRole!,
      approximateFamily: o.textRole!.includes('headline') ? 'display' : 'ui-sans',
      sizePx: o.textRole!.includes('headline') ? 22 : o.textRole!.includes('nav') ? 8 : 12,
      weight: o.textRole!.includes('headline') ? 900 : 500,
      lineHeight: o.textRole!.includes('headline') ? 1.05 : 1.2,
      tracking: o.textRole!.includes('headline') ? '-0.02em' : '0',
      textCase: o.textRole!.includes('nav') ? 'uppercase' : 'none',
      alignment: o.alignment,
      widthRatio: o.widthRatio,
      lineCountTarget: o.textRole!.includes('headline') ? 2 : 1,
      wrapPattern: 'forensic-visible-wrap',
      prominence: o.visualPriority,
    }));
  const body = JSON.stringify(entries);
  return { id: `ftm-${fnv1aHex(body).slice(0, 10)}`, hash: fnv1aHex(body), entries };
}

export function buildForensicVisualStyleMap(): ForensicVisualStyleMap {
  const style = {
    pageBackground: '#0a0a0a',
    hostBackground: '#050505',
    projectSurface: '#111111',
    textPrimary: '#f0f0f0',
    textSecondary: '#bdbdbd',
    textMuted: '#888888',
    limeAccent: '#c8ff00',
    systemAccent: '#4ade80',
    borderColor: '#333333',
    dividerColor: '#222222',
    borderThicknessPx: 1,
    radiusPx: 4,
    selectedState: 'lime-outline',
    activeState: 'lime-fill-muted',
  };
  return { id: 'fvsm-v1', hash: fnv1aHex(JSON.stringify(style)), ...style };
}

export function buildForensicSpacingMap(sectionMap: ForensicUiSectionMap): ForensicSpacingMap {
  const hero = sectionMap.sections.find((s) => s.sectionId === 'HERO_WORKSPACE');
  const spacing = {
    outerMarginPx: 0,
    sectionGapPx: 8,
    sectionPaddingPx: hero?.paddingPx ?? 10,
    rowGapPx: 6,
    columnGapPx: hero?.internalGapPx ?? 8,
    textToControlGapPx: 4,
    cardGapPx: 6,
    navGapPx: 2,
    heroInternalGapPx: 6,
    authorityRailSpacingPx: 6,
  };
  return { id: 'fspm-v1', hash: fnv1aHex(JSON.stringify(spacing)), ...spacing };
}

export function buildForensicAssetPlacementMap(objectMap: ForensicUiObjectMap): ForensicAssetPlacementMap {
  const assets = objectMap.objects
    .filter((o) => o.assetSlotId)
    .map((o) => ({
      canonicalAssetId: o.assetSlotId!,
      targetObjectId: o.semanticObjectId,
      xRatio: o.xRatio,
      yRatio: o.yRatio,
      widthRatio: o.widthRatio,
      heightRatio: o.heightRatio,
      aspectRatio: o.parentSectionId.includes('GALLERY') ? '3/4' : '4/3',
      crop: 'center',
      focalPoint: 'center',
      objectFit: 'cover',
      framing: '1px #444',
      border: '1px solid #444',
      background: '#000',
    }));
  return { id: `fapm-${fnv1aHex(JSON.stringify(assets)).slice(0, 10)}`, hash: fnv1aHex(JSON.stringify(assets)), assets };
}

export function buildForensicImplementationSpec(input: {
  objectMap: ForensicUiObjectMap;
  sectionMap: ForensicUiSectionMap;
  typographyMap: ForensicTypographyMap;
  visualStyleMap: ForensicVisualStyleMap;
  spacingMap: ForensicSpacingMap;
  assetMap: ForensicAssetPlacementMap;
}): ForensicImplementationSpec {
  const body = JSON.stringify([
    input.objectMap.hash,
    input.sectionMap.hash,
    input.typographyMap.hash,
    input.visualStyleMap.hash,
    input.spacingMap.hash,
    input.assetMap.hash,
  ]);
  return {
    id: `fis-${fnv1aHex(body).slice(0, 12)}`,
    hash: fnv1aHex(body),
    objectMapId: input.objectMap.id,
    sectionMapId: input.sectionMap.id,
    typographyMapId: input.typographyMap.id,
    visualStyleMapId: input.visualStyleMap.id,
    spacingMapId: input.spacingMap.id,
    assetMapId: input.assetMap.id,
  };
}
