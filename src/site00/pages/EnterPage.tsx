import { EnvironmentShell } from '../components/environment/EnvironmentShell';
import { Site00AppShell } from '../components/shell/Site00AppShell';
import { DirectoryPanel, EnterStatusStrip } from '../components/enter00/DirectoryPanel';
import { SITE00_ENTER_COPY } from '../config/directory';

export default function EnterPage() {
  return (
    <EnvironmentShell environmentId="ENTER_00_WAITING_ROOM" className="site00-enter-page">
      <Site00AppShell locationLabel={SITE00_ENTER_COPY.locationLabel}>
        <DirectoryPanel />
        <EnterStatusStrip />
      </Site00AppShell>
    </EnvironmentShell>
  );
}
