import type { MouseEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { AstralHotspotDef } from '../../../../../shared/site00-astral-world/scenes/types.js';
import { hotspotStyle } from '../../../../../shared/site00-astral-world/scenes/types.js';
import { useAstralWorld } from '../../context/AstralWorldContext';

type AstralHotspotProps = {
  /** Registry definition — preferred */
  def?: AstralHotspotDef;
  /** Manual placement fallback */
  to?: string;
  label?: string;
  rect?: { xPercent: number; yPercent: number; widthPercent: number; heightPercent: number };
  action?: AstralHotspotDef['action'];
  target?: string;
  onActivate?: () => void;
  className?: string;
  children?: ReactNode;
  mobile?: boolean;
};

export function AstralHotspot({
  def,
  to,
  label,
  rect,
  action,
  target,
  onActivate,
  className = '',
  children,
}: AstralHotspotProps) {
  const { path } = useAstralWorld();
  const navigate = useNavigate();

  const resolvedLabel = def?.label ?? label ?? 'Hotspot';
  const resolvedRect = def?.rect ?? rect;
  const resolvedAction = def?.action ?? action ?? 'NAVIGATE';
  const resolvedTarget = def?.target ?? target ?? to?.replace(/^\//, '') ?? '';

  if (!resolvedRect) return null;

  const style = hotspotStyle(resolvedRect);
  const content = children ?? <span className="aw-hotspot__plate">{resolvedLabel}</span>;

  const handleClick = (e: MouseEvent) => {
    if (onActivate) {
      e.preventDefault();
      onActivate();
      return;
    }
    if (resolvedAction === 'NAVIGATE' && resolvedTarget) {
      e.preventDefault();
      navigate(path(resolvedTarget));
    }
  };

  if (resolvedAction === 'NAVIGATE' && !onActivate) {
    return (
      <Link
        to={path(resolvedTarget)}
        className={`aw-hotspot aw-hotspot--dest ${className}`.trim()}
        style={style}
        aria-label={resolvedLabel}
        data-hotspot-id={def?.hotspotId}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`aw-hotspot aw-hotspot--action ${className}`.trim()}
      style={style}
      aria-label={resolvedLabel}
      data-hotspot-id={def?.hotspotId}
      onClick={handleClick}
    >
      {content}
    </button>
  );
}

export function AstralHotspotLayer({
  hotspots,
  onDrawer,
  onOverlay,
}: {
  hotspots: AstralHotspotDef[];
  onDrawer?: (target: string, label: string) => void;
  onOverlay?: (target: string, label: string) => void;
}) {
  return (
    <>
      {hotspots.map((h) => (
        <AstralHotspot
          key={h.hotspotId}
          def={h}
          onActivate={
            h.action === 'OPEN_DRAWER' && onDrawer
              ? () => onDrawer(h.target, h.label)
              : h.action === 'OPEN_OVERLAY' && onOverlay
                ? () => onOverlay(h.target, h.label)
                : undefined
          }
        />
      ))}
    </>
  );
}
