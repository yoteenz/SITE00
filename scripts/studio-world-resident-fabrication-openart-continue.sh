#!/usr/bin/env bash
# Reminder helper — OpenArt MCP must run inside the cloud agent (no headless OAuth on VM).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STATE="$ROOT/artifacts/STUDIO_WORLD_RESIDENT_FABRICATION/_autogen_state.json"
IDX="$(node -p "JSON.parse(require('fs').readFileSync('$STATE','utf8')).nextIndex")"
echo "Next queue index: $IDX (see _job_queue_sw001_005.json)"
echo "Emit payload: node scripts/studio-world-resident-fabrication-openart-batch-step.mjs emit $IDX"
echo "Then: openart_generate_image → openart_creation_wait → npx tsx scripts/studio-world-resident-fabrication-openart-runner.mjs record '<json>'"
