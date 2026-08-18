import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AsstsBottomDock } from '../components/AsstsMobileNav';
import { AsstsDevPanel, useAsstsAutoRefresh } from '../components/AsstsDevPanel';
import { AsstsPageShell } from '../components/AsstsPageShell';
import { AsstsStatusBadge } from '../components/AsstsMobileNav';
import {
  approveLoaderDerivative,
  fetchLoaderPipeline,
  lockLoaderDerivative,
  pollLoaderPostProcess,
  rejectLoaderDerivative,
  reprocessLoaderGeometry,
  type LoaderPipelineContext,
} from '../services/asstsApi';

const BRIA_MODEL = 'bria/video/background-removal/v3';
const BEN_MODEL = 'fal-ai/ben/v2/video';

function MediaComparePanel({
  label,
  url,
  variant,
}: {
  label: string;
  url: string | null;
  variant: 'master' | 'derivative';
}) {
  return (
    <div className={`assts-loader-pipeline__compare-col assts-loader-pipeline__compare-col--${variant}`}>
      <div className="assts-loader-pipeline__compare-label">{label}</div>
      <div
        className="assts-loader-pipeline__compare-stage"
        style={{
          backgroundImage:
            variant === 'derivative'
              ? 'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)'
              : undefined,
          backgroundSize: variant === 'derivative' ? '16px 16px' : undefined,
          backgroundPosition: variant === 'derivative' ? '0 0, 0 8px, 8px -8px, -8px 0' : undefined,
          backgroundColor: variant === 'master' ? '#000' : '#111',
        }}
      >
        {url ? (
          <video
            className="assts-loader-pipeline__compare-video"
            src={url}
            muted
            playsInline
            autoPlay
            loop
            preload="auto"
          />
        ) : (
          <div className="assts-loader-pipeline__compare-empty">No derivative yet</div>
        )}
      </div>
    </div>
  );
}

export default function LoaderPipelinePage() {
  const [context, setContext] = useState<LoaderPipelineContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [selectedModel, setSelectedModel] = useState(BRIA_MODEL);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchLoaderPipeline();
      setContext(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load loader pipeline');
    } finally {
      setLoading(false);
    }
  }, []);

  const processing = context?.latestJob?.status === 'PROCESSING';
  useAsstsAutoRefresh(load, { hasGenerating: processing });

  const currentDerivative = context?.derivativeVersions?.[0] ?? null;
  const canReview = currentDerivative?.status === 'NEEDS_REVIEW';
  const canLock =
    currentDerivative?.status === 'APPROVED' || currentDerivative?.status === 'LOCKED';
  const canReprocess =
    !processing &&
    (!context?.latestJob ||
      ['FAILED', 'REJECTED', 'NEEDS_REVIEW', 'APPROVED'].includes(String(context.latestJob.status)));

  const meta = useMemo(() => context?.sourceMetadata, [context]);

  const runAction = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!processing || !context?.latestJob?.id) return;
    const id = window.setInterval(() => {
      void pollLoaderPostProcess(context.latestJob!.id as string)
        .then(() => load())
        .catch(() => undefined);
    }, 4000);
    return () => window.clearInterval(id);
  }, [processing, context?.latestJob?.id, load]);

  return (
    <AsstsPageShell variant="inspection">
      <div className="assts-loader-pipeline">
        <header className="assts-loader-pipeline__header">
          <div>
            <p className="assts-loader-pipeline__eyebrow">POST-PROCESSING · SITE 00 LOADER</p>
            <h1 className="assts-loader-pipeline__title">Loader Geometry Derivative Pipeline</h1>
            <p className="assts-loader-pipeline__subtitle">
              Background removal on approved master — review preserves animation fidelity, not creative direction.
            </p>
          </div>
          <Link to="/assts" className="assts-loader-pipeline__back">
            ← Asset Vault
          </Link>
        </header>

        {error ? <div className="assts-loader-pipeline__error">{error}</div> : null}

        {loading && !context ? (
          <p className="assts-loader-pipeline__loading">LOADING PIPELINE…</p>
        ) : null}

        {context ? (
          <>
            <section className="assts-loader-pipeline__meta-grid">
              <div className="assts-glass-panel">
                <h2>Source master</h2>
                <p>
                  <strong>{String(context.masterAsset?.asset_key ?? 's00_loader_geometry_master')}</strong>
                </p>
                <p>Role: LOADER_GEOMETRY_MASTER · Status: APPROVED MASTER</p>
                {meta ? (
                  <ul className="assts-loader-pipeline__meta-list">
                    <li>
                      {meta.container}/{meta.videoCodec} · {meta.width}×{meta.height} @ {meta.frameRate}fps
                    </li>
                    <li>Duration: {meta.durationSeconds.toFixed(2)}s · Size: {(meta.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</li>
                    <li>Audio: {meta.audioCodec ?? 'none'} · Alpha: {meta.hasAlpha ? 'yes' : 'no'}</li>
                  </ul>
                ) : null}
              </div>

              <div className="assts-glass-panel">
                <h2>Post-process job</h2>
                {context.latestJob ? (
                  <>
                    <p>
                      <AsstsStatusBadge status={String(context.latestJob.status)} />
                    </p>
                    <ul className="assts-loader-pipeline__meta-list">
                      <li>Processor: FAL · {String(context.latestJob.processor_model)}</li>
                      <li>Type: BACKGROUND REMOVAL</li>
                      <li>Job: {String(context.latestJob.job_key)}</li>
                      {context.latestJob.cost_usd != null ? (
                        <li>Est. cost: ${Number(context.latestJob.cost_usd).toFixed(4)}</li>
                      ) : null}
                      {context.latestJob.error ? (
                        <li className="assts-loader-pipeline__fail">POST-PROCESSING FAILED: {String(context.latestJob.error)}</li>
                      ) : null}
                    </ul>
                  </>
                ) : (
                  <p>No post-process job yet — start POST-ASSET-LOADER-001 below.</p>
                )}
              </div>

              <div className="assts-glass-panel">
                <h2>Production slot</h2>
                <p>
                  <code>{context.semanticSlots.production}</code>
                </p>
                <p>
                  Locked:{' '}
                  {context.productionResolved?.source === 'locked' ? (
                    <AsstsStatusBadge status="LOCKED" />
                  ) : (
                    <AsstsStatusBadge status="FALLBACK" variant="muted" />
                  )}
                </p>
              </div>
            </section>

            <section className="assts-loader-pipeline__compare">
              <h2>Source vs derivative</h2>
              <p className="assts-loader-pipeline__compare-hint">
                Did post-processing preserve the approved animation?
              </p>
              <div className="assts-loader-pipeline__compare-grid">
                <MediaComparePanel
                  label={context.comparison.masterLabel}
                  url={context.comparison.masterUrl}
                  variant="master"
                />
                <MediaComparePanel
                  label={context.comparison.derivativeLabel}
                  url={context.comparison.derivativeUrl}
                  variant="derivative"
                />
              </div>
            </section>

            <section className="assts-loader-pipeline__actions assts-glass-panel">
              <h2>Review actions</h2>
              <div className="assts-loader-pipeline__model-row">
                <label htmlFor="loader-model">Background-removal model</label>
                <select
                  id="loader-model"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={busy || processing}
                >
                  <option value={BRIA_MODEL}>Bria VRMBG 3.0 (primary)</option>
                  <option value={BEN_MODEL}>Ben v2 Video (fallback)</option>
                </select>
              </div>

              <div className="assts-loader-pipeline__button-row">
                {!processing && canReprocess ? (
                  <button
                    type="button"
                    className="assts-btn assts-btn--primary"
                    disabled={busy}
                    onClick={() =>
                      runAction(() =>
                        reprocessLoaderGeometry({
                          modelId: selectedModel,
                          jobKey: 'POST-ASSET-LOADER-001',
                        }),
                      )
                    }
                  >
                    {context.latestJob ? 'Reprocess' : 'Start post-process'}
                  </button>
                ) : null}

                {canReview && currentDerivative ? (
                  <>
                    <button
                      type="button"
                      className="assts-btn assts-btn--approve"
                      disabled={busy}
                      onClick={() => runAction(() => approveLoaderDerivative(currentDerivative.id))}
                    >
                      Approve derivative
                    </button>
                    <button
                      type="button"
                      className="assts-btn assts-btn--reject"
                      disabled={busy}
                      onClick={() =>
                        runAction(() => rejectLoaderDerivative(currentDerivative.id, rejectNote || undefined))
                      }
                    >
                      Reject
                    </button>
                  </>
                ) : null}

                {canLock && currentDerivative?.status === 'APPROVED' ? (
                  <button
                    type="button"
                    className="assts-btn assts-btn--lock"
                    disabled={busy}
                    onClick={() => runAction(() => lockLoaderDerivative(currentDerivative.id))}
                  >
                    Lock to production slot
                  </button>
                ) : null}
              </div>

              {canReview ? (
                <textarea
                  className="assts-loader-pipeline__reject-note"
                  placeholder="REJECTION NOTE (OPTIONAL) — USE REPROCESS WITH ALTERNATE MODEL AFTER REJECT"
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  rows={2}
                />
              ) : null}

              {processing ? (
                <p className="assts-loader-pipeline__processing">FAL post-processing in progress…</p>
              ) : null}
            </section>
          </>
        ) : null}
      </div>

      <AsstsBottomDock />
      <AsstsDevPanel onRefresh={load} />
    </AsstsPageShell>
  );
}
