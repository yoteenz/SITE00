import type { DfView } from '../../foundation-client/model';
import {
  CommunicationPreferences,
  P07ProjectOverview,
  P08Roadmap,
  P09StageDetail,
  P10NeedsYou,
  RecordsLibrary,
} from '../../foundation-client/parents/ProjectPortal';
import { useReviewPreviewState } from './DigitalFoundationReviewPreviewContext';

export default function DigitalFoundationReviewClientPortalBody({
  view,
  onNavigate,
}: {
  view: DfView;
  onNavigate?: (view: DfView) => void;
}) {
  const { paidPayload, paidToken } = useReviewPreviewState();
  const noop = () => undefined;
  const go = (next: DfView) => onNavigate?.(next);

  if (!paidPayload) {
    return <p className="df-review__wait">CLIENT PORTAL FIXTURE NOT LOADED (J_PAYMENT_SUCCESS).</p>;
  }

  switch (view) {
    case 'OVERVIEW':
      return (
        <P07ProjectOverview
          payload={paidPayload}
          verify={null}
          onRoadmap={() => go('ROADMAP')}
          onNeedsYou={() => go('NEEDS_YOU')}
          onRecords={() => go('RECORDS')}
          onStage={() => go('STAGE')}
          onActivation={noop}
          onPrefs={() => go('COMM_PREFS')}
        />
      );
    case 'ROADMAP':
      return <P08Roadmap payload={paidPayload} onStage={() => go('STAGE')} onOverview={() => go('OVERVIEW')} />;
    case 'STAGE':
      return (
        <P09StageDetail
          payload={paidPayload}
          stageCode={paidPayload.stages[0]?.stage_code ?? '01_DETAILS_RECEIVED'}
          onRoadmap={() => go('ROADMAP')}
        />
      );
    case 'NEEDS_YOU':
      return paidToken ? (
        <P10NeedsYou
          token={paidToken}
          payload={paidPayload}
          onReload={async () => paidPayload}
          onOverview={() => go('OVERVIEW')}
        />
      ) : (
        <p className="df-review__wait">NEEDS YOU FIXTURE TOKEN MISSING.</p>
      );
    case 'RECORDS':
      return <RecordsLibrary payload={paidPayload} onOpen={noop} onOverview={() => go('OVERVIEW')} />;
    case 'COMM_PREFS':
      return (
        <CommunicationPreferences
          prefs={paidPayload.communication_preferences}
          busy={false}
          onSave={noop}
          onOverview={() => go('OVERVIEW')}
        />
      );
    default:
      return null;
  }
}
