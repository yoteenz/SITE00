import type { ClientAppNavSection } from './types.js';

export const CLIENT_APP_INVITATION_COPY = {
  headline: 'YOUR PROJECT ROOM IS READY.',
  subhead: 'Take your SITE 00 project with you.',
  bullets: ['live updates', 'review alerts', 'approvals', 'messages', 'files', 'milestones'],
  ctaLabel: 'OPEN IN APP',
};

export const CLIENT_APP_ROUTE_PREFIX = '/app';

export function clientAppPath(projectSlug?: string, section?: ClientAppNavSection): string {
  if (!projectSlug) return `${CLIENT_APP_ROUTE_PREFIX}/projects`;
  const base = `${CLIENT_APP_ROUTE_PREFIX}/projects/${projectSlug}`;
  if (!section || section === 'home') return base;
  if (section === 'project') return `${base}/project/map`;
  return `${base}/${section}`;
}

export function clientAppProjectSectionPath(projectSlug: string, section: string): string {
  return `${CLIENT_APP_ROUTE_PREFIX}/projects/${projectSlug}/project/${section}`;
}

export function clientAppReviewPath(projectSlug: string, reviewId: string, sub?: string): string {
  const base = `${CLIENT_APP_ROUTE_PREFIX}/projects/${projectSlug}/reviews/${reviewId}`;
  return sub ? `${base}/${sub}` : base;
}

export function clientAppLibraryPath(projectSlug: string, categoryId?: string, fileId?: string): string {
  const base = `${CLIENT_APP_ROUTE_PREFIX}/projects/${projectSlug}/library`;
  if (!categoryId) return base;
  if (!fileId) return `${base}/${categoryId}`;
  return `${base}/${categoryId}/${fileId}`;
}

export function clientAppInboxPath(projectSlug: string, threadId?: string): string {
  const base = `${CLIENT_APP_ROUTE_PREFIX}/projects/${projectSlug}/inbox`;
  return threadId ? `${base}/${threadId}` : base;
}

export const CLIENT_APP_NAV: { id: ClientAppNavSection; label: string }[] = [
  { id: 'home', label: 'HOME' },
  { id: 'project', label: 'PROJECT' },
  { id: 'reviews', label: 'REVIEWS' },
  { id: 'inbox', label: 'INBOX' },
  { id: 'library', label: 'LIBRARY' },
];
