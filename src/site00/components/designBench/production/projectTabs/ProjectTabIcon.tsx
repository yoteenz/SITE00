/**
 * P0.VR.DESIGN.GROK-PROJECT-TAB-ASSETS1 — renderer for the staged
 * project-tab icon family. One construction grid, currentColor, no raster.
 */

import {
  PTV_FAMILY,
  PTV_STATUS,
  PTV_STROKE,
  PTV_VERSION,
  PTV_VIEWBOX,
  getProjectTabIconDef,
  type ProjectTabIconId,
} from '../../../../../../shared/site00-design-workspace-production/designProjectTabVisuals.js';

export function ProjectTabIcon({
  name,
  className,
  title,
  size,
}: {
  name: ProjectTabIconId;
  className?: string;
  title?: string;
  size?: number;
}) {
  const def = getProjectTabIconDef(name);
  return (
    <svg
      className={className}
      viewBox={`0 0 ${PTV_VIEWBOX} ${PTV_VIEWBOX}`}
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title}
      data-ptv-icon={def.id}
      data-ptv-tab={def.tab}
      data-ptv-status={PTV_STATUS}
      data-ptv-version={PTV_VERSION}
      data-ptv-family={PTV_FAMILY}
    >
      {title ? <title>{title}</title> : null}
      {def.primitives.map((primitive, index) => {
        if (primitive.kind === 'path') {
          return primitive.fill ? (
            <path key={index} d={primitive.d} fill="currentColor" stroke="none" />
          ) : (
            <path
              key={index}
              d={primitive.d}
              stroke="currentColor"
              strokeWidth={PTV_STROKE}
              strokeLinecap="square"
              strokeLinejoin="miter"
              fill="none"
            />
          );
        }
        if (primitive.kind === 'rect') {
          return primitive.fill ? (
            <rect
              key={index}
              x={primitive.x}
              y={primitive.y}
              width={primitive.w}
              height={primitive.h}
              fill="currentColor"
              stroke="none"
            />
          ) : (
            <rect
              key={index}
              x={primitive.x}
              y={primitive.y}
              width={primitive.w}
              height={primitive.h}
              fill="none"
              stroke="currentColor"
              strokeWidth={PTV_STROKE}
            />
          );
        }
        if (primitive.kind === 'circle') {
          return primitive.fill ? (
            <circle
              key={index}
              cx={primitive.cx}
              cy={primitive.cy}
              r={primitive.r}
              fill="currentColor"
              stroke="none"
            />
          ) : (
            <circle
              key={index}
              cx={primitive.cx}
              cy={primitive.cy}
              r={primitive.r}
              fill="none"
              stroke="currentColor"
              strokeWidth={PTV_STROKE}
            />
          );
        }
        return (
          <line
            key={index}
            x1={primitive.x1}
            y1={primitive.y1}
            x2={primitive.x2}
            y2={primitive.y2}
            stroke="currentColor"
            strokeWidth={PTV_STROKE}
            strokeLinecap="square"
          />
        );
      })}
    </svg>
  );
}
