import type { SelfDirectedNavSection } from './types.js';

export const SELF_DIRECTED_NAV: readonly { id: SelfDirectedNavSection; label: string }[] = [
  { id: 'home', label: 'HOME' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'reviews', label: 'REVIEWS' },
  { id: 'inbox', label: 'INBOX' },
  { id: 'profile', label: 'PROFILE' },
] as const;

export function selfDirectedSectionPath(projectSlug: string, section: SelfDirectedNavSection): string {
  const base = `/app/projects/${projectSlug}`;
  if (section === 'home') return base;
  if (section === 'projects') return `${base}/projects`;
  return `${base}/${section}`;
}
