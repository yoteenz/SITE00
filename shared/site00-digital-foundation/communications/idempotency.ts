import type { ArtifactEventType } from '../types.js';

/** Stable key so retries and duplicate events do not create duplicate sends. */
export function buildSendIdempotencyKey(input: {
  artifactId: string;
  eventType: ArtifactEventType;
  templateId: string;
  purpose: string;
  milestoneKey?: string;
}): string {
  const parts = [input.artifactId, input.eventType, input.templateId, input.purpose, input.milestoneKey ?? ''].filter(Boolean);
  return parts.join(':');
}
