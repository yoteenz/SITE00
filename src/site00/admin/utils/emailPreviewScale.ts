/** Deterministic email debug preview scale — fits canonical width into available space. */
export function computeEmailPreviewScale(
  availableWidth: number,
  canonicalWidth: number,
  horizontalPadding = 0,
): number {
  if (canonicalWidth <= 0) return 1;
  const inner = Math.max(1, availableWidth - horizontalPadding * 2);
  return Math.min(1, inner / canonicalWidth);
}

export type EmailPreviewScaleBox = {
  scale: number;
  canonicalWidth: number;
  scaledWidth: number;
  scaledHeight: number;
};

export function measureEmailPreviewScaleBox(
  availableWidth: number,
  canonicalWidth: number,
  contentHeight: number,
  horizontalPadding = 0,
): EmailPreviewScaleBox {
  const scale = computeEmailPreviewScale(availableWidth, canonicalWidth, horizontalPadding);
  return {
    scale,
    canonicalWidth,
    scaledWidth: canonicalWidth * scale,
    scaledHeight: contentHeight * scale,
  };
}
