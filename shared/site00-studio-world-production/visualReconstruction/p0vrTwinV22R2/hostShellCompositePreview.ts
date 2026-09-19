import type { HostShellCompositePreview } from './types.js';
import type { HostShellContract } from './types.js';

/** Product composite preview metadata — not a new generated image. */
export function buildHostShellCompositePreview(input: {
  conceptId: string;
  originalConceptImageUrl: string | null;
  clientCanvasImageUrl: string | null;
  hostShellContract: HostShellContract;
}): HostShellCompositePreview {
  return {
    previewKind: 'PRODUCT_COMPOSITE',
    conceptId: input.conceptId,
    originalConceptImageUrl: input.originalConceptImageUrl,
    clientCanvasImageUrl: input.clientCanvasImageUrl ?? input.originalConceptImageUrl,
    hostShellContractVersion: input.hostShellContract.version,
    notes: 'Real SITE 00 host shell + generated NDXBOOK client canvas (composite in UI, not GPT Image 2)',
  };
}
