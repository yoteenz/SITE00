const FOUNDER_PROJECT_LABELS: Record<string, string> = {
  ndxbook: 'NDX BOOK',
  'frontal-slayer': 'FRONTAL SLAYER',
  'studio-world': 'STUDIO WORLD',
  'all-in-one-enterprises': 'ALL IN ONE ENTERPRISES',
};

/** Client-safe project title — never exposes internal UUIDs. */
export function projectDisplayName(projectSlug: string, fallbackDisplayName?: string | null): string {
  if (fallbackDisplayName?.trim()) return fallbackDisplayName.trim().toUpperCase();
  const mapped = FOUNDER_PROJECT_LABELS[projectSlug.toLowerCase()];
  if (mapped) return mapped;
  return projectSlug.replace(/-/g, ' ').toUpperCase();
}
