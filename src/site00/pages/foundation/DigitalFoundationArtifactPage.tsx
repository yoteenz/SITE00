import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { resolveDigitalFoundationArtifactUiStep } from '../../../../shared/site00-digital-foundation/artifactUiStep.js';
import type { IntakeNeedFlag } from '../../../../shared/site00-digital-foundation/types.js';
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import { stageLabel } from '../../../../shared/site00-digital-foundation/projectStages.js';
import '../../styles/site00-digital-foundation.css';

const NEED_OPTIONS: { flag: IntakeNeedFlag; label: string }[] = [
  { flag: 'NEED_DOMAIN', label: 'I need a domain' },
  { flag: 'OWN_DOMAIN', label: 'I already own a domain' },
  { flag: 'LOST_DOMAIN', label: "I own a domain but don't know where it is" },
  { flag: 'NEED_PRO_EMAIL', label: 'I need professional email' },
  { flag: 'NEED_MULTI_MAILBOX', label: 'I need multiple mailboxes' },
  { flag: 'NEED_ALIASES', label: 'I need email aliases' },
  { flag: 'NEED_MIGRATION', label: 'I need old email migrated' },
  { flag: 'NEED_DEVICE', label: 'I need device setup' },
  { flag: 'NEED_SIGNATURE', label: 'I need an email signature' },
  { flag: 'NEED_DNS_SECURITY', label: 'I need DNS / email security help' },
  { flag: 'HAVE_WEBSITE', label: 'I have an existing website' },
  { flag: 'EVENTUAL_WEBSITE', label: 'I eventually need a website' },
  { flag: 'NEED_BRANDING', label: 'I need branding' },
  { flag: 'UNSURE', label: "I'm not sure what I need" },
];

const DISCLOSURES = [
  'I HAVE REVIEWED MY DIGITAL FOUNDATION SCOPE.',
  'I UNDERSTAND THAT DOMAIN / EMAIL PROVIDER SUBSCRIPTIONS AND OTHER THIRD-PARTY FEES MAY BE SEPARATE.',
  'I UNDERSTAND THAT THE PROJECTED TURNAROUND BEGINS AFTER REQUIRED INFORMATION, ACCESS AND PAYMENT ARE RECEIVED.',
] as const;

function formatMoney(minor: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(minor / 100);
}

async function apiPost(token: string, action: string, body: Record<string, unknown> = {}) {
  const res = await fetch(`/api/site00/digital-foundation-artifact?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, token }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Request failed');
  return json;
}

async function apiGet(token: string) {
  const res = await fetch(
    `/api/site00/digital-foundation-artifact?action=payload&token=${encodeURIComponent(token)}`,
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Request failed');
  return json as ClientDigitalFoundationPayload;
}

export default function DigitalFoundationArtifactPage() {
  const { token = '' } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const preferIntake = searchParams.get('step') === 'intake';
  const [payload, setPayload] = useState<ClientDigitalFoundationPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<'prospect' | 'intake' | 'quote' | 'portal' | 'complete'>('prospect');
  const [intakeForm, setIntakeForm] = useState({
    business_name: '',
    contact_name: '',
    current_email: '',
    needs: [] as IntakeNeedFlag[],
  });
  const [checkedDisclosures, setCheckedDisclosures] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    let data = await apiGet(token);
    if (
      preferIntake &&
      data.artifact.payment_state !== 'PAID' &&
      data.surface === 'PROSPECT' &&
      data.artifact.intake_state === 'NOT_STARTED'
    ) {
      try {
        await apiPost(token, 'update-intake', {
          intake: {
            business_name: data.artifact.intake.business_name ?? '',
            contact_name: data.artifact.intake.contact_name ?? '',
            current_email: data.artifact.intake.current_email ?? '',
          },
          needs: data.artifact.intake.needs ?? [],
        });
        data = await apiGet(token);
      } catch {
        /* show prospect/intake UI even if start failed */
      }
    }
    setPayload(data);
    const intake = data.artifact.intake;
    setIntakeForm({
      business_name: intake.business_name ?? '',
      contact_name: intake.contact_name ?? '',
      current_email: intake.current_email ?? '',
      needs: intake.needs ?? [],
    });
    setStep(resolveDigitalFoundationArtifactUiStep(data, { preferIntake }));
  }, [token, preferIntake]);

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [load]);

  const allDisclosuresChecked = useMemo(
    () => DISCLOSURES.every((d) => checkedDisclosures[d]),
    [checkedDisclosures],
  );

  const toggleNeed = (flag: IntakeNeedFlag) => {
    setIntakeForm((prev) => ({
      ...prev,
      needs: prev.needs.includes(flag) ? prev.needs.filter((n) => n !== flag) : [...prev.needs, flag],
    }));
  };

  const onBegin = () => setStep('intake');

  const submitIntake = async (markComplete: boolean) => {
    setBusy(true);
    try {
      await apiPost(token, 'update-intake', { intake: intakeForm, needs: intakeForm.needs, markComplete });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const acceptAndCheckout = async () => {
    setBusy(true);
    try {
      await apiPost(token, 'accept-quote', { disclosures: [...DISCLOSURES] });
      const origin = window.location.origin;
      const checkout = await apiPost(token, 'start-checkout', {
        origin,
        success_url: `${origin}/foundation/${token}?checkout=return`,
        cancel_url: `${origin}/foundation/${token}?checkout=cancel`,
      });
      if (checkout.checkout?.checkout_url) {
        window.location.href = checkout.checkout.checkout_url;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <main className="site00-df-artifact">
        <p>Invalid foundation link.</p>
      </main>
    );
  }

  if (error && !payload) {
    return (
      <main className="site00-df-artifact">
        <p className="site00-df-artifact__error">{error}</p>
      </main>
    );
  }

  if (!payload) {
    return (
      <main className="site00-df-artifact">
        <p>Loading…</p>
      </main>
    );
  }

  const quote = payload.quote;
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <main className="site00-df-artifact" data-surface={payload.surface}>
      <header className="site00-df-artifact__header">
        <p className="site00-df-artifact__eyebrow">SITE 00 · IDNTY</p>
        <h1>DIGITAL FOUNDATION</h1>
        <p className="site00-df-artifact__lede">
          Establish the professional infrastructure your business uses to exist online — domain, professional email,
          security, and digital ownership.
        </p>
      </header>

      {step === 'prospect' && payload.surface === 'PROSPECT' && (
        <section className="site00-df-artifact__panel">
          <h2>Domain · Professional email · Security · Ownership</h2>
          <button type="button" className="site00-df-artifact__cta" onClick={onBegin}>
            BEGIN
          </button>
        </section>
      )}

      {step === 'intake' && payload.artifact.payment_state !== 'PAID' && (
        <section className="site00-df-artifact__panel">
          <h2>Intake</h2>
          <label>
            Business name
            <input
              value={intakeForm.business_name}
              onChange={(e) => setIntakeForm((p) => ({ ...p, business_name: e.target.value }))}
            />
          </label>
          <label>
            Contact name
            <input
              value={intakeForm.contact_name}
              onChange={(e) => setIntakeForm((p) => ({ ...p, contact_name: e.target.value }))}
            />
          </label>
          <label>
            Current email
            <input
              type="email"
              value={intakeForm.current_email}
              onChange={(e) => setIntakeForm((p) => ({ ...p, current_email: e.target.value }))}
            />
          </label>
          <fieldset>
            <legend>What do you need?</legend>
            {NEED_OPTIONS.map((o) => (
              <label key={o.flag} className="site00-df-artifact__check">
                <input
                  type="checkbox"
                  checked={intakeForm.needs.includes(o.flag)}
                  onChange={() => toggleNeed(o.flag)}
                />
                {o.label}
              </label>
            ))}
          </fieldset>
          <p className="site00-df-artifact__note">We never collect passwords in this form.</p>
          <button type="button" disabled={busy} onClick={() => submitIntake(false)}>
            Save progress
          </button>
          <button type="button" className="site00-df-artifact__cta" disabled={busy} onClick={() => submitIntake(true)}>
            Continue to recommendation
          </button>
        </section>
      )}

      {(step === 'quote' || payload.surface === 'QUOTE' || payload.surface === 'CHECKOUT') && quote && (
        <section className="site00-df-artifact__panel">
          <h2>{payload.recommendation?.title ?? 'Your quote'}</h2>
          {payload.recommendation && (
            <>
              <h3>Recommended scope</h3>
              <ul>
                {payload.recommendation.site00_handles.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h3>Third-party costs (separate)</h3>
              <ul>
                {payload.recommendation.third_party_costs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}
          <p className="site00-df-artifact__price">
            Projected investment: <strong>{formatMoney(quote.subtotal_minor, quote.currency)}</strong>
          </p>
          <p>
            Turnaround:{' '}
            {payload.timeline_readiness?.production_started_at
              ? quote.timeline_custom_review
                ? 'Custom review'
                : `${quote.projected_min_days}–${quote.projected_max_days} business days`
              : payload.timeline_readiness?.service_window_label ?? 'Estimated after required information, access, approvals, and payment are received.'}{' '}
            after intake, access, and payment.
          </p>
          <ul>
            {quote.selected_addons.map((line) => (
              <li key={`${line.addon_id}-${line.quantity}`}>
                {line.addon_id.replace(/_/g, ' ')} × {line.quantity} — {formatMoney(line.line_total_minor, quote.currency)}
              </li>
            ))}
          </ul>
          <fieldset>
            <legend>Acknowledgments</legend>
            {DISCLOSURES.map((d) => (
              <label key={d} className="site00-df-artifact__check">
                <input
                  type="checkbox"
                  checked={Boolean(checkedDisclosures[d])}
                  onChange={(e) => setCheckedDisclosures((prev) => ({ ...prev, [d]: e.target.checked }))}
                />
                {d}
              </label>
            ))}
          </fieldset>
          <button
            type="button"
            className="site00-df-artifact__cta"
            disabled={busy || !allDisclosuresChecked}
            onClick={acceptAndCheckout}
          >
            START MY FOUNDATION
          </button>
        </section>
      )}

      {(step === 'portal' || payload.surface === 'PORTAL') && payload.artifact.payment_state === 'PAID' && (
        <section className="site00-df-artifact__panel">
          <h2>Your Digital Foundation — project</h2>
          <p>Payment confirmed. This same link is your client portal.</p>
          <h3>Project status</h3>
          <ol className="site00-df-artifact__stages">
            {payload.stages.map((s) => (
              <li key={s.stage_code}>
                {stageLabel(s.stage_code)} — <span>{s.status}</span>
              </li>
            ))}
          </ol>
          {payload.client_actions.length > 0 && (
            <>
              <h3>Needs you</h3>
              {payload.client_actions.map((a) => (
                <article key={a.request_id} className="site00-df-artifact__needs-you">
                  <strong>{a.title}</strong>
                  <p>{a.detail}</p>
                </article>
              ))}
            </>
          )}
        </section>
      )}

      {(step === 'complete' || payload.surface === 'COMPLETE' || payload.surface === 'BUILD_UPSELL') &&
        payload.artifact.completion_state === 'COMPLETE' && (
          <section
            className="site00-df-artifact__panel site00-df-artifact__complete"
            data-reduced-motion={reducedMotion ? '1' : '0'}
          >
            <h2>Your foundation is complete</h2>
            <p>Your domain and professional business communications are now operational.</p>
            {payload.ownership_record && (
              <ul>
                {payload.ownership_record.domain && <li>Domain — active</li>}
                {payload.ownership_record.primary_mailbox && <li>Professional email — active</li>}
                {payload.ownership_record.dns_status && <li>DNS — {payload.ownership_record.dns_status.toLowerCase()}</li>}
                {payload.ownership_record.security_status && (
                  <li>Email security — {payload.ownership_record.security_status.toLowerCase()}</li>
                )}
              </ul>
            )}
            {payload.credit && payload.credit.status === 'AVAILABLE' && (
              <div className="site00-df-artifact__credit">
                <h3>Your foundation credit</h3>
                <p>{formatMoney(payload.credit.amount_minor, payload.credit.currency)}</p>
                <p>
                  Book a qualifying SITE 00 build before {new Date(payload.credit.expires_at).toLocaleDateString()} and
                  this credit applies to your build.
                </p>
              </div>
            )}
            <h3>Your digital location</h3>
            <p>The foundation is operational. The next optional step is what should live at your domain.</p>
            {payload.build_readiness?.site_needed && (
              <p>Recommendation: {payload.artifact.build_recommendation.replace(/_/g, ' ')}</p>
            )}
            <div className="site00-df-artifact__concept">
              <p className="site00-df-artifact__concept-label">CONCEPT PREVIEW — NOT FINAL DESIGN</p>
              <div className="site00-df-artifact__concept-frame">
                <p>Hero · navigation · primary value proposition · CTA</p>
              </div>
            </div>
            <button
              type="button"
              className="site00-df-artifact__cta"
              onClick={() => apiPost(token, 'build-interest', { interest: 'INTERESTED' }).then(load)}
            >
              CONFIGURE MY DIGITAL LOCATION
            </button>
            <button type="button" onClick={() => apiPost(token, 'build-interest', { interest: 'SAVED_FOR_LATER' }).then(load)}>
              SAVE THIS FOR LATER
            </button>
          </section>
        )}

      {error && <p className="site00-df-artifact__error">{error}</p>}
    </main>
  );
}
