import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectBrandCharacterReadinessPath, site00ProjectPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type {
  BrandCharacterDeepeningModule,
  BrandCharacterDeepeningQuestion,
} from '../../../shared/site00-brand-lore/brandCharacterReadiness/types';
import '../styles/site00-replay-execution.css';

export default function ProjectBrandCharacterDeepeningPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [module, setModule] = useState<BrandCharacterDeepeningModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.experimentHDeepeningGet(projectSlug);
      setModule((result.module as BrandCharacterDeepeningModule | null) ?? null);
    } catch {
      setModule(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const unanswered = useMemo(() => {
    if (!module) return [];
    const answered = new Set(module.answers.map((a) => a.questionId));
    return module.questions.filter((q) => !answered.has(q.questionId));
  }, [module]);

  const current: BrandCharacterDeepeningQuestion | undefined = unanswered[activeIndex];

  const submit = async () => {
    if (!current || !answer.trim()) return;
    setBusy(true);
    try {
      await site00ProjectsApi.experimentHDeepeningAnswer(projectSlug, current.questionId, answer.trim());
      setAnswer('');
      setActiveIndex(0);
      await reload();
    } finally {
      setBusy(false);
    }
  };

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Character Deepening is post-purchase NDXBOOK intelligence only.</p>
      </EcosystemShell>
    );
  }

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <p className="site00-project-lore-calibration__kicker">CONDITIONAL INTELLIGENCE</p>
            <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
            <p className="site00-project-lore-calibration__headline">BRAND CHARACTER DEEPENING</p>
            <Link to={site00ProjectBrandCharacterReadinessPath(projectSlug)}>← READINESS REVIEW</Link>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          {loading ? (
            <p>Loading deepening module…</p>
          ) : module?.status === 'NOT_REQUIRED' || unanswered.length === 0 ? (
            <section className="site00-experiment-g__panel">
              <h2>No deepening questions required</h2>
              <p>Existing evidence is sufficient for character formation.</p>
              <Link to={site00ProjectBrandCharacterReadinessPath(projectSlug)} className="site00-btn">
                BACK TO READINESS
              </Link>
            </section>
          ) : current ? (
            <section className="site00-experiment-g__panel">
              <p>
                Question {module!.answers.length + 1} of {module!.questions.length}
              </p>
              <p className="site00-label-red">{current.domain.replace(/_/g, ' ')}</p>
              <h2>{current.prompt}</h2>
              <p>{current.whyAsked}</p>
              <textarea
                className="site00-input"
                rows={6}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Answer in your own words…"
              />
              <button
                type="button"
                className="site00-btn site00-btn--primary"
                disabled={busy || !answer.trim()}
                onClick={() => void submit()}
              >
                SAVE ANSWER
              </button>
            </section>
          ) : (
            <section className="site00-experiment-g__panel">
              <h2>Deepening complete</h2>
              <Link to={site00ProjectBrandCharacterReadinessPath(projectSlug)} className="site00-btn site00-btn--primary">
                REVIEW READINESS
              </Link>
            </section>
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
