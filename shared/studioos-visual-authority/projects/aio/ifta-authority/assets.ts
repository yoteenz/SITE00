/**
 * AIO IFTA — icon / asset contract (sprint §24–26), ingested from ICON_ASSET_SHEET + 00_BRAND.
 *
 * Asset strictness: when a family asset exists, implementation must not substitute generic emoji, other icon families,
 * random colors, unrelated chart styles or generic SaaS symbols. Runtime availability is tracked separately: the sheet
 * is a raster reference; production files that do not exist are reported (SIDEKICK_FALLBACK_ONLY candidates), never generated.
 */
import type { BundleRefId } from './bundle.js';

export const ASSET_CLASSES = [
  'BRAND_MARK', 'NAV_ICON', 'METRIC_ICON', 'WORKFLOW_ICON', 'FILE_ICON', 'STATUS_ICON', 'COMMUNICATION_ICON', 'MAP_STYLE',
  'CTA_TREATMENT', 'AVATAR_TREATMENT', 'IMAGE_TREATMENT', 'SURFACE_SHADOW_TREATMENT',
] as const;
export type AssetClass = (typeof ASSET_CLASSES)[number];

export type RuntimeAvailability = 'NOT_REQUIRED' | 'BUILD_FROM_SPEC' | 'RUNTIME_ASSET_MISSING';

export type AssetContract = {
  asset_id: string;
  asset_class: AssetClass;
  name: string;
  source_refs: BundleRefId[];
  usage: string;
  rule: string;
  /** BUILD_FROM_SPEC = CSS / token / chart style built from the sheet; RUNTIME_ASSET_MISSING = a production file the package lacks. */
  runtime: RuntimeAvailability;
  note?: string;
};

const SHEET: BundleRefId[] = ['ICON_ASSET_SHEET'];
const icon = (asset_class: AssetClass, id: string, name: string, usage: string): AssetContract => ({
  asset_id: id, asset_class, name, source_refs: SHEET, usage,
  rule: 'Linear · structured · premium (brand icon direction). Use this glyph; no substitute family, no emoji.',
  runtime: 'RUNTIME_ASSET_MISSING', note: 'Raster sheet only — production SVG not in the package.',
});

export const AIO_IFTA_ASSETS: AssetContract[] = [
  /* BRAND MARK */
  { asset_id: 'BRAND.SIMPLE_MARK', asset_class: 'BRAND_MARK', name: 'Simple AIO mark', source_refs: ['SIMPLE_NAV_MARK', 'ICON_ASSET_SHEET'], usage: 'Top / tight navigation, app launchers, favicons', rule: 'LOCKED: SIMPLE_MARK_ONLY in tight navigation; never the full lockup there.', runtime: 'RUNTIME_ASSET_MISSING', note: 'Only a dark-tile raster exists; a transparent / light-theme vector mark is needed for LIGHT_PRIMARY navs.' },
  { asset_id: 'BRAND.FULL_LOCKUP', asset_class: 'BRAND_MARK', name: 'Full AIO lockup', source_refs: ['FULL_LOGO_LOCKUP', 'ICON_ASSET_SHEET'], usage: 'Lower brand band / footer / exit region only', rule: 'LOCKED: FULL_LOCKUP_ALLOWED only in spacious lower bands.', runtime: 'RUNTIME_ASSET_MISSING', note: 'Transparent light + dark production lockups not in the package.' },

  /* NAV ICONS */
  icon('NAV_ICON', 'ICON.NAV.OVERVIEW', 'Overview', 'Overview / progress tab, staff OVERVIEW'),
  icon('NAV_ICON', 'ICON.NAV.FILING', 'Filing', 'Filing room / return'),
  icon('NAV_ICON', 'ICON.NAV.DOCUMENTS', 'Documents', 'DOCUMENTS tab'),
  icon('NAV_ICON', 'ICON.NAV.VEHICLES', 'Vehicles', 'VEHICLES tab, vehicle rows'),
  icon('NAV_ICON', 'ICON.NAV.SUPPORT', 'Support', 'Help rail (message your AIO team)'),
  icon('NAV_ICON', 'ICON.NAV.SETTINGS', 'Settings', 'Avatar menu settings'),

  /* METRIC ICONS */
  icon('METRIC_ICON', 'ICON.METRIC.MILES', 'Miles', 'TOTAL MILES metric'),
  icon('METRIC_ICON', 'ICON.METRIC.FUEL', 'Fuel', 'TOTAL FUEL (GAL) metric, fuel rows'),
  icon('METRIC_ICON', 'ICON.METRIC.TAX_DUE', 'Tax due', 'TAX DUE / CREDIT metric (from the return summary only)'),
  icon('METRIC_ICON', 'ICON.METRIC.JURISDICTIONS', 'Jurisdictions', 'JURISDICTIONS metric, map pins'),

  /* WORKFLOW ICONS */
  icon('WORKFLOW_ICON', 'ICON.WORKFLOW.DATA_COLLECTION', 'Data collection (numbered step)', 'Filing workflow step 01'),
  icon('WORKFLOW_ICON', 'ICON.WORKFLOW.PREPARE_RETURN', 'Prepare return', 'Filing workflow step 02 / return preparation line'),
  icon('WORKFLOW_ICON', 'ICON.WORKFLOW.REVIEW_APPROVE', 'Review & approve', 'Filing workflow step 03 / your review & approval line'),
  icon('WORKFLOW_ICON', 'ICON.WORKFLOW.SEND', 'Send', 'Send quarter to AIO / send for approval / filing & confirmation line'),
  icon('WORKFLOW_ICON', 'ICON.WORKFLOW.FILE_CONFIRM', 'File & confirm', 'Filing workflow step 04'),

  /* FILE ICONS */
  icon('FILE_ICON', 'ICON.FILE.PDF', 'PDF', 'File rows / badges'),
  icon('FILE_ICON', 'ICON.FILE.EXCEL', 'Excel', 'File rows / badges'),
  icon('FILE_ICON', 'ICON.FILE.CSV', 'CSV', 'CSV import, file rows'),
  icon('FILE_ICON', 'ICON.FILE.DOCUMENT', 'Document', 'Return drafts, confirmations'),
  icon('FILE_ICON', 'ICON.FILE.IMAGE', 'Image', 'Receipt photos'),
  icon('FILE_ICON', 'ICON.FILE.TEXT', 'Text', 'Notes / text files'),
  icon('FILE_ICON', 'ICON.FILE.ARCHIVE', 'Archive', 'Sealed packet / zip'),
  icon('FILE_ICON', 'ICON.FILE.UPLOAD', 'Upload', 'Upload zone'),

  /* STATUS ICONS */
  icon('STATUS_ICON', 'ICON.STATUS.COMPLETE', 'Complete', 'Complete / processed / filed'),
  icon('STATUS_ICON', 'ICON.STATUS.IN_PROGRESS', 'In progress', 'In progress / AIO reviewing'),
  icon('STATUS_ICON', 'ICON.STATUS.PENDING', 'Pending', 'Pending steps'),
  icon('STATUS_ICON', 'ICON.STATUS.ATTENTION', 'Attention', 'Needs you / exceptions / duplicate / unreadable'),

  /* COMMUNICATION / ACTION ICONS */
  icon('COMMUNICATION_ICON', 'ICON.COMM.SEARCH', 'Search', 'Top nav search'),
  icon('COMMUNICATION_ICON', 'ICON.COMM.NOTIFICATION', 'Notification', 'Top nav notifications'),
  icon('COMMUNICATION_ICON', 'ICON.COMM.USERS', 'Users', 'Team / assignees'),
  icon('COMMUNICATION_ICON', 'ICON.COMM.MESSAGE', 'Message', 'Message AIO / message client'),
  icon('COMMUNICATION_ICON', 'ICON.COMM.OPEN', 'Open / launch', 'Row chevrons, CTA arrows, open in Vault'),
  icon('COMMUNICATION_ICON', 'ICON.COMM.MORE', 'More', 'Row menus'),

  /* MAP STYLE */
  { asset_id: 'MAP.JURISDICTION_STYLE', asset_class: 'MAP_STYLE', name: 'Jurisdiction map style + legend', source_refs: ['ICON_ASSET_SHEET', 'CLIENT_MOBILE_PARENT_AUTHORITY', 'PUBLIC_TABLET_DESKTOP'], usage: 'MAP_PANEL (client / staff light: gold-graded states; public dark: lit network map)', rule: 'Gold / champagne / stone graded fills with the sheet legend style; no other chart palettes.', runtime: 'RUNTIME_ASSET_MISSING', note: 'No base-map geometry asset in the package (US state shapes needed; provinces not in AIO data).' },
  { asset_id: 'CHART.FAMILY_STYLE', asset_class: 'MAP_STYLE', name: 'Bars + donut chart style', source_refs: ['CLIENT_TABLET_DESKTOP', 'FOUNDER_STAFF_TABLET_DESKTOP'], usage: 'Mileage-by-jurisdiction bars, fuel / vendor donuts', rule: 'Gold → bronze → stone → black series as drawn; no unrelated chart styles.', runtime: 'BUILD_FROM_SPEC' },

  /* CTA TREATMENT */
  { asset_id: 'CTA.PRIMARY_GOLD', asset_class: 'CTA_TREATMENT', name: 'Primary gold button', source_refs: SHEET, usage: 'GET STARTED (public), primary confirms', rule: 'Gold fill, uppercase label, arrow glyph.', runtime: 'BUILD_FROM_SPEC' },
  { asset_id: 'CTA.SECONDARY_OUTLINE', asset_class: 'CTA_TREATMENT', name: 'Secondary outline button', source_refs: SHEET, usage: 'VIEW DETAILS', rule: 'Outline, uppercase, arrow.', runtime: 'BUILD_FROM_SPEC' },
  { asset_id: 'CTA.TERTIARY_TEXT', asset_class: 'CTA_TREATMENT', name: 'Tertiary text button', source_refs: SHEET, usage: 'CANCEL', rule: 'Text only.', runtime: 'BUILD_FROM_SPEC' },
  { asset_id: 'CTA.NEXT_ACTION_RAIL', asset_class: 'CTA_TREATMENT', name: 'Next-action rail', source_refs: ['ICON_ASSET_SHEET', 'CLIENT_MOBILE_PARENT_AUTHORITY', 'FOUNDER_STAFF_TABLET_DESKTOP'], usage: 'One per tab × state (dark rail, gold arrow tile)', rule: 'Exactly one next-action rail per view.', runtime: 'BUILD_FROM_SPEC' },
  { asset_id: 'CTA.TAB_PILL', asset_class: 'CTA_TREATMENT', name: 'Tab pill', source_refs: SHEET, usage: 'TAB_BAR', rule: 'Active gold pill · inactive · hover · disabled.', runtime: 'BUILD_FROM_SPEC' },

  /* AVATAR TREATMENT */
  { asset_id: 'AVATAR.CHIP', asset_class: 'AVATAR_TREATMENT', name: 'Avatar chip', source_refs: SHEET, usage: 'Top nav identity (name + role), staff assignee initials', rule: 'Circular photo or initials + uppercase name / role.', runtime: 'BUILD_FROM_SPEC' },

  /* IMAGE TREATMENT */
  { asset_id: 'IMAGE.HERO_TRUCK_LIGHT', asset_class: 'IMAGE_TREATMENT', name: 'Cinematic truck perimeter — light', source_refs: ['CLIENT_MOBILE_PARENT_AUTHORITY', 'CLIENT_TABLET_DESKTOP', 'FOUNDER_STAFF_TABLET_DESKTOP', 'ICON_ASSET_SHEET'], usage: 'Client + staff hero perimeter', rule: 'Truck on a mountain highway, warm daylight; text-safe left area; never behind operational data.', runtime: 'RUNTIME_ASSET_MISSING', note: 'Reference images may not ship (AUTHORITY ≠ RUNTIME ASSET); no production hero in the package.' },
  { asset_id: 'IMAGE.HERO_TRUCK_DARK', asset_class: 'IMAGE_TREATMENT', name: 'Cinematic truck perimeter — dark', source_refs: ['PUBLIC_TABLET_DESKTOP', 'ACTOR_MODES_MOBILE'], usage: 'Public hero', rule: 'Night / dusk highway, gold rim light.', runtime: 'RUNTIME_ASSET_MISSING', note: 'No production public hero in the package.' },
  { asset_id: 'IMAGE.ROAD_EVIDENCE', asset_class: 'IMAGE_TREATMENT', name: 'REAL DRIVERS. REAL ROADS. REAL COMPLIANCE. image card', source_refs: ['PUBLIC_TABLET_DESKTOP'], usage: 'Public clear-path section', rule: 'Road / landscape evidence image with uppercase overlay.', runtime: 'RUNTIME_ASSET_MISSING' },
  { asset_id: 'IMAGE.BAND_LANDSCAPE', asset_class: 'IMAGE_TREATMENT', name: 'Lower-band landscape', source_refs: ['PUBLIC_TABLET_DESKTOP', 'CLIENT_TABLET_DESKTOP'], usage: 'Lower brand band backdrop', rule: 'Mountain / road panorama behind the full lockup.', runtime: 'RUNTIME_ASSET_MISSING' },

  /* SURFACE / SHADOW */
  { asset_id: 'SURFACE.CARD', asset_class: 'SURFACE_SHADOW_TREATMENT', name: 'Card', source_refs: SHEET, usage: 'All panels', rule: 'Radius 12px · subtle shadow · 1px divider.', runtime: 'BUILD_FROM_SPEC' },
  { asset_id: 'SURFACE.SHADOW_LEVELS', asset_class: 'SURFACE_SHADOW_TREATMENT', name: 'Shadow levels 1–3', source_refs: SHEET, usage: 'Cards · drawers · modals', rule: 'Three levels only.', runtime: 'BUILD_FROM_SPEC' },
  { asset_id: 'SURFACE.STATUS_CHIPS', asset_class: 'SURFACE_SHADOW_TREATMENT', name: 'Status chips', source_refs: SHEET, usage: 'STATUS_CHIP', rule: 'Complete green · in progress blue · pending gray · attention amber.', runtime: 'BUILD_FROM_SPEC' },
  { asset_id: 'SURFACE.FILE_BADGES', asset_class: 'SURFACE_SHADOW_TREATMENT', name: 'File badges', source_refs: SHEET, usage: 'FILE_ROW', rule: 'PDF · XLS · CSV · DOC.', runtime: 'BUILD_FROM_SPEC' },
  { asset_id: 'SURFACE.DARK_OPERATIONAL_PANEL', asset_class: 'SURFACE_SHADOW_TREATMENT', name: 'Dark operational accent panel', source_refs: ['FOUNDER_STAFF_TABLET_DESKTOP', 'ACTOR_MODES_MOBILE'], usage: 'Staff CLIENT HEALTH panel, next-action rails', rule: 'Dark charcoal panel on the light body (staff accents).', runtime: 'BUILD_FROM_SPEC' },
];

export const AIO_IFTA_ASSET_STRICTNESS = {
  rule: 'When a family asset exists, do not substitute it.',
  forbidden: ['GENERIC EMOJI', 'DIFFERENT ICON FAMILIES', 'RANDOM COLORS', 'UNRELATED CHART STYLES', 'GENERIC SAAS SYMBOLS', 'THIRD-PARTY BRANDING (fuel-brand logos)', 'LEGACY AIO SHELL ASSETS'],
  when_missing: 'Report as RUNTIME_ASSET_MISSING → SIDEKICK_FALLBACK_ONLY candidate (true missing runtime asset). Never invent.',
};
