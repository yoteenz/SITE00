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
    ndxRole:
      'Spectator / investigator / receipt-puller / cultural interjector — ambiguous, partially seen, NEVER full model-sheet protagonist',
    ndxVisibility:
      'hands, short lime nails, silhouette, shadow, over-shoulder, partial profile, cropped body — NOT subject-woman face',
    subjectWomanRole:
      'Cultural receipt — same woman in 2016 and 2026, may be fully visible, identity locked across both years',
    subjectWomanIdentity:
      'Face, skin tone, body proportions, hair, core makeup consistent — immediately same person in both eras',
    subjectWomanSkinTone: 'medium-brown skin — subject woman only (NOT applied to NDX)',
    subjectWomanHair: 'long sleek dark hair — locked across 2016 and 2026',
    subjectWomanMakeup: '2016-era glam when in 2016 — defined brows, lashes, overlined glossy nude lips, choker',
    ndxNails: 'short lime green square/soft-square nails — NDX hand authority ONLY — NON-NEGOTIABLE',
    subjectWomanWardrobe: '2016 IG baddie fashion language — choker, bodycon, bomber, thigh-high boots family',
    roleSplitCorrected: true as const,
    deprecatedCollapsedIdentity:
      'REMOVED — "face: Black woman, medium-brown skin — same NDXBOOK woman every frame" is NOT canon',
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
