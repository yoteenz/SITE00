/**
 * Deterministic design resolution for Blueprint STRUCTURE tab — separates experience structure,
 * creative expression, and SITE 00 recommendations with traceable provenance.
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
  value: string | null;
  provenance: DesignProvenance;
  /** Client-facing provenance line (upper case). */
  provenanceLabel: string;
  /** Compact fit note (upper case). */
  fitNote: string;
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

function labelOf<T extends { id: string; label: string }>(list: readonly T[], id: string | null): string | null {
  if (!id) return null;
  return list.find((item) => item.id === id)?.label ?? null;
}

function primarySystem(selection: BuilderSelection) {
  const primary = selection.expression.primary;
  return primary && primary !== 'CUSTOM' ? EXPRESSION_BY_ID[primary] : null;
}

function resolveStructure(selection: BuilderSelection): ResolvedDesignDetail {
  const primary = selection.structure ? STRUCTURE_BY_ID[selection.structure] : null;
  const second = selection.structureSecondary ? STRUCTURE_BY_ID[selection.structureSecondary] : null;
  const value = primary ? up(second ? `${primary.label} + ${second.label}` : primary.label) : null;
  const provenance: DesignProvenance = value ? 'CLIENT_SELECTED' : 'UNDECIDED';
  const fitNote = primary
    ? up(`ORGANIZES HOW PEOPLE MOVE THROUGH ${value}${second ? '' : ''} — NOT THE FULL VISUAL IDENTITY ON ITS OWN.`)
    : 'CHOOSE A STRUCTURAL GRAMMAR IN THE BUILDER TO SEE HOW YOUR PLACE IS ORGANIZED.';
  return { key: 'STRUCTURE', label: 'STRUCTURE', value, provenance, provenanceLabel: provenanceLabel(provenance), fitNote };
}

type TunableDim = 'type' | 'color' | 'imageWorld' | 'motion';

function resolveTunable(
  selection: BuilderSelection,
  dim: TunableDim,
  key: DesignDetailKey,
  label: string,
  list: readonly { id: string; label: string }[],
  defaultKey: 'type' | 'color' | 'imageWorld' | 'motion',
): ResolvedDesignDetail {
  const system = primarySystem(selection);
  const raw = selection[dim];
  const isDefault = raw === 'SYSTEM_DEFAULT';
  const resolvedId = isDefault
    ? dim === 'motion'
      ? effectiveMotion(selection)
      : (system?.defaults[defaultKey] as string | undefined) ?? null
    : raw;
  const value = labelOf(list, resolvedId)?.toUpperCase() ?? null;

  let provenance: DesignProvenance = 'UNDECIDED';
  if (!isDefault && raw) {
    provenance = 'CLIENT_SELECTED';
  } else if (dim === 'color' && isDefault && selection.brand === 'READY') {
    provenance = 'CLIENT_BRAND_SOURCE';
  } else if (isDefault && system) {
    provenance = 'SITE00_RECOMMENDED';
  } else if (!isDefault) {
    provenance = 'CLIENT_SELECTED';
  }

  // Spatial IMMERSIVE path sets image/motion explicitly in mapping — treat as client direction via feel.
  if (
    isDefault &&
    dim === 'imageWorld' &&
    selection.imageWorld === 'SPATIAL_3D' &&
    selection.expression.primary === 'CINEMATIC_LUXURY'
  ) {
    provenance = 'CLIENT_SELECTED';
  }
  if (isDefault && dim === 'motion' && selection.motion === 'CINEMATIC' && selection.expression.primary === 'CINEMATIC_LUXURY') {
    provenance = 'CLIENT_SELECTED';
  }

  const fitNote = fitNoteForDim(dim, selection, resolvedId as string | null, system?.label ?? null);
  return { key, label, value, provenance, provenanceLabel: provenanceLabel(provenance), fitNote };
}

function fitNoteForDim(
  dim: TunableDim,
  selection: BuilderSelection,
  resolvedId: string | null,
  systemLabel: string | null,
): string {
  const structure = selection.structure ? STRUCTURE_BY_ID[selection.structure].label.toUpperCase() : 'YOUR BUILD';
  switch (dim) {
    case 'type':
      return resolvedId
        ? `TYPE HIERARCHY SUPPORTS ${structure} WITHOUT REPLACING ITS STRUCTURAL ROLE.`
        : 'TYPOGRAPHY IS SET WITH YOU ONCE STRUCTURE AND DIRECTION ARE CLEAR.';
    case 'color':
      if (selection.brand === 'READY') return 'PALETTE FOLLOWS YOUR ESTABLISHED BRAND WITH CONTRAST CHECKED FOR THE WEB.';
      if (selection.brand === 'IN_PROGRESS') return 'COLOUR EVOLVES WITH YOUR BRAND AS IT SETTLES — WE KEEP IT COHERENT WITH THE STRUCTURE.';
      return systemLabel
        ? `COLOUR RELATIONSHIPS SUGGESTED FROM YOUR ${systemLabel.toUpperCase()} DIRECTION AND ${structure}.`
        : 'COLOUR DIRECTION IS CHOSEN WITH YOU AT BLUEPRINT REVIEW.';
    case 'imageWorld':
      return resolvedId
        ? `IMAGERY STYLE SUPPORTS ${structure} — WHAT PEOPLE SEE, NOT HOW PAGES ARE NAMED.`
        : 'IMAGE TREATMENT IS REFINED WITH YOUR CONTENT AND BRAND.';
    case 'motion':
      return resolvedId
        ? `MOTION CHARACTER MATCHES INTERACTION DENSITY FOR ${structure}.`
        : 'MOTION IS CALIBRATED TO YOUR PACE AND ACCESSIBILITY NEEDS.';
    default:
      return '';
  }
}

function resolveComposition(selection: BuilderSelection): ResolvedDesignDetail {
  const system = primarySystem(selection);
  const influences = expressionInfluences(selection);
  const value = system ? up(system.composition) : selection.expression.primary === 'CUSTOM' ? 'CUSTOM CREATIVE DIRECTION' : null;
  const provenance: DesignProvenance = selection.expression.primary === 'CUSTOM' ? 'CLIENT_SELECTED' : system ? 'SITE00_RECOMMENDED' : 'UNDECIDED';
  const influenceNote =
    influences.length > 0
      ? ` BLENDS INFLUENCE FROM ${influences.map((id) => EXPRESSION_BY_ID[id].label.toUpperCase()).join(' · ')}.`
      : '';
  return {
    key: 'COMPOSITION',
    label: 'COMPOSITION',
    value,
    provenance,
    provenanceLabel: provenanceLabel(provenance),
    fitNote: value
      ? `HOW TYPE, SPACE AND FOCAL POINTS ARE ARRANGED ON EACH PAGE.${influenceNote}`
      : 'COMPOSITION IS SHAPED WITH YOU ONCE STRUCTURE AND CONTENT PRIORITIES ARE SET.',
  };
}

function resolveInteraction(selection: BuilderSelection): ResolvedDesignDetail {
  const system = primarySystem(selection);
  const motion = effectiveMotion(selection);
  const motionLabel = labelOf(MOTION_CHARACTERS, motion);
  const value = system ? up(system.motionCharacter) : motionLabel ? up(motionLabel) : null;
  const provenance: DesignProvenance =
    selection.motion !== 'SYSTEM_DEFAULT' ? 'CLIENT_SELECTED' : system ? 'SITE00_RECOMMENDED' : 'UNDECIDED';
  return {
    key: 'INTERACTION_CHARACTER',
    label: 'INTERACTION CHARACTER',
    value,
    provenance,
    provenanceLabel: provenanceLabel(provenance),
    fitNote: value
      ? 'HOW TRANSITIONS AND FEEDBACK FEEL WHEN PEOPLE MOVE THROUGH YOUR PAGES.'
      : 'INTERACTION CHARACTER IS CALIBRATED WITH YOUR TEAM AND ACCESSIBILITY NEEDS.',
  };
}

/** Full design-details row set for the STRUCTURE tab (structure is separate from aesthetic dimensions). */
export function resolveDesignDetails(selection: BuilderSelection): ResolvedDesignDetail[] {
  return [
    resolveStructure(selection),
    resolveTunable(selection, 'type', 'TYPOGRAPHY', 'TYPOGRAPHY', TYPE_DIRECTIONS, 'type'),
    resolveTunable(selection, 'color', 'COLOR_DIRECTION', 'COLOR DIRECTION', COLOR_DIRECTIONS, 'color'),
    resolveTunable(selection, 'imageWorld', 'IMAGE_WORLD', 'IMAGE WORLD', IMAGE_WORLDS, 'imageWorld'),
    resolveTunable(selection, 'motion', 'MOTION', 'MOTION', MOTION_CHARACTERS, 'motion'),
    resolveComposition(selection),
    resolveInteraction(selection),
  ];
}

/** True when two selections would show identical creative expression rows (regression guard). */
export function creativeExpressionSignature(selection: BuilderSelection): string {
  const dims = resolveDesignDetails(selection).filter((d) => d.key !== 'STRUCTURE');
  return dims.map((d) => `${d.key}:${d.value ?? '-'}:${d.provenance}`).join('|');
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
