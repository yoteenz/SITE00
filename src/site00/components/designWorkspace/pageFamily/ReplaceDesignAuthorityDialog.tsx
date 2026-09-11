/**
 * P0.VR.CAPTURE.1R3A — Page-scoped design authority replacement dialog.
 */

import { useCallback, useRef, useState } from 'react';
import type { DesignViewportClass } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/types.js';
import {
  approveDesignAuthorityReplacement,
  beginReplaceDesignAuthorityUpload,
  cancelDesignAuthorityReplacement,
  type ReplaceDesignAuthorityDraft,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/index.js';
import { DesignAssetPreview } from '../shared/DesignAssetPreview';

type Props = {
  open: boolean;
  projectId: string;
  pageId: string;
  screenId: string;
  route: string;
  displayName: string;
  viewport: DesignViewportClass;
  currentAssetRef: string | null;
  onClose: () => void;
  onReplaced: () => void;
};

export function ReplaceDesignAuthorityDialog({
  open,
  projectId,
  pageId,
  screenId,
  route,
  displayName,
  viewport,
  currentAssetRef,
  onClose,
  onReplaced,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<ReplaceDesignAuthorityDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const context = {
    projectId,
    pageId,
    screenId,
    route,
    viewport,
    displayName,
  };

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      const result = await beginReplaceDesignAuthorityUpload(context, file);
      setUploading(false);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setDraft(result.draft);
    },
    [context],
  );

  const handleApprove = () => {
    if (!draft) return;
    const result = approveDesignAuthorityReplacement(draft);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setDraft(null);
    onReplaced();
    onClose();
  };

  const handleCancel = () => {
    cancelDesignAuthorityReplacement();
    setDraft(null);
    setError(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="site00-pfw-replace-authority" role="dialog" aria-label="Replace design authority">
      <div className="site00-pfw-replace-authority__panel">
        <header>
          <h3>REPLACE DESIGN AUTHORITY</h3>
          <p>{displayName.toUpperCase()}</p>
          <p>{route}</p>
          <p>{viewport.toUpperCase()}</p>
        </header>

        {!draft ? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            {error ? <p className="site00-pfw-replace-authority__error">{error}</p> : null}
            <div className="site00-pfw-replace-authority__actions">
              <button
                type="button"
                className="site00-dw-v3-btn site00-dw-v3-btn--primary"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? 'UPLOADING…' : 'UPLOAD NEW REFERENCE'}
              </button>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={handleCancel}>
                CANCEL
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="site00-pfw-replace-authority__compare">
              <div>
                <p>CURRENT AUTHORITY</p>
                <DesignAssetPreview
                  assetRef={currentAssetRef}
                  alt="Current authority"
                  label="CURRENT"
                  sourceType="DESIGN_AUTHORITY"
                  sourceId={`${projectId}:${screenId}:${viewport}:current`}
                />
              </div>
              <div>
                <p>NEW REFERENCE</p>
                <img src={draft.previewDataUrl} alt="New reference preview" />
              </div>
            </div>
            {error ? <p className="site00-pfw-replace-authority__error">{error}</p> : null}
            <div className="site00-pfw-replace-authority__actions">
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={handleApprove}>
                APPROVE & REPLACE
              </button>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={handleCancel}>
                CANCEL
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
