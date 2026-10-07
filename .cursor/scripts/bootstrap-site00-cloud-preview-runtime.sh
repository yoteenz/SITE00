#!/usr/bin/env bash
# Every cloud agent boot: sync preview/tunnel branch, mount worktree, optional canonical tunnel.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMUX=(tmux -f /exec-daemon/tmux.portal.conf)
LOG="/tmp/site00-cloud-preview-runtime.log"

cd "$ROOT"
{
  echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) bootstrap-site00-cloud-preview-runtime ==="
  bash "$ROOT/.cursor/scripts/bootstrap-cloud-preview-from-ci.sh"
  bash "$ROOT/.cursor/scripts/ensure-site00-preview-url.sh"
  bash "$ROOT/.cursor/scripts/sync-preview-tunnel-branch.sh" || true
  bash "$ROOT/.cursor/scripts/ensure-site00-preview-main-authority.sh"
} >>"$LOG" 2>&1

# Non-canonical agents must not register cloudflared (multi-connector roulette).
if [[ "${SITE00_CLOUDFLARE_TUNNEL_CANONICAL:-}" != "1" ]]; then
  bash "$ROOT/.cursor/scripts/stop-site00-preview-tunnel-local.sh" >>"$LOG" 2>&1 || true
fi
