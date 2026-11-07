/**
 * F05 MONEY micro-asset registry (DOT 01 first; DOT 02–04 add their own IDs here).
 *
 * Keys are the founder's registry IDs (UNIQUE_MICRO_ASSET_REGISTRY, micro-asset audit package V1). A value is the runtime
 * image, or null while its batch is pending. Screens never import a micro-asset file directly: they ask for an ID
 * through <MicroIcon>, which falls back to the existing line glyph when the art is missing or held. When Batches 05 and
 * 06 arrive, their files are added here (scripts/jurnl/f05-motion-pilot/extract_micro_assets.py) and every slot that
 * names their IDs picks them up, with no screen or route change.
 *
 * Batches 01–04: 40 founder PNGs (768 px LITE), trimmed to their alpha box and resized to 192 px (manifest:
 * families/F05_MONEY/MICRO_ASSETS/MICRO_ASSETS_MANIFEST.json). No art was generated or altered.
 *
 * Batches 05–06: 20 full-resolution PNGs from the Grok handoff (GitHub release jurnl-icons-b05-b06-2026-11-04), each
 * qualified against the V9 authorities (scripts/jurnl/f05-motion-pilot/derive_batch05_06.py →
 * families/F05_MONEY/MICRO_ASSETS/BATCH_05_06_REVIEW.json; `MICRO_ASSET_REVIEW` below). A candidate is mounted only
 * when it is at least as faithful as what the runtime draws; generated art stays CANDIDATE_FOR_REVIEW until the
 * founder approves it. Nothing is approved by being listed here.
 */
import M_B1_01_BACK_ARROW from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_01/01_back_arrow.webp';
import M_B1_02_ROW_CHEVRON from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_01/02_row_chevron.webp';
import M_B1_03_SEARCH from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_01/03_search.webp';
import M_B1_04_ADD_SYMBOL from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_01/04_add_symbol.webp';
import M_B1_05_CLOSE from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_01/05_close.webp';
import M_B1_06_BANK_COLUMN from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_01/06_bank_column.webp';
import M_B1_07_COINS_STACK from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_01/07_coins_stack.webp';
import M_B1_08_PAYMENT_CARD from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_01/08_payment_card.webp';
import M_B1_09_RECEIPT from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_01/09_receipt.webp';
import M_B1_10_LEDGER from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_01/10_ledger.webp';
import M_B2_01_INFORMATION_MEDALLION from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_02/01_information_medallion.webp';
import M_B2_02_BANK_PAYMENT_BADGE from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_02/02_bank_payment_badge.webp';
import M_B2_03_BRASS_COIN_STACKS from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_02/03_brass_coin_stacks.webp';
import M_B2_04_BAR_CHART from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_02/04_bar_chart.webp';
import M_B2_05_PURCHASE_BASKET from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_02/05_purchase_basket.webp';
import M_B2_06_COASTAL_PAYOUT from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_02/06_coastal_payout.webp';
import M_B2_07_CITRUS_MARKET_CRATE from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_02/07_citrus_market_crate.webp';
import M_B2_08_ROMAN_FEE_MEDALLION from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_02/08_roman_fee_medallion.webp';
import M_B2_09_FUEL_PUMP from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_02/09_fuel_pump.webp';
import M_B2_10_CITRUS_BRANCH from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_02/10_citrus_branch.webp';
import M_B3_01_DINING from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_03/01_dining.webp';
import M_B3_02_GROCERY_BASKET from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_03/02_grocery_basket.webp';
import M_B3_03_TRAVEL_STAMP from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_03/03_travel_stamp.webp';
import M_B3_04_COIN_PAYMENT from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_03/04_coin_payment.webp';
import M_B3_05_FEE_TEMPLE from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_03/05_fee_temple.webp';
import M_B3_06_EDIT_DOCUMENT from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_03/06_edit_document.webp';
import M_B3_07_TAG from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_03/07_tag.webp';
import M_B3_08_REVERSAL_LOOP from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_03/08_reversal_loop.webp';
import M_B3_09_ARCHIVE from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_03/09_archive.webp';
import M_B3_10_BALANCE_SCALES from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_03/10_balance_scales.webp';
import M_B4_01_CALENDAR from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_04/01_calendar.webp';
import M_B4_02_WALLET from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_04/02_wallet.webp';
import M_B4_03_RECEIPT_SCAN_CAMERA from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_04/03_receipt_scan_camera.webp';
import M_B4_04_UPLOAD from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_04/04_upload.webp';
import M_B4_05_APPROVAL_CHECK from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_04/05_approval_check.webp';
import M_B4_06_WARNING from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_04/06_warning.webp';
import M_B4_07_FILTER_SLIDERS from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_04/07_filter_sliders.webp';
import M_B4_08_REORDER_GRIP from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_04/08_reorder_grip.webp';
import M_B4_09_SAVE from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_04/09_save.webp';
import M_B4_10_LOCK_STATUS from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_04/10_lock_status.webp';
// Batch 05 / 06 (Grok, release jurnl-icons-b05-b06-2026-11-04): only the qualified candidate gets a runtime file; the
// action strip is the founder layer it was copied from (no second copy, no double render).
import M_B5_01_LIGHT_BACK_TILE from '../../../families/F05_MONEY/MICRO_ASSETS/BATCH_05/b05_01_light_parchment_back_tile.webp';
import L_19_PARCHMENT_ACTION_STRIP from '../../../families/F05_MONEY/DOT01/F05_DOT01_19_PARCHMENT_ACTION_STRIP.webp';

export type MicroAssetStatus =
  | 'AVAILABLE' // founder art (Batches 01–04), mounted where its slot exists
  | 'CANDIDATE_FOR_REVIEW' // generated, visually qualified, mounted for the founder's review (not approved)
  | 'EXACT_SOURCE_REUSE' // identical to founder art the runtime already renders; points at that file
  | 'VECTOR_IN_RUNTIME' // a raster of a vector the runtime already draws; the vector is kept
  | 'CORRECTION_REQUIRED' // generated, not mounted: needs a corrected export (BATCH_05_06_REVIEW.json)
  | 'REJECTED' // generated, not mounted: the wrong form for its slot, or exact founder art already fills it
  | 'PENDING_BATCH_05'
  | 'PENDING_BATCH_06'
  | 'NO_BATCH'
  | 'BAKED_IN_SIDEKICK';
export type MicroAsset = { src: string | null; status: MicroAssetStatus; batch: string | null; source: string | null };

const A = (src: string, batch: string, source: string): MicroAsset => ({ src, status: 'AVAILABLE', batch, source });
const P = (status: MicroAssetStatus): MicroAsset => ({ src: null, status, batch: status === 'PENDING_BATCH_05' ? '05' : status === 'PENDING_BATCH_06' ? '06' : null, source: null });
const R = (status: MicroAssetStatus, batch: '05' | '06', source: string, src: string | null = null): MicroAsset => ({ src, status, batch, source });

export const MICRO_ASSETS = {
  'F05.D01.ICON.ARROW.HANDINK': A(M_B1_01_BACK_ARROW, '01', 'BATCH_01/01_back_arrow.png'),
  'F05.D01.ICON.CHEVRON.INK': A(M_B1_02_ROW_CHEVRON, '01', 'BATCH_01/02_row_chevron.png'),
  'F05.D01.ICON.SEARCH.INK': A(M_B1_03_SEARCH, '01', 'BATCH_01/03_search.png'),
  'F05.D01.ICON.PLUS.FRAMED': A(M_B1_04_ADD_SYMBOL, '01', 'BATCH_01/04_add_symbol.png'),
  'F05.D01.ICON.CLOSE.INK': A(M_B1_05_CLOSE, '01', 'BATCH_01/05_close.png'),
  'F05.D01.ICON.BANK.COLUMN': A(M_B1_06_BANK_COLUMN, '01', 'BATCH_01/06_bank_column.png'),
  'F05.D01.ICON.COINS.STACK': A(M_B1_07_COINS_STACK, '01', 'BATCH_01/07_coins_stack.png'),
  'F05.D01.ICON.CREDIT.CARD': A(M_B1_08_PAYMENT_CARD, '01', 'BATCH_01/08_payment_card.png'),
  'F05.D01.ICON.RECEIPT.INK': A(M_B1_09_RECEIPT, '01', 'BATCH_01/09_receipt.png'),
  'F05.D01.ICON.HISTORY.LEDGER': A(M_B1_10_LEDGER, '01', 'BATCH_01/10_ledger.png'),
  'F05.D01.ICON.INFO.MEDALLION': A(M_B2_01_INFORMATION_MEDALLION, '02', 'BATCH_02/01_information_medallion.png'),
  'F05.D01.ICON.PAYMENT.BANK': A(M_B2_02_BANK_PAYMENT_BADGE, '02', 'BATCH_02/02_bank_payment_badge.png'),
  'F05.D01.ICON.CASH.COIN': A(M_B2_03_BRASS_COIN_STACKS, '02', 'BATCH_02/03_brass_coin_stacks.png'),
  'F05.D01.ICON.CHART.BARS': A(M_B2_04_BAR_CHART, '02', 'BATCH_02/04_bar_chart.png'),
  'F05.D01.ICON.PURCHASE.BASKET': A(M_B2_05_PURCHASE_BASKET, '02', 'BATCH_02/05_purchase_basket.png'),
  'F05.D01.ICON.DAILY.PAYOUT': A(M_B2_06_COASTAL_PAYOUT, '02', 'BATCH_02/06_coastal_payout.png'),
  'F05.D01.ICON.FOOD.BASKET': A(M_B2_07_CITRUS_MARKET_CRATE, '02', 'BATCH_02/07_citrus_market_crate.png'),
  'F05.D01.ICON.PAYOUT.FEE': A(M_B2_08_ROMAN_FEE_MEDALLION, '02', 'BATCH_02/08_roman_fee_medallion.png'),
  'F05.D01.ICON.FUEL.PUMP': A(M_B2_09_FUEL_PUMP, '02', 'BATCH_02/09_fuel_pump.png'),
  'F05.D01.ICON.TIPS.FRUIT': A(M_B2_10_CITRUS_BRANCH, '02', 'BATCH_02/10_citrus_branch.png'),
  'F05.D01.ICON.CATEGORY.DINING': A(M_B3_01_DINING, '03', 'BATCH_03/01_dining.png'),
  'F05.D01.ICON.CATEGORY.GROCERY': A(M_B3_02_GROCERY_BASKET, '03', 'BATCH_03/02_grocery_basket.png'),
  'F05.D01.ICON.CATEGORY.TRAVEL': A(M_B3_03_TRAVEL_STAMP, '03', 'BATCH_03/03_travel_stamp.png'),
  'F05.D01.ICON.CATEGORY.PAYMENT': A(M_B3_04_COIN_PAYMENT, '03', 'BATCH_03/04_coin_payment.png'),
  'F05.D01.ICON.CATEGORY.FEE': A(M_B3_05_FEE_TEMPLE, '03', 'BATCH_03/05_fee_temple.png'),
  'F05.D01.ICON.EDIT.PEN': A(M_B3_06_EDIT_DOCUMENT, '03', 'BATCH_03/06_edit_document.png'),
  'F05.D01.ICON.TAG': A(M_B3_07_TAG, '03', 'BATCH_03/07_tag.png'),
  'F05.D01.ICON.REVERSE.LOOP': A(M_B3_08_REVERSAL_LOOP, '03', 'BATCH_03/08_reversal_loop.png'),
  'F05.D01.ICON.ARCHIVE.CHEST': A(M_B3_09_ARCHIVE, '03', 'BATCH_03/09_archive.png'),
  'F05.D01.ICON.BALANCE.SCALE': A(M_B3_10_BALANCE_SCALES, '03', 'BATCH_03/10_balance_scales.png'),
  'F05.D01.ICON.CALENDAR': A(M_B4_01_CALENDAR, '04', 'BATCH_04/01_calendar.png'),
  'F05.D01.ICON.WALLET': A(M_B4_02_WALLET, '04', 'BATCH_04/02_wallet.png'),
  'F05.D01.ICON.SCAN.CAMERA': A(M_B4_03_RECEIPT_SCAN_CAMERA, '04', 'BATCH_04/03_receipt_scan_camera.png'),
  'F05.D01.ICON.UPLOAD': A(M_B4_04_UPLOAD, '04', 'BATCH_04/04_upload.png'),
  'F05.D01.ICON.CHECK.SEALED': A(M_B4_05_APPROVAL_CHECK, '04', 'BATCH_04/05_approval_check.png'),
  'F05.D01.ICON.ALERT.TRIANGLE': A(M_B4_06_WARNING, '04', 'BATCH_04/06_warning.png'),
  'F05.D01.ICON.FILTER.SLIDERS': A(M_B4_07_FILTER_SLIDERS, '04', 'BATCH_04/07_filter_sliders.png'),
  'F05.D01.ICON.REORDER.GRIP': A(M_B4_08_REORDER_GRIP, '04', 'BATCH_04/08_reorder_grip.png'),
  'F05.D01.ICON.SAVE.FLOPPY': A(M_B4_09_SAVE, '04', 'BATCH_04/09_save.png'),
  'F05.D01.ICON.LOCK.STATUS': A(M_B4_10_LOCK_STATUS, '04', 'BATCH_04/10_lock_status.png'),
  // Batches 05 / 06 (Grok handoff, qualified in this sprint; every row awaits founder approval)
  'F05.D01.CTRL.BACK.PARCHMENT.LIGHT': R('CANDIDATE_FOR_REVIEW', '05', 'BATCH_05/B05_01_LIGHT_PARCHMENT_BACK_TILE.png', M_B5_01_LIGHT_BACK_TILE),
  'F05.D01.CTRL.BACK.PARCHMENT.DARK': R('CORRECTION_REQUIRED', '05', 'BATCH_05/B05_02_DARK_BORDERED_BACK_TILE.png'),
  'F05.D01.SURFACE.BACK.FRAME': R('CORRECTION_REQUIRED', '05', 'BATCH_05/B05_03_ENGRAVED_BACK_FRAME.png'),
  'F05.D01.SURFACE.ACTION.TORN': R('EXACT_SOURCE_REUSE', '05', 'BATCH_05/B05_04_TORN_PARCHMENT_ACTION_STRIP.png', L_19_PARCHMENT_ACTION_STRIP),
  'F05.D01.SURFACE.ACTION.MOSS': R('CORRECTION_REQUIRED', '05', 'BATCH_05/B05_05_MOSS_PRIMARY_BUTTON_SURFACE.png'),
  'F05.D01.SURFACE.ACTION.CREAM': R('CORRECTION_REQUIRED', '05', 'BATCH_05/B05_06_CREAM_SECONDARY_BUTTON_SURFACE.png'),
  'F05.D01.SURFACE.CHIP.PARCHMENT': R('REJECTED', '05', 'BATCH_05/B05_07_PARCHMENT_FILTER_CHIP.png'),
  'F05.D01.SURFACE.FIELD.PAPER': R('CORRECTION_REQUIRED', '05', 'BATCH_05/B05_08_ENGRAVED_PAPER_INPUT_FIELD.png'),
  'F05.D01.SURFACE.ACCOUNT.TILE': R('REJECTED', '05', 'BATCH_05/B05_09_ILLUSTRATED_ACCOUNT_CARD_TILE.png'),
  'F05.D01.SURFACE.RECEIPT.TAB': R('REJECTED', '05', 'BATCH_05/B05_10_TORN_RECEIPT_PREVIEW_TAB.png'),
  'F05.D01.OVERLAY.RECEIPT.SCAN.CORNERS': R('CORRECTION_REQUIRED', '06', 'BATCH_06/B06_01_RECEIPT_SCANNER_FOUR_CORNERS.png'),
  'F05.D01.OVERLAY.RECEIPT.SCAN.BEAM': R('CORRECTION_REQUIRED', '06', 'BATCH_06/B06_02_RECEIPT_SCANNING_BEAM.png'),
  'F05.D01.OVERLAY.RECEIPT.DUPLICATE': R('REJECTED', '06', 'BATCH_06/B06_03_DUPLICATE_RECEIPT_COMPARISON_MARK.png'),
  'F05.D01.OVERLAY.EDIT.COMPARISON': R('REJECTED', '06', 'BATCH_06/B06_04_ORIGINAL_TO_REVISED_BADGE.png'),
  'F05.D01.ICON.NAV.HOME': R('VECTOR_IN_RUNTIME', '06', 'BATCH_06/B06_05_DOCK_HOME.png'),
  'F05.D01.ICON.NAV.MONEY': R('VECTOR_IN_RUNTIME', '06', 'BATCH_06/B06_06_DOCK_MONEY.png'),
  'F05.D01.ICON.NAV.ADD': R('VECTOR_IN_RUNTIME', '06', 'BATCH_06/B06_07_DOCK_ADD.png'),
  'F05.D01.ICON.NAV.PLAN': R('VECTOR_IN_RUNTIME', '06', 'BATCH_06/B06_08_DOCK_PLAN.png'),
  'F05.D01.ICON.NAV.CREDIT': R('VECTOR_IN_RUNTIME', '06', 'BATCH_06/B06_09_DOCK_CREDIT.png'),
  'F05.D01.SURFACE.STATUS.RED': R('REJECTED', '06', 'BATCH_06/B06_10_TERRACOTTA_CAUTION_STATUS_SURFACE.png'),
  // in no batch yet (founder decision FD-13 of the DOT 01 audit)
  'F05.D01.SURFACE.STATUS.GREEN': P('NO_BATCH'),
  'F05.D01.SEAL.LOCK.EMBOSSED': P('NO_BATCH'),
  'F05.D01.ORNAMENT.LEDGER.BOOK': P('NO_BATCH'),
  'F05.D01.SEAL.COIN.ENGRAVED': P('NO_BATCH'),
  'F05.D01.ORNAMENT.AMPHORA': P('NO_BATCH'),
  'F05.D01.ORNAMENT.RIDESHARE.TAG': P('NO_BATCH'),
  // carried by the SIDEKICK environments (never mounted again over their baked selves)
  'F05.D01.SEAL.LAUREL.BRONZE': P('BAKED_IN_SIDEKICK'),
  'F05.D01.ORNAMENT.BOTANICAL.CORNER': P('BAKED_IN_SIDEKICK'),
  'F05.D01.ORNAMENT.TEMPLE.MINI': P('BAKED_IN_SIDEKICK'),
} satisfies Record<string, MicroAsset>;

export type MicroAssetId = keyof typeof MICRO_ASSETS;

export function microAssetSrc(id: MicroAssetId | null | undefined): string | null {
  return id ? MICRO_ASSETS[id].src : null;
}

/** Batch 05 / 06 evidence, one record per registry ID (the 18 fields of the qualification). */
export type MicroAssetReview = {
  sourceFile: string; sourceSha256: string; sourcePx: [number, number]; provenance: string; authority: string; target: string; targetRoute: string;
  renderSize: string; materialAspect: number; layer: string; zIndex: string; interactive: string; animation: string; checkerResiduePct: number;
  classification: 'EXACT_APPROVED_SOURCE_REUSE' | 'VISUALLY_QUALIFIED_CANDIDATE' | 'FOUNDER_REVIEW_REQUIRED' | 'CORRECTION_REQUIRED' | 'REJECTED' | 'SOURCE_UNAVAILABLE';
  mountStatus: 'MOUNTED_FOR_REVIEW' | 'MOUNTED_AS_EXISTING_SOURCE' | 'VECTOR_KEPT' | 'NOT_MOUNTED'; visualQa: 'PASS' | 'FAIL'; founderApproval: 'PENDING' | 'APPROVED' | 'REJECTED';
  accessibility: string; note: string;
};
export const MICRO_ASSET_REVIEW: Partial<Record<MicroAssetId, MicroAssetReview>> = {
  "F05.D01.CTRL.BACK.PARCHMENT.LIGHT": {
    sourceFile: "BATCH_05/B05_01_LIGHT_PARCHMENT_BACK_TILE.png", sourceSha256: "f91365c9e09b2114a9b9d4b1ecb91ffa2c0c31b05870d47a0837346c16934408", sourcePx: [1360, 1360], provenance: "GENERATED",
    authority: "02–05, 11–29 (light back chip)", target: "Dot01Frame chip, tone paper, icon back", targetRoute: "money/places/:id (02–05), :id/history, :id/settings, :id/review, entries/:id, every DOT 01 overlay (14–29)",
    renderSize: "88 × 78 board px (the paper chip)", materialAspect: 1.19, layer: "L3 chips, top right", zIndex: "chips row (stage z 60 when an overlay is open)",
    interactive: "decorative image inside the BACK / CLOSE button", animation: "none", checkerResiduePct: 0.1,
    classification: "VISUALLY_QUALIFIED_CANDIDATE", mountStatus: "MOUNTED_FOR_REVIEW", visualQa: "PASS", founderApproval: 'PENDING',
    accessibility: "alt=\"\" aria-hidden; the button keeps its name (BACK TO MONEY / CLOSE)",
    note: "one torn tile with the ink arrow, as 02 / 14 / 26 / 27 draw it; replaces the 9-sliced blank paper + Batch 01 arrow (visible slice seams). Clean alpha.",
  },
  "F05.D01.CTRL.BACK.PARCHMENT.DARK": {
    sourceFile: "BATCH_05/B05_02_DARK_BORDERED_BACK_TILE.png", sourceSha256: "663878ebcc3aa63b8a4ae9f2787a9e3de8e2afcff2c9090517e388215646f20f", sourcePx: [1360, 1360], provenance: "GENERATED",
    authority: "06–10 (amber back chip)", target: "Dot01Frame chip, tone amber", targetRoute: "—",
    renderSize: "—", materialAspect: 1.02, layer: "—", zIndex: "—",
    interactive: "decorative", animation: "none", checkerResiduePct: 26.4,
    classification: "CORRECTION_REQUIRED", mountStatus: "NOT_MOUNTED", visualQa: "FAIL", founderApproval: 'PENDING',
    accessibility: "decorative only (alt=\"\", aria-hidden) wherever it is mounted",
    note: "worse than the runtime: dark olive fill, thick brass rim and a specular highlight; 06 / 07 draw a flat translucent amber-brown tile with a thin warm rim and a white arrow. Opaque checker residue on the outer edge.",
  },
  "F05.D01.SURFACE.BACK.FRAME": {
    sourceFile: "BATCH_05/B05_03_ENGRAVED_BACK_FRAME.png", sourceSha256: "1dfba7001710cb53d6f124e85c0d71028229d506828921efc3cd17349ddc8b36", sourcePx: [1360, 1360], provenance: "GENERATED",
    authority: "none (no authority frames the back control)", target: "optional back frame", targetRoute: "—",
    renderSize: "—", materialAspect: 1.03, layer: "—", zIndex: "—",
    interactive: "decorative", animation: "none", checkerResiduePct: 32.4,
    classification: "CORRECTION_REQUIRED", mountStatus: "NOT_MOUNTED", visualQa: "FAIL", founderApproval: 'PENDING',
    accessibility: "decorative only (alt=\"\", aria-hidden) wherever it is mounted",
    note: "corner leaves are not in any authority, and no authority draws a frame around the back chip. Opaque checker residue around the rim.",
  },
  "F05.D01.SURFACE.ACTION.TORN": {
    sourceFile: "BATCH_05/B05_04_TORN_PARCHMENT_ACTION_STRIP.png", sourceSha256: "54a2ec1c2d2547b136656093a3fcbc7c1ffb355b35c64547c7556917de2105a1", sourcePx: [1200, 183], provenance: "REUSED (DOT01 layer 19)",
    authority: "02–05 strips, 11, 24", target: "existing action strips (F05_DOT01_19)", targetRoute: "see target",
    renderSize: "as the existing element", materialAspect: 6.56, layer: "as the existing element", zIndex: "as the existing element",
    interactive: "decorative", animation: "none", checkerResiduePct: 0.1,
    classification: "EXACT_APPROVED_SOURCE_REUSE", mountStatus: "MOUNTED_AS_EXISTING_SOURCE", visualQa: "PASS", founderApproval: 'PENDING',
    accessibility: "decorative only (alt=\"\", aria-hidden) wherever it is mounted",
    note: "pixel-identical to F05_DOT01_19_PARCHMENT_ACTION_STRIP (alpha and colour MAD 0.0 on every opaque pixel); the runtime already renders that layer, so nothing is added (no double render).",
  },
  "F05.D01.SURFACE.ACTION.MOSS": {
    sourceFile: "BATCH_05/B05_05_MOSS_PRIMARY_BUTTON_SURFACE.png", sourceSha256: "4e55eda636c3dbc74979d324f75acbbfabab4bfc55206e26f53d69e1811274c7", sourcePx: [3136, 1344], provenance: "GENERATED",
    authority: "14, 16, 21, 26, 27, 34, 37 (primary)", target: "kit Button (primary)", targetRoute: "—",
    renderSize: "—", materialAspect: 4.07, layer: "—", zIndex: "—",
    interactive: "decorative", animation: "none", checkerResiduePct: 26.3,
    classification: "CORRECTION_REQUIRED", mountStatus: "NOT_MOUNTED", visualQa: "FAIL", founderApproval: 'PENDING',
    accessibility: "decorative only (alt=\"\", aria-hidden) wherever it is mounted",
    note: "brass rim not in the authority (14 / 26 draw a dark olive pill with a lighter olive edge); 4.1 : 1 material vs 7–9 : 1 controls (would need cap / infill slicing); opaque checker residue.",
  },
  "F05.D01.SURFACE.ACTION.CREAM": {
    sourceFile: "BATCH_05/B05_06_CREAM_SECONDARY_BUTTON_SURFACE.png", sourceSha256: "ba8201b8ef6c420752f1deff4780b1c80b83834b0514b8dd90385a57ebea796a", sourcePx: [3136, 1344], provenance: "GENERATED",
    authority: "26, 34, 36, 37 (secondary)", target: "kit Button (quiet)", targetRoute: "—",
    renderSize: "—", materialAspect: 4.47, layer: "—", zIndex: "—",
    interactive: "decorative", animation: "none", checkerResiduePct: 23.7,
    classification: "CORRECTION_REQUIRED", mountStatus: "NOT_MOUNTED", visualQa: "FAIL", founderApproval: 'PENDING',
    accessibility: "decorative only (alt=\"\", aria-hidden) wherever it is mounted",
    note: "smooth rim with a double olive line; 26 / 34 draw a deckled cream pill; 4.5 : 1 vs 7–9 : 1; opaque checker residue.",
  },
  "F05.D01.SURFACE.CHIP.PARCHMENT": {
    sourceFile: "BATCH_05/B05_07_PARCHMENT_FILTER_CHIP.png", sourceSha256: "a0c41d5b6dfd630a72effc096752d991d3b5777e9f02283cd111f4bb9f1bf9b7", sourcePx: [3136, 1344], provenance: "GENERATED",
    authority: "21, 31 (chips)", target: "ChipChoice / filter chips", targetRoute: "—",
    renderSize: "—", materialAspect: 4.61, layer: "—", zIndex: "—",
    interactive: "decorative", animation: "none", checkerResiduePct: 16.3,
    classification: "REJECTED", mountStatus: "NOT_MOUNTED", visualQa: "FAIL", founderApproval: 'PENDING',
    accessibility: "decorative only (alt=\"\", aria-hidden) wherever it is mounted",
    note: "wrong form: 21 / 31 draw smooth rounded pills (cream with a thin ink border, or olive when selected); the candidate is a torn paper scrap. Opaque checker residue.",
  },
  "F05.D01.SURFACE.FIELD.PAPER": {
    sourceFile: "BATCH_05/B05_08_ENGRAVED_PAPER_INPUT_FIELD.png", sourceSha256: "bf9295cae1084f856932dabafbf80cbfdf51f7043b11233afa4e24dbee561aac", sourcePx: [3136, 1344], provenance: "GENERATED",
    authority: "14–20, 23, 28, 30 (fields)", target: "kit TextInput / JURNL_SELECT", targetRoute: "—",
    renderSize: "—", materialAspect: 4.14, layer: "—", zIndex: "—",
    interactive: "decorative", animation: "none", checkerResiduePct: 26.0,
    classification: "CORRECTION_REQUIRED", mountStatus: "NOT_MOUNTED", visualQa: "FAIL", founderApproval: 'PENDING',
    accessibility: "decorative only (alt=\"\", aria-hidden) wherever it is mounted",
    note: "dark olive rim not in the authority (14 / 16 fields are light deckled cream with a soft inner shadow); 4.1 : 1 vs ≈ 11 : 1 fields; opaque checker residue.",
  },
  "F05.D01.SURFACE.ACCOUNT.TILE": {
    sourceFile: "BATCH_05/B05_09_ILLUSTRATED_ACCOUNT_CARD_TILE.png", sourceSha256: "6ab9cac535afb1f470d15883479ef7b338a9437fd5315982fe11e73b8535f2b6", sourcePx: [2304, 1296], provenance: "GENERATED",
    authority: "06 (cards)", target: "DirectoryPage AccountCard", targetRoute: "—",
    renderSize: "—", materialAspect: 2.44, layer: "—", zIndex: "—",
    interactive: "decorative", animation: "none", checkerResiduePct: 24.4,
    classification: "REJECTED", mountStatus: "NOT_MOUNTED", visualQa: "FAIL", founderApproval: 'PENDING',
    accessibility: "decorative only (alt=\"\", aria-hidden) wherever it is mounted",
    note: "the founder card compositions (F05_DOT01_05–07) already mounted on 06 match the authority (06 converged in S7); a generated stand-in would lower fidelity. Opaque checker residue.",
  },
  "F05.D01.SURFACE.RECEIPT.TAB": {
    sourceFile: "BATCH_05/B05_10_TORN_RECEIPT_PREVIEW_TAB.png", sourceSha256: "841723749b802dc68ee55e7609788b75a00423fbd39260e7831ca4b930639f8b", sourcePx: [3136, 1344], provenance: "GENERATED",
    authority: "28, 29, 33 (receipt preview)", target: "receipt review surfaces", targetRoute: "—",
    renderSize: "—", materialAspect: 3.36, layer: "—", zIndex: "—",
    interactive: "decorative", animation: "none", checkerResiduePct: 24.5,
    classification: "REJECTED", mountStatus: "NOT_MOUNTED", visualQa: "FAIL", founderApproval: 'PENDING',
    accessibility: "decorative only (alt=\"\", aria-hidden) wherever it is mounted",
    note: "a blank torn panel; the founder layers 16 / 17 (receipt frame and torn receipt strip) already cover this role with exact source art. Opaque checker residue.",
  },
  "F05.D01.OVERLAY.RECEIPT.SCAN.CORNERS": {
    sourceFile: "BATCH_06/B06_01_RECEIPT_SCANNER_FOUR_CORNERS.png", sourceSha256: "72d421c235b07fc8cc547d3867a40f51630b2f69f7c3f1b21dd8ce27bb20e370", sourcePx: [1360, 1360], provenance: "GENERATED",
    authority: "26, 27 (scan frame)", target: "ReceiptFlow capture / scanning frame", targetRoute: "—",
    renderSize: "—", materialAspect: 1.15, layer: "—", zIndex: "—",
    interactive: "decorative", animation: "none", checkerResiduePct: 28.3,
    classification: "CORRECTION_REQUIRED", mountStatus: "NOT_MOUNTED", visualQa: "FAIL", founderApproval: 'PENDING',
    accessibility: "decorative only (alt=\"\", aria-hidden) wherever it is mounted",
    note: "26 / 27 draw thin white L brackets (≈ 6 px at 941); the candidate is a thick cream / gold bracket with opaque checker squares beside each corner.",
  },
  "F05.D01.OVERLAY.RECEIPT.SCAN.BEAM": {
    sourceFile: "BATCH_06/B06_02_RECEIPT_SCANNING_BEAM.png", sourceSha256: "402d190ca924fd25e3a495b500d4ed02cc596fd4bdc8ea926ebd49a5248c53f9", sourcePx: [3136, 1344], provenance: "GENERATED",
    authority: "27 (scan line)", target: "ReceiptFlow scanning beam", targetRoute: "—",
    renderSize: "—", materialAspect: 10.69, layer: "—", zIndex: "—",
    interactive: "decorative", animation: "none", checkerResiduePct: 0.2,
    classification: "CORRECTION_REQUIRED", mountStatus: "NOT_MOUNTED", visualQa: "FAIL", founderApproval: 'PENDING',
    accessibility: "decorative only (alt=\"\", aria-hidden) wherever it is mounted",
    note: "the amber line is right, but the \"halo\" is the provider checkerboard tinted by the glow (opaque warm squares in a lens shape), not a soft alpha falloff; it would show as a hatched band over the receipt.",
  },
  "F05.D01.OVERLAY.RECEIPT.DUPLICATE": {
    sourceFile: "BATCH_06/B06_03_DUPLICATE_RECEIPT_COMPARISON_MARK.png", sourceSha256: "663f84597a2b5b2a671495b42d94c4e1677e4dee26f785de28d9f6dfd4ae8150", sourcePx: [1360, 1360], provenance: "GENERATED",
    authority: "29 (duplicate)", target: "duplicate comparison mark", targetRoute: "—",
    renderSize: "—", materialAspect: 0.83, layer: "—", zIndex: "—",
    interactive: "decorative", animation: "none", checkerResiduePct: 25.8,
    classification: "REJECTED", mountStatus: "NOT_MOUNTED", visualQa: "FAIL", founderApproval: 'PENDING',
    accessibility: "decorative only (alt=\"\", aria-hidden) wherever it is mounted",
    note: "29 draws a small dark red circle with a white ⇄ between CURRENT RECEIPT and POSSIBLE MATCH; the candidate is a large embossed bronze pair of receipts (the glossy 3-D style the 40-icon audit already held back). Opaque checker residue.",
  },
  "F05.D01.OVERLAY.EDIT.COMPARISON": {
    sourceFile: "BATCH_06/B06_04_ORIGINAL_TO_REVISED_BADGE.png", sourceSha256: "1b20d319e5536fc7eadbe2be2aee9aec72cc95a914597b9abdcec005e3718452", sourcePx: [1360, 1360], provenance: "GENERATED",
    authority: "37 (original → revised)", target: "correction confirm badge", targetRoute: "—",
    renderSize: "—", materialAspect: 1.01, layer: "—", zIndex: "—",
    interactive: "decorative", animation: "none", checkerResiduePct: 20.6,
    classification: "REJECTED", mountStatus: "NOT_MOUNTED", visualQa: "FAIL", founderApproval: 'PENDING',
    accessibility: "decorative only (alt=\"\", aria-hidden) wherever it is mounted",
    note: "37 draws a small dark olive circle with a white →; the candidate is a bronze coin with two documents. Opaque checker residue.",
  },
  "F05.D01.ICON.NAV.HOME": {
    sourceFile: "BATCH_06/B06_05_DOCK_HOME.png", sourceSha256: "617a9418b3a8d1b09e0582ced5c8280ba00aa2fb5b9669bbc90a773c888e7871", sourcePx: [1024, 1024], provenance: "REUSED (hqNavIcons.tsx)",
    authority: "01, 06, 31 (dock)", target: "ProductNav HOME", targetRoute: "see target",
    renderSize: "as the existing element", materialAspect: 1.02, layer: "as the existing element", zIndex: "as the existing element",
    interactive: "decorative", animation: "none", checkerResiduePct: 0.0,
    classification: "EXACT_APPROVED_SOURCE_REUSE", mountStatus: "VECTOR_KEPT", visualQa: "PASS", founderApproval: 'PENDING',
    accessibility: "decorative only (alt=\"\", aria-hidden) wherever it is mounted",
    note: "raster of the shipping vector path; the runtime keeps the vector (sharper, state colours, accessibility).",
  },
  "F05.D01.ICON.NAV.MONEY": {
    sourceFile: "BATCH_06/B06_06_DOCK_MONEY.png", sourceSha256: "348e8c44926ce7320357ddb0fb5459746fea4fb0f27d9b0fe83cacddacce34e3", sourcePx: [1024, 1024], provenance: "REUSED (hqNavIcons.tsx)",
    authority: "01, 06, 31 (dock)", target: "ProductNav MONEY", targetRoute: "see target",
    renderSize: "as the existing element", materialAspect: 1.21, layer: "as the existing element", zIndex: "as the existing element",
    interactive: "decorative", animation: "none", checkerResiduePct: 0.0,
    classification: "EXACT_APPROVED_SOURCE_REUSE", mountStatus: "VECTOR_KEPT", visualQa: "PASS", founderApproval: 'PENDING',
    accessibility: "decorative only (alt=\"\", aria-hidden) wherever it is mounted",
    note: "raster of the shipping vector path; vector kept.",
  },
  "F05.D01.ICON.NAV.ADD": {
    sourceFile: "BATCH_06/B06_07_DOCK_ADD.png", sourceSha256: "7d34552b4823c0fefb7ff5e7aaaa915735342f21641566abef5fd95625f66917", sourcePx: [1024, 1024], provenance: "REUSED (hqNavIcons.tsx)",
    authority: "01, 06, 31 (dock)", target: "ProductNav ADD", targetRoute: "see target",
    renderSize: "as the existing element", materialAspect: 1.0, layer: "as the existing element", zIndex: "as the existing element",
    interactive: "decorative", animation: "none", checkerResiduePct: 0.0,
    classification: "EXACT_APPROVED_SOURCE_REUSE", mountStatus: "VECTOR_KEPT", visualQa: "PASS", founderApproval: 'PENDING',
    accessibility: "decorative only (alt=\"\", aria-hidden) wherever it is mounted",
    note: "raster of the shipping vector path; vector kept.",
  },
  "F05.D01.ICON.NAV.PLAN": {
    sourceFile: "BATCH_06/B06_08_DOCK_PLAN.png", sourceSha256: "4903dbc2a06f36fbd1223f67179ed57416143a9000e970ed4575187d253b5844", sourcePx: [1024, 1024], provenance: "REUSED (hqNavIcons.tsx)",
    authority: "01, 06, 31 (dock)", target: "ProductNav PLAN", targetRoute: "see target",
    renderSize: "as the existing element", materialAspect: 0.9, layer: "as the existing element", zIndex: "as the existing element",
    interactive: "decorative", animation: "none", checkerResiduePct: 0.0,
    classification: "EXACT_APPROVED_SOURCE_REUSE", mountStatus: "VECTOR_KEPT", visualQa: "PASS", founderApproval: 'PENDING',
    accessibility: "decorative only (alt=\"\", aria-hidden) wherever it is mounted",
    note: "raster of the shipping vector path; vector kept.",
  },
  "F05.D01.ICON.NAV.CREDIT": {
    sourceFile: "BATCH_06/B06_09_DOCK_CREDIT.png", sourceSha256: "f27bce1a555098d37916ac96d18f3a1a716eb18bd3da73b0bd970295c8fffe69", sourcePx: [1024, 1024], provenance: "REUSED (hqNavIcons.tsx)",
    authority: "01, 06, 31 (dock)", target: "ProductNav CREDIT", targetRoute: "see target",
    renderSize: "as the existing element", materialAspect: 0.85, layer: "as the existing element", zIndex: "as the existing element",
    interactive: "decorative", animation: "none", checkerResiduePct: 0.0,
    classification: "EXACT_APPROVED_SOURCE_REUSE", mountStatus: "VECTOR_KEPT", visualQa: "PASS", founderApproval: 'PENDING',
    accessibility: "decorative only (alt=\"\", aria-hidden) wherever it is mounted",
    note: "raster of the shipping vector path; vector kept.",
  },
  "F05.D01.SURFACE.STATUS.RED": {
    sourceFile: "BATCH_06/B06_10_TERRACOTTA_CAUTION_STATUS_SURFACE.png", sourceSha256: "0e07e949eff7f29866c61b262ee41217937f92da04e6d61805c01dad76d329aa", sourcePx: [3136, 1344], provenance: "GENERATED",
    authority: "29, 34, 36 (caution)", target: "kit Alert (caution)", targetRoute: "—",
    renderSize: "—", materialAspect: 4.03, layer: "—", zIndex: "—",
    interactive: "decorative", animation: "none", checkerResiduePct: 25.9,
    classification: "REJECTED", mountStatus: "NOT_MOUNTED", visualQa: "FAIL", founderApproval: 'PENDING',
    accessibility: "decorative only (alt=\"\", aria-hidden) wherever it is mounted",
    note: "wrong form: 29 / 34 / 36 draw a flat torn red paper panel; the candidate is a curled ribbon banner with folded tails. Opaque checker residue.",
  },
};
