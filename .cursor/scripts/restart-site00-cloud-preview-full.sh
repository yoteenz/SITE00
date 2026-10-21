#!/usr/bin/env bash
# Restart preview server + tunnel (CI dist). Run after main deploy or when preview looks stale.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMUX=(tmux -f /exec-daemon/tmux.portal.conf)

cd "$ROOT"
PIN_FILE="/tmp/site00-cloud-preview-pinned-ref"
if [[ -f "$PIN_FILE" ]]; then
  PIN_REF="$(tr -d '[:space:]' < "$PIN_FILE")"
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Preview pinned — dev server from $PIN_REF (skip CI bootstrap)" >> /tmp/site00-cloud-preview-bootstrap.log
else
  bash "$ROOT/.cursor/scripts/bootstrap-cloud-preview-from-ci.sh"
fi

# Stop vite preview / dev on 5174
if command -v fuser >/dev/null 2>&1; then
  fuser -k 5174/tcp 2>/dev/null || true
else
  while read -r pid; do
    [[ -n "$pid" ]] && kill "$pid" 2>/dev/null || true
  done < <(lsof -ti :5174 2>/dev/null || true)
fi
sleep 1

"${TMUX[@]}" kill-session -t site00_vite 2>/dev/null || true
if [[ -f "$PIN_FILE" ]]; then
  PIN_REF="$(tr -d '[:space:]' < "$PIN_FILE")"
  "${TMUX[@]}" new-session -d -s site00_vite -c "$ROOT" -- "${SHELL:-bash}" -l \
    -c "bash .cursor/scripts/serve-site00-preview-from-pin-ref.sh \"$PIN_REF\" 2>&1 | tee -a /tmp/site00-cloud-preview-server.log"
else
  "${TMUX[@]}" new-session -d -s site00_vite -c "$ROOT" -- "${SHELL:-bash}" -l \
    -c "bash .cursor/scripts/run-site00-cloud-preview-server.sh 2>&1 | tee -a /tmp/site00-cloud-preview-server.log"
fi

bash "$ROOT/.cursor/scripts/restart-site00-preview-tunnel.sh"

# Seed in-memory Digital Foundation artifacts for founder workspace + review (same-origin /api).
for _i in $(seq 1 45); do
  if curl -sf "http://127.0.0.1:5174/api/admin/site00-foundation?action=list" >/dev/null 2>&1; then
    curl -sf "http://127.0.0.1:5174/api/dev/site00-digital-foundation-preview-bootstrap" >/dev/null 2>&1 || true
    for fx in A_BASE J_PAYMENT_SUCCESS M_COMPLETE_CREDIT; do
      curl -sf -X POST "http://127.0.0.1:5174/api/dev/site00-digital-foundation-preview-bootstrap" \
        -H 'Content-Type: application/json' \
        -d "{\"fixture_id\":\"$fx\"}" >/dev/null 2>&1 || true
    done
    curl -sf "http://127.0.0.1:5174/api/admin/site00-foundation?action=pipeline" >/dev/null 2>&1 || true
    break
  fi
  sleep 2
done

MANIFEST="$ROOT/dist/release-manifest.json"
if [[ -f "$MANIFEST" ]]; then
  node -e "const m=require('$MANIFEST'); console.log('Preview bundle:', m.commitSha, m.bundleEntry)"
fi
