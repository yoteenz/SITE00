/**
 * P0.VR.CAPTURE.1R3A — Page-scoped design authority replacement dialog.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DesignViewportClass } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/types.js';
import {
  approveDesignAuthorityReplacement,
  beginReplaceDesignAuthorityFromDataUrl,
  cancelDesignAuthorityReplacement,
  type ReplaceDesignAuthorityDraft,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/index.js';
import { prepareReferenceBoardUpload } from '../../../utils/prepareReferenceBoardUpload';
import { DesignAssetPreview } from '../shared/DesignAssetPreview';
import { resolveDesignAuthorityUpload } from '../../../services/uploadPageDesignAuthority';

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
  const [approving, setApproving] = useState(false);
  const [localOnlyNotice, setLocalOnlyNotice] = useState<string | null>(null);

  const context = {
    projectId,
    pageId,
    screenId,
    route,
    viewport,
    displayName,
  };

  useEffect(() => {
    if (!open) {
      setDraft(null);
      setError(null);
      setUploading(false);
      setLocalOnlyNotice(null);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      try {
        const dataUrl = await prepareReferenceBoardUpload(file);
        const result = await beginReplaceDesignAuthorityFromDataUrl(
          context,
          dataUrl,
          file.type.includes('jpeg') ? 'image/jpeg' : file.type,
          file.size,
          file.name.split('.').pop()?.toLowerCase(),
        );
        if (!result.ok) {
          setError(result.message);
          return;
        }
        setDraft(result.draft);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'REFERENCE UPLOAD FAILED');
      } finally {
        setUploading(false);
      }
    },
    [context],
  );

  const handleApprove = async () => {
    if (!draft || approving) return;
    setApproving(true);
    setError(null);
    setLocalOnlyNotice(null);
    const resolved = await resolveDesignAuthorityUpload({
      projectId,
      screenId,
      viewport,
      dataUrl: draft.previewDataUrl,
      mimeType: draft.mimeType,
    });
    if (!resolved.ok) {
      setApproving(false);
      setError(resolved.message);
      return;
    }
    const result = approveDesignAuthorityReplacement(draft, resolved.upload);
    setApproving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setDraft(null);
    if (resolved.localOnly) {
      setLocalOnlyNotice(resolved.warning);
      onReplaced();
      return;
    }
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

  return createPortal(
    <div className="site00-dw-wizard-drawer" data-open="true" role="presentation">
      <button type="button" className="site00-dw-wizard-drawer__backdrop" aria-label="Close replace authority" onClick={handleCancel} />
      <aside className="site00-dw-wizard-drawer__panel" role="dialog" aria-modal="true" aria-label="Replace design authority">
        <header className="site00-dw-wizard-drawer__head">
          <strong>REPLACE DESIGN AUTHORITY</strong>
          <button type="button" className="site00-dw-wizard-drawer__close" onClick={handleCancel} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="site00-dw-wizard-drawer__body site00-pfw-replace-authority">
          <p className="site00-pfw-replace-authority__context">{displayName.toUpperCase()}</p>
          <p className="site00-pfw-replace-authority__context">{route}</p>
          <p className="site00-pfw-replace-authority__context">{viewport.toUpperCase()}</p>

          {!draft ? (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                  e.target.value = '';
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
                  <img src={draft.previewDataUrl} alt="New reference preview" className="site00-pfw-replace-authority__new-img" />
                </div>
              </div>
              {error ? <p className="site00-pfw-replace-authority__error">{error}</p> : null}
              {localOnlyNotice ? (
                <p className="site00-pfw-replace-authority__notice">{localOnlyNotice}</p>
              ) : null}
              <div className="site00-pfw-replace-authority__actions">
                {!localOnlyNotice ? (
                  <button
                    type="button"
                    className="site00-dw-v3-btn site00-dw-v3-btn--primary"
                    disabled={approving}
                    onClick={() => void handleApprove()}
                  >
                    {approving ? 'SAVING…' : 'APPROVE & REPLACE'}
                  </button>
                ) : (
                  <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onClose}>
                    DONE
                  </button>
                )}
                <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={handleCancel}>
                  {localOnlyNotice ? 'CLOSE' : 'CANCEL'}
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
