/**
 * Digital Foundation micro-product review index (`/foundation/review`).
 * Continuous vertical gallery of real screens; registry is navigation-only.
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
  type DfReviewGroupId,
  resolveReviewEntry,
} from './digitalFoundationReviewRegistry';
import { galleryCoverageTotals } from './digitalFoundationReviewGallery';
import { loadReviewBootstrapBundle } from './digitalFoundationReviewBootstrap';
import DigitalFoundationReviewNav from './DigitalFoundationReviewNav';
import DigitalFoundationReviewGallery from './DigitalFoundationReviewGallery';
import { scrollToReviewAnchor } from './reviewLinks';
import { DigitalFoundationReviewPreviewProvider } from './DigitalFoundationReviewPreviewContext';
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
  const totals = galleryCoverageTotals();
  return (
    <p className="df-review__provenance">
      IDNTY DIGITAL FOUNDATION · REGISTRY {DIGITAL_FOUNDATION_REVIEW_REGISTRY_VERSION} · BUILD {buildId} · DATA {dataSource} ·
      GALLERY {totals.gallerySections} · RENDERED+SIM {totals.rendered + totals.simulated} · BUILDER {APPROVED_FOUNDATION_BUILDER_SOURCE}
    </p>
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
  const [bootstrap, setBootstrap] = useState<ReviewBootstrapBundle | null>(null);
  const [groupFilter, setGroupFilter] = useState<DfReviewGroupId | 'ALL'>('ALL');
  const [focusAnchor, setFocusAnchor] = useState('');

  useEffect(() => {
    const prev = document.title;
    document.title = 'DIGITAL FOUNDATION — DESIGN REVIEW';
    return () => {
      document.title = prev;
    };
  }, []);

  useEffect(() => {
    const sync = () => {
      const id = window.location.hash.replace(/^#/, '');
      setFocusAnchor(id);
      if (id) scrollToReviewAnchor(id);
    };
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

  const focusEntry = focusAnchor ? resolveReviewEntry(focusAnchor) : undefined;

  return (
    <DigitalFoundationReviewPreviewProvider value={previewState}>
      <div className="df-review">
        <DigitalFoundationReviewNav groupFilter={groupFilter} setGroupFilter={setGroupFilter} />
        <header className="df-review__intro">
          <p className="df-review__kicker">DESIGN REVIEW · CONTINUOUS GALLERY</p>
          <ReviewProvenance dataSource={dataSource} />
          <p>SCROLL THROUGH EVERY IMPLEMENTED SCREEN. THE REGISTRY JUMPS TO A SECTION — IT DOES NOT REPLACE THE GALLERY.</p>
          {focusEntry && (
            <p className="df-review__current">
              FOCUS · {focusEntry.pageName} · <code>{focusAnchor}</code>
            </p>
          )}
          {note && <p className="df-review__diag">{note}</p>}
          <button type="button" className="df-review__nav-step-btn df-review__back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            BACK TO TOP
          </button>
        </header>
        <DigitalFoundationReviewGallery groupFilter={groupFilter} />
      </div>
    </DigitalFoundationReviewPreviewProvider>
  );
}
