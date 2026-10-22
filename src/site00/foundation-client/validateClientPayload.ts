import type { ClientDigitalFoundationPayload } from '../../../shared/site00-digital-foundation/clientProjection.js';
import { DfApiError } from './dfApiError';

/** Reject SPA HTML shells and malformed API JSON before React touches `artifact.artifact_id`. */
export function parseClientDigitalFoundationPayload(raw: unknown): ClientDigitalFoundationPayload {
  if (!raw || typeof raw !== 'object') {
    throw new DfApiError(0, 'INVALID_PAYLOAD');
  }
  const record = raw as Record<string, unknown>;
  if (typeof record.error === 'string' && record.error.trim()) {
    throw new DfApiError(0, record.error.trim());
  }
  const artifact = record.artifact;
  if (!artifact || typeof artifact !== 'object') {
    throw new DfApiError(0, 'INVALID_PAYLOAD');
  }
  const artifactId = (artifact as Record<string, unknown>).artifact_id;
  if (typeof artifactId !== 'string' || !artifactId.trim()) {
    throw new DfApiError(0, 'INVALID_PAYLOAD');
  }
  return raw as ClientDigitalFoundationPayload;
}
