import { useEffect, useMemo, useState } from 'react';
import { createAsstsLibraryStudioDocument } from './assts-library-template';
import { CompositionStudioCanvas, viewportPresetSize } from './CompositionStudioCanvas';
import { CompositionStudioLayers } from './CompositionStudioLayers';
import { CompositionStudioProperties } from './CompositionStudioProperties';
import {
  CompositionStudioReview,
  CompositionStudioValidationBar,
} from './CompositionStudioReview';
import { CompositionStudioToolbar } from './CompositionStudioToolbar';
import { useCompositionStudio } from './useCompositionStudio';
import { isCompositionEditable } from './types';
import './composition-studio.css';

export type CompositionStudioProps = {
  environmentId: string;
  environmentAssetUrl?: string | null;
  initialDocument?: ReturnType<typeof createAsstsLibraryStudioDocument>;
};

export function CompositionStudio({
  environmentId,
  environmentAssetUrl,
  initialDocument,
}: CompositionStudioProps) {
  const seed = useMemo(
    () => initialDocument ?? createAsstsLibraryStudioDocument(environmentAssetUrl ?? undefined),
    [environmentAssetUrl, initialDocument],
  );

  const [containerSize, setContainerSize] = useState(viewportPresetSize('mobile'));
  const [mobileDrawer, setMobileDrawer] = useState<'layers' | 'properties' | null>(null);

  const controller = useCompositionStudio({
    initialDocument: { ...seed, environmentId },
    containerWidth: containerSize.w,
    containerHeight: containerSize.h,
  });

  const { doc, viewport, mode, dispatch, saveDraft, sendForApproval, approveComposition, lockComposition, createRevision, addZone } =
    controller;

  useEffect(() => {
    setContainerSize(viewportPresetSize(viewport));
  }, [viewport]);

  const editable = isCompositionEditable(doc);

  return (
    <div
      className={`composition-studio composition-studio--${viewport} composition-studio--mode-${mode}`}
      data-composition-status={doc.status}
    >
      <CompositionStudioToolbar
        controller={controller}
        onSaveDraft={saveDraft}
        onSendForApproval={sendForApproval}
        onApprove={approveComposition}
        onLock={lockComposition}
        onCreateRevision={createRevision}
      />

      <div className="composition-studio__workspace">
        <div className="composition-studio__workspace-desktop-left">
          <CompositionStudioLayers controller={controller} />
          {editable && mode === 'zones' ? (
            <button type="button" className="composition-studio__add-zone" onClick={addZone}>
              + Add Zone
            </button>
          ) : null}
        </div>

        <div
          className="composition-studio__canvas-frame"
          style={{ maxWidth: containerSize.w, aspectRatio: `${containerSize.w} / ${containerSize.h}` }}
        >
          <CompositionStudioCanvas controller={controller} backgroundUrl={environmentAssetUrl} />
        </div>

        <div className="composition-studio__workspace-desktop-right">
          {mode === 'review' ? (
            <CompositionStudioReview
              controller={controller}
              onApprove={approveComposition}
              onReturnToEditor={() => dispatch({ type: 'SET_MODE', mode: 'edit' })}
            />
          ) : (
            <CompositionStudioProperties controller={controller} />
          )}
        </div>
      </div>

      <CompositionStudioValidationBar controller={controller} />

      <div className="composition-studio__mobile-drawer-triggers">
        <button type="button" onClick={() => setMobileDrawer((d) => (d === 'layers' ? null : 'layers'))}>
          Layers
        </button>
        <button type="button" onClick={() => setMobileDrawer((d) => (d === 'properties' ? null : 'properties'))}>
          Properties
        </button>
      </div>

      {mobileDrawer ? (
        <div className="composition-studio__mobile-drawer">
          <button type="button" className="composition-studio__drawer-close" onClick={() => setMobileDrawer(null)}>
            Close
          </button>
          {mobileDrawer === 'layers' ? <CompositionStudioLayers controller={controller} /> : null}
          {mobileDrawer === 'properties' ? <CompositionStudioProperties controller={controller} /> : null}
        </div>
      ) : null}
    </div>
  );
}

export { createAsstsLibraryStudioDocument } from './assts-library-template';
export { getLockedCompositionDocument, loadCompositionDocument, saveCompositionDocument } from './storage';
export { lockedCompositionCssVars } from './objectLayout';
export type { CompositionStudioDocument, CompositionStudioObject } from './types';
