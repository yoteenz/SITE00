#!/usr/bin/env bash
# Stop cloudflared and tmux tunnel sessions on THIS agent only (does not remove remote connectors).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMUX=(tmux -f /exec-daemon/tmux.portal.conf)
LOG="/tmp/site00-preview-tunnel.log"

for SESSION in site00-preview-tunnel site00_preview_tunnel; do
  "${TMUX[@]}" kill-session -t "$SESSION" 2>/dev/null || true
done

while read -r pid; do
  [[ -n "$pid" ]] && kill "$pid" 2>/dev/null || true
done < <(pgrep -f "$ROOT/.cursor/bin/cloudflared tunnel" || true)

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Local preview tunnel stopped on this agent." | tee -a "$LOG"
