import type { ReactNode } from 'react';
import { Site00LogoBlock } from './Site00LogoBlock';
import { GlobalNav } from './GlobalNav';
import { EntryToggle } from './EntryToggle';
import { Site00ArtboardBottomChromePortal } from './Site00ArtboardBottomChromePortal';
import { useSite00DesktopArtboardPreview } from './Site00DesktopArtboardContext';
import { useSite00MobileArtboardPreview } from './Site00MobileArtboardContext';

type Site00AppShellProps = {
  children: ReactNode;
  locationLabel?: string;
  showStatusStrip?: boolean;
  statusStrip?: ReactNode;
};

export function Site00AppShell({
  children,
  locationLabel,
  showStatusStrip = false,
  statusStrip,
}: Site00AppShellProps) {
  const desktopArtboardPreview = useSite00DesktopArtboardPreview();
  const mobileArtboardPreview = useSite00MobileArtboardPreview();
  const artboardPinnedFooter = desktopArtboardPreview || mobileArtboardPreview;

  const statusFooter =
    showStatusStrip && statusStrip ? (
      <Site00ArtboardBottomChromePortal>
        <footer
          className={artboardPinnedFooter ? 'site00-status-strip-host--artboard' : undefined}
          style={
            artboardPinnedFooter
              ? { position: 'absolute', bottom: 0, left: 0, right: 0, flexShrink: 0, zIndex: 'var(--site-z-nav)' }
              : {
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 'var(--site-z-nav)',
                }
          }
        >
          {statusStrip}
        </footer>
      </Site00ArtboardBottomChromePortal>
    ) : null;

  return (
    <>
      <header
        className="site00-safe-ui"
        style={{
          position: 'relative',
          zIndex: 'var(--site-z-nav)',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'start',
          gap: 16,
          paddingTop: 20,
        }}
      >
        <Site00LogoBlock locationLabel={locationLabel} diamondMode="HOST_DEFAULT" />
        <div style={{ justifySelf: 'center', paddingTop: 4 }}>
          <GlobalNav />
        </div>
        <div style={{ justifySelf: 'end' }}>
          <EntryToggle />
        </div>
      </header>
      <main>{children}</main>
      {statusFooter}
    </>
  );
}
