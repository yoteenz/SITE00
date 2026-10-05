/**
 * IdentityNativeVisualPromptCompiler — identity-first artifact design briefs (not topic→photograph).
 */

import { createHash } from 'node:crypto';
import type { BrandNativeAssetRole } from './brandNativeVisualBriefTypes.js';
import { topicClichesFor, transformTopicIntoDirectionNativeSubject } from './brandNativeVisualPromptCompiler.js';
import type {
  IdentityNativeArtDirection,
  IdentityNativeVisualBrief,
} from './identityNativeArtDirectionTypes.js';
import {
  appendVisualBriefProductionBlock,
  buildVisualBriefProductionContext,
  normalizeCreativePromptText,
  type VisualBriefProductionContext,
} from '../../../../../shared/site00-brand-lore/productionPromptNormalization.js';
import { canonicalBrandDisplayName } from '../../../../../shared/site00-brand-lore/brandIdentity.js';

export const IDENTITY_NATIVE_HERO_ASSET_ID = 'MUC-IDENTITY-NATIVE-HERO-PILOT';

const ANTI_EXAMPLE_DEFAULT = [
  'beige-dominant conventional document photography',
  'default red-pencil and blue-pen as primary identity',
  'stock editorial photograph of a marked document',
  'photograph of a real object someone found',
  'Pinterest stationery flat lay',
  'generic financial workplace',
];

export function compileIdentityNativeVisualBrief(params: {
  artDirection: IdentityNativeArtDirection;
  role: BrandNativeAssetRole;
  topic: string;
  referenceTranslation?: IdentityNativeVisualBrief['referenceTranslation'];
  brandSlug?: string;
  productionContext?: VisualBriefProductionContext;
}): IdentityNativeVisualBrief {
  const brandSlug = params.brandSlug ?? 'ndxbook';
  const displayName = canonicalBrandDisplayName(brandSlug);
  const productionContext =
    params.productionContext ??
    buildVisualBriefProductionContext({ orgSlug: brandSlug, expressionContext: 'SOCIAL_FIRST_EDITORIAL' });
  const topicTransform = transformTopicIntoDirectionNativeSubject(params.topic);
  const cliches = topicClichesFor(params.topic);
  const ad = params.artDirection;

  const paletteOwnership = ad.paletteSystem.map(
    (p) =>
      `${p.role} (${p.colorDescription}): ${p.semanticUse} — visual dominance: ${p.visualDominance}`,
  );

  const briefWithoutPrompt: Omit<IdentityNativeVisualBrief, 'compiledPrompt' | 'promptHash'> = {
    assetId: IDENTITY_NATIVE_HERO_ASSET_ID,
    role: params.role,
    topicOriginal: params.topic,
    topicContentLayer: `Editorial content layer ONLY: ${topicTransform.transformed}. Topic is subordinate to identity artifact design.`,
    artifactDeclaration:
      `Design an original bespoke visual artifact for ${displayName} — custom editorial campaign artwork, identity-system specimen, art-directed publication object. NOT a stock photograph.`,
    proprietaryVisualDNA: ad.proprietaryVisualDNA,
    paletteOwnership,
    typographicArchitecture: ad.typographyBehavior,
    graphicDevices: [...ad.graphicGrammar, ...ad.recurringDevices.slice(0, 3)],
    materialSystem: ad.materialBehavior,
    imageTreatment: ad.imageTreatment,
    compositionalHierarchy: [...ad.compositionalBehavior, ...ad.textureBehavior],
    directionBehavior: ad.artifactDesignLanguage,
    assetRoleObjective: `Hero must prove identity-native custom artwork — ${ad.identityPremise}`,
    referenceTranslation:
      params.referenceTranslation ??
      ad.referenceIdentityApplications.map((r) => ({
        referenceId: r.referenceId,
        traitsBorrowed: [r.identityTrait, r.application],
        traitsForbidden: ['copy layout literally', 'copy subject', 'copy publication identity', 'protected logos'],
      })),
    forbiddenGenericBehavior: [
      ...ad.forbiddenGenericBehaviors,
      ...cliches,
      ...ANTI_EXAMPLE_DEFAULT,
      ...ad.antiExampleCharacteristics,
      'governing sentence "photograph of"',
      'documentary stock photography',
      'calculator',
      'credit card',
      'laptop',
      'office desk',
    ],
    preOverlayRequirement:
      `PRE-OVERLAY IDENTITY: Raw image must already read as proprietary ${displayName} custom artwork — not merely direction-appropriate subject matter.`,
    antiExampleRejection: ad.antiExampleCharacteristics.length ? ad.antiExampleCharacteristics : ANTI_EXAMPLE_DEFAULT,
    artDirectionId: ad.artDirectionId,
    expressionSystemId: ad.expressionSystemId,
  };

  const compiledPrompt = normalizeCreativePromptText(
    compilePromptFromIdentityBrief(briefWithoutPrompt, ad, productionContext),
    brandSlug,
  );
  const promptHash = createHash('sha256').update(compiledPrompt).digest('hex').slice(0, 16);

  return { ...briefWithoutPrompt, compiledPrompt, promptHash };
}

export function compilePromptFromIdentityBrief(
  brief: Omit<IdentityNativeVisualBrief, 'compiledPrompt' | 'promptHash'>,
  artDirection: IdentityNativeArtDirection,
  productionContext?: VisualBriefProductionContext,
): string {
  const refBlock = brief.referenceTranslation
    .map(
      (r) =>
        `Reference ${r.referenceId}: IDENTITY TRAIT → APPLICATION. Borrow ${r.traitsBorrowed.join(', ')}. DO NOT ${r.traitsForbidden.join(', ')}.`,
    )
    .join('\n');

  const baseLines = [
    `ARTIFACT DECLARATION:`,
    brief.artifactDeclaration,
    `You are designing custom editorial campaign artwork — NOT photographing a found scene.`,
    '',
    `PROPRIETARY VISUAL DNA (recognizable without logo):`,
    ...brief.proprietaryVisualDNA.map((d) => `- ${d}`),
    artDirection.identityPremise,
    '',
    `PALETTE — SEMANTIC COLOR OWNERSHIP (control dominance explicitly):`,
    ...brief.paletteOwnership.map((p) => `- ${p}`),
    `Do NOT invent unrelated beige/red-pencil/blue-pen stationery palette unless specified above.`,
    '',
    `TYPOGRAPHIC COMPOSITION (visual form, not mere content):`,
    ...brief.typographicArchitecture.map((t) => `- ${t}`),
    '',
    `GRAPHIC GRAMMAR / DEVICES:`,
    ...brief.graphicDevices.map((g) => `- ${g}`),
    '',
    `MATERIAL + IMAGE TREATMENT:`,
    ...brief.materialSystem.map((m) => `- ${m}`),
    `- ${brief.imageTreatment}`,
    `- ${artDirection.photographicBehavior}`,
    '',
    `COMPOSITION / HIERARCHY / TENSION:`,
    ...brief.compositionalHierarchy.map((c) => `- ${c}`),
    '',
    `DIRECTION BEHAVIOR:`,
    brief.directionBehavior,
    ...artDirection.annotationGrammar.map((a) => `- ${a}`),
    '',
    `ASSET ROLE: ${brief.role}`,
    brief.assetRoleObjective,
    '',
    `TOPIC CONTENT (subordinate layer only — NOT the visual concept):`,
    brief.topicContentLayer,
    '',
    refBlock,
    '',
    `ANTI-EXAMPLE REJECTION (prior pilot failure — do NOT reproduce):`,
    ...brief.antiExampleRejection.map((a) => `- ${a}`),
    '',
    `FORBIDDEN GENERIC OUTPUT:`,
    ...brief.forbiddenGenericBehavior.slice(0, 20).map((f) => `- ${f}`),
    '',
    `PRE-OVERLAY IDENTITY REQUIREMENT:`,
    brief.preOverlayRequirement,
    ...artDirection.preOverlayRecognitionCriteria.map((c) => `- ${c}`),
    '',
    `STRANGER TEST: Must NOT look downloadable from a stock-photo site. Must NOT plausibly belong to ten unrelated editorial brands.`,
    `Must feel like someone art-directed and designed this specific visual object according to a coherent identity system.`,
  ];

  if (productionContext) {
    return appendVisualBriefProductionBlock(baseLines, productionContext).join('\n');
  }

  return baseLines.join('\n');
}

export function identityBriefPromptPrecedesTopic(brief: IdentityNativeVisualBrief): boolean {
  const idxArtifact = brief.compiledPrompt.indexOf('ARTIFACT DECLARATION');
  const idxTopic = brief.compiledPrompt.indexOf('TOPIC CONTENT');
  return idxArtifact >= 0 && idxTopic >= 0 && idxArtifact < idxTopic;
}

export function identityBriefAvoidsPhotographOf(brief: IdentityNativeVisualBrief): boolean {
  const lower = brief.compiledPrompt.toLowerCase();
  const governing = lower.slice(0, lower.indexOf('topic content'));
  return !governing.startsWith('photograph of') && !governing.includes('\nphotograph of a');
}
