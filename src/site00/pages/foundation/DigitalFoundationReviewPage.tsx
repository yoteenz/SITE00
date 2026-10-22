/**
 * Digital Foundation micro-product review index (`/foundation/review`).
 * Zone pills + continuous vertical gallery per zone (only one zone’s sections mount at a time).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import type { DigitalFoundationCommercialConfig } from '../../../../shared/site00-digital-foundation/types.js';
import type { ClientCatalogEntry } from '../../foundation-client/api';
import type { IntakeDraft } from '../../foundation-client/model';
import type { ReviewBootstrapBundle } from './digitalFoundationReviewBootstrap';
import {
  APPROVED_FOUNDATION_BUILDER_SOURCE,
  DIGITAL_FOUNDATION_REVIEW_REGISTRY_VERSION,
  resolveReviewEntry,
} from './digitalFoundationReviewRegistry';
import { galleryCoverageTotals, galleryEntriesFilteredByZone } from './digitalFoundationReviewGallery';
import { loadReviewBootstrapBundle } from './digitalFoundationReviewBootstrap';
import DigitalFoundationReviewNav from './DigitalFoundationReviewNav';
import DigitalFoundationReviewGallery from './DigitalFoundationReviewGallery';
import DigitalFoundationReviewZonePills from './DigitalFoundationReviewZonePills';
import {
  defaultAnchorForZone,
  zoneForAnchorId,
  type DfReviewZoneId,
} from './digitalFoundationReviewZones';
import { navigateToReviewAnchor } from './reviewLinks';
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
      REGISTERED {totals.registered} · BUILDER {APPROVED_FOUNDATION_BUILDER_SOURCE}
    </p>
  );
}

function applyAnchorSelection(
  anchorId: string,
  setZone: (z: DfReviewZoneId) => void,
  setActiveAnchor: (a: string) => void,
) {
  const zone = zoneForAnchorId(anchorId);
  if (zone) setZone(zone);
  setActiveAnchor(anchorId);
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
  const [zone, setZone] = useState<DfReviewZoneId>('INTAKE');
  const [activeAnchor, setActiveAnchor] = useState(() => defaultAnchorForZone('INTAKE'));

  useEffect(() => {
    const prev = document.title;
    document.title = 'DIGITAL FOUNDATION — DESIGN REVIEW';
    return () => {
      document.title = prev;
    };
  }, []);

  const zoneEntries = useMemo(() => galleryEntriesFilteredByZone(zone), [zone]);

  useEffect(() => {
    if (!zoneEntries.length) return;
    if (!zoneEntries.some((e) => e.anchorId === activeAnchor)) {
      const next = zoneEntries[0]!.anchorId;
      setActiveAnchor(next);
      navigateToReviewAnchor(next);
    }
  }, [zone, zoneEntries, activeAnchor]);

  useEffect(() => {
    const syncFromHash = () => {
      const id = window.location.hash.replace(/^#/, '');
      if (id) applyAnchorSelection(id, setZone, setActiveAnchor);
    };
    const onNav = (ev: Event) => {
      const id = (ev as CustomEvent<{ anchorId?: string }>).detail?.anchorId;
      if (id) applyAnchorSelection(id, setZone, setActiveAnchor);
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('df-review-nav', onNav as EventListener);
    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('df-review-nav', onNav as EventListener);
    };
  }, []);

  const onZoneChange = useCallback((next: DfReviewZoneId) => {
    setZone(next);
    const anchor = defaultAnchorForZone(next);
    if (anchor) {
      setActiveAnchor(anchor);
      navigateToReviewAnchor(anchor);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const focusEntry = activeAnchor ? resolveReviewEntry(activeAnchor) : undefined;

  return (
    <DigitalFoundationReviewPreviewProvider value={previewState}>
      <div className="df-review">
        <div className="df-review__top">
          <DigitalFoundationReviewZonePills zone={zone} onZoneChange={onZoneChange} />
          <DigitalFoundationReviewNav zoneFilter={zone} activeAnchor={activeAnchor} onPickAnchor={setActiveAnchor} />
        </div>
        <header className="df-review__intro">
          <p className="df-review__kicker">DESIGN REVIEW · CONTINUOUS GALLERY</p>
          <ReviewProvenance dataSource={dataSource} />
          <p>
            PICK A ZONE AT THE TOP — ALL SCREENS IN THAT ZONE SCROLL ON ONE PAGE. OTHER ZONES STAY UNMOUNTED. USE THE
            REGISTRY TO JUMP WITHIN THE ACTIVE ZONE.
          </p>
          {focusEntry && (
            <p className="df-review__current">
              REGISTRY FOCUS · {focusEntry.pageName} · <code>{activeAnchor}</code>
            </p>
          )}
          {note && <p className="df-review__diag">{note}</p>}
        </header>
        <DigitalFoundationReviewGallery zoneFilter={zone} />
      </div>
    </DigitalFoundationReviewPreviewProvider>
  );
}
