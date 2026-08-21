#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BIN_DIR="$ROOT/.cursor/bin"
mkdir -p "$BIN_DIR"

arch="$(uname -m)"
case "$arch" in
  x86_64) cf_arch=amd64 ;;
  aarch64 | arm64) cf_arch=arm64 ;;
  *) cf_arch=amd64 ;;
esac

cf="$BIN_DIR/cloudflared"
if [[ -x "$cf" ]] && "$cf" --version >/dev/null 2>&1; then
  exit 0
fi

curl -fsSL -o "$cf" "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${cf_arch}"
chmod +x "$cf"
