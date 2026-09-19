import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ClientAppManifest } from '../../../../shared/site00-client-app/types.js';
import { formatMetricCount } from '../../../../shared/site00-self-directed/types.js';
import { useAppPaths } from '../../hooks/useAppBasePath';
import { useClientAppProjects } from '../../hooks/useClientAppProjects';
import { useSite00MobileViewport } from '../../hooks/useSite00MobileViewport';
import { AppCard, AppSectionLabel, AppStatusDot } from '../clientApp/Site00ClientAppShell';
import { site00ProjectEvolvePath } from '../../config/routes';
import { SelfDirectedProfileEditSheet } from './SelfDirectedProfileEditSheet';
import { SelfDirectedOpsSignals } from './SelfDirectedOpsSignals';

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

function SelfDirectedHomeMobile({ manifest }: SelfDirectedHomeProps) {
  const paths = useAppPaths(manifest.projectSlug);
  const metrics = deriveMetrics(manifest);
  const featured = manifest.currentMoment;
  const recent = manifest.activityFeed.slice(0, 3);

  return (
    <div className="site00-sd-home site00-sd-home--mobile">
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

      <SelfDirectedOpsSignals manifest={manifest} />

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

function SelfDirectedHomeDesktop({ manifest }: SelfDirectedHomeProps) {
  const paths = useAppPaths(manifest.projectSlug);
  const metrics = deriveMetrics(manifest);
  const featured = manifest.currentMoment;
  const recent = manifest.activityFeed.slice(0, 4);

  return (
    <div className="site00-sd-home site00-sd-home--desktop">
      <header className="site00-sd-home__desktop-welcome">
        <div>
          <p className="site00-sd-home__eyebrow">WELCOME BACK, {manifest.displayName}</p>
          <p className="site00-sd-home__tagline">CREATOR // TURN IDEAS INTO MOVEMENT</p>
        </div>
        <Link to={paths.projects} className="site00-sd-link-cta">
          VIEW PROJECT →
        </Link>
      </header>

      <div className="site00-sd-home__desktop-hero-row">
        <AppCard className="site00-sd-home__featured site00-sd-home__featured--wide">
          <div className="site00-sd-home__featured-copy">
            <AppStatusDot />
            <span>ACTIVE</span>
            <h2>{manifest.displayName}</h2>
            <p>{manifest.statusLabel || manifest.currentPhaseLabel}</p>
          </div>
        </AppCard>
        <AppCard className="site00-sd-home__project-card">
          <span className="site00-sd-muted">{manifest.projectNumber}</span>
          <h3>{manifest.displayName}</h3>
          <p>{manifest.serviceScope ?? 'MARKETING-ONLY'}</p>
          <Link to={paths.projects} className="site00-sd-link-cta">
            VIEW PROJECT →
          </Link>
        </AppCard>
      </div>

      <div className="site00-sd-home__stats site00-sd-home__stats--desktop">
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
        <div className="site00-sd-home__stat site00-sd-home__stat--status">
          <AppStatusDot tone={metrics.systemStatus === 'ALL_GOOD' ? 'green' : 'accent'} />
          <span>{metrics.systemStatus === 'ALL_GOOD' ? 'ALL SYSTEMS ACTIVE' : 'NEEDS ATTENTION'}</span>
        </div>
      </div>

      <div className="site00-sd-home__desktop-mid">
        <div className="site00-sd-home__desktop-col">
          <AppSectionLabel>QUICK ACTIONS</AppSectionLabel>
          <div className="site00-sd-home__quick-actions site00-sd-home__quick-actions--desktop">
            <Link to={paths.projects} className="site00-sd-quick-action">NEW CAMPAIGN</Link>
            <Link to={paths.projects} className="site00-sd-quick-action">UPLOAD ASSETS</Link>
            <Link to={paths.reviews} className="site00-sd-quick-action">REQUEST REVIEW</Link>
            <Link to={site00ProjectEvolvePath(manifest.projectSlug)} className="site00-sd-quick-action site00-sd-quick-action--accent">
              USE EVOLVE
            </Link>
          </div>
        </div>
        <div className="site00-sd-home__desktop-col">
          <AppSectionLabel>RECENT ACTIVITY</AppSectionLabel>
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
        </div>
        <div className="site00-sd-home__desktop-col">
          {featured ? (
            <>
              <AppSectionLabel>CURRENT FOCUS</AppSectionLabel>
              <AppCard className="site00-sd-home__continue site00-sd-home__continue--desktop">
                <div>
                  <h3>{featured.title}</h3>
                  <small>{featured.phaseLabel}</small>
                </div>
                <Link to={featured.enterReviewRoute ?? paths.reviews} className="site00-sd-arrow-btn site00-sd-arrow-btn--primary">
                  →
                </Link>
              </AppCard>
            </>
          ) : null}
        </div>
      </div>

      <AppCard className="site00-sd-home__evolve-banner site00-sd-home__evolve-banner--desktop">
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

export function SelfDirectedHomeView(props: SelfDirectedHomeProps) {
  const isMobile = useSite00MobileViewport();
  return isMobile ? <SelfDirectedHomeMobile {...props} /> : <SelfDirectedHomeDesktop {...props} />;
}

function SelfDirectedProjectsMobile({ manifest }: { manifest: ClientAppManifest }) {
  const paths = useAppPaths(manifest.projectSlug);
  const metrics = deriveMetrics(manifest);

  return (
    <div className="site00-sd-projects site00-sd-projects--mobile">
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

function SelfDirectedProjectsDesktop({ manifest }: { manifest: ClientAppManifest }) {
  const paths = useAppPaths(manifest.projectSlug);
  const metrics = deriveMetrics(manifest);

  return (
    <div className="site00-sd-projects site00-sd-projects--desktop">
      <header className="site00-sd-projects__header site00-sd-projects__header--desktop">
        <div>
          <AppStatusDot />
          <span>{manifest.displayName} / CREATOR</span>
          <h1>{manifest.displayName}</h1>
          <p>{manifest.statusLabel}</p>
        </div>
        <span className="site00-sd-muted">{manifest.projectNumber}</span>
      </header>

      <div className="site00-sd-home__stats site00-sd-home__stats--desktop">
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

      <div className="site00-sd-projects__desktop-grid">
        <div>
          <AppSectionLabel>
            PROJECT JOURNEY <span className="site00-sd-muted">{manifest.serviceScope ?? 'MARKETING-ONLY'}</span>
          </AppSectionLabel>
          <div className="site00-sd-projects__journey site00-sd-projects__journey--desktop">
            {manifest.phases.map((phase) => (
              <Link key={phase.id} to={paths.projects} className="site00-sd-projects__step site00-sd-projects__step--desktop">
                <span>{phase.index}</span>
                <strong>{phase.label}</strong>
                <span className="site00-sd-arrow-btn">→</span>
              </Link>
            ))}
          </div>
        </div>
        {manifest.nextAction ? (
          <AppCard className="site00-sd-projects__focus site00-sd-projects__focus--desktop">
            <AppStatusDot />
            <span>CURRENT FOCUS</span>
            <h3>{manifest.nextAction.title}</h3>
            <Link
              to={manifest.nextAction.route.startsWith('/') ? manifest.nextAction.route : paths.reviews}
              className="site00-sd-arrow-btn site00-sd-arrow-btn--primary"
            >
              →
            </Link>
          </AppCard>
        ) : null}
      </div>
    </div>
  );
}

export function SelfDirectedProjectsView(props: { manifest: ClientAppManifest }) {
  const isMobile = useSite00MobileViewport();
  return isMobile ? <SelfDirectedProjectsMobile {...props} /> : <SelfDirectedProjectsDesktop {...props} />;
}

function SelfDirectedProfileMobile({ manifest }: { manifest: ClientAppManifest }) {
  const [editOpen, setEditOpen] = useState(false);
  const paths = useAppPaths(manifest.projectSlug);

  return (
    <div className="site00-sd-profile site00-sd-profile--mobile">
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
        <button type="button" className="site00-sd-profile__edit" onClick={() => setEditOpen(true)}>
          EDIT PROFILE
        </button>
      </div>
      <SelfDirectedProfileEditSheet open={editOpen} displayName={manifest.displayName} onClose={() => setEditOpen(false)} />

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

function SelfDirectedProfileDesktop({ manifest }: { manifest: ClientAppManifest }) {
  const [editOpen, setEditOpen] = useState(false);
  const paths = useAppPaths(manifest.projectSlug);

  return (
    <div className="site00-sd-profile site00-sd-profile--desktop">
      <header className="site00-sd-profile__header site00-sd-profile__header--desktop">
        <div>
          <AppStatusDot />
          <span>PROFILE / CREATOR ACCOUNT</span>
          <h1>{manifest.displayName}</h1>
        </div>
        <button type="button" className="site00-sd-profile__edit" onClick={() => setEditOpen(true)}>
          EDIT PROFILE
        </button>
      </header>

      <div className="site00-sd-profile__desktop-grid">
        <div className="site00-sd-profile__hero site00-sd-profile__hero--desktop">
          <div className="site00-sd-profile__avatar" aria-hidden="true" />
          <div>
            <h2>{manifest.displayName}</h2>
            <p>CREATOR</p>
            <small>SELF-DIRECTED MARKETER / IDEAS MOVE DIFFERENTLY.</small>
          </div>
        </div>

        <AppCard className="site00-sd-profile__package-card">
          <AppSectionLabel>
            YOUR PACKAGE <span className="site00-sd-muted">{manifest.serviceScope ?? 'MARKETING-ONLY'}</span>
          </AppSectionLabel>
          <h3>EVOLVE SOLO</h3>
          <p className="site00-sd-profile__popular">MOST POPULAR</p>
          <p>MONTHLY CAMPAIGNS, FULL CONTENT SUITE, STRATEGY + OPTIMIZATION.</p>
          <Link to="/evolve/plans" className="site00-sd-link-cta">
            CHANGE PACKAGE →
          </Link>
        </AppCard>

        <AppCard>
          <AppSectionLabel>LINKED PROJECTS</AppSectionLabel>
          <Link to={paths.projects} className="site00-sd-link-cta">
            {manifest.displayName} / {manifest.projectNumber} →
          </Link>
        </AppCard>

        <div className="site00-sd-profile__actions site00-sd-profile__actions--desktop">
          <Link to="/control/billing" className="site00-sd-profile__action">
            BILLING & SUBSCRIPTION
          </Link>
          <Link to="/control/settings" className="site00-sd-profile__action">
            PREFERENCES
          </Link>
          <Link to="/origin/sign-in" className="site00-sd-profile__action site00-sd-profile__action--danger">
            SIGN OUT
          </Link>
        </div>
      </div>

      <SelfDirectedProfileEditSheet open={editOpen} displayName={manifest.displayName} onClose={() => setEditOpen(false)} />
    </div>
  );
}

export function SelfDirectedProfileView(props: { manifest: ClientAppManifest }) {
  const isMobile = useSite00MobileViewport();
  return isMobile ? <SelfDirectedProfileMobile {...props} /> : <SelfDirectedProfileDesktop {...props} />;
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
