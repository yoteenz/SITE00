/** P0.VR.DESIGNBENCH.GROK1 — isolated Grok visual translation lab. */

export const P0_VR_DESIGNBENCH_GROK1_BUILD = 'v485' as const;
export const P0_VR_DESIGNBENCH_GROK1_LINEAGE = 'P0.VR.DESIGNBENCH.GROK1' as const;
export const P0_VR_DESIGNBENCH_GROK1F1_LINEAGE = 'P0.VR.DESIGNBENCH.GROK1F1' as const;
export const P0_VR_DESIGNBENCH_GROK1F2_LINEAGE = 'P0.VR.DESIGNBENCH.GROK1F2' as const;
export const GROK_TWIN_TEST_A_PRODUCTION_API_ORIGIN = 'https://api.site00.com' as const;

export const GROK_TWIN_TEST_A_ROUTE_PATH = '/projects/:projectSlug/design/twin-testA' as const;
export const GROK_TWIN_TEST_A_HEADER = 'TWIN DESIGN BENCHMARK' as const;
export const GROK_TWIN_TEST_A_SUBHEADER = 'TEST A · GROK' as const;
export const GROK_TWIN_TEST_A_MODEL = 'GROK' as const;
export const GROK_TWIN_TEST_A_MODEL_LABEL = 'GROK 4.6' as const;
export const GROK_TWIN_TEST_A_PROVIDER = 'xai' as const;
export const GROK_TWIN_TEST_A_PROVIDER_LABEL = 'xAI' as const;
export const GROK_TWIN_TEST_A_PROVIDER_MODEL = 'grok-4.6' as const;

export const GROK_TWIN_TEST_A_STORAGE_PREFIX = 'site00:twin-test-a:' as const;
export const GROK_TWIN_TEST_A_STORAGE_KEY = 'site00:twin-test-a:v1:latestRun' as const;
export const GROK_TWIN_TEST_A_HISTORY_KEY = 'site00:twin-test-a:v1:durationHistory' as const;

export const GROK_TWIN_TEST_A_API_PATH = '/api/site00/twin-test-a-design-bench' as const;

export const GROK_TWIN_TEST_A_ACCEPTED_MIMES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const GROK_TWIN_TEST_A_ACCEPTED_EXT = ['.png', '.jpg', '.jpeg', '.webp'] as const;
export const GROK_TWIN_TEST_A_MAX_BYTES = 18 * 1024 * 1024;

export const GROK_TWIN_TEST_A_DEFAULT_ETA_MS = 90_000;

export const GROK_TWIN_TEST_A_FORBIDDEN_STORAGE_PREFIXES = [
  'site00:twin-test-b:',
  'site00:twin-v4:',
  'site00:twin-v41:',
  'site00:twin-v42:',
  'site00:mobile-twin-implementation-cache:',
  'site00:mobile-twin-pipeline:',
  'site00:sol-design-bench:',
] as const;

export const GROK_TWIN_TEST_A_FORBIDDEN_IMPORT_FRAGMENTS = [
  'p0vrTwinV30/',
  'p0vrTwinV40/',
  'p0vrTwinV41/',
  'p0vrTwinV42/',
  'solTwinTestB',
  'solDesignBench',
  'DesignTwinImplementationPage',
  'DesignTwinV4ProofPage',
  'invokeComposer',
  'composerAgent',
] as const;

export const GROK_JOB_STAGES = [
  'IDLE',
  'UPLOADING',
  'QUEUED',
  'INGESTING_REFERENCE',
  'ANALYZING_VISUAL',
  'DECOMPOSING_LAYOUT',
  'BUILDING_DESIGN_SYSTEM',
  'BUILDING_COMPONENT_SPEC',
  'RENDERING_VISUAL_TRANSLATION',
  'BUILDING_HANDOFF',
  'FINALIZING',
  'COMPLETE',
  'FAILED',
] as const;

export const GROK_ACTIVE_STAGES = [
  'QUEUED',
  'INGESTING_REFERENCE',
  'ANALYZING_VISUAL',
  'DECOMPOSING_LAYOUT',
  'BUILDING_DESIGN_SYSTEM',
  'BUILDING_COMPONENT_SPEC',
  'RENDERING_VISUAL_TRANSLATION',
  'BUILDING_HANDOFF',
  'FINALIZING',
] as const;

export const GROK_STAGE_PROGRESS: Record<string, number> = {
  IDLE: 0,
  UPLOADING: 4,
  QUEUED: 8,
  INGESTING_REFERENCE: 14,
  ANALYZING_VISUAL: 28,
  DECOMPOSING_LAYOUT: 42,
  BUILDING_DESIGN_SYSTEM: 56,
  BUILDING_COMPONENT_SPEC: 68,
  RENDERING_VISUAL_TRANSLATION: 80,
  BUILDING_HANDOFF: 90,
  FINALIZING: 96,
  COMPLETE: 100,
  FAILED: 0,
};

export const GROK_STAGE_LABELS: Record<string, string> = {
  IDLE: 'Waiting for reference…',
  UPLOADING: 'Uploading reference…',
  QUEUED: 'Queued for Grok…',
  INGESTING_REFERENCE: 'Ingesting frozen reference…',
  ANALYZING_VISUAL: 'Analyzing visual hierarchy…',
  DECOMPOSING_LAYOUT: 'Decomposing layout geometry…',
  BUILDING_DESIGN_SYSTEM: 'Building design system…',
  BUILDING_COMPONENT_SPEC: 'Building component spec…',
  RENDERING_VISUAL_TRANSLATION: 'Rendering visual translation…',
  BUILDING_HANDOFF: 'Building implementation handoff…',
  FINALIZING: 'Finalizing Figma-style package…',
  COMPLETE: 'Complete',
  FAILED: 'Failed',
};

export const FIGMA_STYLE_PACKAGE_KEYS = [
  'visualInterfacePreview',
  'pageFrameSpec',
  'sectionTree',
  'componentTree',
  'layoutGeometrySpec',
  'typographySystem',
  'colorSystem',
  'spacingSystem',
  'borderRadiusSurfaceSystem',
  'assetPlacementMap',
  'controlStateSystem',
  'visualHierarchyMap',
  'implementationHandoff',
  'doNotChangeRules',
] as const;
