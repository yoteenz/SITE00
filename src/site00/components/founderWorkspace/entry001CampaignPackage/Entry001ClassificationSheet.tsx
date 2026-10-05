/**
 * B5.4 / B5.7 — Batch asset classification queue (context-aware, high-confidence fast path).
 */

import { useState } from 'react';
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
import type { BatchClassificationSummary } from './entry001AssetClassification.js';

type Props = {
  queue: PendingClassificationItem[];
  batchSummary?: BatchClassificationSummary | null;
  onUpdate: (assetId: string, assetType: Entry001AssetType, assetRole: Entry001ContentRole | null) => void;
  onAccept: (assetId: string) => void;
  onApplyAll: () => void;
  onApplyTypeToAll: (assetType: Entry001AssetType) => void;
  onDismiss: () => void;
};

export function Entry001ClassificationSheet({
  queue,
  batchSummary,
  onUpdate,
  onAccept,
  onApplyAll,
  onApplyTypeToAll,
  onDismiss,
}: Props) {
  const [showReview, setShowReview] = useState(false);

  if (!queue.length) return null;

  const firstType = queue[0]?.assetType ?? 'OTHER';
  const highConfidenceBatch = batchSummary?.confidence === 'HIGH' && batchSummary.homogeneous;

  if (highConfidenceBatch && !showReview) {
    return (
      <div className="site00-e001-package__classify-sheet" role="dialog" aria-modal="true">
        <div className="site00-e001-package__classify-inner">
          <header>
            <h3>DETECTED</h3>
            <p>{batchSummary.headline}</p>
            <p className="site00-e001-package__classify-why">{queue[0]?.suggestion.rationale}</p>
          </header>
          <div className="site00-e001-package__classify-batch-actions">
            <button type="button" className="site00-e001-package__classify-apply" onClick={onApplyAll}>
              ADD ALL
            </button>
            <button type="button" onClick={() => setShowReview(true)}>
              REVIEW
            </button>
            <button type="button" className="site00-e001-package__classify-dismiss" onClick={onDismiss}>
              LATER
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="site00-e001-package__classify-sheet" role="dialog" aria-modal="true">
      <div className="site00-e001-package__classify-inner">
        <header>
          <h3>{batchSummary?.headline ?? 'CLASSIFY ASSETS'}</h3>
          <p>
            {queue.length} pending
            {batchSummary?.anomalies.length
              ? ` · ${batchSummary.anomalies.length} need review`
              : ' · confirm if needed'}
          </p>
          <button type="button" className="site00-e001-package__classify-dismiss" onClick={onDismiss}>
            LATER
          </button>
        </header>

        <div className="site00-e001-package__classify-batch-actions">
          <button type="button" onClick={() => onApplyTypeToAll(firstType)}>
            APPLY TYPE TO ALL
          </button>
          <button type="button" className="site00-e001-package__classify-apply" onClick={onApplyAll}>
            ADD TO PACKAGE
          </button>
        </div>

        <ul className="site00-e001-package__classify-list">
          {queue.map((item) => (
            <li key={item.assetId} className="site00-e001-package__classify-item">
              <img src={item.previewUrl} alt="" />
              <div>
                <p className="site00-e001-package__classify-suggest">
                  {item.suggestion.confidence}: {ENTRY001_ASSET_TYPE_LABELS[item.suggestion.suggestedAssetType]}
                  {item.suggestion.suggestedAssetRole
                    ? ` · ${ENTRY001_CONTENT_ROLE_LABELS[item.suggestion.suggestedAssetRole]}`
                    : ''}
                </p>
                <p className="site00-e001-package__classify-why">{item.suggestion.rationale}</p>
                {item.needsReview ? (
                  <>
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
                  </>
                ) : null}
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
