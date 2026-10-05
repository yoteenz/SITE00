/**
 * P0.VR.DIAG.1R5 — Reclassify mis-typed dimension metadata without new capture.
 */

import type { RegionDimensionEvidence, RegionForensicsBundle } from '../p0vrDiag1/types.js';
import { inferDimensionValueTypeR5, formatTypedDimensionValue } from './typedDimensionFormatter.js';
import type { DimensionTypeRepairReceipt } from './types.js';

const COUNT_DIMS = new Set(['itemcount', 'cellcount', 'cardcountvisible', 'childcount']);
const RATIO_DIMS = new Set(['fillratio', 'aspectratio', 'occupiedareapct']);
const BOOLEAN_DIMS = new Set(['activestategeometry', 'activeindicatorpresent', 'hasactiveindicator']);
const ENUM_DIMS = new Set(['verticalalignment', 'internalalignment', 'alignment', 'ordermatch']);

function repairRow(row: RegionDimensionEvidence): { row: RegionDimensionEvidence; reclassified: boolean } {
  const key = row.dimension.toLowerCase();
  let unit = row.unit;
  let reclassified = false;

  if (COUNT_DIMS.has(key) || key.includes('count')) {
    if (unit !== 'count') {
      unit = 'count';
      reclassified = true;
    }
  } else if (RATIO_DIMS.has(key)) {
    if (unit !== 'ratio' && unit !== 'pct') {
      unit = 'ratio';
      reclassified = true;
    }
  } else if (BOOLEAN_DIMS.has(key)) {
    if (unit !== 'none') {
      unit = 'none';
      reclassified = true;
    }
  } else if (ENUM_DIMS.has(key)) {
    if (unit !== 'none') {
      unit = 'none';
      reclassified = true;
    }
  }

  if (!reclassified) return { row, reclassified: false };

  const valueType = inferDimensionValueTypeR5(row.dimension, unit);
  const authorityValue = formatTypedDimensionValue(row.authorityValue, valueType, unit);
  const currentValue = formatTypedDimensionValue(row.currentValue, valueType, unit);

  return {
    reclassified: true,
    row: {
      ...row,
      unit,
      authorityValue,
      currentValue,
    },
  };
}

export function repairDimensionTypesOnBundles(input: {
  bundles: RegionForensicsBundle[];
  forensicsVersionBefore: string;
  forensicsVersionAfter: string;
}): { bundles: RegionForensicsBundle[]; receipt: DimensionTypeRepairReceipt } {
  const regionsAffected = new Set<string>();
  let dimensionsReclassified = 0;

  const bundles = input.bundles.map((bundle) => {
    const dimensions = bundle.dimensions.map((row) => {
      const { row: repaired, reclassified } = repairRow(row);
      if (reclassified) {
        dimensionsReclassified += 1;
        regionsAffected.add(bundle.regionId);
      }
      return repaired;
    });
    return { ...bundle, dimensions };
  });

  return {
    bundles,
    receipt: {
      forensicsVersionBefore: input.forensicsVersionBefore,
      forensicsVersionAfter: input.forensicsVersionAfter,
      dimensionsReclassified,
      regionsAffected: [...regionsAffected],
      rawEvidencePreserved: true,
      createdAt: new Date().toISOString(),
    },
  };
}
