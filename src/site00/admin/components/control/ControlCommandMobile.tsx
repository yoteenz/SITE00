import { Link } from 'react-router-dom';
import type { ControlCommandPayload } from '../../types/control';
import { ActivityLedger } from './ActivityLedger';
import { ControlMetricRail } from './ControlMetricRail';
import { PriorityQueue } from './PriorityQueue';
import { LaunchQueuePanel, UpcomingReviewsPanel } from './ReviewLaunchPanels';
import { NeedsYouPanel, FocusNowPanel } from '../orchestration/NeedsYouPanel';
import { OrchestrationCommandQueue } from '../orchestration/OrchestrationCommandQueue';
import { CONTROL_MOBILE_QUICK_ACTIONS } from '../../config/control-nav';
import { ProductionSpine } from '../../../components/studio/ProductionSpine';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

type ControlCommandMobileProps = {
  data: ControlCommandPayload;
};

/** Map aggregate matrix state to spine stages for mobile summary */
function spineFromMatrix(data: ControlCommandPayload) {
  const first = data.productionMatrix[0];
  if (!first) {
    return data.productionSpineSummary.map((s) => ({ id: s.id, index: s.id === 'origin' ? '00' : '01', label: s.label, status: 'upcoming' }));
  }
  const indexById: Record<string, string> = {
    origin: '00', identity: '01', blueprint: '02', assets: '03', build: '04', qa: '05', launch: '06',
  };
  return data.productionSpineSummary.map((s) => {
    const cell = first.cells[s.id] ?? 'UPCOMING';
    const status =
      cell === 'COMPLETE' ? 'complete'
      : cell === 'IN_PROGRESS' || cell === 'REVIEW' ? 'in_progress'
      : cell === 'AWAITING_CLIENT' ? 'awaiting_client'
      : cell === 'BLOCKED' ? 'blocked'
      : 'upcoming';
    return { id: s.id, index: indexById[s.id] ?? '00', label: s.label, status };
  });
}

export function ControlCommandMobile({ data }: ControlCommandMobileProps) {
  const orch = data.orchestration;
  const topPriority = data.priorityQueue[0];
  const spineStages = spineFromMatrix(data);

  if (orch) {
    return (
      <div className="site00-control-command site00-control-command--mobile">
        <ControlMetricRail metrics={data.metrics} />
        <NeedsYouPanel items={orch.needsYou} />
        <FocusNowPanel items={orch.focusNow} />
        <OrchestrationCommandQueue items={orch.commandQueue} compact />
        <ActivityLedger items={data.activity} />
        <nav className="site00-control-quick-actions" aria-label="OPERATOR QUICK ACTIONS">
          <Link to={SITE00_ADMIN_ROUTES.reconciliation} className="site00-control-quick-actions__btn">RECONCILIATION</Link>
          {CONTROL_MOBILE_QUICK_ACTIONS.map((a) => (
            <Link key={a.id} to={a.href} className="site00-control-quick-actions__btn">{a.label}</Link>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="site00-control-command site00-control-command--mobile">
      <ControlMetricRail metrics={data.metrics} />
      <PriorityQueue items={data.priorityQueue} compact />

      <section className="site00-control-panel">
        <div className="site00-control-panel__head">
          <h2 className="site00-control-panel__title">PRODUCTION SPINE</h2>
          <Link to="/admin/site00/projects" className="site00-control-panel__link">ALL PROJECTS →</Link>
        </div>
        <ProductionSpine stages={spineStages} />
      </section>

      {topPriority ? (
        <section className="site00-control-panel site00-control-panel--current">
          <h2 className="site00-control-panel__title">CURRENT PRODUCTION</h2>
          <p className="site00-control-current__title">{topPriority.title}</p>
          <p className="site00-control-current__desc">{topPriority.projectName} — {topPriority.detail}</p>
          <Link to={topPriority.route} className="site00-control-cta">ENTER OPERATION →</Link>
        </section>
      ) : null}

      <div className="site00-control-mobile-dual">
        <UpcomingReviewsPanel items={data.upcomingReviews} />
        <ActivityLedger items={data.activity} />
      </div>

      <LaunchQueuePanel items={data.launchQueue} />

      <nav className="site00-control-quick-actions" aria-label="OPERATOR QUICK ACTIONS">
        {CONTROL_MOBILE_QUICK_ACTIONS.map((a) => (
          <Link key={a.id} to={a.href} className="site00-control-quick-actions__btn">{a.label}</Link>
        ))}
      </nav>
    </div>
  );
}
