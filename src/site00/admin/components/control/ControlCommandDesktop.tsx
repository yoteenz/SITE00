import { Link } from 'react-router-dom';
import type { ControlCommandPayload } from '../../types/control';
import { ActivityLedger } from './ActivityLedger';
import { ControlMetricRail } from './ControlMetricRail';
import { PriorityQueue } from './PriorityQueue';
import { ProductionMatrix } from './ProductionMatrix';
import { LaunchQueuePanel, UpcomingReviewsPanel } from './ReviewLaunchPanels';
import { SystemHealthPanel } from './SystemHealthPanel';
import { PortfolioPanel } from '../orchestration/PortfolioPanel';
import { NeedsYouPanel, FocusNowPanel } from '../orchestration/NeedsYouPanel';
import { OrchestrationCommandQueue } from '../orchestration/OrchestrationCommandQueue';
import { ExternalConnectionHealthPanel, DriftVisibilityPanel } from '../orchestration/ExternalConnectionHealthPanel';
import { ProjectSwitcher } from '../orchestration/ProjectSwitcher';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

type ControlCommandDesktopProps = {
  data: ControlCommandPayload;
};

export function ControlCommandDesktop({ data }: ControlCommandDesktopProps) {
  const orch = data.orchestration;

  return (
    <div className="site00-control-command site00-control-command--desktop">
      {orch ? (
        <div className="site00-orchestration-command-bar">
          <ProjectSwitcher
            organizations={orch.organizations.map((o) => ({ slug: o.slug, name: o.name, clientFacing: o.clientFacing }))}
            includeAll
          />
          <Link to={SITE00_ADMIN_ROUTES.reconciliation} className="site00-control-panel__link">
            RECONCILIATION INBOX ({orch.reconciliationInbox.length}) →
          </Link>
          <Link to={SITE00_ADMIN_ROUTES.evolve} className="site00-control-panel__link">
            EVOLVE →
          </Link>
        </div>
      ) : null}

      <ControlMetricRail metrics={data.metrics} />

      {orch ? (
        <div className="site00-orchestration-command-grid">
          <div className="site00-orchestration-command-grid__primary">
            <NeedsYouPanel items={orch.needsYou} />
            <FocusNowPanel items={orch.focusNow} />
            <OrchestrationCommandQueue items={orch.commandQueue} />
            <PortfolioPanel portfolio={orch.portfolio} infrastructure={orch.infrastructure} />
          </div>
          <div className="site00-orchestration-command-grid__secondary">
            <ExternalConnectionHealthPanel connections={orch.connections} />
            <DriftVisibilityPanel alerts={orch.driftAlerts} />
            <ActivityLedger items={data.activity} viewAllHref={SITE00_ADMIN_ROUTES.activity} />
            <LaunchQueuePanel items={data.launchQueue} />
          </div>
        </div>
      ) : (
        <div className="site00-control-command__grid">
          <div className="site00-control-command__primary">
            <PriorityQueue items={data.priorityQueue} viewAllHref={SITE00_ADMIN_ROUTES.activity} />
            <ProductionMatrix stages={data.matrixStages} rows={data.productionMatrix} />
          </div>
          <div className="site00-control-command__secondary">
            <UpcomingReviewsPanel items={data.upcomingReviews} />
            <ActivityLedger items={data.activity} viewAllHref={SITE00_ADMIN_ROUTES.activity} />
            <LaunchQueuePanel items={data.launchQueue} />
          </div>
          <div className="site00-control-command__health">
            <SystemHealthPanel health={data.systemHealth} />
          </div>
        </div>
      )}
    </div>
  );
}
