/**
 * B5.4 — Batch asset classification queue (mobile-first sheet).
 */

import type {
  Entry001AssetType,
  Entry001ContentRole,
} from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import {
  ENTRY001_ASSET_TYPE_LABELS,
  ENTRY001_CONTENT_ROLE_LABELS,
  ENTRY001_INGESTION_ROLE_OPTIONS,
  ENTRY001_INGESTION_TYPE_OPTIONS,
} from './entry001AssetTaxonomy.js';
import type { PendingClassificationItem } from './useEntry001PackageState.js';

type Props = {
  queue: PendingClassificationItem[];
  onUpdate: (assetId: string, assetType: Entry001AssetType, assetRole: Entry001ContentRole | null) => void;
  onAccept: (assetId: string) => void;
  onApplyAll: () => void;
  onApplyTypeToAll: (assetType: Entry001AssetType) => void;
  onDismiss: () => void;
};

export function Entry001ClassificationSheet({
  queue,
  onUpdate,
  onAccept,
  onApplyAll,
  onApplyTypeToAll,
  onDismiss,
}: Props) {
  if (!queue.length) return null;

  const firstType = queue[0]?.assetType ?? 'OTHER';

  return (
    <div className="site00-e001-package__classify-sheet" role="dialog" aria-modal="true">
      <div className="site00-e001-package__classify-inner">
        <header>
          <h3>CLASSIFY ASSETS</h3>
          <p>{queue.length} pending · confirm type before archive</p>
          <button type="button" className="site00-e001-package__classify-dismiss" onClick={onDismiss}>
            LATER
          </button>
        </header>

        <div className="site00-e001-package__classify-batch-actions">
          <button type="button" onClick={() => onApplyTypeToAll(firstType)}>
            APPLY TYPE TO ALL
          </button>
          <button type="button" className="site00-e001-package__classify-apply" onClick={onApplyAll}>
            ADD TO ARCHIVE
          </button>
        </div>

        <ul className="site00-e001-package__classify-list">
          {queue.map((item) => (
            <li key={item.assetId} className="site00-e001-package__classify-item">
              <img src={item.previewUrl} alt="" />
              <div>
                <p className="site00-e001-package__classify-suggest">
                  SUGGESTED {item.suggestion.confidence}: {ENTRY001_ASSET_TYPE_LABELS[item.suggestion.suggestedAssetType]}
                  {item.suggestion.suggestedAssetRole
                    ? ` · ${ENTRY001_CONTENT_ROLE_LABELS[item.suggestion.suggestedAssetRole]}`
                    : ''}
                </p>
                <label>
                  TYPE
                  <select
                    value={item.assetType}
                    onChange={(e) =>
                      onUpdate(item.assetId, e.target.value as Entry001AssetType, item.assetRole)
                    }
                  >
                    {ENTRY001_INGESTION_TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {ENTRY001_ASSET_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  ROLE
                  <select
                    value={item.assetRole ?? ''}
                    onChange={(e) =>
                      onUpdate(
                        item.assetId,
                        item.assetType,
                        (e.target.value || null) as Entry001ContentRole | null,
                      )
                    }
                  >
                    <option value="">—</option>
                    {ENTRY001_INGESTION_ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {ENTRY001_CONTENT_ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" onClick={() => onAccept(item.assetId)}>
                  {item.accepted ? 'ACCEPTED' : 'ACCEPT'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
