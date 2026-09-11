/**
 * P0.VR.CAPTURE.1R3 — Shared design authority / live capture preview with load health.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildImageDeliveryTrace,
  derivePreviewHealthFromBrowser,
  previewHealthLabel,
  resolveAssetRenderableUrl,
} from '../../../../../shared/site00-studio-world-production/assetDelivery/index.js';
import type { PreviewHealth } from '../../../../../shared/site00-studio-world-production/assetDelivery/types.js';

type Props = {
  assetRef: string | null | undefined;
  alt: string;
  label: string;
  emptyCopy?: string;
  sourceType: string;
  sourceId: string;
  onPreviewHealthChange?: (health: PreviewHealth) => void;
  onViewDetails?: () => void;
};

export function DesignAssetPreview({
  assetRef,
  alt,
  label,
  emptyCopy = 'NO PREVIEW',
  sourceType,
  sourceId,
  onPreviewHealthChange,
  onViewDetails,
}: Props) {
  const [browserLoaded, setBrowserLoaded] = useState(false);
  const [browserError, setBrowserError] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);

  const resolved = useMemo(() => resolveAssetRenderableUrl(assetRef ?? null), [assetRef, retryNonce]);
  const previewUrl = resolved.url;

  useEffect(() => {
    setBrowserLoaded(false);
    setBrowserError(false);
  }, [previewUrl]);

  const previewHealth = useMemo(
    () =>
      derivePreviewHealthFromBrowser({
        ref: assetRef ?? null,
        browserLoaded,
        browserError,
      }),
    [assetRef, browserLoaded, browserError],
  );

  useEffect(() => {
    onPreviewHealthChange?.(previewHealth);
  }, [onPreviewHealthChange, previewHealth]);

  const handleLoad = useCallback(() => {
    setBrowserLoaded(true);
    setBrowserError(false);
  }, []);

  const handleError = useCallback(() => {
    setBrowserError(true);
    setBrowserLoaded(false);
  }, []);

  const trace = useMemo(
    () =>
      buildImageDeliveryTrace({
        sourceType,
        sourceId,
        ref: assetRef ?? null,
        browserLoaded,
      }),
    [assetRef, browserLoaded, sourceId, sourceType],
  );

  return (
    <div className="site00-design-asset-preview">
      <div className="site00-design-asset-preview__meta">
        <p className="site00-design-asset-preview__label">{label}</p>
        <p
          className={`site00-design-asset-preview__health is-${previewHealth.status.toLowerCase()}`}
          aria-live="polite"
        >
          {previewUrl ? previewHealthLabel(previewHealth) : 'PREVIEW UNAVAILABLE'}
        </p>
      </div>
      {previewUrl && !browserError ? (
        <img
          key={`${previewUrl}:${retryNonce}`}
          src={previewUrl}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <div className="site00-design-asset-preview__empty" role="status">
          <span aria-hidden>▢</span>
          <small>{browserError ? 'PREVIEW UNAVAILABLE' : emptyCopy}</small>
          {browserError ? (
            <div className="site00-design-asset-preview__actions">
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={() => setRetryNonce((n) => n + 1)}>
                REFRESH PREVIEW
              </button>
              {onViewDetails ? (
                <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onViewDetails}>
                  VIEW DETAILS
                </button>
              ) : null}
            </div>
          ) : null}
          {browserError && trace.errorCode ? (
            <small className="site00-design-asset-preview__error-code">{trace.errorCode}</small>
          ) : null}
        </div>
      )}
    </div>
  );
}
