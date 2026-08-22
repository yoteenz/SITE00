import { Link } from 'react-router-dom';
import type { ClientStudioOperation } from '../../services/clientProductionApi';

type StudioOperationsPanelProps = {
  operations: ClientStudioOperation[];
  viewAllRoute: string;
  activeCount: number;
};

export function StudioOperationsPanel({ operations, viewAllRoute, activeCount }: StudioOperationsPanelProps) {
  return (
    <section className="site00-studio-panel site00-studio-panel--studio" aria-labelledby="studio-studio">
      <h2 id="studio-studio" className="site00-studio-panel__eyebrow">
        STUDIO
        {activeCount > 0 ? <span className="site00-studio-panel__count">{String(activeCount).padStart(2, '0')} OPERATIONS ACTIVE</span> : null}
      </h2>
      {operations.length === 0 ? (
        <p className="site00-studio-panel__empty">STUDIO IS CURRENTLY IN PRODUCTION</p>
      ) : (
        <ul className="site00-studio-ops-list">
          {operations.slice(0, 4).map((op) => (
            <li key={op.id}>
              <Link to={op.route} className="site00-studio-ops-row">
                <span className="site00-studio-ops-row__title">{op.title}</span>
                <span className="site00-studio-ops-row__status site00-studio-ops-row__status--active">
                  <span className="site00-studio-ops-row__dot" aria-hidden="true" />
                  {op.statusLabel}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link to={viewAllRoute} className="site00-studio-panel__link">VIEW ALL OPERATIONS →</Link>
    </section>
  );
}
