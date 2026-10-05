import { StatusStrip } from '../homepage/StatusStrip';
import { Site00ArtboardBottomChromePortal } from './Site00ArtboardBottomChromePortal';
import { useSite00DesktopArtboardPreview } from './Site00DesktopArtboardContext';

/** Origin-aligned contextual status rail for Public World desktop routes. */
export function Site00PublicStatusRail() {
  const inArtboard = useSite00DesktopArtboardPreview();
  return (
    <Site00ArtboardBottomChromePortal>
      <footer className={inArtboard ? 'site00-status-strip-host--artboard site00-public-status-rail' : 'site00-public-status-rail'}>
        <StatusStrip layout={inArtboard ? 'desktop' : 'mobile'} />
      </footer>
    </Site00ArtboardBottomChromePortal>
  );
}
