import { useMemo, useState } from 'react';
import { buildAssetLibraryTree, getAssetDetail } from '../../../../shared/site00-studio-world-production/productAssetFactory/p0paf2/client';

type Props = {
  productId: string;
};

export function AssetLibraryPanel({ productId }: Props) {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [colorFilter, setColorFilter] = useState('');
  const tree = useMemo(
    () => buildAssetLibraryTree({ productId, colorId: colorFilter || undefined }),
    [productId, colorFilter],
  );
  const detail = selectedAssetId ? getAssetDetail(selectedAssetId) : null;

  const groups = ['MASTERS', 'PRODUCT_PAGES', 'BUILD_A_WIG', 'SHARED', 'ARCHIVED'] as const;

  return (
    <section className="p0paf2-panel p0paf2-library">
      <h2>ASSET LIBRARY</h2>
      <div className="p0paf2-filters">
        <label>
          COLOR
          <input value={colorFilter} onChange={(e) => setColorFilter(e.target.value)} placeholder="burgundy" />
        </label>
      </div>
      {groups.map((group) =>
        tree[group].length > 0 ? (
          <div key={group} className="p0paf2-library-group">
            <h3>{group.replace(/_/g, ' ')}</h3>
            <ul>
              {tree[group].map((entry) => (
                <li key={entry.assetId}>
                  <button type="button" onClick={() => setSelectedAssetId(entry.assetId)}>
                    {entry.label}
                  </button>
                  <span className="p0paf2-meta">
                    {entry.bindingStatus} · {entry.canonStatus}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null,
      )}
      {detail && (
        <div className="p0paf2-asset-detail">
          <h3>ASSET DETAIL</h3>
          {'supabasePath' in detail && detail.supabasePath && (
            <p>
              <strong>SUPABASE PATH:</strong> {detail.supabasePath}
            </p>
          )}
          {'integration' in detail && (
            <p>
              STORAGE {detail.integration.storage ? '✓' : '○'} · BINDING{' '}
              {detail.integration.binding ? '✓ ACTIVE' : '○'} · WEBSITE{' '}
              {detail.integration.website ? '✓ RESOLVABLE' : '○ NOT BOUND'}
            </p>
          )}
          {'whereUsed' in detail && Array.isArray(detail.whereUsed) && detail.whereUsed.length > 0 && (
            <p>WHERE USED: {(detail.whereUsed as { surface: string }[]).map((b) => b.surface).join(', ')}</p>
          )}
        </div>
      )}
    </section>
  );
}
