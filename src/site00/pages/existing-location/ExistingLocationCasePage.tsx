import { FormEvent, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Site00MobileShell } from '../../components/mobile/Site00MobileShell';
import { ExistingLocationTrustPanel } from '../../components/existing-location/ExistingLocationTrustPanel';
import { EXISTING_LOCATION_PLATFORMS } from '../../../../shared/site00-existing-location/platforms';
import type { ExistingLocationCaseRecord, ExistingLocationQuote } from '../../../../shared/site00-existing-location/types';
import { useExistingLocationCase } from '../../hooks/useExistingLocationCase';
import {
  SITE00_ROUTES,
  site00ExistingLocationCaseStepPath,
} from '../../config/routes';

function CaseIntakeStep({
  caseRecord,
  onSaved,
}: {
  caseRecord: ExistingLocationCaseRecord;
  onSaved: (c: ExistingLocationCaseRecord) => void;
}) {
  const { updateIntake, submitIntake, loading, error } = useExistingLocationCase();
  const navigate = useNavigate();
  const [platform, setPlatform] = useState(caseRecord.platform ?? '');
  const [siteUrl, setSiteUrl] = useState(caseRecord.site_url ?? '');
  const [description, setDescription] = useState(caseRecord.client_description);
  const [expected, setExpected] = useState(caseRecord.expected_behavior);
  const [actual, setActual] = useState(caseRecord.actual_behavior);
  const [enhancement, setEnhancement] = useState(caseRecord.enhancement_goal);

  async function save(patch: Record<string, unknown>) {
    const { case: updated } = await updateIntake(caseRecord.id, patch);
    onSaved(updated);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await save({
      platform,
      site_url: siteUrl,
      client_description: description,
      expected_behavior: expected,
      actual_behavior: actual,
      enhancement_goal: enhancement,
    });
    const { case: submitted } = await submitIntake(caseRecord.id);
    onSaved(submitted);
    navigate(site00ExistingLocationCaseStepPath(caseRecord.id, 'access'));
  }

  return (
    <form className="site00-existing-location-form" onSubmit={onSubmit}>
      <h2>WHERE DOES YOUR DIGITAL LOCATION LIVE?</h2>
      <div className="site00-existing-location-form__grid">
        {EXISTING_LOCATION_PLATFORMS.map((p) => (
          <label key={p.id} className="site00-existing-location-form__radio">
            <input type="radio" name="platform" value={p.id} checked={platform === p.id} onChange={() => setPlatform(p.id)} required />
            {p.label}
          </label>
        ))}
      </div>
      <label className="site00-existing-location-form__field">
        SITE URL (OPTIONAL)
        <input value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://…" />
      </label>
      <label className="site00-existing-location-form__field">
        WHAT&apos;S HAPPENING?
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} placeholder="Tell us what you expected and what happens instead." />
      </label>
      <label className="site00-existing-location-form__field">
        EXPECTED BEHAVIOR
        <textarea value={expected} onChange={(e) => setExpected(e.target.value)} rows={2} />
      </label>
      <label className="site00-existing-location-form__field">
        ACTUAL BEHAVIOR
        <textarea value={actual} onChange={(e) => setActual(e.target.value)} rows={2} />
      </label>
      <label className="site00-existing-location-form__field">
        WHAT DO YOU WANT TO ADD? (ENHANCEMENTS / INSTALLS)
        <textarea value={enhancement} onChange={(e) => setEnhancement(e.target.value)} rows={2} />
      </label>
      {error ? <p className="site00-existing-location-page__error">{error}</p> : null}
      <button type="submit" className="site00-existing-location-cta" disabled={loading}>
        SUBMIT FOR REVIEW →
      </button>
    </form>
  );
}

function AccessStep({ caseRecord }: { caseRecord: ExistingLocationCaseRecord }) {
  return (
    <section>
      <h2>ACCESS SETUP</h2>
      <p>REFERENCE: {caseRecord.public_reference}</p>
      <p>SITE 00 IS REVIEWING YOUR REQUEST. FOLLOW THE DELEGATED ACCESS INSTRUCTIONS BELOW — NEVER SHARE YOUR PRIMARY PASSWORD.</p>
      <ul className="site00-existing-location-access-list">
        {caseRecord.access_requirements.map((a) => (
          <li key={a.access_type}>
            <strong>{a.access_type}</strong> — {a.instructions}
          </li>
        ))}
      </ul>
      <Link className="site00-existing-location-cta site00-existing-location-cta--secondary" to={site00ExistingLocationCaseStepPath(caseRecord.id, 'status')}>
        VIEW STATUS →
      </Link>
    </section>
  );
}

function StatusStep({ caseRecord }: { caseRecord: ExistingLocationCaseRecord }) {
  return (
    <section>
      <h2>CASE STATUS</h2>
      <p>STATUS: {caseRecord.status}</p>
      <p>ACCESS: {caseRecord.access_status}</p>
      <p>After SITE 00 completes diagnosis, your findings and quote will appear on the diagnosis and quote steps.</p>
      <nav className="site00-existing-location-subnav">
        <Link to={site00ExistingLocationCaseStepPath(caseRecord.id, 'diagnosis')}>DIAGNOSIS</Link>
        <Link to={site00ExistingLocationCaseStepPath(caseRecord.id, 'quote')}>QUOTE</Link>
        <Link to={site00ExistingLocationCaseStepPath(caseRecord.id, 'checkout')}>CHECKOUT</Link>
      </nav>
    </section>
  );
}

function QuoteStep({
  caseRecord,
  quote,
  onApproved,
}: {
  caseRecord: ExistingLocationCaseRecord;
  quote: ExistingLocationQuote | null;
  onApproved: (c: ExistingLocationCaseRecord) => void;
}) {
  const { approveQuote, loading } = useExistingLocationCase();
  const navigate = useNavigate();
  if (!quote) return <p>QUOTE NOT READY — SITE 00 WILL PUBLISH A QUOTE AFTER DIAGNOSIS.</p>;
  return (
    <section>
      <h2>SCOPE + QUOTE</h2>
      <p>{quote.basis_notes}</p>
      <ul>
        {quote.line_items.map((l) => (
          <li key={l.id}>
            {l.label}: ${(l.amount_cents / 100).toFixed(2)}
          </li>
        ))}
      </ul>
      <p>
        <strong>TOTAL: ${(quote.total_cents / 100).toFixed(2)}</strong>
      </p>
      <button
        type="button"
        className="site00-existing-location-cta"
        disabled={loading || caseRecord.approval_status === 'APPROVED'}
        onClick={async () => {
          const { case: c } = await approveQuote(caseRecord.id);
          onApproved(c);
          navigate(site00ExistingLocationCaseStepPath(caseRecord.id, 'checkout'));
        }}
      >
        APPROVE SCOPE →
      </button>
    </section>
  );
}

function CheckoutStep({
  caseRecord,
  quote,
  onDone,
}: {
  caseRecord: ExistingLocationCaseRecord;
  quote: ExistingLocationQuote | null;
  onDone: (c: ExistingLocationCaseRecord) => void;
}) {
  const { previewCourtesy, completeCheckout, loading, error } = useExistingLocationCase();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [preview, setPreview] = useState<{ discount_cents: number; final_total_cents: number } | null>(null);

  async function onPreview() {
    const res = await previewCourtesy(caseRecord.id, code);
    setPreview({ discount_cents: res.discount_cents, final_total_cents: res.final_total_cents });
  }

  async function onComplete(e: FormEvent) {
    e.preventDefault();
    try {
      const { case: c } = await completeCheckout(caseRecord.id, code || undefined);
      onDone(c);
      navigate(site00ExistingLocationCaseStepPath(caseRecord.id, 'complete'));
    } catch {
      /* error state */
    }
  }

  return (
    <section>
      <h2>CHECKOUT</h2>
      <p className="site00-existing-location-waiting-authority">CHECKOUT VISUAL AUTHORITY: WAITING_FOR_AUTHORITY — FUNCTIONAL AUTHORIZATION ONLY.</p>
      {quote ? (
        <p>
          AMOUNT DUE: ${((preview?.final_total_cents ?? quote.total_cents) / 100).toFixed(2)}
          {preview ? ` (DISCOUNT $${(preview.discount_cents / 100).toFixed(2)})` : null}
        </p>
      ) : null}
      <form onSubmit={onComplete}>
        <label className="site00-existing-location-form__field">
          COURTESY CODE (OPTIONAL)
          <input value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />
        </label>
        <button type="button" className="site00-existing-location-cta site00-existing-location-cta--secondary" onClick={onPreview} disabled={!code.trim() || loading}>
          VALIDATE CODE
        </button>
        <button type="submit" className="site00-existing-location-cta" disabled={loading}>
          COMPLETE AUTHORIZATION →
        </button>
      </form>
      {error ? <p className="site00-existing-location-page__error">{error}</p> : null}
    </section>
  );
}

function CompleteStep({ caseRecord }: { caseRecord: ExistingLocationCaseRecord }) {
  return (
    <section>
      <h2>SERVICE AUTHORIZED</h2>
      <p>REFERENCE: {caseRecord.public_reference}</p>
      <p>STATUS: {caseRecord.status}</p>
      <p>SITE 00 WILL PROCEED WITH THE APPROVED INTERVENTION. YOU WILL RECEIVE UPDATES AS WORK MOVES THROUGH QA AND COMPLETION.</p>
    </section>
  );
}

function resolveCaseStep(pathname: string, caseId: string): string {
  const parts = pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1] ?? '';
  if (last === caseId) return 'intake';
  return last;
}

export default function ExistingLocationCasePage() {
  const { caseId } = useParams<{ caseId: string }>();
  const location = useLocation();
  const step = caseId ? resolveCaseStep(location.pathname, caseId) : 'intake';
  const { fetchCase } = useExistingLocationCase();
  const [caseRecord, setCaseRecord] = useState<ExistingLocationCaseRecord | null>(null);
  const [quote, setQuote] = useState<ExistingLocationQuote | null>(null);

  useEffect(() => {
    if (!caseId) return;
    void fetchCase(caseId).then((p) => {
      setCaseRecord(p.case);
      setQuote(p.quote);
    });
  }, [caseId, fetchCase]);

  if (!caseId) return <Navigate to={SITE00_ROUTES.existingLocation} replace />;
  if (!caseRecord) {
    return (
      <Site00MobileShell showEnvironmentBackground={false}>
        <p className="site00-existing-location-page__loading">LOADING CASE…</p>
      </Site00MobileShell>
    );
  }

  return (
    <Site00MobileShell showEnvironmentBackground={false} shellClassName="site00-existing-location-shell">
      <div className="site00-existing-location-page">
        {step === 'intake' ? <CaseIntakeStep caseRecord={caseRecord} onSaved={setCaseRecord} /> : null}
        {step === 'access' ? <AccessStep caseRecord={caseRecord} /> : null}
        {step === 'status' ? <StatusStep caseRecord={caseRecord} /> : null}
        {step === 'diagnosis' ? (
          <section>
            <h2>DIAGNOSIS</h2>
            <p>{caseRecord.findings.length ? 'FINDINGS AVAILABLE IN FOUNDER REVIEW.' : 'DIAGNOSIS IN PROGRESS.'}</p>
          </section>
        ) : null}
        {step === 'quote' ? <QuoteStep caseRecord={caseRecord} quote={quote} onApproved={setCaseRecord} /> : null}
        {step === 'checkout' ? <CheckoutStep caseRecord={caseRecord} quote={quote} onDone={setCaseRecord} /> : null}
        {step === 'complete' ? <CompleteStep caseRecord={caseRecord} /> : null}
        <ExistingLocationTrustPanel />
      </div>
    </Site00MobileShell>
  );
}
