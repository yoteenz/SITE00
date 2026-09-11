#!/usr/bin/env bash
# Activate SPA .htaccess on GoDaddy when FTP/cPanel skips dotfiles on upload.
# Renames visible htaccess-deploy.txt + */htaccess-nested.txt → .htaccess
set -euo pipefail

REMOTE="${GODADDY_SSH_REMOTE_DIR:-public_html}"
PREFIXES="projects services control origin studio-world admin app assts idnty bldr evolve validation astral-world sign-in identity register create-account"

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
  echo "Activated root .htaccess from htaccess-deploy.txt"
elif [ -f .htaccess ]; then
  echo "Root .htaccess already present"
else
  echo "WARN: no htaccess-deploy.txt or .htaccess at document root"
fi
for prefix in ${PREFIXES}; do
  if [ -f "\${prefix}/htaccess-nested.txt" ]; then
    cp -f "\${prefix}/htaccess-nested.txt" "\${prefix}/.htaccess"
    echo "Activated \${prefix}/.htaccess"
  elif [ -f "\${prefix}/.htaccess" ]; then
    echo "\${prefix}/.htaccess already present"
  fi
done
EOF
}

activate_via_ftp() {
  local host="${GODADDY_FTP_HOST:?GODADDY_FTP_HOST required}"
  local user="${GODADDY_FTP_USERNAME:?GODADDY_FTP_USERNAME required}"
  local pass="${GODADDY_FTP_PASSWORD:?GODADDY_FTP_PASSWORD required}"
  local server_dir="${GODADDY_FTP_SERVER_DIR:-./}"
  local dist="${1:-dist}"

  # shellcheck disable=SC2086
  local base="ftp://${host}/${server_dir}"

  upload_file() {
    local local_path="$1"
    local remote_path="$2"
    curl -sS --ftp-pasv --ftp-create-dirs \
      -T "$local_path" \
      --user "${user}:${pass}" \
      "${base}${remote_path}"
    echo "FTP uploaded → ${remote_path}"
  }

  if [ -f "${dist}/htaccess-deploy.txt" ]; then
    upload_file "${dist}/htaccess-deploy.txt" ".htaccess"
  fi

  for prefix in ${PREFIXES}; do
    nested="${dist}/${prefix}/htaccess-nested.txt"
    if [ -f "$nested" ]; then
      upload_file "$nested" "${prefix}/.htaccess"
    fi
  done
}

if [ -n "${GODADDY_SSH_HOST:-}" ] && [ -n "${GODADDY_SSH_USER:-}" ] && [ -n "${GODADDY_SSH_PRIVATE_KEY:-}" ]; then
  echo "Activating SPA htaccess via SSH…"
  activate_via_ssh
elif [ -n "${GODADDY_FTP_HOST:-}" ] && [ -n "${GODADDY_FTP_USERNAME:-}" ] && [ -n "${GODADDY_FTP_PASSWORD:-}" ]; then
  echo "Activating SPA htaccess via FTP direct upload…"
  activate_via_ftp "${DIST_DIR:-dist}"
else
  echo "::warning::SPA_HTACCESS_ACTIVATE_SKIPPED — no SSH or FTP credentials"
  exit 0
fi

echo "SPA htaccess activation complete"
