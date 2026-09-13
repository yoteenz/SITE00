/**
 * P0.VR.TWINV2.1 + TWINV2.2 — Concept-directed twin workflow (parallel to forensic V1).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { site00ClientApiUrl } from '../../../../../shared/site00-studio-world-production/site00ClientApiBase.js';
import type { ConceptDirectedTwinSession } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/types.js';
import {
  composeConceptDirectedTwinV2,
  mergeVisualConceptApiResult,
  recordFounderVisualSpendIntent,
  requestTwinV2VisualConcept,
  buildTwinV2PreviewRoute,
  TWIN_V2_VISUAL_PROVIDER_LABEL,
  approveActiveConceptCandidate,
  ensureConceptGallery,
  setActiveConceptId,
  listConceptDirectedTwinSessionsForProject,
  getConceptCandidates,
  shouldShowV2EmptyState,
  fetchRemoteTwinV2Generations,
  fetchRemoteTwinV2GenerationsForProject,
  importExistingV2ConceptFromUrl,
  importExistingV2ConceptsFromUrls,
  requestTwinV2ImportConcept,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import { ConceptDirectedTwinGallery } from './ConceptDirectedTwinGallery.js';
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
  const [hydrating, setHydrating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refineOpen, setRefineOpen] = useState(false);
  const [refineText, setRefineText] = useState('');
  const [refineRegion, setRefineRegion] = useState('');
  const [spendConfirmOpen, setSpendConfirmOpen] = useState<'generate' | 'regenerate' | 'refine' | null>(null);
  const [compareMode, setCompareMode] = useState<CompareMode>('APPROVED_VISUAL');
  const [liveCompare, setLiveCompare] = useState<'LIVE' | 'TWIN_V1' | 'TWIN_V2'>('LIVE');
  const [falApiStatus, setFalApiStatus] = useState<string | null>(null);
  const [importUrls, setImportUrls] = useState('');
  const [importing, setImporting] = useState(false);
  const [importNotice, setImportNotice] = useState<{ tone: 'error' | 'ok'; text: string } | null>(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setHydrating(true);
      const hydrateWallMs = 12_000;
      try {
        await Promise.race([
          (async () => {
        const base = sessionRef.current;
        const siblingSessions = listConceptDirectedTwinSessionsForProject(base.projectId).filter(
          (s) => s.sessionId !== base.sessionId,
        );
        const sessionIds = [base.sessionId, ...siblingSessions.map((s) => s.sessionId)];
        const byProject = await fetchRemoteTwinV2GenerationsForProject(base.projectId);
        const bySession = (await Promise.all(sessionIds.map((id) => fetchRemoteTwinV2Generations(id)))).flatMap(
          (r) => r.records,
        );
        const remoteMap = new Map<string, (typeof byProject.records)[0]>();
        for (const r of [...byProject.records, ...bySession]) {
          const key = r.imageStorageRef ?? r.imageUrl;
          if (key) remoteMap.set(key, r);
        }
        const remoteRecords = [...remoteMap.values()];

        const latest = sessionRef.current;
        const priorCandidates = latest.conceptGallery?.candidates?.length ?? 0;
        const hydrated = ensureConceptGallery(latest, { siblingSessions, remoteStorageRecords: remoteRecords });
        const nextCandidates = hydrated.conceptGallery?.candidates?.length ?? 0;
        const merged =
          nextCandidates >= priorCandidates
            ? hydrated
            : {
                ...latest,
                conceptGallery: latest.conceptGallery ?? hydrated.conceptGallery,
              };
        if (!cancelled) onSessionChange(merged);
          })(),
          new Promise<void>((_, reject) => {
            window.setTimeout(() => reject(new Error('Gallery hydration timed out')), hydrateWallMs);
          }),
        ]);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Gallery hydration failed';
          setError(msg.includes('timed out') ? 'Concept gallery load timed out — you can still import URLs below.' : msg);
        }
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once per Twin V2 open / session id
  }, [session.sessionId]);

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
  const galleryQuery = getConceptCandidates({
    projectId: session.projectId,
    pageId: session.pageId,
    viewport: 'mobile',
    mode: 'CONCEPT_DIRECTED_V2',
    session,
  });
  const gallery = session.conceptGallery;
  const galleryCandidates = galleryQuery.candidates;
  const discoverableCount = gallery?.backfillReceipt?.discoverableGenerationCount ?? 0;
  const showEmptyState =
    !hydrating && shouldShowV2EmptyState(discoverableCount, galleryQuery.canonicalConceptCount);
  const hydrationFailed =
    !hydrating && showEmptyState && gallery?.backfillReceipt?.status === 'NO_DISCOVERABLE_GENERATIONS';
  const showGallery = galleryQuery.canonicalConceptCount > 0;
  const preBuildConceptStage = showGallery && !session.renderedTwin?.builtAt;

  const bindingSummaries = Object.fromEntries(
    Object.entries(gallery?.bindingPlans ?? {}).map(([id, plan]) => [
      id,
      plan.bindings.map((b) => ({ region: b.visualRegion, fn: b.liveFunction })),
    ]),
  );

  const latestConcept = session.history.at(-1);

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
      const activeLegacy =
        gallery?.activeConceptId != null
          ? galleryCandidates.find((c) => c.conceptId === gallery.activeConceptId)?.legacyVersionId
          : null;
      working = mergeVisualConceptApiResult(working, {
        action,
        imageUrl: res.imageUrl,
        imageStorageRef: res.imageStorageRef,
        refineInstruction: action === 'refine' ? refineText : null,
        parentVersionId:
          action === 'refine' ? (activeLegacy ?? latestConcept?.versionId ?? null) : (latestConcept?.versionId ?? null),
      });
      working = ensureConceptGallery(working);
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
    try {
      const next = approveActiveConceptCandidate(ensureConceptGallery(session));
      onSessionChange(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approve failed');
    }
  };

  const runImportExisting = async () => {
    const urls = importUrls
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((u) => u.startsWith('http://') || u.startsWith('https://'));
    if (!urls.length) {
      setImportNotice({
        tone: 'error',
        text: 'Paste at least one full image URL (https://…) — one per line. Grey placeholder text is not imported.',
      });
      return;
    }
    setImporting(true);
    setError(null);
    setImportNotice(null);
    try {
      let working = session;
      let persistedCount = 0;
      let localOnlyCount = 0;
      const importErrors: string[] = [];
      for (const url of urls) {
        try {
          const persisted = await requestTwinV2ImportConcept({
            projectId: session.projectId,
            pageId: session.pageId,
            sessionId: session.sessionId,
            imageUrl: url,
          });
          working = importExistingV2ConceptFromUrl(working, {
            imageUrl: persisted.imageUrl,
            imageStorageRef: persisted.imageStorageRef,
          });
          persistedCount += 1;
        } catch (e) {
          try {
            working = importExistingV2ConceptsFromUrls(working, [url]);
            localOnlyCount += 1;
          } catch (inner) {
            importErrors.push(inner instanceof Error ? inner.message : url);
          }
        }
      }
      if (persistedCount + localOnlyCount === 0) {
        throw new Error(importErrors[0] ?? 'Import failed — check URLs and try again');
      }
      working = ensureConceptGallery(working);
      sessionRef.current = working;
      onSessionChange(working);
      setImportUrls('');
      const n = working.conceptGallery?.candidates.length ?? 0;
      setImportNotice({
        tone: 'ok',
        text: `Imported ${persistedCount + localOnlyCount} image(s). Gallery: ${n} concept${n === 1 ? '' : 's'}${localOnlyCount ? ' (some saved on this device only — redeploy Railway for durable storage)' : ''}.`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Import failed';
      setImportNotice({ tone: 'error', text: msg });
    } finally {
      setImporting(false);
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

  const storeSummary = gallery?.backfillReceipt
    ? `DISCOVERED: ${gallery.backfillReceipt.discoverableGenerationCount} · BACKFILLED: ${gallery.backfillReceipt.backfilledCount} · CANONICAL: ${gallery.backfillReceipt.canonicalConceptCount} · RENDERED: ${gallery.galleryHydrationReceipt?.renderedConceptCount ?? galleryQuery.canonicalConceptCount}`
    : null;

  return (
    <div className="site00-twin-v2-concept" data-twin-v2-workflow="1" data-twin-v2-stage={preBuildConceptStage ? 'concept-gallery' : 'default'}>
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

      {hydrating ? <p className="site00-twin-v2-concept__hydrating">Loading concept gallery…</p> : null}

      {showGallery && gallery ? (
        <ConceptDirectedTwinGallery
          candidates={galleryCandidates}
          activeConceptId={galleryQuery.activeConceptId}
          blueprints={gallery.blueprints}
          bindingSummaries={bindingSummaries}
          onSelectConcept={(id) => onSessionChange(setActiveConceptId(session, id))}
          onApprove={handleApprove}
          onRefine={() => setRefineOpen(true)}
          onRegenerate={() => setSpendConfirmOpen('regenerate')}
          onBuild={handleBuildTwin}
          building={building}
          generating={generating}
        />
      ) : null}

      {!hydrating && showEmptyState ? (
        <>
          <figure className="site00-twin-v2-concept__concept-frame">
            <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: '#888' }}>
              NO STORED CONCEPTS ON THIS DEVICE OR API
              {hydrationFailed ? (
                <p style={{ fontSize: '0.75rem', marginTop: '0.75rem' }}>
                  Site 00 has 0 saved Twin V2 images for ndxbook (checked Supabase ledger/storage). Your five FAL outputs
                  were never persisted here — import their image URLs below (no new generation).
                </p>
              ) : null}
            </div>
          </figure>
          <section className="site00-twin-v2-concept__import">
            <label>
              <strong>IMPORT EXISTING CONCEPTS</strong>
              <span> — paste your five FAL image links (one per line). No paid generation.</span>
              <textarea
                value={importUrls}
                onChange={(e) => {
                  setImportUrls(e.target.value);
                  if (importNotice?.tone === 'error') setImportNotice(null);
                }}
                rows={5}
                placeholder={'Paste links from fal.ai history — example:\nhttps://v3.fal.media/files/…/image.webp'}
              />
            </label>
            {importNotice ? (
              <p
                className={
                  importNotice.tone === 'ok'
                    ? 'site00-twin-v2-concept__import-feedback'
                    : 'site00-twin-v2-concept__import-error'
                }
                role={importNotice.tone === 'ok' ? 'status' : 'alert'}
              >
                {importNotice.text}
              </p>
            ) : null}
            <button
              type="button"
              className="site00-dw-v3-btn site00-dw-v3-btn--primary"
              disabled={importing || hydrating}
              onClick={() => void runImportExisting()}
            >
              {importing ? 'IMPORTING…' : hydrating ? 'LOADING GALLERY…' : 'IMPORT INTO GALLERY'}
            </button>
          </section>
          <div className="site00-twin-v2-concept__actions">
            <button
              type="button"
              className="site00-dw-v3-btn site00-dw-v3-btn--outline"
              disabled={generating}
              onClick={() => setSpendConfirmOpen('generate')}
            >
              {generating ? 'GENERATING…' : 'GENERATE NEW CONCEPT (PAID)'}
            </button>
          </div>
        </>
      ) : null}

      {showGallery ? (
        <div className="site00-twin-v2-concept__actions site00-twin-v2-concept__actions--secondary">
          <button
            type="button"
            className="site00-dw-v3-btn site00-dw-v3-btn--outline"
            disabled={generating}
            onClick={() => setSpendConfirmOpen('generate')}
          >
            {generating ? 'GENERATING…' : 'GENERATE NEW CONCEPT'}
          </button>
        </div>
      ) : null}

      <details className="site00-twin-v2-concept__details">
        <summary>VIEW INPUTS &amp; DETAILS</summary>
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
          {storeSummary ? (
            <p className="site00-twin-v2-concept__concept-store">
              <strong>CONCEPT STORE</strong> · {storeSummary}
            </p>
          ) : null}
        </section>
      </details>

      {session.renderedTwin?.builtAt ? (
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onPreviewTwinV2}>
          OPEN TWIN V2 PREVIEW
        </button>
      ) : null}

      {error ? <p role="alert">{error}</p> : null}

      {!preBuildConceptStage && session.renderedTwin?.builtAt ? (
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

      {!preBuildConceptStage ? (
        <>
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
        </>
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
    </div>
  );
}
