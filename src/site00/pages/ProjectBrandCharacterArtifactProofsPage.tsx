import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectBrandCharacterSynthesisPath, site00ProjectPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { BrandCharacterSynthesisRun } from '../../../shared/site00-brand-lore/brandCharacterSynthesis/types';
import '../styles/site00-replay-execution.css';

export default function ProjectBrandCharacterArtifactProofsPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<BrandCharacterSynthesisRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.experimentHSynthesisGet(projectSlug);
      setRun((result.run as BrandCharacterSynthesisRun | null) ?? null);
    } catch {
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const formulate = async () => {
    setBusy(true);
    try {
      const result = await site00ProjectsApi.experimentHArtifactProofsFormulate(projectSlug);
      setRun((result.run as BrandCharacterSynthesisRun | null) ?? null);
    } finally {
      setBusy(false);
    }
  };

  const generate = async (proofId: string) => {
    setBusy(true);
    try {
      const result = await site00ProjectsApi.experimentHArtifactProofGenerate(projectSlug, proofId);
      setRun((result.run as BrandCharacterSynthesisRun | null) ?? null);
    } finally {
      setBusy(false);
    }
  };

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Character Artifact Proofs are NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <p className="site00-project-lore-calibration__kicker">CHARACTER VISUALIZATION</p>
            <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
            <p className="site00-project-lore-calibration__headline">CHARACTER ARTIFACT PROOFS</p>
            <Link to={site00ProjectBrandCharacterSynthesisPath(projectSlug)}>← SYNTHESIS</Link>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          {loading ? (
            <p>Loading artifact proofs…</p>
          ) : (
            <>
              {!run?.artifactProofs.length && (
                <section className="site00-experiment-g__panel">
                  <p>Formulate three sibling proof scenarios from the approved character system.</p>
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy || !run?.characterSystem} onClick={() => void formulate()}>
                    FORMULATE THREE PROOFS
                  </button>
                </section>
              )}

              {run?.artifactProofs.map((proof) => (
                <section key={proof.id} className="site00-experiment-g__card">
                  <h3>{proof.scenarioLabel}</h3>
                  <p>
                    <strong>What happened:</strong> {proof.situation}
                  </p>
                  <p>
                    <strong>What NDX noticed:</strong> {proof.whatNDXNoticed}
                  </p>
                  <p>
                    <strong>What NDX did:</strong> {proof.whatNDXDid}
                  </p>
                  <p>
                    <strong>Traces:</strong> {proof.traces.map((t) => t.traceClass.replace(/_/g, ' ')).join(', ')}
                  </p>
                  {proof.asset?.publicUrl && (
                    <p>
                      <a href={proof.asset.publicUrl} target="_blank" rel="noreferrer">
                        View generated asset
                      </a>
                    </p>
                  )}
                  <button type="button" className="site00-btn" disabled={busy} onClick={() => void generate(proof.id)}>
                    {proof.asset?.status === 'GENERATED' ? 'REGENERATE PROOF' : 'GENERATE VISUAL PROOF'}
                  </button>
                </section>
              ))}
            </>
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
