import { useEffect, useState } from 'react';
import {
  ASSTS_LIBRARY_HERO_COMPOSITION,
  ASSTS_LIBRARY_HERO_SLOT_KEY,
  getAsstsLibraryHeroCanonicalUrl,
  type LibraryHeroPixelRect,
  scaleLibraryHeroRect,
} from './library-home-hero-composition-map';
import { isLibraryHeroRefMapEnabled } from './library-home-hero-lock';
import { LibraryHomeRegion } from './LibraryHomeRegion';
import { useLibraryHomeCompositionOptional } from './LibraryHomeCompositionContext';
import { resolveAsstsSlot } from '../services/asstsApi';

type LibraryHomeHeroZoneProps = {
  children?: React.ReactNode;
};

function HeroSubRegion({
  zone,
  className,
  children,
  label,
}: {
  zone: LibraryHeroPixelRect;
  className?: string;
  children?: React.ReactNode;
  label?: string;
}) {
  const showDebug = isLibraryHeroRefMapEnabled();
  return (
    <div
      className={`assts-lib-hero-sub ${className ?? ''}`.trim()}
      style={{
        left: `calc(${zone.x}px * var(--ref-scale))`,
        top: `calc(${zone.y}px * var(--ref-scale))`,
        width: `calc(${zone.w}px * var(--ref-scale))`,
        height: `calc(${zone.h}px * var(--ref-scale))`,
      }}
      data-hero-zone={label}
    >
      {showDebug && label ? <span className="assts-lib-hero-sub__debug-label">{label}</span> : null}
      {children}
    </div>
  );
}

/**
 * Locked library.hero composition zone — architectural hero + header copy + control.
 * Phase 01: stats and lower sections attach to hero.statsAnchorY in a future sprint.
 */
export function LibraryHomeHeroZone({ children }: LibraryHomeHeroZoneProps) {
  const ctx = useLibraryHomeCompositionOptional();
  const [heroUrl, setHeroUrl] = useState<string>(() => getAsstsLibraryHeroCanonicalUrl());
  const [source, setSource] = useState<'locked' | 'canonical'>('canonical');
  const map = ASSTS_LIBRARY_HERO_COMPOSITION;
  const showHeroDebug = isLibraryHeroRefMapEnabled();

  useEffect(() => {
    let cancelled = false;
    resolveAsstsSlot(ASSTS_LIBRARY_HERO_SLOT_KEY)
      .then((res) => {
        if (cancelled) return;
        if (res.resolved.url) {
          setHeroUrl(res.resolved.url);
          setSource(res.resolved.source === 'locked' ? 'locked' : 'canonical');
        } else {
          setHeroUrl(getAsstsLibraryHeroCanonicalUrl());
          setSource('canonical');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHeroUrl(getAsstsLibraryHeroCanonicalUrl());
          setSource('canonical');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const scale = ctx?.scale ?? 1;

  return (
    <LibraryHomeRegion id="hero" ariaLabel="Asset Vault hero" allowOverflow>
      <div
        className="assts-lib-hero-zone"
        data-composition-zone={map.zoneId}
        data-composition-status={map.status}
        data-hero-source={source}
        style={{
          width: '100%',
          height: '100%',
          ['--hero-object-position' as string]: map.display.objectPosition,
        }}
      >
        <img
          className="assts-lib-hero-zone__image"
          src={heroUrl}
          alt=""
          aria-hidden="true"
          width={map.source.width}
          height={map.source.height}
          decoding="async"
          draggable={false}
        />

        <HeroSubRegion zone={map.zones.headerCopy.eyebrow} label="hero.headerCopy.eyebrow">
          <p className="assts-lib-text assts-lib-text--eyebrow site00-label-red">SITE 00 · ASSTS</p>
        </HeroSubRegion>

        <HeroSubRegion zone={map.zones.headerCopy.title} label="hero.headerCopy.title">
          <h1 className="assts-lib-text assts-lib-text--title">THE ASSET VAULT.</h1>
        </HeroSubRegion>

        <HeroSubRegion zone={map.zones.headerCopy.subtitle} label="hero.headerCopy.subtitle">
          <p className="assts-lib-text assts-lib-text--tagline">EVERYTHING WE BUILD LIVES HERE.</p>
        </HeroSubRegion>

        <HeroSubRegion zone={map.zones.topRightControl} label="hero.topRightControl">
          <div className="assts-lib-emblem" aria-hidden="true">
            <span className="assts-lib-emblem__mark">✦</span>
          </div>
        </HeroSubRegion>

        {children}

        {showHeroDebug ? <LibraryHomeHeroDebugOverlay scale={scale} /> : null}
      </div>
    </LibraryHomeRegion>
  );
}

function LibraryHomeHeroDebugOverlay({ scale }: { scale: number }) {
  const map = ASSTS_LIBRARY_HERO_COMPOSITION;
  const bounds = scaleLibraryHeroRect(map.zones.bounds, scale);

  return (
    <div className="assts-lib-hero-debug" aria-hidden="true">
      <div className="assts-lib-hero-debug__toolbar">
        <span>
          HERO COORDINATE MODE · {map.status} · {map.source.width}×{map.source.height}
        </span>
      </div>

      <div
        className="assts-lib-hero-debug__bounds"
        style={{ left: bounds.x, top: bounds.y, width: bounds.w, height: bounds.h }}
      >
        <span className="assts-lib-hero-debug__label">library.hero bounds</span>
      </div>

      <div
        className="assts-lib-hero-debug__axis"
        style={{
          left: bounds.x + bounds.w * map.anchors.centerAxisX,
          top: bounds.y,
          height: bounds.h,
        }}
      />

      <div className="assts-lib-hero-debug__hline" style={{ top: bounds.y + bounds.h }}>
        <span>hero.bottom y={map.anchors.heroBottom}</span>
      </div>

      <div className="assts-lib-hero-debug__hline assts-lib-hero-debug__hline--stats" style={{ top: map.anchors.statsAnchorY * scale }}>
        <span>statsAnchor y={map.anchors.statsAnchorY}</span>
      </div>

      {(
        [
          ['copySafe', map.zones.copySafe],
          ['architectureBand', map.zones.architectureBand],
          ['topRightControl', map.zones.topRightControl],
        ] as const
      ).map(([id, zone]) => {
        const r = scaleLibraryHeroRect(zone, scale);
        return (
          <div
            key={id}
            className={`assts-lib-hero-debug__zone assts-lib-hero-debug__zone--${id}`}
            style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
          >
            <span>{id}</span>
            <span className="assts-lib-hero-debug__coords">
              nx={zone.nx.toFixed(3)} ny={zone.ny.toFixed(3)}
            </span>
          </div>
        );
      })}

      {(() => {
        const arch = map.protected.mainArch;
        const r = bounds;
        return (
          <div
            className="assts-lib-hero-debug__zone assts-lib-hero-debug__zone--mainArch"
            style={{
              left: r.x + r.w * arch.x,
              top: r.y + r.h * arch.y,
              width: r.w * arch.w,
              height: r.h * arch.h,
            }}
          >
            <span>mainArch</span>
          </div>
        );
      })()}

      {(() => {
        const corridor = map.protected.centralProtected;
        const r = bounds;
        return (
          <div
            className="assts-lib-hero-debug__zone assts-lib-hero-debug__zone--centralProtected"
            style={{
              left: r.x + r.w * corridor.x,
              top: r.y + r.h * corridor.y,
              width: r.w * corridor.w,
              height: r.h * corridor.h,
            }}
          >
            <span>centralProtected</span>
          </div>
        );
      })()}
    </div>
  );
}
