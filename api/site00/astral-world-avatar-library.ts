import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  CURATED_AVATAR_LIBRARY,
  listApprovedLibraryAvatars,
} from '../../shared/site00-astral-world/readerAccount/avatarLibraryManifest.js';

/**
 * Public curated avatar library for selector preload (no FAL invocation).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const approvedOnly = req.query.approved === '1';
  const avatars = approvedOnly ? listApprovedLibraryAvatars() : CURATED_AVATAR_LIBRARY;

  return res.status(200).json({
    ok: true,
    manifest: 'AW_AVATAR_LIBRARY_V1',
    librarySize: CURATED_AVATAR_LIBRARY.length,
    avatars: avatars.map((a) => ({
      avatarId: a.avatarId,
      presentation: a.presentation,
      displayLabel: a.displayLabel,
      portraitAssetSlot: a.portraitAssetSlot,
      thumbnailAssetSlot: a.thumbnailAssetSlot,
      approvalState: a.approvalState,
      pilotBatch: Boolean(a.pilotBatch),
    })),
    preloaded: true,
    randomStockImages: false,
  });
}
