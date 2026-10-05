/**
 * P0.VR.DESIGN.GROK-AI-CONSOLE-ASSETS1 — renderer for the staged AI-console
 * icon family. One construction grid, currentColor, no raster.
 */

import {
  AIC_ICON_FAMILY,
  AIC_ICON_STATUS,
  AIC_ICON_STROKE,
  AIC_ICON_VERSION,
  AIC_ICON_VIEWBOX,
  getAiConsoleIconDef,
  type AiConsoleIconId,
  type AiConsoleIconState,
} from '../../../../../shared/site00-design-workspace-production/designAiConsoleIconography.js';

export function AiConsoleIcon({
  name,
  size = 16,
  state = 'default',
  className,
  title,
}: {
  name: AiConsoleIconId;
  size?: number;
  state?: AiConsoleIconState;
  className?: string;
  title?: string;
}) {
  const def = getAiConsoleIconDef(name);
  return (
    <svg
      className={`s00-aic-icon${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      viewBox={`0 0 ${AIC_ICON_VIEWBOX} ${AIC_ICON_VIEWBOX}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title}
      data-aic-icon={def.id}
      data-aic-icon-console={def.console}
      data-aic-icon-state={state}
      data-aic-icon-status={AIC_ICON_STATUS}
      data-aic-icon-version={AIC_ICON_VERSION}
      data-aic-icon-family={AIC_ICON_FAMILY}
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
              strokeWidth={AIC_ICON_STROKE}
              strokeLinecap="square"
              strokeLinejoin="miter"
              fill="none"
            />
          );
        }
        if (primitive.kind === 'rect') {
          return (
            <rect
              key={index}
              x={primitive.x}
              y={primitive.y}
              width={primitive.w}
              height={primitive.h}
              fill={primitive.fill ? 'currentColor' : 'none'}
              stroke={primitive.fill ? 'none' : 'currentColor'}
              strokeWidth={primitive.fill ? undefined : AIC_ICON_STROKE}
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
            strokeWidth={AIC_ICON_STROKE}
            strokeLinecap="square"
          />
        );
      })}
    </svg>
  );
}

export function AiConsoleIconSlot({
  name,
  size = 14,
  state = 'default',
  className,
}: {
  name: AiConsoleIconId;
  size?: number;
  state?: AiConsoleIconState;
  className?: string;
}) {
  return (
    <span className={`s00-aic__glyph${className ? ` ${className}` : ''}`} aria-hidden="true">
      <AiConsoleIcon name={name} size={size} state={state} />
    </span>
  );
}
