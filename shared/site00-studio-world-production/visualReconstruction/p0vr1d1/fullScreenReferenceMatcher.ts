/**
 * P0.VR.1D.1 — FullScreenReferenceMatcher
 */

import type { ExtractedScreenReference, FullScreenReferenceMatchResult } from './types.js';

export type FullScreenReferenceUpload = {
  assetId: string;
  url: string;
  width: number;
  height: number;
  route?: string;
  screenId?: string;
  label?: string;
  viewportClass?: 'desktop' | 'mobile';
};

export function matchFullScreenReferenceToScreen(
  upload: FullScreenReferenceUpload,
  existingScreens: ExtractedScreenReference[],
): FullScreenReferenceMatchResult {
  if (upload.screenId) {
    const explicit = existingScreens.find((s) => s.screenId === upload.screenId);
    if (explicit) {
      return {
        matched: true,
        screenId: explicit.screenId,
        matchReason: 'EXPLICIT_SCREEN',
        confidence: 1,
        duplicatePrevented: true,
      };
    }
  }

  if (upload.route) {
    const byRoute = existingScreens.find((s) => s.route === upload.route);
    if (byRoute) {
      return {
        matched: true,
        screenId: byRoute.screenId,
        matchReason: 'ROUTE',
        confidence: 0.95,
        duplicatePrevented: true,
      };
    }
  }

  if (upload.label) {
    const byLabel = existingScreens.find(
      (s) => s.moduleLabel?.toLowerCase() === upload.label!.toLowerCase(),
    );
    if (byLabel) {
      return {
        matched: true,
        screenId: byLabel.screenId,
        matchReason: 'LABEL',
        confidence: 0.88,
        duplicatePrevented: true,
      };
    }
  }

  if (upload.viewportClass) {
    const candidates = existingScreens.filter((s) => s.viewportClass === upload.viewportClass);
    if (candidates.length === 1) {
      return {
        matched: true,
        screenId: candidates[0]!.screenId,
        matchReason: 'VIEWPORT_CLASS',
        confidence: 0.7,
        duplicatePrevented: false,
      };
    }
  }

  const aspect = upload.width / Math.max(upload.height, 1);
  let best: ExtractedScreenReference | null = null;
  let bestScore = 0;
  for (const screen of existingScreens) {
    const score = 1 - Math.abs(screen.viewportRatio - aspect) / Math.max(screen.viewportRatio, aspect);
    if (score > bestScore) {
      bestScore = score;
      best = screen;
    }
  }
  if (best && bestScore > 0.85) {
    return {
      matched: true,
      screenId: best.screenId,
      matchReason: 'VISUAL_SIMILARITY',
      confidence: bestScore,
      duplicatePrevented: true,
    };
  }

  return {
    matched: false,
    screenId: null,
    matchReason: 'NONE',
    confidence: 0,
    duplicatePrevented: false,
  };
}

export function applyFullScreenOverrideToScreens(
  screens: ExtractedScreenReference[],
  upload: FullScreenReferenceUpload,
): { screens: ExtractedScreenReference[]; matchedScreenId: string | null } {
  const match = matchFullScreenReferenceToScreen(upload, screens);
  if (!match.matched || !match.screenId) {
    return { screens, matchedScreenId: null };
  }

  const updated = screens.map((screen) => {
    if (screen.screenId !== match.screenId) return screen;
    return {
      ...screen,
      croppedReferenceAssetId: upload.assetId,
      authoritySource: 'FOUNDER_FULL_SCREEN_REFERENCE' as const,
      authorityVersion: screen.authorityVersion + 1,
      referenceResolution: 'SUFFICIENT' as const,
      confidence: 0.98,
      authority: {
        ...screen.authority!,
        referenceAssetId: upload.assetId,
        referenceImageUrl: upload.url,
        imageAuthorityPath: upload.url,
        viewportWidth: upload.width,
        viewportHeight: upload.height,
        sourceType: 'APPROVED_SCREENSHOT' as const,
      },
    };
  });

  return { screens: updated, matchedScreenId: match.screenId };
}
