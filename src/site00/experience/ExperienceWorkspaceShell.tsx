import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  EXPERIENCE_AGENT_ROLES,
  EXPERIENCE_WORKSPACE_TABS,
  EXPERIENCE_TOOL_REGISTRY,
  type ExperienceRecord,
  type ExperienceWorkspaceTab,
} from '../../../shared/site00-experience-workspace/index.js';
import { experienceModuleBasePath } from '../../../shared/site00-experience-workspace/paths.js';
import { site00ProjectsDesignActiveProjectPath } from '../config/routes';

type ExperienceWorkspaceShellProps = {
  projectSlug: string;
  projectLabel: string;
  isDesktop: boolean;
  activeTab: ExperienceWorkspaceTab;
  experienceList: readonly ExperienceRecord[];
  activeExperience: ExperienceRecord | null;
  onSelectExperience: (slug: string) => void;
  onSelectTab: (tab: ExperienceWorkspaceTab) => void;
  children: ReactNode;
  onQuickAction: (actionId: string) => void;
  actionNotice: string | null;
};

const TAB_LABELS: Record<ExperienceWorkspaceTab, string> = {
  overview: 'OVERVIEW',
  scenes: 'SCENES',
  characters: 'CHARACTERS',
  assets: 'ASSETS',
  mechanics: 'MECHANICS',
  builds: 'BUILDS',
  history: 'HISTORY',
  more: 'MORE',
};

export function ExperienceWorkspaceShell({
  projectSlug,
  projectLabel,
  isDesktop,
  activeTab,
  experienceList,
  activeExperience,
  onSelectExperience,
  onSelectTab,
  children,
  onQuickAction,
  actionNotice,
}: ExperienceWorkspaceShellProps) {
  return (
    <div
      className={`site00-expws${isDesktop ? ' site00-expws--desktop' : ' site00-expws--mobile'}`}
      data-site00-surface="experience-workspace"
      data-project-slug={projectSlug}
      data-experience-slug={activeExperience?.slug ?? ''}
    >
      <header className="site00-expws__header">
        <nav className="site00-expws__crumbs" aria-label="Breadcrumb">
          <Link to="/projects">PROJECTS</Link>
          <span aria-hidden="true">›</span>
          <Link to={`/projects/${projectSlug}`}>{projectLabel}</Link>
          <span aria-hidden="true">›</span>
          <span>EXPERIENCE</span>
          {activeExperience ? (
            <>
              <span aria-hidden="true">›</span>
              <span>{activeExperience.name}</span>
            </>
          ) : null}
        </nav>

        <div className="site00-expws__selectors">
          <label className="site00-expws__select">
            <span className="site00-expws__select-label">PROJECT</span>
            <select
              value={projectSlug}
              onChange={() => {
                /* project switch handled via module nav */
              }}
              disabled
            >
              <option value={projectSlug}>{projectLabel}</option>
            </select>
          </label>

          <label className="site00-expws__select">
            <span className="site00-expws__select-label">EXPERIENCE</span>
            <select
              value={activeExperience?.slug ?? ''}
              onChange={(e) => onSelectExperience(e.target.value)}
              data-testid="experience-selector"
            >
              {experienceList.map((exp) => (
                <option key={exp.experienceId} value={exp.slug}>
                  {exp.name}
                </option>
              ))}
            </select>
          </label>

          {activeExperience ? (
            <span className="site00-expws__status-tag">{activeExperience.status.replace(/_/g, ' ')}</span>
          ) : null}
        </div>

        {isDesktop ? (
          <div className="site00-expws__agents">
            {EXPERIENCE_AGENT_ROLES.map((role) => (
              <button
                key={role.agent}
                type="button"
                className="site00-expws__agent-btn"
                onClick={() => onQuickAction(`agent-${role.agent.toLowerCase()}`)}
              >
                {role.label}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      <nav className="site00-expws__tabs" aria-label="Experience workspace">
        {EXPERIENCE_WORKSPACE_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`site00-expws__tab${activeTab === tab ? ' is-active' : ''}`}
            onClick={() => onSelectTab(tab)}
            aria-current={activeTab === tab ? 'page' : undefined}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </nav>

      {actionNotice ? <p className="site00-expws__action-notice">{actionNotice}</p> : null}

      <main className="site00-expws__main">{children}</main>

      <footer className="site00-expws__footer">
        <div className="site00-expws__module-links">
          <Link to={site00ProjectsDesignActiveProjectPath(projectSlug)}>DESIGN MODULE</Link>
          <Link to={experienceModuleBasePath(projectSlug)}>EXPERIENCE MODULE</Link>
          <Link to="/projects">PROJECTS INDEX</Link>
        </div>
        <p className="site00-expws__tools-meta">
          TOOLS REGISTERED: {EXPERIENCE_TOOL_REGISTRY.length} · NONE VERIFIED CONNECTED
        </p>
      </footer>
    </div>
  );
}
