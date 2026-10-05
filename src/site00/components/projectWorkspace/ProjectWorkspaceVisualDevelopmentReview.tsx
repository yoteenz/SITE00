import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';
import { SITE00_ADMIN_ROUTES } from '../../admin/config/routes';
import type {
  ProjectWorkspaceVisualDevelopmentRun,
  SurfaceDesignProof,
} from '../../../../shared/site00-brand-lore/experienceExpression/designProofTypes.js';
import type { VisualReferencePackage } from '../../../../shared/site00-visual-reference/types.js';
import '../../styles/site00-visual-development.css';

type ProofPanelProps = {
  proof: SurfaceDesignProof;
  title: string;
  projectSlug: string;
  showReferenceIntelligence?: boolean;
  onGenerate: () => Promise<void>;
  onGenerateReferenceConditioned?: () => Promise<void>;
  onRefreshReferences?: () => Promise<void>;
  onCompileReferences?: () => Promise<void>;
  onExcludeReference?: (referenceId: string) => Promise<void>;
  onPrepareInterface?: () => Promise<void>;
  onGenerateMissingAssets?: () => Promise<void>;
  onJudgment: (judgment: 'LOVE_THE_DIRECTION' | 'PROMISING_REVISE' | 'NOT_THE_DIRECTION') => Promise<void>;
  onPrepare: () => Promise<void>;
  onOrchestrate: () => Promise<void>;
  busy: boolean;
};

function ReferenceThumbnail({ entry }: { entry: VisualReferencePackage['references'][0] }) {
  const [loadFailed, setLoadFailed] = useState(false);
  const displayable =
    !loadFailed &&
    entry.publicUrl &&
    !/vitest\.local|localhost|127\.0\.0\.1/i.test(entry.publicUrl);

  return (
    <div className="site00-vd-ref">
      {displayable ? (
        <img
          src={entry.publicUrl!}
          alt={entry.label}
          className="site00-vd-ref__thumb"
          loading="lazy"
          decoding="async"
          onError={() => setLoadFailed(true)}
        />
      ) : (
        <div className="site00-vd-ref__placeholder">
          {entry.storagePath.split('/').pop()}
          <span className="site00-vd-ref__placeholder-note">
            {loadFailed ? 'THUMBNAIL LOAD FAILED' : 'CAPTURE REQUIRED'}
          </span>
        </div>
      )}
      <p className="site00-vd-ref__label">{entry.label}</p>
      <p className="site00-vd-ref__why">{entry.whyIncluded}</p>
    </div>
  );
}

function ReferenceIntelligencePanel({
  proof,
  onRefreshReferences,
  onCompileReferences,
  onExcludeReference,
  busy,
}: {
  proof: SurfaceDesignProof;
  onRefreshReferences?: () => Promise<void>;
  onCompileReferences?: () => Promise<void>;
  onExcludeReference?: (referenceId: string) => Promise<void>;
  busy: boolean;
}) {
  const pkg = proof.referencePackage;
  return (
    <section className="site00-vd-refs" aria-label="Visual Reference Intelligence">
      <h3 className="site00-vd-refs__title">VISUAL REFERENCE INTELLIGENCE</h3>
      <p className="site00-vd-refs__sub">HOST REFERENCES — automated selection; manual upload not required for SITE 00 routes.</p>

      <div className="site00-vd-refs__actions">
        {onRefreshReferences ? (
          <button type="button" className="site00-btn" disabled={busy} onClick={() => void onRefreshReferences()}>
            REFRESH VISUAL REFERENCES
          </button>
        ) : null}
        {onCompileReferences ? (
          <button type="button" className="site00-btn" disabled={busy} onClick={() => void onCompileReferences()}>
            COMPILE REFERENCE PACKAGE
          </button>
        ) : null}
      </div>

      {pkg ? (
        <>
          <p className="site00-vd-refs__status">
            REFERENCE PACKAGE <strong>{proof.lifecycle === 'GENERATION_READY' ? 'READY' : proof.lifecycle.replace(/_/g, ' ')}</strong>
            {' · '}
            Mode: {(pkg.generationMode ?? 'UNKNOWN').replace(/_/g, ' ')}
            {' · '}
            Fingerprint: {pkg.fingerprint}
          </p>
          <div className="site00-vd-refs__grid">
            {pkg.references.map((ref) => (
              <div key={ref.referenceId} className="site00-vd-ref-wrap">
                <ReferenceThumbnail entry={ref} />
                {onExcludeReference ? (
                  <button
                    type="button"
                    className="site00-btn site00-btn--small"
                    disabled={busy}
                    onClick={() => void onExcludeReference(ref.referenceId)}
                  >
                    EXCLUDE
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="site00-vd-refs__empty">Compile reference package to preview selected host references.</p>
      )}

      {proof.proofLineage && proof.proofLineage.length > 0 ? (
        <div className="site00-vd-refs__lineage">
          <h4>A/B METHODOLOGY LINEAGE</h4>
          <ul>
            {proof.proofLineage.map((entry) => (
              <li key={entry.proofRecordId}>
                {entry.proofLabel ?? 'PROOF'} — {entry.revisionReason ?? 'baseline'}
                {entry.referencePackageFingerprint ? ` · ref fp: ${entry.referencePackageFingerprint}` : ''}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function ProofPanel({
  proof,
  title,
  showReferenceIntelligence,
  onGenerate,
  onGenerateReferenceConditioned,
  onRefreshReferences,
  onCompileReferences,
  onExcludeReference,
  onPrepareInterface,
  onGenerateMissingAssets,
  onJudgment,
  onPrepare,
  onOrchestrate,
  busy,
}: ProofPanelProps) {
  const [showDetails, setShowDetails] = useState(false);
  const manifest = proof.manifest;
  const composed = proof.composedProof;
  const approved = proof.lifecycle === 'APPROVED_FOR_IMPLEMENTATION' || proof.lifecycle === 'IMPLEMENTATION_CONTRACT_READY';
  const hasProofA = proof.proofLabel === 'PROOF_A' || (composed && !proof.referenceConditioned);
  const canGenerateReferenceConditioned = hasProofA && composed && onGenerateReferenceConditioned;

  const composedInterface = proof.surfaceGenerationMode === 'COMPOSED_INTERFACE';
  const interfaceManifest = proof.interfaceAssetManifest;
  const assetsReady = proof.generatedAssets.length > 0 && !composed;

  return (
    <section className="site00-vd-proof" aria-label={title}>
      <header className="site00-vd-proof__header">
        <h2 className="site00-vd-proof__title">{title}</h2>
        <p className="site00-vd-proof__status">
          Status: <strong>{proof.lifecycle.replace(/_/g, ' ')}</strong>
          {' · '}
          Surface mode: <strong>{(proof.surfaceGenerationMode ?? 'UNKNOWN').replace(/_/g, ' ')}</strong>
          {' · '}
          Reference status: <strong>{(proof.referencePipelineStatus ?? 'NOT_STARTED').replace(/_/g, ' ')}</strong>
          {proof.proofLabel ? (
            <>
              {' '}
              · <strong>{proof.proofLabel}</strong>
            </>
          ) : null}
          {proof.revisionReason ? <> · {proof.revisionReason.replace(/_/g, ' ')}</> : null}
        </p>
      </header>

      {showReferenceIntelligence ? (
        <ReferenceIntelligencePanel
          proof={proof}
          onRefreshReferences={onRefreshReferences}
          onCompileReferences={onCompileReferences}
          onExcludeReference={onExcludeReference}
          busy={busy}
        />
      ) : null}

      {manifest ? (
        <div className="site00-vd-proof__cost">
          <p>
            Expected: {manifest.expectedFalCalls} FAL assets · ${(manifest.estimatedCostUsd ?? 0).toFixed(2)} estimated
          </p>
          <p>
            Reusable: {manifest.reusableAssetCount} · Missing: {manifest.missingAssetCount}
          </p>
        </div>
      ) : null}

      {composedInterface ? (
        <div className="site00-vd-proof__composed-interface">
          <p>
            FULL-PAGE IMAGE GENERATION: <strong>NOT REQUIRED</strong> — Composer assembles the live interface from host
            references + purpose-resolved visual material.
          </p>
          {proof.authenticatedReferenceStatus.length > 0 ? (
            <div className="site00-vd-proof__auth-refs">
              <p className="site00-vd-proof__auth-refs-title">AUTHENTICATED REFERENCE STATUS</p>
              <ul>
                {proof.authenticatedReferenceStatus.map((status) => (
                  <li key={`${status.route}-${status.viewportClass}`}>
                    PROJECTS {status.viewportClass}: <strong>{status.status}</strong>
                    {status.surfaceIdentity ? ` · ${status.surfaceIdentity}` : ''}
                  </li>
                ))}
              </ul>
              {proof.authenticatedReferenceStatus.some((s) => s.status !== 'VALID') ? (
                <p className="site00-vd-proof__auth-refs-help">
                  <Link to={SITE00_ADMIN_ROUTES.captureAuthBootstrapControl}>
                    Export capture auth for Railway (phone) →
                  </Link>
                </p>
              ) : null}
            </div>
          ) : null}
          {interfaceManifest ? (
            <p>
              VISUAL SLOTS: {interfaceManifest.requirements.length} · FOUND: {interfaceManifest.foundCount ?? interfaceManifest.reusableCount} ·
              ELIGIBLE: {interfaceManifest.eligibleCount ?? interfaceManifest.reusableCount} · REVIEW REQUIRED:{' '}
              {interfaceManifest.reviewRequiredCount ?? 0} · REJECTED: {interfaceManifest.rejectedCount ?? 0} · MISSING
              TRUE ASSETS: {interfaceManifest.missingCount} · GENERATION REQUIRED: {interfaceManifest.generationRequiredCount}
            </p>
          ) : null}
          {proof.interfaceSlotResolution ? (
            <div className="site00-vd-proof__slot-resolution">
              <p className="site00-vd-proof__assets-title">RESOLVED VISUAL MATERIAL</p>
              <ul>
                {proof.interfaceSlotResolution.resolved.map((material) => {
                  const slot = proof.interfaceSlotResolution!.slots.find((s) => s.slotId === material.slotId);
                  return (
                    <li key={material.slotId}>
                      {slot?.semanticRole ?? material.slotId} — {material.status}
                      {material.projectSlug ? ` · ${material.projectSlug}` : ''}
                      {material.generationRequired && material.generationJustification
                        ? ` · WHY GENERATE: ${material.generationJustification.whyAssetNeeded}`
                        : ''}
                      {material.publicUrl ? (
                        <>
                          {' '}
                          — <a href={material.publicUrl}>preview</a>
                        </>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              {proof.interfaceSlotResolution.obsoleteGeneratedAssets.length > 0 ? (
                <p>
                  REJECTED / INELIGIBLE (preserved):{' '}
                  {proof.interfaceSlotResolution.obsoleteGeneratedAssets.map((a) => a.requirementId).join(', ')}
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="site00-vd-proof__generate">
            {onPrepareInterface ? (
              <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void onPrepareInterface()}>
                CAPTURE / REFRESH REFERENCES + PREPARE INTERFACE
              </button>
            ) : null}
            {onGenerateMissingAssets ? (
              <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void onGenerateMissingAssets()}>
                GENERATE MISSING ASSETS
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {!composedInterface && !composed ? (
        <div className="site00-vd-proof__generate">
          <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void onGenerate()}>
            GENERATE DESIGN PROOF
          </button>
          {proof.referencePackage && onGenerateReferenceConditioned ? (
            <button
              type="button"
              className="site00-btn site00-btn--primary"
              disabled={busy}
              onClick={() => void onGenerateReferenceConditioned()}
            >
              GENERATE NEW DESIGN PROOF
            </button>
          ) : null}
        </div>
      ) : null}

      {composedInterface && (assetsReady || (proof.interfaceSlotResolution?.summary.generationRequired ?? 0) === 0) ? (
        <div className="site00-vd-proof__assets">
          <p className="site00-vd-proof__assets-title">GENERATED ASSETS (PURPOSE-BUILT ONLY)</p>
          <ul>
            {proof.generatedAssets.map((asset) => (
              <li key={asset.requirementId}>
                {asset.assetRole}
                {asset.publicUrl ? (
                  <>
                    {' '}
                    — <a href={asset.publicUrl}>preview</a>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {composed && !composedInterface ? (
        <div className="site00-vd-proof__image-wrap">
          {composed.publicUrl ? (
            <img src={composed.publicUrl} alt={`${title} design proof`} className="site00-vd-proof__image" />
          ) : (
            <p className="site00-vd-proof__path">Proof stored: {composed.storagePath}</p>
          )}
        </div>
      ) : null}

      {canGenerateReferenceConditioned && !composedInterface ? (
        <div className="site00-vd-proof__generate">
          <p className="site00-vd-proof__ab-note">
            PREVIOUS PROOF (Proof A — textual host canon) preserved. Generate reference-conditioned Proof B below.
          </p>
          <button
            type="button"
            className="site00-btn site00-btn--primary"
            disabled={busy}
            onClick={() => void onGenerateReferenceConditioned!()}
          >
            GENERATE REFERENCE-CONDITIONED PROOF
          </button>
        </div>
      ) : null}

      {proof.generationError ? (
        <div className="site00-vd-proof__error-wrap">
          <p className="site00-vd-proof__error" role="alert">GENERATION_FAILED — {proof.generationError}</p>
          {proof.generationReceipts?.some((r) => r.status === 'FAILED') ? (
            <ul className="site00-vd-proof__error-list">
              {proof.generationReceipts
                .filter((r) => r.status === 'FAILED')
                .map((r) => (
                  <li key={r.receiptId}>
                    {r.requirementId}: {r.error ?? 'Unknown error'}
                  </li>
                ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {composed || (composedInterface && assetsReady) ? (
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
          {proof.referencePackage ? (
            <pre className="site00-vd-proof__pre">{JSON.stringify(proof.referencePackage, null, 2)}</pre>
          ) : null}
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const res = await site00ProjectsApi.visualDevelopmentGet(projectSlug);
      const nextRun = (res.run as ProjectWorkspaceVisualDevelopmentRun | null) ?? null;
      setRun(nextRun);
      if (!nextRun) {
        setError('VISUAL DEVELOPMENT UNAVAILABLE — NO RUN PAYLOAD FROM SERVER.');
      }
    } catch (err) {
      setRun(null);
      setError(err instanceof Error ? err.message : 'FAILED TO LOAD VISUAL DEVELOPMENT.');
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    setLoading(true);
    void reload();
  }, [reload]);

  const wrap = async (fn: () => Promise<void>) => {
    setBusy(true);
    setActionError(null);
    try {
      await fn();
      await reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <p className="site00-vd__loading">Loading visual development…</p>;
  }

  if (error || !run) {
    return (
      <div className="site00-vd__error-panel" role="alert">
        <p className="site00-vd__error">{error ?? 'VISUAL DEVELOPMENT UNAVAILABLE.'}</p>
        <button type="button" className="site00-btn" onClick={() => void reload()}>
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className="site00-vd">
      <header className="site00-vd__header">
        <p className="site00-label-red">EXPERIMENT E</p>
        <h1 className="site00-vd__title">PROJECT WORKSPACE VISUAL DEVELOPMENT</h1>
        <p className="site00-vd__sub">
          Control / review surface — not the production page. Visual Reference Intelligence selects host references
          automatically; founder manual screenshot collection is not required.
        </p>
      </header>

      {actionError ? (
        <p className="site00-vd__action-error" role="alert">
          {actionError}
        </p>
      ) : null}

      <ProofPanel
        title="PROOF 01 — SITE 00 PROJECTS INDEX"
        proof={run.proofs.site00ProjectsIndex}
        projectSlug={projectSlug}
        showReferenceIntelligence
        busy={busy}
        onGenerate={() =>
          wrap(async () => {
            await site00ProjectsApi.visualDevelopmentGenerate(projectSlug, 'SITE00_PROJECTS_INDEX');
          })
        }
        onGenerateReferenceConditioned={() =>
          wrap(async () => {
            await site00ProjectsApi.visualDevelopmentCompileReferences(projectSlug, 'SITE00_PROJECTS_INDEX');
            await site00ProjectsApi.visualDevelopmentGenerateReferenceConditioned(projectSlug, 'SITE00_PROJECTS_INDEX');
          })
        }
        onRefreshReferences={() =>
          wrap(async () => {
            await site00ProjectsApi.visualDevelopmentRefreshReferences(projectSlug, 'SITE00_PROJECTS_INDEX');
          })
        }
        onCompileReferences={() =>
          wrap(async () => {
            await site00ProjectsApi.visualDevelopmentCompileReferences(projectSlug, 'SITE00_PROJECTS_INDEX');
          })
        }
        onExcludeReference={(referenceId) =>
          wrap(async () => {
            await site00ProjectsApi.visualDevelopmentExcludeReference(
              projectSlug,
              'SITE00_PROJECTS_INDEX',
              referenceId,
            );
            await site00ProjectsApi.visualDevelopmentCompileReferences(projectSlug, 'SITE00_PROJECTS_INDEX');
          })
        }
        onPrepareInterface={() =>
          wrap(async () => {
            await site00ProjectsApi.visualDevelopmentPrepareInterface(projectSlug, 'SITE00_PROJECTS_INDEX');
          })
        }
        onGenerateMissingAssets={() =>
          wrap(async () => {
            await site00ProjectsApi.visualDevelopmentGenerateAssets(projectSlug, 'SITE00_PROJECTS_INDEX');
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
        projectSlug={projectSlug}
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
