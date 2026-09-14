import type { MobileTwinCompositionState, MobileTwinPipelineState, MobileTwinPackage } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type { MobileStructuredArtifactBundle } from '../p0vrTwinV30/mobileTwinPipeline/buildMobileTwinStructuredArtifacts.js';
import type {
  CompiledMobileTwinNode,
  MobileTwinImplementationRenderTree,
  MobileTwinImplementationRenderTreeNode,
} from '../p0vrTwinV30R8M/types.js';
import { resolveImplementationCopy, resolveTemplateKeyFromObjectId } from './ndxbookImplementationCopyCatalog.js';
import { resolveTypographyRole, typographyStylesForRole } from './implementationTypographyResolver.js';
import type { ImplementationAuthorityBundle } from './resolveImplementationAuthorities.js';
import { assertProductionCopyAllowed } from './semanticDebugLabelFirewall.js';

const CRITICAL_OBJECT_KEYS = new Set([
  'host-shell',
  'primary-workspace',
  'dominant-headline',
  'dominant-artifact-frame',
  'dominant-artifact-image',
  'gallery-strip',
  'readiness-panel',
  'mobile-bottom-nav-shell',
]);

function isLayoutContainerKey(key: string, objectType: string): boolean {
  if (objectType === 'SURFACE' || objectType === 'PANEL') return true;
  return (
    key === 'primary-workspace' ||
    key === 'gallery-strip' ||
    key === 'readiness-panel' ||
    key === 'dominant-artifact-frame' ||
    key === 'authority-side-panel' ||
    key === 'structured-output' ||
    key.endsWith('-panel') ||
    key.endsWith('-strip') ||
    key.endsWith('-shell')
  );
}

function sectionForObjectKey(key: string): string {
  if (key.startsWith('host-')) return 'host';
  if (key.startsWith('context-') || key === 'context-strip') return 'context';
  if (key.startsWith('mobile-nav-') || key === 'mobile-bottom-nav-shell') return 'bottom-nav';
  if (key.includes('gallery')) return 'gallery';
  if (key.includes('readiness')) return 'readiness';
  if (['grounding-card', 'blueprint-card', 'overlay-card', 'assets-card', 'function-card', 'structured-output'].includes(key)) {
    return 'structured-output';
  }
  if (['refine-btn', 'regen-btn', 'inspect-btn', 'primary-next-action', 'decision-bar'].includes(key)) return 'decision';
  if (key.startsWith('dominant-') || key.includes('authority') || key.includes('select-') || key.includes('promote-') || key.includes('lock-pair') || key.includes('pair-review')) {
    return 'hero';
  }
  return 'workspace';
}

function visualStyleSourceFor(key: string, ownership: string): MobileTwinImplementationRenderTreeNode['visualStyleSource'] {
  if (ownership === 'SITE_00_HOST') return 'HOST_SHELL';
  if (key.includes('artifact-image') || key.includes('headline') || key.includes('subcopy')) return 'ACTUAL_AUTHORITY';
  if (key.includes('gallery-thumb')) return 'ACTUAL_AUTHORITY';
  return 'PROJECT_CONTEXT';
}

function surfaceStyles(_key: string, category: string, ownership: string): Record<string, string> {
  const host = ownership === 'SITE_00_HOST';
  if (category === 'SURFACE' || category === 'PANEL') {
    return {
      background: host ? '#0a0a0a' : '#111111',
      border: host ? '1px solid #222' : '1px solid #c8ff00',
      borderRadius: '6px',
    };
  }
  if (category === 'BUTTON' || category === 'CONTROL' || category === 'NAV_ITEM') {
    return {
      background: host ? '#1a1a1a' : '#c8ff00',
      color: host ? '#f5f5f5' : '#0a0a0a',
      border: 'none',
      borderRadius: '4px',
    };
  }
  if (category === 'ARTIFACT' || category === 'THUMBNAIL') {
    return {
      background: '#0d0d0d',
      border: '1px solid #333',
      borderRadius: '4px',
    };
  }
  if (category === 'IMAGE') {
    return { background: '#000', overflow: 'hidden', borderRadius: '4px' };
  }
  if (category === 'PROGRESS') {
    return { background: '#1a1a1a', border: '1px solid #c8ff00', borderRadius: '999px' };
  }
  return { background: 'transparent' };
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

export type VisualTranslationResult = {
  renderTree: MobileTwinImplementationRenderTree;
  nodes: CompiledMobileTwinNode[];
  unresolvedCritical: string[];
};

export function translateVisualImplementation(input: {
  pipeline: MobileTwinPipelineState;
  pkg: MobileTwinPackage;
  composition: MobileTwinCompositionState;
  bundle: MobileStructuredArtifactBundle;
  authorities: ImplementationAuthorityBundle;
}): VisualTranslationResult {
  const { composition, authorities } = input;
  const interactions = new Map(composition.interactionDefinitions.map((i) => [i.objectId, i.intent]));
  const treeNodes: MobileTwinImplementationRenderTreeNode[] = [];
  const flatNodes: CompiledMobileTwinNode[] = [];
  const unresolvedCritical: string[] = [];
  let order = 0;

  for (const obj of composition.objectDefinitions) {
    const key = resolveTemplateKeyFromObjectId(obj.objectId);
    const { componentType, componentName } = componentMapping(obj.implementationPrimitive, obj.objectType);
    const typoRole = resolveTypographyRole(key, obj.objectType, obj.ownership);
    const typoStyles = typographyStylesForRole(typoRole);
    const copy = resolveImplementationCopy(obj.objectId, obj.objectType, order);
    let imageUri: string | null = null;
    if (obj.objectType === 'IMAGE' && (key === 'dominant-artifact-image' || key === 'dominant-artifact-frame')) {
      imageUri = authorities.actualRenderUri;
    } else if (obj.objectType === 'THUMBNAIL' || (obj.objectType === 'ARTIFACT' && key === 'dominant-artifact-frame')) {
      imageUri = authorities.actualRenderUri;
    }

    if (copy) assertProductionCopyAllowed(copy, obj.objectId);

    const visualStyleSource = visualStyleSourceFor(key, obj.ownership);
    const needsVisual = CRITICAL_OBJECT_KEYS.has(key) || obj.visualImportance === 'CRITICAL';
    const layoutContainer = isLayoutContainerKey(key, obj.objectType);
    if (needsVisual && !layoutContainer && !copy && !imageUri && obj.objectType !== 'BORDER') {
      unresolvedCritical.push(obj.objectId);
    }

    const styles: Record<string, string> = {
      boxSizing: 'border-box',
      ...surfaceStyles(key, obj.objectType, obj.ownership),
      ...typoStyles,
      color: typoStyles.color ?? (obj.ownership === 'SITE_00_HOST' ? '#eaeaea' : '#f5f5f5'),
    };

    const sectionId = sectionForObjectKey(key);
    const treeNode: MobileTwinImplementationRenderTreeNode = {
      objectId: obj.objectId,
      parentId: obj.parentObjectId,
      sectionId,
      componentType,
      componentName,
      visualStyleSource,
      assetSource: imageUri ? 'ACTUAL_AUTHORITY_RENDER' : obj.assetRef,
      typographySource: typoRole,
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
      visualStyleSource,
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

  if (unresolvedCritical.length) {
    throw new Error(`IMPLEMENTATION_VISUAL_RESOLUTION_MISSING:${unresolvedCritical.join(',')}`);
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

  return { renderTree, nodes: flatNodes, unresolvedCritical };
}
