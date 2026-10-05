import { useCallback, useState } from 'react';
import { CANONICAL_NDXBOOK_DIRECTION_NAMES } from '../../../../shared/site00-brand-lore/canonicalCreativeRangeConstants';
import type { ExperienceExpressionRun } from '../../../../shared/site00-brand-lore/experienceExpression/types';
import { buildWorldFormationReadinessArchitecture, WORLD_FORMATION_IMPLEMENTED } from '../../../../shared/site00-brand-lore/worldFormation/futureContracts.js';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';

type ExperimentEExperienceExpressionReviewProps = {
  projectSlug: string;
  run: ExperienceExpressionRun | null;
  onUpdate: () => void;
};

function formatError(err: unknown): string {
  const raw = err instanceof Error ? err.message : 'Unable to run Experiment E';
  return raw;
}

export function ExperimentEExperienceExpressionReview({
  projectSlug,
  run,
  onUpdate,
}: ExperimentEExperienceExpressionReviewProps) {
  const [activeIndex, setActiveIndex] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const act = useCallback(
    async (fn: () => Promise<unknown>) => {
      setBusy(true);
      setError(null);
      try {
        await fn();
        onUpdate();
      } catch (err) {
        setError(formatError(err));
      } finally {
        setBusy(false);
      }
    },
    [onUpdate],
  );

  if (!run) {
    return (
      <section className="site00-experiment-e" aria-label="Experiment E experience expression">
        <p className="site00-experiment-e__experiment">EXPERIMENT E — EXPERIENCE EXPRESSION</p>
        <h3 className="site00-experiment-e__title">INTERACTIVE EXPERIENCE DIRECTION</h3>
        <p className="site00-experiment-e__meta">Initializing readiness…</p>
        {error ? <p className="site00-experiment-e__error" role="alert">{error}</p> : null}
      </section>
    );
  }

  const concept = run.experienceConcepts.find((c) => c.conceptIndex === activeIndex);
  const bible = concept
    ? run.experienceBibles.find((b) => b.experienceConceptId === concept.experienceConceptId)
    : null;
  const conceptAssets = run.visualAssets.filter((a) => a.experienceConceptId === concept?.experienceConceptId);
  const worldReadiness = buildWorldFormationReadinessArchitecture();
  const isWorkbenchConcept = concept?.name === 'THE ACTIVE WORKBENCH';

  return (
    <section className="site00-experiment-e" aria-label="Experiment E experience expression">
      <p className="site00-experiment-e__experiment">EXPERIMENT E — EXPERIENCE EXPRESSION</p>
      <h3 className="site00-experiment-e__title">{run.methodologyVersion.replace(/_/g, ' ')}</h3>
      <p className="site00-experiment-e__meta">
        Intelligence snapshot v{run.intelligenceSnapshotVersion}
        {run.experimentSnapshot ? ` · fingerprint ${run.experimentSnapshot.fingerprint}` : ''}
        · Founder Creative Appetite{' '}
        {run.readiness.appetiteIncluded ? 'included' : 'excluded'} ({run.readiness.appetiteAvailable ? 'available' : 'partial'})
      </p>
      <p className="site00-experiment-e__meta">Readiness: {run.readiness.state.replace(/_/g, ' ')}</p>
      <p className="site00-experiment-e__meta">
        Cross-medium Concept Territory status: {run.readiness.crossMediumEvidenceStatus.replace(/_/g, ' ')}
        · {run.crossMediumEvidence.length} Experiment D evidence records (medium-specific — not Experience Concepts)
      </p>

      <details className="site00-experiment-e__canon">
        <summary>EXPERIMENT E SNAPSHOT</summary>
        <p>
          {run.experimentSnapshot
            ? `${run.experimentSnapshot.inputs.filter((i) => i.included).length} inputs included · compiled ${run.experimentSnapshot.compiledAt}`
            : 'Not compiled'}
        </p>
      </details>

      <details className="site00-experiment-e__canon">
        <summary>OPTIONAL — PROMOTE CROSS-MEDIUM EVIDENCE</summary>
        <p className="site00-experiment-e__meta">
          Creative Concept Territories are provenance evidence only — not required for Experience Concept formation.
        </p>
        <div className="site00-experiment-e__territory-select">
          {CANONICAL_NDXBOOK_DIRECTION_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              disabled={busy}
              onClick={() =>
                void act(() => site00ProjectsApi.experimentESelectTerritory(projectSlug, { directionName: name }))
              }
            >
              PROMOTE {name}
            </button>
          ))}
        </div>
        {run.experienceTestTerritoryName ? (
          <p>Promoted evidence: {run.experienceTestTerritoryName} · {run.selectionPurpose}</p>
        ) : null}
      </details>

      <details className="site00-experiment-e__canon">
        <summary>FUNCTIONAL CANON</summary>
        <p>{run.functionalCanon?.routes.length ?? 0} routes · {run.functionalCanon?.actions.length ?? 0} actions</p>
      </details>
      <details className="site00-experiment-e__canon">
        <summary>HOST CANON</summary>
        <p>{run.hostCanon?.hostUiTypography}</p>
      </details>
      <details className="site00-experiment-e__canon">
        <summary>CLIENT EXPERIENCE CANON</summary>
        <p>{run.clientCanon?.traits.length ?? 0} traits with provenance</p>
      </details>
      <details className="site00-experiment-e__canon">
        <summary>CURRENT EXPERIENCE AUDIT</summary>
        <p>{run.currentExperienceAudit?.overallResemblance ?? run.templateAudit?.overallResemblance} — {(run.currentExperienceAudit ?? run.templateAudit)?.primaryIssues[0]}</p>
      </details>

      <p className="site00-experiment-e__meta" role="status">
        CONCEPT REVIEW ≠ VISUAL REVIEW — no images generate from opening this page.
      </p>

      {error ? <p className="site00-experiment-e__error" role="alert">{error}</p> : null}

      <div className="site00-experiment-e__controls">
        {run.readiness.state === 'READY_FOR_EXPERIENCE_FORMATION' && run.experienceConcepts.length === 0 ? (
          <button type="button" disabled={busy} onClick={() => void act(() => site00ProjectsApi.experimentEFormConcepts(projectSlug))}>
            FORM THREE EXPERIENCE CONCEPTS
          </button>
        ) : null}
        {run.visualGenerationReady ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void act(() => site00ProjectsApi.experimentEGenerateVisuals(projectSlug, { conceptIndex: activeIndex }))
              }
            >
              APPROVE FOR VISUAL DEVELOPMENT — THIS CONCEPT (8 frames)
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void act(() => site00ProjectsApi.experimentEGenerateVisuals(projectSlug, { allConcepts: true }))}
            >
              APPROVE ALL 3 CONCEPTS (24 max)
            </button>
          </>
        ) : null}
      </div>

      {run.distinctiveness ? (
        <p className="site00-experiment-e__meta">
          Distinctiveness: {run.distinctiveness.result}
          {run.distinctiveness.conceptualCollapse ? ' — CONCEPTUAL COLLAPSE reported' : ''}
          {run.distinctiveness.cousinPairs.length
            ? ` · Cousin pairs: ${run.distinctiveness.cousinPairs.map((p) => `${p.conceptA}/${p.conceptB}`).join(', ')}`
            : ''}
        </p>
      ) : null}

      {run.experienceConcepts.length > 0 ? (
        <>
          <div className="site00-experiment-e__concept-tabs">
            {run.experienceConcepts.map((c) => (
              <button
                key={c.experienceConceptId}
                type="button"
                className={c.conceptIndex === activeIndex ? 'site00-experiment-e__tab-btn--active' : ''}
                onClick={() => setActiveIndex(c.conceptIndex)}
              >
                {String(c.conceptIndex).padStart(2, '0')} {c.name}
              </button>
            ))}
          </div>

          {concept ? (
            <article className="site00-experiment-e__card">
              <h4>{concept.name}</h4>
              <dl className="site00-experiment-e__concept">
                <div><dt>THESIS</dt><dd>{concept.centralThesis}</dd></div>
                <div><dt>METAPHOR</dt><dd>{concept.experienceMetaphor}</dd></div>
                <div><dt>VIEWER ROLE</dt><dd>{concept.viewerRole}</dd></div>
                <div><dt>INFORMATION BEHAVIOR</dt><dd>{concept.informationBehavior}</dd></div>
                <div><dt>INTERACTION GRAMMAR</dt><dd>{concept.interactionGrammar}</dd></div>
                <div><dt>NAVIGATION</dt><dd>{concept.navigationBehavior}</dd></div>
                <div><dt>RESPONSIVE</dt><dd>{concept.responsivePhilosophy}</dd></div>
                <div><dt>HOST / CLIENT</dt><dd>{concept.hostClientRelationship}</dd></div>
                <div><dt>EVIDENCE</dt><dd>{concept.evidenceReferences.join(', ')}</dd></div>
                <div><dt>FEASIBILITY</dt><dd>{concept.implementationFeasibility}</dd></div>
              </dl>

              {bible ? (
                <details className="site00-experiment-e__canon">
                  <summary>EXPERIENCE BIBLE</summary>
                  <p>{bible.experienceThesis}</p>
                  <p>{bible.interactionGrammar}</p>
                  <p>Host typography: {bible.typographyBehavior.hostUiTypography}</p>
                  <p>Client typography: {bible.typographyBehavior.clientExpressiveTypography}</p>
                </details>
              ) : null}

              <div className="site00-experiment-e__judgment">
                {(['LOVE_THE_EXPERIENCE', 'PROMISING_EXPLORE', 'NOT_FOR_THIS_PROJECT'] as const).map((j) => (
                  <button
                    key={j}
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void act(() =>
                        site00ProjectsApi.experimentEConceptJudgment(projectSlug, concept.conceptIndex, j),
                      )
                    }
                  >
                    {j.replace(/_/g, ' ')}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void act(() => site00ProjectsApi.experimentECompileContract(projectSlug, concept.conceptIndex))
                  }
                >
                  COMPILE IMPLEMENTATION CONTRACT
                </button>
              </div>

              {conceptAssets.length > 0 ? (
                <div className="site00-experiment-e__visual-grid">
                  {conceptAssets.map((a) => (
                    <figure key={a.assetId}>
                      <figcaption>
                        {a.deviceClass} · {a.surfaceType.replace(/_/g, ' ')}
                      </figcaption>
                      <p>{a.storagePath ?? 'pending'}</p>
                    </figure>
                  ))}
                </div>
              ) : null}

              {run.experienceConcepts.length > 0 ? (
                <details className="site00-experiment-e__canon">
                  <summary>EXPERIENCE ASSET DIRECTION</summary>
                  {run.assetDirection && run.assetDirection.experienceConceptId === concept?.experienceConceptId ? (
                    <>
                      <p>{run.assetDirection.revisedDirectionLabel ?? run.assetDirection.interactionMetaphor}</p>
                      <p>{run.assetDirection.structuralSophistication}</p>
                      <p>Families: {run.assetDirection.derivedAssetFamilies.join(', ')}</p>
                      {run.assetDirection.literalImageryBlocked.length ? (
                        <p>Blocked: {run.assetDirection.literalImageryBlocked.join(', ')}</p>
                      ) : null}
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void act(() => site00ProjectsApi.experimentECompileAssetDirection(projectSlug, activeIndex))
                      }
                    >
                      COMPILE ASSET DIRECTION
                    </button>
                  )}
                </details>
              ) : null}

              {run.experienceConcepts.length > 0 ? (
                <details className="site00-experiment-e__canon">
                  <summary>EXPERIENCE ASSET MANIFEST</summary>
                  {run.assetManifest && run.assetManifest.experienceConceptId === concept?.experienceConceptId ? (
                    <>
                      <p>
                        {run.assetManifest.summary.totalRequirements} requirements ·{' '}
                        {run.assetManifest.summary.requiredCount} required · fingerprint{' '}
                        {run.assetManifest.manifestFingerprint}
                      </p>
                      <p>Families: {run.assetManifest.summary.assetFamilies.join(', ')}</p>
                      <p>
                        Visual development: {run.assetManifest.summary.visualDevelopmentOnly} · Production eligible:{' '}
                        {run.assetManifest.summary.productionEligible}
                      </p>
                      <p>Est. cost: ${run.assetManifest.summary.generationBudgetEstimateUsd.toFixed(2)}</p>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void act(() => site00ProjectsApi.experimentECompileAssetManifest(projectSlug, activeIndex))
                      }
                    >
                      COMPILE ASSET MANIFEST
                    </button>
                  )}
                </details>
              ) : null}

              {run.assetManifestCompiled && isWorkbenchConcept ? (
                <div className="site00-experiment-e__controls">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void act(() =>
                        site00ProjectsApi.experimentEGenerateAssetVisuals(projectSlug, {
                          conceptIndex: activeIndex,
                          action: 'GENERATE_VISUAL_DEVELOPMENT',
                        }),
                      )
                    }
                  >
                    GENERATE VISUAL DEVELOPMENT (FOUNDER TRIGGER)
                  </button>
                </div>
              ) : null}

              {run.productionAssets.length > 0 ? (
                <details className="site00-experiment-e__canon">
                  <summary>PRODUCTION ASSET STATUS · VAULT LINKAGE</summary>
                  {run.productionAssets
                    .filter((a) => run.assetRequirements.some((r) => r.id === a.requirementId && r.experienceConceptId === concept?.experienceConceptId))
                    .map((a) => (
                      <div key={a.assetId}>
                        <p>
                          {a.assetId} · {a.productionState} · {a.provenanceClass}
                          {a.vaultAssetId ? ` · vault ${a.vaultAssetId}` : ''}
                        </p>
                        {a.productionState === 'VISUAL_DEVELOPMENT' ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void act(() => site00ProjectsApi.experimentEPromoteAsset(projectSlug, a.assetId))}
                          >
                            PROMOTE TO PRODUCTION
                          </button>
                        ) : null}
                      </div>
                    ))}
                </details>
              ) : null}

              {run.accounting ? (
                <p className="site00-experiment-e__meta">
                  Generation cost: ${run.accounting.estimatedCostUsd.toFixed(3)} · FAL requests:{' '}
                  {run.accounting.falRequests ?? 0}
                </p>
              ) : null}
            </article>
          ) : null}
        </>
      ) : null}

      {run.implementationContract ? (
        <details className="site00-experiment-e__canon">
          <summary>IMPLEMENTATION CONTRACT (no auto-implement)</summary>
          <p>{run.implementationContract.contractId}</p>
          <p>Status: {run.implementationContract.implementationStatus}</p>
          {run.implementationContract.missingRequiredAssets.length ? (
            <p>Missing assets: {run.implementationContract.missingRequiredAssets.join(' · ')}</p>
          ) : null}
          <p>{run.implementationContract.acceptanceCriteria.join(' · ')}</p>
          <p>Asset bindings: {run.implementationContract.assetBindings.length}</p>
        </details>
      ) : null}

      <details className="site00-experiment-e__canon">
        <summary>WORLD FORMATION READINESS — NOT IMPLEMENTED</summary>
        <p>WORLD FORMATION: {WORLD_FORMATION_IMPLEMENTED ? 'IMPLEMENTED' : 'NOT IMPLEMENTED'}</p>
        <p>Methodology: {worldReadiness.methodologyVersion}</p>
        <p>Pipeline stages: {worldReadiness.pipelineStages.length}</p>
        <p>World generation count: {worldReadiness.worldAssetManifest.generationCount}</p>
        <p>Contamination guards: {worldReadiness.premise.antiWorldDirection.length} forbidden defaults</p>
      </details>
    </section>
  );
}
