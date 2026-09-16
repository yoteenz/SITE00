/**
 * P0.VR.OPUS-NATIVE1 — Phase 2: the native design agent panel.
 *
 * Internal surface, not final UX. Its job is to make every control the sprint
 * requires real and operable: status, task, mode, context size, cost estimate
 * before dispatch, run cost after, stop, review, approve and revert.
 *
 * The panel deliberately shows the estimate and forces an explicit spend
 * acknowledgement before the start button becomes usable, so a FORENSIC run is
 * never one accidental click away.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { OPUS_NATIVE_MODES, type OpusNativeMode, type OpusNativeRun } from '../../../../../shared/site00-opus-native/types';
import { formatUsd } from '../../../../../shared/site00-opus-native/pricing';
import type { OpusNativeEstimateResponse } from '../../../../../shared/site00-opus-native/contracts';
import {
  estimateRun,
  fetchRunStatus,
  fetchServiceInfo,
  runAction,
  startRun,
  TERMINAL_STATUSES,
  type OpusNativeServiceInfo,
} from './opusNativeClient';

export interface OpusNativeAgentPanelProps {
  projectSlug: string;
  route: string;
  pageId: string;
  onRunChange?: (run: OpusNativeRun | null) => void;
}

export function OpusNativeAgentPanel({ projectSlug, route, pageId, onRunChange }: OpusNativeAgentPanelProps) {
  const [service, setService] = useState<OpusNativeServiceInfo | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [mode, setMode] = useState<OpusNativeMode>('QUICK');
  const [task, setTask] = useState('');
  const [estimate, setEstimate] = useState<OpusNativeEstimateResponse | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [spendConfirmed, setSpendConfirmed] = useState(false);
  const [run, setRun] = useState<OpusNativeRun | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  const target = useMemo(() => ({ projectSlug, route, pageId, viewport: 'MOBILE' as const }), [projectSlug, route, pageId]);

  useEffect(() => {
    let cancelled = false;
    fetchServiceInfo()
      .then((info) => {
        if (!cancelled) setService(info);
      })
      .catch((err: Error) => {
        if (!cancelled) setServiceError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    onRunChange?.(run);
  }, [run, onRunChange]);

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const beginPolling = useCallback(
    (runId: string) => {
      stopPolling();
      pollRef.current = window.setInterval(async () => {
        try {
          const next = await fetchRunStatus(runId);
          setRun(next.run);
          if (TERMINAL_STATUSES.has(next.run.status)) stopPolling();
        } catch {
          /* a transient poll failure must not tear down the run view */
        }
      }, 1500);
    },
    [stopPolling],
  );

  useEffect(() => stopPolling, [stopPolling]);

  // A changed task or mode invalidates the estimate the founder agreed to.
  useEffect(() => {
    setEstimate(null);
    setSpendConfirmed(false);
  }, [task, mode]);

  const handleEstimate = useCallback(async () => {
    setError(null);
    setEstimating(true);
    try {
      setEstimate(await estimateRun({ mode, task, target }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEstimating(false);
    }
  }, [mode, task, target]);

  const handleStart = useCallback(
    async (scriptedProviderId?: string) => {
      setError(null);
      setBusy(true);
      try {
        const started = await startRun({
          mode,
          task,
          target,
          founderConfirmedSpend: true,
          scriptedProviderId,
        });
        setRun(started.run);
        beginPolling(started.run.runId);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [mode, task, target, beginPolling],
  );

  const handleAction = useCallback(
    async (action: 'cancel' | 'approve' | 'request_changes' | 'revert') => {
      if (!run) return;
      setError(null);
      setBusy(true);
      try {
        const extra = action === 'request_changes' ? { note: window.prompt('What needs to change?') ?? '' } : {};
        const next = await runAction(action, run.runId, extra);
        setRun(next.run);
        if (TERMINAL_STATUSES.has(next.run.status)) stopPolling();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [run, stopPolling],
  );

  const diagnostics = service?.diagnostics;
  const apiReady = diagnostics?.anthropicApi === 'READY';
  const scripted = service?.scriptedProvider;
  const status = run?.status ?? 'READY';
  const reviewable = status === 'WAITING_FOR_FOUNDER_REVIEW';
  const canStart = task.trim().length > 0 && spendConfirmed && !busy && apiReady;

  return (
    <section className="s00-opus-panel" aria-label="Native Opus design agent">
      <div className="s00-opus-panel__bar">
        <span className="s00-opus-panel__label">Opus</span>
        <span className="s00-opus-status" data-state={status} role="status" aria-live="polite">
          {status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="s00-opus-panel__body">
        {diagnostics ? (
          <div className="s00-opus-diag" aria-label="Runtime diagnostics">
            <span className="s00-opus-diag__chip" data-ok={apiReady}>
              API {diagnostics.anthropicApi}
            </span>
            <span className="s00-opus-diag__chip">{diagnostics.model}</span>
            <span className="s00-opus-diag__chip">CACHE {diagnostics.promptCache}</span>
            <span className="s00-opus-diag__chip" data-ok={diagnostics.tools === 'READY'}>
              TOOLS {diagnostics.tools}
            </span>
            <span className="s00-opus-diag__chip" data-ok={diagnostics.preview === 'READY'}>
              PREVIEW {diagnostics.preview}
            </span>
            <span className="s00-opus-diag__chip" data-ok={diagnostics.costGuard !== 'BLOCKED'}>
              GUARD {diagnostics.costGuard}
            </span>
            <span className="s00-opus-diag__chip" data-ok={diagnostics.keyExposureAudit === 'SERVER_ONLY'}>
              KEY {diagnostics.keyExposureAudit}
            </span>
          </div>
        ) : (
          <p className="s00-opus-field__label">{serviceError ? `Runtime unreachable: ${serviceError}` : 'Loading runtime…'}</p>
        )}

        {!apiReady && diagnostics ? (
          <p className="s00-opus-field__label">
            {diagnostics.anthropicBlockedReason ?? 'Anthropic API unavailable'} — add ANTHROPIC_API_KEY to the
            server environment to dispatch live runs.
          </p>
        ) : null}

        <div className="s00-opus-field">
          <span className="s00-opus-field__label" id="opus-mode-label">
            Mode
          </span>
          <div className="s00-opus-modes" role="radiogroup" aria-labelledby="opus-mode-label">
            {OPUS_NATIVE_MODES.map((candidate) => (
              <button
                key={candidate}
                type="button"
                role="radio"
                aria-checked={mode === candidate}
                onClick={() => setMode(candidate)}
              >
                {candidate}
              </button>
            ))}
          </div>
        </div>

        <label className="s00-opus-field">
          <span className="s00-opus-field__label">Task</span>
          <textarea
            value={task}
            onChange={(event) => setTask(event.target.value)}
            placeholder="Describe one design correction. Smaller tasks converge better."
          />
        </label>

        <dl className="s00-opus-meta">
          <dt>Page</dt>
          <dd>{pageId}</dd>
          <dt>Route</dt>
          <dd>{route}</dd>
          <dt>Context</dt>
          <dd>
            {estimate
              ? `${estimate.estimatedTokens.toLocaleString()} tokens (${estimate.cacheableTokens.toLocaleString()} cacheable)`
              : '— estimate to compile'}
          </dd>
          <dt>Est. cost</dt>
          <dd>
            {estimate
              ? `${formatUsd(estimate.estimatedUsd)} cold · ${formatUsd(estimate.estimatedUsdCached)} cached`
              : '—'}
          </dd>
          <dt>Write scope</dt>
          <dd>{estimate ? estimate.writeAllowlist.join(', ') || 'READ ONLY' : '—'}</dd>
          <dt>Run cost</dt>
          <dd>{run?.receipt ? formatUsd(run.receipt.actualUsd ?? run.receipt.estimatedUsd) : '—'}</dd>
        </dl>

        {estimate ? (
          <label className="s00-opus-field__label" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={spendConfirmed}
              onChange={(event) => setSpendConfirmed(event.target.checked)}
            />
            Confirm spend up to {formatUsd(Number(estimate.guardLimits.maxRunCostUsd ?? 0))}
          </label>
        ) : null}

        <div className="s00-opus-actions">
          <button
            type="button"
            className="s00-opus-btn"
            onClick={handleEstimate}
            disabled={estimating || task.trim().length === 0}
          >
            {estimating ? 'Compiling…' : 'Estimate'}
          </button>
          <button
            type="button"
            className="s00-opus-btn s00-opus-btn--primary"
            onClick={() => handleStart()}
            disabled={!canStart}
          >
            Dispatch
          </button>
          <button
            type="button"
            className="s00-opus-btn"
            onClick={() => handleAction('cancel')}
            disabled={!run || TERMINAL_STATUSES.has(status)}
          >
            Stop
          </button>
        </div>

        {scripted?.enabled ? (
          <div className="s00-opus-actions">
            {scripted.transcripts.map((transcript) => (
              <button
                key={transcript.id}
                type="button"
                className="s00-opus-btn"
                title={transcript.description}
                onClick={() => handleStart(transcript.id)}
                disabled={busy}
              >
                Replay: {transcript.id}
              </button>
            ))}
          </div>
        ) : null}

        {error ? <p className="s00-opus-field__label">Error: {error}</p> : null}

        {run?.failure ? (
          <p className="s00-opus-field__label">
            {run.failure}: {run.failureDetail}
          </p>
        ) : null}

        {run ? (
          <>
            <div className="s00-opus-log" aria-label="Run transcript">
              {run.transcript.length === 0 ? (
                <span className="s00-opus-log__kind">No activity yet</span>
              ) : (
                run.transcript.map((entry, index) => (
                  <div className="s00-opus-log__entry" key={`${entry.at}-${index}`}>
                    <div className="s00-opus-log__kind">{entry.kind}</div>
                    {entry.text}
                  </div>
                ))
              )}
            </div>

            {run.patch ? (
              <div className="s00-opus-field">
                <span className="s00-opus-field__label">
                  Proposed patch · {run.patch.filesChanged.join(', ')}
                </span>
                <div className="s00-opus-log">{run.patch.diff}</div>
              </div>
            ) : null}

            <div className="s00-opus-actions">
              <button
                type="button"
                className="s00-opus-btn s00-opus-btn--approve"
                onClick={() => handleAction('approve')}
                disabled={!reviewable || busy}
              >
                Apply approved change
              </button>
              <button
                type="button"
                className="s00-opus-btn"
                onClick={() => handleAction('request_changes')}
                disabled={!reviewable || busy}
              >
                Request changes
              </button>
              <button
                type="button"
                className="s00-opus-btn s00-opus-btn--danger"
                onClick={() => handleAction('revert')}
                disabled={!run.patch || busy}
              >
                Revert
              </button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

export default OpusNativeAgentPanel;
