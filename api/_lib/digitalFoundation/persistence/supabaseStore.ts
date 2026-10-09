import { createHash, timingSafeEqual } from 'node:crypto';
import { getSupabaseAdmin } from '../../supabase.js';
import type { DfMemoryState } from '../memoryStore.js';
import { getDfMemoryState, memGetArtifactByToken, resetDigitalFoundationMemoryStore } from '../memoryStore.js';
import type { DigitalFoundationArtifact } from '../../../../shared/site00-digital-foundation/types.js';

export function isSupabaseDfPersistenceEnabled(): boolean {
  if (process.env.VITEST === 'true' || process.env.NODE_ENV === 'test') {
    return process.env.SITE00_DF_PERSISTENCE_TEST === '1';
  }
  return process.env.SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE === '1';
}

export function hashPublicToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function tokensEqual(stored: string, provided: string): boolean {
  try {
    const a = Buffer.from(stored, 'utf8');
    const b = Buffer.from(provided, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function serializeOpsBundle(artifactId: string): Record<string, unknown> {
  const s = getDfMemoryState();
  return {
    acceptances: s.acceptances.get(artifactId) ?? null,
    stages: s.stages.get(artifactId) ?? [],
    clientActions: s.clientActions.get(artifactId) ?? [],
    approvals: s.approvals.get(artifactId) ?? [],
    ownership: s.ownership.get(artifactId) ?? null,
    buildReadiness: s.buildReadiness.get(artifactId) ?? null,
    credits: [...s.credits.values()].filter((c) => c.artifact_id === artifactId),
    checkoutSessions: [...s.checkoutSessions.entries()].filter(([, v]) => v.artifact_id === artifactId),
    runbooks: s.runbooks.get(artifactId) ?? null,
    runbookHistory: s.runbookHistory.get(artifactId) ?? [],
    tasks: s.tasks.get(artifactId) ?? [],
    verificationRules: s.verificationRules.get(artifactId) ?? [],
    verificationResults: s.verificationResults.get(artifactId) ?? [],
    verificationOverrides: s.verificationOverrides.get(artifactId) ?? [],
    forecasts: s.forecasts.get(artifactId) ?? null,
    projectConfig: s.projectConfig.get(artifactId) ?? null,
    readinessClock: s.readinessClock.get(artifactId) ?? null,
  };
}

function hydrateOpsBundle(artifactId: string, bundle: Record<string, unknown>): void {
  const s = getDfMemoryState();
  if (bundle.acceptances) s.acceptances.set(artifactId, bundle.acceptances as never);
  if (bundle.stages) s.stages.set(artifactId, bundle.stages as never);
  if (bundle.clientActions) s.clientActions.set(artifactId, bundle.clientActions as never);
  if (bundle.approvals) s.approvals.set(artifactId, bundle.approvals as never);
  if (bundle.ownership) s.ownership.set(artifactId, bundle.ownership as never);
  if (bundle.buildReadiness) s.buildReadiness.set(artifactId, bundle.buildReadiness as never);
  if (Array.isArray(bundle.credits)) {
    for (const c of bundle.credits as { credit_id: string }[]) {
      s.credits.set(c.credit_id, c as never);
    }
  }
  if (Array.isArray(bundle.checkoutSessions)) {
    for (const row of bundle.checkoutSessions as [string, { artifact_id: string; quote_id: string; session_id: string }][]) {
      s.checkoutSessions.set(row[0], row[1]);
    }
  }
  if (bundle.runbooks) s.runbooks.set(artifactId, bundle.runbooks as never);
  if (bundle.runbookHistory) s.runbookHistory.set(artifactId, bundle.runbookHistory as never);
  if (bundle.tasks) s.tasks.set(artifactId, bundle.tasks as never);
  if (bundle.verificationRules) s.verificationRules.set(artifactId, bundle.verificationRules as never);
  if (bundle.verificationResults) s.verificationResults.set(artifactId, bundle.verificationResults as never);
  if (bundle.verificationOverrides) s.verificationOverrides.set(artifactId, bundle.verificationOverrides as never);
  if (bundle.forecasts) s.forecasts.set(artifactId, bundle.forecasts as never);
  if (bundle.projectConfig) s.projectConfig.set(artifactId, bundle.projectConfig as never);
  if (bundle.readinessClock) s.readinessClock.set(artifactId, bundle.readinessClock as never);
}

/** Load all artifact rows (and leads) from Supabase into the in-process memory index for admin list. */
export async function syncAllArtifactsIntoMemory(): Promise<void> {
  if (!isSupabaseDfPersistenceEnabled()) return;

  const sb = getSupabaseAdmin();
  const { data: rows, error } = await sb
    .from('site00_df_artifacts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  if (!rows?.length) return;

  const s = getDfMemoryState();
  for (const row of rows) {
    const artifact = mapArtifactRow(row);
    s.artifacts.set(artifact.artifact_id, artifact);
    s.artifactsByToken.set(artifact.public_token, artifact.artifact_id);
  }

  const leadIds = [...new Set(rows.map((r) => String(r.lead_id)))];
  const { data: leads, error: leadErr } = await sb.from('site00_df_leads').select('*').in('lead_id', leadIds);
  if (leadErr) throw leadErr;
  for (const lead of leads ?? []) {
    s.leads.set(String(lead.lead_id), mapLeadRow(lead));
  }
}

export async function loadArtifactGraphByToken(token: string): Promise<DigitalFoundationArtifact | null> {
  if (!isSupabaseDfPersistenceEnabled()) {
    let found = memGetArtifactByToken(token);
    if (!found) {
      const { memRefreshPreviewSnapshotFromDisk } = await import('../memoryStore.js');
      memRefreshPreviewSnapshotFromDisk();
      found = memGetArtifactByToken(token);
    }
    return found ?? null;
  }

  const existing = memGetArtifactByToken(token);
  if (existing) return existing;

  const sb = getSupabaseAdmin();
  const { data: row, error } = await sb
    .from('site00_df_artifacts')
    .select('*')
    .eq('public_token', token)
    .maybeSingle();
  if (error) throw error;
  if (!row) return null;

  const artifact = mapArtifactRow(row);
  const s = getDfMemoryState();
  s.artifacts.set(artifact.artifact_id, artifact);
  s.artifactsByToken.set(artifact.public_token, artifact.artifact_id);

  const { data: lead } = await sb.from('site00_df_leads').select('*').eq('lead_id', artifact.lead_id).maybeSingle();
  if (lead) s.leads.set(artifact.lead_id, mapLeadRow(lead));

  const { data: quotes } = await sb.from('site00_df_quotes').select('*').eq('artifact_id', artifact.artifact_id);
  for (const q of quotes ?? []) {
    s.quotes.set(q.quote_id, mapQuoteRow(q));
  }

  const { data: bundle } = await sb
    .from('site00_df_operations_bundle')
    .select('bundle')
    .eq('artifact_id', artifact.artifact_id)
    .maybeSingle();
  if (bundle?.bundle) hydrateOpsBundle(artifact.artifact_id, bundle.bundle as Record<string, unknown>);

  return artifact;
}

export async function persistArtifactGraph(artifactId: string): Promise<void> {
  if (!isSupabaseDfPersistenceEnabled()) return;
  const s = getDfMemoryState();
  const artifact = s.artifacts.get(artifactId);
  if (!artifact) return;
  const lead = s.leads.get(artifact.lead_id);
  const sb = getSupabaseAdmin();

  if (lead) {
    await sb.from('site00_df_leads').upsert(mapLeadToRow(lead));
  }
  await sb.from('site00_df_artifacts').upsert(mapArtifactToRow(artifact));

  const quotes = [...s.quotes.values()].filter((q) => q.artifact_id === artifactId);
  if (quotes.length) {
    await sb.from('site00_df_quotes').upsert(quotes.map(mapQuoteToRow));
  }

  const acceptance = s.acceptances.get(artifactId);
  if (acceptance) {
    await sb.from('site00_df_quote_acceptances').upsert({
      artifact_id: acceptance.artifact_id,
      quote_version: acceptance.quote_version,
      terms_version: acceptance.terms_version,
      accepted_at: acceptance.accepted_at,
      accepted_disclosures: acceptance.accepted_disclosures,
      source_surface: acceptance.source_surface,
      client_ip: acceptance.client_ip,
      user_agent: acceptance.user_agent,
    });
  }

  await sb.from('site00_df_operations_bundle').upsert({
    artifact_id: artifactId,
    bundle: serializeOpsBundle(artifactId),
    updated_at: new Date().toISOString(),
  });
}

function mapArtifactRow(row: Record<string, unknown>): DigitalFoundationArtifact {
  return {
    artifact_id: String(row.artifact_id),
    public_token: String(row.public_token),
    lead_id: String(row.lead_id),
    client_org_id: (row.client_org_id as string | null) ?? null,
    contact_id: (row.contact_id as string | null) ?? null,
    referral_source_id: (row.referral_source_id as string | null) ?? null,
    service_id: 'IDNTY.DIGITAL_FOUNDATION',
    state: row.state as DigitalFoundationArtifact['state'],
    intake_state: row.intake_state as DigitalFoundationArtifact['intake_state'],
    quote_id: (row.quote_id as string | null) ?? null,
    payment_state: row.payment_state as DigitalFoundationArtifact['payment_state'],
    project_state: row.project_state as DigitalFoundationArtifact['project_state'],
    completion_state: row.completion_state as DigitalFoundationArtifact['completion_state'],
    build_interest: row.build_interest as DigitalFoundationArtifact['build_interest'],
    build_recommendation: row.build_recommendation as DigitalFoundationArtifact['build_recommendation'],
    foundation_credit_id: (row.foundation_credit_id as string | null) ?? null,
    intake: (row.intake as DigitalFoundationArtifact['intake']) ?? { needs: [] },
    created_at: String(row.created_at),
    opened_at: (row.opened_at as string | null) ?? null,
    last_activity_at: String(row.last_activity_at),
    completed_at: (row.completed_at as string | null) ?? null,
  };
}

function mapLeadRow(row: Record<string, unknown>) {
  return {
    lead_id: String(row.lead_id),
    contact_email: (row.contact_email as string | null) ?? null,
    contact_name: (row.contact_name as string | null) ?? null,
    business_name: (row.business_name as string | null) ?? null,
    referral_source_id: (row.referral_source_id as string | null) ?? null,
    referral_funnel_stage: row.referral_funnel_stage as never,
    created_at: String(row.created_at),
  };
}

function mapQuoteRow(row: Record<string, unknown>) {
  return {
    quote_id: String(row.quote_id),
    artifact_id: String(row.artifact_id),
    base_service_version: String(row.base_service_version),
    base_price_minor: Number(row.base_price_minor),
    selected_addons: row.selected_addons as never,
    addon_total_minor: Number(row.addon_total_minor),
    manual_adjustments_minor: Number(row.manual_adjustments_minor),
    subtotal_minor: Number(row.subtotal_minor),
    currency: String(row.currency),
    projected_min_days: Number(row.projected_min_days),
    projected_max_days: Number(row.projected_max_days),
    timeline_custom_review: Boolean(row.timeline_custom_review),
    third_party_cost_notice: String(row.third_party_cost_notice),
    quote_version: Number(row.quote_version),
    status: row.status as never,
    founder_commercial_ready: Boolean(row.founder_commercial_ready),
    founder_commercial_ready_at: (row.founder_commercial_ready_at as string | null) ?? null,
    created_at: String(row.created_at),
    expires_at: String(row.expires_at),
  };
}

function mapArtifactToRow(a: DigitalFoundationArtifact) {
  return {
    artifact_id: a.artifact_id,
    public_token: a.public_token,
    lead_id: a.lead_id,
    client_org_id: a.client_org_id,
    contact_id: a.contact_id,
    referral_source_id: a.referral_source_id,
    service_id: a.service_id,
    state: a.state,
    intake_state: a.intake_state,
    quote_id: a.quote_id,
    payment_state: a.payment_state,
    project_state: a.project_state,
    completion_state: a.completion_state,
    build_interest: a.build_interest,
    build_recommendation: a.build_recommendation,
    foundation_credit_id: a.foundation_credit_id,
    intake: a.intake,
    created_at: a.created_at,
    opened_at: a.opened_at,
    last_activity_at: a.last_activity_at,
    completed_at: a.completed_at,
  };
}

function mapLeadToRow(l: ReturnType<typeof mapLeadRow>) {
  return l;
}

function mapQuoteToRow(q: ReturnType<typeof mapQuoteRow>) {
  return {
    ...q,
    founder_commercial_ready: q.founder_commercial_ready ?? false,
    founder_commercial_ready_at: q.founder_commercial_ready_at ?? null,
  };
}

/** Test helper: wipe memory then reload one artifact from Supabase. */
export async function reloadArtifactFromSupabaseForTest(token: string): Promise<DigitalFoundationArtifact | null> {
  resetDigitalFoundationMemoryStore();
  return loadArtifactGraphByToken(token);
}

export type { DfMemoryState };
