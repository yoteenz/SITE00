/**
 * P0.FILM.1 — Film prompt compiler (builds on Realism Lab compiler).
 */

import type { CharacterInjectionBundle } from '../../characterAuthority/types.js';
import { PROMPT_AUTHORITY_ORDER } from '../constants.js';
import type { BrandCinematographyBible, BrandFilmBible, CharacterFilmAuthority, CompiledFilmPrompt, FilmShotContract, WardrobeOutfit } from '../types.js';
import type { EnvironmentDefinition } from '../types.js';
import { routeShotModel } from '../routing/modelRouter.js';

export function compileFilmShotPrompt(params: {
  shot: FilmShotContract;
  brandBible: BrandFilmBible;
  characterAuthority: CharacterFilmAuthority;
  cinematography: BrandCinematographyBible;
  environment: EnvironmentDefinition | null;
  wardrobe: WardrobeOutfit | null;
  characterInjectionBundle?: CharacterInjectionBundle | null;
}): CompiledFilmPrompt {
  const routing = routeShotModel(params.shot);
  const sections = buildFilmPromptSections(params);

  const promptText = PROMPT_AUTHORITY_ORDER.map((key) => `[${key}] ${sections[key.toLowerCase()] ?? ''}`).join('\n');

  return {
    shotId: params.shot.shotId,
    providerId: routing.providerId,
    laneId: routing.laneId,
    payload: buildProviderPayload(routing.providerId, sections, params.shot),
    promptText,
    sections,
    authorityOrder: [...PROMPT_AUTHORITY_ORDER],
    compiledAt: new Date().toISOString(),
    inspectOnly: true,
  };
}

function buildFilmPromptSections(params: {
  shot: FilmShotContract;
  brandBible: BrandFilmBible;
  characterAuthority: CharacterFilmAuthority;
  cinematography: BrandCinematographyBible;
  environment: EnvironmentDefinition | null;
  wardrobe: WardrobeOutfit | null;
  characterInjectionBundle?: CharacterInjectionBundle | null;
}): Record<string, string> {
  const { shot, brandBible, characterAuthority, cinematography, environment, wardrobe } = params;
  const injection = params.characterInjectionBundle;
  const wardrobeDesc = injection?.wardrobeReferences.length
    ? injection.wardrobeReferences.join('; ')
    : wardrobe
      ? `${wardrobe.top}, ${wardrobe.bottom}${wardrobe.limeAccent ? `, lime accent: ${wardrobe.limeAccent}` : ''}`
      : 'approved everyday look';

  const identityFromInjection = injection
    ? `CANONICAL INJECTION ${injection.characterVisualVersion}: ${injection.identityReferences.join(' · ')}`
    : `${characterAuthority.identityAnchors.join('. ')}. Face: ${characterAuthority.faceAnchors.join(', ')}. Hair: ${shot.hair}.`;

  return {
    identity: identityFromInjection,
    continuity: `In: ${shot.continuityIn.join(', ')}. Out: ${shot.continuityOut.join(', ')}. Props: ${shot.props.join(', ')}.`,
    action: `${shot.action}. Micro: ${shot.microAction}. Expression: ${shot.expression}. Gaze: ${shot.gaze}.`,
    camera: `${shot.cameraPosition}. Movement: ${shot.cameraMovement}. Lens: ${shot.lens}. Framing: ${shot.framing}. ${cinematography.primaryPrinciple}`,
    environment: environment
      ? `${environment.environmentId}: ${environment.visualGrammar.join(', ')}. Lighting: ${shot.lighting}.`
      : `${shot.environment}. ${shot.lighting}.`,
    realism: `${brandBible.realismTarget}. Avoid: ${brandBible.disallowedStylization.join(', ')}. ${shot.realismRequirements.join('. ')}`,
    style: `Tone: ${brandBible.visualTone.join(', ')}. Performance: ${characterAuthority.cameraAwareness}.`,
    negative: [
      ...shot.negativeConstraints,
      ...brandBible.disallowedStylization,
      ...cinematography.avoid,
      ...(injection?.negativeIdentityConstraints.slice(0, 6) ?? []),
    ].join('. '),
    wardrobe: wardrobeDesc,
    dialogue: shot.dialogue ? `Line: "${shot.dialogue}"` : 'No dialogue.',
    sound: shot.sound,
  };
}

function buildProviderPayload(
  providerId: string,
  sections: Record<string, string>,
  shot: FilmShotContract,
): Record<string, unknown> {
  return {
    provider: providerId,
    prompt: Object.entries(sections)
      .map(([k, v]) => `[${k.toUpperCase()}] ${v}`)
      .join('\n'),
    duration_sec: shot.durationTarget,
    aspect_ratio: '9:16',
    negative_prompt: sections.negative,
  };
}

/** Founder does not need to inspect prompts during normal flow */
export function founderRequiredToMicromanagePrompts(): false {
  return false;
}

export function promptCompilerConsumesFilmShotContract(): true {
  return true;
}
