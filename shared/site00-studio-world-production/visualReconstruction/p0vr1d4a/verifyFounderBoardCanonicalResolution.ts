/**
 * P0.VR.1D.4A — Verify founder boards resolve before live reconstruction.
 */

import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import {
  resolveNdxFounderProjectHubBoards,
  NDX_FOUNDER_BOARD_CANONICAL_PATHS,
} from '../p0vr1d2/resolveNdxFounderBoardAssets.js';
import { FOUNDER_REFERENCE_SOURCE } from './constants.js';
import type { FounderReferenceResolutionProof } from './types.js';

export type VerifyFounderBoardCanonicalResolutionInput = {
  projectRoot?: string;
  requireSupabaseUrl?: boolean;
};

function resolveUrl(path: string | null): string | null {
  if (!path || !existsSync(path)) return null;
  return pathToFileURL(path).href;
}

export async function verifyFounderBoardCanonicalResolution(
  input: VerifyFounderBoardCanonicalResolutionInput = {},
): Promise<FounderReferenceResolutionProof> {
  const resolution = await resolveNdxFounderProjectHubBoards({
    projectRoot: input.projectRoot,
    allowFixtureFallback: false,
    requireFounderReference: true,
  });

  const desktopLocal = resolution.desktopPath;
  const mobileLocal = resolution.mobilePath;
  const desktopFileUrl = resolveUrl(desktopLocal);
  const mobileFileUrl = resolveUrl(mobileLocal);
  const supabaseDesktop = resolution.desktopUrl;
  const supabaseMobile = resolution.mobileUrl;

  const desktopResolvedUrl = supabaseDesktop ?? desktopFileUrl;
  const mobileResolvedUrl = supabaseMobile ?? mobileFileUrl;

  const founderReference =
    !resolution.fixtureSubstitution &&
    resolution.source !== 'NOT_FOUND' &&
    resolution.source !== 'FIXTURE_FALLBACK' &&
    Boolean(desktopLocal && mobileLocal);

  if (!founderReference) {
    return {
      desktopResolved: false,
      mobileResolved: false,
      desktopResolvedUrl: null,
      mobileResolvedUrl: null,
      desktopLocalPath: desktopLocal,
      mobileLocalPath: mobileLocal,
      source: 'NOT_FOUND',
      fixtureFallback: false,
      blocked: true,
      blockReason: 'Founder desktop/mobile mood boards not resolved — upload to canonical paths',
    };
  }

  if (input.requireSupabaseUrl && (!supabaseDesktop || !supabaseMobile)) {
    return {
      desktopResolved: Boolean(supabaseDesktop),
      mobileResolved: Boolean(supabaseMobile),
      desktopResolvedUrl: supabaseDesktop,
      mobileResolvedUrl: supabaseMobile,
      desktopLocalPath: desktopLocal,
      mobileLocalPath: mobileLocal,
      source: FOUNDER_REFERENCE_SOURCE,
      fixtureFallback: false,
      blocked: true,
      blockReason: 'Supabase founder board URLs required but not available',
    };
  }

  const desktopResolved = Boolean(desktopResolvedUrl);
  const mobileResolved = Boolean(mobileResolvedUrl);

  return {
    desktopResolved,
    mobileResolved,
    desktopResolvedUrl,
    mobileResolvedUrl,
    desktopLocalPath: desktopLocal,
    mobileLocalPath: mobileLocal,
    source: FOUNDER_REFERENCE_SOURCE,
    fixtureFallback: false,
    blocked: !(desktopResolved && mobileResolved),
    blockReason:
      desktopResolved && mobileResolved
        ? null
        : `Missing founder reference — expected ${NDX_FOUNDER_BOARD_CANONICAL_PATHS.desktop} and ${NDX_FOUNDER_BOARD_CANONICAL_PATHS.mobile}`,
  };
}

export function founderReferenceReady(proof: FounderReferenceResolutionProof): boolean {
  return proof.source === FOUNDER_REFERENCE_SOURCE && !proof.blocked && !proof.fixtureFallback;
}
