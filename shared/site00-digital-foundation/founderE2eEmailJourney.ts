import type { ArtifactEventType } from './types.js';
import { FNDATN01_EMAILS } from '../site00-correspondence-studio/fndatn01/pack.js';
import { FNDATN_TEST_LIFECYCLE_EVENT_MAP } from './communications/fndatnTestEventMap.js';

/** Sole authorized recipient for automated staging E2E email journey (founder directive). */
export const FOUNDER_E2E_AUTHORIZED_TESTER_EMAIL = 'kateenaarmstrong@gmail.com';

export type EmailJourneyRunStatus =
  | 'NOT_STARTED'
  | 'PREFLIGHT'
  | 'RUNNING'
  | 'WAITING_ON_PROVIDER'
  | 'PARTIAL'
  | 'FAILED'
  | 'COMPLETED'
  | 'CANCELLED';

export type AutomatedJourneyStageId =
  | 'PREFLIGHT'
  | 'CREATE_PROJECT'
  | 'INVITATION'
  | 'INTAKE_COMPLETE'
  | 'QUOTE_READY'
  | 'QUOTE_ACCEPTANCE'
  | 'PAYMENT_VERIFIED'
  | 'FOUNDATION_COMPLETE';

export type AutomatedJourneyStageDef = {
  id: AutomatedJourneyStageId;
  label: string;
  /** Lifecycle event that may enqueue email for this stage. */
  email_event: ArtifactEventType | null;
  template_id: string | null;
};

/** Canonical automated run order — only FNDATN-enabled lifecycle sends. */
export const AUTOMATED_JOURNEY_STAGES: AutomatedJourneyStageDef[] = [
  { id: 'PREFLIGHT', label: 'Staging preflight', email_event: null, template_id: null },
  { id: 'CREATE_PROJECT', label: 'Synthetic project created', email_event: 'ARTIFACT_CREATED', template_id: 'personal-foundation-invitation' },
  { id: 'INVITATION', label: 'Foundation invitation sent', email_event: 'ARTIFACT_CREATED', template_id: 'personal-foundation-invitation' },
  { id: 'INTAKE_COMPLETE', label: 'Intake submitted', email_event: 'INTAKE_COMPLETED', template_id: 'intake-completed' },
  { id: 'QUOTE_READY', label: 'Recommendation & quote ready', email_event: 'QUOTE_CREATED', template_id: 'quote-ready' },
  { id: 'QUOTE_ACCEPTANCE', label: 'Quote accepted', email_event: null, template_id: null },
  { id: 'PAYMENT_VERIFIED', label: 'Payment confirmed', email_event: 'PAYMENT_CONFIRMED', template_id: 'payment-confirmed' },
  { id: 'FOUNDATION_COMPLETE', label: 'Foundation complete', email_event: 'FOUNDATION_COMPLETED', template_id: 'foundation-complete' },
];

export function fndatnLifecycleTemplateIds(): string[] {
  return FNDATN_TEST_LIFECYCLE_EVENT_MAP.flatMap((m) => m.template_ids);
}

export function allApprovedEmailGalleryTemplates() {
  return FNDATN01_EMAILS.map((e) => ({
    milestone: e.title,
    template_id: e.template_id,
    trigger: e.trigger,
    cta_label: e.cta_label,
    cta_destination: e.cta_destination,
    role: e.role,
    applicable_in_automated_run: fndatnLifecycleTemplateIds().includes(e.template_id),
  }));
}

export function formatE2eRunId(now = new Date()): string {
  const d = now.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = String(now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds()).padStart(
    5,
    '0',
  );
  return `IDNTY-E2E-${d}-${suffix}`;
}
