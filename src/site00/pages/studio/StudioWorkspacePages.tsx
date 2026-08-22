import { Link } from 'react-router-dom';
import { site00StudioPath } from '../../config/routes';
import { useStudioData } from '../../hooks/useStudioData';
import {
  StudioErrorState,
  StudioLoadingState,
  StudioProjectHeader,
  StudioShell,
} from '../../components/studio';

type StudioWorkspacePageProps = {
  projectSlug: string;
  title: string;
  section: 'input' | 'operations' | 'blueprint' | 'assets' | 'reviews' | 'milestones' | 'activity';
};

export function StudioWorkspacePage({ projectSlug, title, section }: StudioWorkspacePageProps) {
  const { data, state, error, reload } = useStudioData(projectSlug);

  if (state === 'loading') {
    return (
      <StudioShell>
        <StudioLoadingState />
      </StudioShell>
    );
  }

  if (state === 'error' || !data) {
    return (
      <StudioShell>
        <StudioErrorState message={error ?? 'WE COULDN\'T LOAD THIS OPERATION. TRY AGAIN.'} onRetry={() => void reload()} />
      </StudioShell>
    );
  }

  const slug = data.project.slug;

  return (
    <StudioShell>
      <div className="site00-studio-workspace">
        <StudioProjectHeader
          projectNumber={data.project.projectNumber}
          projectName={data.project.name.toUpperCase()}
          studioStatus={data.studioStatus}
        />

        <header className="site00-studio-workspace__head">
          <Link to={site00StudioPath(slug)} className="site00-studio-workspace__back">← STUDIO</Link>
          <h1 className="site00-studio-workspace__title">{title}</h1>
        </header>

        <div className="site00-studio-workspace__body">
          {section === 'input' && (
            data.clientOperations.length ? (
              <ul className="site00-studio-ops-list site00-studio-ops-list--full">
                {data.clientOperations.map((op) => (
                  <li key={op.id}>
                    <Link to={op.route} className="site00-studio-ops-row">
                      <span className="site00-studio-ops-row__title">{op.title}</span>
                      <span className="site00-studio-ops-row__status">{op.statusLabel}</span>
                      <span className="site00-studio-ops-row__chev" aria-hidden="true">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="site00-studio-panel__empty">NO CLIENT INPUT REQUIRED</p>
            )
          )}

          {section === 'operations' && (
            data.studioOperations.length ? (
              <ul className="site00-studio-ops-list site00-studio-ops-list--full">
                {data.studioOperations.map((op) => (
                  <li key={op.id}>
                    <div className="site00-studio-ops-row site00-studio-ops-row--static">
                      <span className="site00-studio-ops-row__title">{op.title}</span>
                      <span className="site00-studio-ops-row__status site00-studio-ops-row__status--active">
                        <span className="site00-studio-ops-row__dot" aria-hidden="true" />
                        {op.statusLabel}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="site00-studio-panel__empty">STUDIO IS CURRENTLY IN PRODUCTION</p>
            )
          )}

          {section === 'blueprint' && (
            <div className="site00-studio-workspace__placeholder">
              <p className="site00-studio-workspace__phase">PHASE: {data.project.currentPhase.replace(/_/g, ' ')}</p>
              <p className="site00-studio-panel__empty">
                BLUEPRINT WORKSPACE — ARCHITECTURE, SCREEN INVENTORY, AND DIRECTIONS SURFACE HERE AS PRODUCTION ADVANCES.
              </p>
              {data.nextReview ? (
                <Link to={data.nextReview.route} className="site00-studio-panel__cta">ENTER REVIEW →</Link>
              ) : null}
            </div>
          )}

          {section === 'assets' && (
            <div className="site00-studio-workspace__placeholder">
              <p className="site00-studio-panel__empty">ASSET VAULT STATUS SURFACES HERE.</p>
              <Link to="/assts" className="site00-studio-panel__cta">OPEN ASSET VAULT →</Link>
            </div>
          )}

          {section === 'reviews' && (
            data.nextReview ? (
              <Link to={data.nextReview.route} className="site00-studio-review site00-studio-review--card">
                <p className="site00-studio-review__title">{data.nextReview.title}</p>
                <p className="site00-studio-review__subtitle">{data.nextReview.subtitle}</p>
                <span className="site00-studio-panel__cta">ENTER REVIEW →</span>
              </Link>
            ) : (
              <p className="site00-studio-panel__empty">NO REVIEW READY YET</p>
            )
          )}

          {section === 'milestones' && (
            data.latestMilestone ? (
              <div className="site00-studio-milestone site00-studio-milestone--full">
                <p className="site00-studio-milestone__title">{data.latestMilestone.title}</p>
                <p className="site00-studio-milestone__status">{data.latestMilestone.statusLabel}</p>
              </div>
            ) : (
              <p className="site00-studio-panel__empty">NEXT MILESTONE IS BEING PREPARED</p>
            )
          )}

          {section === 'activity' && (
            data.activity.length ? (
              <ol className="site00-studio-activity site00-studio-activity--full">
                {data.activity.map((ev) => (
                  <li key={ev.id} className="site00-studio-activity__row">
                    <span className="site00-studio-activity__node" aria-hidden="true" />
                    <div>
                      <time className="site00-studio-activity__time" dateTime={ev.timestamp}>{ev.clockTime}</time>
                      <p className="site00-studio-activity__summary">{ev.summary}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="site00-studio-panel__empty">ACTIVITY WILL APPEAR AS PRODUCTION BEGINS</p>
            )
          )}
        </div>
      </div>
    </StudioShell>
  );
}
