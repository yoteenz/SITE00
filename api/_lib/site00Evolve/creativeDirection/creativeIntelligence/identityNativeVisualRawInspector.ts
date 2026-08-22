/**
 * Identity-native raw-image QA — PRE_OVERLAY identity recognition + stranger test.
 */

import { downloadUrlToBuffer } from '../../../site00Assts/storage.js';
import { isAnthropicConfigured } from './config.js';
import type { IdentityNativeRawImageQa, IdentityNativeVisualBrief } from './identityNativeArtDirectionTypes.js';

const IDENTITY_NATIVE_VISION_PROMPT = `You inspect a RAW generated image for NDX BOOK / THE MARKED-UP COPY BEFORE any logos, overlays, or deterministic typography.

Evaluate IDENTITY-NATIVE quality — does this feel like CUSTOM ARTWORK authored by this brand's visual system?

NOT merely: "does this depict a marked-up document?"
BUT: "does this look like designed NDX BOOK editorial art?"

Return JSON only:
{
  "identityNativeScore": 0-5,
  "directionNativeScore": 0-5,
  "paletteFidelity": 0-5,
  "typographicDna": 0-5,
  "graphicGrammarFidelity": 0-5,
  "artifactDesignAuthority": 0-5,
  "stockResemblance": 0-5,
  "topicClicheScore": 0-5,
  "logoRemovalTestV2": "PASS|FAIL|NEEDS_HUMAN_REVIEW",
  "strangerTest": "PASS|FAIL|NEEDS_HUMAN_REVIEW",
  "reasons": ["string"]
}

Scoring:
- identityNativeScore 5 = unmistakably custom NDX BOOK artwork, not stock editorial photo
- stockResemblance 0 = custom-designed artifact; 5 = generic stock photograph
- paletteFidelity 5 = intentional proprietary palette with clear semantic roles
- typographicDna 5 = typography behaves as designed visual form
- artifactDesignAuthority 5 = feels art-directed/designed, not found photographed

STRANGER TEST PASS: Would NOT plausibly download from stock site; would NOT belong to ten unrelated brands.`;

export function evaluateIdentityNativeQaFromScores(scores: {
  identityNativeScore: number;
  directionNativeScore: number;
  paletteFidelity: number;
  typographicDna: number;
  graphicGrammarFidelity: number;
  artifactDesignAuthority: number;
  stockResemblance: number;
  topicClicheScore: number;
  logoRemovalTestV2: IdentityNativeRawImageQa['logoRemovalTestV2'];
  strangerTest: IdentityNativeRawImageQa['strangerTest'];
  reasons: string[];
  visionInspected: boolean;
}): IdentityNativeRawImageQa {
  let preOverlay: IdentityNativeRawImageQa['preOverlayIdentityRecognitionTest'] = 'NEEDS_HUMAN_REVIEW';
  let result: IdentityNativeRawImageQa['result'] = 'NEEDS_HUMAN_REVIEW';

  const passThreshold =
    scores.identityNativeScore >= 4 &&
    scores.directionNativeScore >= 4 &&
    scores.paletteFidelity >= 4 &&
    scores.typographicDna >= 4 &&
    scores.graphicGrammarFidelity >= 4 &&
    scores.artifactDesignAuthority >= 4 &&
    scores.stockResemblance <= 1 &&
    scores.visionInspected;

  const rejectThreshold =
    scores.identityNativeScore <= 2 ||
    scores.stockResemblance >= 4 ||
    scores.artifactDesignAuthority <= 2;

  if (scores.visionInspected) {
    if (passThreshold && scores.strangerTest === 'PASS') {
      preOverlay = 'PASS';
      result = 'ACCEPT';
    } else if (rejectThreshold || scores.strangerTest === 'FAIL') {
      preOverlay = 'FAIL';
      result = 'REJECT';
    }
  }

  return {
    identityNativeScore: scores.identityNativeScore,
    directionNativeScore: scores.directionNativeScore,
    paletteFidelity: scores.paletteFidelity,
    typographicDna: scores.typographicDna,
    graphicGrammarFidelity: scores.graphicGrammarFidelity,
    artifactDesignAuthority: scores.artifactDesignAuthority,
    stockResemblance: scores.stockResemblance,
    topicClicheScore: scores.topicClicheScore,
    preOverlayIdentityRecognitionTest: preOverlay,
    logoRemovalTestV2: scores.logoRemovalTestV2,
    strangerTest: scores.strangerTest,
    result,
    reasons: scores.reasons,
    visionInspected: scores.visionInspected,
  };
}

async function visionInspection(params: {
  imageUrl: string;
  brief: IdentityNativeVisualBrief;
}): Promise<IdentityNativeRawImageQa | null> {
  if (!isAnthropicConfigured()) return null;
  try {
    const buffer = await downloadUrlToBuffer(params.imageUrl);
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
        max_tokens: 1200,
        system: IDENTITY_NATIVE_VISION_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: 'image/webp', data: buffer.toString('base64') },
              },
              {
                type: 'text',
                text: JSON.stringify({
                  artifactDeclaration: params.brief.artifactDeclaration,
                  palette: params.brief.paletteOwnership,
                  typography: params.brief.typographicArchitecture.slice(0, 4),
                  topic: params.brief.topicOriginal,
                  antiExample: params.brief.antiExampleRejection.slice(0, 6),
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

    return evaluateIdentityNativeQaFromScores({
      identityNativeScore: Number(parsed.identityNativeScore ?? 0),
      directionNativeScore: Number(parsed.directionNativeScore ?? 0),
      paletteFidelity: Number(parsed.paletteFidelity ?? 0),
      typographicDna: Number(parsed.typographicDna ?? 0),
      graphicGrammarFidelity: Number(parsed.graphicGrammarFidelity ?? 0),
      artifactDesignAuthority: Number(parsed.artifactDesignAuthority ?? 0),
      stockResemblance: Number(parsed.stockResemblance ?? 0),
      topicClicheScore: Number(parsed.topicClicheScore ?? 0),
      logoRemovalTestV2: (parsed.logoRemovalTestV2 as IdentityNativeRawImageQa['logoRemovalTestV2']) ?? 'NEEDS_HUMAN_REVIEW',
      strangerTest: (parsed.strangerTest as IdentityNativeRawImageQa['strangerTest']) ?? 'NEEDS_HUMAN_REVIEW',
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons.map(String) : [],
      visionInspected: true,
    });
  } catch {
    return null;
  }
}

function heuristicQa(brief: IdentityNativeVisualBrief): IdentityNativeRawImageQa {
  return evaluateIdentityNativeQaFromScores({
    identityNativeScore: 3,
    directionNativeScore: 3,
    paletteFidelity: 3,
    typographicDna: 3,
    graphicGrammarFidelity: 3,
    artifactDesignAuthority: 3,
    stockResemblance: 3,
    topicClicheScore: 2,
    logoRemovalTestV2: 'NEEDS_HUMAN_REVIEW',
    strangerTest: 'NEEDS_HUMAN_REVIEW',
    reasons: ['Vision inspection unavailable — NEEDS_HUMAN_REVIEW'],
    visionInspected: false,
  });
}

export async function inspectIdentityNativeImage(params: {
  imageUrl: string;
  brief: IdentityNativeVisualBrief;
}): Promise<IdentityNativeRawImageQa> {
  const vision = await visionInspection(params);
  if (vision) return vision;
  return heuristicQa(params.brief);
}
