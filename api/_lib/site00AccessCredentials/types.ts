/** SITE 00 access credential — code normalization and URL helpers. */

export const SITE00_ACCESS_CREDENTIAL_CODE_PATTERN = /^00-\d{4}$/i;

export type Site00AccessCredentialStatus = 'ACTIVE' | 'INACTIVE' | 'REVOKED' | 'EXPIRED';

export type Site00AccessCredentialType =
  | 'FOUNDER_ACCESS'
  | 'CLIENT_ACCESS'
  | 'PARTNER_ACCESS'
  | 'VIP_ACCESS';

export type Site00AccessCredentialEventType =
  | 'SCANNED'
  | 'ENTERED_SITE'
  | 'ACCOUNT_ASSOCIATED'
  | 'PROJECT_STARTED'
  | 'ACTIVATED'
  | 'REVOKED'
  | 'CREATED';

/** Normalize URL param to canonical hyphen form: 00-0001 */
export function normalizeAccessCredentialCode(raw: string): string | null {
  const trimmed = raw.trim().toUpperCase();
  const normalized = trimmed.replace(/[—–−]/g, '-').replace(/\s+/g, '');
  if (!SITE00_ACCESS_CREDENTIAL_CODE_PATTERN.test(normalized)) return null;
  return normalized.toLowerCase();
}

/** Display form with em dash: 00—0001 */
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

export function buildAccessCredentialPublicUrl(code: string, origin?: string): string {
  const base =
    origin?.replace(/\/$/, '') ||
    (typeof process !== 'undefined' ? process.env.VITE_SITE00_CANONICAL_ORIGIN : undefined) ||
    'https://site00.com';
  return `${base}${buildAccessCredentialPublicPath(code)}`;
}

export type Site00AccessCredentialPublicView = {
  credentialCode: string;
  credentialCodeDisplay: string;
  credentialType: Site00AccessCredentialType;
  status: Site00AccessCredentialStatus;
  recipientName?: string | null;
  resolved: 'valid' | 'not_found' | 'revoked' | 'inactive' | 'expired';
};

export type Site00AccessCredentialAdminRow = {
  id: string;
  credential_code: string;
  credential_type: Site00AccessCredentialType;
  status: Site00AccessCredentialStatus;
  issued_at: string | null;
  activated_at: string | null;
  first_scanned_at: string | null;
  last_scanned_at: string | null;
  scan_count: number;
  recipient_name: string | null;
  recipient_email: string | null;
  recipient_company: string | null;
  notes: string | null;
  assigned_user_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export function resolvePublicCredentialView(row: {
  credential_code: string;
  credential_type: string;
  status: string;
  recipient_name?: string | null;
} | null): Site00AccessCredentialPublicView {
  if (!row) {
    return {
      credentialCode: '',
      credentialCodeDisplay: '',
      credentialType: 'FOUNDER_ACCESS',
      status: 'INACTIVE',
      resolved: 'not_found',
    };
  }

  const status = row.status as Site00AccessCredentialStatus;
  let resolved: Site00AccessCredentialPublicView['resolved'] = 'valid';
  if (status === 'REVOKED') resolved = 'revoked';
  else if (status === 'EXPIRED') resolved = 'expired';
  else if (status === 'INACTIVE') resolved = 'inactive';
  else if (status === 'ACTIVE') resolved = 'valid';

  return {
    credentialCode: row.credential_code,
    credentialCodeDisplay: formatAccessCredentialCodeDisplay(row.credential_code),
    credentialType: row.credential_type as Site00AccessCredentialType,
    status,
    recipientName: row.recipient_name?.trim() || null,
    resolved,
  };
}
