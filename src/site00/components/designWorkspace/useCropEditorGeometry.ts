/**
 * P0.VR.6R9 — Central crop geometry measurement + alignment for editor.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CanonicalCropRect } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/canonicalCropRect.js';
import {
  canonicalFromNormalized,
  canonicalToExtractPixels,
  normalizedFromCanonical,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/canonicalCropRect.js';
import type { OverlayCssRect } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/cropCoordinateTransform.js';
import { sourceRectToOverlayCss } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/cropCoordinateTransform.js';
import {
  evaluateCropPreviewAlignment,
  overlayMappedSourceRect,
  recalibrateCropGeometry,
  type CropPreviewAlignmentResult,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/cropPreviewAlignment.js';
import type { RenderedImageGeometry } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/renderedImageGeometry.js';
import {
  computeLayoutImageGeometry,
  computeScreenImageGeometry,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/renderedImageGeometry.js';
import type { NormalizedBbox } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/types.js';

type Params = {
  normalizedCrop: NormalizedBbox;
  sourceImageUrl: string;
  candidateId: string;
  zoom: number;
  panX?: number;
  panY?: number;
  imgRef: React.RefObject<HTMLImageElement | null>;
  stageRef: React.RefObject<HTMLDivElement | null>;
};

export function useCropEditorGeometry({
  normalizedCrop,
  sourceImageUrl,
  candidateId,
  zoom,
  panX = 0,
  panY = 0,
  imgRef,
  stageRef,
}: Params) {
  const [geometryVersion, setGeometryVersion] = useState(0);

  const remeasure = useCallback(() => setGeometryVersion((v) => v + 1), []);

  useEffect(() => {
    remeasure();
    const img = imgRef.current;
    if (!img) return;
    const onLoad = () => remeasure();
    img.addEventListener('load', onLoad);
    window.addEventListener('resize', remeasure);
    window.addEventListener('scroll', remeasure, true);
    return () => {
      img.removeEventListener('load', onLoad);
      window.removeEventListener('resize', remeasure);
      window.removeEventListener('scroll', remeasure, true);
    };
  }, [imgRef, remeasure, sourceImageUrl, zoom, panX, panY]);

  const naturalWidth = imgRef.current?.naturalWidth ?? 0;
  const naturalHeight = imgRef.current?.naturalHeight ?? 0;

  const canonical: CanonicalCropRect | null = useMemo(() => {
    if (naturalWidth <= 0 || naturalHeight <= 0) return null;
    return canonicalFromNormalized(normalizedCrop, naturalWidth, naturalHeight);
  }, [normalizedCrop, naturalWidth, naturalHeight, geometryVersion]);

  const layoutGeometry: RenderedImageGeometry | null = useMemo(() => {
    const img = imgRef.current;
    const stage = stageRef.current;
    if (!img || img.naturalWidth <= 0 || img.offsetWidth <= 0) return null;
    const objectFit =
      typeof window !== 'undefined'
        ? (window.getComputedStyle(img).objectFit as 'fill' | 'contain' | 'cover' | undefined) ?? 'fill'
        : 'fill';
    const layoutWidth = stage?.offsetWidth ?? img.offsetWidth;
    const layoutHeight = stage?.offsetHeight ?? img.offsetHeight;
    return computeLayoutImageGeometry({
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      layoutWidth,
      layoutHeight,
      objectFit: objectFit === 'contain' ? 'contain' : 'fill',
      devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
      viewport: { zoom, panX, panY },
    });
  }, [imgRef, stageRef, zoom, panX, panY, geometryVersion]);

  const screenGeometry: RenderedImageGeometry | null = useMemo(() => {
    const img = imgRef.current;
    if (!img || img.naturalWidth <= 0) return null;
    const rect = img.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return computeScreenImageGeometry({
      imageRect: rect,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
      viewport: { zoom, panX, panY },
    });
  }, [imgRef, zoom, panX, panY, geometryVersion]);

  const overlayCss: OverlayCssRect | null = useMemo(() => {
    if (!canonical || !layoutGeometry) return null;
    return sourceRectToOverlayCss(canonical, layoutGeometry);
  }, [canonical, layoutGeometry]);

  const sourceImageId = `${candidateId}:${sourceImageUrl}:${naturalWidth}x${naturalHeight}`;

  const previewExtract = useMemo(
    () => (canonical ? canonicalToExtractPixels(canonical) : null),
    [canonical],
  );

  const alignment: CropPreviewAlignmentResult | null = useMemo(() => {
    if (!canonical || !layoutGeometry || !previewExtract) return null;
    const overlayMapped = overlayMappedSourceRect(canonical, layoutGeometry);
    return evaluateCropPreviewAlignment({
      canonical,
      geometry: layoutGeometry,
      previewExtractRect: previewExtract,
      overlayMappedRect: overlayMapped,
      sourceImageId,
      expectedSourceImageId: sourceImageId,
    });
  }, [canonical, layoutGeometry, previewExtract, sourceImageId]);

  const drawPreview = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      const img = imgRef.current;
      if (!canvas || !img || !img.complete || !canonical) return;
      const extract = canonicalToExtractPixels(canonical);
      canvas.width = extract.width;
      canvas.height = extract.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, extract.x, extract.y, extract.width, extract.height, 0, 0, extract.width, extract.height);
    },
    [imgRef, canonical],
  );

  const recalibrate = useCallback(() => {
    if (!canonical || !layoutGeometry) return;
    recalibrateCropGeometry({ canonical, geometry: layoutGeometry, candidateId });
    remeasure();
  }, [canonical, layoutGeometry, candidateId, remeasure]);

  const canonicalToNormalized = useCallback((c: CanonicalCropRect) => normalizedFromCanonical(c), []);

  return {
    canonical,
    geometry: layoutGeometry,
    screenGeometry,
    overlayCss,
    alignment,
    sourceImageId,
    naturalWidth,
    naturalHeight,
    remeasure,
    recalibrate,
    drawPreview,
    canonicalToNormalized,
  };
}
