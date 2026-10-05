import type { ReactNode } from 'react';
import type { FounderCreativeIngestionState } from '../../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import { PHOTOGRAPHY_SOURCE_MODES } from '../../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import { InlineMeta } from '../founderWorkspace/WorkspaceCompositionPrimitives';

export function FounderCreativeInspectDrawer({
  open,
  onClose,
  ingestion,
  sequenceId,
}: {
  open: boolean;
  onClose: () => void;
  ingestion: FounderCreativeIngestionState;
  sequenceId: string;
}) {
  if (!open) return null;

  const versions = ingestion.referenceVersions.filter((entry) => entry.parentSequenceId === sequenceId);
  const diff = ingestion.referenceDiffs.find((entry) => entry.parentSequenceId === sequenceId);

  return (
    <aside className="site00-fci-gw__inspect" role="dialog" aria-label="Inspect methodology and system">
      <div className="site00-fci-gw__inspect-head">
        <h3 className="site00-fci-gw__inspect-title">Inspect Methodology + System</h3>
        <button type="button" className="site00-fci-gw__inspect-close" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="site00-fci-gw__inspect-body">
        <InlineMeta label="Ingestion version" value={ingestion.ingestionVersion} />
        <InlineMeta label="Workflow step (system)" value={ingestion.workflowStep} />
        <InlineMeta label="Character" value={ingestion.characterIdentity.message} />
        <InlineMeta label="FAL still requests" value={String(ingestion.falImageRequests)} />
        <InlineMeta label="FAL video requests" value={String(ingestion.falVideoRequests)} />
        <InlineMeta label="Photo modes (internal)" value={PHOTOGRAPHY_SOURCE_MODES.join(' · ')} />
        <InlineMeta label="Reference versions" value={String(versions.length)} />
        {versions.map((version) => (
          <InlineMeta
            key={version.referenceVersionId}
            label={`v${version.versionNumber} ${version.status}`}
            value={version.referenceAssetId}
          />
        ))}
        {diff ? (
          <InlineMeta
            label="Latest diff"
            value={`${diff.oldSlideCount} → ${diff.newSlideCount} slides`}
          />
        ) : null}
        <InlineMeta label="Provenance" value="FOUNDER_CREATED · EXTERNAL_CHATGPT_CREATIVE_SESSION" />
      </div>
    </aside>
  );
}

export function FounderCreativeInspectToggle({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button type="button" className="site00-fci-gw__inspect-toggle" onClick={onClick}>
      Inspect Methodology + System
    </button>
  );
}

export function FounderCreativeWorkflowShell({
  children,
  inspect,
}: {
  children: ReactNode;
  inspect?: ReactNode;
}) {
  return (
    <div className="site00-fci-gw">
      {children}
      {inspect}
    </div>
  );
}
