/**
 * Business Growth data hooks. The server's `business_growth` context is the only source of recommendations,
 * quote sections, delivery and roadmap; these hooks only send the client's own answers and choices.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { BusinessGrowthServiceId } from '../../../../shared/site00-business-growth-intelligence/types.js';
import { DfApiError, recordBuildInterest, updateGrowth, type DfPayload } from '../api';
import type { AmbitionDraft, GrowthContext } from './model';

export type GrowthSaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export function useAmbitionSave(token: string, setPayload: (p: DfPayload) => void) {
  const [status, setStatus] = useState<GrowthSaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (body: { draft?: AmbitionDraft; skipped?: boolean; complete?: boolean }): Promise<boolean> => {
      setStatus('saving');
      setError(null);
      try {
        const next = await updateGrowth(token, {
          ambition: body.skipped
            ? { skipped: true }
            : { goals: body.draft?.goals ?? [], context: body.draft?.context ?? {}, complete: Boolean(body.complete) },
        });
        setPayload(next);
        setStatus('saved');
        return true;
      } catch (e) {
        setError(e instanceof DfApiError ? e.code : 'NETWORK');
        setStatus('error');
        return false;
      }
    },
    [token, setPayload],
  );

  return { save, status, error };
}

const SELECTION_DEBOUNCE_MS = 350;

function idsOf(g: GrowthContext | null): BusinessGrowthServiceId[] {
  return (g?.selection.selected ?? []).filter((s) => s.client_selected).map((s) => s.service_id);
}

/** Explicit opt-in Growth selections. Optimistic on screen; reverts to the server's list if a save fails. */
export function useGrowthSelections(token: string, growth: GrowthContext | null, setPayload: (p: DfPayload) => void) {
  const serverKey = `${growth?.selection.revision ?? 0}:${idsOf(growth).join(',')}`;
  const [desired, setDesired] = useState<BusinessGrowthServiceId[]>(() => idsOf(growth));
  const desiredRef = useRef(desired);
  const serverRef = useRef(idsOf(growth));
  const [status, setStatus] = useState<GrowthSaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    serverRef.current = idsOf(growth);
    if (!timer.current && !busy.current) {
      desiredRef.current = serverRef.current;
      setDesired(serverRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverKey]);

  const sync = useCallback(async () => {
    if (busy.current) return;
    const sent = desiredRef.current;
    if (sent.join(',') === serverRef.current.join(',')) {
      setStatus('idle');
      return;
    }
    busy.current = true;
    setStatus('saving');
    try {
      const next = await updateGrowth(token, { selections: sent.map((service_id) => ({ service_id })) });
      serverRef.current = idsOf(next.business_growth ?? null);
      setPayload(next);
      busy.current = false;
      if (desiredRef.current.join(',') === sent.join(',')) {
        desiredRef.current = serverRef.current;
        setDesired(serverRef.current);
        setStatus('saved');
      } else {
        void sync();
      }
    } catch (e) {
      busy.current = false;
      desiredRef.current = serverRef.current;
      setDesired(serverRef.current);
      setError(e instanceof DfApiError ? e.code : 'NETWORK');
      setStatus('error');
    }
  }, [token, setPayload]);

  const schedule = useCallback(
    (next: BusinessGrowthServiceId[]) => {
      desiredRef.current = next;
      setDesired(next);
      setError(null);
      setStatus('pending');
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        timer.current = null;
        void sync();
      }, SELECTION_DEBOUNCE_MS);
    },
    [sync],
  );

  const toggle = useCallback(
    (id: BusinessGrowthServiceId) => {
      const cur = desiredRef.current;
      schedule(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
    },
    [schedule],
  );

  const clear = useCallback(() => schedule([]), [schedule]);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  return { desired, toggle, clear, status, error, settled: status !== 'pending' && status !== 'saving' };
}

export function useBuildInterest(token: string, setPayload: (p: DfPayload) => void) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const record = useCallback(async () => {
    setStatus('saving');
    try {
      setPayload(await recordBuildInterest(token));
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }, [token, setPayload]);
  return { record, status };
}
