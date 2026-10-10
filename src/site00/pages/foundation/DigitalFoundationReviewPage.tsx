/**
 * Design review for Digital Foundation P01–P07 and the BLDR studio that follows.
 * One page. No intake flow. Preview and founder review only.
 */
import { useEffect, useState, type ReactNode } from 'react';
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import type { DigitalFoundationCommercialConfig } from '../../../../shared/site00-digital-foundation/types.js';
import { fetchCatalog, fetchPayload, type ClientCatalogEntry } from '../../foundation-client/api';
import { P01Entry, P02Intake, P03Configure } from '../../foundation-client/parents/EntryIntake';
import { P04Recommendation } from '../../foundation-client/parents/Recommendation';
import { InterimOverview, P05Review, P06Activation } from '../../foundation-client/parents/CheckoutActivation';
import { DfFrame, DfMenu, type DfObjectKind } from '../../foundation-client/shell';
import { DF_VIEW_META, DF_VIEW_ORDER, type DfView, type IntakeDraft } from '../../foundation-client/model';
import '../../styles/site00-df-client.css';

const OBJECT_FOR: Record<DfView, DfObjectKind> = {
  P01: 'hero',
  P02: 'corner',
  P03: 'corner',
  P04: 'crown',
  P05: 'crown',
  P06: 'crown',
  OVERVIEW: 'crown',
};

const BLDR_ROOMS = [
  { id: 'PLACE', label: 'BLDR · PLACE' },
  { id: 'FEEL', label: 'BLDR · FEEL' },
  { id: 'WORK', label: 'BLDR · WORK' },
  { id: 'PACE', label: 'BLDR · PACE' },
  { id: 'BLUEPRINT', label: 'BLDR · BLUEPRINT' },
] as const;

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
      <p className="df-review__label">{title}</p>
      <div className={`df-root${menuOpen ? ' df-root--menu-open' : ''}`}>
        <DfFrame view={view} object={OBJECT_FOR[view]} onMenu={() => setMenuOpen((o) => !o)} menuOpen={menuOpen}>
          {children}
        </DfFrame>
        <DfMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          views={DF_VIEW_ORDER}
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
  const [paidPayload, setPaidPayload] = useState<ClientDigitalFoundationPayload | null>(null);
  const [draft, setDraft] = useState<IntakeDraft>(BLANK_DRAFT);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    const prev = document.title;
    document.title = 'DIGITAL FOUNDATION + BLDR — REVIEW';
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
        if (cancelled) return;
        setQuoteToken(quote.token);
        setQuotePayload(quote.payload);
        setPaidPayload(paid.payload);
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

  return (
    <div className="df-review">
      <nav className="df-review__nav" aria-label="REVIEW SCREENS">
        {DF_VIEW_ORDER.map((view) => (
          <a key={view} href={`#df-r-${view}`}>
            {DF_VIEW_META[view].index} {DF_VIEW_META[view].label}
          </a>
        ))}
        {BLDR_ROOMS.map((room) => (
          <a key={room.id} href={`#df-r-bldr-${room.id}`}>
            {room.label}
          </a>
        ))}
      </nav>
      <header className="df-review__intro">
        <p>DIGITAL FOUNDATION AND THE BLDR STUDIO THAT FOLLOWS. EVERY SCREEN IS ON THIS PAGE.</p>
        {note && <p>{note}</p>}
      </header>
      <div className="df-review__strip">
        <Screen id="df-r-P01" view="P01" title="01 · GET STARTED">
          <P01Entry config={config} onBegin={noop} busy={false} error={null} />
        </Screen>
        <Screen id="df-r-P02" view="P02" title="02 · BUSINESS INFORMATION">
          <P02Intake draft={draft} update={update} editable save={null} onContinue={noop} />
        </Screen>
        <Screen id="df-r-P03" view="P03" title="03 · BUILD YOUR FOUNDATION">
          <P03Configure
            draft={draft}
            update={update}
            editable
            onSubmit={noop}
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
              onContinue={noop}
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
              onEditAddons={noop}
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
              onOverview={noop}
              onRetry={noop}
            />
          ) : (
            <p className="df-review__wait">LOADING ACTIVATION</p>
          )}
        </Screen>
        <Screen id="df-r-OVERVIEW" view="OVERVIEW" title="07 · PROJECT OVERVIEW">
          {paidPayload ? (
            <InterimOverview payload={paidPayload} onActivation={noop} />
          ) : (
            <p className="df-review__wait">LOADING OVERVIEW</p>
          )}
        </Screen>
        {BLDR_ROOMS.map((room) => (
          <article className="df-review__item" id={`df-r-bldr-${room.id}`} key={room.id}>
            <p className="df-review__label">{room.label}</p>
            <iframe
              className="df-review__studio"
              title={room.label}
              src={`/bldr/studio?reviewRoom=${room.id}`}
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
