import { EcosystemShell } from '../../components/ecosystem/EcosystemShell';
import { CtrlRoomMetricCard } from '../../components/control/CtrlRoomMetricCard';
import { CtrlRoomActivityPanel } from '../../components/control/CtrlRoomActivityPanel';
import { CtrlRoomSitesPanel } from '../../components/control/CtrlRoomSitesPanel';
import { CtrlRoomSignalsPanel } from '../../components/control/CtrlRoomSignalsPanel';
import { CtrlRoomMobileExperience } from '../../components/ctrl-room/mobile/CtrlRoomMobileExperience';
import { useCtrlRoomData, toLegacyActivityRows } from '../../hooks/useCtrlRoomData';
import { SITE00_ROUTES } from '../../config/routes';

export default function ControlOverviewPage() {
  const data = useCtrlRoomData();
  const legacyActivity = toLegacyActivityRows(data.activity);

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-ctrl-overview-page">
        <div className="site00-ctrl-overview-page__mobile">
          <CtrlRoomMobileExperience data={data} />
        </div>

        <div className="site00-ctrl-overview-page__desktop site00-ctrl-overview">
          <div className="site00-ctrl-overview__metrics">
            <CtrlRoomMetricCard
              label="ACTIVE SITES"
              value={data.metrics.activeSites.value}
              state={data.metrics.activeSites.state}
              actionLabel="VIEW ALL SITES →"
              actionHref={SITE00_ROUTES.controlSites}
              icon="globe"
            />
            <CtrlRoomMetricCard
              label="DOMAINS"
              value={data.metrics.domains.value}
              state={data.metrics.domains.state}
              actionLabel="MANAGE DOMAINS →"
              actionHref={SITE00_ROUTES.controlDomains}
              icon="target"
            />
            <CtrlRoomMetricCard
              label="PLAN"
              value={data.metrics.plan.value}
              state={data.metrics.plan.state}
              actionLabel="MANAGE PLAN →"
              actionHref={SITE00_ROUTES.controlBilling}
              icon="cube"
            />
            <CtrlRoomMetricCard
              label="NEXT BILLING"
              value={data.metrics.nextBilling.value}
              state={data.metrics.nextBilling.state}
              actionLabel="VIEW BILLING →"
              actionHref={SITE00_ROUTES.controlBilling}
              icon="calendar"
            />
          </div>
          <div className="site00-ctrl-overview__grid">
            <CtrlRoomSignalsPanel signals={data.signals} apiState={data.apiState} />
            <CtrlRoomActivityPanel rows={legacyActivity} />
            <CtrlRoomSitesPanel rows={data.sites} />
          </div>
        </div>
      </div>
    </EcosystemShell>
  );
}
