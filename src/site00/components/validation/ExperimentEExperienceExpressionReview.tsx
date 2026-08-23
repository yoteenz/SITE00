import { useCallback, useState } from 'react';
import { CANONICAL_NDXBOOK_DIRECTION_NAMES } from '../../../../shared/site00-brand-lore/canonicalCreativeRangeConstants';
import type { ExperienceExpressionRun } from '../../../../shared/site00-brand-lore/experienceExpression/types';
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
            </article>
          ) : null}
        </>
      ) : null}

      {run.implementationContract ? (
        <details className="site00-experiment-e__canon">
          <summary>IMPLEMENTATION CONTRACT (no auto-implement)</summary>
          <p>{run.implementationContract.contractId}</p>
          <p>{run.implementationContract.acceptanceCriteria.join(' · ')}</p>
        </details>
      ) : null}
    </section>
  );
}
