/**
 * FNDATN-01 personalization and eligibility contracts.
 *
 * Every value comes from the existing Digital Foundation artifact payload. When a required value is
 * missing the email is ineligible; nothing is defaulted, invented or hardcoded (no $500, no sample
 * dates, no sample references).
 */
import { findAddon } from '../../site00-digital-foundation/addonCatalog.js';
import { digitalFoundationClientIntakePath, digitalFoundationClientPath } from '../../site00-digital-foundation/clientRoutes.js';
import type {
  ArtifactEvent,
  ArtifactEventType,
  DigitalFoundationArtifactPayload,
  DigitalFoundationQuote,
  ProjectStageCode,
} from '../../site00-digital-foundation/types.js';
import { FNDATN01_REMINDER_POLICY, type Fndatn01EmailId } from './pack.js';

export type Fndatn01Context = {
  now: Date;
  /** Absolute https origin for client links, e.g. https://site00.com. */
  siteOrigin: string;
  timeZone: string;
  timeZoneLabel: string;
};

export type Eligibility = { eligible: boolean; reasons: string[] };

export type Common = {
  firstName: string | null;
  clientName: string | null;
  service: string;
  foundationUrl: string;
  intakeUrl: string;
};

export type ScopeItem = { key: string; label: string; detail: string };

/** Base Digital Foundation scope as written in the founder authority (mirrors recommendationEngine site00_handles). */
export const FNDATN01_BASE_SCOPE: readonly ScopeItem[] = [
  { key: 'domain', label: 'DOMAIN', detail: 'CONSULTATION, REGISTRATION, AND CONNECTION.' },
  { key: 'email', label: 'EMAIL SETUP', detail: 'ONE MAILBOX + ALIASES, PROVIDER CONFIGURATION, AND SIGNATURE.' },
  { key: 'security', label: 'SECURITY', detail: 'MX, SPF, DKIM, DMARC SETUP AND SEND/RECEIVE TESTS.' },
  { key: 'device', label: 'DEVICE SETUP', detail: 'ONE DEVICE CONFIGURED AND VERIFIED.' },
  { key: 'records', label: 'RECORDS', detail: 'OWNERSHIP RECORD AND RENEWAL ACCESS VERIFICATION.' },
];

export type AddonLine = { label: string; quantity: number };

export type Data01 = Common & { status: string; access: string };
export type Data02 = Common & { status: string; receivedAt: string; reference: string };
export type Data03 = Common & {
  recommendation: string;
  quoteAmount: string;
  validUntil: string;
  addons: AddonLine[];
  scope: readonly ScopeItem[];
};
export type Data04 = Common & {
  amount: string;
  paidAt: string;
  reference: string;
  method: string | null;
  status: string;
  activation: 'active' | 'pending';
};
export type CompletionItem = ScopeItem & { verified: boolean; value: string | null };
export type Data05 = Common & { items: CompletionItem[]; deliveredAt: string | null };
export type ProgressStep = { key: string; label: string; state: 'complete' | 'in_progress' | 'pending'; note: string };
export type Data06 = Common & { steps: ProgressStep[]; savedAt: string };
export type Data07 = Common & {
  quoteAmount: string;
  issuedAt: string;
  validUntil: string;
  status: string;
  remaining: { days: number; hours: number; minutes: number };
  asOf: string;
  addons: AddonLine[];
  scope: readonly ScopeItem[];
};

export type Fndatn01DataMap = { '01': Data01; '02': Data02; '03': Data03; '04': Data04; '05': Data05; '06': Data06; '07': Data07 };

export type Derived<K extends Fndatn01EmailId> = { eligibility: Eligibility; data: Fndatn01DataMap[K] | null };

// --------------------------------------------------------------------------------------------

function assertContext(ctx: Fndatn01Context) {
  if (!/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(ctx.siteOrigin)) throw new Error('FNDATN-01 siteOrigin must be an absolute https origin');
  if (Number.isNaN(ctx.now.getTime())) throw new Error('FNDATN-01 context.now is invalid');
}

function firstEvent(payload: DigitalFoundationArtifactPayload, type: ArtifactEventType): ArtifactEvent | undefined {
  return payload.events.filter((e) => e.event_type === type).sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
}

function lastEvent(payload: DigitalFoundationArtifactPayload, type: ArtifactEventType): ArtifactEvent | undefined {
  return payload.events.filter((e) => e.event_type === type).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
}

function validDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(iso: string, ctx: Fndatn01Context): string {
  const d = validDate(iso);
  if (!d) throw new Error(`FNDATN-01 invalid date ${iso}`);
  return new Intl.DateTimeFormat('en-US', { timeZone: ctx.timeZone, month: 'short', day: 'numeric', year: 'numeric' }).format(d).toUpperCase();
}

export function formatDateTime(iso: string, ctx: Fndatn01Context): string {
  const d = validDate(iso);
  if (!d) throw new Error(`FNDATN-01 invalid date ${iso}`);
  const time = new Intl.DateTimeFormat('en-US', { timeZone: ctx.timeZone, hour: 'numeric', minute: '2-digit' }).format(d).toUpperCase();
  return `${formatDate(iso, ctx)} · ${time} ${ctx.timeZoneLabel}`;
}

export function formatMoney(minor: number, currency: string): string {
  if (!Number.isFinite(minor) || !/^[A-Z]{3}$/.test(currency)) throw new Error('FNDATN-01 invalid money');
  const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(minor / 100);
  return `${amount} ${currency}`;
}

function common(payload: DigitalFoundationArtifactPayload, ctx: Fndatn01Context): Common {
  const name = (payload.lead.contact_name ?? payload.artifact.intake.contact_name ?? '').trim();
  const business = (payload.lead.business_name ?? payload.artifact.intake.business_name ?? '').trim();
  const token = payload.artifact.public_token;
  return {
    firstName: name ? name.split(/\s+/)[0].toUpperCase() : null,
    clientName: (name || business || '').toUpperCase() || null,
    service: 'DIGITAL FOUNDATION',
    foundationUrl: `${ctx.siteOrigin}${digitalFoundationClientPath(token)}`,
    intakeUrl: `${ctx.siteOrigin}${digitalFoundationClientIntakePath(token)}`,
  };
}

function addonLines(quote: DigitalFoundationQuote): AddonLine[] {
  return quote.selected_addons.map((line) => ({
    label: (findAddon(line.addon_id)?.label ?? line.addon_id).toUpperCase(),
    quantity: line.quantity,
  }));
}

function result<K extends Fndatn01EmailId>(reasons: string[], data: () => Fndatn01DataMap[K]): Derived<K> {
  return reasons.length ? { eligibility: { eligible: false, reasons }, data: null } : { eligibility: { eligible: true, reasons: [] }, data: data() };
}

function baseChecks(payload: DigitalFoundationArtifactPayload): string[] {
  const reasons: string[] = [];
  if (!payload.artifact.public_token) reasons.push('NO_PUBLIC_TOKEN');
  if (payload.artifact.state === 'ARCHIVED') reasons.push('ARTIFACT_ARCHIVED');
  return reasons;
}

const QUOTE_REVIEWABLE = new Set(['READY', 'CLIENT_REVIEW']);

// --------------------------------------------------------------------------------------------

export function derive01(payload: DigitalFoundationArtifactPayload, ctx: Fndatn01Context, opts: { founderAuthorized: boolean }): Derived<'01'> {
  assertContext(ctx);
  const reasons = baseChecks(payload);
  if (!opts.founderAuthorized) reasons.push('FOUNDER_SEND_NOT_AUTHORIZED');
  if (payload.artifact.intake_state === 'COMPLETE') reasons.push('INTAKE_ALREADY_SUBMITTED');
  return result<'01'>(reasons, () => ({ ...common(payload, ctx), status: 'READY TO BEGIN', access: 'OPEN' }));
}

export function derive02(payload: DigitalFoundationArtifactPayload, ctx: Fndatn01Context): Derived<'02'> {
  assertContext(ctx);
  const reasons = baseChecks(payload);
  const submitted = lastEvent(payload, 'INTAKE_COMPLETED');
  if (payload.artifact.intake_state !== 'COMPLETE') reasons.push('INTAKE_NOT_SUBMITTED');
  if (!submitted || !validDate(submitted.created_at)) reasons.push('NO_PERSISTED_INTAKE_COMPLETED_EVENT');
  return result<'02'>(reasons, () => ({
    ...common(payload, ctx),
    status: 'RECEIVED · UNDER REVIEW',
    receivedAt: formatDateTime(submitted!.created_at, ctx),
    reference: payload.artifact.artifact_id.toUpperCase(),
  }));
}

export function derive03(payload: DigitalFoundationArtifactPayload, ctx: Fndatn01Context): Derived<'03'> {
  assertContext(ctx);
  const reasons = baseChecks(payload);
  const q = payload.quote;
  if (!q) reasons.push('NO_QUOTE');
  else {
    if (!q.founder_commercial_ready) reasons.push('QUOTE_NOT_FOUNDER_APPROVED');
    if (!QUOTE_REVIEWABLE.has(q.status)) reasons.push(`QUOTE_STATUS_${q.status}`);
    const exp = validDate(q.expires_at);
    if (!exp) reasons.push('QUOTE_HAS_NO_EXPIRATION');
    else if (exp.getTime() <= ctx.now.getTime()) reasons.push('QUOTE_EXPIRED');
    if (!(q.subtotal_minor > 0)) reasons.push('QUOTE_HAS_NO_SUBTOTAL');
  }
  if (payload.artifact.payment_state === 'PAID') reasons.push('ALREADY_PAID');
  return result<'03'>(reasons, () => ({
    ...common(payload, ctx),
    recommendation: (payload.recommendation?.title ?? 'DIGITAL FOUNDATION').toUpperCase(),
    quoteAmount: formatMoney(q!.subtotal_minor, q!.currency),
    validUntil: formatDate(q!.expires_at, ctx),
    addons: addonLines(q!),
    scope: FNDATN01_BASE_SCOPE,
  }));
}

export function derive04(payload: DigitalFoundationArtifactPayload, ctx: Fndatn01Context): Derived<'04'> {
  assertContext(ctx);
  const reasons = baseChecks(payload);
  const paid = lastEvent(payload, 'PAYMENT_CONFIRMED');
  const q = payload.quote;
  if (payload.artifact.payment_state !== 'PAID') reasons.push(`PAYMENT_STATE_${payload.artifact.payment_state}`);
  if (!paid || !validDate(paid.created_at)) reasons.push('NO_PERSISTED_PAYMENT_CONFIRMED_EVENT');
  if (!q || q.status !== 'PAID') reasons.push('NO_PAID_QUOTE');
  return result<'04'>(reasons, () => {
    const activated = Boolean(firstEvent(payload, 'PROJECT_ACTIVATED')) && payload.artifact.project_state !== 'NOT_STARTED';
    const method =
      typeof paid!.payload.method_label === 'string' && paid!.payload.method_label.trim() ? String(paid!.payload.method_label).toUpperCase() : null;
    return {
      ...common(payload, ctx),
      amount: formatMoney(q!.subtotal_minor, q!.currency),
      paidAt: formatDate(paid!.created_at, ctx),
      reference: q!.quote_id.toUpperCase(),
      method,
      status: 'PAID',
      activation: activated ? 'active' : 'pending',
    };
  });
}

const COMPLETION_STAGES: Record<string, ProjectStageCode> = {
  domain: '02_DOMAIN',
  email: '03_PROFESSIONAL_EMAIL',
  security: '04_DNS_SECURITY',
  device: '05_DEVICE_SIGNATURE',
  records: '06_FINAL_VERIFICATION',
};

const COMPLETION_COPY: Record<string, { label: string; detail: string }> = {
  domain: { label: 'DOMAIN', detail: 'REGISTERED, CONNECTED, AND FULLY ACTIVE.' },
  email: { label: 'EMAIL', detail: 'YOUR MAILBOX AND ALIASES ARE SET UP AND READY.' },
  security: { label: 'SECURITY', detail: 'MX, SPF, DKIM, AND DMARC ARE CONFIGURED.' },
  device: { label: 'DEVICE', detail: 'YOUR DEVICE IS CONFIGURED AND VERIFIED.' },
  records: { label: 'RECORDS', detail: 'YOUR OWNERSHIP RECORD AND RENEWAL ACCESS ARE DELIVERED.' },
};

/** Completion items with per-item verification. Exported so previews can show partial truth honestly. */
export function completionItems(payload: DigitalFoundationArtifactPayload): CompletionItem[] {
  const own = payload.ownership_record;
  const stage = (code: ProjectStageCode) => payload.stages.find((s) => s.stage_code === code)?.status === 'COMPLETE';
  const values: Record<string, string | null> = {
    domain: own?.domain ?? null,
    email: own?.primary_mailbox ?? null,
    security: own?.security_status ?? own?.dns_status ?? null,
    device: stage('05_DEVICE_SIGNATURE') ? 'VERIFIED' : null,
    records: own && Boolean(firstEvent(payload, 'FOUNDATION_VERIFIED')) ? 'DELIVERED' : null,
  };
  return Object.keys(COMPLETION_STAGES).map((key) => ({
    key,
    ...COMPLETION_COPY[key],
    verified: stage(COMPLETION_STAGES[key]) && Boolean(values[key]),
    value: values[key] ? values[key]!.toUpperCase() : null,
  }));
}

export function derive05(payload: DigitalFoundationArtifactPayload, ctx: Fndatn01Context): Derived<'05'> {
  assertContext(ctx);
  const reasons = baseChecks(payload);
  if (payload.artifact.completion_state !== 'COMPLETE') reasons.push('COMPLETION_NOT_VERIFIED');
  if (!payload.ownership_record) reasons.push('NO_OWNERSHIP_RECORD');
  if (!firstEvent(payload, 'FOUNDATION_COMPLETED')) reasons.push('NO_FOUNDATION_COMPLETED_EVENT');
  const items = completionItems(payload);
  for (const item of items) if (!item.verified) reasons.push(`${item.key.toUpperCase()}_PENDING_VERIFICATION`);
  return result<'05'>(reasons, () => ({
    ...common(payload, ctx),
    items,
    deliveredAt: payload.artifact.completed_at ? formatDate(payload.artifact.completed_at, ctx) : null,
  }));
}

function hasSavedIntake(payload: DigitalFoundationArtifactPayload): boolean {
  const intake = payload.artifact.intake;
  const answered = Object.entries(intake).some(([key, value]) => {
    if (key === 'needs') return Array.isArray(value) && value.length > 0;
    if (key === 'business_ambition') return false;
    return value !== undefined && value !== null && String(value).trim() !== '';
  });
  return answered || Boolean(firstEvent(payload, 'INTAKE_UPDATED'));
}

/** Real milestones only. Payment is not a step of resuming an intake and is never shown as received. */
export function progressSteps(payload: DigitalFoundationArtifactPayload): ProgressStep[] {
  const opened = Boolean(payload.artifact.opened_at) || Boolean(firstEvent(payload, 'LINK_OPENED'));
  return [
    { key: 'invitation', label: 'INVITATION', state: opened ? 'complete' : 'pending', note: opened ? 'OPENED' : 'SENT' },
    { key: 'intake', label: 'INTAKE', state: 'in_progress', note: 'IN PROGRESS' },
    { key: 'recommendation', label: 'RECOMMENDATION', state: 'pending', note: 'PENDING' },
    { key: 'complete', label: 'COMPLETE', state: 'pending', note: 'PENDING' },
  ];
}

export function derive06(
  payload: DigitalFoundationArtifactPayload,
  ctx: Fndatn01Context,
  opts: { reminderAlreadySentForActivity?: boolean } = {},
): Derived<'06'> {
  assertContext(ctx);
  const reasons = baseChecks(payload);
  if (payload.artifact.intake_state !== 'IN_PROGRESS') reasons.push(`INTAKE_STATE_${payload.artifact.intake_state}`);
  if (firstEvent(payload, 'INTAKE_COMPLETED')) reasons.push('INTAKE_ALREADY_SUBMITTED');
  if (!hasSavedIntake(payload)) reasons.push('NO_SAVED_INTAKE');
  const last = validDate(payload.artifact.last_activity_at);
  if (!last) reasons.push('NO_LAST_ACTIVITY');
  else if (ctx.now.getTime() - last.getTime() < FNDATN01_REMINDER_POLICY.intake_resume_after_hours * 3600_000) reasons.push('REMINDER_DELAY_NOT_REACHED');
  if (opts.reminderAlreadySentForActivity) reasons.push('REMINDER_ALREADY_SENT');
  return result<'06'>(reasons, () => ({
    ...common(payload, ctx),
    steps: progressSteps(payload),
    savedAt: formatDateTime(payload.artifact.last_activity_at, ctx),
  }));
}

export function quoteRemaining(expiresAt: Date, now: Date) {
  const ms = Math.max(0, expiresAt.getTime() - now.getTime());
  const totalMinutes = Math.floor(ms / 60_000);
  return { days: Math.floor(totalMinutes / 1440), hours: Math.floor((totalMinutes % 1440) / 60), minutes: totalMinutes % 60 };
}

export function derive07(payload: DigitalFoundationArtifactPayload, ctx: Fndatn01Context): Derived<'07'> {
  assertContext(ctx);
  const reasons = baseChecks(payload);
  const q = payload.quote;
  let exp: Date | null = null;
  if (!q) reasons.push('NO_QUOTE');
  else {
    if (!QUOTE_REVIEWABLE.has(q.status)) reasons.push(`QUOTE_STATUS_${q.status}`);
    if (!q.founder_commercial_ready) reasons.push('QUOTE_NOT_FOUNDER_APPROVED');
    if (!(q.subtotal_minor > 0)) reasons.push('QUOTE_HAS_NO_SUBTOTAL');
    exp = validDate(q.expires_at);
    if (!exp) reasons.push('QUOTE_HAS_NO_EXPIRATION');
    else {
      const left = exp.getTime() - ctx.now.getTime();
      if (left <= 0) reasons.push('QUOTE_EXPIRED');
      else if (left > FNDATN01_REMINDER_POLICY.quote_expiry_window_hours * 3600_000) reasons.push('REMINDER_WINDOW_NOT_REACHED');
    }
  }
  if (payload.artifact.payment_state === 'PAID' || payload.artifact.payment_state === 'CHECKOUT_PENDING')
    reasons.push(`PAYMENT_STATE_${payload.artifact.payment_state}`);
  if (payload.acceptance) reasons.push('QUOTE_ALREADY_ACCEPTED');
  return result<'07'>(reasons, () => ({
    ...common(payload, ctx),
    quoteAmount: formatMoney(q!.subtotal_minor, q!.currency),
    issuedAt: formatDate(q!.created_at, ctx),
    validUntil: formatDateTime(q!.expires_at, ctx),
    status: q!.status === 'CLIENT_REVIEW' ? 'AWAITING ACCEPTANCE' : 'READY FOR REVIEW',
    remaining: quoteRemaining(exp!, ctx.now),
    asOf: formatDateTime(ctx.now.toISOString(), ctx),
    addons: addonLines(q!),
    scope: FNDATN01_BASE_SCOPE,
  }));
}
