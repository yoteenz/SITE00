import type { MobileTwinCompositionState, MobileTwinPipelineState, MobileTwinPackage } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type { MobileStructuredArtifactBundle } from '../p0vrTwinV30/mobileTwinPipeline/buildMobileTwinStructuredArtifacts.js';
import type {
  CompiledMobileTwinNode,
  MobileTwinImplementationRenderTree,
  MobileTwinImplementationRenderTreeNode,
} from '../p0vrTwinV30R8M/types.js';
import { resolveTemplateKeyFromObjectId } from '../p0vrTwinV30R8M1/ndxbookImplementationCopyCatalog.js';
import { assertProductionCopyAllowed } from '../p0vrTwinV30R8M1/semanticDebugLabelFirewall.js';
import type { ImplementationAuthorityBundle } from '../p0vrTwinV30R8M1/resolveImplementationAuthorities.js';
import { resolveCanonicalRuntimeAsset, type RuntimeAssetTraceability } from './canonicalAssetRebind.js';
import { assertRuntimeImageSourceAllowed } from './runtimeAuthorityRasterFirewall.js';
import { resolveCombinedTypographyStyles } from './implementationTypographyResolverR8M2.js';
import {
  materialStylesForControl,
  materialStylesForSurface,
  resolveControlVisualRole,
} from './implementationMaterialStyleResolver.js';
import { spatialStylesForSection } from './implementationSpatialRhythmContract.js';
import { resolveR8M2ImplementationCopy } from './ndxbookImplementationCopyR8M2.js';

function sectionForObjectKey(key: string): string {
  if (key.startsWith('host-')) return 'host';
  if (key.startsWith('context-') || key === 'context-strip') return 'context';
  if (key.startsWith('mobile-nav-') || key === 'mobile-bottom-nav-shell') return 'bottom-nav';
  if (key.includes('gallery')) return 'gallery';
  if (key.includes('readiness')) return 'readiness';
  if (['grounding-card', 'blueprint-card', 'overlay-card', 'assets-card', 'function-card', 'structured-output'].includes(key)) {
    return 'structured-output';
  }
  if (['refine-btn', 'regen-btn', 'inspect-btn', 'primary-next-action', 'decision-bar', 'compare-control'].includes(key)) {
    return 'decision';
  }
  if (
    key.startsWith('dominant-') ||
    key.includes('authority') ||
    key.includes('select-') ||
    key.includes('promote-') ||
    key.includes('lock-pair') ||
    key.includes('pair-review') ||
    key.includes('review-authority') ||
    key.includes('replace-')
  ) {
    return 'hero';
  }
  if (key.includes('history') || key.includes('amendment') || key.includes('concept')) return 'readiness';
  return 'workspace';
}

function componentMapping(primitive: string, category: string): { componentType: string; componentName: string } {
  if (category === 'BUTTON') return { componentType: 'BUTTON', componentName: 'Site00TwinButton' };
  if (category === 'NAV_ITEM') return { componentType: 'NAV_ITEM', componentName: 'Site00TwinNavItem' };
  if (category === 'IMAGE') return { componentType: 'IMAGE_REGION', componentName: 'Site00TwinImageRegion' };
  if (category === 'TEXT') return { componentType: 'TEXT_BLOCK', componentName: 'Site00TwinTextBlock' };
  if (category === 'PANEL' || category === 'SURFACE') return { componentType: 'PANEL', componentName: 'Site00TwinPanel' };
  if (category === 'THUMBNAIL') return { componentType: 'CARD', componentName: 'Site00TwinGalleryThumb' };
  if (category === 'ARTIFACT') return { componentType: 'CARD', componentName: 'Site00TwinStructuredCard' };
  if (category === 'PROGRESS') return { componentType: 'GAUGE', componentName: 'Site00TwinReadinessGauge' };
  if (category === 'BORDER') return { componentType: 'DIVIDER', componentName: 'Site00TwinDivider' };
  return { componentType: primitive || 'PANEL', componentName: 'Site00TwinSurface' };
}

export type VisualTranslationResultR8M2 = {
  renderTree: MobileTwinImplementationRenderTree;
  nodes: CompiledMobileTwinNode[];
  assetTraces: RuntimeAssetTraceability[];
  unresolvedAssetBindings: string[];
};

export function translateVisualImplementationR8M2(input: {
  pipeline: MobileTwinPipelineState;
  pkg: MobileTwinPackage;
  composition: MobileTwinCompositionState;
  bundle: MobileStructuredArtifactBundle;
  authorities: ImplementationAuthorityBundle;
}): VisualTranslationResultR8M2 {
  void input.authorities;
  const { composition, bundle } = input;
  const interactions = new Map(composition.interactionDefinitions.map((i) => [i.objectId, i.intent]));
  const treeNodes: MobileTwinImplementationRenderTreeNode[] = [];
  const flatNodes: CompiledMobileTwinNode[] = [];
  const assetTraces: RuntimeAssetTraceability[] = [];
  const unresolvedAssetBindings: string[] = [];
  let order = 0;

  for (const obj of composition.objectDefinitions) {
    const key = resolveTemplateKeyFromObjectId(obj.objectId);
    const { componentType, componentName } = componentMapping(obj.implementationPrimitive, obj.objectType);
    const typoStyles = resolveCombinedTypographyStyles(key, obj.objectType, obj.ownership);
    const copy = resolveR8M2ImplementationCopy(obj.objectId, obj.objectType, order);
    if (copy) assertProductionCopyAllowed(copy, obj.objectId);

    const asset = resolveCanonicalRuntimeAsset({
      objectId: obj.objectId,
      assetRef: obj.assetRef,
      objectType: obj.objectType,
      bundle,
    });
    assetTraces.push(asset.trace);
    if (asset.missing) unresolvedAssetBindings.push(obj.objectId);

    let imageUri: string | null = asset.uri;
    if (imageUri) {
      assertRuntimeImageSourceAllowed(imageUri);
    }

    const controlRole = resolveControlVisualRole(key, obj.objectType);
    const sectionId = sectionForObjectKey(key);
    const styles: Record<string, string> = {
      boxSizing: 'border-box',
      ...materialStylesForSurface(key, obj.objectType, obj.ownership),
      ...(obj.objectType === 'BUTTON' || obj.objectType === 'CONTROL' || obj.objectType === 'NAV_ITEM' ?
        materialStylesForControl(controlRole, obj.ownership)
      : {}),
      ...typoStyles,
      ...spatialStylesForSection(sectionId),
    };
    if (controlRole !== 'PRIMARY') {
      styles['--twin-control-role'] = controlRole;
    }

    const treeNode: MobileTwinImplementationRenderTreeNode = {
      objectId: obj.objectId,
      parentId: obj.parentObjectId,
      sectionId,
      componentType,
      componentName,
      visualStyleSource: 'PROJECT_CONTEXT',
      assetSource: imageUri ? 'CANONICAL_PROJECT_ASSET' : obj.assetRef,
      typographySource: key,
      functionBinding: obj.functionTarget,
      ownership: obj.ownership,
      runtimeState: obj.state,
      displayText: copy,
      imageUri,
      primitive: obj.implementationPrimitive,
      layoutOrder: order++,
      styles,
      interactionIntent: interactions.get(obj.objectId) ?? null,
    };
    treeNodes.push(treeNode);

    flatNodes.push({
      objectId: obj.objectId,
      primitive: obj.implementationPrimitive,
      semanticRole: obj.semanticRole,
      displayText: copy,
      imageUri,
      sectionId,
      componentType,
      visualStyleSource: 'PROJECT_CONTEXT',
      layout: {
        leftPct: obj.normalizedX * 100,
        topPct: obj.normalizedY * 100,
        widthPct: obj.normalizedWidth * 100,
        heightPct: obj.normalizedHeight * 100,
        zIndex: obj.zIndex,
      },
      styles,
      functionTarget: obj.functionTarget,
      featureId: obj.featureId,
      ownership: obj.ownership,
      interactionIntent: interactions.get(obj.objectId) ?? null,
    });
  }

  const renderTree: MobileTwinImplementationRenderTree = {
    rootSectionId: 'root',
    sections: [
      { id: 'host', label: 'SITE 00 HOST', ownership: 'SITE_00_HOST' },
      { id: 'context', label: 'PROJECT CONTEXT', ownership: 'ACTIVE_PROJECT' },
      { id: 'hero', label: 'HERO WORKSPACE', ownership: 'ACTIVE_PROJECT' },
      { id: 'gallery', label: 'CANDIDATE GALLERY', ownership: 'ACTIVE_PROJECT' },
      { id: 'decision', label: 'DECISION BAR', ownership: 'ACTIVE_PROJECT' },
      { id: 'structured-output', label: 'STRUCTURED OUTPUT', ownership: 'ACTIVE_PROJECT' },
      { id: 'readiness', label: 'READINESS', ownership: 'ACTIVE_PROJECT' },
      { id: 'bottom-nav', label: 'BOTTOM NAV', ownership: 'SITE_00_HOST' },
    ],
    nodes: treeNodes,
  };

  return { renderTree, nodes: flatNodes, assetTraces, unresolvedAssetBindings };
}
