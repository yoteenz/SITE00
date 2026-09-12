/**
 * P0.VR.AUTH.1 — Design authority / live capture preview with bounded lifecycle.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import {
  appendCacheBustQuery,
  buildImageDeliveryTrace,
  derivePreviewHealthFromBrowser,
  previewHealthLabel,
  previewHealthLifecycleLabel,
  resolveAssetRenderableUrl,
  resolvePreviewLoadTimeoutMs,
  normalizePreviewUrlForComparison,
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
  const [stickyLoadedUrl, setStickyLoadedUrl] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const resolved = useMemo(() => resolveAssetRenderableUrl(assetRef ?? null), [assetRef]);
  const previewUrl = useMemo(() => {
    if (!resolved.url) return null;
    if (retryNonce > 0 || cacheBustKey) {
      return appendCacheBustQuery(resolved.url, cacheBustKey ?? String(retryNonce));
    }
    return resolved.url;
  }, [resolved.url, retryNonce, cacheBustKey]);

  const previewUrlKey = useMemo(
    () => (previewUrl ? normalizePreviewUrlForComparison(previewUrl) : null),
    [previewUrl],
  );

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const markPassFromImage = useCallback(
    (img: HTMLImageElement) => {
      if (!img.naturalWidth || !img.naturalHeight) {
        setLifecycle('FAIL');
        return;
      }
      clearTimer();
      setLifecycle('PASS');
      if (previewUrlKey) setStickyLoadedUrl(previewUrlKey);
    },
    [clearTimer, previewUrlKey],
  );

  useEffect(() => {
    clearTimer();
    if (!previewUrl || !previewUrlKey) {
      setLifecycle('IDLE');
      setStickyLoadedUrl(null);
      return;
    }

    if (stickyLoadedUrl === previewUrlKey) {
      setLifecycle('PASS');
      return;
    }

    setLifecycle(startPreviewHealthLoading({ state: 'IDLE', retryCount: retryNonce, startedAt: null, resolvedUrl: null }, previewUrl).state);

    const timeoutMs = resolvePreviewLoadTimeoutMs(previewUrl);
    timeoutRef.current = setTimeout(() => {
      const img = imgRef.current;
      if (img?.complete && img.naturalWidth > 0 && previewUrlKey) {
        setStickyLoadedUrl(previewUrlKey);
        setLifecycle('PASS');
        return;
      }
      setLifecycle((prev) => {
        if (stickyLoadedUrl === previewUrlKey || prev === 'PASS') return 'PASS';
        return 'TIMEOUT';
      });
    }, timeoutMs);

    return clearTimer;
  }, [previewUrl, previewUrlKey, retryNonce, clearTimer, stickyLoadedUrl]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !previewUrl) return;
    if (img.complete && img.naturalWidth > 0) {
      markPassFromImage(img);
    }
  }, [previewUrl, markPassFromImage]);

  const previewHealth = useMemo(
    () =>
      derivePreviewHealthFromBrowser({
        ref: assetRef ?? null,
        browserLoaded: lifecycle === 'PASS' || stickyLoadedUrl === previewUrlKey,
        browserError: lifecycle === 'FAIL' || (lifecycle === 'TIMEOUT' && stickyLoadedUrl !== previewUrlKey),
        lifecycle: stickyLoadedUrl === previewUrlKey ? 'PASS' : lifecycle,
      }),
    [assetRef, lifecycle, previewUrlKey, stickyLoadedUrl],
  );

  useEffect(() => {
    onPreviewHealthChange?.(previewHealth);
  }, [onPreviewHealthChange, previewHealth]);

  const handleLoad = useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      markPassFromImage(event.currentTarget);
    },
    [markPassFromImage],
  );

  const handleError = useCallback(() => {
    clearTimer();
    if (stickyLoadedUrl === previewUrlKey) return;
    setLifecycle('FAIL');
  }, [clearTimer, previewUrlKey, stickyLoadedUrl]);

  const handleRetry = useCallback(() => {
    clearTimer();
    setStickyLoadedUrl(null);
    setLifecycle('IDLE');
    setRetryNonce((n) => n + 1);
  }, [clearTimer]);

  const trace = useMemo(
    () =>
      buildImageDeliveryTrace({
        sourceType,
        sourceId,
        ref: assetRef ?? null,
        browserLoaded: lifecycle === 'PASS' || stickyLoadedUrl === previewUrlKey,
      }),
    [assetRef, lifecycle, previewUrlKey, sourceId, sourceType, stickyLoadedUrl],
  );

  const displayPass = lifecycle === 'PASS' || stickyLoadedUrl === previewUrlKey;
  const hardFail = (lifecycle === 'FAIL' || lifecycle === 'TIMEOUT') && !displayPass;
  const showImage = Boolean(previewUrl) && !hardFail;
  const healthLabel = previewUrl ? previewHealthLifecycleLabel(displayPass ? 'PASS' : lifecycle) : 'PREVIEW UNAVAILABLE';
  const softTimeout = lifecycle === 'TIMEOUT' && displayPass;

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
        <>
          {softTimeout ? (
            <p className="site00-design-asset-preview__soft-warn" role="status">
              PREVIEW SLOW — SHOWING LAST GOOD FRAME
            </p>
          ) : null}
          <img
            ref={imgRef}
            key={`${previewUrlKey}:${retryNonce}`}
            src={previewUrl ?? undefined}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
          />
        </>
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
