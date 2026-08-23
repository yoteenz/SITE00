/**
 * In-memory store for world guest intake (tests + dev fallback).
 */

import type {
  GuestIntakeSession,
  IntakeInviteRecord,
  WorldIntelligenceSnapshot,
} from '../../../shared/site00-world-intake/types.js';

const invites = new Map<string, IntakeInviteRecord>();
const invitesByHash = new Map<string, IntakeInviteRecord>();
const sessions = new Map<string, GuestIntakeSession>();
const snapshots = new Map<string, WorldIntelligenceSnapshot>();
const projects = new Map<string, { projectId: string; slug: string; name: string }>();

export function resetWorldIntakeMemory(): void {
  invites.clear();
  invitesByHash.clear();
  sessions.clear();
  snapshots.clear();
  projects.clear();
}

export async function saveProjectStub(project: { projectId: string; slug: string; name: string }): Promise<void> {
  projects.set(project.projectId, project);
}

export async function saveInvite(invite: IntakeInviteRecord): Promise<IntakeInviteRecord> {
  invites.set(invite.inviteId, invite);
  invitesByHash.set(invite.tokenHash, invite);
  return invite;
}

export async function getInviteById(inviteId: string): Promise<IntakeInviteRecord | null> {
  return invites.get(inviteId) ?? null;
}

export async function getInviteByTokenHash(tokenHash: string): Promise<IntakeInviteRecord | null> {
  return invitesByHash.get(tokenHash) ?? null;
}

export async function listInvites(): Promise<IntakeInviteRecord[]> {
  return [...invites.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveSession(session: GuestIntakeSession): Promise<GuestIntakeSession> {
  sessions.set(session.sessionId, session);
  return session;
}

export async function getSessionByInviteId(inviteId: string): Promise<GuestIntakeSession | null> {
  return [...sessions.values()].find((s) => s.inviteId === inviteId) ?? null;
}

export async function getSessionById(sessionId: string): Promise<GuestIntakeSession | null> {
  return sessions.get(sessionId) ?? null;
}

export async function saveSnapshot(snapshot: WorldIntelligenceSnapshot): Promise<WorldIntelligenceSnapshot> {
  snapshots.set(snapshot.snapshotId, snapshot);
  return snapshot;
}

export async function getSnapshotByInviteId(inviteId: string): Promise<WorldIntelligenceSnapshot | null> {
  return [...snapshots.values()].find((s) => s.inviteId === inviteId) ?? null;
}
