#!/usr/bin/env bash
# Point the preview tunnel at current origin/main so recent pages (JURNL parents included) are what the tunnel serves.
set -euo pipefail

SCRIPT_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WT="${SITE00_PREVIEW_MAIN_WORKTREE:-/tmp/site00-preview-main}"

cd "$SCRIPT_REPO"
git fetch origin main

if [[ ! -e "$WT/.git" ]]; then
  git worktree add --detach "$WT" origin/main
else
  git -C "$WT" fetch origin main
  git -C "$WT" checkout --detach origin/main
fi

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
