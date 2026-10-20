/**
 * Standalone COMPLETE / BUILD_UPSELL surface (Board 11 → Board 12) for hosts outside the living portal.
 * Inside `/foundation/:token` the portal renders the same parents as the COMPLETE and LOCATION views.
 */
import { useState } from 'react';
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import { FoundationDfRoot } from '../../foundation-client/FoundationDfRoot';
import { P11FoundationComplete, P12DigitalLocation } from '../../foundation-client/parents/FoundationMilestone';
import { useFoundationPwaHead } from '../../foundation-client/useFoundationPwaHead';

export default function DigitalFoundationCompleteSurface({
  token,
  payload,
  reload,
  initialView = 'COMPLETE',
  onRecords,
  onOverview,
}: {
  token: string;
  payload: ClientDigitalFoundationPayload;
  reload: () => Promise<unknown>;
  initialView?: 'COMPLETE' | 'LOCATION';
  onRecords?: () => void;
  onOverview?: () => void;
}) {
  useFoundationPwaHead(true);
  const [view, setView] = useState<'COMPLETE' | 'LOCATION'>(initialView);
  const toComplete = () => setView('COMPLETE');
  return (
    <FoundationDfRoot object="crown" state={view} view={view}>
      {view === 'COMPLETE' ? (
        <P11FoundationComplete
          payload={payload}
          onRecords={onRecords ?? toComplete}
          onLocation={() => setView('LOCATION')}
          onOverview={onOverview ?? toComplete}
        />
      ) : (
        <P12DigitalLocation token={token} payload={payload} reload={reload} onOverview={onOverview ?? toComplete} />
      )}
    </FoundationDfRoot>
  );
}
