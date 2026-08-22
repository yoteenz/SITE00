-- SITE 00 — EVOLVE Sprint 04: NDXbook pilot readiness + secure credential refs

-- Server-side provider secrets (encrypted blob only — never raw in connection rows)
create table if not exists public.site00_provider_secrets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  provider_key text not null,
  secret_type text not null default 'OAUTH_TOKEN',
  encrypted_payload text not null,
  key_version text not null default 'v1',
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider_key, secret_type)
);

create index if not exists site00_provider_secrets_org_idx
  on public.site00_provider_secrets(organization_id, provider_key);

-- OAuth CSRF/state tokens — single-use, org+provider bound
create table if not exists public.site00_oauth_states (
  id uuid primary key default gen_random_uuid(),
  state_token text not null unique,
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  provider_key text not null,
  connection_id uuid references public.site00_external_connections(id) on delete cascade,
  redirect_uri text,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists site00_oauth_states_expires_idx
  on public.site00_oauth_states(expires_at);

-- Extend external connections for verification + account confirmation
alter table public.site00_external_connections
  add column if not exists verification_status text default 'NOT_VERIFIED',
  add column if not exists account_confirmed_at timestamptz,
  add column if not exists account_confirmed_by text,
  add column if not exists publishing_capability text,
  add column if not exists analytics_capability text,
  add column if not exists token_expires_at timestamptz;

-- Extend pilot config with Sprint 04 controls
alter table public.site00_evolve_pilot_config
  add column if not exists pilot_purpose text,
  add column if not exists initial_publishing_channel text,
  add column if not exists max_publications_pilot int default 1,
  add column if not exists human_approval_required boolean not null default true,
  add column if not exists cross_posting_status text not null default 'DISABLED',
  add column if not exists readiness_state text default 'NOT_STARTED';

-- RLS
do $$
declare t text;
begin
  foreach t in array array['site00_provider_secrets','site00_oauth_states'] loop
    execute format('alter table public.%I enable row level security', t);
    if not exists (select 1 from pg_policies where tablename = t and policyname = 'service_role_all') then
      execute format(
        'create policy service_role_all on public.%I for all to service_role using (true) with check (true)',
        t
      );
    end if;
  end loop;
end $$;

-- NDXbook pilot metadata
update public.site00_evolve_pilot_config
set
  pilot_purpose = 'EVOLVE_DISTRIBUTION_VALIDATION',
  initial_publishing_channel = 'INSTAGRAM',
  max_publications_pilot = 1,
  human_approval_required = true,
  cross_posting_status = 'DISABLED',
  metadata = metadata || '{"automatic_optimization":"DISABLED","automatic_deletion":"DISABLED","paid_promotion":"DISABLED"}'::jsonb
where organization_id = (select id from public.site00_organizations where slug = 'ndxbook');
