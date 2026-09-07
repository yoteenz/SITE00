/**
 * Sprint B4.5 — Assemble Entry 002 cinematic visual sequence board record.
 */

import type { CinematicVisualSequenceBoard } from '../../../shared/site00-expression-engine/entry002CinematicVisualSequenceTypes.js';
import { CINEMATIC_VIDEO_PRODUCTION_ORDER } from '../../../shared/site00-expression-engine/entry002CinematicVisualSequenceTypes.js';
import {
  buildEntry002CinematicFrameId,
  ENTRY_002_CINEMATIC_SEQUENCE_001,
} from '../../../shared/site00-expression-engine/entry002CinematicSequenceIds.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import { buildEntry002CinematicVisualSequenceFrames } from './entry002CinematicSequenceFrames.js';
import {
  buildEntry002CharacterVisualCanon,
  resolveEntry002CinematicContinuityReferenceBoards,
} from './entry002CinematicSequenceContinuityPack.js';

export async function buildEntry002CinematicVisualSequenceRecord(
  framesWithUrls?: Array<{ frameNumber: number; storagePath: string; previewUrl: string }>,
  contactSheet?: { storagePath: string; previewUrl: string } | null,
): Promise<CinematicVisualSequenceBoard> {
  const baseFrames = buildEntry002CinematicVisualSequenceFrames();
  const frames = baseFrames.map((f) => {
    const visual = framesWithUrls?.find((v) => v.frameNumber === f.frameNumber);
    if (!visual) return f;
    return { ...f, storagePath: visual.storagePath, previewUrl: visual.previewUrl };
  });

  const continuityReferences = await resolveEntry002CinematicContinuityReferenceBoards();

  return {
    sequenceId: ENTRY_002_CINEMATIC_SEQUENCE_001,
    entryId: 'entry-002',
    chapterId: CHAPTER_01_ID,
    formatId: 'REEL',
    visualStyle: 'CINEMATIC_VISUAL_DEVELOPMENT',
    frameCount: frames.length,
    frames,
    contactSheetPath: contactSheet?.storagePath ?? null,
    contactSheetUrl: contactSheet?.previewUrl ?? null,
    continuityReferences,
    characterVisualCanon: buildEntry002CharacterVisualCanon(),
    keyframeExtractionMap: {
      START: {
        sourceFrameIds: [
          buildEntry002CinematicFrameId(1),
          buildEntry002CinematicFrameId(2),
        ],
        blockedUntilApproval: true,
      },
      MID: {
        sourceFrameIds: [
          buildEntry002CinematicFrameId(6),
          buildEntry002CinematicFrameId(7),
          buildEntry002CinematicFrameId(8),
        ],
        blockedUntilApproval: true,
      },
      END: {
        sourceFrameIds: [
          buildEntry002CinematicFrameId(9),
          buildEntry002CinematicFrameId(10),
        ],
        blockedUntilApproval: true,
      },
    },
    founderJudgment: 'UNREVIEWED',
    canonState: 'NON_CANON',
    gateId: 'GATE_0B_CINEMATIC_SEQUENCE',
  };
}

export { CINEMATIC_VIDEO_PRODUCTION_ORDER };
