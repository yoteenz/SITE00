/**
 * P0.VR.OPUS-NATIVE2 + P0.VR.DESIGN.OPUS-AI-CONSOLES1 — the Opus design agent console.
 *
 * Presentation decision, and the reason for it:
 *
 * Opus is the interface/page-framework design agent, so its console is a design
 * workbench: what it is looking at comes first as a real page preview, what it
 * may change is a visible scope, and the request is a composed brief rather
 * than a bare prompt. It is deliberately not a chat window — the agent's inputs
 * are structured (intent, mode, scope, spend) and a free-text box would hide
 * all four behind a sentence the model then has to guess the meaning of.
 *
 * The flow is fixed and always in this order: context is shown, INTENT and MODE
 * are chosen, an ESTIMATE is required before the run, authorization is
 * requested if the intent outruns the page's standing authority, and the run
 * ends at a review the founder has to answer — in this console, not on a
 * separate diagnostic page.
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
  composeOpusRequest,
  opusConsoleStatus,
  opusContextAssistText,
  opusEditScopeRows,
  OPUS_CONSOLE_TABS,
  OPUS_INTENT_ORDER,
  OPUS_INTENT_PRESENTATION,
  OPUS_MODE_PRESENTATION,
  type OpusConsoleTabId,
  type OpusReferenceInput,
} from '../../../../../shared/site00-design-workspace-production/designAiConsolePresentation.js';
import { loadPageCaptureHistory } from '../../../../../shared/site00-design-workspace-production/designPageCapture.js';
import { loadPageAuthorityWorkflow } from '../../../../../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import { listPageConceptCandidates } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';
import { compileDesignPageContext } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/pageContext.js';
import { resolveDesignPageTargetForShell } from '../production/designProductionPageTarget';
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
import {
  AiConsoleButton,
  AiConsoleEmptyState,
  AiConsoleMeta,
  AiConsolePreview,
  AiConsoleSection,
  AiConsoleSectionAction,
  AiConsoleSurface,
  AiConsoleTab,
} from '../aiConsoles/AiConsoleShell';
import { AiConsoleIcon } from '../aiConsoles/AiConsoleIcon';
import { useDesignAgentDock } from './DesignAgentDockContext';
import { useDesignAgentTarget } from './useDesignAgentTarget';
import '../../../styles/site00-design-agent.css';

const DRAFT_KEY = 'site00:opus-console-draft:v1:';

function usd(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `$${value.toFixed(3)}`;
}

function readDraft(pageKey: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.sessionStorage.getItem(DRAFT_KEY + pageKey) ?? '';
  } catch {
    return '';
  }
}

export function DesignAgentDock() {
  const targeting = useDesignAgentTarget();
  const { open, setOpen } = useDesignAgentDock();
  const [tab, setTab] = useState<OpusConsoleTabId>('DESIGN');
  const [showScope, setShowScope] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [service, setService] = useState<OpusNativeServiceInfo | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const [intent, setIntent] = useState<DesignAgentIntent>('REFINE_CURRENT');
  const [mode, setMode] = useState<OpusNativeMode>('DESIGN');
  const [task, setTask] = useState('');
  const [selectedReferenceIds, setSelectedReferenceIds] = useState<string[]>([]);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  const [estimate, setEstimate] = useState<OpusNativeEstimateResponse | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [authorization, setAuthorization] = useState<WriteAuthorizationRequest | null>(null);
  const [grant, setGrant] = useState<FounderWriteGrant | null>(null);

  const [run, setRun] = useState<OpusNativeRun | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changeNote, setChangeNote] = useState('');

  const pollRef = useRef<number | null>(null);
  const pageKey = `${targeting.projectSlug}:${targeting.pageId ?? 'workspace'}`;

  useEffect(() => {
    fetchServiceInfo()
      .then(setService)
      .catch((cause: Error) => setServiceError(cause.message));
  }, []);

  // A change of page invalidates an estimate and a grant: both were scoped to
  // the surface that is no longer on screen. The draft is page-scoped too.
  useEffect(() => {
    setEstimate(null);
    setAuthorization(null);
    setGrant(null);
    setTask(readDraft(pageKey));
    setSelectedReferenceIds([]);
  }, [pageKey]);

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

  useEffect(() => {
    if (run?.status === 'WAITING_FOR_FOUNDER_REVIEW') setTab('REVIEW');
  }, [run?.status]);

  const spec = DESIGN_AGENT_INTENT_SPECS[intent];
  const diagnostics = service?.diagnostics ?? null;
  const shellTarget = useMemo(
    () => resolveDesignPageTargetForShell(targeting.projectSlug),
    [targeting.projectSlug],
  );
  const pageId = targeting.pageId ?? shellTarget.pageId;
  const pageLabel = targeting.pageLabel ?? shellTarget.pageLabel;
  const viewport = targeting.target.viewport ?? 'MOBILE';
  const viewMode = String(targeting.target.viewMode ?? 'canonical');

  const pageContext = useMemo(
    () => compileDesignPageContext(targeting.projectSlug, pageId),
    [pageId, targeting.projectSlug],
  );

  /** What Opus is looking at — the real page artefacts, in fallback order. */
  const references = useMemo<OpusReferenceInput[]>(() => {
    if (!open) return [];
    const capture = loadPageCaptureHistory(targeting.projectSlug, pageId, viewport);
    const concepts = listPageConceptCandidates(targeting.projectSlug, pageId);
    const concept = concepts.find((entry) => entry.status === 'SELECTED' || entry.status === 'PROMOTED') ?? concepts[0] ?? null;
    const workflow = loadPageAuthorityWorkflow(targeting.projectSlug, pageId);
    const authority = viewport === 'DESKTOP' ? workflow.desktopAuthority : workflow.mobileAuthority;
    const authorityVersion = authority.versions.find((version) => version.versionId === authority.activeVersionId);

    const rows: OpusReferenceInput[] = [];
    if (capture.latest?.artifactPath) {
      rows.push({
        id: 'current-capture',
        label: 'CURRENT CAPTURE',
        src: capture.latest.artifactPath,
        origin: `capture ${capture.latest.timestamp.slice(0, 10)}`,
      });
    }
    if (concept?.visualReference) {
      rows.push({
        id: 'page-concept',
        label: 'PAGE CONCEPT',
        src: concept.visualReference,
        origin: concept.conceptTitle,
      });
    }
    if (authorityVersion?.imageUrl) {
      rows.push({
        id: 'authority-reference',
        label: `${viewport} AUTHORITY`,
        src: authorityVersion.imageUrl,
        origin: authorityVersion.label,
      });
    }
    return rows;
  }, [open, pageId, targeting.projectSlug, viewport]);

  const selectedReferences = references.filter((reference) => selectedReferenceIds.includes(reference.id));
  const heroReference = references[0] ?? null;

  const composedTask = composeOpusRequest(task, selectedReferences);

  const onEstimate = useCallback(async () => {
    setEstimating(true);
    setError(null);
    setAuthorization(null);
    try {
      const response = await estimateRun({
        mode,
        task: composedTask || spec.description,
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
  }, [mode, composedTask, spec.description, targeting.target, intent, grant]);

  const onDispatch = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await startRunAuthorised({
        mode,
        task: composedTask,
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
  }, [mode, composedTask, targeting.target, intent, grant]);

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

  const saveDraft = useCallback(() => {
    try {
      window.sessionStorage.setItem(DRAFT_KEY + pageKey, task);
      setDraftSavedAt(new Date().toISOString());
    } catch {
      setError('Draft could not be saved in this browser.');
    }
  }, [pageKey, task]);

  // Dispatch is gated on a current estimate, so the price is always something
  // the founder saw rather than something they accepted.
  const dispatchDisabled =
    !estimate ||
    busy ||
    Boolean(authorization) ||
    task.trim().length === 0 ||
    !estimate.modeFitsBudget;

  const dispatchReason =
    task.trim().length === 0 ? 'Describe the change first.'
    : !estimate ? 'Estimate the run first — Opus never spends before you see the price.'
    : authorization ? 'Write access must be granted or denied first.'
    : !estimate.modeFitsBudget ? estimate.modeFitDetail
    : busy ? 'Run in progress.'
    : null;

  const status = opusConsoleStatus({
    runStatus: run?.status ?? null,
    lastTool: run?.toolCalls.at(-1)?.tool ?? null,
    estimating,
    failed: Boolean(run?.failure) || Boolean(error),
  });
  const review = run?.review ?? null;
  const cost = run?.receipt?.actualUsd ?? run?.guard.spentUsd ?? null;
  const permittedMode = estimate?.permittedMode ?? targeting.standingWriteMode ?? 'READ_ONLY';
  const scopeRows = opusEditScopeRows(permittedMode);
  const intentPresentation = OPUS_INTENT_PRESENTATION[intent];
  const modePresentation = OPUS_MODE_PRESENTATION[mode];

  const shotUrl = useMemo(
    () => (id: string) =>
      `${OPUS_NATIVE_API_PATH}?action=screenshot&runId=${encodeURIComponent(run?.runId ?? '')}&id=${encodeURIComponent(id)}`,
    [run?.runId],
  );

  if (!open) return <div data-testid="design-agent-dock" hidden />;

  const runProgressLabel =
    run && !TERMINAL_STATUSES.has(run.status) ?
      `${status.label} · ${run.guard.iterations} ITER · ${usd(cost)}`
    : null;

  return (
    <AiConsoleSurface
      console="opus"
      testId="design-agent-dock"
      panelId="s00-dad-panel"
      name="OPUS DESIGN AGENT"
      model={(service?.model ?? 'claude-opus-5').toUpperCase()}
      status={status.label}
      statusTone={status.tone}
      title="OPUS DESIGN AGENT"
      purpose={`AI-powered design editing for ${targeting.projectSlug.toUpperCase()}`}
      ariaLabel="Opus design agent console"
      onClose={() => setOpen(false)}
      closeClassName="s00-aic__close s00-dad__close"
      tabs={
        <>
          {OPUS_CONSOLE_TABS.map((entry) => (
            <AiConsoleTab
              key={entry.id}
              label={entry.label}
              active={tab === entry.id}
              disabled={entry.id === 'REVIEW' && !review}
              disabledReason="No proposal yet — run Opus to produce one."
              onClick={() => setTab(entry.id)}
            />
          ))}
          <span className="s00-aic__tabsTrail">
            <span className="s00-aic__modelChip" title="The only model this runtime dispatches to.">
              {(service?.model ?? 'CLAUDE-OPUS-5').toUpperCase()}
            </span>
          </span>
        </>
      }
      footer={
        <>
          <AiConsoleButton label="CANCEL" onClick={() => setOpen(false)} />
          <AiConsoleButton
            label={draftSavedAt ? 'DRAFT SAVED' : 'SAVE DRAFT'}
            onClick={saveDraft}
            disabled={task.trim().length === 0}
            disabledReason="Nothing to save yet."
          />
          <AiConsoleButton
            label={runProgressLabel ?? 'RUN OPUS AGENT →'}
            primary
            onClick={() => void onDispatch()}
            disabled={dispatchDisabled}
            disabledReason={dispatchReason}
            interactionId="opus-run-agent"
          />
        </>
      }
    >
      {targeting.registryError ? (
        <p className="s00-aic__notice s00-aic__notice--error">
          AGENT UNAVAILABLE — the surface registry could not be read ({targeting.registryError}). In local
          development the Vite server must proxy /api to the runtime: run <code>npm run dev:proxy</code> or set
          VITE_DEV_PROXY_TARGET.
        </p>
      ) : null}
      {/* One unreachable runtime, one notice: the registry failure already names
          the cause and the remedy, so the service probe's copy of it is noise. */}
      {serviceError && !targeting.registryError ? (
        <p className="s00-aic__notice s00-aic__notice--error">Runtime unreachable: {serviceError}</p>
      ) : null}

      {tab === 'DESIGN' ? (
        <>
          <AiConsoleSection
            label="CURRENT CONTEXT"
            action={
              <AiConsoleSectionAction
                label="VIEW IN WORKSPACE ↗"
                onClick={() => setOpen(false)}
                interactionId="opus-view-in-workspace"
              />
            }
          >
            <div className="s00-aic__split s00-aic__split--wide">
              <AiConsolePreview
                src={heroReference?.src ?? null}
                alt={heroReference?.label ?? 'Active design target'}
                emptyLabel="NO PAGE PREVIEW YET"
                emptyNote="Capture the current screen or select a page concept to give Opus a visual target."
                emptyIcon="empty-context"
                interactionId="opus-context-preview"
              />
              <div>
                <p className="s00-aic__metaTitle">{pageLabel.toUpperCase()}</p>
                <p className="s00-aic__metaSub">
                  {(pageContext?.creativeContext ?? pageContext?.pageRole ?? 'PAGE TARGET').toUpperCase()}
                </p>
                <AiConsoleMeta
                  rows={[
                    { label: 'PROJECT', value: targeting.projectSlug.toUpperCase() },
                    { label: 'VIEW', value: viewMode.toUpperCase() },
                    { label: 'VIEWPORT', value: viewport },
                    { label: 'WRITE SCOPE', value: permittedMode.replace(/_/g, ' ') },
                    { label: 'AUTHORITY', value: (pageContext?.currentAuthority ?? 'UNRESOLVED').toUpperCase() },
                    { label: 'REFERENCE', value: heroReference?.label ?? 'NONE' },
                  ]}
                />
              </div>
            </div>
            {targeting.registered === false && !targeting.registryError ? (
              <p className="s00-aic__notice">
                Route not registered — Opus runs with the compiled DESIGN shell context only.
              </p>
            ) : null}
          </AiConsoleSection>

          <AiConsoleSection
            label="WHAT AM I EDITING?"
            action={
              <AiConsoleSectionAction
                label={showScope ? 'HIDE SCOPE' : 'EDIT SCOPE'}
                onClick={() => setShowScope((value) => !value)}
                interactionId="opus-edit-scope"
              />
            }
          >
            <p className="s00-aic__metaSub">
              {targeting.projectSlug.toUpperCase()} · {pageLabel.toUpperCase()} ·{' '}
              {viewMode.toUpperCase()} · {viewport}
            </p>
            {showScope ? (
              <div className="s00-aic__chipGrid">
                {scopeRows.map((row) => (
                  <span
                    key={row.id}
                    className={`s00-aic__chip${row.allowed ? ' is-on' : ''}`}
                    title={`${row.detail} ${row.allowed ? 'Permitted at ' : 'Locked at '}${permittedMode.replace(/_/g, ' ')}.`}
                  >
                    {row.allowed ? '✓ ' : '· '}
                    {row.label}
                  </span>
                ))}
              </div>
            ) : null}
          </AiConsoleSection>

          <AiConsoleSection label="INTENT">
            <div className="s00-aic__chipGrid" role="radiogroup" aria-label="Agent intent">
              {OPUS_INTENT_ORDER.filter((value) => DESIGN_AGENT_INTENTS.includes(value)).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={intent === value}
                  className={`s00-aic__chip${intent === value ? ' is-on' : ''}`}
                  title={DESIGN_AGENT_INTENT_SPECS[value].description}
                  onClick={() => {
                    setIntent(value);
                    setEstimate(null);
                  }}
                >
                  {OPUS_INTENT_PRESENTATION[value]?.label ?? value.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </AiConsoleSection>

          <AiConsoleSection label="MODE">
            <div className="s00-aic__chips" role="radiogroup" aria-label="Execution mode">
              {OPUS_NATIVE_MODES.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={mode === value}
                  className={`s00-aic__chip${mode === value ? ' is-on' : ''}`}
                  title={OPUS_MODE_PRESENTATION[value]?.note}
                  onClick={() => {
                    setMode(value);
                    setEstimate(null);
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </AiConsoleSection>

          <AiConsoleSection label="CHANGE REQUEST">
            <div className="s00-aic__composer">
              <textarea
                className="s00-aic__composerInput"
                value={task}
                placeholder="Describe the change you want to make… Be specific about the page, view, viewport or component."
                onChange={(event) => {
                  setTask(event.target.value);
                  setEstimate(null);
                  setDraftSavedAt(null);
                }}
                rows={4}
                aria-label="Change request"
              />
              <div className="s00-aic__composerTools">
                <button
                  type="button"
                  className="s00-aic__tool"
                  onClick={() => setShowReferences((value) => !value)}
                  disabled={references.length === 0}
                  title={
                    references.length === 0 ?
                      'No page references yet — capture the screen or select a concept.'
                    : 'Attach a workspace reference to this request.'
                  }
                >
                  <span className="s00-aic__toolGlyph" aria-hidden="true">
                    <AiConsoleIcon name="opus-attach-reference" size={12} />
                  </span>
                  ADD REFERENCE
                </button>
                <button
                  type="button"
                  className="s00-aic__tool"
                  onClick={() => setTask((value) => `${value}${value.endsWith(' ') || value === '' ? '' : ' '}@${pageId} `)}
                  title="Insert the active page id into the request."
                >
                  <span className="s00-aic__toolGlyph" aria-hidden="true">
                    <AiConsoleIcon name="action-mention" size={12} />
                  </span>
                  MENTION
                </button>
                <button
                  type="button"
                  className="s00-aic__tool s00-aic__tool--trail"
                  onClick={() =>
                    setTask((value) =>
                      `${value.trim()}${value.trim() ? ' ' : ''}${opusContextAssistText({
                        projectSlug: targeting.projectSlug,
                        pageLabel: pageLabel.toUpperCase(),
                        viewport,
                        viewMode,
                        route: targeting.route,
                      })}`.trim(),
                    )
                  }
                  title="Append the compiled page context to your request. Deterministic — no model spend."
                >
                  <span className="s00-aic__toolGlyph" aria-hidden="true">
                    <AiConsoleIcon name="action-context-assist" size={12} />
                  </span>
                  CONTEXT ASSIST
                </button>
              </div>
            </div>
            {showReferences ? (
              <div className="s00-aic__thumbs" style={{ marginTop: 8 }}>
                {references.map((reference) => {
                  const on = selectedReferenceIds.includes(reference.id);
                  return (
                    <span key={reference.id}>
                      <button
                        type="button"
                        className={`s00-aic__thumb${on ? ' is-on' : ''}`}
                        aria-pressed={on}
                        title={`${reference.label} · ${reference.origin}`}
                        onClick={() => {
                          setSelectedReferenceIds((current) =>
                            current.includes(reference.id) ?
                              current.filter((id) => id !== reference.id)
                            : [...current, reference.id],
                          );
                          setEstimate(null);
                        }}
                      >
                        {reference.src ? <img src={reference.src} alt="" /> : null}
                      </button>
                      <span className="s00-aic__thumbCap">{reference.label}</span>
                    </span>
                  );
                })}
              </div>
            ) : null}
          </AiConsoleSection>

          <AiConsoleSection
            label="COST · SCOPE · IMPACT"
            action={
              <AiConsoleSectionAction
                label={estimating ? 'ESTIMATING…' : 'ESTIMATE'}
                onClick={() => void onEstimate()}
                disabled={estimating || busy}
                interactionId="opus-estimate"
              />
            }
          >
            <div className="s00-aic__cells">
              <div className="s00-aic__cell">
                <span className="s00-aic__cellLabel">
                  <span className="s00-aic__cellIcon" aria-hidden="true">
                    <AiConsoleIcon name="opus-cost" size={12} />
                  </span>
                  ESTIMATED COST
                </span>
                <span className="s00-aic__cellValue">
                  {estimate ? usd(estimate.estimatedUsd) : '—'}
                </span>
                <span className="s00-aic__cellNote">
                  {estimate ? `${modePresentation?.time ?? ''} · IF CACHED ${usd(estimate.estimatedUsdCached)}` : 'ESTIMATE TO PRICE THIS RUN'}
                </span>
              </div>
              <div className="s00-aic__cell">
                <span className="s00-aic__cellLabel">
                  <span className="s00-aic__cellIcon" aria-hidden="true">
                    <AiConsoleIcon name="opus-scope" size={12} />
                  </span>
                  SCOPE
                </span>
                <span className="s00-aic__cellValue">{permittedMode.replace(/_/g, ' ')}</span>
                <span className="s00-aic__cellNote">{scopeRows.filter((row) => row.allowed).length} OF 5 CAPABILITIES</span>
              </div>
              <div className="s00-aic__cell">
                <span className="s00-aic__cellLabel">
                  <span className="s00-aic__cellIcon" aria-hidden="true">
                    <AiConsoleIcon name="opus-impact" size={12} />
                  </span>
                  IMPACT
                </span>
                <span className="s00-aic__cellValue s00-aic__cellValue--lime">{intentPresentation?.impact ?? 'LOW'}</span>
                <span className="s00-aic__cellNote">{intentPresentation?.impactNote ?? ''}</span>
              </div>
            </div>
            {estimate && !estimate.modeFitsBudget ? (
              <p className="s00-aic__notice s00-aic__notice--error">
                {estimate.modeFitDetail}{' '}
                {estimate.recommendedMode !== mode ? (
                  <button
                    type="button"
                    className="s00-aic__inlineLink"
                    onClick={() => {
                      setMode(estimate.recommendedMode);
                      setEstimate(null);
                    }}
                  >
                    SWITCH TO {estimate.recommendedMode}
                  </button>
                ) : null}
              </p>
            ) : null}
          </AiConsoleSection>

          {authorization ? (
            <AiConsoleSection label="WRITE ACCESS REQUIRED">
              <AiConsoleMeta
                rows={[
                  { label: 'PAGE', value: authorization.pageId },
                  { label: 'NEEDS', value: authorization.requestedMode },
                  { label: 'HAS', value: authorization.permittedMode },
                ]}
              />
              <p className="s00-aic__notice">{authorization.reason}</p>
              <p className="s00-aic__notice">{describeWriteMode(authorization.requestedMode)}</p>
              {authorization.additionalFiles.length > 0 ? (
                <ul className="s00-aic__files">
                  {authorization.additionalFiles.map((file) => (
                    <li key={file}>{file}</li>
                  ))}
                </ul>
              ) : null}
              {authorization.grantable ? (
                <div className="s00-aic__chips" style={{ marginTop: 8 }}>
                  <AiConsoleButton
                    label="GRANT FOR THIS RUN"
                    primary
                    onClick={() => {
                      setGrant({ mode: authorization.requestedMode });
                      setAuthorization(null);
                      setEstimate(null);
                    }}
                  />
                  <AiConsoleButton label="DENY" onClick={() => setAuthorization(null)} />
                </div>
              ) : (
                <p className="s00-aic__notice">
                  Not grantable here: this surface allows at most {authorization.maxGrantableMode}.
                </p>
              )}
            </AiConsoleSection>
          ) : null}

          {grant ? (
            <p className="s00-aic__notice s00-aic__notice--grant">
              GRANTED {grant.mode} · this run only ·{' '}
              <button type="button" className="s00-aic__inlineLink" onClick={() => setGrant(null)}>
                revoke
              </button>
            </p>
          ) : null}

          {error ? <p className="s00-aic__notice s00-aic__notice--error">{error}</p> : null}

          {run && !TERMINAL_STATUSES.has(run.status) ? (
            <AiConsoleSection label="RUN IN PROGRESS">
              <AiConsoleMeta
                rows={[
                  { label: 'PHASE', value: status.label },
                  { label: 'ITERATIONS', value: String(run.guard.iterations) },
                  { label: 'TOOL CALLS', value: String(run.toolCalls.length) },
                  { label: 'SPENT', value: usd(cost) },
                ]}
              />
              <div className="s00-aic__chips" style={{ marginTop: 8 }}>
                <AiConsoleButton label="STOP RUN" onClick={() => void onReview('cancel')} />
              </div>
            </AiConsoleSection>
          ) : null}
        </>
      ) : null}

      {tab === 'REVIEW' ? (
        review ? (
          <>
            <AiConsoleSection label="PROPOSED CHANGE">
              <p className="s00-aic__msgText">{review.summary}</p>
              {review.previewBlocked ? (
                <p className="s00-aic__notice s00-aic__notice--error">
                  The run could not render this page, so nothing here is visually certified.
                </p>
              ) : null}
            </AiConsoleSection>

            <AiConsoleSection label="BEFORE / AFTER">
              <div className="s00-aic__split s00-aic__split--wide">
                <AiConsolePreview
                  src={review.before ? shotUrl(review.before.screenshotId) : null}
                  alt="Before"
                  emptyLabel="NO BEFORE CAPTURE"
                  contain
                />
                <AiConsolePreview
                  src={review.after ? shotUrl(review.after.screenshotId) : null}
                  alt="After"
                  emptyLabel="NO AFTER CAPTURE"
                  contain
                />
              </div>
              {typeof review.after?.diffPercent === 'number' ? (
                <p className="s00-aic__metaSub">CHANGED PIXELS: {review.after.diffPercent}%</p>
              ) : null}
            </AiConsoleSection>

            <AiConsoleSection label="FILES AFFECTED">
              {review.patch ? (
                <>
                  <p className="s00-aic__msgText">{review.patch.reason}</p>
                  <ul className="s00-aic__files">
                    {review.patch.filesChanged.map((file) => (
                      <li key={file}>
                        {review.createdFiles.includes(file) ? 'NEW · ' : 'EDIT · '}
                        {file}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <AiConsoleEmptyState
                  title="NO PATCH PRODUCED"
                  note="This run produced findings only."
                  icon="empty-staged"
                />
              )}
              <AiConsoleMeta
                rows={[
                  { label: 'TYPECHECK', value: review.typecheck ? (review.typecheck.ok ? 'PASS' : 'FAIL') : 'NOT RUN' },
                  { label: 'TESTS', value: review.tests ? (review.tests.ok ? 'PASS' : 'FAIL') : 'NOT RUN' },
                  { label: 'COST', value: usd(review.receipt.actualUsd) },
                ]}
              />
            </AiConsoleSection>

            <AiConsoleSection label="REQUEST CHANGES">
              <div className="s00-aic__composer">
                <textarea
                  className="s00-aic__composerInput"
                  rows={2}
                  placeholder="Request changes — continues this thread and keeps the context."
                  value={changeNote}
                  onChange={(event) => setChangeNote(event.target.value)}
                  aria-label="Request changes"
                />
                <div className="s00-aic__composerTools">
                  <button
                    type="button"
                    className="s00-aic__tool"
                    onClick={() => void onRequestChanges()}
                    disabled={busy || !changeNote.trim()}
                    title={!changeNote.trim() ? 'Describe the change first.' : undefined}
                  >
                    SEND FOLLOW-UP
                  </button>
                </div>
              </div>
              <div className="s00-aic__chips" style={{ marginTop: 8 }}>
                <AiConsoleButton
                  label="APPROVE"
                  primary
                  onClick={() => void onReview('approve')}
                  disabled={busy}
                />
                <AiConsoleButton label="REVERT" onClick={() => void onReview('revert')} disabled={busy} />
              </div>
              <p className="s00-aic__notice">
                APPROVE marks the patch accepted and leaves it in the working tree. It does not commit or deploy.
              </p>
            </AiConsoleSection>
          </>
        ) : (
          <AiConsoleSection label="REVIEW">
            <AiConsoleEmptyState
              title="NO PROPOSAL YET"
              note="Run Opus from the DESIGN tab. The proposal, before/after and files land here — you are never routed to a separate debug page."
              icon="empty-staged"
            />
          </AiConsoleSection>
        )
      ) : null}

      {tab === 'CONTEXT' ? (
        <>
          <AiConsoleSection label="EDIT SCOPE">
            <div className="s00-aic__chipGrid">
              {scopeRows.map((row) => (
                <span key={row.id} className={`s00-aic__chip${row.allowed ? ' is-on' : ''}`} title={row.detail}>
                  {row.allowed ? '✓ ' : '· '}
                  {row.label}
                </span>
              ))}
            </div>
            <p className="s00-aic__notice">{describeWriteMode(permittedMode as never)}</p>
            {targeting.firewallReason ? (
              <p className="s00-aic__notice">PROTECTED · {targeting.firewallReason}</p>
            ) : null}
          </AiConsoleSection>

          <AiConsoleSection label="SURFACE">
            <AiConsoleMeta
              rows={[
                { label: 'ROUTE', value: targeting.route },
                { label: 'PAGE ID', value: targeting.pageId ?? '—' },
                { label: 'GOLDEN', value: targeting.goldenVersion ?? '—' },
                { label: 'PREVIEW', value: diagnostics?.preview ?? '—' },
                { label: 'API', value: diagnostics?.anthropicApi ?? '—' },
              ]}
            />
          </AiConsoleSection>

          <AiConsoleSection
            label="DIAGNOSTICS"
            action={
              <AiConsoleSectionAction
                label={showAdvanced ? 'HIDE COMPILED CONTEXT' : 'SHOW COMPILED CONTEXT'}
                onClick={() => setShowAdvanced((value) => !value)}
              />
            }
          >
            {showAdvanced ?
              <AgentContextView route={targeting.route} pageId={targeting.pageId} mode={mode} intent={intent} />
            : <p className="s00-aic__notice">
                The compiled blocks Opus receives, their sizes and cache posture. Recessed on purpose.
              </p>
            }
            <p className="s00-aic__metaSub" style={{ marginTop: 8 }}>
              <a className="s00-aic__inlineLink" href={`/projects/${targeting.projectSlug}/design/opus-native`}>
                DIAGNOSTIC ROUTE ↗
              </a>
            </p>
          </AiConsoleSection>
        </>
      ) : null}
    </AiConsoleSurface>
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

  if (failed) return <p className="s00-aic__notice s00-aic__notice--error">{failed}</p>;
  if (!data) return <p className="s00-aic__notice">Compiling…</p>;

  return (
    <div>
      <AiConsoleMeta
        rows={[
          { label: 'TOTAL', value: `${data.totalEstimatedTokens.toLocaleString()} TOK` },
          { label: 'CACHEABLE', value: `${data.cacheableEstimatedTokens.toLocaleString()} TOK` },
          { label: 'WRITE', value: data.policy.mode },
          { label: 'ASSETS', value: data.assetAuthority.mutation },
        ]}
      />
      <ul className="s00-aic__files">
        {data.blocks.map((block) => (
          <li key={block.label}>
            {block.label} · {block.estimatedTokens.toLocaleString()} tok · {block.cacheable ? 'cacheable' : 'volatile'}
            <pre className="s00-aic__pre">{block.preview}</pre>
          </li>
        ))}
      </ul>
      {data.inheritance ? (
        <>
          <p className="s00-aic__metaSub">INHERITS FROM {data.inheritance.parentPageId ?? '—'}</p>
          <ul className="s00-aic__files">
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
