import type { CompiledMobileTwinImplementationDocument } from '../p0vrTwinV30R8M/types.js';

export function renderTreeStructureSignatureR8M2R5(doc: CompiledMobileTwinImplementationDocument): string {
  const nodes = doc.renderTree?.nodes ?? [];
  return JSON.stringify(nodes.map((n) => ({ s: n.sectionId, e: n.authorityEvidence })));
}

export function assertForensicStaleRenderTreeFirewall(input: {
  priorDocument: CompiledMobileTwinImplementationDocument;
  newSignature: string;
}): void {
  const priorSig = renderTreeStructureSignatureR8M2R5(input.priorDocument);
  if (priorSig === input.newSignature) {
    throw new Error('STALE_RENDER_TREE_REUSE');
  }
  if (input.priorDocument.renderTree?.nodes.some((n) => n.sectionId.startsWith('af-')) && !input.newSignature.includes('fb-')) {
    throw new Error('PRIOR_VISUAL_TREE_REUSED');
  }
}
