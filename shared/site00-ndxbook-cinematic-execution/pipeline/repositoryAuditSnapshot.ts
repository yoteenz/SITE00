/**
 * Point-in-time forensic snapshot of NDXBOOK cinematic pipeline (main @ sprint start).
 * Update when wiring changes — do not treat as runtime discovery service.
 */

export const NDXBOOK_PIPELINE_AUDIT_SNAPSHOT = {
  auditedAt: '2026-10-21',
  baseBranch: 'main',
  ndxbookPipelineFound: true,
  expressionRoute: '/production/:projectSlug/expression',
  libraryRoute: '/production/:projectSlug/library',
  campaignModel: 'shared/site00-expression-engine/campaignClientTypes.ts + api/_lib/site00ExpressionEngine/*',
  shotModel: 'api/_lib/site00ExpressionEngine/entry002ReelShotPlan.ts + final cinematic panel manifest',
  storyboardModel: 'api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboard*.ts',
  assetRegistry: 'public/assets/expression-engine/entry-002/* + ASSTS storage paths in provenance records',
  providerAbstraction: 'shared/site00-production-guardrails/providerGateway + fal-kling in expression engine',
  roughCutPipeline: 'shared/site00-studio-world-production/filmProduction/edit/editTemplateEngine.ts',
  wired: [
    'Expression engine API (api/site00/expression-engine.ts) — Entry 002 bootstraps B41–B46',
    'FAL dispatch for stills / storyboard / cinematic sequence contact sheets',
    'Production provider gateway with spend authorization + reference binding guardrails',
    'Cinematic Realism Lab (shared/site00-studio-world-production/cinematicRealismLab) — experiment orchestration',
    'Character continuity pipeline generation capability map (fal kling v1.6 endpoints)',
    'Film production rough cut representation (blocked render states honest)',
  ],
  mockedOrSimulated: [
    'cinematic_realism_lab_simulate_outputs — simulated lane outputs',
    'Production hub node thumbnails — webp placeholders under public/site00/production-hub/',
  ],
  brokenOrStale: [
    'Final storyboard manifest IDs (004) vs on-disk panel filenames (002)',
    'Reel keyframe authoritative paths not present in repo public tree',
    'klingBlocked: true across Entry 002 reel/cinematic bootstrap flags',
  ],
  notImplemented: [
    'Artlist / Kling 4.0 automated adapter in production API',
    'Reference upload to Artlist before generation',
    'Video output import + contact sheet from real Kling 4 renders',
  ],
  featureFlags: [
    'NDXBOOK_KLING4_EXECUTION_ENABLED (this sprint — default false)',
    'Entry 002 motion gates in expression bootstraps (klingBlocked, videoGenerationBlocked)',
  ],
  productionCapableToday: [
    'Still/image storyboard generation via FAL when FAL_KEY present and gates open',
    'Manual founder assets served from public/assets/expression-engine/entry-002/',
    'Reference binding precheck for JURNL / production guardrails path',
  ],
} as const;

export const NDXBOOK_PRODUCTION_FLOW_ORDER = [
  'COVER',
  'REEL_TREATMENT',
  'FIVE_PRE_STORYBOARD_VISUAL_AUTHORITIES',
  'FOUNDER_APPROVAL_PRE_STORYBOARD',
  'FINAL_CINEMATIC_STORYBOARD',
  'FOUNDER_APPROVAL_STORYBOARD',
  'KEYFRAMES',
  'VIDEO_GENERATION',
  'ROUGH_CUT',
  'FINAL_REEL',
  'SOCIAL_DERIVATIVES',
  'CAMPAIGN_BOARD',
] as const;
