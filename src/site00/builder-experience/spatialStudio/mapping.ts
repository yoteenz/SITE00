import type { CapabilityId, BuilderSelection } from '../types';
import { emptySelection } from '../samples';
import { DEFAULT_WORLD_SELECTION } from '../toEstimateConfig';
import type { PacePreferenceId, PlacePathId, SpatialBuilderState, WorkModuleId } from './types';

const FEEL_TO_SYSTEM = {
  MODERN: 'ARCHITECTURAL_MINIMAL',
  BOLD: 'POP_EDITORIAL',
  EDITORIAL: 'EDITORIAL_OBJECT',
  IMMERSIVE: 'CINEMATIC_LUXURY',
} as const;

/** The capabilities each WORK module adds to the canonical selection (read by the Blueprint anatomy). */
export const WORK_TO_CAPABILITIES: Record<WorkModuleId, CapabilityId[]> = {
  PAGES: ['EDIT_CONTENT'],
  SHOP: ['SELL'],
  BOOKING: ['BOOK'],
  MEMBER_AREA: ['MEMBERSHIP'],
  BLOG: ['EDIT_CONTENT'],
  PORTAL: ['DATA_PORTAL'],
};

const PACE_TO_DELIVERY: Record<PacePreferenceId, BuilderSelection['delivery']> = {
  STANDARD: 'STANDARD',
  EXPEDITED: 'PRIORITY',
  FLEXIBLE: 'CUSTOM_SCHEDULE',
};

function structureForPlace(path: PlacePathId): BuilderSelection['structure'] {
  switch (path) {
    case 'SIMPLE':
      return 'SERVICE';
    case 'ADVANCED':
      return 'EDITORIAL';
    case 'CUSTOM':
      return 'SERVICE';
    case 'WORLD':
      return null;
    default:
      return 'SERVICE';
  }
}

function buildKindForPlace(path: PlacePathId): BuilderSelection['build'] {
  if (path === 'WORLD') return 'WORLD';
  return 'SITE';
}

/** Maps approved spatial UI state onto the canonical Builder selection contract. */
export function spatialSelectionToBuilder(state: SpatialBuilderState): BuilderSelection {
  const base = emptySelection();
  if (!state.placePath) {
    return base;
  }

  const capabilities = new Set<CapabilityId>();
  for (const mod of state.workModules) {
    for (const cap of WORK_TO_CAPABILITIES[mod]) capabilities.add(cap);
  }

  const feel = state.feelVibe;
  const visualSystem = feel ? FEEL_TO_SYSTEM[feel] : null;

  const expressionPrimary =
    state.placePath === 'CUSTOM' ? ('CUSTOM' as const) : visualSystem ? (visualSystem as BuilderSelection['expression']['primary']) : null;

  const selection: BuilderSelection = {
    ...base,
    build: buildKindForPlace(state.placePath),
    structure: structureForPlace(state.placePath),
    structureSecondary: null,
    world: state.placePath === 'WORLD' ? { ...DEFAULT_WORLD_SELECTION, form: 'SHOWROOM', depth: 'LAYERED' } : null,
    expression: {
      primary: expressionPrimary,
      secondary: null,
      likedParts: [],
      edition: state.placePath === 'ADVANCED' || state.placePath === 'CUSTOM' ? 'FULL' : 'ESSENTIAL',
      customDirectionNote: state.placePath === 'CUSTOM' ? state.paceNotes || undefined : undefined,
    },
    type: 'SYSTEM_DEFAULT',
    color: 'SYSTEM_DEFAULT',
    imageWorld: state.feelVibe === 'IMMERSIVE' ? 'SPATIAL_3D' : 'SYSTEM_DEFAULT',
    motion: state.feelVibe === 'IMMERSIVE' ? 'CINEMATIC' : 'SYSTEM_DEFAULT',
    capabilities: [...capabilities],
    experiences: null,
    viewports: state.placePath === 'WORLD' ? 'ADAPTIVE' : 'PHONE_AND_DESKTOP',
    brand: 'IN_PROGRESS',
    content: 'PARTIAL',
    delivery: state.pace ? PACE_TO_DELIVERY[state.pace] : 'STANDARD',
    keepItSimple: state.placePath === 'SIMPLE',
  };

  if (state.workModules.includes('BLOG') && !capabilities.has('SELL')) {
    // Blog adds publishing surface without commerce.
  }

  return selection;
}

export function roomIndex(room: SpatialBuilderState['room']): number {
  const order = ['PLACE', 'FEEL', 'WORK', 'PACE', 'BLUEPRINT'] as const;
  return order.indexOf(room);
}

export function canEnterRoom(state: SpatialBuilderState, room: SpatialBuilderState['room']): boolean {
  if (room === 'PLACE') return true;
  if (!state.placePath) return false;
  if (room === 'FEEL') return true;
  if (room === 'WORK') return Boolean(state.feelVibe);
  if (room === 'PACE') return state.workModules.length > 0;
  if (room === 'BLUEPRINT') return Boolean(state.pace);
  return false;
}
