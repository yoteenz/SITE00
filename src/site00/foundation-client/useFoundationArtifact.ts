/**
 * Digital Foundation client — data hooks over Composer's artifact API.
 * The server payload is the only source of lifecycle, quote and payment truth.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ClientDigitalFoundationPayload } from '../../../shared/site00-digital-foundation/clientProjection.js';
import type { DigitalFoundationAddonId } from '../../../shared/site00-digital-foundation/types.js';
import { DfApiError, fetchCatalog, fetchPayload, removeAddon, saveIntake, updateQuote, type ClientCatalog } from './api';
import {
  draftFromPayload,
  intakeFromDraft,
  needsFromDraft,
  planQuoteSync,
  sameDraft,
  sameSelections,
  selectionsFromQuote,
  type IntakeDraft,
  type Selections,
} from './model';

export type LoadState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; error: DfApiError };

export function useFoundationArtifact(token: string) {
  const [payload, setPayload] = useState<ClientDigitalFoundationPayload | null>(null);
  const [catalog, setCatalog] = useState<ClientCatalog | null>(null);
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const reload = useCallback(async (): Promise<ClientDigitalFoundationPayload | null> => {
    try {
      const next = await fetchPayload(tokenRef.current);
      setPayload(next);
      setLoad({ status: 'ready' });
      return next;
    } catch (e) {
      const err = e instanceof DfApiError ? e : new DfApiError(0, 'NETWORK');
      setLoad((prev) => (prev.status === 'ready' ? prev : { status: 'error', error: err }));
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    setLoad({ status: 'loading' });
    reload().catch(() => undefined);
    fetchCatalog()
      .then(setCatalog)
      .catch(() => setCatalog(null));
  }, [token, reload]);

  const retry = useCallback(() => {
    setLoad({ status: 'loading' });
    reload().catch(() => undefined);
    if (!catalog) fetchCatalog().then(setCatalog).catch(() => undefined);
  }, [reload, catalog]);

  return { payload, setPayload, catalog, load, reload, retry };
}

// ─── Intake draft (P02 / P03) ──────────────────────────────────────────────────────────────────

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

const AUTOSAVE_MS = 900;

export function useIntakeDraft(
  token: string,
  payload: ClientDigitalFoundationPayload | null,
  reload: () => Promise<ClientDigitalFoundationPayload | null>,
) {
  const [draft, setDraft] = useState<IntakeDraft | null>(null);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const savedRef = useRef<IntakeDraft | null>(null);
  const draftRef = useRef<IntakeDraft | null>(null);
  const timer = useRef<number | null>(null);
  const inflight = useRef<Promise<boolean> | null>(null);
  const artifactId = payload?.artifact.artifact_id ?? null;

  const editable = Boolean(
    payload && payload.artifact.intake_state !== 'COMPLETE' && payload.artifact.payment_state !== 'PAID',
  );

  // Seed once per artifact from what the server already holds (resume after reload).
  useEffect(() => {
    if (!payload || !artifactId) return;
    if (draftRef.current) return;
    const seeded = draftFromPayload(payload);
    draftRef.current = seeded;
    savedRef.current = seeded;
    setDraft(seeded);
  }, [payload, artifactId]);

  const save = useCallback(async (): Promise<boolean> => {
    if (inflight.current) await inflight.current;
    const current = draftRef.current;
    if (!current) return true;
    if (savedRef.current && sameDraft(current, savedRef.current)) {
      setStatus((s) => (s === 'dirty' ? 'saved' : s));
      return true;
    }
    setStatus('saving');
    const run = (async () => {
      try {
        await saveIntake(token, intakeFromDraft(current), needsFromDraft(current), false);
        savedRef.current = current;
        setSavedAt(new Date());
        const settled = draftRef.current && sameDraft(draftRef.current, current);
        setStatus(settled ? 'saved' : 'dirty');
        return true;
      } catch {
        setStatus('error');
        return false;
      }
    })();
    inflight.current = run;
    const ok = await run;
    inflight.current = null;
    return ok;
  }, [token]);

  const update = useCallback(
    (patch: Partial<IntakeDraft>) => {
      const base = draftRef.current;
      if (!base || !editable) return;
      const next = { ...base, ...patch };
      draftRef.current = next;
      setDraft(next);
      setStatus('dirty');
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        timer.current = null;
        void save();
      }, AUTOSAVE_MS);
    },
    [editable, save],
  );

  const flush = useCallback(async (): Promise<boolean> => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    if (!editable) return true;
    return save();
  }, [editable, save]);

  /** VIEW MY RECOMMENDATION: completes intake server-side (recommendation + quote v1), then re-reads. */
  const complete = useCallback(async (): Promise<{ ok: true } | { ok: false; code: string }> => {
    const current = draftRef.current;
    if (!current) return { ok: false, code: 'NOT_READY' };
    if (timer.current) window.clearTimeout(timer.current);
    if (inflight.current) await inflight.current;
    setStatus('saving');
    try {
      await saveIntake(token, intakeFromDraft(current), needsFromDraft(current), true);
      savedRef.current = current;
      setSavedAt(new Date());
      setStatus('saved');
      await reload();
      return { ok: true };
    } catch (e) {
      setStatus('error');
      return { ok: false, code: e instanceof DfApiError ? e.code : 'NETWORK' };
    }
  }, [token, reload]);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  return { draft, update, flush, complete, status, savedAt, editable, retry: save };
}

// ─── Quote selections (P04) ────────────────────────────────────────────────────────────────────

export type QuoteSyncStatus = 'idle' | 'pending' | 'saving' | 'error';

const QUOTE_DEBOUNCE_MS = 400;

export function useQuoteSelections(
  token: string,
  payload: ClientDigitalFoundationPayload | null,
  setPayload: (p: ClientDigitalFoundationPayload) => void,
) {
  const server = selectionsFromQuote(payload?.quote ?? null);
  const serverKey = payload?.quote ? `${payload.quote.quote_id}` : 'none';
  const [desired, setDesired] = useState<Selections>(server);
  const desiredRef = useRef<Selections>(server);
  const serverRef = useRef<Selections>(server);
  const [status, setStatus] = useState<QuoteSyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const busy = useRef(false);

  // Adopt a new server quote when nothing local is waiting to be sent.
  useEffect(() => {
    serverRef.current = selectionsFromQuote(payload?.quote ?? null);
    if (!timer.current && !busy.current) {
      desiredRef.current = serverRef.current;
      setDesired(serverRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverKey]);

  const sync = useCallback(async () => {
    if (busy.current) return;
    const plan = planQuoteSync(serverRef.current, desiredRef.current);
    if (plan.kind === 'none') {
      setStatus('idle');
      return;
    }
    busy.current = true;
    setStatus('saving');
    const sent = desiredRef.current;
    try {
      const res = plan.kind === 'remove' ? await removeAddon(token, plan.addon_id) : await updateQuote(token, plan.selections);
      serverRef.current = selectionsFromQuote(res.payload.quote);
      setPayload(res.payload);
      setError(null);
      busy.current = false;
      if (sameSelections(desiredRef.current, sent)) {
        desiredRef.current = serverRef.current;
        setDesired(serverRef.current);
        setStatus('idle');
      } else {
        void sync();
      }
    } catch (e) {
      busy.current = false;
      const code = e instanceof DfApiError ? e.code : 'NETWORK';
      desiredRef.current = serverRef.current;
      setDesired(serverRef.current);
      setError(code);
      setStatus('error');
    }
  }, [token, setPayload]);

  const schedule = useCallback(
    (next: Selections) => {
      desiredRef.current = next;
      setDesired(next);
      setError(null);
      setStatus('pending');
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        timer.current = null;
        void sync();
      }, QUOTE_DEBOUNCE_MS);
    },
    [sync],
  );

  const toggle = useCallback(
    (id: DigitalFoundationAddonId) => {
      const next = { ...desiredRef.current };
      if (next[id]) delete next[id];
      else next[id] = 1;
      schedule(next);
    },
    [schedule],
  );

  const setQuantity = useCallback(
    (id: DigitalFoundationAddonId, qty: number) => {
      const next = { ...desiredRef.current, [id]: Math.max(1, Math.min(50, Math.floor(qty))) };
      schedule(next);
    },
    [schedule],
  );

  /** Expired, unaccepted quote: re-issue the same selections as a new version (the server sets a fresh expiry). */
  const refresh = useCallback(async () => {
    if (busy.current || timer.current) return;
    busy.current = true;
    setStatus('saving');
    try {
      const same = (Object.entries(serverRef.current) as [DigitalFoundationAddonId, number][]).map(([addon_id, quantity]) => ({
        addon_id,
        quantity,
      }));
      const res = await updateQuote(token, same);
      serverRef.current = selectionsFromQuote(res.payload.quote);
      desiredRef.current = serverRef.current;
      setDesired(serverRef.current);
      setPayload(res.payload);
      setError(null);
      setStatus('idle');
    } catch (e) {
      setError(e instanceof DfApiError ? e.code : 'NETWORK');
      setStatus('error');
    } finally {
      busy.current = false;
    }
  }, [token, setPayload]);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  return { desired, toggle, setQuantity, refresh, status, error, settled: status === 'idle' || status === 'error' };
}

// ─── Checkout return verification (P06) ────────────────────────────────────────────────────────

const VERIFY_INTERVAL_MS = 3000;
const VERIFY_ATTEMPTS = 10;

/** Polls the payload after a Stripe return until the webhook has marked the artifact PAID. */
export function usePaymentVerification(
  active: boolean,
  reload: () => Promise<ClientDigitalFoundationPayload | null>,
) {
  const [phase, setPhase] = useState<'polling' | 'exhausted' | 'error' | null>(active ? 'polling' : null);
  const [attempt, setAttempt] = useState(0);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!active) {
      setPhase(null);
      return undefined;
    }
    let cancelled = false;
    let n = 0;
    let failures = 0;
    setPhase('polling');
    setAttempt(0);
    const tick = async () => {
      if (cancelled) return;
      n += 1;
      setAttempt(n);
      try {
        const next = await reload();
        failures = 0;
        if (cancelled) return;
        if (next?.artifact.payment_state === 'PAID') {
          setPhase(null);
          return;
        }
      } catch {
        failures += 1;
        if (failures >= 3) {
          if (!cancelled) setPhase('error');
          return;
        }
      }
      if (n >= VERIFY_ATTEMPTS) {
        if (!cancelled) setPhase('exhausted');
        return;
      }
      window.setTimeout(tick, VERIFY_INTERVAL_MS);
    };
    const first = window.setTimeout(tick, VERIFY_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(first);
    };
  }, [active, reload, round]);

  const restart = useCallback(() => setRound((r) => r + 1), []);
  return { phase, attempt, restart, attempts: VERIFY_ATTEMPTS };
}
