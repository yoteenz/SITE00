import { Link } from 'react-router-dom';
import type { Site00FounderProjectSlug } from '../../../../shared/site00-projects/types';
import {
  site00AdminEvolveRoute,
  site00AdminOrchestrationRoute,
} from '../../../../shared/site00-access/routes';
import { useExperienceContext } from '../../state/experienceContext';

type ProjectPrivilegedUtilitiesProps = {
  slug: Site00FounderProjectSlug;
  organizationUuid: string;
};

export function ProjectPrivilegedUtilities({ slug, organizationUuid }: ProjectPrivilegedUtilitiesProps) {
  const { showPrivilegedUtilities } = useExperienceContext();

  if (!showPrivilegedUtilities) return null;

  return (
    <aside className="site00-project-privileged" aria-label="Admin project utilities">
      <p className="site00-project-privileged__kicker">ADMIN UTILITIES</p>
      <ul className="site00-project-privileged__list">
        <li>
          <Link to={site00AdminOrchestrationRoute(slug)}>OPEN ADMIN RECORD →</Link>
        </li>
        <li>
          <Link to={site00AdminOrchestrationRoute(slug)}>INSPECT PROVENANCE →</Link>
        </li>
        <li>
          <Link to={site00AdminOrchestrationRoute(slug)}>OPEN ORCHESTRATION →</Link>
        </li>
        <li>
          <Link to={site00AdminEvolveRoute(slug, 'creative-direction')}>DEBUG ENGAGEMENT →</Link>
        </li>
      </ul>
      <p className="site00-project-privileged__uuid">UUID · {organizationUuid}</p>
    </aside>
  );
}
