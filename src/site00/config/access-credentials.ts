/** SITE 00 access credential — client-safe helpers (mirrors api/_lib types). */

export const SITE00_ACCESS_CREDENTIAL_CODE_PATTERN = /^00-\d{4}$/i;

export type Site00AccessCredentialStatus = 'ACTIVE' | 'INACTIVE' | 'REVOKED' | 'EXPIRED';

export type Site00AccessCredentialType =
  | 'FOUNDER_ACCESS'
  | 'CLIENT_ACCESS'
  | 'PARTNER_ACCESS'
  | 'VIP_ACCESS';

export type Site00AccessCredentialPublicView = {
  credentialCode: string;
  credentialCodeDisplay: string;
  credentialType: Site00AccessCredentialType;
  status: Site00AccessCredentialStatus;
  recipientName?: string | null;
  resolved: 'valid' | 'not_found' | 'revoked' | 'inactive' | 'expired';
};

export function normalizeAccessCredentialCode(raw: string): string | null {
  const trimmed = raw.trim().toUpperCase();
  const normalized = trimmed.replace(/[—–−]/g, '-').replace(/\s+/g, '');
  if (!SITE00_ACCESS_CREDENTIAL_CODE_PATTERN.test(normalized)) return null;
  return normalized.toLowerCase();
}

export function formatAccessCredentialCodeDisplay(code: string): string {
  const normalized = normalizeAccessCredentialCode(code);
  if (!normalized) return code.toUpperCase();
  const [, serial] = normalized.split('-');
  return `00—${serial}`;
}

export function buildAccessCredentialPublicPath(code: string): string {
  const normalized = normalizeAccessCredentialCode(code);
  return normalized ? `/access/${normalized}` : '/access';
}

export function buildAccessCredentialPublicUrl(code: string): string {
  const origin =
    (import.meta.env.VITE_SITE00_CANONICAL_ORIGIN as string | undefined)?.replace(/\/$/, '') ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://site00.com');
  return `${origin}${buildAccessCredentialPublicPath(code)}`;
}
