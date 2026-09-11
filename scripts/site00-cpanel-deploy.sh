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

ftp_credentials_present() {
  [ -n "${GODADDY_FTP_HOST:-}" ] && [ -n "${GODADDY_FTP_USERNAME:-}" ] && [ -n "${GODADDY_FTP_PASSWORD:-}" ]
}

run_rsync_with_path() {
  local rsync_path="$1"
  rsync -avz --delete \
    -e "$SSH_RSH" \
    --rsync-path="$rsync_path" \
    --exclude='.well-known/' \
    --exclude='.cpanel/' \
    --exclude='cgi-bin/' \
    --exclude='webmail/' \
    --exclude='mail/' \
    --exclude='tmp/' \
    "$DIST/" "$user@$host:$remote/"
}

deploy_ssh() {
  local host="${GODADDY_SSH_HOST:?GODADDY_SSH_HOST required}"
  local user="${GODADDY_SSH_USER:?GODADDY_SSH_USER required}"
  local key="${GODADDY_SSH_PRIVATE_KEY:?GODADDY_SSH_PRIVATE_KEY required}"
  local port="${GODADDY_SSH_PORT:-22}"
  local remote="${GODADDY_SSH_REMOTE_DIR:-public_html}"

  mkdir -p ~/.ssh
  printf '%s\n' "$key" > ~/.ssh/deploy_key
  chmod 600 ~/.ssh/deploy_key

  # cPanel shared shells often print .bashrc / motd output on login, which breaks rsync's
  # binary protocol ("protocol version mismatch — is your shell clean?").
  # -T disables TTY; --rsync-path variants bypass profile noise on retry.
  SSH_RSH="ssh -T -i ~/.ssh/deploy_key -p ${port} \
    -o StrictHostKeyChecking=no \
    -o BatchMode=yes \
    -o LogLevel=ERROR \
    -o RequestTTY=no \
    -o UserKnownHostsFile=${HOME}/.ssh/known_hosts"

  touch ~/.ssh/known_hosts

  local rsync_paths=(
    "/usr/bin/rsync"
    "env -i HOME=\$HOME PATH=/usr/bin:/bin /usr/bin/rsync"
    "bash --noprofile --norc -c 'exec /usr/bin/rsync'"
  )

  local attempt=0
  local last_err=""
  for rsync_path in "${rsync_paths[@]}"; do
    attempt=$((attempt + 1))
    echo "SSH rsync attempt ${attempt} → ${user}@${host}:${remote}/ (rsync-path=${rsync_path})"
    set +e
    run_rsync_with_path "$rsync_path" 2> /tmp/site00-rsync-err.txt
    local code=$?
    set -e
    if [ "$code" -eq 0 ]; then
      echo "SSH rsync deploy complete → $user@$host:$remote/"
      return 0
    fi
    last_err="$(cat /tmp/site00-rsync-err.txt || true)"
    echo "SSH rsync attempt ${attempt} failed (exit ${code}): ${last_err}"
    if ! grep -qiE 'protocol version mismatch|protocol incompatibility|is your shell clean' <<< "$last_err"; then
      echo "::error::SSH_RSYNC_FAILED — ${last_err}"
      exit "$code"
    fi
  done

  echo "::warning::SSH_RSYNC_SHELL_DIRTY — all clean-shell rsync attempts failed"
  if ftp_credentials_present; then
    echo "FTP fallback available — workflow will run FTP-Deploy-Action next."
    exit 42
  fi

  echo "::error::SSH_RSYNC_FAILED — cPanel shell is not rsync-clean. Add GODADDY_FTP_* secrets for automatic fallback."
  echo "::error::Last rsync error: ${last_err}"
  exit 2
}

if [ -n "${GODADDY_SSH_HOST:-}" ] && [ -n "${GODADDY_SSH_USER:-}" ] && [ -n "${GODADDY_SSH_PRIVATE_KEY:-}" ]; then
  deploy_ssh
elif [ "${GODADDY_DEPLOY_ENABLED:-}" = "true" ] && [ -n "${GODADDY_FTP_HOST:-}" ]; then
  deploy_ftp
else
  echo "::error::CPANEL_CONNECTION_FAILED — configure GODADDY_FTP_* or GODADDY_SSH_*"
  exit 1
fi
