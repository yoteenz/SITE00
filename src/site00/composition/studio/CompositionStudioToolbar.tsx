import { Link } from 'react-router-dom';
import type { CompositionStudioController } from './useCompositionStudio';
import { hasBlockingErrors } from './validation';
import { isCompositionEditable } from './types';

type CompositionStudioToolbarProps = {
  controller: CompositionStudioController;
  onSaveDraft: () => void;
  onSendForApproval: () => void;
  onApprove: () => void;
  onLock: () => void;
  onCreateRevision: () => void;
};

export function CompositionStudioToolbar({
  controller,
  onSaveDraft,
  onSendForApproval,
  onApprove,
  onLock,
  onCreateRevision,
}: CompositionStudioToolbarProps) {
  const { doc, mode, viewport, canUndo, canRedo, findings, dispatch } = controller;
  const editable = isCompositionEditable(doc);
  const blocking = hasBlockingErrors(findings);

  return (
    <header className="composition-studio__toolbar">
      <div className="composition-studio__toolbar-left">
        <Link to="/assts" className="composition-studio__back">
          ← ASSTS
        </Link>
        <span className="site00-label-red">COMPOSITION STUDIO</span>
        <span className="composition-studio__status-chip">{doc.status.replace(/_/g, ' ')}</span>
      </div>

      <div className="composition-studio__toolbar-center">
        {(['mobile', 'tablet', 'desktop'] as const).map((vp) => (
          <button
            key={vp}
            type="button"
            className={viewport === vp ? 'composition-studio__vp--active' : ''}
            onClick={() => dispatch({ type: 'SET_VIEWPORT', viewport: vp })}
          >
            {vp.toUpperCase()}
          </button>
        ))}
        <span className="composition-studio__toolbar-divider" />
        <button type="button" disabled={!canUndo} onClick={() => dispatch({ type: 'UNDO' })}>
          Undo
        </button>
        <button type="button" disabled={!canRedo} onClick={() => dispatch({ type: 'REDO' })}>
          Redo
        </button>
      </div>

      <div className="composition-studio__toolbar-right">
        {editable ? (
          <>
            <button
              type="button"
              className={mode === 'edit' ? 'composition-studio__mode--active' : ''}
              onClick={() => dispatch({ type: 'SET_MODE', mode: 'edit' })}
            >
              Edit
            </button>
            <button
              type="button"
              className={mode === 'zones' ? 'composition-studio__mode--active' : ''}
              onClick={() => dispatch({ type: 'SET_MODE', mode: 'zones' })}
            >
              Zones
            </button>
            <button
              type="button"
              className={mode === 'preview' ? 'composition-studio__mode--active' : ''}
              onClick={() => dispatch({ type: 'SET_MODE', mode: 'preview' })}
            >
              Preview
            </button>
            <button type="button" onClick={onSaveDraft}>
              Save Draft
            </button>
            <button
              type="button"
              className="composition-studio__cta"
              disabled={blocking}
              onClick={() => onSendForApproval()}
            >
              Send for Approval
            </button>
          </>
        ) : null}

        {doc.status === 'COMPOSITION_REVIEW' ? (
          <>
            <button type="button" onClick={() => dispatch({ type: 'SET_MODE', mode: 'review' })}>
              Review
            </button>
            <button type="button" onClick={() => dispatch({ type: 'SET_MODE', mode: 'edit' })}>
              Return to Editor
            </button>
            <button type="button" className="composition-studio__cta" onClick={onApprove}>
              Approve
            </button>
          </>
        ) : null}

        {doc.status === 'APPROVED' ? (
          <button type="button" className="composition-studio__cta composition-studio__cta--lock" onClick={onLock}>
            Lock Composition
          </button>
        ) : null}

        {doc.status === 'COMPOSITION_LOCKED' ? (
          <button type="button" onClick={onCreateRevision}>
            Create Revision
          </button>
        ) : null}
      </div>
    </header>
  );
}
