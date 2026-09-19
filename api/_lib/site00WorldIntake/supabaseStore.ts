/**
 * Supabase persistence for world-class guest client intake.
 */

import { getSupabaseAdmin } from '../supabase.js';
import type {
  GuestIntakeSession,
  IntakeInviteRecord,
  WorldIntelligenceSnapshot,
} from '../../../shared/site00-world-intake/types.js';
import type { WorldIntakeSection } from '../../../shared/site00-world-intake/constants.js';

const INVITES = 'site00_intake_invites';
const SESSIONS = 'site00_guest_intake_sessions';
const SNAPSHOTS = 'site00_world_intelligence_snapshots';
const PROJECTS = 'site00_projects';

export async function worldIntakeTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(INVITES).select('id').limit(1);
  return !error;
}

function mapInviteRow(row: Record<string, unknown>): IntakeInviteRecord {
  return {
    inviteId: String(row.id),
    tokenHash: String(row.token_hash),
    projectId: String(row.project_id ?? ''),
    orgId: (row.org_id as string | null) ?? null,
    projectSlug: String(row.project_slug),
    projectDisplayName: String(row.project_display_name),
    intakeType: 'WORLD_DISCOVERY',
    projectExperienceClass: row.project_experience_class as IntakeInviteRecord['projectExperienceClass'],
    status: row.status as IntakeInviteRecord['status'],
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: String(row.created_at),
    expiresAt: (row.expires_at as string | null) ?? null,
    startedAt: (row.started_at as string | null) ?? null,
    completedAt: (row.completed_at as string | null) ?? null,
    revokedAt: (row.revoked_at as string | null) ?? null,
    lastSavedAt: (row.last_saved_at as string | null) ?? null,
    recipientLabel: String(row.recipient_label),
    recipientEmail: (row.recipient_email as string | null) ?? null,
    allowedSections: (row.allowed_sections as WorldIntakeSection[]) ?? [],
    intelligenceSnapshotVersion: Number(row.intelligence_snapshot_version ?? 1),
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    claimableByEmail: (row.claimable_by_email as string | null) ?? null,
    claimedByUserId: (row.claimed_by_user_id as string | null) ?? null,
    claimedAt: (row.claimed_at as string | null) ?? null,
  };
}

function inviteToRow(invite: IntakeInviteRecord): Record<string, unknown> {
  return {
    id: invite.inviteId,
    token_hash: invite.tokenHash,
    project_id: invite.projectId || null,
    org_id: invite.orgId,
    project_slug: invite.projectSlug,
    project_display_name: invite.projectDisplayName,
    intake_type: invite.intakeType,
    project_experience_class: invite.projectExperienceClass,
    status: invite.status,
    created_by: invite.createdBy,
    expires_at: invite.expiresAt,
    started_at: invite.startedAt,
    completed_at: invite.completedAt,
    revoked_at: invite.revokedAt,
    last_saved_at: invite.lastSavedAt,
    recipient_label: invite.recipientLabel,
    recipient_email: invite.recipientEmail,
    allowed_sections: invite.allowedSections,
    intelligence_snapshot_version: invite.intelligenceSnapshotVersion,
    metadata: invite.metadata,
    claimable_by_email: invite.claimableByEmail,
    claimed_by_user_id: invite.claimedByUserId,
    claimed_at: invite.claimedAt,
  };
}

function mapSessionRow(row: Record<string, unknown>): GuestIntakeSession {
  return {
    sessionId: String(row.id),
    inviteId: String(row.invite_id),
    projectId: String(row.project_id ?? ''),
    startedAt: String(row.started_at),
    lastActivityAt: String(row.last_activity_at),
    currentSection: (row.current_section as GuestIntakeSession['currentSection']) ?? null,
    currentStep: (row.current_step as string | null) ?? null,
    completionPercentage: Number(row.completion_percentage ?? 0),
    completedSections: (row.completed_sections as GuestIntakeSession['completedSections']) ?? [],
    rawAnswers: (row.raw_answers as GuestIntakeSession['rawAnswers']) ?? {},
    draftState: (row.draft_state as Record<string, unknown>) ?? {},
    synthesized: (row.synthesized as GuestIntakeSession['synthesized']) ?? {},
    clientDeviceMetadata: (row.client_device_metadata as Record<string, unknown>) ?? {},
    submittedAt: (row.submitted_at as string | null) ?? null,
    version: Number(row.version ?? 1),
  };
}

function sessionToRow(session: GuestIntakeSession): Record<string, unknown> {
  return {
    id: session.sessionId,
    invite_id: session.inviteId,
    project_id: session.projectId || null,
    started_at: session.startedAt,
    last_activity_at: session.lastActivityAt,
    current_section: session.currentSection,
    current_step: session.currentStep,
    completion_percentage: session.completionPercentage,
    completed_sections: session.completedSections,
    raw_answers: session.rawAnswers,
    draft_state: session.draftState,
    synthesized: session.synthesized,
    client_device_metadata: session.clientDeviceMetadata,
    submitted_at: session.submittedAt,
    version: session.version,
  };
}

function mapSnapshotRow(row: Record<string, unknown>): WorldIntelligenceSnapshot {
  const payload = (row.payload as Record<string, unknown>) ?? {};
  return {
    snapshotId: String(row.snapshot_id),
    projectId: String(row.project_id ?? ''),
    inviteId: String(row.invite_id ?? ''),
    sessionId: String(row.session_id ?? ''),
    profileVersions: (row.profile_versions as Record<string, unknown>) ?? {},
    businessIntelligenceVersion: Number(row.business_intelligence_version ?? 1),
    brandLoreFingerprint: (row.brand_lore_fingerprint as string | null) ?? null,
    personalityFingerprint: (row.personality_fingerprint as string | null) ?? null,
    creativeAppetiteVersion: (row.creative_appetite_version as string | null) ?? null,
    worldReadinessVersion: Number(row.world_readiness_version ?? 1),
    offeringMapVersion: Number(row.offering_map_version ?? 1),
    readiness: payload.readiness as WorldIntelligenceSnapshot['readiness'],
    worldFormationInput: payload.worldFormationInput as WorldIntelligenceSnapshot['worldFormationInput'],
    sourceInviteId: String(row.invite_id ?? ''),
    createdAt: String(row.created_at),
  };
}

function snapshotToRow(snapshot: WorldIntelligenceSnapshot): Record<string, unknown> {
  return {
    snapshot_id: snapshot.snapshotId,
    project_id: snapshot.projectId || null,
    invite_id: snapshot.inviteId,
    session_id: snapshot.sessionId,
    profile_versions: snapshot.profileVersions,
    business_intelligence_version: snapshot.businessIntelligenceVersion,
    brand_lore_fingerprint: snapshot.brandLoreFingerprint,
    personality_fingerprint: snapshot.personalityFingerprint,
    creative_appetite_version: snapshot.creativeAppetiteVersion,
    world_readiness_version: snapshot.worldReadinessVersion,
    offering_map_version: snapshot.offeringMapVersion,
    readiness_state: snapshot.readiness.state,
    payload: {
      readiness: snapshot.readiness,
      worldFormationInput: snapshot.worldFormationInput,
    },
  };
}

export async function saveProjectStub(project: {
  projectId: string;
  slug: string;
  name: string;
}): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from(PROJECTS)
    .upsert(
      {
        id: project.projectId,
        slug: project.slug,
        name: project.name,
        current_phase: 'DISCOVERY',
        metadata: { source: 'WORLD_GUEST_INTAKE', guestOwned: true },
      },
      { onConflict: 'id' },
    );
  if (error) throw new Error(error.message);
}

export async function saveInvite(invite: IntakeInviteRecord): Promise<IntakeInviteRecord> {
  const { data, error } = await getSupabaseAdmin()
    .from(INVITES)
    .upsert(inviteToRow(invite), { onConflict: 'id' })
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to save invite');
  return mapInviteRow(data);
}

export async function getInviteById(inviteId: string): Promise<IntakeInviteRecord | null> {
  const { data, error } = await getSupabaseAdmin().from(INVITES).select('*').eq('id', inviteId).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapInviteRow(data) : null;
}

export async function getInviteByTokenHash(tokenHash: string): Promise<IntakeInviteRecord | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(INVITES)
    .select('*')
    .eq('token_hash', tokenHash)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapInviteRow(data) : null;
}

export async function listInvites(): Promise<IntakeInviteRecord[]> {
  const { data, error } = await getSupabaseAdmin().from(INVITES).select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapInviteRow);
}

export async function saveSession(session: GuestIntakeSession): Promise<GuestIntakeSession> {
  const { data, error } = await getSupabaseAdmin()
    .from(SESSIONS)
    .upsert(sessionToRow(session), { onConflict: 'id' })
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to save session');
  return mapSessionRow(data);
}

export async function getSessionByInviteId(inviteId: string): Promise<GuestIntakeSession | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(SESSIONS)
    .select('*')
    .eq('invite_id', inviteId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapSessionRow(data) : null;
}

export async function saveSnapshot(snapshot: WorldIntelligenceSnapshot): Promise<WorldIntelligenceSnapshot> {
  const { error } = await getSupabaseAdmin().from(SNAPSHOTS).upsert(snapshotToRow(snapshot), { onConflict: 'snapshot_id' });
  if (error) throw new Error(error.message);
  return snapshot;
}

export async function getSnapshotByInviteId(inviteId: string): Promise<WorldIntelligenceSnapshot | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(SNAPSHOTS)
    .select('*')
    .eq('invite_id', inviteId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapSnapshotRow(data) : null;
}
