import type { ConceptBlueprint } from '../p0vrTwinV22/types.js';
import type { GeneratedHostArtifact } from './types.js';
import { isHostOwnedBlueprintLabel } from './isHostOwnedBlueprintLabel.js';
import {
  APPROVED_CLIENT_BOTTOM_PADDING_NORM,
  CLIENT_CANVAS_TOP_FALLBACK_NORM,
  CLIENT_CANVAS_BOTTOM_VISUAL_BLEED_NORM,
  MASTHEAD_VISUAL_BLEED_NORM,
  SITE00_HOST_BOTTOM_INSET_NORM,
  SITE00_HOST_TOP_INSET_NORM,
} from './clientCanvasBoundaryConstants.js';
import { isInventedBottomNavObject } from './detectGeneratedHostArtifacts.js';

export type ClientCanvasBoundary = {
  conceptId: string;
  canvasTop: number;
  firstClientContentTop: number;
  lastClientContentBottom: number;
  bottomPadding: number;
  sanitizedCanvasBottom: number;
  sanitizedCanvasHeight: number;
  excludedHostArtifactHeight: number;
  hostSafeAreaInset: number;
  firstClientOwnedObjectId: string | null;
  firstClientOwnedObjectBounds: { y: number; h: number } | null;
  lastClientOwnedObjectId: string | null;
  lastClientOwnedObjectBounds: { y: number; h: number } | null;
  generatedHostNavBounds: { y: number; h: number } | null;
  ownershipCorrections: string[];
  status: 'TRIMMED' | 'UNTRIMMED';
};

function isClientBlueprintObject(obj: ConceptBlueprint['objects'][0]): boolean {
  if (obj.isGeneratedHostArtifact) return false;
  if (obj.ownership === 'HOST_OWNED_LOCKED') return false;
  if (obj.objectId === 'obj-host-header') return false;
  if (isInventedBottomNavObject(obj)) return false;
  return true;
}

function isClientBlueprintSection(sec: ConceptBlueprint['sections'][0]): boolean {
  if (isHostOwnedBlueprintLabel(sec.label)) return false;
  const n = sec.label.toLowerCase();
  if (n.includes('host bottom nav')) return false;
  return true;
}

function resolveMastheadSectionTop(blueprint: ConceptBlueprint): number | null {
  for (const sec of blueprint.sections) {
    const n = sec.label.toLowerCase();
    if (n.includes('masthead') || n.includes('project identity')) {
      return sec.bounds.y;
    }
  }
  return null;
}

export function computeFirstClientContentTop(blueprint: ConceptBlueprint): {
  firstClientContentTop: number;
  firstClientOwnedObjectId: string | null;
  firstClientOwnedObjectBounds: { y: number; h: number } | null;
  ownershipCorrections: string[];
} {
  const ownershipCorrections: string[] = [];
  let firstTop = 1;
  let firstId: string | null = null;
  let firstBounds: { y: number; h: number } | null = null;

  for (const sec of blueprint.sections) {
    if (!isClientBlueprintSection(sec)) continue;
    if (sec.label.toLowerCase().includes('masthead') || sec.label.toLowerCase().includes('project identity')) {
      ownershipCorrections.push(`${sec.label}: CLIENT_OWNED_CREATIVE (masthead band)`);
    }
    if (sec.bounds.y < firstTop) {
      firstTop = sec.bounds.y;
      firstId = sec.id;
      firstBounds = { y: sec.bounds.y, h: sec.bounds.h };
    }
  }

  for (const obj of blueprint.objects) {
    if (!isClientBlueprintObject(obj)) continue;
    if (obj.bounds.y < firstTop) {
      firstTop = obj.bounds.y;
      firstId = obj.objectId;
      firstBounds = { y: obj.bounds.y, h: obj.bounds.h };
    }
  }

  const mastheadTop = resolveMastheadSectionTop(blueprint);
  if (mastheadTop != null && mastheadTop < firstTop) {
    firstTop = mastheadTop;
    const mastheadSec = blueprint.sections.find((s) => {
      const n = s.label.toLowerCase();
      return n.includes('masthead') || n.includes('project identity');
    });
    if (mastheadSec) {
      firstId = mastheadSec.id;
      firstBounds = { y: mastheadSec.bounds.y, h: mastheadSec.bounds.h };
    }
  }

  if (firstTop >= 1) {
    firstTop = CLIENT_CANVAS_TOP_FALLBACK_NORM;
  }

  return {
    firstClientContentTop: Math.max(0, firstTop),
    firstClientOwnedObjectId: firstId,
    firstClientOwnedObjectBounds: firstBounds,
    ownershipCorrections,
  };
}

export function computeLastClientContentBottom(blueprint: ConceptBlueprint): {
  lastClientContentBottom: number;
  lastClientOwnedObjectId: string | null;
  lastClientOwnedObjectBounds: { y: number; h: number } | null;
} {
  let lastBottom = 0;
  let lastId: string | null = null;
  let lastBounds: { y: number; h: number } | null = null;

  for (const sec of blueprint.sections) {
    if (!isClientBlueprintSection(sec)) continue;
    const bottom = sec.bounds.y + sec.bounds.h;
    if (bottom > lastBottom) {
      lastBottom = bottom;
      lastId = sec.id;
      lastBounds = { y: sec.bounds.y, h: sec.bounds.h };
    }
  }

  for (const obj of blueprint.objects) {
    if (!isClientBlueprintObject(obj)) continue;
    const bottom = obj.bounds.y + obj.bounds.h;
    if (bottom > lastBottom) {
      lastBottom = bottom;
      lastId = obj.objectId;
      lastBounds = { y: obj.bounds.y, h: obj.bounds.h };
    }
  }

  for (const sec of blueprint.sections) {
    if (!isClientBlueprintSection(sec)) continue;
    if (!sec.label.toLowerCase().includes('activity')) continue;
    const activityBottom = sec.bounds.y + sec.bounds.h;
    if (activityBottom > lastBottom) {
      lastBottom = activityBottom;
      lastId = sec.id;
      lastBounds = { y: sec.bounds.y, h: sec.bounds.h };
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
  hostTopInsetNorm?: number;
  hostBottomNavHeightNorm?: number;
}): ClientCanvasBoundary {
  const first = computeFirstClientContentTop(input.executionBlueprint);
  const last = computeLastClientContentBottom(input.executionBlueprint);

  const bottomNavArtifact = input.generatedHostArtifacts.find((a) => a.artifactType === 'INVENTED_BOTTOM_NAV');
  const generatedHostNavBounds = bottomNavArtifact?.visualBounds ?? null;
  const excludedHostArtifactHeight = generatedHostNavBounds?.h ?? 0;

  const hostTopInset = input.hostTopInsetNorm ?? SITE00_HOST_TOP_INSET_NORM;
  const hostBottomInset = input.hostBottomNavHeightNorm ?? SITE00_HOST_BOTTOM_INSET_NORM;
  const mastheadTop = resolveMastheadSectionTop(input.executionBlueprint);
  const rawTop = Math.min(first.firstClientContentTop, mastheadTop ?? first.firstClientContentTop);
  let canvasTop = Math.max(0, Math.min(rawTop, hostTopInset));
  if (mastheadTop != null) {
    canvasTop = Math.max(0, canvasTop - MASTHEAD_VISUAL_BLEED_NORM);
  }

  const paddedBottom =
    last.lastClientContentBottom +
    APPROVED_CLIENT_BOTTOM_PADDING_NORM +
    CLIENT_CANVAS_BOTTOM_VISUAL_BLEED_NORM;
  const hostSafeBottom = 1 - hostBottomInset;
  // When a fake bottom nav artifact exists, activity paint often sits between blueprint boxes and
  // the painted nav strip. Honor paddedBottom (incl. visual bleed) up to the assert leak ceiling
  // (artifact top + 2mm norm), not a tighter artifactCap-only slice — otherwise bleed changes no-op.
  const maxBottomAllowed = generatedHostNavBounds
    ? Math.min(0.98, generatedHostNavBounds.y + 0.002)
    : hostSafeBottom;
  const cappedBottom = generatedHostNavBounds
    ? Math.min(paddedBottom, maxBottomAllowed)
    : Math.min(paddedBottom, hostSafeBottom);

  const sanitizedCanvasBottom = Math.min(0.98, cappedBottom);
  const sanitizedCanvasHeight = Math.max(0.1, sanitizedCanvasBottom - canvasTop);

  return {
    conceptId: input.conceptId,
    canvasTop,
    firstClientContentTop: first.firstClientContentTop,
    lastClientContentBottom: last.lastClientContentBottom,
    bottomPadding: APPROVED_CLIENT_BOTTOM_PADDING_NORM,
    sanitizedCanvasBottom,
    sanitizedCanvasHeight,
    excludedHostArtifactHeight,
    hostSafeAreaInset: input.hostBottomNavHeightNorm ?? 0.12,
    firstClientOwnedObjectId: first.firstClientOwnedObjectId,
    firstClientOwnedObjectBounds: first.firstClientOwnedObjectBounds,
    lastClientOwnedObjectId: last.lastClientOwnedObjectId,
    lastClientOwnedObjectBounds: last.lastClientOwnedObjectBounds,
    generatedHostNavBounds,
    ownershipCorrections: first.ownershipCorrections,
    status: excludedHostArtifactHeight > 0 ? 'TRIMMED' : 'UNTRIMMED',
  };
}

/** Clip insets for legacy/debug only — presentation uses translate + padding frame (R2R3). */
export function clientCanvasClipInsetsFromBoundary(boundary: ClientCanvasBoundary): {
  topPct: number;
  bottomPct: number;
  visibleHeightRatio: number;
} {
  const topPct = boundary.canvasTop * 100;
  const bottomPct = (1 - boundary.sanitizedCanvasBottom) * 100;
  return { topPct, bottomPct, visibleHeightRatio: boundary.sanitizedCanvasHeight };
}
