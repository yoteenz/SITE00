#!/usr/bin/env bash
# P0.DEPLOY.1 — cPanel frontend deploy (FTP or SSH/rsync). Used by GitHub Actions.
set -euo pipefail

DIST="${1:-dist}"

if [ ! -d "$DIST" ]; then
  echo "::error::FRONTEND_UPLOAD_FAILED — dist/ not found"
  exit 1
fi

deploy_ftp() {
  echo "FTP deploy via FTP-Deploy-Action is configured in workflow YAML."
  exit 0
}

deploy_ssh() {
  local host="${GODADDY_SSH_HOST:?GODADDY_SSH_HOST required}"
  local user="${GODADDY_SSH_USER:?GODADDY_SSH_USER required}"
  local key="${GODADDY_SSH_PRIVATE_KEY:?GODADDY_SSH_PRIVATE_KEY required}"
  local port="${GODADDY_SSH_PORT:-22}"
  local remote="${GODADDY_SSH_REMOTE_DIR:-public_html}"

  mkdir -p ~/.ssh
  echo "$key" > ~/.ssh/deploy_key
  chmod 600 ~/.ssh/deploy_key

  rsync -avz --delete \
    -e "ssh -i ~/.ssh/deploy_key -p $port -o StrictHostKeyChecking=no" \
    --exclude='.well-known/' \
    --exclude='.cpanel/' \
    --exclude='cgi-bin/' \
    --exclude='webmail/' \
    --exclude='mail/' \
    --exclude='tmp/' \
    "$DIST/" "$user@$host:$remote/"
  echo "SSH rsync deploy complete → $user@$host:$remote/"
}

if [ -n "${GODADDY_SSH_HOST:-}" ] && [ -n "${GODADDY_SSH_USER:-}" ] && [ -n "${GODADDY_SSH_PRIVATE_KEY:-}" ]; then
  deploy_ssh
elif [ "${GODADDY_DEPLOY_ENABLED:-}" = "true" ] && [ -n "${GODADDY_FTP_HOST:-}" ]; then
  deploy_ftp
else
  echo "::error::CPANEL_CONNECTION_FAILED — configure GODADDY_FTP_* or GODADDY_SSH_*"
  exit 1
fi
