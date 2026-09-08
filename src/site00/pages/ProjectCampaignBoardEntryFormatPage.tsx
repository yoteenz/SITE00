import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import { useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { FounderWorkspaceShell } from '../components/founderWorkspace/FounderWorkspaceShell';
import { Entry001FormatWorkspaceView } from '../components/founderWorkspace/entry001CampaignPackage/Entry001FormatWorkspaceView';
import { useEntry001PackageState } from '../components/founderWorkspace/entry001CampaignPackage/useEntry001PackageState';
import type { Entry001FormatFamily } from '../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import '../styles/site00-founder-workspace.css';

const VALID_FORMATS: Entry001FormatFamily[] = ['REEL', 'CAROUSEL', 'STORY', 'TIKTOK', 'X', 'HIGHLIGHT'];

/** B5.5 — Entry 001 format workspace page. */

export default function ProjectCampaignBoardEntryFormatPage() {
  const { projectSlug = '', entryNumber = '', formatFamily = '' } = useParams<{
    projectSlug: string;
    entryNumber: string;
    formatFamily: string;
  }>();
  const { formatSummaries, deliverables } = useEntry001PackageState();

  const normalized = formatFamily.toUpperCase() as Entry001FormatFamily;
  const summary = formatSummaries.find((s) => s.formatFamily === normalized);

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
        <p>Entry {entryNumber} format workspace is not available yet.</p>
      </EcosystemShell>
    );
  }

  if (!VALID_FORMATS.includes(normalized) || !summary) {
    return (
      <EcosystemShell hidePageHeader>
        <p>Format {formatFamily} is not configured for Entry 001.</p>
      </EcosystemShell>
    );
  }

  return (
    <EcosystemShell hidePageHeader>
      <FounderWorkspaceShell
        projectSlug={projectSlug}
        title={`ENTRY 001 — ${summary.label}`}
        hideWorkspaceHeader
        operate={
          <Entry001FormatWorkspaceView
            projectSlug={projectSlug}
            formatFamily={normalized}
            summary={summary}
            deliverables={deliverables}
          />
        }
        inspect={
          <p style={{ margin: 0, fontSize: 11, color: '#666' }}>
            Format workspace · assets · live preview · missing pieces
          </p>
        }
      />
    </EcosystemShell>
  );
}
