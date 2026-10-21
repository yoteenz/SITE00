import type { DfView } from '../../foundation-client/model';
import { P11FoundationComplete, P12DigitalLocation } from '../../foundation-client/parents/FoundationMilestone';
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

/**
 * Client portal parents on review fixtures. Rendered inside `DfReviewInertProvider` by the review hosts, so
 * approval, save-for-later and builder handoff never call the API from this page.
 */
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
  const token = resolved?.token || state.paidToken || 'review-inert';

  const noop = () => undefined;
  const go = (next: DfView, rec?: string) => onNavigate?.(next, rec);

  if (!payload) {
    const fixture = entry?.fixtureContract ?? 'J_PAYMENT_SUCCESS';
    return (
      <p className="df-review__wait">
        {state.bootstrap ? `CLIENT PORTAL FIXTURE NOT LOADED (${fixture}).` : `LOADING REVIEW FIXTURE (${fixture})…`}
      </p>
    );
  }
  const complete = payload.artifact.completion_state === 'COMPLETE';
  const reload = async () => payload;

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
          onComplete={complete ? () => go('COMPLETE') : undefined}
          onLocation={complete ? () => go('LOCATION') : undefined}
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
      return <P10NeedsYou token={token} payload={payload} onReload={reload} onOverview={() => go('OVERVIEW')} />;
    case 'RECORDS':
      return <RecordsLibrary payload={payload} onOpen={(id) => go('RECORD', id)} onOverview={() => go('OVERVIEW')} />;
    case 'RECORD':
      return <RecordDetail payload={payload} recordId={recordId ?? 'record-domain'} onBack={() => go('RECORDS')} />;
    case 'COMPLETE':
      return (
        <P11FoundationComplete
          payload={payload}
          onRecords={() => go('RECORDS')}
          onLocation={() => go('LOCATION')}
          onOverview={() => go('OVERVIEW')}
        />
      );
    case 'LOCATION':
      return <P12DigitalLocation token={token} payload={payload} reload={reload} onOverview={() => go('OVERVIEW')} />;
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
