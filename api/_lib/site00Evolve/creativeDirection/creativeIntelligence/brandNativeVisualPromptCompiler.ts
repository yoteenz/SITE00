/**
 * BrandNativeVisualPromptCompiler — direction-system-first visual briefs (not topic→stock).
 */

import { createHash } from 'node:crypto';
import type {
  BrandNativeAssetRole,
  BrandNativeVisualBrief,
  CompileBrandNativeBriefParams,
} from './brandNativeVisualBriefTypes.js';
import type { DirectionExpressionSystem } from './directionExpressionSystemTypes.js';

export const MARKED_UP_COPY_WORLD_PREMISE =
  'This image exists inside an active editorial document under revision. The content has already been handled, questioned, corrected, and passed along. The page itself is an active thinking surface.';

export const TOPIC_CLICHE_BLACKLIST: Record<string, string[]> = {
  finance: [
    'calculator',
    'piggy bank',
    'coins stacked',
    'laptop with charts',
    'business handshake',
    'office desk',
    'credit card floating',
    'generic spreadsheet',
    'person worried at bills',
    'ledger book hero',
    'financial workplace',
  ],
  career: ['corporate meeting', 'handshake', 'person at laptop', 'office tower', 'resume flat lay'],
  relationships: ['generic couple', 'holding hands', 'dating stock photography'],
  health: ['doctor stock', 'generic gym person', 'salad', 'medical clipboard'],
  general: [
    'business people',
    'office scene',
    'lifestyle flat lay',
    'Pinterest stationery',
    'minimal white table',
    'dark academia',
    'corporate stock',
  ],
};

const TOPIC_ARTIFACT_MAP: Record<string, string> = {
  'credit score': 'annotated score report fragment with disputed number, circled data point, revised interpretation in margin',
  'credit utilization': 'printed utilization chart fragment embedded in proof page, crossed-out interpretation, corrected percentage inserted above, margin argument questioning the original statement',
  'debt payoff': 'marked repayment schedule with crossed-out timeline and margin argument over priority',
  career: 'printed offer/resignation draft with salary note and marked interview page fragment',
  relationships: 'printed conversation artifact with handwritten rebuttal and redacted note margin',
  travel: 'folded ticket or printed itinerary under revision with annotated receipt fragment',
  culture: 'clipped article fragment with caption correction and marked commentary page',
};

export function detectTopicCategory(topic: string): string {
  const t = topic.toLowerCase();
  if (/credit|debt|finance|money|loan|score|utilization|payment|interest/.test(t)) return 'finance';
  if (/career|job|salary|resume|interview|workplace/.test(t)) return 'career';
  if (/relationship|dating|partner|marriage/.test(t)) return 'relationships';
  if (/health|fitness|medical|doctor|wellness/.test(t)) return 'health';
  return 'general';
}

export function topicClichesFor(topic: string): string[] {
  const cat = detectTopicCategory(topic);
  return [...(TOPIC_CLICHE_BLACKLIST[cat] ?? []), ...TOPIC_CLICHE_BLACKLIST.general];
}

export function transformTopicIntoDirectionNativeSubject(topic: string): {
  transformed: string;
  removedStockNouns: string[];
  artifactType: string;
} {
  const normalized = topic.trim().toLowerCase();
  const cliches = topicClichesFor(topic);
  const matchedKey = Object.keys(TOPIC_ARTIFACT_MAP).find((k) => normalized.includes(k));
  const artifactType = matchedKey ?? 'editorial proof page fragment';
  const transformed =
    TOPIC_ARTIFACT_MAP[matchedKey ?? ''] ??
    `close-cropped printed editorial proof page containing partially visible information related to "${topic}", embedded in active revision marks — not a literal illustration of ${topic}`;

  const removedStockNouns = cliches.filter((c) =>
    normalized.includes(c.replace(/\s+/g, ' ').split(' ')[0] ?? ''),
  );

  return { transformed, removedStockNouns, artifactType };
}

function requiredSignalsForMarkedUpCopy(system: DirectionExpressionSystem): string[] {
  return [
    'physically revised document surface (not clean publish-ready page)',
    'visible red-pencil or editorial intervention evidence in-scene',
    'paper handling / print grain / photocopy warmth',
    'margin or correction behavior implied in composition',
    'irregular crop framing an actively handled page',
    system.photographySystem.humanPresence.includes('Hands')
      ? 'hand mid-mark at frame edge only if human presence needed'
      : 'no posed human subjects',
    ...system.graphicGrammar.selectedDevices.slice(0, 2).map((d) => `graphic device evidence: ${d}`),
  ].slice(0, 6);
}

function roleStrategy(role: BrandNativeAssetRole): { visualObjective: string; crop: string } {
  switch (role) {
    case 'HERO_EDITORIAL_WORLD':
      return {
        visualObjective:
          'Prove the complete THE MARKED-UP COPY visual world in one frame — document mid-revision, not a topic illustration.',
        crop: 'Extreme close macro on handled proof page; document dominates frame; aggressive crop cuts into text/table edges.',
      };
    case 'PRIMARY_ARTIFACT':
      return {
        visualObjective: 'A real handled editorial object — torn page fragment, proof sheet, or replacement strip.',
        crop: 'Tight object crop with torn edge and tape ghost; object feels pulled from a review pile.',
      };
    case 'PHOTOGRAPHIC_EVIDENCE':
      return {
        visualObjective:
          'Secondary photographic evidence — receipt/chart/article fragment embedded in proof environment, same DNA as hero but different composition.',
        crop: 'Different angle and scale from hero; documentary caught-in-process feel.',
      };
    case 'MATERIAL_SPECIMEN':
      return {
        visualObjective: 'Isolate tactile material language — pen impression, highlight bleed, correction tape ghost.',
        crop: 'Macro material crop; maximum paper fiber and ink bleed visibility.',
      };
    case 'SOCIAL_APPLICATION_SUBSTRATE':
      return {
        visualObjective: 'Direction-native physical base for social content — feed-scale document texture, not UI mockup.',
        crop: 'Square-friendly crop with mark visible at thumbnail scale.',
      };
  }
}

function colorRulesFromSystem(system: DirectionExpressionSystem): string[] {
  const roles = system.colorSystem.semanticRoles;
  return [
    `${roles.offWhiteNewsprint ?? roles['off-white'] ?? 'off-white newsprint'} = base document field only`,
    `${roles.inkBlack ?? roles['ink-black'] ?? 'ink black'} = primary clean copy on page`,
    `${roles.redPencil ?? roles['red-pencil'] ?? 'red pencil'} = active revision marks ONLY (never background accent)`,
    `${roles.ballpointBlue ?? roles.blueballpoint ?? 'ballpoint blue'} = margin notation texture ONLY`,
    `${roles.yellowHighlighter ?? roles['yellow-highlight'] ?? 'yellow'} = post-read highlight/sticky interruption ONLY`,
    'Do not use brand palette words — colors enter only as physical editorial materials.',
  ];
}

export function compileBrandNativeVisualBrief(params: CompileBrandNativeBriefParams): BrandNativeVisualBrief {
  const { expressionSystem: sys, role, topic } = params;
  const topicTransform = transformTopicIntoDirectionNativeSubject(topic);
  const roleSpec = roleStrategy(role);
  const assetId = createHash('sha256')
    .update(`${sys.expressionSystemId}:${role}:${topic}`)
    .digest('hex')
    .slice(0, 16);

  const forbiddenTopicCliches = topicClichesFor(topic);
  const forbiddenGeneric = [
    ...sys.photographySystem.mustNeverLookLike,
    ...sys.antiGenericRules.slice(0, 4),
    ...forbiddenTopicCliches,
  ];

  const briefWithoutPrompt: Omit<BrandNativeVisualBrief, 'compiledPrompt' | 'promptHash'> = {
    assetId,
    role,
    topicOriginal: topic,
    topicTransformed: topicTransform.transformed,
    worldPremise: MARKED_UP_COPY_WORLD_PREMISE,
    brandBehavior: sys.governingVisualBehavior,
    visualObjective: roleSpec.visualObjective,
    subjectMatter: `${sys.photographySystem.subjectMatter}. Topic embedded as document content, not as workplace scene.`,
    subjectTransformation: topicTransform.transformed,
    photographyRules: [
      sys.photographySystem.cameraDistance,
      sys.photographySystem.croppingBehavior,
      sys.photographySystem.lighting,
      sys.photographySystem.grainTexture,
      sys.photographySystem.humanPresence,
      sys.photographySystem.documentaryEditorialBalance,
      roleSpec.crop,
      'No clean lifestyle staging; no commercial stock composition.',
    ],
    materialRules: [
      ...sys.materialLanguage.paperTypes.slice(0, 3),
      ...sys.materialLanguage.physicalBehaviors.slice(0, 3),
      ...sys.materialLanguage.justifiedMaterials.slice(0, 3),
    ],
    colorRules: colorRulesFromSystem(sys),
    spatialRules: [sys.spatialBehavior, 'Revision layer may break grid; primary layer remains structurally readable.'],
    textureRules: [sys.photographySystem.grainTexture, sys.imageTreatment],
    lightingRules: [sys.photographySystem.lighting, 'Warm directional desk/window — not studio strobe.'],
    cropRules: [sys.photographySystem.croppingBehavior, roleSpec.crop],
    objectRules: [
      sys.photographySystem.objectPresence,
      'Objects are editorial tools in use (pencil, tape, page) — never topic cliché props.',
    ],
    humanPresenceRules: [sys.photographySystem.humanPresence],
    referenceApplications: params.referenceInfluence ?? [],
    requiredBrandSpecificSignals: requiredSignalsForMarkedUpCopy(sys),
    forbiddenGenericSignals: forbiddenGeneric,
    forbiddenTopicCliches,
    textOwnership: 'FAL_FORBIDDEN',
    modelInstructions:
      'Synthesize original imagery from the direction system. Do not produce stock-search or lifestyle photography. No readable logos or brand words.',
    negativeInstructions: [
      ...forbiddenTopicCliches,
      'calculator hero object',
      'laptop',
      'coins',
      'credit card props',
      'business people',
      'office desk scene',
      'generic paperwork arrangement',
      'readable generated branding',
      'large headline typography',
      'Pinterest craft scrapbook',
      'dark academia',
      'minimal flat lay',
    ],
    recognitionTest:
      'PRE_OVERLAY: Raw image must feel like THE MARKED-UP COPY before any NDX BOOK text, captions, or code overlays.',
    expressionSystemId: sys.expressionSystemId,
  };

  const compiledPrompt = compilePromptFromBrief(briefWithoutPrompt);
  const promptHash = createHash('sha256').update(compiledPrompt).digest('hex').slice(0, 16);

  return { ...briefWithoutPrompt, compiledPrompt, promptHash };
}

export function compilePromptFromBrief(
  brief: Omit<BrandNativeVisualBrief, 'compiledPrompt' | 'promptHash'>,
): string {
  const refBlock =
    brief.referenceApplications.length > 0
      ? brief.referenceApplications
          .map(
            (r) =>
              `Reference influence (${r.referenceId}${r.cropId ? ` / ${r.cropId}` : ''}): BORROW ${r.traitsBorrowed.join(', ')}. DO NOT ${r.traitsForbidden.join(', ')}.`,
          )
          .join('\n')
      : 'No reference identity copy — synthesize original scene.';

  return [
    `Create an original editorial photograph inside THE MARKED-UP COPY visual world.`,
    `This is NOT a generic ${detectTopicCategory(brief.topicOriginal)} photograph about "${brief.topicOriginal}".`,
    '',
    `WORLD PREMISE: ${brief.worldPremise}`,
    `BRAND BEHAVIOR: ${brief.brandBehavior}`,
    `VISUAL OBJECTIVE (${brief.role}): ${brief.visualObjective}`,
    '',
    `SUBJECT TRANSFORMATION (topic embedded as document artifact, not workplace scene):`,
    brief.subjectTransformation,
    '',
    `PHOTOGRAPHY SYSTEM:`,
    ...brief.photographyRules.map((r) => `- ${r}`),
    '',
    `MATERIAL LANGUAGE (must exist physically in scene):`,
    ...brief.materialRules.map((r) => `- ${r}`),
    '',
    `COLOR SEMANTIC ROLES (how color enters the physical scene):`,
    ...brief.colorRules.map((r) => `- ${r}`),
    '',
    `SPATIAL / TEXTURE / LIGHTING:`,
    ...brief.spatialRules.map((r) => `- ${r}`),
    ...brief.textureRules.map((r) => `- ${r}`),
    ...brief.lightingRules.map((r) => `- ${r}`),
    '',
    `REQUIRED DIRECTION-NATIVE SIGNALS (at least 3 must read in raw image):`,
    ...brief.requiredBrandSpecificSignals.map((s) => `- ${s}`),
    '',
    refBlock,
    '',
    `FORBIDDEN:`,
    ...brief.negativeInstructions.map((n) => `- ${n}`),
    '',
    `RECOGNITION TEST: ${brief.recognitionTest}`,
    `The raw image must communicate: SOMEONE WAS ALREADY THINKING ON THIS PAGE.`,
  ].join('\n');
}

export function promptWorldPremisePrecedesTopic(brief: BrandNativeVisualBrief): boolean {
  const idxPremise = brief.compiledPrompt.indexOf('WORLD PREMISE');
  const idxTopic = brief.compiledPrompt.indexOf('SUBJECT TRANSFORMATION');
  return idxPremise >= 0 && idxTopic >= 0 && idxPremise < idxTopic;
}

export function briefContainsStockNoun(brief: BrandNativeVisualBrief, noun: string): boolean {
  const lower = brief.compiledPrompt.toLowerCase();
  const start = lower.indexOf('subject transformation');
  const end = lower.indexOf('photography system');
  const topicSection =
    start >= 0 && end > start ? lower.slice(start, end) : brief.subjectTransformation.toLowerCase();
  return topicSection.includes(noun.toLowerCase());
}

export function financeTopicAvoidsCalculator(brief: BrandNativeVisualBrief): boolean {
  if (detectTopicCategory(brief.topicOriginal) !== 'finance') return true;
  return !briefContainsStockNoun(brief, 'calculator');
}
