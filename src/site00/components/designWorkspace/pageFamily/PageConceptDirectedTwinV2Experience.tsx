/**
 * P0.VR.TWINV2.1 — Concept-directed twin workflow (parallel to forensic V1).
 */

import { useEffect, useMemo, useState } from 'react';
import { site00ClientApiUrl } from '../../../../../shared/site00-studio-world-production/site00ClientApiBase.js';
import type { ConceptDirectedTwinSession } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/types.js';
import {
  applyApproveVisualConcept,
  composeConceptDirectedTwinV2,
  mergeVisualConceptApiResult,
  recordFounderVisualSpendIntent,
  requestTwinV2VisualConcept,
  buildTwinV2PreviewRoute,
  TWIN_V2_VISUAL_PROVIDER_LABEL,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import '../../../styles/site00-twin-v2-concept.css';

const STEPS = ['INTENT', 'CREATIVE DIRECTION', 'VISUAL CONCEPT', 'FOUNDER REVIEW', 'BUILD TWIN', 'FIDELITY REVIEW'] as const;

type CompareMode = 'APPROVED_VISUAL' | 'TWIN_V2' | 'OVERLAY' | 'DIFF';

type Props = {
  session: ConceptDirectedTwinSession;
  currentScreenshot: string | null;
  twinV1PreviewUrl: string | null;
  onSessionChange: (session: ConceptDirectedTwinSession) => void;
  onClose: () => void;
  onPreviewTwinV2: () => void;
};

function activeStepIndex(status: ConceptDirectedTwinSession['status']): number {
  if (status === 'TWIN_V2_COMPLETE' || status === 'TWIN_V2_FIDELITY_REFINING') return 5;
  if (status === 'TWIN_V2_REVIEW_READY') return 5;
  if (status === 'TWIN_V2_BUILDING' || status === 'TWIN_V2_APPROVED') return 4;
  if (status === 'TWIN_V2_CONCEPT_READY' || status === 'TWIN_V2_REFINING') return 3;
  if (status === 'TWIN_V2_DIRECTION_READY') return 1;
  return 0;
}

export function PageConceptDirectedTwinV2Experience({
  session,
  currentScreenshot,
  twinV1PreviewUrl,
  onSessionChange,
  onClose,
  onPreviewTwinV2,
}: Props) {
  const [generating, setGenerating] = useState(false);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refineOpen, setRefineOpen] = useState(false);
  const [refineText, setRefineText] = useState('');
  const [refineRegion, setRefineRegion] = useState('');
  const [spendConfirmOpen, setSpendConfirmOpen] = useState<'generate' | 'regenerate' | 'refine' | null>(null);
  const [historyVersionId, setHistoryVersionId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<CompareMode>('APPROVED_VISUAL');
  const [liveCompare, setLiveCompare] = useState<'LIVE' | 'TWIN_V1' | 'TWIN_V2'>('LIVE');
  const [falApiStatus, setFalApiStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(site00ClientApiUrl('/api/site00/twin-v2-visual-concept'), { credentials: 'omit' })
      .then((r) => r.json())
      .then((data: { falKeyConfigured?: boolean }) => {
        if (cancelled) return;
        setFalApiStatus(
          data.falKeyConfigured
            ? 'FAL connected on API (Railway FAL_KEY set)'
            : 'FAL not configured on API — set FAL_KEY on Railway for api.site00.com',
        );
      })
      .catch(() => {
        if (!cancelled) setFalApiStatus('Could not reach visual concept API — check deploy / network');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const step = activeStepIndex(session.status);
  const latestConcept = session.history.at(-1);
  const displayConcept =
    historyVersionId != null
      ? session.history.find((h) => h.versionId === historyVersionId) ?? latestConcept
      : latestConcept;

  const approvedImage = session.approvedVisualAuthority?.imageUrl ?? displayConcept?.imageUrl;

  const twinV2Route = useMemo(
    () => buildTwinV2PreviewRoute(session.projectId, session.sessionId),
    [session.projectId, session.sessionId],
  );

  const runVisualAction = async (action: 'generate' | 'regenerate' | 'refine') => {
    setGenerating(true);
    setError(null);
    let working = recordFounderVisualSpendIntent(session, action);
    onSessionChange(working);
    try {
      const res = await requestTwinV2VisualConcept({
        action,
        session: working,
        refineInstruction: action === 'refine' ? refineText : null,
        refineRegion: action === 'refine' ? refineRegion : null,
      });
      working = mergeVisualConceptApiResult(working, {
        action,
        imageUrl: res.imageUrl,
        imageStorageRef: res.imageStorageRef,
        refineInstruction: action === 'refine' ? refineText : null,
        parentVersionId: latestConcept?.versionId ?? null,
      });
      onSessionChange(working);
      setRefineOpen(false);
      setRefineText('');
      setRefineRegion('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Visual generation failed');
    } finally {
      setGenerating(false);
      setSpendConfirmOpen(null);
    }
  };

  const handleApprove = () => {
    if (!displayConcept) return;
    try {
      const next = applyApproveVisualConcept(session, displayConcept.versionId);
      onSessionChange(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approve failed');
    }
  };

  const handleBuildTwin = () => {
    setBuilding(true);
    setError(null);
    try {
      const { sessionPatch } = composeConceptDirectedTwinV2(session);
      onSessionChange({ ...session, ...sessionPatch, status: 'TWIN_V2_REVIEW_READY' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Build blocked');
    } finally {
      setBuilding(false);
    }
  };

  return (
    <div className="site00-twin-v2-concept" data-twin-v2-workflow="1">
      <header>
        <strong>TWIN V2</strong>
        <span> · CONCEPT-DIRECTED · EXPERIMENTAL</span>
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--compact" onClick={onClose}>
          BACK TO V1 UPGRADE
        </button>
      </header>

      <nav className="site00-twin-v2-concept__rail" aria-label="Twin V2 steps">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`site00-twin-v2-concept__rail-step${i === step ? ' is-active' : ''}${i < step ? ' is-done' : ''}`}
          >
            {label}
          </span>
        ))}
      </nav>

      <section className="site00-twin-v2-concept__compact-summary">
        <p>{session.pageIntent.summary}</p>
        <p>
          <strong>Creative premise:</strong> {session.creativeDirection?.creativePremise}
        </p>
        <p>
          <strong>Hero:</strong> {session.creativeDirection?.heroConcept}
        </p>
        <p>
          Visual model: {TWIN_V2_VISUAL_PROVIDER_LABEL} · {session.referenceAssets.length} reference assets
        </p>
        {falApiStatus ? <p className="site00-twin-v2-concept__fal-status">{falApiStatus}</p> : null}
      </section>

      <figure className="site00-twin-v2-concept__concept-frame">
        {displayConcept?.imageUrl ? (
          <img src={displayConcept.imageUrl} alt="Twin V2 visual concept" />
        ) : (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#888' }}>NO VISUAL CONCEPT YET</div>
        )}
      </figure>

      {session.history.length > 0 ? (
        <div className="site00-twin-v2-concept__history" aria-label="Concept history">
          {session.history.map((h) => (
            <button
              key={h.versionId}
              type="button"
              className={`site00-twin-v2-concept__history-item${h.status === 'APPROVED' ? ' is-approved' : ''}`}
              onClick={() => setHistoryVersionId(h.versionId)}
            >
              {h.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="site00-twin-v2-concept__actions">
        {!displayConcept?.imageUrl ? (
          <button
            type="button"
            className="site00-dw-v3-btn site00-dw-v3-btn--primary"
            disabled={generating}
            onClick={() => setSpendConfirmOpen('generate')}
          >
            {generating ? 'GENERATING…' : 'GENERATE VISUAL CONCEPT'}
          </button>
        ) : (
          <>
            <button
              type="button"
              className="site00-dw-v3-btn site00-dw-v3-btn--primary"
              disabled={!displayConcept?.imageUrl || session.sourceGeneration.codeAllowed}
              onClick={handleApprove}
            >
              APPROVE
            </button>
            <button
              type="button"
              className="site00-dw-v3-btn site00-dw-v3-btn--outline"
              disabled={generating}
              onClick={() => setSpendConfirmOpen('regenerate')}
            >
              REGENERATE
            </button>
            <button
              type="button"
              className="site00-dw-v3-btn site00-dw-v3-btn--outline"
              disabled={generating}
              onClick={() => setRefineOpen(true)}
            >
              REFINE
            </button>
          </>
        )}
        {session.sourceGeneration.codeAllowed ? (
          <button
            type="button"
            className="site00-dw-v3-btn site00-dw-v3-btn--primary"
            disabled={building || Boolean(session.renderedTwin?.builtAt)}
            onClick={handleBuildTwin}
          >
            {building ? 'BUILDING…' : 'BUILD TWIN V2'}
          </button>
        ) : null}
        {session.renderedTwin?.builtAt ? (
          <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onPreviewTwinV2}>
            OPEN TWIN V2 PREVIEW
          </button>
        ) : null}
      </div>

      {error ? <p role="alert">{error}</p> : null}

      {session.renderedTwin?.builtAt ? (
        <>
          <div className="site00-pfw-upgrade-v2__tabs" role="tablist" aria-label="Approved vs twin">
            {(['APPROVED_VISUAL', 'TWIN_V2', 'OVERLAY', 'DIFF'] as CompareMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                className={`site00-pfw-upgrade-v2__tab${compareMode === mode ? ' is-active' : ''}`}
                onClick={() => setCompareMode(mode)}
              >
                {mode.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          <p className="site00-pfw-upgrade-v2__twin-route">
            Fidelity QA: {session.fidelityReceipt?.status ?? 'PENDING'} · route {twinV2Route}
          </p>
        </>
      ) : null}

      <div className="site00-pfw-upgrade-v2__tabs" role="tablist" aria-label="Live V1 V2 compare">
        {(['LIVE', 'TWIN_V1', 'TWIN_V2'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            className={`site00-pfw-upgrade-v2__tab${liveCompare === mode ? ' is-active' : ''}`}
            onClick={() => setLiveCompare(mode)}
          >
            {mode.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      {liveCompare === 'LIVE' && currentScreenshot ? (
        <img src={currentScreenshot} alt="Live" style={{ maxWidth: 375 }} />
      ) : null}
      {liveCompare === 'TWIN_V1' && twinV1PreviewUrl ? (
        <p>
          <a href={twinV1PreviewUrl}>Open Twin V1 preview</a>
        </p>
      ) : null}
      {liveCompare === 'TWIN_V2' && session.renderedTwin?.builtAt ? (
        <p>
          <a href={twinV2Route}>Open Twin V2 preview</a>
        </p>
      ) : null}

      {refineOpen ? (
        <dialog open className="site00-dw-modal">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSpendConfirmOpen('refine');
            }}
          >
            <h3>What should change?</h3>
            <textarea value={refineText} onChange={(e) => setRefineText(e.target.value)} rows={4} required />
            <label>
              Region (optional)
              <input value={refineRegion} onChange={(e) => setRefineRegion(e.target.value)} placeholder="hero, activity, …" />
            </label>
            <button type="submit">Continue (paid generation)</button>
            <button type="button" onClick={() => setRefineOpen(false)}>
              Cancel
            </button>
          </form>
        </dialog>
      ) : null}

      {spendConfirmOpen ? (
        <dialog open className="site00-dw-modal">
          <p>Founder-triggered visual generation uses {TWIN_V2_VISUAL_PROVIDER_LABEL}. Continue?</p>
          <button type="button" onClick={() => void runVisualAction(spendConfirmOpen)}>
            Confirm spend
          </button>
          <button type="button" onClick={() => setSpendConfirmOpen(null)}>
            Cancel
          </button>
        </dialog>
      ) : null}

      {approvedImage && compareMode === 'APPROVED_VISUAL' ? null : null}
    </div>
  );
}
