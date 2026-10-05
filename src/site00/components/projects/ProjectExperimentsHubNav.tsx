import { Link, useLocation } from 'react-router-dom';
import {
  flattenProjectExperimentsHubNav,
  getProjectExperimentsHubEntries,
  resolveProjectExperimentsHubNavIndex,
} from '../../config/projectExperimentsHub';
import { site00ProjectExperimentsPath, site00ProjectLabPath } from '../../config/routes';

type ProjectExperimentsHubNavProps = {
  projectSlug: string;
};

/** Sequential prev/next + hub link — mount on every methodology / experiment page. */
export function ProjectExperimentsHubNav({ projectSlug }: ProjectExperimentsHubNavProps) {
  const { pathname } = useLocation();
  const entries = getProjectExperimentsHubEntries(projectSlug);
  if (!entries.length) return null;

  const items = flattenProjectExperimentsHubNav(entries);
  const index = resolveProjectExperimentsHubNavIndex(pathname, items);
  const prev = index > 0 ? items[index - 1] : null;
  const next = index >= 0 && index < items.length - 1 ? items[index + 1] : null;
  const hubPath = site00ProjectExperimentsPath(projectSlug);

  return (
    <nav className="site00-experiments-hub-nav" aria-label="Methodology experiments navigation">
      <Link to={site00ProjectLabPath(projectSlug)} className="site00-experiments-hub-nav__hub">
        LAB
      </Link>
      <span className="site00-experiments-hub-nav__sep" aria-hidden="true">
        ›
      </span>
      <Link to={hubPath} className="site00-experiments-hub-nav__hub">
        EXPERIMENTS HUB
      </Link>
      {prev ? (
        <Link to={prev.path} className="site00-experiments-hub-nav__step">
          ← {prev.letter ? `EXP ${prev.letter}` : prev.title}
        </Link>
      ) : (
        <span className="site00-experiments-hub-nav__step site00-experiments-hub-nav__step--muted">← START</span>
      )}
      {next ? (
        <Link to={next.path} className="site00-experiments-hub-nav__step">
          {next.letter ? `EXP ${next.letter}` : next.title} →
        </Link>
      ) : (
        <span className="site00-experiments-hub-nav__step site00-experiments-hub-nav__step--muted">END →</span>
      )}
    </nav>
  );
}
