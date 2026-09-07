/**
 * Sprint B4.5 — Entry 002 continuity authority pack for reference-conditioned cinematic sequence.
 */

import type { CinematicContinuityReferenceBoard } from '../../../shared/site00-expression-engine/entry002CinematicVisualSequenceTypes.js';
import { ENTRY_002_CONTINUITY_BOARD_IDS } from '../../../shared/site00-expression-engine/entry002CinematicSequenceIds.js';
import {
  ENTRY_002_REEL_KF_MID_001,
  ENTRY_002_REEL_KF_START_001,
  buildEntry002ReelKeyframeStoragePath,
} from '../../../shared/site00-expression-engine/entry002ReelKeyframeIds.js';
import {
  getSite00AssetPublicUrl,
  site00StorageObjectExists,
} from '../site00Assts/storage.js';

const AUTHORITY_PATHS: Array<Omit<CinematicContinuityReferenceBoard, 'previewUrl' | 'resolved'>> = [
  {
    boardId: ENTRY_002_CONTINUITY_BOARD_IDS.CHARACTER_IDENTITY,
    label: 'Character Identity Board',
    role: 'CHARACTER_IDENTITY',
    storagePath: buildEntry002ReelKeyframeStoragePath(ENTRY_002_REEL_KF_START_001),
  },
  {
    boardId: ENTRY_002_CONTINUITY_BOARD_IDS.HANDS_NAILS,
    label: 'Hands + Nails Authority Board',
    role: 'HANDS_NAILS',
    storagePath: buildEntry002ReelKeyframeStoragePath(ENTRY_002_REEL_KF_START_001),
  },
  {
    boardId: ENTRY_002_CONTINUITY_BOARD_IDS.HAIR_SILHOUETTE,
    label: 'Hair / Shadow / Silhouette Board',
    role: 'HAIR_SILHOUETTE',
    storagePath: buildEntry002ReelKeyframeStoragePath(ENTRY_002_REEL_KF_START_001),
  },
  {
    boardId: ENTRY_002_CONTINUITY_BOARD_IDS.FASHION_EVIDENCE,
    label: 'Fashion Evidence Board',
    role: 'FASHION_EVIDENCE',
    storagePath: buildEntry002ReelKeyframeStoragePath(ENTRY_002_REEL_KF_MID_001),
  },
  {
    boardId: ENTRY_002_CONTINUITY_BOARD_IDS.PHONE_EDIT_SUITE,
    label: 'Phone + Edit Suite Artifact Board',
    role: 'PHONE_EDIT_SUITE',
    storagePath: buildEntry002ReelKeyframeStoragePath(ENTRY_002_REEL_KF_MID_001),
  },
];

export async function resolveEntry002CinematicContinuityReferenceBoards(): Promise<
  CinematicContinuityReferenceBoard[]
> {
  const boards: CinematicContinuityReferenceBoard[] = [];
  for (const def of AUTHORITY_PATHS) {
    const exists = await site00StorageObjectExists(def.storagePath);
    boards.push({
      ...def,
      previewUrl: exists ? getSite00AssetPublicUrl(def.storagePath) : null,
      resolved: exists,
    });
  }
  return boards;
}

export function buildEntry002CharacterVisualCanon() {
  return {
    identity: 'Black woman — same NDXBOOK woman, same mind, same world — not a different influencer per shot',
    skinTone: 'medium-brown skin',
    hair: 'long sleek dark hair',
    makeup: '2016-era glam — defined brows, lashes, overlined glossy nude lips, black choker',
    nails: 'short lime green nails — consistent shape and length — NON-NEGOTIABLE',
    wardrobe: '2016 IG baddie fashion logic — bodycon, bomber, choker codes when visible',
    energy: 'confident observational presence — cinematic not glamour portrait',
  };
}

export function selectReferenceUrlsForFrame(
  boards: CinematicContinuityReferenceBoard[],
  frameReferenceBoardIds: string[],
  priorFrameUrl: string | null,
): string[] {
  const urls = boards
    .filter((b) => frameReferenceBoardIds.includes(b.boardId) && b.previewUrl)
    .map((b) => b.previewUrl!);

  const unique = [...new Set(urls)];
  if (priorFrameUrl) unique.push(priorFrameUrl);
  return unique.slice(0, 4);
}
