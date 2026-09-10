/**
 * InteractionIntentClassifier — only NAVIGATION-like actions enter linkage graph.
 */

import type { DeclaredParentAction, InteractionIntent } from './types.js';

const MUTATION_LABELS = /^(SAVE|DELETE|DOWNLOAD|SUBMIT|CONFIRM|CANCEL|TOGGLE|APPLY|DISPATCH|UPLOAD)$/i;
const FILTER_SORT = /^(FILTER|SORT|SEARCH)$/i;
const EXTERNAL = /^https?:\/\//;

export function classifyInteractionIntent(input: {
  label: string;
  elementType?: DeclaredParentAction['elementType'];
  sourceType?: DeclaredParentAction['sourceType'];
  hasTarget?: boolean;
  explicitIntent?: InteractionIntent;
}): InteractionIntent {
  if (input.explicitIntent) return input.explicitIntent;

  const label = input.label.trim();
  if (EXTERNAL.test(label)) return 'EXTERNAL_LINK';
  if (MUTATION_LABELS.test(label)) {
    if (/DELETE|REMOVE/.test(label)) return 'DESTRUCTIVE';
    if (/DOWNLOAD/.test(label)) return 'DOWNLOAD';
    if (/SUBMIT|SAVE|APPLY|DISPATCH/.test(label)) return 'SUBMISSION';
    return 'MUTATION';
  }
  if (FILTER_SORT.test(label)) return label.toUpperCase().includes('SORT') ? 'SORT' : 'FILTER';
  if (/TOGGLE|SWITCH/.test(label)) return 'STATE_CHANGE';

  if (input.hasTarget || input.sourceType === 'setTab' || input.sourceType === 'setWizardStep') {
    return 'NAVIGATION';
  }

  if (input.elementType === 'TAB' || input.elementType === 'NAV_ITEM' || input.elementType === 'CARD' || input.elementType === 'TILE') {
    return 'NAVIGATION';
  }

  return 'OTHER';
}

export function isNavigationLikeIntent(intent: InteractionIntent): boolean {
  return intent === 'NAVIGATION';
}

export function filterNavigationActions(actions: DeclaredParentAction[]): DeclaredParentAction[] {
  return actions.filter((a) => {
    const intent = classifyInteractionIntent({
      label: a.label,
      elementType: a.elementType,
      sourceType: a.sourceType,
      hasTarget: Boolean(a.targetCategory || a.targetStep || a.targetRoute),
      explicitIntent: a.intent,
    });
    return isNavigationLikeIntent(intent);
  });
}
