#!/usr/bin/env bash
# Point the preview tunnel at origin/preview/tunnel (synced from main after merges) — founder-visible integration branch.
set -euo pipefail

SCRIPT_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WT="${SITE00_PREVIEW_MAIN_WORKTREE:-/tmp/site00-preview-main}"

cd "$SCRIPT_REPO"
bash "$SCRIPT_REPO/.cursor/scripts/ensure-site00-preview-main-authority.sh"

if [[ -d "$SCRIPT_REPO/node_modules" && ! -e "$WT/node_modules" ]]; then
  ln -s "$SCRIPT_REPO/node_modules" "$WT/node_modules"
fi

# A leftover pin (the old Grok-review ref) would override this checkout.
rm -f /tmp/site00-cloud-preview-pinned-ref
unset SITE00_PREVIEW_PIN_REF

export SITE00_CLOUD_PREVIEW_ROOT="$WT"
export SITE00_CLOUD_PREVIEW_MODE="${SITE00_CLOUD_PREVIEW_MODE:-dev}"
export SITE00_PREVIEW_SYNC_MAIN=0
exec bash "$SCRIPT_REPO/.cursor/scripts/run-site00-cloud-preview-server.sh"
