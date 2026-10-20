/**
 * Digital Foundation micro-product review index (`/foundation/review`).
 * Fixture-backed previews only — not live client/founder auth surfaces.
 */
import { useEffect, useState, type ReactNode } from 'react';
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import type { DigitalFoundationCommercialConfig } from '../../../../shared/site00-digital-foundation/types.js';
import type { ClientCatalogEntry } from '../../foundation-client/api';
import { P01Entry, P02Intake, P03Configure } from '../../foundation-client/parents/EntryIntake';
import { P03IntakeSubmitted } from '../../foundation-client/parents/IntakeSubmittedStatus';
import { P04Recommendation } from '../../foundation-client/parents/Recommendation';
import { P05Review, P06Activation } from '../../foundation-client/parents/CheckoutActivation';
import {
  CommunicationPreferences,
  P07ProjectOverview,
  P08Roadmap,
  P09StageDetail,
  P10NeedsYou,
  RecordsLibrary,
} from '../../foundation-client/parents/ProjectPortal';
import { DfFrame, DfMenu, type DfObjectKind } from '../../foundation-client/shell';
import { DF_VIEW_ORDER, type DfView, type IntakeDraft } from '../../foundation-client/model';
import DigitalFoundationCompleteSurface from './DigitalFoundationCompleteSurface';
import {
  APPROVED_FOUNDATION_BUILDER_SOURCE,
  DIGITAL_FOUNDATION_REVIEW_REGISTRY_VERSION,
  allReviewRegistryEntries,
  registryCoverageTotals,
} from './digitalFoundationReviewRegistry';
import { loadReviewBootstrapBundle } from './digitalFoundationReviewBootstrap';
import DigitalFoundationReviewNav from './DigitalFoundationReviewNav';
import { reviewAnchorForView, reviewScreenUrl, scrollToReviewAnchor } from './reviewLinks';
import { SITE00_ROUTES } from '../../config/routes';
import '../../foundation-client/foundationDfStyles';

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
};

const REVIEW_MENU_VIEWS: DfView[] = [
  ...DF_VIEW_ORDER,
  'ROADMAP',
  'STAGE',
  'NEEDS_YOU',
  'RECORDS',
  'COMM_PREFS',
];

const DEPRECATED_BLDR_ROOMS = ['PLACE', 'FEEL', 'WORK', 'PACE', 'BLUEPRINT'] as const;

const BLANK_DRAFT: IntakeDraft = {
  business_name: '',
  industry: '',
  contact_name: '',
  current_email: '',
  phone: '',
  existing_domain: '',
  existing_registrar: '',
  existing_email_provider: '',
  team_size: 1,
  domainPath: null,
  needs: [],
};

function DirectLink({ anchorId }: { anchorId: string }) {
  const href = reviewScreenUrl(anchorId);
  return (
    <a className="df-review__direct" href={href} title={href}>
      {href}
    </a>
  );
}

function ReviewProvenance({ dataSource }: { dataSource: string }) {
  const buildId =
    typeof document !== 'undefined'
      ? document.querySelector('meta[name="app-build-id"]')?.getAttribute('content') ?? '—'
      : '—';
  const totals = registryCoverageTotals();
  return (
    <p className="df-review__provenance">
      IDNTY DIGITAL FOUNDATION · REGISTRY {DIGITAL_FOUNDATION_REVIEW_REGISTRY_VERSION} · BUILD {buildId} · DATA {dataSource} ·
      REGISTERED {totals.discovered} · BUILDER {APPROVED_FOUNDATION_BUILDER_SOURCE}
    </p>
  );
}

function SimulatedBanner({ label }: { label: string }) {
  return <p className="df-review__sim df-review__sim--inline">SIMULATED FIXTURE · {label}</p>;
}

function RegistryGapPanel({ id, title, notes }: { id: string; title: string; notes?: string }) {
  return (
    <ReviewPanel id={id} title={title}>
      <p className="df-review__wait df-review__wait--panel">COVERAGE INVENTORY · NOT IMPLEMENTED AS INLINE PREVIEW</p>
      {notes && <p className="df-review__gap-note">{notes}</p>}
    </ReviewPanel>
  );
}

function LegacyPublicBuilderRedirect({ anchorId, room }: { anchorId: string; room: string }) {
  return (
    <article className="df-review__item df-review__item--blocked" id={anchorId}>
      <div className="df-review__mark">
        <p className="df-review__label">DEPRECATED · PUBLIC BUILDER · {room}</p>
        <DirectLink anchorId={anchorId} />
      </div>
      <div className="df-review__blocked">
        <p className="df-review__sim">REVIEW MODE · WRONG PRODUCT BLOCKED</p>
        <p>
          THIS LINK PREVIOUSLY IFRAMED THE PUBLIC SITE 00 CUSTOMER BUILDER (<code>/bldr/studio</code>). THAT IS NOT THE IDNTY
          DIGITAL FOUNDATION CONFIGURATOR.
        </p>
        <p>
          APPROVED FOUNDATION BUILDER SOURCE: <code>{APPROVED_FOUNDATION_BUILDER_SOURCE}</code>
        </p>
        <a className="df-review__route-name df-review__route-name--cta" href={`#${reviewAnchorForView('P03')}`}>
          OPEN FOUNDATION CONFIGURATOR (P03)
        </a>
      </div>
    </article>
  );
}

function ReviewPanel({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <article className="df-review__item" id={id}>
      <div className="df-review__mark">
        <p className="df-review__label">{title}</p>
        <DirectLink anchorId={id} />
      </div>
      {children}
    </article>
  );
}

function Screen({
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
    <article className="df-review__item" id={id}>
      <div className="df-review__mark">
        <p className="df-review__label">{title}</p>
        <DirectLink anchorId={id} />
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

export default function DigitalFoundationReviewPage() {
  const [config, setConfig] = useState<DigitalFoundationCommercialConfig | null>(null);
  const [catalog, setCatalog] = useState<ClientCatalogEntry[] | null>(null);
  const [quotePayload, setQuotePayload] = useState<ClientDigitalFoundationPayload | null>(null);
  const [quoteToken, setQuoteToken] = useState('');
  const [paidToken, setPaidToken] = useState('');
  const [paidPayload, setPaidPayload] = useState<ClientDigitalFoundationPayload | null>(null);
  const [postIntakePayload, setPostIntakePayload] = useState<ClientDigitalFoundationPayload | null>(null);
  const [proposalReadyPayload, setProposalReadyPayload] = useState<ClientDigitalFoundationPayload | null>(null);
  const [paymentFailurePayload, setPaymentFailurePayload] = useState<ClientDigitalFoundationPayload | null>(null);
  const [completePayload, setCompletePayload] = useState<ClientDigitalFoundationPayload | null>(null);
  const [completeToken, setCompleteToken] = useState('');
  const [postIntakeFetchedAt] = useState(() => new Date());
  const [draft, setDraft] = useState<IntakeDraft>(BLANK_DRAFT);
  const [note, setNote] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState('loading');
  const gapEntries = allReviewRegistryEntries().filter((e) => e.implementationStatus === 'not_implemented');

  useEffect(() => {
    const prev = document.title;
    document.title = 'DIGITAL FOUNDATION — REVIEW REGISTRY';
    return () => {
      document.title = prev;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const bundle = await loadReviewBootstrapBundle();
      if (cancelled) return;
      setDataSource(bundle.source);
      setCatalog(bundle.catalog);
      setConfig(bundle.config);
      const f = bundle.fixtures;
      if (f.A_BASE) {
        setQuoteToken(f.A_BASE.token);
        setQuotePayload(f.A_BASE.payload);
      }
      if (f.J_PAYMENT_SUCCESS) {
        setPaidToken(f.J_PAYMENT_SUCCESS.token);
        setPaidPayload(f.J_PAYMENT_SUCCESS.payload);
      }
      if (f.INTAKE_SUBMITTED) setPostIntakePayload(f.INTAKE_SUBMITTED.payload);
      if (f.PROPOSAL_READY) setProposalReadyPayload(f.PROPOSAL_READY.payload);
      if (f.K_PAYMENT_FAILURE) setPaymentFailurePayload(f.K_PAYMENT_FAILURE.payload);
      if (f.M_COMPLETE_CREDIT) {
        setCompleteToken(f.M_COMPLETE_CREDIT.token);
        setCompletePayload(f.M_COMPLETE_CREDIT.payload);
      }
      if (bundle.bootstrapError) setNote(bundle.bootstrapError.toUpperCase());
      else if (!f.A_BASE) setNote('FIXTURE BUNDLE INCOMPLETE — RECOMMENDATION MAY NOT RENDER.');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (patch: Partial<IntakeDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const noop = () => undefined;
  const advance = (view: DfView) => scrollToReviewAnchor(reviewAnchorForView(view));

  return (
    <div className="df-review">
      <DigitalFoundationReviewNav />
      <header className="df-review__intro">
        <ReviewProvenance dataSource={dataSource} />
        <p>FIXTURE-BACKED IDNTY DIGITAL FOUNDATION SCREENS ON ONE PAGE. PUBLIC SITE 00 BUILDER ROUTES ARE BLOCKED.</p>
        {note && <p className="df-review__diag">{note}</p>}
      </header>
      <div className="df-review__strip">
        <Screen id="df-r-P01" view="P01" title="01 · GET STARTED">
          <P01Entry config={config} onBegin={() => advance('P02')} busy={false} error={null} />
        </Screen>
        <Screen id="df-r-P02" view="P02" title="02 · BUSINESS INFORMATION">
          <P02Intake draft={draft} update={update} editable save={null} onContinue={() => advance('P03')} />
        </Screen>
        <Screen id="df-r-P03" view="P03" title="03 · BUILD YOUR FOUNDATION">
          <P03Configure
            draft={draft}
            update={update}
            editable
            onSubmit={(errors) => {
              if (Object.values(errors).some(Boolean)) return;
              advance('P04');
            }}
            submitting={false}
            submitError={null}
            save={null}
          />
        </Screen>
        <Screen id="df-r-P04" view="P04" title="04 · RECOMMENDATION">
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
        </Screen>
        <Screen id="df-r-P05" view="P05" title="05 · REVIEW + CHECKOUT">
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
        </Screen>
        <Screen id="df-r-P06" view="P06" title="06 · ACTIVATION">
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
        </Screen>
        <Screen id="df-r-post-intake-submitted" view="P03" title="POST-INTAKE · INTAKE RECEIVED">
          {postIntakePayload ? (
            <>
              <SimulatedBanner label="INTAKE_SUBMITTED · G-02 WITHHELD" />
              <P03IntakeSubmitted
                payload={postIntakePayload}
                fetchedAt={postIntakeFetchedAt}
                onRefresh={noop}
                busy={false}
              />
            </>
          ) : (
            <p className="df-review__wait">POST-INTAKE FIXTURE NOT LOADED.</p>
          )}
        </Screen>
        <Screen id="df-r-post-intake-status" view="P03" title="POST-INTAKE · REVIEW STATUS">
          {postIntakePayload ? (
            <>
              <SimulatedBanner label="INTAKE_SUBMITTED" />
              <P03IntakeSubmitted payload={postIntakePayload} fetchedAt={postIntakeFetchedAt} onRefresh={noop} busy={false} />
            </>
          ) : (
            <p className="df-review__wait">POST-INTAKE FIXTURE NOT LOADED.</p>
          )}
        </Screen>
        <Screen id="df-r-proposal-ready" view="P04" title="PROPOSAL · PERSONALIZED READY">
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
        </Screen>
        <Screen id="df-r-quote-acceptance" view="P05" title="QUOTE ACCEPTANCE">
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
        </Screen>
        <Screen id="df-r-awaiting-payment" view="P05" title="AWAITING PAYMENT">
          {quotePayload && quoteToken ? (
            <>
              <SimulatedBanner label="A_BASE · CHECKOUT PARENT" />
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
            <p className="df-review__wait">CHECKOUT FIXTURE NOT LOADED.</p>
          )}
        </Screen>
        <Screen id="df-r-payment-failure" view="P06" title="PAYMENT FAILURE">
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
        </Screen>
        <Screen id="df-r-OVERVIEW" view="OVERVIEW" title="07 · PROJECT OVERVIEW">
          {paidPayload ? (
            <P07ProjectOverview
              payload={paidPayload}
              verify={null}
              onRoadmap={() => advance('ROADMAP')}
              onNeedsYou={() => advance('NEEDS_YOU')}
              onRecords={() => advance('RECORDS')}
              onStage={() => advance('STAGE')}
              onActivation={() => advance('P06')}
              onPrefs={() => advance('COMM_PREFS')}
            />
          ) : (
            <p className="df-review__wait">LOADING OVERVIEW</p>
          )}
        </Screen>
        <Screen id="df-r-ROADMAP" view="ROADMAP" title="08 · PROJECT ROADMAP">
          {paidPayload ? (
            <P08Roadmap
              payload={paidPayload}
              onStage={() => advance('STAGE')}
              onOverview={() => advance('OVERVIEW')}
            />
          ) : (
            <p className="df-review__wait">LOADING ROADMAP</p>
          )}
        </Screen>
        <Screen id="df-r-STAGE" view="STAGE" title="09 · STAGE DETAIL">
          {paidPayload ? (
            <P09StageDetail
              payload={paidPayload}
              stageCode={paidPayload.stages[0]?.stage_code ?? '01_DETAILS_RECEIVED'}
              onRoadmap={() => advance('ROADMAP')}
            />
          ) : (
            <p className="df-review__wait">LOADING STAGE</p>
          )}
        </Screen>
        <Screen id="df-r-NEEDS_YOU" view="NEEDS_YOU" title="10 · NEEDS YOU">
          {paidPayload && paidToken ? (
            <P10NeedsYou
              token={paidToken}
              payload={paidPayload}
              onReload={async () => paidPayload}
              onOverview={() => advance('OVERVIEW')}
            />
          ) : (
            <p className="df-review__wait">LOADING NEEDS YOU</p>
          )}
        </Screen>
        <Screen id="df-r-RECORDS" view="RECORDS" title="MY RECORDS">
          {paidPayload ? (
            <RecordsLibrary
              payload={paidPayload}
              onOpen={noop}
              onOverview={() => advance('OVERVIEW')}
            />
          ) : (
            <p className="df-review__wait">LOADING RECORDS</p>
          )}
        </Screen>
        <Screen id="df-r-COMM_PREFS" view="COMM_PREFS" title="COMMUNICATION PREFERENCES">
          {paidPayload ? (
            <CommunicationPreferences
              prefs={paidPayload.communication_preferences}
              busy={false}
              onSave={noop}
              onOverview={() => advance('OVERVIEW')}
            />
          ) : (
            <p className="df-review__wait">LOADING PREFERENCES</p>
          )}
        </Screen>
        <ReviewPanel id="df-r-complete" title="FOUNDATION COMPLETE (FIXTURE)">
          {completePayload && completeToken ? (
            <DigitalFoundationCompleteSurface
              token={completeToken}
              payload={completePayload}
              reload={async () => completePayload}
            />
          ) : (
            <p className="df-review__wait">LOADING COMPLETE</p>
          )}
        </ReviewPanel>
        <ReviewPanel id="df-r-client-return" title="CLIENT RETURN / REENTRY">
          <p className="df-review__wait df-review__wait--panel">
            LIVE ROUTE — SESSION OR REENTRY FORM (NOT INLINE ON THIS PAGE).
          </p>
          <a
            className="df-review__route-name df-review__route-name--cta df-review__external-cta"
            href={SITE00_ROUTES.digitalFoundationReturn}
            target="_blank"
            rel="noreferrer"
          >
            OPEN {SITE00_ROUTES.digitalFoundationReturn}
          </a>
        </ReviewPanel>
        {gapEntries.map((entry) => (
          <RegistryGapPanel key={entry.reviewId} id={entry.anchorId} title={entry.pageName.toUpperCase()} notes={entry.notes} />
        ))}
        {DEPRECATED_BLDR_ROOMS.map((room) => (
          <LegacyPublicBuilderRedirect key={room} anchorId={`df-r-bldr-${room}`} room={room} />
        ))}
      </div>
    </div>
  );
}
