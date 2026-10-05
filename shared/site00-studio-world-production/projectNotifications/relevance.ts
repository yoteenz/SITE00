import { FOUNDER_RELEVANT_EVENT_TYPES, INTERNAL_EVENT_SUPPRESS } from './constants.js';
import type { StudioWorldProjectEvent } from './types.js';

export function isFounderRelevantProjectEvent(event: StudioWorldProjectEvent): boolean {
  if (event.founderRelevant === false) return false;
  if (event.founderRelevant === true) return true;
  if (INTERNAL_EVENT_SUPPRESS.has(event.eventType)) return false;
  if (FOUNDER_RELEVANT_EVENT_TYPES.has(event.eventType)) return true;
  return event.eventType.endsWith('_REQUIRED') || event.eventType.endsWith('_READY') || event.eventType.endsWith('_FAILED');
}
