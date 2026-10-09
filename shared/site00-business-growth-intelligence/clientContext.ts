/**
 * Business Growth — client-facing context attached to the Digital Foundation payload.
 *
 * Browser-safe: no engine imports (the engines use `node:crypto`). The server composes this from the
 * canonical engines in `api/_lib/digitalFoundation/growthBridge.ts`; the client only renders it.
 */
import { BUSINESS_AMBITION_GOAL_OPTIONS } from './businessAmbition.js';
import { findGrowthService, getBusinessGrowthCatalog } from './serviceCatalog.js';
import type {
  BusinessAmbitionGoalId,
  BusinessAmbitionIntake,
  BusinessGrowthRoadmap,
  BusinessGrowthServiceDefinition,
  BusinessGrowthServiceFamilyId,
  BusinessGrowthServiceId,
  GrowthDeliveryMilestone,
  GrowthServiceRecommendation,
  SelectedGrowthService,
  UnifiedCommercialQuoteSections,
} from './types.js';
import { BUSINESS_GROWTH_INTELLIGENCE_VERSION } from './version.js';

export type AmbitionContextKey = keyof NonNullable<BusinessAmbitionIntake['context']>;

export const AMBITION_BOOLEAN_KEYS = [
  'has_functioning_website',
  'findable_in_search',
  'has_professional_email',
  'receiving_inquiries',
  'pursues_private_contracts',
  'government_procurement_relevant',
  'applied_for_grants_before',
  'has_capabilities_statement',
] as const satisfies readonly AmbitionContextKey[];

export const AMBITION_TEXT_KEYS = ['industry', 'geographic_markets', 'business_stage', 'immediate_priority'] as const satisfies readonly AmbitionContextKey[];

export type ClientGrowthService = {
  service_id: BusinessGrowthServiceId;
  family_id: BusinessGrowthServiceFamilyId;
  display_name: string;
  description: string;
  deliverables: string[];
  exclusions: string[];
  eligibility_criteria: string[];
  intake_requirements: string[];
  pricing_basis: string;
  commercial_status: BusinessGrowthServiceDefinition['commercial_status'];
  client_facing_status: 'DISCOVERABLE' | 'FUTURE';
  proposed_price_min_minor: number | null;
  proposed_price_max_minor: number | null;
  proposed_currency: string;
  delivery: {
    estimated_min_business_days: number | null;
    estimated_max_business_days: number | null;
    delivery_unit: BusinessGrowthServiceDefinition['delivery']['delivery_unit'];
    parallelizable_with_foundation: boolean;
    client_dependencies: string[];
    confidence: BusinessGrowthServiceDefinition['delivery']['confidence'];
  };
  dependencies: BusinessGrowthServiceId[];
  execution_owner: BusinessGrowthServiceDefinition['execution_owner'];
  /** False for FUTURE services; the client cannot add them to a plan. */
  selectable: boolean;
};

export type ClientGrowthLifecycle = {
  foundation: 'NOT_PURCHASED' | 'IN_PROGRESS' | 'COMPLETE';
  /** Growth checkout is disabled in V1, so selected services can only be awaiting founder scope + pricing. */
  growth: 'NONE_SELECTED' | 'AWAITING_FOUNDER_APPROVAL';
  full_engagement: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE';
};

export type ClientBusinessGrowthContext = {
  schema_version: typeof BUSINESS_GROWTH_INTELLIGENCE_VERSION;
  active: true;
  flags: {
    ambition_intake: boolean;
    /** Always false for clients in V1 — no Growth line can reach checkout. */
    growth_checkout: false;
    public_release: false;
  };
  goal_options: { id: BusinessAmbitionGoalId; label: string }[];
  /** As saved by the client; `null` until Business Ambition is answered or skipped. */
  ambition: BusinessAmbitionIntake | null;
  /** Adaptive follow-ups for the saved goals, minus anything the Foundation intake already answers. */
  adaptive_fields: AmbitionContextKey[];
  /** Facts taken from the Foundation intake so they are never asked twice. */
  known_context: Partial<NonNullable<BusinessAmbitionIntake['context']>>;
  families: { family_id: BusinessGrowthServiceFamilyId; services: BusinessGrowthServiceId[] }[];
  catalog: ClientGrowthService[];
  recommendations: GrowthServiceRecommendation[];
  selection: {
    selected: SelectedGrowthService[];
    revision: number;
    updated_at: string | null;
    editable: boolean;
    ambition_editable: boolean;
  };
  unified_quote: UnifiedCommercialQuoteSections;
  delivery: {
    foundation_ready_min_days: number;
    foundation_ready_max_days: number;
    full_project_min_days: number | null;
    full_project_max_days: number | null;
    milestones: GrowthDeliveryMilestone[];
  };
  roadmap: BusinessGrowthRoadmap;
  lifecycle: ClientGrowthLifecycle;
  /** Lifecycle-derived status per roadmap milestone id (engine milestones are always PLANNED). */
  milestone_status: Record<string, GrowthDeliveryMilestone['status']>;
  aio: { referrals: string[]; boundary: { site00: string[]; aio: string[]; rule: string } };
  /** V1 holds no verified program records, so opportunity matching is always pending assessment. */
  opportunity: { status: 'ASSESSMENT_PENDING'; verified_opportunities: [] };
  bldr: { interest_recorded: boolean };
};

const GOAL_IDS = new Set<string>(BUSINESS_AMBITION_GOAL_OPTIONS.map((g) => g.id));

/** Discoverable services can be added to a plan; FUTURE ones are shown but not selectable; HIDDEN never leave the server. */
export function isGrowthServiceSelectable(serviceId: string): boolean {
  const def = findGrowthService(serviceId as BusinessGrowthServiceId);
  return Boolean(def && def.client_facing_status === 'DISCOVERABLE' && def.commercial_status !== 'FUTURE_NOT_ACTIVE');
}

export function clientGrowthCatalog(): ClientGrowthService[] {
  return getBusinessGrowthCatalog()
    .filter((s) => s.client_facing_status !== 'HIDDEN')
    .map((s) => ({
      service_id: s.service_id,
      family_id: s.family_id,
      display_name: s.display_name,
      description: s.description,
      deliverables: [...s.deliverables],
      exclusions: [...s.exclusions],
      eligibility_criteria: [...s.eligibility_criteria],
      intake_requirements: [...s.intake_requirements],
      pricing_basis: s.pricing_basis,
      commercial_status: s.commercial_status,
      client_facing_status: s.client_facing_status as 'DISCOVERABLE' | 'FUTURE',
      proposed_price_min_minor: s.proposed_price_min_minor ?? null,
      proposed_price_max_minor: s.proposed_price_max_minor ?? null,
      proposed_currency: s.proposed_currency,
      delivery: {
        estimated_min_business_days: s.delivery.estimated_min_business_days,
        estimated_max_business_days: s.delivery.estimated_max_business_days,
        delivery_unit: s.delivery.delivery_unit,
        parallelizable_with_foundation: s.delivery.parallelizable_with_foundation,
        client_dependencies: [...s.delivery.client_dependencies],
        confidence: s.delivery.confidence,
      },
      dependencies: [...s.dependencies],
      execution_owner: s.execution_owner,
      selectable: isGrowthServiceSelectable(s.service_id),
    }));
}

export type AmbitionInput = {
  goals?: unknown;
  skipped?: unknown;
  context?: unknown;
  complete?: unknown;
};

/** Keeps only canonical goal ids and canonical context keys with the right value types. */
export function sanitizeAmbitionInput(
  input: AmbitionInput,
  previous: BusinessAmbitionIntake | null,
  now: string,
): BusinessAmbitionIntake {
  const goals = Array.isArray(input.goals)
    ? ([...new Set(input.goals.map(String))].filter((g) => GOAL_IDS.has(g)) as BusinessAmbitionGoalId[])
    : previous?.goals ?? [];
  const skipped = input.skipped === true;
  const context: NonNullable<BusinessAmbitionIntake['context']> = { ...(previous?.context ?? {}) };
  if (input.context && typeof input.context === 'object') {
    const raw = input.context as Record<string, unknown>;
    for (const key of AMBITION_BOOLEAN_KEYS) {
      if (!(key in raw)) continue;
      const v = raw[key];
      context[key] = v === true || v === false ? v : null;
    }
    for (const key of AMBITION_TEXT_KEYS) {
      if (!(key in raw)) continue;
      const v = raw[key];
      context[key] = typeof v === 'string' && v.trim() ? v.trim().slice(0, 200) : null;
    }
  }
  const out: BusinessAmbitionIntake = {
    schema_version: BUSINESS_GROWTH_INTELLIGENCE_VERSION,
    started_at: previous?.started_at ?? now,
    goals: skipped ? [] : goals,
    context,
  };
  if (skipped) {
    out.skipped = true;
    out.completed_at = now;
  } else if (input.complete === true) {
    out.completed_at = now;
  } else if (previous?.completed_at && !previous.skipped) {
    out.completed_at = previous.completed_at;
  }
  return out;
}

/** Explicit client opt-ins only; unknown, hidden and future services are rejected. */
export function sanitizeGrowthSelections(input: unknown): { ok: true; selected: SelectedGrowthService[] } | { ok: false; code: string } {
  if (!Array.isArray(input)) return { ok: false, code: 'GROWTH_SELECTIONS_REQUIRED' };
  const seen = new Set<string>();
  const selected: SelectedGrowthService[] = [];
  for (const raw of input) {
    const id = String((raw as { service_id?: unknown })?.service_id ?? '');
    if (!isGrowthServiceSelectable(id)) return { ok: false, code: `GROWTH_SERVICE_NOT_SELECTABLE:${id}` };
    if (seen.has(id)) continue;
    seen.add(id);
    selected.push({ service_id: id as BusinessGrowthServiceId, quantity: 1, client_selected: true });
  }
  return { ok: true, selected };
}

/** Founder-only, read-only review of one client's Growth discovery. */
export type FounderGrowthReview = {
  enabled: boolean;
  artifact_id: string;
  ambition: BusinessAmbitionIntake | null;
  context: ClientBusinessGrowthContext | null;
  /** Selected services whose pricing is not founder-approved — each needs a custom quote or rate approval. */
  pricing_reviews: {
    service_id: string;
    display_name: string;
    commercial_status: string;
    approval_requirements: string[];
    pricing_basis: string;
  }[];
  specialist_reviews: string[];
  aio_referrals: string[];
  delivery_assumptions: { service_id: string; capacity_assumption: string; confidence: string; required_review_steps: string[] }[];
  governance: { growth_checkout_enabled: false; auto_approval: false; note: string };
};
