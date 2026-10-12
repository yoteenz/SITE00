/**
 * Design review for Digital Foundation intake, client portal, completion, and BLDR studio.
 * One page. Preview and founder review only — no live client session.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { buildClientRecords } from '../../../../shared/site00-digital-foundation/clientRecords.js';
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import type { ProjectStageCode } from '../../../../shared/site00-digital-foundation/types.js';
import type { DigitalFoundationCommercialConfig } from '../../../../shared/site00-digital-foundation/types.js';
import { SITE00_ROUTES } from '../../config/routes';
import { fetchCatalog, fetchPayload, type ClientCatalogEntry } from '../../foundation-client/api';
import { P01Entry, P02Intake, P03Configure } from '../../foundation-client/parents/EntryIntake';
import { P04Recommendation } from '../../foundation-client/parents/Recommendation';
import { P05Review, P06Activation } from '../../foundation-client/parents/CheckoutActivation';
import {
  CommunicationPreferences,
  P07ProjectOverview,
  P08Roadmap,
  P09StageDetail,
  P10NeedsYou,
  RecordDetail,
  RecordsLibrary,
} from '../../foundation-client/parents/ProjectPortal';
import { DfFrame, DfMenu, type DfObjectKind } from '../../foundation-client/shell';
import { type DfView, type IntakeDraft } from '../../foundation-client/model';
import { studioPathForReviewRoom } from '../../builder-studio/studioReviewSample';
import DigitalFoundationCompleteSurface from './DigitalFoundationCompleteSurface';
import {
  BLDR_REVIEW_ROOMS,
  COMMERCE_VIEWS,
  INTAKE_VIEWS,
  PORTAL_VIEWS,
  REVIEW_ANCHOR_COMPLETE,
  REVIEW_ANCHOR_DIGITAL_LOCATION,
  REVIEW_FIXTURE_IDS,
  REVIEW_GALLERY_FAMILIES,
  reviewAnchorForBldrRoom,
  reviewScreenTitle,
} from './reviewGalleryRegistry';
import { reviewAnchorForView, reviewScreenUrl, scrollToReviewAnchor } from './reviewLinks';
import '../../styles/site00-df-client.css';
import '../../styles/site00-df-components.css';
import '../../styles/site00-digital-foundation.css';

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

const PORTAL_MENU_VIEWS: DfView[] = ['P06', ...PORTAL_VIEWS];

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

const FOUNDER_OPS_LINKS = [
  { label: 'Foundation pipeline', href: SITE00_ROUTES.digitalFoundationPipeline },
  { label: 'Foundation admin', href: SITE00_ROUTES.digitalFoundationAdmin },
  { label: 'Communications command', href: SITE00_ROUTES.digitalFoundationCommunications },
] as const;

function DirectLink({ anchorId }: { anchorId: string }) {
  const href = reviewScreenUrl(anchorId);
  return (
    <a className="df-review__direct" href={href}>
      {href}
    </a>
  );
}

function Screen({
  id,
  view,
  title,
  menuViews,
  children,
}: {
  id: string;
  view: DfView;
  title: string;
  menuViews?: DfView[];
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const views = menuViews ?? INTAKE_VIEWS;
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
          views={views}
          current={view}
          onNavigate={(v, anchor) => {
            setMenuOpen(false);
            scrollToReviewAnchor(reviewAnchorForView(v));
            if (anchor) {
              window.setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
            }
          }}
        />
      </div>
    </article>
  );
}

function pickDefaultStage(payload: ClientDigitalFoundationPayload): ProjectStageCode {
  const stages = payload.stages;
  if (!stages.length) return '01_DETAILS_RECEIVED';
  const active = stages.find((s) => s.status === 'IN_PROGRESS' || s.status === 'NEEDS_CLIENT');
  return (active ?? stages[0]!).stage_code;
}

export default function DigitalFoundationReviewPage() {
  const [config, setConfig] = useState<DigitalFoundationCommercialConfig | null>(null);
  const [catalog, setCatalog] = useState<ClientCatalogEntry[] | null>(null);
  const [quotePayload, setQuotePayload] = useState<ClientDigitalFoundationPayload | null>(null);
  const [quoteToken, setQuoteToken] = useState('');
  const [portalPayload, setPortalPayload] = useState<ClientDigitalFoundationPayload | null>(null);
  const [completePayload, setCompletePayload] = useState<ClientDigitalFoundationPayload | null>(null);
  const [completeToken, setCompleteToken] = useState('');
  const [draft, setDraft] = useState<IntakeDraft>(BLANK_DRAFT);
  const [stageCode, setStageCode] = useState<ProjectStageCode>('01_DETAILS_RECEIVED');
  const [recordId, setRecordId] = useState('');
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    const prev = document.title;
    document.title = 'DIGITAL FOUNDATION + BLDR — REVIEW';
    return () => {
      document.title = prev;
    };
  }, []);

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '';
    if (!hash) return;
    window.requestAnimationFrame(() => scrollToReviewAnchor(hash));
  }, [portalPayload, completePayload, quotePayload]);

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
        const quote = await mint(REVIEW_FIXTURE_IDS.quote);
        const portal = await mint(REVIEW_FIXTURE_IDS.portalPaid);
        const complete = await mint(REVIEW_FIXTURE_IDS.completeCredit);
        if (cancelled) return;
        setQuoteToken(quote.token);
        setQuotePayload(quote.payload);
        setPortalPayload(portal.payload);
        setCompletePayload(complete.payload);
        setCompleteToken(complete.token);
        setStageCode(pickDefaultStage(portal.payload));
        const recs = buildClientRecords(portal.payload);
        setRecordId(recs[0]?.id ?? '');
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
  const advanceBldr = (room: (typeof BLDR_REVIEW_ROOMS)[number]['id']) =>
    scrollToReviewAnchor(reviewAnchorForBldrRoom(room));

  const commPrefs = useMemo(
    () =>
      portalPayload?.communication_preferences ?? {
        marketing_opt_in: false,
        project_operations: true,
        educational: false,
      },
    [portalPayload],
  );

  return (
    <div className="df-review">
      <nav className="df-review__nav" aria-label="REVIEW SCREENS BY FAMILY">
        {REVIEW_GALLERY_FAMILIES.map((family) => (
          <section key={family.id} className="df-review__family">
            <h2 className="df-review__family-label">{family.label}</h2>
            {family.id === 'INTAKE' &&
              INTAKE_VIEWS.map((view) => (
                <div className="df-review__route" key={view}>
                  <a className="df-review__route-name" href={`#${reviewAnchorForView(view)}`}>
                    {reviewScreenTitle(view)}
                  </a>
                  <DirectLink anchorId={reviewAnchorForView(view)} />
                </div>
              ))}
            {family.id === 'COMMERCE' &&
              COMMERCE_VIEWS.map((view) => (
                <div className="df-review__route" key={view}>
                  <a className="df-review__route-name" href={`#${reviewAnchorForView(view)}`}>
                    {reviewScreenTitle(view)}
                  </a>
                  <DirectLink anchorId={reviewAnchorForView(view)} />
                </div>
              ))}
            {family.id === 'PORTAL' &&
              PORTAL_VIEWS.map((view) => (
                <div className="df-review__route" key={view}>
                  <a className="df-review__route-name" href={`#${reviewAnchorForView(view)}`}>
                    {reviewScreenTitle(view)}
                  </a>
                  <DirectLink anchorId={reviewAnchorForView(view)} />
                </div>
              ))}
            {family.id === 'RECORDS' && (
              <>
                <div className="df-review__route">
                  <a className="df-review__route-name" href={`#${reviewAnchorForView('RECORDS')}`}>
                    {reviewScreenTitle('RECORDS')}
                  </a>
                  <DirectLink anchorId={reviewAnchorForView('RECORDS')} />
                </div>
                <div className="df-review__route">
                  <a className="df-review__route-name" href={`#${reviewAnchorForView('RECORD')}`}>
                    {reviewScreenTitle('RECORD')}
                  </a>
                  <DirectLink anchorId={reviewAnchorForView('RECORD')} />
                </div>
              </>
            )}
            {family.id === 'COMPLETION' && (
              <>
                <div className="df-review__route">
                  <a className="df-review__route-name" href={`#${REVIEW_ANCHOR_COMPLETE}`}>
                    FOUNDATION COMPLETE
                  </a>
                  <DirectLink anchorId={REVIEW_ANCHOR_COMPLETE} />
                </div>
                <div className="df-review__route">
                  <a className="df-review__route-name" href={`#${REVIEW_ANCHOR_DIGITAL_LOCATION}`}>
                    DIGITAL LOCATION OPPORTUNITY
                  </a>
                  <DirectLink anchorId={REVIEW_ANCHOR_DIGITAL_LOCATION} />
                </div>
              </>
            )}
            {family.id === 'FOUNDER_OPS' &&
              FOUNDER_OPS_LINKS.map((link) => (
                <div className="df-review__route" key={link.href}>
                  <a className="df-review__route-name" href={link.href} rel="noopener noreferrer">
                    {link.label} (sign in required)
                  </a>
                </div>
              ))}
            {family.id === 'BLDR' &&
              BLDR_REVIEW_ROOMS.map((room) => (
                <div className="df-review__route" key={room.id}>
                  <a className="df-review__route-name" href={`#${reviewAnchorForBldrRoom(room.id)}`}>
                    {room.label}
                  </a>
                  <DirectLink anchorId={reviewAnchorForBldrRoom(room.id)} />
                </div>
              ))}
          </section>
        ))}
      </nav>
      <header className="df-review__intro">
        <p>DIGITAL FOUNDATION CLIENT JOURNEY + BLDR STUDIO. DEMONSTRATION FIXTURES ONLY.</p>
        <p className="df-review__fixtures">
          FIXTURES: {REVIEW_FIXTURE_IDS.quote} (quote) · {REVIEW_FIXTURE_IDS.portalPaid} (portal) ·{' '}
          {REVIEW_FIXTURE_IDS.completeCredit} (complete + credit)
        </p>
        {note && <p>{note}</p>}
      </header>
      <div className="df-review__strip">
        <Screen id={reviewAnchorForView('P01')} view="P01" title={reviewScreenTitle('P01')}>
          <P01Entry config={config} onBegin={() => advance('P02')} busy={false} error={null} />
        </Screen>
        <Screen id={reviewAnchorForView('P02')} view="P02" title={reviewScreenTitle('P02')}>
          <P02Intake draft={draft} update={update} editable save={null} onContinue={() => advance('P03')} />
        </Screen>
        <Screen id={reviewAnchorForView('P03')} view="P03" title={reviewScreenTitle('P03')}>
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
        <Screen id={reviewAnchorForView('P04')} view="P04" title={reviewScreenTitle('P04')}>
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
        <Screen id={reviewAnchorForView('P05')} view="P05" title={reviewScreenTitle('P05')}>
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
        <Screen id={reviewAnchorForView('P06')} view="P06" title={reviewScreenTitle('P06')}>
          {portalPayload ? (
            <P06Activation
              payload={portalPayload}
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
        <Screen
          id={reviewAnchorForView('OVERVIEW')}
          view="OVERVIEW"
          title={reviewScreenTitle('OVERVIEW')}
          menuViews={PORTAL_MENU_VIEWS}
        >
          {portalPayload ? (
            <P07ProjectOverview
              payload={portalPayload}
              verify={null}
              onRoadmap={() => advance('ROADMAP')}
              onNeedsYou={() => advance('NEEDS_YOU')}
              onRecords={() => advance('RECORDS')}
              onStage={(code) => {
                setStageCode(code);
                advance('STAGE');
              }}
              onActivation={() => advance('P06')}
              onPrefs={() => advance('COMM_PREFS')}
            />
          ) : (
            <p className="df-review__wait">LOADING PROJECT OVERVIEW</p>
          )}
        </Screen>
        <Screen id={reviewAnchorForView('ROADMAP')} view="ROADMAP" title={reviewScreenTitle('ROADMAP')} menuViews={PORTAL_MENU_VIEWS}>
          {portalPayload ? (
            <P08Roadmap
              payload={portalPayload}
              onStage={(code) => {
                setStageCode(code);
                advance('STAGE');
              }}
              onOverview={() => advance('OVERVIEW')}
            />
          ) : (
            <p className="df-review__wait">LOADING ROADMAP</p>
          )}
        </Screen>
        <Screen id={reviewAnchorForView('STAGE')} view="STAGE" title={reviewScreenTitle('STAGE')} menuViews={PORTAL_MENU_VIEWS}>
          {portalPayload ? (
            <P09StageDetail payload={portalPayload} stageCode={stageCode} onRoadmap={() => advance('ROADMAP')} />
          ) : (
            <p className="df-review__wait">LOADING STAGE DETAIL</p>
          )}
        </Screen>
        <Screen id={reviewAnchorForView('NEEDS_YOU')} view="NEEDS_YOU" title={reviewScreenTitle('NEEDS_YOU')} menuViews={PORTAL_MENU_VIEWS}>
          {portalPayload ? (
            <P10NeedsYou
              token=""
              payload={portalPayload}
              reviewMode
              onReload={async () => portalPayload}
              onOverview={() => advance('OVERVIEW')}
            />
          ) : (
            <p className="df-review__wait">LOADING NEEDS YOU</p>
          )}
        </Screen>
        <Screen id={reviewAnchorForView('RECORDS')} view="RECORDS" title={reviewScreenTitle('RECORDS')} menuViews={PORTAL_MENU_VIEWS}>
          {portalPayload ? (
            <RecordsLibrary
              payload={portalPayload}
              onOpen={(id) => {
                setRecordId(id);
                advance('RECORD');
              }}
              onOverview={() => advance('OVERVIEW')}
            />
          ) : (
            <p className="df-review__wait">LOADING RECORDS</p>
          )}
        </Screen>
        <Screen id={reviewAnchorForView('RECORD')} view="RECORD" title={reviewScreenTitle('RECORD')} menuViews={PORTAL_MENU_VIEWS}>
          {portalPayload ? (
            <RecordDetail
              payload={portalPayload}
              recordId={recordId || buildClientRecords(portalPayload)[0]?.id || ''}
              onBack={() => advance('RECORDS')}
            />
          ) : (
            <p className="df-review__wait">LOADING RECORD DETAIL</p>
          )}
        </Screen>
        <Screen
          id={reviewAnchorForView('COMM_PREFS')}
          view="COMM_PREFS"
          title={reviewScreenTitle('COMM_PREFS')}
          menuViews={PORTAL_MENU_VIEWS}
        >
          <CommunicationPreferences
            prefs={commPrefs}
            busy={false}
            reviewMode
            onSave={noop}
            onOverview={() => advance('OVERVIEW')}
          />
        </Screen>
        <article className="df-review__item" id={REVIEW_ANCHOR_COMPLETE}>
          <div className="df-review__mark">
            <p className="df-review__label">FOUNDATION COMPLETE</p>
            <DirectLink anchorId={REVIEW_ANCHOR_COMPLETE} />
          </div>
          {completePayload ? (
            <DigitalFoundationCompleteSurface
              token={completeToken}
              payload={completePayload}
              reload={async () => completePayload}
              reviewMode
              focus="full"
            />
          ) : (
            <p className="df-review__wait">LOADING COMPLETION DEMO</p>
          )}
        </article>
        <article className="df-review__item" id={REVIEW_ANCHOR_DIGITAL_LOCATION}>
          <div className="df-review__mark">
            <p className="df-review__label">DIGITAL LOCATION OPPORTUNITY</p>
            <DirectLink anchorId={REVIEW_ANCHOR_DIGITAL_LOCATION} />
          </div>
          {completePayload ? (
            <>
              <DigitalFoundationCompleteSurface
                token={completeToken}
                payload={completePayload}
                reload={async () => completePayload}
                reviewMode
                focus="digital_location"
              />
              <p className="df-review__bldr-bridge">
                <button type="button" className="df-review__bldr-link" onClick={() => advanceBldr('PLACE')}>
                  OPEN BLDR STUDIO · PLACE (REVIEW)
                </button>
              </p>
            </>
          ) : (
            <p className="df-review__wait">LOADING DIGITAL LOCATION DEMO</p>
          )}
        </article>
        {BLDR_REVIEW_ROOMS.map((room) => (
          <article className="df-review__item" id={reviewAnchorForBldrRoom(room.id)} key={room.id}>
            <div className="df-review__mark">
              <p className="df-review__label">{room.label}</p>
              <DirectLink anchorId={reviewAnchorForBldrRoom(room.id)} />
            </div>
            <iframe
              className="df-review__studio"
              title={room.label}
              src={`/bldr/studio/${studioPathForReviewRoom(room.id)}?reviewRoom=${room.id}`}
            />
          </article>
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
