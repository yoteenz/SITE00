/**
 * P0.VR.1D.13 — Campaign Board visual asset manifest.
 */

export type CampaignBoardAssetRole =
  | 'PAGE_01_ART'
  | 'PAGE_02_ART'
  | 'PAGE_03_ART'
  | 'PAGE_04_ART'
  | 'BOOK_IN_MOTION_INTERESTING_FAIR'
  | 'PAPER_TEXTURES'
  | 'OPTIONAL_STATUS_ARTIFACTS';

export type CampaignBoardAssetSource =
  | 'EXISTING_ASSET'
  | 'REFERENCE_CROP'
  | 'FAL_RECONSTRUCTION_REQUIRED'
  | 'DOM_REPRODUCIBLE'
  | 'BLOCKED';

export type CampaignBoardVisualAssetEntry = {
  assetRole: CampaignBoardAssetRole;
  source: CampaignBoardAssetSource;
  assetId: string;
  storagePath: string;
  referenceCrop: string | null;
  generationRequired: boolean;
  provider: 'none' | 'fal' | 'reference';
  status: 'READY' | 'MISSING' | 'BLOCKED';
};

export const CAMPAIGN_BOARD_VISUAL_ASSET_MANIFEST: CampaignBoardVisualAssetEntry[] = [
  {
    assetRole: 'PAGE_01_ART',
    source: 'EXISTING_ASSET',
    assetId: 'pages-subscription',
    storagePath: '/visual-references/founder/ndxbook/campaign-board-artwork/pages-subscription.webp',
    referenceCrop: 'mobile-campaign-board-reference-p0vr1d13.jpg',
    generationRequired: false,
    provider: 'none',
    status: 'READY',
  },
  {
    assetRole: 'PAGE_02_ART',
    source: 'EXISTING_ASSET',
    assetId: 'pages-theory',
    storagePath: '/visual-references/founder/ndxbook/campaign-board-artwork/pages-theory.webp',
    referenceCrop: 'mobile-campaign-board-reference-p0vr1d13.jpg',
    generationRequired: false,
    provider: 'none',
    status: 'READY',
  },
  {
    assetRole: 'PAGE_03_ART',
    source: 'EXISTING_ASSET',
    assetId: 'pages-serious',
    storagePath: '/visual-references/founder/ndxbook/campaign-board-artwork/pages-serious.webp',
    referenceCrop: 'mobile-campaign-board-reference-p0vr1d13.jpg',
    generationRequired: false,
    provider: 'none',
    status: 'READY',
  },
  {
    assetRole: 'PAGE_04_ART',
    source: 'EXISTING_ASSET',
    assetId: 'pages-decade',
    storagePath: '/visual-references/founder/ndxbook/campaign-board-artwork/pages-decade.webp',
    referenceCrop: 'mobile-campaign-board-reference-p0vr1d13.jpg',
    generationRequired: false,
    provider: 'none',
    status: 'READY',
  },
  {
    assetRole: 'BOOK_IN_MOTION_INTERESTING_FAIR',
    source: 'EXISTING_ASSET',
    assetId: 'book-in-motion-interesting-fair',
    storagePath: '/visual-references/founder/ndxbook/campaign-board-artwork/book-in-motion-interesting-fair.webp',
    referenceCrop: 'mobile-campaign-board-reference-p0vr1d13.jpg',
    generationRequired: false,
    provider: 'none',
    status: 'READY',
  },
  {
    assetRole: 'PAPER_TEXTURES',
    source: 'DOM_REPRODUCIBLE',
    assetId: 'ndx-paper-field',
    storagePath: 'css:--ndx-paper',
    referenceCrop: null,
    generationRequired: false,
    provider: 'none',
    status: 'READY',
  },
];
