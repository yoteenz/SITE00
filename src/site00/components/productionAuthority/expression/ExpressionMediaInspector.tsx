/**
 * In-route Expression media inspector — overlay inside Production; route state preserved underneath.
 */
import { useCallback, useEffect } from 'react';

export type ExpressionMediaSlide = {
  url: string;
  label: string;
  meta?: string;
};

type Props = {
  slides: readonly ExpressionMediaSlide[];
  index: number;
  title: string;
  onClose: () => void;
  onStep: (delta: -1 | 1) => void;
};

export function ExpressionMediaInspector({ slides, index, title, onClose, onStep }: Props) {
  const cur = slides[index];
  const hasMany = slides.length > 1;

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasMany) onStep(-1);
      if (e.key === 'ArrowRight' && hasMany) onStep(1);
    },
    [hasMany, onClose, onStep],
  );

  useEffect(() => {
    if (!cur) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [cur, onKey]);

  if (!cur) return null;

  return (
    <div className="exf-inspect" role="dialog" aria-modal="true" aria-label={`Inspect ${title}`} data-testid="expression-media-inspector">
      <button type="button" className="exf-inspect__scrim" aria-label="Close inspector" onClick={onClose} data-testid="expression-media-inspector-close" />
      <div className="exf-inspect__panel">
        <header className="exf-inspect__head">
          <span>
            <small>{cur.label}</small>
            <b>{title}</b>
          </span>
          <button type="button" className="exf-inspect__x" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>
        <figure className="exf-inspect__figure">
          <img src={cur.url} alt="" draggable={false} data-testid="expression-media-inspector-image" />
          {cur.meta ? <figcaption>{cur.meta}</figcaption> : null}
        </figure>
        {hasMany ?
          <footer className="exf-inspect__foot">
            <button type="button" onClick={() => onStep(-1)} disabled={index <= 0} data-testid="expression-media-inspector-prev">
              PREV
            </button>
            <span data-testid="expression-media-inspector-index">
              {index + 1} / {slides.length}
            </span>
            <button type="button" onClick={() => onStep(1)} disabled={index >= slides.length - 1} data-testid="expression-media-inspector-next">
              NEXT
            </button>
          </footer>
        : null}
      </div>
    </div>
  );
}
