import { CLIENT_CANVAS_TOP_CROP_LOSS } from './clientCanvasBoundaryConstants.js';
import type { ClientCanvasBoundary } from './computeClientCanvasBoundary.js';

export function assertClientCanvasIncludesFirstClientObject(boundary: ClientCanvasBoundary): void {
  if (boundary.firstClientOwnedObjectId == null) return;
  const top = boundary.firstClientOwnedObjectBounds?.y;
  if (top == null) return;
  if (boundary.canvasTop > top + 0.002) {
    throw new Error(
      `${CLIENT_CANVAS_TOP_CROP_LOSS}: canvasTop ${boundary.canvasTop.toFixed(4)} cuts first client object ${boundary.firstClientOwnedObjectId} at y=${top.toFixed(4)}`,
    );
  }
}
