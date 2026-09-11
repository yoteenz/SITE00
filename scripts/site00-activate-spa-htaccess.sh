#!/usr/bin/env bash
# Activate SPA .htaccess on GoDaddy when FTP/cPanel skips dotfiles on upload.
# FTP upload is PRIMARY (same path as FTP-Deploy-Action). SSH cp is secondary backup.
set -euo pipefail

REMOTE="${GODADDY_SSH_REMOTE_DIR:-public_html}"
PREFIXES="projects services control origin studio-world admin app assts idnty bldr evolve validation astral-world sign-in identity register create-account"
DIST="${DIST_DIR:-dist}"

normalize_ftp_server_dir() {
  local dir="${1:-}"
  dir="${dir#./}"
  dir="${dir%/}"
  printf '%s' "$dir"
}

activate_via_ftp() {
  local host="${GODADDY_FTP_HOST:?GODADDY_FTP_HOST required}"
  local user="${GODADDY_FTP_USERNAME:?GODADDY_FTP_USERNAME required}"
  local pass="${GODADDY_FTP_PASSWORD:?GODADDY_FTP_PASSWORD required}"
  local server_dir
  server_dir="$(normalize_ftp_server_dir "${GODADDY_FTP_SERVER_DIR:-}")"

  local base="ftp://${host}"
  if [ -n "$server_dir" ]; then
    base="${base}/${server_dir}"
  fi

  upload_file() {
    local local_path="$1"
    local remote_path="$2"
    echo "FTP upload: ${local_path} → ${remote_path}"
    curl -sSf --ftp-pasv --ftp-create-dirs \
      -T "$local_path" \
      --user "${user}:${pass}" \
      "${base}/${remote_path}"
  }

  if [ -f "${DIST}/htaccess-deploy.txt" ]; then
    upload_file "${DIST}/htaccess-deploy.txt" ".htaccess"
  else
    echo "::warning::htaccess-deploy.txt missing in ${DIST}/"
  fi

  for prefix in ${PREFIXES}; do
    nested="${DIST}/${prefix}/htaccess-nested.txt"
    if [ -f "$nested" ]; then
      upload_file "$nested" "${prefix}/.htaccess"
    fi
  done
}

activate_via_ssh() {
  local host="${GODADDY_SSH_HOST:?GODADDY_SSH_HOST required}"
  local user="${GODADDY_SSH_USER:?GODADDY_SSH_USER required}"
  local key="${GODADDY_SSH_PRIVATE_KEY:?GODADDY_SSH_PRIVATE_KEY required}"
  local port="${GODADDY_SSH_PORT:-22}"

  mkdir -p ~/.ssh
  printf '%s\n' "$key" > ~/.ssh/deploy_key
  chmod 600 ~/.ssh/deploy_key

  local remote_escaped
  remote_escaped=$(printf '%q' "$REMOTE")

  ssh -T -i ~/.ssh/deploy_key -p "$port" \
    -o StrictHostKeyChecking=no \
    -o BatchMode=yes \
    -o LogLevel=ERROR \
    -o RequestTTY=no \
    "$user@$host" bash -s <<EOF
set -euo pipefail
cd ${remote_escaped}
if [ -f htaccess-deploy.txt ]; then
  cp -f htaccess-deploy.txt .htaccess
  echo "SSH activated root .htaccess"
fi
for prefix in ${PREFIXES}; do
  if [ -f "\${prefix}/htaccess-nested.txt" ]; then
    cp -f "\${prefix}/htaccess-nested.txt" "\${prefix}/.htaccess"
    echo "SSH activated \${prefix}/.htaccess"
  fi
done
EOF
}

HAS_FTP=false
HAS_SSH=false
[ -n "${GODADDY_FTP_HOST:-}" ] && [ -n "${GODADDY_FTP_USERNAME:-}" ] && [ -n "${GODADDY_FTP_PASSWORD:-}" ] && HAS_FTP=true
[ -n "${GODADDY_SSH_HOST:-}" ] && [ -n "${GODADDY_SSH_USER:-}" ] && [ -n "${GODADDY_SSH_PRIVATE_KEY:-}" ] && HAS_SSH=true

if [ "$HAS_FTP" != true ] && [ "$HAS_SSH" != true ]; then
  echo "::warning::SPA_HTACCESS_ACTIVATE_SKIPPED — no SSH or FTP credentials"
  exit 0
fi

# FTP first — matches the path FTP-Deploy-Action uses (htaccess-deploy.txt is already there).
if [ "$HAS_FTP" = true ]; then
  echo "Activating SPA htaccess via FTP direct upload (primary)…"
  activate_via_ftp
fi

if [ "$HAS_SSH" = true ]; then
  echo "Activating SPA htaccess via SSH backup…"
  set +e
  activate_via_ssh
  SSH_CODE=$?
  set -e
  if [ "$SSH_CODE" -ne 0 ]; then
    echo "::warning::SSH htaccess activation failed (exit ${SSH_CODE}) — FTP upload may still have succeeded"
  fi
fi

echo "SPA htaccess activation upload complete"

if [ "${VERIFY_SPA_AFTER_ACTIVATE:-true}" = "true" ]; then
  echo "Verifying SPA deep link after htaccess activation…"
  sleep 5
  if node scripts/site00-verify-spa-deep-link.mjs; then
    echo "SPA deep link verify PASS"
  else
    echo "::error::SPA_HTACCESS_ACTIVATE_FAILED — deep link still 404 after FTP/SSH activation"
    echo "::error::Manual fix: cPanel → rename htaccess-deploy.txt → .htaccess AND projects/htaccess-nested.txt → .htaccess"
    exit 1
  fi
fi
