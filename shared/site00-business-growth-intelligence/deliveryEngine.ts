import type { DigitalFoundationCommercialConfig } from '../site00-digital-foundation/types.js';
import type { QuoteLineAddon } from '../site00-digital-foundation/types.js';
import { projectTimeline } from '../site00-digital-foundation/timelineEngine.js';
import type { BusinessGrowthServiceId, GrowthDeliveryMilestone, SelectedGrowthService } from './types.js';
import { findGrowthService } from './serviceCatalog.js';
import { formatBusinessDayRange } from './timelinePresentation.js';

export type DeliveryProjectionInput = {
  foundationConfig: DigitalFoundationCommercialConfig;
  foundationAddonLines: QuoteLineAddon[];
  selectedGrowth: SelectedGrowthService[];
};

export type DeliveryProjection = {
  foundation_ready_min_days: number;
  foundation_ready_max_days: number;
  growth_service_windows: {
    service_id: BusinessGrowthServiceId;
    min_business_days: number | null;
    max_business_days: number | null;
    parallel_with_foundation: boolean;
  }[];
  full_project_min_days: number | null;
  full_project_max_days: number | null;
  milestones: GrowthDeliveryMilestone[];
};

/**
 * Dependency-aware delivery: Foundation readiness separate from full purchased scope.
 * Does not blindly sum all durations or assume full parallelism.
 */
export function projectGrowthDelivery(input: DeliveryProjectionInput): DeliveryProjection {
  const foundationTimeline = projectTimeline(input.foundationAddonLines, input.foundationConfig);
  const foundation_ready_min_days = foundationTimeline.projected_min_days;
  const foundation_ready_max_days = foundationTimeline.projected_max_days;

  const growthWindows: DeliveryProjection['growth_service_windows'] = [];
  let sequentialMax = foundation_ready_max_days;
  let parallelMax = foundation_ready_max_days;

  for (const sel of input.selectedGrowth) {
    if (!sel.client_selected) continue;
    const def = findGrowthService(sel.service_id);
    if (!def || def.commercial_status === 'FUTURE_NOT_ACTIVE') continue;
    if (def.commercial_status === 'BLDR_ESTIMATOR_AUTHORITY') continue;

    const minD = def.delivery.estimated_min_business_days;
    const maxD = def.delivery.estimated_max_business_days;
    growthWindows.push({
      service_id: sel.service_id,
      min_business_days: minD,
      max_business_days: maxD,
      parallel_with_foundation: def.delivery.parallelizable_with_foundation,
    });

    if (maxD == null) continue;
    if (def.delivery.parallelizable_with_foundation) {
      parallelMax = Math.max(parallelMax, foundation_ready_max_days + maxD);
    } else {
      sequentialMax += maxD;
    }
  }

  const full_project_min_days = foundation_ready_min_days;
  const full_project_max_days = Math.max(sequentialMax, parallelMax);

  const milestones: GrowthDeliveryMilestone[] = [
    {
      milestone_id: 'foundation-ready',
      kind: 'FOUNDATION_READY',
      label: 'Foundation ready',
      estimated_min_business_days: foundation_ready_min_days,
      estimated_max_business_days: foundation_ready_max_days,
      display_range: formatBusinessDayRange(foundation_ready_min_days, foundation_ready_max_days),
      status: 'PLANNED',
    },
  ];

  for (const w of growthWindows) {
    const def = findGrowthService(w.service_id);
    milestones.push({
      milestone_id: `growth-${w.service_id}`,
      kind: 'GROWTH_SERVICE',
      label: def?.display_name ?? w.service_id,
      estimated_min_business_days: w.min_business_days,
      estimated_max_business_days: w.max_business_days,
      display_range:
        w.min_business_days != null && w.max_business_days != null
          ? formatBusinessDayRange(w.min_business_days, w.max_business_days)
          : 'PENDING SCOPE REVIEW',
      status: 'PLANNED',
    });
  }

  if (input.selectedGrowth.some((s) => s.client_selected && s.service_id === 'BGI.PRESENCE_LAUNCH')) {
    milestones.push({
      milestone_id: 'bldr-opportunity',
      kind: 'BLDR_OPPORTUNITY',
      label: 'Presence Launch (BLDR)',
      estimated_min_business_days: null,
      estimated_max_business_days: null,
      display_range: 'BLDR estimator timeline (separate)',
      status: 'PLANNED',
    });
  }

  milestones.push({
    milestone_id: 'full-project',
    kind: 'FULL_PROJECT',
    label: 'Full project delivery',
    estimated_min_business_days: full_project_min_days,
    estimated_max_business_days: full_project_max_days,
    display_range: formatBusinessDayRange(full_project_min_days, full_project_max_days),
    status: 'PLANNED',
  });

  return {
    foundation_ready_min_days,
    foundation_ready_max_days,
    growth_service_windows: growthWindows,
    full_project_min_days,
    full_project_max_days,
    milestones,
  };
}
