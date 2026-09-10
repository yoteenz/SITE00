/**
 * P0.VR.MOF.R2 — Storage & Output child page.
 */

import { MoreToolPageShell } from './MoreToolPageShell';
import { MoreSummaryGrid, MoreSummaryTile } from './MoreSummaryTile';

type Props = {
  onBack: () => void;
};

export function DesignMoreStoragePage({ onBack }: Props) {
  const detailsContent = (
    <div className="site00-dw-more-tool__details">
      <dl className="site00-dw-more-tool__detail-grid">
        <div>
          <dt>BUCKET</dt>
          <dd>site00-assets</dd>
        </div>
        <div>
          <dt>STORAGE DESTINATION</dt>
          <dd>SUPABASE PUBLIC</dd>
        </div>
        <div>
          <dt>NAMING PATTERN</dt>
          <dd>{'{projectId}/{screenId}/{viewport}'}</dd>
        </div>
        <div>
          <dt>DEFAULT RESOLUTION</dt>
          <dd>2X RETINA</dd>
        </div>
        <div>
          <dt>OPTIMIZATION</dt>
          <dd>PNG LOSSLESS</dd>
        </div>
        <div>
          <dt>AUTO SYNC</dt>
          <dd>ON</dd>
        </div>
      </dl>
    </div>
  );

  return (
    <MoreToolPageShell
      title="STORAGE & OUTPUT"
      description="Supabase bindings and output rules."
      visualState="ready"
      statusBadge="CONNECTED"
      headline="STORAGE & OUTPUT"
      support="Assets sync to Supabase with live replace when captures complete."
      onBack={onBack}
      transitionKey="more-storage"
      primaryAction={{ label: 'MANAGE STORAGE', onClick: () => {} }}
      secondaryAction={{ label: 'OUTPUT RULES', onClick: () => {}, variant: 'outline' }}
      detailsContent={detailsContent}
      detailsTitle="STORAGE DETAILS"
      summary={
        <MoreSummaryGrid>
          <MoreSummaryTile label="SUPABASE" value="CONNECTED" tone="ready" />
          <MoreSummaryTile label="LIVE REPLACE" value="READY" tone="ready" />
          <MoreSummaryTile label="OUTPUT FORMAT" value="PNG" tone="neutral" />
          <MoreSummaryTile label="AUTO SYNC" value="ON" tone="active" />
        </MoreSummaryGrid>
      }
    />
  );
}
