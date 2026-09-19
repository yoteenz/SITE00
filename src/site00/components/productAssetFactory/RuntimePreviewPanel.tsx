import { useMemo, useState } from 'react';
import { createStudioWorldRuntimeReader } from '../../../../shared/site00-studio-world-production/productAssetFactory/p0paf2/client';
import { buildDeterministicVariantKey } from '../../../../shared/frontal-slayer-product-assets/contract/variantKey';

type Props = {
  productId: string;
};

export function RuntimePreviewPanel({ productId }: Props) {
  const runtime = useMemo(() => createStudioWorldRuntimeReader(), []);
  const [mode, setMode] = useState<'BAW' | 'PDP'>('BAW');
  const [color, setColor] = useState('burgundy');
  const [style, setStyle] = useState('straight');
  const [length, setLength] = useState('24');
  const [part, setPart] = useState('middle');

  const bawConfig = { color, style, length, part };
  const variantKey = buildDeterministicVariantKey(bawConfig);

  const bawResolved = runtime.getBuildAWigVisualAsset(bawConfig);
  const pdpResolved = runtime.getProductVariantAsset(productId, buildDeterministicVariantKey({ color }), 'PRIMARY_HERO');

  const resolved = mode === 'BAW' ? bawResolved : pdpResolved;

  return (
    <section className="p0paf2-panel p0paf2-runtime-preview">
      <h2>WEBSITE RUNTIME PREVIEW</h2>
      <p className="p0paf2-meta">Frontal Slayer resolver — no FAL at runtime</p>
      <div className="p0paf2-runtime-tabs">
        <button type="button" className={mode === 'BAW' ? 'is-active' : ''} onClick={() => setMode('BAW')}>
          BUILD-A-WIG
        </button>
        <button type="button" className={mode === 'PDP' ? 'is-active' : ''} onClick={() => setMode('PDP')}>
          PRODUCT PAGE
        </button>
      </div>
      {mode === 'BAW' && (
        <div className="p0paf2-runtime-controls">
          <label>COLOR <input value={color} onChange={(e) => setColor(e.target.value)} /></label>
          <label>STYLE <input value={style} onChange={(e) => setStyle(e.target.value)} /></label>
          <label>LENGTH <input value={length} onChange={(e) => setLength(e.target.value)} /></label>
          <label>PART <input value={part} onChange={(e) => setPart(e.target.value)} /></label>
        </div>
      )}
      {mode === 'PDP' && (
        <label>
          COLOR <input value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
      )}
      <p>
        <strong>Variant key:</strong> {variantKey}
      </p>
      {resolved ? (
        <div className="p0paf2-runtime-result">
          <p>
            Source: {resolved.source} · {resolved.publicUrl}
          </p>
          <div className="p0paf2-runtime-canvas">
            <img src={resolved.publicUrl} alt="Resolved product asset" />
          </div>
        </div>
      ) : (
        <p className="p0paf2-muted">No active binding — would fall back to canonical master hero</p>
      )}
    </section>
  );
}
