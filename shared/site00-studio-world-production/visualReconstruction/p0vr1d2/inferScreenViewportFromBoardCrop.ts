/**
 * P0.VR.1D.2 — Detect phone / screen frames on mood boards (not board canvas as viewport).
 */

import sharp from 'sharp';
import type { ExtractedScreenGeometry, ViewportInferenceStatus } from './types.js';

export type DetectedScreenFrame = {
  screenId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  viewportClass: 'desktop' | 'mobile';
};

const MOBILE_VIEWPORT_PRESETS = [
  { width: 390, height: 844 },
  { width: 393, height: 852 },
  { width: 375, height: 812 },
];

export async function detectScreenFramesOnBoard(input: {
  boardBuffer: Buffer;
  boardId: string;
  viewportClass: 'desktop' | 'mobile';
  screenSpecs?: Array<{ screenId: string; x: number; y: number; width: number; height: number }>;
}): Promise<DetectedScreenFrame[]> {
  const meta = await sharp(input.boardBuffer).metadata();
  const boardWidth = meta.width ?? 0;
  const boardHeight = meta.height ?? 0;
  if (boardWidth <= 0 || boardHeight <= 0) return [];

  if (input.screenSpecs?.length) {
    return input.screenSpecs.map((spec) => ({
      screenId: spec.screenId,
      x: Math.round(spec.x * boardWidth),
      y: Math.round(spec.y * boardHeight),
      width: Math.round(spec.width * boardWidth),
      height: Math.round(spec.height * boardHeight),
      viewportClass: input.viewportClass,
    }));
  }

  const aspect = boardWidth / Math.max(boardHeight, 1);

  if (input.viewportClass === 'mobile' && aspect > 1.4) {
    return detectMobilePhoneFrames(input.boardBuffer, boardWidth, boardHeight, input.boardId);
  }

  return [
    {
      screenId: `${input.boardId}__screen-1`,
      x: 0,
      y: 0,
      width: boardWidth,
      height: boardHeight,
      viewportClass: input.viewportClass,
    },
  ];
}

async function detectMobilePhoneFrames(
  buffer: Buffer,
  boardWidth: number,
  boardHeight: number,
  boardId: string,
): Promise<DetectedScreenFrame[]> {
  const { data } = await sharp(buffer).greyscale().raw().toBuffer({ resolveWithObject: true });
  const cols = new Array<number>(boardWidth).fill(0);
  for (let y = Math.floor(boardHeight * 0.05); y < Math.floor(boardHeight * 0.95); y++) {
    for (let x = 0; x < boardWidth; x++) {
      const v = data[y * boardWidth + x] ?? 255;
      if (v < 245) cols[x] = (cols[x] ?? 0) + 1;
    }
  }

  const threshold = boardHeight * 0.15;
  const segments: Array<{ start: number; end: number }> = [];
  let start: number | null = null;
  for (let x = 0; x < boardWidth; x++) {
    const active = (cols[x] ?? 0) > threshold;
    if (active && start === null) start = x;
    if (!active && start !== null) {
      if (x - start > boardWidth * 0.05) segments.push({ start, end: x });
      start = null;
    }
  }
  if (start !== null && boardWidth - start > boardWidth * 0.05) {
    segments.push({ start, end: boardWidth });
  }

  if (segments.length <= 1) {
    const marginX = Math.round(boardWidth * 0.02);
    const marginY = Math.round(boardHeight * 0.04);
    return [
      {
        screenId: `${boardId}__mobile-1`,
        x: marginX,
        y: marginY,
        width: boardWidth - marginX * 2,
        height: boardHeight - marginY * 2,
        viewportClass: 'mobile',
      },
    ];
  }

  return segments.map((seg, index) => ({
    screenId: `${boardId}__mobile-${index + 1}`,
    x: seg.start,
    y: Math.round(boardHeight * 0.04),
    width: seg.end - seg.start,
    height: Math.round(boardHeight * 0.92),
    viewportClass: 'mobile' as const,
  }));
}

export function inferScreenViewportFromBoardCrop(input: {
  screenId: string;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  boardWidth: number;
  boardHeight: number;
  viewportClass: 'desktop' | 'mobile';
  routeViewportHint?: { width: number; height: number } | null;
}): ExtractedScreenGeometry {
  const screenAspectRatio = input.cropWidth / Math.max(input.cropHeight, 1);
  let inferredViewportWidth = input.cropWidth;
  let inferredViewportHeight = input.cropHeight;
  let viewportConfidence: ViewportInferenceStatus = 'INFERRED';

  if (input.routeViewportHint) {
    inferredViewportWidth = input.routeViewportHint.width;
    inferredViewportHeight = input.routeViewportHint.height;
    viewportConfidence = 'EXACT';
  } else if (input.viewportClass === 'mobile') {
    const preset = MOBILE_VIEWPORT_PRESETS.reduce((best, p) => {
      const score = 1 - Math.abs(p.width / p.height - screenAspectRatio) / screenAspectRatio;
      return score > best.score ? { preset: p, score } : best;
    }, { preset: MOBILE_VIEWPORT_PRESETS[0]!, score: 0 });
    inferredViewportWidth = preset.preset.width;
    inferredViewportHeight = preset.preset.height;
    viewportConfidence = preset.score > 0.92 ? 'HIGH_CONFIDENCE' : 'INFERRED';
  } else if (screenAspectRatio > 1.2) {
    inferredViewportWidth = 1440;
    inferredViewportHeight = 900;
    viewportConfidence = Math.abs(screenAspectRatio - 1440 / 900) < 0.05 ? 'HIGH_CONFIDENCE' : 'INFERRED';
  }

  const boardCanvasUsedAsViewport =
    input.cropWidth === input.boardWidth && input.cropHeight === input.boardHeight && input.viewportClass === 'desktop';

  if (boardCanvasUsedAsViewport && input.boardWidth >= 1200 && input.viewportClass === 'desktop') {
    inferredViewportWidth = 1440;
    inferredViewportHeight = 900;
    viewportConfidence = 'INFERRED';
  }

  return {
    screenId: input.screenId,
    cropX: input.cropX,
    cropY: input.cropY,
    cropWidth: input.cropWidth,
    cropHeight: input.cropHeight,
    screenAspectRatio,
    screenFrameBounds: { x: input.cropX, y: input.cropY, width: input.cropWidth, height: input.cropHeight },
    inferredViewportWidth,
    inferredViewportHeight,
    viewportConfidence,
    boardWidth: input.boardWidth,
    boardHeight: input.boardHeight,
  };
}

export function boardCanvasTreatedAsScreenViewport(geometry: ExtractedScreenGeometry): boolean {
  return (
    geometry.cropWidth === geometry.boardWidth &&
    geometry.cropHeight === geometry.boardHeight &&
    geometry.inferredViewportWidth === geometry.boardWidth &&
    geometry.inferredViewportHeight === geometry.boardHeight
  );
}

export async function cropBoardScreenReference(
  boardBuffer: Buffer,
  frame: DetectedScreenFrame,
  outputPath: string,
): Promise<Buffer> {
  const { writeFileSync, mkdirSync } = await import('node:fs');
  const { dirname } = await import('node:path');
  const cropped = await sharp(boardBuffer)
    .extract({
      left: Math.max(0, frame.x),
      top: Math.max(0, frame.y),
      width: Math.max(1, frame.width),
      height: Math.max(1, frame.height),
    })
    .png()
    .toBuffer();
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, cropped);
  return cropped;
}
