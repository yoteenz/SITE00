import type { DfView } from '../../foundation-client/model';
import {
  CommunicationPreferences,
  P07ProjectOverview,
  P08Roadmap,
  P09StageDetail,
  P10NeedsYou,
  RecordsLibrary,
  RecordDetail,
} from '../../foundation-client/parents/ProjectPortal';
import { useReviewPreviewState } from './DigitalFoundationReviewPreviewContext';
import { reviewFixtureForEntry } from './reviewFixtureResolver';
import type { DfReviewEntry } from './digitalFoundationReviewRegistry';

export default function DigitalFoundationReviewClientPortalBody({
  view,
  entry,
  recordId,
  onNavigate,
}: {
  view: DfView;
  entry?: DfReviewEntry;
  recordId?: string;
  onNavigate?: (view: DfView, recordId?: string) => void;
}) {
  const state = useReviewPreviewState();
  const resolved = reviewFixtureForEntry(entry, state.bootstrap, {
    quote: state.quotePayload,
    paid: state.paidPayload,
    paidToken: state.paidToken,
    postIntake: state.postIntakePayload,
    proposalReady: state.proposalReadyPayload,
    paymentFailure: state.paymentFailurePayload,
    complete: state.completePayload,
    completeToken: state.completeToken,
  });

  const payload = resolved?.payload ?? state.paidPayload;
  const token = resolved?.token ?? state.paidToken;

  const noop = () => undefined;
  const go = (next: DfView, rec?: string) => onNavigate?.(next, rec);

  if (!payload) {
    return <p className="df-review__wait">CLIENT PORTAL FIXTURE NOT LOADED ({entry?.fixtureContract ?? 'J_PAYMENT_SUCCESS'}).</p>;
  }

  switch (view) {
    case 'OVERVIEW':
      return (
        <P07ProjectOverview
          payload={payload}
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
      return <P08Roadmap payload={payload} onStage={() => go('STAGE')} onOverview={() => go('OVERVIEW')} />;
    case 'STAGE':
      return (
        <P09StageDetail
          payload={payload}
          stageCode={payload.stages[0]?.stage_code ?? '01_DETAILS_RECEIVED'}
          onRoadmap={() => go('ROADMAP')}
        />
      );
    case 'NEEDS_YOU':
      return token ? (
        <P10NeedsYou token={token} payload={payload} onReload={async () => payload} onOverview={() => go('OVERVIEW')} />
      ) : (
        <P10NeedsYou token="review-inert" payload={payload} onReload={async () => payload} onOverview={() => go('OVERVIEW')} />
      );
    case 'RECORDS':
      return <RecordsLibrary payload={payload} onOpen={(id) => go('RECORD', id)} onOverview={() => go('OVERVIEW')} />;
    case 'RECORD':
      return (
        <RecordDetail
          payload={payload}
          recordId={recordId ?? 'record-domain'}
          onBack={() => go('RECORDS')}
        />
      );
    case 'COMM_PREFS':
      return (
        <CommunicationPreferences
          prefs={payload.communication_preferences}
          busy={false}
          onSave={noop}
          onOverview={() => go('OVERVIEW')}
        />
      );
    default:
      return null;
  }
}
