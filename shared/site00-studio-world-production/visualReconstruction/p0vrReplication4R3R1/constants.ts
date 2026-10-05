export const P0_VR_REPLICATION_4R3R1_BUILD = 'v338' as const;

export const HERO_OBJECT_IDS = [
  'H01',
  'H02',
  'H03',
  'H04',
  'H05',
  'H06',
  'H07',
  'H08',
  'H09',
  'H10',
  'H11',
  'H12',
  'H13',
  'H14',
] as const;

export type HeroObjectIdR3R1 = (typeof HERO_OBJECT_IDS)[number];
