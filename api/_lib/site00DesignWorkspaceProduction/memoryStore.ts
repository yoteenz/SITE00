import { createInitialDesignProductionState } from '../../../shared/site00-design-workspace-production/designProductionStore.js';
import type { DesignProductionState } from '../../../shared/site00-design-workspace-production/types.js';
import type { DesignWorkspaceAuthoritySessionRow } from './types.js';

const sessions = new Map<string, DesignWorkspaceAuthoritySessionRow>();
const events: { sessionId: string; eventType: string; payload: Record<string, unknown>; actorEmail: string | null; at: string }[] =
  [];
const buildPackages = new Map<string, Record<string, unknown>>();

function key(projectId: string, pageId: string): string {
  return `${projectId.toLowerCase()}:${pageId}`;
}

export function resetDesignWorkspaceProductionMemory(): void {
  sessions.clear();
  events.length = 0;
  buildPackages.clear();
}

export function getSessionMemory(projectId: string, pageId: string): DesignWorkspaceAuthoritySessionRow | null {
  return sessions.get(key(projectId, pageId)) ?? null;
}

export function upsertSessionMemory(input: {
  projectId: string;
  pageId: string;
  expectedSessionVersion: number | null;
  state: DesignProductionState;
  latestBuildPackageId: string | null;
  newEvents: { type: string; payload?: Record<string, unknown>; actorEmail: string | null; at: string }[];
}): DesignWorkspaceAuthoritySessionRow {
  const k = key(input.projectId, input.pageId);
  const existing = sessions.get(k);
  if (existing && input.expectedSessionVersion !== null && existing.sessionVersion !== input.expectedSessionVersion) {
    throw new Error('STALE_STATE');
  }
  const id = existing?.id ?? `mem-${k}`;
  const sessionVersion = (existing?.sessionVersion ?? 0) + 1;
  const row: DesignWorkspaceAuthoritySessionRow = {
    id,
    projectId: input.projectId.toLowerCase(),
    pageId: input.pageId,
    sessionVersion,
    state: { ...input.state, sessionVersion },
    latestBuildPackageId: input.latestBuildPackageId,
    authorityLockedAt: input.state.pairLockedAt,
    authorityLockedBy: input.state.authorityLockedBy ?? null,
    updatedAt: input.state.updatedAt,
  };
  sessions.set(k, row);
  for (const ev of input.newEvents) {
    events.push({ sessionId: id, eventType: ev.type, payload: ev.payload ?? {}, actorEmail: ev.actorEmail, at: ev.at });
  }
  if (input.state.buildPackage) {
    buildPackages.set(input.state.buildPackage.id, input.state.buildPackage as unknown as Record<string, unknown>);
  }
  return row;
}

export function createInitialSessionMemory(projectId: string, pageId: string): DesignWorkspaceAuthoritySessionRow {
  const state = createInitialDesignProductionState(projectId);
  return upsertSessionMemory({
    projectId,
    pageId,
    expectedSessionVersion: null,
    state,
    latestBuildPackageId: null,
    newEvents: [],
  });
}

export function listEventsMemory(sessionId: string): typeof events {
  return events.filter((e) => e.sessionId === sessionId);
}

export function getBuildPackageMemory(id: string): Record<string, unknown> | null {
  return buildPackages.get(id) ?? null;
}
