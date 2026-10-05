-- JURNL MONETIZATION — DRAFT DOMAIN SCHEMA (NOT APPLIED)
--
-- Sprint P0.JURNL.MONETIZATION-FOUNDATION1. Kept OUT of supabase/migrations on purpose: JURNL's end-user database is
-- not chosen yet (defect log D-17) and SITE 00's Supabase is the studio's host database. When JURNL's database exists,
-- this becomes a migration there. Non-destructive (create-if-not-exists only), RLS on every table, writes by the trusted
-- backend (service role) only. Mirrors shared/site00-monetization/contract.ts. No financial data in event tables.

create table if not exists jurnl_billing_accounts (
  account_id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('INDIVIDUAL','HOUSEHOLD','FAMILY','BUSINESS')),
  owner_user_id uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists jurnl_billing_account_members (
  account_id uuid not null references jurnl_billing_accounts(account_id),
  user_id uuid not null,
  role text not null default 'MEMBER' check (role in ('OWNER','MEMBER')),
  primary key (account_id, user_id)
);

create table if not exists jurnl_plans (
  plan_id text primary key,                       -- JURNL_FREE / JURNL_PLUS / JURNL_PRO / JURNL_BUSINESS / JURNL_ADD_ON
  plan_class text not null check (plan_class in ('FREE','CONSUMER_PAID','BUSINESS','ADD_ON')),
  audience text not null check (audience in ('CONSUMER','BUSINESS')),
  status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE','RETIRED')),
  base_subscribable boolean not null default true
);

create table if not exists jurnl_plan_capabilities (
  plan_id text not null references jurnl_plans(plan_id),
  capability text not null,
  primary key (plan_id, capability)
);

create table if not exists jurnl_add_ons (
  add_on_id text primary key,
  status text not null default 'DRAFT',
  billing_type text not null default 'TBD' check (billing_type in ('RECURRING','ONE_TIME','USAGE','TBD'))
);

create table if not exists jurnl_add_on_capabilities (
  add_on_id text not null references jurnl_add_ons(add_on_id),
  capability text not null,
  primary key (add_on_id, capability)
);

create table if not exists jurnl_subscriptions (
  account_id uuid primary key references jurnl_billing_accounts(account_id),
  plan_id text not null references jurnl_plans(plan_id),
  state text not null check (state in ('ACTIVE','TRIALING','PAST_DUE','CANCELED','EXPIRED','PAUSED','NONE')),
  start_date timestamptz,
  renewal_date timestamptz,
  cancel_at_period_end boolean not null default false,
  provider text not null default 'NONE',
  provider_ref text,
  updated_at timestamptz not null default now()
);

create table if not exists jurnl_trials (
  account_id uuid not null references jurnl_billing_accounts(account_id),
  trial_plan text not null references jurnl_plans(plan_id),
  start_date timestamptz not null,
  end_date timestamptz not null,
  post_trial_plan text not null references jurnl_plans(plan_id),
  trial_used boolean not null default true,
  primary key (account_id, trial_plan)
);

create table if not exists jurnl_account_add_ons (
  account_id uuid not null references jurnl_billing_accounts(account_id),
  add_on_id text not null references jurnl_add_ons(add_on_id),
  purchase_status text not null check (purchase_status in ('NONE','PENDING','ACTIVE','PAYMENT_ISSUE','CANCELED','EXPIRED')),
  primary key (account_id, add_on_id)
);

-- Server-resolved snapshot (cache). Authoritative only when written by the backend resolver.
create table if not exists jurnl_account_entitlements (
  account_id uuid primary key references jurnl_billing_accounts(account_id),
  effective_plan_id text not null,
  capabilities text[] not null,
  status text not null check (status in ('RESOLVED','FALLBACK')),
  failure text,
  resolved_at timestamptz not null default now()
);

create table if not exists jurnl_usage_limits (
  owner_kind text not null check (owner_kind in ('PLAN','ADD_ON')),
  owner_id text not null,
  capability text not null,
  limit_type text not null check (limit_type in ('REQUESTS','RUNS','EXPORTS','ITEMS')),
  period text not null check (period in ('PER_DAY','PER_MONTH','PER_BILLING_PERIOD','UNLIMITED')),
  tier text not null check (tier in ('LIMITED','HIGHER','UNLIMITED')),
  amount integer,                                  -- null = TBD
  primary key (owner_kind, owner_id, capability)
);

create table if not exists jurnl_usage_counters (
  account_id uuid not null references jurnl_billing_accounts(account_id),
  capability text not null,
  period_start timestamptz not null,
  used integer not null default 0,
  primary key (account_id, capability, period_start)
);

create table if not exists jurnl_affiliate_partners (
  partner_id text primary key,
  partner_type text not null check (partner_type in ('TRAVEL','COMMERCE','FINANCIAL_SERVICE')),
  regulated boolean not null default false,
  status text not null default 'DISABLED' check (status in ('DISABLED','ENABLED'))
);

-- Event log for disclosed affiliate placements. NO financial data (no amounts, balances, transactions, merchants
-- tied to a person's spending). Accounts referenced pseudonymously.
create table if not exists jurnl_affiliate_events (
  event_id uuid primary key default gen_random_uuid(),
  partner_id text not null references jurnl_affiliate_partners(partner_id),
  placement_kind text not null check (placement_kind in ('EDITORIAL_RECOMMENDATION','AFFILIATE_LINK','SPONSORED_PLACEMENT')),
  account_ref text not null,
  event_name text not null check (event_name in ('affiliate_link_opened')),
  disclosed boolean not null,
  created_at timestamptz not null default now()
);

alter table jurnl_billing_accounts enable row level security;
alter table jurnl_billing_account_members enable row level security;
alter table jurnl_plans enable row level security;
alter table jurnl_plan_capabilities enable row level security;
alter table jurnl_add_ons enable row level security;
alter table jurnl_add_on_capabilities enable row level security;
alter table jurnl_subscriptions enable row level security;
alter table jurnl_trials enable row level security;
alter table jurnl_account_add_ons enable row level security;
alter table jurnl_account_entitlements enable row level security;
alter table jurnl_usage_limits enable row level security;
alter table jurnl_usage_counters enable row level security;
alter table jurnl_affiliate_partners enable row level security;
alter table jurnl_affiliate_events enable row level security;
-- Policies (when applied): members may SELECT their own account rows; all writes via the service role only.
