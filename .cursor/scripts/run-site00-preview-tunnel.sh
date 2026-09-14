#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CF="$ROOT/.cursor/bin/cloudflared"

if [[ ! -x "$CF" ]]; then
  bash "$ROOT/.cursor/scripts/install-cloudflared.sh"
fi

LOG="/tmp/site00-preview-tunnel.log"
if [[ -z "${SITE00_CLOUDFLARE_TUNNEL_TOKEN:-}" ]]; then
  msg="SITE00_CLOUDFLARE_TUNNEL_TOKEN is not set — preview tunnel cannot start (Cursor Cloud Secrets)."
  echo "$msg" | tee -a "$LOG" >&2
  exit 1
fi

bash "$ROOT/.cursor/scripts/ensure-site00-preview-url.sh"

# Restart automatically if cloudflared exits (network blip, edge rotation, etc.).
while true; do
  "$CF" tunnel --no-autoupdate run --token "$SITE00_CLOUDFLARE_TUNNEL_TOKEN" || true
  sleep 5
done
