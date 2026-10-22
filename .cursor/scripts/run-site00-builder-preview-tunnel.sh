#!/usr/bin/env bash
# Quick Cloudflare tunnel → builder preview port (does NOT use SITE00_CLOUDFLARE_TUNNEL_TOKEN / site00.fsbw-dev.com).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CF="$ROOT/.cursor/bin/cloudflared"
PORT="${SITE00_BUILDER_PREVIEW_PORT:-5176}"
LOG="/tmp/site00-builder-preview-tunnel.log"
URL_FILE="/tmp/site00-builder-preview-url.txt"

if [[ ! -x "$CF" ]]; then
  bash "$ROOT/.cursor/scripts/install-cloudflared.sh"
fi

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG"
}

log "Builder quick tunnel → http://127.0.0.1:$PORT (separate from foundation site00.fsbw-dev.com)"

# cloudflared prints trycloudflare URL to stderr
"$CF" tunnel --no-autoupdate --url "http://127.0.0.1:$PORT" 2>&1 | tee -a "$LOG" | while read -r line; do
  if [[ "$line" =~ https://[a-z0-9-]+\.trycloudflare\.com ]]; then
    echo "${BASH_REMATCH[0]}" > "$URL_FILE"
    log "PUBLIC_URL=${BASH_REMATCH[0]}"
  fi
done
