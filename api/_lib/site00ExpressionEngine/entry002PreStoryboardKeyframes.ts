/**
 * Sprint B4.4 — Mark pre-storyboard keyframe experiments (START/MID/END-001).
 */

import type { PreStoryboardKeyframeStatus } from '../../../shared/site00-expression-engine/entry002ReelStoryboardTypes.js';
import {
  ENTRY_002_REEL_KF_END_001,
  ENTRY_002_REEL_KF_MID_001,
  ENTRY_002_REEL_KF_START_001,
} from '../../../shared/site00-expression-engine/entry002ReelKeyframeIds.js';

export function buildEntry002PreStoryboardKeyframeStatuses(): PreStoryboardKeyframeStatus[] {
  return [
    {
      assetId: ENTRY_002_REEL_KF_START_001,
      role: 'START',
      status: 'PRE_STORYBOARD_EXPERIMENT',
      canonState: 'NON_CANON',
      founderJudgment: 'UNREVIEWED',
      mayNotBecomeReelAuthority: true,
      mayNotSourceMotion: true,
    },
    {
      assetId: ENTRY_002_REEL_KF_MID_001,
      role: 'MID',
      status: 'PRE_STORYBOARD_EXPERIMENT',
      canonState: 'NON_CANON',
      founderJudgment: 'UNREVIEWED',
      mayNotBecomeReelAuthority: true,
      mayNotSourceMotion: true,
    },
    {
      assetId: ENTRY_002_REEL_KF_END_001,
      role: 'END',
      status: 'PRE_STORYBOARD_EXPERIMENT',
      canonState: 'NON_CANON',
      founderJudgment: 'UNREVIEWED',
      mayNotBecomeReelAuthority: true,
      mayNotSourceMotion: true,
    },
  ];
}
