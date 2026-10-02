#!/usr/bin/env bash
# Caches the production Martian Mono webfont for the browser-proof harnesses (see scripts/lib/site00-proof-fonts.mjs).
set -euo pipefail
DIR="${SITE00_PROOF_FONT_CACHE:-/tmp/site00-proof-fonts}"
mkdir -p "$DIR"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
curl -fsS -A "$UA" "https://fonts.googleapis.com/css2?family=Martian+Mono:wdth,wght@75..112.5,100..800&display=swap" -o "$DIR/martian.css"
grep -o 'https://fonts.gstatic.com[^)]*' "$DIR/martian.css" | sort -u | while read -r url; do
  curl -fsS "$url" -o "$DIR/$(basename "$url")"
done
echo "cached $(ls "$DIR" | wc -l) files in $DIR"
