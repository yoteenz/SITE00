-- JURNL connected banking (read-only aggregation) + snapshot compare-and-swap.
--
-- NOT APPLIED to any hosted project. Founder approval is required before this runs on staging or production.
-- Forward-only and additive: no existing table is dropped, no existing row is rewritten. Rollback plan:
--   docs/jurnl/connected-banking/MIGRATION_IMPACT.md (drop the new objects in reverse order; the two added
--   jurnl_user_snapshots columns have defaults and can stay).
--
-- Who writes what:
--   * End users (role authenticated) READ their own banking rows through RLS. They can never insert or update
--     banking rows, so a browser cannot mark an institution CONNECTED or invent a provider transaction.
--   * The JURNL API (service role) writes banking rows through the SECURITY INVOKER functions below.
--   * jurnl_bank_item_secrets (encrypted provider access tokens) has RLS on and NO policy: no end-user role can
--     read it, and anon / authenticated lose every privilege on it.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Snapshot persistence: revision counter, data mode, audit, atomic compare-and-swap.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.jurnl_user_snapshots
  add column if not exists revision bigint not null default 1,
  add column if not exists data_mode text not null default 'PRODUCTION';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'jurnl_user_snapshots_data_mode_chk') then
    alter table public.jurnl_user_snapshots
      add constraint jurnl_user_snapshots_data_mode_chk check (data_mode in ('PRODUCTION', 'PROVIDER_SANDBOX'));
  end if;
end $$;

create table if not exists public.jurnl_snapshot_audit (
  audit_id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  revision bigint not null,
  schema_version integer not null,
  data_mode text not null,
  byte_size integer not null,
  sha256 text not null,
  source text not null,
  created_at timestamptz not null default now()
);

create index if not exists jurnl_snapshot_audit_user_idx on public.jurnl_snapshot_audit (user_id, revision desc);

alter table public.jurnl_snapshot_audit enable row level security;

drop policy if exists jurnl_snapshot_audit_select_own on public.jurnl_snapshot_audit;
create policy jurnl_snapshot_audit_select_own on public.jurnl_snapshot_audit
  for select using (auth.uid() = user_id);

comment on table public.jurnl_snapshot_audit is 'One row per accepted snapshot write (revision, size, hash). Never the snapshot itself.';

-- Audit rows are written only by jurnl_put_snapshot (no end-user insert / update / delete).
revoke insert, update, delete on public.jurnl_snapshot_audit from anon, authenticated;

-- Atomic write: the caller states the revision it last read (0 = "I believe there is no row yet").
-- A stale revision is refused with SQLSTATE JR409, so an older device can never overwrite a newer server record.
-- SECURITY DEFINER so it can append the audit row; every statement is keyed to auth.uid() (the caller), never to a
-- parameter, so it cannot touch another user's data. Direct INSERT / UPDATE on the snapshot table is revoked below:
-- every write goes through this compare-and-swap.
create or replace function public.jurnl_put_snapshot(
  p_snapshot jsonb,
  p_schema_version integer,
  p_data_mode text,
  p_expected_revision bigint,
  p_source text default 'CLIENT'
) returns table (revision bigint, updated_at timestamptz, schema_version integer, data_mode text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.jurnl_user_snapshots;
  v_text text := p_snapshot::text;
  v_next bigint;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;
  if p_data_mode not in ('PRODUCTION', 'PROVIDER_SANDBOX') then
    raise exception 'DATA_MODE_INVALID' using errcode = '22023';
  end if;
  if p_expected_revision is null then
    raise exception 'EXPECTED_REVISION_REQUIRED' using errcode = '22023';
  end if;

  select * into v_row from public.jurnl_user_snapshots s where s.user_id = v_uid for update;

  if not found then
    if p_expected_revision <> 0 then
      raise exception 'SNAPSHOT_CONFLICT' using errcode = 'JR409';
    end if;
    insert into public.jurnl_user_snapshots (user_id, schema_version, snapshot, updated_at, revision, data_mode)
    values (v_uid, p_schema_version, p_snapshot, now(), 1, p_data_mode)
    returning * into v_row;
  else
    if v_row.data_mode <> p_data_mode then
      raise exception 'DATA_MODE_MISMATCH' using errcode = 'JR422';
    end if;
    if v_row.revision <> p_expected_revision then
      raise exception 'SNAPSHOT_CONFLICT' using errcode = 'JR409';
    end if;
    v_next := v_row.revision + 1;
    update public.jurnl_user_snapshots s
       set snapshot = p_snapshot,
           schema_version = p_schema_version,
           updated_at = now(),
           revision = v_next
     where s.user_id = v_uid
    returning * into v_row;
  end if;

  insert into public.jurnl_snapshot_audit (user_id, revision, schema_version, data_mode, byte_size, sha256, source)
  values (v_uid, v_row.revision, v_row.schema_version, v_row.data_mode, octet_length(v_text),
          encode(sha256(convert_to(v_text, 'UTF8')), 'hex'), left(coalesce(p_source, 'CLIENT'), 40));

  return query select v_row.revision, v_row.updated_at, v_row.schema_version, v_row.data_mode;
end;
$$;

revoke all on function public.jurnl_put_snapshot(jsonb, integer, text, bigint, text) from public, anon;
grant execute on function public.jurnl_put_snapshot(jsonb, integer, text, bigint, text) to authenticated;
-- Writes only through the compare-and-swap above (reads and the user's own delete stay as before).
revoke insert, update on public.jurnl_user_snapshots from anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Connected institutions (one row per provider Item).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.jurnl_bank_items (
  item_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('PLAID')),
  provider_env text not null check (provider_env in ('sandbox', 'production')),
  provider_item_id text not null,
  institution_id text,
  institution_name text,
  status text not null default 'ACTIVE' check (status in (
    'ACTIVE', 'SYNCING', 'NEEDS_REAUTH', 'PERMISSION_REVOKED', 'INSTITUTION_UNAVAILABLE', 'SYNC_ERROR', 'DISCONNECTED'
  )),
  products text[] not null default '{}',
  consent_granted_at timestamptz not null default now(),
  consent_expires_at timestamptz,
  sync_cursor text,
  cursor_updated_at timestamptz,
  last_sync_started_at timestamptz,
  last_successful_sync_at timestamptz,
  last_balance_at timestamptz,
  last_webhook_at timestamptz,
  last_error_code text,
  last_error_at timestamptz,
  new_accounts_available boolean not null default false,
  disconnected_at timestamptz,
  provider_revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_env, provider_item_id)
);

create index if not exists jurnl_bank_items_user_idx on public.jurnl_bank_items (user_id, status);

-- Encrypted provider access tokens (AES-256-GCM, key held by the API only). No end-user access at all.
create table if not exists public.jurnl_bank_item_secrets (
  item_id uuid primary key references public.jurnl_bank_items (item_id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  key_version integer not null,
  iv text not null,
  ciphertext text not null,
  auth_tag text not null,
  created_at timestamptz not null default now(),
  rotated_at timestamptz
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Provider accounts and provider transactions (original provider data, never edited by the user).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.jurnl_bank_accounts (
  bank_account_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id uuid not null references public.jurnl_bank_items (item_id) on delete cascade,
  provider_account_id text not null,
  persistent_account_id text,
  name text not null,
  official_name text,
  mask text,
  type text not null,
  subtype text,
  iso_currency_code text,
  unofficial_currency_code text,
  current_balance numeric(18, 2),
  available_balance numeric(18, 2),
  credit_limit numeric(18, 2),
  balance_as_of timestamptz,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'NOT_RETURNED', 'DISCONNECTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (item_id, provider_account_id)
);

create index if not exists jurnl_bank_accounts_user_idx on public.jurnl_bank_accounts (user_id);

create table if not exists public.jurnl_bank_transactions (
  bank_transaction_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id uuid not null references public.jurnl_bank_items (item_id) on delete cascade,
  provider_account_id text not null,
  provider_transaction_id text not null,
  pending boolean not null,
  pending_transaction_id text,
  -- Provider sign convention is kept as delivered (Plaid: positive = money out of the account).
  amount numeric(18, 2) not null,
  iso_currency_code text,
  unofficial_currency_code text,
  date date not null,
  authorized_date date,
  name text,
  merchant_name text,
  merchant_entity_id text,
  counterparty_names text[],
  pfc_primary text,
  pfc_detailed text,
  pfc_confidence text,
  payment_channel text,
  transaction_code text,
  provider_state text not null default 'ACTIVE' check (provider_state in ('ACTIVE', 'REMOVED')),
  revision integer not null default 1,
  first_seen_at timestamptz not null default now(),
  last_changed_at timestamptz not null default now(),
  removed_at timestamptz,
  unique (item_id, provider_transaction_id)
);

create index if not exists jurnl_bank_transactions_user_changed_idx on public.jurnl_bank_transactions (user_id, last_changed_at);
create index if not exists jurnl_bank_transactions_pending_ref_idx on public.jurnl_bank_transactions (item_id, pending_transaction_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Sync runs and webhook receipts.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.jurnl_bank_sync_events (
  sync_event_id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id uuid not null references public.jurnl_bank_items (item_id) on delete cascade,
  trigger text not null check (trigger in ('INITIAL', 'WEBHOOK', 'MANUAL', 'RECONNECT', 'SCHEDULED')),
  status text not null default 'RUNNING' check (status in ('RUNNING', 'SUCCEEDED', 'FAILED', 'SUPERSEDED')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  cursor_before text,
  cursor_after text,
  pages integer not null default 0,
  added_count integer not null default 0,
  modified_count integer not null default 0,
  removed_count integer not null default 0,
  error_code text
);

create index if not exists jurnl_bank_sync_events_item_idx on public.jurnl_bank_sync_events (item_id, started_at desc);

create table if not exists public.jurnl_bank_webhook_events (
  webhook_event_id bigserial primary key,
  provider text not null,
  provider_env text not null,
  body_sha256 text not null,
  webhook_type text,
  webhook_code text,
  provider_item_id text,
  verified boolean not null,
  status text not null default 'RECEIVED' check (status in ('RECEIVED', 'PROCESSED', 'IGNORED', 'REJECTED', 'FAILED')),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error_code text,
  unique (provider, provider_env, body_sha256)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Row-level security.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.jurnl_bank_items enable row level security;
alter table public.jurnl_bank_item_secrets enable row level security;
alter table public.jurnl_bank_accounts enable row level security;
alter table public.jurnl_bank_transactions enable row level security;
alter table public.jurnl_bank_sync_events enable row level security;
alter table public.jurnl_bank_webhook_events enable row level security;

drop policy if exists jurnl_bank_items_select_own on public.jurnl_bank_items;
create policy jurnl_bank_items_select_own on public.jurnl_bank_items for select using (auth.uid() = user_id);
drop policy if exists jurnl_bank_accounts_select_own on public.jurnl_bank_accounts;
create policy jurnl_bank_accounts_select_own on public.jurnl_bank_accounts for select using (auth.uid() = user_id);
drop policy if exists jurnl_bank_transactions_select_own on public.jurnl_bank_transactions;
create policy jurnl_bank_transactions_select_own on public.jurnl_bank_transactions for select using (auth.uid() = user_id);
drop policy if exists jurnl_bank_sync_events_select_own on public.jurnl_bank_sync_events;
create policy jurnl_bank_sync_events_select_own on public.jurnl_bank_sync_events for select using (auth.uid() = user_id);
-- jurnl_bank_item_secrets and jurnl_bank_webhook_events: intentionally no policy.

revoke all on public.jurnl_bank_item_secrets from anon, authenticated;
revoke all on public.jurnl_bank_webhook_events from anon, authenticated;
revoke insert, update, delete on public.jurnl_bank_items, public.jurnl_bank_accounts, public.jurnl_bank_transactions,
  public.jurnl_bank_sync_events from anon, authenticated;
revoke all on public.jurnl_bank_items, public.jurnl_bank_accounts, public.jurnl_bank_transactions,
  public.jurnl_bank_sync_events from anon;
grant select on public.jurnl_bank_items, public.jurnl_bank_accounts, public.jurnl_bank_transactions,
  public.jurnl_bank_sync_events to authenticated;

-- The token column is never selectable by end users even through a view.
comment on table public.jurnl_bank_item_secrets is 'Encrypted provider access tokens. Service role only. Never returned by any API.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Atomic sync apply: provider pages + cursor advance in ONE transaction.
--    The cursor only moves when every row of the batch persisted. A concurrent sync that read an older cursor is
--    refused (SQLSTATE JR409) instead of applying the same page twice.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.jurnl_bank_apply_sync(
  p_item_id uuid,
  p_cursor_before text,
  p_cursor_after text,
  p_accounts jsonb,
  p_added jsonb,
  p_modified jsonb,
  p_removed jsonb,
  p_sync_event_id bigint
) returns table (added integer, modified integer, removed integer)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_item public.jurnl_bank_items;
  v_added integer := 0;
  v_modified integer := 0;
  v_removed integer := 0;
  t jsonb;
begin
  select * into v_item from public.jurnl_bank_items i where i.item_id = p_item_id for update;
  if not found then
    raise exception 'ITEM_NOT_FOUND' using errcode = 'JR404';
  end if;
  if v_item.status = 'DISCONNECTED' then
    raise exception 'ITEM_DISCONNECTED' using errcode = 'JR410';
  end if;
  if v_item.sync_cursor is distinct from p_cursor_before then
    raise exception 'CURSOR_MOVED' using errcode = 'JR409';
  end if;

  -- Balances (accounts/get or the accounts block of transactions/sync).
  for t in select * from jsonb_array_elements(coalesce(p_accounts, '[]'::jsonb)) loop
    insert into public.jurnl_bank_accounts as a (
      user_id, item_id, provider_account_id, persistent_account_id, name, official_name, mask, type, subtype,
      iso_currency_code, unofficial_currency_code, current_balance, available_balance, credit_limit, balance_as_of, status
    ) values (
      v_item.user_id, p_item_id, t->>'provider_account_id', t->>'persistent_account_id', t->>'name', t->>'official_name',
      t->>'mask', t->>'type', t->>'subtype', t->>'iso_currency_code', t->>'unofficial_currency_code',
      (t->>'current_balance')::numeric, (t->>'available_balance')::numeric, (t->>'credit_limit')::numeric,
      (t->>'balance_as_of')::timestamptz, 'ACTIVE'
    )
    on conflict (item_id, provider_account_id) do update set
      persistent_account_id = coalesce(excluded.persistent_account_id, a.persistent_account_id),
      name = excluded.name,
      official_name = excluded.official_name,
      mask = excluded.mask,
      type = excluded.type,
      subtype = excluded.subtype,
      iso_currency_code = excluded.iso_currency_code,
      unofficial_currency_code = excluded.unofficial_currency_code,
      current_balance = excluded.current_balance,
      available_balance = excluded.available_balance,
      credit_limit = excluded.credit_limit,
      balance_as_of = excluded.balance_as_of,
      status = 'ACTIVE',
      updated_at = now();
  end loop;

  -- ADDED and MODIFIED are both upserts keyed on the provider transaction id (idempotent on replay).
  for t in select * from jsonb_array_elements(coalesce(p_added, '[]'::jsonb) || coalesce(p_modified, '[]'::jsonb)) loop
    insert into public.jurnl_bank_transactions as x (
      user_id, item_id, provider_account_id, provider_transaction_id, pending, pending_transaction_id, amount,
      iso_currency_code, unofficial_currency_code, date, authorized_date, name, merchant_name, merchant_entity_id,
      counterparty_names, pfc_primary, pfc_detailed, pfc_confidence, payment_channel, transaction_code
    ) values (
      v_item.user_id, p_item_id, t->>'provider_account_id', t->>'provider_transaction_id', (t->>'pending')::boolean,
      t->>'pending_transaction_id', (t->>'amount')::numeric, t->>'iso_currency_code', t->>'unofficial_currency_code',
      (t->>'date')::date, (t->>'authorized_date')::date, t->>'name', t->>'merchant_name', t->>'merchant_entity_id',
      case when t ? 'counterparty_names' and jsonb_typeof(t->'counterparty_names') = 'array'
           then array(select jsonb_array_elements_text(t->'counterparty_names')) else null end,
      t->>'pfc_primary', t->>'pfc_detailed', t->>'pfc_confidence', t->>'payment_channel', t->>'transaction_code'
    )
    on conflict (item_id, provider_transaction_id) do update set
      provider_account_id = excluded.provider_account_id,
      pending = excluded.pending,
      pending_transaction_id = excluded.pending_transaction_id,
      amount = excluded.amount,
      iso_currency_code = excluded.iso_currency_code,
      unofficial_currency_code = excluded.unofficial_currency_code,
      date = excluded.date,
      authorized_date = excluded.authorized_date,
      name = excluded.name,
      merchant_name = excluded.merchant_name,
      merchant_entity_id = excluded.merchant_entity_id,
      counterparty_names = excluded.counterparty_names,
      pfc_primary = excluded.pfc_primary,
      pfc_detailed = excluded.pfc_detailed,
      pfc_confidence = excluded.pfc_confidence,
      payment_channel = excluded.payment_channel,
      transaction_code = excluded.transaction_code,
      provider_state = 'ACTIVE',
      removed_at = null,
      revision = x.revision + 1,
      last_changed_at = now()
    where (x.pending, x.amount, x.date, x.name, x.merchant_name, x.pfc_detailed, x.provider_state, x.pending_transaction_id)
      is distinct from (excluded.pending, excluded.amount, excluded.date, excluded.name, excluded.merchant_name,
                        excluded.pfc_detailed, 'ACTIVE', excluded.pending_transaction_id);
  end loop;
  v_added := jsonb_array_length(coalesce(p_added, '[]'::jsonb));
  v_modified := jsonb_array_length(coalesce(p_modified, '[]'::jsonb));

  -- REMOVED is kept as history (provider_state REMOVED), never deleted.
  for t in select * from jsonb_array_elements(coalesce(p_removed, '[]'::jsonb)) loop
    update public.jurnl_bank_transactions x
       set provider_state = 'REMOVED', removed_at = now(), revision = x.revision + 1, last_changed_at = now()
     where x.item_id = p_item_id and x.provider_transaction_id = t->>'provider_transaction_id' and x.provider_state <> 'REMOVED';
    v_removed := v_removed + 1;
  end loop;

  update public.jurnl_bank_items i
     set sync_cursor = p_cursor_after,
         cursor_updated_at = now(),
         last_successful_sync_at = now(),
         last_balance_at = case when jsonb_array_length(coalesce(p_accounts, '[]'::jsonb)) > 0 then now() else i.last_balance_at end,
         status = case when i.status in ('SYNCING', 'SYNC_ERROR', 'INSTITUTION_UNAVAILABLE') then 'ACTIVE' else i.status end,
         last_error_code = null,
         updated_at = now()
   where i.item_id = p_item_id;

  if p_sync_event_id is not null then
    update public.jurnl_bank_sync_events e
       set status = 'SUCCEEDED', finished_at = now(), cursor_after = p_cursor_after,
           added_count = v_added, modified_count = v_modified, removed_count = v_removed
     where e.sync_event_id = p_sync_event_id;
  end if;

  return query select v_added, v_modified, v_removed;
end;
$$;

revoke all on function public.jurnl_bank_apply_sync(uuid, text, text, jsonb, jsonb, jsonb, jsonb, bigint) from public, anon, authenticated;

-- Disconnect: removes the token and marks every imported row, in one transaction. Imported transaction history is
-- kept (the user's ledger references it) unless p_delete_imported is true.
create or replace function public.jurnl_bank_disconnect(p_item_id uuid, p_provider_revoked boolean, p_delete_imported boolean)
returns table (accounts_marked integer, transactions_deleted integer)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_acc integer := 0;
  v_tx integer := 0;
begin
  delete from public.jurnl_bank_item_secrets s where s.item_id = p_item_id;
  update public.jurnl_bank_accounts a set status = 'DISCONNECTED', updated_at = now() where a.item_id = p_item_id;
  get diagnostics v_acc = row_count;
  if p_delete_imported then
    delete from public.jurnl_bank_transactions x where x.item_id = p_item_id;
    get diagnostics v_tx = row_count;
  end if;
  update public.jurnl_bank_items i
     set status = 'DISCONNECTED',
         disconnected_at = now(),
         provider_revoked_at = case when p_provider_revoked then now() else i.provider_revoked_at end,
         sync_cursor = null,
         updated_at = now()
   where i.item_id = p_item_id;
  return query select v_acc, v_tx;
end;
$$;

revoke all on function public.jurnl_bank_disconnect(uuid, boolean, boolean) from public, anon, authenticated;

comment on table public.jurnl_bank_items is 'JURNL connected institutions (read-only aggregation). Status is written by the API only.';
comment on table public.jurnl_bank_transactions is 'Provider transactions exactly as delivered (source truth). User corrections live in the JURNL ledger, never here.';
