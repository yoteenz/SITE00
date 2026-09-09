/**
 * Image-led family thumbnail — safe empty state on missing/broken URLs.
 * Never displays source crop URLs as final assets.
 */

import { useState } from 'react';

type Props = {
  imageUrl: string | null;
  alt: string;
  fallbackColor?: string | null;
  className?: string;
};

export function SkinFamilyThumb({ imageUrl, alt, fallbackColor, className = '' }: Props) {
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

  return (
    <span
      className={`site00-dw-skins__family-thumb site00-dw-skins__family-thumb--fallback${className ? ` ${className}` : ''}`}
      style={fallbackColor ? { background: fallbackColor } : undefined}
      aria-label={alt}
      role="img"
    />
  );
}
