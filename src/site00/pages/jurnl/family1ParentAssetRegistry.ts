/**
 * Semantic registry. Only assets with an independent runtime reason are mounted.
 */
export type Family1AssetRecord = {
  asset_id: string;
  asset_role: string;
  runtime_path: string;
  component: string;
  classification: 'ENVIRONMENT_PLATE' | 'REUSABLE_BRAND_ASSET';
  transparent_background: boolean;
};

export const FAMILY1_PARENT_ROUTE = '/jurnl/f01/parent-assembly';

export const FAMILY1_PARENT_ASSETS: Family1AssetRecord[] = [
  {
    asset_id: 'ENTRY.ENVIRONMENT.PLATE.001',
    asset_role: 'environment_plate',
    runtime_path: '/jurnl/f01-asset-first/assets/ENTRY.ENVIRONMENT.PLATE.001.png',
    component: 'EnvironmentPlate',
    classification: 'ENVIRONMENT_PLATE',
    transparent_background: false,
  },
  {
    asset_id: 'ENTRY.LOGO.OFFICIAL.001',
    asset_role: 'brand_mark',
    runtime_path: '/jurnl/f01-asset-first/assets/ENTRY.LOGO.OFFICIAL.001.jpg',
    component: 'OfficialLogo',
    classification: 'REUSABLE_BRAND_ASSET',
    transparent_background: false,
  },
];
