import { CLIENT_CANVAS_LEGACY_TOP_NORM } from './clientCanvasBoundaryConstants.js';
import type { ClientCanvasBoundary } from './computeClientCanvasBoundary.js';

export type ClientCanvasTopReceipt = {
  conceptId: string;
  firstClientOwnedObjectId: string | null;
  firstClientContentTop: number;
  previousCanvasTop: number;
  newCanvasTop: number;
  pixelsRecoveredNorm: number;
  ownershipCorrections: string[];
  status: 'RECOVERED' | 'UNCHANGED';
};

export function buildClientCanvasTopReceipt(boundary: ClientCanvasBoundary): ClientCanvasTopReceipt {
  const pixelsRecoveredNorm = Math.max(0, CLIENT_CANVAS_LEGACY_TOP_NORM - boundary.canvasTop);
  return {
    conceptId: boundary.conceptId,
    firstClientOwnedObjectId: boundary.firstClientOwnedObjectId,
    firstClientContentTop: boundary.firstClientContentTop,
    previousCanvasTop: CLIENT_CANVAS_LEGACY_TOP_NORM,
    newCanvasTop: boundary.canvasTop,
    pixelsRecoveredNorm,
    ownershipCorrections: boundary.ownershipCorrections,
    status: pixelsRecoveredNorm > 0.001 ? 'RECOVERED' : 'UNCHANGED',
  };
}
