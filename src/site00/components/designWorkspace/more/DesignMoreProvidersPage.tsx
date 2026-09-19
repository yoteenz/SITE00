/**
 * P0.VR.MOF.R2 — AI Providers child page.
 */

import { MoreToolPageShell } from './MoreToolPageShell';
import { MoreSummaryGrid, MoreSummaryTile } from './MoreSummaryTile';

type Props = {
  onBack: () => void;
  falAvailable: boolean | null;
};

export function DesignMoreProvidersPage({ onBack, falAvailable }: Props) {
  const activeCount = (falAvailable !== false ? 2 : 1) + (falAvailable ? 1 : 0);
  const blocked = falAvailable === false;

  const detailsContent = (
    <div className="site00-dw-more-tool__details">
      <dl className="site00-dw-more-tool__detail-grid">
        <div>
          <dt>GPT IMAGE 2 EDIT</dt>
          <dd>PRIMARY · GPT IMAGE 2 EDIT ENDPOINT</dd>
        </div>
        <div>
          <dt>IDEOGRAM</dt>
          <dd>BACKGROUND REMOVE · ACTIVE</dd>
        </div>
        <div>
          <dt>FAL AUTO</dt>
          <dd>FALLBACK · {falAvailable ? 'READY' : 'BLOCKED'}</dd>
        </div>
        <div>
          <dt>ROUTING</dt>
          <dd>GPT PRIMARY → IDEOGRAM BG → FAL FALLBACK</dd>
        </div>
      </dl>
    </div>
  );

  return (
    <MoreToolPageShell
      title="AI PROVIDERS"
      description="Manage AI engines and routing."
      visualState={blocked ? 'attention' : 'ready'}
      statusBadge={`${activeCount} PROVIDERS AVAILABLE`}
      headline="AI PROVIDERS"
      support="Primary and fallback engines for reconstruction workflows."
      onBack={onBack}
      transitionKey="more-providers"
      primaryAction={{ label: 'MANAGE PROVIDERS', onClick: () => {} }}
      detailsContent={detailsContent}
      detailsTitle="PROVIDER DETAILS"
      summary={
        <MoreSummaryGrid>
          <MoreSummaryTile
            label="GPT IMAGE 2 EDIT"
            value="ACTIVE"
            tone={falAvailable === false ? 'attention' : 'active'}
          />
          <MoreSummaryTile label="IDEOGRAM" value="ACTIVE" tone="active" />
          <MoreSummaryTile
            label="FAL AUTO"
            value={falAvailable === false ? 'BLOCKED' : falAvailable ? 'READY' : 'CHECKING'}
            tone={falAvailable === false ? 'attention' : 'ready'}
          />
        </MoreSummaryGrid>
      }
    >
      <div className="site00-dw-more-tool__provider-cards">
        <article className="site00-dw-more-tool__provider-card">
          <strong>GPT IMAGE 2 EDIT</strong>
          <span>PRIMARY</span>
          <em>{falAvailable === false ? 'BLOCKED' : 'ACTIVE'}</em>
        </article>
        <article className="site00-dw-more-tool__provider-card">
          <strong>IDEOGRAM</strong>
          <span>BACKGROUND REMOVE</span>
          <em>ACTIVE</em>
        </article>
        <article className="site00-dw-more-tool__provider-card">
          <strong>FAL AUTO</strong>
          <span>FALLBACK</span>
          <em>{falAvailable ? 'READY' : 'BLOCKED'}</em>
        </article>
      </div>
    </MoreToolPageShell>
  );
}
