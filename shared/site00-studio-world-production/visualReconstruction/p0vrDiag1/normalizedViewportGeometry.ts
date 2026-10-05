/**
 * P0.VR.DIAG.1 — Normalized viewport geometry helpers.
 */

import type { NormalizedViewportGeometry } from './types.js';

export function buildNormalizedViewportGeometry(input: {
  x: number;
  y: number;
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
}): NormalizedViewportGeometry {
  const { x, y, width, height, viewportWidth, viewportHeight } = input;
  const safeW = Math.max(1, viewportWidth);
  const safeH = Math.max(1, viewportHeight);
  return {
    xPx: roundPx(x),
    yPx: roundPx(y),
    widthPx: roundPx(width),
    heightPx: roundPx(height),
    widthPct: roundPct((width / safeW) * 100),
    heightPct: roundPct((height / safeH) * 100),
    aspectRatio: width > 0 ? roundRatio(width / height) : 0,
    topOffsetPx: roundPx(y),
    leftOffsetPx: roundPx(x),
    rightOffsetPx: roundPx(Math.max(0, safeW - (x + width))),
    bottomOffsetPx: roundPx(Math.max(0, safeH - (y + height))),
  };
}

export function geometryFromDom(
  dom: { actualX: number; actualY: number; actualWidth: number; actualHeight: number },
  viewportWidth: number,
  viewportHeight: number,
): NormalizedViewportGeometry {
  return buildNormalizedViewportGeometry({
    x: dom.actualX,
    y: dom.actualY,
    width: dom.actualWidth,
    height: dom.actualHeight,
    viewportWidth,
    viewportHeight,
  });
}

export function formatPx(value: number | null | undefined, confidence: 'HIGH' | 'MEDIUM' | 'LOW'): string {
  if (value == null || !Number.isFinite(value)) return confidence === 'LOW' ? 'ESTIMATE UNAVAILABLE' : '—';
  if (confidence === 'LOW') return `~${Math.round(value)}px`;
  return `${Math.round(value)}px`;
}

export function formatPct(value: number | null | undefined, confidence: 'HIGH' | 'MEDIUM' | 'LOW'): string {
  if (value == null || !Number.isFinite(value)) return '—';
  const rounded = Math.round(value * 10) / 10;
  return confidence === 'LOW' ? `~${rounded}%` : `${rounded}%`;
}

function roundPx(n: number): number {
  return Math.round(n * 10) / 10;
}

function roundPct(n: number): number {
  return Math.round(n * 10) / 10;
}

function roundRatio(n: number): number {
  return Math.round(n * 100) / 100;
}
