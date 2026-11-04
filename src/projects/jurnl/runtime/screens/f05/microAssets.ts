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

export type MicroAssetStatus = 'AVAILABLE' | 'PENDING_BATCH_05' | 'PENDING_BATCH_06' | 'NO_BATCH' | 'BAKED_IN_SIDEKICK';
export type MicroAsset = { src: string | null; status: MicroAssetStatus; batch: string | null; source: string | null };

const A = (src: string, batch: string, source: string): MicroAsset => ({ src, status: 'AVAILABLE', batch, source });
const P = (status: MicroAssetStatus): MicroAsset => ({ src: null, status, batch: status === 'PENDING_BATCH_05' ? '05' : status === 'PENDING_BATCH_06' ? '06' : null, source: null });

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
  // Batch 05 (pending generation): ornamental controls and surfaces
  'F05.D01.CTRL.BACK.PARCHMENT.LIGHT': P('PENDING_BATCH_05'),
  'F05.D01.CTRL.BACK.PARCHMENT.DARK': P('PENDING_BATCH_05'),
  'F05.D01.SURFACE.BACK.FRAME': P('PENDING_BATCH_05'),
  'F05.D01.SURFACE.ACTION.TORN': P('PENDING_BATCH_05'),
  'F05.D01.SURFACE.ACTION.MOSS': P('PENDING_BATCH_05'),
  'F05.D01.SURFACE.ACTION.CREAM': P('PENDING_BATCH_05'),
  'F05.D01.SURFACE.CHIP.PARCHMENT': P('PENDING_BATCH_05'),
  'F05.D01.SURFACE.FIELD.PAPER': P('PENDING_BATCH_05'),
  'F05.D01.SURFACE.ACCOUNT.TILE': P('PENDING_BATCH_05'),
  'F05.D01.SURFACE.RECEIPT.TAB': P('PENDING_BATCH_05'),
  // Batch 06 (pending generation): scanner, comparison, dock, caution
  'F05.D01.OVERLAY.RECEIPT.SCAN.CORNERS': P('PENDING_BATCH_06'),
  'F05.D01.OVERLAY.RECEIPT.SCAN.BEAM': P('PENDING_BATCH_06'),
  'F05.D01.OVERLAY.RECEIPT.DUPLICATE': P('PENDING_BATCH_06'),
  'F05.D01.OVERLAY.EDIT.COMPARISON': P('PENDING_BATCH_06'),
  'F05.D01.ICON.NAV.HOME': P('PENDING_BATCH_06'),
  'F05.D01.ICON.NAV.MONEY': P('PENDING_BATCH_06'),
  'F05.D01.ICON.NAV.ADD': P('PENDING_BATCH_06'),
  'F05.D01.ICON.NAV.PLAN': P('PENDING_BATCH_06'),
  'F05.D01.ICON.NAV.CREDIT': P('PENDING_BATCH_06'),
  'F05.D01.SURFACE.STATUS.RED': P('PENDING_BATCH_06'),
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
