/**
 * COMPLETE / BUILD_UPSELL — Board 01/02 shell (same chrome as the live artifact link).
 */
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import { captureBuildInterest as sendBuildInterest } from '../../foundation-client/api';
import { FoundationDfRoot } from '../../foundation-client/FoundationDfRoot';
import { formatMoney } from '../../foundation-client/model';
import { SpecRow } from '../../foundation-client/parents/CheckoutActivation';
import { DfCta, DfHeadline, DfLede, DfRail, DfTrust } from '../../foundation-client/shell';
import { useFoundationPwaHead } from '../../foundation-client/useFoundationPwaHead';

export default function DigitalFoundationCompleteSurface({
  token,
  payload,
  reload,
}: {
  token: string;
  payload: ClientDigitalFoundationPayload;
  reload: () => Promise<unknown>;
}) {
  useFoundationPwaHead(true);
  const o = payload.ownership_record;
  const credit = payload.credit?.status === 'AVAILABLE' ? payload.credit : null;
  const buildLabel = payload.artifact.build_recommendation.replace(/_/g, ' ');

  const capture = (interest: 'INTERESTED' | 'SAVED_FOR_LATER') => {
    void sendBuildInterest(token, interest).then(reload);
  };

  return (
    <FoundationDfRoot object="crown" state="COMPLETE" view={null}>
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
              sub="AVAILABLE CREDIT"
              value={`BOOK BY ${new Date(credit.expires_at).toLocaleDateString('en-US').toUpperCase()}`}
              wide
            />
          </ul>
        </section>
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
      </section>
      <div className="df-actions">
        <DfCta label="CONFIGURE MY DIGITAL LOCATION" onClick={() => capture('INTERESTED')} />
        <DfCta tone="outline" label="SAVE THIS FOR LATER" onClick={() => capture('SAVED_FOR_LATER')} />
      </div>
      <DfTrust text="SAFE. SECURE. ON TRACK." />
    </FoundationDfRoot>
  );
}
