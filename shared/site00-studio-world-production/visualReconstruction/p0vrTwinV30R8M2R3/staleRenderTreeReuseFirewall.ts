import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type { CompiledMobileTwinImplementationDocument } from '../p0vrTwinV30R8M/types.js';
import type { ImplementationGenerationMode } from './implementationGenerationMode.js';
import { STALE_RENDER_TREE_REUSE } from './constants.js';

export function renderTreeStructureSignature(doc: CompiledMobileTwinImplementationDocument): string {
  const nodes = doc.renderTree?.nodes ?? [];
  const payload = nodes.map((n) => ({
    objectId: n.objectId,
    sectionId: n.sectionId,
    componentType: n.componentType,
    layoutOrder: n.layoutOrder,
    parentId: n.parentId,
  }));
  payload.sort((a, b) => a.objectId.localeCompare(b.objectId));
  return fnv1aHex(JSON.stringify(payload));
}

export function componentCompositionHash(doc: CompiledMobileTwinImplementationDocument): string {
  const tree = doc.translationDrivenComponentTree?.nodes;
  if (tree?.length) {
    return fnv1aHex(
      JSON.stringify(
        tree.map((n) => ({ id: n.componentId, parent: n.parentComponentId, role: n.layoutRole, class: n.cssClass })).sort((a, b) => a.id.localeCompare(b.id)),
      ),
    );
  }
  return renderTreeStructureSignature(doc);
}

export function assertStaleRenderTreeReuseFirewall(input: {
  generationMode: ImplementationGenerationMode;
  priorDocument: CompiledMobileTwinImplementationDocument;
  newRenderTreeHash: string;
  newComponentCompositionHash: string;
  priorReusedVisualCss: boolean;
}): void {
  if (input.generationMode !== 'FULL_TRANSLATION_REBUILD') return;

  const priorTreeHash = renderTreeStructureSignature(input.priorDocument);
  const priorCompositionHash = componentCompositionHash(input.priorDocument);

  if (input.newRenderTreeHash === priorTreeHash) {
    throw new Error(`${STALE_RENDER_TREE_REUSE}:RENDER_TREE`);
  }
  if (input.newComponentCompositionHash === priorCompositionHash) {
    throw new Error(`${STALE_RENDER_TREE_REUSE}:COMPONENT_COMPOSITION`);
  }
  if (input.priorReusedVisualCss) {
    throw new Error(`${STALE_RENDER_TREE_REUSE}:CSS`);
  }
}
