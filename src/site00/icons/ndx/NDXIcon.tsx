import {
  NDX_ICON_SIZE_TOKENS,
  NDX_ICON_STROKE_DEFAULT,
  NDX_ICON_VIEWBOX,
  getNdxIconDefinition,
  type NDXIconName,
  type NDXIconProps,
  type NdxIconSizeToken,
} from '../../../../shared/site00-studio-world-ui/icons/index.js';

function resolveSize(size: NDXIconProps['size']): number {
  if (typeof size === 'number') return size;
  if (size && size in NDX_ICON_SIZE_TOKENS) return NDX_ICON_SIZE_TOKENS[size as NdxIconSizeToken];
  return NDX_ICON_SIZE_TOKENS.md;
}

export function NDXIcon({
  name,
  size = 'md',
  strokeWidth,
  state = 'inactive',
  className = '',
  ariaLabel,
  decorative = true,
}: NDXIconProps) {
  const def = getNdxIconDefinition(name);
  const px = resolveSize(size);
  const stateClass = state === 'active' ? 'ndx-icon--active' : 'ndx-icon--inactive';
  const resolvedStroke = strokeWidth ?? def.strokeWidth ?? NDX_ICON_STROKE_DEFAULT;
  const optical = def.optical;
  const transform = optical
    ? `translate(${optical.opticalOffsetX} ${optical.opticalOffsetY}) scale(${optical.opticalScale})`
    : undefined;

  return (
    <svg
      className={`ndx-icon ${stateClass}${className ? ` ${className}` : ''}`}
      width={px}
      height={px}
      viewBox={`0 0 ${NDX_ICON_VIEWBOX} ${NDX_ICON_VIEWBOX}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={decorative && !ariaLabel ? true : undefined}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
      data-ndx-icon={name}
      data-ndx-icon-state={state}
      data-ndx-icon-version={def.visualVersion}
    >
      <g transform={transform}>
        <g
          stroke="currentColor"
          strokeWidth={resolvedStroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        >
          {def.paths.map((path, index) => (
            <path key={`${name}-p-${index}`} d={path.d} opacity={path.opacity} />
          ))}
        </g>
        {def.circles?.map((circle, index) => (
          <circle
            key={`${name}-c-${index}`}
            cx={circle.cx}
            cy={circle.cy}
            r={circle.r}
            fill={circle.fill ?? 'currentColor'}
            stroke="none"
            opacity={circle.opacity}
          />
        ))}
      </g>
    </svg>
  );
}

export type { NDXIconName, NDXIconProps };
