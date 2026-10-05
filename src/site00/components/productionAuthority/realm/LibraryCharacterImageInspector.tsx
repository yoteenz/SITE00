/**
 * In-route character image inspector — overlay inside Production; route state preserved underneath.
 */
import { useCallback, useEffect } from 'react';
import type { CharacterMediaAsset } from './libraryCharacterMedia.js';

type Props = {
  assets: readonly CharacterMediaAsset[];
  index: number;
  title: string;
  onClose: () => void;
  onStep: (delta: -1 | 1) => void;
};

export function LibraryCharacterImageInspector({ assets, index, title, onClose, onStep }: Props) {
  const cur = assets[index];
  const hasMany = assets.length > 1;

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
    <div className="lbf-char-inspect" role="dialog" aria-modal="true" aria-label={`Inspect ${title}`} data-testid="library-character-image-inspector">
      <button type="button" className="lbf-char-inspect__scrim" aria-label="Close inspector" onClick={onClose} data-testid="library-character-inspector-close" />
      <div className="lbf-char-inspect__panel">
        <header className="lbf-char-inspect__head">
          <span>
            <small>{cur.label}</small>
            <b>{title}</b>
          </span>
          <button type="button" className="lbf-char-inspect__x" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>
        <figure className="lbf-char-inspect__figure">
          <img src={cur.url} alt="" draggable={false} data-testid="library-character-inspector-image" />
          {cur.status ? <figcaption>{cur.status}</figcaption> : null}
        </figure>
        {hasMany ? (
          <footer className="lbf-char-inspect__foot">
            <button type="button" onClick={() => onStep(-1)} disabled={index <= 0} data-testid="library-character-inspector-prev">
              PREV
            </button>
            <span data-testid="library-character-inspector-index">
              {index + 1} / {assets.length}
            </span>
            <button type="button" onClick={() => onStep(1)} disabled={index >= assets.length - 1} data-testid="library-character-inspector-next">
              NEXT
            </button>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
