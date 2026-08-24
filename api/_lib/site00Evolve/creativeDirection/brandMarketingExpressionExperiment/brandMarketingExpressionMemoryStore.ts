/**
 * Brand Marketing Expression memory store — tests only.
 */

import type { BrandMarketingExpressionRun } from '../../../../../shared/site00-brand-lore/brandMarketingExpression/types.js';

let run: BrandMarketingExpressionRun | null = null;

export async function getBrandMarketingExpressionRun(
  _projectId: string,
): Promise<BrandMarketingExpressionRun | null> {
  return run;
}

export async function saveBrandMarketingExpressionRun(
  next: BrandMarketingExpressionRun,
): Promise<BrandMarketingExpressionRun> {
  run = next;
  return next;
}

export function resetBrandMarketingExpressionMemory(): void {
  run = null;
}
