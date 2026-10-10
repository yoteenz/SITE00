/**
 * Business Growth — pure presentation model for the Growth parents (G1–G4) inside the Foundation link.
 *
 * Every figure comes from the server's `business_growth` context, which the canonical BGI engines compose
 * (recommendations, quote sections, delivery milestones, roadmap). Nothing here prices or schedules; it only
 * maps contract values to labels, groupings and layout positions.
 */
import { adaptiveContextFieldsForGoals } from '../../../../shared/site00-business-growth-intelligence/businessAmbition.js';
import type { AmbitionContextKey, ClientBusinessGrowthContext, ClientGrowthService } from '../../../../shared/site00-business-growth-intelligence/clientContext.js';
import type {
  BusinessAmbitionGoalId,
  BusinessAmbitionIntake,
  BusinessGrowthServiceFamilyId,
  BusinessGrowthServiceId,
  GrowthDeliveryMilestone,
  GrowthRecommendationCategory,
  GrowthServiceRecommendation,
} from '../../../../shared/site00-business-growth-intelligence/types.js';
import type { DfPayload } from '../api';
import type { DfIconName } from '../icons';
import { formatMoney } from '../model';

export type GrowthContext = ClientBusinessGrowthContext;

/** Growth UI is shown only when the server attached an enabled context with the ambition intake flag on. */
export function growthOf(payload: DfPayload | null | undefined): GrowthContext | null {
  const g = payload?.business_growth ?? null;
  return g && g.active && g.flags.ambition_intake ? g : null;
}

// ─── G1 Business Ambition ──────────────────────────────────────────────────────────────────────

export const GOAL_PRESENTATION: Record<BusinessAmbitionGoalId, { title: string; sub: string; icon: DfIconName }> = {
  BE_FOUND_ONLINE: { title: 'BE FOUND ONLINE', sub: 'SHOW UP WHEN CUSTOMERS LOOK FOR YOU', icon: 'search' },
  BUILD_WEBSITE: { title: 'BUILD A DIGITAL LOCATION', sub: 'A PROFESSIONAL WEBSITE, BUILT WITH BLDR', icon: 'laptop' },
  ATTRACT_CUSTOMERS: { title: 'ATTRACT MORE CUSTOMERS', sub: 'TURN ATTENTION INTO INQUIRIES', icon: 'users' },
  FIND_GRANTS_FUNDING: { title: 'EXPLORE FUNDING OPPORTUNITIES', sub: 'PREPARE BEFORE YOU APPLY', icon: 'dollar' },
  PURSUE_BUSINESS_CONTRACTS: { title: 'PURSUE BUSINESS CONTRACTS', sub: 'BE READY FOR LARGER BUYERS', icon: 'handshake' },
  PURSUE_GOVERNMENT_CONTRACTS: { title: 'PURSUE GOVERNMENT CONTRACTS', sub: 'UNDERSTAND WHAT PUBLIC BUYERS ASK FOR', icon: 'building' },
  IMPROVE_CREDIBILITY: { title: 'IMPROVE CREDIBILITY', sub: 'LOOK ESTABLISHED WHEREVER YOU APPEAR', icon: 'shield' },
  AUTOMATE_SALES_FOLLOWUP: { title: 'AUTOMATE SALES FOLLOW-UP', sub: 'NEVER LET A LEAD GO QUIET', icon: 'route' },
  ORGANIZE_CRM: { title: 'ORGANIZE CUSTOMER RELATIONSHIPS', sub: 'EVERY CONTACT IN ONE PLACE', icon: 'layers' },
  PREPARE_EXPANSION: { title: 'PREPARE FOR EXPANSION', sub: 'NEW MARKETS, LOCATIONS OR TEAMS', icon: 'trend' },
  OTHER: { title: 'SOMETHING ELSE', sub: 'TELL US IN YOUR TOP PRIORITY', icon: 'flag' },
  NOT_SURE: { title: 'NOT SURE YET', sub: "WE'LL SUGGEST A STARTING POINT", icon: 'compass' },
};

/** NOT SURE is exclusive: choosing it clears specific goals, and choosing a goal clears NOT SURE. */
export function toggleGoal(goals: BusinessAmbitionGoalId[], id: BusinessAmbitionGoalId): BusinessAmbitionGoalId[] {
  if (goals.includes(id)) return goals.filter((g) => g !== id);
  if (id === 'NOT_SURE') return ['NOT_SURE'];
  return [...goals.filter((g) => g !== 'NOT_SURE'), id];
}

export type QuestionKind = 'bool' | 'text' | 'choice';

export const QUESTION_COPY: Record<AmbitionContextKey, { q: string; help: string; kind: QuestionKind; options?: string[]; placeholder?: string }> = {
  has_functioning_website: { q: 'DO YOU ALREADY HAVE A WEBSITE?', help: 'ONE THAT WORKS ON PHONES AND IS UP TO DATE.', kind: 'bool' },
  findable_in_search: {
    q: 'CAN CUSTOMERS FIND YOUR COMPANY ONLINE?',
    help: 'SEARCH YOUR BUSINESS NAME AND CITY. DO YOU APPEAR?',
    kind: 'bool',
  },
  has_professional_email: {
    q: 'DO YOU EMAIL FROM YOUR OWN DOMAIN?',
    help: 'LIKE YOU@YOURBUSINESS.COM. YOUR FOUNDATION SETS THIS UP EITHER WAY.',
    kind: 'bool',
  },
  receiving_inquiries: { q: 'ARE YOU RECEIVING BUSINESS INQUIRIES?', help: 'CALLS, EMAILS OR FORMS FROM NEW CUSTOMERS.', kind: 'bool' },
  pursues_private_contracts: { q: 'ARE YOU ACTIVELY SEEKING CONTRACTS?', help: 'WORK WITH OTHER BUSINESSES OR LARGER BUYERS.', kind: 'bool' },
  government_procurement_relevant: {
    q: 'DO YOU SELL, OR PLAN TO SELL, TO GOVERNMENT?',
    help: 'CITY, STATE OR FEDERAL AGENCIES.',
    kind: 'bool',
  },
  has_capabilities_statement: {
    q: 'DO YOU HAVE A CAPABILITIES STATEMENT?',
    help: 'A ONE-PAGE SUMMARY OF WHAT YOU DO THAT BUYERS ASK FOR. NOT SURE IS A FINE ANSWER.',
    kind: 'bool',
  },
  applied_for_grants_before: { q: 'HAVE YOU APPLIED FOR BUSINESS FUNDING BEFORE?', help: 'GRANTS, LOANS OR SUPPORT PROGRAMS.', kind: 'bool' },
  industry: { q: 'WHAT INDUSTRY ARE YOU IN?', help: 'IN YOUR OWN WORDS.', kind: 'text', placeholder: 'E.G. COMMERCIAL CLEANING' },
  geographic_markets: { q: 'WHERE DO YOU SERVE CUSTOMERS?', help: 'CITY, STATE OR REGION.', kind: 'text', placeholder: 'E.G. DALLAS–FORT WORTH' },
  business_stage: {
    q: 'WHERE IS YOUR BUSINESS TODAY?',
    help: 'CHOOSE THE CLOSEST.',
    kind: 'choice',
    options: ['JUST STARTING', 'ESTABLISHED', 'GROWING', 'EXPANDING'],
  },
  immediate_priority: {
    q: 'WHAT MATTERS MOST IN THE NEXT 90 DAYS?',
    help: 'OPTIONAL. ONE LINE IS PLENTY.',
    kind: 'text',
    placeholder: 'E.G. WIN OUR FIRST CITY CONTRACT',
  },
};

export type AmbitionDraft = {
  goals: BusinessAmbitionGoalId[];
  context: NonNullable<BusinessAmbitionIntake['context']>;
};

export function ambitionDraftFrom(g: GrowthContext): AmbitionDraft {
  return { goals: g.ambition?.skipped ? [] : [...(g.ambition?.goals ?? [])], context: { ...(g.ambition?.context ?? {}) } };
}

const FIELD_ORDER: AmbitionContextKey[] = [
  'has_functioning_website',
  'findable_in_search',
  'has_professional_email',
  'receiving_inquiries',
  'pursues_private_contracts',
  'government_procurement_relevant',
  'has_capabilities_statement',
  'applied_for_grants_before',
  'business_stage',
  'geographic_markets',
  'industry',
  'immediate_priority',
];

/** Canonical adaptive follow-ups for the goals on screen, minus anything the Foundation intake already answers. */
export function followUpsFor(goals: BusinessAmbitionGoalId[], known: GrowthContext['known_context']): AmbitionContextKey[] {
  const fields = adaptiveContextFieldsForGoals(goals);
  return FIELD_ORDER.filter((f) => fields.includes(f) && known[f] === undefined);
}

export function ambitionSummaryLine(goals: BusinessAmbitionGoalId[]): string {
  if (!goals.length) return 'NO GOALS SELECTED';
  return goals.map((g) => GOAL_PRESENTATION[g]?.title ?? g).join(' · ');
}

// ─── G2 Readiness ──────────────────────────────────────────────────────────────────────────────

export type ReadinessState = 'IN_PLACE' | 'IN_PROGRESS' | 'GAP' | 'TO_ASSESS' | 'NOT_A_FOCUS' | 'NOT_YET_OFFERED';

export const READINESS_LABEL: Record<ReadinessState, string> = {
  IN_PLACE: 'IN PLACE',
  IN_PROGRESS: 'IN PROGRESS',
  GAP: 'GAP IDENTIFIED',
  TO_ASSESS: 'ASSESSMENT PENDING',
  NOT_A_FOCUS: 'NOT A FOCUS',
  NOT_YET_OFFERED: 'NOT YET OFFERED',
};

export type ReadinessDimension = {
  id: 'FOUNDATION' | 'DISCOVERABILITY' | 'CREDIBILITY' | 'OPPORTUNITY' | 'SALES';
  title: string;
  state: ReadinessState;
  detail: string;
  icon: DfIconName;
};

const OPPORTUNITY_GOALS: BusinessAmbitionGoalId[] = ['FIND_GRANTS_FUNDING', 'PURSUE_BUSINESS_CONTRACTS', 'PURSUE_GOVERNMENT_CONTRACTS'];

/** States derive only from the client's own answers and the Foundation lifecycle — never a fabricated score. */
export function readinessDimensions(g: GrowthContext): ReadinessDimension[] {
  const goals = new Set(g.ambition?.goals ?? []);
  const ctx = { ...g.known_context, ...(g.ambition?.context ?? {}) };
  const f = g.lifecycle.foundation;
  const foundation: ReadinessDimension = {
    id: 'FOUNDATION',
    title: 'DIGITAL FOUNDATION',
    icon: 'globe',
    state: f === 'COMPLETE' ? 'IN_PLACE' : 'IN_PROGRESS',
    detail:
      f === 'COMPLETE'
        ? 'DOMAIN, EMAIL AND OWNERSHIP ARE ESTABLISHED.'
        : f === 'IN_PROGRESS'
          ? 'SITE 00 IS ESTABLISHING YOUR DOMAIN, EMAIL AND OWNERSHIP.'
          : 'YOUR DOMAIN, EMAIL AND OWNERSHIP ARE SCOPED IN THIS FOUNDATION.',
  };
  const discoverFocus = goals.has('BE_FOUND_ONLINE') || goals.has('ATTRACT_CUSTOMERS') || goals.has('BUILD_WEBSITE');
  const discoverability: ReadinessDimension = {
    id: 'DISCOVERABILITY',
    title: 'DISCOVERABILITY',
    icon: 'search',
    state:
      ctx.findable_in_search === true ? 'IN_PLACE' : ctx.findable_in_search === false ? 'GAP' : discoverFocus ? 'TO_ASSESS' : 'NOT_A_FOCUS',
    detail:
      ctx.findable_in_search === true
        ? 'YOU TOLD US CUSTOMERS CAN FIND YOU TODAY.'
        : ctx.findable_in_search === false
          ? "YOU TOLD US CUSTOMERS CAN'T FIND YOU YET."
          : discoverFocus
            ? 'A VISIBILITY REVIEW WOULD CONFIRM HOW YOU APPEAR.'
            : 'NOT PART OF THE GOALS YOU CHOSE.',
  };
  const credFocus = goals.has('IMPROVE_CREDIBILITY') || goals.has('BE_FOUND_ONLINE');
  const site = ctx.has_functioning_website;
  const credibility: ReadinessDimension = {
    id: 'CREDIBILITY',
    title: 'BUSINESS CREDIBILITY',
    icon: 'shield',
    state: site === false ? 'GAP' : site === true ? 'IN_PLACE' : credFocus ? 'TO_ASSESS' : 'IN_PROGRESS',
    detail:
      site === false
        ? 'NO WEBSITE YET. YOUR FOUNDATION GIVES YOU PROFESSIONAL EMAIL; A DIGITAL LOCATION IS A BLDR PROJECT.'
        : site === true
          ? 'YOU HAVE A WEBSITE. YOUR FOUNDATION ALIGNS DOMAIN AND EMAIL WITH IT.'
          : 'PROFESSIONAL EMAIL AT YOUR DOMAIN COMES WITH YOUR FOUNDATION.',
  };
  const oppFocus = OPPORTUNITY_GOALS.some((x) => goals.has(x));
  const opportunity: ReadinessDimension = {
    id: 'OPPORTUNITY',
    title: 'OPPORTUNITY READINESS',
    icon: 'target',
    state: !oppFocus ? 'NOT_A_FOCUS' : ctx.has_capabilities_statement === false ? 'GAP' : 'TO_ASSESS',
    detail: !oppFocus
      ? 'NOT PART OF THE GOALS YOU CHOSE.'
      : ctx.has_capabilities_statement === false
        ? 'NO CAPABILITIES STATEMENT YET — BUYERS USUALLY ASK FOR ONE.'
        : 'READINESS IS CONFIRMED BY A HUMAN-REVIEWED ASSESSMENT. NO PROGRAM HAS BEEN VERIFIED FOR YOU YET.',
  };
  const salesFocus = goals.has('AUTOMATE_SALES_FOLLOWUP') || goals.has('ORGANIZE_CRM');
  const sales: ReadinessDimension = {
    id: 'SALES',
    title: 'SALES INFRASTRUCTURE',
    icon: 'route',
    state: salesFocus ? 'NOT_YET_OFFERED' : ctx.receiving_inquiries === false ? 'GAP' : ctx.receiving_inquiries === true ? 'IN_PLACE' : 'NOT_A_FOCUS',
    detail: salesFocus
      ? 'SITE 00 HAS NO APPROVED SALES-SYSTEM SERVICE YET. WE NOTE IT FOR YOUR ROADMAP.'
      : ctx.receiving_inquiries === false
        ? 'YOU TOLD US INQUIRIES ARE NOT COMING IN YET.'
        : ctx.receiving_inquiries === true
          ? 'YOU TOLD US INQUIRIES ARE COMING IN.'
          : 'NOT PART OF THE GOALS YOU CHOSE.',
  };
  return [foundation, discoverability, credibility, opportunity, sales];
}

// ─── G2 Recommendations + services ─────────────────────────────────────────────────────────────

export const CATEGORY_PRESENTATION: Record<GrowthRecommendationCategory, { label: string; tone: 'red' | 'ink' | 'muted'; note: string }> = {
  NEEDED_NOW: { label: 'NEEDED NOW', tone: 'red', note: 'THE MOST IMPORTANT NEXT STEP FOR YOUR GOALS.' },
  RECOMMENDED_NEXT: { label: 'RECOMMENDED NEXT', tone: 'red', note: 'A STRONG NEXT STEP ONCE YOUR FOUNDATION IS IN PLACE.' },
  OPTIONAL: { label: 'OPTIONAL', tone: 'muted', note: 'USEFUL, NOT ESSENTIAL.' },
  FUTURE_OPPORTUNITY: { label: 'FUTURE OPPORTUNITY', tone: 'muted', note: 'FOR LATER — NOT AVAILABLE TODAY.' },
  SPECIALIST_REVIEW_REQUIRED: { label: 'SPECIALIST REVIEW', tone: 'ink', note: 'NEEDS A VERIFIED TARGET AND A HUMAN REVIEW FIRST.' },
  NOT_RECOMMENDED: { label: 'NOT RECOMMENDED', tone: 'muted', note: 'NOT A FIT FOR YOUR GOALS RIGHT NOW.' },
};

export const FAMILY_PRESENTATION: Record<BusinessGrowthServiceFamilyId, { title: string; sub: string; icon: DfIconName; empty: string }> = {
  VISIBILITY: { title: 'VISIBILITY', sub: 'HOW CUSTOMERS FIND YOU', icon: 'search', empty: '' },
  PRESENCE: { title: 'PRESENCE', sub: 'YOUR DIGITAL LOCATION', icon: 'laptop', empty: '' },
  OPPORTUNITY: { title: 'OPPORTUNITY', sub: 'GRANTS, CONTRACTS + PROGRAMS', icon: 'target', empty: '' },
  SALES_SYSTEMS: {
    title: 'SALES SYSTEMS',
    sub: 'LEADS, FOLLOW-UP + CRM',
    icon: 'route',
    empty: 'NO SALES-SYSTEM SERVICE IS OFFERED YET. TELL US IF IT MATTERS TO YOU AND WE NOTE IT ON YOUR ROADMAP.',
  },
  GROWTH_OPERATIONS: { title: 'GROWTH OPERATIONS', sub: 'ONGOING SUPPORT', icon: 'gear', empty: '' },
};

export function serviceOf(g: GrowthContext, id: BusinessGrowthServiceId): ClientGrowthService | undefined {
  return g.catalog.find((s) => s.service_id === id);
}

/** Pricing status in words. Planning ranges are labelled as such; nothing reads as a payable amount unless approved. */
export function priceStatus(s: ClientGrowthService): { label: string; detail: string; payable: boolean } {
  switch (s.commercial_status) {
    case 'FOUNDER_APPROVED':
      return s.proposed_price_min_minor != null
        ? { label: formatMoney(s.proposed_price_min_minor, s.proposed_currency), detail: 'APPROVED PRICE', payable: true }
        : { label: 'PRICE ON REQUEST', detail: 'APPROVED SERVICE', payable: false };
    case 'PROPOSED_NOT_ACTIVE':
      return s.proposed_price_min_minor != null && s.proposed_price_max_minor != null
        ? {
            label: `${formatMoney(s.proposed_price_min_minor, s.proposed_currency)}–${formatMoney(s.proposed_price_max_minor, s.proposed_currency)}`,
            detail: 'PLANNING RANGE · PRICING PENDING APPROVAL',
            payable: false,
          }
        : { label: 'PRICING PENDING', detail: 'AWAITING FOUNDER APPROVAL', payable: false };
    case 'CUSTOM_QUOTE_REQUIRED':
      return { label: 'CUSTOM QUOTE', detail: 'SCOPED AND PRICED BY SITE 00', payable: false };
    case 'BLDR_ESTIMATOR_AUTHORITY':
      return { label: 'BLDR ESTIMATE', detail: 'SEPARATE BLDR PROJECT QUOTE', payable: false };
    case 'FUTURE_NOT_ACTIVE':
    default:
      return { label: 'NOT YET AVAILABLE', detail: 'PLANNED FOR A LATER RELEASE', payable: false };
  }
}

function dayRange(min: number, max: number): string {
  return min === max ? `${min} BUSINESS DAY${min === 1 ? '' : 'S'}` : `${min}–${max} BUSINESS DAYS`;
}

export function deliveryStatus(s: ClientGrowthService): { label: string; detail: string } {
  const d = s.delivery;
  const track = d.parallelizable_with_foundation ? 'DOES NOT HOLD UP YOUR FOUNDATION' : 'FOLLOWS YOUR FOUNDATION';
  if (d.estimated_min_business_days != null && d.estimated_max_business_days != null) {
    return { label: dayRange(d.estimated_min_business_days, d.estimated_max_business_days), detail: track };
  }
  switch (d.delivery_unit) {
    case 'MONTHS':
      return { label: 'MONTH-SCALE PROJECT', detail: 'TIMELINE SET BY THE BLDR ESTIMATOR' };
    case 'RECURRING':
      return { label: 'ONGOING', detail: 'WHEN ACTIVATED' };
    default:
      return { label: 'SCOPED CASE BY CASE', detail: track };
  }
}

export type ServiceCard = {
  service: ClientGrowthService;
  recommendation: GrowthServiceRecommendation | null;
  selected: boolean;
  price: ReturnType<typeof priceStatus>;
  delivery: ReturnType<typeof deliveryStatus>;
  dependsOn: string[];
};

export function serviceCard(g: GrowthContext, s: ClientGrowthService, selectedIds: Set<string>): ServiceCard {
  return {
    service: s,
    recommendation: g.recommendations.find((r) => r.service_id === s.service_id) ?? null,
    selected: selectedIds.has(s.service_id),
    price: priceStatus(s),
    delivery: deliveryStatus(s),
    dependsOn: s.dependencies.map((d) => serviceOf(g, d)?.display_name.toUpperCase() ?? d),
  };
}

/** Recommendations in engine order (suggested_sequence), resolved to visible catalog services. */
export function recommendationCards(g: GrowthContext, selectedIds: Set<string>): ServiceCard[] {
  return g.recommendations
    .map((r) => serviceOf(g, r.service_id))
    .filter((s): s is ClientGrowthService => Boolean(s))
    .map((s) => serviceCard(g, s, selectedIds));
}

export function familyGroups(g: GrowthContext, selectedIds: Set<string>) {
  return g.families.map((f) => ({
    family_id: f.family_id,
    ...FAMILY_PRESENTATION[f.family_id],
    cards: f.services
      .map((id) => serviceOf(g, id))
      .filter((s): s is ClientGrowthService => Boolean(s))
      .map((s) => serviceCard(g, s, selectedIds)),
  }));
}

export const WEBSITE_GOALS: BusinessAmbitionGoalId[] = ['BUILD_WEBSITE'];

export function wantsDigitalLocation(g: GrowthContext, selectedIds: Set<string>): boolean {
  return (g.ambition?.goals ?? []).some((x) => WEBSITE_GOALS.includes(x)) || selectedIds.has('BGI.PRESENCE_LAUNCH');
}

export function hasOpportunityInterest(g: GrowthContext): boolean {
  return (g.ambition?.goals ?? []).some((x) => OPPORTUNITY_GOALS.includes(x));
}

// ─── G3 Investment ─────────────────────────────────────────────────────────────────────────────

export type InvestmentSection = {
  id: 'BASE' | 'ADDONS' | 'GROWTH' | 'BLDR' | 'THIRD_PARTY' | 'RECURRING';
  label: string;
  value: string;
  caption: string;
  lines: { label: string; value: string; note: string }[];
  inCheckout: boolean;
};

export function investmentSections(g: GrowthContext, payload: DfPayload): InvestmentSection[] {
  const q = g.unified_quote;
  const currency = payload.quote?.currency ?? 'USD';
  const adj = payload.quote?.manual_adjustments_minor ?? 0;
  const addons = payload.quote?.selected_addons ?? [];
  return [
    {
      id: 'BASE',
      label: 'FOUNDATION BASE',
      value: formatMoney(q.foundation_base_minor, currency),
      caption: 'DOMAIN, EMAIL, SECURITY, OWNERSHIP',
      lines: [],
      inCheckout: true,
    },
    {
      id: 'ADDONS',
      label: 'FOUNDATION TECHNICAL ADD-ONS',
      value: q.foundation_addon_minor > 0 ? `+${formatMoney(q.foundation_addon_minor, currency)}` : 'NONE',
      caption: addons.length ? `${addons.length} ADD-ON${addons.length === 1 ? '' : 'S'} FROM YOUR RECOMMENDATION` : 'CHOSEN ON YOUR RECOMMENDATION',
      lines:
        adj !== 0
          ? [{ label: 'SITE 00 ADJUSTMENT', value: `${adj > 0 ? '+' : '−'}${formatMoney(Math.abs(adj), currency)}`, note: 'APPLIED TO YOUR QUOTE' }]
          : [],
      inCheckout: true,
    },
    {
      id: 'GROWTH',
      label: 'BUSINESS GROWTH SERVICES',
      value: q.growth_lines.length ? (q.growth_subtotal_minor != null ? formatMoney(q.growth_subtotal_minor, currency) : 'NOT CHARGED') : 'NONE SELECTED',
      caption: q.growth_lines.length ? q.growth_subtotal_display.toUpperCase() : 'OPTIONAL — ADD ON YOUR GROWTH PATH',
      lines: q.growth_lines.map((l) => ({
        label: l.label.toUpperCase(),
        value:
          l.line_total_minor != null
            ? formatMoney(l.line_total_minor, currency)
            : (() => {
                const svc = serviceOf(g, l.service_id);
                const p = svc ? priceStatus(svc) : null;
                return p ? (p.detail.startsWith('PLANNING RANGE') ? `PLANNING RANGE ${p.label}` : p.label) : 'PRICING PENDING';
              })(),
        note: l.requires_manual_review ? 'CONFIRMED BY SITE 00 BEFORE ANYTHING IS PAYABLE' : 'APPROVED',
      })),
      inCheckout: false,
    },
    {
      id: 'BLDR',
      label: 'BLDR PROJECTS',
      value: q.bldr_scope.status === 'NONE' ? 'NONE' : 'SEPARATE ESTIMATE',
      caption: q.bldr_scope.status === 'NONE' ? 'A DIGITAL LOCATION IS SCOPED SEPARATELY' : 'QUOTED BY THE BLDR ESTIMATOR — NOT PART OF THIS CHECKOUT',
      lines: [],
      inCheckout: false,
    },
    {
      id: 'THIRD_PARTY',
      label: 'THIRD-PARTY FEES',
      value: 'BILLED BY PROVIDERS',
      caption: q.third_party_notice.toUpperCase(),
      lines: [],
      inCheckout: false,
    },
    {
      id: 'RECURRING',
      label: 'FUTURE RECURRING SERVICES',
      value: 'NOT ACTIVE',
      caption: 'NOTHING RECURRING IS BILLED BY SITE 00 TODAY',
      lines: q.recurring_lines.map((r) => ({ label: r.label.toUpperCase(), value: 'NOT ACTIVATED', note: '' })),
      inCheckout: false,
    },
  ];
}

/** The amount payable at Foundation checkout — the Foundation quote only; Growth is never in this total. */
export function checkoutTotal(g: GrowthContext, payload: DfPayload): string {
  if (payload.quote) return formatMoney(payload.quote.subtotal_minor, payload.quote.currency);
  return formatMoney(g.unified_quote.foundation_subtotal_minor, 'USD');
}

// ─── G3 Delivery timeline ──────────────────────────────────────────────────────────────────────

export type TimelineTrack = {
  id: string;
  kind: GrowthDeliveryMilestone['kind'];
  label: string;
  range: string;
  status: GrowthDeliveryMilestone['status'];
  /** Percent positions on the shared business-day scale; null for work scoped outside this estimate. */
  start: number | null;
  firm: number | null;
  end: number | null;
  note: string;
};

export type TimelineView = {
  scaleMax: number;
  ticks: number[];
  tracks: TimelineTrack[];
  foundationReady: string;
  fullProject: string;
  sameAsFoundation: boolean;
};

function upper(s: string | null | undefined): string {
  return (s ?? '').toUpperCase();
}

/**
 * Lays the engine's milestones on one business-day scale. Positions follow `projectGrowthDelivery`: Foundation runs
 * from day 0; each Growth window is measured from Foundation ready, and the full-project marker is the engine's
 * own maximum. No duration is summed or invented here.
 */
export function timelineView(g: GrowthContext): TimelineView {
  const d = g.delivery;
  const fMin = d.foundation_ready_min_days;
  const fMax = d.foundation_ready_max_days;
  const full = d.full_project_max_days ?? fMax;
  const scaleMax = Math.max(full, fMax, 1);
  const pct = (n: number) => Math.round((n / scaleMax) * 1000) / 10;
  const status = (m: GrowthDeliveryMilestone) => g.milestone_status[m.milestone_id] ?? m.status;
  const tracks: TimelineTrack[] = d.milestones.map((m) => {
    if (m.kind === 'FOUNDATION_READY') {
      return { id: m.milestone_id, kind: m.kind, label: 'FOUNDATION READY', range: upper(m.display_range), status: status(m), start: 0, firm: pct(fMin), end: pct(fMax), note: 'DOMAIN, EMAIL, SECURITY, OWNERSHIP' };
    }
    if (m.kind === 'FULL_PROJECT') {
      return { id: m.milestone_id, kind: m.kind, label: 'FULL PROJECT DELIVERY', range: upper(m.display_range), status: status(m), start: 0, firm: pct(d.full_project_min_days ?? fMin), end: pct(full), note: 'EVERYTHING IN YOUR CURRENT PLAN' };
    }
    if (m.kind === 'BLDR_OPPORTUNITY') {
      return { id: m.milestone_id, kind: m.kind, label: upper(m.label), range: upper(m.display_range), status: status(m), start: null, firm: null, end: null, note: 'MONTH-SCALE — ESTIMATED SEPARATELY BY BLDR' };
    }
    const hasDays = m.estimated_min_business_days != null && m.estimated_max_business_days != null;
    return {
      id: m.milestone_id,
      kind: m.kind,
      label: upper(m.label),
      range: upper(m.display_range),
      status: status(m),
      start: hasDays ? pct(fMax) : null,
      firm: hasDays ? pct(fMax + (m.estimated_min_business_days as number)) : null,
      end: hasDays ? pct(Math.min(scaleMax, fMax + (m.estimated_max_business_days as number))) : null,
      note: hasDays ? 'CONTINUES AFTER FOUNDATION READY' : 'SCOPED AFTER REVIEW',
    };
  });
  const step = scaleMax <= 10 ? 1 : scaleMax <= 30 ? 5 : 10;
  const ticks: number[] = [];
  for (let t = 0; t <= scaleMax; t += step) ticks.push(t);
  return {
    scaleMax,
    ticks,
    tracks,
    foundationReady: upper(d.milestones.find((m) => m.kind === 'FOUNDATION_READY')?.display_range),
    fullProject: upper(d.milestones.find((m) => m.kind === 'FULL_PROJECT')?.display_range),
    sameAsFoundation: full === fMax && (d.full_project_min_days ?? fMin) === fMin,
  };
}

export const MILESTONE_STATUS_LABEL: Record<GrowthDeliveryMilestone['status'], string> = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN PROGRESS',
  COMPLETE: 'COMPLETE',
  BLOCKED: 'BLOCKED',
};

// ─── G4 Roadmap + portal ───────────────────────────────────────────────────────────────────────

export const LIFECYCLE_LABEL = {
  foundation: { NOT_PURCHASED: 'NOT YET PURCHASED', IN_PROGRESS: 'IN PROGRESS', COMPLETE: 'FOUNDATION COMPLETE' },
  growth: { NONE_SELECTED: 'NO GROWTH SERVICES SELECTED', AWAITING_FOUNDER_APPROVAL: 'AWAITING SCOPE + PRICING APPROVAL' },
  full_engagement: { NOT_STARTED: 'NOT STARTED', IN_PROGRESS: 'IN PROGRESS', COMPLETE: 'FULL ENGAGEMENT COMPLETE' },
} as const;

export type RoadmapActionItem = { label: string; detail: string };

/** What the client can do next: open Foundation actions, then information the recommendations still need. */
export function roadmapActions(g: GrowthContext, payload: DfPayload): RoadmapActionItem[] {
  const out: RoadmapActionItem[] = payload.client_actions
    .filter((a) => a.status === 'OPEN')
    .map((a) => ({ label: a.title.toUpperCase(), detail: a.detail.toUpperCase() }));
  const seen = new Set<string>();
  for (const r of g.recommendations) {
    for (const m of r.missing_information) {
      const key = m.toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ label: `TELL US: ${key}`, detail: `HELPS SITE 00 SCOPE ${serviceOf(g, r.service_id)?.display_name.toUpperCase() ?? 'YOUR NEXT STEP'}` });
    }
  }
  return out;
}

export function selectedServices(g: GrowthContext): ClientGrowthService[] {
  return g.selection.selected.map((s) => serviceOf(g, s.service_id)).filter((s): s is ClientGrowthService => Boolean(s));
}

export function roadmapVersionLine(g: GrowthContext): string {
  const when = g.selection.updated_at ?? g.roadmap.updated_at;
  const date = new Date(when).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  const state = g.roadmap.founder_approval_state === 'APPROVED' ? 'REVIEWED BY SITE 00' : 'DRAFT — SITE 00 REVIEWS BEFORE ANY WORK BEGINS';
  return `ROADMAP V${g.roadmap.roadmap_version} · UPDATED ${date} · ${state}`;
}
