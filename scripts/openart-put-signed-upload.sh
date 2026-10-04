#!/usr/bin/env bash
# Usage: openart-put-signed-upload.sh <local-file> <signURL> <contentType> <size>
set -euo pipefail
FILE=$1
SIGN=$2
CT=$3
SIZE=$4
curl -fsS -X PUT -T "$FILE" \
  -H "Content-Type: ${CT}" \
  -H "Content-Length: ${SIZE}" \
  "$SIGN"
