import { EnvironmentShell } from '../../components/environment/EnvironmentShell';
import { DirectoryPanel, EnterStatusStrip } from '../../components/enter00/DirectoryPanel';
import { Site00MobileShell } from '../../components/mobile/Site00MobileShell';

/** Approved mobile Enter 00 — mobile shell, YOUR SPACE directory, bottom nav. */
export function MobileEnter() {
  return (
    <EnvironmentShell environmentId="ENTER_00_WAITING_ROOM" className="site00-enter-page site00-enter-page--mobile">
      <Site00MobileShell activeNav="origin" showEnvironmentBackground={false}>
        <DirectoryPanel />
        <EnterStatusStrip />
      </Site00MobileShell>
    </EnvironmentShell>
  );
}
