#!/usr/bin/env bash
# Apply pending SITE 00 migrations to Supabase project hyycomvcaqxxvyrfupes.
# Requires Supabase CLI logged in: supabase login
# Does not print secrets.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
REF="${SUPABASE_PROJECT_REF:-hyycomvcaqxxvyrfupes}"

if ! command -v supabase >/dev/null 2>&1; then
  echo "Install Supabase CLI: https://supabase.com/docs/guides/cli"
  exit 1
fi

cd "$ROOT"
if [[ ! -d supabase/migrations ]]; then
  echo "Missing supabase/migrations"
  exit 1
fi

echo "Linking project ref ${REF} (skip if already linked)..."
supabase link --project-ref "$REF" || true

echo "Pushing migrations from supabase/migrations ..."
supabase db push

echo "Done. Verify with: supabase migration list"
