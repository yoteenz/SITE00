/**
 * Image-led family thumbnail — no color-swatch fallback when authority asset exists.
 */

type Props = {
  imageUrl: string | null;
  alt: string;
  fallbackColor?: string | null;
  className?: string;
};

export function SkinFamilyThumb({ imageUrl, alt, fallbackColor, className = '' }: Props) {
  if (imageUrl) {
    return <img src={imageUrl} alt={alt} className={`site00-dw-skins__family-img${className ? ` ${className}` : ''}`} />;
  }
  return (
    <span
      className={`site00-dw-skins__family-thumb site00-dw-skins__family-thumb--fallback${className ? ` ${className}` : ''}`}
      style={fallbackColor ? { background: fallbackColor } : undefined}
      aria-hidden
    />
  );
}
