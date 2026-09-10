/**
 * B5.9R7 — Routes Overview module through project-specific adapters.
 */

import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { GeneralizedProjectOperatingState } from '../../../../shared/site00-projects/generalizedProjectOperatingState.js';
import type { ProjectCodebaseIntelligence } from '../../../../shared/site00-projects/technical/types.js';
import { getProjectOverviewAdapter } from '../../../../shared/site00-projects/overview/projectOverviewAdapterRegistry.js';
import type { ProjectOverviewSignal, ProjectOverviewViewModel } from '../../../../shared/site00-projects/overview/types.js';
import { useProjectOperatingState } from '../../hooks/useProjectOperatingState.js';
import { useProjectViewMode } from '../../context/ProjectViewModeContext.js';
import { useSite00OriginWideViewport } from '../shell/useSite00OriginWideViewport.js';
import { OverviewMobileHomeScreen } from '../founderWorkspace/OverviewFounderWorkspaceBoard.js';

type Props = {
  projectSlug: string;
  operatingState: GeneralizedProjectOperatingState;
  technicalIntelligence?: ProjectCodebaseIntelligence | null;
};

function progressDisplay(model: ProjectOverviewViewModel): { text: string; percent: number | null } {
  if (model.progress.percent != null) {
    return { text: `${model.progress.percent}%`, percent: model.progress.percent };
  }
  return { text: model.progress.label ?? 'IN PROGRESS', percent: null };
}

function SignalToneIcon({ tone }: { tone: ProjectOverviewSignal['tone'] }) {
  const cls = `site00-pov-signal__icon site00-pov-signal__icon--${tone}`;
  if (tone === 'green') return <span className={cls} aria-hidden>✓</span>;
  if (tone === 'red') return <span className={cls} aria-hidden>!</span>;
  if (tone === 'amber') return <span className={cls} aria-hidden>△</span>;
  return <span className={cls} aria-hidden>●</span>;
}

function OverviewSignalCard({ signal }: { signal: ProjectOverviewSignal }) {
  return (
    <article className={`site00-pov-signal site00-pov-signal--${signal.tone}`}>
      <div className="site00-pov-signal__head">
        <SignalToneIcon tone={signal.tone} />
        <span className="site00-pov-signal__title">{signal.title}</span>
      </div>
      <p className="site00-pov-signal__value">{signal.value}</p>
      <p className="site00-pov-signal__status">{signal.status}</p>
      {signal.meta ? <p className="site00-pov-signal__meta">{signal.meta}</p> : null}
    </article>
  );
}

function ActionCard({
  kind,
  label,
  sublabel,
  href,
}: {
  kind: 'focus' | 'milestone';
  label: string;
  sublabel?: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className={`site00-pov-action__icon site00-pov-action__icon--${kind}`} aria-hidden>
        {kind === 'focus' ? '◎' : '◈'}
      </span>
      <span className="site00-pov-action__body">
        <span className="site00-pov-action__label">{label}</span>
        {sublabel ? <span className="site00-pov-action__sublabel">{sublabel}</span> : null}
      </span>
      {href ? <span className="site00-pov-action__chevron" aria-hidden>›</span> : null}
    </>
  );

  if (href) {
    return (
      <Link to={href} className={`site00-pov-action site00-pov-action--${kind}`}>
        {inner}
      </Link>
    );
  }

  return <div className={`site00-pov-action site00-pov-action--${kind}`}>{inner}</div>;
}

export function ProjectOverviewModuleSurface({
  projectSlug,
  operatingState,
  technicalIntelligence,
}: Props) {
  const { viewMode } = useProjectViewMode();
  const isWide = useSite00OriginWideViewport();
  const adapter = getProjectOverviewAdapter(projectSlug);
  const { state: ndxState } = useProjectOperatingState(
    adapter.stateSource === 'PROJECT_OPERATING_STATE' ? projectSlug : '',
  );

  const ctx = {
    generalized: operatingState,
    ndxOperatingState: ndxState,
    technicalIntelligence,
    viewMode,
  };

  const model =
    viewMode === 'CLIENT' ? adapter.buildClientOverview(ctx) : adapter.buildFounderOverview(ctx);

  if (projectSlug === 'ndxbook' && !isWide && viewMode !== 'CLIENT') {
    return (
      <div className="site00-pov site00-pov--ndxbook-authority-mobile" data-screen-replication="NDX_OVERVIEW_MOBILE">
        <OverviewMobileHomeScreen projectSlug={projectSlug} />
      </div>
    );
  }

  const progress = progressDisplay(model);

  return (
    <div
      className={`site00-pov site00-pov--${model.visual.visualClass}${isWide ? ' site00-pov--desktop' : ' site00-pov--mobile'}`}
      data-adapter={model.adapterId}
      data-partial={model.partialState ? 'true' : 'false'}
    >
      {model.partialMessage ? (
        <p className="site00-pov-partial" role="status">
          {model.partialMessage}
        </p>
      ) : null}

      <div className="site00-pov-layout">
        <section className="site00-pov-hero" aria-label="Project identity">
          <div
            className={`site00-pov-hero__visual site00-pov-hero__visual--${model.visual.visualClass}`}
            style={
              {
                '--pov-accent': model.visual.accent,
                '--pov-accent-bg': model.visual.accentBg,
              } as CSSProperties
            }
          >
            {model.visual.imageUrl ? (
              <img src={model.visual.imageUrl} alt="" className="site00-pov-hero__img" loading="lazy" />
            ) : (
              <span className="site00-pov-hero__initials" aria-hidden>
                {model.visual.initials}
              </span>
            )}
          </div>

          <div className="site00-pov-hero__copy">
            {model.lifecycleBadge ? (
              <span className="site00-pov-hero__badge">{model.lifecycleBadge}</span>
            ) : null}
            <h2 className="site00-pov-hero__title">{model.displayName}</h2>
            <p className="site00-pov-hero__descriptor">{model.descriptor}</p>
            <p className="site00-pov-hero__phase">{model.phase}</p>

            <div className="site00-pov-hero__progress">
              <div className="site00-pov-hero__progress-row">
                <span className="site00-pov-hero__progress-label">PROJECT PROGRESS</span>
                <span className="site00-pov-hero__progress-value">{progress.text}</span>
              </div>
              {progress.percent != null ? (
                <div className="site00-pov-hero__progress-track">
                  <div className="site00-pov-hero__progress-fill" style={{ width: `${progress.percent}%` }} />
                </div>
              ) : null}
            </div>

            {model.moduleChips.length ? (
              <div className="site00-pov-chips" aria-label="Enabled modules">
                {model.moduleChips.map((chip) => (
                  <span key={chip} className="site00-pov-chip">
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="site00-pov-signals" aria-label="Project signals">
          <div className="site00-pov-signals__grid">
            {model.primarySignals.map((signal) => (
              <OverviewSignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </section>

        <section className="site00-pov-tactical" aria-label="Current work">
          {model.currentFocus ? (
            <ActionCard
              kind="focus"
              label={model.currentFocus.label}
              sublabel={model.currentFocus.sublabel}
              href={model.currentFocus.href}
            />
          ) : null}
          {model.nextMilestone ? (
            <ActionCard
              kind="milestone"
              label={model.nextMilestone.label}
              sublabel={model.nextMilestone.sublabel}
              href={model.nextMilestone.href}
            />
          ) : null}
        </section>

        {model.recentActivity.length ? (
          <section className="site00-pov-activity" aria-label="Recent activity">
            <h3 className="site00-pov-activity__title">RECENT ACTIVITY</h3>
            <ul className="site00-pov-activity__list">
              {model.recentActivity.map((item) => (
                <li key={item.id}>
                  <span>{item.summary}</span>
                  {item.timestamp ? <time dateTime={item.timestamp}>{item.timestamp}</time> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {model.primaryAction.href ? (
        <div className="site00-pov-cta">
          <Link to={model.primaryAction.href} className="site00-pov-cta__btn">
            {model.primaryAction.label} →
          </Link>
        </div>
      ) : null}
    </div>
  );
}

/** Exposed for header integration — same derivation as surface. */
export function buildProjectOverviewViewModel(args: {
  projectSlug: string;
  operatingState: GeneralizedProjectOperatingState;
  ndxOperatingState?: import('../../../../shared/site00-brand-lore/founderWorkspace/projectOperatingState/types.js').ProjectOperatingState | null;
  technicalIntelligence?: ProjectCodebaseIntelligence | null;
  viewMode: 'FOUNDER' | 'CLIENT';
}) {
  const adapter = getProjectOverviewAdapter(args.projectSlug);
  const ctx = {
    generalized: args.operatingState,
    ndxOperatingState: args.ndxOperatingState,
    technicalIntelligence: args.technicalIntelligence,
    viewMode: args.viewMode,
  };
  return args.viewMode === 'CLIENT' ? adapter.buildClientOverview(ctx) : adapter.buildFounderOverview(ctx);
}
