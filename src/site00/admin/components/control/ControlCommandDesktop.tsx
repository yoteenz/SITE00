import type { ControlCommandPayload } from '../../types/control';
import { ActivityLedger } from './ActivityLedger';
import { ControlMetricRail } from './ControlMetricRail';
import { PriorityQueue } from './PriorityQueue';
import { ProductionMatrix } from './ProductionMatrix';
import { LaunchQueuePanel, UpcomingReviewsPanel } from './ReviewLaunchPanels';
import { SystemHealthPanel } from './SystemHealthPanel';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

type ControlCommandDesktopProps = {
  data: ControlCommandPayload;
};

export function ControlCommandDesktop({ data }: ControlCommandDesktopProps) {
  return (
    <div className="site00-control-command site00-control-command--desktop">
      <ControlMetricRail metrics={data.metrics} />
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
    </div>
  );
}
