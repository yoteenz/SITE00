/** Resolve SITE 00 cloud preview tunnel URL for operator dashboards. */

import { existsSync, readFileSync } from 'node:fs';

const PREVIEW_URL_FILE = '/tmp/site00-cloud-preview-url.txt';

export type PreviewTunnelInfo = {
  url: string | null;
  hostname: string | null;
  source: 'env' | 'file' | 'unavailable';
  label: string;
};

function normalizePreviewUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return trimmed.includes('://') ? trimmed.replace(/\/$/, '') : `https://${trimmed.replace(/\/$/, '')}`;
}

function hostnameFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/** Canonical preview tunnel URL — env hostname preferred, then ephemeral file written by cloud agent setup. */
export function resolvePreviewTunnelUrl(): PreviewTunnelInfo {
  const label = 'SITE 00 CLOUD PREVIEW';

  const envHostname = (
    process.env.SITE00_CLOUDFLARE_TUNNEL_HOSTNAME ||
    process.env.CLOUDFLARE_TUNNEL_HOSTNAME ||
    ''
  ).trim();

  if (envHostname) {
    const url = normalizePreviewUrl(envHostname);
    if (url) {
      return { url, hostname: hostnameFromUrl(url), source: 'env', label };
    }
  }

  try {
    if (existsSync(PREVIEW_URL_FILE)) {
      const url = normalizePreviewUrl(readFileSync(PREVIEW_URL_FILE, 'utf8'));
      if (url) {
        return { url, hostname: hostnameFromUrl(url), source: 'file', label };
      }
    }
  } catch {
    // ignore unreadable preview file
  }

  return { url: null, hostname: null, source: 'unavailable', label };
}
