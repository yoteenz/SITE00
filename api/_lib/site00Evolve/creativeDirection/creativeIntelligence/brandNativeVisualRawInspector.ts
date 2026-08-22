/**
 * Raw-image QA for brand-native visual pilot — PRE_OVERLAY_DIRECTION_RECOGNITION_TEST.
 */

import { downloadUrlToBuffer } from '../../../site00Assts/storage.js';
import { isAnthropicConfigured } from './config.js';
import type { BrandNativeRawImageQa, BrandNativeVisualBrief } from './brandNativeVisualBriefTypes.js';
import { topicClichesFor } from './brandNativeVisualPromptCompiler.js';

const RAW_BRAND_NATIVE_VISION_PROMPT = `You inspect a RAW generated image for THE MARKED-UP COPY direction BEFORE any text overlays, logos, captions, or code-native labels are applied.

Evaluate whether the image ALREADY belongs to this brand world from pixels alone.

Return JSON only:
{
  "directionNativeScore": 0-5,
  "topicClicheScore": 0-5,
  "stockLikeness": 0-5,
  "materialFidelity": 0-5,
  "photographySystemFidelity": 0-5,
  "colorRoleFidelity": 0-5,
  "referenceTranslation": 0-5,
  "roleFit": 0-5,
  "reasons": ["string"]
}

Scoring:
- directionNativeScore: 5 = unmistakably active editorial document mid-revision
- topicClicheScore: 5 = heavy topic clichés (calculator, office desk) BAD; 0 = none
- stockLikeness: 5 = generic stock BAD; 1 = distinctive direction-native
- roleFit: does this match the requested asset role?

Do NOT award 5/5 unless the image clearly shows handled paper, editorial revision evidence, and direction-native materials.`;

export function evaluateRawImageQaFromScores(scores: {
  directionNativeScore: number;
  topicClicheScore: number;
  stockLikeness: number;
  materialFidelity: number;
  photographySystemFidelity: number;
  colorRoleFidelity: number;
  referenceTranslation: number;
  roleFit: number;
  reasons: string[];
  visionInspected: boolean;
}): BrandNativeRawImageQa {
  let preOverlay: BrandNativeRawImageQa['preOverlayDirectionRecognitionTest'] = 'NEEDS_HUMAN_REVIEW';
  let result: BrandNativeRawImageQa['result'] = 'NEEDS_HUMAN_REVIEW';

  const passThreshold =
    scores.directionNativeScore >= 4 &&
    scores.stockLikeness <= 1 &&
    scores.topicClicheScore <= 1 &&
    scores.roleFit >= 4;

  const rejectThreshold =
    scores.directionNativeScore <= 2 || scores.stockLikeness >= 4 || scores.topicClicheScore >= 4;

  if (scores.visionInspected) {
    if (passThreshold) {
      preOverlay = 'PASS';
      result = 'ACCEPT';
    } else if (rejectThreshold) {
      preOverlay = 'FAIL';
      result = 'REJECT';
    }
  }

  return {
    directionNativeScore: scores.directionNativeScore,
    topicClicheScore: scores.topicClicheScore,
    stockLikeness: scores.stockLikeness,
    materialFidelity: scores.materialFidelity,
    photographySystemFidelity: scores.photographySystemFidelity,
    colorRoleFidelity: scores.colorRoleFidelity,
    referenceTranslation: scores.referenceTranslation,
    roleFit: scores.roleFit,
    preOverlayDirectionRecognitionTest: preOverlay,
    result,
    reasons: scores.reasons,
    visionInspected: scores.visionInspected,
  };
}

async function visionRawInspection(params: {
  imageUrl: string;
  brief: BrandNativeVisualBrief;
}): Promise<BrandNativeRawImageQa | null> {
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
        system: RAW_BRAND_NATIVE_VISION_PROMPT,
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
                  role: params.brief.role,
                  topic: params.brief.topicOriginal,
                  topicTransformed: params.brief.topicTransformed,
                  requiredSignals: params.brief.requiredBrandSpecificSignals,
                  forbiddenCliches: params.brief.forbiddenTopicCliches.slice(0, 8),
                  promptExcerpt: params.brief.compiledPrompt.slice(0, 800),
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
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim()) as Record<string, unknown>;

    return evaluateRawImageQaFromScores({
      directionNativeScore: Number(parsed.directionNativeScore ?? 0),
      topicClicheScore: Number(parsed.topicClicheScore ?? 0),
      stockLikeness: Number(parsed.stockLikeness ?? 0),
      materialFidelity: Number(parsed.materialFidelity ?? 0),
      photographySystemFidelity: Number(parsed.photographySystemFidelity ?? 0),
      colorRoleFidelity: Number(parsed.colorRoleFidelity ?? 0),
      referenceTranslation: Number(parsed.referenceTranslation ?? 0),
      roleFit: Number(parsed.roleFit ?? 0),
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons.map(String) : [],
      visionInspected: true,
    });
  } catch {
    return null;
  }
}

function heuristicRawQa(brief: BrandNativeVisualBrief): BrandNativeRawImageQa {
  const cliches = topicClichesFor(brief.topicOriginal);
  const promptLower = brief.compiledPrompt.toLowerCase();
  const clicheHits = cliches.filter((c) => promptLower.includes(c.split(' ')[0] ?? '')).length;

  return evaluateRawImageQaFromScores({
    directionNativeScore: 3,
    topicClicheScore: Math.min(5, clicheHits),
    stockLikeness: 3,
    materialFidelity: 3,
    photographySystemFidelity: 3,
    colorRoleFidelity: 3,
    referenceTranslation: brief.referenceApplications.length ? 3 : 2,
    roleFit: 3,
    reasons: ['Vision inspection unavailable — NEEDS_HUMAN_REVIEW from prompt metadata only'],
    visionInspected: false,
  });
}

export async function inspectRawBrandNativeImage(params: {
  imageUrl: string;
  brief: BrandNativeVisualBrief;
}): Promise<BrandNativeRawImageQa> {
  const vision = await visionRawInspection(params);
  if (vision) return vision;
  return heuristicRawQa(params.brief);
}
