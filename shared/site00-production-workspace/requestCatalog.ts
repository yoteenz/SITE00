/**
 * Project → Production structured request catalogue (labels + routing target only).
 * Requests are created from Projects; Production receives them in its queue.
 */

import type { ProductionWorkspaceRequestKind } from './types.js';

export type ProductionRequestActionDef = {
  kind: ProductionWorkspaceRequestKind;
  label: string;
  /** Second line in the action menu, e.g. "Expression · Casting". */
  scope: string;
};

export const PROJECT_REQUEST_ACTIONS: readonly ProductionRequestActionDef[] = [
  { kind: 'DESIGN_REVISION', label: 'Request Design Revision', scope: 'Design' },
  { kind: 'EXPRESSION_NEW_CAMPAIGN', label: 'Request New Campaign', scope: 'Expression' },
  { kind: 'EXPRESSION_NEW_CHARACTER', label: 'Request New Character', scope: 'Expression · Casting' },
  { kind: 'EXPRESSION_WARDROBE_UPDATE', label: 'Request Wardrobe Update', scope: 'Expression · Wardrobe' },
  { kind: 'EXPRESSION_SET_CHANGE', label: 'Request Set Change', scope: 'Expression · Sets' },
  { kind: 'UPLOAD_REFERENCES', label: 'Upload References', scope: 'General' },
];

const TITLES: Record<ProductionWorkspaceRequestKind, string> = {
  DESIGN_REVISION: 'Design revision',
  EXPERIENCE_WORLD_APPROVAL: 'World approval',
  EXPRESSION_NEW_CHARACTER: 'New campaign character',
  EXPRESSION_LOOK_APPROVAL: 'Look approval',
  EXPRESSION_SET_CHANGE: 'Set adjustment',
  EXPRESSION_NEW_CAMPAIGN: 'New campaign',
  EXPRESSION_WARDROBE_UPDATE: 'Wardrobe update',
  UPLOAD_REFERENCES: 'Reference upload',
  EXPRESSION_STORYBOARD_REVISION: 'Storyboard revision',
};

export function productionRequestTitle(kind: ProductionWorkspaceRequestKind): string {
  return TITLES[kind];
}

export function productionRequestScope(kind: ProductionWorkspaceRequestKind): string {
  return PROJECT_REQUEST_ACTIONS.find((a) => a.kind === kind)?.scope ?? 'General';
}
