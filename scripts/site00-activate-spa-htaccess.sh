#!/usr/bin/env bash
# Activate SPA .htaccess on GoDaddy when FTP/cPanel skips dotfiles on upload.
# Primary: FTP RNFR/RNTO rename htaccess-deploy.txt → .htaccess (works without shell).
# Secondary: FTP STOR direct upload. SSH cp only when explicitly enabled.
set -euo pipefail

REMOTE="${GODADDY_SSH_REMOTE_DIR:-public_html}"
DIST="${DIST_DIR:-dist}"
PREFIXES="$(node --input-type=module -e "import { SPA_ROUTE_PREFIXES } from './scripts/spa-route-prefixes.mjs'; process.stdout.write(SPA_ROUTE_PREFIXES.join(' '));")"

normalize_ftp_server_dir() {
  local dir="${1:-}"
  dir="${dir#./}"
  dir="${dir%/}"
  printf '%s' "$dir"
}

ftp_base_url() {
  local host="${GODADDY_FTP_HOST:?GODADDY_FTP_HOST required}"
  local server_dir
  server_dir="$(normalize_ftp_server_dir "${GODADDY_FTP_SERVER_DIR:-}")"
  if [ -n "$server_dir" ]; then
    printf 'ftp://%s/%s' "$host" "$server_dir"
  else
    printf 'ftp://%s' "$host"
  fi
}

ftp_rename_remote() {
  local from_path="$1"
  local to_path="$2"
  local base user pass
  base="$(ftp_base_url)"
  user="${GODADDY_FTP_USERNAME:?GODADDY_FTP_USERNAME required}"
  pass="${GODADDY_FTP_PASSWORD:?GODADDY_FTP_PASSWORD required}"
  echo "FTP rename: ${from_path} → ${to_path}"
  # Best-effort delete target dotfile (may not exist).
  curl -sS --ftp-pasv --user "${user}:${pass}" \
    --quote "DELE ${to_path}" \
    "${base}/" >/dev/null 2>&1 || true
  curl -sSf --ftp-pasv --user "${user}:${pass}" \
    --quote "RNFR ${from_path}" \
    --quote "RNTO ${to_path}" \
    "${base}/"
}

upload_file() {
  local local_path="$1"
  local remote_path="$2"
  local base user pass
  base="$(ftp_base_url)"
  user="${GODADDY_FTP_USERNAME:?GODADDY_FTP_USERNAME required}"
  pass="${GODADDY_FTP_PASSWORD:?GODADDY_FTP_PASSWORD required}"
  echo "FTP upload: ${local_path} → ${remote_path}"
  curl -sSf --ftp-pasv --ftp-create-dirs \
    -T "$local_path" \
    --user "${user}:${pass}" \
    "${base}/${remote_path}"
}

activate_via_ftp() {
  local renamed=0

  if ftp_rename_remote "htaccess-deploy.txt" ".htaccess"; then
    renamed=1
  elif [ -f "${DIST}/htaccess-deploy.txt" ]; then
    echo "::warning::FTP rename root htaccess failed — trying direct STOR"
    upload_file "${DIST}/htaccess-deploy.txt" ".htaccess"
    renamed=1
  else
    echo "::warning::htaccess-deploy.txt missing in ${DIST}/ and on server"
  fi

  for prefix in ${PREFIXES}; do
    if ftp_rename_remote "${prefix}/htaccess-nested.txt" "${prefix}/.htaccess"; then
      renamed=1
    elif [ -f "${DIST}/${prefix}/htaccess-nested.txt" ]; then
      echo "::warning::FTP rename ${prefix}/.htaccess failed — trying direct STOR"
      upload_file "${DIST}/${prefix}/htaccess-nested.txt" "${prefix}/.htaccess"
      renamed=1
    fi
  done

  if [ "$renamed" -eq 0 ]; then
    echo "::warning::SPA htaccess FTP activation did not rename or upload any files"
    return 1
  fi
  return 0
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

SSH_ACTIVATE="${GODADDY_SSH_ACTIVATE_ENABLED:-}"
if [ "$SSH_ACTIVATE" != "true" ] && [ "${GITHUB_ACTIONS:-}" = "true" ]; then
  SSH_ACTIVATE="false"
fi

if [ "$HAS_FTP" != true ] && [ "$HAS_SSH" != true ]; then
  echo "::warning::SPA_HTACCESS_ACTIVATE_SKIPPED — no SSH or FTP credentials"
  exit 0
fi

FTP_OK=false
if [ "$HAS_FTP" = true ]; then
  echo "Activating SPA htaccess via FTP rename (primary)…"
  set +e
  activate_via_ftp
  FTP_CODE=$?
  set -e
  if [ "$FTP_CODE" -eq 0 ]; then
    FTP_OK=true
  else
    echo "::warning::FTP htaccess activation returned exit ${FTP_CODE}"
  fi
fi

if [ "$HAS_SSH" = true ] && [ "$SSH_ACTIVATE" = "true" ]; then
  echo "Activating SPA htaccess via SSH backup…"
  set +e
  activate_via_ssh
  SSH_CODE=$?
  set -e
  if [ "$SSH_CODE" -ne 0 ]; then
    echo "::warning::SSH htaccess activation failed (exit ${SSH_CODE}) — GoDaddy shell may be disabled"
  fi
elif [ "$HAS_SSH" = true ]; then
  echo "Skipping SSH htaccess activation (GODADDY_SSH_ACTIVATE_ENABLED not true — FTP-only hosting)"
fi

echo "SPA htaccess activation step complete (ftp_ok=${FTP_OK})"

if [ "${VERIFY_SPA_AFTER_ACTIVATE:-true}" = "true" ]; then
  echo "Verifying SPA deep link after htaccess activation…"
  export SPA_VERIFY_ATTEMPTS="${SPA_VERIFY_ATTEMPTS:-10}"
  export SPA_VERIFY_SLEEP_MS="${SPA_VERIFY_SLEEP_MS:-12000}"
  if node scripts/site00-verify-spa-deep-link.mjs; then
    echo "SPA deep link verify PASS"
  else
    if [ "$FTP_OK" = true ]; then
      echo "::warning::SPA deep link verify failed after FTP activation — site may need a few minutes or manual htaccess rename"
    fi
    echo "::error::SPA_HTACCESS_ACTIVATE_FAILED — deep link still not serving SPA shell"
    echo "::error::Manual fix: cPanel File Manager → rename htaccess-deploy.txt → .htaccess and projects/htaccess-nested.txt → projects/.htaccess"
    exit 1
  fi
fi
