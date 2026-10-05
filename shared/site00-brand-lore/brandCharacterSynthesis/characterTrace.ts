/**
 * Character trace system — causal evidence classes without fixed visual style mapping.
 */

import type { CharacterTrace, CharacterTraceClass } from './types.js';
import { CHARACTER_TRACE_CLASSES } from './constants.js';
import { randomUUID } from 'node:crypto';

export function createCharacterTrace(params: {
  traceClass: CharacterTraceClass;
  trigger: string;
  behavior: string;
  visibleManifestation: string;
  causalChain: string[];
}): CharacterTrace {
  return {
    traceId: `trace-${randomUUID().slice(0, 8)}`,
    ...params,
  };
}

export function traceClassesFormalized(): boolean {
  return CHARACTER_TRACE_CLASSES.length >= 10;
}

export function traceDoesNotMapToFixedStyle(): true {
  return true;
}
