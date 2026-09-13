import { NDXBOOK_LIME, SITE00_HOST_RED } from '../activeProjectExpressionContract.js';
import { DESIGN_PAGE_V3_PILOT_PROJECT_ID } from '../constants.js';
import { getDesignWorkspaceFunctionContract } from './designWorkspaceFunctionContract.js';
import type {
  ProjectArtifactVocabulary,
  ProjectAssetSourceMap,
  ProjectCreativeContextPackage,
  ProjectCreativeDNA,
  ProjectMaterialLanguage,
  ProjectSymbolicLanguage,
  ProjectTypographyExpression,
  ProjectVisualLanguage,
  ProjectWorkspaceExpressionContract,
} from './types.js';
import { PROJECT_CREATIVE_CONTEXT_VERSION } from './types.js';

const NDXBOOK_DNA: ProjectCreativeDNA = {
  projectPurpose:
    'Cultural intelligence / creative intelligence system — editorial, investigative, archival, culture-observant, idea-driven.',
  projectPremise:
    'NDXBOOK indexes culture and ideas as evidence — not a reading tracker, library app, or generic magazine product.',
  projectAudience: 'Founder-led cultural operators, editorial strategists, and creative intelligence readers.',
  projectTone: 'Investigative editorial · systematic · high-contrast · evidence-forward.',
  emotionalRegister: 'Curious, precise, culturally literate — never cozy SaaS or bookstore retail.',
  creativeRisk: 'Medium-high — expressive typography and archival material inside workspace; host stays SITE 00.',
  visualDensity: 'Moderate-high in workspace artifact zones; host shell stays quiet.',
  editorialVsProductBalance: '70% editorial intelligence / 30% product chrome inside workspace.',
  abstractionLevel: 'Concrete artifacts (receipts, index cards, campaign frames) over abstract decoration.',
  rawness: 'Archival/document rawness allowed; not gritty for its own sake.',
  polish: 'Commissioned-editorial polish on hero artifacts; systematic labels and index marks.',
  culturalPosition: 'Culture-observant documentation — not luxury lifestyle or generic creative director moodboard.',
  worldview: 'Ideas are filed, cross-referenced, and argued visually.',
  narrativeBehavior: 'Visual argument + catalog structure; sequences and packages, not random hero images.',
  founderCreativeAppetite: 'Strong NDXBOOK identity inside workspace; SITE 00 architecture non-negotiable.',
  brandTruths: [
    'NOT a generic book brand',
    'NOT a library app or reading tracker',
    'NOT a productivity dashboard',
    'NOT random magazine UI',
    'Indexing, annotation, receipts, archival material, cultural evidence',
    'NDXBOOK lime is project accent — not host system color',
  ],
  nonNegotiables: [
    'Use NDXBOOK artifact families (entry/campaign covers, story frames, cultural receipts, index cards)',
    'No random book covers, portraits, architecture, or luxury objects without project grounding',
    'SITE 00 host shell remains distinct from NDXBOOK atmosphere',
  ],
};

const NDXBOOK_ARTIFACT_VOCABULARY: ProjectArtifactVocabulary = {
  projectId: DESIGN_PAGE_V3_PILOT_PROJECT_ID,
  version: 'ndxbook-artifacts-r4-v1',
  entries: [
    artifact('ENTRY_COVER', 'Entry cover', 'Entry-level cover slide / campaign entry frame', ['PRIMARY_WORKSPACE', 'COMPARE']),
    artifact('CAMPAIGN_COVER', 'Campaign cover', 'Campaign package cover authority', ['PRIMARY_WORKSPACE']),
    artifact('CAROUSEL_FRAME', 'Carousel frame', 'Instagram carousel slide from entry package', ['STRUCTURED_OUTPUT', 'COMPARE']),
    artifact('STORY_FRAME', 'Story frame', 'Story sequence frame', ['STRUCTURED_OUTPUT']),
    artifact('REEL_FRAME', 'Reel frame', 'Reel cover / motion key surface', ['PRIMARY_WORKSPACE']),
    artifact('STORYBOARD', 'Storyboard', 'Sequence board for narrative proof', ['STRUCTURED_OUTPUT']),
    artifact('CINEMATIC_KEYFRAME', 'Cinematic keyframe', 'Film/documentary still when project-valid', ['PRIMARY_WORKSPACE']),
    artifact('CULTURAL_RECEIPT', 'Cultural receipt', 'Receipt-like evidence object — indexing metaphor', ['PRIMARY_WORKSPACE', 'WORKBENCH']),
    artifact('ANNOTATED_COPY', 'Annotated copy', 'Margin notes / annotated document fragment', ['WORKBENCH']),
    artifact('INDEX_CARD', 'Index card', 'Catalog/index card with systematic label', ['WORKBENCH', 'PIPELINE']),
    artifact('ARCHIVAL_EVIDENCE', 'Archival evidence', 'Archival document / cross-reference still life', ['PRIMARY_WORKSPACE']),
    artifact('EDITORIAL_TYPOGRAPHIC_FRAME', 'Editorial typographic frame', 'Type-led editorial moment inside workspace', ['WORKBENCH']),
    artifact('CREATIVE_CONCEPT_TERRITORY', 'Creative concept territory', 'Territory specimen from CD pipeline', ['COMPARE']),
    artifact('WORLD_EXPRESSION_SYSTEM', 'World expression system', 'World/expression system preview', ['SECONDARY_DETAIL']),
    artifact('PRODUCTION_AUTHORITY', 'Production authority', 'Approved production authority thumbnail', ['COMPARE', 'READINESS']),
    artifact('SEQUENCE_BOARD', 'Sequence board', 'Downstream sequence layout', ['STRUCTURED_OUTPUT']),
    artifact('DOWNSTREAM_DERIVATIVE', 'Downstream derivative', 'Social format translation preview', ['STRUCTURED_OUTPUT']),
    artifact('CAMPAIGN_PACKAGE', 'Campaign package', 'Bundled campaign package tray', ['STRUCTURED_OUTPUT']),
    artifact('SOCIAL_FORMAT_TRANSLATION', 'Social format translation', 'Format-specific derivative frame', ['STRUCTURED_OUTPUT']),
  ],
};

function artifact(
  artifactType: string,
  name: string,
  description: string,
  allowedContexts: string[],
): ProjectArtifactVocabulary['entries'][number] {
  return {
    artifactType,
    name,
    description,
    allowedContexts,
    visualTreatment: 'Editorial high-contrast; lime markers on project surfaces only',
    preferredAspectRatios: ['4:5', '9:16', '16:9', '1:1'],
    framingRules: 'Artifact-forward; no stock-photo framing; no random portrait crop',
    surfaceRules: 'Layer/stack/filmstrip — not uniform white SaaS cards',
    allowedSources: ['APPROVED_PROJECT_ASSET', 'CAMPAIGN_ARTIFACT', 'PROJECT_REFERENCE', 'PROJECT_VALID_PLACEHOLDER'],
    generationAllowed: true,
    placeholderAllowed: true,
    status: 'APPROVED',
  };
}

const NDXBOOK_ASSET_SOURCE_MAP: ProjectAssetSourceMap = {
  projectId: DESIGN_PAGE_V3_PILOT_PROJECT_ID,
  version: 'ndxbook-sources-r4-v1',
  sources: [
    {
      sourceId: 'entry001-campaign-archive',
      sourceType: 'CAMPAIGN_ARTIFACT',
      label: 'Entry 001 campaign package (carousel, story, entry cover)',
      pathOrRef: '/assets/ndxbook/entry-001',
      artifactTypes: ['ENTRY_COVER', 'CAROUSEL_FRAME', 'STORY_FRAME', 'CAMPAIGN_PACKAGE'],
      priority: 1,
    },
    {
      sourceId: 'ndxbook-cd-generated-index-signal',
      sourceType: 'GENERATED_PROJECT_ASSET',
      label: 'Creative direction index_signal assets (manifest)',
      pathOrRef: 'api/_lib/site00Evolve/creativeDirection/generatedAssets/ndxbook.assets.json',
      artifactTypes: ['ARCHIVAL_EVIDENCE', 'INDEX_CARD', 'CULTURAL_RECEIPT'],
      priority: 2,
    },
    {
      sourceId: 'ndxbook-cd-boards',
      sourceType: 'PRIOR_CONCEPT_AUTHORITY',
      label: 'Creative direction boards manifest',
      pathOrRef: 'api/_lib/site00Evolve/creativeDirection/generatedAssets/ndxbook.creativeDirectionBoards.json',
      artifactTypes: ['CREATIVE_CONCEPT_TERRITORY', 'EDITORIAL_TYPOGRAPHIC_FRAME'],
      priority: 2,
    },
    {
      sourceId: 'ndxbook-handoff-canon',
      sourceType: 'PROJECT_REFERENCE',
      label: 'NDXBOOK SITE00 handoff canon',
      pathOrRef: 'docs/studio-world/ndxbook/NDXBOOK_SITE00_HANDOFF.md',
      artifactTypes: ['WORLD_EXPRESSION_SYSTEM', 'PRODUCTION_AUTHORITY'],
      priority: 3,
    },
    {
      sourceId: 'ndxbook-valid-placeholder-cultural-evidence',
      sourceType: 'PROJECT_PLACEHOLDER',
      label: 'Project-valid cultural-evidence placeholder spec',
      pathOrRef: 'placeholder:ndxbook-cultural-evidence-v1',
      artifactTypes: ['CULTURAL_RECEIPT', 'ARCHIVAL_EVIDENCE', 'ANNOTATED_COPY'],
      priority: 4,
    },
  ],
};

const NDXBOOK_VISUAL: ProjectVisualLanguage = {
  primaryPalette: ['#0a0a0a', '#ffffff', '#f5f5f0'],
  accentPalette: [NDXBOOK_LIME, '#e8e8e0'],
  contrastBehavior: 'Black/white editorial contrast in workspace; host stays bright',
  surfaceBehavior: 'Dark project surfaces where appropriate inside workspace — never full-host black takeover',
  imageTreatment: 'Document/archive rhythm; mono/high-contrast photography when project-valid',
  graphicTreatment: 'Index/label structures, lime markers, underlines, receipt language',
  lineLanguage: 'Systematic rules, index rails, annotation marks',
  spacingRhythm: 'Catalog/index spacing — not generic dashboard gutters',
  compositionTendency: 'Dominant artifact stage + quiet workflow spine',
  density: 'Moderate-high artifact density; host chrome low',
  materialBehavior: 'Paper, archival document, screen overlay, annotation',
  motionBehavior: 'Static mockup — implied sequence via storyboard/filmstrip',
  visualMotifs: ['index numerals', 'cross-reference thread', 'margin marks', 'lime selection', 'receipt edges'],
  forbiddenMotifs: [
    'library shelves',
    'bookstore UI',
    'random book covers',
    'generic business portraits',
    'random architecture hero',
    'luxury chrome 3D',
    'invented NDXBOOK logos',
    'generic creative moodboard clutter',
  ],
};

const NDXBOOK_TYPO: ProjectTypographyExpression = {
  hostTypography: 'Martian Mono — SITE 00 host / system / compiler / breadcrumbs',
  projectTypography: 'NDXBOOK expressive editorial type inside workspace panels only',
  allowedMixing: 'Do not force one family across host and project layers',
  displayBehavior: 'High-contrast typographic moments in workspace hero zones',
  editorialBehavior: 'Index labels, metadata lines, cultural-evidence captions — uppercase casing',
  metadataBehavior: 'Quiet systematic labels — not SaaS table headers',
  uiCaseRule: 'ALL visible SITE 00 + design-workspace UI text uppercase',
  allPagesCaseRule:
    'Every page/route/surface shown in the mockup (PAGES nav, previews, secondary canvases) uses the same uppercase UI casing',
};

const NDXBOOK_MATERIAL: ProjectMaterialLanguage = {
  allowedMaterials: [
    'paper / archival document',
    'screen / interface overlay',
    'annotation layers',
    'film / documentary stills (project-valid)',
    'mono / high-contrast photography (project-valid)',
    'index / receipt / margin marks',
  ],
  allowedTextures: ['uncoated paper grain', 'matte card stock', 'light table glow', 'editorial still-life surface'],
  allowedImageProcesses: ['macro archival photography', 'commissioned editorial still life', 'high-contrast mono'],
  allowedEffects: ['lime underline', 'index stamp', 'cross-reference thread', 'margin highlight'],
  forbiddenMaterials: ['random glossy 3D', 'luxury chrome', 'generic product photography'],
  forbiddenEffects: ['lens flare HUD overlays', 'stock photo filters', 'random gradient SaaS blobs'],
};

const NDXBOOK_SYMBOLIC: ProjectSymbolicLanguage = {
  allowedSymbols: ['index tab', 'receipt', 'annotation mark', 'catalog number', 'cross-reference line', 'lime marker'],
  forbiddenSymbols: ['generic lightbulb idea icon', 'random book icon', 'library glyph', 'shopping bag', 'chart-up SaaS icon'],
  meaningMap: {
    'index tab': 'Catalogued cultural knowledge',
    'receipt': 'Evidence / cultural receipt',
    'lime marker': 'Active NDXBOOK selection — not host error',
    'cross-reference line': 'Linked ideas across campaign system',
  },
};

const NDXBOOK_WORKSPACE_EXPRESSION: ProjectWorkspaceExpressionContract = {
  projectAccentUsage: `${NDXBOOK_LIME} on selected artifacts, status, workspace highlights only`,
  projectSurfaceUsage: 'Dark editorial fields inside primary workspace — host frame off-white',
  artifactFrameBehavior: 'Layers, stacks, filmstrips, trays per NDXBOOK artifact vocabulary',
  activeSelectionBehavior: 'Lime-forward selection rail inside workspace',
  projectTypographyUsage: 'Expressive type in artifact zones; host labels stay Martian Mono',
  projectImageUsage: 'Only NDXBOOK artifact families or approved sources — no random decoration',
  projectStatusUsage: 'Project readiness chips use lime; host errors use SITE 00 red',
  projectInteractionHighlight: 'Lime underline / label for active inspect targets',
  hostBoundaries: [
    'SITE 00 global nav',
    'host account controls',
    'breadcrumb language',
    'SITE 00 global identity',
    'host system errors',
    'host system warning color',
    'compiler system semantics',
  ],
  status: 'READY',
};

/** Shared artifact family for all territories A/B/C — spatial composition differs, content family stays NDXBOOK-true. */
export const NDXBOOK_TERRITORY_SHARED_ARTIFACT_FAMILY = [
  'CULTURAL_RECEIPT',
  'INDEX_CARD',
  'ENTRY_COVER',
  'CAROUSEL_FRAME',
  'ARCHIVAL_EVIDENCE',
  'ANNOTATED_COPY',
] as const;

export function buildNdxbookProjectCreativeContextPackage(): ProjectCreativeContextPackage {
  const functionContract = getDesignWorkspaceFunctionContract();
  void functionContract;
  return {
    projectId: DESIGN_PAGE_V3_PILOT_PROJECT_ID,
    projectName: 'NDXBOOK',
    projectType: 'CULTURAL_INTELLIGENCE_EDITORIAL',
    creativeDNA: NDXBOOK_DNA,
    artifactVocabulary: NDXBOOK_ARTIFACT_VOCABULARY,
    visualLanguage: NDXBOOK_VISUAL,
    typographyExpression: NDXBOOK_TYPO,
    paletteSystem: {
      host: ['#ffffff', '#0a0a0a', SITE00_HOST_RED],
      project: [NDXBOOK_LIME, '#0a0a0a', '#ffffff'],
      system: ['#888880', '#f5f5f0'],
    },
    materialLanguage: NDXBOOK_MATERIAL,
    imageLanguage:
      'Cultural evidence, campaign artifacts, index/archive photography — never random editorial stock.',
    symbolicLanguage: NDXBOOK_SYMBOLIC,
    contentLanguage: 'Investigative editorial labels, index metadata, campaign package naming',
    interactionExpression: 'Inspect/compare/approve/regenerate mapped to real workspace jobs',
    workspaceExpression: NDXBOOK_WORKSPACE_EXPRESSION,
    doRules: [
      'Use NDXBOOK artifact vocabulary types in every major visual region',
      'Prefer approved entry/campaign assets and CD manifest references',
      'Keep territories A/B/C on the same artifact family — vary spatial composition only',
      'Show design workspace jobs (compare, approve, inspect blueprint, readiness)',
    ],
    dontRules: [
      'Do not generate bookstore UI, library shelves, reading app patterns',
      'Do not insert random book covers, portraits, architecture, luxury objects',
      'Do not invent NDXBOOK logos',
      'Do not fill gaps with generic premium SaaS or creative moodboard items',
      'Do not turn entire SITE 00 host shell black',
      'Do not use NDXBOOK lime for host errors or global nav',
    ],
    assetSourceMap: NDXBOOK_ASSET_SOURCE_MAP,
    approvedReferences: [
      'Entry 001 campaign package assets',
      'ndxbook.assets.json index_signal / editorial_utility',
      'Creative direction boards manifest',
      'NDXBOOK SITE00 handoff canon',
    ],
    knownProjectArtifacts: [
      'entry001-archive-10-entry-cover-slide',
      'index_signal:page_001_indexed',
      'index_signal:cross_reference_map',
      'editorial_utility:page_001_editorial',
    ],
    brandTruths: NDXBOOK_DNA.brandTruths,
    projectNarrative:
      'NDXBOOK is a cultural intelligence system expressed through indexing, annotation, receipts, and campaign artifact packages — hosted inside SITE 00 design workspace.',
    status: 'READY',
    version: PROJECT_CREATIVE_CONTEXT_VERSION,
  };
}
