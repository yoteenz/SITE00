import {
  site00BldrBuildClassIconUrl,
  type BldrBuildClassIconId,
} from '../../config/bldr-build-class-icons';

type BldrBuildClassIconProps = {
  id: BldrBuildClassIconId;
  title: string;
  className?: string;
};

/** Approved production PNG — BLDR build class cards and investment guide on /bldr/state. */
export function BldrBuildClassIcon({ id, title, className = '' }: BldrBuildClassIconProps) {
  return (
    <img
      src={site00BldrBuildClassIconUrl(id)}
      alt={`${title} icon`}
      className={`site00-bldr-build-class-icon ${className}`.trim()}
      width={64}
      height={64}
      loading="lazy"
      decoding="async"
    />
  );
}
