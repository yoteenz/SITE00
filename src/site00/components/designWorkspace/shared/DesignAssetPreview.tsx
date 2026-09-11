/**
 * P0.VR.AUTH.1 — Design authority / live capture preview with bounded lifecycle.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import {
  appendCacheBustQuery,
  buildImageDeliveryTrace,
  derivePreviewHealthFromBrowser,
  PREVIEW_STATIC_IMAGE_TIMEOUT_MS,
  previewHealthLabel,
  previewHealthLifecycleLabel,
  resolveAssetRenderableUrl,
  startPreviewHealthLoading,
  type PreviewHealthLifecycleState,
} from '../../../../../shared/site00-studio-world-production/assetDelivery/index.js';
import type { PreviewHealth } from '../../../../../shared/site00-studio-world-production/assetDelivery/types.js';

type Props = {
  assetRef: string | null | undefined;
  alt: string;
  label: string;
  emptyCopy?: string;
  sourceType: string;
  sourceId: string;
  cacheBustKey?: string | null;
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
  cacheBustKey,
  onPreviewHealthChange,
  onViewDetails,
}: Props) {
  const [lifecycle, setLifecycle] = useState<PreviewHealthLifecycleState>('IDLE');
  const [retryNonce, setRetryNonce] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolved = useMemo(() => resolveAssetRenderableUrl(assetRef ?? null), [assetRef]);
  const previewUrl = useMemo(() => {
    if (!resolved.url) return null;
    if (retryNonce > 0 || cacheBustKey) {
      return appendCacheBustQuery(resolved.url, cacheBustKey ?? String(retryNonce));
    }
    return resolved.url;
  }, [resolved.url, retryNonce, cacheBustKey]);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearTimer();
    if (!previewUrl) {
      setLifecycle('IDLE');
      return;
    }
    setLifecycle(startPreviewHealthLoading({ state: 'IDLE', retryCount: retryNonce, startedAt: null, resolvedUrl: null }, previewUrl).state);
    timeoutRef.current = setTimeout(() => {
      setLifecycle('TIMEOUT');
    }, PREVIEW_STATIC_IMAGE_TIMEOUT_MS);
    return clearTimer;
  }, [previewUrl, retryNonce, clearTimer]);

  const previewHealth = useMemo(
    () =>
      derivePreviewHealthFromBrowser({
        ref: assetRef ?? null,
        browserLoaded: lifecycle === 'PASS',
        browserError: lifecycle === 'FAIL' || lifecycle === 'TIMEOUT',
        lifecycle,
      }),
    [assetRef, lifecycle],
  );

  useEffect(() => {
    onPreviewHealthChange?.(previewHealth);
  }, [onPreviewHealthChange, previewHealth]);

  const handleLoad = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
    clearTimer();
    const img = event.currentTarget;
    if (!img.naturalWidth || !img.naturalHeight) {
      setLifecycle('FAIL');
      return;
    }
    setLifecycle('PASS');
  }, [clearTimer]);

  const handleError = useCallback(() => {
    clearTimer();
    setLifecycle('FAIL');
  }, [clearTimer]);

  const handleRetry = useCallback(() => {
    clearTimer();
    setLifecycle('IDLE');
    setRetryNonce((n) => n + 1);
  }, [clearTimer]);

  const trace = useMemo(
    () =>
      buildImageDeliveryTrace({
        sourceType,
        sourceId,
        ref: assetRef ?? null,
        browserLoaded: lifecycle === 'PASS',
      }),
    [assetRef, lifecycle, sourceId, sourceType],
  );

  const showImage = Boolean(previewUrl) && lifecycle !== 'FAIL' && lifecycle !== 'TIMEOUT';
  const healthLabel = previewUrl ? previewHealthLifecycleLabel(lifecycle) : 'PREVIEW UNAVAILABLE';

  return (
    <div className="site00-design-asset-preview">
      <div className="site00-design-asset-preview__meta">
        <p className="site00-design-asset-preview__label">{label}</p>
        <p
          className={`site00-design-asset-preview__health is-${previewHealth.status.toLowerCase()} is-lifecycle-${lifecycle.toLowerCase()}`}
          aria-live="polite"
        >
          {previewUrl ? healthLabel : previewHealthLabel(previewHealth)}
        </p>
      </div>
      {showImage ? (
        <img
          key={`${previewUrl}:${retryNonce}`}
          src={previewUrl ?? undefined}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <div className="site00-design-asset-preview__empty" role="status">
          <span aria-hidden>▢</span>
          <small>
            {lifecycle === 'TIMEOUT'
              ? 'PREVIEW TOOK TOO LONG'
              : lifecycle === 'FAIL'
                ? 'PREVIEW UNAVAILABLE'
                : emptyCopy}
          </small>
          {lifecycle === 'TIMEOUT' || lifecycle === 'FAIL' ? (
            <div className="site00-design-asset-preview__actions">
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={handleRetry}>
                RETRY PREVIEW
              </button>
              {onViewDetails ? (
                <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onViewDetails}>
                  VIEW DETAILS
                </button>
              ) : null}
            </div>
          ) : null}
          {(lifecycle === 'FAIL' || lifecycle === 'TIMEOUT') && (trace.errorCode || previewUrl) ? (
            <div className="site00-design-asset-preview__diagnostics">
              {trace.errorCode ? (
                <small className="site00-design-asset-preview__error-code">{trace.errorCode}</small>
              ) : null}
              {previewUrl ? (
                <small className="site00-design-asset-preview__resolved-url">{previewUrl}</small>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
