import { useCallback } from 'react';
import { EnvironmentShell } from '../components/environment/EnvironmentShell';
import { Site00AppShell } from '../components/shell/Site00AppShell';
import { StatusStrip } from '../components/homepage/StatusStrip';
import { OriginCards } from '../components/homepage/OriginCards';
import { OriginMobileSwipeUp } from '../components/homepage/OriginMobileSwipeUp';
import { IdntyExpandedPanel } from '../components/homepage/IdntyExpandedPanel';
import { BldrExpandedPanel } from '../components/homepage/BldrExpandedPanel';
import { EvolveExpandedPanel } from '../components/homepage/EvolveExpandedPanel';
import { SITE00_ORIGIN_COPY } from '../config/status';
import { SITE00_ORIGIN_DESKTOP_COMPOSITION } from '../config/origin-home-composition';
import { useSite00DesktopArtboardPreview } from '../components/shell/Site00DesktopArtboardContext';
import { useSite00 } from '../state/Site00Context';
import { useOriginStatusStripLayout } from '../hooks/useOriginStatusStripLayout';
import { useOriginLocationsTransition } from '../hooks/useOriginLocationsTransition';
import { useOriginExpandedDismiss } from '../hooks/useOriginExpandedDismiss';

export default function OriginPage() {
  const { state, setHomeMode } = useSite00();
  const isDesktopArtboardLayout = useSite00DesktopArtboardPreview();
  const statusStripLayout = useOriginStatusStripLayout(isDesktopArtboardLayout);
  const locationsTransition = useOriginLocationsTransition();
  const isMobileOrigin = !isDesktopArtboardLayout;
  const collapseExpandedPanel = useCallback(() => setHomeMode('origin'), [setHomeMode]);

  useOriginExpandedDismiss(state.homeMode, collapseExpandedPanel, !isMobileOrigin);

  return (
    <EnvironmentShell environmentId="ORIGIN_ENVIRONMENT">
      <div
        className={`site00-origin-page ${isDesktopArtboardLayout ? 'site00-origin-page--desktop-artboard' : 'site00-origin-page--mobile-layout'}`.trim()}
      >
        <Site00AppShell
          locationLabel={SITE00_ORIGIN_COPY.locationLabel}
          showStatusStrip
          statusStrip={<StatusStrip layout={statusStripLayout} />}
        >
          {isMobileOrigin ? (
            <div
              className="site00-origin-swipe-surface"
              aria-hidden="true"
              {...locationsTransition.swipeHandlers}
            />
          ) : null}
          <div
            className="site00-home-stage"
            style={{
              ['--site00-origin-hero-left' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.heroLeftPercent}%`,
              ['--site00-origin-hero-top' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.heroTopPx}px`,
              ['--site00-origin-hero-max-w' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.heroMaxWidthPx}px`,
              ['--site00-origin-hero-offset-x' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.heroOffsetXPx}px`,
              ['--site00-origin-cards-top' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.cardsTopPercent}%`,
              ['--site00-origin-cards-offset-y' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.cardsTopOffsetPx}px`,
              ['--site00-origin-cards-max-w' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.cardsMaxWidthPx}px`,
              ['--site00-origin-cards-row-gap' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.cardsRowGapPx}px`,
              ['--site00-origin-card-scale' as string]: String(SITE00_ORIGIN_DESKTOP_COMPOSITION.cardScale),
              ['--site00-origin-panel-icon-size-px' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.panelIconSizePx}px`,
              ['--site00-origin-panel-icon-offset-y' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.panelIconOffsetYPx}px`,
              ['--site00-origin-panel-icon-scale' as string]: String(SITE00_ORIGIN_DESKTOP_COMPOSITION.panelIconScale),
              ['--site00-origin-expanded-max-w' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.expandedMaxWidthPx}px`,
              ['--site00-origin-expanded-panel-scale' as string]: String(SITE00_ORIGIN_DESKTOP_COMPOSITION.expandedPanelScale),
              ['--site00-origin-framework-icon-size' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.frameworkIconSizePx}px`,
              ['--site00-origin-coordinate-top' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.coordinateAnchorTopPx}px`,
              ['--site00-origin-coordinate-left' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.coordinateAnchorLeftPercent}%`,
              ['--site00-origin-coordinate-offset-x' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.coordinateAnchorOffsetXPx}px`,
            }}
          >
            <div className="site00-home-grid">
              <aside
                className="site00-home-hero"
                style={{
                  ['--site00-origin-hero-top' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.heroTopPx}px`,
                }}
                aria-label="Origin messaging"
              >
                <p className="site00-label site00-home-hero__eyebrow">{SITE00_ORIGIN_COPY.headlineLine1}</p>
                <h1 className="site00-heading-xl">{SITE00_ORIGIN_COPY.headlineLine2}</h1>
                <p className="site00-tagline site00-home-hero__tagline">{SITE00_ORIGIN_COPY.tagline}</p>
                <p className="site00-body site00-body--technical site00-home-hero__line">{SITE00_ORIGIN_COPY.description1}</p>
                <p className="site00-body site00-body--technical site00-home-hero__line">{SITE00_ORIGIN_COPY.description2}</p>
                <p className="site00-body site00-body--technical site00-home-hero__line">
                  {SITE00_ORIGIN_COPY.description3}
                </p>
              </aside>

              {state.homeMode === 'origin' ? (
                <div className="site00-home-grid__spacer" aria-hidden="true" />
              ) : null}
            </div>

            {isDesktopArtboardLayout ? (
              <div className="site00-origin-coordinate-anchor" aria-label="Origin coordinate">
                <p className="site00-coordinate site00-origin-coordinate-anchor__line">
                  {SITE00_ORIGIN_COPY.originPointLine.prefix}{' '}
                  <span className="site00-origin-hero__coordinate-value">{SITE00_ORIGIN_COPY.originPointLine.coordinate}</span>{' '}
                  {SITE00_ORIGIN_COPY.originPointLine.suffix}
                </p>
              </div>
            ) : null}

            {state.homeMode !== 'origin' && !isMobileOrigin ? (
              <button
                type="button"
                className="site00-home-expanded-backdrop"
                aria-label="Close panel"
                onClick={collapseExpandedPanel}
              />
            ) : null}

            {state.homeMode !== 'origin' ? (
              <div className="site00-home-expanded-column" aria-label="Expanded panel">
                {state.homeMode === 'idnty-expanded' ? (
                  <IdntyExpandedPanel onCollapse={collapseExpandedPanel} />
                ) : state.homeMode === 'bldr-expanded' ? (
                  <BldrExpandedPanel onCollapse={collapseExpandedPanel} />
                ) : (
                  <EvolveExpandedPanel onCollapse={collapseExpandedPanel} />
                )}
              </div>
            ) : null}

            {state.homeMode === 'origin' ? (
              <section className="site00-home-cards" aria-label="Entry selection">
                <OriginCards
                  onExpandIdnty={() => setHomeMode('idnty-expanded')}
                  onExpandBldr={() => setHomeMode('bldr-expanded')}
                  onExpandEvolve={() => setHomeMode('evolve-expanded')}
                />
              </section>
            ) : null}

            {!isDesktopArtboardLayout ? <OriginMobileSwipeUp transition={locationsTransition} /> : null}
          </div>
      </Site00AppShell>
      </div>
    </EnvironmentShell>
  );
}
