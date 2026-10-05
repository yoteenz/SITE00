import { CLIENT_CANVAS_TOP_CROP_LOSS, MASTHEAD_VISUAL_BLEED_NORM } from './clientCanvasBoundaryConstants.js';
import type { ClientCanvasBoundary } from './computeClientCanvasBoundary.js';

export function assertClientCanvasIncludesFirstClientObject(boundary: ClientCanvasBoundary): void {
  if (boundary.firstClientOwnedObjectId == null) return;
  const top = boundary.firstClientOwnedObjectBounds?.y;
  if (top == null) return;
  const bleedAllowance = MASTHEAD_VISUAL_BLEED_NORM + 0.002;
  if (boundary.canvasTop > top + bleedAllowance) {
    throw new Error(
      `${CLIENT_CANVAS_TOP_CROP_LOSS}: canvasTop ${boundary.canvasTop.toFixed(4)} cuts first client object ${boundary.firstClientOwnedObjectId} at y=${top.toFixed(4)}`,
    );
  }
}
