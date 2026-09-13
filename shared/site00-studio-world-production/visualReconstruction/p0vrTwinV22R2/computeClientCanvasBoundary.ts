import type { ConceptBlueprint } from '../p0vrTwinV22/types.js';
import type { GeneratedHostArtifact } from './types.js';
import { isHostOwnedBlueprintLabel } from './isHostOwnedBlueprintLabel.js';
import {
  APPROVED_CLIENT_BOTTOM_PADDING_NORM,
  CLIENT_CANVAS_TOP_NORM,
} from './clientCanvasBoundaryConstants.js';

export type ClientCanvasBoundary = {
  conceptId: string;
  canvasTop: number;
  lastClientContentBottom: number;
  bottomPadding: number;
  sanitizedCanvasBottom: number;
  sanitizedCanvasHeight: number;
  excludedHostArtifactHeight: number;
  hostSafeAreaInset: number;
  lastClientOwnedObjectId: string | null;
  lastClientOwnedObjectBounds: { y: number; h: number } | null;
  generatedHostNavBounds: { y: number; h: number } | null;
  status: 'TRIMMED' | 'UNTRIMMED';
};

export function computeLastClientContentBottom(blueprint: ConceptBlueprint): {
  lastClientContentBottom: number;
  lastClientOwnedObjectId: string | null;
  lastClientOwnedObjectBounds: { y: number; h: number } | null;
} {
  let lastBottom: number = CLIENT_CANVAS_TOP_NORM;
  let lastId: string | null = null;
  let lastBounds: { y: number; h: number } | null = null;

  for (const sec of blueprint.sections) {
    if (isHostOwnedBlueprintLabel(sec.label)) continue;
    const bottom = sec.bounds.y + sec.bounds.h;
    if (bottom > lastBottom) {
      lastBottom = bottom;
      lastId = sec.id;
      lastBounds = { y: sec.bounds.y, h: sec.bounds.h };
    }
  }

  for (const obj of blueprint.objects) {
    if (obj.isGeneratedHostArtifact) continue;
    if (obj.ownership === 'HOST_OWNED_LOCKED') continue;
    const bottom = obj.bounds.y + obj.bounds.h;
    if (bottom > lastBottom) {
      lastBottom = bottom;
      lastId = obj.objectId;
      lastBounds = { y: obj.bounds.y, h: obj.bounds.h };
    }
  }

  return {
    lastClientContentBottom: lastBottom,
    lastClientOwnedObjectId: lastId,
    lastClientOwnedObjectBounds: lastBounds,
  };
}

export function computeClientCanvasBoundary(input: {
  conceptId: string;
  executionBlueprint: ConceptBlueprint;
  generatedHostArtifacts: GeneratedHostArtifact[];
  hostBottomNavHeightNorm?: number;
}): ClientCanvasBoundary {
  const { lastClientContentBottom, lastClientOwnedObjectId, lastClientOwnedObjectBounds } =
    computeLastClientContentBottom(input.executionBlueprint);

  const bottomNavArtifact = input.generatedHostArtifacts.find((a) => a.artifactType === 'INVENTED_BOTTOM_NAV');
  const generatedHostNavBounds = bottomNavArtifact?.visualBounds ?? null;
  const artifactTop = generatedHostNavBounds?.y ?? 1;
  const excludedHostArtifactHeight = generatedHostNavBounds?.h ?? 0;

  const paddedBottom = lastClientContentBottom + APPROVED_CLIENT_BOTTOM_PADDING_NORM;
  const cappedBottom = generatedHostNavBounds
    ? Math.min(paddedBottom, Math.max(CLIENT_CANVAS_TOP_NORM, artifactTop - 0.005))
    : paddedBottom;

  const sanitizedCanvasBottom = Math.min(0.98, cappedBottom);
  const sanitizedCanvasHeight = Math.max(0.1, sanitizedCanvasBottom - CLIENT_CANVAS_TOP_NORM);

  return {
    conceptId: input.conceptId,
    canvasTop: CLIENT_CANVAS_TOP_NORM,
    lastClientContentBottom,
    bottomPadding: APPROVED_CLIENT_BOTTOM_PADDING_NORM,
    sanitizedCanvasBottom,
    sanitizedCanvasHeight,
    excludedHostArtifactHeight,
    hostSafeAreaInset: input.hostBottomNavHeightNorm ?? 0.12,
    lastClientOwnedObjectId,
    lastClientOwnedObjectBounds,
    generatedHostNavBounds,
    status: excludedHostArtifactHeight > 0 ? 'TRIMMED' : 'UNTRIMMED',
  };
}

export function clientCanvasClipInsetsFromBoundary(boundary: ClientCanvasBoundary): {
  topPct: number;
  bottomPct: number;
  visibleHeightRatio: number;
} {
  const topPct = boundary.canvasTop * 100;
  const bottomPct = (1 - boundary.sanitizedCanvasBottom) * 100;
  const visibleHeightRatio = boundary.sanitizedCanvasHeight;
  return { topPct, bottomPct, visibleHeightRatio };
}
