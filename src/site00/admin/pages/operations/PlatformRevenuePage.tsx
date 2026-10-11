import { Link } from 'react-router-dom';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import {
  draftPlatformCopy,
  runFoundationHarness,
  STUDIO_OS_PLATFORM_LOCATION,
} from '../../../../studioos/platform-economics';

const REPORT = runFoundationHarness();

export function ProjectPlatformEconomicsPanel({ projectId }: { projectId: string }) {
  return (
    <section className="site00-control-panel">
      <h2 className="site00-control-panel__title">COMMERCIAL · PLATFORM ECONOMICS</h2>
      <p style={{ textTransform: 'none' }}>
        {STUDIO_OS_PLATFORM_LOCATION.project.join(' → ')}. Project {projectId} has no stored platform agreement.
        Builder configuration does not accept an agreement, and a quote does not activate one.
      </p>
      <p style={{ textTransform: 'none' }}>
        Live platform fees collected: none. Money movement is not activated.
      </p>
      <p>
        <Link to={SITE00_ADMIN_ROUTES.platformRevenue}>PLATFORM REVENUE</Link>
      </p>
    </section>
  );
}

export default function PlatformRevenuePage() {
  const copy = draftPlatformCopy();
  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="00 / CONTROL"
        title="PLATFORM REVENUE"
        subtitle="OPERATIONS / FINANCE · LEDGER TOTALS ONLY · NO LIVE FEES COLLECTED"
      />
      <section className="site00-control-panel">
        <h2 className="site00-control-panel__title">FOUNDATION HARNESS · v{REPORT.version}</h2>
        <p style={{ textTransform: 'none' }}>These rows are fixture results. They are not portfolio revenue.</p>
        {REPORT.cases.map((item) => (
          <p key={item.id} style={{ textTransform: 'none' }}>
            {item.pass ? 'PASS' : 'FAIL'} · {item.id} · {item.label} · {item.detail}
          </p>
        ))}
      </section>
      <section className="site00-control-panel">
        <h2 className="site00-control-panel__title">DRAFT PRODUCT COPY · NOT PUBLISHED</h2>
        {copy.paragraphs.map((paragraph) => (
          <p key={paragraph} style={{ textTransform: 'none' }}>{paragraph}</p>
        ))}
      </section>
    </Site00AdminShell>
  );
}
