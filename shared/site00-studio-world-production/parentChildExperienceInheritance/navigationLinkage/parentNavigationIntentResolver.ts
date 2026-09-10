/**
 * ParentNavigationIntentResolver — resolve what each interactive element claims to open.
 */

import type { DeclaredParentAction, LinkageSourceType, NavigationMode } from './types.js';
import { classifyInteractionIntent, isNavigationLikeIntent } from './interactionIntentClassifier.js';

export type ResolvedNavigationIntent = {
  elementId: string;
  label: string;
  intent: ReturnType<typeof classifyInteractionIntent>;
  claimedTarget: string;
  navigationMode: NavigationMode;
  sourceType: LinkageSourceType;
  handlerRef: string | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
};

function inferNavigationMode(action: DeclaredParentAction): NavigationMode {
  if (action.navigationMode) return action.navigationMode;
  if (action.sourceType === 'setTab' || action.targetCategory) return 'TAB_STATE';
  if (action.sourceType === 'setWizardStep' || action.targetStep) return 'WORKFLOW_STEP';
  if (action.sourceType === 'openModal') return 'MODAL';
  if (action.sourceType === 'openDrawer') return 'DRAWER';
  if (action.sourceType === 'openSheet') return 'SHEET';
  return 'ROUTE';
}

function resolveClaimedTarget(action: DeclaredParentAction, parentRoute: string): string {
  if (action.targetRoute) return action.targetRoute;
  if (action.targetCategory) {
    const base = parentRoute.split('?')[0];
    const params = new URLSearchParams(parentRoute.includes('?') ? parentRoute.split('?')[1] : '');
    params.set('moreCategory', action.targetCategory);
    return `${base}?${params.toString()}`;
  }
  if (action.targetStep) {
    const base = parentRoute.split('?')[0];
    const params = new URLSearchParams(parentRoute.includes('?') ? parentRoute.split('?')[1] : '');
    if (parentRoute.includes('tab=PAGES') || parentRoute.includes('tab=pages')) {
      params.set('pagesStep', action.targetStep);
    } else if (parentRoute.includes('tab=ASSETS') || parentRoute.includes('tab=assets')) {
      params.set('assetStep', action.targetStep);
    } else if (parentRoute.includes('tab=SKINS') || parentRoute.includes('tab=skins')) {
      params.set('skinsStep', action.targetStep);
    }
    return `${base}?${params.toString()}`;
  }
  return parentRoute;
}

export function resolveParentNavigationIntents(input: {
  parentRoute: string;
  actions: DeclaredParentAction[];
}): ResolvedNavigationIntent[] {
  return input.actions.map((action) => {
    const intent = classifyInteractionIntent({
      label: action.label,
      elementType: action.elementType,
      sourceType: action.sourceType,
      hasTarget: Boolean(action.targetCategory || action.targetStep || action.targetRoute),
      explicitIntent: action.intent,
    });

    return {
      elementId: action.elementId,
      label: action.label,
      intent,
      claimedTarget: resolveClaimedTarget(action, input.parentRoute),
      navigationMode: inferNavigationMode(action),
      sourceType: action.sourceType ?? 'onClick',
      handlerRef: action.handlerRef ?? null,
      confidence: action.handlerRef ? 'HIGH' : action.targetCategory || action.targetStep ? 'HIGH' : 'MEDIUM',
    };
  });
}

export function navigationIntentsForLinkage(input: {
  parentRoute: string;
  actions: DeclaredParentAction[];
}): ResolvedNavigationIntent[] {
  return resolveParentNavigationIntents(input).filter((r) => isNavigationLikeIntent(r.intent));
}
