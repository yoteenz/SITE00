import type { CompositionStudioController } from './useCompositionStudio';
import { hasBlockingErrors } from './validation';

type CompositionStudioReviewProps = {
  controller: CompositionStudioController;
  onApprove: () => void;
  onReturnToEditor: () => void;
};

export function CompositionStudioReview({ controller, onApprove, onReturnToEditor }: CompositionStudioReviewProps) {
  const { doc, findings, dispatch } = controller;
  const blocking = hasBlockingErrors(findings);

  return (
    <div className="composition-studio__review-panel">
      <h2 className="composition-studio__panel-title">Composition Review</h2>
      <p className="composition-studio__review-version">
        Version {doc.version} · {doc.versionLabel.replace(/_/g, ' ')}
      </p>

      {findings.length === 0 ? (
        <p className="composition-studio__review-clear">No validation findings — ready for approval.</p>
      ) : (
        <ul className="composition-studio__findings">
          {findings.map((f) => (
            <li key={f.id} className={`composition-studio__finding composition-studio__finding--${f.severity.toLowerCase()}`}>
              <span className="composition-studio__finding-sev">{f.severity}</span>
              <span>{f.message}</span>
              {f.overridable ? (
                <button
                  type="button"
                  className="composition-studio__override-btn"
                  onClick={() => dispatch({ type: 'OVERRIDE_FINDING', findingId: f.id })}
                >
                  Approve Override
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <div className="composition-studio__review-actions">
        <button type="button" onClick={onReturnToEditor}>
          Return to Editor
        </button>
        <button type="button" className="composition-studio__cta" disabled={blocking} onClick={onApprove}>
          Approve Composition
        </button>
      </div>
    </div>
  );
}

type CompositionStudioValidationBarProps = {
  controller: CompositionStudioController;
};

export function CompositionStudioValidationBar({ controller }: CompositionStudioValidationBarProps) {
  const { findings, mode, dispatch } = controller;
  if (mode === 'preview' || findings.length === 0) return null;

  return (
    <footer className="composition-studio__validation-bar">
      {findings.slice(0, 3).map((f) => (
        <span key={f.id} className={`composition-studio__validation-chip composition-studio__validation-chip--${f.severity.toLowerCase()}`}>
          {f.message}
          {f.overridable ? (
            <button type="button" onClick={() => dispatch({ type: 'OVERRIDE_FINDING', findingId: f.id })}>
              Override
            </button>
          ) : null}
        </span>
      ))}
      {findings.length > 3 ? <span className="composition-studio__validation-more">+{findings.length - 3} more</span> : null}
    </footer>
  );
}
