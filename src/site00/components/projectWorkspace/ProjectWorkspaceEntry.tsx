import { Link } from 'react-router-dom';
import type { ProjectWorkspaceEntryRole } from '../../../../shared/site00-brand-lore/projectWorkspace/projectsPageMapping.js';

type ProjectWorkspaceEntryProps = {
  entry: ProjectWorkspaceEntryRole;
  variant?: 'dominant' | 'standard' | 'compact';
};

export function ProjectWorkspaceEntry({ entry, variant = 'standard' }: ProjectWorkspaceEntryProps) {
  const weightClass =
    variant === 'dominant' || entry.visualWeight === 'DOMINANT'
      ? 'site00-pws-entry--dominant'
      : variant === 'compact'
        ? 'site00-pws-entry--compact'
        : '';

  return (
    <article className={`site00-pws-entry ${weightClass}`.trim()} aria-label={`Project ${entry.displayName}`}>
      <Link to={entry.detailRoute} className="site00-pws-entry__link">
        <div className="site00-pws-entry__signature" aria-hidden="true">
          <span className="site00-pws-entry__sig-mark">◈</span>
          {entry.clientSignature ? (
            <span className="site00-pws-entry__sig-label">{entry.clientSignature}</span>
          ) : null}
        </div>
        <div className="site00-pws-entry__body">
          <p className="site00-pws-entry__class">{entry.projectClass.replace(/_/g, ' ')}</p>
          <h3 className="site00-pws-entry__name">{entry.displayName}</h3>
          {entry.activePieceLabel ? (
            <p className="site00-pws-entry__active-piece">
              ACTIVE PIECE · {entry.activePieceLabel}
            </p>
          ) : null}
          {entry.workState ? (
            <p className="site00-pws-entry__state">ON THE BENCH · {entry.workState.replace(/_/g, ' ')}</p>
          ) : null}
          {entry.reviewState ? (
            <p className="site00-pws-entry__review">REVIEW TRAY · {entry.reviewState}</p>
          ) : null}
          {entry.productionState ? (
            <p className="site00-pws-entry__production">{entry.productionState.replace(/_/g, ' ')}</p>
          ) : null}
        </div>
        <span className="site00-pws-entry__cta">ENTER WORKSPACE →</span>
      </Link>
    </article>
  );
}
