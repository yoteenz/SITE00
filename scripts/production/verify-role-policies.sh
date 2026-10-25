#!/usr/bin/env bash
# D-14 — verifies the service_role_all policy repair on a throwaway local PostgreSQL cluster. Never touches a live
# project. Creates Supabase-like roles (anon, authenticated, service_role) with Supabase's default table grants, applies
# the two original migrations, shows the permissive policy lets anon read and write, applies the repair, and shows anon
# and authenticated are denied while service_role keeps access. Prints one JSON line per check; exits non-zero on failure.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGBIN="${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
[ -x "$PGBIN/initdb" ] || { echo '{"check":"postgres","result":"BLOCKED","detail":"no local PostgreSQL server binaries"}'; exit 2; }

WORK="$(mktemp -d)"
PORT="${PGPORT_VERIFY:-55432}"
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
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
SQL
"${PSQL[@]}" -f "$ROOT/supabase/migrations/20260910180000_site00_brand_creative_context.sql"
"${PSQL[@]}" -f "$ROOT/supabase/migrations/20260921120000_site00_page_concept_generation_runs.sql"

as_role() { "${PSQL[@]}" -c "set role $1; $2" 2>&1; }
attempt() { # role, sql → ALLOWED | DENIED
  local out; out="$(as_role "$1" "$2" || true)"
  if grep -qiE 'permission denied|violates row-level security' <<<"$out"; then echo DENIED; else echo ALLOWED; fi
}
INS_BRAND="insert into public.site00_brand_creative_context (brand_id, context) values ('probe-' || gen_random_uuid(), '{}'::jsonb)"
INS_RUN="insert into public.site00_page_concept_generation_runs (run_id, organization_id, project_id, page_id, status, run_json) values ('probe-' || gen_random_uuid(), gen_random_uuid(), 'p', 'pg', 'S', '{}'::jsonb)"
rows() { "${PSQL[@]}" -c "set role $1; select count(*) from $2" 2>/dev/null | tail -1; }

fail=0
emit() { echo "{\"phase\":\"$1\",\"role\":\"$2\",\"table\":\"$3\",\"op\":\"$4\",\"expected\":\"$5\",\"actual\":\"$6\"}"; [ "$5" = "$6" ] || fail=1; }

# Before the repair: the permissive policy lets anon write (the finding).
emit before anon site00_brand_creative_context insert ALLOWED "$(attempt anon "$INS_BRAND")"
emit before anon site00_page_concept_generation_runs insert ALLOWED "$(attempt anon "$INS_RUN")"

"${PSQL[@]}" -f "$ROOT/supabase/migrations/20261025120000_site00_restrict_service_role_all_policies.sql"
"${PSQL[@]}" -f "$ROOT/supabase/migrations/20261025120000_site00_restrict_service_role_all_policies.sql" # idempotent

for t in site00_brand_creative_context site00_page_concept_generation_runs; do
  ins="$INS_BRAND"; [ "$t" = site00_page_concept_generation_runs ] && ins="$INS_RUN"
  for r in anon authenticated; do
    emit after "$r" "$t" insert DENIED "$(attempt "$r" "$ins")"
    n="$(rows "$r" "public.$t")"; emit after "$r" "$t" select-visible-rows 0 "${n:-0}"
  done
  emit after service_role "$t" insert ALLOWED "$(attempt service_role "$ins")"
  n="$(rows service_role "public.$t")"; [ "${n:-0}" -ge 1 ] && emit after service_role "$t" select-visible-rows ">=1" ">=1" || emit after service_role "$t" select-visible-rows ">=1" "${n:-0}"
  roles="$("${PSQL[@]}" -c "select roles::text from pg_policies where tablename = '$t' and policyname = 'service_role_all'")"
  emit after policy "$t" roles "{service_role}" "$roles"
done
exit "$fail"
