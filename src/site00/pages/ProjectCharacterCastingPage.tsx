import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
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
  castingFalGenerationFailed,
  castingFalGenerationInProgress,
  castingRoundNeedsFalRetry,
  isCastingPlaceholderPreviewUrl,
  FOUNDER_CASTING_REFERENCE_ROLES,
  CHARACTER_BIBLE_REVIEW_TABS,
} from '../../../shared/site00-studio-world-production/characterVisualCasting/client.js';
import type {
  CharacterCastingCandidate,
  FounderCastingReference,
  FounderCastingReferenceRole,
  CharacterReferenceDecomposition,
  CharacterBibleReviewTab,
  CharacterBibleAssetPack,
} from '../../../shared/site00-studio-world-production/characterVisualCasting/client.js';
import { prepareReferenceBoardUpload } from '../utils/prepareReferenceBoardUpload';
import '../styles/site00-character-casting.css';

const POLL_MS = 5000;
const GENERATION_STUCK_MS = 60_000;

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
  const [referenceRole, setReferenceRole] = useState<FounderCastingReferenceRole>('FULL_LOOK');
  const [generationStartedAt, setGenerationStartedAt] = useState<number | null>(null);
  const [bibleReviewTab, setBibleReviewTab] = useState<CharacterBibleReviewTab>('PRESENCE');

  const casting = run?.visualCastingState ?? null;
  const founderReferences = casting?.founderReferences ?? [];

  const reload = useCallback(async () => {
    if (!hasProjectCapability(projectSlug, 'CHARACTER_VISUAL_CASTING')) return;
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
  const isBibleAssetRound = latestRound?.generationMode === 'CHARACTER_BIBLE_ASSET_PACK';
  const fullLookReference = founderReferences.find((entry) => entry.role === 'FULL_LOOK' && entry.decomposition);
  const hasRound = latestRoundCandidates.length > 0;
  const needsFalRetry = casting && latestRound ? castingRoundNeedsFalRetry(casting, latestRound.roundId) : false;
  const isGeneratingRound = Boolean(casting && castingFalGenerationInProgress(casting));
  const generationFailed = Boolean(casting && castingFalGenerationFailed(casting));

  useEffect(() => {
    if (casting && castingFalGenerationInProgress(casting)) {
      setGenerationStartedAt((prev) => prev ?? Date.now());
      return;
    }
    setGenerationStartedAt(null);
  }, [casting]);

  const generationStuck = Boolean(
    generationStartedAt && isGeneratingRound && Date.now() - generationStartedAt > GENERATION_STUCK_MS,
  );

  useEffect(() => {
    if (!casting || !castingFalGenerationInProgress(casting)) return undefined;
    const id = window.setInterval(() => void reload(), POLL_MS);
    return () => window.clearInterval(id);
  }, [casting, reload]);

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

  if (!hasProjectCapability(projectSlug, 'CHARACTER_VISUAL_CASTING')) {
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

      {!loading && casting?.visualCastingReady && (
        <FounderReferencesPanel
          references={founderReferences}
          role={referenceRole}
          busy={busy}
          onRoleChange={setReferenceRole}
          onUpload={(file) =>
            void act(async () => {
              const imageData = await prepareReferenceBoardUpload(file);
              return site00ProjectsApi.characterVisualCastingUploadReference(
                projectSlug,
                imageData,
                referenceRole,
                file.name,
              );
            })
          }
          onStoreInBible={(referenceId) =>
            void act(() => site00ProjectsApi.characterVisualCastingStoreReferenceBible(projectSlug, referenceId))
          }
          onRegenerate={() =>
            void act(() => site00ProjectsApi.characterVisualCastingGenerateBibleFromReference(projectSlug))
          }
          onGenerateBible={() =>
            void act(() => site00ProjectsApi.characterVisualCastingGenerateBibleFromReference(projectSlug))
          }
          onBibleLock={(lock, value) =>
            void act(() => site00ProjectsApi.characterVisualCastingBibleLock(projectSlug, lock, value))
          }
          assetPack={casting.characterBibleAssetPack ?? null}
          activeAuthority={casting.activeReferenceAuthority ?? null}
        />
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
          <h2>{isBibleAssetRound ? 'GENERATING CHARACTER BIBLE ASSETS' : 'GENERATING CASTING STILLS'}</h2>
          <p>
            {isBibleAssetRound
              ? 'Reference-driven reconstruction — same woman across portrait angles, turnaround, wardrobe, and environment.'
              : 'Calling FAL for editorial stills in the background — safe to refresh or leave this page.'}
          </p>
          <p className="site00-char-cast__hint">Progress updates every few seconds. Tunnel refresh will not cancel server-side generation.</p>
          {generationStuck ? (
            <p className="site00-char-cast__hint">
              Still waiting? The server may have lost the background job — tap retry to dispatch FAL again.
            </p>
          ) : null}
          <div className="site00-char-cast__hero">
            <div className="site00-char-cast__frame">
              <div className="site00-char-cast__placeholder">Generating candidate {String(activeIndex + 1).padStart(2, '0')}…</div>
            </div>
          </div>
          {(generationStuck || latestRound) && (
            <button
              type="button"
              className="site00-char-cast__cta site00-char-cast__cta--primary"
              disabled={busy}
              onClick={() => {
                setGenerationStartedAt(Date.now());
                void act(() =>
                  site00ProjectsApi.characterVisualCastingRetryFal(projectSlug, latestRound?.roundId),
                );
              }}
            >
              RETRY GENERATE STILLS
            </button>
          )}
        </section>
      )}

      {!loading && generationFailed && casting?.falGenerationTracking?.errorMessage && (
        <section className="site00-char-cast__panel">
          <p className="site00-char-cast__error" role="alert">
            {casting.falGenerationTracking.errorMessage}
          </p>
          {(needsFalRetry || isGeneratingRound === false) && latestRound && (
            <button
              type="button"
              className="site00-char-cast__cta site00-char-cast__cta--primary"
              disabled={busy}
              onClick={() => void act(() => site00ProjectsApi.characterVisualCastingRetryFal(projectSlug, latestRound.roundId))}
            >
              RETRY GENERATE STILLS
            </button>
          )}
        </section>
      )}

      {!loading && casting?.castingCandidatesReady && hasRound && isBibleAssetRound && (
        <CharacterBibleReviewPanel
          candidates={latestRoundCandidates}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          bibleReviewTab={bibleReviewTab}
          setBibleReviewTab={setBibleReviewTab}
          busy={busy}
          assetPack={casting.characterBibleAssetPack ?? null}
          onApprove={() => void act(() => site00ProjectsApi.characterVisualCastingApproveBiblePack(projectSlug))}
          onStoreReference={(referenceId) =>
            void act(() => site00ProjectsApi.characterVisualCastingStoreReferenceBible(projectSlug, referenceId))
          }
          fullLookReferenceId={fullLookReference?.referenceId ?? null}
          needsFalRetry={needsFalRetry}
          onRetryFal={() => void act(() => site00ProjectsApi.characterVisualCastingRetryFal(projectSlug, latestRound?.roundId))}
        />
      )}

      {!loading && casting?.castingCandidatesReady && hasRound && !isBibleAssetRound && (
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

function FounderReferencesPanel({
  references,
  role,
  busy,
  onRoleChange,
  onUpload,
  onStoreInBible,
  onRegenerate,
  onGenerateBible,
  onBibleLock,
  assetPack,
  activeAuthority,
}: {
  references: FounderCastingReference[];
  role: FounderCastingReferenceRole;
  busy: boolean;
  onRoleChange: (role: FounderCastingReferenceRole) => void;
  onUpload: (file: File) => void;
  onStoreInBible: (referenceId: string) => void;
  onRegenerate: () => void;
  onGenerateBible: () => void;
  onBibleLock: (lock: 'faceLocked' | 'wardrobeLocked' | 'environmentLocked', value: boolean) => void;
  assetPack: CharacterBibleAssetPack | null;
  activeAuthority: { referenceId: string; role: string } | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => {
    if (busy) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file?.type.startsWith('image/')) return;
    onUpload(file);
  };

  const fullLook = references.find((entry) => entry.role === 'FULL_LOOK' && entry.decomposition);
  const canGenerateBible = Boolean(fullLook?.decomposition);

  return (
    <section className="site00-char-cast__panel site00-char-cast__refs">
      <h2>REFERENCE-FIRST CASTING</h2>
      <p className="site00-char-cast__hint">
        Upload → decompose → generate Character Bible asset pack → review → lock. Upload alone does not spend provider credits.
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="site00-char-cast__upload-input"
        aria-hidden
        tabIndex={-1}
        onChange={handleFileChange}
      />
      <div className="site00-char-cast__role-strip">
        {FOUNDER_CASTING_REFERENCE_ROLES.map((entry) => (
          <button
            key={entry}
            type="button"
            className={`site00-char-cast__role-chip${role === entry ? ' site00-char-cast__role-chip--active' : ''}`}
            disabled={busy}
            onClick={() => onRoleChange(entry)}
          >
            {entry.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      <button type="button" className="site00-char-cast__upload-zone" disabled={busy} onClick={openFilePicker}>
        STEP 1 · TAP TO UPLOAD {role.replace(/_/g, ' ')} REFERENCE
      </button>

      {fullLook?.decomposition ? (
        <DecompositionReviewPanel decomposition={fullLook.decomposition} authorityActive={Boolean(activeAuthority)} />
      ) : null}

      {references.length > 0 ? (
        <ul className="site00-char-cast__ref-list">
          {references.map((entry) => (
            <li key={entry.referenceId} className="site00-char-cast__ref-item">
              {entry.previewUrl ? (
                <img src={entry.previewUrl} alt="" className="site00-char-cast__ref-thumb" />
              ) : null}
              <div className="site00-char-cast__ref-body">
                <p className="site00-char-cast__ref-title">
                  {entry.role.replace(/_/g, ' ')}
                  {entry.label ? ` · ${entry.label}` : ''}
                </p>
                <p className="site00-char-cast__ref-status">{entry.status.replace(/_/g, ' ')}</p>
                {!entry.storedInBible && entry.decomposedSignals.length > 0 ? (
                  <button
                    type="button"
                    className="site00-char-cast__cta"
                    disabled={busy}
                    onClick={() => onStoreInBible(entry.referenceId)}
                  >
                    STORE IN BIBLE →
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {canGenerateBible ? (
        <>
          <button
            type="button"
            className="site00-char-cast__cta site00-char-cast__cta--primary"
            disabled={busy}
            onClick={onGenerateBible}
          >
            STEP 3 · GENERATE CHARACTER BIBLE FROM REFERENCE →
          </button>
          <button type="button" className="site00-char-cast__cta" disabled={busy} onClick={onRegenerate}>
            REGENERATE CASTING FROM REFERENCES →
          </button>
        </>
      ) : null}

      {assetPack ? (
        <div className="site00-char-cast__lock-strip">
          <span className="site00-char-cast__hint">Lock continuity anchors:</span>
          <button
            type="button"
            className={`site00-char-cast__role-chip${assetPack.lockStates.faceLocked ? ' site00-char-cast__role-chip--active' : ''}`}
            disabled={busy}
            onClick={() => onBibleLock('faceLocked', !assetPack.lockStates.faceLocked)}
          >
            LOCK FACE
          </button>
          <button
            type="button"
            className={`site00-char-cast__role-chip${assetPack.lockStates.wardrobeLocked ? ' site00-char-cast__role-chip--active' : ''}`}
            disabled={busy}
            onClick={() => onBibleLock('wardrobeLocked', !assetPack.lockStates.wardrobeLocked)}
          >
            LOCK WARDROBE
          </button>
          <button
            type="button"
            className={`site00-char-cast__role-chip${assetPack.lockStates.environmentLocked ? ' site00-char-cast__role-chip--active' : ''}`}
            disabled={busy}
            onClick={() => onBibleLock('environmentLocked', !assetPack.lockStates.environmentLocked)}
          >
            LOCK ENVIRONMENT
          </button>
        </div>
      ) : null}
    </section>
  );
}

function DecompositionReviewPanel({
  decomposition,
  authorityActive,
}: {
  decomposition: CharacterReferenceDecomposition;
  authorityActive: boolean;
}) {
  const renderField = (label: string, field: { value: string; confidence: string }) => (
    <div key={label} className="site00-char-cast__decomp-field">
      <dt>{label}</dt>
      <dd>
        {field.value}{' '}
        <span className="site00-char-cast__decomp-confidence">({field.confidence.replace(/_/g, ' ').toLowerCase()})</span>
      </dd>
    </div>
  );

  return (
    <section className="site00-char-cast__decomp">
      <h3>STEP 2 · DECOMPOSITION REVIEW</h3>
      <p className="site00-char-cast__hint">
        {authorityActive
          ? 'Full Look reference is active casting authority — legacy prompt text is secondary only.'
          : 'Review detected signals before generating assets.'}
      </p>
      <dl className="site00-char-cast__decomp-grid">
        {renderField('Identity', decomposition.identity.faceShape)}
        {renderField('Age range', decomposition.identity.ageRange)}
        {renderField('Hair', decomposition.hair.styleStructure)}
        {renderField('Wardrobe', decomposition.wardrobe.lookNaming)}
        {renderField('Presence', decomposition.presence.moodEnergy)}
        {renderField('Environment', decomposition.environment.roomType)}
        {renderField('Bottom (may be inferred)', decomposition.wardrobe.bottomCategory)}
      </dl>
    </section>
  );
}

function assetSlotMatchesTab(slot: string | null | undefined, tab: CharacterBibleReviewTab): boolean {
  if (!slot) return tab === 'BIBLE_SUMMARY';
  if (tab === 'PRESENCE') return slot.startsWith('EXPRESSION_');
  if (tab === 'PORTRAIT_ANGLES') return slot.startsWith('PORTRAIT_');
  if (tab === 'FULL_TURNAROUND') return slot.startsWith('FULL_BODY_');
  if (tab === 'WARDROBE') return slot === 'WARDROBE_SHEET';
  if (tab === 'ENVIRONMENT') return slot === 'ENVIRONMENT_SET';
  return false;
}

function CharacterBibleReviewPanel({
  candidates,
  activeIndex,
  setActiveIndex,
  bibleReviewTab,
  setBibleReviewTab,
  busy,
  assetPack,
  onApprove,
  onStoreReference,
  fullLookReferenceId,
  needsFalRetry,
  onRetryFal,
}: {
  candidates: CharacterCastingCandidate[];
  activeIndex: number;
  setActiveIndex: (value: number | ((prev: number) => number)) => void;
  bibleReviewTab: CharacterBibleReviewTab;
  setBibleReviewTab: (tab: CharacterBibleReviewTab) => void;
  busy: boolean;
  assetPack: CharacterBibleAssetPack | null;
  onApprove: () => void;
  onStoreReference: (referenceId: string) => void;
  fullLookReferenceId: string | null;
  needsFalRetry: boolean;
  onRetryFal: () => void;
}) {
  const tabCandidates = candidates.filter((entry) => assetSlotMatchesTab(entry.assetSlot, bibleReviewTab));
  const activeCandidate = tabCandidates[activeIndex] ?? tabCandidates[0] ?? candidates[0] ?? null;
  const tabIndex = activeCandidate ? tabCandidates.indexOf(activeCandidate) : 0;

  return (
    <section className="site00-char-cast__panel">
      <header className="site00-char-cast__review-head">
        <h2>STEP 4 · CHARACTER BIBLE REVIEW</h2>
        <span className="site00-char-cast__counter">{assetPack?.status.replace(/_/g, ' ') ?? 'REVIEW'}</span>
      </header>
      <div className="site00-char-cast__role-strip">
        {CHARACTER_BIBLE_REVIEW_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`site00-char-cast__role-chip${bibleReviewTab === tab ? ' site00-char-cast__role-chip--active' : ''}`}
            onClick={() => {
              setBibleReviewTab(tab);
              setActiveIndex(0);
            }}
          >
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      {needsFalRetry ? (
        <button type="button" className="site00-char-cast__cta site00-char-cast__cta--primary" disabled={busy} onClick={onRetryFal}>
          GENERATE ASSETS WITH FAL
        </button>
      ) : null}
      <div className="site00-char-cast__hero">
        <div className="site00-char-cast__frame">
          {activeCandidate?.previewUrl && !isCastingPlaceholderPreviewUrl(activeCandidate.previewUrl) ? (
            <img
              src={activeCandidate.previewUrl}
              alt={`Bible asset ${activeCandidate.assetSlot?.replace(/_/g, ' ') ?? 'view'}`}
              className="site00-char-cast__image"
            />
          ) : (
            <div className="site00-char-cast__placeholder">
              {activeCandidate?.assetSlot?.replace(/_/g, ' ') ?? 'Asset'} · same-woman reference reconstruction
            </div>
          )}
        </div>
        {tabCandidates.length > 1 ? (
          <div className="site00-char-cast__nav">
            <button type="button" disabled={tabIndex <= 0} onClick={() => setActiveIndex(Math.max(0, tabIndex - 1))}>
              ← PREV
            </button>
            <button
              type="button"
              disabled={tabIndex >= tabCandidates.length - 1}
              onClick={() => setActiveIndex(Math.min(tabCandidates.length - 1, tabIndex + 1))}
            >
              NEXT →
            </button>
          </div>
        ) : null}
      </div>
      <div className="site00-char-cast__reactions">
        <button type="button" className="site00-char-cast__reaction" disabled={busy} onClick={onApprove}>
          THAT&apos;S HER · APPROVE PACK
        </button>
        {fullLookReferenceId ? (
          <button
            type="button"
            className="site00-char-cast__reaction"
            disabled={busy}
            onClick={() => onStoreReference(fullLookReferenceId)}
          >
            STORE IN BIBLE
          </button>
        ) : null}
      </div>
    </section>
  );
}
