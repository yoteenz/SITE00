/**
 * P0.VR.OPUS-NATIVE2 — Phase 2, 3, 4, 7, 22, 26, 32: Opus inside DESIGN.
 *
 * Presentation decision, and the reason for it:
 *
 * A right-edge drawer, mounted outside the artboard's transform and collapsed
 * to a narrow rail by default. The DESIGN workspace is a proportionally scaled
 * full-bleed artboard — anything rendered inside it inherits `transform:
 * scale()` and stops being legible at small viewports, and anything floating
 * on top of it covers the thing being designed. A rail costs a strip of gutter
 * and never occludes the canvas, which is the one thing a design surface
 * cannot afford to lose.
 *
 * It is deliberately not a chat window. There is no message list and no
 * conversational affordance, because the agent's inputs are structured —
 * intent, mode, scope, spend — and a free-text box would hide all four behind
 * a sentence the model then has to guess the meaning of. The founder types the
 * change they want; everything else is a control with a visible current value.
 *
 * The flow is fixed and always in this order: TARGET is shown, INTENT and MODE
 * are chosen, ESTIMATE is required before DISPATCH, authorization is requested
 * if the intent outruns the page's standing authority, and the run ends at a
 * review the founder has to answer.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { OPUS_NATIVE_API_PATH } from '../../../../../shared/site00-opus-native/contracts';
import type { OpusNativeEstimateResponse } from '../../../../../shared/site00-opus-native/contracts';
import { OPUS_NATIVE_MODES, type OpusNativeMode, type OpusNativeRun } from '../../../../../shared/site00-opus-native/types';
import {
  DESIGN_AGENT_INTENT_SPECS,
  DESIGN_AGENT_INTENTS,
  describeWriteMode,
  type DesignAgentIntent,
  type FounderWriteGrant,
  type WriteAuthorizationRequest,
} from '../../../../../shared/site00-opus-native/writePolicy';
import {
  continueRun,
  estimateRun,
  fetchRunStatus,
  fetchServiceInfo,
  runAction,
  startRunAuthorised,
  TERMINAL_STATUSES,
  WriteAccessRequiredError,
  type OpusNativeServiceInfo,
} from '../opusNative/opusNativeClient';
import { useDesignAgentTarget } from './useDesignAgentTarget';
import '../../../styles/site00-design-agent.css';

/**
 * Phase 3 — the status vocabulary the sprint specifies, mapped from the
 * runtime's own union. The runtime reports what it is doing at tool
 * granularity; the founder wants the phase.
 */
function phaseLabel(run: OpusNativeRun | null, estimating: boolean): string {
  if (estimating) return 'COMPILING CONTEXT';
  if (!run) return 'READY';
  switch (run.status) {
    case 'THINKING':
      return 'THINKING';
    case 'RENDERING':
      return 'RENDERING';
    case 'TOOL_USE': {
      const last = run.toolCalls.at(-1)?.tool ?? '';
      if (last.includes('compare')) return 'COMPARING';
      if (last.includes('test') || last.includes('typecheck')) return 'TESTING';
      if (last.includes('patch') || last.includes('create_file')) return 'PATCHING';
      if (last.includes('read') || last.includes('search') || last.includes('discover')) return 'READING';
      return 'WORKING';
    }
    case 'WAITING_FOR_FOUNDER_REVIEW':
      return 'WAITING FOR FOUNDER REVIEW';
    default:
      return run.status;
  }
}

function usd(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `$${value.toFixed(3)}`;
}

export function DesignAgentDock() {
  const targeting = useDesignAgentTarget();
  const [open, setOpen] = useState(false);
  const [service, setService] = useState<OpusNativeServiceInfo | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const [intent, setIntent] = useState<DesignAgentIntent>('REFINE_CURRENT');
  const [mode, setMode] = useState<OpusNativeMode>('DESIGN');
  const [task, setTask] = useState('');

  const [estimate, setEstimate] = useState<OpusNativeEstimateResponse | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [authorization, setAuthorization] = useState<WriteAuthorizationRequest | null>(null);
  const [grant, setGrant] = useState<FounderWriteGrant | null>(null);

  const [run, setRun] = useState<OpusNativeRun | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changeNote, setChangeNote] = useState('');
  const [showContext, setShowContext] = useState(false);

  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    fetchServiceInfo()
      .then(setService)
      .catch((cause: Error) => setServiceError(cause.message));
  }, []);

  // A change of page invalidates an estimate and a grant: both were scoped to
  // the surface that is no longer on screen.
  useEffect(() => {
    setEstimate(null);
    setAuthorization(null);
    setGrant(null);
  }, [targeting.pageId]);

  useEffect(() => {
    if (!run || TERMINAL_STATUSES.has(run.status)) {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
      return;
    }
    pollRef.current = window.setInterval(() => {
      fetchRunStatus(run.runId)
        .then((response) => setRun(response.run))
        .catch(() => undefined);
    }, 1500);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [run?.runId, run?.status]);

  const spec = DESIGN_AGENT_INTENT_SPECS[intent];
  const diagnostics = service?.diagnostics ?? null;

  const onEstimate = useCallback(async () => {
    setEstimating(true);
    setError(null);
    setAuthorization(null);
    try {
      const response = await estimateRun({
        mode,
        task: task.trim() || spec.description,
        target: targeting.target,
        intent,
        writeGrant: grant,
      });
      setEstimate(response);
      if (response.writeAuthorization) setAuthorization(response.writeAuthorization);
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setEstimating(false);
    }
  }, [mode, task, spec.description, targeting.target, intent, grant]);

  const onDispatch = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await startRunAuthorised({
        mode,
        task: task.trim(),
        target: targeting.target,
        founderConfirmedSpend: true,
        intent,
        writeGrant: grant,
      });
      setRun(response.run);
      setAuthorization(null);
    } catch (cause) {
      if (cause instanceof WriteAccessRequiredError) setAuthorization(cause.authorization);
      else setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }, [mode, task, targeting.target, intent, grant]);

  const onReview = useCallback(
    async (action: 'approve' | 'revert' | 'cancel') => {
      if (!run) return;
      setBusy(true);
      try {
        const response = await runAction(action, run.runId);
        setRun(response.run);
      } catch (cause) {
        setError((cause as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [run],
  );

  /** Phase 23 — the follow-up continues the thread rather than restarting it. */
  const onRequestChanges = useCallback(async () => {
    if (!run || !changeNote.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const response = await continueRun({
        runId: run.runId,
        note: changeNote.trim(),
        founderConfirmedSpend: true,
      });
      setRun(response.run);
      setChangeNote('');
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }, [run, changeNote]);

  // Phase 22 — dispatch is gated on a current estimate, so the price is
  // always something the founder saw rather than something they accepted.
  const dispatchDisabled =
    !estimate ||
    busy ||
    Boolean(authorization) ||
    task.trim().length === 0 ||
    !estimate.modeFitsBudget;

  const status = phaseLabel(run, estimating);
  const review = run?.review ?? null;
  const cost = run?.receipt?.actualUsd ?? run?.guard.spentUsd ?? null;

  const shotUrl = useMemo(
    () => (id: string) =>
      `${OPUS_NATIVE_API_PATH}?action=screenshot&runId=${encodeURIComponent(run?.runId ?? '')}&id=${encodeURIComponent(id)}`,
    [run?.runId],
  );

  if (targeting.registered === false && !targeting.registryError) return null;

  return (
    <aside className={`s00-dad${open ? ' s00-dad--open' : ''}`} data-testid="design-agent-dock">
      <button
        type="button"
        className="s00-dad__rail"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="s00-dad-panel"
      >
        <span className="s00-dad__rail-mark">OPUS</span>
        <span className={`s00-dad__rail-dot s00-dad__rail-dot--${status === 'READY' ? 'idle' : 'live'}`} aria-hidden="true" />
      </button>

      <div className="s00-dad__panel" id="s00-dad-panel" hidden={!open}>
        <header className="s00-dad__head">
          <span className="s00-dad__title">OPUS DESIGN AGENT</span>
          <span className="s00-dad__model">{service?.model ?? 'claude-opus-5'}</span>
        </header>

        {targeting.registryError ? (
          <p className="s00-dad__blocked">
            AGENT UNAVAILABLE — the surface registry could not be read ({targeting.registryError}). In local
            development the Vite server must proxy /api to the runtime: run <code>npm run dev:proxy</code> or set
            VITE_DEV_PROXY_TARGET.
          </p>
        ) : null}

        {/* Phase 3 — status is the first thing, always. */}
        <div className="s00-dad__status" data-status={status}>
          <span className="s00-dad__status-label">STATUS</span>
          <span className="s00-dad__status-value">{status}</span>
        </div>

        {serviceError ? <p className="s00-dad__error">Runtime unreachable: {serviceError}</p> : null}

        {/* Phase 3/4 — the compiled target, shown rather than typed. */}
        <section className="s00-dad__block">
          <h3 className="s00-dad__h">TARGET</h3>
          <dl className="s00-dad__dl">
            <div><dt>PROJECT</dt><dd>{targeting.projectSlug.toUpperCase()}</dd></div>
            <div><dt>PAGE</dt><dd>{targeting.pageId ?? '—'}</dd></div>
            <div><dt>VIEW</dt><dd>{String(targeting.target.viewMode ?? '—').toUpperCase()}</dd></div>
            <div><dt>VIEWPORT</dt><dd>{targeting.target.viewport}</dd></div>
            <div><dt>GOLDEN</dt><dd>{targeting.goldenVersion ?? '—'}</dd></div>
            <div>
              <dt>WRITE SCOPE</dt>
              <dd>{estimate?.permittedMode ?? targeting.standingWriteMode ?? '—'}</dd>
            </div>
          </dl>
          {targeting.firewallReason ? (
            <p className="s00-dad__note">PROTECTED · {targeting.firewallReason}</p>
          ) : null}
        </section>

        {/* Phase 5 — intent is chosen, never inferred from the task text. */}
        <section className="s00-dad__block">
          <h3 className="s00-dad__h">INTENT</h3>
          <div className="s00-dad__chips" role="radiogroup" aria-label="Agent intent">
            {DESIGN_AGENT_INTENTS.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={intent === value}
                className={`s00-dad__chip${intent === value ? ' is-on' : ''}`}
                onClick={() => {
                  setIntent(value);
                  setEstimate(null);
                }}
              >
                {value.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          <p className="s00-dad__note">{spec.description}</p>
        </section>

        {/* Phase 21 — mode decides context budget, loops and spend ceiling. */}
        <section className="s00-dad__block">
          <h3 className="s00-dad__h">MODE</h3>
          <div className="s00-dad__chips" role="radiogroup" aria-label="Execution mode">
            {OPUS_NATIVE_MODES.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={mode === value}
                className={`s00-dad__chip${mode === value ? ' is-on' : ''}`}
                onClick={() => {
                  setMode(value);
                  setEstimate(null);
                }}
              >
                {value}
              </button>
            ))}
          </div>
        </section>

        <section className="s00-dad__block">
          <h3 className="s00-dad__h">CHANGE</h3>
          <textarea
            className="s00-dad__task"
            value={task}
            placeholder="Describe the change. The page, view, viewport and golden are already known."
            onChange={(event) => {
              setTask(event.target.value);
              setEstimate(null);
            }}
            rows={4}
          />
        </section>

        {/* Phase 22 — nothing dispatches before the price is on screen. */}
        <section className="s00-dad__block">
          <h3 className="s00-dad__h">COST</h3>
          {estimate ? (
            <dl className="s00-dad__dl">
              <div><dt>CONTEXT</dt><dd>{estimate.estimatedTokens.toLocaleString()} tok</dd></div>
              <div><dt>CACHE</dt><dd>{estimate.cacheableTokens.toLocaleString()} cacheable</dd></div>
              <div><dt>EST MAX</dt><dd>{usd(estimate.estimatedUsd)}</dd></div>
              <div><dt>IF CACHED</dt><dd>{usd(estimate.estimatedUsdCached)}</dd></div>
              <div><dt>ASSETS</dt><dd>{estimate.assetMutation}</dd></div>
              <div><dt>PREVIEW</dt><dd>{estimate.previewReady ? 'READY' : (estimate.previewReason ?? 'BLOCKED')}</dd></div>
            </dl>
          ) : (
            <p className="s00-dad__note">Estimate to see context size, cache posture and the spend ceiling.</p>
          )}

          {/* Phase 21/22 — a mode that cannot finish is worse than no run. */}
          {estimate && !estimate.modeFitsBudget ? (
            <div className="s00-dad__warn">
              <p>{estimate.modeFitDetail}</p>
              {estimate.recommendedMode !== mode ? (
                <button
                  type="button"
                  className="s00-dad__btn"
                  onClick={() => {
                    setMode(estimate.recommendedMode);
                    setEstimate(null);
                  }}
                >
                  SWITCH TO {estimate.recommendedMode}
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="s00-dad__actions">
            <button type="button" className="s00-dad__btn" onClick={onEstimate} disabled={estimating || busy}>
              ESTIMATE
            </button>
            <button
              type="button"
              className="s00-dad__btn s00-dad__btn--primary"
              onClick={onDispatch}
              disabled={dispatchDisabled}
            >
              DISPATCH
            </button>
            {run && !TERMINAL_STATUSES.has(run.status) ? (
              <button type="button" className="s00-dad__btn" onClick={() => onReview('cancel')}>
                STOP
              </button>
            ) : null}
          </div>
        </section>

        {/* Phase 7 — the grant prompt. Page, capability, paths, reason. */}
        {authorization ? (
          <section className="s00-dad__block s00-dad__block--warn">
            <h3 className="s00-dad__h">WRITE ACCESS REQUIRED</h3>
            <dl className="s00-dad__dl">
              <div><dt>PAGE</dt><dd>{authorization.pageId}</dd></div>
              <div><dt>NEEDS</dt><dd>{authorization.requestedMode}</dd></div>
              <div><dt>HAS</dt><dd>{authorization.permittedMode}</dd></div>
            </dl>
            <p className="s00-dad__note">{authorization.reason}</p>
            <p className="s00-dad__note">{describeWriteMode(authorization.requestedMode)}</p>
            {authorization.additionalFiles.length > 0 ? (
              <ul className="s00-dad__files">
                {authorization.additionalFiles.map((file) => (
                  <li key={file}>{file}</li>
                ))}
              </ul>
            ) : null}
            {authorization.grantable ? (
              <div className="s00-dad__actions">
                <button
                  type="button"
                  className="s00-dad__btn s00-dad__btn--primary"
                  onClick={() => {
                    setGrant({ mode: authorization.requestedMode });
                    setAuthorization(null);
                    setEstimate(null);
                  }}
                >
                  GRANT FOR THIS RUN
                </button>
                <button type="button" className="s00-dad__btn" onClick={() => setAuthorization(null)}>
                  DENY
                </button>
              </div>
            ) : (
              <p className="s00-dad__note">
                Not grantable here: this surface allows at most {authorization.maxGrantableMode}.
              </p>
            )}
          </section>
        ) : null}

        {grant ? (
          <p className="s00-dad__grant">
            GRANTED {grant.mode} · this run only ·{' '}
            <button type="button" className="s00-dad__link" onClick={() => setGrant(null)}>
              revoke
            </button>
          </p>
        ) : null}

        {error ? <p className="s00-dad__error">{error}</p> : null}

        {/* Phase 3 — live run telemetry. */}
        {run ? (
          <section className="s00-dad__block">
            <h3 className="s00-dad__h">RUN</h3>
            <dl className="s00-dad__dl">
              <div><dt>ITERATIONS</dt><dd>{run.guard.iterations}</dd></div>
              <div><dt>TOOL CALLS</dt><dd>{run.toolCalls.length}</dd></div>
              <div><dt>SPENT</dt><dd>{usd(cost)}</dd></div>
              <div><dt>CACHE</dt><dd>{diagnostics?.promptCache ?? 'UNKNOWN'}</dd></div>
              <div><dt>SCOPE</dt><dd>{run.writeMode}{run.writeGrantApplied ? ' (granted)' : ''}</dd></div>
            </dl>
            {run.failure ? (
              <p className="s00-dad__error">
                {run.failure} · {run.failureDetail}
              </p>
            ) : null}
          </section>
        ) : null}

        {/* Phase 26 — founder review: before, after, golden, files, tests, cost. */}
        {review && run?.status === 'WAITING_FOR_FOUNDER_REVIEW' ? (
          <section className="s00-dad__block s00-dad__block--review">
            <h3 className="s00-dad__h">FOUNDER REVIEW</h3>
            <p className="s00-dad__note">{review.summary}</p>

            {review.previewBlocked ? (
              <p className="s00-dad__warn">
                The run could not render this page, so nothing here is visually certified.
              </p>
            ) : null}

            <div className="s00-dad__shots">
              {review.before ? (
                <figure><img src={shotUrl(review.before.screenshotId)} alt="Before" /><figcaption>BEFORE</figcaption></figure>
              ) : null}
              {review.after ? (
                <figure><img src={shotUrl(review.after.screenshotId)} alt="After" /><figcaption>AFTER</figcaption></figure>
              ) : null}
              {review.golden ? (
                <figure><img src={`/${review.golden.path.replace(/^public\//, '')}`} alt="Golden" /><figcaption>GOLDEN</figcaption></figure>
              ) : null}
            </div>

            {typeof review.after?.diffPercent === 'number' ? (
              <p className="s00-dad__note">Changed pixels: {review.after.diffPercent}%</p>
            ) : null}

            {review.patch ? (
              <>
                <p className="s00-dad__note">{review.patch.reason}</p>
                <ul className="s00-dad__files">
                  {review.patch.filesChanged.map((file) => (
                    <li key={file}>
                      {review.createdFiles.includes(file) ? 'NEW  ' : 'EDIT '}
                      {file}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="s00-dad__note">No patch was produced.</p>
            )}

            <dl className="s00-dad__dl">
              <div><dt>TYPECHECK</dt><dd>{review.typecheck ? (review.typecheck.ok ? 'PASS' : 'FAIL') : 'not run'}</dd></div>
              <div><dt>TESTS</dt><dd>{review.tests ? (review.tests.ok ? 'PASS' : 'FAIL') : 'not run'}</dd></div>
              <div><dt>COST</dt><dd>{usd(review.receipt.actualUsd)}</dd></div>
            </dl>

            <div className="s00-dad__actions">
              <button type="button" className="s00-dad__btn s00-dad__btn--primary" onClick={() => onReview('approve')} disabled={busy}>
                APPROVE
              </button>
              <button type="button" className="s00-dad__btn" onClick={() => onReview('revert')} disabled={busy}>
                REVERT
              </button>
            </div>

            <textarea
              className="s00-dad__task"
              rows={2}
              placeholder="Request changes — continues this thread, keeps the context."
              value={changeNote}
              onChange={(event) => setChangeNote(event.target.value)}
            />
            <button type="button" className="s00-dad__btn" onClick={onRequestChanges} disabled={busy || !changeNote.trim()}>
              REQUEST CHANGES
            </button>
            {/* Phase 27 — approval is acceptance, not a merge. */}
            <p className="s00-dad__note">
              APPROVE marks the patch accepted and leaves it in the working tree. It does not commit or deploy.
            </p>
          </section>
        ) : null}

        {/* Phase 32 — what Opus knows, on request, without chain-of-thought. */}
        <section className="s00-dad__block">
          <button type="button" className="s00-dad__link" onClick={() => setShowContext((value) => !value)}>
            {showContext ? 'HIDE' : 'SHOW'} AGENT CONTEXT
          </button>
          {showContext ? (
            <AgentContextView route={targeting.route} pageId={targeting.pageId} mode={mode} intent={intent} />
          ) : null}
        </section>

        <footer className="s00-dad__foot">
          <span>PREVIEW {diagnostics?.preview ?? '—'}</span>
          <span>API {diagnostics?.anthropicApi ?? '—'}</span>
          <a className="s00-dad__link" href={`/projects/${targeting.projectSlug}/design/opus-native`}>
            DIAGNOSTIC ROUTE
          </a>
        </footer>
      </div>
    </aside>
  );
}

/**
 * Phase 32. Shows the compiled blocks, their sizes, their sources and a short
 * preview of each — the operational context the model will actually receive.
 * Explicitly not the model's reasoning, which the founder should not be shown
 * and the model should not be asked to manufacture for display.
 */
function AgentContextView(props: {
  route: string;
  pageId: string | null;
  mode: OpusNativeMode;
  intent: DesignAgentIntent;
}) {
  const [data, setData] = useState<Awaited<ReturnType<typeof import('../opusNative/opusNativeClient').fetchAgentContext>> | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('../opusNative/opusNativeClient')
      .then((module) =>
        module.fetchAgentContext({
          route: props.route,
          pageId: props.pageId ?? undefined,
          mode: props.mode,
          intent: props.intent,
        }),
      )
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch((cause: Error) => {
        if (!cancelled) setFailed(cause.message);
      });
    return () => {
      cancelled = true;
    };
  }, [props.route, props.pageId, props.mode, props.intent]);

  if (failed) return <p className="s00-dad__error">{failed}</p>;
  if (!data) return <p className="s00-dad__note">Compiling…</p>;

  return (
    <div className="s00-dad__ctx">
      <dl className="s00-dad__dl">
        <div><dt>TOTAL</dt><dd>{data.totalEstimatedTokens.toLocaleString()} tok</dd></div>
        <div><dt>CACHEABLE</dt><dd>{data.cacheableEstimatedTokens.toLocaleString()} tok</dd></div>
        <div><dt>WRITE</dt><dd>{data.policy.mode}</dd></div>
        <div><dt>ASSETS</dt><dd>{data.assetAuthority.mutation}</dd></div>
      </dl>
      <ul className="s00-dad__blocks">
        {data.blocks.map((block) => (
          <li key={block.label}>
            <span className="s00-dad__block-label">
              {block.label} · {block.estimatedTokens.toLocaleString()} tok · {block.cacheable ? 'cacheable' : 'volatile'}
            </span>
            <pre>{block.preview}</pre>
          </li>
        ))}
      </ul>
      {data.inheritance ? (
        <>
          <h4 className="s00-dad__h">INHERITS FROM {data.inheritance.parentPageId ?? '—'}</h4>
          <ul className="s00-dad__files">
            {data.inheritance.mustInherit.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

export default DesignAgentDock;
