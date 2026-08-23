import { useCallback, useEffect, useState } from 'react';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';
import type {
  ProjectWorkspaceVisualDevelopmentRun,
  SurfaceDesignProof,
} from '../../../../shared/site00-brand-lore/experienceExpression/designProofTypes.js';
import '../../styles/site00-visual-development.css';

type ProofPanelProps = {
  proof: SurfaceDesignProof;
  title: string;
  onGenerate: () => Promise<void>;
  onJudgment: (judgment: 'LOVE_THE_DIRECTION' | 'PROMISING_REVISE' | 'NOT_THE_DIRECTION') => Promise<void>;
  onPrepare: () => Promise<void>;
  onOrchestrate: () => Promise<void>;
  busy: boolean;
};

function ProofPanel({ proof, title, onGenerate, onJudgment, onPrepare, onOrchestrate, busy }: ProofPanelProps) {
  const [showDetails, setShowDetails] = useState(false);
  const manifest = proof.manifest;
  const composed = proof.composedProof;
  const approved = proof.lifecycle === 'APPROVED_FOR_IMPLEMENTATION' || proof.lifecycle === 'IMPLEMENTATION_CONTRACT_READY';

  return (
    <section className="site00-vd-proof" aria-label={title}>
      <header className="site00-vd-proof__header">
        <h2 className="site00-vd-proof__title">{title}</h2>
        <p className="site00-vd-proof__status">
          Status: <strong>{proof.lifecycle.replace(/_/g, ' ')}</strong>
        </p>
      </header>

      {manifest ? (
        <div className="site00-vd-proof__cost">
          <p>
            Expected: {manifest.expectedFalCalls} FAL assets · ${manifest.estimatedCostUsd.toFixed(2)} estimated
          </p>
          <p>
            Reusable: {manifest.reusableAssetCount} · Missing: {manifest.missingAssetCount}
          </p>
        </div>
      ) : null}

      {!composed ? (
        <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void onGenerate()}>
          GENERATE DESIGN PROOF
        </button>
      ) : (
        <div className="site00-vd-proof__image-wrap">
          {composed.publicUrl ? (
            <img
              src={composed.publicUrl}
              alt={`${title} design proof`}
              className="site00-vd-proof__image"
            />
          ) : (
            <p className="site00-vd-proof__path">Proof stored: {composed.storagePath}</p>
          )}
        </div>
      )}

      {proof.generationError ? (
        <p className="site00-vd-proof__error">GENERATION_FAILED — {proof.generationError}</p>
      ) : null}

      {composed ? (
        <div className="site00-vd-proof__judgment">
          <button type="button" className="site00-btn" disabled={busy} onClick={() => void onJudgment('LOVE_THE_DIRECTION')}>
            LOVE THE DIRECTION
          </button>
          <button type="button" className="site00-btn" disabled={busy} onClick={() => void onJudgment('PROMISING_REVISE')}>
            PROMISING — REVISE
          </button>
          <button type="button" className="site00-btn" disabled={busy} onClick={() => void onJudgment('NOT_THE_DIRECTION')}>
            NOT THE DIRECTION
          </button>
        </div>
      ) : null}

      {approved ? (
        <div className="site00-vd-proof__implementation">
          <p className="site00-vd-proof__approved">APPROVED FOR IMPLEMENTATION</p>
          {proof.lifecycle === 'APPROVED_FOR_IMPLEMENTATION' ? (
            <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void onPrepare()}>
              PREPARE IMPLEMENTATION
            </button>
          ) : null}
          {proof.lifecycle === 'IMPLEMENTATION_CONTRACT_READY' ? (
            <>
              <p>IMPLEMENTATION CONTRACT READY</p>
              <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void onOrchestrate()}>
                ORCHESTRATE IMPLEMENTATION
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      <button type="button" className="site00-vd-proof__details-toggle" onClick={() => setShowDetails((v) => !v)}>
        {showDetails ? 'HIDE DETAILS' : 'VIEW ART DIRECTION / MANIFEST / RECEIPTS'}
      </button>

      {showDetails ? (
        <div className="site00-vd-proof__details">
          <pre className="site00-vd-proof__pre">{JSON.stringify(proof.artDirection, null, 2)}</pre>
          {manifest ? <pre className="site00-vd-proof__pre">{JSON.stringify(manifest, null, 2)}</pre> : null}
          {proof.generationReceipts.length > 0 ? (
            <pre className="site00-vd-proof__pre">{JSON.stringify(proof.generationReceipts, null, 2)}</pre>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

type ProjectWorkspaceVisualDevelopmentReviewProps = {
  projectSlug: string;
};

export function ProjectWorkspaceVisualDevelopmentReview({ projectSlug }: ProjectWorkspaceVisualDevelopmentReviewProps) {
  const [run, setRun] = useState<ProjectWorkspaceVisualDevelopmentRun | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const res = await site00ProjectsApi.visualDevelopmentGet(projectSlug);
    setRun((res.run as ProjectWorkspaceVisualDevelopmentRun | null) ?? null);
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const wrap = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      await reload();
    } finally {
      setBusy(false);
    }
  };

  if (!run) {
    return <p className="site00-vd__loading">Loading visual development…</p>;
  }

  return (
    <div className="site00-vd">
      <header className="site00-vd__header">
        <p className="site00-label-red">EXPERIMENT E</p>
        <h1 className="site00-vd__title">PROJECT WORKSPACE VISUAL DEVELOPMENT</h1>
        <p className="site00-vd__sub">Control / review surface — not the production page.</p>
      </header>

      <ProofPanel
        title="PROOF 01 — SITE 00 PROJECTS INDEX"
        proof={run.proofs.site00ProjectsIndex}
        busy={busy}
        onGenerate={() =>
          wrap(async () => {
            await site00ProjectsApi.visualDevelopmentGenerate(projectSlug, 'SITE00_PROJECTS_INDEX');
          })
        }
        onJudgment={(judgment) =>
          wrap(async () => {
            await site00ProjectsApi.visualDevelopmentJudgment(projectSlug, 'SITE00_PROJECTS_INDEX', judgment);
          })
        }
        onPrepare={() =>
          wrap(async () => {
            await site00ProjectsApi.visualDevelopmentPrepareImplementation(projectSlug, 'SITE00_PROJECTS_INDEX');
          })
        }
        onOrchestrate={() =>
          wrap(async () => {
            await site00ProjectsApi.visualDevelopmentOrchestrate(projectSlug, 'SITE00_PROJECTS_INDEX');
          })
        }
      />

      <ProofPanel
        title="PROOF 02 — NDXBOOK PROJECT HOME"
        proof={run.proofs.ndxbookProjectHome}
        busy={busy}
        onGenerate={() =>
          wrap(async () => {
            await site00ProjectsApi.visualDevelopmentGenerate(projectSlug, 'NDXBOOK_PROJECT_HOME');
          })
        }
        onJudgment={(judgment) =>
          wrap(async () => {
            await site00ProjectsApi.visualDevelopmentJudgment(projectSlug, 'NDXBOOK_PROJECT_HOME', judgment);
          })
        }
        onPrepare={() =>
          wrap(async () => {
            await site00ProjectsApi.visualDevelopmentPrepareImplementation(projectSlug, 'NDXBOOK_PROJECT_HOME');
          })
        }
        onOrchestrate={() =>
          wrap(async () => {
            await site00ProjectsApi.visualDevelopmentOrchestrate(projectSlug, 'NDXBOOK_PROJECT_HOME');
          })
        }
      />
    </div>
  );
}
