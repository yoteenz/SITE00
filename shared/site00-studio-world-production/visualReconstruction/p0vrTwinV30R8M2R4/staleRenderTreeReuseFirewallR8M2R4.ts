import type { CompiledMobileTwinImplementationDocument } from '../p0vrTwinV30R8M/types.js';
import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';

export function renderTreeStructureSignatureR8M2R4(doc: CompiledMobileTwinImplementationDocument): string {
  const nodes = doc.renderTree?.nodes ?? [];
  return JSON.stringify(nodes.map((n) => ({ s: n.sectionId, e: n.authorityEvidence, o: n.layoutOrder })));
}

export function assertActualFirstStaleRenderTreeFirewall(input: {
  priorDocument: CompiledMobileTwinImplementationDocument;
  newSignature: string;
  newComponentHash: string;
}): void {
  const priorSig = renderTreeStructureSignatureR8M2R4(input.priorDocument);
  if (priorSig === input.newSignature) {
    throw new Error('STALE_RENDER_TREE_REUSE');
  }
  const priorHash = fnv1aHex(priorSig);
  if (priorHash === input.newComponentHash) {
    throw new Error('STALE_RENDER_TREE_REUSE');
  }
  const priorSections = new Set(input.priorDocument.renderTree?.nodes.map((n) => n.sectionId));
  if (priorSections.has('td-hero') && !input.newSignature.includes('af-hero')) {
    throw new Error('PRIOR_VISUAL_TREE_REUSED');
  }
}
