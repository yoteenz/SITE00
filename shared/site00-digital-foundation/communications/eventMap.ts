import type { ArtifactEventType } from '../types.js';
import type { LifecycleEventMapping } from './types.js';

/**
 * Candidate lifecycle map (T01–T29 inventory). `enabled: false` until founder approves template + send flag.
 * Reuses SITE 00 email pack template IDs where a match exists; does not imply live delivery.
 */
export const DIGITAL_FOUNDATION_LIFECYCLE_EVENT_MAP: LifecycleEventMapping[] = [
  { event_type: 'ARTIFACT_CREATED', template_ids: ['personal-foundation-invitation'], purpose: 'TRANSACTIONAL', requires_consent: null, enabled: false },
  { event_type: 'LINK_OPENED', template_ids: [], purpose: 'OPERATIONAL', requires_consent: null, enabled: false },
  { event_type: 'INTAKE_STARTED', template_ids: ['intake-started'], purpose: 'TRANSACTIONAL', requires_consent: 'PROJECT_OPERATIONS', enabled: false },
  { event_type: 'INTAKE_COMPLETED', template_ids: ['intake-completed'], purpose: 'TRANSACTIONAL', requires_consent: 'PROJECT_OPERATIONS', enabled: false },
  { event_type: 'QUOTE_CREATED', template_ids: ['quote-ready'], purpose: 'TRANSACTIONAL', requires_consent: 'PROJECT_OPERATIONS', enabled: false },
  { event_type: 'QUOTE_UPDATED', template_ids: ['quote-updated'], purpose: 'TRANSACTIONAL', requires_consent: 'PROJECT_OPERATIONS', enabled: false },
  { event_type: 'QUOTE_ACCEPTED', template_ids: ['quote-accepted'], purpose: 'TRANSACTIONAL', requires_consent: 'PROJECT_OPERATIONS', enabled: false },
  { event_type: 'CHECKOUT_CREATED', template_ids: ['checkout-link-ready'], purpose: 'TRANSACTIONAL', requires_consent: 'PROJECT_OPERATIONS', enabled: false },
  { event_type: 'PAYMENT_CONFIRMED', template_ids: ['payment-confirmed'], purpose: 'TRANSACTIONAL', requires_consent: 'ESSENTIAL_SERVICE', enabled: false },
  { event_type: 'PAYMENT_FAILED', template_ids: ['payment-failed'], purpose: 'TRANSACTIONAL', requires_consent: 'ESSENTIAL_SERVICE', enabled: false },
  { event_type: 'PROJECT_ACTIVATED', template_ids: ['project-activated'], purpose: 'TRANSACTIONAL', requires_consent: 'PROJECT_OPERATIONS', enabled: false },
  { event_type: 'CLIENT_ACTION_REQUESTED', template_ids: ['client-action-required'], purpose: 'OPERATIONAL', requires_consent: 'PROJECT_OPERATIONS', enabled: false },
  { event_type: 'CLIENT_ACTION_COMPLETED', template_ids: ['approval-completed'], purpose: 'OPERATIONAL', requires_consent: 'PROJECT_OPERATIONS', enabled: false },
  { event_type: 'APPROVAL_REQUESTED', template_ids: ['approval-requested'], purpose: 'OPERATIONAL', requires_consent: 'PROJECT_OPERATIONS', enabled: false },
  { event_type: 'FOUNDATION_COMPLETED', template_ids: ['foundation-complete'], purpose: 'TRANSACTIONAL', requires_consent: 'ESSENTIAL_SERVICE', enabled: false },
  { event_type: 'FOUNDATION_VERIFIED', template_ids: ['records-available'], purpose: 'TRANSACTIONAL', requires_consent: 'ESSENTIAL_SERVICE', enabled: false },
  { event_type: 'CREDIT_CREATED', template_ids: ['foundation-credit-issued'], purpose: 'MARKETING', requires_consent: 'MARKETING', enabled: false },
  { event_type: 'BUILD_INTEREST_CAPTURED', template_ids: ['bldr-discovery'], purpose: 'MARKETING', requires_consent: 'MARKETING', enabled: false },
];

export function mappingsForEvent(eventType: ArtifactEventType): LifecycleEventMapping[] {
  return DIGITAL_FOUNDATION_LIFECYCLE_EVENT_MAP.filter((m) => m.event_type === eventType);
}
