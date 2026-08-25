import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { FounderWorkspaceShell } from '../components/founderWorkspace/FounderWorkspaceShell';
import { site00ProjectsApi, Site00ProjectsApiError } from '../services/site00ProjectsApi';
import {
  site00ProjectCharacterContinuityPath,
  site00ProjectFounderCharacterDiscoveryPath,
} from '../config/routes';
import type { NdxFounderCharacterDiscoveryRun } from '../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/types';
import {
  CASTING_PRIMARY_JUDGMENTS,
  DEFAULT_CASTING_CANDIDATE_COUNT,
  castingRoundNeedsFalRetry,
  isCastingPlaceholderPreviewUrl,
} from '../../../shared/site00-studio-world-production/characterVisualCasting/client.js';
import type {
  CharacterCastingCandidate,
} from '../../../shared/site00-studio-world-production/characterVisualCasting/client.js';
import '../styles/site00-character-casting.css';

const JUDGMENT_LABELS: Record<(typeof CASTING_PRIMARY_JUDGMENTS)[number], string> = {
  THATS_HER: "THAT'S HER",
  CLOSE: 'CLOSE',
  NOT_HER: 'NOT HER',
  MIX_THESE: 'MIX THESE',
  RIGHT_FACE_WRONG_ENERGY: 'RIGHT FACE / WRONG ENERGY',
  RIGHT_ENERGY_WRONG_STYLING: 'RIGHT ENERGY / WRONG STYLING',
};

export default function ProjectCharacterCastingPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<NdxFounderCharacterDiscoveryRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<Record<string, unknown> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [inspectOpen, setInspectOpen] = useState(false);
  const [mergeSelection, setMergeSelection] = useState<string[]>([]);

  const casting = run?.visualCastingState ?? null;

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.characterVisualCastingGet(projectSlug);
      setRun((result.run as NdxFounderCharacterDiscoveryRun) ?? null);
    } catch {
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const latestRoundCandidates = useMemo(() => {
    if (!casting) return [] as CharacterCastingCandidate[];
    const round = casting.rounds.at(-1);
    if (!round) return [];
    return casting.candidates.filter((c) => c.roundId === round.roundId);
  }, [casting]);

  const activeCandidate = latestRoundCandidates[activeIndex] ?? null;
  const latestRound = casting?.rounds.at(-1) ?? null;
  const hasRound = latestRoundCandidates.length > 0;
  const needsFalRetry = casting && latestRound ? castingRoundNeedsFalRetry(casting, latestRound.roundId) : false;
  const isGeneratingRound = Boolean(casting?.visualCastingReady && hasRound && !casting.castingCandidatesReady);

  const act = async (fn: () => Promise<{ run?: Record<string, unknown> }>) => {
    setBusy(true);
    setActionError(null);
    try {
      const result = await fn();
      if (result.run) setRun(result.run as NdxFounderCharacterDiscoveryRun);
      else await reload();
    } catch (err) {
      setActionError(err instanceof Site00ProjectsApiError ? err.message : 'Casting action failed');
    } finally {
      setBusy(false);
    }
  };

  const loadEstimate = () =>
    void act(async () => {
      const result = await site00ProjectsApi.characterVisualCastingEstimate(projectSlug);
      setEstimate(result.estimate);
      return result;
    });

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Visual casting is NDXBOOK-only for this proof.</p>
      </EcosystemShell>
    );
  }

  const operate = (
    <div className="site00-char-cast">
      {loading && <p>Loading casting state…</p>}
      {actionError && (
        <p className="site00-char-cast__error" role="alert">
          {actionError}
        </p>
      )}

      {!loading && casting && !casting.visualCastingReady && (
        <section className="site00-char-cast__panel">
          <h2>CASTING BLOCKED</h2>
          <ul>
            {casting.readiness.blockers.map((b) => (
              <li key={b}>{b.replace(/_/g, ' ')}</li>
            ))}
          </ul>
          <Link to={site00ProjectFounderCharacterDiscoveryPath(projectSlug)}>← Return to Character Lab</Link>
        </section>
      )}

      {!loading && casting?.visualCastingReady && !hasRound && (
        <section className="site00-char-cast__panel">
          <h2>CAST NDX</h2>
          <p>Based on who she is — here are visual interpretations of her. This is not final identity yet.</p>
          {run?.humanReadableSynthesis?.whoIThinkSheIs ? (
            <blockquote className="site00-char-cast__truth">{run.humanReadableSynthesis.whoIThinkSheIs}</blockquote>
          ) : null}
          <dl className="site00-char-cast__cost">
            <div>
              <dt>Candidates</dt>
              <dd>{DEFAULT_CASTING_CANDIDATE_COUNT}</dd>
            </div>
            <div>
              <dt>Provider</dt>
              <dd>{casting.readiness.provider ?? 'pending'}</dd>
            </div>
            <div>
              <dt>Model</dt>
              <dd>{casting.readiness.model ?? 'pending'}</dd>
            </div>
            <div>
              <dt>Estimated cost</dt>
              <dd>{casting.readiness.estimatedCostUsd != null ? `$${casting.readiness.estimatedCostUsd.toFixed(2)}` : '—'}</dd>
            </div>
          </dl>
          {!estimate && (
            <button type="button" className="site00-char-cast__cta" disabled={busy} onClick={loadEstimate}>
              REVIEW COST GATE
            </button>
          )}
          <button
            type="button"
            className="site00-char-cast__cta site00-char-cast__cta--primary"
            disabled={busy}
            onClick={() => void act(() => site00ProjectsApi.characterVisualCastingGenerate(projectSlug))}
          >
            GENERATE FIRST CASTING ROUND
          </button>
          <p className="site00-char-cast__hint">Still images only · founder-triggered · no auto-generation on load</p>
        </section>
      )}

      {!loading && isGeneratingRound && (
        <section className="site00-char-cast__panel">
          <h2>GENERATING CASTING STILLS</h2>
          <p>Calling FAL for six editorial stills — this can take a minute on mobile.</p>
          <div className="site00-char-cast__hero">
            <div className="site00-char-cast__frame">
              <div className="site00-char-cast__placeholder">Generating candidate {String(activeIndex + 1).padStart(2, '0')}…</div>
            </div>
          </div>
        </section>
      )}

      {!loading && casting?.castingCandidatesReady && hasRound && (
        <section className="site00-char-cast__panel">
          {needsFalRetry && (
            <>
              <p className="site00-char-cast__hint">
                This round was created before live generation was wired. Placeholder stills only — tap below to generate real images.
              </p>
              <button
                type="button"
                className="site00-char-cast__cta site00-char-cast__cta--primary"
                disabled={busy}
                onClick={() => void act(() => site00ProjectsApi.characterVisualCastingRetryFal(projectSlug, latestRound?.roundId))}
              >
                GENERATE STILLS WITH FAL
              </button>
            </>
          )}
          <header className="site00-char-cast__review-head">
            <h2>WHO FEELS CLOSEST?</h2>
            <span className="site00-char-cast__counter">
              {String(activeIndex + 1).padStart(2, '0')} / {String(latestRoundCandidates.length).padStart(2, '0')}
            </span>
          </header>

          <div className="site00-char-cast__hero">
            <div className="site00-char-cast__frame">
              {activeCandidate?.previewUrl && !isCastingPlaceholderPreviewUrl(activeCandidate.previewUrl) ? (
                <img
                  src={activeCandidate.previewUrl}
                  alt={`Casting candidate ${String(activeIndex + 1).padStart(2, '0')} — ${activeCandidate.variationAxis.replace(/_/g, ' ')}`}
                  className="site00-char-cast__image"
                />
              ) : activeCandidate?.previewUrl ? (
                <div className="site00-char-cast__placeholder" aria-label="Casting candidate preview">
                  CANDIDATE {String(activeIndex + 1).padStart(2, '0')} · {activeCandidate.variationAxis.replace(/_/g, ' ')}
                </div>
              ) : (
                <div className="site00-char-cast__placeholder">Generating candidate…</div>
              )}
            </div>
            <div className="site00-char-cast__nav">
              <button type="button" disabled={activeIndex <= 0} onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}>
                ← PREV
              </button>
              <button
                type="button"
                disabled={activeIndex >= latestRoundCandidates.length - 1}
                onClick={() => setActiveIndex((i) => Math.min(latestRoundCandidates.length - 1, i + 1))}
              >
                NEXT →
              </button>
            </div>
          </div>

          <div className="site00-char-cast__reactions">
            {CASTING_PRIMARY_JUDGMENTS.map((judgment) => (
              <button
                key={judgment}
                type="button"
                className="site00-char-cast__reaction"
                disabled={busy || !activeCandidate}
                onClick={() => {
                  if (judgment === 'MIX_THESE') {
                    setMergeSelection((prev) =>
                      activeCandidate && prev.includes(activeCandidate.candidateId)
                        ? prev.filter((id) => id !== activeCandidate.candidateId)
                        : activeCandidate
                          ? [...prev, activeCandidate.candidateId].slice(-3)
                          : prev,
                    );
                    return;
                  }
                  if (!activeCandidate) return;
                  void act(() =>
                    site00ProjectsApi.characterVisualCastingJudgment(projectSlug, activeCandidate.candidateId, judgment),
                  );
                }}
              >
                {JUDGMENT_LABELS[judgment]}
              </button>
            ))}
          </div>

          {mergeSelection.length >= 2 && (
            <button
              type="button"
              className="site00-char-cast__cta"
              disabled={busy}
              onClick={() =>
                void act(() =>
                  site00ProjectsApi.characterVisualCastingMerge(projectSlug, mergeSelection, {
                    [mergeSelection[0]!]: ['FACE'],
                    [mergeSelection[1]!]: ['PRESENCE', 'STYLING'],
                  }),
                )
              }
            >
              APPLY MIX THESE ({mergeSelection.length})
            </button>
          )}

          <button
            type="button"
            className="site00-char-cast__cta"
            disabled={busy}
            onClick={() => void act(() => site00ProjectsApi.characterVisualCastingNextRound(projectSlug))}
          >
            GENERATE NEXT ROUND FROM FEEDBACK
          </button>

          {casting.selectedCandidateId && (
            <button
              type="button"
              className="site00-char-cast__cta site00-char-cast__cta--primary"
              disabled={busy}
              onClick={() => void act(() => site00ProjectsApi.characterVisualCastingLock(projectSlug))}
            >
              LOCK HER
            </button>
          )}

          <button type="button" className="site00-char-cast__inspect" onClick={() => setInspectOpen((v) => !v)}>
            {inspectOpen ? 'HIDE INSPECT' : 'INSPECT →'}
          </button>
          {inspectOpen && activeCandidate && (
            <dl className="site00-char-cast__inspect">
              <dt>Provider</dt>
              <dd>{activeCandidate.provider}</dd>
              <dt>Model</dt>
              <dd>{activeCandidate.model}</dd>
              <dt>Variation</dt>
              <dd>{activeCandidate.variationAxis}</dd>
              <dt>Prompt snapshot</dt>
              <dd>{activeCandidate.promptSnapshotId}</dd>
            </dl>
          )}
        </section>
      )}

      {!loading && casting?.finalVisualIdentityApproved && (
        <section className="site00-char-cast__panel site00-char-cast__panel--ready">
          <h2>VISUAL IDENTITY LOCKED</h2>
          <p>Reference pack ready · continuity test unlocked</p>
          <Link to={site00ProjectCharacterContinuityPath(projectSlug)} className="site00-char-cast__cta site00-char-cast__cta--primary">
            CONTINUE TO CONTINUITY TEST →
          </Link>
        </section>
      )}
    </div>
  );

  return (
    <EcosystemShell hidePageHeader>
      <FounderWorkspaceShell
        projectSlug={projectSlug}
        title="CAST NDX"
        subtitle="VISUAL CASTING — STILL INTERPRETATIONS OF LOCKED CHARACTER TRUTH"
        attentionBadge={casting?.finalVisualIdentityApproved ? 'IDENTITY LOCKED' : casting?.visualCastingReady ? 'CASTING READY' : undefined}
        operate={operate}
      />
    </EcosystemShell>
  );
}
