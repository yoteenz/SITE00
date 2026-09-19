/**
 * Project-specific adapters — keep generic lab free of brand hard-coding.
 */

export type RealismLabProjectAdapter = {
  adapterId: string;
  projectSlug: string;
  enabled: boolean;
  defaultShotType?: string;
  referencePackSeed?: Array<{ type: string; label: string; role: string }>;
  inspectNotes?: string[];
};

const ADAPTERS: RealismLabProjectAdapter[] = [
  {
    adapterId: 'ndxbook-realism-lab-v1',
    projectSlug: 'ndxbook',
    enabled: true,
    defaultShotType: 'LUXURY_CAR_SEATED',
    referencePackSeed: [
      { type: 'IDENTITY', label: 'NDX founder identity direction', role: 'identity anchor' },
    ],
    inspectNotes: ['NDXBOOK adapter — luxury founder lifestyle realism benchmarks'],
  },
  {
    adapterId: 'frontal-slayer-realism-lab-v1',
    projectSlug: 'frontal-slayer',
    enabled: true,
    inspectNotes: ['Frontal Slayer adapter slot — configure references per campaign'],
  },
];

export function getRealismLabAdapter(projectSlug: string): RealismLabProjectAdapter | null {
  return ADAPTERS.find((a) => a.projectSlug === projectSlug && a.enabled) ?? null;
}

export function realismLabEnabledForProject(projectSlug: string): boolean {
  return getRealismLabAdapter(projectSlug)?.enabled ?? false;
}
