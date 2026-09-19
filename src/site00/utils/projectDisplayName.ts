import { canonicalBrandDisplayName } from '../../../shared/site00-brand-lore/brandIdentity';

const FOUNDER_PROJECT_LABELS: Record<string, string> = {
  ndxbook: canonicalBrandDisplayName('ndxbook'),
  'frontal-slayer': 'FRONTAL SLAYER',
  'studio-world': 'STUDIO WORLD',
  'all-in-one-enterprises': 'ALL IN ONE ENTERPRISES',
};

/** Client-safe project title — never exposes internal UUIDs. */
export function projectDisplayName(projectSlug: string, fallbackDisplayName?: string | null): string {
  if (fallbackDisplayName?.trim()) {
    const raw = fallbackDisplayName.trim();
    if (projectSlug.toLowerCase() === 'ndxbook') return canonicalBrandDisplayName('ndxbook');
    return raw.toUpperCase();
  }
  const mapped = FOUNDER_PROJECT_LABELS[projectSlug.toLowerCase()];
  if (mapped) return mapped;
  return projectSlug.replace(/-/g, ' ').toUpperCase();
}
