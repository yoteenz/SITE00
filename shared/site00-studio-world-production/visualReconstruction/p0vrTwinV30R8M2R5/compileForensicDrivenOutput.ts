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
import type { ForensicSectionId } from './constants.js';
import { FORENSIC_CSS_PREFIX } from './constants.js';
import type {
  ForensicSpacingMap,
  ForensicTypographyMap,
  ForensicUiObjectEntry,
  ForensicUiObjectMap,
  ForensicUiSectionMap,
  ForensicVisualStyleMap,
} from './forensicTypes.js';

function sectionIdForForensic(section: ForensicSectionId): string {
  return `fb-${section.toLowerCase().replace(/_/g, '-')}`;
}

export type ForensicStyleContract = {
  id: string;
  hash: string;
  rootClass: string;
  cssVariables: Record<string, string>;
};

export function buildForensicStyleContract(input: {
  spacing: ForensicSpacingMap;
  sectionMap: ForensicUiSectionMap;
  correctionBoost: number;
}): ForensicStyleContract {
  const hero = input.sectionMap.sections.find((s) => s.sectionId === 'HERO_WORKSPACE');
  const cssVariables: Record<string, string> = {
    '--fb-section-gap': `${input.spacing.sectionGapPx}px`,
    '--fb-hero-cols': String(hero?.columnCount ?? 3),
    '--fb-gallery-gap': `${input.spacing.cardGapPx}px`,
    '--fb-correction': String(input.correctionBoost),
  };
  const body = JSON.stringify(cssVariables);
  return {
    id: `fbsc-${fnv1aHex(body).slice(0, 10)}`,
    hash: fnv1aHex(body),
    rootClass: FORENSIC_CSS_PREFIX,
    cssVariables,
  };
}

function stylesForForensicObject(input: {
  forensic: ForensicUiObjectEntry;
  key: string;
  objectType: string;
  ownership: string;
  typography: ForensicTypographyMap;
  visual: ForensicVisualStyleMap;
}): Record<string, string> {
  const typo = input.typography.entries.find((t) => t.objectId === input.forensic.semanticObjectId);
  const base: Record<string, string> = {
    boxSizing: 'border-box',
    position: 'relative',
    flex: `0 0 ${Math.round(input.forensic.widthRatio * 100)}%`,
    maxWidth: `${Math.round(input.forensic.widthRatio * 100)}%`,
    minHeight: `${Math.max(20, Math.round(input.forensic.heightRatio * 100))}px`,
  };
  if (typo) {
    base.fontSize = `${typo.sizePx}px`;
    base.fontWeight = String(typo.weight);
    base.lineHeight = String(typo.lineHeight);
    base.letterSpacing = typo.tracking;
    base.textAlign = typo.alignment;
  }
  const controlRole = resolveControlVisualRole(input.key, input.objectType);
  if (input.objectType === 'BUTTON' || input.objectType === 'CONTROL' || input.objectType === 'NAV_ITEM') {
    Object.assign(base, materialStylesForControl(controlRole, input.ownership));
    base.border = `${input.visual.borderThicknessPx}px solid ${input.visual.borderColor}`;
  }
  if (input.forensic.parentSectionId === 'HERO_WORKSPACE' && input.key.includes('artifact')) {
    base.background = '#000';
    base.border = `1px solid ${input.visual.borderColor}`;
  }
  return base;
}

export type ForensicCompileResult = {
  nodes: CompiledMobileTwinNode[];
  renderTree: MobileTwinImplementationRenderTree;
  assetTraces: RuntimeAssetTraceability[];
  unresolvedAssetBindings: string[];
  renderTreeHash: string;
  layoutContractHash: string;
  styleContractHash: string;
};

export function compileForensicDrivenOutput(input: {
  composition: MobileTwinCompositionState;
  bundle: MobileStructuredArtifactBundle;
  expressionIr: ImplementationExpressionIR;
  objectMap: ForensicUiObjectMap;
  sectionMap: ForensicUiSectionMap;
  typographyMap: ForensicTypographyMap;
  visualStyleMap: ForensicVisualStyleMap;
  styleContract: ForensicStyleContract;
}): ForensicCompileResult {
  void input.expressionIr;
  const interactions = new Map(input.composition.interactionDefinitions.map((i) => [i.objectId, i.intent]));
  const treeNodes: MobileTwinImplementationRenderTreeNode[] = [];
  const flatNodes: CompiledMobileTwinNode[] = [];
  const assetTraces: RuntimeAssetTraceability[] = [];
  const unresolvedAssetBindings: string[] = [];
  let order = 0;

  for (const forensic of input.objectMap.objects) {
    const obj = input.composition.objectDefinitions.find((o) => o.objectId === forensic.semanticObjectId);
    if (!obj) continue;
    const key = resolveTemplateKeyFromObjectId(obj.objectId);
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

    const sectionId = sectionIdForForensic(forensic.parentSectionId);
    const styles = {
      ...stylesForForensicObject({
        forensic,
        key,
        objectType: obj.objectType,
        ownership: obj.ownership,
        typography: input.typographyMap,
        visual: input.visualStyleMap,
      }),
      className: `${FORENSIC_CSS_PREFIX}__callout-${forensic.calloutNumber}`,
    };

    const componentType =
      obj.objectType === 'IMAGE' ? 'IMAGE_REGION'
      : obj.objectType === 'BUTTON' || obj.objectType === 'CONTROL' ? 'BUTTON'
      : obj.objectType === 'NAV_ITEM' ? 'NAV_ITEM'
      : obj.objectType === 'PROGRESS' ? 'GAUGE'
      : 'TEXT_BLOCK';

    const treeNode: MobileTwinImplementationRenderTreeNode = {
      objectId: obj.objectId,
      parentId: null,
      sectionId,
      componentType,
      componentName: `Forensic_${forensic.forensicObjectId}`,
      visualStyleSource: 'APPROVED_ACTUAL_REFERENCE',
      assetSource: imageUri ? 'CANONICAL_PROJECT_ASSET' : obj.assetRef,
      typographySource: forensic.textRole,
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
      styleSource: 'FORENSIC_SPEC_REBUILD',
      spatialSource: forensic.forensicObjectId,
      assetTreatmentSource: 'FORENSIC_SPEC_REBUILD',
      authorityEvidence: `forensic|${forensic.forensicObjectId}|${forensic.parentSectionId}|callout-${forensic.calloutNumber}`,
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
        leftPct: forensic.xRatio * 100,
        topPct: forensic.yRatio * 100,
        widthPct: forensic.widthRatio * 100,
        heightPct: forensic.heightRatio * 100,
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
    rootSectionId: 'fb-root',
    sections: input.sectionMap.sections.map((s) => ({
      id: sectionIdForForensic(s.sectionId),
      label: s.sectionId.replace(/_/g, ' '),
      ownership: s.sectionId === 'HOST_SHELL' || s.sectionId === 'BOTTOM_NAV' ? 'SITE_00_HOST' : 'ACTIVE_PROJECT',
    })),
    nodes: treeNodes,
  };

  const renderTreeHash = fnv1aHex(JSON.stringify(treeNodes.map((n) => ({ s: n.sectionId, e: n.authorityEvidence }))));
  const layoutContractHash = fnv1aHex(JSON.stringify(renderTree.sections.map((s) => s.id)));
  return {
    nodes: flatNodes,
    renderTree,
    assetTraces,
    unresolvedAssetBindings,
    renderTreeHash,
    layoutContractHash,
    styleContractHash: input.styleContract.hash,
  };
}
