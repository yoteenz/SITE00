/**
 * Digital Foundation ↔ Business Growth Intelligence bridge (server).
 * Does not alter Stripe checkout totals unless Growth lines are founder-approved and checkout flag is on.
 */
import {
  composeFoundationWithGrowth,
  isBusinessGrowthIntelligenceActive,
  isBusinessGrowthFlagEnabled,
  recommendGrowthServices,
  composeUnifiedCommercialQuote,
  projectGrowthDelivery,
  buildBusinessGrowthRoadmap,
  adaptiveContextFieldsForGoals,
  BUSINESS_AMBITION_GOAL_OPTIONS,
  SITE00_VS_AIO_BOUNDARY,
  BUSINESS_GROWTH_INTELLIGENCE_VERSION,
  clientGrowthCatalog,
  listGrowthServiceFamilies,
  findGrowthService,
  type SelectedGrowthService,
  type BusinessAmbitionIntake,
  type ClientBusinessGrowthContext,
  type ClientGrowthLifecycle,
  type GrowthDeliveryMilestone,
  type FounderGrowthReview,
} from '../../../shared/site00-business-growth-intelligence/index.js';
import type {
  DigitalFoundationArtifact,
  DigitalFoundationIntake,
  DigitalFoundationQuote,
  DigitalFoundationRecommendation,
} from '../../../shared/site00-digital-foundation/types.js';
import type { DigitalFoundationCommercialConfig, QuoteLineAddon } from '../../../shared/site00-digital-foundation/types.js';
import { businessGrowthEditability, getCommercialConfig } from './service.js';
import * as mem from './memoryStore.js';

export function attachGrowthContextToFoundationPayload(input: {
  intake: DigitalFoundationIntake;
  foundationRecommendation: DigitalFoundationRecommendation;
  foundationAddonLines: QuoteLineAddon[];
  config: DigitalFoundationCommercialConfig;
  selectedGrowth?: SelectedGrowthService[];
}) {
  const ambition = input.intake.business_ambition as BusinessAmbitionIntake | undefined;
  return composeFoundationWithGrowth({
    foundationIntake: input.intake,
    businessAmbition: ambition ?? null,
    foundationRecommendation: input.foundationRecommendation,
    foundationAddonLines: input.foundationAddonLines,
    config: input.config,
    selectedGrowth: input.selectedGrowth,
  });
}

export function growthIntelligenceEnabledForArtifact(): boolean {
  return isBusinessGrowthIntelligenceActive();
}

/** Facts the Foundation intake already holds, so Business Ambition never asks them again. */
export function knownAmbitionContext(intake: DigitalFoundationIntake): Partial<NonNullable<BusinessAmbitionIntake['context']>> {
  const known: Partial<NonNullable<BusinessAmbitionIntake['context']>> = {};
  if (intake.industry?.trim()) known.industry = intake.industry.trim();
  if (intake.needs?.includes('HAVE_WEBSITE')) known.has_functioning_website = true;
  return known;
}

function selectedFromIntake(intake: DigitalFoundationIntake): SelectedGrowthService[] {
  return (intake.business_growth_selection?.selections ?? [])
    .filter((s) => s.client_selected && findGrowthService(s.service_id as SelectedGrowthService['service_id']))
    .map((s) => ({ service_id: s.service_id as SelectedGrowthService['service_id'], quantity: s.quantity, client_selected: true }));
}

function lifecycleFor(artifact: DigitalFoundationArtifact, selected: SelectedGrowthService[]): ClientGrowthLifecycle {
  const foundation: ClientGrowthLifecycle['foundation'] =
    artifact.completion_state === 'COMPLETE'
      ? 'COMPLETE'
      : artifact.payment_state === 'PAID' || artifact.project_state !== 'NOT_STARTED'
        ? 'IN_PROGRESS'
        : 'NOT_PURCHASED';
  const activeGrowth = selected.filter((s) => findGrowthService(s.service_id)?.commercial_status !== 'FUTURE_NOT_ACTIVE');
  const growth: ClientGrowthLifecycle['growth'] = activeGrowth.length ? 'AWAITING_FOUNDER_APPROVAL' : 'NONE_SELECTED';
  const full_engagement: ClientGrowthLifecycle['full_engagement'] =
    foundation === 'NOT_PURCHASED'
      ? 'NOT_STARTED'
      : foundation === 'COMPLETE' && growth === 'NONE_SELECTED'
        ? 'COMPLETE'
        : 'IN_PROGRESS';
  return { foundation, growth, full_engagement };
}

function milestoneStatus(
  milestones: GrowthDeliveryMilestone[],
  lifecycle: ClientGrowthLifecycle,
): Record<string, GrowthDeliveryMilestone['status']> {
  const out: Record<string, GrowthDeliveryMilestone['status']> = {};
  for (const m of milestones) {
    if (m.kind === 'FOUNDATION_READY') {
      out[m.milestone_id] =
        lifecycle.foundation === 'COMPLETE' ? 'COMPLETE' : lifecycle.foundation === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'PLANNED';
    } else if (m.kind === 'FULL_PROJECT') {
      out[m.milestone_id] =
        lifecycle.full_engagement === 'COMPLETE' ? 'COMPLETE' : lifecycle.full_engagement === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'PLANNED';
    } else {
      out[m.milestone_id] = m.status;
    }
  }
  return out;
}

function readinessSummary(lifecycle: ClientGrowthLifecycle, intakeComplete: boolean): string {
  if (lifecycle.foundation === 'COMPLETE') return 'Digital Foundation complete';
  if (lifecycle.foundation === 'IN_PROGRESS') return 'Digital Foundation in progress';
  return intakeComplete ? 'Digital Foundation scoped — not yet purchased' : 'Digital Foundation intake in progress';
}

/**
 * Client-facing Growth context for one artifact, composed only from the canonical BGI engines.
 * Returns null while `SITE00_BUSINESS_GROWTH_INTELLIGENCE_V1` is off, so the Foundation payload is unchanged.
 */
export function buildClientGrowthContext(input: {
  artifact: DigitalFoundationArtifact;
  quote: DigitalFoundationQuote | null;
}): ClientBusinessGrowthContext | null {
  if (!isBusinessGrowthIntelligenceActive()) return null;
  const { artifact, quote } = input;
  const config = getCommercialConfig();
  const intake = artifact.intake ?? { needs: [] };
  const saved = (intake.business_ambition as BusinessAmbitionIntake | undefined) ?? null;
  const known = knownAmbitionContext(intake);
  const ambitionForEngine: BusinessAmbitionIntake = saved
    ? { ...saved, context: { ...known, ...(saved.context ?? {}) } }
    : { schema_version: BUSINESS_GROWTH_INTELLIGENCE_VERSION, goals: [], skipped: true, context: known };

  const selected = selectedFromIntake(intake);
  const addonLines: QuoteLineAddon[] = quote?.selected_addons ?? [];
  const assessment = recommendGrowthServices({ ambition: ambitionForEngine, foundationIntake: intake });
  const unified_quote = composeUnifiedCommercialQuote({
    config,
    foundationAddonLines: addonLines,
    selectedGrowth: selected,
    third_party_notice: config.third_party_cost_notice,
  });
  const delivery = projectGrowthDelivery({ foundationConfig: config, foundationAddonLines: addonLines, selectedGrowth: selected });
  const lifecycle = lifecycleFor(artifact, selected);
  const revision = intake.business_growth_selection?.revision ?? 0;
  const roadmap = buildBusinessGrowthRoadmap({
    assessment,
    selectedGrowth: selected,
    foundationConfig: config,
    foundationAddonLines: addonLines,
    foundation_readiness_summary: readinessSummary(lifecycle, artifact.intake_state === 'COMPLETE'),
    roadmap_version: Math.max(1, revision),
  });
  const editable = businessGrowthEditability(artifact);
  const catalog = clientGrowthCatalog();

  return {
    schema_version: BUSINESS_GROWTH_INTELLIGENCE_VERSION,
    active: true,
    flags: {
      ambition_intake: isBusinessGrowthFlagEnabled('SITE00_BUSINESS_AMBITION_INTAKE_V1'),
      growth_checkout: false,
      public_release: false,
    },
    goal_options: BUSINESS_AMBITION_GOAL_OPTIONS.map((g) => ({ ...g })),
    ambition: saved,
    adaptive_fields: adaptiveContextFieldsForGoals(saved?.goals ?? []).filter((f) => known[f] === undefined),
    known_context: known,
    families: listGrowthServiceFamilies().map((family_id) => ({
      family_id,
      services: catalog.filter((s) => s.family_id === family_id).map((s) => s.service_id),
    })),
    catalog,
    recommendations: assessment.recommendations,
    selection: {
      selected,
      revision,
      updated_at: intake.business_growth_selection?.updated_at ?? null,
      editable: editable.selections,
      ambition_editable: editable.ambition,
    },
    unified_quote,
    delivery: {
      foundation_ready_min_days: delivery.foundation_ready_min_days,
      foundation_ready_max_days: delivery.foundation_ready_max_days,
      full_project_min_days: delivery.full_project_min_days,
      full_project_max_days: delivery.full_project_max_days,
      milestones: delivery.milestones,
    },
    roadmap,
    lifecycle,
    milestone_status: milestoneStatus(roadmap.delivery_milestones, lifecycle),
    aio: {
      referrals: roadmap.aio_referrals,
      boundary: {
        site00: [...SITE00_VS_AIO_BOUNDARY.site00],
        aio: [...SITE00_VS_AIO_BOUNDARY.aio],
        rule: SITE00_VS_AIO_BOUNDARY.rule,
      },
    },
    opportunity: { status: 'ASSESSMENT_PENDING', verified_opportunities: [] },
    bldr: { interest_recorded: artifact.build_interest === 'INTERESTED' || artifact.build_interest === 'BOOKED' },
  };
}

export function buildClientGrowthContextForArtifactId(artifactId: string): ClientBusinessGrowthContext | null {
  const artifact = mem.memGetArtifact(artifactId);
  if (!artifact) return null;
  const quote = artifact.quote_id ? mem.memGetQuote(artifact.quote_id) ?? null : null;
  return buildClientGrowthContext({ artifact, quote });
}

export type { FounderGrowthReview };

/** Founder-only review of one client's Growth discovery. Read-only: approvals stay in the catalog governance path. */
export function buildFounderGrowthReview(artifactId: string): FounderGrowthReview {
  const artifact = mem.memGetArtifact(artifactId);
  if (!artifact) throw new Error('ARTIFACT_NOT_FOUND');
  const context = buildClientGrowthContextForArtifactId(artifactId);
  const selected = selectedFromIntake(artifact.intake ?? { needs: [] });
  const defs = selected.map((s) => findGrowthService(s.service_id)).filter((d): d is NonNullable<typeof d> => Boolean(d));
  return {
    enabled: isBusinessGrowthIntelligenceActive(),
    artifact_id: artifactId,
    ambition: (artifact.intake?.business_ambition as BusinessAmbitionIntake | undefined) ?? null,
    context,
    pricing_reviews: defs
      .filter((d) => d.commercial_status !== 'FOUNDER_APPROVED')
      .map((d) => ({
        service_id: d.service_id,
        display_name: d.display_name,
        commercial_status: d.commercial_status,
        approval_requirements: [...d.approval_requirements],
        pricing_basis: d.pricing_basis,
      })),
    specialist_reviews: context?.roadmap.specialist_referrals ?? [],
    aio_referrals: context?.aio.referrals ?? [],
    delivery_assumptions: defs.map((d) => ({
      service_id: d.service_id,
      capacity_assumption: d.delivery.capacity_assumption,
      confidence: d.delivery.confidence,
      required_review_steps: [...d.delivery.required_review_steps],
    })),
    governance: {
      growth_checkout_enabled: false,
      auto_approval: false,
      note: 'Growth pricing is approved in the BGI catalog (commercial_status), never from this review.',
    },
  };
}
