import { site00EvolveIconUrl } from '../../config/evolve-framework-icons';
import { SITE00_ORIGIN_DESKTOP_COMPOSITION } from '../../config/origin-home-composition';

type EvolveFrameworkIconProps = {
  id: 'refine' | 'install' | 'transform' | 'master';
  title: string;
  className?: string;
};

const FRAMEWORK_ICON_PX = Math.round(SITE00_ORIGIN_DESKTOP_COMPOSITION.frameworkIconSizePx);

/** Placeholder geometric icon — replace asset file without component changes. */
export function EvolveFrameworkIcon({ id, title, className = '' }: EvolveFrameworkIconProps) {
  return (
    <img
      src={site00EvolveIconUrl(id === 'master' ? 'master' : id)}
      alt={`${title} icon`}
      className={`site00-evolve-framework-icon ${className}`.trim()}
      width={FRAMEWORK_ICON_PX}
      height={FRAMEWORK_ICON_PX}
      loading="lazy"
      decoding="async"
    />
  );
}
