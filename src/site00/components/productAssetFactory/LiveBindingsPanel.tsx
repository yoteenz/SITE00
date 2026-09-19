import { getLiveBindingPanel, bindAssetAs, unbindAsset, previewBatchBindApprovedVariants, batchBindApprovedVariants } from '../../../../shared/site00-studio-world-production/productAssetFactory/p0paf2/client';
import type { FsBindingSurface } from '../../../../shared/frontal-slayer-product-assets/contract/types';

type Props = {
  productId: string;
  onBind?: (surface: FsBindingSurface) => void;
};

const SURFACE_LABELS: Record<string, string> = {
  BUILD_A_WIG: 'BUILD-A-WIG',
  PRODUCT_PAGE: 'PRODUCT PAGE',
  MOBILE_APP: 'MOBILE APP',
  SHOWROOM: 'SHOWROOM',
};

export function LiveBindingsPanel({ productId, onBind }: Props) {
  const panel = getLiveBindingPanel(productId);

  return (
    <section className="p0paf2-panel">
      <h2>LIVE BINDINGS</h2>
      <p className="p0paf2-panel__subtitle">USED ON</p>
      <ul className="p0paf2-bindings-list">
        {panel.map((entry) => (
          <li key={entry.surface}>
            <strong>{SURFACE_LABELS[entry.surface] ?? entry.surface}</strong>
            {entry.bound ? (
              <ul>
                {entry.bindings.map((b) => (
                  <li key={b.bindingId}>
                    ✓ {b.label}
                    <span className="p0paf2-meta">
                      {b.websiteResolvable ? ' · WEBSITE ✓ RESOLVABLE' : ' · WEBSITE ○ NOT BOUND'}
                    </span>
                    <button type="button" onClick={() => unbindAsset(b.bindingId)}>
                      UNBIND
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <span> ○ Not bound</span>
            )}
            <button type="button" onClick={() => onBind?.(entry.surface)}>
              BIND AS…
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function BatchBindPanel({ productId, batchId }: { productId: string; batchId?: string }) {
  const bawPreview = previewBatchBindApprovedVariants({
    productId,
    surface: 'BUILD_A_WIG',
    slotId: 'CONFIG',
    batchId,
  });
  const pdpPreview = previewBatchBindApprovedVariants({
    productId,
    surface: 'PRODUCT_PAGE',
    slotId: 'PRIMARY_HERO',
    batchId,
  });

  return (
    <section className="p0paf2-panel">
      <h2>BATCH BIND</h2>
      <p>
        BUILD-A-WIG: {bawPreview.willActivate} bindings will activate · {bawPreview.skippedFailedQa} skipped QA ·{' '}
        {bawPreview.missing} missing
      </p>
      <p>
        PRODUCT PAGE: {pdpPreview.willActivate} color variants · {pdpPreview.skippedFailedQa} skipped
      </p>
      <button
        type="button"
        onClick={() =>
          batchBindApprovedVariants({
            productId,
            surface: 'BUILD_A_WIG',
            slotId: 'CONFIG',
            batchId,
            founderConfirmed: true,
          })
        }
      >
        BIND ALL APPROVED BUILD-A-WIG VARIANTS
      </button>
      <button
        type="button"
        onClick={() =>
          batchBindApprovedVariants({
            productId,
            surface: 'PRODUCT_PAGE',
            slotId: 'PRIMARY_HERO',
            batchId,
            founderConfirmed: true,
          })
        }
      >
        BIND APPROVED COLOR VARIANTS
      </button>
    </section>
  );
}

export { bindAssetAs };
