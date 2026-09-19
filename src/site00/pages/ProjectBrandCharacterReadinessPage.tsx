import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import {
  site00ProjectPath,
  site00ProjectBrandCharacterDeepeningPath,
  site00ProjectBrandCharacterFormationPath,
} from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { BrandCharacterReadinessEvaluation } from '../../../shared/site00-brand-lore/brandCharacterReadiness/types';
import '../styles/site00-replay-execution.css';

type ReadinessRecord = {
  latestEvaluation: BrandCharacterReadinessEvaluation | null;
  deepeningModule: { questions: unknown[] } | null;
};

function domainLabel(domain: string): string {
  return domain.replace(/_/g, ' ');
}

export default function ProjectBrandCharacterReadinessPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [record, setRecord] = useState<ReadinessRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (!hasProjectCapability(projectSlug, 'BRAND_CHARACTER')) return;
    try {
      const result = await site00ProjectsApi.experimentHReadinessGet(projectSlug);
      setRecord((result.record as ReadinessRecord | null) ?? null);
    } catch {
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const reEvaluate = async () => {
    setBusy(true);
    try {
      const result = await site00ProjectsApi.experimentHReadinessEvaluate(projectSlug);
      setRecord((result.record as ReadinessRecord | null) ?? null);
    } finally {
      setBusy(false);
    }
  };

  if (!hasProjectCapability(projectSlug, 'BRAND_CHARACTER')) {
    return (
      <EcosystemShell hidePageHeader>
        <p>Brand Character Readiness is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  const evaluation = record?.latestEvaluation;
  const questionCount = record?.deepeningModule?.questions.length ?? 0;
  const gapsRemainWithoutQuestions =
    questionCount === 0 &&
    evaluation?.overallState !== 'CHARACTER_READY' &&
    (evaluation?.gaps.length ?? 0) > 0;

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <p className="site00-project-lore-calibration__kicker">POST-PURCHASE INTELLIGENCE</p>
            <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
            <p className="site00-project-lore-calibration__headline">BRAND CHARACTER READINESS</p>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>
          <ProjectExperimentsHubNav projectSlug={projectSlug} />

          {loading ? (
            <p>Loading readiness evaluation…</p>
          ) : (
            <>
              <section className="site00-experiment-g__panel">
                <h2>OVERALL: {evaluation?.overallState.replace(/_/g, ' ') ?? 'NOT EVALUATED'}</h2>
                <p>{evaluation?.formationGateReason ?? 'Existing intelligence evaluated before any new questions.'}</p>
                <div className="site00-project-setup__actions">
                  <button type="button" className="site00-btn" disabled={busy} onClick={() => void reEvaluate()}>
                    RE-EVALUATE
                  </button>
                  {questionCount > 0 ? (
                    <Link to={site00ProjectBrandCharacterDeepeningPath(projectSlug)} className="site00-btn site00-btn--primary">
                      ANSWER {questionCount} QUESTION{questionCount === 1 ? '' : 'S'}
                    </Link>
                  ) : gapsRemainWithoutQuestions ? (
                    <Link to={site00ProjectBrandCharacterDeepeningPath(projectSlug)} className="site00-btn">
                      REVIEW EVIDENCE GAPS
                    </Link>
                  ) : evaluation?.overallState === 'CHARACTER_READY' ? (
                    <Link to={site00ProjectBrandCharacterFormationPath(projectSlug)} className="site00-btn site00-btn--primary">
                      CHARACTER FORMATION
                    </Link>
                  ) : null}
                </div>
              </section>

              {evaluation?.domains.map((domain) => (
                <section key={domain.domain} className="site00-experiment-g__card">
                  <h3>{domainLabel(domain.domain)}</h3>
                  <p>
                    <strong>Evidence:</strong> {domain.strength.replace(/_/g, ' ')}
                  </p>
                  {domain.whatWeKnow.length > 0 && (
                    <div>
                      <strong>What we already understand</strong>
                      <ul>
                        {domain.whatWeKnow.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {domain.whatRemainsUnclear.length > 0 && (
                    <div>
                      <strong>What still feels undefined</strong>
                      <ul>
                        {domain.whatRemainsUnclear.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p>
                    <strong>Why it matters:</strong> {domain.whyItMatters}
                  </p>
                  <p>
                    {domain.questionRecommended
                      ? `Question recommended${domain.blocking ? ' (blocking)' : ''}`
                      : 'No additional questions required'}
                  </p>
                </section>
              ))}
            </>
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
