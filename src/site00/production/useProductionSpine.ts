/**
 * The production record spine's Takes workspace for one project, read from and written to the spine API.
 * Decisions are genuine records: each one is an APPROVAL written by the server, then the workspace reloads.
 */
import { useCallback, useEffect, useState } from 'react';
import type { TakeAction } from '../../../shared/site00-production-spine/types.js';
import type { TakesWorkspaceView } from '../../../shared/site00-production-spine/view.js';
import { apiFetch } from '../../utils/api';

export const SPINE_API = '/api/site00/production-spine';

export type SpineWorkspaceState = { status: 'loading' } | { status: 'error'; code: string; message: string } | { status: 'ready'; workspace: TakesWorkspaceView };

async function readJson(res: Response): Promise<Record<string, unknown> | null> {
  return (await res.json().catch(() => null)) as Record<string, unknown> | null;
}

export function useProductionSpineWorkspace(projectId: string) {
  const [state, setState] = useState<SpineWorkspaceState>({ status: 'loading' });
  const [pending, setPending] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`${SPINE_API}?action=workspace&project=${encodeURIComponent(projectId)}`);
      const body = await readJson(res);
      if (!res.ok || !body?.ok) setState({ status: 'error', code: String(body?.code ?? res.status), message: String(body?.error ?? res.statusText) });
      else setState({ status: 'ready', workspace: body.workspace as TakesWorkspaceView });
    } catch (e) {
      setState({ status: 'error', code: 'NETWORK', message: (e as Error).message });
    }
  }, [projectId]);

  useEffect(() => {
    setState({ status: 'loading' });
    void load();
  }, [load]);

  const post = useCallback(
    async (key: string, body: Record<string, unknown>) => {
      setPending(key);
      try {
        const res = await apiFetch(SPINE_API, { method: 'POST', body: { ...body, project: projectId } });
        const out = await readJson(res);
        setNotice(res.ok && out?.ok !== false ? null : `${String(out?.code ?? res.status)}: ${String(out?.error ?? (Array.isArray(out?.reasons) ? (out.reasons as Array<{ code: string }>).map((r) => r.code).join(', ') : res.statusText))}`);
        await load();
      } finally {
        setPending(null);
      }
    },
    [projectId, load],
  );

  const decide = useCallback((takeId: string, decision: TakeAction) => post(`${takeId}:${decision}`, { action: 'take-decision', takeId, decision }), [post]);
  const dispatch = useCallback((jobId: string) => post(`${jobId}:DISPATCH`, { action: 'dispatch', jobId }), [post]);

  return { state, pending, notice, decide, dispatch, reload: load };
}
