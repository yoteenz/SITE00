/**
 * Generic Studio World — Physical Book behavior model (future-facing prop logic).
 */

import { randomUUID } from 'node:crypto';
import type { PhysicalBookBehavior, PhysicalBookPresenceEvaluation } from './types.js';

export const GENERIC_PHYSICAL_BOOK_BEHAVIORS = [
  'OPEN_BOOK',
  'TURN_PAGE',
  'ADD_PAGE',
  'TAPE_IN',
  'WRITE_MARGIN_NOTE',
  'ADD_FOOTNOTE',
  'BOOKMARK_PAGE',
  'DOG_EAR_SUBJECT',
  'FLIP_BACK',
  'CORRECT',
  'CROSS_OUT',
  'ADD_ERRATA',
  'WATCH_BOOK_GROW',
] as const;

export function buildPhysicalBookBehavior(action: string): PhysicalBookBehavior {
  return {
    behaviorId: randomUUID(),
    action,
    narrativeRole: 'Recurring cultural object — optional prop, not mandatory gimmick',
    mandatoryInEveryReel: false,
  };
}

export function evaluatePhysicalBookPresence(params: {
  motionMode: string;
  platform: string;
}): PhysicalBookPresenceEvaluation {
  let decision: PhysicalBookPresenceEvaluation['decision'] = 'NOT_NEEDED';
  let reason = 'Physical Book not required for this expression';

  if (params.motionMode === 'FLIP_BACK' || params.motionMode === 'RECEIPT_CAME_BACK') {
    decision = 'SUPPORTING';
    reason = 'Prior Page reference may benefit from physical Book trace';
  } else if (params.motionMode === 'PAGE_IN_PROGRESS') {
    decision = 'CENTRAL';
    reason = 'Thought becoming Page — Book may be central prop';
  } else if (params.platform === 'STORY') {
    decision = 'TRACE_ONLY';
    reason = 'Stories are margins — Book trace optional at most';
  }

  return {
    evaluationId: randomUUID(),
    decision,
    reason,
  };
}

export function physicalBookNotMandatoryInEveryReel(): true {
  return true;
}
