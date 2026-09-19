/**
 * Identity-native V2 raw-image QA — extended personality, wit, second-read dimensions.
 */

import { downloadUrlToBuffer } from '../../../site00Assts/storage.js';
import { isAnthropicConfigured } from './config.js';
import type { IdentityNativeV2RawImageQa, IdentityNativeV2VisualBrief } from './creativeExpressionTypes.js';

const V2_VISION_PROMPT = `Inspect RAW V2 hero for NDX BOOK / THE MARKED-UP COPY — CREATIVE REFINEMENT pilot.

V1 proved identity-native methodology. V2 must add PERSONALITY — wit, voice, Martian Mono system voice, second-read discoveries.

Do NOT auto-assign 5/5. Founder said prior typographic DNA and artifact authority scores were too generous.

Score 0-5 each:
identityNativeScore, directionNativeScore, paletteFidelity, typographicDna, graphicGrammarFidelity,
artifactDesignAuthority, stockResemblance (0=custom, 5=stock),
voicePersonality, wit, compositionalArtistry, secondReadDepth, visualSurprise, restraint,
martianMonoIntegration, memorability, topicClicheScore

Tests (PASS|FAIL|NEEDS_HUMAN_REVIEW):
artDirectionQa — typographic composition understood (not pixel-perfect spelling)
textPrecisionQa — exact words/fonts production-correct (do NOT fail brilliant composition for tiny misspellings)
threeSecondTest — unmistakable NDX editorial artifact at 3 seconds
thirtySecondTest — additional meaning/wit/evidence after 30 seconds
personalityRemovalTest — generic copy would lose meaningful identity
logoRemovalTestV2, strangerTest, preOverlayIdentityRecognitionTest

Return JSON with all scores, tests, reasons[]`;

export function evaluateIdentityNativeV2QaFromScores(
  scores: Omit<
    IdentityNativeV2RawImageQa,
    'result' | 'preOverlayIdentityRecognitionTest' | 'reasons' | 'visionInspected'
  > & { reasons: string[]; visionInspected: boolean },
): IdentityNativeV2RawImageQa {
  let preOverlay: IdentityNativeV2RawImageQa['preOverlayIdentityRecognitionTest'] = 'NEEDS_HUMAN_REVIEW';
  let result: IdentityNativeV2RawImageQa['result'] = 'NEEDS_HUMAN_REVIEW';

  const passCore =
    scores.identityNativeScore >= 4 &&
    scores.directionNativeScore >= 4 &&
    scores.paletteFidelity >= 4 &&
    scores.typographicDna >= 4 &&
    scores.graphicGrammarFidelity >= 4 &&
    scores.artifactDesignAuthority >= 4 &&
    scores.stockResemblance <= 1;

  const passPersonality =
    scores.voicePersonality >= 4 &&
    scores.wit >= 4 &&
    scores.compositionalArtistry >= 4 &&
    scores.secondReadDepth >= 4 &&
    scores.visualSurprise >= 4 &&
    scores.restraint >= 4 &&
    scores.martianMonoIntegration >= 4 &&
    scores.memorability >= 4;

  const passTests =
    scores.threeSecondTest === 'PASS' &&
    scores.thirtySecondTest === 'PASS' &&
    scores.personalityRemovalTest === 'PASS' &&
    scores.strangerTest === 'PASS';

  if (scores.visionInspected) {
    if (passCore && passPersonality && passTests) {
      preOverlay = 'PASS';
      result = 'ACCEPT';
    } else if (
      scores.identityNativeScore <= 2 ||
      scores.stockResemblance >= 4 ||
      scores.voicePersonality <= 2
    ) {
      preOverlay = 'FAIL';
      result = 'REJECT';
    }
  }

  return { ...scores, preOverlayIdentityRecognitionTest: preOverlay, result };
}

async function visionInspection(params: {
  imageUrl: string;
  brief: IdentityNativeV2VisualBrief;
}): Promise<IdentityNativeV2RawImageQa | null> {
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
        max_tokens: 1800,
        system: V2_VISION_PROMPT,
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
                  heroConcept: params.brief.heroConceptBlock.slice(0, 12),
                  copyQa: params.brief.copyQualityScores,
                  martianMono: params.brief.typographyRolesBlock.slice(0, 6),
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

    return evaluateIdentityNativeV2QaFromScores({
      identityNativeScore: Number(parsed.identityNativeScore ?? 0),
      directionNativeScore: Number(parsed.directionNativeScore ?? 0),
      paletteFidelity: Number(parsed.paletteFidelity ?? 0),
      typographicDna: Number(parsed.typographicDna ?? 0),
      graphicGrammarFidelity: Number(parsed.graphicGrammarFidelity ?? 0),
      artifactDesignAuthority: Number(parsed.artifactDesignAuthority ?? 0),
      stockResemblance: Number(parsed.stockResemblance ?? 0),
      topicClicheScore: Number(parsed.topicClicheScore ?? 0),
      voicePersonality: Number(parsed.voicePersonality ?? 0),
      wit: Number(parsed.wit ?? 0),
      compositionalArtistry: Number(parsed.compositionalArtistry ?? 0),
      secondReadDepth: Number(parsed.secondReadDepth ?? 0),
      visualSurprise: Number(parsed.visualSurprise ?? 0),
      restraint: Number(parsed.restraint ?? 0),
      martianMonoIntegration: Number(parsed.martianMonoIntegration ?? 0),
      memorability: Number(parsed.memorability ?? 0),
      artDirectionQa: (parsed.artDirectionQa as IdentityNativeV2RawImageQa['artDirectionQa']) ?? 'NEEDS_HUMAN_REVIEW',
      textPrecisionQa: (parsed.textPrecisionQa as IdentityNativeV2RawImageQa['textPrecisionQa']) ?? 'NEEDS_HUMAN_REVIEW',
      threeSecondTest: (parsed.threeSecondTest as IdentityNativeV2RawImageQa['threeSecondTest']) ?? 'NEEDS_HUMAN_REVIEW',
      thirtySecondTest: (parsed.thirtySecondTest as IdentityNativeV2RawImageQa['thirtySecondTest']) ?? 'NEEDS_HUMAN_REVIEW',
      personalityRemovalTest:
        (parsed.personalityRemovalTest as IdentityNativeV2RawImageQa['personalityRemovalTest']) ?? 'NEEDS_HUMAN_REVIEW',
      logoRemovalTestV2: (parsed.logoRemovalTestV2 as IdentityNativeV2RawImageQa['logoRemovalTestV2']) ?? 'NEEDS_HUMAN_REVIEW',
      strangerTest: (parsed.strangerTest as IdentityNativeV2RawImageQa['strangerTest']) ?? 'NEEDS_HUMAN_REVIEW',
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons.map(String) : [],
      visionInspected: true,
    });
  } catch {
    return null;
  }
}

function heuristicQa(): IdentityNativeV2RawImageQa {
  return evaluateIdentityNativeV2QaFromScores({
    identityNativeScore: 3,
    directionNativeScore: 3,
    paletteFidelity: 3,
    typographicDna: 3,
    graphicGrammarFidelity: 3,
    artifactDesignAuthority: 3,
    stockResemblance: 3,
    topicClicheScore: 2,
    voicePersonality: 3,
    wit: 3,
    compositionalArtistry: 3,
    secondReadDepth: 3,
    visualSurprise: 3,
    restraint: 3,
    martianMonoIntegration: 3,
    memorability: 3,
    artDirectionQa: 'NEEDS_HUMAN_REVIEW',
    textPrecisionQa: 'NEEDS_HUMAN_REVIEW',
    threeSecondTest: 'NEEDS_HUMAN_REVIEW',
    thirtySecondTest: 'NEEDS_HUMAN_REVIEW',
    personalityRemovalTest: 'NEEDS_HUMAN_REVIEW',
    logoRemovalTestV2: 'NEEDS_HUMAN_REVIEW',
    strangerTest: 'NEEDS_HUMAN_REVIEW',
    reasons: ['Vision inspection unavailable — NEEDS_HUMAN_REVIEW'],
    visionInspected: false,
  });
}

export async function inspectIdentityNativeV2Image(params: {
  imageUrl: string;
  brief: IdentityNativeV2VisualBrief;
}): Promise<IdentityNativeV2RawImageQa> {
  const vision = await visionInspection(params);
  if (vision) return vision;
  return heuristicQa();
}
