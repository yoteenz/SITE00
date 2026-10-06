/**
 * Project-keyed WORKSPACE LEDGER — the founder's workspace mutations (approve, request revision, reject, resolve).
 *
 * Stored per project: `{ [projectId]: WorkspaceAction[] }`. One project's actions can never apply to another (the
 * graph also filters by project on replay). Device-local (like the existing request / activity stores) until a
 * server ledger exists — every projection (HUB · INBOX · DESIGN · LIBRARY · ACTIVITY) re-derives from it at once.
 */
import { useCallback, useEffect, useState } from 'react';
import type { WorkspaceAction } from '../../../shared/site00-production-graph/ledger.js';

const KEY = 'site00.production.workspace-ledger.v1';
const EVENT = 'site00:production-workspace-ledger';

function readAll(): Record<string, WorkspaceAction[]> {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, WorkspaceAction[]>) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function readWorkspaceLedger(projectId: string): WorkspaceAction[] {
  if (typeof window === 'undefined') return [];
  return (readAll()[projectId.toLowerCase()] ?? []).filter((a) => a.project_id === projectId.toLowerCase());
}

export function recordWorkspaceAction(action: WorkspaceAction): void {
  const all = readAll();
  const pid = action.project_id.toLowerCase();
  all[pid] = [...(all[pid] ?? []), action].slice(-500);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* storage unavailable */
  }
}

export function useWorkspaceLedger(projectId: string): WorkspaceAction[] {
  const [list, setList] = useState<WorkspaceAction[]>(() => readWorkspaceLedger(projectId));
  const refresh = useCallback(() => setList(readWorkspaceLedger(projectId)), [projectId]);
  useEffect(() => {
    refresh();
    window.addEventListener(EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);
  return list;
}
