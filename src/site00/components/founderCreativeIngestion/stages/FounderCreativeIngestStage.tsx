import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import type {
  FounderCreativeIngestionState,
  FounderCreativeParentSequence,
} from '../../../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import { resolveSequenceReferencePreviewUrl } from '../../../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import { QuietAction } from '../../founderWorkspace/WorkspaceCompositionPrimitives';
import { FounderCreativeWorkflowFooterActions, FounderCreativeWorkflowStageHeader } from '../FounderCreativeWorkflowShell';

export function FounderCreativeIngestStage({
  sequence,
  ingestion,
  busy,
  onUpload,
  onInvalidFile,
  onDecomposeExisting,
}: {
  sequence: FounderCreativeParentSequence;
  ingestion: FounderCreativeIngestionState;
  busy: boolean;
  onUpload: (file: File) => Promise<void>;
  onInvalidFile: () => void;
  onDecomposeExisting?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const activeVersion = ingestion.referenceVersions.find(
    (entry) => entry.parentSequenceId === sequence.sequenceId && entry.status === 'ACTIVE',
  );
  const activeAsset = activeVersion
    ? ingestion.referenceAssets.find((entry) => entry.assetId === activeVersion.referenceAssetId)
    : ingestion.referenceAssets.find((entry) => entry.assetId.includes(sequence.sequenceId));
  const activePreview = activeAsset?.previewUrl ?? resolveSequenceReferencePreviewUrl(ingestion, sequence.sequenceId);

  useEffect(
    () => () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    },
    [localPreviewUrl],
  );

  const openFilePicker = () => {
    if (busy) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const looksLikeImage =
      file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|heic|heif)$/i.test(file.name);
    if (!looksLikeImage) {
      onInvalidFile();
      return;
    }
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl(URL.createObjectURL(file));
    void onUpload(file);
  };

  return (
    <section className="site00-fci-gw__stage">
      <FounderCreativeWorkflowStageHeader
        step="INGEST"
        sequenceTitle={sequence.title}
        subtitle={`${sequence.role.replace(/_/g, ' ')} · Row ${String(sequence.rowIndex + 1).padStart(2, '0')}`}
        badge={activeVersion ? `Active reference v${activeVersion.versionNumber}` : 'No active reference'}
      />

      <p className="site00-fci-gw__help">
        Upload a new draft reference board and decomposition starts automatically. Your current active
        version stays preserved until you promote the new one.
      </p>

      {activePreview ? (
        <div className="site00-fci-gw__preview-card">
          <p className="site00-fci-gw__preview-label">Current active reference</p>
          <img src={activePreview} alt="Active reference board" className="site00-fci-gw__preview-img" />
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="site00-fci__upload-input"
        aria-hidden
        tabIndex={-1}
        onChange={handleFileChange}
      />

      <button
        type="button"
        className={`site00-fci-gw__upload-zone${busy ? ' site00-fci-gw__upload-zone--busy' : ''}`}
        disabled={busy}
        onClick={openFilePicker}
      >
        {localPreviewUrl ? (
          <img src={localPreviewUrl} alt="Selected board" className="site00-fci-gw__preview-img" />
        ) : (
          <span>{busy ? 'Uploading & starting decomposition…' : 'Tap to upload reference board'}</span>
        )}
      </button>

      <FounderCreativeWorkflowFooterActions
        primary={
          <QuietAction disabled={busy} onClick={openFilePicker}>
            Upload Reference Board →
          </QuietAction>
        }
        secondary={
          onDecomposeExisting ? (
            <QuietAction disabled={busy} onClick={onDecomposeExisting}>
              Decompose existing reference →
            </QuietAction>
          ) : null
        }
      />
    </section>
  );
}
