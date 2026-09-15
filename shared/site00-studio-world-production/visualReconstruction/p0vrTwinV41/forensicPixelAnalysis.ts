import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type {
  ForensicCalloutMap,
  ForensicEdgeMap,
  ForensicPixelAnalysis,
  ForensicPixelColorSampleMap,
  ForensicTextRegionMap,
  ForensicVisualObjectRegion,
  PixelDerivedRegion,
} from './twinV41Types.js';
import type { TwinV41RequiredMajorRegionId } from './constants.js';
import { TWIN_V41_EXTRACTION_VERSION } from './constants.js';
import { type ForensicRaster, rgbaAt, rgbToHex } from './loadForensicRaster.js';

function isBlueLine(r: number, g: number, b: number): boolean {
  return b > 140 && b > r + 30 && b > g + 10 && r < 120;
}

function isDarkInk(r: number, g: number, b: number): boolean {
  return r < 80 && g < 80 && b < 100;
}

function isCalloutFill(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max > 160 && max - min > 60 && (g > r + 40 || r > g + 40);
}

function regionHash(raster: ForensicRaster, x: number, y: number, w: number, h: number): string {
  const samples: number[] = [];
  for (let sy = 0; sy < 4; sy += 1) {
    for (let sx = 0; sx < 4; sx += 1) {
      const px = x + (w * sx) / 3;
      const py = y + (h * sy) / 3;
      const [r, g, b] = rgbaAt(raster, px, py);
      samples.push(r, g, b);
    }
  }
  return fnv1aHex(samples.join(',')).slice(0, 12);
}

function detectHorizontalEdges(raster: ForensicRaster): ForensicEdgeMap['edges'] {
  const edges: ForensicEdgeMap['edges'] = [];
  const { width, height } = raster;
  for (let y = 2; y < height - 2; y += 2) {
    let blueRun = 0;
    for (let x = 0; x < width; x += 1) {
      const [r, g, b] = rgbaAt(raster, x, y);
      if (isBlueLine(r, g, b)) blueRun += 1;
    }
    if (blueRun > width * 0.35) {
      const [r, g, b] = rgbaAt(raster, width / 2, y);
      edges.push({
        edgeId: `LINE_H_${y}`,
        x1: 0,
        y1: y,
        x2: width - 1,
        y2: y,
        orientation: 'HORIZONTAL',
        thickness: 2,
        approximateColor: rgbToHex(r, g, b),
        confidence: Math.min(1, blueRun / width),
      });
    }
  }
  return edges.slice(0, 48);
}

function detectVerticalEdges(raster: ForensicRaster, yMin: number, yMax: number): ForensicEdgeMap['edges'] {
  const edges: ForensicEdgeMap['edges'] = [];
  const { width } = raster;
  for (let x = 2; x < width - 2; x += 2) {
    let blueRun = 0;
    for (let y = yMin; y < yMax; y += 1) {
      const [r, g, b] = rgbaAt(raster, x, y);
      if (isBlueLine(r, g, b)) blueRun += 1;
    }
    const span = yMax - yMin;
    if (blueRun > span * 0.25) {
      const [r, g, b] = rgbaAt(raster, x, (yMin + yMax) / 2);
      edges.push({
        edgeId: `LINE_V_${x}`,
        x1: x,
        y1: yMin,
        x2: x,
        y2: yMax,
        orientation: 'VERTICAL',
        thickness: 2,
        approximateColor: rgbToHex(r, g, b),
        confidence: Math.min(1, blueRun / span),
      });
    }
  }
  return edges.slice(0, 12);
}

function findMajorSplitX(raster: ForensicRaster, yMin: number, yMax: number): number {
  const vertical = detectVerticalEdges(raster, yMin, yMax);
  if (!vertical.length) return Math.round(raster.width * 0.62);
  const best = vertical.sort((a, b) => b.confidence - a.confidence)[0]!;
  return best.x1;
}

function findHorizontalSplitY(edges: ForensicEdgeMap['edges'], minY: number, maxY: number): number[] {
  return edges
    .filter((e) => e.orientation === 'HORIZONTAL' && e.y1 >= minY && e.y1 <= maxY)
    .map((e) => e.y1)
    .sort((a, b) => a - b);
}

function makeMajorRegion(
  raster: ForensicRaster,
  regionId: TwinV41RequiredMajorRegionId,
  x: number,
  y: number,
  w: number,
  h: number,
  confidence: number,
): PixelDerivedRegion {
  const [r, g, b] = rgbaAt(raster, x + w / 2, y + h / 2);
  return {
    regionId,
    x,
    y,
    width: w,
    height: h,
    normalizedBounds: {
      x: x / raster.width,
      y: y / raster.height,
      w: w / raster.width,
      h: h / raster.height,
    },
    evidenceType: 'PIXEL_EDGE',
    edgeConfidence: confidence,
    contrastConfidence: confidence * 0.9,
    dominantColors: [rgbToHex(r, g, b)],
    sourcePixelHash: regionHash(raster, x, y, w, h),
    sourceCropRef: `crop:${regionId}:${regionHash(raster, x, y, w, h)}`,
    confidence,
    classification: 'CRITICAL',
  };
}

function detectMajorRegions(raster: ForensicRaster, edges: ForensicEdgeMap['edges']): PixelDerivedRegion[] {
  const { width, height } = raster;
  const titleBottom =
    edges.find((e) => e.y1 > height * 0.04 && e.y1 < height * 0.14)?.y1 ?? Math.round(height * 0.1);
  const lowerTop =
    edges.find((e) => e.y1 > height * 0.72 && e.y1 < height * 0.82)?.y1 ?? Math.round(height * 0.76);

  const bodyTop = titleBottom + 4;
  const bodyBottom = lowerTop - 4;
  const splitX = findMajorSplitX(raster, bodyTop, bodyBottom);

  const lowerSplits = findHorizontalSplitY(edges, lowerTop, height - 4);
  const l1 = lowerTop;
  const l2 = lowerSplits[1] ?? Math.round(lowerTop + (height - lowerTop) * 0.25);
  const l3 = lowerSplits[2] ?? Math.round(lowerTop + (height - lowerTop) * 0.5);
  const l4 = lowerSplits[3] ?? Math.round(lowerTop + (height - lowerTop) * 0.75);

  return [
    makeMajorRegion(raster, 'DOCUMENT_CANVAS', 0, 0, width, height, 0.98),
    makeMajorRegion(raster, 'TITLE_HEADER', 8, 8, width - 16, titleBottom - 8, 0.85),
    makeMajorRegion(raster, 'LEFT_MAIN_BLUEPRINT_PANEL', 8, bodyTop, splitX - 12, bodyBottom - bodyTop, 0.82),
    makeMajorRegion(
      raster,
      'RIGHT_OBJECT_INVENTORY',
      splitX + 4,
      bodyTop,
      width - splitX - 12,
      bodyBottom - bodyTop,
      0.8,
    ),
    makeMajorRegion(raster, 'LOWER_COLOR_PALETTE', 8, l1, width - 16, l2 - l1, 0.75),
    makeMajorRegion(raster, 'LOWER_TYPOGRAPHY_KEY', 8, l2, width - 16, l3 - l2, 0.72),
    makeMajorRegion(raster, 'LOWER_DIVIDER_SPECS', 8, l3, width - 16, l4 - l3, 0.7),
    makeMajorRegion(raster, 'LOWER_NOTES_CONTEXT', 8, l4, width - 16, height - l4 - 8, 0.68),
  ];
}

function sampleColors(raster: ForensicRaster): ForensicPixelColorSampleMap {
  const picks: { role: string; x: number; y: number }[] = [
    { role: 'document_background', x: raster.width * 0.05, y: raster.height * 0.05 },
    { role: 'technical_linework', x: raster.width * 0.5, y: raster.height * 0.11 },
    { role: 'blue_labels', x: raster.width * 0.7, y: raster.height * 0.08 },
    { role: 'table_rules', x: raster.width * 0.78, y: raster.height * 0.35 },
  ];
  const samples = picks.map((p, i) => {
    const [r, g, b] = rgbaAt(raster, p.x, p.y);
    return {
      sampleId: `color_${i}`,
      role: p.role,
      hex: rgbToHex(r, g, b),
      x: Math.round(p.x),
      y: Math.round(p.y),
    };
  });
  for (let y = 10; y < raster.height - 10; y += 8) {
    for (let x = 10; x < raster.width - 10; x += 8) {
      const [r, g, b] = rgbaAt(raster, x, y);
      if (isCalloutFill(r, g, b)) {
        samples.push({
          sampleId: `callout_${samples.length}`,
          role: 'lime_callouts',
          hex: rgbToHex(r, g, b),
          x,
          y,
        });
        if (samples.length > 12) break;
      }
    }
  }
  return { id: `csm-${raster.sourcePixelHash}`, samples };
}

function detectTextRegions(raster: ForensicRaster, majorRegions: PixelDerivedRegion[]): ForensicTextRegionMap {
  const regions: ForensicTextRegionMap['regions'] = [];
  let idx = 0;
  for (const major of majorRegions) {
    if (major.regionId === 'DOCUMENT_CANVAS') continue;
    const step = Math.max(4, Math.floor(major.height / 24));
    let blockStart: number | null = null;
    for (let y = major.y; y < major.y + major.height; y += step) {
      let dark = 0;
      for (let x = major.x; x < major.x + major.width; x += 4) {
        const [r, g, b] = rgbaAt(raster, x, y);
        if (isDarkInk(r, g, b) || isBlueLine(r, g, b)) dark += 1;
      }
      const dense = dark > major.width / 4 / 4;
      if (dense && blockStart === null) blockStart = y;
      if (!dense && blockStart !== null) {
        const h = y - blockStart;
        if (h > step) {
          idx += 1;
          const [r, g, b] = rgbaAt(raster, major.x + 4, blockStart);
          regions.push({
            textRegionId: `TEXT_${String(idx).padStart(3, '0')}`,
            x: major.x + 4,
            y: blockStart,
            width: major.width - 8,
            height: h,
            lineCount: Math.max(1, Math.round(h / step)),
            alignment: 'left',
            approximateFontScale: h / 12,
            foregroundColor: rgbToHex(r, g, b),
            density: dark / (major.width / 4),
            ocrText: null,
            confidence: 0.55 + Math.min(0.35, h / major.height),
          });
        }
        blockStart = null;
      }
    }
  }
  return { id: `trm-${raster.sourcePixelHash}`, regions };
}

function detectCallouts(raster: ForensicRaster): ForensicCalloutMap {
  const callouts: ForensicCalloutMap['callouts'] = [];
  const seen = new Set<string>();
  for (let y = 8; y < raster.height * 0.75; y += 6) {
    for (let x = 8; x < raster.width * 0.65; x += 6) {
      const [r, g, b] = rgbaAt(raster, x, y);
      if (!isCalloutFill(r, g, b)) continue;
      const key = `${Math.floor(x / 24)}-${Math.floor(y / 24)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      callouts.push({
        calloutId: `CALLOUT_${String(callouts.length + 1).padStart(3, '0')}`,
        visibleNumber: callouts.length + 1,
        x: x - 10,
        y: y - 10,
        width: 20,
        height: 20,
        fillColor: rgbToHex(r, g, b),
        textColor: '#111111',
        connectorLineRef: null,
        targetRegionRef: 'LEFT_MAIN_BLUEPRINT_PANEL',
        confidence: 0.7,
      });
      if (callouts.length >= 12) break;
    }
  }
  return { id: `cm-${raster.sourcePixelHash}`, callouts };
}

function detectVisualObjects(
  _raster: ForensicRaster,
  majorRegions: PixelDerivedRegion[],
): ForensicVisualObjectRegion[] {
  const left = majorRegions.find((r) => r.regionId === 'LEFT_MAIN_BLUEPRINT_PANEL');
  const palette = majorRegions.find((r) => r.regionId === 'LOWER_COLOR_PALETTE');
  const objects: ForensicVisualObjectRegion[] = [];
  if (left) {
    objects.push({
      objectRegionId: 'OBJECT_001',
      x: left.x + 8,
      y: left.y + 8,
      width: left.width - 16,
      height: left.height - 16,
      objectClass: 'PAGE_PREVIEW',
      dominantColors: left.dominantColors,
      edgeShape: 'RECT',
      confidence: 0.78,
      sourceCropRef: left.sourceCropRef,
    });
  }
  if (palette) {
    objects.push({
      objectRegionId: 'OBJECT_002',
      x: palette.x + 12,
      y: palette.y + 8,
      width: Math.min(120, palette.width - 24),
      height: palette.height - 16,
      objectClass: 'PALETTE_CHIP',
      dominantColors: palette.dominantColors,
      edgeShape: 'RECT',
      confidence: 0.65,
      sourceCropRef: palette.sourceCropRef,
    });
  }
  return objects;
}

export function runForensicPixelAnalysis(input: {
  raster: ForensicRaster;
  authorityHash: string;
}): ForensicPixelAnalysis {
  const horizontal = detectHorizontalEdges(input.raster);
  const bodyTop = Math.round(input.raster.height * 0.12);
  const bodyBottom = Math.round(input.raster.height * 0.74);
  const vertical = detectVerticalEdges(input.raster, bodyTop, bodyBottom);
  const edgeMap: ForensicEdgeMap = {
    id: `fem-${input.raster.sourcePixelHash}`,
    edges: [...horizontal, ...vertical],
  };
  const majorRegions = detectMajorRegions(input.raster, edgeMap.edges);
  return {
    id: `fpa-${input.authorityHash.slice(0, 8)}-${TWIN_V41_EXTRACTION_VERSION}`,
    coordinateSpace: {
      sourceWidth: input.raster.width,
      sourceHeight: input.raster.height,
      originX: 0,
      originY: 0,
      normalizedScale: 1,
    },
    majorRegions,
    edgeMap,
    colorSampleMap: sampleColors(input.raster),
    textRegionMap: detectTextRegions(input.raster, majorRegions),
    calloutMap: detectCallouts(input.raster),
    visualObjectRegions: detectVisualObjects(input.raster, majorRegions),
  };
}
