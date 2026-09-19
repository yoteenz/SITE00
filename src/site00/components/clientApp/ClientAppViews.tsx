import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { ClientActivityEvent } from '../../../../shared/site00-client-project-room/types.js';
import type {
  ClientAppDecision,
  ClientAppManifest,
  ClientAppTask,
  ClientBehindProjectItem,
} from '../../../../shared/site00-client-app/types.js';
import {
  AppCard,
  AppPrimaryButton,
  AppSecondaryButton,
  AppSectionLabel,
  AppStatusDot,
  AppWaveform,
} from './Site00ClientAppShell';
import { useAppPaths } from '../../hooks/useAppBasePath';
import { site00ClientAppApi } from '../../services/clientAppApi';
import { useIsAppPreview } from '../../hooks/useAppBasePath';

type ProjectPulseHomeProps = {
  manifest: ClientAppManifest;
};

export function ProjectPulseHome({
  manifest,
  onReload,
}: ProjectPulseHomeProps & { onReload?: () => void }) {
  const pulse = manifest.appExperience.projectPulse;
  const opportunity = pulse.activeOpportunity;

  if (pulse.isPostLaunch) {
    return (
      <div className="site00-app-home">
        <AppSectionLabel>PROJECT STATUS</AppSectionLabel>
        <AppCard className="site00-app-home__status-card">
          <div className="site00-app-home__status-row">
            <AppStatusDot tone="green" />
            <span className="site00-app-home__status-label">LIVE FOR {pulse.liveDays ?? 0} DAYS</span>
          </div>
          <p className="site00-app-home__moment">{pulse.currentMoment}</p>
        </AppCard>

        <AppSectionLabel>PROJECT SIGNAL</AppSectionLabel>
        <AppCard>
          <div className="site00-app-home__signal">{pulse.projectSignal.replace(/_/g, ' ')}</div>
        </AppCard>

        {opportunity ? <OpportunityCard manifest={manifest} onReload={onReload} /> : null}
      </div>
    );
  }

  return (
    <div className="site00-app-home">
      <AppSectionLabel>CURRENT STATUS</AppSectionLabel>
      <AppCard className="site00-app-home__status-card">
        <div className="site00-app-home__status-row">
          <AppStatusDot />
          <span className="site00-app-home__status-label">{pulse.status}</span>
        </div>
        <p className="site00-app-home__moment">{pulse.currentMoment}</p>
        <AppWaveform />
      </AppCard>

      {pulse.nextForYou ? (
        <>
          <AppSectionLabel>{pulse.nextForYou.label}</AppSectionLabel>
          <AppCard className="site00-app-home__action-card">
            <h3>{pulse.nextForYou.title}</h3>
            <p>{pulse.nextForYou.description}</p>
            <Link to={resolveAppRoute(pulse.nextForYou.route, manifest.projectSlug)} className="site00-app-link-cta">
              {pulse.nextForYou.ctaLabel} →
            </Link>
          </AppCard>
        </>
      ) : null}

      <AppSectionLabel>TODAY AT SITE 00</AppSectionLabel>
      <AppCard>
        <ul className="site00-app-list">
          {pulse.todayUpdates.map((u) => (
            <li key={u.id}>
              <span className="site00-app-list__time">{u.timeLabel}</span>
              <span>{u.summary}</span>
            </li>
          ))}
        </ul>
      </AppCard>

      {pulse.nextMilestone ? (
        <>
          <AppSectionLabel>NEXT MILESTONE</AppSectionLabel>
          <AppCard>
            <div className="site00-app-milestone-row">
              <span className="site00-app-milestone-row__date">{pulse.nextMilestone.dateLabel}</span>
              <span>{pulse.nextMilestone.title}</span>
            </div>
          </AppCard>
        </>
      ) : null}

      <AppSectionLabel>PROJECT SIGNAL</AppSectionLabel>
      <AppCard>
        <div className="site00-app-home__signal">{pulse.projectSignal.replace(/_/g, ' ')}</div>
      </AppCard>

      {opportunity && !pulse.nextForYou ? <OpportunityCard manifest={manifest} onReload={onReload} /> : null}
    </div>
  );
}

function resolveAppRoute(route: string, projectSlug: string): string {
  if (route.startsWith('/app/')) return route;
  return route
    .replace('/client/projects/', '/app/projects/')
    .replace(`/client/projects/${projectSlug}`, `/app/projects/${projectSlug}`);
}

function OpportunityCard({
  manifest,
  onReload,
}: {
  manifest: ClientAppManifest;
  onReload?: () => void;
}) {
  const opp = manifest.appExperience.projectPulse.activeOpportunity;
  const isPreview = useIsAppPreview();
  const storageKey = `site00-app-dismiss-${manifest.projectSlug}-${opp?.recommendedOffer ?? ''}`;
  const [dismissed, setDismissed] = useState(() =>
    isPreview ? sessionStorage.getItem(storageKey) === '1' : false,
  );

  useEffect(() => {
    if (isPreview && sessionStorage.getItem(storageKey) === '1') setDismissed(true);
  }, [isPreview, storageKey]);

  if (!opp || dismissed) return null;

  async function handleExplore() {
    if (isPreview) return;
    try {
      await site00ClientAppApi.opportunityInterest(manifest.projectSlug, opp!.recommendedOffer, 'VIEWED');
    } catch {
      /* non-blocking */
    }
  }

  async function handleMaybeLater() {
    if (isPreview) {
      sessionStorage.setItem(storageKey, '1');
      setDismissed(true);
      return;
    }
    try {
      await site00ClientAppApi.opportunityInterest(manifest.projectSlug, opp!.recommendedOffer, 'DISMISSED');
      setDismissed(true);
      await onReload?.();
    } catch {
      setDismissed(true);
    }
  }

  return (
    <>
      <AppSectionLabel>{manifest.appExperience.projectPulse.isPostLaunch ? "WHAT'S NEXT" : 'WHILE YOU WAIT'}</AppSectionLabel>
      <AppCard className="site00-app-opportunity-card">
        <div className="site00-app-opportunity-card__eyebrow">{opp.recommendedOffer}</div>
        <p>{opp.message}</p>
        <AppPrimaryButton onClick={() => void handleExplore()}>{opp.cta}</AppPrimaryButton>
        <AppSecondaryButton onClick={() => void handleMaybeLater()}>MAYBE LATER</AppSecondaryButton>
      </AppCard>
    </>
  );
}

export function ProjectMapView({ manifest }: { manifest: ClientAppManifest }) {
  return (
    <div className="site00-app-project-map">
      <div className="site00-app-project-map__line" aria-hidden="true" />
      {manifest.phases.map((phase) => (
        <div
          key={phase.id}
          className={`site00-app-phase-row site00-app-phase-row--${phase.state.toLowerCase()}`}
        >
          <span className="site00-app-phase-row__node" aria-hidden="true" />
          <div className="site00-app-phase-row__content">
            <span className="site00-app-phase-row__index">{String(phase.index).padStart(2, '0')}</span>
            <span className="site00-app-phase-row__label">{phase.label}</span>
            <span className="site00-app-phase-row__state">{phase.state.replace(/_/g, ' ')}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BuildProgressView({ manifest }: { manifest: ClientAppManifest }) {
  const build = manifest.appExperience.buildProgress;
  return (
    <div className="site00-app-build">
      {build.streams.map((stream) => (
        <div key={stream.id} className="site00-app-build__stream">
          <div className="site00-app-build__stream-head">
            <span>{stream.label}</span>
            <span>{stream.state.replace(/_/g, ' ')}</span>
          </div>
          {stream.items.length > 0 ? (
            <ul className="site00-app-build__items">
              {stream.items.map((item) => (
                <li key={item.id}>
                  <span>{item.label}</span>
                  <span>{item.state.replace(/_/g, ' ')}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function MilestoneListView({ manifest }: { manifest: ClientAppManifest }) {
  return (
    <ul className="site00-app-milestones">
      {manifest.appExperience.milestones.map((m) => (
        <li key={m.id} className="site00-app-milestones__item">
          <span className="site00-app-milestones__date">{m.dateLabel}</span>
          <div>
            <div>{m.title}</div>
            <span className="site00-app-milestones__status">{m.statusLabel}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ClientTaskListView({ manifest }: { manifest: ClientAppManifest }) {
  const tasks = manifest.appExperience.clientTasks;
  const needed = tasks.filter((t: ClientAppTask) => t.state !== 'COMPLETE');
  const completed = tasks.filter((t: ClientAppTask) => t.state === 'COMPLETE');
  return (
    <div className="site00-app-tasks">
      <AppSectionLabel>NEEDED FROM YOU</AppSectionLabel>
      {needed.map((t: ClientAppTask) => (
        <AppCard key={t.id} className="site00-app-tasks__item">
          <div className="site00-app-tasks__title">{t.title}</div>
          <div className="site00-app-tasks__meta">{t.state.replace(/_/g, ' ')}{t.dueLabel ? ` · ${t.dueLabel}` : ''}</div>
        </AppCard>
      ))}
      <AppSectionLabel>COMPLETED</AppSectionLabel>
      {completed.map((t: ClientAppTask) => (
        <AppCard key={t.id} className="site00-app-tasks__item site00-app-tasks__item--done">
          <div className="site00-app-tasks__title">{t.title}</div>
        </AppCard>
      ))}
    </div>
  );
}

export function DecisionListView({ manifest }: { manifest: ClientAppManifest }) {
  return (
    <ul className="site00-app-decisions">
      {manifest.appExperience.decisions.map((d: ClientAppDecision) => (
        <li key={d.id} className="site00-app-decisions__item">
          <div className="site00-app-decisions__title">{d.title}</div>
          <div className="site00-app-decisions__meta">{d.dateLabel} · APPROVED</div>
        </li>
      ))}
    </ul>
  );
}

export function ActivityFeedView({ manifest }: { manifest: ClientAppManifest }) {
  return (
    <ul className="site00-app-activity">
      {manifest.activityFeed.map((e: ClientActivityEvent) => (
        <li key={e.id}>
          <span className="site00-app-activity__time">{e.dateLabel}</span>
          <span>{e.summary}</span>
        </li>
      ))}
    </ul>
  );
}

export function BehindProjectView({ manifest }: { manifest: ClientAppManifest }) {
  return (
    <div className="site00-app-bts">
      {manifest.appExperience.behindProject.map((item: ClientBehindProjectItem) => (
        <AppCard key={item.id} className="site00-app-bts__item">
          <div className="site00-app-bts__title">{item.title}</div>
          <p>{item.body}</p>
        </AppCard>
      ))}
    </div>
  );
}

export function ProjectHubNav({ projectSlug, active }: { projectSlug: string; active: string }) {
  const paths = useAppPaths(projectSlug);
  const sections = [
    { id: 'map', label: 'PROJECT MAP' },
    { id: 'build', label: 'THE BUILD' },
    { id: 'milestones', label: 'MILESTONES' },
    { id: 'tasks', label: 'CLIENT TASKS' },
    { id: 'decisions', label: 'DECISIONS' },
    { id: 'activity', label: 'ACTIVITY' },
    { id: 'behind', label: 'BEHIND THE PROJECT' },
  ];
  return (
    <div className="site00-app-subnav">
      {sections.map((s) => (
        <Link
          key={s.id}
          to={paths.project(s.id)}
          className={`site00-app-subnav__link${active === s.id ? ' is-active' : ''}`}
        >
          {s.label}
        </Link>
      ))}
    </div>
  );
}

export function AppWebInvitationCta({
  manifest,
  onActivate,
}: {
  manifest: ClientAppManifest;
  onActivate?: () => void;
}) {
  const copy = manifest.appExperience.invitationCopy;
  if (manifest.appExperience.onboarding === 'ONBOARDED') return null;
  return (
    <div className="site00-app-web-cta">
      <div className="site00-app-web-cta__headline">{copy.headline}</div>
      <div className="site00-app-web-cta__sub">{copy.subhead}</div>
      <ul>
        {copy.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <a href={manifest.appExperience.deepLink} className="site00-app-web-cta__btn" onClick={onActivate}>
        {copy.ctaLabel}
      </a>
    </div>
  );
}
