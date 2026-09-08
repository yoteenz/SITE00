/**
 * Sprint B4.7 — Founder-approved pre-storyboard visual authority asset paths.
 */

import { buildEntry002PreStoryboardAuthorityId } from '../../../shared/site00-expression-engine/preStoryboardAuthorityIds.js';

const PUBLIC_ASSET_BASE = '/assets/expression-engine/entry-002/pre-storyboard-authority';

export function buildEntry002PreStoryboardPublicAssetPath(boardNumber: number): string {
  const boardId = buildEntry002PreStoryboardAuthorityId(boardNumber);
  return `${PUBLIC_ASSET_BASE}/${boardId.toLowerCase()}.jpg`;
}

export function resolveEntry002PreStoryboardPreviewUrl(boardNumber: number): string {
  return buildEntry002PreStoryboardPublicAssetPath(boardNumber);
}

export function attachEntry002PreStoryboardFounderAssets<T extends { boardNumber: number; boardId: string; storagePath: string | null; previewUrl: string | null }>(
  authorities: T[],
): T[] {
  return authorities.map((board) => {
    const publicPath = buildEntry002PreStoryboardPublicAssetPath(board.boardNumber);
    return {
      ...board,
      storagePath: `public${publicPath}`,
      previewUrl: publicPath,
    };
  });
}
