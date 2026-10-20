/**
 * Digital Foundation micro-product review index (`/foundation/review`).
 * Single preview stage + registry nav — fixture-backed, no live mutations.
 */
import { useEffect, useMemo, useState } from 'react';
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import type { DigitalFoundationCommercialConfig } from '../../../../shared/site00-digital-foundation/types.js';
import type { ClientCatalogEntry } from '../../foundation-client/api';
import type { IntakeDraft } from '../../foundation-client/model';
import type { ReviewBootstrapBundle } from './digitalFoundationReviewBootstrap';
import {
  APPROVED_FOUNDATION_BUILDER_SOURCE,
  DIGITAL_FOUNDATION_REVIEW_REGISTRY_VERSION,
  registryCoverageTotals,
  resolveReviewEntry,
} from './digitalFoundationReviewRegistry';
import { loadReviewBootstrapBundle } from './digitalFoundationReviewBootstrap';
import DigitalFoundationReviewNav from './DigitalFoundationReviewNav';
import { reviewAnchorForView, scrollToReviewAnchor } from './reviewLinks';
import { DigitalFoundationReviewPreviewProvider } from './DigitalFoundationReviewPreviewContext';
import DigitalFoundationReviewPreviewHost from './DigitalFoundationReviewPreviewHost';
import '../../foundation-client/foundationDfStyles';

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

function readAnchorFromLocation(): string {
  if (typeof window === 'undefined') return reviewAnchorForView('P01');
  const id = window.location.hash.replace(/^#/, '');
  return id || reviewAnchorForView('P01');
}

export default function DigitalFoundationReviewPage() {
  const [config, setConfig] = useState<DigitalFoundationCommercialConfig | null>(null);
  const [catalog, setCatalog] = useState<ClientCatalogEntry[] | null>(null);
  const [quotePayload, setQuotePayload] = useState<ClientDigitalFoundationPayload | null>(null);
  const [quoteToken, setQuoteToken] = useState('');
  const [paidToken, setPaidToken] = useState('');
  const [paidPayload, setPaidPayload] = useState<typeof quotePayload>(null);
  const [postIntakePayload, setPostIntakePayload] = useState<typeof quotePayload>(null);
  const [proposalReadyPayload, setProposalReadyPayload] = useState<typeof quotePayload>(null);
  const [paymentFailurePayload, setPaymentFailurePayload] = useState<typeof quotePayload>(null);
  const [completePayload, setCompletePayload] = useState<typeof quotePayload>(null);
  const [completeToken, setCompleteToken] = useState('');
  const [postIntakeFetchedAt] = useState(() => new Date());
  const [draft, setDraft] = useState<IntakeDraft>(BLANK_DRAFT);
  const [note, setNote] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState('loading');
  const [bootstrap, setBootstrap] = useState<ReviewBootstrapBundle | null>(null);
  const [activeAnchor, setActiveAnchor] = useState(readAnchorFromLocation);

  useEffect(() => {
    const prev = document.title;
    document.title = 'DIGITAL FOUNDATION — REVIEW REGISTRY';
    return () => {
      document.title = prev;
    };
  }, []);

  useEffect(() => {
    const sync = () => setActiveAnchor(readAnchorFromLocation());
    sync();
    window.addEventListener('hashchange', sync);
    window.addEventListener('df-review-nav', sync as EventListener);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('df-review-nav', sync as EventListener);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const bundle = await loadReviewBootstrapBundle();
      if (cancelled) return;
      setBootstrap(bundle);
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

  const previewState = useMemo(
    () => ({
      dataSource,
      catalog,
      config,
      quotePayload,
      quoteToken,
      paidPayload,
      paidToken,
      postIntakePayload,
      proposalReadyPayload,
      paymentFailurePayload,
      completePayload,
      completeToken,
      postIntakeFetchedAt,
      draft,
      setDraft,
      setQuotePayload,
      bootstrap,
    }),
    [
      dataSource,
      catalog,
      config,
      quotePayload,
      quoteToken,
      paidPayload,
      paidToken,
      postIntakePayload,
      proposalReadyPayload,
      paymentFailurePayload,
      completePayload,
      completeToken,
      postIntakeFetchedAt,
      draft,
      bootstrap,
    ],
  );

  const currentEntry = resolveReviewEntry(activeAnchor);

  return (
    <DigitalFoundationReviewPreviewProvider value={previewState}>
      <div className="df-review">
        <DigitalFoundationReviewNav />
        <header className="df-review__intro">
          <ReviewProvenance dataSource={dataSource} />
          <p>
            ONE REVIEW STAGE · REAL COMPONENTS · SIMULATED FIXTURES · SELECT A REGISTRY ENTRY — PUBLIC SITE 00 BUILDER ROUTES
            REMAIN BLOCKED.
          </p>
          {currentEntry && (
            <p className="df-review__current">
              CURRENT · {currentEntry.pageName} · <code>{activeAnchor}</code>
            </p>
          )}
          {note && <p className="df-review__diag">{note}</p>}
        </header>
        <section id="df-review-stage" className="df-review__stage" aria-label="Review preview">
          <DigitalFoundationReviewPreviewHost anchorId={activeAnchor} />
        </section>
        <p className="df-review__stage-hint">
          <button type="button" className="df-review__nav-step-btn" onClick={() => scrollToReviewAnchor(reviewAnchorForView('P03'))}>
            QUICK OPEN · P03 BUILDER
          </button>
        </p>
      </div>
    </DigitalFoundationReviewPreviewProvider>
  );
}
