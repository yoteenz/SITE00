/**
 * PageInteractionAffordanceDetector
 */

import type { PageAffordanceType, PageInteractionContract, PageInteractionContractStatus } from './types.js';

export type AffordanceDetectionInput = {
  pageId: string;
  declared?: Array<{ label: string; affordanceType: PageAffordanceType; regionId?: string; intent?: string }>;
  dom?: Array<{ label: string; affordanceType: PageAffordanceType; regionId?: string }>;
};

const LABEL_AFFORDANCE_HINTS: Array<{ pattern: RegExp; type: PageAffordanceType; intent: string }> = [
  { pattern: /add authority/i, type: 'BUTTON', intent: 'OPEN_ADD_AUTHORITY_WORKSPACE' },
  { pattern: /open screen/i, type: 'BUTTON', intent: 'OPEN_SCREEN_DETAIL' },
  { pattern: /view all/i, type: 'LINK', intent: 'OPEN_COLLECTION_VIEW' },
  { pattern: /view details?/i, type: 'BUTTON', intent: 'OPEN_DETAIL_VIEW' },
  { pattern: /review crops?/i, type: 'BUTTON', intent: 'OPEN_CROP_REVIEW' },
  { pattern: /review plan/i, type: 'BUTTON', intent: 'OPEN_GENERATION_PLAN' },
  { pattern: /manage/i, type: 'BUTTON', intent: 'OPEN_MANAGEMENT_PANEL' },
  { pattern: /upload/i, type: 'UPLOAD', intent: 'OPEN_UPLOAD_FLOW' },
  { pattern: /compare/i, type: 'BUTTON', intent: 'OPEN_COMPARE_VIEW' },
  { pattern: /implement/i, type: 'BUTTON', intent: 'TRIGGER_IMPLEMENTATION' },
  { pattern: /filter/i, type: 'FILTER', intent: 'TOGGLE_FILTER_STATE' },
  { pattern: /sort/i, type: 'SORT', intent: 'TOGGLE_SORT_STATE' },
  { pattern: /search/i, type: 'SEARCH', intent: 'OPEN_SEARCH' },
  { pattern: /next/i, type: 'NEXT', intent: 'ADVANCE' },
  { pattern: /previous|back/i, type: 'BACK', intent: 'RETURN' },
  { pattern: /edit/i, type: 'EDIT', intent: 'OPEN_EDIT_VIEW' },
  { pattern: /delete/i, type: 'DELETE', intent: 'CONFIRM_DELETE' },
  { pattern: /cancel/i, type: 'CANCEL', intent: 'CANCEL_FLOW' },
  { pattern: /submit|approve/i, type: 'SUBMIT', intent: 'SUBMIT_MUTATION' },
];

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function detectPageInteractionAffordances(input: AffordanceDetectionInput): PageInteractionContract[] {
  const seen = new Set<string>();
  const raw = [...(input.declared ?? []), ...(input.dom ?? [])];
  const contracts: PageInteractionContract[] = [];

  for (const item of raw) {
    const key = `${item.affordanceType}:${item.label.toUpperCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const hint = LABEL_AFFORDANCE_HINTS.find((h) => h.pattern.test(item.label));
    const interactionId = `ix-${input.pageId}-${slugify(item.label)}`;

    contracts.push({
      interactionId,
      pageId: input.pageId,
      regionId: item.regionId ?? `region-${slugify(item.label)}`,
      label: item.label.toUpperCase(),
      affordanceType: item.affordanceType,
      intent: ('intent' in item && typeof item.intent === 'string' && item.intent) || hint?.intent || 'UNRESOLVED',
      targetType: 'ROUTE',
      status: 'PLANNED',
      confidence: hint ? 'HIGH' : 'MEDIUM',
    });
  }

  return contracts;
}

export function classifyAffordanceFromLabel(label: string): PageAffordanceType {
  const hint = LABEL_AFFORDANCE_HINTS.find((h) => h.pattern.test(label));
  return hint?.type ?? 'BUTTON';
}

export function isDecorativeOnly(contract: PageInteractionContract): boolean {
  return contract.status === 'NO_OP_INTENTIONAL';
}

export function markUnresolvedIfNeeded(contract: PageInteractionContract): PageInteractionContractStatus {
  if (contract.status === 'NO_OP_INTENTIONAL') return 'NO_OP_INTENTIONAL';
  if (contract.intent === 'UNRESOLVED' || !contract.targetId && !contract.route && contract.targetType === 'ROUTE') {
    return contract.confidence === 'LOW' ? 'AMBIGUOUS' : 'PLANNED';
  }
  return contract.status;
}
