import { Link, useLocation, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { NdxFounderWorkspacePage, FounderWorkspacePanel } from '../components/founderWorkspace';
import { site00ProjectsApi, Site00ProjectsApiError } from '../services/site00ProjectsApi';
import {
  site00ProjectFounderCharacterDiscoveryPath,
  site00ProjectCharacterContinuityReviewPath,
} from '../config/routes';
import type { NdxCharacterContinuityPipelineRun } from '../../../shared/site00-brand-lore/ndxCharacterContinuityPipeline/types';
import '../styles/site00-replay-execution.css';

type Section = 'AUDIT' | 'BIBLE' | 'CONTINUITY' | 'REFERENCES' | 'FAL' | 'GENERATION' | 'REVIEW';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'AUDIT', label: 'BIBLE AUDIT' },
  { id: 'BIBLE', label: 'INGEST BIBLE' },
  { id: 'CONTINUITY', label: 'CONTINUITY' },
  { id: 'REFERENCES', label: 'REFERENCES' },
  { id: 'FAL', label: 'FAL CAPABILITIES' },
  { id: 'GENERATION', label: 'GENERATION READINESS' },
  { id: 'REVIEW', label: 'CONTINUITY REVIEW' },
];

export default function ProjectCharacterContinuityPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const location = useLocation();
  const isReviewRoute = location.pathname.includes('/continuity/review');
  const [run, setRun] = useState<NdxCharacterContinuityPipelineRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [section, setSection] = useState<Section>(isReviewRoute ? 'REVIEW' : 'AUDIT');

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.characterContinuityGet(projectSlug);
      setRun((result.run as NdxCharacterContinuityPipelineRun | null) ?? null);
    } catch {
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const act = async (fn: () => Promise<{ run?: Record<string, unknown> }>) => {
    setBusy(true);
    setActionError(null);
    try {
      const result = await fn();
      if (result.run) setRun(result.run as NdxCharacterContinuityPipelineRun);
      else await reload();
    } catch (err) {
      setActionError(err instanceof Site00ProjectsApiError ? err.message : 'Continuity action failed');
    } finally {
      setBusy(false);
    }
  };

  if (projectSlug !== 'ndxbook') {
    return (
      <NdxFounderWorkspacePage
        projectSlug={projectSlug}
        title="CHARACTER CONTINUITY"
        nonNdxFallback={<p>Character Continuity Pipeline is NDXBOOK-only for this proof.</p>}
        operate={null}
      />
    );
  }

  const audit = run?.bibleAudit;
  const contract = run?.providerContracts.at(-1);

  return (
    <NdxFounderWorkspacePage
      projectSlug={projectSlug}
      title="CHARACTER CONTINUITY"
      subtitle="BIBLE INGESTION · CONTINUITY AUTHORITY · PROVIDER-AWARE FAL READINESS"
      loading={loading}
      loadingLabel="LOADING CONTINUITY PIPELINE…"
      actions={
        <>
          <Link to={site00ProjectFounderCharacterDiscoveryPath(projectSlug)}>← DISCOVERY</Link>
          <Link to={site00ProjectCharacterContinuityReviewPath(projectSlug)}>REVIEW →</Link>
        </>
      }
      operate={
        <>
          <FounderWorkspacePanel title="PRE-CASTING PIPELINE MODE">
            <p>The Character Bible is authority — FAL prompts and references are downstream.</p>
            <p><strong>Status:</strong> {run?.preCastingStatus ?? 'NOT INITIALIZED'}</p>
            <p><strong>Production generation:</strong> BLOCKED until cast</p>
            <p><strong>FAL generation requests:</strong> {run?.falGenerationRequests ?? 0}</p>
            {actionError && <p role="alert">{actionError}</p>}
            {!run && (
              <button
                type="button"
                className="site00-btn site00-btn--primary"
                disabled={busy}
                onClick={() => void act(() => site00ProjectsApi.characterContinuityInitialize(projectSlug))}
              >
                INITIALIZE CONTINUITY PIPELINE
              </button>
            )}
          </FounderWorkspacePanel>

          {run && (
            <>
              <nav className="site00-experiment-g__tabs" aria-label="Continuity sections">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={
                      section === s.id
                        ? 'site00-experiment-g__tab site00-experiment-g__tab--active'
                        : 'site00-experiment-g__tab'
                    }
                    onClick={() => setSection(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </nav>

              <section className="site00-experiment-g__panel">
                {section === 'AUDIT' && audit && (
                  <>
                    <h2>CHARACTER BIBLE AUDIT</h2>
                    <p>Bible status: {audit.status}</p>
                    <p>Character truth ready: {String(audit.characterTruthReady)}</p>
                    <p>Visual identity ready: {String(audit.visualIdentityReady)}</p>
                    <p>Image generation ready: {String(audit.imageGenerationReady)}</p>
                    <p>Video generation ready: {String(audit.videoGenerationReady)}</p>
                    <p>Voice ready: {String(audit.voiceReady)}</p>
                    <p>Reference pack ready: {run.referencePack.readiness}</p>
                    {audit.missingCriticalAuthority.length > 0 && (
                      <>
                        <p><strong>Missing critical authority:</strong></p>
                        <ul>{audit.missingCriticalAuthority.map((m) => <li key={m}>{m}</li>)}</ul>
                      </>
                    )}
                    {audit.blockedReasons.length > 0 && (
                      <>
                        <p><strong>Blocked because:</strong></p>
                        <ul>{audit.blockedReasons.map((b) => <li key={b}>{b}</li>)}</ul>
                      </>
                    )}
                  </>
                )}

                {section === 'BIBLE' && (
                  <>
                    <h2>INGEST CHARACTER BIBLE</h2>
                    <p>Drop in approved Bible material when ready. Pipeline preserves raw source.</p>
                    <button
                      type="button"
                      className="site00-btn"
                      disabled={busy}
                      onClick={() =>
                        void act(() =>
                          site00ProjectsApi.characterContinuityIngestSynthesis(
                            projectSlug,
                            'Discovery synthesis placeholder — not approved canon',
                            'External memory because she does not trust recall alone',
                            'Will not let a wrong statement slide',
                          ),
                        )
                      }
                    >
                      INGEST DISCOVERY SYNTHESIS (PARTIAL)
                    </button>
                    <button
                      type="button"
                      className="site00-btn"
                      disabled={busy}
                      onClick={() => void act(() => site00ProjectsApi.characterContinuityMockFixtureTest(projectSlug))}
                    >
                      RUN MOCK FIXTURE PIPELINE TEST
                    </button>
                    <p>Ingestion receipts: {run.ingestionReceipts.length}</p>
                  </>
                )}

                {section === 'CONTINUITY' && (
                  <>
                    <h2>CONTINUITY BIBLE</h2>
                    {run.continuityBible ? (
                      <>
                        <p>Compiled from Bible v{run.continuityBible.bibleVersion}</p>
                        <p>Identity anchors: {run.bible?.identityAnchors.length ?? 0} (NOT_APPROVED until cast)</p>
                        <p>Variation rules: {run.bible?.continuityRules.length ?? 0}</p>
                        <p>Negative constraints: {run.bible?.negativeIdentityConstraints.length ?? 0}</p>
                      </>
                    ) : (
                      <p>Ingest a Bible to compile continuity authority.</p>
                    )}
                  </>
                )}

                {section === 'REFERENCES' && (
                  <>
                    <h2>CHARACTER REFERENCE PACK</h2>
                    <p>Readiness: {run.referencePack.readiness}</p>
                    <p>Approved references: {run.referencePack.approvedReferenceCount}</p>
                    <p>No final NDX references populated — casting required.</p>
                  </>
                )}

                {section === 'FAL' && (
                  <>
                    <h2>FAL CAPABILITY REGISTRY</h2>
                    <ul>
                      {run.capabilityRegistry.map((c) => (
                        <li key={c.capabilityId}>
                          {c.endpoint} — {c.schemaSupportState}
                          {c.supportsReferenceToVideo ? ' · ref-to-video' : ''}
                          {c.supportsImageToVideo ? ' · img-to-video' : ''}
                          {c.supportsMultipleReferences ? ' · multi-ref' : ''}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {section === 'GENERATION' && (
                  <>
                    <h2>GENERATION CONTRACT PREVIEW</h2>
                    <p>Preview only — production generation blocked.</p>
                    <button
                      type="button"
                      className="site00-btn site00-btn--primary"
                      disabled={busy || !run.continuityBible}
                      onClick={() => void act(() => site00ProjectsApi.characterContinuityPreviewContract(projectSlug))}
                    >
                      PREVIEW PROVIDER CONTRACT
                    </button>
                    {contract && (
                      <>
                        <p>Endpoint: {contract.endpoint}</p>
                        <p>Preview only: {String(contract.previewOnly)}</p>
                        <p>Unsupported fields stripped: {contract.unsupportedFieldsStripped.join(', ') || 'none'}</p>
                        <pre style={{ whiteSpace: 'pre-wrap' }}>{contract.prompt}</pre>
                      </>
                    )}
                    <p>Snapshots: {run.generationSnapshots.length}</p>
                  </>
                )}

                {section === 'REVIEW' && (
                  <>
                    <h2>CONTINUITY REVIEW (FUTURE ASSETS)</h2>
                    <p>When generated assets exist, review identity match vs character match separately.</p>
                    <p>Judgments: THAT&apos;S HER · LOOKS LIKE HER / DOESN&apos;T ACT LIKE HER · FACE DRIFT · REGENERATE</p>
                    <p>No generated assets yet — pre-casting mode.</p>
                  </>
                )}
              </section>
            </>
          )}
        </>
      }
    />
  );
}
