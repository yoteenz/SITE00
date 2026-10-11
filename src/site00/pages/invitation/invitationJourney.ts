/**
 * INVITATION 001 — client journey logic for `/invite/:code`.
 * Pure functions + thin fetch wrappers so the five-stage activation is testable without a DOM.
 */
import type {
  InvitationEntryPresentation,
  InvitationResolutionState,
} from '../../../../shared/site00-invitation-system/contracts/entryPresentation.js';
import { site00ApiUrl } from '../../../utils/site00ApiBase';

export type VerificationDelivery = 'DEVELOPMENT_INLINE' | 'PENDING_IDNTY';

export type InvitationResolveResponse = {
  presentation: InvitationEntryPresentation;
  visit_id: string | null;
  resolution: InvitationResolutionState;
  valid: boolean;
  verification_delivery?: VerificationDelivery;
  persistence?: 'IN_MEMORY' | 'PERSISTENT';
};

export type BeginActivationResponse = {
  activation_id: string;
  verification_required: true;
  verification_delivery?: VerificationDelivery;
  development_verification_code?: string | null;
  presentation: InvitationEntryPresentation;
};

export type CompleteActivationResponse = {
  foundation_route: string;
  attribution_id?: string;
  presentation: InvitationEntryPresentation;
};

export type FoundationPayloadSummary = {
  artifact: {
    state: string;
    intake_state: string;
    payment_state: string;
    completion_state: string;
    build_interest?: string;
  };
};

export type FoundationCatalogConfig = {
  base_price_minor: number;
  base_currency: string;
  base_min_business_days: number;
  base_max_business_days: number;
  third_party_cost_notice: string;
};

export const INVITATION_STAGES = [
  { n: '01', label: 'SCAN THE INVITATION' },
  { n: '02', label: 'WELCOME TO YOUR NEXT ADDRESS' },
  { n: '03', label: 'ACTIVATE YOUR FOUNDATION' },
  { n: '04', label: 'COMPLETE YOUR DIGITAL FOUNDATION' },
  { n: '05', label: 'DISCOVER WHAT COMES NEXT' },
] as const;

export type InvitationStageIndex = 0 | 1 | 2 | 3 | 4;

/** What the visitor may do with this code. Unknown and revoked share one treatment so codes cannot be enumerated. */
export type InvitationAvailability = 'OPEN' | 'UNAVAILABLE' | 'EXPIRED' | 'PAUSED';

export function invitationAvailability(resolution: InvitationResolutionState): InvitationAvailability {
  switch (resolution) {
    case 'VALID':
    case 'RETURNING_USER':
    case 'EXISTING_FOUNDATION':
    case 'EXISTING_BLDR':
    case 'ALREADY_ACTIVATED':
    case 'VERIFICATION_REQUIRED':
      return 'OPEN';
    case 'EXPIRED':
      return 'EXPIRED';
    case 'PAUSED':
      return 'PAUSED';
    default:
      return 'UNAVAILABLE';
  }
}

export type FoundationProgress = 'NOT_STARTED' | 'IN_PROGRESS' | 'AWAITING_PAYMENT' | 'IN_PRODUCTION' | 'COMPLETE';

export function foundationProgress(payload: FoundationPayloadSummary): FoundationProgress {
  const a = payload.artifact;
  if (a.completion_state === 'COMPLETE' || a.state === 'COMPLETE' || a.state === 'BUILD_OPPORTUNITY') return 'COMPLETE';
  if (a.payment_state === 'PAID') return 'IN_PRODUCTION';
  if (a.state === 'AWAITING_PAYMENT' || a.payment_state === 'CHECKOUT_PENDING' || a.state === 'AWAITING_ACCEPTANCE' || a.state === 'QUOTE_READY') {
    return 'AWAITING_PAYMENT';
  }
  if (a.intake_state !== 'NOT_STARTED') return 'IN_PROGRESS';
  return 'NOT_STARTED';
}

export const FOUNDATION_PROGRESS_COPY: Record<
  FoundationProgress,
  { headline: string; detail: string; action: string; stage: InvitationStageIndex }
> = {
  NOT_STARTED: {
    headline: 'YOUR FOUNDATION IS OPEN.',
    detail: 'Nothing has been entered yet. Pick it up whenever you are ready.',
    action: 'BEGIN YOUR FOUNDATION',
    stage: 3,
  },
  IN_PROGRESS: {
    headline: 'YOUR FOUNDATION IS IN PROGRESS.',
    detail: 'Continue where you left off.',
    action: 'CONTINUE YOUR FOUNDATION',
    stage: 3,
  },
  AWAITING_PAYMENT: {
    headline: 'YOUR SCOPE IS READY.',
    detail: 'Review your scope and price before anything is charged.',
    action: 'REVIEW YOUR SCOPE',
    stage: 3,
  },
  IN_PRODUCTION: {
    headline: 'YOUR FOUNDATION IS BEING BUILT.',
    detail: 'Follow its progress in your workspace.',
    action: 'VIEW YOUR FOUNDATION',
    stage: 3,
  },
  COMPLETE: {
    headline: 'YOUR FOUNDATION IS COMPLETE.',
    detail: 'Your domain, email, and security are in place. When you are ready, BLDR is next.',
    action: 'VIEW YOUR FOUNDATION',
    stage: 4,
  },
};

export function formatMinor(minor: number, currency: string): string {
  const major = minor / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(major) ? 0 : 2,
  }).format(major);
}

export function isPlausibleEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/** Only a local Foundation route may be followed. Guards against a stored value pointing off-site. */
export function isFoundationRoute(route: unknown): route is string {
  return typeof route === 'string' && /^\/foundation\/[A-Za-z0-9_-]{8,}$/.test(route);
}

export function foundationTokenFromRoute(route: string): string {
  return route.slice('/foundation/'.length);
}

/* ── Device memory ──────────────────────────────────────────────────────────
 * Stores only the visitor's own Foundation route on their own device, never the email, the activation id,
 * or a verification code. Another person scanning the same shared QR has no record and starts fresh.
 */

export type InvitationDeviceRecord = { foundation_route: string; linked_at: string };

const deviceKey = (code: string) => `site00.invitation.v1.${code}`;

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function safeStorage(storage?: StorageLike | null): StorageLike | null {
  if (storage) return storage;
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function readInvitationDeviceRecord(code: string, storage?: StorageLike | null): InvitationDeviceRecord | null {
  const s = safeStorage(storage);
  if (!s) return null;
  try {
    const raw = s.getItem(deviceKey(code));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<InvitationDeviceRecord>;
    if (!isFoundationRoute(parsed.foundation_route)) return null;
    return { foundation_route: parsed.foundation_route, linked_at: String(parsed.linked_at ?? '') };
  } catch {
    return null;
  }
}

export function writeInvitationDeviceRecord(code: string, foundationRoute: string, storage?: StorageLike | null): void {
  const s = safeStorage(storage);
  if (!s || !isFoundationRoute(foundationRoute)) return;
  try {
    s.setItem(deviceKey(code), JSON.stringify({ foundation_route: foundationRoute, linked_at: new Date().toISOString() }));
  } catch {
    /* storage full or blocked — the visitor can still continue from the link on screen */
  }
}

export function clearInvitationDeviceRecord(code: string, storage?: StorageLike | null): void {
  const s = safeStorage(storage);
  try {
    s?.removeItem(deviceKey(code));
  } catch {
    /* ignore */
  }
}

/* ── Network ───────────────────────────────────────────────────────────── */

export type InvitationFailureKind = 'NETWORK' | 'SERVER' | 'UNAVAILABLE' | 'VERIFICATION' | 'SESSION_LOST' | 'INPUT';

export class InvitationRequestError extends Error {
  constructor(public kind: InvitationFailureKind, message: string, public status: number | null = null) {
    super(message);
  }
}

export function classifyFailure(status: number, message: string): InvitationFailureKind {
  if (status >= 500) return 'SERVER';
  if (/activation not found|visit not valid/i.test(message)) return 'SESSION_LOST';
  if (status === 403) return 'VERIFICATION';
  if (/invitation not available/i.test(message)) return 'UNAVAILABLE';
  if (status === 404) return 'SESSION_LOST';
  return 'INPUT';
}

/** Static hosting (GoDaddy) has no /api; site00ApiUrl resolves Railway in production and same-origin in dev. */
async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(site00ApiUrl(path), init);
  } catch {
    throw new InvitationRequestError('NETWORK', 'Network unavailable');
  }
  let json: Record<string, unknown> = {};
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    if (!res.ok) throw new InvitationRequestError('SERVER', 'Unexpected response', res.status);
  }
  if (!res.ok) {
    const message = typeof json.error === 'string' ? json.error : 'Request failed';
    throw new InvitationRequestError(classifyFailure(res.status, message), message, res.status);
  }
  return json as T;
}

export function resolveInvitation(code: string): Promise<InvitationResolveResponse> {
  return requestJson(`/api/site00/invitation?action=resolve&code=${encodeURIComponent(code)}`);
}

function postInvitation<T>(code: string, action: string, body: Record<string, unknown>): Promise<T> {
  return requestJson(`/api/site00/invitation?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, code, action }),
  });
}

export function beginActivation(code: string, visitId: string, email: string): Promise<BeginActivationResponse> {
  return postInvitation(code, 'begin-activation', { visit_id: visitId, contact_email: email.trim() });
}

export function completeActivation(code: string, activationId: string, secret: string): Promise<CompleteActivationResponse> {
  return postInvitation(code, 'complete-activation', { activation_id: activationId, verification_secret: secret.trim() });
}

export function loadFoundationPayload(foundationRoute: string): Promise<FoundationPayloadSummary> {
  const token = foundationTokenFromRoute(foundationRoute);
  return requestJson(`/api/site00/digital-foundation-artifact?action=payload&token=${encodeURIComponent(token)}`);
}

export async function loadFoundationCatalogConfig(): Promise<FoundationCatalogConfig | null> {
  try {
    const json = await requestJson<{ config?: FoundationCatalogConfig }>('/api/site00/digital-foundation-artifact?action=catalog');
    return json.config ?? null;
  } catch {
    return null;
  }
}
