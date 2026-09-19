/**
 * P0.VR.DESIGN-WORKSPACE-SELF-CONCEPT1 — canonical DESIGN target typing.
 */

export type DesignTargetType = 'PAGE' | 'PROJECT_SYSTEM' | 'WORKSPACE_SELF';

export type DesignTargetRef = {
  targetId: string;
  targetType: DesignTargetType;
  projectId: string;
  displayName: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED';
};

export const WORKSPACE_SELF_TARGET_ID = 'site00-design-workspace' as const;
export const WORKSPACE_SELF_PROJECT_ID = 'site00-system' as const;

export const WORKSPACE_SELF_TARGET: DesignTargetRef = {
  targetId: WORKSPACE_SELF_TARGET_ID,
  targetType: 'WORKSPACE_SELF',
  projectId: WORKSPACE_SELF_PROJECT_ID,
  displayName: 'DESIGN WORKSPACE',
  description: 'SITE 00 master page-design and visual production workspace',
  status: 'ACTIVE',
};

export function isWorkspaceSelfTarget(target: Pick<DesignTargetRef, 'targetType' | 'targetId'>): boolean {
  return target.targetType === 'WORKSPACE_SELF' && target.targetId === WORKSPACE_SELF_TARGET_ID;
}

export function designTargetTypeForPage(_pageId: string, _screenId: string): DesignTargetType {
  return 'PAGE';
}

export function designTargetTypeForProjectTab(_section: string): DesignTargetType {
  return 'PROJECT_SYSTEM';
}

export function assertWorkspaceSelfNotPage(targetType: DesignTargetType): void {
  if (targetType === 'PAGE') {
    throw new Error('WORKSPACE_SELF must not use PAGE semantics');
  }
}
