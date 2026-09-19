/**
 * P0.VR.8 — Resolve live/preview base URL per project.
 */

import { PROJECT_LIVE_BASE_URLS } from './constants.js';

export function resolveProjectLiveBaseUrl(projectId: string, override?: string | null): string {
  if (override) return override.replace(/\/$/, '');
  return (PROJECT_LIVE_BASE_URLS[projectId] ?? 'https://site00.com').replace(/\/$/, '');
}

export function buildProjectPageUrl(projectId: string, route: string, baseUrl?: string | null): string {
  const base = resolveProjectLiveBaseUrl(projectId, baseUrl);
  const path = route.startsWith('/') ? route : `/${route}`;
  return `${base}${path}`;
}
