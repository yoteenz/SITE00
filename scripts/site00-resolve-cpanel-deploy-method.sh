#!/usr/bin/env bash
# Resolve cPanel deploy method for GitHub Actions (SSH preferred when fully configured).
set -euo pipefail

SSH_VAR="${GODADDY_SSH_DEPLOY_ENABLED:-}"
FTP_VAR="${GODADDY_DEPLOY_ENABLED:-}"

ssh_ok=false
ftp_ok=false

if [ -n "${GODADDY_SSH_HOST:-}" ] && [ -n "${GODADDY_SSH_USER:-}" ] && [ -n "${GODADDY_SSH_PRIVATE_KEY:-}" ]; then
  ssh_ok=true
fi
if [ -n "${GODADDY_FTP_HOST:-}" ] && [ -n "${GODADDY_FTP_USERNAME:-}" ] && [ -n "${GODADDY_FTP_PASSWORD:-}" ]; then
  ftp_ok=true
fi

if [ "$SSH_VAR" = "true" ] && [ "$ssh_ok" = true ]; then
  echo "ssh"
  exit 0
fi
if [ "$FTP_VAR" = "true" ] && [ "$ftp_ok" = true ]; then
  echo "ftp"
  exit 0
fi
if [ "$ssh_ok" = true ]; then
  echo "ssh"
  exit 0
fi
if [ "$ftp_ok" = true ]; then
  echo "ftp"
  exit 0
fi

echo "::error::CPANEL_CONNECTION_FAILED — frontend deploy requested but credentials incomplete." >&2
echo "::error::SSH (need HOST+USER+PRIVATE_KEY): present=$ssh_ok, var=$SSH_VAR" >&2
echo "::error::FTP (need HOST+USERNAME+PASSWORD): present=$ftp_ok, var=$FTP_VAR" >&2
echo "::error::Add GitHub repo secrets or disable SITE00_AUTO_PROMOTE / deploy_frontend." >&2
exit 1
