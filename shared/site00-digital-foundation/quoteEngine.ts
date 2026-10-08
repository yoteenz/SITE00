import { randomUUID } from 'node:crypto';
import { findAddon, getActiveAddonCatalog } from './addonCatalog.js';
import type {
  DigitalFoundationCommercialConfig,
  DigitalFoundationQuote,
  DigitalFoundationQuoteStatus,
  QuoteLineAddon,
} from './types.js';
import { projectTimeline } from './timelineEngine.js';

export type SelectedAddonInput = { addon_id: string; quantity: number };

export function buildQuoteLines(
  selections: SelectedAddonInput[],
  config: DigitalFoundationCommercialConfig,
): QuoteLineAddon[] {
  const lines: QuoteLineAddon[] = [];
  for (const sel of selections) {
    const def = findAddon(sel.addon_id, config);
    if (!def || !def.active) continue;
    const qty = Math.max(0, Math.floor(sel.quantity));
    if (qty === 0) continue;
    const unit = def.price_minor_units;
    let lineTotal = unit * (def.quantity_unit ? qty : 1);
    if (def.addon_id === 'EXPEDITED_FOUNDATION' && config.expedited_premium_minor != null) {
      lineTotal = config.expedited_premium_minor * (def.quantity_unit ? qty : 1);
    }
    lines.push({
      addon_id: def.addon_id,
      quantity: def.quantity_unit ? qty : 1,
      unit_price_minor: def.addon_id === 'EXPEDITED_FOUNDATION' && config.expedited_premium_minor != null
        ? config.expedited_premium_minor
        : unit,
      line_total_minor: lineTotal,
      requires_manual_review: def.requires_manual_review,
    });
  }
  return lines;
}

export function calculateQuoteTotals(
  lines: QuoteLineAddon[],
  config: DigitalFoundationCommercialConfig,
  manualAdjustmentsMinor = 0,
): Pick<
  DigitalFoundationQuote,
  | 'addon_total_minor'
  | 'subtotal_minor'
  | 'projected_min_days'
  | 'projected_max_days'
  | 'timeline_custom_review'
> {
  const addon_total_minor = lines.reduce((sum, l) => sum + l.line_total_minor, 0);
  const subtotal_minor = config.base_price_minor + addon_total_minor + manualAdjustmentsMinor;
  const timeline = projectTimeline(lines, config);
  return {
    addon_total_minor,
    subtotal_minor,
    ...timeline,
  };
}

export function createQuoteDraft(input: {
  artifact_id: string;
  selections: SelectedAddonInput[];
  config: DigitalFoundationCommercialConfig;
  quote_version: number;
  status?: DigitalFoundationQuoteStatus;
  manual_adjustments_minor?: number;
}): DigitalFoundationQuote {
  const lines = buildQuoteLines(input.selections, input.config);
  const totals = calculateQuoteTotals(lines, input.config, input.manual_adjustments_minor ?? 0);
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + input.config.quote_expiry_days);

  return {
    quote_id: randomUUID(),
    artifact_id: input.artifact_id,
    base_service_version: input.config.base_service_version,
    base_price_minor: input.config.base_price_minor,
    selected_addons: lines,
    addon_total_minor: totals.addon_total_minor,
    manual_adjustments_minor: input.manual_adjustments_minor ?? 0,
    subtotal_minor: totals.subtotal_minor,
    currency: input.config.base_currency,
    projected_min_days: totals.projected_min_days,
    projected_max_days: totals.projected_max_days,
    timeline_custom_review: totals.timeline_custom_review,
    third_party_cost_notice: input.config.third_party_cost_notice,
    quote_version: input.quote_version,
    status: input.status ?? 'DRAFT',
    created_at: now.toISOString(),
    expires_at: expires.toISOString(),
  };
}

export function listCatalogForClient(config: DigitalFoundationCommercialConfig) {
  return getActiveAddonCatalog(config).map((a) => ({
    addon_id: a.addon_id,
    label: a.label,
    client_description: a.client_description,
    price_minor_units: a.price_minor_units,
    currency: a.currency,
    requires_manual_review: a.requires_manual_review,
    quantity_unit: Boolean(a.quantity_unit),
    dependencies: a.dependencies,
  }));
}

/** Ensures required addons cannot be removed when dependencies demand them. */
export function validateSelectionRemovable(
  addonId: string,
  remaining: SelectedAddonInput[],
  config: DigitalFoundationCommercialConfig,
): { ok: true } | { ok: false; reason: string } {
  const catalog = getActiveAddonCatalog(config);
  for (const other of remaining) {
    const def = catalog.find((a) => a.addon_id === other.addon_id);
    if (def?.dependencies.includes(addonId as never)) {
      return {
        ok: false,
        reason: `${def.label} requires ${addonId.replace(/_/g, ' ').toLowerCase()}.`,
      };
    }
  }
  return { ok: true };
}
