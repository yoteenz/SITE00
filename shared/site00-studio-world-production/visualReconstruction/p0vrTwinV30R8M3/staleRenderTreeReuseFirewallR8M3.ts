import type { CompiledMobileTwinImplementationDocument } from '../p0vrTwinV30R8M/types.js';

export function renderTreeStructureSignatureR8M3(doc: CompiledMobileTwinImplementationDocument): string {
  const nodes = doc.renderTree?.nodes ?? [];
  return JSON.stringify(nodes.map((n) => ({ s: n.sectionId, e: n.authorityEvidence, src: n.styleSource })));
}

export function assertForensicIngestionStaleRenderTreeFirewall(input: {
  priorDocument: CompiledMobileTwinImplementationDocument;
  newSignature: string;
}): void {
  const priorSig = renderTreeStructureSignatureR8M3(input.priorDocument);
  if (priorSig === input.newSignature) {
    throw new Error('STALE_RENDER_TREE_REUSE');
  }
  if (input.priorDocument.renderTree?.nodes.some((n) => n.sectionId.startsWith('fb-')) && !input.newSignature.includes('fm3-')) {
    throw new Error('PRIOR_FORENSIC_TREE_REUSED');
  }
  if (input.priorDocument.renderTree?.nodes.some((n) => n.styleSource === 'FORENSIC_SPEC_REBUILD') && !input.newSignature.includes('FORENSIC_INGESTION_REBUILD')) {
    throw new Error('FORENSIC_EVIDENCE_NOT_CONSUMED');
  }
}
