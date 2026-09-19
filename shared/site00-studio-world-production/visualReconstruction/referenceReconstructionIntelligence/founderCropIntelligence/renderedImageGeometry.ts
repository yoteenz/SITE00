/**
 * P0.VR.6R9 — RenderedImageGeometry: true displayed image bounds (letterbox / object-fit aware).
 */

export type ObjectFitMode = 'fill' | 'contain' | 'cover';

export type ViewportTransform = {
  zoom: number;
  panX: number;
  panY: number;
};

export type RenderedImageGeometry = {
  /** Viewport-relative rendered image origin (CSS px). */
  left: number;
  top: number;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
  scaleX: number;
  scaleY: number;
  objectFit: ObjectFitMode;
  objectPosition: string;
  letterboxX: number;
  letterboxY: number;
  containerLeft: number;
  containerTop: number;
  containerWidth: number;
  containerHeight: number;
  devicePixelRatio: number;
  viewport: ViewportTransform;
};

export type MeasureGeometryInput = {
  imageRect: DOMRect;
  containerRect: DOMRect;
  naturalWidth: number;
  naturalHeight: number;
  objectFit?: ObjectFitMode;
  objectPosition?: string;
  devicePixelRatio?: number;
  viewport?: ViewportTransform;
};

/** Measure geometry from live DOM rects (getBoundingClientRect — viewport space, includes transforms). */
export function measureRenderedImageGeometry(input: MeasureGeometryInput): RenderedImageGeometry {
  const {
    imageRect,
    containerRect,
    naturalWidth,
    naturalHeight,
    objectFit = 'fill',
    objectPosition = '50% 50%',
    devicePixelRatio = 1,
    viewport = { zoom: 1, panX: 0, panY: 0 },
  } = input;

  let left = imageRect.left;
  let top = imageRect.top;
  let width = imageRect.width;
  let height = imageRect.height;
  let letterboxX = 0;
  let letterboxY = 0;

  if (objectFit === 'contain' && naturalWidth > 0 && naturalHeight > 0) {
    const containerW = containerRect.width;
    const containerH = containerRect.height;
    const imageAspect = naturalWidth / naturalHeight;
    const containerAspect = containerW / containerH;
    if (containerAspect > imageAspect) {
      height = containerH;
      width = height * imageAspect;
      letterboxX = (containerW - width) / 2;
      letterboxY = 0;
    } else {
      width = containerW;
      height = width / imageAspect;
      letterboxX = 0;
      letterboxY = (containerH - height) / 2;
    }
    left = containerRect.left + letterboxX;
    top = containerRect.top + letterboxY;
  }

  const scaleX = naturalWidth > 0 ? width / naturalWidth : 1;
  const scaleY = naturalHeight > 0 ? height / naturalHeight : 1;

  return {
    left,
    top,
    width,
    height,
    naturalWidth,
    naturalHeight,
    scaleX,
    scaleY,
    objectFit,
    objectPosition,
    letterboxX,
    letterboxY,
    containerLeft: containerRect.left,
    containerTop: containerRect.top,
    containerWidth: containerRect.width,
    containerHeight: containerRect.height,
    devicePixelRatio,
    viewport,
  };
}

/** Layout-space geometry for overlay positioning (unaffected by CSS transform scale). */
export function computeLayoutImageGeometry(input: {
  naturalWidth: number;
  naturalHeight: number;
  layoutWidth: number;
  layoutHeight: number;
  objectFit?: ObjectFitMode;
  objectPosition?: string;
  devicePixelRatio?: number;
  viewport?: ViewportTransform;
}): RenderedImageGeometry {
  if (input.objectFit === 'contain') {
    return computeRenderedImageGeometry({
      containerWidth: input.layoutWidth,
      containerHeight: input.layoutHeight,
      naturalWidth: input.naturalWidth,
      naturalHeight: input.naturalHeight,
      objectFit: 'contain',
      objectPosition: input.objectPosition,
      devicePixelRatio: input.devicePixelRatio,
      viewport: input.viewport,
    });
  }
  const scaleX = input.naturalWidth > 0 ? input.layoutWidth / input.naturalWidth : 1;
  const scaleY = input.naturalHeight > 0 ? input.layoutHeight / input.naturalHeight : 1;
  return {
    left: 0,
    top: 0,
    width: input.layoutWidth,
    height: input.layoutHeight,
    naturalWidth: input.naturalWidth,
    naturalHeight: input.naturalHeight,
    scaleX,
    scaleY,
    objectFit: input.objectFit ?? 'fill',
    objectPosition: input.objectPosition ?? '50% 50%',
    letterboxX: 0,
    letterboxY: 0,
    containerLeft: 0,
    containerTop: 0,
    containerWidth: input.layoutWidth,
    containerHeight: input.layoutHeight,
    devicePixelRatio: input.devicePixelRatio ?? 1,
    viewport: input.viewport ?? { zoom: 1, panX: 0, panY: 0 },
  };
}

/** Screen-space geometry from getBoundingClientRect (for pointer mapping). */
export function computeScreenImageGeometry(input: {
  imageRect: DOMRect;
  naturalWidth: number;
  naturalHeight: number;
  devicePixelRatio?: number;
  viewport?: ViewportTransform;
}): RenderedImageGeometry {
  const scaleX = input.naturalWidth > 0 ? input.imageRect.width / input.naturalWidth : 1;
  const scaleY = input.naturalHeight > 0 ? input.imageRect.height / input.naturalHeight : 1;
  return {
    left: input.imageRect.left,
    top: input.imageRect.top,
    width: input.imageRect.width,
    height: input.imageRect.height,
    naturalWidth: input.naturalWidth,
    naturalHeight: input.naturalHeight,
    scaleX,
    scaleY,
    objectFit: 'fill',
    objectPosition: '50% 50%',
    letterboxX: 0,
    letterboxY: 0,
    containerLeft: input.imageRect.left,
    containerTop: input.imageRect.top,
    containerWidth: input.imageRect.width,
    containerHeight: input.imageRect.height,
    devicePixelRatio: input.devicePixelRatio ?? 1,
    viewport: input.viewport ?? { zoom: 1, panX: 0, panY: 0 },
  };
}

export function computeRenderedImageGeometry(input: {
  containerWidth: number;
  containerHeight: number;
  naturalWidth: number;
  naturalHeight: number;
  objectFit?: ObjectFitMode;
  objectPosition?: string;
  devicePixelRatio?: number;
  viewport?: ViewportTransform;
}): RenderedImageGeometry {
  const containerRect = {
    left: 0,
    top: 0,
    width: input.containerWidth,
    height: input.containerHeight,
    right: input.containerWidth,
    bottom: input.containerHeight,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect;

  let imageRect = { ...containerRect };
  if (input.objectFit === 'fill' || !input.objectFit) {
    imageRect = containerRect;
  } else if (input.objectFit === 'contain') {
    const imageAspect = input.naturalWidth / input.naturalHeight;
    const containerAspect = input.containerWidth / input.containerHeight;
    if (containerAspect > imageAspect) {
      const h = input.containerHeight;
      const w = h * imageAspect;
      imageRect = { ...containerRect, left: (input.containerWidth - w) / 2, width: w, height: h } as DOMRect;
    } else {
      const w = input.containerWidth;
      const h = w / imageAspect;
      imageRect = { ...containerRect, top: (input.containerHeight - h) / 2, width: w, height: h } as DOMRect;
    }
  }

  return measureRenderedImageGeometry({
    imageRect,
    containerRect,
    naturalWidth: input.naturalWidth,
    naturalHeight: input.naturalHeight,
    objectFit: input.objectFit ?? 'fill',
    objectPosition: input.objectPosition ?? '50% 50%',
    devicePixelRatio: input.devicePixelRatio ?? 1,
    viewport: input.viewport ?? { zoom: 1, panX: 0, panY: 0 },
  });
}
