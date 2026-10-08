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
  { id: 'MODERN', label: 'MODERN', hint: 'Clear, contemporary architectural minimalism.' },
  { id: 'BOLD', label: 'BOLD', hint: 'High contrast, graphic presence.' },
  { id: 'EDITORIAL', label: 'EDITORIAL', hint: 'Literate rhythm and editorial composition.' },
  { id: 'IMMERSIVE', label: 'IMMERSIVE', hint: 'Cinematic depth and spatial atmosphere.' },
];

export const WORK_OPTIONS: readonly { id: WorkModuleId; label: string; hint: string }[] = [
  { id: 'PAGES', label: 'PAGES', hint: 'Core pages and content you can update.' },
  { id: 'SHOP', label: 'SHOP', hint: 'Catalog, product and checkout.' },
  { id: 'BOOKING', label: 'BOOKING', hint: 'Reservations and appointments.' },
  { id: 'MEMBER_AREA', label: 'MEMBER AREA', hint: 'Signed-in membership space.' },
  { id: 'BLOG', label: 'BLOG', hint: 'Stories and publishing rhythm.' },
  { id: 'PORTAL', label: 'PORTAL', hint: 'Records, dashboard and signed-in work.' },
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
