import { useMemo, useState, type ReactNode } from 'react';
import type { DfView } from '../../foundation-client/model';
import { P01Entry, P02Intake } from '../../foundation-client/parents/EntryIntake';
import { P03IntakeSubmitted } from '../../foundation-client/parents/IntakeSubmittedStatus';
import { P04Recommendation } from '../../foundation-client/parents/Recommendation';
import { P05Review, P06Activation } from '../../foundation-client/parents/CheckoutActivation';
import { DfFrame, DfMenu, type DfObjectKind } from '../../foundation-client/shell';
import { DF_VIEW_ORDER } from '../../foundation-client/model';
import DigitalFoundationCompleteSurface from './DigitalFoundationCompleteSurface';
import ReviewP03ConfigureSurface from './ReviewP03ConfigureSurface';
import { intakeConfiguratorAnchorIds } from './digitalFoundationBuilderManifest';
import { resolveReviewEntry } from './digitalFoundationReviewRegistry';
import { reviewAnchorForView, scrollToReviewAnchor } from './reviewLinks';
import { useReviewPreviewState } from './DigitalFoundationReviewPreviewContext';
import DigitalFoundationReviewBuilderStudioEmbed from './DigitalFoundationReviewBuilderStudioEmbed';
import DigitalFoundationReviewClientPortalBody from './DigitalFoundationReviewClientPortalBody';
import DigitalFoundationReviewClientPortalHost from './DigitalFoundationReviewClientPortalHost';
import DigitalFoundationReviewFounderHost from './DigitalFoundationReviewFounderHost';
import { SITE00_ROUTES } from '../../config/routes';

const OBJECT_FOR: Record<DfView, DfObjectKind> = {
  P01: 'hero',
  P02: 'corner',
  P03: 'corner',
  P04: 'crown',
  P05: 'crown',
  P06: 'crown',
  OVERVIEW: 'crown',
  ROADMAP: 'crown',
  STAGE: 'crown',
  NEEDS_YOU: 'crown',
  RECORDS: 'crown',
  RECORD: 'crown',
  COMM_PREFS: 'corner',
  COMPLETE: 'crown',
};

const REVIEW_MENU_VIEWS: DfView[] = [...DF_VIEW_ORDER, 'ROADMAP', 'STAGE', 'NEEDS_YOU', 'RECORDS', 'COMM_PREFS'];

const PORTAL_VIEWS = new Set<DfView>(['OVERVIEW', 'ROADMAP', 'STAGE', 'NEEDS_YOU', 'RECORDS', 'COMM_PREFS']);

function SimulatedBanner({ label }: { label: string }) {
  return <p className="df-review__sim df-review__sim--inline">SIMULATED FIXTURE · {label}</p>;
}

function StageChrome({
  id,
  view,
  title,
  children,
}: {
  id: string;
  view: DfView;
  title: string;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <article className="df-review__item df-review__item--stage" id={id} data-review-anchor={id}>
      <div className="df-review__mark">
        <p className="df-review__label">{title}</p>
        <a className="df-review__direct" href={`#${id}`}>
          #{id}
        </a>
      </div>
      <div className={`df-root${menuOpen ? ' df-root--menu-open' : ''}`}>
        <DfFrame view={view} object={OBJECT_FOR[view]} onMenu={() => setMenuOpen((o) => !o)} menuOpen={menuOpen}>
          {children}
        </DfFrame>
        <DfMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          views={REVIEW_MENU_VIEWS}
          current={view}
          onNavigate={() => setMenuOpen(false)}
        />
      </div>
    </article>
  );
}

function PanelStage({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <article className="df-review__item df-review__item--stage" id={id} data-review-anchor={id}>
      <div className="df-review__mark">
        <p className="df-review__label">{title}</p>
        <a className="df-review__direct" href={`#${id}`}>
          #{id}
        </a>
      </div>
      {children}
    </article>
  );
}

export default function DigitalFoundationReviewPreviewHost({ anchorId }: { anchorId: string }) {
  const state = useReviewPreviewState();
  const {
    config,
    catalog,
    quotePayload,
    quoteToken,
    paidPayload,
    postIntakePayload,
    proposalReadyPayload,
    paymentFailurePayload,
    completePayload,
    completeToken,
    postIntakeFetchedAt,
    draft,
    setDraft,
    setQuotePayload,
  } = state;

  const entry = resolveReviewEntry(anchorId);
  const noop = () => undefined;
  const update = (patch: Partial<typeof draft>) => setDraft((d) => ({ ...d, ...patch }));
  const advance = (view: DfView) => scrollToReviewAnchor(reviewAnchorForView(view));

  const effectiveAnchor = useMemo(() => {
    if (anchorId === 'df-r-client-portal') return anchorId;
    if (PORTAL_VIEWS.has(viewFromAnchorId(anchorId))) return anchorId;
    return anchorId || reviewAnchorForView('P01');
  }, [anchorId]);

  if (entry?.renderMode === 'inline_founder_shell') {
    return (
      <PanelStage id={anchorId} title={entry.pageName.toUpperCase()}>
        <DigitalFoundationReviewFounderHost anchorId={anchorId} />
      </PanelStage>
    );
  }

  if (effectiveAnchor === 'df-r-client-portal') {
    return (
      <PanelStage id="df-r-client-portal" title="CLIENT FOUNDATION PORTAL">
        <DigitalFoundationReviewClientPortalHost anchorId={reviewAnchorForView('OVERVIEW')} />
      </PanelStage>
    );
  }

  if (
    (entry?.group === 'CLIENT_PORTAL' || entry?.group === 'CLIENT_COMPLETION') &&
    (PORTAL_VIEWS.has(viewFromAnchorId(effectiveAnchor)) || effectiveAnchor === 'df-r-record-domain')
  ) {
    const portalView = effectiveAnchor === 'df-r-record-domain' ? 'RECORD' : viewFromAnchorId(effectiveAnchor);
    const fixtureLabel = entry.fixtureContract ?? 'J_PAYMENT_SUCCESS';
    return (
      <StageChrome id={effectiveAnchor} view={portalView === 'RECORD' ? 'RECORDS' : portalView} title={entry.pageName.toUpperCase()}>
        <SimulatedBanner label={`${fixtureLabel} · CLIENT PORTAL`} />
        <DigitalFoundationReviewClientPortalBody
          view={portalView}
          entry={entry}
          recordId={effectiveAnchor === 'df-r-record-domain' ? 'record-domain' : undefined}
        />
      </StageChrome>
    );
  }

  if (anchorId.startsWith('df-r-bldr-')) {
    const room = anchorId.replace('df-r-bldr-', '');
    return <DigitalFoundationReviewBuilderStudioEmbed anchorId={anchorId} room={room} />;
  }

  if (entry?.renderMode === 'registry_gap') {
    return (
      <PanelStage id={anchorId} title={entry.pageName.toUpperCase()}>
        <p className="df-review__wait df-review__wait--panel">COVERAGE INVENTORY · NOT IMPLEMENTED AS INLINE PREVIEW</p>
        {entry.notes && <p className="df-review__gap-note">{entry.notes}</p>}
      </PanelStage>
    );
  }

  if (entry?.renderMode === 'external_route' && entry.group === 'FOUNDER_OVERLAYS') {
    return (
      <PanelStage id={anchorId} title={entry.pageName.toUpperCase()}>
        <p className="df-review__sim df-review__sim--inline">
          {entry.implementationStatus === 'backend_blocked' ? 'BLOCKED' : 'AUTHENTICATED'} · OVERLAY · OPEN FROM FOUNDER WORKSPACE
        </p>
        <p className="df-review__gap-note">{entry.notes}</p>
        {entry.runtimeRoute && (
          <a className="df-review__route-name df-review__route-name--external" href={entry.runtimeRoute} target="_blank" rel="noreferrer">
            LIVE ROUTE (AUTH REQUIRED) · {entry.runtimeRoute}
          </a>
        )}
      </PanelStage>
    );
  }

  if (entry?.renderMode === 'external_route') {
    return (
      <PanelStage id={anchorId} title={entry.pageName.toUpperCase()}>
        <p className="df-review__sim df-review__sim--inline">AUTHENTICATED · LIVE ROUTE (NOT INLINE FIXTURE)</p>
        {entry.notes && <p className="df-review__gap-note">{entry.notes}</p>}
        {entry.runtimeRoute && (
          <a className="df-review__route-name df-review__route-name--cta df-review__external-cta" href={entry.runtimeRoute} target="_blank" rel="noreferrer">
            OPEN {entry.runtimeRoute}
          </a>
        )}
      </PanelStage>
    );
  }

  if (intakeConfiguratorAnchorIds().includes(anchorId)) {
    const initialState =
      anchorId === 'df-r-P03-domain' ? 'domain_expanded' : anchorId === 'df-r-P03-email' ? 'email_expanded' : 'default';
    return (
      <StageChrome id={anchorId} view="P03" title={`03 · BUILD YOUR FOUNDATION · ${initialState.replace('_', ' ').toUpperCase()}`}>
        <ReviewP03ConfigureSurface initialState={initialState} />
      </StageChrome>
    );
  }

  switch (anchorId) {
    case 'df-r-P01':
      return (
        <StageChrome id={anchorId} view="P01" title="01 · GET STARTED">
          <P01Entry config={config} onBegin={() => advance('P02')} busy={false} error={null} />
        </StageChrome>
      );
    case 'df-r-P02':
      return (
        <StageChrome id={anchorId} view="P02" title="02 · BUSINESS INFORMATION">
          <P02Intake draft={draft} update={update} editable save={null} onContinue={() => advance('P03')} />
        </StageChrome>
      );
    case 'df-r-P04':
      return (
        <StageChrome id={anchorId} view="P04" title="04 · RECOMMENDATION">
          {quotePayload ? (
            <>
              <SimulatedBanner label="A_BASE · QUOTE FIXTURE" />
              <P04Recommendation
                payload={quotePayload}
                catalog={catalog}
                config={config}
                desired={{}}
                syncStatus="idle"
                syncError={null}
                onToggle={noop}
                onQuantity={noop}
                onContinue={() => advance('P05')}
                onRefresh={noop}
              />
            </>
          ) : (
            <p className="df-review__wait">RECOMMENDATION FIXTURE NOT LOADED — CHECK PREVIEW DATA SOURCE.</p>
          )}
        </StageChrome>
      );
    case 'df-r-P05':
      return (
        <StageChrome id={anchorId} view="P05" title="05 · REVIEW + CHECKOUT">
          {quotePayload ? (
            <P05Review
              token={quoteToken}
              payload={quotePayload}
              config={config}
              setPayload={setQuotePayload}
              reload={async () => quotePayload}
              checkout={null}
              onEditAddons={() => advance('P04')}
            />
          ) : (
            <p className="df-review__wait">LOADING REVIEW</p>
          )}
        </StageChrome>
      );
    case 'df-r-P06':
      return (
        <StageChrome id={anchorId} view="P06" title="06 · ACTIVATION">
          {paidPayload ? (
            <>
              <SimulatedBanner label="J_PAYMENT_SUCCESS" />
              <P06Activation
                payload={paidPayload}
                verify={null}
                attempt={0}
                attempts={0}
                simulated
                onOverview={() => advance('OVERVIEW')}
                onRetry={noop}
              />
            </>
          ) : (
            <p className="df-review__wait">ACTIVATION FIXTURE NOT LOADED.</p>
          )}
        </StageChrome>
      );
    case 'df-r-post-intake-submitted':
      return (
        <StageChrome id={anchorId} view="P03" title="POST-INTAKE · INTAKE RECEIVED">
          {postIntakePayload ? (
            <>
              <SimulatedBanner label="INTAKE_SUBMITTED · G-02 WITHHELD" />
              <P03IntakeSubmitted payload={postIntakePayload} fetchedAt={postIntakeFetchedAt} onRefresh={noop} busy={false} />
            </>
          ) : (
            <p className="df-review__wait">POST-INTAKE FIXTURE NOT LOADED.</p>
          )}
        </StageChrome>
      );
    case 'df-r-post-intake-status':
      return (
        <StageChrome id={anchorId} view="P03" title="POST-INTAKE · REVIEW STATUS">
          {postIntakePayload ? (
            <>
              <SimulatedBanner label="INTAKE_SUBMITTED" />
              <P03IntakeSubmitted payload={postIntakePayload} fetchedAt={postIntakeFetchedAt} onRefresh={noop} busy={false} />
            </>
          ) : (
            <p className="df-review__wait">POST-INTAKE FIXTURE NOT LOADED.</p>
          )}
        </StageChrome>
      );
    case 'df-r-proposal-ready':
      return (
        <StageChrome id={anchorId} view="P04" title="PROPOSAL · PERSONALIZED READY">
          {proposalReadyPayload ? (
            <>
              <SimulatedBanner label="PROPOSAL_READY · COMMERCIAL RELEASE" />
              <P04Recommendation
                payload={proposalReadyPayload}
                catalog={catalog}
                config={config}
                desired={{}}
                syncStatus="idle"
                syncError={null}
                onToggle={noop}
                onQuantity={noop}
                onContinue={() => advance('P05')}
                onRefresh={noop}
              />
            </>
          ) : (
            <p className="df-review__wait">PROPOSAL READY FIXTURE NOT LOADED.</p>
          )}
        </StageChrome>
      );
    case 'df-r-quote-acceptance':
    case 'df-r-awaiting-payment':
      return (
        <StageChrome id={anchorId} view="P05" title={anchorId === 'df-r-quote-acceptance' ? 'QUOTE ACCEPTANCE' : 'AWAITING PAYMENT'}>
          {quotePayload && quoteToken ? (
            <>
              <SimulatedBanner label="A_BASE" />
              <P05Review
                token={quoteToken}
                payload={quotePayload}
                config={config}
                setPayload={setQuotePayload}
                reload={async () => quotePayload}
                checkout={null}
                onEditAddons={() => advance('P04')}
              />
            </>
          ) : (
            <p className="df-review__wait">QUOTE FIXTURE NOT LOADED.</p>
          )}
        </StageChrome>
      );
    case 'df-r-payment-failure':
      return (
        <StageChrome id={anchorId} view="P06" title="PAYMENT FAILURE">
          {paymentFailurePayload ? (
            <>
              <SimulatedBanner label="K_PAYMENT_FAILURE" />
              <P06Activation
                payload={paymentFailurePayload}
                verify={null}
                attempt={1}
                attempts={3}
                simulated
                onOverview={() => advance('OVERVIEW')}
                onRetry={noop}
              />
            </>
          ) : (
            <p className="df-review__wait">PAYMENT FAILURE FIXTURE NOT LOADED.</p>
          )}
        </StageChrome>
      );
    case 'df-r-complete':
      return (
        <PanelStage id={anchorId} title="FOUNDATION COMPLETE (FIXTURE)">
          {completePayload && completeToken ? (
            <DigitalFoundationCompleteSurface
              token={completeToken}
              payload={completePayload}
              reload={async () => completePayload}
            />
          ) : (
            <p className="df-review__wait">LOADING COMPLETE</p>
          )}
        </PanelStage>
      );
    case 'df-r-client-return':
      return (
        <PanelStage id={anchorId} title="CLIENT RETURN / REENTRY">
          <p className="df-review__wait df-review__wait--panel">LIVE ROUTE — SESSION OR REENTRY FORM (NOT INLINE ON THIS PAGE).</p>
          <a
            className="df-review__route-name df-review__route-name--cta df-review__external-cta"
            href={SITE00_ROUTES.digitalFoundationReturn}
            target="_blank"
            rel="noreferrer"
          >
            OPEN {SITE00_ROUTES.digitalFoundationReturn}
          </a>
        </PanelStage>
      );
    default:
      return (
        <PanelStage id={anchorId || 'df-review-empty'} title="SELECT A REGISTRY ENTRY">
          <p className="df-review__wait">USE THE REGISTRY ABOVE TO OPEN A REAL REVIEW SURFACE.</p>
        </PanelStage>
      );
  }
}

function viewFromAnchorId(anchorId: string): DfView {
  const m = anchorId.match(/^df-r-([A-Z_]+)$/);
  return (m?.[1] ?? 'OVERVIEW') as DfView;
}
