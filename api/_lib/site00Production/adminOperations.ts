import { getSupabaseAdmin } from '../supabase.js';
import { ensureDemoProjectSeeded } from './seedDemo.js';

type AdminPeriod = '7d' | '30d' | '90d' | 'all';

type AdminActivityItem = {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id?: string | null;
  entity_label?: string | null;
  actor_email?: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
  created_at: string;
};

type AdminDashboardPayload = {
  period: AdminPeriod;
  kpis: {
    identities: { total: number; newInPeriod: number };
    intakes: { total: number; newInPeriod: number; pendingReview: number };
    leads: { total: number; newInPeriod: number };
    projects: { total: number; active: number };
    sites: { total: number; live: number; issues: number };
    revenue: { paid: number; outstanding: number; overdue: number };
  };
  ecosystem: {
    nodes: Array<{ id: string; label: string; count: number; href: string }>;
    edges: Array<{ from: string; to: string }>;
  };
  activity: AdminActivityItem[];
  signals: Array<{
    id: string;
    type: string;
    title: string;
    description?: string;
    href?: string;
    priority?: string;
  }>;
  pipeline: {
    identities: number;
    intakes: number;
    projects: number;
    sites: number;
    live: number;
  };
  topProjects: Array<{
    id: string;
    name: string;
    slug: string;
    client_email?: string | null;
    current_phase: string;
    project_health: string;
    production_readiness_pct?: number | null;
    environment_readiness_pct?: number | null;
    updated_at: string;
  }>;
};

type AdminSearchResults = {
  query: string;
  results: Array<{
    id: string;
    type: string;
    label: string;
    subtitle?: string;
    href: string;
  }>;
  total: number;
};

const DEMO_CLIENT_EMAIL = 'client@northquarter.example';

function parsePeriod(raw?: string): AdminPeriod {
  if (raw === '7d' || raw === '30d' || raw === '90d' || raw === 'all') return raw;
  return '30d';
}

function periodStart(period: AdminPeriod): Date | null {
  if (period === 'all') return null;
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days);
  return start;
}

function isAfterPeriod(iso: string | null | undefined, start: Date | null): boolean {
  if (!start || !iso) return false;
  return new Date(iso).getTime() >= start.getTime();
}

async function logAdminActivity(
  eventType: string,
  entityType: string,
  summary: string,
  opts?: {
    entityId?: string;
    entityLabel?: string;
    actorEmail?: string;
    metadata?: Record<string, unknown>;
  },
) {
  const supabase = getSupabaseAdmin();
  await supabase.from('site00_admin_activity').insert({
    event_type: eventType,
    entity_type: entityType,
    entity_id: opts?.entityId ?? null,
    entity_label: opts?.entityLabel ?? null,
    actor_email: opts?.actorEmail ?? null,
    summary: summary.toUpperCase(),
    metadata: opts?.metadata ?? {},
  });
}

export async function ensureAdminOpsSeeded(): Promise<{ seeded: boolean }> {
  const supabase = getSupabaseAdmin();
  const { projectId } = await ensureDemoProjectSeeded();

  const { count } = await supabase.from('site00_identities').select('*', { count: 'exact', head: true });
  if ((count ?? 0) > 0) return { seeded: false };

  const { data: identity, error: identityErr } = await supabase
    .from('site00_identities')
    .insert({
      email: DEMO_CLIENT_EMAIL,
      display_name: 'NORTHQUARTER',
      idnty_state: 'SOME PIECES EXIST',
      account_status: 'ACTIVE',
      onboarding_status: 'COMPLETE',
      is_client: true,
      is_lead: false,
      last_active_at: new Date().toISOString(),
      metadata: { source: 'DEMO_SEED' },
    })
    .select('id')
    .single();
  if (identityErr || !identity) throw identityErr ?? new Error('FAILED TO SEED IDENTITY');

  const identityId = identity.id;

  await supabase.from('site00_idnty_submissions').insert({
    identity_id: identityId,
    email: DEMO_CLIENT_EMAIL,
    identity_state: 'SOME PIECES EXIST',
    status: 'COMPLETE',
    answers: {
      brand_maturity: 'PARTIAL',
      existing_assets: ['LOGO MARK', 'PRODUCT PHOTOGRAPHY'],
      missing_assets: ['TYPOGRAPHY SYSTEM', 'HOMEPAGE DIRECTION'],
    },
    completed_at: new Date().toISOString(),
  });

  const { data: intake, error: intakeErr } = await supabase
    .from('site00_bldr_intakes')
    .insert({
      identity_id: identityId,
      email: DEMO_CLIENT_EMAIL,
      build_class: 'SITE',
      primary_type: 'ECOMMERCE',
      audience: 'PREMIUM SKINCARE BUYERS',
      status: 'SUBMITTED',
      budget_range: '$4K+–$10K',
      timeline: 'Q4 LAUNCH',
      answers: {
        goals: ['INCREASE CONVERSION', 'BUILD BRAND CREDIBILITY'],
        required_features: ['COLLECTION PAGES', 'CHECKOUT', 'MEMBER AREA'],
      },
      recommendation: 'SITE ECOMMERCE REBUILD',
      recommendation_reasons: ['STRONG PRODUCT PHOTOGRAPHY', 'CLEAR CONVERSION GOALS'],
      project_id: projectId,
      submitted_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  if (intakeErr || !intake) throw intakeErr ?? new Error('FAILED TO SEED BLDR INTAKE');

  const { data: lead, error: leadErr } = await supabase
    .from('site00_leads')
    .insert({
      identity_id: identityId,
      bldr_intake_id: intake.id,
      contact_name: 'NORTHQUARTER TEAM',
      email: DEMO_CLIENT_EMAIL,
      source: 'BLDR',
      idnty_state: 'SOME PIECES EXIST',
      build_class: 'SITE',
      budget_range: '$4K+–$10K',
      status: 'QUALIFIED',
      owner_email: 'admin@frontalslayer.com',
      estimated_value: 7500,
      last_contact_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  if (leadErr || !lead) throw leadErr ?? new Error('FAILED TO SEED LEAD');

  const scheduledAt = new Date();
  scheduledAt.setDate(scheduledAt.getDate() + 3);
  scheduledAt.setHours(14, 0, 0, 0);

  await supabase.from('site00_discovery_bookings').insert({
    lead_id: lead.id,
    identity_id: identityId,
    contact_name: 'NORTHQUARTER TEAM',
    email: DEMO_CLIENT_EMAIL,
    build_class: 'SITE',
    scheduled_at: scheduledAt.toISOString(),
    duration_minutes: 45,
    status: 'UPCOMING',
    owner_email: 'admin@frontalslayer.com',
    notes: 'REVIEW ECOMMERCE REBUILD SCOPE AND TIMELINE.',
    project_id: projectId,
  });

  await supabase.from('site00_sites').insert({
    project_id: projectId,
    identity_id: identityId,
    name: 'NORTHQUARTER REBUILD',
    domain: 'northquarter.example',
    status: 'BUILD',
    health: 'OK',
    owner_email: DEMO_CLIENT_EMAIL,
    last_deploy_at: new Date().toISOString(),
    metadata: { environment: 'PREVIEW' },
  });

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  await supabase.from('site00_invoices').insert({
    project_id: projectId,
    identity_id: identityId,
    invoice_number: 'INV-NQ-001',
    client_name: 'NORTHQUARTER',
    client_email: DEMO_CLIENT_EMAIL,
    amount: 4500,
    tax_amount: 0,
    status: 'PAID',
    due_date: dueDate.toISOString().slice(0, 10),
    paid_at: new Date().toISOString(),
    line_items: [
      { label: 'DESIGN DIRECTION DEPOSIT', amount: 2500 },
      { label: 'STRATEGY SYNTHESIS', amount: 2000 },
    ],
  });

  await supabase.from('site00_invoices').insert({
    project_id: projectId,
    identity_id: identityId,
    invoice_number: 'INV-NQ-002',
    client_name: 'NORTHQUARTER',
    client_email: DEMO_CLIENT_EMAIL,
    amount: 3200,
    tax_amount: 0,
    status: 'SENT',
    due_date: dueDate.toISOString().slice(0, 10),
    line_items: [{ label: 'HOMEPAGE ART DIRECTION — MILESTONE 2', amount: 3200 }],
  });

  await supabase.from('site00_admin_activity').insert([
    {
      event_type: 'identity.created',
      entity_type: 'identity',
      entity_id: identityId,
      entity_label: 'NORTHQUARTER',
      summary: 'DEMO IDENTITY SEEDED FOR NORTHQUARTER.',
    },
    {
      event_type: 'intake.submitted',
      entity_type: 'bldr_intake',
      entity_id: intake.id,
      entity_label: 'SITE — ECOMMERCE',
      summary: 'BLDR INTAKE SUBMITTED FOR NORTHQUARTER REBUILD.',
    },
    {
      event_type: 'lead.qualified',
      entity_type: 'lead',
      entity_id: lead.id,
      entity_label: 'NORTHQUARTER TEAM',
      summary: 'LEAD QUALIFIED FROM BLDR INTAKE.',
    },
    {
      event_type: 'invoice.paid',
      entity_type: 'invoice',
      entity_label: 'INV-NQ-001',
      summary: 'DEPOSIT INVOICE PAID — $4,500.',
    },
  ]);

  return { seeded: true };
}

async function loadPipelineCounts() {
  const supabase = getSupabaseAdmin();
  const [
    { count: identities },
    { count: intakes },
    { count: projects },
    { count: sites },
    { count: live },
  ] = await Promise.all([
    supabase.from('site00_identities').select('*', { count: 'exact', head: true }),
    supabase.from('site00_bldr_intakes').select('*', { count: 'exact', head: true }),
    supabase.from('site00_projects').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    supabase.from('site00_sites').select('*', { count: 'exact', head: true }),
    supabase.from('site00_sites').select('*', { count: 'exact', head: true }).eq('status', 'LIVE'),
  ]);

  return {
    identities: identities ?? 0,
    intakes: intakes ?? 0,
    projects: projects ?? 0,
    sites: sites ?? 0,
    live: live ?? 0,
  };
}

async function loadRevenueSummary() {
  const supabase = getSupabaseAdmin();
  const { data: invoices } = await supabase.from('site00_invoices').select('amount, status, due_date');
  const today = new Date().toISOString().slice(0, 10);

  let paid = 0;
  let outstanding = 0;
  let overdue = 0;

  for (const inv of invoices ?? []) {
    const amount = Number(inv.amount) || 0;
    if (inv.status === 'PAID') {
      paid += amount;
    } else if (['SENT', 'OVERDUE', 'PARTIAL'].includes(String(inv.status))) {
      outstanding += amount;
      if (inv.status === 'OVERDUE' || (inv.due_date && inv.due_date < today)) {
        overdue += amount;
      }
    }
  }

  return { paid, outstanding, overdue };
}

export async function getOperationsDashboard(periodRaw?: string): Promise<AdminDashboardPayload> {
  await ensureAdminOpsSeeded();
  const period = parsePeriod(periodRaw);
  const start = periodStart(period);
  const supabase = getSupabaseAdmin();

  const [
    { data: identities },
    { data: intakes },
    { data: leads },
    { data: projects },
    { data: sites },
    { data: activity },
    { count: pendingReview },
    revenue,
    pipeline,
  ] = await Promise.all([
    supabase.from('site00_identities').select('id, created_at'),
    supabase.from('site00_bldr_intakes').select('id, created_at, status'),
    supabase.from('site00_leads').select('id, created_at'),
    supabase.from('site00_projects').select('*').eq('status', 'ACTIVE').order('updated_at', { ascending: false }).limit(6),
    supabase.from('site00_sites').select('id, status, health, created_at'),
    supabase
      .from('site00_admin_activity')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('site00_bldr_intakes')
      .select('*', { count: 'exact', head: true })
      .in('status', ['SUBMITTED', 'IN_PROGRESS']),
    loadRevenueSummary(),
    loadPipelineCounts(),
  ]);

  const countNew = <T extends { created_at: string }>(rows: T[] | null) =>
    (rows ?? []).filter((r) => isAfterPeriod(r.created_at, start)).length;

  const siteIssues = (sites ?? []).filter((s) => s.health !== 'OK').length;
  const siteLive = (sites ?? []).filter((s) => s.status === 'LIVE').length;

  const kpis = {
    identities: { total: identities?.length ?? 0, newInPeriod: countNew(identities) },
    intakes: {
      total: intakes?.length ?? 0,
      newInPeriod: countNew(intakes),
      pendingReview: pendingReview ?? 0,
    },
    leads: { total: leads?.length ?? 0, newInPeriod: countNew(leads) },
    projects: { total: pipeline.projects, active: pipeline.projects },
    sites: { total: sites?.length ?? 0, live: siteLive, issues: siteIssues },
    revenue,
  };

  const ecosystem = {
    nodes: [
      { id: 'identities', label: 'IDENTITIES', count: pipeline.identities, href: '/admin/site00/identities' },
      { id: 'intakes', label: 'BLDR INTAKES', count: pipeline.intakes, href: '/admin/site00/bldr-intakes' },
      { id: 'projects', label: 'PROJECTS', count: pipeline.projects, href: '/admin/site00/projects' },
      { id: 'sites', label: 'SITES', count: pipeline.sites, href: '/admin/site00/sites' },
      { id: 'live', label: 'LIVE', count: pipeline.live, href: '/admin/site00/sites?filter=live' },
    ],
    edges: [
      { from: 'identities', to: 'intakes' },
      { from: 'intakes', to: 'projects' },
      { from: 'projects', to: 'sites' },
      { from: 'sites', to: 'live' },
    ],
  };

  const signals: AdminDashboardPayload['signals'] = [];

  if ((pendingReview ?? 0) > 0) {
    signals.push({
      id: 'intakes-pending',
      type: 'INTAKE',
      title: `${pendingReview} BLDR INTAKE${pendingReview === 1 ? '' : 'S'} NEED REVIEW`,
      href: '/admin/site00/bldr-intakes',
      priority: 'HIGH',
    });
  }

  const newLeads = (leads ?? []).filter((l) => l.created_at && isAfterPeriod(l.created_at, start)).length;
  if (newLeads > 0) {
    signals.push({
      id: 'new-leads',
      type: 'LEAD',
      title: `${newLeads} NEW LEAD${newLeads === 1 ? '' : 'S'} IN PERIOD`,
      href: '/admin/site00/leads?status=NEW',
      priority: 'MEDIUM',
    });
  }

  if (revenue.overdue > 0) {
    signals.push({
      id: 'overdue-invoices',
      type: 'FINANCE',
      title: `$${Math.round(revenue.overdue).toLocaleString()} OVERDUE`,
      href: '/admin/site00/finance',
      priority: 'HIGH',
    });
  }

  if (siteIssues > 0) {
    signals.push({
      id: 'site-issues',
      type: 'SITE',
      title: `${siteIssues} SITE${siteIssues === 1 ? '' : 'S'} WITH HEALTH ISSUES`,
      href: '/admin/site00/sites?filter=issues',
      priority: 'HIGH',
    });
  }

  const { count: approvalCount } = await supabase
    .from('site00_approval_requests')
    .select('*', { count: 'exact', head: true })
    .in('status', ['AI_DRAFT', 'ADMIN_REVIEW']);

  if ((approvalCount ?? 0) > 0) {
    signals.push({
      id: 'approvals',
      type: 'APPROVAL',
      title: `${approvalCount} PENDING APPROVAL${approvalCount === 1 ? '' : 'S'}`,
      href: '/admin/site00/approvals',
      priority: 'HIGH',
    });
  }

  return {
    period,
    kpis,
    ecosystem,
    activity: (activity ?? []) as AdminActivityItem[],
    signals,
    pipeline,
    topProjects: (projects ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      client_email: p.client_email,
      current_phase: p.current_phase,
      project_health: p.project_health,
      production_readiness_pct: p.production_readiness_pct,
      environment_readiness_pct: p.environment_readiness_pct,
      updated_at: p.updated_at,
    })),
  };
}

export async function getIdentitiesList(params?: { search?: string; limit?: number }) {
  await ensureAdminOpsSeeded();
  const supabase = getSupabaseAdmin();
  const limit = params?.limit ?? 100;
  let q = supabase.from('site00_identities').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(limit);

  const search = params?.search?.trim();
  if (search) {
    const term = `%${search}%`;
    q = q.or(`email.ilike.${term},display_name.ilike.${term}`);
  }

  const { data, count, error } = await q;
  if (error) throw error;
  return { items: data ?? [], total: count ?? 0 };
}

export async function getIdentityDetail(id: string) {
  await ensureAdminOpsSeeded();
  const supabase = getSupabaseAdmin();

  const { data: identity, error } = await supabase.from('site00_identities').select('*').eq('id', id).single();
  if (error || !identity) throw new Error('IDENTITY NOT FOUND');

  const [{ data: intakes }, { data: projects }, { data: sites }, { data: submissions }, { data: notes }] =
    await Promise.all([
      supabase.from('site00_bldr_intakes').select('*').eq('identity_id', id).order('created_at', { ascending: false }),
      supabase.from('site00_projects').select('*').eq('client_email', identity.email).order('updated_at', { ascending: false }),
      supabase.from('site00_sites').select('*').eq('identity_id', id).order('updated_at', { ascending: false }),
      supabase.from('site00_idnty_submissions').select('*').eq('identity_id', id).order('created_at', { ascending: false }),
      supabase.from('site00_admin_notes').select('*').eq('entity_type', 'identity').eq('entity_id', id).order('created_at', { ascending: false }),
    ]);

  return {
    identity,
    intakes: intakes ?? [],
    projects: projects ?? [],
    sites: sites ?? [],
    submissions: submissions ?? [],
    notes: notes ?? [],
  };
}

export async function getBldrIntakesList(params?: { buildClass?: string; status?: string }) {
  await ensureAdminOpsSeeded();
  const supabase = getSupabaseAdmin();
  let q = supabase
    .from('site00_bldr_intakes')
    .select('*, site00_identities(id, display_name, email), site00_projects(id, name, slug)')
    .order('submitted_at', { ascending: false, nullsFirst: false });

  if (params?.buildClass) q = q.eq('build_class', params.buildClass);
  if (params?.status) q = q.eq('status', params.status);

  const { data, error } = await q;
  if (error) throw error;
  return { items: data ?? [], total: data?.length ?? 0 };
}

export async function getBldrIntakeDetail(id: string) {
  await ensureAdminOpsSeeded();
  const supabase = getSupabaseAdmin();

  const { data: intake, error } = await supabase
    .from('site00_bldr_intakes')
    .select('*, site00_identities(id, display_name, email), site00_projects(id, name, slug)')
    .eq('id', id)
    .single();
  if (error || !intake) throw new Error('INTAKE NOT FOUND');

  let idntySubmission = null;
  if (intake.identity_id) {
    const { data } = await supabase
      .from('site00_idnty_submissions')
      .select('*')
      .eq('identity_id', intake.identity_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    idntySubmission = data;
  }

  const { data: notes } = await supabase
    .from('site00_admin_notes')
    .select('*')
    .eq('entity_type', 'bldr_intake')
    .eq('entity_id', id)
    .order('created_at', { ascending: false });

  return { intake, idntySubmission, notes: notes ?? [] };
}

export async function getLeadsList(params?: { status?: string }) {
  await ensureAdminOpsSeeded();
  const supabase = getSupabaseAdmin();
  let q = supabase.from('site00_leads').select('*').order('created_at', { ascending: false });
  if (params?.status) q = q.eq('status', params.status);
  const { data, error } = await q;
  if (error) throw error;
  return { items: data ?? [], total: data?.length ?? 0 };
}

export async function getLeadDetail(id: string) {
  await ensureAdminOpsSeeded();
  const supabase = getSupabaseAdmin();

  const { data: lead, error } = await supabase.from('site00_leads').select('*').eq('id', id).single();
  if (error || !lead) throw new Error('LEAD NOT FOUND');

  const [{ data: intake }, { data: identity }, { data: discovery }, { data: notes }] = await Promise.all([
    lead.bldr_intake_id
      ? supabase.from('site00_bldr_intakes').select('*').eq('id', lead.bldr_intake_id).maybeSingle()
      : Promise.resolve({ data: null }),
    lead.identity_id
      ? supabase.from('site00_identities').select('*').eq('id', lead.identity_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('site00_discovery_bookings').select('*').eq('lead_id', id).order('scheduled_at', { ascending: false }),
    supabase
      .from('site00_admin_notes')
      .select('*')
      .eq('entity_type', 'lead')
      .eq('entity_id', id)
      .order('created_at', { ascending: false }),
  ]);

  return { lead, intake, identity, discovery: discovery ?? [], notes: notes ?? [] };
}

export async function getDiscoveryList(status = 'UPCOMING') {
  await ensureAdminOpsSeeded();
  const supabase = getSupabaseAdmin();
  let q = supabase.from('site00_discovery_bookings').select('*').order('scheduled_at', { ascending: status === 'UPCOMING' });

  if (status === 'UPCOMING') {
    q = q.in('status', ['UPCOMING', 'SCHEDULED']).gte('scheduled_at', new Date().toISOString());
  } else if (status === 'COMPLETED') {
    q = q.in('status', ['COMPLETED', 'DONE']).lte('scheduled_at', new Date().toISOString());
  } else {
    q = q.eq('status', status);
  }

  const { data, error } = await q;
  if (error) throw error;
  return { items: data ?? [], total: data?.length ?? 0 };
}

export async function getDiscoveryDetail(id: string) {
  await ensureAdminOpsSeeded();
  const supabase = getSupabaseAdmin();

  const { data: booking, error } = await supabase.from('site00_discovery_bookings').select('*').eq('id', id).single();
  if (error || !booking) throw new Error('BOOKING NOT FOUND');

  const [{ data: lead }, intakeResult] = await Promise.all([
    booking.lead_id
      ? supabase.from('site00_leads').select('*').eq('id', booking.lead_id).maybeSingle()
      : Promise.resolve({ data: null }),
    booking.lead_id
      ? supabase.from('site00_leads').select('bldr_intake_id').eq('id', booking.lead_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  let intake = null;
  const intakeId = intakeResult.data?.bldr_intake_id;
  if (intakeId) {
    const { data } = await supabase.from('site00_bldr_intakes').select('*').eq('id', intakeId).maybeSingle();
    intake = data;
  }

  return { booking, lead: lead ?? null, intake };
}

export async function getSitesList(params?: { filter?: string }) {
  await ensureAdminOpsSeeded();
  const supabase = getSupabaseAdmin();
  let q = supabase
    .from('site00_sites')
    .select('*, site00_projects(id, name, slug), site00_identities(id, display_name, email)')
    .order('updated_at', { ascending: false });

  if (params?.filter === 'issues') q = q.neq('health', 'OK');
  if (params?.filter === 'live') q = q.eq('status', 'LIVE');

  const { data, error } = await q;
  if (error) throw error;
  return { items: data ?? [], total: data?.length ?? 0 };
}

export async function getSiteDetail(id: string) {
  await ensureAdminOpsSeeded();
  const supabase = getSupabaseAdmin();

  const { data: site, error } = await supabase
    .from('site00_sites')
    .select('*, site00_projects(id, name, slug, client_email), site00_identities(id, display_name, email)')
    .eq('id', id)
    .single();
  if (error || !site) throw new Error('SITE NOT FOUND');

  return { site };
}

export async function getCtrlRoomAdmin() {
  await ensureAdminOpsSeeded();
  const supabase = getSupabaseAdmin();

  const [{ data: blockers }, { data: approvals }, { data: newLeads }, { data: upcomingDiscovery }, { data: overdueInvoices }] =
    await Promise.all([
      supabase
        .from('site00_production_blockers')
        .select('*, site00_projects(id, name, slug)')
        .is('resolved_at', null)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('site00_approval_requests')
        .select('*, site00_projects(id, name, slug)')
        .in('status', ['AI_DRAFT', 'ADMIN_REVIEW'])
        .order('submitted_at', { ascending: false })
        .limit(10),
      supabase.from('site00_leads').select('*').eq('status', 'NEW').order('created_at', { ascending: false }).limit(10),
      supabase
        .from('site00_discovery_bookings')
        .select('*')
        .in('status', ['UPCOMING', 'SCHEDULED'])
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(10),
      supabase
        .from('site00_invoices')
        .select('*')
        .in('status', ['SENT', 'OVERDUE'])
        .order('due_date', { ascending: true })
        .limit(10),
    ]);

  const today = new Date().toISOString().slice(0, 10);
  const overdue = (overdueInvoices ?? []).filter(
    (inv) => inv.status === 'OVERDUE' || (inv.due_date && inv.due_date < today),
  );

  return {
    blockers: blockers ?? [],
    approvals: approvals ?? [],
    newLeads: newLeads ?? [],
    upcomingDiscovery: upcomingDiscovery ?? [],
    overdueInvoices: overdue,
  };
}

export async function getFinanceOverview() {
  await ensureAdminOpsSeeded();
  const supabase = getSupabaseAdmin();
  const summary = await loadRevenueSummary();
  const today = new Date().toISOString().slice(0, 10);

  const { data: invoices, error } = await supabase
    .from('site00_invoices')
    .select('*, site00_projects(id, name, slug), site00_identities(id, display_name, email)')
    .order('created_at', { ascending: false });
  if (error) throw error;

  let upcoming = 0;
  for (const inv of invoices ?? []) {
    if (inv.status === 'SENT' && inv.due_date && inv.due_date >= today) {
      upcoming += Number(inv.amount) || 0;
    }
  }

  return {
    invoices: invoices ?? [],
    summary: { ...summary, upcoming },
  };
}

export async function getInvoiceDetail(id: string) {
  await ensureAdminOpsSeeded();
  const supabase = getSupabaseAdmin();

  const { data: invoice, error } = await supabase
    .from('site00_invoices')
    .select('*, site00_projects(id, name, slug), site00_identities(id, display_name, email)')
    .eq('id', id)
    .single();
  if (error || !invoice) throw new Error('INVOICE NOT FOUND');

  return { invoice };
}

export async function getTeamOverview() {
  await ensureAdminOpsSeeded();
  const supabase = getSupabaseAdmin();

  const adminEmailsRaw = process.env.ADMIN_EMAILS?.trim();
  const adminEmails = adminEmailsRaw
    ? adminEmailsRaw.split(',').map((e) => e.trim()).filter(Boolean)
    : ['admin@frontalslayer.com', 'kateena.armstrong@frontalslayer.com', 'kateenaarmstrong@gmail.com'];

  const { data: projects } = await supabase.from('site00_projects').select('id, client_email').eq('status', 'ACTIVE');

  const members = adminEmails.map((email, index) => {
    const local = email.split('@')[0]?.replace(/\./g, ' ').toUpperCase() ?? 'ADMIN';
    const projectCount =
      index === 0
        ? (projects?.length ?? 0)
        : (projects ?? []).filter((p) => p.client_email === email).length;
    return {
      id: `admin-${index}`,
      email,
      name: local,
      role: index === 0 ? 'LEAD ADMIN' : 'ADMIN',
      projectCount,
      status: 'ACTIVE',
    };
  });

  return {
    members,
    activeProjects: projects?.length ?? 0,
  };
}

export async function getReportsPipeline(periodRaw?: string) {
  await ensureAdminOpsSeeded();
  const period = parsePeriod(periodRaw);
  const start = periodStart(period);
  const pipeline = await loadPipelineCounts();

  const supabase = getSupabaseAdmin();
  const [{ data: identities }, { data: intakes }, { data: projects }, { data: sites }] = await Promise.all([
    supabase.from('site00_identities').select('created_at'),
    supabase.from('site00_bldr_intakes').select('created_at'),
    supabase.from('site00_projects').select('created_at').eq('status', 'ACTIVE'),
    supabase.from('site00_sites').select('created_at, status'),
  ]);

  const movement = {
    identities: (identities ?? []).filter((r) => isAfterPeriod(r.created_at, start)).length,
    intakes: (intakes ?? []).filter((r) => isAfterPeriod(r.created_at, start)).length,
    projects: (projects ?? []).filter((r) => isAfterPeriod(r.created_at, start)).length,
    sites: (sites ?? []).filter((r) => isAfterPeriod(r.created_at, start)).length,
    live: (sites ?? []).filter((r) => r.status === 'LIVE' && isAfterPeriod(r.created_at, start)).length,
  };

  const revenue = await loadRevenueSummary();

  return {
    period,
    pipeline: { ...pipeline, movement },
    kpis: {
      identities: { total: pipeline.identities, newInPeriod: movement.identities },
      intakes: { total: pipeline.intakes, newInPeriod: movement.intakes },
      projects: { total: pipeline.projects, newInPeriod: movement.projects },
      sites: { total: pipeline.sites, newInPeriod: movement.sites },
      revenue,
    },
  };
}

export async function getAdminActivity(limit = 50) {
  await ensureAdminOpsSeeded();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site00_admin_activity')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 200));
  if (error) throw error;
  return { items: data ?? [], total: data?.length ?? 0 };
}

export async function globalAdminSearch(query: string): Promise<AdminSearchResults> {
  await ensureAdminOpsSeeded();
  const q = query.trim();
  if (!q || q.length < 2) return { query: q, results: [], total: 0 };

  const supabase = getSupabaseAdmin();
  const term = `%${q}%`;
  const results: AdminSearchResults['results'] = [];

  const [{ data: identities }, { data: intakes }, { data: leads }, { data: projects }, { data: sites }, { data: invoices }] =
    await Promise.all([
      supabase.from('site00_identities').select('id, email, display_name').or(`email.ilike.${term},display_name.ilike.${term}`).limit(5),
      supabase.from('site00_bldr_intakes').select('id, build_class, primary_type, email').or(`email.ilike.${term},build_class.ilike.${term}`).limit(5),
      supabase.from('site00_leads').select('id, contact_name, email').or(`contact_name.ilike.${term},email.ilike.${term}`).limit(5),
      supabase.from('site00_projects').select('id, name, slug, client_email').or(`name.ilike.${term},slug.ilike.${term},client_email.ilike.${term}`).limit(5),
      supabase.from('site00_sites').select('id, name, domain').or(`name.ilike.${term},domain.ilike.${term}`).limit(5),
      supabase.from('site00_invoices').select('id, invoice_number, client_name').or(`invoice_number.ilike.${term},client_name.ilike.${term}`).limit(5),
    ]);

  for (const row of identities ?? []) {
    results.push({
      id: row.id,
      type: 'IDENTITY',
      label: row.display_name ?? row.email,
      subtitle: row.email,
      href: `/admin/site00/identities/${row.id}`,
    });
  }
  for (const row of intakes ?? []) {
    results.push({
      id: row.id,
      type: 'BLDR INTAKE',
      label: `${row.build_class} — ${row.primary_type ?? 'INTAKE'}`,
      subtitle: row.email ?? undefined,
      href: `/admin/site00/bldr-intakes/${row.id}`,
    });
  }
  for (const row of leads ?? []) {
    results.push({
      id: row.id,
      type: 'LEAD',
      label: row.contact_name,
      subtitle: row.email,
      href: `/admin/site00/leads/${row.id}`,
    });
  }
  for (const row of projects ?? []) {
    results.push({
      id: row.id,
      type: 'PROJECT',
      label: row.name,
      subtitle: row.client_email ?? row.slug,
      href: `/admin/site00/projects/${row.id}`,
    });
  }
  for (const row of sites ?? []) {
    results.push({
      id: row.id,
      type: 'SITE',
      label: row.name,
      subtitle: row.domain ?? undefined,
      href: `/admin/site00/sites/${row.id}`,
    });
  }
  for (const row of invoices ?? []) {
    results.push({
      id: row.id,
      type: 'INVOICE',
      label: row.invoice_number,
      subtitle: row.client_name,
      href: `/admin/site00/finance/invoices/${row.id}`,
    });
  }

  return { query: q, results, total: results.length };
}

export async function addAdminNote(
  entityType: string,
  entityId: string,
  body: string,
  authorEmail: string,
) {
  await ensureAdminOpsSeeded();
  const supabase = getSupabaseAdmin();
  const trimmed = body.trim();
  if (!trimmed) throw new Error('NOTE BODY REQUIRED');

  const { data: note, error } = await supabase
    .from('site00_admin_notes')
    .insert({
      entity_type: entityType,
      entity_id: entityId,
      author_email: authorEmail,
      body: trimmed,
    })
    .select('*')
    .single();
  if (error || !note) throw error ?? new Error('FAILED TO ADD NOTE');

  await logAdminActivity('note.added', entityType, `NOTE ADDED TO ${entityType.toUpperCase()}.`, {
    entityId,
    actorEmail: authorEmail,
    metadata: { noteId: note.id },
  });

  return { note };
}

export async function markIntakeReviewed(intakeId: string, actorEmail?: string) {
  await ensureAdminOpsSeeded();
  const supabase = getSupabaseAdmin();

  const { data: intake, error } = await supabase
    .from('site00_bldr_intakes')
    .update({ status: 'REVIEWED', updated_at: new Date().toISOString() })
    .eq('id', intakeId)
    .select('*')
    .single();
  if (error || !intake) throw new Error('INTAKE NOT FOUND');

  await logAdminActivity('intake.reviewed', 'bldr_intake', `BLDR INTAKE MARKED REVIEWED — ${intake.build_class}.`, {
    entityId: intakeId,
    entityLabel: intake.primary_type ?? intake.build_class,
    actorEmail,
  });

  return { intake };
}

export async function convertIntakeToProject(intakeId: string, actorEmail?: string) {
  await ensureAdminOpsSeeded();
  const supabase = getSupabaseAdmin();

  const { data: intake, error: intakeErr } = await supabase
    .from('site00_bldr_intakes')
    .select('*, site00_identities(id, email, display_name)')
    .eq('id', intakeId)
    .single();
  if (intakeErr || !intake) throw new Error('INTAKE NOT FOUND');

  if (intake.project_id) {
    return { projectId: intake.project_id, created: false, intake };
  }

  const email = intake.email ?? (intake.site00_identities as { email?: string } | null)?.email ?? DEMO_CLIENT_EMAIL;
  const slugBase = (intake.primary_type ?? intake.build_class ?? 'project')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const slug = `${slugBase}-${Date.now().toString(36)}`;

  const { data: recipe } = await supabase
    .from('site00_production_recipes')
    .select('id')
    .eq('recipe_key', 'site_ecommerce')
    .maybeSingle();

  const { data: project, error: projectErr } = await supabase
    .from('site00_projects')
    .insert({
      slug,
      name: `${intake.build_class} — ${intake.primary_type ?? 'NEW PROJECT'}`.toUpperCase(),
      client_email: email,
      build_class: intake.build_class,
      build_type: intake.primary_type ?? 'CUSTOM',
      identity_state: 'FROM INTAKE',
      current_phase: 'DISCOVERY',
      project_health: 'ON_TRACK',
      payment_state: 'PENDING',
      provisioning_state: 'NOT_STARTED',
      production_readiness_pct: 0,
      environment_readiness_pct: 0,
      recipe_id: recipe?.id ?? null,
    })
    .select('id')
    .single();
  if (projectErr || !project) throw projectErr ?? new Error('FAILED TO CREATE PROJECT');

  const projectId = project.id;

  await supabase
    .from('site00_bldr_intakes')
    .update({ project_id: projectId, status: 'CONVERTED', updated_at: new Date().toISOString() })
    .eq('id', intakeId);

  await supabase.from('site00_leads').update({ status: 'CONVERTED' }).eq('bldr_intake_id', intakeId);

  await logAdminActivity('intake.converted', 'bldr_intake', `BLDR INTAKE CONVERTED TO PROJECT.`, {
    entityId: intakeId,
    entityLabel: slug,
    actorEmail,
    metadata: { projectId },
  });

  return { projectId, created: true, intake: { ...intake, project_id: projectId, status: 'CONVERTED' } };
}
