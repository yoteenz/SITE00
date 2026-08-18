import { Site00MobileShell } from '../../components/mobile/Site00MobileShell';
import { BldrEntryPage } from '../../components/bldr/BldrEntryPage';

/** Legacy BLDR direction entry — linked from build workflow when needed. */
export default function BldrStartPage() {
  return (
    <div className="site00-bldr-entry-page">
      <Site00MobileShell activeNav="build" showEnvironmentBackground={false} shellClassName="site00-mobile-shell--bldr-entry">
        <BldrEntryPage />
      </Site00MobileShell>
    </div>
  );
}
