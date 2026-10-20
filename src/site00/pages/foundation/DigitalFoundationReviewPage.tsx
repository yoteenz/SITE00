/**
 * Digital Foundation micro-product review index (`/foundation/review`).
 * Fixture-backed previews only — not live client/founder auth surfaces.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import type { DigitalFoundationCommercialConfig } from '../../../../shared/site00-digital-foundation/types.js';
import { fetchCatalog, fetchPayload, type ClientCatalogEntry } from '../../foundation-client/api';
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
  DIGITAL_FOUNDATION_REVIEW_GROUP_LABELS,
  DIGITAL_FOUNDATION_REVIEW_REGISTRY_VERSION,
  type DfReviewGroupId,
  reviewEntriesByGroup,
  reviewEntriesForIndex,
} from './digitalFoundationReviewRegistry';
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

const REVIEW_GROUP_ORDER: DfReviewGroupId[] = [
  'INTAKE',
  'FOUNDATION_BUILDER',
  'POST_INTAKE',
  'PROPOSAL_CHECKOUT',
  'CLIENT_PORTAL',
  'CLIENT_ACCESS',
  'DEPRECATED',
];

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

function ReviewProvenance() {
  const buildId =
    typeof document !== 'undefined'
      ? document.querySelector('meta[name="app-build-id"]')?.getAttribute('content') ?? '—'
      : '—';
  return (
    <p className="df-review__provenance">
      IDNTY DIGITAL FOUNDATION · REVIEW REGISTRY {DIGITAL_FOUNDATION_REVIEW_REGISTRY_VERSION} · BUILD {buildId} · BUILDER{' '}
      {APPROVED_FOUNDATION_BUILDER_SOURCE}
    </p>
  );
}

/** Founder/dev review only — collapsible grouped index (no raw URLs in the nav list). */
function ReviewNav() {
  const grouped = useMemo(() => reviewEntriesByGroup(), []);
  const routeCount = reviewEntriesForIndex().length;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const collapse = () => setOpen(false);
    window.addEventListener('hashchange', collapse);
    return () => window.removeEventListener('hashchange', collapse);
  }, []);

  return (
    <div className={`df-review__nav-shell${open ? ' df-review__nav-shell--open' : ''}`}>
      <div className="df-review__nav-bar">
        <p className="df-review__nav-kicker">DIGITAL FOUNDATION REVIEW</p>
        <button
          type="button"
          className="df-review__nav-toggle"
          aria-expanded={open}
          aria-controls="df-review-nav-routes"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'HIDE INDEX' : `SHOW INDEX (${routeCount})`}
        </button>
      </div>
      <nav id="df-review-nav-routes" className="df-review__nav" aria-label="REVIEW SCREENS">
        {REVIEW_GROUP_ORDER.map((groupId) => {
          const entries = grouped.get(groupId);
          if (!entries?.length) return null;
          return (
            <div className="df-review__nav-group" key={groupId}>
              <p className="df-review__nav-group-label">{DIGITAL_FOUNDATION_REVIEW_GROUP_LABELS[groupId]}</p>
              <ul className="df-review__nav-list">
                {entries.map((entry) => (
                  <li key={entry.reviewId}>
                    <a
                      className={`df-review__route-name${entry.renderMode === 'legacy_redirect' ? ' df-review__route-name--deprecated' : ''}`}
                      href={`#${entry.anchorId}`}
                    >
                      {entry.pageName}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        <div className="df-review__nav-group">
          <p className="df-review__nav-group-label">{DIGITAL_FOUNDATION_REVIEW_GROUP_LABELS.FOUNDER_WORKSPACE}</p>
          <ul className="df-review__nav-list">
            <li>
              <a className="df-review__route-name df-review__route-name--external" href={SITE00_ROUTES.digitalFoundationFounderWorkspaceOverview} target="_blank" rel="noreferrer">
                Founder overview (live · auth)
              </a>
            </li>
            <li>
              <a
                className="df-review__route-name df-review__route-name--external"
                href={`${SITE00_ROUTES.digitalFoundationFounderWorkspace}/foundations`}
                target="_blank"
                rel="noreferrer"
              >
                Foundations registry (live · auth)
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
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
  const [completePayload, setCompletePayload] = useState<ClientDigitalFoundationPayload | null>(null);
  const [completeToken, setCompleteToken] = useState('');
  const [postIntakeFetchedAt] = useState(() => new Date());
  const [draft, setDraft] = useState<IntakeDraft>(BLANK_DRAFT);
  const [note, setNote] = useState<string | null>(null);

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
      try {
        const cat = await fetchCatalog();
        if (!cancelled) {
          setCatalog(cat.catalog);
          setConfig(cat.config);
        }
      } catch {
        if (!cancelled) setNote('CATALOG DID NOT LOAD. ENTRY SCREENS STILL SHOW.');
      }
      try {
        const quote = await mint('A_BASE');
        const paid = await mint('J_PAYMENT_SUCCESS');
        const postIntake = await mint('A_BASE');
        const complete = await mint('M_COMPLETE_CREDIT');
        if (cancelled) return;
        setQuoteToken(quote.token);
        setQuotePayload(quote.payload);
        setPaidToken(paid.token);
        setPaidPayload(paid.payload);
        setPostIntakePayload(postIntake.payload);
        setCompleteToken(complete.token);
        setCompletePayload(complete.payload);
      } catch {
        if (!cancelled) setNote('LATER SCREENS NEED THE PREVIEW SERVER. P01–P03 ARE STILL ON THIS PAGE.');
      }
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
      <ReviewNav />
      <header className="df-review__intro">
        <ReviewProvenance />
        <p>FIXTURE-BACKED IDNTY DIGITAL FOUNDATION SCREENS ON ONE PAGE. PUBLIC SITE 00 BUILDER ROUTES ARE BLOCKED.</p>
        {note && <p>{note}</p>}
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
          ) : (
            <p className="df-review__wait">LOADING RECOMMENDATION</p>
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
            <P06Activation
              payload={paidPayload}
              verify={null}
              attempt={0}
              attempts={0}
              simulated={false}
              onOverview={() => advance('OVERVIEW')}
              onRetry={noop}
            />
          ) : (
            <p className="df-review__wait">LOADING ACTIVATION</p>
          )}
        </Screen>
        <Screen id="df-r-post-intake-submitted" view="P03" title="POST-INTAKE · INTAKE RECEIVED">
          {postIntakePayload ? (
            <P03IntakeSubmitted
              payload={postIntakePayload}
              fetchedAt={postIntakeFetchedAt}
              onRefresh={noop}
              busy={false}
            />
          ) : (
            <p className="df-review__wait">LOADING POST-INTAKE</p>
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
        {DEPRECATED_BLDR_ROOMS.map((room) => (
          <LegacyPublicBuilderRedirect key={room} anchorId={`df-r-bldr-${room}`} room={room} />
        ))}
      </div>
    </div>
  );
}

async function mint(fixtureId: string): Promise<{ token: string; payload: ClientDigitalFoundationPayload }> {
  const res = await fetch('/api/dev/site00-digital-foundation-preview-bootstrap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fixture_id: fixtureId }),
  });
  const json = (await res.json()) as { public_token?: string; error?: string };
  if (!res.ok || !json.public_token) throw new Error(json.error ?? 'BOOTSTRAP_FAILED');
  const payload = await fetchPayload(json.public_token);
  return { token: json.public_token, payload };
}
