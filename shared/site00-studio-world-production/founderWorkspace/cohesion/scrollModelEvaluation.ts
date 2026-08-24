/**
 * P0.UI.2 — WorkspaceScrollModelEvaluation
 */

import type { CohesionFailureCode, NdxWorkspaceRouteEntry, ScrollModel } from './types.js';

const INAPPROPRIATE_DOCUMENT_SCROLL: ScrollModel[] = ['NATIVE_DOCUMENT'];

const TASK_SPECIFIC_MODELS: ScrollModel[] = [
  'WORKSPACE_CANVAS',
  'HORIZONTAL_LANE',
  'BOARD',
  'TAB_PANEL',
  'INSPECT_DRAWER',
];

export type ScrollModelInput = Pick<NdxWorkspaceRouteEntry, 'routeId' | 'scrollModel' | 'migrationStatus'>;

export type ScrollModelResult = {
  routeId: string;
  scrollModel: ScrollModel | undefined;
  passed: boolean;
  failures: CohesionFailureCode[];
};

export function evaluateWorkspaceScrollModel(route: ScrollModelInput): ScrollModelResult {
  const failures: CohesionFailureCode[] = [];
  const model = route.scrollModel;

  if (route.migrationStatus === 'CANONICAL' && model && INAPPROPRIATE_DOCUMENT_SCROLL.includes(model)) {
    failures.push('FAIL_ENDLESS_SCROLL_AS_PRIMARY_UI');
    failures.push('FAIL_DESKTOP_DOCUMENT_COLUMN');
  }

  if (route.migrationStatus === 'CANONICAL' && !model) {
    failures.push('FAIL_WIDE_SCREEN_UNUSED');
  }

  if (route.migrationStatus === 'LEGACY' && model === 'NATIVE_DOCUMENT') {
    failures.push('FAIL_ENDLESS_SCROLL_AS_PRIMARY_UI');
    failures.push('FAIL_UNBOUNDED_TECHNICAL_SCROLL');
  }

  return { routeId: route.routeId, scrollModel: model, passed: failures.length === 0, failures };
}

export function classifyScrollModel(primaryInteraction: string): ScrollModel {
  const map: Record<string, ScrollModel> = {
    document: 'NATIVE_DOCUMENT',
    canvas: 'WORKSPACE_CANVAS',
    lane: 'HORIZONTAL_LANE',
    board: 'BOARD',
    modal: 'REVIEW_MODAL',
    inspect: 'INSPECT_DRAWER',
    tabs: 'TAB_PANEL',
    sheet: 'BOTTOM_SHEET',
    carousel: 'CAROUSEL',
  };
  return map[primaryInteraction] ?? 'NATIVE_DOCUMENT';
}

export { TASK_SPECIFIC_MODELS };
