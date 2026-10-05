/**
 * Model-aware prompt compiler — canonical sections → provider payloads.
 */

import { createHash } from 'node:crypto';
import { getShotBibleEntry } from '../shotBible/shotBible.js';
import { CINEMATIC_REALISM_CANON } from '../realismCanon.js';
import type {
  CompiledProviderPrompt,
  CinematicRealismProviderId,
  CinematicRealismLaneId,
  RealismReferencePack,
  RealismShotBrief,
  PromptSectionSnapshot,
} from '../types.js';
import { resolveProviderForLane } from '../providerRegistry/registry.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function buildPromptSections(
  brief: RealismShotBrief,
  referencePack: RealismReferencePack | null,
): PromptSectionSnapshot {
  const bible = getShotBibleEntry(brief.shotType);
  const continuityRefs =
    referencePack?.items.filter((i) => i.continuityCritical).map((i) => i.label).join('; ') || 'none bound';

  return {
    identity: `Subject in ${brief.shotType.replace(/_/g, ' ').toLowerCase()} context. ${brief.sceneDescription}`,
    environment: `${brief.environment}. Rules: ${bible.environmentRules.join('. ')}`,
    wardrobe: `${brief.wardrobe}. Rules: ${bible.wardrobeRules.join('. ')}`,
    camera: `${brief.cameraBehavior}. Language: ${bible.cameraLanguage.join('. ')}`,
    lighting: bible.lightingRules.join('. '),
    motion: `Performance: ${brief.performanceBehavior}. Restrictions: ${bible.movementRestrictions.join('. ')}`,
    performance: brief.performanceBehavior,
    realismEnforcement: `${CINEMATIC_REALISM_CANON.northStar}. Principles: ${CINEMATIC_REALISM_CANON.principles.slice(0, 4).join('; ')}`,
    negative: [...brief.negativeConstraints, ...CINEMATIC_REALISM_CANON.prohibited].join('. '),
    continuity: `Anchors: ${brief.continuityAnchors.join(', ')}. Pack: ${continuityRefs}`,
    socialFormat: `Format ${brief.socialFormat}. Social-native premium reel.`,
    audio:
      brief.voiceMode === 'NONE'
        ? 'No dialogue. Ambient city hum optional.'
        : brief.voiceMode === 'VOICEOVER'
          ? 'Calm confident voiceover — founder tone, not announcer.'
          : 'On-camera dialogue — natural cadence, subtle lip sync required.',
  };
}

function assemblePromptText(sections: PromptSectionSnapshot): string {
  return [
    `[IDENTITY] ${sections.identity}`,
    `[ENVIRONMENT] ${sections.environment}`,
    `[WARDROBE] ${sections.wardrobe}`,
    `[CAMERA] ${sections.camera}`,
    `[LIGHTING] ${sections.lighting}`,
    `[MOTION] ${sections.motion}`,
    `[REALISM] ${sections.realismEnforcement}`,
    `[NEGATIVE] ${sections.negative}`,
    `[CONTINUITY] ${sections.continuity}`,
    `[FORMAT] ${sections.socialFormat}`,
    `[AUDIO] ${sections.audio}`,
  ].join('\n');
}

function providerPayload(
  providerId: CinematicRealismProviderId,
  sections: PromptSectionSnapshot,
  brief: RealismShotBrief,
): Record<string, unknown> {
  const base = {
    prompt: assemblePromptText(sections),
    aspect_ratio: brief.socialFormat === 'REEL_9_16' ? '9:16' : brief.socialFormat === 'FEED_4_5' ? '4:5' : '16:9',
    negative_prompt: sections.negative,
  };

  switch (providerId) {
    case 'HIGGSFIELD':
      return { ...base, model: 'higgsfield-cinematic-v1', motion_strength: 0.55, realism_mode: 'luxury_lifestyle' };
    case 'MINIMAX_HAILUO':
      return { ...base, model: 'hailuo-02', reference_mode: 'identity_lock', duration_sec: 6 };
    case 'KLING':
      return { ...base, model: 'kling-v2', camera_control: sections.camera, duration: '10s' };
    case 'VEO':
      return { ...base, model: 'veo-preview', cinematic_grade: true };
    case 'RUNWAY':
      return { ...base, model: 'gen3', motion: sections.motion };
    case 'GENERIC_STILL':
      return { ...base, model: 'still-hero', output: 'image' };
    case 'HYBRID_CONTROLLER':
      return {
        ...base,
        pipeline: 'still_first',
        stages: ['GENERATE_HERO_STILL', 'APPROVE_STILL', 'ANIMATE_VIDEO'],
        animation_provider: 'KLING',
      };
    default:
      return base;
  }
}

export function compileProviderPrompt(params: {
  brief: RealismShotBrief;
  laneId: CinematicRealismLaneId;
  referencePack?: RealismReferencePack | null;
  providerId?: CinematicRealismProviderId;
}): CompiledProviderPrompt {
  const providerId = params.providerId ?? resolveProviderForLane(params.laneId);
  const sections = buildPromptSections(params.brief, params.referencePack ?? null);
  const promptText = assemblePromptText(sections);
  const payload = providerPayload(providerId, sections, params.brief);
  const compiledAt = new Date().toISOString();

  return {
    providerId,
    laneId: params.laneId,
    payload,
    promptText,
    sections,
    compiledAt,
    fingerprint: fp({ providerId, sections, briefId: params.brief.briefId }),
  };
}

export function compilePromptMatrix(
  brief: RealismShotBrief,
  laneIds: CinematicRealismLaneId[],
  referencePack?: RealismReferencePack | null,
): CompiledProviderPrompt[] {
  return laneIds.map((laneId) => compileProviderPrompt({ brief, laneId, referencePack }));
}
