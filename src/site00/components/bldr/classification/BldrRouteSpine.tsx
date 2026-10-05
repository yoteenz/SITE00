type BldrRouteSpineProps = {
  nextLabel: string;
};

/** Vertical route spine connecting immersive portals. */
export function BldrRouteSpine({ nextLabel }: BldrRouteSpineProps) {
  return (
    <div className="site00-bldr-route-spine" aria-hidden="true">
      <span className="site00-bldr-route-spine__line" />
      <span className="site00-bldr-route-spine__node">
        <span className="site00-bldr-route-spine__label">{nextLabel}</span>
      </span>
      <span className="site00-bldr-route-spine__line" />
      <span className="site00-bldr-route-spine__dot" />
      <span className="site00-bldr-route-spine__line site00-bldr-route-spine__line--tail" />
    </div>
  );
}
