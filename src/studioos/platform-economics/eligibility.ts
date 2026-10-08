import { applyBasisPoints } from './money';
import type { CalculationConfigSnapshot, MoneyComponent, ProcessorFeeTreatment } from './types';

export type ClassifiedAmounts = {
  grossMinor: number;
  excludedMinor: number;
  eligibleMinor: number;
  exclusionLines: { code: string; minor: number }[];
  processorFeeNote: string | null;
};

function included(code: MoneyComponent['code'], config: CalculationConfigSnapshot): boolean {
  if (code === 'SERVICE' || code === 'OTHER_COMMERCE') return true;
  if (code === 'TAX') return config.taxTreatment === 'INCLUDED';
  if (code === 'GRATUITY') return config.gratuityTreatment === 'INCLUDED';
  if (code === 'GOVERNMENT_FEE' || code === 'REGULATORY_FEE') return config.governmentFeeTreatment === 'INCLUDED';
  return config.passThroughFeeTreatment === 'INCLUDED';
}

export function classifyCollected(
  components: MoneyComponent[],
  config: CalculationConfigSnapshot,
  processorFeeMinor: number,
  processorFeeTreatment: ProcessorFeeTreatment,
): ClassifiedAmounts {
  let grossMinor = 0;
  let eligibleMinor = 0;
  const exclusionLines: { code: string; minor: number }[] = [];
  for (const component of components) {
    if (!Number.isInteger(component.minor) || component.minor < 0) throw new Error('MONEY_NOT_MINOR_UNITS');
    grossMinor += component.minor;
    if (included(component.code, config)) {
      eligibleMinor += component.minor;
    } else if (component.minor > 0) {
      exclusionLines.push({ code: component.code, minor: component.minor });
    }
  }
  let processorFeeNote: string | null = null;
  if (processorFeeTreatment === 'EXCLUDED' && processorFeeMinor > 0) {
    const removed = Math.min(eligibleMinor, processorFeeMinor);
    eligibleMinor -= removed;
    exclusionLines.push({ code: 'PROCESSOR_FEE', minor: removed });
  } else if (processorFeeTreatment === 'UNSPECIFIED' && processorFeeMinor > 0) {
    processorFeeNote = 'PROCESSOR_FEE_TREATMENT_UNSPECIFIED';
  }
  return {
    grossMinor,
    excludedMinor: grossMinor - eligibleMinor,
    eligibleMinor,
    exclusionLines,
    processorFeeNote,
  };
}

export function platformFeeMinor(eligibleMinor: number, basisPoints: number, applicable: boolean): number {
  if (!applicable) return 0;
  return applyBasisPoints(eligibleMinor, basisPoints);
}
