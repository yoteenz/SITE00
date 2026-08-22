#!/usr/bin/env bash
set -euo pipefail

PREVIEW_URL_FILE="/tmp/site00-cloud-preview-url.txt"
hostname="${SITE00_CLOUDFLARE_TUNNEL_HOSTNAME:-${CLOUDFLARE_TUNNEL_HOSTNAME:-}}"

if [[ -n "${hostname// /}" ]]; then
  url="$hostname"
  [[ "$url" == *://* ]] || url="https://${url}"
  url="${url%/}"
  printf '%s\n' "$url" >"$PREVIEW_URL_FILE"
fi
