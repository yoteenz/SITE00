/**
 * SITE 00 — thin client for the canonical Identity + Builder intake API
 * (api/site00/intakes.ts, api/site00/intake-access.ts).
 */
import { apiFetch } from '../../utils/api';
import type { IntakeDetail, IntakeSummary, IntakeType } from '../../../shared/site00-intakes/types';

export type IntakeApiError = { error: string; reason?: string };

async function unwrap<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => ({}))) as T & IntakeApiError;
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json;
}

export async function startIntake(params: {
  intakeType: IntakeType;
  domainLabel: string;
  sourceRoute?: string;
  draftPayload?: Record<string, unknown>;
}): Promise<IntakeDetail> {
  const res = await apiFetch('/api/site00/intakes?action=start', { method: 'POST', body: params });
  const json = await unwrap<{ intake: IntakeDetail }>(res);
  return json.intake;
}

export async function autosaveIntake(params: {
  intakeType: IntakeType;
  id: string;
  currentStep?: string | null;
  totalSteps?: number;
  draftPayload?: Record<string, unknown>;
  email?: string;
  guestToken?: string | null;
}): Promise<IntakeDetail> {
  const res = await apiFetch('/api/site00/intakes?action=update', { method: 'POST', body: params });
  const json = await unwrap<{ intake: IntakeDetail }>(res);
  return json.intake;
}

export async function submitIntake(params: {
  intakeType: IntakeType;
  id: string;
  guestToken?: string | null;
}): Promise<IntakeDetail> {
  const res = await apiFetch('/api/site00/intakes?action=submit', { method: 'POST', body: params });
  const json = await unwrap<{ intake: IntakeDetail }>(res);
  return json.intake;
}

export async function requestGuestAccess(params: {
  intakeType: IntakeType;
  id: string;
  email: string;
}): Promise<{ intake: IntakeDetail; accessToken: string; expiresAt: string }> {
  const res = await apiFetch('/api/site00/intakes?action=send-access', { method: 'POST', body: params });
  return unwrap(res);
}

export async function claimGuestIntakes(): Promise<IntakeDetail[]> {
  const res = await apiFetch('/api/site00/intakes?action=claim', { method: 'POST', body: {} });
  const json = await unwrap<{ claimed: IntakeDetail[] }>(res);
  return json.claimed;
}

export async function listMyIntakes(): Promise<IntakeSummary[]> {
  const res = await apiFetch('/api/site00/intakes?action=list');
  const json = await unwrap<{ intakes: IntakeSummary[] }>(res);
  return json.intakes;
}

export async function getIntake(params: {
  intakeType: IntakeType;
  id: string;
  guestToken?: string | null;
}): Promise<IntakeDetail> {
  const query = new URLSearchParams({ action: 'get', intakeType: params.intakeType, id: params.id });
  if (params.guestToken) query.set('guestToken', params.guestToken);
  const res = await apiFetch(`/api/site00/intakes?${query.toString()}`);
  const json = await unwrap<{ intake: IntakeDetail }>(res);
  return json.intake;
}

export async function resolveGuestAccessToken(token: string): Promise<IntakeDetail> {
  const res = await apiFetch(`/api/site00/intake-access?token=${encodeURIComponent(token)}`);
  const json = await unwrap<{ intake: IntakeDetail }>(res);
  return json.intake;
}
