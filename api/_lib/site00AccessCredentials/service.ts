import { getSupabaseAdmin } from '../supabase.js';
import { logAdminActivity } from '../site00Production/adminOperations.js';
import {
  normalizeAccessCredentialCode,
  resolvePublicCredentialView,
  type Site00AccessCredentialAdminRow,
  type Site00AccessCredentialEventType,
  type Site00AccessCredentialPublicView,
  type Site00AccessCredentialStatus,
  type Site00AccessCredentialType,
} from './types.js';

const PUBLIC_CREDENTIAL_COLUMNS =
  'credential_code, credential_type, status, recipient_name';

type CredentialRow = Site00AccessCredentialAdminRow;

function nowIso(): string {
  return new Date().toISOString();
}

async function insertCredentialEvent(
  credentialId: string,
  eventType: Site00AccessCredentialEventType,
  opts?: { sessionId?: string; userId?: string; metadata?: Record<string, unknown> },
): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from('site00_access_credential_events').insert({
    credential_id: credentialId,
    event_type: eventType,
    session_id: opts?.sessionId ?? null,
    user_id: opts?.userId ?? null,
    metadata: opts?.metadata ?? {},
  });
}

export async function resolveAccessCredentialPublic(
  rawCode: string,
): Promise<Site00AccessCredentialPublicView> {
  const code = normalizeAccessCredentialCode(rawCode);
  if (!code) {
    return resolvePublicCredentialView(null);
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site00_access_credentials')
    .select(PUBLIC_CREDENTIAL_COLUMNS)
    .eq('credential_code', code)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return resolvePublicCredentialView(data);
}

export async function recordAccessCredentialScan(
  rawCode: string,
  sessionId: string,
): Promise<{ ok: boolean; view: Site00AccessCredentialPublicView }> {
  const code = normalizeAccessCredentialCode(rawCode);
  if (!code) {
    return { ok: false, view: resolvePublicCredentialView(null) };
  }

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase
    .from('site00_access_credentials')
    .select('id, credential_code, credential_type, status, recipient_name, scan_count, first_scanned_at')
    .eq('credential_code', code)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) {
    return { ok: false, view: resolvePublicCredentialView(null) };
  }

  const view = resolvePublicCredentialView(row);
  if (view.resolved === 'not_found') {
    return { ok: false, view };
  }

  const ts = nowIso();
  const isFirstScan = !row.first_scanned_at;

  await supabase
    .from('site00_access_credentials')
    .update({
      first_scanned_at: isFirstScan ? ts : row.first_scanned_at,
      last_scanned_at: ts,
      scan_count: (row.scan_count ?? 0) + 1,
      updated_at: ts,
    })
    .eq('id', row.id);

  await insertCredentialEvent(row.id, 'SCANNED', {
    sessionId,
    metadata: { firstScan: isFirstScan },
  });

  return { ok: true, view };
}

export async function recordAccessCredentialEnter(
  rawCode: string,
  sessionId: string,
): Promise<{ ok: boolean; view: Site00AccessCredentialPublicView }> {
  const code = normalizeAccessCredentialCode(rawCode);
  if (!code) {
    return { ok: false, view: resolvePublicCredentialView(null) };
  }

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase
    .from('site00_access_credentials')
    .select(PUBLIC_CREDENTIAL_COLUMNS + ', id')
    .eq('credential_code', code)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) {
    return { ok: false, view: resolvePublicCredentialView(null) };
  }

  const view = resolvePublicCredentialView(row);
  if (view.resolved !== 'valid') {
    return { ok: false, view };
  }

  await insertCredentialEvent(row.id, 'ENTERED_SITE', { sessionId });
  return { ok: true, view };
}

export async function associateAccessCredentialWithUser(
  rawCode: string,
  userId: string,
  sessionId?: string,
): Promise<{ ok: boolean; reason?: string }> {
  const code = normalizeAccessCredentialCode(rawCode);
  if (!code) return { ok: false, reason: 'INVALID_CODE' };

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase
    .from('site00_access_credentials')
    .select('id, assigned_user_id, status')
    .eq('credential_code', code)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) return { ok: false, reason: 'NOT_FOUND' };
  if (row.status !== 'ACTIVE') return { ok: false, reason: 'NOT_ACTIVE' };
  if (row.assigned_user_id && row.assigned_user_id !== userId) {
    return { ok: false, reason: 'ALREADY_ASSIGNED' };
  }
  if (row.assigned_user_id === userId) return { ok: true };

  const ts = nowIso();
  await supabase
    .from('site00_access_credentials')
    .update({ assigned_user_id: userId, updated_at: ts })
    .eq('id', row.id);

  await insertCredentialEvent(row.id, 'ACCOUNT_ASSOCIATED', {
    sessionId,
    userId,
  });

  return { ok: true };
}

export async function listAccessCredentials(): Promise<CredentialRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site00_access_credentials')
    .select('*')
    .order('serial_number', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as CredentialRow[];
}

export async function getAccessCredentialById(id: string): Promise<CredentialRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site00_access_credentials')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as CredentialRow | null) ?? null;
}

export async function getAccessCredentialByCode(code: string): Promise<CredentialRow | null> {
  const normalized = normalizeAccessCredentialCode(code);
  if (!normalized) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site00_access_credentials')
    .select('*')
    .eq('credential_code', normalized)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as CredentialRow | null) ?? null;
}

export async function createAccessCredential(input: {
  credentialType?: Site00AccessCredentialType;
  recipientName?: string;
  recipientEmail?: string;
  recipientCompany?: string;
  notes?: string;
  createdBy?: string;
  activate?: boolean;
}): Promise<CredentialRow> {
  const supabase = getSupabaseAdmin();

  const { data: codeResult, error: codeError } = await supabase.rpc(
    'site00_allocate_access_credential_code',
  );
  if (codeError) throw new Error(codeError.message);

  const credentialCode = String(codeResult);
  const serialNumber = parseInt(credentialCode.split('-')[1] ?? '0', 10);
  const ts = nowIso();
  const status: Site00AccessCredentialStatus = input.activate ? 'ACTIVE' : 'INACTIVE';

  const { data, error } = await supabase
    .from('site00_access_credentials')
    .insert({
      credential_code: credentialCode,
      serial_number: serialNumber,
      credential_type: input.credentialType ?? 'FOUNDER_ACCESS',
      status,
      issued_at: ts,
      activated_at: input.activate ? ts : null,
      recipient_name: input.recipientName?.trim() || null,
      recipient_email: input.recipientEmail?.trim() || null,
      recipient_company: input.recipientCompany?.trim() || null,
      notes: input.notes?.trim() || null,
      created_by: input.createdBy ?? null,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  const row = data as CredentialRow;
  await insertCredentialEvent(row.id, 'CREATED', { metadata: { createdBy: input.createdBy } });
  if (input.activate) {
    await insertCredentialEvent(row.id, 'ACTIVATED');
  }

  await logAdminActivity('credential.created', 'access_credential', `CREATED ${credentialCode.toUpperCase()}`, {
    entityId: row.id,
    entityLabel: credentialCode.toUpperCase(),
    actorEmail: input.createdBy,
  });

  return row;
}

export async function setAccessCredentialStatus(
  id: string,
  status: Site00AccessCredentialStatus,
  actorEmail?: string,
): Promise<CredentialRow> {
  const supabase = getSupabaseAdmin();
  const ts = nowIso();
  const patch: Record<string, unknown> = { status, updated_at: ts };
  if (status === 'ACTIVE') patch.activated_at = ts;

  const { data, error } = await supabase
    .from('site00_access_credentials')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  const row = data as CredentialRow;

  if (status === 'ACTIVE') {
    await insertCredentialEvent(row.id, 'ACTIVATED');
    await logAdminActivity('credential.activated', 'access_credential', `ACTIVATED ${row.credential_code.toUpperCase()}`, {
      entityId: row.id,
      entityLabel: row.credential_code.toUpperCase(),
      actorEmail,
    });
  } else if (status === 'REVOKED') {
    await insertCredentialEvent(row.id, 'REVOKED');
    await logAdminActivity('credential.revoked', 'access_credential', `REVOKED ${row.credential_code.toUpperCase()}`, {
      entityId: row.id,
      entityLabel: row.credential_code.toUpperCase(),
      actorEmail,
    });
  }

  return row;
}

export async function getAccessCredentialEvents(credentialId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site00_access_credential_events')
    .select('*')
    .eq('credential_id', credentialId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return data ?? [];
}
