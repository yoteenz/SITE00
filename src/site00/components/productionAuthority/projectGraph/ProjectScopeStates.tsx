/**
 * Project-scoped states that are not errors:
 *  - ProjectSelectState  no project chosen yet → pick one (never another project's data as a default)
 *  - DomainEmptyState    the project has no truth for this work domain → say whose, why, and what would establish it
 */
import { Link, useLocation } from 'react-router-dom';
import { domainHeadline, scopedTabHref, workspaceTabOf, type DomainState, type WorkDomain } from '../../../../../shared/site00-production-graph/index.js';
import { listHostProductionProjects } from '../../../projectRuntime/projectHostProfile';
import { IaIcon } from '../iaKit';

export function ProjectSelectState() {
  const { pathname } = useLocation();
  const tab = workspaceTabOf(pathname) ?? 'HUB';
  return (
    <section className="iax-panel pgx-select" data-testid="production-project-select" data-state="NO_PROJECT">
      <header className="iax-panel__head">
        <h2>
          <i aria-hidden />
          SELECT A PROJECT
        </h2>
      </header>
      <p className="pgx-lede">
        The production workspace shows one project&rsquo;s truth at a time. Choose the project to open its {tab}.
      </p>
      <ul className="pgx-list" data-testid="production-project-select-list">
        {listHostProductionProjects().map((p) => (
          <li key={p.slug}>
            <Link to={scopedTabHref(tab, p.slug)} data-testid={`production-project-select-${p.slug}`}>
              <b>{p.name}</b>
              <small>{p.kind}</small>
              <IaIcon name="next" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const DOMAIN_LABEL: Record<WorkDomain, string> = {
  DESIGN: 'SITE / DIGITAL-LOCATION DESIGN',
  EXPERIENCE: 'WORLD-BUILDING / SPATIAL EXPERIENCE',
  EXPRESSION: 'EXPRESSION / CAMPAIGN / CAST PRODUCTION',
};

export function DomainEmptyState({
  projectId,
  projectName,
  state,
  action,
}: {
  projectId: string;
  projectName: string;
  state: DomainState;
  action?: { to: string; label: string } | null;
}) {
  return (
    <section
      className="iax-panel pgx-empty pgx-domain-absence"
      data-testid={`domain-empty-${state.domain.toLowerCase()}`}
      data-project={projectId}
      data-domain={state.domain}
      data-state="NOT_ESTABLISHED"
    >
      <div className="pgx-domain-absence__band" aria-hidden>
        <span className="pgx-media-ph pgx-domain-absence__glyph" data-media-status="AUTHORITY_NOT_ESTABLISHED">
          <em>{projectId.slice(0, 4).toUpperCase()}</em>
          <small>{state.domain}</small>
        </span>
        <ul className="pgx-domain-absence__map">
          <li data-live="true">HUB</li>
          <li data-live="true">DESIGN</li>
          <li data-live={state.domain === 'EXPERIENCE' ? 'false' : 'true'}>EXPERIENCE</li>
          <li data-live={state.domain === 'EXPRESSION' ? 'false' : 'true'}>EXPRESSION</li>
        </ul>
      </div>
      <header className="iax-panel__head">
        <h2>
          <i aria-hidden />
          {projectName} · {state.domain}
        </h2>
      </header>
      <small className="pgx-kicker">{DOMAIN_LABEL[state.domain]}</small>
      <b className="pgx-headline">{domainHeadline(state.domain, projectName)}</b>
      <p>{state.reason}</p>
      <p className="pgx-hint">{state.establish_hint}</p>
      <div className="pgx-actions">
        <Link to={scopedTabHref('HUB', projectId)} className="iax-btn iax-btn--line" data-testid="domain-empty-hub">
          {projectName} HUB
        </Link>
        {state.domain !== 'DESIGN' ?
          <Link to={scopedTabHref('DESIGN', projectId)} className="iax-btn iax-btn--ghost" data-testid="domain-empty-design">
            {projectName} DESIGN
          </Link>
        : null}
        {action ?
          <Link to={action.to} className="iax-btn iax-btn--ghost" data-testid="domain-empty-action">
            {action.label}
          </Link>
        : null}
      </div>
    </section>
  );
}
