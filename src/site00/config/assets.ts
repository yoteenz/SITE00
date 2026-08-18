/**
 * SITE 00 asset registry — metadata for environments, objects, icons.
 * Components resolve assets through this registry, not hardcoded filenames.
 */

export type AssetType = 'environment' | 'object' | 'icon' | 'texture' | 'motion' | 'interface-reference';

export type AssetStatus = 'reference-only' | 'temporary' | 'production' | 'pending';

export type Site00Asset = {
  id: string;
  type: AssetType;
  src?: string;
  alt: string;
  environment?: string;
  route?: string;
  status: AssetStatus;
  notes?: string;
};

export const SITE00_ASSET_REGISTRY: Site00Asset[] = [
  {
    id: 'env-origin',
    type: 'environment',
    alt: 'SITE 00 Origin architectural environment',
    environment: 'ORIGIN_ENVIRONMENT',
    route: '/',
    status: 'production',
    notes: 'Desktop 942898D3-6953-47CD-8987-0697EC1C9F11.png · mobile C63192EC-00BE-46DB-8D3A-952173F6F5D1.png @ live-preview/site00',
  },
  {
    id: 'env-workflow',
    type: 'environment',
    alt: 'SITE 00 workflow hall environment',
    environment: 'WORKFLOW_ENVIRONMENT',
    route: '/idnty/state',
    status: 'production',
    notes: 'Desktop background — live-preview/site00/3A2AC3AD-7192-45E8-B4B3-B811CB0DD792.png (/idnty/state, /bldr/state)',
  },
  {
    id: 'env-enter-00',
    type: 'environment',
    alt: 'ENTER 00 waiting room lobby',
    environment: 'ENTER_00_WAITING_ROOM',
    route: '/enter',
    status: 'production',
    notes: 'Desktop background — live-preview/site00/89319E70-D080-4798-9BCA-E53B137F2387.png',
  },
  {
    id: 'obj-idnty-state-00',
    type: 'object',
    alt: 'IDNTY Starting at Zero brand state icon',
    route: '/idnty/state',
    status: 'production',
    notes: 'live-preview/site00/IDNTY/D4E43816-FA69-4D9A-A45D-66D2339C8B4C.png',
  },
  {
    id: 'obj-idnty-state-01',
    type: 'object',
    alt: 'IDNTY Some Pieces Exist brand state icon',
    route: '/idnty/state',
    status: 'production',
    notes: 'live-preview/site00/IDNTY/D95E546E-FDCA-4A96-8803-3115C6E64F80.png',
  },
  {
    id: 'obj-idnty-state-02',
    type: 'object',
    alt: 'IDNTY Ready for Evolution brand state icon',
    route: '/idnty/state',
    status: 'production',
    notes: 'live-preview/site00/IDNTY/D6A87CF3-DC4A-4411-AEC1-3597BADA5CFF.png',
  },
  {
    id: 'obj-idnty-state-03',
    type: 'object',
    alt: 'IDNTY Build Ready brand state icon',
    route: '/idnty/state',
    status: 'production',
    notes: 'live-preview/site00/IDNTY/275DBF51-6D60-4203-BEB3-0BFFE8E6F95F.png',
  },
  {
    id: 'obj-bldr-site',
    type: 'object',
    alt: 'BLDR SITE build class icon',
    route: '/bldr/state',
    status: 'production',
    notes: 'live-preview/site00/BLDR/33910244-AF13-479A-8861-1CE66A1D68C4.png',
  },
  {
    id: 'obj-bldr-world',
    type: 'object',
    alt: 'BLDR WORLD build class icon',
    route: '/bldr/state',
    status: 'production',
    notes: 'live-preview/site00/BLDR/D5F4496A-52AB-491F-A3C4-7CE01FAF0D05.png',
  },
  {
    id: 'obj-bldr-enterprise',
    type: 'object',
    alt: 'BLDR ENTERPRISE build class icon',
    route: '/bldr/state',
    status: 'production',
    notes: 'live-preview/site00/BLDR/5144412A-BD84-4299-950C-48252FE7F4DD.png',
  },
  {
    id: 'obj-bldr-discovery',
    type: 'object',
    alt: 'BLDR NOT SURE discovery icon',
    route: '/bldr/state',
    status: 'production',
    notes: 'live-preview/site00/BLDR/CA16B9A4-AA16-445F-9C05-AB24C979BFD0.png',
  },
  {
    id: 'icon-geometric-red',
    type: 'icon',
    alt: 'SITE 00 red wireframe icons',
    status: 'temporary',
    notes: 'CSS/SVG wireframe placeholders until production icon set',
  },
  {
    id: 'icon-origin-idnty-panel',
    type: 'icon',
    alt: 'IDNTY collapsed panel icon',
    route: '/origin',
    status: 'production',
    notes: 'Desktop Origin panel — live-preview/site00/A97879A2-FFEA-4BD5-AC0A-74359620A851.png',
  },
  {
    id: 'icon-origin-bldr-panel',
    type: 'icon',
    alt: 'BLDR collapsed panel icon',
    route: '/origin',
    status: 'production',
    notes: 'Desktop Origin panel — live-preview/site00/0C81A5FC-35AD-4C8B-A292-5BF88E14193E.png',
  },
];

export function getAsset(id: string): Site00Asset | undefined {
  return SITE00_ASSET_REGISTRY.find((a) => a.id === id);
}
