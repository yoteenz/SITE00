import { effectiveFeatures } from '../rules';
import { blueprintFinancialPresentation } from '../../../studioos/platform-economics/presentation';
import type { BuilderSelection } from '../types';

/** Blueprint proposal copy. The estimate string is passed through. The share is not recalculated here. */
export function blueprintEconomicsForSelection(selection: BuilderSelection, buildInvestmentLabel: string | null) {
  return blueprintFinancialPresentation({
    featureIds: effectiveFeatures(selection),
    buildInvestmentLabel,
    agreement: null,
  });
}
