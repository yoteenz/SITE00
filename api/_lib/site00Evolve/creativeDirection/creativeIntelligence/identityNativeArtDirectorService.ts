/**
 * Sonnet IDENTITY ART DIRECTOR — proprietary visual DNA before GPT Image generation.
 */

import { createHash } from 'node:crypto';
import { parseStructuredJson, isJsonParseError, STRUCTURED_JSON_REVISION_HINT } from './formationValidation.js';
import { callAnthropicForCompletion } from './anthropicCompletion.js';
import { ANTHROPIC_CREATIVE_MODEL } from './config.js';
import { isProductionSonnetConfigured } from './directionExpressionSystemService.js';
import {
  FOUNDER_VISUAL_FEEDBACK_V2,
  MARKED_UP_COPY_DIRECTION_NAME,
} from './creativeDirectionBoardTypes.js';
import { MARKED_UP_COPY_IMMUTABLE, MARKED_UP_COPY_BOARD_COPY } from './markedUpCopyCopyContract.js';
import { MARKED_UP_COPY_REFERENCE_DECOMPOSITIONS } from './markedUpCopyPilotConstants.js';
import { FORBIDDEN_SIBLING_VOCABULARY } from './markedUpCopyCopyContract.js';
import type { DirectionExpressionSystem } from './directionExpressionSystemTypes.js';
import type { ResolvedBoardReference } from './creativeDirectionBoardTypes.js';
import {
  IDENTITY_NATIVE_ART_DIRECTION_PROMPT_VERSION,
  type IdentityNativeArtDirection,
  type PaletteRole,
} from './identityNativeArtDirectionTypes.js';
import {
  buildIdentityArtDirectorSystemPrompt,
  enrichIdentityArtDirectionPayload,
} from '../../../../../shared/site00-brand-lore/productionPromptNormalization.js';

export const IDENTITY_ART_DIRECTOR_SYSTEM_PROMPT = `You are IDENTITY ART DIRECTOR for NDX BOOK — not a board layout designer.

Design the PROPRIETARY VISUAL DNA that makes generated artwork recognizable as THIS brand's custom editorial art — even with logos and brand names removed.

THE MARKED-UP COPY = active revision mid-argument. But identity-native means CUSTOM DESIGNED ARTIFACT, not stock documentary photography of a marked-up document.

Founder diagnosis of FAILED prior pilot (anti-example — reject these without stronger identity intervention):
- beige-dominant conventional document photography
- default red-pencil / blue-pen revision clichés as primary identity
- could belong to education/finance/textbook/stock editorial libraries
- insufficient proprietary palette, typography, graphic grammar, designed composition

DO NOT hard-code lime green unless direction intelligence supports NDX BOOK editorial lime/black/off-white DNA.
Derive palette from Expression System + NDX BOOK editorial lineage. Palette MUST be intentional with semantic roles and dominance.

Return JSON only — no markdown fences:
{
  "identityPremise": "string",
  "proprietaryVisualDNA": ["string"],
  "paletteSystem": [{ "role": "string", "colorDescription": "string", "semanticUse": "string", "visualDominance": "dominant|secondary|sparse-accent|functional" }],
  "typographyBehavior": ["string — spatial/visual type behavior, scale, interruption"],
  "imageTreatment": "string",
  "photographicBehavior": "string — art-directed, not stock documentary default",
  "graphicGrammar": ["string"],
  "annotationGrammar": ["string"],
  "materialBehavior": ["string"],
  "compositionalBehavior": ["string"],
  "textureBehavior": ["string"],
  "recurringDevices": ["string"],
  "artifactDesignLanguage": "string — bespoke NDX BOOK editorial artifact, NOT found photographed scene",
  "topicTransformationRules": "string — topic as content layer only",
  "customArtworkRequirements": ["string"],
  "forbiddenGenericBehaviors": ["string"],
  "preOverlayRecognitionCriteria": ["string"],
  "referenceIdentityApplications": [{ "referenceId": "string", "identityTrait": "string", "application": "string" }],
  "antiExampleCharacteristics": ["string"]
}

Answer: "What visual decisions would make someone recognize this as NDX BOOK artwork even if the logo and brand name were removed?"`;

const CURRENT_PILOT_ANTI_EXAMPLE = [
  'beige-dominant physical document photography',
  'conventional red-pencil and blue-handwriting revision clichés as primary identity',
  'realistic-but-generic editorial stock scene',
  'insufficient proprietary color system',
  'typography treated as content not visual form',
  'could plausibly belong to unrelated editorial brands',
];

function arr(v: unknown): string[] {
  return Array.isArray(v) ? v.map(String).filter(Boolean) : [];
}

function parsePalette(v: unknown): PaletteRole[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      const o = item as Record<string, unknown>;
      const dominance = String(o.visualDominance ?? 'secondary');
      const valid = ['dominant', 'secondary', 'sparse-accent', 'functional'].includes(dominance)
        ? (dominance as PaletteRole['visualDominance'])
        : 'secondary';
      return {
        role: String(o.role ?? ''),
        colorDescription: String(o.colorDescription ?? ''),
        semanticUse: String(o.semanticUse ?? ''),
        visualDominance: valid,
      };
    })
    .filter((p) => p.role && p.colorDescription);
}

export function parseIdentityNativeArtDirectionResponse(params: {
  text: string;
  directionId: string;
  expressionSystemId: string;
  provider: string;
  model: string;
}): IdentityNativeArtDirection {
  const parsed = parseStructuredJson(params.text) as Record<string, unknown>;
  return {
    artDirectionId: createHash('sha256').update(params.text).digest('hex').slice(0, 16),
    directionId: params.directionId,
    directionName: MARKED_UP_COPY_DIRECTION_NAME,
    expressionSystemId: params.expressionSystemId,
    identityPremise: String(parsed.identityPremise ?? ''),
    proprietaryVisualDNA: arr(parsed.proprietaryVisualDNA),
    paletteSystem: parsePalette(parsed.paletteSystem),
    typographyBehavior: arr(parsed.typographyBehavior),
    imageTreatment: String(parsed.imageTreatment ?? ''),
    photographicBehavior: String(parsed.photographicBehavior ?? ''),
    graphicGrammar: arr(parsed.graphicGrammar),
    annotationGrammar: arr(parsed.annotationGrammar),
    materialBehavior: arr(parsed.materialBehavior),
    compositionalBehavior: arr(parsed.compositionalBehavior),
    textureBehavior: arr(parsed.textureBehavior),
    recurringDevices: arr(parsed.recurringDevices),
    artifactDesignLanguage: String(parsed.artifactDesignLanguage ?? ''),
    topicTransformationRules: String(parsed.topicTransformationRules ?? ''),
    customArtworkRequirements: arr(parsed.customArtworkRequirements),
    forbiddenGenericBehaviors: arr(parsed.forbiddenGenericBehaviors),
    preOverlayRecognitionCriteria: arr(parsed.preOverlayRecognitionCriteria),
    referenceIdentityApplications: Array.isArray(parsed.referenceIdentityApplications)
      ? (parsed.referenceIdentityApplications as Array<Record<string, string>>).map((r) => ({
          referenceId: String(r.referenceId ?? ''),
          identityTrait: String(r.identityTrait ?? ''),
          application: String(r.application ?? ''),
        }))
      : [],
    antiExampleCharacteristics: arr(parsed.antiExampleCharacteristics),
    provider: params.provider,
    model: params.model,
    promptVersion: IDENTITY_NATIVE_ART_DIRECTION_PROMPT_VERSION,
    createdAt: new Date().toISOString(),
  };
}

/** Deterministic fallback when Sonnet unavailable — derived from Expression System + NDX editorial lineage, not arbitrary lime hard-code. */
export function buildDeterministicIdentityArtDirection(params: {
  expressionSystem: DirectionExpressionSystem;
  directionId: string;
}): IdentityNativeArtDirection {
  const sys = params.expressionSystem;
  const colorRoles = sys.colorSystem.semanticRoles;
  const paletteFromSystem = Object.entries(colorRoles).slice(0, 5);
  const paletteSystem: PaletteRole[] =
    paletteFromSystem.length >= 3
      ? paletteFromSystem.map(([role, use], i) => ({
          role,
          colorDescription: role.replace(/-/g, ' '),
          semanticUse: use,
          visualDominance: i === 0 ? 'dominant' : i === 1 ? 'secondary' : 'sparse-accent',
        }))
      : [
          {
            role: 'paper-field',
            colorDescription: 'instrument off-white / newsprint white',
            semanticUse: 'dominant document field',
            visualDominance: 'dominant',
          },
          {
            role: 'ink-black',
            colorDescription: 'dense editorial black',
            semanticUse: 'structural typographic authority',
            visualDominance: 'secondary',
          },
          {
            role: 'signal-intervention',
            colorDescription: 'NDX editorial signal accent (lime OR expression-system intervention color)',
            semanticUse: 'sparse active revision / intelligence highlight — never flood page',
            visualDominance: 'sparse-accent',
          },
        ];

  return {
    artDirectionId: createHash('sha256').update(`identity-fallback:${sys.expressionSystemId}`).digest('hex').slice(0, 16),
    directionId: params.directionId,
    directionName: MARKED_UP_COPY_DIRECTION_NAME,
    expressionSystemId: sys.expressionSystemId,
    identityPremise:
      'NDX BOOK custom editorial artwork — a designed publication artifact authored by the identity system, not a found photographed document.',
    proprietaryVisualDNA: [
      'extreme typographic scale contrast — oversized condensed statement vs monospaced metadata',
      'intentional proprietary palette with sparse signal intervention',
      'graphic revision devices as designed marks, not default stationery clichés',
      'asymmetric editorial density with designed negative space',
      'publication-specimen composition — art-directed, not stock documentary',
    ],
    paletteSystem,
    typographyBehavior: [
      sys.typographySystem.cleanVoice,
      sys.typographySystem.revisionVoice,
      sys.typographySystem.scaleRelationships,
      'Construct hierarchy spatially: dominant statement ~1/3 page height, monospaced indexing micro-type, interruption via strike/replace blocks',
    ],
    imageTreatment: sys.imageTreatment,
    photographicBehavior:
      'Art-directed editorial specimen with material realism — NOT stock documentary "photograph of a document on a desk"',
    graphicGrammar: sys.graphicGrammar.selectedDevices,
    annotationGrammar: [
      sys.annotationGrammar.disagreementBehavior,
      sys.annotationGrammar.correctionBehavior,
      sys.annotationGrammar.secondaryOpinionBehavior,
    ],
    materialBehavior: [...sys.materialLanguage.paperTypes.slice(0, 2), ...sys.materialLanguage.justifiedMaterials.slice(0, 2)],
    compositionalBehavior: [sys.spatialBehavior, 'Designed hierarchy with deliberate tension and breathing room'],
    textureBehavior: [sys.photographySystem.grainTexture, 'Controlled print grain as identity texture, not beige stock warmth'],
    recurringDevices: sys.recurringDevices.slice(0, 4),
    artifactDesignLanguage:
      'Bespoke NDX BOOK editorial campaign artifact — custom publication design object, identity-system specimen, experimental editorial composition',
    topicTransformationRules:
      'Topic appears ONLY as embedded editorial content inside an already-established identity artifact — never as photography vocabulary',
    customArtworkRequirements: [
      'Must read as designed artwork before any logo or overlay',
      'Palette dominance explicitly controlled',
      'Typography as visual form, not mere words',
    ],
    forbiddenGenericBehaviors: [
      ...CURRENT_PILOT_ANTI_EXAMPLE,
      ...sys.antiGenericRules.slice(0, 4),
      'photograph of a document',
      'beige editorial stock',
      'default red-pencil blue-pen revision scene',
    ],
    preOverlayRecognitionCriteria: [
      'Would a stranger recognize NDX BOOK visual DNA without logo?',
      'Does palette feel intentional and proprietary?',
      'Does typography behave as designed form?',
    ],
    referenceIdentityApplications: MARKED_UP_COPY_REFERENCE_DECOMPOSITIONS.map((r) => ({
      referenceId: r.referenceId,
      identityTrait: r.borrow.composition[0] ?? r.label,
      application: r.borrow.graphicGrammar[0] ?? 'editorial identity trait',
    })),
    antiExampleCharacteristics: CURRENT_PILOT_ANTI_EXAMPLE,
    provider: 'deterministic-fallback',
    model: 'fallback',
    promptVersion: IDENTITY_NATIVE_ART_DIRECTION_PROMPT_VERSION,
    createdAt: new Date().toISOString(),
  };
}

export async function runIdentityNativeArtDirector(params: {
  expressionSystem: DirectionExpressionSystem;
  directionId: string;
  topic: string;
  references: ResolvedBoardReference[];
  founderPilotAntiExample?: string;
  orgSlug?: string;
  expressionContext?: string;
}): Promise<{
  artDirection: IdentityNativeArtDirection;
  anthropicRequests: number;
  usage: { inputTokens: number; outputTokens: number };
}> {
  if (!isProductionSonnetConfigured()) {
    return {
      artDirection: buildDeterministicIdentityArtDirection({
        expressionSystem: params.expressionSystem,
        directionId: params.directionId,
      }),
      anthropicRequests: 0,
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  }

  const orgSlug = params.orgSlug ?? 'ndxbook';
  const expressionContext = (params.expressionContext ?? 'SOCIAL_FIRST_EDITORIAL') as import('../../../../../shared/site00-brand-lore/types.js').BrandExpressionContext;

  const userPayload = enrichIdentityArtDirectionPayload(
    {
    task: 'IDENTITY ART DIRECTOR — proprietary visual DNA for GPT Image artifact design',
    immutable: MARKED_UP_COPY_IMMUTABLE,
    expressionSystem: {
      id: params.expressionSystem.expressionSystemId,
      visualThesis: params.expressionSystem.visualThesis,
      governingVisualBehavior: params.expressionSystem.governingVisualBehavior,
      photographySystem: params.expressionSystem.photographySystem,
      typographySystem: params.expressionSystem.typographySystem,
      graphicGrammar: params.expressionSystem.graphicGrammar,
      annotationGrammar: params.expressionSystem.annotationGrammar,
      materialLanguage: params.expressionSystem.materialLanguage,
      colorSystem: params.expressionSystem.colorSystem,
      antiGenericRules: params.expressionSystem.antiGenericRules,
      antiCousinRules: params.expressionSystem.antiCousinRules,
      socialBehavior: params.expressionSystem.socialBehavior,
    },
    topicTestContent: params.topic,
    founderFeedback: {
      priorPilotAssessment: 'IMPROVED BUT NOT APPROVED — direction-native yes, identity-native insufficient, stock-like editorial photography',
      antiExample: CURRENT_PILOT_ANTI_EXAMPLE,
      boardCritique: FOUNDER_VISUAL_FEEDBACK_V2,
      doNotUsePriorGeneratedImageAsReference: true,
    },
    references: params.references.map((r) => ({
      referenceId: r.referenceId,
      role: r.referenceRole,
      founderNote: r.founderNote,
    })),
    referenceDecompositions: MARKED_UP_COPY_REFERENCE_DECOMPOSITIONS.map((r) => ({
      referenceId: r.referenceId,
      borrow: r.borrow,
      doNotBorrow: r.doNotBorrow,
    })),
    siblingContaminationForbidden: FORBIDDEN_SIBLING_VOCABULARY.slice(0, 8),
    socialCopyContext: MARKED_UP_COPY_BOARD_COPY,
    },
    orgSlug,
    expressionContext,
  );

  let text = '';
  let usage = { inputTokens: 0, outputTokens: 0 };
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const revisionHint = attempt === 0 ? null : STRUCTURED_JSON_REVISION_HINT;
    const response = await callAnthropicForCompletion(
      buildIdentityArtDirectorSystemPrompt(orgSlug),
      revisionHint ? { ...userPayload, revisionHint } : userPayload,
      { maxTokens: 16384 },
    );
    text = response.text;
    usage = {
      inputTokens: response.usage.inputTokens ?? 0,
      outputTokens: response.usage.outputTokens ?? 0,
    };
    try {
      parseIdentityNativeArtDirectionResponse({
        text,
        directionId: params.directionId,
        expressionSystemId: params.expressionSystem.expressionSystemId,
        provider: 'anthropic',
        model: ANTHROPIC_CREATIVE_MODEL,
      });
      break;
    } catch (err) {
      if (!isJsonParseError(err) || attempt === 1) throw err;
    }
  }

  const artDirection = parseIdentityNativeArtDirectionResponse({
    text,
    directionId: params.directionId,
    expressionSystemId: params.expressionSystem.expressionSystemId,
    provider: 'anthropic',
    model: ANTHROPIC_CREATIVE_MODEL,
  });

  if (!artDirection.identityPremise || artDirection.paletteSystem.length < 2) {
    return {
      artDirection: buildDeterministicIdentityArtDirection({
        expressionSystem: params.expressionSystem,
        directionId: params.directionId,
      }),
      anthropicRequests: 1,
      usage: {
        inputTokens: usage.inputTokens ?? 0,
        outputTokens: usage.outputTokens ?? 0,
      },
    };
  }

  return {
    artDirection,
    anthropicRequests: 1,
    usage: {
      inputTokens: usage.inputTokens ?? 0,
      outputTokens: usage.outputTokens ?? 0,
    },
  };
}
