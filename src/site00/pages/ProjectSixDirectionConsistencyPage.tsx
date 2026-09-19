import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import { Link, useParams } from 'react-router-dom';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { SixDirectionConsistencyReview } from '../components/validation/SixDirectionConsistencyReview';
import { usePersonalityReplayIntake, PersonalityReplayIntakeProvider } from '../hooks/usePersonalityReplayIntake';
import { site00ProjectPath, SITE00_ROUTES } from '../config/routes';
import { projectPersonalityReplayReviewPath } from '../config/personalityReplayRoutes';
import { projectDisplayName } from '../utils/projectDisplayName';
import '../styles/site00-replay-execution.css';
import '../styles/site00-six-direction-consistency.css';

export default function ProjectSixDirectionConsistencyPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();

  return (
    <PersonalityReplayIntakeProvider projectSlug={projectSlug}>
      <ProjectSixDirectionConsistencyPageInner projectSlug={projectSlug} />
    </PersonalityReplayIntakeProvider>
  );
}

function ProjectSixDirectionConsistencyPageInner({ projectSlug }: { projectSlug: string }) {
  const { replayId, reload, bootstrapping, sixDirectionConsistency } = usePersonalityReplayIntake(projectSlug);

  if (!hasProjectCapability(projectSlug, 'PROJECT_CORE')) {
    return (
      <EcosystemShell hidePageHeader>
        <p>Six-direction consistency validation is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  const projectTitle = projectDisplayName(projectSlug);

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <p className="site00-project-lore-calibration__kicker">HOW YOU SHOW UP</p>
            <h1 className="site00-project-lore-calibration__project">{projectTitle}</h1>
            <p className="site00-project-lore-calibration__headline">SIX-DIRECTION BLIND CREATIVE CONSISTENCY</p>
            <Link to={projectPersonalityReplayReviewPath(projectSlug)}>← BACK TO REPLAY REVIEW</Link>
            {' · '}
            <Link to={SITE00_ROUTES.projectCanonicalCreativeRange.replace(':projectSlug', projectSlug)}>
              EXPERIMENT B — CANONICAL RANGE →
            </Link>
            {' · '}
            <Link to={site00ProjectPath(projectSlug)}>PROJECT</Link>
          </header>
          <ProjectExperimentsHubNav projectSlug={projectSlug} />

          {bootstrapping || !replayId ? (
            <p className="site00-six-dir-review__pending">LOADING REPLAY…</p>
          ) : (
            <SixDirectionConsistencyReview
              projectSlug={projectSlug}
              replayId={replayId}
              consistency={sixDirectionConsistency}
              onUpdate={() => {
                void reload();
              }}
            />
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
