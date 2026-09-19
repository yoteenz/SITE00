/**
 * Sprint B4.5 — Retire B4.4 sketch storyboard as blocking reference only.
 */

import type { BlockingStoryboardStatus } from '../../../shared/site00-expression-engine/entry002CinematicVisualSequenceTypes.js';

export function buildEntry002BlockingStoryboardRetirement(): BlockingStoryboardStatus {
  return {
    storyboardId: 'NDX-ENTRY-002-REEL-STORYBOARD-001',
    type: 'DIRECTOR_BLOCKING_STORYBOARD',
    status: 'REFERENCE_ONLY',
    canonState: 'NON_CANON',
    visualAuthority: false,
    purpose: 'shot order, argument beats, basic blocking, narrative progression only',
    preserves: [
      'shot order',
      'argument beats',
      'basic blocking',
      'narrative progression',
    ],
    doesNotDefine: [
      'cinematography',
      'character appearance',
      'fashion appearance',
      'lighting',
      'world appearance',
      'materiality',
      'final composition',
      'color',
      'visual tone',
    ],
  };
}
