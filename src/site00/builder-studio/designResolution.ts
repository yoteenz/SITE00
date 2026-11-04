/**
 * Deterministic design resolution for Blueprint STRUCTURE tab — separates experience structure,
 * creative expression, and SITE 00 recommendations with traceable provenance.
 *
 * Every explanation is read from the registry entry of the value that resolved (what that type, colour, image world
 * or motion actually is), so two clients with the same structure but different creative choices read different
 * reasons. Nothing here describes the client's brand beyond what the selection states.
 */
import {
  COLOR_DIRECTIONS,
  EXPRESSION_BY_ID,
  IMAGE_WORLDS,
  MOTION_CHARACTERS,
  STRUCTURE_BY_ID,
  TYPE_DIRECTIONS,
} from '../builder-experience/registry';
import type { BuilderSelection, ColorDirectionId, ImageWorldId, MotionCharacterId, TypeDirectionId } from '../builder-experience/types';
import { effectiveMotion, expressionInfluences } from '../builder-experience/rules';

const up = (value: string) => value.toUpperCase();
/** Registry copy is sentence case with a closing stop; the Blueprint shows it in upper case, one stop per sentence. */
const sentence = (value: string) => up(value.trim().replace(/\.?$/, '.'));
const clause = (value: string) => up(value.trim().replace(/\.$/, ''));

export type DesignProvenance =
  | 'CLIENT_SELECTED'
  | 'CLIENT_BRAND_SOURCE'
  | 'SITE00_RECOMMENDED'
  | 'UNDECIDED'
  | 'EXISTING_SYSTEM_CONSTRAINT';

export type DesignDetailKey =
  | 'STRUCTURE'
  | 'TYPOGRAPHY'
  | 'COLOR_DIRECTION'
  | 'IMAGE_WORLD'
  | 'MOTION'
  | 'COMPOSITION'
  | 'INTERACTION_CHARACTER';

export type ResolvedDesignDetail = {
  key: DesignDetailKey;
  label: string;
  /** The resolved direction, or null while it is still to be decided (never filled in with a guess). */
  value: string | null;
  /** What the screen shows for the value: the value itself, or how an open value gets decided. */
  display: string;
  provenance: DesignProvenance;
  /** Client-facing provenance line (upper case). */
  provenanceLabel: string;
  /** Short practical explanation: what this direction is and what it does for the build (upper case). */
  fitNote: string;
  /** Optional in-place detail (upper case), or null when there is nothing more that is true to say. */
  context: string | null;
};

function provenanceLabel(provenance: DesignProvenance): string {
  switch (provenance) {
    case 'CLIENT_SELECTED':
      return 'YOUR SELECTION';
    case 'CLIENT_BRAND_SOURCE':
      return 'FROM YOUR BRAND';
    case 'SITE00_RECOMMENDED':
      return 'OUR RECOMMENDATION';
    case 'UNDECIDED':
      return 'TO BE REFINED';
    case 'EXISTING_SYSTEM_CONSTRAINT':
      return 'OUR RECOMMENDATION';
  }
}

function primarySystem(selection: BuilderSelection) {
  const primary = selection.expression.primary;
  return primary && primary !== 'CUSTOM' ? EXPRESSION_BY_ID[primary] : null;
}

function primaryStructure(selection: BuilderSelection) {
  return selection.structure ? STRUCTURE_BY_ID[selection.structure] : null;
}

/** How an open value gets decided, in the client's terms. */
function openValue(selection: BuilderSelection): string {
  return selection.expression.primary === 'CUSTOM' ? 'SET WITH YOU IN YOUR CUSTOM DIRECTION' : 'SET WITH YOU AT BLUEPRINT REVIEW';
}

function detail(
  selection: BuilderSelection,
  key: DesignDetailKey,
  label: string,
  value: string | null,
  provenance: DesignProvenance,
  fitNote: string,
  context: string | null,
): ResolvedDesignDetail {
  return { key, label, value, display: value ?? openValue(selection), provenance, provenanceLabel: provenanceLabel(provenance), fitNote, context };
}

function resolveStructure(selection: BuilderSelection): ResolvedDesignDetail {
  const primary = primaryStructure(selection);
  const second = selection.structureSecondary ? STRUCTURE_BY_ID[selection.structureSecondary] : null;
  if (!primary) {
    return detail(selection, 'STRUCTURE', 'STRUCTURE', null, 'UNDECIDED', 'HOW PEOPLE MOVE THROUGH YOUR PLACE IS SHAPED WITH YOU BEFORE ITS LOOK IS SET.', null);
  }
  const value = up(second ? `${primary.label} + ${second.label}` : primary.label);
  return detail(
    selection,
    'STRUCTURE',
    'STRUCTURE',
    value,
    'CLIENT_SELECTED',
    sentence(primary.behavior),
    second ? `${up(second.label)} LEADS ITS OWN PART: ${sentence(second.behavior)}` : null,
  );
}

type TunableDim = 'type' | 'color' | 'imageWorld' | 'motion';

/** The id a tunable resolves to, and where it came from. Open stays open: no system, no explicit choice, no value. */
function resolveTunableId(selection: BuilderSelection, dim: TunableDim): { id: string | null; provenance: DesignProvenance } {
  const raw = selection[dim];
  if (raw !== 'SYSTEM_DEFAULT') return { id: raw, provenance: 'CLIENT_SELECTED' };
  if (dim === 'color' && selection.brand === 'READY') return { id: 'CUSTOM_BRAND_LED', provenance: 'CLIENT_BRAND_SOURCE' };
  const system = primarySystem(selection);
  if (!system) return { id: null, provenance: 'UNDECIDED' };
  return { id: dim === 'motion' ? effectiveMotion(selection) : system.defaults[dim], provenance: 'SITE00_RECOMMENDED' };
}

function resolveTypography(selection: BuilderSelection): ResolvedDesignDetail {
  const { id, provenance } = resolveTunableId(selection, 'type');
  const entry = TYPE_DIRECTIONS.find((t) => t.id === id) ?? null;
  const system = primarySystem(selection);
  if (!entry) {
    return detail(selection, 'TYPOGRAPHY', 'TYPOGRAPHY', null, 'UNDECIDED', 'THE TYPE VOICE IS CHOSEN ONCE YOUR CONTENT AND DIRECTION ARE CLEAR.', null);
  }
  // The system's own typesetting notes only describe its default face; an explicit choice is described by itself.
  const context = system && provenance === 'SITE00_RECOMMENDED' ? `SET AS ${up(system.label)} SETS IT: ${sentence(system.typography)}` : null;
  return detail(selection, 'TYPOGRAPHY', 'TYPOGRAPHY', up(entry.label), provenance, `${sentence(entry.speaks)} ${sentence(entry.inContext)}`, context);
}

function resolveColor(selection: BuilderSelection): ResolvedDesignDetail {
  const { id, provenance } = resolveTunableId(selection, 'color');
  const entry = COLOR_DIRECTIONS.find((c) => c.id === id) ?? null;
  if (!entry) {
    return detail(selection, 'COLOR_DIRECTION', 'COLOR DIRECTION', null, 'UNDECIDED', 'COLOUR IS CHOSEN WITH YOU, WITH CONTRAST CHECKED FOR READING AND KEY ACTIONS.', null);
  }
  const r = entry.relationship;
  const ground = r.background === r.surface ? clause(r.background) : `${clause(r.background)} AND ${clause(r.surface)}`;
  const fitNote =
    entry.id === 'CUSTOM_BRAND_LED'
      ? 'LED BY THE BRAND YOU ALREADY HAVE, WITH CONTRAST CHECKED FOR READING AND KEY ACTIONS.'
      : `${sentence(entry.feels)} ${ground}, WITH ${clause(r.accent)} AS THE ACCENT.`;
  const context =
    entry.id === 'CUSTOM_BRAND_LED'
      ? null
      : selection.brand === 'IN_PROGRESS'
        ? 'THE FINAL PALETTE IS SET AGAINST YOUR BRAND AS IT TAKES SHAPE.'
        : selection.brand === 'READY'
          ? 'YOU CHOSE THIS OVER YOUR BRAND COLOURS. WE CHECK IT SITS WELL BESIDE YOUR BRAND.'
          : null;
  return detail(selection, 'COLOR_DIRECTION', 'COLOR DIRECTION', up(entry.label), provenance, fitNote, context);
}

function resolveImageWorld(selection: BuilderSelection): ResolvedDesignDetail {
  const { id, provenance } = resolveTunableId(selection, 'imageWorld');
  const entry = IMAGE_WORLDS.find((w) => w.id === id) ?? null;
  if (!entry) {
    return detail(selection, 'IMAGE_WORLD', 'IMAGE WORLD', null, 'UNDECIDED', 'THE KIND OF IMAGERY IS DECIDED WITH YOUR CONTENT AND WHAT YOU ALREADY HAVE.', null);
  }
  return detail(selection, 'IMAGE_WORLD', 'IMAGE WORLD', up(entry.label), provenance, sentence(entry.people_see), `WHERE IT COMES FROM: ${sentence(entry.sourcing)}`);
}

function resolveMotion(selection: BuilderSelection): ResolvedDesignDetail {
  const { id, provenance } = resolveTunableId(selection, 'motion');
  const entry = MOTION_CHARACTERS.find((m) => m.id === id) ?? null;
  if (!entry) {
    return detail(selection, 'MOTION', 'MOTION', null, 'UNDECIDED', 'HOW MUCH THINGS MOVE IS SET WITH YOU ONCE YOUR DIRECTION IS CLEAR.', null);
  }
  return detail(selection, 'MOTION', 'MOTION', up(entry.label), provenance, sentence(entry.behaves), `FOR EXAMPLE: ${sentence(entry.demo)}`);
}

function resolveComposition(selection: BuilderSelection): ResolvedDesignDetail {
  const system = primarySystem(selection);
  const structure = primaryStructure(selection);
  if (selection.expression.primary === 'CUSTOM') {
    return detail(selection, 'COMPOSITION', 'COMPOSITION', 'YOUR CUSTOM DIRECTION', 'CLIENT_SELECTED', 'LAYOUT RHYTHM IS DESIGNED FOR THIS PROJECT, FROM THE DIRECTION YOU DESCRIBE.', null);
  }
  if (!system) {
    return detail(selection, 'COMPOSITION', 'COMPOSITION', null, 'UNDECIDED', 'LAYOUT RHYTHM IS SHAPED ONCE YOUR STRUCTURE AND CONTENT PRIORITIES ARE SET.', null);
  }
  const pacing = structure ? ` IT PACES YOUR ${up(structure.label)} PATH: ${sentence(structure.compositionLogic)}` : '';
  const influences = expressionInfluences(selection);
  const blend = influences.length ? ` WITH A TOUCH OF ${influences.map((i) => up(EXPRESSION_BY_ID[i].label)).join(' AND ')}.` : '';
  return detail(
    selection,
    'COMPOSITION',
    'COMPOSITION',
    clause(system.composition),
    'SITE00_RECOMMENDED',
    `${sentence(system.spacing)}${pacing}`,
    `${sentence(system.objectLanguage)}${blend}`,
  );
}

/** How people find their way: the structure's navigation, moving with the motion resolved above. */
function resolveInteraction(selection: BuilderSelection): ResolvedDesignDetail {
  const structure = primaryStructure(selection);
  if (!structure) {
    return detail(selection, 'INTERACTION_CHARACTER', 'INTERACTION CHARACTER', null, 'UNDECIDED', 'HOW PEOPLE FIND THEIR WAY FOLLOWS THE STRUCTURE YOU SETTLE ON.', null);
  }
  const motion = MOTION_CHARACTERS.find((m) => m.id === resolveTunableId(selection, 'motion').id);
  return detail(
    selection,
    'INTERACTION_CHARACTER',
    'INTERACTION CHARACTER',
    clause(structure.navigationCharacter),
    'SITE00_RECOMMENDED',
    motion
      ? `HOW PEOPLE FIND THEIR WAY THROUGH ${up(structure.label)} PAGES, MOVING WITH THE ${up(motion.label)} MOTION ABOVE.`
      : `HOW PEOPLE FIND THEIR WAY THROUGH ${up(structure.label)} PAGES.`,
    null,
  );
}

/** Full design-details row set for the STRUCTURE tab (structure is separate from aesthetic dimensions). */
export function resolveDesignDetails(selection: BuilderSelection): ResolvedDesignDetail[] {
  return [
    resolveStructure(selection),
    resolveTypography(selection),
    resolveColor(selection),
    resolveImageWorld(selection),
    resolveMotion(selection),
    resolveComposition(selection),
    resolveInteraction(selection),
  ];
}

/** One line that frames the rows: what structure decides, what the rest decides, and where the recommendations come from. */
export function designDirectionNote(selection: BuilderSelection): string {
  const lead = 'STRUCTURE DECIDES HOW PEOPLE MOVE THROUGH YOUR PLACE. THE REST DECIDES HOW IT LOOKS AND FEELS.';
  const system = primarySystem(selection);
  if (selection.expression.primary === 'CUSTOM') return `${lead} WHAT IS STILL OPEN IS SET WITH YOU IN YOUR CUSTOM DIRECTION.`;
  if (!system) return `${lead} EACH PART IS SET WITH YOU AT BLUEPRINT REVIEW.`;
  return `${lead} OUR RECOMMENDATIONS FOLLOW YOUR ${up(system.label)} DIRECTION AND CAN STILL CHANGE AT BLUEPRINT REVIEW.`;
}

/** True when two selections would show identical creative expression rows (regression guard). */
export function creativeExpressionSignature(selection: BuilderSelection): string {
  const dims = resolveDesignDetails(selection).filter((d) => d.key !== 'STRUCTURE' && d.key !== 'INTERACTION_CHARACTER');
  return dims.map((d) => `${d.key}:${d.value ?? '-'}:${d.provenance}:${d.fitNote}`).join('|');
}

export type DesignConflict = {
  dimension: DesignDetailKey;
  message: string;
  recommendation: string;
};

/** Surfaces pairing tension without overriding explicit client choices. */
export function designConflicts(selection: BuilderSelection): DesignConflict[] {
  const conflicts: DesignConflict[] = [];
  const system = primarySystem(selection);
  if (!system) return conflicts;
  const d = system.defaults;
  if (selection.type !== 'SYSTEM_DEFAULT' && selection.type !== d.type) {
    conflicts.push({
      dimension: 'TYPOGRAPHY',
      message: `YOUR TYPE CHOICE DIFFERS FROM THE DEFAULT FOR ${system.label.toUpperCase()}.`,
      recommendation: 'WE KEEP YOUR SELECTION AND ADJUST SPACING AND HIERARCHY SO IT STILL READS CLEARLY.',
    });
  }
  if (selection.color !== 'SYSTEM_DEFAULT' && selection.color !== d.color) {
    conflicts.push({
      dimension: 'COLOR_DIRECTION',
      message: `YOUR COLOUR CHOICE DIFFERS FROM THE DEFAULT FOR ${system.label.toUpperCase()}.`,
      recommendation: 'WE KEEP YOUR SELECTION AND CHECK CONTRAST ACROSS KEY ACTIONS.',
    });
  }
  return conflicts;
}

export type { TypeDirectionId, ColorDirectionId, ImageWorldId, MotionCharacterId };
