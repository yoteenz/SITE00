import { DVS_LIME, DVS_VIEWBOX, type DvsIconState } from './geometry';
import { DVS_GLYPHS } from './glyphs';

export type DesignVisualIconProps = {
  name: string;
  size?: number;
  state?: DvsIconState;
  className?: string;
  title?: string;
};

/** Staged SITE 00 / NDXBOOK DESIGN workspace mark. Does not mutate live icons. */
export function DesignVisualIcon({
  name,
  size = 24,
  state = 'default',
  className = '',
  title,
}: DesignVisualIconProps) {
  const glyph = DVS_GLYPHS[name] ?? DVS_GLYPHS.placeholder;
  const color = state === 'active' ? DVS_LIME : 'currentColor';

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${DVS_VIEWBOX} ${DVS_VIEWBOX}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      className={`dvs-icon dvs-icon--${state}${className ? ` ${className}` : ''}`}
      data-dvs-icon={name}
      data-dvs-state={state}
      data-dvs-size={String(size)}
      style={{
        color,
        opacity: state === 'disabled' ? 0.34 : 1,
        display: 'block',
      }}
    >
      {title ? <title>{title}</title> : null}
      {glyph()}
    </svg>
  );
}
