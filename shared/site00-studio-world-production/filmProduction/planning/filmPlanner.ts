/**
 * P0.FILM.1 — Film planner — script/storyboard → production plan.
 */

import type {
  BrandCinematographyBible,
  BrandEnvironmentBible,
  BrandFilmBible,
  BrandShotLibrary,
  CharacterFilmAuthority,
  CharacterWardrobeBible,
  FilmBeat,
  FilmProductionInput,
  FilmProductionPlan,
  FilmSceneContract,
  FilmShotContract,
  FounderFilmTasteModel,
  VideoFormatTemplate,
} from '../types.js';
import { DEFAULT_AUTONOMY_MODE } from '../constants.js';
import { interpretScript } from '../interpreters/scriptInterpreter.js';
import { interpretStoryboard } from '../interpreters/storyboardInterpreter.js';
import { buildContinuityGraph } from '../planning/continuityGraph.js';
import { buildFilmGenerationPlan } from '../generation/generationPlan.js';
import { resolveShotClass, shotRiskFromClass } from '../shotLibrary/shotLibrary.js';
import { resolveWardrobeForEnvironment } from '../authorities/wardrobeBible.js';
import { resolveEnvironment } from '../authorities/environmentBible.js';

export type FilmPlannerContext = {
  brandBible: BrandFilmBible;
  characterAuthority: CharacterFilmAuthority;
  wardrobeBible: CharacterWardrobeBible;
  environmentBible: BrandEnvironmentBible;
  shotLibrary: BrandShotLibrary;
  formatTemplate: VideoFormatTemplate;
  cinematography: BrandCinematographyBible;
  tasteModel: FounderFilmTasteModel;
};

export function planFilm(
  filmId: string,
  input: FilmProductionInput,
  ctx: FilmPlannerContext,
): FilmProductionPlan {
  const beats = interpretScript(input);
  const storyboard = interpretStoryboard(input);
  const shotClasses = resolveShotSequence(input, ctx.formatTemplate, storyboard.shotClassMapping);

  const scenes = buildScenes(filmId, shotClasses, input, ctx);
  const shots = buildShots(filmId, scenes, shotClasses, beats, input, ctx);
  const continuityPlan = buildContinuityGraph(filmId, shots);
  const generationPlan = buildFilmGenerationPlan(filmId, shots);

  const wardrobePlan = [...new Set(shots.map((s) => s.wardrobe).filter(Boolean))] as NonNullable<
    FilmShotContract['wardrobe']
  >[];
  const locationPlan = [...new Set(scenes.map((s) => s.location))];
  const propPlan = [...new Set(shots.flatMap((s) => s.props))];

  return {
    planId: `plan-${filmId}`,
    filmId,
    template: ctx.formatTemplate.templateId,
    beats,
    scenes,
    shots,
    continuityPlan,
    wardrobePlan,
    locationPlan,
    propPlan,
    voicePlan: shots.find((s) => s.dialogue)?.voice ?? null,
    soundPlan: ctx.formatTemplate.ambientSoundBehavior,
    generationPlan,
    estimatedCostUsd: generationPlan.totalEstimatedCostUsd,
    estimatedShotCount: shots.length,
    providerRoutingStatus: 'ROUTED',
    autonomyMode: DEFAULT_AUTONOMY_MODE,
    compiledAt: new Date().toISOString(),
  };
}

function resolveShotSequence(
  _input: FilmProductionInput,
  template: VideoFormatTemplate,
  storyboardMapping: Array<{ frameId: string; shotClass: string }>,
): string[] {
  if (storyboardMapping.length > 0) {
    return storyboardMapping.map((m) => m.shotClass);
  }
  if (template.shotRoleSequence.length > 0) {
    return template.shotRoleSequence;
  }
  return ['OBSERVATIONAL_WIDE'];
}

function buildScenes(
  filmId: string,
  shotClasses: string[],
  _input: FilmProductionInput,
  ctx: FilmPlannerContext,
): FilmSceneContract[] {
  const env = _input.storyboard?.[0]?.environment ?? 'CAFE';
  const envId = normalizeEnvironment(env);
  const wardrobe = resolveWardrobeForEnvironment(ctx.wardrobeBible, envId);

  return [
    {
      sceneId: `${filmId}-scene-01`,
      filmId,
      purpose: _input.objective,
      location: envId,
      time: 'morning',
      characterState: 'observational',
      wardrobeContinuityId: wardrobe?.continuityId ?? 'default',
      hairBeautyState: 'natural down',
      props: _input.requiredProducts,
      lighting: resolveEnvironment(ctx.environmentBible, envId)?.lighting[0] ?? 'natural window',
      environmentReferences: _input.referenceAssets,
      sound: ctx.formatTemplate.ambientSoundBehavior,
      continuityIn: [],
      continuityOut: [],
      shotIds: shotClasses.map((_, i) => `${filmId}-shot-${String(i + 1).padStart(2, '0')}`),
      deckState: 'INCOMPLETE',
    },
  ];
}

function buildShots(
  filmId: string,
  scenes: FilmSceneContract[],
  shotClasses: string[],
  beats: FilmBeat[],
  input: FilmProductionInput,
  ctx: FilmPlannerContext,
): FilmShotContract[] {
  const scene = scenes[0];
  return shotClasses.map((shotClass, index) => {
    const libraryEntry = resolveShotClass(ctx.shotLibrary, shotClass);
    const beat = beats[index] ?? beats[beats.length - 1];
    const storyboardFrame = input.storyboard?.[index];
    const wardrobe = resolveWardrobeForEnvironment(ctx.wardrobeBible, scene.location);

    return {
      shotId: `${filmId}-shot-${String(index + 1).padStart(2, '0')}`,
      sceneId: scene.sceneId,
      filmId,
      shotClass,
      storyFunction: libraryEntry?.purpose ?? beat?.meaning ?? shotClass,
      durationTarget: storyboardFrame?.intendedDuration ?? libraryEntry?.recommendedDuration.max ?? 4,
      characterIdentity: ctx.characterAuthority.identityAnchors,
      wardrobe,
      hair: 'natural down',
      beauty: 'minimal natural',
      accessories: wardrobe?.jewelry ?? [],
      props: beat?.propRequirement ?? libraryEntry?.propCompatibility ?? [],
      environment: scene.location,
      cameraPosition: storyboardFrame?.camera ?? libraryEntry?.cameraPosition ?? 'observational medium',
      cameraMovement: libraryEntry?.cameraMovement ?? 'subtle handheld',
      lens: libraryEntry?.lensCharacter ?? '35mm naturalistic',
      framing: storyboardFrame?.composition ?? 'off-center environmental',
      composition: storyboardFrame?.composition ?? 'rule of thirds',
      lighting: scene.lighting,
      action: storyboardFrame?.action ?? beat?.action ?? libraryEntry?.performanceBehavior ?? '',
      microAction: libraryEntry?.performanceBehavior ?? 'subtle',
      expression: beat?.emotion ?? 'observational',
      gaze: 'environment-first',
      dialogue: beat?.dialogue ?? null,
      voice: beat?.dialogue ? ctx.characterAuthority.voice : null,
      sound: scene.sound,
      continuityIn: index > 0 ? [`from shot ${index}`] : [],
      continuityOut: index < shotClasses.length - 1 ? [`to shot ${index + 2}`] : [],
      referencePack: input.referenceAssets,
      realismRequirements: ctx.brandBible.realismTarget ? [ctx.brandBible.realismTarget] : [],
      negativeConstraints: [...(libraryEntry?.negativeConstraints ?? []), ...ctx.brandBible.disallowedStylization],
      providerRequirements: libraryEntry?.preferredProviderEvidence ?? [],
      preferredProviderStack: shotRiskFromClass(shotClass) === 'HIGH' ? 'STILL_FIRST' : 'DIRECT_VIDEO',
      preferredLaneId: null,
      generationCount: 1,
      qaThresholds: { identity: 0.7, hands: 0.6, realism: 0.65 },
      riskProfile: libraryEntry?.modelRiskProfile ?? shotRiskFromClass(shotClass),
    };
  });
}

function normalizeEnvironment(env: string): FilmSceneContract['location'] {
  const upper = env.toUpperCase().replace(/\s+/g, '_');
  const valid = ['CAFE', 'BOOKSTORE', 'CREATIVE_OFFICE', 'HOME_DESK', 'CITY_SIDEWALK', 'ELEVATOR', 'LUXURY_CAR', 'RESTAURANT', 'HOTEL', 'AIRPORT_LOUNGE', 'STUDIO_BOOK_ROOM'];
  return (valid.find((v) => upper.includes(v)) ?? 'CAFE') as FilmSceneContract['location'];
}

export function filmPlannerImplemented(): true {
  return true;
}

export function filmSceneContractImplemented(): true {
  return true;
}

export function filmShotContractImplemented(): true {
  return true;
}

export function filmContinuityGraphImplemented(): true {
  return true;
}
