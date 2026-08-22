import { Link } from 'react-router-dom';
import type { PortfolioEntry, InfrastructureEntry } from '../../types/orchestration';

type PortfolioPanelProps = {
  portfolio: PortfolioEntry[];
  infrastructure: InfrastructureEntry[];
};

function healthClass(health: string): string {
  const h = health.toUpperCase();
  if (h.includes('BLOCK')) return 'site00-control-priority__pill--blocked';
  if (h.includes('ATTENTION') || h.includes('REVIEW')) return 'site00-control-priority__pill--action';
  if (h.includes('ON_TRACK') || h.includes('OPERATIONAL')) return 'site00-control-priority__pill--ready';
  return 'site00-control-priority__pill--info';
}

export function PortfolioPanel({ portfolio, infrastructure }: PortfolioPanelProps) {
  return (
    <section className="site00-control-panel" aria-labelledby="portfolio-heading">
      <div className="site00-control-panel__head">
        <h2 id="portfolio-heading" className="site00-control-panel__title">ACTIVE PORTFOLIO</h2>
      </div>
      <table className="site00-admin-table site00-control-table site00-orchestration-table">
        <thead>
          <tr>
            <th>PROJECT</th>
            <th>TARGET</th>
            <th>READINESS</th>
            <th>HEALTH</th>
            <th>BLOCKERS</th>
            <th>NEEDS YOU</th>
            <th>NEXT ACTION</th>
          </tr>
        </thead>
        <tbody>
          {portfolio.map((p) => (
            <tr key={p.id}>
              <td>
                <Link to={p.route} className="site00-orchestration-link">{p.name}</Link>
                <span className="site00-orchestration-meta">{p.classification.replace(/_/g, ' ')}</span>
              </td>
              <td>
                {p.launchTarget ?? '—'}
                {p.isProvisional ? <span className="site00-orchestration-tag">PROVISIONAL</span> : null}
              </td>
              <td>
                {p.readinessScore != null ? (
                  <>
                    {p.readinessScore}%
                    <span className="site00-orchestration-meta">{p.requiredComplete} required</span>
                  </>
                ) : '—'}
              </td>
              <td><span className={`site00-control-priority__pill ${healthClass(p.projectHealth)}`}>{p.projectHealth.replace(/_/g, ' ')}</span></td>
              <td>{p.blockerCount}</td>
              <td>{p.pendingDecisionCount}</td>
              <td className="site00-orchestration-meta">{p.nextAction ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {infrastructure.length > 0 ? (
        <>
          <h3 className="site00-orchestration-section-title">PRODUCTION INFRASTRUCTURE</h3>
          <ul className="site00-orchestration-infra-list">
            {infrastructure.map((inf) => (
              <li key={inf.id}>
                <Link to={inf.route} className="site00-orchestration-infra-card">
                  <span className="site00-orchestration-infra-card__name">{inf.name}</span>
                  <span className={`site00-control-priority__pill ${healthClass(inf.health)}`}>{inf.health}</span>
                  <span className="site00-orchestration-meta">{inf.connectionState}</span>
                  {inf.limitation ? <span className="site00-orchestration-meta">{inf.limitation}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
