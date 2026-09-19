/**
 * P0.CBI.1 — GenericBrandOutputDetector
 */

import { GENERIC_BRAND_PHRASES } from './constants.js';
import type { BrandCreativeContext, GenericBrandOutputIssue } from './types.js';

export function detectGenericBrandOutput(
  text: string,
  context: BrandCreativeContext | null,
): GenericBrandOutputIssue[] {
  const lower = text.toLowerCase();
  const issues: GenericBrandOutputIssue[] = [];

  for (const phrase of GENERIC_BRAND_PHRASES) {
    if (lower.includes(phrase)) {
      issues.push({
        phrase,
        reason: `Could apply to 500+ brands — ignores available specific context for ${context?.brandName ?? 'unknown brand'}`,
        severity: 'FAIL',
      });
    }
  }

  if (context && !context.audience.primary.isUnknown && lower.includes('modern women') && !lower.includes(context.brandName.toLowerCase())) {
    issues.push({
      phrase: 'modern women',
      reason: 'Generic audience assumption — brand has specific audience data',
      severity: 'WARN',
    });
  }

  return issues;
}

export class GenericBrandOutputDetector {
  scan(text: string, context: BrandCreativeContext | null): GenericBrandOutputIssue[] {
    return detectGenericBrandOutput(text, context);
  }
}

export const genericBrandOutputDetector = new GenericBrandOutputDetector();
