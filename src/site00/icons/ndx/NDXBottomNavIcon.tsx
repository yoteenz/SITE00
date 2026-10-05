import {
  NDX_ICON_CONTEXT_SIZE,
  type NDXIconProps,
} from '../../../../shared/site00-studio-world-ui/icons/index.js';
import { getNdxBottomNavIconUrl } from '../../config/ndxBottomNavIconUrls';
import { NDXIcon } from './NDXIcon';

type Props = Pick<NDXIconProps, 'name' | 'state' | 'decorative' | 'ariaLabel'> & {
  size?: number;
  className?: string;
};

export function NDXBottomNavIcon({
  name,
  state = 'inactive',
  decorative = true,
  ariaLabel,
  size = NDX_ICON_CONTEXT_SIZE.bottomNav,
  className = '',
}: Props) {
  const imageUrl = getNdxBottomNavIconUrl(name);

  if (imageUrl) {
    const stateClass = state === 'active' ? 'ndx-bottom-nav-icon--active' : 'ndx-bottom-nav-icon--inactive';
    return (
      <img
        src={imageUrl}
        alt={decorative && !ariaLabel ? '' : ariaLabel ?? name}
        aria-hidden={decorative && !ariaLabel ? true : undefined}
        className={`ndx-bottom-nav-icon ${stateClass}${className ? ` ${className}` : ''}`}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        data-ndx-bottom-nav-icon={name}
        data-ndx-bottom-nav-icon-state={state}
      />
    );
  }

  return (
    <NDXIcon
      name={name}
      size={size}
      state={state}
      decorative={decorative}
      ariaLabel={ariaLabel}
      className={className}
    />
  );
}
