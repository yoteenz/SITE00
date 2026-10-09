/**
 * Composer's functional COMPLETE / BUILD_UPSELL section, moved out of the artifact page unchanged.
 * Board 04 (P11/P12) owns its visual rebuild; this sprint keeps the function as-is.
 */
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import '../../styles/site00-digital-foundation.css';

function formatMoney(minor: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(minor / 100);
}

async function captureBuildInterest(token: string, interest: 'INTERESTED' | 'SAVED_FOR_LATER') {
  const res = await fetch('/api/site00/digital-foundation-artifact?action=build-interest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, interest }),
  });
  if (!res.ok) throw new Error('Request failed');
}

export default function DigitalFoundationCompleteSurface({
  token,
  payload,
  reload,
}: {
  token: string;
  payload: ClientDigitalFoundationPayload;
  reload: () => Promise<unknown>;
}) {
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (
    <main className="site00-df-artifact" data-surface={payload.surface}>
      <header className="site00-df-artifact__header">
        <p className="site00-df-artifact__eyebrow">SITE 00 · IDNTY</p>
        <h1>DIGITAL FOUNDATION</h1>
      </header>
      {payload.artifact.completion_state === 'COMPLETE' && (
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
            onClick={() => captureBuildInterest(token, 'INTERESTED').then(reload)}
          >
            CONFIGURE MY DIGITAL LOCATION
          </button>
          <button type="button" onClick={() => captureBuildInterest(token, 'SAVED_FOR_LATER').then(reload)}>
            SAVE THIS FOR LATER
          </button>
        </section>
      )}
    </main>
  );
}
