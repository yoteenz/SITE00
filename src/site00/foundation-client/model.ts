/**
 * Digital Foundation client — pure presentation model for P01–P06.
 *
 * Everything here derives display state from Composer's client payload and catalog. Prices, totals and
 * timelines are read from the server quote; nothing in this file prices or schedules anything.
 */
import type { ClientDigitalFoundationPayload } from '../../../shared/site00-digital-foundation/clientProjection.js';
import { buildClientRecords } from '../../../shared/site00-digital-foundation/clientRecords.js';
import { DF_FEATURE_FLAGS, isDigitalFoundationFlagEnabled } from '../../../shared/site00-digital-foundation/featureFlags.js';
import { assessQuotePayability } from '../../../shared/site00-digital-foundation/quoteReadiness.js';
import type {
  ClientActionType,
  DigitalFoundationAddonId,
  DigitalFoundationCommercialConfig,
  DigitalFoundationIntake,
  DigitalFoundationQuote,
  IntakeNeedFlag,
} from '../../../shared/site00-digital-foundation/types.js';
import type { ClientCatalogEntry } from './api';

export type DfIntakeView = 'P01' | 'P02' | 'P03' | 'P04' | 'P05' | 'P06';
export type DfPortalView = 'OVERVIEW' | 'ROADMAP' | 'STAGE' | 'NEEDS_YOU' | 'RECORDS' | 'RECORD' | 'COMM_PREFS';
export type DfView = DfIntakeView | DfPortalView;
export type CheckoutParam = 'return' | 'cancel' | null;

export const DF_VIEW_META: Record<DfView, { index: string; label: string; footer: string }> = {
  P01: { index: '01', label: 'GET STARTED', footer: '001' },
  P02: { index: '02', label: 'BUSINESS INFORMATION', footer: '002' },
  P03: { index: '03', label: 'BUILD YOUR FOUNDATION', footer: '003' },
  P04: { index: '04', label: 'RECOMMENDATION', footer: '004' },
  P05: { index: '05', label: 'REVIEW + CHECKOUT', footer: '005' },
  P06: { index: '06', label: 'ACTIVATION', footer: '006' },
  OVERVIEW: { index: '07', label: 'PROJECT OVERVIEW', footer: '007' },
  ROADMAP: { index: '08', label: 'PROJECT ROADMAP', footer: '008' },
  STAGE: { index: '09', label: 'STAGE DETAIL', footer: '009' },
  NEEDS_YOU: { index: '10', label: 'NEEDS YOU', footer: '010' },
  RECORDS: { index: '—', label: 'MY RECORDS', footer: 'REC' },
  RECORD: { index: '—', label: 'RECORD DETAIL', footer: 'REC' },
  COMM_PREFS: { index: '—', label: 'COMMUNICATION PREFERENCES', footer: 'COM' },
};

export const DF_VIEW_ORDER: DfView[] = ['P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'OVERVIEW'];

export function isProjectPortalV2Enabled(): boolean {
  return isDigitalFoundationFlagEnabled(DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_PROJECT_PORTAL_V2);
}

export function portalViewsForPayload(payload: ClientDigitalFoundationPayload): DfPortalView[] {
  if (!isProjectPortalV2Enabled()) return ['OVERVIEW'];
  const base: DfPortalView[] = ['OVERVIEW', 'ROADMAP', 'NEEDS_YOU'];
  if (payload.stages.length) base.push('STAGE');
  if (buildClientRecords(payload).length) base.push('RECORDS', 'RECORD');
  base.push('COMM_PREFS');
  return base;
}

export function recordsAvailable(payload: ClientDigitalFoundationPayload): boolean {
  return buildClientRecords(payload).length > 0;
}

// ─── Menu drawer (DF-C48) ───────────────────────────────────────────────────────────────────────

/** `done` = behind the server surface (no longer editable); `locked` = not reached yet. */
export type DfMenuStepState = 'current' | 'open' | 'done' | 'locked';

export interface DfMenuStep {
  view: DfView;
  index: string;
  label: string;
  state: DfMenuStepState;
}

export type DfMenuDestinationId = 'overview' | 'roadmap' | 'needs_you' | 'records' | 'location' | 'comm_prefs';

export interface DfMenuDestination {
  id: DfMenuDestinationId;
  label: string;
  view: DfView | null;
  anchor?: string;
  available: boolean;
  current: boolean;
  /** Lifecycle caption shown while the destination is not open to this client. */
  status: string | null;
}

/** Overview section the ROADMAP destination scrolls to. */
export const DF_ROADMAP_ANCHOR = 'df-stages-h';

/**
 * The drawer shows the whole journey, but only the parents the server surface allows (`resolveDfRoute`)
 * are navigable. Records and the digital location live on the COMPLETE surface, which has no menu.
 */
export function buildDfMenu(views: readonly DfView[], current: DfView | null): {
  steps: DfMenuStep[];
  destinations: DfMenuDestination[];
} {
  const order = DF_VIEW_ORDER.filter((v) => v !== 'OVERVIEW');
  const firstOpen = order.findIndex((v) => views.includes(v));
  const steps = order.map((view, i): DfMenuStep => {
    const state: DfMenuStepState = views.includes(view)
      ? current === view
        ? 'current'
        : 'open'
      : firstOpen === -1 || i < firstOpen
        ? 'done'
        : 'locked';
    return { view, index: DF_VIEW_META[view].index, label: DF_VIEW_META[view].label, state };
  });
  const portal = views.includes('OVERVIEW');
  const portalV2 = portal && views.includes('ROADMAP');
  const recs = portal && views.includes('RECORDS');
  const destinations: DfMenuDestination[] = [
    {
      id: 'overview',
      label: 'PROJECT OVERVIEW',
      view: 'OVERVIEW',
      available: portal,
      current: current === 'OVERVIEW',
      status: portal ? null : 'AFTER PAYMENT',
    },
    {
      id: 'roadmap',
      label: 'ROADMAP',
      view: portalV2 ? 'ROADMAP' : 'OVERVIEW',
      anchor: portalV2 ? undefined : DF_ROADMAP_ANCHOR,
      available: portal,
      current: current === 'ROADMAP',
      status: portal ? null : 'AFTER PAYMENT',
    },
    {
      id: 'needs_you',
      label: 'NEEDS YOU',
      view: portalV2 ? 'NEEDS_YOU' : null,
      available: portal && portalV2,
      current: current === 'NEEDS_YOU',
      status: portal ? null : 'AFTER PAYMENT',
    },
    {
      id: 'records',
      label: 'VIEW MY RECORDS',
      view: recs ? 'RECORDS' : null,
      available: recs,
      current: current === 'RECORDS' || current === 'RECORD',
      status: recs ? null : 'WHEN RECORDS EXIST',
    },
    {
      id: 'comm_prefs',
      label: 'COMMUNICATION PREFERENCES',
      view: portalV2 ? 'COMM_PREFS' : null,
      available: portal && portalV2,
      current: current === 'COMM_PREFS',
      status: portal ? null : 'AFTER PAYMENT',
    },
    {
      id: 'location',
      label: 'VIEW MY DIGITAL LOCATION',
      view: null,
      available: false,
      current: false,
      status: 'AFTER COMPLETION',
    },
  ];
  return { steps, destinations };
}

/** The three acceptance disclosures the server requires verbatim (`acceptQuote`). */
export const DF_DISCLOSURES = [
  'I HAVE REVIEWED MY DIGITAL FOUNDATION SCOPE.',
  'I UNDERSTAND THAT DOMAIN / EMAIL PROVIDER SUBSCRIPTIONS AND OTHER THIRD-PARTY FEES MAY BE SEPARATE.',
  'I UNDERSTAND THAT THE PROJECTED TURNAROUND BEGINS AFTER REQUIRED INFORMATION, ACCESS AND PAYMENT ARE RECEIVED.',
] as const;

// ─── Routing inside the one link ────────────────────────────────────────────────────────────────

export type DfRoute =
  | { kind: 'views'; views: DfView[]; defaultView: DfView }
  | { kind: 'closed' }
  | { kind: 'complete' };

/**
 * Which parents the client may open on the current server surface, and where the link lands.
 * The server owns the surface (`resolveArtifactSurface`); the client only picks a parent inside it.
 */
export function resolveDfRoute(
  payload: ClientDigitalFoundationPayload,
  ctx: { checkout: CheckoutParam; activationSeen: boolean },
): DfRoute {
  const { artifact, quote, acceptance } = payload;
  switch (payload.surface) {
    case 'COMPLETE':
    case 'BUILD_UPSELL':
      return { kind: 'complete' };
    case 'PAYMENT_RECOVERY':
      return { kind: 'views', views: ['P06'], defaultView: 'P06' };
    case 'PORTAL': {
      const portal = portalViewsForPayload(payload);
      return {
        kind: 'views',
        views: ['P06', ...portal],
        defaultView: ctx.checkout === 'return' || !ctx.activationSeen ? 'P06' : 'OVERVIEW',
      };
    }
    default:
      break;
  }
  if (artifact.state === 'ARCHIVED') return { kind: 'closed' };
  switch (payload.surface) {
    case 'CHECKOUT':
      return {
        kind: 'views',
        views: ctx.checkout === 'return' ? ['P04', 'P05', 'P06'] : ['P04', 'P05'],
        defaultView: ctx.checkout === 'return' ? 'P06' : 'P05',
      };
    case 'QUOTE': {
      const reaccept = Boolean(acceptance && quote && acceptance.quote_version !== quote.quote_version);
      return { kind: 'views', views: ['P04', 'P05'], defaultView: reaccept ? 'P05' : 'P04' };
    }
    case 'RECOMMENDATION':
      return { kind: 'views', views: ['P04'], defaultView: 'P04' };
    case 'INTAKE':
      return { kind: 'views', views: ['P01', 'P02', 'P03'], defaultView: 'P02' };
    case 'INTAKE_SUBMITTED':
      return { kind: 'views', views: ['P03'], defaultView: 'P03' };
    case 'PROSPECT':
    default:
      return { kind: 'views', views: ['P01', 'P02', 'P03'], defaultView: 'P01' };
  }
}

// ─── Formatting ────────────────────────────────────────────────────────────────────────────────

export function formatMoney(minor: number, currency: string): string {
  const whole = minor % 100 === 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(minor / 100);
}

export function formatDayRange(min: number, max: number): string {
  return min === max ? `${min}` : `${min}–${max}`;
}

// ─── P02 / P03 intake ──────────────────────────────────────────────────────────────────────────

export type DomainPath = 'NEW' | 'OWN' | 'LOST' | 'UNSURE';

export const DOMAIN_PATHS: { path: DomainPath; title: string; sub: string; tag: ClassTag }[] = [
  { path: 'NEW', title: 'REGISTER A NEW DOMAIN', sub: 'WE HELP YOU CHOOSE AND SECURE IT', tag: 'INCLUDED' },
  { path: 'OWN', title: 'CONNECT A DOMAIN I OWN', sub: 'TRANSFER CAN BE ADDED ON THE NEXT STEP', tag: 'INCLUDED' },
  { path: 'LOST', title: "RECOVER A DOMAIN I CAN'T ACCESS", sub: 'RECOVERY IS REVIEWED BY SITE 00', tag: 'MANUAL REVIEW' },
  { path: 'UNSURE', title: "I'M NOT SURE YET", sub: "WE'LL CLARIFY WITH YOU AFTER INTAKE", tag: 'INCLUDED' },
];

const DOMAIN_FLAG: Record<DomainPath, IntakeNeedFlag> = {
  NEW: 'NEED_DOMAIN',
  OWN: 'OWN_DOMAIN',
  LOST: 'LOST_DOMAIN',
  UNSURE: 'UNSURE',
};

/** Need flags the P03 configurator owns directly (domain path and mailbox count are derived). */
export type ConfigurableNeed = 'NEED_DEVICE' | 'NEED_MIGRATION' | 'HAVE_WEBSITE' | 'EVENTUAL_WEBSITE' | 'NEED_BRANDING' | 'UNSURE';

export type IntakeDraft = {
  business_name: string;
  industry: string;
  contact_name: string;
  current_email: string;
  phone: string;
  existing_domain: string;
  existing_registrar: string;
  existing_email_provider: string;
  team_size: number;
  domainPath: DomainPath | null;
  needs: ConfigurableNeed[];
};

const CONFIGURABLE: ConfigurableNeed[] = [
  'NEED_DEVICE',
  'NEED_MIGRATION',
  'HAVE_WEBSITE',
  'EVENTUAL_WEBSITE',
  'NEED_BRANDING',
  'UNSURE',
];

export function domainPathFromNeeds(needs: IntakeNeedFlag[]): DomainPath | null {
  if (needs.includes('LOST_DOMAIN')) return 'LOST';
  if (needs.includes('OWN_DOMAIN')) return 'OWN';
  if (needs.includes('NEED_DOMAIN')) return 'NEW';
  if (needs.includes('UNSURE')) return 'UNSURE';
  return null;
}

/** Saved intake first, then the founder-entered lead, so a returning client sees what they already gave us. */
export function draftFromPayload(payload: ClientDigitalFoundationPayload): IntakeDraft {
  const intake: DigitalFoundationIntake = payload.artifact.intake ?? { needs: [] };
  const lead = payload.lead;
  const needs = intake.needs ?? [];
  const domainPath = domainPathFromNeeds(needs);
  return {
    business_name: intake.business_name ?? lead.business_name ?? '',
    industry: intake.industry ?? '',
    contact_name: intake.contact_name ?? lead.contact_name ?? '',
    current_email: intake.current_email ?? lead.contact_email ?? '',
    phone: intake.phone ?? '',
    existing_domain: intake.existing_domain ?? '',
    existing_registrar: intake.existing_registrar ?? '',
    existing_email_provider: intake.existing_email_provider ?? '',
    team_size: Math.max(1, intake.team_size ?? 1),
    domainPath,
    // UNSURE doubles as the domain "not sure" path; only count it as an extra need when a real path is chosen.
    needs: CONFIGURABLE.filter((f) => needs.includes(f) && !(f === 'UNSURE' && domainPath === 'UNSURE')),
  };
}

export function needsFromDraft(draft: IntakeDraft): IntakeNeedFlag[] {
  const out = new Set<IntakeNeedFlag>(draft.needs);
  if (draft.domainPath) out.add(DOMAIN_FLAG[draft.domainPath]);
  if (draft.team_size > 1) out.add('NEED_MULTI_MAILBOX');
  return [...out];
}

export function intakeFromDraft(draft: IntakeDraft): Partial<DigitalFoundationIntake> {
  const trim = (v: string) => v.trim();
  const out: Partial<DigitalFoundationIntake> = {
    business_name: trim(draft.business_name),
    industry: trim(draft.industry),
    contact_name: trim(draft.contact_name),
    current_email: trim(draft.current_email),
    phone: trim(draft.phone),
    team_size: draft.team_size,
    existing_email_provider: trim(draft.existing_email_provider),
  };
  if (draft.domainPath === 'OWN' || draft.domainPath === 'LOST') {
    out.existing_domain = trim(draft.existing_domain);
    out.existing_registrar = trim(draft.existing_registrar);
  }
  return out;
}

export type IntakeField = 'business_name' | 'contact_name' | 'current_email' | 'existing_domain' | 'domainPath';
export type IntakeErrors = Partial<Record<IntakeField, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOMAIN_RE = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i;

/** P02 CONTINUE gate. */
export function validateBusinessInfo(draft: IntakeDraft): IntakeErrors {
  const errors: IntakeErrors = {};
  if (!draft.business_name.trim()) errors.business_name = 'ENTER YOUR BUSINESS NAME';
  if (!draft.contact_name.trim()) errors.contact_name = 'ENTER THE PRIMARY CONTACT';
  if (!draft.current_email.trim()) errors.current_email = 'ENTER AN EMAIL ADDRESS';
  else if (!EMAIL_RE.test(draft.current_email.trim())) errors.current_email = 'CHECK THIS EMAIL ADDRESS';
  return errors;
}

/** P03 VIEW MY RECOMMENDATION gate (G01): business info plus exactly one domain path. */
export function validateForRecommendation(draft: IntakeDraft): IntakeErrors {
  const errors = validateBusinessInfo(draft);
  if (!draft.domainPath) errors.domainPath = 'CHOOSE HOW WE HANDLE YOUR DOMAIN';
  if (draft.domainPath === 'OWN') {
    const d = draft.existing_domain.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    if (!d) errors.existing_domain = 'ENTER THE DOMAIN YOU OWN';
    else if (!DOMAIN_RE.test(d)) errors.existing_domain = 'CHECK THIS DOMAIN (EXAMPLE.COM)';
  }
  return errors;
}

export function sameDraft(a: IntakeDraft, b: IntakeDraft): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Business type options (writes the existing free-text `industry` field). Pending founder ratification. */
export const BUSINESS_TYPES = [
  'PROFESSIONAL SERVICES',
  'CONSTRUCTION + TRADES',
  'TRANSPORTATION + LOGISTICS',
  'HEALTH + WELLNESS',
  'FOOD + HOSPITALITY',
  'RETAIL + E-COMMERCE',
  'REAL ESTATE',
  'CREATIVE + MEDIA',
  'NONPROFIT',
  'OTHER',
];

// ─── Classification (P03 / P04) ────────────────────────────────────────────────────────────────

export type ClassTag = 'CORE' | 'INCLUDED' | 'CONFIGURABLE' | 'PAID ADD-ON' | 'MANUAL REVIEW';

// ─── P04 add-ons ───────────────────────────────────────────────────────────────────────────────

export type AddonIcon = 'envelope' | 'swap' | 'cloud' | 'laptop' | 'globe' | 'users' | 'route' | 'signature' | 'dns' | 'alert' | 'bolt' | 'plus' | 'search';

const ADDON_PRESENTATION: Record<DigitalFoundationAddonId, { title: string; sub: string; icon: AddonIcon; group: string }> = {
  ADDITIONAL_MAILBOX: { title: 'ADDITIONAL MAILBOX', sub: 'ADDITIONAL USER', icon: 'envelope', group: 'EMAIL' },
  DOMAIN_TRANSFER: { title: 'DOMAIN TRANSFER', sub: 'TRANSFER EXISTING DOMAIN', icon: 'swap', group: 'DOMAIN' },
  LEGACY_EMAIL_MIGRATION: { title: 'EMAIL MIGRATION', sub: 'MIGRATE FROM EXISTING', icon: 'cloud', group: 'EMAIL' },
  ADDITIONAL_DEVICE_SETUP: { title: 'ADDITIONAL DEVICE', sub: 'SETUP ANOTHER DEVICE', icon: 'laptop', group: 'SETUP' },
  ADDITIONAL_DOMAIN: { title: 'ADDITIONAL DOMAIN', sub: 'REGISTER OR CONNECT ANOTHER', icon: 'globe', group: 'DOMAIN' },
  DOMAIN_RECOVERY: { title: 'DOMAIN RECOVERY', sub: 'RECOVER UNCLEAR OWNERSHIP', icon: 'search', group: 'DOMAIN' },
  MULTI_USER_WORKSPACE_SETUP: { title: 'MULTI-USER WORKSPACE', sub: 'SET UP YOUR WHOLE TEAM', icon: 'users', group: 'EMAIL' },
  ADVANCED_EMAIL_ROUTING: { title: 'ADVANCED EMAIL ROUTING', sub: 'SHARED INBOXES + FORWARDERS', icon: 'route', group: 'EMAIL' },
  STAFF_SIGNATURE_SYSTEM: { title: 'STAFF SIGNATURE SYSTEM', sub: 'SIGNATURES FOR EVERY MAILBOX', icon: 'signature', group: 'EMAIL' },
  ADVANCED_DNS_CLEANUP: { title: 'ADVANCED DNS CLEANUP', sub: 'UNTANGLE CONFLICTING DNS', icon: 'dns', group: 'SETUP' },
  EXISTING_SITE_DOMAIN_CONFLICT: { title: 'EXISTING SITE CONFLICT', sub: 'DOMAIN ALREADY IN USE', icon: 'alert', group: 'DOMAIN' },
  EXPEDITED_FOUNDATION: { title: 'EXPEDITED FOUNDATION', sub: 'PRIORITY SCHEDULING', icon: 'bolt', group: 'PRIORITY' },
  CUSTOM_FOUNDATION_WORK: { title: 'CUSTOM FOUNDATION WORK', sub: 'SCOPE OUTSIDE THE CATALOG', icon: 'plus', group: 'CUSTOM' },
};

/** The four rows the approved board shows first; every other add-on lives in the full catalog sheet. */
export const FEATURED_ADDONS: DigitalFoundationAddonId[] = [
  'ADDITIONAL_MAILBOX',
  'DOMAIN_TRANSFER',
  'LEGACY_EMAIL_MIGRATION',
  'ADDITIONAL_DEVICE_SETUP',
];

export type Selections = Partial<Record<DigitalFoundationAddonId, number>>;

export function selectionsFromQuote(quote: DigitalFoundationQuote | null): Selections {
  const out: Selections = {};
  for (const line of quote?.selected_addons ?? []) out[line.addon_id] = line.quantity;
  return out;
}

export function sameSelections(a: Selections, b: Selections): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<DigitalFoundationAddonId>;
  for (const k of keys) if ((a[k] ?? 0) !== (b[k] ?? 0)) return false;
  return true;
}

export type AddonRow = {
  addon_id: DigitalFoundationAddonId;
  title: string;
  sub: string;
  icon: AddonIcon;
  group: string;
  unitPriceLabel: string;
  eachLabel: string | null;
  /** Present only when the server quote holds this line; never computed in the browser. */
  lineTotalLabel: string | null;
  quantityUnit: boolean;
  selected: boolean;
  quantity: number;
  manualReview: boolean;
  quotedAfterReview: boolean;
  /** Set when a dependency blocks selecting (missing prerequisite) or removing (a dependent is selected). */
  lockedReason: string | null;
  recommended: boolean;
};

export function addonPresentation(id: DigitalFoundationAddonId) {
  return ADDON_PRESENTATION[id];
}

export function buildAddonRows(input: {
  catalog: ClientCatalogEntry[];
  config: DigitalFoundationCommercialConfig;
  quote: DigitalFoundationQuote | null;
  recommended: DigitalFoundationAddonId[];
  desired: Selections;
}): AddonRow[] {
  const { catalog, config, quote, desired } = input;
  const lines = new Map((quote?.selected_addons ?? []).map((l) => [l.addon_id, l]));
  const visible = catalog.filter(
    (c) => c.addon_id !== 'EXPEDITED_FOUNDATION' || config.expedited_premium_minor != null || desired[c.addon_id],
  );
  return visible.map((c) => {
    const p = ADDON_PRESENTATION[c.addon_id] ?? { title: c.label.toUpperCase(), sub: '', icon: 'plus' as const, group: 'OTHER' };
    const selected = (desired[c.addon_id] ?? 0) > 0;
    const line = lines.get(c.addon_id);
    const custom = c.addon_id === 'CUSTOM_FOUNDATION_WORK' && c.price_minor_units <= 0;
    const missing = c.dependencies.filter((d) => !desired[d as DigitalFoundationAddonId]);
    const dependents = catalog.filter((o) => o.dependencies.includes(c.addon_id) && desired[o.addon_id]);
    let lockedReason: string | null = null;
    if (!selected && missing.length) {
      lockedReason = `REQUIRES ${missing.map((d) => ADDON_PRESENTATION[d as DigitalFoundationAddonId]?.title ?? d).join(' + ')}`;
    } else if (selected && dependents.length) {
      lockedReason = `REQUIRED BY ${dependents.map((d) => ADDON_PRESENTATION[d.addon_id]?.title ?? d.label).join(' + ')}`;
    }
    const expeditedUnit =
      c.addon_id === 'EXPEDITED_FOUNDATION' && config.expedited_premium_minor != null ? config.expedited_premium_minor : null;
    return {
      addon_id: c.addon_id,
      title: p.title,
      sub: p.sub,
      icon: p.icon,
      group: p.group,
      unitPriceLabel: custom ? 'QUOTED AFTER REVIEW' : `+${formatMoney(expeditedUnit ?? c.price_minor_units, c.currency)}`,
      eachLabel: c.quantity_unit && !custom ? `${formatMoney(c.price_minor_units, c.currency)} EACH` : null,
      // Only the server's line total, and only once it reflects the quantity on screen.
      lineTotalLabel:
        line && !custom && line.quantity > 1 && line.quantity === (desired[c.addon_id] ?? 0)
          ? `+${formatMoney(line.line_total_minor, quote?.currency ?? c.currency)}`
          : null,
      quantityUnit: c.quantity_unit,
      selected,
      quantity: desired[c.addon_id] ?? 0,
      manualReview: c.requires_manual_review,
      quotedAfterReview: custom,
      lockedReason,
      recommended: input.recommended.includes(c.addon_id),
    };
  });
}

/** Board rows first (in board order), then any other line the quote already carries. */
export function featuredRows(rows: AddonRow[]): AddonRow[] {
  const featured = FEATURED_ADDONS.map((id) => rows.find((r) => r.addon_id === id)).filter(Boolean) as AddonRow[];
  const extra = rows.filter((r) => r.selected && !FEATURED_ADDONS.includes(r.addon_id));
  return [...featured, ...extra];
}

/** One request per settled edit: a single removal uses `remove-addon` (server dependency check). */
export function planQuoteSync(
  server: Selections,
  desired: Selections,
): { kind: 'none' } | { kind: 'remove'; addon_id: DigitalFoundationAddonId } | { kind: 'update'; selections: { addon_id: string; quantity: number }[] } {
  if (sameSelections(server, desired)) return { kind: 'none' };
  const removed = (Object.keys(server) as DigitalFoundationAddonId[]).filter((k) => !desired[k]);
  const others = { ...server };
  for (const r of removed) delete others[r];
  if (removed.length === 1 && sameSelections(others, desired)) return { kind: 'remove', addon_id: removed[0] };
  return {
    kind: 'update',
    selections: (Object.entries(desired) as [DigitalFoundationAddonId, number][])
      .filter(([, q]) => q > 0)
      .map(([addon_id, quantity]) => ({ addon_id, quantity })),
  };
}

export type QuoteFigures = {
  total: string;
  caption: string;
  turnaround: string;
  turnaroundCaption: string;
  reviewSuffix: string | null;
  addonCount: number;
};

export function quoteFigures(quote: DigitalFoundationQuote, config: DigitalFoundationCommercialConfig): QuoteFigures {
  const c = quote.currency;
  const adj = quote.manual_adjustments_minor;
  const hasAddons = quote.addon_total_minor > 0 || quote.selected_addons.length > 0;
  let caption = formatMoney(quote.base_price_minor, c);
  if (hasAddons) caption += ` + ${formatMoney(quote.addon_total_minor, c)} ADD-ONS`;
  if (adj !== 0) caption += ` ${adj > 0 ? '+' : '−'} ${formatMoney(Math.abs(adj), c)} ADJUSTMENT`;
  if (!hasAddons && adj === 0) caption = 'BASE FOUNDATION';
  const delta = quote.projected_max_days - config.base_max_business_days;
  return {
    total: formatMoney(quote.subtotal_minor, c),
    caption,
    turnaround: formatDayRange(quote.projected_min_days, quote.projected_max_days),
    turnaroundCaption: delta > 0 ? `+${delta} ${delta === 1 ? 'DAY' : 'DAYS'} (ADD-ONS)` : 'STANDARD TURNAROUND',
    reviewSuffix: quote.timeline_custom_review ? 'CONFIRMED AFTER REVIEW' : null,
    addonCount: quote.selected_addons.length,
  };
}

export function quoteNeedsFounderReview(quote: DigitalFoundationQuote | null): boolean {
  if (!quote || quote.founder_commercial_ready) return false;
  return quote.selected_addons.some(
    (l) => l.requires_manual_review || (l.addon_id === 'CUSTOM_FOUNDATION_WORK' && l.line_total_minor <= 0),
  );
}

export function quoteExpired(quote: DigitalFoundationQuote | null, now = new Date()): boolean {
  return Boolean(quote && new Date(quote.expires_at).getTime() < now.getTime());
}

// ─── P05 review + checkout ─────────────────────────────────────────────────────────────────────

export type ReviewState =
  | 'NOT_READY'
  | 'READY_TO_REVIEW'
  | 'AWAITING_ACCEPTANCE'
  | 'SCOPE_CHANGED'
  | 'AWAITING_FOUNDER_PRICING'
  | 'READY_FOR_CHECKOUT'
  | 'CREATING_CHECKOUT'
  | 'CHECKOUT_ERROR'
  | 'PAYMENT_CANCELLED'
  | 'PAYMENT_PENDING'
  | 'QUOTE_EXPIRED';

export function deriveReviewState(input: {
  payload: ClientDigitalFoundationPayload;
  acknowledged: number;
  checkout: CheckoutParam;
  creating: boolean;
  errorCode: string | null;
  now?: Date;
}): ReviewState {
  const { payload, now } = input;
  const { artifact, quote, acceptance } = payload;
  if (input.creating) return 'CREATING_CHECKOUT';
  if (input.errorCode) return 'CHECKOUT_ERROR';
  if (!quote) return 'NOT_READY';
  const accepted = quote.status === 'ACCEPTED' && acceptance?.quote_version === quote.quote_version;
  if (!accepted) {
    if (quoteExpired(quote, now)) return 'QUOTE_EXPIRED';
    if (acceptance && acceptance.quote_version !== quote.quote_version) return 'SCOPE_CHANGED';
    return input.acknowledged === 0 ? 'READY_TO_REVIEW' : 'AWAITING_ACCEPTANCE';
  }
  const pay = assessQuotePayability({ artifact, quote, acceptance, now });
  if (!pay.ok) {
    if (pay.code === 'MANUAL_REVIEW_PENDING' || pay.code === 'CUSTOM_PRICING_PENDING') return 'AWAITING_FOUNDER_PRICING';
    if (pay.code === 'QUOTE_EXPIRED') return 'QUOTE_EXPIRED';
    return 'CHECKOUT_ERROR';
  }
  if (input.checkout === 'cancel') return 'PAYMENT_CANCELLED';
  if (artifact.payment_state === 'CHECKOUT_PENDING') return 'PAYMENT_PENDING';
  if (artifact.payment_state === 'FAILED') return 'CHECKOUT_ERROR';
  return 'READY_FOR_CHECKOUT';
}

export const REVIEW_STATE_LABEL: Record<ReviewState, string> = {
  NOT_READY: 'PREPARING YOUR QUOTE',
  READY_TO_REVIEW: 'READY TO REVIEW',
  AWAITING_ACCEPTANCE: 'AWAITING ACCEPTANCE',
  SCOPE_CHANGED: 'SCOPE UPDATED — ACCEPT AGAIN',
  AWAITING_FOUNDER_PRICING: 'AWAITING FOUNDER PRICING',
  READY_FOR_CHECKOUT: 'READY FOR CHECKOUT',
  CREATING_CHECKOUT: 'CREATING CHECKOUT',
  CHECKOUT_ERROR: 'CHECKOUT ERROR',
  PAYMENT_CANCELLED: 'PAYMENT CANCELLED',
  PAYMENT_PENDING: 'PAYMENT PENDING',
  QUOTE_EXPIRED: 'QUOTE EXPIRED',
};

/** Client copy for server error codes. Codes stay out of the UI; nothing internal is echoed. */
export function checkoutErrorCopy(code: string | null, payload: ClientDigitalFoundationPayload): string {
  if (payload.artifact.payment_state === 'FAILED' && !code) return 'YOUR LAST PAYMENT DID NOT GO THROUGH. NOTHING WAS CHARGED. TRY AGAIN.';
  switch (code) {
    case 'PAYMENT_NOT_CONFIGURED':
    case 'PROVIDER_ERROR':
    case 'STRIPE_ERROR':
      return 'SECURE CHECKOUT IS UNAVAILABLE RIGHT NOW. NOTHING WAS CHARGED. PLEASE TRY AGAIN SHORTLY.';
    case 'NETWORK':
      return "WE COULDN'T REACH SITE 00. CHECK YOUR CONNECTION AND TRY AGAIN.";
    case 'DISCLOSURE_REQUIRED':
      return 'CONFIRM ALL THREE ACKNOWLEDGMENTS TO CONTINUE.';
    case 'QUOTE_LOCKED':
    case 'QUOTE_SUPERSEDED':
    case 'ACCEPTANCE_VERSION_MISMATCH':
      return 'YOUR SCOPE CHANGED SINCE YOU OPENED THIS PAGE. REVIEW IT AGAIN.';
    case 'QUOTE_EXPIRED':
      return 'THIS QUOTE HAS EXPIRED.';
    case 'MANUAL_REVIEW_PENDING':
    case 'CUSTOM_PRICING_PENDING':
      return 'SITE 00 CONFIRMS PART OF THIS SCOPE BEFORE CHECKOUT OPENS.';
    case 'Checkout not enabled':
      return 'CHECKOUT IS NOT OPEN FOR THIS PROJECT YET.';
    default:
      return 'SOMETHING WENT WRONG OPENING CHECKOUT. NOTHING WAS CHARGED. TRY AGAIN.';
  }
}

// ─── P06 activation ────────────────────────────────────────────────────────────────────────────

export type ActivationState =
  | 'VERIFYING_PAYMENT'
  | 'PAYMENT_CONFIRMATION_PENDING'
  | 'PAYMENT_CONFIRMED'
  | 'ACTIVATION_PENDING'
  | 'PROJECT_ACTIVATED'
  | 'AWAITING_REQUIRED_INFORMATION'
  | 'AWAITING_CLIENT_AUTHORIZATION'
  | 'PRODUCTION_READY'
  | 'ACTIVATION_ERROR'
  | 'PROJECT_PAUSED';

export type VerifyPhase = 'polling' | 'exhausted' | 'error' | null;

const AUTHORIZATION_ACTIONS: ClientActionType[] = [
  'AUTHORIZE_PROVIDER',
  'AUTHORIZE_DOMAIN_TRANSFER',
  'APPROVE_DOMAIN',
  'APPROVE_DNS_CHANGE',
  'APPROVE_SIGNATURE',
];

export function deriveActivationState(payload: ClientDigitalFoundationPayload, verify: VerifyPhase): ActivationState {
  const { artifact, stages, client_actions, timeline_readiness } = payload;
  if (payload.surface === 'PAYMENT_RECOVERY') return 'PROJECT_PAUSED';
  if (artifact.payment_state !== 'PAID') {
    if (verify === 'error') return 'ACTIVATION_ERROR';
    if (verify === 'exhausted') return 'PAYMENT_CONFIRMATION_PENDING';
    return 'VERIFYING_PAYMENT';
  }
  if (artifact.project_state === 'NOT_STARTED') return 'PAYMENT_CONFIRMED';
  if (!stages.length) return 'ACTIVATION_PENDING';
  const open = client_actions.filter((a) => a.status === 'OPEN');
  if (open.some((a) => AUTHORIZATION_ACTIONS.includes(a.action_type))) return 'AWAITING_CLIENT_AUTHORIZATION';
  const missing = timeline_readiness?.missing_requirements ?? [];
  if (open.length || missing.length) return 'AWAITING_REQUIRED_INFORMATION';
  if (timeline_readiness?.production_started_at) return 'PRODUCTION_READY';
  return 'PROJECT_ACTIVATED';
}

export const ACTIVATION_STATE_LABEL: Record<ActivationState, string> = {
  VERIFYING_PAYMENT: 'VERIFYING PAYMENT',
  PAYMENT_CONFIRMATION_PENDING: 'PAYMENT CONFIRMATION PENDING',
  PAYMENT_CONFIRMED: 'PAYMENT CONFIRMED',
  ACTIVATION_PENDING: 'ACTIVATION PENDING',
  PROJECT_ACTIVATED: 'PROJECT ACTIVATED',
  AWAITING_REQUIRED_INFORMATION: 'AWAITING REQUIRED INFORMATION',
  AWAITING_CLIENT_AUTHORIZATION: 'AWAITING CLIENT AUTHORIZATION',
  PRODUCTION_READY: 'PRODUCTION READY',
  ACTIVATION_ERROR: 'ACTIVATION ERROR',
  PROJECT_PAUSED: 'PROJECT PAUSED',
};

export function isPaidState(state: ActivationState): boolean {
  return !['VERIFYING_PAYMENT', 'PAYMENT_CONFIRMATION_PENDING', 'ACTIVATION_ERROR', 'PROJECT_PAUSED'].includes(state);
}

/** Turnaround shown after payment: the operations forecast when one exists, otherwise the paid quote's range. */
export function activationTurnaround(
  payload: ClientDigitalFoundationPayload,
): { value: string; unit: string; caption: string } | null {
  const r = payload.timeline_readiness;
  const q = payload.quote;
  const summary = payload.operations_summary?.projected_completion ?? null;
  const parsed = summary ? /^(\d+)–(\d+)/.exec(summary) : null;
  const min = parsed ? Number(parsed[1]) : r?.forecast_min_days ?? q?.projected_min_days ?? null;
  const max = parsed ? Number(parsed[2]) : r?.forecast_max_days ?? q?.projected_max_days ?? null;
  const ready =
    Boolean(r?.production_started_at) && (r?.missing_requirements.length ?? 0) === 0 && !payload.client_actions.length;
  const caption =
    ready && r?.production_started_at
      ? `FROM ${new Date(r.production_started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}`
      : 'ONCE WE HAVE WHAT WE NEED';
  if (min == null || max == null) return null;
  return { value: formatDayRange(min, max), unit: 'BUSINESS DAYS', caption };
}

// ─── Lifecycle progress (DF-U12) ───────────────────────────────────────────────────────────────

export type DfProgressStepState = 'complete' | 'current' | 'future' | 'locked';

/**
 * The six Foundation stages as lifecycle facts (never the view the client happens to be on).
 * Display only: activation stays locked until payment is recorded.
 */
export function foundationProgress(
  payload: ClientDigitalFoundationPayload,
): { index: string; label: string; state: DfProgressStepState }[] {
  const { artifact, quote, acceptance, stages } = payload;
  const paid = artifact.payment_state === 'PAID';
  const accepted =
    paid || Boolean(quote && (quote.status === 'ACCEPTED' || quote.status === 'PAID') && acceptance?.quote_version === quote.quote_version);
  const done = [
    artifact.intake_state !== 'NOT_STARTED',
    artifact.intake_state === 'COMPLETE' || Object.keys(validateBusinessInfo(draftFromPayload(payload))).length === 0,
    artifact.intake_state === 'COMPLETE',
    accepted,
    paid,
    paid && artifact.project_state !== 'NOT_STARTED' && stages.length > 0,
  ];
  const views: DfView[] = ['P01', 'P02', 'P03', 'P04', 'P05', 'P06'];
  const current = done.findIndex((d) => !d);
  return views.map((v, i) => ({
    index: DF_VIEW_META[v].index,
    // Soft hyphen: six phone-width columns can't hold the 14-letter word on one line.
    label: v === 'P04' ? 'RECOMMEN\u00ADDATION' : DF_VIEW_META[v].label,
    state: done[i] ? 'complete' : i === current ? 'current' : v === 'P06' && !paid ? 'locked' : 'future',
  }));
}
