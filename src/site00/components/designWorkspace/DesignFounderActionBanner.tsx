/**
 * Inline founder action card — SKINS / ASSETS surfaces.
 */

import type { DesignFounderAction } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderAction.js';

type Props = {
  action: DesignFounderAction;
  onPrimary: () => void;
  variant?: 'skins' | 'assets';
};

const CTA_LABELS: Record<string, string> = {
  REVIEW_CROPS: 'REVIEW CROPS',
  APPROVE_GENERATION: 'REVIEW GENERATION PLAN',
  REVIEW_OUTPUTS: 'REVIEW OUTPUTS',
  APPROVE_REGENERATION: 'APPROVE REGENERATION',
  REVIEW_BINDINGS: 'REVIEW BINDINGS',
};

export function DesignFounderActionBanner({ action, onPrimary, variant = 'skins' }: Props) {
  const cta = CTA_LABELS[action.actionType] ?? 'OPEN';

  return (
    <article
      className={`site00-dw-founder-action${action.priority === 'BLOCKING' ? ' is-blocking' : ''}`}
      data-variant={variant}
      data-action-type={action.actionType}
    >
      <header className="site00-dw-founder-action__head">
        <span className="site00-dw-founder-action__eyebrow">REFERENCE RECONSTRUCTION</span>
        <h3>{action.title}</h3>
        <p>{action.summary}</p>
      </header>
      <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onPrimary}>
        {cta}
      </button>
    </article>
  );
}
