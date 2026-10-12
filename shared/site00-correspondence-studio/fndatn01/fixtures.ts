/**
 * Disposable, nonproduction FNDATN-01 fixtures. Fictional client, reserved `.invalid` addresses,
 * fixture tokens that resolve to nothing. Never a real client, token, address or amount.
 */
import {
  DIGITAL_FOUNDATION_SERVICE_ID,
  type ArtifactEvent,
  type ArtifactEventType,
  type DigitalFoundationArtifactPayload,
} from '../../site00-digital-foundation/types.js';
import type { Fndatn01Context } from './contracts.js';
import type { Fndatn01EmailId } from './pack.js';

export const FNDATN01_FIXTURE_CONTEXT: Fndatn01Context = {
  now: new Date('2026-10-12T15:00:00.000Z'),
  siteOrigin: 'https://site00.com',
  timeZone: 'America/New_York',
  timeZoneLabel: 'ET',
};

export const FNDATN01_FIXTURE_NOTE = 'DISPOSABLE FIXTURE · CLIENT EXAMPLE · NOT A REAL CLIENT · DOTTED RULE = PERSONALIZED FIELD';

function event(id: string, type: ArtifactEventType, at: string, payload: Record<string, unknown> = {}): ArtifactEvent {
  return { event_id: `evt-fixture-${id}`, artifact_id: 'df-fixture-0001', event_type: type, actor: 'FIXTURE', payload, created_at: at };
}

export function basePayload(): DigitalFoundationArtifactPayload {
  return {
    artifact: {
      artifact_id: 'df-fixture-0001',
      public_token: 'fixture-fndatn01-client-example',
      lead_id: 'lead-fixture-0001',
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
      created_at: '2026-10-01T14:00:00.000Z',
      opened_at: null,
      last_activity_at: '2026-10-01T14:00:00.000Z',
      completed_at: null,
    },
    lead: {
      lead_id: 'lead-fixture-0001',
      contact_email: 'client@example.invalid',
      contact_name: 'Client Example',
      business_name: 'Example Studio',
      referral_source_id: null,
      referral_funnel_stage: 'REFERRED',
      created_at: '2026-10-01T14:00:00.000Z',
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
    events: [event('created', 'ARTIFACT_CREATED', '2026-10-01T14:00:00.000Z')],
    surface: 'PROSPECT',
  };
}

function quote(status: 'READY' | 'CLIENT_REVIEW' | 'PAID', createdAt: string, expiresAt: string) {
  return {
    quote_id: 'q-fixture-0001',
    artifact_id: 'df-fixture-0001',
    base_service_version: 'fixture',
    base_price_minor: 123400,
    selected_addons: [{ addon_id: 'ADDITIONAL_MAILBOX' as const, quantity: 2, unit_price_minor: 5000, line_total_minor: 10000, requires_manual_review: false }],
    addon_total_minor: 10000,
    manual_adjustments_minor: 0,
    subtotal_minor: 133400,
    currency: 'USD',
    projected_min_days: 5,
    projected_max_days: 10,
    timeline_custom_review: false,
    third_party_cost_notice: 'Fixture notice.',
    quote_version: 1,
    status,
    founder_commercial_ready: true,
    founder_commercial_ready_at: createdAt,
    created_at: createdAt,
    expires_at: expiresAt,
  };
}

const RECOMMENDATION = {
  title: 'Digital Foundation',
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

export type Fndatn01FixtureVariant = 'default' | 'activation_pending' | 'stress_long' | 'stress_short';

export function fixtureFor(id: Fndatn01EmailId, variant: Fndatn01FixtureVariant = 'default'): DigitalFoundationArtifactPayload {
  if (variant === 'stress_long' || variant === 'stress_short') return stressFixture(id, variant);
  const p = basePayload();
  const a = p.artifact;
  switch (id) {
    case '01':
      return p;
    case '02':
      a.state = 'INTAKE_COMPLETE';
      a.intake_state = 'COMPLETE';
      a.opened_at = '2026-10-02T15:10:00.000Z';
      a.intake = { business_name: 'Example Studio', contact_name: 'Client Example', needs: ['NEED_DOMAIN', 'NEED_PRO_EMAIL'] };
      p.events.push(event('opened', 'LINK_OPENED', '2026-10-02T15:10:00.000Z'), event('submitted', 'INTAKE_COMPLETED', '2026-10-09T16:24:00.000Z'));
      return p;
    case '03':
      a.state = 'QUOTE_READY';
      a.intake_state = 'COMPLETE';
      p.quote = quote('READY', '2026-10-11T14:00:00.000Z', '2026-11-10T04:59:00.000Z');
      p.recommendation = RECOMMENDATION;
      p.events.push(event('quote', 'QUOTE_CREATED', '2026-10-11T14:00:00.000Z'));
      return p;
    case '04': {
      a.state = variant === 'activation_pending' ? 'PAID' : 'IN_PROGRESS';
      a.intake_state = 'COMPLETE';
      a.payment_state = 'PAID';
      a.project_state = variant === 'activation_pending' ? 'NOT_STARTED' : 'ACTIVE';
      p.quote = quote('PAID', '2026-10-11T14:00:00.000Z', '2026-11-10T04:59:00.000Z');
      p.events.push(event('paid', 'PAYMENT_CONFIRMED', '2026-10-11T19:30:00.000Z', { event_id: 'evt_fixture_stripe' }));
      if (variant !== 'activation_pending') p.events.push(event('active', 'PROJECT_ACTIVATED', '2026-10-11T19:30:05.000Z'));
      return p;
    }
    case '05':
      a.state = 'COMPLETE';
      a.intake_state = 'COMPLETE';
      a.payment_state = 'PAID';
      a.project_state = 'COMPLETE';
      a.completion_state = 'COMPLETE';
      a.completed_at = '2026-10-12T13:00:00.000Z';
      p.ownership_record = {
        business: 'Example Studio',
        domain: 'example-studio.invalid',
        registrar: 'Fixture Registrar',
        renewal_date: '2027-10-12',
        email_provider: 'Fixture Mail',
        primary_mailbox: 'hello@example-studio.invalid',
        aliases: [],
        dns_status: 'Verified',
        security_status: 'Verified',
        owner: 'Client Example',
        administrative_access_model: 'Client owned',
      };
      p.stages = (
        [
          '01_DETAILS_RECEIVED',
          '02_DOMAIN',
          '03_PROFESSIONAL_EMAIL',
          '04_DNS_SECURITY',
          '05_DEVICE_SIGNATURE',
          '06_FINAL_VERIFICATION',
          '07_FOUNDATION_COMPLETE',
        ] as const
      ).map((stage_code) => ({ stage_code, status: 'COMPLETE' as const, updated_at: '2026-10-12T12:00:00.000Z' }));
      p.events.push(
        event('verified', 'FOUNDATION_VERIFIED', '2026-10-12T12:30:00.000Z'),
        event('complete', 'FOUNDATION_COMPLETED', '2026-10-12T13:00:00.000Z'),
      );
      return p;
    case '06':
      a.state = 'INTAKE_IN_PROGRESS';
      a.intake_state = 'IN_PROGRESS';
      a.opened_at = '2026-10-02T15:10:00.000Z';
      a.last_activity_at = '2026-10-08T21:05:00.000Z';
      a.intake = { business_name: 'Example Studio', needs: ['NEED_DOMAIN'] };
      p.events.push(
        event('opened', 'LINK_OPENED', '2026-10-02T15:10:00.000Z'),
        event('started', 'INTAKE_STARTED', '2026-10-08T20:40:00.000Z'),
        event('updated', 'INTAKE_UPDATED', '2026-10-08T21:05:00.000Z'),
      );
      return p;
    case '07':
      a.state = 'QUOTE_READY';
      a.intake_state = 'COMPLETE';
      p.quote = quote('CLIENT_REVIEW', '2026-09-14T14:00:00.000Z', '2026-10-14T03:59:00.000Z');
      p.recommendation = RECOMMENDATION;
      p.events.push(event('quote', 'QUOTE_CREATED', '2026-09-14T14:00:00.000Z'));
      return p;
  }
}

/**
 * Personalization stress cases. Fictional values only: names that do not belong to any client,
 * `.invalid` domains, fixture references. Long covers long names, business, currency, references,
 * addon lists and payment method; short covers minimal values and absent optional fields.
 */
export const FNDATN01_STRESS_LONG_CONTEXT: Fndatn01Context = {
  ...FNDATN01_FIXTURE_CONTEXT,
  timeZone: 'Pacific/Chatham',
  timeZoneLabel: 'CHATHAM STANDARD TIME',
};

const LONG = {
  name: 'Maximiliana-Alexandria Featherstonehaugh-Vanderbilt',
  business: 'Featherstonehaugh Architecture & Interior Restoration Collective',
  domain: 'featherstonehaugh-architecture-and-interior-restoration.invalid',
  mailbox: 'maximiliana-alexandria@featherstonehaugh-architecture.invalid',
  quoteId: 'q-fixture-0001-revision-0007-extended-review-reference',
  method: 'Corporate card ending 4242 · authorized signatory',
};

function stressFixture(id: Fndatn01EmailId, variant: 'stress_long' | 'stress_short'): DigitalFoundationArtifactPayload {
  const p = fixtureFor(id, 'default');
  const long = variant === 'stress_long';
  p.lead.contact_name = long ? LONG.name : 'Al';
  p.lead.business_name = long ? LONG.business : null;
  if (p.artifact.intake.contact_name) p.artifact.intake.contact_name = p.lead.contact_name;
  if (p.artifact.intake.business_name) p.artifact.intake.business_name = long ? LONG.business : undefined;
  if (p.quote) {
    const q = p.quote;
    if (long) {
      q.quote_id = LONG.quoteId;
      q.base_price_minor = 1234567800;
      q.selected_addons = [{ ...q.selected_addons[0], quantity: 12, line_total_minor: 60000 }];
      q.addon_total_minor = 60000;
      q.subtotal_minor = 1234627800;
    } else {
      q.base_price_minor = 900;
      q.selected_addons = [];
      q.addon_total_minor = 0;
      q.subtotal_minor = 900;
    }
  }
  const paid = p.events.find((e) => e.event_type === 'PAYMENT_CONFIRMED');
  if (paid && long) paid.payload = { ...paid.payload, method_label: LONG.method };
  if (p.ownership_record) {
    p.ownership_record.domain = long ? LONG.domain : 'ox.invalid';
    p.ownership_record.primary_mailbox = long ? LONG.mailbox : 'al@ox.invalid';
    p.ownership_record.business = long ? LONG.business : 'Ox';
    p.ownership_record.owner = p.lead.contact_name ?? '';
  }
  if (!long) p.artifact.completed_at = null;
  return p;
}
