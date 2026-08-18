import { CtrlRoomShell } from '../../components/control/CtrlRoomShell';
import { CtrlRoomMetricCard } from '../../components/control/CtrlRoomMetricCard';
import { CtrlRoomActivityPanel } from '../../components/control/CtrlRoomActivityPanel';
import { CtrlRoomSitesPanel } from '../../components/control/CtrlRoomSitesPanel';
import { CtrlRoomSignalsPanel } from '../../components/control/CtrlRoomSignalsPanel';
import { useCtrlRoomData } from '../../hooks/useCtrlRoomData';
import { SITE00_ROUTES } from '../../config/routes';

export default function ControlOverviewPage() {
  const { metrics, activity, sites } = useCtrlRoomData();

  return (
    <CtrlRoomShell>
      <div className="site00-ctrl-overview">
        <div className="site00-ctrl-overview__metrics">
          <CtrlRoomMetricCard
            label="ACTIVE SITES"
            value={metrics.activeSites.value}
            state={metrics.activeSites.state}
            actionLabel="View all sites →"
            actionHref={SITE00_ROUTES.controlSites}
            icon="globe"
          />
          <CtrlRoomMetricCard
            label="DOMAINS"
            value={metrics.domains.value}
            state={metrics.domains.state}
            actionLabel="Manage domains →"
            actionHref={SITE00_ROUTES.controlDomains}
            icon="target"
          />
          <CtrlRoomMetricCard
            label="PLAN"
            value={metrics.plan.value}
            state={metrics.plan.state}
            actionLabel="Manage plan →"
            actionHref={SITE00_ROUTES.controlBilling}
            icon="cube"
          />
          <CtrlRoomMetricCard
            label="NEXT BILLING"
            value={metrics.nextBilling.value}
            state={metrics.nextBilling.state}
            actionLabel="View billing →"
            actionHref={SITE00_ROUTES.controlBilling}
            icon="calendar"
          />
        </div>
        <div className="site00-ctrl-overview__grid">
          <CtrlRoomSignalsPanel />
          <CtrlRoomActivityPanel rows={activity} />
          <CtrlRoomSitesPanel rows={sites} />
        </div>
      </div>
    </CtrlRoomShell>
  );
}
