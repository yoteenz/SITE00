/**
 * P0.VR.5 — Multi-asset candidate detection heuristics.
 */

import {
  BACKGROUND_EXTRACT_BOUNDS,
  DEFAULT_SOURCE_DIMENSIONS,
  HIGH_CONFIDENCE_THRESHOLD,
  LOW_CONFIDENCE_THRESHOLD,
  NAV_ICON_SET_BOUNDS_TEMPLATE,
  PROJECTS_HEADER_PLANET_BOUNDS,
  SINGLE_ICON_DEFAULT_BOUNDS,
} from './constants.js';
import { parseFounderInstruction } from './instructionParser.js';
import type {
  AssetJobType,
  BoundingBox,
  CandidateClassification,
  DetectedAssetCandidate,
  DetectionOrderingRule,
  ParsedFounderInstruction,
  SourceUploadRecord,
} from './types.js';

export type DetectionResult = {
  detectedRegions: DetectedAssetCandidate[];
  detectionCount: number;
  detectionOrdering: DetectionOrderingRule;
};

function id(prefix: string, index: number): string {
  return `${prefix}-${index + 1}`;
}

function previewUrlForBounds(upload: SourceUploadRecord, bounds: BoundingBox): string {
  const base = upload.url.split('?')[0];
  return `${base}#crop=${bounds.x},${bounds.y},${bounds.width},${bounds.height}`;
}

function confidenceForClassification(classification: CandidateClassification, bounds: BoundingBox): number {
  const area = bounds.width * bounds.height;
  const frame = DEFAULT_SOURCE_DIMENSIONS.width * DEFAULT_SOURCE_DIMENSIONS.height;
  const ratio = area / frame;
  if (classification === 'BACKGROUND_IMAGE') return 0.88;
  if (classification === 'HERO_OBJECT' && ratio > 0.08 && ratio < 0.35) return 0.82;
  if (classification === 'ICON' || classification === 'ICON_SET_MEMBER') {
    if (ratio > 0.002 && ratio < 0.04) return 0.78;
    return 0.55;
  }
  if (classification === 'PROJECT_CARD_VISUAL' && ratio > 0.03 && ratio < 0.2) return 0.72;
  if (ratio < 0.001) return 0.35;
  return 0.65;
}

function sortBounds(
  boxes: BoundingBox[],
  ordering: DetectionOrderingRule,
): BoundingBox[] {
  const copy = [...boxes];
  if (ordering === 'LEFT_TO_RIGHT') {
    copy.sort((a, b) => a.x - b.x || a.y - b.y);
  } else if (ordering === 'TOP_TO_BOTTOM') {
    copy.sort((a, b) => a.y - b.y || a.x - b.x);
  } else if (ordering === 'GRID_ORDER') {
    copy.sort((a, b) => Math.floor(a.y / 120) - Math.floor(b.y / 120) || a.x - b.x);
  }
  return copy;
}

function iconSetBounds(count: number): BoundingBox[] {
  const t = NAV_ICON_SET_BOUNDS_TEMPLATE;
  const totalWidth = count * t.iconWidth + (count - 1) * t.iconGap;
  let x: number = t.startX;
  if (x + totalWidth > DEFAULT_SOURCE_DIMENSIONS.width - 40) {
    x = Math.max(20, Math.floor((DEFAULT_SOURCE_DIMENSIONS.width - totalWidth) / 2));
  }
  return Array.from({ length: count }, (_, i) => ({
    x: x + i * (t.iconWidth + t.iconGap),
    y: t.y,
    width: t.iconWidth,
    height: t.height,
  }));
}

function projectCardBounds(count: number): BoundingBox[] {
  const cardW = 160;
  const cardH = 120;
  const gap = 16;
  const startX = 40;
  const startY = 320;
  return Array.from({ length: count }, (_, i) => ({
    x: startX + (i % 3) * (cardW + gap),
    y: startY + Math.floor(i / 3) * (cardH + gap),
    width: cardW,
    height: cardH,
  }));
}

function backgroundBounds(): BoundingBox {
  const m = BACKGROUND_EXTRACT_BOUNDS.chromeMargin;
  return {
    x: m,
    y: m,
    width: BACKGROUND_EXTRACT_BOUNDS.width - m * 2,
    height: BACKGROUND_EXTRACT_BOUNDS.height - m * 2,
  };
}

function inferIconCount(instruction: ParsedFounderInstruction): number {
  const text = instruction.rawInstruction.toUpperCase();
  const match = text.match(/(\d+)\s*(ICON|STATE)/);
  if (match) return Math.min(8, Math.max(2, Number(match[1])));
  if (text.includes('NAV')) return 4;
  return 4;
}

function inferProjectCardCount(instruction: ParsedFounderInstruction): number {
  const match = instruction.rawInstruction.toUpperCase().match(/(\d+)\s*CARD/);
  if (match) return Math.min(6, Math.max(2, Number(match[1])));
  return 3;
}

export function detectRegionsForIntent(input: {
  jobId: string;
  upload: SourceUploadRecord;
  intentType: AssetJobType;
  parsed: ParsedFounderInstruction;
  orderingRule: DetectionOrderingRule;
  explicitCount?: number;
}): DetectionResult {
  const { jobId, upload, intentType, parsed, orderingRule } = input;
  let boxes: BoundingBox[] = [];
  let classification: CandidateClassification = parsed.assetTypes[0] ?? 'OTHER_SOLO_ASSET';

  switch (intentType) {
    case 'SINGLE_ASSET':
      boxes = [SINGLE_ICON_DEFAULT_BOUNDS];
      classification = parsed.assetTypes.includes('ICON') ? 'ICON' : classification;
      break;
    case 'ICON_SET':
    case 'REPLACEMENT_BATCH':
      boxes = iconSetBounds(input.explicitCount ?? inferIconCount(parsed));
      classification = 'ICON_SET_MEMBER';
      break;
    case 'BACKGROUND_EXTRACT':
      boxes = [backgroundBounds()];
      classification = 'BACKGROUND_IMAGE';
      break;
    case 'HERO_EXTRACT':
      boxes = [PROJECTS_HEADER_PLANET_BOUNDS];
      classification = parsed.assetTypes.includes('DECORATIVE_OBJECT') ? 'DECORATIVE_OBJECT' : 'HERO_OBJECT';
      break;
    case 'MULTI_ASSET':
      if (parsed.assetTypes.includes('PROJECT_CARD_VISUAL')) {
        boxes = projectCardBounds(input.explicitCount ?? inferProjectCardCount(parsed));
        classification = 'PROJECT_CARD_VISUAL';
      } else {
        boxes = iconSetBounds(input.explicitCount ?? 3);
        classification = 'OTHER_SOLO_ASSET';
      }
      break;
    default:
      boxes = [SINGLE_ICON_DEFAULT_BOUNDS];
      break;
  }

  const ordered = sortBounds(boxes, orderingRule);
  const detectedRegions: DetectedAssetCandidate[] = ordered.map((boundingBox, orderIndex) => {
    const confidence = confidenceForClassification(classification, boundingBox);
    return {
      candidateId: id('candidate', orderIndex),
      jobId,
      sourceUploadId: upload.uploadId,
      boundingBox,
      previewUrl: previewUrlForBounds(upload, boundingBox),
      classification,
      confidence,
      orderIndex,
      founderDecision: 'PENDING',
      replacementTarget: null,
      lowConfidenceBlock: confidence < LOW_CONFIDENCE_THRESHOLD,
    };
  });

  return {
    detectedRegions,
    detectionCount: detectedRegions.length,
    detectionOrdering: orderingRule,
  };
}

export function detectAssetCandidates(input: {
  jobId: string;
  uploads: SourceUploadRecord[];
  founderInstruction: string;
  jobType: AssetJobType;
  orderingRule: DetectionOrderingRule;
  explicitCount?: number;
}): DetectionResult {
  const parsed = parseFounderInstruction(input.founderInstruction);
  const upload = input.uploads[0];
  if (!upload) {
    return { detectedRegions: [], detectionCount: 0, detectionOrdering: input.orderingRule };
  }
  return detectRegionsForIntent({
    jobId: input.jobId,
    upload,
    intentType: input.jobType,
    parsed,
    orderingRule: input.orderingRule,
    explicitCount: input.explicitCount,
  });
}

export function isLowConfidenceRegion(region: DetectedAssetCandidate): boolean {
  return region.confidence < LOW_CONFIDENCE_THRESHOLD;
}

export function isHighConfidenceRegion(region: DetectedAssetCandidate): boolean {
  return region.confidence >= HIGH_CONFIDENCE_THRESHOLD;
}

export function mergeCandidateRegions(
  regions: DetectedAssetCandidate[],
  candidateIds: string[],
): DetectedAssetCandidate[] {
  const toMerge = regions.filter((r) => candidateIds.includes(r.candidateId));
  if (toMerge.length < 2) return regions;
  const remaining = regions.filter((r) => !candidateIds.includes(r.candidateId));
  const xs = toMerge.map((r) => r.boundingBox.x);
  const ys = toMerge.map((r) => r.boundingBox.y);
  const rights = toMerge.map((r) => r.boundingBox.x + r.boundingBox.width);
  const bottoms = toMerge.map((r) => r.boundingBox.y + r.boundingBox.height);
  const merged: DetectedAssetCandidate = {
    ...toMerge[0],
    candidateId: id('merged', remaining.length),
    boundingBox: {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...rights) - Math.min(...xs),
      height: Math.max(...bottoms) - Math.min(...ys),
    },
    founderDecision: 'MERGED',
    orderIndex: Math.min(...toMerge.map((r) => r.orderIndex)),
    confidence: Math.min(...toMerge.map((r) => r.confidence)),
    lowConfidenceBlock: toMerge.some(isLowConfidenceRegion),
  };
  return [...remaining, merged].map((r, i) => ({ ...r, orderIndex: i }));
}

export function splitCandidateRegion(
  regions: DetectedAssetCandidate[],
  candidateId: string,
): DetectedAssetCandidate[] {
  const target = regions.find((r) => r.candidateId === candidateId);
  if (!target) return regions;
  const others = regions.filter((r) => r.candidateId !== candidateId);
  const half = Math.floor(target.boundingBox.width / 2);
  const left: DetectedAssetCandidate = {
    ...target,
    candidateId: id('split-l', others.length),
    boundingBox: { ...target.boundingBox, width: half },
    founderDecision: 'SPLIT',
    orderIndex: target.orderIndex,
  };
  const right: DetectedAssetCandidate = {
    ...target,
    candidateId: id('split-r', others.length + 1),
    boundingBox: { ...target.boundingBox, x: target.boundingBox.x + half, width: target.boundingBox.width - half },
    founderDecision: 'SPLIT',
    orderIndex: target.orderIndex + 1,
  };
  return [...others, left, right]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((r, i) => ({ ...r, orderIndex: i }));
}
