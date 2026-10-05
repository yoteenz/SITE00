/**
 * Image-led family thumbnail — safe empty state on missing/broken URLs.
 * Never displays source crop URLs as final assets.
 */

import { useState } from 'react';

type Props = {
  imageUrl: string | null;
  alt: string;
  fallbackColor?: string | null;
  approvedVisualAssetExists?: boolean;
  className?: string;
};

export function SkinFamilyThumb({
  imageUrl,
  alt,
  fallbackColor,
  approvedVisualAssetExists = false,
  className = '',
}: Props) {
  const [broken, setBroken] = useState(false);

  if (imageUrl && !broken) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={`site00-dw-skins__family-img${className ? ` ${className}` : ''}`}
        onError={() => setBroken(true)}
      />
    );
  }

  if (approvedVisualAssetExists || (imageUrl && broken)) {
    return (
      <span
        className={`site00-dw-skins__family-thumb site00-dw-skins__family-thumb--load-failed${className ? ` ${className}` : ''}`}
        aria-label={alt}
        role="img"
        data-failure-code="SKINS_ASSET_BINDING_LOAD_FAILED"
        title="SKINS_ASSET_BINDING_LOAD_FAILED"
      />
    );
  }

  return (
    <span
      className={`site00-dw-skins__family-thumb site00-dw-skins__family-thumb--fallback${className ? ` ${className}` : ''}`}
      style={fallbackColor ? { background: fallbackColor } : undefined}
      aria-label={alt}
      role="img"
    />
  );
}
