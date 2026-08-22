/**
 * Dynamic board art direction via Creative Intelligence provider (Sonnet).
 */

import { createHash } from 'node:crypto';
import { parseStructuredJson } from './formationValidation.js';
import { getCreativeIntelligenceProvider } from './providerRegistry.js';
import { callAnthropicForCompletion } from './anthropicCompletion.js';
import { ANTHROPIC_CREATIVE_MODEL } from './config.js';
import type { CreativeDirectionBoardArtDirection, ResolvedBoardReference } from './creativeDirectionBoardTypes.js';
import type { ComparisonDirectionCandidate, CoreDirectionFormationInput, FormedCoreDirection } from './types.js';
import { MARKED_UP_COPY_IMMUTABLE } from './markedUpCopyCopyContract.js';

export const BOARD_ART_DIRECTION_PROMPT_VERSION = 'marked-up-copy-board-art-direction-v2';

export const BOARD_ART_DIRECTION_SYSTEM_PROMPT = `You are a senior creative director producing BOARD ART DIRECTION for ONE existing Core Direction.

THIS IS NOT direction formation. Do NOT rename or rewrite the direction.

THE MARKED-UP COPY is ACTIVE, LIVE, ARGUMENTATIVE, MID-EDIT, UNRESOLVED, CORRECTIVE, INTERRUPTIVE.
The page is still changing. THE VISUAL DRAMA IS THE REVISION ITSELF.

THE ANNOTATED COPY (cousin) is PRE-LIVED-IN, INHERITED, ALREADY-READ — do NOT collapse into that territory.

Return structured JSON only — no markdown fences.

Required shape:
{
  "boardStory": "string",
  "firstRead": "string",
  "secondRead": "string",
  "thirdRead": "string",
  "signatureMoment": "string",
  "visualHierarchy": "string",
  "compositionBehavior": "string",
  "negativeSpaceStrategy": "string",
  "imageLanguageApplication": "string",
  "materialApplication": "string",
  "typographicBehavior": "string",
  "graphicGrammar": "string",
  "annotationGrammar": "string",
  "artifactBehavior": "string",
  "socialBehavior": "string",
  "motionBehavior": "string",
  "referenceApplication": ["string"],
  "antiGenericRules": ["string"],
  "antiCousinRules": ["string"]
}`;

function fingerprintInput(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16);
}

function normalizeArtDirection(
  raw: Record<string, unknown>,
  meta: CreativeDirectionBoardArtDirection['lineage'],
): CreativeDirectionBoardArtDirection {
  const arr = (v: unknown) => (Array.isArray(v) ? v.map(String) : []);
  return {
    boardStory: String(raw.boardStory ?? ''),
    firstRead: String(raw.firstRead ?? ''),
    secondRead: String(raw.secondRead ?? ''),
    thirdRead: String(raw.thirdRead ?? ''),
    signatureMoment: String(raw.signatureMoment ?? ''),
    visualHierarchy: String(raw.visualHierarchy ?? ''),
    compositionBehavior: String(raw.compositionBehavior ?? ''),
    negativeSpaceStrategy: String(raw.negativeSpaceStrategy ?? ''),
    imageLanguageApplication: String(raw.imageLanguageApplication ?? ''),
    materialApplication: String(raw.materialApplication ?? ''),
    typographicBehavior: String(raw.typographicBehavior ?? ''),
    graphicGrammar: String(raw.graphicGrammar ?? ''),
    annotationGrammar: String(raw.annotationGrammar ?? ''),
    artifactBehavior: String(raw.artifactBehavior ?? ''),
    socialBehavior: String(raw.socialBehavior ?? ''),
    motionBehavior: String(raw.motionBehavior ?? ''),
    referenceApplication: arr(raw.referenceApplication),
    antiGenericRules: arr(raw.antiGenericRules),
    antiCousinRules: arr(raw.antiCousinRules),
    lineage: meta,
  };
}

export function buildFallbackBoardArtDirection(params: {
  direction: FormedCoreDirection | ComparisonDirectionCandidate;
  references: ResolvedBoardReference[];
}): CreativeDirectionBoardArtDirection {
  const meta = {
    provider: 'deterministic-fallback',
    model: 'none',
    promptVersion: BOARD_ART_DIRECTION_PROMPT_VERSION,
    inputFingerprint: fingerprintInput(params.direction.directionId),
    outputHash: 'fallback',
    createdAt: new Date().toISOString(),
  };
  return normalizeArtDirection(
    {
      boardStory:
        'A contemporary editorial spread caught mid-argument — the page is still being decided in public.',
      firstRead: 'Dominant editorial photograph + oversized headline with visible strike-through and replacement.',
      secondRead: 'Margin argument, taped replacement block, and editor marks revealing live editorial friction.',
      thirdRead: 'Social and motion strips prove the revision grammar scales across formats.',
      signatureMoment: MARKED_UP_COPY_IMMUTABLE.thesis,
      visualHierarchy: 'Hero evidence → typographic interruption → hybrid revision artifact → supporting proof.',
      compositionBehavior: 'Asymmetric overlap, intentional negative space, scale contrast between hero and margin.',
      negativeSpaceStrategy: 'Upper-right and lower-left breathing room on matte paper field.',
      imageLanguageApplication:
        params.direction.imageryLanguage || 'Documentary editorial crop with annotation-safe zones.',
      materialApplication:
        params.direction.materialImageryLanguage || 'Fresh coated editorial paper, ink variation, tape shadow.',
      typographicBehavior:
        params.direction.typographicAttitude || 'Display serif/sans contrast with code-native strike/replace.',
      graphicGrammar: 'Strike-through, replacement block, margin arrow, editor caret, revision mark.',
      annotationGrammar: 'Cross-out → replacement → margin rebuttal sequence — live, not historical.',
      artifactBehavior: 'Hybrid FAL paper substrate + code-native annotation overlay.',
      socialBehavior:
        params.direction.socialExpressionHypothesis || 'Source claim under active editorial reaction.',
      motionBehavior: params.direction.motionSeed || 'Clean → strike → replace → margin → live state.',
      referenceApplication: params.references.map((r) => `${r.referenceId}: ${r.founderNote}`),
      antiGenericRules: ['NO stock desk', 'NO generic laptop', 'NO smiling business people', 'NO moodboard grid'],
      antiCousinRules: [
        'NO passive pre-read annotation (Annotated Copy)',
        'NO ranking/scoreboard language (Countdown Room)',
        'NO archive/taxonomy metaphors (Personal Archive / Index)',
      ],
    },
    meta,
  );
}

export async function runDynamicBoardArtDirection(params: {
  direction: ComparisonDirectionCandidate;
  formationInput: CoreDirectionFormationInput | null;
  references: ResolvedBoardReference[];
}): Promise<{
  artDirection: CreativeDirectionBoardArtDirection;
  anthropicRequests: number;
  usage: { inputTokens: number; outputTokens: number };
}> {
  const provider = getCreativeIntelligenceProvider();
  const inputFingerprint = fingerprintInput({
    directionId: params.direction.directionId,
    references: params.references.map((r) => r.referenceId),
  });

  if (provider.providerId === 'unavailable') {
    return {
      artDirection: buildFallbackBoardArtDirection(params),
      anthropicRequests: 0,
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  }

  const userPayload = {
    direction: {
      directionName: params.direction.directionName,
      bigIdea: params.direction.bigIdea,
      oneLineThesis: params.direction.oneLineThesis,
      governingBehavior: params.direction.governingBehavior,
      brandConnection: params.direction.brandConnection,
      visualMetaphor: params.direction.visualMetaphor,
      materialImageryLanguage: params.direction.materialImageryLanguage,
      typographicAttitude: params.direction.typographicAttitude,
      imageryLanguage: params.direction.imageryLanguage,
      primaryBrandArtifact: params.direction.primaryBrandArtifact,
      motionSeed: params.direction.motionSeed,
      socialExpressionHypothesis: params.direction.socialExpressionHypothesis,
      antiDirection: params.direction.antiDirection,
    },
    brandLore: params.formationInput,
    referenceEvidence: params.references.map((r) => ({
      referenceId: r.referenceId,
      founderNote: r.founderNote,
      role: r.referenceRole,
    })),
    cousinWarning: {
      cousin: 'THE ANNOTATED COPY',
      preserve: ['active edit', 'live revision', 'cross-out replacement', 'margin argument'],
      doNot: ['pre-lived-in reading copy', 'passive annotation history'],
    },
    immutable: MARKED_UP_COPY_IMMUTABLE,
  };

  const { text, usage } = await callAnthropicForCompletion(BOARD_ART_DIRECTION_SYSTEM_PROMPT, userPayload);
  const parsed = parseStructuredJson(text) as Record<string, unknown>;
  const outputHash = createHash('sha256').update(text).digest('hex').slice(0, 16);

  return {
    artDirection: normalizeArtDirection(parsed, {
      provider: 'anthropic',
      model: ANTHROPIC_CREATIVE_MODEL,
      promptVersion: BOARD_ART_DIRECTION_PROMPT_VERSION,
      inputFingerprint,
      outputHash,
      createdAt: new Date().toISOString(),
    }),
    anthropicRequests: 1,
    usage: {
      inputTokens: usage.inputTokens ?? 0,
      outputTokens: usage.outputTokens ?? 0,
    },
  };
}
