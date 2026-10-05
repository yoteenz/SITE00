import { Link } from 'react-router-dom';
import type { ClientStudioInputTask } from '../../services/clientProductionApi';

type ClientOperationsPanelProps = {
  operations: ClientStudioInputTask[];
  viewAllRoute: string;
};

export function ClientOperationsPanel({ operations, viewAllRoute }: ClientOperationsPanelProps) {
  return (
    <section className="site00-studio-panel site00-studio-panel--you" aria-labelledby="studio-you">
      <h2 id="studio-you" className="site00-studio-panel__eyebrow">YOU</h2>
      {operations.length === 0 ? (
        <p className="site00-studio-panel__empty">NO CLIENT ACTIONS PENDING</p>
      ) : (
        <ul className="site00-studio-ops-list">
          {operations.slice(0, 4).map((op) => (
            <li key={op.id}>
              <Link to={op.route} className="site00-studio-ops-row">
                <span className="site00-studio-ops-row__title">{op.title}</span>
                <span className="site00-studio-ops-row__status">{op.statusLabel}</span>
                <span className="site00-studio-ops-row__chev" aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link to={viewAllRoute} className="site00-studio-panel__link">VIEW ALL INPUT →</Link>
    </section>
  );
}
