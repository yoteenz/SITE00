#!/usr/bin/env bash
# Serve site00.fsbw-dev.com from an arbitrary git ref (e.g. Opus PR head) without merging to main.
# Revert to merged integration: bash .cursor/scripts/serve-site00-preview-from-main.sh
set -euo pipefail

SCRIPT_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WT="${SITE00_PREVIEW_MAIN_WORKTREE:-/tmp/site00-preview-main}"
REF="${1:-${SITE00_PREVIEW_PIN_REF:-}}"

if [[ -z "$REF" ]]; then
  echo "Usage: SITE00_PREVIEW_PIN_REF=<sha|branch> $0 [ref]" >&2
  exit 1
fi

cd "$SCRIPT_REPO"
git fetch origin 2>/dev/null || true

if [[ ! -e "$WT/.git" ]]; then
  git worktree add --detach "$WT" "$REF"
else
  git -C "$WT" fetch origin 2>/dev/null || true
  git -C "$WT" checkout --detach "$REF"
fi

if [[ -d "$SCRIPT_REPO/node_modules" && ! -e "$WT/node_modules" ]]; then
  ln -sf "$SCRIPT_REPO/node_modules" "$WT/node_modules"
fi

SHA="$(git -C "$WT" rev-parse HEAD)"
LINEAGE="/tmp/site00-preview-runtime-lineage.txt"
{
  echo "PREVIEW_AUTHORITY=PINNED"
  echo "PREVIEW_BRANCH=detached"
  echo "PREVIEW_SHA=$SHA"
  echo "PREVIEW_PIN_REF=$REF"
  echo "PREVIEW_WORKTREE=$WT"
  echo "PREVIEW_MODE=dev"
  echo "UPDATED_UTC=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "NOTE=Pinned preview (not main). Revert: serve-site00-preview-from-main.sh"
} | tee "$LINEAGE"

printf '%s\n' "$REF" > /tmp/site00-cloud-preview-pinned-ref

export SITE00_CLOUD_PREVIEW_ROOT="$WT"
export SITE00_CLOUD_PREVIEW_MODE=dev
export SITE00_PREVIEW_SYNC_MAIN=0
export SITE00_PREVIEW_PIN_REF="$REF"
# Keep API on this Vite dev server (not Railway) for founder preview.
export VITE_API_BASE=
export VITE_DEV_PROXY_TARGET=
# Ephemeral intake when Supabase migration is not on the linked project (honest dev-only persistence).
export SITE00_INTAKES_USE_MEMORY=1
export SITE00_CLOUD_MOBILE_PREVIEW=1
export SITE00_CLIENT_REVIEW_PREVIEW_MODE=1
export VITE_SITE00_TEMPLATE_SYSTEM_V1=1
export VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1=1

exec bash "$SCRIPT_REPO/.cursor/scripts/run-site00-cloud-preview-server.sh"
