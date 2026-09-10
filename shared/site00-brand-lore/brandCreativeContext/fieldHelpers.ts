/**
 * P0.CBI.1 — Context field builders with lineage.
 */

import type {
  BrandContextSourceRef,
  BrandContextSourceType,
  ContextConfidence,
  ContextFieldValue,
} from './types.js';
import { SOURCE_AUTHORITY_LEVEL } from './constants.js';

export function sourceRef(
  sourceType: BrandContextSourceType,
  sourceId: string,
  fieldsContributed: string[],
  sourceVersion: string | null = null,
): BrandContextSourceRef {
  return {
    sourceType,
    sourceId,
    sourceVersion,
    authorityLevel: SOURCE_AUTHORITY_LEVEL[sourceType],
    fieldsContributed,
    updatedAt: new Date().toISOString(),
  };
}

export function field<T>(
  value: T,
  confidence: ContextConfidence,
  refs: BrandContextSourceRef[],
  isUnknown = false,
): ContextFieldValue<T> {
  return { value, confidence, sourceRefs: refs, isUnknown };
}

export function unknownField<T>(empty: T): ContextFieldValue<T> {
  return {
    value: empty,
    confidence: 'UNKNOWN',
    sourceRefs: [],
    isUnknown: true,
  };
}

export function mergeFields<T>(
  primary: ContextFieldValue<T>,
  secondary: ContextFieldValue<T>,
): { merged: ContextFieldValue<T>; conflict: boolean } {
  if (primary.isUnknown && !secondary.isUnknown) {
    return { merged: secondary, conflict: false };
  }
  if (!primary.isUnknown && secondary.isUnknown) {
    return { merged: primary, conflict: false };
  }
  const pVal = JSON.stringify(primary.value);
  const sVal = JSON.stringify(secondary.value);
  if (pVal === sVal) {
    return {
      merged: {
        ...primary,
        sourceRefs: [...primary.sourceRefs, ...secondary.sourceRefs],
        confidence: higherConfidence(primary.confidence, secondary.confidence),
      },
      conflict: false,
    };
  }
  const primaryWins =
    Math.min(...primary.sourceRefs.map((r) => r.authorityLevel), 99) <=
    Math.min(...secondary.sourceRefs.map((r) => r.authorityLevel), 99);
  return { merged: primaryWins ? primary : secondary, conflict: !primaryWins };
}

function higherConfidence(a: ContextConfidence, b: ContextConfidence): ContextConfidence {
  const order: ContextConfidence[] = ['UNKNOWN', 'LOW', 'MEDIUM', 'HIGH'];
  return order.indexOf(a) >= order.indexOf(b) ? a : b;
}

export function distillList(items: string[], max = 8): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed.toLowerCase())) continue;
    seen.add(trimmed.toLowerCase());
    out.push(trimmed);
    if (out.length >= max) break;
  }
  return out;
}

export function distillText(text: string, maxLen = 280): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 1)}…`;
}
