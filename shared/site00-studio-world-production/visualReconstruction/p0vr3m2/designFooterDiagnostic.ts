/**
 * P0.VR.3M.2 — Live Design footer visibility diagnostic receipt.
 */

export const P0_VR_3M2_LINEAGE = 'P0.VR.3M.2-SITE00' as const;

export const DESIGN_FOOTER_PANEL_SELECTOR = '.site00-dw-shell__bottom-panel';
export const DESIGN_FOOTER_ROOT_SELECTOR = '.site00-dw-footer--shell-panel';
export const DESIGN_FOOTER_ROUTE = '/projects/site00/design';

export const DESIGN_FOOTER_CONTENT_MARKERS = ['RECENT ACTIVITY', 'QUICK ACTIONS'] as const;

export type DesignFooterGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type DesignFooterComputedStyle = {
  display: string;
  visibility: string;
  opacity: string;
  position: string;
  zIndex: string;
  flexShrink: string;
  overflow: string;
};

export type DesignFooterDiagnosticReceipt = {
  lineage: typeof P0_VR_3M2_LINEAGE;
  route: string;
  selector: string;
  present: boolean;
  expectedContentVisible: boolean;
  width: number;
  height: number;
  visible: boolean;
  intersectsViewport: boolean;
  geometry: DesignFooterGeometry | null;
  computed: DesignFooterComputedStyle | null;
  scrollAncestorOverflow: string[];
  servedBuildId: string | null;
  positionModel: 'flow' | 'sticky' | 'fixed' | 'unknown';
};

export function intersectsViewport(geometry: DesignFooterGeometry, viewportHeight: number): boolean {
  return geometry.height > 0 && geometry.top < viewportHeight && geometry.bottom > 0;
}

export function evaluateDesignFooterReceipt(input: {
  route?: string;
  geometry: DesignFooterGeometry | null;
  computed: DesignFooterComputedStyle | null;
  scrollAncestorOverflow?: string[];
  viewportHeight: number;
  textContent?: string;
  servedBuildId?: string | null;
}): DesignFooterDiagnosticReceipt {
  const present = Boolean(input.geometry && input.computed);
  const width = input.geometry?.width ?? 0;
  const height = input.geometry?.height ?? 0;
  const expectedContentVisible = DESIGN_FOOTER_CONTENT_MARKERS.every((marker) =>
    (input.textContent ?? '').includes(marker),
  );
  const visible =
    present &&
    width > 0 &&
    height > 0 &&
    input.computed?.visibility !== 'hidden' &&
    input.computed?.display !== 'none' &&
    Number.parseFloat(input.computed?.opacity ?? '1') > 0;
  const intersects = input.geometry ? intersectsViewport(input.geometry, input.viewportHeight) : false;
  const positionModel =
    input.computed?.position === 'fixed'
      ? 'fixed'
      : input.computed?.position === 'sticky'
        ? 'sticky'
        : input.computed?.position === 'relative' || input.computed?.position === 'static'
          ? 'flow'
          : 'unknown';

  return {
    lineage: P0_VR_3M2_LINEAGE,
    route: input.route ?? DESIGN_FOOTER_ROUTE,
    selector: DESIGN_FOOTER_PANEL_SELECTOR,
    present,
    expectedContentVisible,
    width,
    height,
    visible,
    intersectsViewport: intersects,
    geometry: input.geometry,
    computed: input.computed,
    scrollAncestorOverflow: input.scrollAncestorOverflow ?? [],
    servedBuildId: input.servedBuildId ?? null,
    positionModel,
  };
}

export function designFooterReceiptPasses(receipt: DesignFooterDiagnosticReceipt): boolean {
  return (
    receipt.present &&
    receipt.width > 0 &&
    receipt.height > 0 &&
    receipt.visible &&
    receipt.intersectsViewport &&
    receipt.expectedContentVisible &&
    receipt.positionModel === 'flow'
  );
}

export function designFooterScrollContainerIsContentArea(scrollAncestorOverflow: string[]): boolean {
  return scrollAncestorOverflow.some((entry) => entry.includes('site00-dw-shell__content'));
}
