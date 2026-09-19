/**
 * Identity-Native V2 Visual Brief — adds Creative Expression + Hero Concept layers.
 */

import { createHash } from 'node:crypto';
import type { BrandNativeAssetRole } from './brandNativeVisualBriefTypes.js';
import type { IdentityNativeArtDirection, IdentityNativeVisualBrief } from './identityNativeArtDirectionTypes.js';
import {
  identityBriefAvoidsPhotographOf,
  identityBriefPromptPrecedesTopic,
} from './identityNativeVisualPromptCompiler.js';
import type {
  CopyQualityScores,
  CreativeExpressionSystem,
  HeroCreativeConcept,
  IdentityNativeV2VisualBrief,
} from './creativeExpressionTypes.js';
import { IDENTITY_NATIVE_HERO_V2_ASSET_ID } from './creativeExpressionTypes.js';
import { typographyRolesCondensedPromptBlock } from './martianMonoTypography.js';
import {
  compileIdentityNativeVisualBrief,
  IDENTITY_NATIVE_HERO_ASSET_ID,
} from './identityNativeVisualPromptCompiler.js';

export { IDENTITY_NATIVE_HERO_V2_ASSET_ID };

/** FAL gpt-image-2 rejects ~10k+ char prompts; V2 uses condensed identity + expression layers. */
export const IDENTITY_NATIVE_V2_MAX_PROMPT_CHARS = 7200;

function compileCondensedIdentityBaseForV2(
  brief: Omit<IdentityNativeVisualBrief, 'compiledPrompt' | 'promptHash'>,
  artDirection: IdentityNativeArtDirection,
): string[] {
  return [
    'ARTIFACT DECLARATION:',
    brief.artifactDeclaration,
    'Custom editorial campaign artwork — NOT photographing a found scene.',
    '',
    'PROPRIETARY VISUAL DNA:',
    ...brief.proprietaryVisualDNA.slice(0, 5).map((d) => `- ${d}`),
    artDirection.identityPremise,
    '',
    'PALETTE (semantic ownership):',
    ...brief.paletteOwnership.slice(0, 6).map((p) => `- ${p}`),
    '',
    'GRAPHIC GRAMMAR:',
    ...brief.graphicDevices.slice(0, 6).map((g) => `- ${g}`),
    '',
    'MATERIAL + COMPOSITION:',
    ...brief.materialSystem.slice(0, 4).map((m) => `- ${m}`),
    `- ${brief.imageTreatment}`,
    ...brief.compositionalHierarchy.slice(0, 3).map((c) => `- ${c}`),
    '',
    'DIRECTION:',
    brief.directionBehavior,
    '',
    'TOPIC (subordinate layer):',
    brief.topicContentLayer,
    '',
    'ANTI-STOCK (do NOT reproduce):',
    ...brief.antiExampleRejection.slice(0, 6).map((a) => `- ${a}`),
  ];
}

export function compileIdentityNativeV2VisualBrief(params: {
  artDirection: IdentityNativeArtDirection;
  creativeExpression: CreativeExpressionSystem;
  heroConcept: HeroCreativeConcept;
  copyQualityScores: CopyQualityScores;
  role: BrandNativeAssetRole;
  topic: string;
}): IdentityNativeV2VisualBrief {
  const base = compileIdentityNativeVisualBrief({
    artDirection: params.artDirection,
    role: params.role,
    topic: params.topic,
  });

  const creativeExpressionBlock = [
    `EDITORIAL PERSONALITY: ${params.creativeExpression.editorialPersonality}`,
    `VERBAL PERSONALITY: ${params.creativeExpression.verbalPersonality}`,
    ...params.creativeExpression.witMechanics.map((w) => `WIT: ${w}`),
    ...params.creativeExpression.secondReadDiscoveryRules.map((r) => `SECOND READ: ${r}`),
    ...params.creativeExpression.restraintRules.map((r) => `RESTRAINT: ${r}`),
    ...params.creativeExpression.compositionPersonality.map((c) => `COMPOSITION PERSONALITY: ${c}`),
  ];

  const heroConceptBlock = [
    `CENTRAL ARGUMENT: ${params.heroConcept.centralEditorialArgument}`,
    `DOMINANT EVENT: ${params.heroConcept.dominantEvent}`,
    `CLEAN CLAIM (display voice): "${params.heroConcept.cleanClaim}"`,
    `REVISION: ${params.heroConcept.revisionMove}`,
    `REPLACEMENT (lime intervention): "${params.heroConcept.replacementMove}"`,
    `MARGIN COUNTERPOINT (ballpoint blue): "${params.heroConcept.marginCounterpoint}"`,
    `MICROCOPY DISCOVERY: "${params.heroConcept.microcopyDiscovery}"`,
    `EVIDENCE DEVICE: ${params.heroConcept.evidenceDevice}`,
    `VISUAL PUNCHLINE: ${params.heroConcept.visualPunchline}`,
    `GRID BREAK: ${params.heroConcept.intentionalGridBreak}`,
    `QUIET ZONE: ${params.heroConcept.quietZone}`,
    ...params.heroConcept.readingSequence.map((r, i) => `READ ${i + 1}: ${r}`),
    `RESTRAINT: ${params.heroConcept.restraintDecision}`,
    ...params.heroConcept.graphicInterventions.map(
      (g) => `GRAPHIC ${g.device}: ${g.semanticPurpose}`,
    ),
  ];

  const typographyRolesBlock = typographyRolesCondensedPromptBlock(params.creativeExpression.typographyRoles);
  const systemMetadataBlock = params.heroConcept.martianMonoApplication.map(
    (m) => `SYSTEM/METADATA VOICE: ${m}`,
  );

  const compiledPrompt = [
    ...compileCondensedIdentityBaseForV2(
      { ...base, assetId: IDENTITY_NATIVE_HERO_V2_ASSET_ID },
      params.artDirection,
    ),
    '',
    '=== CREATIVE EXPRESSION LAYER (PERSONALITY — preserve identity methodology) ===',
    ...creativeExpressionBlock,
    '',
    '=== TYPOGRAPHY ROLES V2 ===',
    ...typographyRolesBlock,
    `- DOMINANT TYPE: ${params.heroConcept.dominantTypeBehavior}`,
    ...systemMetadataBlock,
    '',
    '=== HERO CREATIVE CONCEPT (specific artifact — authored copy, not generic demo) ===',
    ...heroConceptBlock,
    '',
    'CREATIVE REFINEMENT REQUIREMENTS:',
    '- Artifact must feel AUTHORED, OPINIONATED, WITTY — not an identity-system demonstration',
    '- Wit emerges from claim → disagreement → correction → margin structure',
    '- ONE dominant event, 2-3 supporting discoveries, ONE quiet zone, ONE surprising detail',
    '- SYSTEM/METADATA voice ONLY for evidence/indexing — NOT all text — font derived from direction',
    '- Do NOT add clutter, stickers, or decorative scribbles for "artistic flair"',
    '- Signal lime remains SINGLE decisive intervention moment',
    '- Typography may touch edges, be interrupted, partially hidden — with editorial reason',
  ].join('\n');

  const promptHash = createHash('sha256').update(compiledPrompt).digest('hex').slice(0, 16);

  return {
    ...base,
    assetId: IDENTITY_NATIVE_HERO_V2_ASSET_ID,
    creativeExpressionId: params.creativeExpression.expressionId,
    heroConceptId: params.heroConcept.conceptId,
    creativeExpressionBlock,
    heroConceptBlock,
    typographyRolesBlock: [...typographyRolesBlock, ...systemMetadataBlock],
    copyQualityScores: params.copyQualityScores,
    typographicArchitecture: [
      ...base.typographicArchitecture,
      ...typographyRolesBlock,
      params.heroConcept.dominantTypeBehavior,
    ],
    compiledPrompt,
    promptHash,
  };
}

export function v2BriefIncludesCreativeExpression(brief: IdentityNativeV2VisualBrief): boolean {
  return brief.compiledPrompt.includes('CREATIVE EXPRESSION LAYER');
}

export function v2BriefIncludesMartianMono(brief: IdentityNativeV2VisualBrief): boolean {
  return (
    brief.compiledPrompt.includes('MARTIAN MONO') ||
    brief.typographyRolesBlock.some((t) => t.toLowerCase().includes('martian'))
  );
}

/** Production/replay briefs must NOT include SITE 00 host font references */
export function v2BriefExcludesHostTypography(brief: IdentityNativeV2VisualBrief): boolean {
  return !v2BriefIncludesMartianMono(brief);
}

export { identityBriefPromptPrecedesTopic, identityBriefAvoidsPhotographOf };
