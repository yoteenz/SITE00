import { Link, useNavigate } from 'react-router-dom';
import type { ClientAppManifest } from '../../../../shared/site00-client-app/types.js';
import { formatMetricCount } from '../../../../shared/site00-self-directed/types.js';
import { useAppPaths } from '../../hooks/useAppBasePath';
import { useClientAppProjects } from '../../hooks/useClientAppProjects';
import { AppCard, AppSectionLabel, AppStatusDot } from '../clientApp/Site00ClientAppShell';
import { site00ProjectEvolvePath } from '../../config/routes';

type SelfDirectedHomeProps = {
  manifest: ClientAppManifest;
};

function deriveMetrics(manifest: ClientAppManifest) {
  const reviewCount = manifest.reviewableObjects?.length ?? null;
  const assets = manifest.librarySections?.reduce((sum, s) => sum + (s.itemCount ?? 0), 0) ?? null;

  return {
    activeCampaigns: manifest.services?.includes('MARKETING') ? reviewCount : null,
    assets: assets && assets > 0 ? assets : null,
    pendingApprovals: reviewCount,
    systemStatus:
      manifest.attentionState === 'YOUR_TURN'
        ? ('NEEDS_ATTENTION' as const)
        : ('ALL_GOOD' as const),
  };
}

export function SelfDirectedHomeView({ manifest }: SelfDirectedHomeProps) {
  const paths = useAppPaths(manifest.projectSlug);
  const metrics = deriveMetrics(manifest);
  const featured = manifest.currentMoment;
  const recent = manifest.activityFeed.slice(0, 3);

  return (
    <div className="site00-sd-home">
      <header className="site00-sd-home__welcome">
        <AppStatusDot />
        <div>
          <p className="site00-sd-home__eyebrow">WELCOME BACK</p>
          <h1 className="site00-sd-home__name">{manifest.displayName}</h1>
          <p className="site00-sd-home__tagline">IDEAS MOVE DIFFERENTLY HERE.</p>
        </div>
      </header>

      <AppCard className="site00-sd-home__featured">
        <div className="site00-sd-home__featured-copy">
          <AppStatusDot />
          <span>ACTIVE</span>
          <h2>{manifest.displayName}</h2>
          <p>{manifest.statusLabel || manifest.currentPhaseLabel}</p>
          {manifest.nextAction ? (
            <Link to={manifest.nextAction.route.startsWith('/') ? manifest.nextAction.route : paths.reviews} className="site00-sd-home__featured-cta">
              {manifest.nextAction.ctaLabel} →
            </Link>
          ) : (
            <Link to={paths.projects} className="site00-sd-home__featured-cta">
              VIEW PROJECT →
            </Link>
          )}
        </div>
      </AppCard>

      <div className="site00-sd-home__stats">
        <div className="site00-sd-home__stat">
          <strong>{formatMetricCount(metrics.activeCampaigns)}</strong>
          <span>ACTIVE CAMPAIGNS</span>
        </div>
        <div className="site00-sd-home__stat">
          <strong>{formatMetricCount(metrics.assets)}</strong>
          <span>ASSETS</span>
        </div>
        <div className="site00-sd-home__stat">
          <strong>{formatMetricCount(metrics.pendingApprovals)}</strong>
          <span>PENDING APPROVALS</span>
        </div>
        <div className="site00-sd-home__stat site00-sd-home__stat--status">
          <AppStatusDot tone={metrics.systemStatus === 'ALL_GOOD' ? 'green' : 'accent'} />
          <span>{metrics.systemStatus === 'ALL_GOOD' ? 'ALL GOOD' : 'NEEDS ATTENTION'}</span>
          <small>SYSTEM STATUS</small>
        </div>
      </div>

      <AppSectionLabel>
        QUICK ACTIONS <span className="site00-sd-muted">GET THINGS MOVING</span>
      </AppSectionLabel>
      <div className="site00-sd-home__quick-actions">
        <Link to={paths.projects} className="site00-sd-quick-action">CREATE CAMPAIGN</Link>
        <Link to={paths.projects} className="site00-sd-quick-action">UPLOAD ASSETS</Link>
        <Link to={site00ProjectEvolvePath(manifest.projectSlug)} className="site00-sd-quick-action site00-sd-quick-action--accent">
          USE EVOLVE
        </Link>
        <Link to={paths.projects} className="site00-sd-quick-action">BROWSE LIBRARY</Link>
      </div>

      {featured ? (
        <>
          <AppSectionLabel>
            CONTINUE WORKING <Link to={paths.projects}>VIEW PROJECT →</Link>
          </AppSectionLabel>
          <AppCard className="site00-sd-home__continue">
            <div>
              <h3>{manifest.displayName}</h3>
              <p>{featured.title}</p>
              <small>{featured.phaseLabel}</small>
            </div>
            <Link to={featured.enterReviewRoute ?? paths.reviews} className="site00-sd-arrow-btn" aria-label="Continue">
              →
            </Link>
          </AppCard>
        </>
      ) : null}

      {recent.length > 0 ? (
        <>
          <AppSectionLabel>
            RECENT ACTIVITY <Link to={paths.inbox()}>VIEW ALL →</Link>
          </AppSectionLabel>
          <ul className="site00-sd-activity-list">
            {recent.map((event) => (
              <li key={event.id}>
                <AppStatusDot tone={event.isNew ? 'accent' : 'grey'} />
                <div>
                  <strong>{event.summary}</strong>
                  <span>{event.dateLabel}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <AppCard className="site00-sd-home__evolve-banner">
        <div>
          <AppStatusDot />
          <span>CREATIVE BRAIN</span>
          <h3>TURN IDEAS INTO IMPACT</h3>
          <p>STRATEGY. CONTENT. DISTRIBUTION. ALL IN ONE PLACE.</p>
        </div>
        <Link to={site00ProjectEvolvePath(manifest.projectSlug)} className="site00-sd-home__banner-link">
          OPEN →
        </Link>
      </AppCard>
    </div>
  );
}

export function SelfDirectedProjectsView({ manifest }: { manifest: ClientAppManifest }) {
  const paths = useAppPaths(manifest.projectSlug);
  const metrics = deriveMetrics(manifest);

  return (
    <div className="site00-sd-projects">
      <header className="site00-sd-projects__header">
        <AppStatusDot />
        <span>{manifest.displayName} / CREATOR</span>
        <span className="site00-sd-muted">{manifest.projectNumber}</span>
      </header>
      <h1 className="site00-sd-projects__title">{manifest.displayName}</h1>
      <p className="site00-sd-projects__meta">{manifest.statusLabel}</p>

      <div className="site00-sd-home__stats site00-sd-home__stats--compact">
        <div className="site00-sd-home__stat">
          <strong>{formatMetricCount(metrics.activeCampaigns)}</strong>
          <span>ACTIVE CAMPAIGNS</span>
        </div>
        <div className="site00-sd-home__stat">
          <strong>{formatMetricCount(metrics.assets)}</strong>
          <span>ASSETS</span>
        </div>
        <div className="site00-sd-home__stat">
          <strong>{formatMetricCount(metrics.pendingApprovals)}</strong>
          <span>APPROVALS</span>
        </div>
        <div className="site00-sd-home__stat">
          <AppStatusDot tone="accent" />
          <span>{manifest.statusLabel || 'ACTIVE'}</span>
        </div>
      </div>

      <AppSectionLabel>
        PROJECT JOURNEY <span className="site00-sd-muted">{manifest.serviceScope ?? 'MARKETING-ONLY'}</span>
      </AppSectionLabel>
      <div className="site00-sd-projects__journey">
        {manifest.phases.map((phase) => (
          <Link key={phase.id} to={paths.projects} className="site00-sd-projects__step">
            <span>{phase.index}</span>
            <strong>{phase.label}</strong>
            <span className="site00-sd-arrow-btn">→</span>
          </Link>
        ))}
      </div>

      {manifest.nextAction ? (
        <AppCard className="site00-sd-projects__focus">
          <AppStatusDot />
          <span>CURRENT FOCUS</span>
          <h3>{manifest.nextAction.title}</h3>
          <Link to={manifest.nextAction.route.startsWith('/') ? manifest.nextAction.route : paths.reviews} className="site00-sd-arrow-btn site00-sd-arrow-btn--primary">
            →
          </Link>
        </AppCard>
      ) : null}
    </div>
  );
}

export function SelfDirectedProfileView({ manifest }: { manifest: ClientAppManifest }) {
  const navigate = useNavigate();
  const paths = useAppPaths(manifest.projectSlug);

  return (
    <div className="site00-sd-profile">
      <header className="site00-sd-profile__header">
        <AppStatusDot />
        <span>PROFILE</span>
        <span className="site00-sd-muted">CREATOR ACCOUNT</span>
      </header>

      <div className="site00-sd-profile__hero">
        <div className="site00-sd-profile__avatar" aria-hidden="true" />
        <div>
          <h1>{manifest.displayName}</h1>
          <p>CREATOR</p>
          <small>SELF-DIRECTED MARKETER / IDEAS MOVE DIFFERENTLY.</small>
        </div>
        <button type="button" className="site00-sd-profile__edit" onClick={() => navigate(paths.profile)}>
          EDIT PROFILE
        </button>
      </div>

      <AppSectionLabel>
        YOUR PACKAGE <span className="site00-sd-muted">{manifest.serviceScope ?? 'MARKETING-ONLY'}</span>
      </AppSectionLabel>
      <AppCard>
        <h3>EVOLVE SOLO</h3>
        <p>MONTHLY CAMPAIGNS, FULL CONTENT SUITE, STRATEGY + OPTIMIZATION.</p>
        <Link to="/evolve/plans" className="site00-sd-link-cta">CHANGE PACKAGE →</Link>
      </AppCard>

      <AppSectionLabel>LINKED PROJECTS</AppSectionLabel>
      <AppCard>
        <Link to={paths.projects} className="site00-sd-link-cta">
          {manifest.displayName} / {manifest.projectNumber} →
        </Link>
      </AppCard>

      <AppSectionLabel>ACCOUNT ACTIONS</AppSectionLabel>
      <div className="site00-sd-profile__actions">
        <Link to="/control/billing" className="site00-sd-profile__action">BILLING & SUBSCRIPTION</Link>
        <Link to="/control/settings" className="site00-sd-profile__action">PREFERENCES</Link>
        <Link to="/origin/sign-in" className="site00-sd-profile__action site00-sd-profile__action--danger">SIGN OUT</Link>
      </div>
    </div>
  );
}

export function SelfDirectedProjectsListView() {
  const { data, state } = useClientAppProjects();

  if (state !== 'ready' || !data) {
    return <p className="site00-sd-muted">LOADING PROJECTS…</p>;
  }

  return (
    <div className="site00-sd-projects-list">
      <AppSectionLabel>YOUR PROJECTS</AppSectionLabel>
      <ul>
        {data.projects.map((project) => (
          <li key={project.slug}>
            <Link to={`/app/projects/${project.slug}/projects`}>
              <strong>{project.displayName}</strong>
              <span>{project.projectNumber}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
