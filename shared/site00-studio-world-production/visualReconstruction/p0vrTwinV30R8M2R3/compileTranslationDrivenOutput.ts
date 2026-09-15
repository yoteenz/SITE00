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
import { materialStylesForControl, resolveControlVisualRole } from '../p0vrTwinV30R8M2/implementationMaterialStyleResolver.js';
import { resolveR8M2ImplementationCopy } from '../p0vrTwinV30R8M2/ndxbookImplementationCopyR8M2.js';
import type { ImplementationExpressionIR } from '../p0vrTwinV30R8M2R1/implementationExpressionTypes.js';
import type { TranslationDrivenComponentTree, TranslationDrivenCssContract, TranslationDrivenStyleSystem } from './translationDrivenTypes.js';
import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import { TRANSLATION_DRIVEN_CSS_PREFIX } from './constants.js';

function sectionIdForLayoutRole(layoutRole: string): string {
  if (layoutRole.startsWith('HERO_')) return 'td-hero';
  if (layoutRole === 'HOST_CHROME') return 'td-host';
  if (layoutRole === 'PROJECT_CONTEXT_CHIP') return 'td-context';
  if (layoutRole.startsWith('AUTHORITY') || layoutRole === 'HERO_AUTHORITY_RAIL') return 'td-authority';
  if (layoutRole === 'GALLERY_CARD') return 'td-gallery';
  if (layoutRole === 'DECISION_ACTION') return 'td-decision';
  if (layoutRole === 'STRUCTURED_NARROW_CARD') return 'td-structured';
  if (layoutRole.startsWith('READINESS')) return 'td-readiness';
  if (layoutRole === 'METADATA_CELL') return 'td-metadata';
  if (layoutRole === 'BOTTOM_NAV_ITEM') return 'td-bottom-nav';
  return 'td-workspace';
}

function stylesFromTranslationDriven(input: {
  layoutRole: string;
  ownership: string;
  key: string;
  objectType: string;
  expr?: ImplementationExpressionIR['objectExpressions'][number];
  styleSystem: TranslationDrivenStyleSystem;
}): Record<string, string> {
  const { layoutRole, ownership, key, objectType, expr, styleSystem } = input;
  const base: Record<string, string> = {
    boxSizing: 'border-box',
    fontFamily: layoutRole.includes('METADATA') || key.includes('status') ? 'monospace' : 'inherit',
  };

  if (layoutRole === 'HERO_HEADLINE_COLUMN') {
    base.fontSize = '22px';
    base.fontWeight = '900';
    base.lineHeight = '1.05';
    base.letterSpacing = '-0.02em';
    base.gridColumn = '1';
  }
  if (layoutRole === 'HERO_ARTIFACT_COLUMN') {
    base.gridColumn = '2';
    base.minHeight = '120px';
    base.background = '#000';
    base.border = '1px solid #444';
  }
  if (layoutRole === 'HERO_AUTHORITY_RAIL' || layoutRole === 'AUTHORITY_RAIL_GROUP') {
    if (layoutRole === 'HERO_AUTHORITY_RAIL') base.gridColumn = '3';
    base.display = 'flex';
    base.flexDirection = 'column';
    base.gap = `${styleSystem.spacingSystem.railGapPx}px`;
    base.maxWidth = '100%';
  }
  if (layoutRole === 'GALLERY_CARD') {
    base.aspectRatio = '3/4';
    base.padding = '0';
    base.overflow = 'hidden';
  }
  if (layoutRole === 'STRUCTURED_NARROW_CARD') {
    base.minHeight = '52px';
    base.fontSize = '8px';
    base.padding = '4px';
    base.background = '#0d0d0d';
    base.border = '1px solid #333';
  }
  if (layoutRole === 'READINESS_CLUSTER') {
    base.flex = '0 0 auto';
  }
  if (layoutRole === 'METADATA_CELL') {
    base.fontSize = '9px';
    base.color = '#bdbdbd';
    base.padding = '2px 4px';
    base.background = '#0f0f0f';
  }
  if (layoutRole === 'BOTTOM_NAV_ITEM') {
    base.fontSize = '8px';
    base.textAlign = 'center';
    base.padding = '6px 2px';
    base.background = '#0a0a0a';
    base.border = '1px solid #222';
  }

  const controlRole = resolveControlVisualRole(key, objectType);
  if (objectType === 'BUTTON' || objectType === 'CONTROL' || objectType === 'NAV_ITEM') {
    Object.assign(base, materialStylesForControl(controlRole, ownership));
    base['--twin-control-role'] = controlRole;
    if (layoutRole.includes('AUTHORITY') && controlRole !== 'PRIMARY') {
      base.background = '#161616';
      base.color = '#f0f0f0';
      base.width = '100%';
      base.maxWidth = '100%';
    }
  }

  if (expr) {
    base.fontSize = `${Math.max(expr.typography.sizePx, layoutRole === 'HERO_HEADLINE_COLUMN' ? 20 : expr.typography.sizePx)}px`;
  }

  return base;
}

export type TranslationDrivenCompileResult = {
  nodes: CompiledMobileTwinNode[];
  renderTree: MobileTwinImplementationRenderTree;
  assetTraces: RuntimeAssetTraceability[];
  unresolvedAssetBindings: string[];
  renderTreeHash: string;
  layoutContractHash: string;
};

export function compileTranslationDrivenOutput(input: {
  composition: MobileTwinCompositionState;
  bundle: MobileStructuredArtifactBundle;
  expressionIr: ImplementationExpressionIR;
  componentTree: TranslationDrivenComponentTree;
  cssContract: TranslationDrivenCssContract;
  styleSystem: TranslationDrivenStyleSystem;
}): TranslationDrivenCompileResult {
  const exprById = new Map(input.expressionIr.objectExpressions.map((o) => [o.objectId, o]));
  const interactions = new Map(input.composition.interactionDefinitions.map((i) => [i.objectId, i.intent]));
  const treeNodes: MobileTwinImplementationRenderTreeNode[] = [];
  const flatNodes: CompiledMobileTwinNode[] = [];
  const assetTraces: RuntimeAssetTraceability[] = [];
  const unresolvedAssetBindings: string[] = [];
  let order = 0;

  for (const comp of input.componentTree.nodes) {
    const obj = input.composition.objectDefinitions.find((o) => o.objectId === comp.structuredObjectId);
    if (!obj) continue;
    const key = resolveTemplateKeyFromObjectId(obj.objectId);
    const expr = exprById.get(obj.objectId);
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

    const styles = {
      ...stylesFromTranslationDriven({
        layoutRole: comp.layoutRole,
        ownership: obj.ownership,
        key,
        objectType: obj.objectType,
        expr,
        styleSystem: input.styleSystem,
      }),
      className: comp.cssClass,
    };

    const sectionId = sectionIdForLayoutRole(comp.layoutRole);
    const componentType =
      obj.objectType === 'IMAGE' ? 'IMAGE_REGION'
      : obj.objectType === 'BUTTON' || obj.objectType === 'CONTROL' ? 'BUTTON'
      : obj.objectType === 'NAV_ITEM' ? 'NAV_ITEM'
      : obj.objectType === 'PROGRESS' ? 'GAUGE'
      : 'TEXT_BLOCK';

    const treeNode: MobileTwinImplementationRenderTreeNode = {
      objectId: obj.objectId,
      parentId: comp.parentComponentId,
      sectionId,
      componentType,
      componentName: `TranslationDriven_${comp.layoutRole}`,
      visualStyleSource: 'IMPLEMENTATION_EXPRESSION_IR',
      assetSource: imageUri ? 'CANONICAL_PROJECT_ASSET' : obj.assetRef,
      typographySource: expr?.typography.familyRole ?? null,
      functionBinding: obj.functionTarget,
      ownership: obj.ownership,
      runtimeState: obj.state,
      displayText: copy,
      imageUri,
      primitive: obj.implementationPrimitive,
      layoutOrder: order++,
      styles,
      interactionIntent: interactions.get(obj.objectId) ?? null,
      expressionObjectId: obj.objectId,
      styleSource: 'TRANSLATION_DRIVEN_REBUILD',
      spatialSource: comp.translationSource,
      assetTreatmentSource: 'TRANSLATION_DRIVEN_REBUILD',
      authorityEvidence: `${comp.translationSource}|${comp.expressionSource}|${comp.layoutRole}`,
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
      visualStyleSource: 'IMPLEMENTATION_EXPRESSION_IR',
      layout: {
        leftPct: expr?.geometry.xRatio ? expr.geometry.xRatio * 100 : obj.normalizedX * 100,
        topPct: expr?.geometry.yRatio ? expr.geometry.yRatio * 100 : obj.normalizedY * 100,
        widthPct: expr?.geometry.widthRatio ? expr.geometry.widthRatio * 100 : obj.normalizedWidth * 100,
        heightPct: expr?.geometry.heightRatio ? expr.geometry.heightRatio * 100 : obj.normalizedHeight * 100,
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
    rootSectionId: 'td-root',
    sections: [
      { id: 'td-host', label: 'HOST SHELL', ownership: 'SITE_00_HOST' },
      { id: 'td-context', label: 'PROJECT CONTEXT', ownership: 'ACTIVE_PROJECT' },
      { id: 'td-hero', label: 'HERO WORKSPACE', ownership: 'ACTIVE_PROJECT' },
      { id: 'td-authority', label: 'AUTHORITY PANEL', ownership: 'ACTIVE_PROJECT' },
      { id: 'td-gallery', label: 'CANDIDATE GALLERY', ownership: 'ACTIVE_PROJECT' },
      { id: 'td-decision', label: 'DECISION BAR', ownership: 'ACTIVE_PROJECT' },
      { id: 'td-structured', label: 'STRUCTURED OUTPUT', ownership: 'ACTIVE_PROJECT' },
      { id: 'td-readiness', label: 'READINESS', ownership: 'ACTIVE_PROJECT' },
      { id: 'td-metadata', label: 'CONCEPT DATA / HISTORY', ownership: 'ACTIVE_PROJECT' },
      { id: 'td-bottom-nav', label: 'BOTTOM NAV', ownership: 'SITE_00_HOST' },
    ],
    nodes: treeNodes,
  };

  const renderTreeHash = fnv1aHex(
    JSON.stringify(treeNodes.map((n) => ({ s: n.sectionId, r: n.authorityEvidence, o: n.layoutOrder }))),
  );
  const layoutContractHash = fnv1aHex(JSON.stringify({ css: input.cssContract.hash, sections: renderTree.sections.map((s) => s.id) }));

  void TRANSLATION_DRIVEN_CSS_PREFIX;

  return { nodes: flatNodes, renderTree, assetTraces, unresolvedAssetBindings, renderTreeHash, layoutContractHash };
}
