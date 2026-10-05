#!/usr/bin/env bash
# Restart Cloudflare tunnel → localhost:5174 (site00.fsbw-dev.com). Safe to run from cloud agents.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMUX=(tmux -f /exec-daemon/tmux.portal.conf)
SESSION="site00-preview-tunnel"
LOG="/tmp/site00-preview-tunnel.log"

cd "$ROOT"
bash "$ROOT/.cursor/scripts/ensure-site00-preview-url.sh"

if [[ -z "${SITE00_CLOUDFLARE_TUNNEL_TOKEN:-}" ]]; then
  echo "SITE00_CLOUDFLARE_TUNNEL_TOKEN is not set — add it in Cursor Cloud Secrets for this environment." | tee -a "$LOG"
  exit 1
fi

# Stop only this repo's cloudflared (avoid broad pkill).
while read -r pid; do
  [[ -n "$pid" ]] && kill "$pid" 2>/dev/null || true
done < <(pgrep -f "$ROOT/.cursor/bin/cloudflared tunnel" || true)

"${TMUX[@]}" kill-session -t "$SESSION" 2>/dev/null || true
"${TMUX[@]}" new-session -d -s "$SESSION" -c "$ROOT" -- "${SHELL:-bash}" -l \
  -c "bash .cursor/scripts/run-site00-preview-tunnel.sh 2>&1 | tee -a $LOG"

sleep 3
PREVIEW_URL="$(cat /tmp/site00-cloud-preview-url.txt 2>/dev/null | tr -d '\n')"
if [[ -z "$PREVIEW_URL" ]]; then
  echo "Missing /tmp/site00-cloud-preview-url.txt — set SITE00_CLOUDFLARE_TUNNEL_HOSTNAME in Cloud Secrets." >&2
  exit 2
fi
if curl -sS -o /dev/null -w '%{http_code}' --connect-timeout 8 "$PREVIEW_URL" | grep -q 200; then
  echo "Preview tunnel OK: $PREVIEW_URL"
else
  echo "Tunnel process restarted; public URL not 200 yet — check: tail -40 $LOG" >&2
  exit 2
fi
