/**
 * P0.CBI.1 — BrandContextDiff between context versions.
 */

import type { BrandContextDiff, BrandContextDiffEntry, BrandCreativeContext } from './types.js';

const TRACKED_FIELDS = [
  'category',
  'positioning',
  'brandPromise',
  'productsServices',
  'offers',
  'audience.primary',
  'visualIdentity.palette',
  'toneVoice.preferredPatterns',
  'nonNegotiables',
] as const;

export function diffBrandCreativeContext(
  prior: BrandCreativeContext,
  next: BrandCreativeContext,
): BrandContextDiff {
  const added: BrandContextDiffEntry[] = [];
  const changed: BrandContextDiffEntry[] = [];
  const removed: BrandContextDiffEntry[] = [];
  const conflicted: BrandContextDiffEntry[] = [];

  for (const conflict of next.conflicts) {
    conflicted.push({
      field: conflict.field,
      changeType: 'CONFLICTED',
      before: conflict.canonicalValue,
      after: conflict.conflictingValue,
    });
  }

  compareField('category', prior.category.value, next.category.value, added, changed, removed);
  compareField('positioning', prior.positioning.value, next.positioning.value, added, changed, removed);
  compareField('brandPromise', prior.brandPromise.value, next.brandPromise.value, added, changed, removed);
  compareField('offers', prior.offers.length, next.offers.length, added, changed, removed);

  const summary = [
    added.length ? `${added.length} added` : null,
    changed.length ? `${changed.length} changed` : null,
    removed.length ? `${removed.length} removed` : null,
    conflicted.length ? `${conflicted.length} conflicted` : null,
  ]
    .filter(Boolean)
    .join(', ');

  return {
    fromVersion: prior.version,
    toVersion: next.version,
    added,
    changed,
    removed,
    conflicted,
    summary: summary || 'No material changes',
  };
}

function compareField(
  field: string,
  before: unknown,
  after: unknown,
  added: BrandContextDiffEntry[],
  changed: BrandContextDiffEntry[],
  removed: BrandContextDiffEntry[],
): void {
  const b = JSON.stringify(before);
  const a = JSON.stringify(after);
  if (b === a) return;
  if (isEmpty(before) && !isEmpty(after)) {
    added.push({ field, changeType: 'ADDED', before, after });
  } else if (!isEmpty(before) && isEmpty(after)) {
    removed.push({ field, changeType: 'REMOVED', before, after });
  } else {
    changed.push({ field, changeType: 'CHANGED', before, after });
  }
}

function isEmpty(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

export { TRACKED_FIELDS };
