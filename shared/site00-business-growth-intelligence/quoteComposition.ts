import type { DigitalFoundationCommercialConfig, QuoteLineAddon } from '../site00-digital-foundation/types.js';
import { calculateQuoteTotals } from '../site00-digital-foundation/quoteEngine.js';
import type { SelectedGrowthService, UnifiedCommercialQuoteSections, GrowthQuoteLine } from './types.js';
import { findGrowthService } from './serviceCatalog.js';
import { projectGrowthDelivery } from './deliveryEngine.js';
import { formatBusinessDayRange } from './timelinePresentation.js';
import { BUSINESS_GROWTH_INTELLIGENCE_VERSION } from './version.js';

function formatMoney(minor: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(minor / 100);
}

function growthLineFromSelection(sel: SelectedGrowthService): GrowthQuoteLine {
  const def = findGrowthService(sel.service_id);
  if (!def) {
    return {
      service_id: sel.service_id,
      label: sel.service_id,
      line_total_minor: null,
      price_display: 'UNKNOWN SERVICE',
      commercial_status: 'CUSTOM_QUOTE_REQUIRED',
      requires_manual_review: true,
      delivery_min_business_days: null,
      delivery_max_business_days: null,
    };
  }

  let price_display = 'CUSTOM QUOTE REQUIRED';
  let line_total_minor: number | null = null;

  switch (def.commercial_status) {
    case 'BLDR_ESTIMATOR_AUTHORITY':
      price_display = 'BLDR estimator (separate quote)';
      break;
    case 'FUTURE_NOT_ACTIVE':
      price_display = 'NOT ACTIVATED';
      break;
    case 'CUSTOM_QUOTE_REQUIRED':
      price_display = 'CUSTOM QUOTE REQUIRED';
      break;
    case 'PROPOSED_NOT_ACTIVE':
      if (def.proposed_price_min_minor != null && def.proposed_price_max_minor != null) {
        price_display = `${formatMoney(def.proposed_price_min_minor, def.proposed_currency)}–${formatMoney(def.proposed_price_max_minor, def.proposed_currency)} (proposed — approval pending)`;
      } else {
        price_display = 'PROPOSED — FOUNDER APPROVAL PENDING';
      }
      break;
    case 'FOUNDER_APPROVED':
      if (def.proposed_price_min_minor != null) {
        line_total_minor = def.proposed_price_min_minor * Math.max(1, sel.quantity);
        price_display = formatMoney(line_total_minor, def.proposed_currency);
      }
      break;
    default:
      price_display = 'PENDING';
  }

  return {
    service_id: sel.service_id,
    label: def.display_name,
    line_total_minor,
    price_display,
    commercial_status: def.commercial_status,
    requires_manual_review:
      def.commercial_status === 'CUSTOM_QUOTE_REQUIRED' ||
      def.commercial_status === 'PROPOSED_NOT_ACTIVE' ||
      def.commercial_status === 'BLDR_ESTIMATOR_AUTHORITY',
    delivery_min_business_days: def.delivery.estimated_min_business_days,
    delivery_max_business_days: def.delivery.estimated_max_business_days,
  };
}

/** Separated quote sections — Foundation unchanged; Growth not folded into one opaque total unless founder-approved lines exist. */
export function composeUnifiedCommercialQuote(input: {
  config: DigitalFoundationCommercialConfig;
  foundationAddonLines: QuoteLineAddon[];
  selectedGrowth: SelectedGrowthService[];
  third_party_notice: string;
}): UnifiedCommercialQuoteSections {
  const foundationTotals = calculateQuoteTotals(input.foundationAddonLines, input.config);
  const growthSelections = input.selectedGrowth.filter((s) => s.client_selected);
  const growth_lines = growthSelections.map(growthLineFromSelection);

  const approvedGrowthMinor = growth_lines
    .filter((l) => l.commercial_status === 'FOUNDER_APPROVED' && l.line_total_minor != null)
    .reduce((sum, l) => sum + (l.line_total_minor ?? 0), 0);

  const foundation_subtotal_minor = foundationTotals.subtotal_minor;
  const one_time_total_minor =
    approvedGrowthMinor > 0 ? foundation_subtotal_minor + approvedGrowthMinor : foundation_subtotal_minor;

  const delivery = projectGrowthDelivery({
    foundationConfig: input.config,
    foundationAddonLines: input.foundationAddonLines,
    selectedGrowth: growthSelections,
  });

  const hasBldr = growthSelections.some((s) => s.service_id === 'BGI.PRESENCE_LAUNCH');

  return {
    schema_version: BUSINESS_GROWTH_INTELLIGENCE_VERSION,
    foundation_base_minor: input.config.base_price_minor,
    foundation_addon_minor: foundationTotals.addon_total_minor,
    foundation_subtotal_minor,
    foundation_ready_min_days: delivery.foundation_ready_min_days,
    foundation_ready_max_days: delivery.foundation_ready_max_days,
    growth_lines,
    growth_subtotal_minor: approvedGrowthMinor > 0 ? approvedGrowthMinor : null,
    growth_subtotal_display:
      approvedGrowthMinor > 0
        ? formatMoney(approvedGrowthMinor, input.config.base_currency)
        : 'Proposed services — not included in checkout until founder approval',
    bldr_scope: {
      status: hasBldr ? 'ESTIMATOR_REQUIRED' : 'NONE',
    },
    third_party_notice: input.third_party_notice,
    recurring_lines: [{ label: 'Growth Operations (monthly)', status: 'NOT_ACTIVATED' }],
    one_time_total_minor: approvedGrowthMinor > 0 ? one_time_total_minor : foundation_subtotal_minor,
    one_time_total_display: formatMoney(
      approvedGrowthMinor > 0 ? one_time_total_minor : foundation_subtotal_minor,
      input.config.base_currency,
    ),
    full_project_min_days: delivery.full_project_min_days,
    full_project_max_days: delivery.full_project_max_days,
    full_project_display:
      delivery.full_project_max_days != null
        ? formatBusinessDayRange(delivery.full_project_min_days!, delivery.full_project_max_days)
        : null,
  };
}
