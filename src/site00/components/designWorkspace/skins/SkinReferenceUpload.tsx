/**
 * Styled reference upload dropzone — hides native file input.
 */

import { useId, useRef, useState } from 'react';
import { DesignDwSectionIcon } from '../DesignDwSectionIcon.js';

type Props = {
  referenceAssetId: string;
  previewUrl?: string | null;
  fileName?: string | null;
  dimensions?: string | null;
  onSelect: (assetId: string, file: File, previewUrl: string) => void;
  onRemove: () => void;
  disabled?: boolean;
};

export function SkinReferenceUpload({
  referenceAssetId,
  previewUrl,
  fileName,
  dimensions,
  onSelect,
  onRemove,
  disabled = false,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function ingestFile(file: File) {
    const url = URL.createObjectURL(file);
    onSelect(`ref://${file.name}`, file, url);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) ingestFile(file);
  }

  const hasPreview = Boolean(referenceAssetId && previewUrl);

  return (
    <div className="site00-dw-skins-upload">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/*"
        hidden
        disabled={disabled}
        onChange={handleChange}
      />

      {hasPreview ? (
        <div className="site00-dw-skins-upload__preview">
          <div className="site00-dw-skins-upload__thumb">
            <img src={previewUrl!} alt="" />
          </div>
          <div className="site00-dw-skins-upload__meta">
            <strong>{fileName ?? 'SCREEN AUTHORITY'}</strong>
            {dimensions ? <span>{dimensions}</span> : null}
            <div className="site00-dw-skins-upload__actions">
              <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()}>
                REPLACE
              </button>
              <button type="button" disabled={disabled} onClick={onRemove}>
                REMOVE
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`site00-dw-skins-upload__zone${dragOver ? ' is-dragover' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) ingestFile(file);
          }}
        >
          <span className="site00-dw-skins-upload__icon" aria-hidden>
            <DesignDwSectionIcon iconId="image" />
          </span>
          <strong>UPLOAD SCREEN AUTHORITY</strong>
          <span>PNG · JPG · WEBP</span>
          <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--dark" disabled={disabled} onClick={() => inputRef.current?.click()}>
            CHOOSE FILE
          </button>
        </div>
      )}
    </div>
  );
}
