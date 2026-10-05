import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import { useEvolveOperationsPortfolio } from '../../../hooks/useEvolveOperationsPortfolio';

/** Founder Control Room summary card — not a giant ops table. */
export function EvolveOperationsCard() {
  const { page } = useEvolveOperationsPortfolio();

  return (
    <section className="site00-ctrl-panel site00-evolve-ops-card" data-visual-authority="VISUAL_AUTHORITY_REQUIRED">
      <div className="site00-evolve-ops-card__head">
        <h2 className="site00-ctrl-panel__title">EVOLVE OPERATIONS</h2>
        <span className="site00-evolve-ops-card__badge">INTELLIGENCE</span>
      </div>
      <div className="site00-evolve-ops-card__metrics">
        <div>
          <strong>{page.summary.needsAttention}</strong>
          <span>NEEDS ATTENTION</span>
        </div>
        <div>
          <strong>{page.summary.highValueAtRisk}</strong>
          <span>HIGH-PRIORITY</span>
        </div>
        <div>
          <strong>{page.summary.blocked}</strong>
          <span>BLOCKED</span>
        </div>
        <div>
          <strong>{page.summary.spendWatch}</strong>
          <span>SPEND WATCH</span>
        </div>
        <div>
          <strong>{page.summary.systemFailures}</strong>
          <span>FAILURES</span>
        </div>
      </div>
      <Link className="site00-btn-ghost-sm site00-evolve-ops-card__cta" to={SITE00_ROUTES.controlEvolveOperations}>
        OPEN EVOLVE OPERATIONS →
      </Link>
    </section>
  );
}
