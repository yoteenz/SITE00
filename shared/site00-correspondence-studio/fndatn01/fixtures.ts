/**
 * FNDATN-01 demo scenarios. Nonproduction, review-only data for Correspondence Studio.
 *
 * One fictional client moves through one timeline: the same artifact, the same quote, the same amount
 * and the same references in every snapshot, so no two scenarios disagree. Addresses use the reserved
 * `.invalid` TLD, ids carry a `demo` prefix and the public token resolves to nothing. Send mode refuses
 * any payload `isFndatn01DemoPayload` recognises, so these values can never reach a client, a payment
 * or a production record.
 */
import {
  DIGITAL_FOUNDATION_SERVICE_ID,
  type ArtifactEvent,
  type ArtifactEventType,
  type DigitalFoundationArtifactPayload,
  type DigitalFoundationQuote,
  type ProjectStageCode,
} from '../../site00-digital-foundation/types.js';
import type { Fndatn01Context } from './contracts.js';
import type { Fndatn01EmailId } from './pack.js';

export const FNDATN01_DEMO_SCENARIO_IDS = [
  'INVITED',
  'INTAKE_IN_PROGRESS',
  'INTAKE_SUBMITTED',
  'QUOTE_READY_UNPAID',
  'QUOTE_EXPIRING_UNPAID',
  'PAID_PROJECT_ACTIVE',
  'FOUNDATION_VERIFIED_COMPLETE',
] as const;

export type Fndatn01DemoScenarioId = (typeof FNDATN01_DEMO_SCENARIO_IDS)[number];

/** Fictional demo client. Not a person, business, mailbox or domain that exists. */
export const FNDATN01_DEMO_CLIENT = {
  name: 'Jordan Avery',
  business: 'Avery Studio',
  email: 'jordan@avery-studio.invalid',
  domain: 'avery-studio.invalid',
  mailbox: 'hello@avery-studio.invalid',
} as const;

export const FNDATN01_DEMO_IDS = {
  artifact: 'df-demo-0001',
  token: 'demo-fndatn01-jordan-avery',
  lead: 'lead-demo-0001',
  quote: 'q-demo-0001',
  actor: 'DEMO_FIXTURE',
} as const;

export const FNDATN01_DEMO_NOTE = 'DEMO DATA · FICTIONAL CLIENT · NOT A REAL CLIENT, PAYMENT OR RECORD';

/** The single demo timeline (UTC), in chronological order. Every scenario snapshot reads from it. */
export const FNDATN01_DEMO_TIMELINE = {
  invited: '2026-09-28T14:00:00.000Z',
  opened: '2026-09-29T13:10:00.000Z',
  intakeStarted: '2026-09-29T13:15:00.000Z',
  intakeSaved: '2026-09-29T13:42:00.000Z',
  intakeSubmitted: '2026-10-02T16:24:00.000Z',
  quoteIssued: '2026-10-05T14:00:00.000Z',
  quoteViewed: '2026-10-06T15:20:00.000Z',
  paid: '2026-10-19T14:30:00.000Z',
  activated: '2026-10-19T14:30:05.000Z',
  /** The quote's own deadline (11:59 PM ET, Oct 19): paid with half a day to spare. */
  quoteExpires: '2026-10-20T03:59:00.000Z',
  stagesComplete: '2026-10-26T18:00:00.000Z',
  verified: '2026-10-27T15:00:00.000Z',
  completed: '2026-10-27T16:00:00.000Z',
} as const;

const T = FNDATN01_DEMO_TIMELINE;

/** The moment each snapshot is viewed. Each one is an instant the matching email could legitimately be sent. */
const SCENARIO_NOW: Record<Fndatn01DemoScenarioId, string> = {
  INVITED: '2026-09-28T14:05:00.000Z',
  INTAKE_IN_PROGRESS: '2026-10-01T14:00:00.000Z',
  INTAKE_SUBMITTED: '2026-10-02T16:25:00.000Z',
  QUOTE_READY_UNPAID: '2026-10-05T14:05:00.000Z',
  QUOTE_EXPIRING_UNPAID: '2026-10-18T15:00:00.000Z',
  PAID_PROJECT_ACTIVE: '2026-10-19T14:35:00.000Z',
  FOUNDATION_VERIFIED_COMPLETE: '2026-10-27T16:05:00.000Z',
};

export const FNDATN01_DEMO_LABELS: Record<Fndatn01DemoScenarioId, string> = {
  INVITED: 'DEMO · INVITED',
  INTAKE_IN_PROGRESS: 'DEMO · INTAKE IN PROGRESS',
  INTAKE_SUBMITTED: 'DEMO · INTAKE SUBMITTED',
  QUOTE_READY_UNPAID: 'DEMO · QUOTE READY · UNPAID',
  QUOTE_EXPIRING_UNPAID: 'DEMO · QUOTE EXPIRING · UNPAID',
  PAID_PROJECT_ACTIVE: 'DEMO · PAID · PROJECT ACTIVE',
  FOUNDATION_VERIFIED_COMPLETE: 'DEMO · FOUNDATION VERIFIED · COMPLETE',
};

/** The scenario each email is reviewed in. */
export const FNDATN01_EMAIL_SCENARIO: Record<Fndatn01EmailId, Fndatn01DemoScenarioId> = {
  '01': 'INVITED',
  '02': 'INTAKE_SUBMITTED',
  '03': 'QUOTE_READY_UNPAID',
  '04': 'PAID_PROJECT_ACTIVE',
  '05': 'FOUNDATION_VERIFIED_COMPLETE',
  '06': 'INTAKE_IN_PROGRESS',
  '07': 'QUOTE_EXPIRING_UNPAID',
};

export type Fndatn01DemoVariant = 'default' | 'activation_pending';

export type Fndatn01DemoScenario = {
  id: Fndatn01DemoScenarioId;
  label: string;
  context: Fndatn01Context;
  payload: DigitalFoundationArtifactPayload;
};

const DEMO_CONTEXT = { siteOrigin: 'https://site00.com', timeZone: 'America/New_York', timeZoneLabel: 'ET' } as const;

function event(id: string, type: ArtifactEventType, at: string, payload: Record<string, unknown> = {}): ArtifactEvent {
  return { event_id: `evt-demo-${id}`, artifact_id: FNDATN01_DEMO_IDS.artifact, event_type: type, actor: FNDATN01_DEMO_IDS.actor, payload, created_at: at };
}

function invited(): DigitalFoundationArtifactPayload {
  return {
    artifact: {
      artifact_id: FNDATN01_DEMO_IDS.artifact,
      public_token: FNDATN01_DEMO_IDS.token,
      lead_id: FNDATN01_DEMO_IDS.lead,
      client_org_id: null,
      contact_id: null,
      referral_source_id: null,
      service_id: DIGITAL_FOUNDATION_SERVICE_ID,
      state: 'INVITED',
      intake_state: 'NOT_STARTED',
      quote_id: null,
      payment_state: 'NONE',
      project_state: 'NOT_STARTED',
      completion_state: 'NOT_STARTED',
      build_interest: 'NONE',
      build_recommendation: 'NONE',
      foundation_credit_id: null,
      intake: { needs: [] },
      created_at: T.invited,
      opened_at: null,
      last_activity_at: T.invited,
      completed_at: null,
    },
    lead: {
      lead_id: FNDATN01_DEMO_IDS.lead,
      contact_email: FNDATN01_DEMO_CLIENT.email,
      contact_name: FNDATN01_DEMO_CLIENT.name,
      business_name: FNDATN01_DEMO_CLIENT.business,
      referral_source_id: null,
      referral_funnel_stage: 'REFERRED',
      created_at: T.invited,
    },
    referral_source: null,
    quote: null,
    recommendation: null,
    acceptance: null,
    stages: [],
    client_actions: [],
    approvals: [],
    ownership_record: null,
    build_readiness: null,
    credit: null,
    events: [event('created', 'ARTIFACT_CREATED', T.invited)],
    surface: 'PROSPECT',
  };
}

/** One quote for the whole timeline: $1,234.00 base + two additional mailboxes = $1,334.00 USD. */
function demoQuote(status: DigitalFoundationQuote['status']): DigitalFoundationQuote {
  return {
    quote_id: FNDATN01_DEMO_IDS.quote,
    artifact_id: FNDATN01_DEMO_IDS.artifact,
    base_service_version: 'demo',
    base_price_minor: 123400,
    selected_addons: [{ addon_id: 'ADDITIONAL_MAILBOX', quantity: 2, unit_price_minor: 5000, line_total_minor: 10000, requires_manual_review: false }],
    addon_total_minor: 10000,
    manual_adjustments_minor: 0,
    subtotal_minor: 133400,
    currency: 'USD',
    projected_min_days: 5,
    projected_max_days: 10,
    timeline_custom_review: false,
    third_party_cost_notice: 'Demo notice.',
    quote_version: 1,
    status,
    founder_commercial_ready: true,
    founder_commercial_ready_at: T.quoteIssued,
    created_at: T.quoteIssued,
    expires_at: T.quoteExpires,
  };
}

const RECOMMENDATION = {
  title: 'Your Digital Foundation',
  recommended_addons: [],
  site00_handles: [],
  client_must_provide: [],
  third_party_costs: [],
  projected_investment_minor: 133400,
  projected_min_days: 5,
  projected_max_days: 10,
  timeline_custom_review: false,
  dependencies: [],
  manual_review: false,
  manual_review_reasons: [],
};

const STAGES: readonly ProjectStageCode[] = [
  '01_DETAILS_RECEIVED',
  '02_DOMAIN',
  '03_PROFESSIONAL_EMAIL',
  '04_DNS_SECURITY',
  '05_DEVICE_SIGNATURE',
  '06_FINAL_VERIFICATION',
  '07_FOUNDATION_COMPLETE',
];

/** Apply the timeline up to and including `upTo`. Each step only adds what that milestone persists. */
function snapshot(upTo: Fndatn01DemoScenarioId, variant: Fndatn01DemoVariant): DigitalFoundationArtifactPayload {
  const p = invited();
  const a = p.artifact;
  const reached = (id: Fndatn01DemoScenarioId) => FNDATN01_DEMO_SCENARIO_IDS.indexOf(id) <= FNDATN01_DEMO_SCENARIO_IDS.indexOf(upTo);

  if (reached('INTAKE_IN_PROGRESS')) {
    a.state = 'INTAKE_IN_PROGRESS';
    a.intake_state = 'IN_PROGRESS';
    a.opened_at = T.opened;
    a.last_activity_at = T.intakeSaved;
    a.intake = { business_name: FNDATN01_DEMO_CLIENT.business, needs: ['NEED_DOMAIN'] };
    p.events.push(
      event('opened', 'LINK_OPENED', T.opened),
      event('started', 'INTAKE_STARTED', T.intakeStarted),
      event('saved', 'INTAKE_UPDATED', T.intakeSaved),
    );
  }
  if (reached('INTAKE_SUBMITTED')) {
    a.state = 'INTAKE_COMPLETE';
    a.intake_state = 'COMPLETE';
    a.last_activity_at = T.intakeSubmitted;
    a.intake = { business_name: FNDATN01_DEMO_CLIENT.business, contact_name: FNDATN01_DEMO_CLIENT.name, needs: ['NEED_DOMAIN', 'NEED_PRO_EMAIL'] };
    p.events.push(event('submitted', 'INTAKE_COMPLETED', T.intakeSubmitted));
  }
  if (reached('QUOTE_READY_UNPAID')) {
    a.state = 'QUOTE_READY';
    a.quote_id = FNDATN01_DEMO_IDS.quote;
    a.last_activity_at = T.quoteIssued;
    p.quote = demoQuote('READY');
    p.recommendation = RECOMMENDATION;
    p.events.push(event('quote', 'QUOTE_CREATED', T.quoteIssued));
  }
  if (reached('QUOTE_EXPIRING_UNPAID')) {
    p.quote = demoQuote('CLIENT_REVIEW');
    a.last_activity_at = T.quoteViewed;
  }
  if (reached('PAID_PROJECT_ACTIVE')) {
    const pending = variant === 'activation_pending';
    a.state = pending ? 'PAID' : 'IN_PROGRESS';
    a.payment_state = 'PAID';
    a.project_state = pending ? 'NOT_STARTED' : 'ACTIVE';
    a.last_activity_at = pending ? T.paid : T.activated;
    p.quote = demoQuote('PAID');
    p.events.push(event('paid', 'PAYMENT_CONFIRMED', T.paid, { event_id: 'evt_demo_checkout' }));
    if (!pending) p.events.push(event('active', 'PROJECT_ACTIVATED', T.activated));
  }
  if (reached('FOUNDATION_VERIFIED_COMPLETE')) {
    a.state = 'COMPLETE';
    a.project_state = 'COMPLETE';
    a.completion_state = 'COMPLETE';
    a.completed_at = T.completed;
    a.last_activity_at = T.completed;
    p.ownership_record = {
      business: FNDATN01_DEMO_CLIENT.business,
      domain: FNDATN01_DEMO_CLIENT.domain,
      registrar: 'Demo Registrar',
      renewal_date: '2027-10-27',
      email_provider: 'Demo Mail',
      primary_mailbox: FNDATN01_DEMO_CLIENT.mailbox,
      aliases: [],
      dns_status: 'Verified',
      security_status: 'Verified',
      owner: FNDATN01_DEMO_CLIENT.name,
      administrative_access_model: 'Client owned',
    };
    p.stages = STAGES.map((stage_code) => ({ stage_code, status: 'COMPLETE' as const, updated_at: T.stagesComplete }));
    p.events.push(event('verified', 'FOUNDATION_VERIFIED', T.verified), event('complete', 'FOUNDATION_COMPLETED', T.completed));
  }
  return p;
}

/** A fresh, independent copy of one scenario. `activation_pending` only applies to PAID_PROJECT_ACTIVE. */
export function demoScenario(id: Fndatn01DemoScenarioId, variant: Fndatn01DemoVariant = 'default'): Fndatn01DemoScenario {
  if (variant !== 'default' && id !== 'PAID_PROJECT_ACTIVE') throw new Error(`FNDATN-01 demo variant ${variant} does not apply to ${id}`);
  return {
    id,
    label: variant === 'activation_pending' ? 'DEMO · PAID · ACTIVATION PENDING' : FNDATN01_DEMO_LABELS[id],
    context: { ...DEMO_CONTEXT, now: new Date(SCENARIO_NOW[id]) },
    payload: snapshot(id, variant),
  };
}

/** Demo payload for an email's review scenario. */
export function fixtureFor(id: Fndatn01EmailId, variant: Fndatn01DemoVariant = 'default'): DigitalFoundationArtifactPayload {
  return demoScenario(FNDATN01_EMAIL_SCENARIO[id], variant).payload;
}

/** The instant an email's review scenario is viewed at. */
export function fixtureContextFor(id: Fndatn01EmailId): Fndatn01Context {
  return demoScenario(FNDATN01_EMAIL_SCENARIO[id]).context;
}

/** True for any payload built from these demo scenarios. Send mode refuses them. */
export function isFndatn01DemoPayload(p: DigitalFoundationArtifactPayload): boolean {
  return (
    p.artifact.artifact_id.startsWith('df-demo-') ||
    p.artifact.public_token.startsWith('demo-fndatn01-') ||
    p.lead.lead_id.startsWith('lead-demo-') ||
    p.events.some((e) => e.actor === FNDATN01_DEMO_IDS.actor)
  );
}
