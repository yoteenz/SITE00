export * from './types.js';
export * from './capabilities.js';
export * from './manifestTemplates.js';
export * from './translators.js';
export * from './viewModel.js';

export const CLIENT_PROJECT_ROOM_ROUTE_PREFIX = '/client/projects';

export function clientProjectRoomPath(projectSlug: string, section?: string): string {
  const base = `${CLIENT_PROJECT_ROOM_ROUTE_PREFIX}/${projectSlug}`;
  if (!section || section === 'overview') return base;
  return `${base}/${section}`;
}

export const CLIENT_PROJECT_ROOM_NAV: { id: string; label: string; section: string }[] = [
  { id: 'overview', label: 'OVERVIEW', section: 'overview' },
  { id: 'reviews', label: 'REVIEWS', section: 'reviews' },
  { id: 'library', label: 'LIBRARY', section: 'library' },
  { id: 'activity', label: 'ACTIVITY', section: 'activity' },
  { id: 'messages', label: 'MESSAGES', section: 'messages' },
];
