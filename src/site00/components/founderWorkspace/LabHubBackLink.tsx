import { Link } from 'react-router-dom';
import { site00ProjectLabPath } from '../../config/routes';

type LabHubBackLinkProps = {
  projectSlug: string;
  className?: string;
};

/** Canonical back path from Experiments or Character workspaces to Lab Hub. */
export function LabHubBackLink({ projectSlug, className }: LabHubBackLinkProps) {
  return (
    <Link to={site00ProjectLabPath(projectSlug)} className={className ?? 'site00-lab-hub-back'}>
      ← LAB
    </Link>
  );
}
