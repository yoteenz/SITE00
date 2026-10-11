import { randomUUID } from 'node:crypto';
import type { ProjectMessage, ProjectMessageAuthorRole } from '../../../shared/site00-digital-foundation/messaging/types.js';
import { isCloudMobilePreviewDev } from '../cloudMobilePreview.js';
import { getDfMemoryState, memGetArtifact } from './memoryStore.js';
import { touchPreviewSnapshotAfterMutation } from './previewMemorySnapshot.js';
import { isSupabaseDfPersistenceEnabled, persistArtifactGraph } from './persistence/supabaseStore.js';

function nowIso(): string {
  return new Date().toISOString();
}

function messagesFor(artifactId: string): ProjectMessage[] {
  const s = getDfMemoryState();
  if (!s.projectMessages) {
    s.projectMessages = new Map();
  }
  if (!s.projectMessages.has(artifactId)) {
    s.projectMessages.set(artifactId, []);
  }
  return s.projectMessages.get(artifactId)!;
}

export function listProjectMessages(artifactId: string): ProjectMessage[] {
  memGetArtifact(artifactId);
  return [...messagesFor(artifactId)].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function sendProjectMessage(input: {
  artifact_id: string;
  author_role: ProjectMessageAuthorRole;
  body: string;
}): ProjectMessage {
  const artifact = memGetArtifact(input.artifact_id);
  if (!artifact) throw new Error('ARTIFACT_NOT_FOUND');
  const text = String(input.body ?? '').trim();
  if (!text) throw new Error('MESSAGE_BODY_REQUIRED');
  if (text.length > 8000) throw new Error('MESSAGE_BODY_TOO_LONG');

  const msg: ProjectMessage = {
    message_id: randomUUID(),
    artifact_id: input.artifact_id,
    author_role: input.author_role,
    body: text,
    created_at: nowIso(),
    delivery_state: 'DELIVERED',
    read_by_client_at: input.author_role === 'CLIENT' ? nowIso() : null,
    read_by_founder_at: input.author_role === 'FOUNDER' ? nowIso() : null,
  };
  messagesFor(input.artifact_id).push(msg);
  afterMessageMutation(input.artifact_id);
  return msg;
}

export function markProjectMessagesRead(input: {
  artifact_id: string;
  reader_role: ProjectMessageAuthorRole;
}): void {
  memGetArtifact(input.artifact_id);
  const stamp = nowIso();
  for (const m of messagesFor(input.artifact_id)) {
    if (input.reader_role === 'CLIENT' && m.author_role === 'FOUNDER' && !m.read_by_client_at) {
      m.read_by_client_at = stamp;
    }
    if (input.reader_role === 'FOUNDER' && m.author_role === 'CLIENT' && !m.read_by_founder_at) {
      m.read_by_founder_at = stamp;
    }
  }
  afterMessageMutation(input.artifact_id);
}

function afterMessageMutation(artifactId: string): void {
  if (isCloudMobilePreviewDev()) {
    touchPreviewSnapshotAfterMutation(getDfMemoryState());
  }
  if (isSupabaseDfPersistenceEnabled()) {
    void persistArtifactGraph(artifactId);
  }
}
