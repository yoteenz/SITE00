/**
 * Expression Engine V0 — ENTRY 001 forensic reconstruction.
 * Uses sprint canon + existing code references; marks LEGACY_UNTRACKED where no receipts exist.
 */

import { randomUUID } from 'node:crypto';
import {
  ENTRY_001_NUMBER,
  ENTRY_001_SUBJECT,
  ENTRY_001_TITLE,
  NDXBOOK_PROOF_BRAND_ID,
  NDXBOOK_PROOF_PROJECT_KEY,
} from '../../../shared/site00-expression-engine/constants.js';
import { compileAllFormatExpressions } from '../../../shared/site00-expression-engine/formatContracts.js';
import type {
  AudioPlan,
  ContinuityGraph,
  CreativeEntry,
  CreativeObjective,
  EntryArtifact,
  ExpressionProductionPlan,
  PlatformTranslation,
} from '../../../shared/site00-expression-engine/types.js';
import { createLegacyUntrackedReceipt } from './lineageRegistration.js';
import { routeProductionTool } from './productionRouting.js';

export const ENTRY_001_TERRITORY_ID = 'ndxbook-entry-001-broadcast-spectatorship';
export const ENTRY_001_WORLD_ID = 'ndxbook-world-broadcast-interruption';

export function resolveEntry001Objective(): CreativeObjective {
  return {
    objectiveId: 'obj-entry-001',
    brandId: NDXBOOK_PROOF_BRAND_ID,
    projectId: NDXBOOK_PROOF_PROJECT_KEY,
    title: ENTRY_001_TITLE,
    thesis:
      'Current discourse says "WE OWE BRITNEY AN APOLOGY." NDXBOOK challenges the collective pronoun: WHO IS "WE"?',
    subject: ENTRY_001_SUBJECT,
    audienceFrame: 'Public culture participates in ridicule then rewrites as sympathetic observers',
    createdAt: '2026-03-01T00:00:00.000Z',
  };
}

export function buildEntry001Artifact(): EntryArtifact {
  return {
    artifactId: 'artifact-entry-001-vintage-tv',
    entryId: 'entry-001',
    type: 'VINTAGE_BOX_TELEVISION',
    symbolicRole: 'media / spectatorship / broadcast culture / watching a person become content',
    visualBrief:
      'Vintage box television as hero artifact; lime NDXBOOK accent as controlled restraint; not generic brand template',
    continuityRole: 'COVER hero + HIGHLIGHT filing identity + reel TV shutoff beat',
    formatUsage: ['COVER', 'HIGHLIGHT', 'REEL'],
    entrySpecific: true,
  };
}

export function buildEntry001ContinuityGraph(): ContinuityGraph {
  return {
    graphId: 'cg-entry-001',
    entryId: 'entry-001',
    nodes: [
      { nodeId: 'char-ndx-woman', kind: 'CHARACTER', label: 'NDX WOMAN', description: 'Mysterious Black NDX woman — lime satin slip, same identity across reel shots', formatRefs: ['REEL', 'TIKTOK'], authoritative: true },
      { nodeId: 'env-penthouse', kind: 'ENVIRONMENT', label: 'LUXURY NYC PENTHOUSE', description: 'Penthouse/home ambience family', formatRefs: ['REEL'], authoritative: true },
      { nodeId: 'obj-vintage-tv', kind: 'OBJECT_ARTIFACT', label: 'VINTAGE TV', description: 'ENTRY 001 cover hero artifact', formatRefs: ['COVER', 'REEL', 'HIGHLIGHT'], authoritative: true },
      { nodeId: 'pal-lime', kind: 'PALETTE', label: 'LIME ACCENT', description: 'Restrained brand accent — not dominant field', formatRefs: ['REEL', 'CAROUSEL', 'COVER', 'STORY'], authoritative: true },
      { nodeId: 'typ-ndxbook', kind: 'TYPOGRAPHY', label: 'NDXBOOK EDITORIAL TYPE', description: 'Condensed display + margin annotation hierarchy', formatRefs: ['CAROUSEL', 'STORY', 'COVER', 'X'], authoritative: true },
      { nodeId: 'gram-broadcast', kind: 'WORLD_GRAMMAR', label: 'BROADCAST INTERRUPTION', description: 'Channel surf → news segment → distorted WE language', formatRefs: ['REEL', 'CAROUSEL'], authoritative: true },
      { nodeId: 'nar-thesis', kind: 'NARRATIVE_STATE', label: 'WHO TF IS WE?', description: 'Thesis carried across all formats', formatRefs: ['REEL', 'CAROUSEL', 'STORY', 'CTA_STORY', 'COVER', 'TIKTOK', 'X'], authoritative: true },
      { nodeId: 'seq-reel-arc', kind: 'SEQUENCE_STATE', label: 'REEL ARC', description: 'TV shutoff → phone transition → NEW ENTRY INCOMING → ENTRY 002 tease', formatRefs: ['REEL'], authoritative: true },
    ],
    edges: [
      { fromNodeId: 'char-ndx-woman', toNodeId: 'env-penthouse', relationship: 'character inhabits environment' },
      { fromNodeId: 'obj-vintage-tv', toNodeId: 'gram-broadcast', relationship: 'artifact enables broadcast grammar' },
      { fromNodeId: 'nar-thesis', toNodeId: 'gram-broadcast', relationship: 'thesis expressed through broadcast interruption' },
      { fromNodeId: 'pal-lime', toNodeId: 'char-ndx-woman', relationship: 'accent on character wardrobe/props' },
      { fromNodeId: 'seq-reel-arc', toNodeId: 'nar-thesis', relationship: 'arc delivers thesis payoff' },
    ],
  };
}

export function buildEntry001AudioPlan(): AudioPlan {
  const reelRoute = routeProductionTool({ taskClass: 'TTS_DIALOGUE', format: 'REEL', brandId: NDXBOOK_PROOF_BRAND_ID, entryId: 'entry-001' });
  const sfxRoute = routeProductionTool({ taskClass: 'SOUND_EFFECT', format: 'REEL', brandId: NDXBOOK_PROOF_BRAND_ID, entryId: 'entry-001' });

  return {
    planId: 'audio-entry-001',
    entryId: 'entry-001',
    requiredForFormats: ['REEL', 'TIKTOK'],
    status: 'LEGACY_PARTIAL',
    layers: [
      { layerId: 'a1', type: 'AMBIENCE', purpose: 'Penthouse/home ambience', timingRelationship: 'bed throughout opening', generatorClass: 'SOUND_EFFECT', sourceState: 'LEGACY_UNTRACKED', continuityRequirement: 'env-penthouse', mixPriority: 1 },
      { layerId: 'a2', type: 'FOLEY', purpose: 'Candle flicker, remote click', timingRelationship: 'sync to character action', generatorClass: 'SOUND_EFFECT', sourceState: 'LEGACY_UNTRACKED', continuityRequirement: 'char-ndx-woman', mixPriority: 3 },
      { layerId: 'a3', type: 'BROADCAST_AUDIO', purpose: 'Television channel audio — Food Network, news', timingRelationship: 'during channel surf', generatorClass: 'SOUND_EFFECT', sourceState: 'LEGACY_UNTRACKED', continuityRequirement: 'gram-broadcast', mixPriority: 4 },
      { layerId: 'a4', type: 'DIALOGUE_VO', purpose: 'Britney anchor TTS — distorted WE language', timingRelationship: 'news segment', generatorClass: 'TTS_DIALOGUE', sourceState: 'LEGACY_UNTRACKED', continuityRequirement: 'nar-thesis', mixPriority: 5 },
      { layerId: 'a5', type: 'GLITCH_TRANSITION', purpose: 'Broadcast glitches, TV shutoff', timingRelationship: 'pre-thought beat', generatorClass: 'SOUND_EFFECT', sourceState: 'LEGACY_UNTRACKED', continuityRequirement: 'seq-reel-arc', mixPriority: 6 },
      { layerId: 'a6', type: 'PHONE_UI_SOUND', purpose: 'Phone transition sounds', timingRelationship: 'post-TV shutoff', generatorClass: 'SOUND_EFFECT', sourceState: 'LEGACY_UNTRACKED', continuityRequirement: 'seq-reel-arc', mixPriority: 4 },
      { layerId: 'a7', type: 'TITLE_CARD_SOUND', purpose: 'WHO TF IS WE? title card + NEW ENTRY INCOMING', timingRelationship: 'end card', generatorClass: 'SOUND_EFFECT', sourceState: 'LEGACY_UNTRACKED', continuityRequirement: 'nar-thesis', mixPriority: 7 },
    ].map((l) => ({
      ...l,
      generatorClass: l.generatorClass,
    })),
  };
}

export function buildEntry001ProductionPlan(): ExpressionProductionPlan {
  const tasks: ExpressionProductionPlan['tasks'] = [
    { taskId: 't-reel-video', format: 'REEL', taskClass: 'VIDEO_CHARACTER_CONTINUITY', description: 'Cinematic reel — penthouse, channel surf, TV shutoff, phone transition', why: 'Primary narrative hook for ENTRY 001', continuityRefs: ['char-ndx-woman', 'env-penthouse', 'seq-reel-arc'], authoritativeReferences: ['ndx-film-bible', 'ndx-character-authority'], exactText: ['WHO TF IS WE?', 'NEW ENTRY INCOMING'], variableElements: ['channel surf ordering', 'micro-reactions'], recommendedProviders: routeProductionTool({ taskClass: 'VIDEO_CHARACTER_CONTINUITY', format: 'REEL', brandId: NDXBOOK_PROOF_BRAND_ID, entryId: 'entry-001' }).recommendedProviders, status: 'COMPLETE' },
    { taskId: 't-reel-audio', format: 'REEL', taskClass: 'TTS_DIALOGUE', description: 'Britney anchor broadcast VO', why: 'Distorted WE language in news segment', continuityRefs: ['nar-thesis', 'gram-broadcast'], authoritativeReferences: ['audio-entry-001'], exactText: ['WE owe Britney', 'WE'], variableElements: ['glitch intensity'], recommendedProviders: routeProductionTool({ taskClass: 'TTS_DIALOGUE', format: 'REEL', brandId: NDXBOOK_PROOF_BRAND_ID, entryId: 'entry-001' }).recommendedProviders, status: 'COMPLETE' },
    { taskId: 't-carousel', format: 'CAROUSEL', taskClass: 'IMAGE_GENERATION', description: 'Britney cultural argument graphics sequence', why: 'Expanded visual argument', continuityRefs: ['nar-thesis', 'typ-ndxbook', 'pal-lime'], authoritativeReferences: ['ndxbook-experiment-01-carousel'], exactText: ['WHO TF IS WE?'], variableElements: ['slide composition modes'], recommendedProviders: routeProductionTool({ taskClass: 'IMAGE_GENERATION', format: 'CAROUSEL', brandId: NDXBOOK_PROOF_BRAND_ID, entryId: 'entry-001' }).recommendedProviders, status: 'COMPLETE' },
    { taskId: 't-cover', format: 'COVER', taskClass: 'IMAGE_GENERATION', description: 'Vintage TV hero artifact cover', why: 'Entry filing symbol', continuityRefs: ['obj-vintage-tv', 'pal-lime'], authoritativeReferences: ['artifact-entry-001-vintage-tv'], exactText: ['ENTRY 001', 'WHO TF IS WE?'], variableElements: ['3D vs flat editorial exploration resolved to TV artifact'], recommendedProviders: routeProductionTool({ taskClass: 'IMAGE_GENERATION', format: 'COVER', brandId: NDXBOOK_PROOF_BRAND_ID, entryId: 'entry-001' }).recommendedProviders, status: 'COMPLETE' },
    { taskId: 't-stories', format: 'STORY', taskClass: 'TYPOGRAPHY', description: 'Margin commentary frames', why: 'Ephemeral margin layer', continuityRefs: ['typ-ndxbook', 'nar-thesis'], authoritativeReferences: [], exactText: [], variableElements: ['annotation copy'], recommendedProviders: routeProductionTool({ taskClass: 'TYPOGRAPHY', format: 'STORY', brandId: NDXBOOK_PROOF_BRAND_ID, entryId: 'entry-001' }).recommendedProviders, status: 'COMPLETE' },
    { taskId: 't-tiktok', format: 'TIKTOK', taskClass: 'EDITING', description: 'TikTok-native re-edit with faster hook', why: 'Platform translation — not reel repost', continuityRefs: ['nar-thesis', 'char-ndx-woman'], authoritativeReferences: ['t-reel-video'], exactText: ['WHO TF IS WE?'], variableElements: ['hook timing', 'comment bait'], recommendedProviders: routeProductionTool({ taskClass: 'EDITING', format: 'TIKTOK', brandId: NDXBOOK_PROOF_BRAND_ID, entryId: 'entry-001' }).recommendedProviders, status: 'PLANNED' },
    { taskId: 't-x', format: 'X', taskClass: 'TYPOGRAPHY', description: 'DROP→JOKE→RECEIPT→QUESTION→SYNTHESIS→BREADCRUMB thread', why: 'X-native live-margin behavior', continuityRefs: ['nar-thesis', 'gram-broadcast'], authoritativeReferences: [], exactText: ['WHO TF IS WE?'], variableElements: ['thread pacing'], recommendedProviders: routeProductionTool({ taskClass: 'TYPOGRAPHY', format: 'X', brandId: NDXBOOK_PROOF_BRAND_ID, entryId: 'entry-001' }).recommendedProviders, status: 'PLANNED' },
  ];

  return {
    planId: 'pp-entry-001',
    entryId: 'entry-001',
    tasks,
    status: 'IN_PRODUCTION',
    compiledAt: '2026-03-15T00:00:00.000Z',
  };
}

export function buildEntry001PlatformTranslations(): PlatformTranslation[] {
  return [
    { translationId: 'pt-ig', entryId: 'entry-001', platform: 'INSTAGRAM', sourceFormat: 'REEL', targetBehavior: 'Cinematic Reel + carousel + Stories + Highlight filing', mode: 'REGENERATE', thesisPreserved: true, requirements: ['REEL native', 'CAROUSEL argument', 'STORY margin', 'HIGHLIGHT identity'], status: 'PLANNED' },
    { translationId: 'pt-tt', entryId: 'entry-001', platform: 'TIKTOK', sourceFormat: 'REEL', targetBehavior: 'Faster hook, native pacing, reaction/cultural moment', mode: 'REEDIT', thesisPreserved: true, requirements: ['NOT automatic reel repost', 'comment-response potential'], status: 'REQUIRED' },
    { translationId: 'pt-x', entryId: 'entry-001', platform: 'X', sourceFormat: 'CAROUSEL', targetBehavior: 'DROP→JOKE→RECEIPT→QUESTION→SYNTHESIS→BREADCRUMB', mode: 'REWRITE', thesisPreserved: true, requirements: ['thread-native', 'receipt behavior'], status: 'REQUIRED' },
  ];
}

export function reconstructEntry001(): CreativeEntry {
  const objective = resolveEntry001Objective();
  const formatExpressions = compileAllFormatExpressions().map((f) => ({
    ...f,
    status: ['REEL', 'CAROUSEL', 'STORY', 'CTA_STORY', 'COVER', 'HIGHLIGHT'].includes(f.format)
      ? ('COMPLETE' as const)
      : ('PLANNED' as const),
  }));

  const entryId = 'entry-001';
  const legacyAssets = [
    { format: 'REEL' as const, assetId: 'legacy-reel-001-manual', notes: 'Manual penthouse reel production — no GenerationReceipt at time of creation' },
    { format: 'CAROUSEL' as const, assetId: 'legacy-carousel-001-founder', notes: 'Founder-ingested Britney carousel graphics — pre-lineage system' },
    { format: 'COVER' as const, assetId: 'legacy-cover-001-tv', notes: 'Vintage TV cover explorations — mixed tracked/untracked variants' },
    { format: 'STORY' as const, assetId: 'legacy-story-001-margin', notes: 'Margin commentary frames — founder upload' },
  ];

  const receipts = legacyAssets.map((a) =>
    createLegacyUntrackedReceipt({
      projectId: NDXBOOK_PROOF_PROJECT_KEY,
      brandId: NDXBOOK_PROOF_BRAND_ID,
      entryId,
      format: a.format,
      assetId: a.assetId,
      notes: a.notes,
    }),
  );

  return {
    id: entryId,
    projectId: NDXBOOK_PROOF_PROJECT_KEY,
    brandId: NDXBOOK_PROOF_BRAND_ID,
    entryNumber: ENTRY_001_NUMBER,
    title: ENTRY_001_TITLE,
    subject: ENTRY_001_SUBJECT,
    objectiveId: objective.objectiveId,
    territoryId: ENTRY_001_TERRITORY_ID,
    worldExpressionId: ENTRY_001_WORLD_ID,
    status: 'IN_PRODUCTION',
    canonState: 'PRODUCTION',
    formatExpressions,
    productionPlan: buildEntry001ProductionPlan(),
    audioPlan: buildEntry001AudioPlan(),
    continuityGraph: buildEntry001ContinuityGraph(),
    platformTranslations: buildEntry001PlatformTranslations(),
    artifact: buildEntry001Artifact(),
    generationReceipts: receipts,
    founderJudgments: [],
    assetIds: legacyAssets.map((a) => a.assetId),
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  };
}

export function entry001LegacySummary(): { tracked: string[]; untracked: string[] } {
  const entry = reconstructEntry001();
  const tracked = entry.generationReceipts.filter((r) => r.trackingState === 'TRACKED').map((r) => r.assetId);
  const untracked = entry.generationReceipts.filter((r) => r.trackingState === 'LEGACY_UNTRACKED').map((r) => r.assetId);
  return { tracked, untracked };
}
