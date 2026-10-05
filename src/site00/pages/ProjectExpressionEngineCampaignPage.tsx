import { useParams } from 'react-router-dom';
import { NdxFounderWorkspacePage } from '../components/founderWorkspace/NdxFounderWorkspacePage';
import { ExpressionEngineCampaignWorkspace } from '../components/founderWorkspace/ExpressionEngineCampaignWorkspace';
import { ExpressionEngineCampaignPanel } from '../components/founderWorkspace/ExpressionEngineCampaignPanel';
import '../styles/site00-founder-workspace.css';

export default function ProjectExpressionEngineCampaignPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();

  return (
    <NdxFounderWorkspacePage
      projectSlug={projectSlug}
      title="EXPRESSION ENGINE"
      subtitle="ENTRY production blueprint · B1 live proof"
      attentionBadge="ANCHOR REVIEW"
      operate={<ExpressionEngineCampaignWorkspace projectSlug={projectSlug} />}
      understand={
        <p style={{ margin: 0, fontSize: 11, color: '#999' }}>
          Territory locked · blueprint compiled · no assets generated until anchor approval
        </p>
      }
      inspect={<ExpressionEngineCampaignPanel projectSlug={projectSlug} />}
      nonNdxFallback={<p>Expression Engine campaign view is NDXBOOK-only.</p>}
    />
  );
}
