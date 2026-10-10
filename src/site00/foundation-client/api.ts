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

const ENDPOINT = '/api/site00/digital-foundation-artifact';

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

/** `status` 0 means the request never reached the server (offline / network). */
export class DfApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

async function readJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new DfApiError(0, 'NETWORK');
  }
  const json = await readJson(res);
  if (!res.ok) throw new DfApiError(res.status, String(json.error ?? `HTTP_${res.status}`));
  return json as T;
}

function post<T>(token: string, action: string, body: Record<string, unknown> = {}): Promise<T> {
  return request<T>(`${ENDPOINT}?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, token }),
  });
}

export function fetchPayload(token: string): Promise<ClientDigitalFoundationPayload> {
  return request(`${ENDPOINT}?action=payload&token=${encodeURIComponent(token)}`);
}

export function fetchCatalog(): Promise<ClientCatalog> {
  return request(`${ENDPOINT}?action=catalog`);
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

export function completeClientAction(
  token: string,
  requestId: string,
  response: Record<string, unknown>,
): Promise<ClientDigitalFoundationPayload> {
  return post(token, 'complete-client-action', { request_id: requestId, response });
}

export function updateCommunicationPreferences(
  token: string,
  preferences: { marketing_opt_in: boolean; project_operations: boolean; educational: boolean },
): Promise<ClientDigitalFoundationPayload> {
  return post(token, 'update-communication-preferences', { preferences });
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
