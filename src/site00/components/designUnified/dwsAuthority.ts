/**
 * DWS_SONNET_LITE authority pack — coverage record. Every one of the 23 images has been opened and transcribed
 * (see docs/site00/studio-os/design-unified-workspace/AUTHORITY_COVERAGE.md). `appliedTo` names the profile/state
 * that implements it so a missing mode/viewport can never be "built from inference" unnoticed.
 */
import type { DwsFamily } from './dwsProfiles';

export type DwsAuthorityImage = {
  n: number;
  path: string;
  viewport: 'desktop' | 'tablet-portrait' | 'tablet-landscape' | 'mobile' | 'interaction' | 'system';
  mode: 'brand' | 'experience' | 'surfaces' | 'compiler' | 'assets' | 'overview' | 'pack';
  family?: DwsFamily;
  inspected: true;
  appliedTo: string;
};

const A = (n: number, path: string, viewport: DwsAuthorityImage['viewport'], mode: DwsAuthorityImage['mode'], appliedTo: string, family?: DwsFamily): DwsAuthorityImage => ({ n, path, viewport, mode, family, inspected: true, appliedTo });

export const DWS_AUTHORITY_IMAGES: DwsAuthorityImage[] = [
  A(1, '01_DESKTOP_AUTHORITIES/01_BRAND.jpg', 'desktop', 'brand', 'DWS_PROFILES.desktop.brand', 'desktop'),
  A(2, '01_DESKTOP_AUTHORITIES/02_EXPERIENCE.jpg', 'desktop', 'experience', 'DWS_PROFILES.desktop.experience', 'desktop'),
  A(3, '01_DESKTOP_AUTHORITIES/03_SURFACES_WORKSPACE_OVERVIEW.jpg', 'desktop', 'surfaces', 'DWS_PROFILES.desktop.surfaces (workspace overview under SURFACES)', 'desktop'),
  A(4, '01_DESKTOP_AUTHORITIES/04_COMPILER.jpg', 'desktop', 'compiler', 'DWS_PROFILES.desktop.compiler', 'desktop'),
  A(5, '01_DESKTOP_AUTHORITIES/05_ASSETS.jpg', 'desktop', 'assets', 'DWS_PROFILES.desktop.assets', 'desktop'),
  A(6, '02_TABLET_AUTHORITIES/13B1DC3A-422C-4A70-BE36-DD8058B7D739.jpg', 'tablet-portrait', 'brand', 'DWS_PROFILES.tabletP.brand + brand fan chips', 'tabletP'),
  A(7, '02_TABLET_AUTHORITIES/EC554178-4AAF-48E9-9C3C-0D89DF46241F.jpg', 'tablet-landscape', 'compiler', 'DWS_PROFILES.tabletL.compiler', 'tabletL'),
  A(8, '02_TABLET_AUTHORITIES/DB9D830C-3410-4250-BB06-B1BCE6D9FF0B.jpg', 'tablet-landscape', 'experience', 'DWS_PROFILES.tabletL.experience', 'tabletL'),
  A(9, '02_TABLET_AUTHORITIES/0F4A7CE6-AEB3-46C9-8F5B-7670C9329356.jpg', 'tablet-landscape', 'assets', 'DWS_PROFILES.tabletL.assets', 'tabletL'),
  A(10, '02_TABLET_AUTHORITIES/874C3EE0-7B79-42DD-B3AC-F8A1C28D8C4B.jpg', 'tablet-landscape', 'brand', 'DWS_PROFILES.tabletL.brand', 'tabletL'),
  A(11, '02_TABLET_AUTHORITIES/CC27801B-BDB3-44F2-A1DB-9FD168700400.jpg', 'tablet-landscape', 'overview', 'DWS_PROFILES.tabletL.surfaces (workspace overview)', 'tabletL'),
  A(12, '03_MOBILE_AUTHORITIES/01_BRAND_REFERENCE.jpg', 'mobile', 'brand', 'DWS_PROFILES.mobile.brand (workspace overview)', 'mobile'),
  A(13, '03_MOBILE_AUTHORITIES/02_MODE_AUTHORITY.jpg', 'mobile', 'surfaces', 'DWS_PROFILES.mobile.surfaces', 'mobile'),
  A(14, '03_MOBILE_AUTHORITIES/03_MODE_AUTHORITY.jpg', 'mobile', 'compiler', 'DWS_PROFILES.mobile.compiler', 'mobile'),
  A(15, '03_MOBILE_AUTHORITIES/04_MODE_AUTHORITY.jpg', 'mobile', 'experience', 'DWS_PROFILES.mobile.experience', 'mobile'),
  A(16, '03_MOBILE_AUTHORITIES/05_MODE_AUTHORITY.jpg', 'mobile', 'assets', 'DWS_PROFILES.mobile.assets', 'mobile'),
  A(17, '04_DESKTOP_INTERACTION_EXPRESSIONS/01_BRAND__DRAWER_DETAIL_REVIEW_MODAL.jpg', 'interaction', 'brand', 'BrandLibraryDrawer + AssetDetailsInspector + BrandReviewModal'),
  A(18, '04_DESKTOP_INTERACTION_EXPRESSIONS/02_EXPERIENCE__MAP_INSPECTOR_REVIEW.jpg', 'interaction', 'experience', 'JourneysDrawer + ExperienceMap + InteractionInspector + PathReviewModal'),
  A(19, '04_DESKTOP_INTERACTION_EXPRESSIONS/03_SURFACES__LIBRARY_INSPECTOR_COMPARE.jpg', 'interaction', 'surfaces', 'SurfaceFamiliesDrawer + SurfaceCenter + SurfaceDetailsInspector + CompareSurfacesModal + SURFACES_EXPRESSION'),
  A(20, '04_DESKTOP_INTERACTION_EXPRESSIONS/04_COMPILER__SYNTHESIS_INTELLIGENCE_REVIEW_MODAL.jpg', 'interaction', 'compiler', 'SynthesisDrawer + CompilerCenter + ProjectIntelligenceInspector + AuthorityReviewModal'),
  A(21, '04_DESKTOP_INTERACTION_EXPRESSIONS/05_ASSETS__LIBRARY_DETAILS_METADATA_EXPORT.jpg', 'interaction', 'assets', 'AssetLibraryDrawer + AssetDetailsModal + MetadataInspector + ExportModal'),
  A(22, '05_SYSTEM_PACKS/01_ICON_PACK_AUTHORITY.jpg', 'system', 'pack', 'DwsIcons (live SVG) + DwsStageObject forms'),
  A(23, '05_SYSTEM_PACKS/02_ASSET_PACK_AUTHORITY.jpg', 'system', 'pack', 'site00-design-unified.css + DwsParts primitives'),
];
