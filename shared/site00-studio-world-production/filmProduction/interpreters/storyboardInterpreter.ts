/**
 * P0.FILM.1 — Storyboard interpreter (high visual authority).
 */

import type { FilmProductionInput, FilmStoryboardFrame, StoryboardConflict } from '../types.js';
import type { BrandFilmBible } from '../types.js';
import type { CharacterFilmAuthority } from '../types.js';

export type StoryboardInterpretation = {
  frames: FilmStoryboardFrame[];
  visualAuthorityPreserved: boolean;
  conflicts: StoryboardConflict[];
  shotClassMapping: Array<{ frameId: string; shotClass: string }>;
};

export function interpretStoryboard(input: FilmProductionInput): StoryboardInterpretation {
  const frames = input.storyboard ?? [];
  const shotClassMapping = frames.map((f) => ({
    frameId: f.frameId,
    shotClass: f.shotClassHint ?? inferShotClassFromFrame(f),
  }));

  return {
    frames,
    visualAuthorityPreserved: frames.every((f) => f.visualAuthority !== 'LOW'),
    conflicts: [],
    shotClassMapping,
  };
}

export function detectStoryboardConflicts(
  frames: FilmStoryboardFrame[],
  brandBible: BrandFilmBible,
  characterAuthority: CharacterFilmAuthority,
): StoryboardConflict[] {
  const conflicts: StoryboardConflict[] = [];
  for (const frame of frames) {
    if (frame.camera.toLowerCase().includes('orbit') && brandBible.disallowedStylization.includes('over-directed cinematography')) {
      conflicts.push({
        frameId: frame.frameId,
        conflictType: 'BRAND',
        description: 'Orbit camera conflicts with brand cinematography rules',
        resolution: 'SURFACE',
      });
    }
    if (frame.action.toLowerCase().includes('present to camera') && characterAuthority.negativeBehaviorConstraints.includes('no influencer posing')) {
      conflicts.push({
        frameId: frame.frameId,
        conflictType: 'CHARACTER',
        description: 'Presenter energy conflicts with character camera relationship',
        resolution: 'SURFACE',
      });
    }
  }
  return conflicts;
}

function inferShotClassFromFrame(frame: FilmStoryboardFrame): string {
  const cam = frame.camera.toLowerCase();
  const act = frame.action.toLowerCase();
  if (cam.includes('wide') || cam.includes('environment')) return 'OBSERVATIONAL_WIDE';
  if (cam.includes('table') || act.includes('coffee') || act.includes('bag')) return 'TABLE_LEVEL_LIVED_IN';
  if (act.includes('double take')) return 'DOUBLE_TAKE';
  if (act.includes('phone')) return 'PHONE_EVIDENCE';
  if (act.includes('mirror')) return 'MIRROR_CAUGHT';
  if (act.includes('walk')) return 'FOLLOW_BEHIND';
  if (act.includes('notebook') || act.includes('write')) return 'NOTEBOOK_INSERT';
  if (act.includes('direct') || act.includes('camera')) return 'DIRECT_CAMERA_PAYOFF';
  return 'OBSERVATIONAL_WIDE';
}

export function storyboardPreservesVisualAuthority(interpretation: StoryboardInterpretation): boolean {
  return interpretation.visualAuthorityPreserved && interpretation.frames.length > 0;
}
