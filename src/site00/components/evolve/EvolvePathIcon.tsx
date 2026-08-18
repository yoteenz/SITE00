import { site00EvolveIconUrl, type EvolveIconId } from '../../config/evolve-framework-icons';

type EvolvePathIconProps = {
  id: EvolveIconId;
  title: string;
  size?: number;
  className?: string;
};

export function EvolvePathIcon({ id, title, size = 64, className = '' }: EvolvePathIconProps) {
  return (
    <img
      src={site00EvolveIconUrl(id)}
      alt={`${title} icon`}
      className={`site00-evolve-path-icon ${className}`.trim()}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
    />
  );
}
