/**
 * Visual/content inspection for generated board assets.
 * FAL success → GENERATED only; inspection determines ACCEPT/REJECT.
 */

import sharp from 'sharp';
import { downloadUrlToBuffer } from '../../../site00Assts/storage.js';
import { callAnthropicForCompletion } from './anthropicCompletion.js';
import { isAnthropicConfigured } from './config.js';
import type {
  BoardAssetInspectionReport,
  BoardAssetManifestEntry,
  CreativeDirectionBoardPlan,
} from './creativeDirectionBoardTypes.js';
import { MARKED_UP_COPY_IMMUTABLE } from './markedUpCopyCopyContract.js';

const VISION_INSPECTION_PROMPT = `You inspect a Creative Direction board asset image for THE MARKED-UP COPY direction.

THE MARKED-UP COPY = active live editorial revision, cross-out/replacement, margin argument — NOT stock photography.

Return JSON only:
{
  "conceptFit": 0-5,
  "roleFit": 0-5,
  "referenceFidelity": 0-5,
  "stockLikeness": 0-5,
  "unwantedText": boolean,
  "unwantedLogo": boolean,
  "directionSpecificity": 0-5,
  "decision": "ACCEPT" | "REJECT" | "NEEDS_HUMAN_REVIEW",
  "reasons": ["string"]
}

stockLikeness: 5 = very stock-like (BAD), 1 = distinctive editorial (GOOD).
Reject if stockLikeness >= 4 or unwantedText or unwantedLogo.`;

async function analyzeImageStats(buffer: Buffer): Promise<{
  width: number;
  height: number;
  meanBrightness: number;
  edgeDensity: number;
}> {
  const img = sharp(buffer);
  const meta = await img.metadata();
  const stats = await img.stats();
  const gray = await img.grayscale().raw().toBuffer();
  let edgeSum = 0;
  const w = meta.width ?? 1;
  const h = meta.height ?? 1;
  for (let i = 1; i < gray.length - w; i++) {
    edgeSum += Math.abs(gray[i]! - gray[i - 1]!);
  }
  const meanBrightness =
    stats.channels.reduce((acc, c) => acc + (c.mean ?? 0), 0) / Math.max(1, stats.channels.length);
  return {
    width: w,
    height: h,
    meanBrightness,
    edgeDensity: edgeSum / gray.length,
  };
}

function heuristicInspection(params: {
  entry: BoardAssetManifestEntry;
  stats: Awaited<ReturnType<typeof analyzeImageStats>>;
  plan: CreativeDirectionBoardPlan;
}): BoardAssetInspectionReport {
  const { entry, stats } = params;
  const reasons: string[] = [];

  let stockLikeness = 2;
  if (stats.meanBrightness > 200 && stats.edgeDensity < 8) {
    stockLikeness = 4;
    reasons.push('Flat bright field — possible generic stock');
  }
  if (stats.edgeDensity > 25) {
    stockLikeness = Math.max(1, stockLikeness - 1);
  }

  const roleFit = entry.classification === 'CODE_NATIVE' || entry.classification === 'SVG_NATIVE' ? 5 : 4;
  const conceptFit = entry.negativeConstraints.some((n) => n.includes('stock')) ? 4 : 3;
  const referenceFidelity = entry.referenceCropIds?.length ? 4 : entry.referenceInputs.length ? 3 : 2;

  let decision: BoardAssetInspectionReport['decision'] = 'ACCEPT';
  if (stockLikeness >= 4) decision = 'REJECT';
  else if (stockLikeness >= 3) decision = 'NEEDS_HUMAN_REVIEW';

  if (entry.classification === 'CODE_NATIVE' || entry.classification === 'SVG_NATIVE') {
    return {
      conceptFit: 5,
      roleFit: 5,
      referenceFidelity: 5,
      compositionUsability: 5,
      stockLikeness: 1,
      unwantedText: false,
      unwantedLogo: false,
      malformedObjects: false,
      cropUsability: 5,
      materialFidelity: 5,
      directionSpecificity: 5,
      decision: 'ACCEPT',
      reasons: ['Code-native asset'],
      visionInspected: false,
    };
  }

  return {
    conceptFit,
    roleFit,
    referenceFidelity,
    compositionUsability: stats.width > 256 && stats.height > 256 ? 4 : 2,
    stockLikeness,
    unwantedText: false,
    unwantedLogo: false,
    malformedObjects: stats.width < 128 || stats.height < 128,
    cropUsability: 4,
    materialFidelity: 4,
    directionSpecificity: conceptFit,
    decision,
    reasons,
    visionInspected: false,
  };
}

async function visionInspection(params: {
  imageUrl: string;
  entry: BoardAssetManifestEntry;
  plan: CreativeDirectionBoardPlan;
}): Promise<BoardAssetInspectionReport | null> {
  if (!isAnthropicConfigured()) return null;

  try {
    const buffer = await downloadUrlToBuffer(params.imageUrl);
    const base64 = buffer.toString('base64');
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) return null;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.SITE00_CREATIVE_INTELLIGENCE_MODEL?.trim() || 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: VISION_INSPECTION_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: 'image/webp', data: base64 },
              },
              {
                type: 'text',
                text: JSON.stringify({
                  role: params.entry.role,
                  direction: MARKED_UP_COPY_IMMUTABLE.directionName,
                  thesis: MARKED_UP_COPY_IMMUTABLE.thesis,
                  prompt: params.entry.prompt.slice(0, 500),
                }),
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) return null;
    const data = (await response.json()) as { content: Array<{ text?: string }> };
    const text = data.content[0]?.text ?? '';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim()) as BoardAssetInspectionReport;
    return { ...parsed, visionInspected: true };
  } catch {
    return null;
  }
}

export async function inspectGeneratedBoardAsset(params: {
  imageUrl: string;
  entry: BoardAssetManifestEntry;
  plan: CreativeDirectionBoardPlan;
}): Promise<BoardAssetInspectionReport> {
  if (params.entry.classification === 'CODE_NATIVE' || params.entry.classification === 'SVG_NATIVE') {
    return heuristicInspection({
      entry: params.entry,
      stats: { width: 100, height: 100, meanBrightness: 128, edgeDensity: 10 },
      plan: params.plan,
    });
  }

  const vision = await visionInspection(params);
  if (vision) return vision;

  const buffer = await downloadUrlToBuffer(params.imageUrl);
  const stats = await analyzeImageStats(buffer);
  return heuristicInspection({ entry: params.entry, stats, plan: params.plan });
}

export function inspectionToQaState(report: BoardAssetInspectionReport): 'ACCEPT' | 'REJECT' | 'NEEDS_HUMAN_REVIEW' {
  return report.decision;
}
