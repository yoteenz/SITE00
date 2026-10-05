/**
 * P0.VR.DIAG.1R5B — Resolve metric / status cell layout subtype before anchor extraction.
 */

import type { PageRegionLayoutDefinition } from '../p0vrDiag1/pageRegionLayoutProfiles.js';
import type { DomRegionMeasurement } from '../p0vrDiag1/types.js';
import { collectMeaningfulChildCandidates, detectRepeatedRowGeometry } from './meaningfulChildTraversal.js';

export const METRIC_REGION_SUBTYPES = [
  'METRIC_GRID',
  'STATUS_CELLS',
  'KPI_BAND',
  'STAT_ROW',
  'COMPOSITE',
  'AMBIGUOUS',
] as const;
export type MetricRegionSubtype = (typeof METRIC_REGION_SUBTYPES)[number];

export type MetricSubtypeResolution = {
  subtype: MetricRegionSubtype;
  ambiguousCandidates?: [MetricRegionSubtype, MetricRegionSubtype];
  signals: string[];
};

export function resolveMetricRegionSubtype(input: {
  def: PageRegionLayoutDefinition;
  dom: DomRegionMeasurement;
  relatedDom: DomRegionMeasurement[];
}): MetricSubtypeResolution {
  const signals: string[] = [];
  const name = input.def.regionName.toUpperCase();
  if (name.includes('STATUS') && name.includes('CELL')) {
    signals.push('region_name_status_cells');
    return { subtype: 'STATUS_CELLS', signals };
  }
  if (name.includes('KPI') || name.includes('METRIC')) {
    signals.push('region_name_metric');
  }

  const { accepted } = collectMeaningfulChildCandidates({
    container: input.dom,
    relatedDom: input.relatedDom,
  });
  if (accepted.length >= 4) {
    signals.push('repeated_equal_width_children');
    const widths = accepted.map((c) => c.actualWidth);
    const mean = widths.reduce((a, b) => a + b, 0) / widths.length;
    const equal = widths.every((w) => Math.abs(w - mean) <= Math.max(6, mean * 0.12));
    if (equal) return { subtype: 'METRIC_GRID', signals };
  }

  const rows = detectRepeatedRowGeometry(accepted);
  if (rows) {
    signals.push('horizontal_stat_row');
    return { subtype: 'STAT_ROW', signals };
  }

  if (input.dom.actualHeight < 48 && input.dom.actualWidth > input.dom.actualHeight * 3) {
    signals.push('kpi_band_geometry');
    return { subtype: 'KPI_BAND', signals };
  }

  if (accepted.length >= 2 && accepted.length <= 3) {
    signals.push('few_cells_ambiguous');
    return {
      subtype: 'AMBIGUOUS',
      ambiguousCandidates: ['STATUS_CELLS', 'METRIC_GRID'],
      signals,
    };
  }

  if (input.def.childLandmarks?.length) {
    signals.push('composite_landmarks');
    return { subtype: 'COMPOSITE', signals };
  }

  return { subtype: 'AMBIGUOUS', ambiguousCandidates: ['METRIC_GRID', 'STATUS_CELLS'], signals };
}
