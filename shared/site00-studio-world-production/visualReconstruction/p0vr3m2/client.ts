/**
 * P0.VR.3M.2 — Design footer visibility diagnostic client exports.
 */

export {
  P0_VR_3M2_LINEAGE,
  DESIGN_FOOTER_PANEL_SELECTOR,
  DESIGN_FOOTER_ROOT_SELECTOR,
  DESIGN_FOOTER_ROUTE,
  DESIGN_FOOTER_CONTENT_MARKERS,
  intersectsViewport,
  evaluateDesignFooterReceipt,
  designFooterReceiptPasses,
  designFooterScrollContainerIsContentArea,
} from './designFooterDiagnostic.js';

export type {
  DesignFooterGeometry,
  DesignFooterComputedStyle,
  DesignFooterDiagnosticReceipt,
} from './designFooterDiagnostic.js';
