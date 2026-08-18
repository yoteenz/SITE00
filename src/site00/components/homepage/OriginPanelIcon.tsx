import {
  site00OriginBldrPanelIconUrl,
  site00OriginEvolvePanelIconUrl,
  site00OriginIdntyPanelIconUrl,
} from '../../config/origin-panel-icons';

type OriginPanelIconProps = {
  panel: 'idnty' | 'bldr' | 'evolve';
  size?: 'md' | 'lg';
  className?: string;
};

const SIZE_PX = { md: 80, lg: 88 } as const;

/** Approved production panel icon — Origin desktop IDNTY/BLDR/EVOLVE panels. */
export function OriginPanelIcon({ panel, size = 'md', className = '' }: OriginPanelIconProps) {
  const dim = SIZE_PX[size];
  const src =
    panel === 'idnty'
      ? site00OriginIdntyPanelIconUrl()
      : panel === 'bldr'
        ? site00OriginBldrPanelIconUrl()
        : site00OriginEvolvePanelIconUrl();
  const alt =
    panel === 'idnty' ? 'IDNTY panel icon' : panel === 'bldr' ? 'BLDR panel icon' : 'EVOLVE panel icon';

  return (
    <img
      src={src}
      alt={alt}
      className={`site00-origin-card__icon ${size === 'lg' ? 'site00-origin-card__icon--lg' : ''} ${className}`.trim()}
      width={dim}
      height={dim}
      loading="eager"
      decoding="async"
    />
  );
}
