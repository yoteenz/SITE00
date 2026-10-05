/** Supabase-backed intake store. Identity and Builder keep separate tables (different domain
 * answers) but share this module's normalized read/write shape (IntakeRecord). */
import { getSupabaseAdmin } from '../supabase.js';
import type { IntakeType } from '../../../shared/site00-intakes/types.js';
import { intakeReferencePrefix } from '../../../shared/site00-intakes/types.js';
import type {
  AccessTokenRecord,
  AdminIntakeFilters,
  CreateAccessTokenInput,
  CreateIntakeEventInput,
  CreateIntakeInput,
  IntakeEventRecord,
  IntakeRecord,
  IntakeUpdate,
} from './types.js';

function tableFor(intakeType: IntakeType): 'site00_idnty_submissions' | 'site00_bldr_intakes' {
  return intakeType === 'IDENTITY' ? 'site00_idnty_submissions' : 'site00_bldr_intakes';
}

function domainColumnFor(intakeType: IntakeType): 'identity_state' | 'build_class' {
  return intakeType === 'IDENTITY' ? 'identity_state' : 'build_class';
}

function mapRow(intakeType: IntakeType, row: Record<string, unknown>): IntakeRecord {
  return {
    id: String(row.id),
    intakeType,
    identityId: (row.identity_id as string | null) ?? null,
    userId: (row.user_id as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    verifiedEmailAt: (row.verified_email_at as string | null) ?? null,
    status: String(row.status),
    domainLabel: String(row[domainColumnFor(intakeType)] ?? ''),
    draftPayload: (row.answers as Record<string, unknown>) ?? {},
    submittedPayload: (row.submitted_payload as Record<string, unknown> | null) ?? null,
    currentStep: (row.current_step as string | null) ?? null,
    totalSteps: (row.total_steps as number | null) ?? null,
    source: (row.source as string) ?? 'WEB',
    sourceRoute: (row.source_route as string | null) ?? null,
    projectId: (row.project_id as string | null) ?? null,
    publicReference: String(row.public_reference),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    lastSavedAt: (row.last_saved_at as string | null) ?? null,
    submittedAt: (row.submitted_at as string | null) ?? null,
    claimedAt: (row.claimed_at as string | null) ?? null,
    claimedByUserId: (row.claimed_by_user_id as string | null) ?? null,
    version: Number(row.version ?? 1),
    schemaVersion: Number(row.schema_version ?? 1),
  };
}

function generatePublicReference(intakeType: IntakeType): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${intakeReferencePrefix(intakeType)}-${random}${Date.now().toString(36).slice(-2).toUpperCase()}`;
}

export async function createIntake(input: CreateIntakeInput): Promise<IntakeRecord> {
  const table = tableFor(input.intakeType);
  const domainColumn = domainColumnFor(input.intakeType);
  const insert: Record<string, unknown> = {
    email: input.email ?? null,
    user_id: input.userId ?? null,
    status: 'DRAFT',
    [domainColumn]: input.domainLabel,
    answers: input.draftPayload ?? {},
    current_step: input.currentStep ?? null,
    total_steps: input.totalSteps ?? null,
    source: input.source ?? 'WEB',
    source_route: input.sourceRoute ?? null,
    public_reference: generatePublicReference(input.intakeType),
  };
  if (input.intakeType === 'BUILDER') {
    // build_class is NOT NULL on the underlying table.
    insert.build_class = input.domainLabel;
  }
  const { data, error } = await getSupabaseAdmin().from(table).insert(insert).select('*').single();
  if (error || !data) throw error ?? new Error('FAILED TO CREATE INTAKE');
  return mapRow(input.intakeType, data);
}

export async function getIntakeById(intakeType: IntakeType, id: string): Promise<IntakeRecord | null> {
  const { data, error } = await getSupabaseAdmin().from(tableFor(intakeType)).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(intakeType, data) : null;
}

async function listByUserForTable(intakeType: IntakeType, userId: string): Promise<IntakeRecord[]> {
  const { data, error } = await getSupabaseAdmin()
    .from(tableFor(intakeType))
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapRow(intakeType, row));
}

export async function listIntakesByUserId(userId: string): Promise<IntakeRecord[]> {
  const [identity, builder] = await Promise.all([
    listByUserForTable('IDENTITY', userId),
    listByUserForTable('BUILDER', userId),
  ]);
  return [...identity, ...builder].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function listUnclaimedByEmailForTable(intakeType: IntakeType, email: string): Promise<IntakeRecord[]> {
  const { data, error } = await getSupabaseAdmin()
    .from(tableFor(intakeType))
    .select('*')
    .is('user_id', null)
    .ilike('email', email.trim())
    .not('status', 'in', '("DRAFT","ARCHIVED")');
  if (error) throw error;
  return (data ?? []).map((row) => mapRow(intakeType, row));
}

export async function listUnclaimedIntakesByEmail(email: string): Promise<IntakeRecord[]> {
  const [identity, builder] = await Promise.all([
    listUnclaimedByEmailForTable('IDENTITY', email),
    listUnclaimedByEmailForTable('BUILDER', email),
  ]);
  return [...identity, ...builder];
}

function toColumnPatch(intakeType: IntakeType, patch: IntakeUpdate): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (patch.userId !== undefined) out.user_id = patch.userId;
  if (patch.email !== undefined) out.email = patch.email;
  if (patch.verifiedEmailAt !== undefined) out.verified_email_at = patch.verifiedEmailAt;
  if (patch.status !== undefined) out.status = patch.status;
  if (patch.domainLabel !== undefined) out[domainColumnFor(intakeType)] = patch.domainLabel;
  if (patch.draftPayload !== undefined) out.answers = patch.draftPayload;
  if (patch.submittedPayload !== undefined) out.submitted_payload = patch.submittedPayload;
  if (patch.currentStep !== undefined) out.current_step = patch.currentStep;
  if (patch.totalSteps !== undefined) out.total_steps = patch.totalSteps;
  if (patch.projectId !== undefined) out.project_id = patch.projectId;
  if (patch.lastSavedAt !== undefined) out.last_saved_at = patch.lastSavedAt;
  if (patch.submittedAt !== undefined) out.submitted_at = patch.submittedAt;
  if (patch.claimedAt !== undefined) out.claimed_at = patch.claimedAt;
  if (patch.claimedByUserId !== undefined) out.claimed_by_user_id = patch.claimedByUserId;
  if (patch.version !== undefined) out.version = patch.version;
  out.updated_at = new Date().toISOString();
  return out;
}

export async function updateIntake(intakeType: IntakeType, id: string, patch: IntakeUpdate): Promise<IntakeRecord> {
  const { data, error } = await getSupabaseAdmin()
    .from(tableFor(intakeType))
    .update(toColumnPatch(intakeType, patch))
    .eq('id', id)
    .select('*')
    .single();
  if (error || !data) throw error ?? new Error('INTAKE NOT FOUND');
  return mapRow(intakeType, data);
}

async function listForAdminTable(intakeType: IntakeType, filters: AdminIntakeFilters): Promise<IntakeRecord[]> {
  let q = getSupabaseAdmin().from(tableFor(intakeType)).select('*');
  if (filters.status) q = q.eq('status', filters.status);
  if (filters.ownerKind === 'GUEST') q = q.is('user_id', null);
  if (filters.ownerKind === 'AUTHENTICATED') q = q.not('user_id', 'is', null);
  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    q = q.or(`email.ilike.${term},public_reference.ilike.${term}`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((row) => mapRow(intakeType, row));
}

export async function listIntakesForAdmin(filters: AdminIntakeFilters): Promise<IntakeRecord[]> {
  const types: IntakeType[] = filters.intakeType ? [filters.intakeType] : ['IDENTITY', 'BUILDER'];
  const lists = await Promise.all(types.map((t) => listForAdminTable(t, filters)));
  let rows = lists.flat();
  const sort = filters.sort ?? 'newest';
  rows = rows.sort((a, b) => {
    if (sort === 'oldest') return a.createdAt.localeCompare(b.createdAt);
    if (sort === 'recently_updated') return b.updatedAt.localeCompare(a.updatedAt);
    if (sort === 'recently_submitted') return (b.submittedAt ?? '').localeCompare(a.submittedAt ?? '');
    return b.createdAt.localeCompare(a.createdAt);
  });
  return filters.limit ? rows.slice(0, filters.limit) : rows;
}

function mapToken(row: Record<string, unknown>): AccessTokenRecord {
  return {
    id: String(row.id),
    intakeType: row.intake_type as IntakeType,
    intakeId: String(row.intake_id),
    tokenHash: String(row.token_hash),
    purpose: row.purpose as AccessTokenRecord['purpose'],
    guestEmail: (row.guest_email as string | null) ?? null,
    issuedAt: String(row.issued_at),
    expiresAt: String(row.expires_at),
    lastUsedAt: (row.last_used_at as string | null) ?? null,
    usedCount: Number(row.used_count ?? 0),
    revokedAt: (row.revoked_at as string | null) ?? null,
    replacedByTokenId: (row.replaced_by_token_id as string | null) ?? null,
  };
}

export async function createAccessToken(input: CreateAccessTokenInput): Promise<AccessTokenRecord> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_intake_access_tokens')
    .insert({
      intake_type: input.intakeType,
      intake_id: input.intakeId,
      token_hash: input.tokenHash,
      purpose: input.purpose,
      guest_email: input.guestEmail,
      expires_at: input.expiresAt,
    })
    .select('*')
    .single();
  if (error || !data) throw error ?? new Error('FAILED TO CREATE ACCESS TOKEN');
  return mapToken(data);
}

export async function getAccessTokenByHash(tokenHash: string): Promise<AccessTokenRecord | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_intake_access_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .maybeSingle();
  if (error) throw error;
  return data ? mapToken(data) : null;
}

export async function listActiveTokensForIntake(
  intakeType: IntakeType,
  intakeId: string,
  purpose: AccessTokenRecord['purpose'],
): Promise<AccessTokenRecord[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_intake_access_tokens')
    .select('*')
    .eq('intake_type', intakeType)
    .eq('intake_id', intakeId)
    .eq('purpose', purpose)
    .is('revoked_at', null);
  if (error) throw error;
  return (data ?? []).map(mapToken);
}

export async function updateAccessToken(id: string, patch: Partial<AccessTokenRecord>): Promise<AccessTokenRecord> {
  const columnPatch: Record<string, unknown> = {};
  if (patch.lastUsedAt !== undefined) columnPatch.last_used_at = patch.lastUsedAt;
  if (patch.usedCount !== undefined) columnPatch.used_count = patch.usedCount;
  if (patch.revokedAt !== undefined) columnPatch.revoked_at = patch.revokedAt;
  if (patch.replacedByTokenId !== undefined) columnPatch.replaced_by_token_id = patch.replacedByTokenId;
  const { data, error } = await getSupabaseAdmin()
    .from('site00_intake_access_tokens')
    .update(columnPatch)
    .eq('id', id)
    .select('*')
    .single();
  if (error || !data) throw error ?? new Error('TOKEN NOT FOUND');
  return mapToken(data);
}

function mapEvent(row: Record<string, unknown>): IntakeEventRecord {
  return {
    id: String(row.id),
    intakeType: row.intake_type as IntakeType,
    intakeId: String(row.intake_id),
    eventType: String(row.event_type),
    actor: (row.actor as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: String(row.created_at),
  };
}

export async function createIntakeEvent(input: CreateIntakeEventInput): Promise<IntakeEventRecord> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_intake_events')
    .insert({
      intake_type: input.intakeType,
      intake_id: input.intakeId,
      event_type: input.eventType,
      actor: input.actor,
      metadata: input.metadata ?? {},
    })
    .select('*')
    .single();
  if (error || !data) throw error ?? new Error('FAILED TO CREATE INTAKE EVENT');
  return mapEvent(data);
}

export async function listEventsForIntake(intakeType: IntakeType, intakeId: string): Promise<IntakeEventRecord[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_intake_events')
    .select('*')
    .eq('intake_type', intakeType)
    .eq('intake_id', intakeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapEvent);
}

export async function intakeTablesExist(): Promise<boolean> {
  try {
    const { error: e1 } = await getSupabaseAdmin().from('site00_idnty_submissions').select('id').limit(1);
    const { error: e2 } = await getSupabaseAdmin().from('site00_bldr_intakes').select('id').limit(1);
    const { error: e3 } = await getSupabaseAdmin().from('site00_intake_access_tokens').select('id').limit(1);
    const { error: e4 } = await getSupabaseAdmin().from('site00_intake_events').select('id').limit(1);
    return !e1 && !e2 && !e3 && !e4;
  } catch {
    return false;
  }
}
