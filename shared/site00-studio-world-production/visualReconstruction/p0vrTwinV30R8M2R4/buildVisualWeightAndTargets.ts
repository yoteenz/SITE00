import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import { resolveTemplateKeyFromObjectId } from '../p0vrTwinV30R8M1/ndxbookImplementationCopyCatalog.js';
import type { MobileTwinCompositionState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type {
  AssetReconstructionTarget,
  CompositionRelationshipTargets,
  ControlReconstructionTarget,
  TypographyReconstructionTarget,
  VisualWeightContract,
} from './actualFirstTypes.js';
import type { CriticalReconstructionRegionId } from './constants.js';

export function buildCompositionRelationshipTargets(_composition: MobileTwinCompositionState): CompositionRelationshipTargets {
  return {
    heroLeftRightRatio: 0.38,
    heroToAuthorityPanelRatio: 2.4,
    headlineBlockWidthRatio: 0.36,
    artifactWidthRatio: 0.34,
    galleryCardAspect: '3/4',
    galleryCardGapPx: 6,
    structuredOutputCardWidthRatio: 0.18,
    readinessClusterWidthRatio: 0.22,
    bottomNavItemWidthRatio: 0.2,
    sectionVerticalSpacingPx: 8,
  };
}

export function buildVisualWeightContract(composition: MobileTwinCompositionState): VisualWeightContract {
  const objects = composition.objectDefinitions
    .map((obj) => {
      const key = resolveTemplateKeyFromObjectId(obj.objectId);
      const area = obj.normalizedWidth * obj.normalizedHeight;
      let rank = 5;
      if (key.includes('dominant') || key.includes('headline')) rank = 1;
      else if (key.includes('authority') || key.includes('artifact')) rank = 2;
      else if (key.includes('gallery')) rank = 3;
      return {
        objectKey: key,
        dominanceRank: rank,
        relativeArea: area,
        contrastWeight: obj.visualImportance === 'CRITICAL' ? 1 : 0.5,
        typographyWeight: key.includes('headline') ? 1 : 0.35,
        colorEmphasis: key.includes('lime') || key.includes('select') ? 'lime-accent' : 'neutral',
        positionalPriority: Math.round((1 - obj.normalizedY) * 10),
      };
    })
    .sort((a, b) => a.dominanceRank - b.dominanceRank)
    .slice(0, 40);
  const body = JSON.stringify(objects);
  return { id: `vwc-${fnv1aHex(body).slice(0, 10)}`, objects, hash: fnv1aHex(body) };
}

export function buildTypographyReconstructionTargets(
  composition: MobileTwinCompositionState,
): TypographyReconstructionTarget[] {
  return composition.objectDefinitions
    .filter((o) => o.objectType.includes('TEXT') || o.objectType.includes('HEADLINE') || o.objectType === 'LABEL')
    .map((obj) => {
      const key = resolveTemplateKeyFromObjectId(obj.objectId);
      const headline = key.includes('dominant') || key.includes('headline');
      return {
        objectKey: key,
        fontCategory: headline ? 'display-grotesk' : 'ui-sans',
        approximateFontSizePx: headline ? 22 : key.includes('metadata') ? 9 : 12,
        weight: headline ? 900 : 500,
        lineHeight: headline ? 1.05 : 1.2,
        tracking: headline ? '-0.02em' : '0',
        casing: key.includes('nav') ? 'uppercase' : 'none',
        lineCountTarget: headline ? 2 : 1,
        widthConstraintRatio: obj.normalizedWidth,
        alignment: headline ? 'left' : 'center',
        visualProminence: headline ? 1 : 0.4,
      };
    });
}

export function buildControlReconstructionTargets(composition: MobileTwinCompositionState): ControlReconstructionTarget[] {
  return composition.objectDefinitions
    .filter((o) => o.objectType === 'BUTTON' || o.objectType === 'CONTROL' || o.objectType === 'NAV_ITEM')
    .map((obj) => {
      const key = resolveTemplateKeyFromObjectId(obj.objectId);
      const primary = key.includes('select') || key.includes('promote') || key.includes('lock');
      return {
        objectKey: key,
        visibleWidthPx: Math.round(obj.normalizedWidth * 390),
        visibleHeightPx: Math.max(28, Math.round(obj.normalizedHeight * 844)),
        borderTreatment: primary ? '1px solid #c8ff00' : '1px solid #333',
        fillTreatment: primary ? '#111' : '#0a0a0a',
        labelAlignment: 'center',
        textScalePx: key.includes('nav') ? 8 : 11,
        selectedTreatment: primary ? 'lime-outline' : 'muted',
        hierarchyRole: primary ? 'PRIMARY' : key.includes('nav') ? 'TERTIARY' : 'SECONDARY',
        groupSpacingPx: key.includes('authority') ? 6 : 4,
      };
    });
}

export function buildAssetReconstructionTargets(composition: MobileTwinCompositionState): AssetReconstructionTarget[] {
  return composition.objectDefinitions
    .filter((o) => o.assetRef && (o.objectType === 'IMAGE' || o.objectType === 'THUMBNAIL'))
    .map((obj) => {
      const key = resolveTemplateKeyFromObjectId(obj.objectId);
      let region: CriticalReconstructionRegionId = 'HERO_WORKSPACE';
      if (key.includes('gallery')) region = 'CANDIDATE_GALLERY';
      return {
        canonicalAssetId: obj.assetRef!,
        objectKey: key,
        targetRegionId: region,
        aspectRatio: key.includes('gallery') ? '3/4' : '4/3',
        crop: 'editorial-center',
        objectFit: 'cover',
        focalPoint: 'center',
        visibleScale: 1,
        surroundingPaddingPx: key.includes('gallery') ? 0 : 4,
        borderFraming: '1px #444',
      };
    });
}
