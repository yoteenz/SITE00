import type { ReactNode } from 'react';
import type { GeneralizedProjectOperatingState } from '../../../../shared/site00-projects/generalizedProjectOperatingState.js';
import { useProjectViewMode } from '../../context/ProjectViewModeContext.js';
import { filterClientSafeStatuses } from '../../../../shared/site00-projects/clientSafeStatusTranslation.js';

type ModulePanelProps = {
  operatingState: GeneralizedProjectOperatingState;
  activeSubnav: string;
  children?: ReactNode;
};

function NeedsYourEyeSection({ operatingState }: { operatingState: GeneralizedProjectOperatingState }) {
  const { viewMode } = useProjectViewMode();
  const items =
    viewMode === 'CLIENT'
      ? operatingState.needsYourEye.filter((n) => n.clientActionable)
      : operatingState.needsYourEye;

  if (!items.length) return null;

  return (
    <section className="site00-pos-panel site00-pos-panel--alert">
      <h2 className="site00-pos-panel__title">NEEDS YOUR EYE</h2>
      <ul className="site00-pos-needs-list">
        {items.map((item) => (
          <li key={item.id}>
            <span className="site00-pos-needs-list__priority">{item.priority}</span>
            <span className="site00-pos-needs-list__label">{item.label}</span>
            {item.href ? (
              <a className="site00-pos-needs-list__action" href={item.href}>
                REVIEW →
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ProjectOverviewModule({ operatingState, activeSubnav }: ModulePanelProps) {
  const { summary, moduleStatuses, activity, currentFocus } = operatingState;
  const { viewMode } = useProjectViewMode();

  if (activeSubnav === 'ACTIVITY') {
    const items = viewMode === 'CLIENT' ? activity.filter((a) => a.clientSafe) : activity;
    return (
      <div className="site00-pos-module-content">
        <section className="site00-pos-panel">
          <h2 className="site00-pos-panel__title">RECENT ACTIVITY</h2>
          {items.length ? (
            <ul className="site00-pos-activity-list">
              {items.map((a) => (
                <li key={a.id}>
                  <span>{a.summary}</span>
                  {a.timestamp ? <time dateTime={a.timestamp}>{a.timestamp}</time> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="site00-pos-empty">NO ACTIVITY YET.</p>
          )}
        </section>
      </div>
    );
  }

  if (activeSubnav === 'ALERTS') {
    const alerts = filterClientSafeStatuses(operatingState.blockers);
    return (
      <div className="site00-pos-module-content">
        <section className="site00-pos-panel">
          <h2 className="site00-pos-panel__title">ALERTS</h2>
          {alerts.length ? (
            <ul className="site00-pos-alert-list">
              {alerts.map((alert, i) => (
                <li key={i}>{alert}</li>
              ))}
            </ul>
          ) : (
            <p className="site00-pos-empty">NO ACTIVE ALERTS.</p>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="site00-pos-module-content">
      <section className="site00-pos-panel site00-pos-panel--hero">
        <div className="site00-pos-hero">
          <div className="site00-pos-hero__image" aria-hidden />
          <div>
            <p className="site00-pos-hero__tagline">{summary.tagline ?? summary.displayName}</p>
            <p className="site00-pos-hero__phase">{summary.phase}</p>
          </div>
        </div>
      </section>

      <section className="site00-pos-panel">
        <h2 className="site00-pos-panel__title">PROJECT PROGRESS</h2>
        <ul className="site00-pos-module-status-list">
          {moduleStatuses.map((m) => (
            <li key={m.moduleId}>
              <span>{m.label}</span>
              <span>{m.progressPercent != null ? `${m.progressPercent}%` : m.status}</span>
            </li>
          ))}
        </ul>
      </section>

      <NeedsYourEyeSection operatingState={operatingState} />

      {currentFocus ? (
        <section className="site00-pos-panel">
          <h2 className="site00-pos-panel__title">CURRENT FOCUS</h2>
          <p className="site00-pos-focus">{currentFocus}</p>
        </section>
      ) : null}
    </div>
  );
}

export function ProjectIdentityModule({ operatingState, activeSubnav }: ModulePanelProps) {
  const identity = operatingState.identityState;
  if (!identity) return <p className="site00-pos-empty">IDENTITY MODULE NOT ENABLED.</p>;

  const rows = [
    { label: 'BRAND TRUTH', value: identity.brandTruth },
    { label: 'PERSONALITY', value: identity.personality },
    { label: 'VOICE', value: identity.voice },
    { label: 'VISUAL DNA', value: identity.visualDna },
    { label: 'TERRITORIES', value: String(identity.territories) },
    { label: 'BRAND BIBLE', value: identity.brandBible },
    { label: 'ASSETS', value: String(identity.assets) },
  ];

  const filtered =
    activeSubnav === 'TRUTH'
      ? rows.slice(0, 2)
      : activeSubnav === 'VOICE'
        ? rows.slice(2, 3)
        : activeSubnav === 'DNA'
          ? rows.slice(3, 5)
          : rows;

  return (
    <div className="site00-pos-module-content site00-pos-module-content--identity">
      <section className="site00-pos-panel site00-pos-panel--editorial">
        <div className="site00-pos-identity-hero">
          <div className="site00-pos-identity-hero__image" aria-hidden />
          <p className="site00-pos-identity-hero__headline">CONFIDENCE HAS A NEW LOOK</p>
        </div>
        <ul className="site00-pos-status-rows">
          {filtered.map((row) => (
            <li key={row.label}>
              <span>{row.label}</span>
              <span className="site00-pos-status-rows__value">{row.value}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function ProjectBuilderModule({ operatingState, activeSubnav }: ModulePanelProps) {
  const builder = operatingState.builderState;
  if (!builder) return <p className="site00-pos-empty">BUILDER MODULE NOT ENABLED.</p>;

  return (
    <div className="site00-pos-module-content site00-pos-module-content--builder">
      <section className="site00-pos-panel">
        <h2 className="site00-pos-panel__title">BUILD PROGRESS {builder.buildProgressPercent}%</h2>
        <div className="site00-pos-stat-grid">
          <div><strong>{builder.pages}</strong><span>PAGES</span></div>
          <div><strong>{builder.templates}</strong><span>TEMPLATES</span></div>
          <div><strong>{builder.inReview}</strong><span>IN REVIEW</span></div>
          <div><strong>{builder.complete}</strong><span>COMPLETE</span></div>
        </div>
        {activeSubnav === 'PAGES' ? (
          <ul className="site00-pos-link-list">
            <li>PAGES / ROUTES</li>
            <li>FEATURES</li>
            <li>DESIGN</li>
            <li>QA</li>
            <li>DEPLOYMENTS</li>
          </ul>
        ) : null}
        {builder.blockers.length ? (
          <div className="site00-pos-blockers">
            <h3>BLOCKERS</h3>
            <ul>{builder.blockers.map((b) => <li key={b}>{b}</li>)}</ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export function ProjectEvolveModule({ operatingState, activeSubnav }: ModulePanelProps) {
  const evolve = operatingState.evolveState;
  if (!evolve) return <p className="site00-pos-empty">EVOLVE MODULE NOT ENABLED.</p>;

  return (
    <div className="site00-pos-module-content site00-pos-module-content--evolve">
      <section className="site00-pos-panel site00-pos-panel--editorial">
        <div className="site00-pos-evolve-hero">
          <div className="site00-pos-evolve-hero__image" aria-hidden />
          <p className="site00-pos-evolve-hero__headline">MORE HAIR. MORE YOU.</p>
        </div>
        <ul className="site00-pos-link-list">
          <li>CAMPAIGNS — {evolve.activeCampaigns} ACTIVE</li>
          <li>CONTENT OPS — {evolve.contentInProduction} IN PRODUCTION</li>
          <li>SOCIAL PACKAGES — {evolve.packagesReady} READY</li>
          <li>EMAIL / LANDING</li>
          <li>CREATIVE INTELLIGENCE</li>
          {evolve.analyticsEnabled ? <li>ANALYTICS</li> : null}
        </ul>
        {evolve.upNext ? (
          <div className="site00-pos-up-next">
            <h3>UP NEXT</h3>
            <p>{evolve.upNext}</p>
          </div>
        ) : null}
        {activeSubnav === 'CAMPAIGNS' ? <p className="site00-pos-subnav-hint">CAMPAIGNS VIEW ACTIVE</p> : null}
        {activeSubnav === 'CONTENT' ? <p className="site00-pos-subnav-hint">CONTENT OPS VIEW ACTIVE</p> : null}
      </section>
    </div>
  );
}

export function ProjectProductionModule({ operatingState, activeSubnav }: ModulePanelProps) {
  const production = operatingState.productionState;
  if (!production) return <p className="site00-pos-empty">PRODUCTION MODULE NOT ENABLED.</p>;

  return (
    <div className="site00-pos-module-content site00-pos-module-content--production">
      <section className="site00-pos-panel">
        <h2 className="site00-pos-panel__title">PRE-LAUNCH READYING FOR RELEASE</h2>
        <ul className="site00-pos-env-list">
          <li><span className="site00-pos-env-dot site00-pos-env-dot--active" />DEVELOPMENT — {production.development}</li>
          <li><span className="site00-pos-env-dot site00-pos-env-dot--updated" />STAGING — {production.staging}</li>
          <li><span className="site00-pos-env-dot" />PRODUCTION — {production.production}</li>
        </ul>
        {activeSubnav === 'READINESS' ? (
          <p className="site00-pos-checklist">
            LAUNCH CHECKLIST — {production.launchChecklistComplete}/{production.launchChecklistTotal}
          </p>
        ) : null}
        {production.blockers.length ? (
          <div className="site00-pos-blockers">
            <h3>BLOCKERS</h3>
            <ul>{production.blockers.map((b) => <li key={b}>{b}</li>)}</ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export function ProjectReviewsModule({ operatingState }: ModulePanelProps) {
  const reviews = operatingState.reviewsState;
  return (
    <div className="site00-pos-module-content">
      <section className="site00-pos-panel">
        <h2 className="site00-pos-panel__title">REVIEWS</h2>
        {reviews.length ? (
          <ul className="site00-pos-review-list">
            {reviews.map((r) => (
              <li key={r.id}>
                <span>{r.label}</span>
                <span>{r.module}</span>
                <span>{r.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="site00-pos-empty">NO PENDING REVIEWS.</p>
        )}
      </section>
    </div>
  );
}

export function ProjectLibraryModule({ operatingState }: ModulePanelProps) {
  const library = operatingState.libraryState;
  return (
    <div className="site00-pos-module-content">
      <section className="site00-pos-panel">
        <h2 className="site00-pos-panel__title">LIBRARY</h2>
        {library ? (
          <div className="site00-pos-stat-grid">
            <div><strong>{library.assetCount}</strong><span>ASSETS</span></div>
            <div><strong>{library.deliverableCount}</strong><span>DELIVERABLES</span></div>
          </div>
        ) : (
          <p className="site00-pos-empty">LIBRARY NOT CONFIGURED.</p>
        )}
      </section>
    </div>
  );
}

export function ProjectMoreModule({ operatingState }: ModulePanelProps) {
  return (
    <div className="site00-pos-module-content">
      <section className="site00-pos-panel">
        <h2 className="site00-pos-panel__title">MORE</h2>
        <ul className="site00-pos-link-list">
          <li>PROJECT SETTINGS</li>
          <li>CONNECTIONS</li>
          <li>ACTIVITY LOG</li>
          <li>MODULE CONFIGURATION — {operatingState.capabilityManifest.enabledModules.join(', ')}</li>
        </ul>
      </section>
    </div>
  );
}
