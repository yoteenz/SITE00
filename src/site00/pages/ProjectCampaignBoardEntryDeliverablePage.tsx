import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import { Link, useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { FounderWorkspaceShell } from '../components/founderWorkspace/FounderWorkspaceShell';
import { Entry001DeliverableDetailView } from '../components/founderWorkspace/entry001CampaignPackage/Entry001DeliverableDetailView';
import { useEntry001PackageState } from '../components/founderWorkspace/entry001CampaignPackage/useEntry001PackageState';
import { site00ProjectCampaignBoardEntryPath } from '../config/routes';
import '../styles/site00-founder-workspace.css';

/** B5.5 — Entry 001 deliverable detail page. */

export default function ProjectCampaignBoardEntryDeliverablePage() {
  const { projectSlug = '', entryNumber = '', deliverableId = '' } = useParams<{
    projectSlug: string;
    entryNumber: string;
    deliverableId: string;
  }>();
  const {
    getDeliverable,
    editDeliverableMetadata,
    replaceDeliverableFile,
    removeDeliverableFromPackage,
    archiveDeliverable,
    restoreDeliverable,
    deleteDeliverablePermanently,
  } = useEntry001PackageState();

  const deliverable = getDeliverable(deliverableId);

  if (!hasProjectCapability(projectSlug, 'CONTENT_OPERATIONS')) {
    return (
      <EcosystemShell hidePageHeader>
        <p>Campaign package pages are NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  if (entryNumber !== '001') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Entry {entryNumber} deliverables are not available yet.</p>
      </EcosystemShell>
    );
  }

  if (!deliverable) {
    return (
      <EcosystemShell hidePageHeader>
        <p>
          Deliverable not found.{' '}
          <Link to={site00ProjectCampaignBoardEntryPath(projectSlug, '001')}>Return to Entry 001</Link>
        </p>
      </EcosystemShell>
    );
  }

  return (
    <EcosystemShell hidePageHeader>
      <FounderWorkspaceShell
        projectSlug={projectSlug}
        title={`DELIVERABLE — ${deliverable.title}`}
        hideWorkspaceHeader
        operate={
          <Entry001DeliverableDetailView
            projectSlug={projectSlug}
            deliverable={deliverable}
            onEdit={(patch) => editDeliverableMetadata(deliverableId, patch)}
            onReplace={(file) => replaceDeliverableFile(deliverableId, file)}
            onRemoveFromPackage={() => removeDeliverableFromPackage(deliverableId)}
            onArchive={() => archiveDeliverable(deliverableId)}
            onRestore={() => restoreDeliverable(deliverableId)}
            onDeletePermanently={() => deleteDeliverablePermanently(deliverableId)}
          />
        }
        inspect={
          <p style={{ margin: 0, fontSize: 11, color: '#666' }}>
            Deliverable detail · edit · replace · remove · archive · delete · version history
          </p>
        }
      />
    </EcosystemShell>
  );
}
