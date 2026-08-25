/**
 * P0.VR.1D.4 — FounderVisualBoardReference records from resolution.
 */

import { randomUUID } from 'node:crypto';
import type { FounderBoardResolution } from '../p0vr1d2/types.js';
import {
  NDX_FOUNDER_BOARD_CANONICAL_PATHS,
  NDX_FOUNDER_BOARD_SUPABASE_PATHS,
} from '../p0vr1d2/resolveNdxFounderBoardAssets.js';
import type { FounderVisualBoardReference } from './types.js';

export const FAIL_FOUNDER_REFERENCE_MISSING = 'FAIL_FOUNDER_REFERENCE_MISSING' as const;

export function buildFounderVisualBoardReferences(input: {
  projectId: string;
  resolution: FounderBoardResolution;
}): FounderVisualBoardReference[] {
  const now = new Date().toISOString();
  const sourceMap: Record<FounderBoardResolution['source'], FounderVisualBoardReference['source']> = {
    FOUNDER_PERSISTED: 'SUPABASE',
    ENV_OVERRIDE: 'FOUNDER_UPLOAD',
    CANONICAL_LOCAL: 'CANONICAL_LOCAL',
    FIXTURE_FALLBACK: 'CANONICAL_LOCAL',
    NOT_FOUND: 'CANONICAL_LOCAL',
  };

  const status: FounderVisualBoardReference['status'] =
    input.resolution.source === 'NOT_FOUND' ? 'MISSING' : 'ACTIVE_REFERENCE';

  return [
    {
      boardId: randomUUID(),
      projectId: input.projectId,
      assetId: `ndx-desktop-founder-board`,
      storagePath:
        input.resolution.source === 'FOUNDER_PERSISTED'
          ? NDX_FOUNDER_BOARD_SUPABASE_PATHS.desktop
          : NDX_FOUNDER_BOARD_CANONICAL_PATHS.desktop,
      resolvedUrl: input.resolution.desktopUrl,
      localPath: input.resolution.desktopPath,
      boardType: 'DESKTOP_MOOD_BOARD',
      viewportClass: 'desktop',
      source: sourceMap[input.resolution.source],
      status,
      uploadedAt: input.resolution.desktopPath ? now : null,
    },
    {
      boardId: randomUUID(),
      projectId: input.projectId,
      assetId: `ndx-mobile-founder-board`,
      storagePath:
        input.resolution.source === 'FOUNDER_PERSISTED'
          ? NDX_FOUNDER_BOARD_SUPABASE_PATHS.mobile
          : NDX_FOUNDER_BOARD_CANONICAL_PATHS.mobile,
      resolvedUrl: input.resolution.mobileUrl,
      localPath: input.resolution.mobilePath,
      boardType: 'MOBILE_MOOD_BOARD',
      viewportClass: 'mobile',
      source: sourceMap[input.resolution.source],
      status,
      uploadedAt: input.resolution.mobilePath ? now : null,
    },
  ];
}

export function failFounderReferenceMissing(resolution: FounderBoardResolution): boolean {
  return resolution.source === 'NOT_FOUND';
}

export function actualFounderBoardPersisted(resolution: FounderBoardResolution): boolean {
  return (
    (resolution.source === 'FOUNDER_PERSISTED' ||
      resolution.source === 'CANONICAL_LOCAL' ||
      resolution.source === 'ENV_OVERRIDE') &&
    !resolution.fixtureSubstitution
  );
}
