/**
 * COMPLETE / BUILD_UPSELL — Board 11 + Board 12 milestone (within the living portal when `embedded`).
 */
import { useState } from 'react';
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import type { FoundationBuildPathPreference } from '../../../../shared/site00-digital-foundation/builderHandoff.js';
import { assessFoundationCreditEligibility } from '../../../../shared/site00-digital-foundation/builderHandoff.js';
import { captureBuildInterest as sendBuildInterest, createBuilderHandoff } from '../../foundation-client/api';
import { FoundationDfRoot } from '../../foundation-client/FoundationDfRoot';
import { formatMoney } from '../../foundation-client/model';
import { SpecRow } from '../../foundation-client/parents/CheckoutActivation';
import { DfCta, DfHeadline, DfLede, DfRail, DfTrust } from '../../foundation-client/shell';
import { useFoundationPwaHead } from '../../foundation-client/useFoundationPwaHead';

const BUILD_PATHS: { id: FoundationBuildPathPreference; label: string }[] = [
  { id: 'SIMPLE_BUILD', label: 'SIMPLE' },
  { id: 'ADVANCED_BUILD', label: 'ADVANCED' },
  { id: 'CUSTOM_BUILD', label: 'CUSTOM' },
];

function CompleteMilestoneBody({
  token,
  payload,
  reload,
}: {
  token: string;
  payload: ClientDigitalFoundationPayload;
  reload: () => Promise<unknown>;
}) {
  const o = payload.ownership_record;
  const eligibility = assessFoundationCreditEligibility({
    completion_state: payload.artifact.completion_state,
    credit: payload.credit,
  });
  const credit = eligibility.ok ? eligibility.credit : null;
  const buildLabel = payload.artifact.build_recommendation.replace(/_/g, ' ');
  const [pathPref, setPathPref] = useState<FoundationBuildPathPreference | null>(() => {
    const rec = payload.artifact.build_recommendation;
    if (rec === 'SIMPLE_BUILD' || rec === 'ADVANCED_BUILD' || rec === 'CUSTOM_BUILD') return rec;
    return null;
  });
  const [busy, setBusy] = useState(false);
  const [handoffError, setHandoffError] = useState<string | null>(null);

  const capture = (interest: 'INTERESTED' | 'SAVED_FOR_LATER') => {
    void sendBuildInterest(token, interest).then(reload);
  };

  const continueToBuilder = async () => {
    setHandoffError(null);
    if (!credit) {
      setHandoffError('FOUNDATION CREDIT IS NOT AVAILABLE FOR REDEMPTION.');
      return;
    }
    setBusy(true);
    try {
      await sendBuildInterest(token, 'INTERESTED');
      const res = await createBuilderHandoff(token, pathPref);
      if (res.builder_credit_consumption === 'PENDING_BUILDER_INTEGRATION') {
        /* credit verified server-side; builder applies discount in a later integration step */
      }
      window.location.assign(res.deep_link_path.startsWith('/') ? res.deep_link_path : `/${res.deep_link_path}`);
    } catch {
      setHandoffError('WE COULD NOT OPEN THE SITE 00 BUILDER. YOUR FOUNDATION RECORDS ARE UNCHANGED.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <DfRail index="11" label="FOUNDATION COMPLETE" />
      <DfHeadline lines={['YOUR', 'FOUNDATION', 'IS COMPLETE']} />
      <DfLede>
        YOUR DOMAIN AND PROFESSIONAL BUSINESS COMMUNICATIONS ARE OPERATIONAL. SITE 00 KEEPS THIS RECORD ON YOUR
        FOUNDATION LINK.
      </DfLede>
      <ul className="df-specs">
        {o?.domain && <SpecRow icon="building" label={o.domain.toUpperCase()} sub="DOMAIN" value="ACTIVE" />}
        {o?.primary_mailbox && (
          <SpecRow icon="envelope" label={o.primary_mailbox.toUpperCase()} sub="PROFESSIONAL EMAIL" value="ACTIVE" />
        )}
        {o?.dns_status && (
          <SpecRow icon="layers" label={o.dns_status.replace(/_/g, ' ').toUpperCase()} sub="DNS" wide />
        )}
        {o?.security_status && (
          <SpecRow icon="shield" label={o.security_status.replace(/_/g, ' ').toUpperCase()} sub="EMAIL SECURITY" wide />
        )}
      </ul>
      {credit && (
        <section className="df-section" aria-labelledby="df-credit-h">
          <h2 className="df-section__label" id="df-credit-h">
            YOUR FOUNDATION CREDIT
          </h2>
          <ul className="df-specs">
            <SpecRow
              icon="card"
              label={formatMoney(credit.amount_minor, credit.currency)}
              sub="SERVER-VERIFIED CREDIT"
              value={`BOOK BY ${new Date(credit.expires_at).toLocaleDateString('en-US').toUpperCase()}`}
              wide
            />
          </ul>
          <p className="df-section__note df-section__note--faint">
            CREDIT APPLIES IN THE SITE 00 BUILDER AFTER VERIFICATION — NOT FROM THE URL.
          </p>
        </section>
      )}
      {!credit && payload.credit && (
        <p className="df-section__note">YOUR FOUNDATION CREDIT IS NO LONGER REDEEMABLE.</p>
      )}
      <section className="df-section" aria-labelledby="df-location-h">
        <h2 className="df-section__label" id="df-location-h">
          YOUR DIGITAL LOCATION
        </h2>
        <p className="df-section__note">
          THE FOUNDATION IS OPERATIONAL. THE NEXT OPTIONAL STEP IS WHAT SHOULD LIVE AT YOUR DOMAIN.
          {payload.build_readiness?.site_needed ? ` RECOMMENDATION: ${buildLabel}.` : ''}
        </p>
        <p className="df-section__note df-section__note--faint">CONCEPT PREVIEW — NOT FINAL DESIGN</p>
        <div className="df-chips" role="group" aria-label="Build path preference">
          {BUILD_PATHS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`df-chip${pathPref === p.id ? ' df-chip--on' : ''}`}
              onClick={() => setPathPref(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>
      {handoffError && <p className="df-section__note">{handoffError}</p>}
      <div className="df-actions">
        <DfCta
          label="CONFIGURE MY DIGITAL LOCATION"
          busy={busy}
          disabled={!credit || busy}
          onClick={() => void continueToBuilder()}
        />
        <DfCta tone="outline" label="SAVE THIS FOR LATER" onClick={() => capture('SAVED_FOR_LATER')} />
      </div>
      <DfTrust text="SAFE. SECURE. ON TRACK." />
    </>
  );
}

export default function DigitalFoundationCompleteSurface({
  token,
  payload,
  reload,
  embedded = false,
}: {
  token: string;
  payload: ClientDigitalFoundationPayload;
  reload: () => Promise<unknown>;
  embedded?: boolean;
}) {
  useFoundationPwaHead(!embedded);
  const inner = <CompleteMilestoneBody token={token} payload={payload} reload={reload} />;
  if (embedded) return inner;
  return (
    <FoundationDfRoot object="crown" state="COMPLETE" view={null}>
      {inner}
    </FoundationDfRoot>
  );
}
