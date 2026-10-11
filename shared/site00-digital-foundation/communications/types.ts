import type { ArtifactEventType } from '../types.js';

/** Purpose separates transactional, operational, and marketing sends (Family F). */
export type CommunicationPurpose = 'TRANSACTIONAL' | 'OPERATIONAL' | 'MARKETING';

export type CommunicationConsentCategory =
  | 'ESSENTIAL_SERVICE'
  | 'SECURITY'
  | 'PROJECT_OPERATIONS'
  | 'MARKETING'
  | 'EDUCATIONAL';

export type CommunicationConsentRecord = {
  artifact_id: string;
  contact_email: string;
  categories: Partial<Record<CommunicationConsentCategory, boolean>>;
  marketing_opt_in: boolean;
  consent_source: string | null;
  consent_at: string | null;
  notice_version: string | null;
  updated_at: string;
};

export type CommunicationSuppressionReason = 'UNSUBSCRIBE' | 'BOUNCE' | 'COMPLAINT' | 'FOUNDER' | 'POLICY';

export type CommunicationSuppression = {
  email: string;
  reason: CommunicationSuppressionReason;
  created_at: string;
};

export type SendIntentStatus = 'QUEUED' | 'SENT' | 'FAILED' | 'SUPPRESSED' | 'SKIPPED' | 'DRY_RUN';

export type CommunicationSendIntent = {
  intent_id: string;
  artifact_id: string;
  event_type: ArtifactEventType;
  template_id: string;
  purpose: CommunicationPurpose;
  idempotency_key: string;
  recipient_email: string;
  status: SendIntentStatus;
  created_at: string;
  attempts: number;
  last_error: string | null;
  provider_message_id: string | null;
};

export type LifecycleEventMapping = {
  event_type: ArtifactEventType;
  template_ids: string[];
  purpose: CommunicationPurpose;
  requires_consent: CommunicationConsentCategory | null;
  enabled: boolean;
};
