import { apiFetch } from '../../../../utils/api.js';
import type { DesignProductionState } from '../../../../../shared/site00-design-workspace-production/types.js';
import { DESIGN_PRODUCTION_PAGE_ID } from '../../../../../shared/site00-design-workspace-production/types.js';

export const DESIGN_WORKSPACE_PRODUCTION_API = '/api/site00/design-workspace-production';

export type DesignWorkspaceProductionCommand =
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

type SessionResponse = {
  ok: boolean;
  state: DesignProductionState | null;
  sessionVersion: number | null;
  error?: string;
};

export async function fetchDesignWorkspaceProductionSession(
  projectId: string,
  pageId: string = DESIGN_PRODUCTION_PAGE_ID,
): Promise<{ state: DesignProductionState | null; sessionVersion: number | null; unavailable: boolean }> {
  const res = await apiFetch(
    `${DESIGN_WORKSPACE_PRODUCTION_API}?projectId=${encodeURIComponent(projectId)}&pageId=${encodeURIComponent(pageId)}`,
  );
  if (res.status === 401 || res.status === 503) {
    return { state: null, sessionVersion: null, unavailable: true };
  }
  if (!res.ok) {
    return { state: null, sessionVersion: null, unavailable: true };
  }
  const json = (await res.json()) as SessionResponse;
  return {
    state: json.state,
    sessionVersion: json.sessionVersion,
    unavailable: false,
  };
}

export async function postDesignWorkspaceProductionCommand(input: {
  projectId: string;
  pageId?: string;
  command: DesignWorkspaceProductionCommand;
  expectedSessionVersion: number | null;
  payload?: Record<string, unknown>;
}): Promise<{ state: DesignProductionState; sessionVersion: number; stale: boolean; forbidden: boolean; unavailable: boolean }> {
  const res = await apiFetch(DESIGN_WORKSPACE_PRODUCTION_API, {
    method: 'POST',
    body: {
      projectId: input.projectId,
      pageId: input.pageId ?? DESIGN_PRODUCTION_PAGE_ID,
      command: input.command,
      expectedSessionVersion: input.expectedSessionVersion,
      payload: input.payload,
    },
  });
  if (res.status === 409) {
    return { state: null as unknown as DesignProductionState, sessionVersion: 0, stale: true, forbidden: false, unavailable: false };
  }
  if (res.status === 403) {
    return { state: null as unknown as DesignProductionState, sessionVersion: 0, stale: false, forbidden: true, unavailable: false };
  }
  if (res.status === 401 || res.status === 503) {
    return { state: null as unknown as DesignProductionState, sessionVersion: 0, stale: false, forbidden: false, unavailable: true };
  }
  if (!res.ok) {
    throw new Error((await res.json().catch(() => ({})) as { error?: string }).error ?? 'COMMAND_FAILED');
  }
  const json = (await res.json()) as SessionResponse & { sessionVersion: number };
  return {
    state: json.state!,
    sessionVersion: json.sessionVersion,
    stale: false,
    forbidden: false,
    unavailable: false,
  };
}
