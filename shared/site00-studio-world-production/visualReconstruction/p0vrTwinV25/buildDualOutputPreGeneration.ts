import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import { emptyConceptGallery, ensureConceptGallery } from '../p0vrTwinV22/conceptGalleryState.js';
import type { ConceptGenerationType } from '../p0vrTwinV22/types.js';
import { P0_VR_TWIN_V25_BUILD } from './constants.js';
import { buildNdxOverviewVisualObjectCatalog } from './ndxOverviewObjectCatalog.js';
import type {
  CompositionPlan,
  ConceptAssetPlan,
  ConceptFunctionTargetPlan,
  ConceptVisualBlueprint,
  PendingDualOutputGeneration,
  PairedConceptArtifact,
} from './types.js';
import { VISUAL_GENERATION_CORE_INSTRUCTION } from './visualGenerationInstruction.js';
import {
  assertConceptGenerationPreflight,
  runConceptGenerationPreflight,
} from '../p0vrTwinV26/runConceptGenerationPreflight.js';

export function buildCompositionPlan(input: {
  conceptId: string;
  versionId: string;
  session: ConceptDirectedTwinSession;
}): CompositionPlan {
  const cd = input.session.creativeDirection!;
  const bands = cd.sectionOrder.length ? cd.sectionOrder : input.session.blueprintGrammar.informationBands;
  const objects = buildNdxOverviewVisualObjectCatalog().map((o) => o.objectId);
  const now = new Date().toISOString();
  return {
    compositionPlanId: `cp-${input.conceptId}`,
    conceptId: input.conceptId,
    versionId: input.versionId,
    pageBands: bands.filter((b) => !b.toLowerCase().includes('host bottom')),
    columns: 12,
    objects,
    visualHierarchy: ['masthead', 'sectionNav', 'hero', 'progress', 'metrics', 'focus', 'milestone', 'activity'],
    typographyStrategy: input.session.brandContext.typographicGrammar.join('; '),
    colorStrategy: input.session.brandContext.colorLanguage.join(', '),
    assetStrategy: 'standalone canonical assets + DOM/CSS for structure',
    interactionStrategy: 'function targets bound to objectIds',
    responsiveStrategy: '375px mobile normalized coordinates',
    hostBoundary: input.session.brandContext.hostClientFirewall,
    createdAt: now,
  };
}

export function buildConceptVisualBlueprint(input: {
  conceptId: string;
  versionId: string;
  compositionPlan: CompositionPlan;
}): ConceptVisualBlueprint {
  const objects = buildNdxOverviewVisualObjectCatalog();
  const now = new Date().toISOString();
  return {
    blueprintId: `cvbp-${input.conceptId}`,
    conceptId: input.conceptId,
    versionId: input.versionId,
    viewport: 'mobile',
    canvas: { width: 375, height: 812 },
    bands: input.compositionPlan.pageBands.map((label, i) => ({
      bandId: `band-${i + 1}`,
      label,
      y: 0.07 + i * 0.09,
      h: 0.085,
    })),
    objects,
    grid: { columns: 12, gutter: 0.04, margin: 0.04 },
    typographyTokens: [
      { role: 'headline', family: 'ndx_condensed', size: 0.042, weight: '700' },
      { role: 'body', family: 'ndx_condensed', size: 0.028, weight: '400' },
      { role: 'metric', family: 'ndx_condensed', size: 0.022, weight: '600' },
    ],
    colorTokens: [
      { role: 'lime', value: '#c8ff00' },
      { role: 'hero_bg', value: '#0a0a0a' },
      { role: 'surface', value: '#ffffff' },
    ],
    surfaceTokens: ['white_band', 'black_hero'],
    borderTokens: ['lime_divider'],
    assetSlots: objects.filter((o) => o.assetSlotId).map((o) => o.assetSlotId!),
    zLayers: [{ layer: 1, objectIds: objects.filter((o) => o.type === 'SURFACE').map((o) => o.objectId) }],
    alignmentRules: ['left_margin_0.04', 'hero_image_left_weighted'],
    responsiveRules: ['375_mobile_artboard'],
    hostBoundary: input.compositionPlan.hostBoundary,
    status: 'DRAFT',
    createdAt: now,
  };
}

export function buildConceptAssetPlan(input: {
  conceptId: string;
  versionId: string;
  visualBlueprint: ConceptVisualBlueprint;
}): ConceptAssetPlan {
  const now = new Date().toISOString();
  const assetSlots = input.visualBlueprint.objects
    .filter((o) => o.assetSlotId)
    .map((o) => ({
      assetSlotId: o.assetSlotId!,
      blueprintObjectId: o.objectId,
      role: o.role,
      assetType: o.type,
      visualDescription: `${o.role} for ${input.conceptId}`,
      sourceType: o.sourceType,
      sourceStrategy:
        o.sourceType === 'GENERATED_TRANSPARENT_ASSET'
          ? 'NEW_GENERATED_TRANSPARENT'
          : o.sourceType === 'GENERATED_COMPLEX_MEDIA'
            ? 'NEW_GENERATED_RASTER'
            : 'PROCEDURAL_DOM',
      existingAssetId: null,
      generationRequired: o.sourceType.startsWith('GENERATED'),
      transparentBackground:
        o.sourceType === 'GENERATED_TRANSPARENT_ASSET' || o.type === 'ICON' || o.type === 'GRAPHIC',
      expectedWidth: Math.round(o.width * 375),
      expectedHeight: Math.round(o.height * 812),
      cropBehavior: 'none',
      fit: o.objectFit ?? 'contain',
      position: o.objectPosition ?? 'center',
      status: 'PLANNED' as const,
    }));

  return {
    conceptId: input.conceptId,
    versionId: input.versionId,
    assetSlots,
    status: 'READY',
    createdAt: now,
  };
}

export function buildConceptFunctionTargetPlan(input: {
  conceptId: string;
  versionId: string;
  visualBlueprint: ConceptVisualBlueprint;
  session: ConceptDirectedTwinSession;
}): ConceptFunctionTargetPlan {
  const now = new Date().toISOString();
  const targets = input.visualBlueprint.objects
    .filter((o) => o.functionBindingTarget)
    .map((o) => ({
      objectId: o.objectId,
      functionKey: o.functionBindingTarget!,
      liveFunction: o.functionBindingTarget!,
    }));

  for (const fn of input.session.functionGraph.sectionNavigation) {
    if (!targets.some((t) => t.functionKey.includes(fn))) {
      targets.push({
        objectId: `sectionNav.${fn.replace(/\s+/g, '').toLowerCase()}`,
        functionKey: `section_nav.${fn}`,
        liveFunction: fn,
      });
    }
  }

  return {
    bindingPlanId: `cftp-${input.conceptId}`,
    conceptId: input.conceptId,
    versionId: input.versionId,
    targets,
    status: 'COMPLETE',
    createdAt: now,
  };
}

export function beginDualOutputConceptGeneration(
  session: ConceptDirectedTwinSession,
  input: {
    generationType: ConceptGenerationType;
    parentConceptId?: string | null;
    founderInstruction?: string | null;
  },
): { session: ConceptDirectedTwinSession; pending: PendingDualOutputGeneration } {
  if (!session.creativeDirection) {
    throw new Error('TWIN_V25: creative direction required');
  }
  const baseSession = ensureConceptGallery(session);
  const gallery = baseSession.conceptGallery ?? emptyConceptGallery();
  const versionNumber = (gallery?.candidates.length ?? 0) + 1;
  const conceptId = `cc-${session.sessionId}-v${versionNumber}-${Date.now()}`;
  const versionId = `vc-${session.sessionId}-${Date.now()}`;
  const now = new Date().toISOString();

  const compositionPlan = buildCompositionPlan({ conceptId, versionId, session });
  const visualBlueprint = buildConceptVisualBlueprint({ conceptId, versionId, compositionPlan });
  const assetPlan = buildConceptAssetPlan({ conceptId, versionId, visualBlueprint });
  const functionTargetPlan = buildConceptFunctionTargetPlan({ conceptId, versionId, visualBlueprint, session });

  const paired: PairedConceptArtifact = {
    conceptId,
    versionId,
    sessionId: session.sessionId,
    projectId: session.projectId,
    pageId: session.pageId,
    viewport: 'mobile',
    creativeDirectionId: session.creativeDirection.creativePremise.slice(0, 48),
    compositionPlanId: compositionPlan.compositionPlanId,
    visualAssetId: null,
    conceptVisualBlueprintId: visualBlueprint.blueprintId,
    reconciliationReceiptId: null,
    assetManifestId: `cam-${conceptId}`,
    functionBindingPlanId: functionTargetPlan.bindingPlanId,
    status: 'VISUAL_GENERATING',
    conceptOrigin: 'DUAL_OUTPUT_PAIRED',
    createdAt: now,
    updatedAt: now,
  };

  const visualGenerationInstruction = [
    VISUAL_GENERATION_CORE_INSTRUCTION,
    `Object count: ${visualBlueprint.objects.length}`,
    `Object IDs: ${visualBlueprint.objects.map((o) => o.objectId).join(', ')}`,
    `Asset slots: ${assetPlan.assetSlots.map((s) => s.assetSlotId).join(', ')}`,
    `Function targets: ${functionTargetPlan.targets.map((t) => `${t.objectId}→${t.functionKey}`).join('; ')}`,
    input.founderInstruction ? `Refinement: ${input.founderInstruction}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const pending: PendingDualOutputGeneration = {
    buildRef: P0_VR_TWIN_V25_BUILD,
    conceptId,
    versionId,
    generationType:
      input.generationType === 'REFINED'
        ? 'REFINED'
        : input.generationType === 'REGENERATED'
          ? 'REGENERATED'
          : 'INITIAL',
    parentConceptId: input.parentConceptId ?? null,
    founderInstruction: input.founderInstruction ?? null,
    paired,
    compositionPlan,
    visualBlueprint,
    assetPlan,
    functionTargetPlan,
    visualGenerationInstruction,
    startedAt: now,
  };

  const preflight = runConceptGenerationPreflight(baseSession, pending);
  assertConceptGenerationPreflight(preflight);

  return {
    session: {
      ...baseSession,
      conceptGallery: {
        ...gallery,
        pendingDualOutput: pending,
        compositionPlans: { ...(gallery?.compositionPlans ?? {}), [compositionPlan.compositionPlanId]: compositionPlan },
        visualBlueprints: { ...(gallery?.visualBlueprints ?? {}), [visualBlueprint.blueprintId]: visualBlueprint },
        assetPlans: { ...(gallery?.assetPlans ?? {}), [conceptId]: assetPlan },
        functionTargetPlans: {
          ...(gallery?.functionTargetPlans ?? {}),
          [functionTargetPlan.bindingPlanId]: functionTargetPlan,
        },
        pairedArtifacts: { ...(gallery?.pairedArtifacts ?? {}), [conceptId]: paired },
      },
      updatedAt: now,
    },
    pending,
  };
}
