import { CLIENT_CANVAS_HOST_ARTIFACT_HEIGHT_LEAK } from './clientCanvasBoundaryConstants.js';
import type { ClientCanvasBoundary } from './computeClientCanvasBoundary.js';
import type { GeneratedHostArtifact } from './types.js';

export function assertClientCanvasExcludesHostArtifactExtent(input: {
  boundary: ClientCanvasBoundary;
  generatedHostArtifacts: GeneratedHostArtifact[];
}): void {
  const navArtifact = input.generatedHostArtifacts.find((a) => a.artifactType === 'INVENTED_BOTTOM_NAV');
  if (!navArtifact) return;

  const artifactTop = navArtifact.visualBounds.y;
  if (input.boundary.sanitizedCanvasBottom > artifactTop + 0.002) {
    throw new Error(
      `${CLIENT_CANVAS_HOST_ARTIFACT_HEIGHT_LEAK}: sanitized canvas bottom ${input.boundary.sanitizedCanvasBottom.toFixed(3)} extends into host nav at ${artifactTop.toFixed(3)}`,
    );
  }
}
