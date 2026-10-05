/** Canonical OAuth callback path — owner must register this exact URL in Meta developer app */

export const META_OAUTH_CALLBACK_PATH = '/api/admin/site00-evolve/oauth/callback';

export function getApiBaseUrl(): string {
  return (
    process.env.SITE00_API_BASE?.trim() ||
    process.env.VITE_API_BASE?.trim() ||
    process.env.API_BASE_URL?.trim() ||
    'https://api.site00.com'
  ).replace(/\/$/, '');
}

export function getCanonicalMetaOAuthCallbackUrl(): string {
  return `${getApiBaseUrl()}${META_OAUTH_CALLBACK_PATH}`;
}

export function getPilotReturnUrl(orgSlug = 'ndxbook'): string {
  const adminBase = process.env.SITE00_ADMIN_BASE?.trim() || process.env.VITE_SITE00_CANONICAL_ORIGIN?.trim() || 'https://site00.com';
  return `${adminBase.replace(/\/$/, '')}/admin/site00/orchestration/${orgSlug}/evolve/pilot`;
}
