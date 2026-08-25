/**
 * P0.FILM.1 — Script interpreter → FilmBeat[].
 */

import type { FilmBeat, FilmProductionInput } from '../types.js';

function slugBeat(index: number): string {
  return `beat-${String(index + 1).padStart(2, '0')}`;
}

export function interpretScript(input: FilmProductionInput): FilmBeat[] {
  if (!input.script || input.script.trim().length === 0) {
    return [];
  }

  const lines = input.script.split('\n').map((l) => l.trim()).filter(Boolean);
  const beats: FilmBeat[] = [];
  let currentAction = '';
  let currentDialogue: string | null = null;
  let beatIndex = 0;

  for (const line of lines) {
    const isDialogue = line.startsWith('"') || line.startsWith("'") || line.match(/^[A-Z\s]+:/);
    const isSceneHeading = /^(INT\.|EXT\.|SCENE)/i.test(line);

    if (isSceneHeading || (!isDialogue && line.length > 0)) {
      if (currentAction || currentDialogue) {
        beats.push(buildBeat(beatIndex++, currentAction, currentDialogue, input));
        currentAction = '';
        currentDialogue = null;
      }
      currentAction = line.replace(/^(INT\.|EXT\.|SCENE)\s*/i, '').trim();
    } else if (isDialogue) {
      currentDialogue = line.replace(/^[A-Z\s]+:\s*/, '').replace(/^["']|["']$/g, '');
    }
  }

  if (currentAction || currentDialogue) {
    beats.push(buildBeat(beatIndex, currentAction, currentDialogue, input));
  }

  if (beats.length === 0 && input.script) {
    beats.push({
      beatId: slugBeat(0),
      index: 0,
      meaning: input.objective || input.title,
      dialogue: null,
      action: input.script.slice(0, 200),
      emotion: input.desiredMood[0] ?? 'observational',
      locationRequirement: null,
      propRequirement: input.requiredProducts,
      characterRequirement: ['primary character'],
      evidenceRequirement: false,
      continuityRequirement: [],
      transitionPotential: null,
    });
  }

  return beats;
}

function buildBeat(
  index: number,
  action: string,
  dialogue: string | null,
  input: FilmProductionInput,
): FilmBeat {
  const lower = action.toLowerCase();
  const evidenceRequirement = lower.includes('search') || lower.includes('phone') || lower.includes('receipt');
  return {
    beatId: slugBeat(index),
    index,
    meaning: dialogue ?? action.slice(0, 80),
    dialogue,
    action,
    emotion: input.desiredMood[index % Math.max(input.desiredMood.length, 1)] ?? 'observational',
    locationRequirement: inferLocation(action),
    propRequirement: inferProps(action, input.requiredProducts),
    characterRequirement: ['primary character'],
    evidenceRequirement,
    continuityRequirement: [],
    transitionPotential: index > 0 ? 'cut' : null,
  };
}

function inferLocation(action: string): FilmBeat['locationRequirement'] {
  const lower = action.toLowerCase();
  if (lower.includes('cafe') || lower.includes('coffee')) return 'CAFE';
  if (lower.includes('car')) return 'LUXURY_CAR';
  if (lower.includes('office') || lower.includes('desk')) return 'HOME_DESK';
  if (lower.includes('sidewalk') || lower.includes('street')) return 'CITY_SIDEWALK';
  if (lower.includes('elevator')) return 'ELEVATOR';
  if (lower.includes('restaurant')) return 'RESTAURANT';
  if (lower.includes('bookstore') || lower.includes('book')) return 'BOOKSTORE';
  return null;
}

function inferProps(action: string, required: string[]): string[] {
  const props = [...required];
  const lower = action.toLowerCase();
  if (lower.includes('phone')) props.push('phone');
  if (lower.includes('notebook') || lower.includes('book')) props.push('ndx-notebook');
  if (lower.includes('pen')) props.push('lime-pen');
  if (lower.includes('laptop')) props.push('laptop');
  return [...new Set(props)];
}

export function scriptInterpreterReturnsBeats(beats: FilmBeat[]): boolean {
  return beats.length > 0 && beats.every((b) => b.beatId && b.action);
}
