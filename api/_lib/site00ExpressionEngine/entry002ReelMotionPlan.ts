/**
 * Sprint B4 — Entry 002 REEL motion plan (Stage 2).
 */

import type { ReelMotionPlan } from '../../../shared/site00-expression-engine/entry002ReelTypes.js';

export function buildEntry002ReelMotionPlan(): ReelMotionPlan {
  return {
    planId: 'motion-entry-002-reel-b4',
    entryId: 'entry-002',
    format: 'REEL',
    cameraBehavior: [
      'Push-in on phone glow opening — subject-first legibility',
      'Controlled handheld drift through archive portal',
      'Slow orbit on edit suite timeline during cultural re-edit',
      'Settle to static on synthesis + end card',
    ],
    phoneBehavior: [
      'Evidence device only — tap, scroll, archive open',
      'Then-language and now-language as controlled receipts',
      'NOT giant comment feed or social mockup demo',
      'Portal transition into edit suite world',
    ],
    timelineBehavior: [
      'Physical strip pulled into suite',
      'Label blocks slide and splice',
      'Same fashion frame held while label changes',
      'Color-grade wipe as nostalgia rehabilitation',
    ],
    cutBehavior: [
      'Hard cut from hook into archive within 3 seconds',
      'Edit-point cuts synced to foley and glitch transitions',
      'Symbolic blade lift — not violent',
    ],
    transitionLogic: [
      'Phone portal → edit suite dimensional reveal',
      'Receipt text via physical labels not floating UI',
      'Interjection lands on artifact or title surface not decorative quote card',
    ],
    status: 'COMPILED',
  };
}
