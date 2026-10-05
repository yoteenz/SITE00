import { site00ClientApiUrl } from '../../site00ClientApiBase.js';

const FORENSIC_API_PATH = '/api/site00/twin-v3-forensic-ui-blueprint';

export function isSite00PreviewHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host.includes('fsbw-dev.com') ||
    host.endsWith('.trycloudflare.com') ||
    host === 'localhost' ||
    host === '127.0.0.1'
  );
}

/** Preview tunnel serves Vite local API; production uses api.site00.com (try both when needed). */
export function listForensicUiBlueprintApiPostUrls(apiBaseOverride?: string): string[] {
  const urls: string[] = [];
  if (apiBaseOverride?.trim()) {
    urls.push(`${apiBaseOverride.replace(/\/$/, '')}${FORENSIC_API_PATH}`);
    return urls;
  }
  if (typeof window !== 'undefined') {
    if (isSite00PreviewHost(window.location.hostname)) {
      urls.push(`${window.location.origin.replace(/\/$/, '')}${FORENSIC_API_PATH}`);
    }
  }
  const production = site00ClientApiUrl(FORENSIC_API_PATH);
  if (!urls.includes(production)) urls.push(production);
  return urls;
}
