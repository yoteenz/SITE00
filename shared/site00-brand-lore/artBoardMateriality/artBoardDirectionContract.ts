/**
 * ArtBoard direction + canvas object builders — topic-specific material decisions.
 */

import { createHash } from 'node:crypto';
import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type { CharacterRetainedFirstSlideContract } from '../characterRetention/types.js';
import type {
  ArtBoardDirectionContract,
  ArtifactAttachment,
  ArtifactConstructionHistory,
  ArtifactLayer,
  ArtifactMaterialitySystem,
  BaseSurfaceClass,
  CanvasObjectContract,
  ModernNotebookExpression,
  PageConstructionMode,
  PageEdgeBehavior,
  PrintScanBehavior,
  TornEdgeBehavior,
} from './types.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

const TOPIC_MATERIAL_PROFILES: Record<
  number,
  {
    baseSurface: BaseSurfaceClass;
    constructionMode: PageConstructionMode;
    edge: PageEdgeBehavior;
    tear: TornEdgeBehavior;
    printScan: PrintScanBehavior;
    artifactForm: string;
    why: string;
    whyNotTemplate: string;
    modernNotebook: boolean;
  }
> = {
  1: {
    baseSurface: 'OFFICE_PAPER',
    constructionMode: 'LAYERED_INSERT',
    edge: 'SLIGHTLY_IRREGULAR',
    tear: 'INSERT_ONLY',
    printScan: 'SCANNED',
    artifactForm: 'subscription receipt stack on handled office sheet',
    why: 'Consumer fatigue thesis — proof objects feel pulled from real checkout behavior',
    whyNotTemplate: 'Not a poster — receipts are attached to a worked page',
    modernNotebook: false,
  },
  2: {
    baseSurface: 'GRAPH_PAPER',
    constructionMode: 'MARGIN_WORKSPACE',
    edge: 'PARTIALLY_CROPPED',
    tear: 'NONE',
    printScan: 'PRINTED',
    artifactForm: 'modern grid notebook page with timed annotation',
    why: 'Time-waste thesis — NDX timed the checkout on working paper',
    whyNotTemplate: 'Type prints ON the page; elapsed time written in margin',
    modernNotebook: true,
  },
  3: {
    baseSurface: 'ARCHIVAL_PAPER',
    constructionMode: 'ARCHIVAL_FILE',
    edge: 'WORN',
    tear: 'TEAR_AS_EVIDENCE',
    printScan: 'PHOTOCOPIED',
    artifactForm: 'archival file insert with correction slip',
    why: 'Apology/reassessment — memory return requires handled archival matter',
    whyNotTemplate: 'Correction sits ON archival sheet, not floating card',
    modernNotebook: false,
  },
  4: {
    baseSurface: 'MAGAZINE_STOCK',
    constructionMode: 'TEAR_OUT',
    edge: 'TORN',
    tear: 'TEAR_AS_REVISION',
    printScan: 'SCANNED',
    artifactForm: 'magazine tear-out with self-correction mark',
    why: 'Wrong-take thesis — cultural reassessment via torn publication fragment',
    whyNotTemplate: 'Tear is the evidence — headline printed on torn stock',
    modernNotebook: false,
  },
  5: {
    baseSurface: 'NOTEBOOK_PAPER',
    constructionMode: 'OPEN_NOTEBOOK',
    edge: 'BOUND_EDGE',
    tear: 'NONE',
    printScan: 'SCANNED',
    artifactForm: 'modern open notebook spread — loud wrong take',
    why: 'Judgment thesis — NDX wrote the correction on working notebook',
    whyNotTemplate: 'Notebook IS the canvas; type sits on paper not overlay',
    modernNotebook: true,
  },
  6: {
    baseSurface: 'THERMAL_RECEIPT',
    constructionMode: 'OBJECT_PLUS_PAGE',
    edge: 'ROUGH_CUT',
    tear: 'FULL_SCRAP',
    printScan: 'THERMAL_PRINTED',
    artifactForm: 'thermal receipt fragment on cream stock',
    why: 'Waiting/absurdity — proof object with physical fragility',
    whyNotTemplate: 'Receipt is the hero object attached to page',
    modernNotebook: false,
  },
  7: {
    baseSurface: 'INDEX_CARD',
    constructionMode: 'MINIMAL_PAGE',
    edge: 'CLEAN',
    tear: 'NONE',
    printScan: 'PRINTED',
    artifactForm: 'minimal index card on off-white sheet — sparse but material',
    why: 'Serious restraint — one clipped memo, warped edge, photographed as one object',
    whyNotTemplate: 'Even sparse slides have physical object identity',
    modernNotebook: false,
  },
  8: {
    baseSurface: 'SCREEN_CAPTURE',
    constructionMode: 'DIGITAL_PHYSICAL_HYBRID',
    edge: 'SCANNED_OFF_FRAME',
    tear: 'NONE',
    printScan: 'PRINTED',
    artifactForm: 'printed screenshot with handwritten reaction',
    why: 'Digital behavior captured then handled physically',
    whyNotTemplate: 'Screenshot printed and marked — not UI card on background',
    modernNotebook: false,
  },
  9: {
    baseSurface: 'ART_BOARD',
    constructionMode: 'SINGLE_SHEET',
    edge: 'SLIGHTLY_IRREGULAR',
    tear: 'SUBTLE',
    printScan: 'CLEAN_DIGITAL',
    artifactForm: 'contemporary art board — crisp type on tactile surface',
    why: 'Fair judgment — elegant handled surface without scrapbook collapse',
    whyNotTemplate: 'Art board surface participates; content integrated not overlaid',
    modernNotebook: false,
  },
};

export function buildModernNotebookExpression(): ModernNotebookExpression {
  return {
    contemporary: true,
    traits: [
      'asymmetric page edges',
      'crisp digital type against physical matter',
      'scanner-like crop',
      'evidence slipping beyond bounds',
      'controlled wear',
    ],
    mustNotFeel: ['school notebook', 'cute stationery', 'vintage scrapbook', 'crafty collage'],
  };
}

export function buildConstructionHistory(params: {
  topicIndex: number;
  primaryHook: string;
}): ArtifactConstructionHistory {
  const profile = TOPIC_MATERIAL_PROFILES[params.topicIndex];
  return {
    firstPresent: profile?.artifactForm ?? 'base editorial page',
    ndxAdded: ['character beat annotation', 'controlled misbehavior mark'],
    ndxRemoved: [],
    ndxCorrected: params.topicIndex === 4 ? ['prior headline crossed out'] : [],
    tapedLater: params.topicIndex === 1 ? ['receipt fragment'] : [],
    moved: [],
    overlaps: params.topicIndex === 1 ? ['receipt over printed headline zone'] : [],
    originalSource: [params.primaryHook.slice(0, 60)],
    ndxIntervention: ['margin note', 'underline disagreement'],
  };
}

export function buildArtifactLayers(params: {
  topicIndex: number;
  profile: (typeof TOPIC_MATERIAL_PROFILES)[number];
}): { primary: ArtifactLayer; secondary: ArtifactLayer[] } {
  const primary: ArtifactLayer = {
    layerType: 'BASE_PAGE',
    role: 'PRIMARY_CANVAS',
    order: 0,
    enteredBy: 'ORIGINAL',
    aboveLayer: null,
    belowLayer: null,
    causality: `Base ${params.profile.baseSurface} is the object viewer holds — not background texture`,
  };
  const secondary: ArtifactLayer[] = [];
  if (params.topicIndex === 1 || params.topicIndex === 6) {
    secondary.push({
      layerType: 'RECEIPT',
      role: 'EVIDENCE_LAYER',
      order: 1,
      enteredBy: 'NDX_INTERVENTION',
      aboveLayer: 'BASE_PAGE',
      belowLayer: null,
      causality: 'Receipt taped after page composed — proof of subscription absurdity',
    });
  }
  if (params.topicIndex === 8) {
    secondary.push({
      layerType: 'SCREENSHOT',
      role: 'HERO_OBJECT',
      order: 1,
      enteredBy: 'ORIGINAL',
      aboveLayer: 'BASE_PAGE',
      belowLayer: null,
      causality: 'Digital UI printed then annotated — hybrid handling',
    });
  }
  if (params.profile.tear !== 'NONE') {
    secondary.push({
      layerType: 'INSERT',
      role: 'SECONDARY_INSERT',
      order: secondary.length + 1,
      enteredBy: 'NDX_INTERVENTION',
      aboveLayer: 'BASE_PAGE',
      belowLayer: null,
      causality: 'Torn fragment inserted as evidence — tear is thesis not decoration',
    });
  }
  return { primary, secondary };
}

export function buildAttachmentLogic(params: {
  topicIndex: number;
}): ArtBoardDirectionContract['attachmentLogic'] {
  if (params.topicIndex === 1) {
    return [{ mechanism: 'TAPE', causality: 'NDX taped receipt after reading headline', placement: 'MARGIN' }];
  }
  if (params.topicIndex === 6) {
    return [{ mechanism: 'GLUE', causality: 'Fragile thermal receipt adhered to working page', placement: 'CENTER' }];
  }
  return [];
}

export function buildCanvasObjectContract(params: {
  artifactId: string;
  topicIndex: number;
  profile: (typeof TOPIC_MATERIAL_PROFILES)[number];
}): CanvasObjectContract {
  const attachments = buildAttachmentLogic({ topicIndex: params.topicIndex });
  return {
    artifactId: params.artifactId,
    canvasType: params.profile.constructionMode,
    canvasDimensions: 'SQUARE_FEED',
    canvasOrientation: params.topicIndex === 2 ? 'SLIGHTLY_ROTATED' : 'UPRIGHT',
    edgeState: params.profile.edge,
    surfaceCondition: params.profile.modernNotebook ? 'handled modern stock' : 'editorial handled surface',
    surfaceTexture: params.profile.baseSurface.includes('RECEIPT') ? 'thermal fragile' : 'matte paper weight',
    surfaceAge: 'HANDLED',
    physicalDepth: attachments.length > 0 ? 'SUBTLE_LAYERING' : 'FLAT_PRINT',
    layerCount: 1 + attachments.length,
    croppingBehavior: params.profile.edge === 'SCANNED_OFF_FRAME' ? 'scanner crop breaks perfect frame' : 'controlled feed crop',
    shadowBehavior: attachments.length > 0 ? 'subtle edge lift on inserts' : 'none',
    foldBehavior: params.topicIndex === 5 ? 'corner fold on notebook' : 'none',
    tearBehavior: params.profile.tear,
    attachmentPoints: attachments.map((a) => ({ mechanism: a.mechanism, causality: a.causality })),
    overlapRules: ['inserts may intrude margin', 'type may cross fold where intentional'],
    spatialImperfection: 'content not centered in perfect rectangle by default',
    constructionLogic: params.profile.why,
    whyThisCanvas: params.profile.why,
    mustNotBecome: ['poster on texture', 'Canva collage', 'fake paper filter', 'uniform margins'],
  };
}

export function buildMaterialitySystem(profile: (typeof TOPIC_MATERIAL_PROFILES)[number]): ArtifactMaterialitySystem {
  return {
    baseSurface: profile.baseSurface,
    surfaceAge: 'HANDLED',
    surfaceFinish: profile.baseSurface === 'SCREEN_CAPTURE' ? 'GLOSS' : 'MATTE',
    surfaceWeight: profile.baseSurface === 'THERMAL_RECEIPT' ? 'LIGHT' : 'MEDIUM',
    surfaceColor: profile.baseSurface === 'ART_BOARD' ? 'off-white art stock' : 'cream editorial stock',
    surfaceIntegrity: profile.tear === 'FULL_SCRAP' ? 'FRAGMENT' : 'INTACT',
    edgeBehavior: profile.edge,
    foldBehavior: profile.modernNotebook ? 'CORNER' : 'NONE',
    tearBehavior: profile.tear,
    bindingBehavior: profile.constructionMode === 'OPEN_NOTEBOOK' ? 'SPIRAL' : 'LOOSE',
    layerBehavior: profile.constructionMode === 'LAYERED_INSERT' ? 'SUBTLE_LAYERING' : 'FLAT_PRINT',
    attachmentBehavior: profile.constructionMode === 'LAYERED_INSERT' ? 'TAPE' : 'NONE',
    markingBehavior: 'ANNOTATED',
    printingBehavior: profile.printScan,
    scanningBehavior: profile.printScan,
    shadowBehavior: profile.constructionMode === 'LAYERED_INSERT' ? 'LAYER' : 'NONE',
    wearBehavior: profile.edge === 'WORN' ? 'MODERATE' : 'LIGHT',
    handlingEvidence: ['NDX worked this page after initial composition'],
  };
}

export function buildArtBoardDirectionContract(params: {
  projectId: string;
  artifact: BrandMarketingArtifact;
  v22Contract: CharacterRetainedFirstSlideContract;
}): ArtBoardDirectionContract {
  const topicIndex = parseInt(params.artifact.id.replace('bma-exp01-', ''), 10);
  const profile = TOPIC_MATERIAL_PROFILES[topicIndex] ?? TOPIC_MATERIAL_PROFILES[1]!;
  const { primary, secondary } = buildArtifactLayers({ topicIndex, profile });
  const materialitySystem = buildMaterialitySystem(profile);
  const canvasObject = buildCanvasObjectContract({
    artifactId: params.artifact.id,
    topicIndex,
    profile,
  });
  const constructionHistory = buildConstructionHistory({
    topicIndex,
    primaryHook: params.v22Contract.primaryHook,
  });
  const attachmentLogic = buildAttachmentLogic({ topicIndex });

  const contract: ArtBoardDirectionContract = {
    id: `abd-${params.artifact.id}`,
    projectId: params.projectId,
    artifactId: params.artifact.id,
    materialitySystem,
    canvasObject,
    artifactForm: profile.artifactForm,
    pageConstructionMode: profile.constructionMode,
    constructionHistory,
    primaryLayer: primary,
    secondaryLayers: secondary,
    attachmentLogic,
    edgeBehavior: profile.edge,
    depthBehavior: canvasObject.physicalDepth,
    surfaceImperfection: 'canvas participates — not neutral background',
    visualAnchor: params.v22Contract.culturalParticipation.visualSubjectMatterDecision.culturalVisualSubject,
    materialAnchor: profile.baseSurface,
    typographySurfaceInteraction: [
      'DISPLAY prints directly on page stock',
      'may bleed off edge or cross fold',
      'HUMAN_TRACE may sit on tape or annotate photo',
    ],
    imageSurfaceInteraction: [
      params.v22Contract.culturalParticipation.visualSubjectMatterDecision.imageHero
        ? 'image mounted as insert or printed on page — not floating card'
        : 'typography-dominant — image deferred',
    ],
    evidenceSurfaceInteraction: attachmentLogic.length
      ? ['evidence attached with causal mechanism — not UI box']
      : ['evidence embedded in source artifact'],
    controlledBreaks: params.v22Contract.characterRetention.controlledMisbehavior.map((m) => m.causality),
    whyThisArtBoard: profile.why,
    whyNotCleanTemplate: profile.whyNotTemplate,
    mustPreserve: ['P0.5C.1 hierarchy', 'P0.5C.3 character beat', 'uppercase governance'],
    mustAvoid: ['poster-on-background', 'fake texture filter', 'scrapbook collapse'],
    modernNotebookExpression: profile.modernNotebook ? buildModernNotebookExpression() : null,
    fingerprint: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  contract.fingerprint = fp(contract);
  return contract;
}

export function attachmentRequiresCausality(mechanism: ArtifactAttachment, causality: string): boolean {
  if (mechanism === 'NONE') return true;
  return Boolean(causality && causality.length > 15 && !causality.includes('looks editorial'));
}

export function tornPaperOptional(tear: TornEdgeBehavior): boolean {
  return tear === 'NONE';
}

export function notebookOptional(mode: PageConstructionMode): boolean {
  return mode !== 'OPEN_NOTEBOOK' && mode !== 'BOUND_PAGE';
}

export function materialSeparateFromBackgroundTexture(): true {
  return true;
}

export function canvasModeledAsObject(canvas: CanvasObjectContract): boolean {
  return Boolean(canvas.whyThisCanvas && canvas.constructionLogic);
}

export function sparseMayBeMateriallyRich(textDensity: string, materialDensity: string): boolean {
  return (textDensity === 'SPARSE' || textDensity === 'MINIMAL') && (materialDensity === 'RICH' || materialDensity === 'MODERATE');
}
