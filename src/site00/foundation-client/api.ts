/**
 * Digital Foundation client — thin wrappers over Composer's public artifact API
 * (`api/site00/digital-foundation-artifact.ts`). No new endpoints; no pricing or lifecycle logic here.
 */
import type { ClientDigitalFoundationPayload } from '../../../shared/site00-digital-foundation/clientProjection.js';
import type {
  DigitalFoundationCommercialConfig,
  DigitalFoundationIntake,
  DigitalFoundationQuote,
  IntakeNeedFlag,
} from '../../../shared/site00-digital-foundation/types.js';
import { site00ApiUrl } from '../../utils/site00ApiBase';
import { DfApiError } from './dfApiError';
import { parseClientDigitalFoundationPayload } from './validateClientPayload';

export { DfApiError };

const ENDPOINT_PATH = '/api/site00/digital-foundation-artifact';
const SESSION_PATH = '/api/site00/digital-foundation-session';

function sessionApiUrl(query: string): string {
  const q = query.startsWith('?') ? query : `?${query}`;
  return site00ApiUrl(`${SESSION_PATH}${q}`);
}

function artifactApiUrl(query: string): string {
  const q = query.startsWith('?') ? query : `?${query}`;
  return site00ApiUrl(`${ENDPOINT_PATH}${q}`);
}

export type ClientCatalogEntry = {
  addon_id: DigitalFoundationQuote['selected_addons'][number]['addon_id'];
  label: string;
  client_description: string;
  price_minor_units: number;
  currency: string;
  requires_manual_review: boolean;
  quantity_unit: boolean;
  dependencies: string[];
};

export type ClientCatalog = {
  catalog: ClientCatalogEntry[];
  config: DigitalFoundationCommercialConfig;
};

function isJsonResponse(res: Response): boolean {
  const ct = (res.headers.get('content-type') ?? '').toLowerCase();
  return ct.includes('application/json') || ct.includes('+json');
}

async function readJson(res: Response): Promise<Record<string, unknown>> {
  if (!isJsonResponse(res)) {
    throw new DfApiError(0, 'INVALID_API_RESPONSE');
  }
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    throw new DfApiError(0, 'INVALID_API_RESPONSE');
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { credentials: init?.credentials ?? 'same-origin', ...init });
  } catch {
    throw new DfApiError(0, 'NETWORK');
  }
  const json = await readJson(res);
  if (!res.ok) throw new DfApiError(res.status, String(json.error ?? `HTTP_${res.status}`));
  return json as T;
}

function post<T>(token: string, action: string, body: Record<string, unknown> = {}): Promise<T> {
  return request<T>(artifactApiUrl(`action=${encodeURIComponent(action)}`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, token }),
  });
}

export function fetchPayload(token: string): Promise<ClientDigitalFoundationPayload> {
  return request<unknown>(
    artifactApiUrl(`action=payload&token=${encodeURIComponent(token)}`),
  ).then(parseClientDigitalFoundationPayload);
}

export function fetchCatalog(): Promise<ClientCatalog> {
  return request<ClientCatalog>(artifactApiUrl('action=catalog'));
}

export function postDigitalFoundationArtifact<T>(
  action: string,
  body: Record<string, unknown>,
): Promise<T> {
  return request<T>(artifactApiUrl(`action=${encodeURIComponent(action)}`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/**
 * Saves intake fields. The handler builds its `payload` before applying the update, so callers re-read the
 * payload afterwards instead of trusting the response body (reported as a Composer contract gap).
 */
export async function saveIntake(
  token: string,
  intake: Partial<DigitalFoundationIntake>,
  needs: IntakeNeedFlag[] | undefined,
  markComplete: boolean,
): Promise<void> {
  await post(token, 'update-intake', { intake, needs, markComplete });
}

export function updateQuote(
  token: string,
  selections: { addon_id: string; quantity: number }[],
): Promise<{ quote: DigitalFoundationQuote; payload: ClientDigitalFoundationPayload }> {
  return post(token, 'update-quote', { selections });
}

export function removeAddon(
  token: string,
  addonId: string,
): Promise<{ quote: DigitalFoundationQuote; payload: ClientDigitalFoundationPayload }> {
  return post(token, 'remove-addon', { addon_id: addonId });
}

export function acceptQuote(token: string, disclosures: readonly string[]): Promise<ClientDigitalFoundationPayload> {
  return post(token, 'accept-quote', { disclosures: [...disclosures] });
}

export function startCheckout(
  token: string,
  origin: string,
): Promise<{
  checkout: { checkout_url: string; session_id: string; simulated?: boolean };
  payload: ClientDigitalFoundationPayload;
}> {
  return post(token, 'start-checkout', {
    origin,
    success_url: `${origin}/foundation/${encodeURIComponent(token)}?checkout=return`,
    cancel_url: `${origin}/foundation/${encodeURIComponent(token)}?checkout=cancel`,
  });
}

export function completeClientAction(
  token: string,
  requestId: string,
  response: { decision: 'APPROVE' | 'REQUEST_CHANGE'; notes?: string; target_version?: number },
): Promise<ClientDigitalFoundationPayload> {
  return post(token, 'complete-client-action', { request_id: requestId, response });
}

export function captureBuildInterest(
  token: string,
  interest: 'INTERESTED' | 'SAVED_FOR_LATER',
): Promise<unknown> {
  return post(token, 'build-interest', { interest });
}

export function updateCommunicationPreferences(
  token: string,
  preferences: ClientDigitalFoundationPayload['communication_preferences'],
): Promise<ClientDigitalFoundationPayload> {
  return post(token, 'update-communication-preferences', { preferences });
}

export function establishDfSession(token: string): Promise<{ ok: boolean; payload: ClientDigitalFoundationPayload }> {
  return request(sessionApiUrl('action=establish-session'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, action: 'establish-session' }),
  });
}

export function fetchSessionPayload(): Promise<ClientDigitalFoundationPayload> {
  return request(sessionApiUrl('action=session-payload'), { credentials: 'include' }).then(parseClientDigitalFoundationPayload);
}

export function requestDfReentry(email: string): Promise<{ ok: boolean; dev_code?: string }> {
  return request(sessionApiUrl('action=request-reentry'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'request-reentry', email }),
  });
}

export function verifyDfReentry(email: string, code: string): Promise<{ ok: boolean; payload: ClientDigitalFoundationPayload }> {
  return request(sessionApiUrl('action=verify-reentry'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'verify-reentry', email, code }),
  });
}

export function signOutDfSession(): Promise<{ ok: boolean }> {
  return request(sessionApiUrl('action=sign-out-session'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'sign-out-session' }),
  });
}
