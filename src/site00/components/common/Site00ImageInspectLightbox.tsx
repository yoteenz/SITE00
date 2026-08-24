import { useEffect } from 'react';

type Site00ImageInspectLightboxProps = {
  imageUrl: string | null;
  alt?: string;
  caption?: string;
  onClose: () => void;
};

export function Site00ImageInspectLightbox({
  imageUrl,
  alt = '',
  caption,
  onClose,
}: Site00ImageInspectLightboxProps) {
  useEffect(() => {
    if (!imageUrl) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  return (
    <div className="site00-image-inspect-lightbox" role="dialog" aria-modal="true" aria-label="Inspect slide">
      <button
        type="button"
        className="site00-image-inspect-lightbox__backdrop"
        aria-label="Close inspect view"
        onClick={onClose}
      />
      <div className="site00-image-inspect-lightbox__panel">
        <button
          type="button"
          className="site00-image-inspect-lightbox__close"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>
        <img src={imageUrl} alt={alt} className="site00-image-inspect-lightbox__image" draggable={false} />
        {caption ? <p className="site00-image-inspect-lightbox__caption">{caption}</p> : null}
      </div>
    </div>
  );
}
