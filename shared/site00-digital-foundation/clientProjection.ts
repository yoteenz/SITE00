import type {
  DigitalFoundationArtifactPayload,
  ReferralSourceKind,
} from './types.js';
import type { ProjectReadinessState } from './readinessClock.js';

export type ClientReferralChannel = {
  kind: ReferralSourceKind;
  /** Client-safe channel label (no internal accounting names). */
  display_label: string;
};

export type ClientCommunicationPreferences = {
  marketing_opt_in: boolean;
  project_operations: boolean;
  educational: boolean;
};

export type ClientDigitalFoundationPayload = Omit<
  DigitalFoundationArtifactPayload,
  'events' | 'referral_source'
> & {
  referral_channel: ClientReferralChannel | null;
  timeline_readiness: ProjectReadinessState;
  communication_preferences: ClientCommunicationPreferences;
};

const SAFE_REFERRAL_LABELS: Record<ReferralSourceKind, string> = {
  AIO: 'Partner referral',
  SISTER_REA: 'Partner referral',
  DIRECT: 'Direct',
  CLIENT_REFERRAL: 'Referral',
  SITE00: 'SITE 00',
  CUSTOM: 'Referral',
};

export function toClientReferralChannel(
  referral: DigitalFoundationArtifactPayload['referral_source'],
): ClientReferralChannel | null {
  if (!referral) return null;
  return {
    kind: referral.kind,
    display_label: SAFE_REFERRAL_LABELS[referral.kind] ?? 'Referral',
  };
}

export function toClientArtifactPayload(
  internal: DigitalFoundationArtifactPayload,
  timeline_readiness: ProjectReadinessState,
  communication_preferences: ClientCommunicationPreferences,
): ClientDigitalFoundationPayload {
  const { events: _events, referral_source, ...rest } = internal;
  void _events;
  return {
    ...rest,
    referral_channel: toClientReferralChannel(referral_source),
    timeline_readiness,
    communication_preferences,
  };
}
