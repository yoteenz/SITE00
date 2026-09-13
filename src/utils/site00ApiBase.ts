/**
 * Resolve SITE 00 API origin for browser fetches.
 * Preview hosts (fsbw-dev, cloudflare tunnel) must use Railway — local vite /api is often stale.
 */
import {
  resolveSite00ClientApiBase,
  site00ClientApiUrl,
} from '../../shared/site00-studio-world-production/site00ClientApiBase.js';

export function resolveSite00ApiBase(): string {
  return resolveSite00ClientApiBase();
}

export function site00ApiUrl(path: string): string {
  return site00ClientApiUrl(path);
}
