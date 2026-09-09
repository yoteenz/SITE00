/**
 * Secondary inline SKINS hint — directs founder to ASSETS for blocking work.
 */

import type { DesignFounderAction } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderAction.js';

type Props = {
  action: DesignFounderAction;
  onReviewInAssets: () => void;
};

export function DesignSkinsFounderActionHint({ action, onReviewInAssets }: Props) {
  const countMatch = action.title.match(/\d+/);
  const count = countMatch?.[0] ?? String(action.context.total ?? '');

  return (
    <aside className="site00-dw-skins-founder-hint" aria-label="Founder action required">
      <p>
        {count} REFERENCE CROP{count === '1' ? '' : 'S'} NEED REVIEW
      </p>
      <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--ghost" onClick={onReviewInAssets}>
        REVIEW IN ASSETS
      </button>
    </aside>
  );
}
