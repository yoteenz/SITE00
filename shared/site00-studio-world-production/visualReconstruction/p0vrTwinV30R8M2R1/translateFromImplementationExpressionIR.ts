import type { MobileTwinCompositionState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type { MobileStructuredArtifactBundle } from '../p0vrTwinV30/mobileTwinPipeline/buildMobileTwinStructuredArtifacts.js';
import type {
  CompiledMobileTwinNode,
  MobileTwinImplementationRenderTree,
  MobileTwinImplementationRenderTreeNode,
} from '../p0vrTwinV30R8M/types.js';
import { resolveTemplateKeyFromObjectId } from '../p0vrTwinV30R8M1/ndxbookImplementationCopyCatalog.js';
import { assertProductionCopyAllowed } from '../p0vrTwinV30R8M1/semanticDebugLabelFirewall.js';
import { resolveCanonicalRuntimeAsset, type RuntimeAssetTraceability } from '../p0vrTwinV30R8M2/canonicalAssetRebind.js';
import { assertRuntimeImageSourceAllowed } from '../p0vrTwinV30R8M2/runtimeAuthorityRasterFirewall.js';
import { materialStylesForControl } from '../p0vrTwinV30R8M2/implementationMaterialStyleResolver.js';
import { resolveR8M2ImplementationCopy } from '../p0vrTwinV30R8M2/ndxbookImplementationCopyR8M2.js';
import type { ImplementationExpressionIR, ImplementationExpressionObject } from './implementationExpressionTypes.js';
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

function componentMappingFromExpression(expr: ImplementationExpressionObject): { componentType: string; componentName: string } {
  if (expr.controlTreatment) return { componentType: 'BUTTON', componentName: 'Site00TwinButton' };
  if (expr.assetTreatment) {
    return expr.assetTreatment.prominence === 'HIGH' ?
        { componentType: 'IMAGE_REGION', componentName: 'Site00TwinImageRegion' }
      : { componentType: 'CARD', componentName: 'Site00TwinGalleryThumb' };
  }
  if (expr.typography.maxLines > 1) return { componentType: 'TEXT_BLOCK', componentName: 'Site00TwinTextBlock' };
  if (expr.regionId === 'BOTTOM_NAV') return { componentType: 'NAV_ITEM', componentName: 'Site00TwinNavItem' };
  if (expr.regionId === 'STRUCTURED_OUTPUT') return { componentType: 'CARD', componentName: 'Site00TwinStructuredCard' };
  return { componentType: 'PANEL', componentName: 'Site00TwinPanel' };
}

function stylesFromExpression(expr: ImplementationExpressionObject): Record<string, string> {
  const styles: Record<string, string> = {
    boxSizing: 'border-box',
    background: expr.surface.background,
    border: expr.surface.border,
    borderRadius: `${expr.surface.borderRadiusPx}px`,
    padding: `${expr.spacing.paddingPx}px`,
    marginBottom: `${expr.spacing.marginBottomPx}px`,
    gap: `${expr.spacing.gapPx}px`,
    fontSize: `${expr.typography.sizePx}px`,
    fontWeight: String(expr.typography.weight),
    lineHeight: String(expr.typography.lineHeight),
    letterSpacing: expr.typography.tracking,
    textTransform: expr.typography.casing,
    textAlign: expr.typography.alignment,
  };
  if (expr.controlTreatment) {
    Object.assign(
      styles,
      materialStylesForControl(expr.controlTreatment.role as 'PRIMARY', expr.ownership),
    );
  }
  if (expr.assetTreatment) {
    styles.objectFit = expr.assetTreatment.objectFit;
  }
  return styles;
}

export type ExpressionTranslationResult = {
  renderTree: MobileTwinImplementationRenderTree;
  nodes: CompiledMobileTwinNode[];
  assetTraces: RuntimeAssetTraceability[];
  unresolvedAssetBindings: string[];
  unresolvedExpressionObjects: string[];
};

export function translateFromImplementationExpressionIR(input: {
  composition: MobileTwinCompositionState;
  bundle: MobileStructuredArtifactBundle;
  expressionIr: ImplementationExpressionIR;
}): ExpressionTranslationResult {
  const exprById = new Map(input.expressionIr.objectExpressions.map((o) => [o.objectId, o]));
  const interactions = new Map(input.composition.interactionDefinitions.map((i) => [i.objectId, i.intent]));
  const treeNodes: MobileTwinImplementationRenderTreeNode[] = [];
  const flatNodes: CompiledMobileTwinNode[] = [];
  const assetTraces: RuntimeAssetTraceability[] = [];
  const unresolvedAssetBindings: string[] = [];
  const unresolvedExpressionObjects: string[] = [];
  let order = 0;

  for (const obj of input.composition.objectDefinitions) {
    const expr = exprById.get(obj.objectId);
    if (!expr) {
      unresolvedExpressionObjects.push(obj.objectId);
      throw new Error(`IMPLEMENTATION_EXPRESSION_NOT_RESOLVED:${obj.objectId}`);
    }

    const key = resolveTemplateKeyFromObjectId(obj.objectId);
    const { componentType, componentName } = componentMappingFromExpression(expr);
    const copy = resolveR8M2ImplementationCopy(obj.objectId, obj.objectType, order);
    if (copy) assertProductionCopyAllowed(copy, obj.objectId);

    const asset = resolveCanonicalRuntimeAsset({
      objectId: obj.objectId,
      assetRef: obj.assetRef,
      objectType: obj.objectType,
      bundle: input.bundle,
    });
    assetTraces.push(asset.trace);
    if (asset.missing) unresolvedAssetBindings.push(obj.objectId);

    let imageUri: string | null = asset.uri;
    if (imageUri) assertRuntimeImageSourceAllowed(imageUri);

    const styles = stylesFromExpression(expr);
    const sectionId = sectionForObjectKey(key);

    const treeNode: MobileTwinImplementationRenderTreeNode = {
      objectId: obj.objectId,
      parentId: obj.parentObjectId,
      sectionId,
      componentType,
      componentName,
      visualStyleSource: 'ACTUAL_AUTHORITY',
      assetSource: imageUri ? 'CANONICAL_PROJECT_ASSET' : obj.assetRef,
      typographySource: expr.typography.familyRole,
      functionBinding: obj.functionTarget,
      ownership: obj.ownership,
      runtimeState: obj.state,
      displayText: copy,
      imageUri,
      primitive: obj.implementationPrimitive,
      layoutOrder: order++,
      styles,
      interactionIntent: interactions.get(obj.objectId) ?? null,
      expressionObjectId: expr.objectId,
      styleSource: expr.styleSources.material,
      spatialSource: expr.styleSources.spatial,
      assetTreatmentSource: expr.assetTreatment?.source ?? 'PROJECT_CONTRACT_DERIVED',
      authorityEvidence: `${expr.authorityEvidence.actualRegion ?? '—'}|${expr.authorityEvidence.blueprintRegion ?? '—'}`,
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
      visualStyleSource: 'ACTUAL_AUTHORITY',
      layout: {
        leftPct: expr.geometry.xRatio * 100,
        topPct: expr.geometry.yRatio * 100,
        widthPct: expr.geometry.widthRatio * 100,
        heightPct: expr.geometry.heightRatio * 100,
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

  return { renderTree, nodes: flatNodes, assetTraces, unresolvedAssetBindings, unresolvedExpressionObjects };
}
