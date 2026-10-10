import {
  buildSendIdempotencyKey,
  isDfCommunicationFlagEnabled,
  mappingsForEvent,
  DF_COMM_FEATURE_FLAGS,
  type CommunicationSendIntent,
  type CommunicationPurpose,
} from '../../../../shared/site00-digital-foundation/communications/index.js';
import { randomUUID } from 'node:crypto';
import type { ArtifactEventType } from '../../../../shared/site00-digital-foundation/types.js';
import * as mem from '../memoryStore.js';

function nowIso() {
  return new Date().toISOString();
}

function sendAllowed(purpose: CommunicationPurpose): boolean {
  if (purpose === 'MARKETING') {
    return isDfCommunicationFlagEnabled(DF_COMM_FEATURE_FLAGS.SITE00_DF_MARKETING_EMAIL_SEND);
  }
  if (purpose === 'OPERATIONAL') {
    return isDfCommunicationFlagEnabled(DF_COMM_FEATURE_FLAGS.SITE00_DF_OPERATIONAL_REMINDERS);
  }
  return isDfCommunicationFlagEnabled(DF_COMM_FEATURE_FLAGS.SITE00_DF_TRANSACTIONAL_EMAIL_SEND);
}

/**
 * Records send intents for artifact events. Never calls a provider unless the matching send flag is ON;
 * default path is DRY_RUN audit only.
 */
export function enqueueCommunicationsForEvent(input: {
  artifactId: string;
  eventType: ArtifactEventType;
  recipientEmail: string | null;
  payload?: Record<string, unknown>;
}): CommunicationSendIntent[] {
  if (!input.recipientEmail) return [];
  const mappings = mappingsForEvent(input.eventType).filter((m) => m.enabled && m.template_ids.length);
  if (!mappings.length) return [];

  const state = mem.getDfMemoryState();
  const intents: CommunicationSendIntent[] = [];

  for (const mapping of mappings) {
    for (const templateId of mapping.template_ids) {
      const idempotency_key = buildSendIdempotencyKey({
        artifactId: input.artifactId,
        eventType: input.eventType,
        templateId,
        purpose: mapping.purpose,
        milestoneKey: String(input.payload?.request_id ?? input.payload?.quote_version ?? ''),
      });
      const existing = state.sendIntents.get(idempotency_key);
      if (existing) {
        intents.push(existing);
        continue;
      }
      const allowed = sendAllowed(mapping.purpose);
      const intent: CommunicationSendIntent = {
        intent_id: randomUUID(),
        artifact_id: input.artifactId,
        event_type: input.eventType,
        template_id: templateId,
        purpose: mapping.purpose,
        idempotency_key,
        recipient_email: input.recipientEmail,
        status: allowed ? 'QUEUED' : 'DRY_RUN',
        created_at: nowIso(),
        attempts: 0,
        last_error: null,
        provider_message_id: null,
      };
      state.sendIntents.set(idempotency_key, intent);
      intents.push(intent);
    }
  }
  return intents;
}
