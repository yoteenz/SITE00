#!/usr/bin/env bash
# Restart preview server + tunnel (CI dist). Run after main deploy or when preview looks stale.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMUX=(tmux -f /exec-daemon/tmux.portal.conf)

cd "$ROOT"
bash "$ROOT/.cursor/scripts/bootstrap-cloud-preview-from-ci.sh"

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
"${TMUX[@]}" new-session -d -s site00_vite -c "$ROOT" -- "${SHELL:-bash}" -l \
  -c "bash .cursor/scripts/run-site00-cloud-preview-server.sh 2>&1 | tee -a /tmp/site00-cloud-preview-server.log"

bash "$ROOT/.cursor/scripts/restart-site00-preview-tunnel.sh"

MANIFEST="$ROOT/dist/release-manifest.json"
if [[ -f "$MANIFEST" ]]; then
  node -e "const m=require('$MANIFEST'); console.log('Preview bundle:', m.commitSha, m.bundleEntry)"
fi
