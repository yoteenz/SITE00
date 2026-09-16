import type { DesignProductionState } from '../../../shared/site00-design-workspace-production/types.js';
import { DESIGN_PRODUCTION_PAGE_ID } from '../../../shared/site00-design-workspace-production/types.js';

export const DESIGN_WORKSPACE_PRODUCTION_PAGE_ID = DESIGN_PRODUCTION_PAGE_ID;

export type DesignWorkspaceAuthoritySessionRow = {
  id: string;
  projectId: string;
  pageId: string;
  sessionVersion: number;
  state: DesignProductionState;
  latestBuildPackageId: string | null;
  authorityLockedAt: string | null;
  authorityLockedBy: string | null;
  updatedAt: string;
};

export type DesignWorkspaceProductionCommandName =
  | 'START_PAIR_REVIEW'
  | 'APPROVE_AUTHORITY'
  | 'LOCK_AUTHORITY_PAIR'
  | 'CREATE_TABLET_OVERRIDE'
  | 'MOVE_TO_BUILD'
  | 'RECORD_SPEND_CONFIRMATION'
  | 'REFINE_CONCEPT'
  | 'REGENERATE_CONCEPT'
  | 'SELECT_GALLERY_CANDIDATE'
  | 'SELECT_VIEWPORT_CANDIDATE'
  | 'PROMOTE_VIEWPORT_MASTER'
  | 'MIGRATE_FROM_LOCAL';

export type ApplyDesignWorkspaceCommandInput = {
  projectId: string;
  pageId: string;
  expectedSessionVersion: number | null;
  command: DesignWorkspaceProductionCommandName;
  payload?: Record<string, unknown>;
  actorEmail: string | null;
  actorIsFounder: boolean;
};

export type ApplyDesignWorkspaceCommandResult = {
  session: DesignWorkspaceAuthoritySessionRow;
  state: DesignProductionState;
};
