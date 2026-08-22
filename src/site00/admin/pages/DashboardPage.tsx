import { Site00AdminShell } from '../components/shell/Site00AdminShell';
import { ControlCommandDesktop } from '../components/control/ControlCommandDesktop';
import { ControlCommandHero } from '../components/control/ControlCommandHero';
import { ControlCommandMobile } from '../components/control/ControlCommandMobile';
import { PreviewTunnelPanel } from '../components/control/PreviewTunnelPanel';
import { useControlCommand } from '../hooks/useControlCommand';

export default function Site00AdminDashboardPage() {
  const { data, state, error, reload } = useControlCommand();

  return (
    <Site00AdminShell alertCount={data?.alertCount}>
      {state === 'loading' ? (
        <div className="site00-control-loading" aria-busy="true" aria-label="LOADING COMMAND CENTER">
          <div className="site00-control-loading__rail">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="site00-control-loading__node" />
            ))}
          </div>
          <p>ACQUIRING OPERATOR STATE…</p>
        </div>
      ) : null}

      {error ? (
        <div className="site00-control-error" role="alert">
          <p>{error.toUpperCase()}</p>
          <button type="button" className="site00-control-cta" onClick={() => void reload()}>TRY AGAIN →</button>
        </div>
      ) : null}

      {data ? (
        <>
          <ControlCommandHero data={data} />
          <PreviewTunnelPanel preview={data.previewTunnel} />
          <div className="site00-control-command__desktop-wrap">
            <ControlCommandDesktop data={data} />
          </div>
          <div className="site00-control-command__mobile-wrap">
            <ControlCommandMobile data={data} />
          </div>
        </>
      ) : null}
    </Site00AdminShell>
  );
}
