#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CF="$ROOT/.cursor/bin/cloudflared"
LOG="/tmp/site00-preview-tunnel.log"

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG"
}

# One shared Cloudflare tunnel token on many Cursor Cloud agents registers many connectors
# to different localhost:5174 backends. Cloudflare load-balances the public hostname across
# them — page source alternates between bundles (looks like "switching branches").
# Only the environment with SITE00_CLOUDFLARE_TUNNEL_CANONICAL=1 in Cloud Secrets may run cloudflared.
if [[ "${SITE00_CLOUDFLARE_TUNNEL_CANONICAL:-}" != "1" ]]; then
  log "SKIP: SITE00_CLOUDFLARE_TUNNEL_CANONICAL is not 1 — this agent will not register a tunnel connector."
  log "Set SITE00_CLOUDFLARE_TUNNEL_CANONICAL=1 on exactly ONE Cursor Cloud environment (SITE 00 preview)."
  log "See docs/site00/production-workspace/reconciliation/preview-tunnel-multi-connector-2026-10-06.md"
  exit 0
fi

if [[ ! -x "$CF" ]]; then
  bash "$ROOT/.cursor/scripts/install-cloudflared.sh"
fi

if [[ -z "${SITE00_CLOUDFLARE_TUNNEL_TOKEN:-}" ]]; then
  log "SITE00_CLOUDFLARE_TUNNEL_TOKEN is not set — preview tunnel cannot start (Cursor Cloud Secrets)."
  exit 1
fi

bash "$ROOT/.cursor/scripts/ensure-site00-preview-url.sh"
log "CANONICAL tunnel connector starting (SITE00_CLOUDFLARE_TUNNEL_CANONICAL=1)."

# Restart automatically if cloudflared exits (network blip, edge rotation, etc.).
while true; do
  "$CF" tunnel --no-autoupdate run --token "$SITE00_CLOUDFLARE_TUNNEL_TOKEN" || true
  sleep 5
done
