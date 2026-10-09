/** Hybrid Spatial Studio — UI state (maps onto `BuilderSelection` via `spatialSelectionToBuilder`). */

export type SpatialRoomId = 'PLACE' | 'FEEL' | 'WORK' | 'PACE' | 'BLUEPRINT';

export type PlacePathId = 'SIMPLE' | 'ADVANCED' | 'CUSTOM' | 'WORLD';

export type FeelVibeId = 'MODERN' | 'BOLD' | 'EDITORIAL' | 'IMMERSIVE';

export type WorkModuleId = 'PAGES' | 'SHOP' | 'BOOKING' | 'MEMBER_AREA' | 'BLOG' | 'PORTAL';

export type PacePreferenceId = 'STANDARD' | 'EXPEDITED' | 'FLEXIBLE';

export type BlueprintSectionId = 'OVERVIEW' | 'STRUCTURE' | 'PAGES' | 'FEATURES' | 'TIMELINE';

export type BuildObjectViewId = 'FRONT' | 'SIDE' | 'EXPLODED';

export type SpatialBuilderState = {
  version: 1;
  room: SpatialRoomId;
  placePath: PlacePathId | null;
  feelVibe: FeelVibeId | null;
  workModules: WorkModuleId[];
  pace: PacePreferenceId | null;
  paceNotes: string;
  blueprintSection: BlueprintSectionId;
  buildObjectView: BuildObjectViewId;
  savedAt: string | null;
};

export const SPATIAL_ROOM_ORDER: SpatialRoomId[] = ['PLACE', 'FEEL', 'WORK', 'PACE', 'BLUEPRINT'];

export const PLACE_OPTIONS: readonly {
  id: PlacePathId;
  label: string;
  hint: string;
}[] = [
  { id: 'SIMPLE', label: 'SIMPLE', hint: 'REFINE AN ESTABLISHED SYSTEM' },
  { id: 'ADVANCED', label: 'ADVANCED', hint: 'RESHAPE THE SYSTEM' },
  { id: 'CUSTOM', label: 'CUSTOM', hint: 'BUILD FROM ZERO' },
  { id: 'WORLD', label: 'WORLD', hint: 'CREATE A CONNECTED ENVIRONMENT' },
];

export const FEEL_OPTIONS: readonly { id: FeelVibeId; label: string; hint: string }[] = [
  { id: 'MODERN', label: 'MODERN', hint: 'CLEAR, CONTEMPORARY ARCHITECTURAL MINIMALISM.' },
  { id: 'BOLD', label: 'BOLD', hint: 'HIGH CONTRAST, GRAPHIC PRESENCE.' },
  { id: 'EDITORIAL', label: 'EDITORIAL', hint: 'LITERATE RHYTHM AND EDITORIAL COMPOSITION.' },
  { id: 'IMMERSIVE', label: 'IMMERSIVE', hint: 'CINEMATIC DEPTH AND SPATIAL ATMOSPHERE.' },
];

export const WORK_OPTIONS: readonly { id: WorkModuleId; label: string; hint: string }[] = [
  { id: 'PAGES', label: 'PAGES', hint: 'CORE PAGES AND CONTENT YOU CAN UPDATE.' },
  { id: 'SHOP', label: 'SHOP', hint: 'CATALOG, PRODUCT AND CHECKOUT.' },
  { id: 'BOOKING', label: 'BOOKING', hint: 'RESERVATIONS AND APPOINTMENTS.' },
  { id: 'MEMBER_AREA', label: 'MEMBER AREA', hint: 'SIGNED-IN MEMBERSHIP SPACE.' },
  { id: 'BLOG', label: 'BLOG', hint: 'STORIES AND PUBLISHING RHYTHM.' },
  { id: 'PORTAL', label: 'PORTAL', hint: 'RECORDS, DASHBOARD AND SIGNED-IN WORK.' },
];

export const PACE_OPTIONS: readonly { id: PacePreferenceId; label: string; hint: string }[] = [
  { id: 'STANDARD', label: 'STANDARD', hint: 'OUR TYPICAL TIMELINE' },
  { id: 'EXPEDITED', label: 'EXPEDITED', hint: 'PRIORITY PLACEMENT' },
  { id: 'FLEXIBLE', label: 'FLEXIBLE', hint: 'EXTENDED TIMELINE' },
];

export function emptySpatialState(): SpatialBuilderState {
  return {
    version: 1,
    room: 'PLACE',
    placePath: null,
    feelVibe: null,
    workModules: ['PAGES'],
    pace: null,
    paceNotes: '',
    blueprintSection: 'OVERVIEW',
    buildObjectView: 'FRONT',
    savedAt: null,
  };
}
