-- SITE 00 — Invitation system + partner attribution foundation (V1, no live payouts)

create table if not exists public.site00_referral_partners (
  partner_id uuid primary key default gen_random_uuid(),
  partner_number text not null unique,
  display_id text not null,
  legal_name text not null,
  status text not null default 'DRAFT',
  agreement_version text,
  reporting_scope text not null default 'SELF_ONLY',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_invitation_campaigns (
  campaign_id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.site00_referral_partners(partner_id) on delete cascade,
  collection_label text not null,
  channel text not null,
  placement text not null,
  audience text not null,
  primary_service text not null,
  secondary_expansion text not null,
  invitation_type text not null,
  status text not null default 'DRAFT',
  attribution_policy_version text not null,
  commission_rule_version text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_invitation_batches (
  batch_id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.site00_invitation_campaigns(campaign_id) on delete cascade,
  batch_label text not null,
  card_edition text not null,
  print_status text not null default 'NOT_PRINTED',
  distribution_location text,
  optional_inventory_count integer,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_invitation_codes (
  invitation_code_id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.site00_invitation_campaigns(campaign_id) on delete cascade,
  batch_id uuid references public.site00_invitation_batches(batch_id) on delete set null,
  code text not null unique,
  invitation_type text not null,
  status text not null default 'ACTIVE',
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_invitation_visits (
  visit_id uuid primary key default gen_random_uuid(),
  invitation_code_id uuid not null references public.site00_invitation_codes(invitation_code_id) on delete cascade,
  campaign_id uuid not null references public.site00_invitation_campaigns(campaign_id) on delete cascade,
  partner_id uuid not null references public.site00_referral_partners(partner_id) on delete cascade,
  anonymous_visit_key text not null,
  traffic_class text not null,
  user_agent text,
  referrer text,
  dedupe_bucket text not null,
  is_repeat_in_bucket boolean not null default false,
  occurred_at timestamptz not null default now()
);

create index if not exists site00_invitation_visits_dedupe_idx
  on public.site00_invitation_visits (invitation_code_id, anonymous_visit_key);

create table if not exists public.site00_invitation_activations (
  activation_id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references public.site00_invitation_visits(visit_id) on delete cascade,
  invitation_code_id uuid not null references public.site00_invitation_codes(invitation_code_id) on delete cascade,
  campaign_id uuid not null references public.site00_invitation_campaigns(campaign_id) on delete cascade,
  partner_id uuid not null references public.site00_referral_partners(partner_id) on delete cascade,
  status text not null,
  contact_email text,
  verified_client_id uuid,
  foundation_artifact_id uuid,
  foundation_public_token text,
  activation_secret_hash text,
  policy_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  identity_verified_at timestamptz
);

create table if not exists public.site00_client_acquisition_attributions (
  attribution_id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.site00_referral_partners(partner_id) on delete cascade,
  campaign_id uuid not null references public.site00_invitation_campaigns(campaign_id) on delete cascade,
  invitation_code_id uuid not null references public.site00_invitation_codes(invitation_code_id) on delete cascade,
  activation_id uuid not null references public.site00_invitation_activations(activation_id) on delete cascade,
  client_id uuid,
  foundation_artifact_id uuid,
  foundation_project_id uuid,
  bldr_project_id uuid,
  policy_version text not null,
  eligibility text not null,
  disqualification_reason text,
  captured_at timestamptz not null default now()
);

create table if not exists public.site00_referral_business_events (
  event_id uuid primary key default gen_random_uuid(),
  event_type text not null,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  partner_id uuid references public.site00_referral_partners(partner_id) on delete set null,
  campaign_id uuid references public.site00_invitation_campaigns(campaign_id) on delete set null,
  invitation_code_id uuid references public.site00_invitation_codes(invitation_code_id) on delete set null,
  activation_id uuid references public.site00_invitation_activations(activation_id) on delete set null,
  client_id uuid,
  foundation_artifact_id uuid,
  bldr_project_id uuid,
  source_system text not null,
  source_transaction_id text,
  correlation_id text not null,
  policy_version text not null,
  idempotency_key text not null unique,
  payload jsonb not null default '{}'::jsonb
);

create table if not exists public.site00_partner_commission_entries (
  commission_entry_id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.site00_referral_partners(partner_id) on delete cascade,
  referred_client_ref uuid not null,
  product text not null,
  qualifying_order_id uuid,
  qualifying_payment_id text,
  agreement_version text not null,
  commission_rule_version text not null,
  rate_basis_points integer,
  fixed_reward_minor integer,
  currency text not null default 'USD',
  eligible_amount_minor integer not null,
  calculated_reward_minor integer not null,
  status text not null,
  payout_batch_id uuid,
  attribution_id uuid not null references public.site00_client_acquisition_attributions(attribution_id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site00_referral_partners enable row level security;
alter table public.site00_invitation_campaigns enable row level security;
alter table public.site00_invitation_batches enable row level security;
alter table public.site00_invitation_codes enable row level security;
alter table public.site00_invitation_visits enable row level security;
alter table public.site00_invitation_activations enable row level security;
alter table public.site00_client_acquisition_attributions enable row level security;
alter table public.site00_referral_business_events enable row level security;
alter table public.site00_partner_commission_entries enable row level security;
