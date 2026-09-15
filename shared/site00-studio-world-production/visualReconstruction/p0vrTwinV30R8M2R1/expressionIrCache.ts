import type { ImplementationExpressionIR } from './implementationExpressionTypes.js';
import { IMPLEMENTATION_EXPRESSION_VERSION } from './constants.js';

const cache = new Map<string, ImplementationExpressionIR>();

export function buildExpressionIrCacheKey(input: {
  packageChecksum: string;
  actualRenderHash: string;
  blueprintRenderHash: string;
}): string {
  return [input.packageChecksum, input.actualRenderHash, input.blueprintRenderHash, IMPLEMENTATION_EXPRESSION_VERSION].join(
    ':',
  );
}

export function getCachedImplementationExpressionIR(cacheKey: string): ImplementationExpressionIR | null {
  return cache.get(cacheKey) ?? null;
}

export function setCachedImplementationExpressionIR(ir: ImplementationExpressionIR): void {
  cache.set(ir.cacheKey, ir);
}

export function clearExpressionIrCacheForTests(): void {
  cache.clear();
}
