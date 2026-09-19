/**
 * B5.0R2 — Recoverable error state for Expression Engine workspace.
 */

import { Link } from 'react-router-dom';
import type { ExpressionEngineErrorView } from './expressionEngineErrorState';

type Props = {
  error: ExpressionEngineErrorView;
  campaignBoardPath: string;
  onRetry: () => void;
};

export function ExpressionEngineErrorState({ error, campaignBoardPath, onRetry }: Props) {
  return (
    <section className="site00-ee-error-state">
      <span className="site00-ee-error-state__kicker">WORKSPACE</span>
      <h2>{error.title}</h2>
      <p>{error.message}</p>
      <div className="site00-ee-error-state__actions">
        <button type="button" className="site00-btn site00-btn--primary" onClick={onRetry}>
          RETRY
        </button>
        <Link to={campaignBoardPath} className="site00-btn">
          RETURN TO CAMPAIGN BOARD
        </Link>
      </div>
    </section>
  );
}
