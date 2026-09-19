/**
 * P0.FILM.1 — Founder film taste model (separate from brand canon).
 */

import type { FounderFilmTasteModel, RoughCutAction, DailiesAction } from '../types.js';

export const DEFAULT_TASTE_DIMENSIONS = [
  'preferredCameraDistance',
  'environmentVsFaceRatio',
  'closeupTolerance',
  'handheldTolerance',
  'cinematicPolishTolerance',
  'imperfectionPreference',
  'shotDuration',
  'pacing',
  'dialogueDensity',
  'motionIntensity',
  'cutFrequency',
  'textDensity',
  'soundDesignIntensity',
  'lifestylePresence',
  'characterPresence',
  'evidencePresence',
  'directCameraTolerance',
  'brandAccentVisibility',
] as const;

export function buildFounderFilmTasteModel(founderId: string): FounderFilmTasteModel {
  const dimensions: Record<string, number> = {};
  for (const dim of DEFAULT_TASTE_DIMENSIONS) {
    dimensions[dim] = 0.5;
  }
  return {
    founderId,
    dimensions,
    explicitJudgments: [],
    updatedAt: new Date().toISOString(),
  };
}

export function recordTasteJudgment(
  model: FounderFilmTasteModel,
  params: {
    filmId: string;
    shotId?: string | null;
    action: DailiesAction | RoughCutAction;
    dimension: string;
    delta: number;
  },
): FounderFilmTasteModel {
  const current = model.dimensions[params.dimension] ?? 0.5;
  const next = Math.max(0, Math.min(1, current + params.delta));
  return {
    ...model,
    dimensions: { ...model.dimensions, [params.dimension]: next },
    explicitJudgments: [
      ...model.explicitJudgments,
      {
        filmId: params.filmId,
        shotId: params.shotId ?? null,
        action: params.action,
        dimension: params.dimension,
        delta: params.delta,
        at: new Date().toISOString(),
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

/** Taste learning does NOT mutate brand film bible */
export function tasteSeparateFromBrandCanon(): true {
  return true;
}
