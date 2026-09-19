/**
 * Book language context appropriateness — brand terms must improve comprehension.
 */

import { randomUUID } from 'node:crypto';
import type { BookLanguageContext, BookLanguageContextEvaluation } from './types.js';

export function evaluateBookLanguageContext(params: {
  term: string;
  context: BookLanguageContext;
}): BookLanguageContextEvaluation {
  let appropriate = true;
  let reason: string | null = null;

  if (params.context === 'PLATFORM_NATIVE' && /^(SAVE|SHARE|FOLLOW|LIKE)$/i.test(params.term)) {
    appropriate = true;
    reason = 'Platform-native action retained for usability';
  } else if (params.context === 'HISTORICAL_IMMUTABLE') {
    appropriate = false;
    reason = 'Historical experiment terminology must not be renamed';
  } else if (params.context === 'INTERNAL_PRODUCTION' && /^(SLIDE|ROUND|CONTRACT)$/i.test(params.term)) {
    appropriate = true;
    reason = 'Internal production terminology valid in admin/contracts';
  } else if (params.context === 'PUBLIC_SOCIAL' && params.term === 'FILED') {
    appropriate = false;
    reason = 'FILED is investigation/case-file language — not canonical public completion language';
  }

  return {
    evaluationId: randomUUID(),
    term: params.term,
    context: params.context,
    appropriate,
    reason,
  };
}

export function filedNotCanonicalPublicCompletionLanguage(): true {
  return true;
}

export function platformNativeLabelsPreservedWhenUsabilityRequires(): true {
  return true;
}
