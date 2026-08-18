import { SITE00_BLDR_ENTRY_COMPOSITION } from '../../config/bldr-composition-map';

/** Dev-only composition overlay for Screen 02 (`?compositionDebug=1`). */
export function BldrCompositionDebug() {
  if (import.meta.env.PROD) return null;

  const { regions, canvas, layout } = SITE00_BLDR_ENTRY_COMPOSITION;

  return (
    <div className="site00-bldr-debug" aria-hidden="true">
      <div className="site00-bldr-debug__grid" />
      {Object.entries(regions).map(([id, rect]) => (
        <div
          key={id}
          className="site00-bldr-debug__box"
          style={{
            left: `${rect.nx * 100}%`,
            top: `${rect.ny * 100}%`,
            width: `${rect.nw * 100}%`,
            height: `${rect.nh * 100}%`,
          }}
          title={`${id} · x:${rect.x} y:${rect.y} w:${rect.width} h:${rect.height} · cx:${(rect.centerX * 100).toFixed(1)}% cy:${(rect.centerY * 100).toFixed(1)}%`}
        >
          <span>{id}</span>
        </div>
      ))}
      <div className="site00-bldr-debug__safe-top" />
      <div className="site00-bldr-debug__safe-bottom" />
      <div className="site00-bldr-debug__meta">
        {canvas.width}×{canvas.height} ref · card min {layout.cardMinHeightDvh}dvh · radius {layout.cardRadiusPx}px
      </div>
    </div>
  );
}
