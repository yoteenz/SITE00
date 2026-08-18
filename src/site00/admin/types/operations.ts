export type AdminPeriod = '7d' | '30d' | '90d' | 'all';

export type AdminIdentity = {
  id: string;
  user_id?: string | null;
  email: string;
  display_name?: string | null;
  idnty_state?: string | null;
  account_status: string;
  onboarding_status: string;
  is_client: boolean;
  is_lead: boolean;
  metadata?: Record<string, unknown>;
  last_active_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminBldrIntake = {
  id: string;
  identity_id?: string | null;
  email?: string | null;
  build_class: string;
  primary_type?: string | null;
  audience?: string | null;
  status: string;
  budget_range?: string | null;
  timeline?: string | null;
  answers?: Record<string, unknown>;
  recommendation?: string | null;
  project_id?: string | null;
  submitted_at?: string | null;
  created_at: string;
  updated_at: string;
  site00_identities?: { id: string; display_name?: string | null; email: string } | null;
  site00_projects?: { id: string; name: string; slug: string } | null;
};

export type AdminLead = {
  id: string;
  identity_id?: string | null;
  bldr_intake_id?: string | null;
  contact_name: string;
  email: string;
  source: string;
  idnty_state?: string | null;
  build_class?: string | null;
  budget_range?: string | null;
  status: string;
  owner_email?: string | null;
  estimated_value?: number | null;
  last_contact_at?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AdminSite = {
  id: string;
  project_id?: string | null;
  identity_id?: string | null;
  name: string;
  domain?: string | null;
  status: string;
  health: string;
  owner_email?: string | null;
  last_deploy_at?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  site00_projects?: { id: string; name: string; slug: string } | null;
  site00_identities?: { id: string; display_name?: string | null; email: string } | null;
};

export type AdminInvoice = {
  id: string;
  project_id?: string | null;
  identity_id?: string | null;
  invoice_number: string;
  client_name: string;
  client_email?: string | null;
  amount: number;
  tax_amount?: number | null;
  status: string;
  due_date?: string | null;
  paid_at?: string | null;
  line_items?: Array<{ label: string; amount: number }>;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  site00_projects?: { id: string; name: string; slug: string } | null;
  site00_identities?: { id: string; display_name?: string | null; email: string } | null;
};

export type AdminActivityItem = {
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

export type AdminProjectRow = {
  id: string;
  name: string;
  slug: string;
  client_email?: string | null;
  current_phase: string;
  project_health: string;
  production_readiness_pct?: number | null;
  environment_readiness_pct?: number | null;
  updated_at: string;
};

export type AdminDashboardKpis = {
  identities: { total: number; newInPeriod: number };
  intakes: { total: number; newInPeriod: number; pendingReview: number };
  leads: { total: number; newInPeriod: number };
  projects: { total: number; active: number };
  sites: { total: number; live: number; issues: number };
  revenue: { paid: number; outstanding: number; overdue: number };
};

export type AdminDashboardSignal = {
  id: string;
  type: string;
  title: string;
  description?: string;
  href?: string;
  priority?: string;
};

export type AdminDashboardPayload = {
  period: AdminPeriod;
  kpis: AdminDashboardKpis;
  ecosystem: {
    nodes: Array<{ id: string; label: string; count: number; href: string }>;
    edges: Array<{ from: string; to: string }>;
  };
  activity: AdminActivityItem[];
  signals: AdminDashboardSignal[];
  pipeline: {
    identities: number;
    intakes: number;
    projects: number;
    sites: number;
    live: number;
  };
  topProjects: AdminProjectRow[];
};

export type AdminSearchResultItem = {
  id: string;
  type: string;
  label: string;
  subtitle?: string;
  href: string;
};

export type AdminSearchResults = {
  query: string;
  results: AdminSearchResultItem[];
  total: number;
};
