import type { ArtifactEventType } from '../types.js';
import type { LifecycleEventMapping } from './types.js';

/** FNDATN-01 lifecycle templates — enabled only under founder test mode + synthetic artifacts. */
export const FNDATN_TEST_LIFECYCLE_EVENT_MAP: LifecycleEventMapping[] = [
  { event_type: 'ARTIFACT_CREATED', template_ids: ['personal-foundation-invitation'], purpose: 'TRANSACTIONAL', requires_consent: null, enabled: true },
  { event_type: 'INTAKE_COMPLETED', template_ids: ['intake-completed'], purpose: 'TRANSACTIONAL', requires_consent: 'PROJECT_OPERATIONS', enabled: true },
  { event_type: 'QUOTE_CREATED', template_ids: ['quote-ready'], purpose: 'TRANSACTIONAL', requires_consent: 'PROJECT_OPERATIONS', enabled: true },
  { event_type: 'PAYMENT_CONFIRMED', template_ids: ['payment-confirmed'], purpose: 'TRANSACTIONAL', requires_consent: 'ESSENTIAL_SERVICE', enabled: true },
  { event_type: 'FOUNDATION_COMPLETED', template_ids: ['foundation-complete'], purpose: 'TRANSACTIONAL', requires_consent: 'ESSENTIAL_SERVICE', enabled: true },
];

export function mappingsForFndatnTestEvent(eventType: ArtifactEventType): LifecycleEventMapping[] {
  return FNDATN_TEST_LIFECYCLE_EVENT_MAP.filter((m) => m.event_type === eventType);
}
