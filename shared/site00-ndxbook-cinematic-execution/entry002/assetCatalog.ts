import {
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_ID,
  buildEntry002FinalCinematicStoryboardPanelPublicPath,
} from '../../site00-expression-engine/finalCinematicStoryboardIds.js';
import {
  ENTRY_002_REEL_KF_END_001,
  ENTRY_002_REEL_KF_MID_001,
  ENTRY_002_REEL_KF_START_001,
  buildEntry002ReelKeyframeStoragePath,
} from '../../site00-expression-engine/entry002ReelKeyframeIds.js';

export const ENTRY_002_ID = 'NDX-ENTRY-002' as const;
export const ENTRY_002_CHARACTER_SUBJECT_WOMAN = 'char-entry002-subject-woman' as const;

export const ENTRY_002_PRE_STORYBOARD_AUTHORITIES = [
  { assetId: 'NDX-ENTRY-002-PRE-SBA-NDX-PRESENCE-001', boardNumber: 1, creativeRole: 'NDX_PRESENCE' },
  { assetId: 'NDX-ENTRY-002-PRE-SBA-SUBJECT-DUAL-ERA-001', boardNumber: 2, creativeRole: 'SUBJECT_DUAL_ERA' },
  { assetId: 'NDX-ENTRY-002-PRE-SBA-NDX-HANDS-001', boardNumber: 3, creativeRole: 'NDX_HANDS' },
  { assetId: 'NDX-ENTRY-002-PRE-SBA-FASHION-CONTINUITY-001', boardNumber: 4, creativeRole: 'FASHION_CONTINUITY' },
  { assetId: 'NDX-ENTRY-002-PRE-SBA-PHONE-GLITCH-001', boardNumber: 5, creativeRole: 'PHONE_GLITCH' },
] as const;

export function entry002PreStoryboardPublicPath(boardNumber: number): string {
  const board = ENTRY_002_PRE_STORYBOARD_AUTHORITIES.find((b) => b.boardNumber === boardNumber);
  if (!board) throw new Error(`Unknown board ${boardNumber}`);
  return `/assets/expression-engine/entry-002/pre-storyboard-authority/${board.assetId.toLowerCase()}.jpg`;
}

export function entry002FinalStoryboardPanelPublicPath(panelNumber: number): string {
  return buildEntry002FinalCinematicStoryboardPanelPublicPath(
    ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_ID,
    panelNumber,
    '001',
  );
}

export const ENTRY_002_REEL_KEYFRAME_CATALOG = [
  {
    assetId: ENTRY_002_REEL_KF_START_001,
    role: 'START' as const,
    storagePath: buildEntry002ReelKeyframeStoragePath(ENTRY_002_REEL_KF_START_001),
  },
  {
    assetId: ENTRY_002_REEL_KF_MID_001,
    role: 'MID' as const,
    storagePath: buildEntry002ReelKeyframeStoragePath(ENTRY_002_REEL_KF_MID_001),
  },
  {
    assetId: ENTRY_002_REEL_KF_END_001,
    role: 'END' as const,
    storagePath: buildEntry002ReelKeyframeStoragePath(ENTRY_002_REEL_KF_END_001),
  },
];
