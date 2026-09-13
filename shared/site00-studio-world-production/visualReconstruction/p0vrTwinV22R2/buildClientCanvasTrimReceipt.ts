import type { ClientCanvasBoundary } from './computeClientCanvasBoundary.js';

export type ClientCanvasTrimReceipt = {
  conceptId: string;
  originalHeight: number;
  lastClientContentBottom: number;
  excludedHostArtifactHeight: number;
  trailingWhitespaceRemoved: number;
  approvedBottomPadding: number;
  finalClientCanvasHeight: number;
  hostNavHeight: number;
  safeAreaOwner: 'HOST_SHELL';
  status: 'TRIMMED';
};

export function buildClientCanvasTrimReceipt(boundary: ClientCanvasBoundary): ClientCanvasTrimReceipt {
  const trailingWhitespaceRemoved = Math.max(
    0,
    1 - boundary.sanitizedCanvasBottom - boundary.excludedHostArtifactHeight,
  );
  return {
    conceptId: boundary.conceptId,
    originalHeight: 1,
    lastClientContentBottom: boundary.lastClientContentBottom,
    excludedHostArtifactHeight: boundary.excludedHostArtifactHeight,
    trailingWhitespaceRemoved,
    approvedBottomPadding: boundary.bottomPadding,
    finalClientCanvasHeight: boundary.sanitizedCanvasHeight,
    hostNavHeight: boundary.hostSafeAreaInset,
    safeAreaOwner: 'HOST_SHELL',
    status: 'TRIMMED',
  };
}
