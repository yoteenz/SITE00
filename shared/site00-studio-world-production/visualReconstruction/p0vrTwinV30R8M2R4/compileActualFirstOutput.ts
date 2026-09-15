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
import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type { ActualFirstComponentTree } from './buildActualFirstComponentTree.js';
import type { ActualFirstStyleContract } from './buildActualFirstStyleContract.js';
import { GENERIC_COMPONENT_SUBSTITUTION_DRIFT } from './constants.js';
import type { CompositionRelationshipTargets } from './actualFirstTypes.js';

function sectionIdForLayoutRole(layoutRole: string): string {
  if (layoutRole.startsWith('HERO_')) return 'af-hero';
  if (layoutRole === 'HOST_CHROME') return 'af-host';
  if (layoutRole === 'PROJECT_CONTEXT_CHIP') return 'af-context';
  if (layoutRole.startsWith('AUTHORITY') || layoutRole === 'HERO_AUTHORITY_RAIL') return 'af-authority';
  if (layoutRole === 'GALLERY_CARD') return 'af-gallery';
  if (layoutRole === 'DECISION_ACTION') return 'af-decision';
  if (layoutRole === 'STRUCTURED_NARROW_CARD') return 'af-structured';
  if (layoutRole.startsWith('READINESS')) return 'af-readiness';
  if (layoutRole === 'METADATA_CELL') return 'af-metadata';
  if (layoutRole === 'BOTTOM_NAV_ITEM') return 'af-bottom-nav';
  return 'af-workspace';
}

function stylesFromActualFirst(input: {
  layoutRole: string;
  ownership: string;
  key: string;
  objectType: string;
  expr?: ImplementationExpressionIR['objectExpressions'][number];
  styleContract: ActualFirstStyleContract;
}): Record<string, string> {
  const { layoutRole, ownership, key, objectType, expr, styleContract } = input;
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
    base.maxWidth = styleContract.cssVariables['--af-hero-headline-col'] ?? '38%';
  }
  if (layoutRole === 'HERO_ARTIFACT_COLUMN') {
    base.gridColumn = '2';
    base.minHeight = '128px';
    base.background = '#000';
    base.border = '1px solid #444';
    base.width = styleContract.cssVariables['--af-hero-artifact-col'] ?? '34%';
  }
  if (layoutRole === 'HERO_AUTHORITY_RAIL' || layoutRole === 'AUTHORITY_RAIL_GROUP') {
    if (layoutRole === 'HERO_AUTHORITY_RAIL') base.gridColumn = '3';
    base.display = 'flex';
    base.flexDirection = 'column';
    base.gap = '6px';
    base.width = styleContract.cssVariables['--af-hero-authority-col'] ?? '28%';
  }
  if (layoutRole === 'GALLERY_CARD') {
    base.aspectRatio = '3/4';
    base.padding = '0';
    base.overflow = 'hidden';
  }
  if (layoutRole === 'STRUCTURED_NARROW_CARD') {
    base.minHeight = '54px';
    base.fontSize = '8px';
    base.padding = '4px';
    base.background = '#0d0d0d';
    base.border = '1px solid #333';
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
    if (layoutRole.includes('GENERIC')) {
      throw new Error(GENERIC_COMPONENT_SUBSTITUTION_DRIFT);
    }
  }

  if (expr) {
    base.fontSize = `${Math.max(expr.typography.sizePx, layoutRole === 'HERO_HEADLINE_COLUMN' ? 20 : expr.typography.sizePx)}px`;
  }

  return base;
}

export type ActualFirstCompileResult = {
  nodes: CompiledMobileTwinNode[];
  renderTree: MobileTwinImplementationRenderTree;
  assetTraces: RuntimeAssetTraceability[];
  unresolvedAssetBindings: string[];
  renderTreeHash: string;
  layoutContractHash: string;
  styleContractHash: string;
};

export function compileActualFirstOutput(input: {
  composition: MobileTwinCompositionState;
  bundle: MobileStructuredArtifactBundle;
  expressionIr: ImplementationExpressionIR;
  componentTree: ActualFirstComponentTree;
  styleContract: ActualFirstStyleContract;
  compositionTargets: CompositionRelationshipTargets;
}): ActualFirstCompileResult {
  void input.compositionTargets;
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
      ...stylesFromActualFirst({
        layoutRole: comp.layoutRole,
        ownership: obj.ownership,
        key,
        objectType: obj.objectType,
        expr,
        styleContract: input.styleContract,
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
      componentName: `ActualFirst_${comp.layoutRole}`,
      visualStyleSource: 'APPROVED_ACTUAL_REFERENCE',
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
      styleSource: 'ACTUAL_FIRST_REBUILD',
      spatialSource: comp.actualEvidenceRegion,
      assetTreatmentSource: 'ACTUAL_FIRST_REBUILD',
      authorityEvidence: `actual|${comp.actualEvidenceRegion}|${comp.blueprintEvidenceRegion}|${comp.layoutRole}`,
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
      visualStyleSource: 'APPROVED_ACTUAL_REFERENCE',
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
    rootSectionId: 'af-root',
    sections: [
      { id: 'af-host', label: 'HOST SHELL', ownership: 'SITE_00_HOST' },
      { id: 'af-context', label: 'PROJECT CONTEXT', ownership: 'ACTIVE_PROJECT' },
      { id: 'af-hero', label: 'HERO WORKSPACE', ownership: 'ACTIVE_PROJECT' },
      { id: 'af-authority', label: 'AUTHORITY PANEL', ownership: 'ACTIVE_PROJECT' },
      { id: 'af-gallery', label: 'CANDIDATE GALLERY', ownership: 'ACTIVE_PROJECT' },
      { id: 'af-decision', label: 'DECISION BAR', ownership: 'ACTIVE_PROJECT' },
      { id: 'af-structured', label: 'STRUCTURED OUTPUT', ownership: 'ACTIVE_PROJECT' },
      { id: 'af-readiness', label: 'READINESS', ownership: 'ACTIVE_PROJECT' },
      { id: 'af-metadata', label: 'CONCEPT DATA', ownership: 'ACTIVE_PROJECT' },
      { id: 'af-bottom-nav', label: 'BOTTOM NAV', ownership: 'SITE_00_HOST' },
    ],
    nodes: treeNodes,
  };

  const renderTreeHash = fnv1aHex(
    JSON.stringify(treeNodes.map((n) => ({ s: n.sectionId, r: n.authorityEvidence, o: n.layoutOrder }))),
  );
  const layoutContractHash = fnv1aHex(JSON.stringify({ sections: renderTree.sections.map((s) => s.id) }));
  const styleContractHash = input.styleContract.hash;

  return {
    nodes: flatNodes,
    renderTree,
    assetTraces,
    unresolvedAssetBindings,
    renderTreeHash,
    layoutContractHash,
    styleContractHash,
  };
}
