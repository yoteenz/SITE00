#!/usr/bin/env bash
# Run after merging a PR to main so preview/tunnel and the canonical worktree catch up immediately.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMUX=(tmux -f /exec-daemon/tmux.portal.conf)

cd "$ROOT"
bash "$ROOT/.cursor/scripts/sync-preview-tunnel-branch.sh"
bash "$ROOT/.cursor/scripts/ensure-site00-preview-main-authority.sh"

# Remount running Vite on the updated worktree (HMR picks up git checkout in worktree).
if "${TMUX[@]}" has-session -t site00_vite 2>/dev/null; then
  "${TMUX[@]}" kill-session -t site00_vite 2>/dev/null || true
fi
"${TMUX[@]}" new-session -d -s site00_vite -c "$ROOT" -- "${SHELL:-bash}" -l \
  -c "bash .cursor/scripts/serve-site00-preview-from-main.sh 2>&1 | tee -a /tmp/site00-vite-preview-tunnel.log"

if [[ "${SITE00_CLOUDFLARE_TUNNEL_CANONICAL:-}" == "1" ]]; then
  bash "$ROOT/.cursor/scripts/restart-site00-preview-tunnel.sh" || true
fi

echo "Preview tunnel branch refreshed; worktree remounted. See /tmp/site00-preview-runtime-lineage.txt"
