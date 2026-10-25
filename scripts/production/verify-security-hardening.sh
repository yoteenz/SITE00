#!/usr/bin/env bash
# D-14 follow-up — verifies 20261026090000_site00_production_graph_rls_and_definer_grants.sql on a throwaway local
# PostgreSQL cluster. Never touches a live project. Creates Supabase-like roles with Supabase's default grants, applies
# the original migrations for the affected objects (with stub parent tables), shows anon can write the two RLS-less
# tables and call the SECURITY DEFINER function, applies the repair twice, and shows anon and authenticated are denied
# while service_role keeps access. Prints one JSON line per check; exits non-zero on any mismatch.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGBIN="${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
[ -x "$PGBIN/initdb" ] || { echo '{"check":"postgres","result":"BLOCKED","detail":"no local PostgreSQL server binaries"}'; exit 2; }

WORK="$(mktemp -d)"
PORT="${PGPORT_VERIFY:-55433}"
cleanup() { su postgres -s /bin/sh -c "'$PGBIN/pg_ctl' -D '$WORK/data' -m immediate stop" >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT
chown postgres "$WORK"
su postgres -s /bin/sh -c "'$PGBIN/initdb' -D '$WORK/data' -A trust -U postgres" >/dev/null
su postgres -s /bin/sh -c "'$PGBIN/pg_ctl' -D '$WORK/data' -o \"-p $PORT -k $WORK -c listen_addresses=''\" -l '$WORK/log' -w start" >/dev/null

PSQL=(psql -X -q -t -A -v ON_ERROR_STOP=1 -h "$WORK" -p "$PORT" -U postgres -d postgres)
"${PSQL[@]}" <<'SQL'
create extension if not exists pgcrypto;
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
-- Stub parents for the foreign keys of the invalidation migration.
create table public.site00_organizations (id uuid primary key default gen_random_uuid());
create table public.site00_projects (id uuid primary key default gen_random_uuid());
insert into public.site00_organizations (id) values ('00000000-0000-0000-0000-000000000001');
SQL
"${PSQL[@]}" -f "$ROOT/supabase/migrations/20260823210000_site00_production_invalidation.sql"
"${PSQL[@]}" -f "$ROOT/supabase/migrations/20260820000000_site00_access_credentials.sql" >/dev/null

as_role() { "${PSQL[@]}" -c "set role $1; $2" 2>&1; }
attempt() { # role, sql → ALLOWED | DENIED
  local out; out="$(as_role "$1" "$2" || true)"
  if grep -qiE 'permission denied|violates row-level security' <<<"$out"; then echo DENIED; else echo ALLOWED; fi
}
ORG="'00000000-0000-0000-0000-000000000001'"
INS_EDGE="insert into public.site00_production_dependency_edges (organization_id, upstream_type, upstream_id, downstream_type, downstream_id, relationship_type, invalidation_policy, reason, source_methodology_version) values ($ORG, 'u', 'probe-' || gen_random_uuid(), 'd', 'x', 'r', 'p', 'probe', 'v')"
INS_EVENT="insert into public.site00_production_invalidation_events (organization_id, source_type, source_id, change_type, change_summary, policy_applied) values ($ORG, 's', 'probe', 'c', 'probe', 'p')"
CALL_FN="select public.site00_allocate_access_credential_code()"
rows() { "${PSQL[@]}" -c "set role $1; select count(*) from $2" 2>/dev/null | tail -1; }

fail=0
emit() { echo "{\"phase\":\"$1\",\"role\":\"$2\",\"object\":\"$3\",\"op\":\"$4\",\"expected\":\"$5\",\"actual\":\"$6\"}"; [ "$5" = "$6" ] || fail=1; }

# Before the repair: the production state the advisor reported.
emit before anon site00_production_dependency_edges insert ALLOWED "$(attempt anon "$INS_EDGE")"
emit before anon site00_production_invalidation_events insert ALLOWED "$(attempt anon "$INS_EVENT")"
emit before anon site00_allocate_access_credential_code execute ALLOWED "$(attempt anon "$CALL_FN")"

"${PSQL[@]}" -f "$ROOT/supabase/migrations/20261026090000_site00_production_graph_rls_and_definer_grants.sql"
"${PSQL[@]}" -f "$ROOT/supabase/migrations/20261026090000_site00_production_graph_rls_and_definer_grants.sql" # idempotent

for t in site00_production_dependency_edges site00_production_invalidation_events; do
  ins="$INS_EDGE"; [ "$t" = site00_production_invalidation_events ] && ins="$INS_EVENT"
  for r in anon authenticated; do
    emit after "$r" "$t" insert DENIED "$(attempt "$r" "$ins")"
    n="$(rows "$r" "public.$t")"; emit after "$r" "$t" select-visible-rows 0 "${n:-0}"
  done
  emit after service_role "$t" insert ALLOWED "$(attempt service_role "$ins")"
  rls="$("${PSQL[@]}" -c "select relrowsecurity from pg_class where oid = 'public.$t'::regclass")"
  emit after table "$t" rls-enabled t "$rls"
  roles="$("${PSQL[@]}" -c "select roles::text from pg_policies where tablename = '$t' and policyname = 'service_role_all'")"
  emit after policy "$t" roles "{service_role}" "$roles"
done
for r in anon authenticated; do emit after "$r" site00_allocate_access_credential_code execute DENIED "$(attempt "$r" "$CALL_FN")"; done
emit after service_role site00_allocate_access_credential_code execute ALLOWED "$(attempt service_role "$CALL_FN")"
exit "$fail"
