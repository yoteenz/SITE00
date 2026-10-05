import { Link } from 'react-router-dom';
import type { CommandQueueDisplayItem } from '../../types/orchestration';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

const CATEGORY_ORDER = ['NEEDS_YOU', 'BLOCKED', 'RUNNING', 'UPCOMING', 'POST_LAUNCH'] as const;

function categoryClass(category: string): string {
  switch (category) {
    case 'NEEDS_YOU': return 'site00-control-priority__pill--critical';
    case 'BLOCKED': return 'site00-control-priority__pill--blocked';
    case 'RUNNING': return 'site00-control-priority__pill--action';
    case 'UPCOMING': return 'site00-control-priority__pill--info';
    case 'POST_LAUNCH': return 'site00-control-priority__pill--milestone';
    default: return 'site00-control-priority__pill--info';
  }
}

type OrchestrationCommandQueueProps = {
  items: CommandQueueDisplayItem[];
  orgFilter?: string;
  compact?: boolean;
};

export function OrchestrationCommandQueue({ items, orgFilter, compact }: OrchestrationCommandQueueProps) {
  const filtered = orgFilter ? items.filter((i) => i.organizationSlug === orgFilter) : items;
  const sorted = [...filtered].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.category as typeof CATEGORY_ORDER[number]);
    const bi = CATEGORY_ORDER.indexOf(b.category as typeof CATEGORY_ORDER[number]);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.priority - b.priority;
  });

  return (
    <section className="site00-control-panel" aria-labelledby="orch-queue-heading">
      <div className="site00-control-panel__head">
        <h2 id="orch-queue-heading" className="site00-control-panel__title">COMMAND QUEUE</h2>
        <Link to={SITE00_ADMIN_ROUTES.reconciliation} className="site00-control-panel__link">RECONCILIATION →</Link>
      </div>
      {sorted.length === 0 ? (
        <p className="site00-control-empty">NO ACTIVE COMMANDS</p>
      ) : (
        <ul className="site00-control-priority-list">
          {sorted.slice(0, compact ? 6 : 15).map((item) => (
            <li key={item.id}>
              <Link to={item.route} className="site00-control-priority-row">
                <span className={`site00-control-priority__pill ${categoryClass(item.category)}`}>{item.category.replace(/_/g, ' ')}</span>
                <div className="site00-control-priority-row__body">
                  <p className="site00-control-priority-row__project">{item.organizationName}</p>
                  <p className="site00-control-priority-row__title">{item.requirementTitle}</p>
                  {!compact ? <p className="site00-control-priority-row__detail">{item.reason}</p> : null}
                </div>
                <span className="site00-orchestration-meta">{item.actionLabel}</span>
                <span className="site00-control-priority-row__chev" aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
