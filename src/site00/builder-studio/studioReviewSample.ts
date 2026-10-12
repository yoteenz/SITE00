import { emptySpatialState, SPATIAL_ROOM_ORDER, type SpatialBuilderState, type SpatialRoomId } from '../builder-experience/spatialStudio';

/**
 * `?reviewRoom=PLACE|FEEL|WORK|PACE|BLUEPRINT` — frozen sample for `/foundation/review` iframes.
 * Choices stay in memory only; nothing is saved or submitted.
 */
export function reviewSampleFromQuery(value: string | null): SpatialBuilderState | null {
  if (!value || !(SPATIAL_ROOM_ORDER as readonly string[]).includes(value)) return null;
  return {
    ...emptySpatialState(),
    room: value as SpatialRoomId,
    placePath: 'ADVANCED',
    feelVibe: 'MODERN',
    workModules: ['PAGES', 'SHOP', 'PORTAL'],
    pace: 'STANDARD',
  };
}

export function studioPathForReviewRoom(spatialRoom: string): string {
  const id = spatialRoom.toLowerCase();
  if (id === 'place' || id === 'feel' || id === 'work' || id === 'pace' || id === 'blueprint') return id;
  return 'place';
}
