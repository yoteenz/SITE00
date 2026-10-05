/**
 * Studio World production departments + catalogue growth principle.
 */

export const STUDIO_WORLD_DEPARTMENTS = [
  'CASTING',
  'WARDROBE',
  'HAIR',
  'MAKEUP_GROOMING',
  'PERFORMANCE',
  'ANIMATION',
  'ENVIRONMENTS',
  'SETS',
  'PROPS',
  'GRAPHICS',
  'LOCATIONS_BACKLOT',
] as const;

export type StudioWorldDepartment = (typeof STUDIO_WORLD_DEPARTMENTS)[number];

export const DEPARTMENT_UX_CAMPUS = [
  { department: 'CASTING', label: 'Casting Office' },
  { department: 'WARDROBE', label: 'Wardrobe Department' },
  { department: 'HAIR', label: 'Hair Department' },
  { department: 'MAKEUP_GROOMING', label: 'Hair + Makeup' },
  { department: 'PERFORMANCE', label: 'Performance Lab' },
  { department: 'ENVIRONMENTS', label: 'Backlot' },
  { department: 'SETS', label: 'Set Construction' },
  { department: 'PROPS', label: 'Prop House' },
  { department: 'GRAPHICS', label: 'Graphics Department' },
  { department: 'ANIMATION', label: 'Screening Room' },
] as const;

export type CatalogueGrowthRequest = {
  originatingProductionNeedId: string;
  department: StudioWorldDepartment;
  approved: boolean;
  tagged: boolean;
  bulkGeneration: boolean;
};

export function catalogueGrowsOnDemandOnly(request: CatalogueGrowthRequest): boolean {
  return request.approved && request.tagged && !request.bulkGeneration && Boolean(request.originatingProductionNeedId);
}

export type CrossCampaignRepetitionSignal = {
  assetType: string;
  assetId: string;
  recentCampaignCount: number;
  advisory: string | null;
};

export function flagAccidentalRepetition(count: number, threshold: number): CrossCampaignRepetitionSignal | null {
  if (count < threshold) return null;
  return {
    assetType: 'generic',
    assetId: '',
    recentCampaignCount: count,
    advisory: 'Same asset used frequently across unrelated campaigns — confirm intentional motif',
  };
}
