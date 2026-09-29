import { Link, useParams } from 'react-router-dom';
import { subWorkspacesFor } from '../../../../shared/site00-production-workspace/registry.js';
import { productionExperiencePath } from '../../../../shared/site00-production-workspace/routes.js';
import { site00ProjectExperienceWorkspacePath } from '../../config/routes';

/** Production → EXPERIENCE mount (reuses existing project experience routes where applicable). */
export function ExperienceProductionShellPage() {
  const { projectSlug = 'ndxbook', '*': rest } = useParams<{ projectSlug: string; '*': string }>();
  const slug = projectSlug.toLowerCase();
  const sub = rest?.split('/')[0] ?? 'world';
  const subs = subWorkspacesFor('EXPERIENCE');

  return (
    <div className="site00-production-pillar" data-testid="production-experience-shell">
      <h2 className="site00-heading">EXPERIENCE</h2>
      <nav aria-label="Experience sub-workspaces">
        <ul>
          {subs.map((s) => (
            <li key={s.id}>
              <Link
                to={productionExperiencePath(slug, s.id)}
                aria-current={sub === s.id ? 'page' : undefined}
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="site00-body">{subs.find((s) => s.id === sub)?.description ?? 'Experience production surface'}</p>
      {sub === 'modules' ? (
        <Link to={site00ProjectExperienceWorkspacePath(slug, 'build-a-wig', 'overview')}>
          OPEN EXISTING EXPERIENCE WORKSPACE →
        </Link>
      ) : null}
    </div>
  );
}
