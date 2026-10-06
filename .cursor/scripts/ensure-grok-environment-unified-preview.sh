#!/usr/bin/env bash
# Grok unified review ONLY (branch cursor/grok-plus-environment-unified-review-87ed).
# Does NOT include project-scoped production workspace (#1404). Founder review: serve-site00-preview-from-main.sh.
if [[ "${SITE00_PREVIEW_REQUIRE_MAIN:-1}" == "1" ]]; then
  echo "Refusing grok unified-review preview (SITE00_PREVIEW_REQUIRE_MAIN=1). Use serve-site00-preview-from-main.sh → origin/main." >&2
  exit 1
fi
set -euo pipefail

SCRIPT_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WORKTREE="$SCRIPT_REPO/.worktrees/grok-environment-unified-review"
BRANCH="cursor/grok-plus-environment-unified-review-87ed"

cd "$SCRIPT_REPO"
if [[ ! -d "$WORKTREE/.git" ]]; then
  git fetch origin "$BRANCH" 2>/dev/null || true
  if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
    git worktree add "$WORKTREE" "$BRANCH"
  elif git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
    git worktree add "$WORKTREE" "origin/$BRANCH" -b "$BRANCH"
  else
    echo "Missing branch $BRANCH — create unified review branch first." >&2
    exit 1
  fi
fi

export SITE00_CLOUD_PREVIEW_ROOT="$WORKTREE"
export SITE00_CLOUD_PREVIEW_MODE="${SITE00_CLOUD_PREVIEW_MODE:-local}"
export SITE00_PREVIEW_SYNC_MAIN="${SITE00_PREVIEW_SYNC_MAIN:-0}"

exec bash "$SCRIPT_REPO/.cursor/scripts/run-site00-cloud-preview-server.sh"
