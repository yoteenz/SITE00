import {
  buildAccessCredentialPublicUrl,
  formatAccessCredentialCodeDisplay,
  normalizeAccessCredentialCode,
  type Site00AccessCredentialPublicView,
} from './access-credentials';

export const SITE00_ACCESS_DEBUG_DEFAULT_CODE = '00-0001';

export type AccessCredentialDebugState =
  | 'recognized'
  | 'not_found'
  | 'closed'
  | 'inactive'
  | 'loading';

export function parseAccessCredentialDebugState(raw: string | null): AccessCredentialDebugState {
  switch (raw) {
    case 'not_found':
    case 'closed':
    case 'inactive':
    case 'loading':
      return raw;
    default:
      return 'recognized';
  }
}

export function buildAccessCredentialDebugMockView(
  code: string,
  state: AccessCredentialDebugState = 'recognized',
): Site00AccessCredentialPublicView | null {
  const normalized = normalizeAccessCredentialCode(code) ?? SITE00_ACCESS_DEBUG_DEFAULT_CODE;

  if (state === 'not_found' || state === 'loading') return null;

  const resolved =
    state === 'closed' ? 'revoked' : state === 'inactive' ? 'inactive' : 'valid';

  return {
    credentialCode: normalized,
    credentialCodeDisplay: formatAccessCredentialCodeDisplay(normalized),
    credentialType: 'FOUNDER_ACCESS',
    status: state === 'inactive' ? 'INACTIVE' : state === 'closed' ? 'REVOKED' : 'ACTIVE',
    recipientName: state === 'recognized' ? 'Founder' : null,
    resolved,
  };
}

export function buildAccessCredentialDebugUrl(options?: {
  state?: AccessCredentialDebugState;
  code?: string;
  staticAuthorized?: boolean;
  layout?: 'desktop' | 'mobile';
}): string {
  const params = new URLSearchParams();
  if (options?.state && options.state !== 'recognized') params.set('state', options.state);
  if (options?.code && options.code !== SITE00_ACCESS_DEBUG_DEFAULT_CODE) {
    params.set('code', options.code);
  }
  if (options?.staticAuthorized) params.set('static', '1');
  if (options?.layout === 'mobile') params.set('site00MobileLayout', '1');
  const query = params.toString();
  return query ? `/access/debug?${query}` : '/access/debug';
}

export function buildAccessCredentialCanonicalAuditUrl(code: string = SITE00_ACCESS_DEBUG_DEFAULT_CODE): string {
  return buildAccessCredentialPublicUrl(code);
}
