/**
 * Founder-facing media productions that own their own canon and production records.
 * Studio World (and Character Studios / Director Composer) are shared workspaces — not parent IP.
 */

export const INDEPENDENT_MEDIA_PROJECT_KEYS = ['ndxbook', 'the-exchange'] as const;

export type IndependentMediaProjectKey = (typeof INDEPENDENT_MEDIA_PROJECT_KEYS)[number];

export function isIndependentMediaProjectKey(projectId: string): projectId is IndependentMediaProjectKey {
  return (INDEPENDENT_MEDIA_PROJECT_KEYS as readonly string[]).includes(projectId.toLowerCase());
}

/** Studio World is production infrastructure — never a media project's parent slug. */
export const STUDIO_WORLD_INFRASTRUCTURE_PROJECT_KEY = 'studio-world' as const;

export function assertNotStudioWorldOwnedMedia(projectId: string): void {
  if (projectId.toLowerCase() === STUDIO_WORLD_INFRASTRUCTURE_PROJECT_KEY) {
    throw new Error('Studio World is infrastructure, not a media parent');
  }
}
