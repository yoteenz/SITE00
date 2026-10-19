import { useEffect, useMemo, useState } from 'react';
import { foundationAdminApi, type FoundationAdminListRow, type ReferralSourceRow } from '../../services/foundationAdminApi';
import { AIO_PARTNER_DISPLAY, CARD_STUDIO_COPY, REFERRAL_COMMISSION_POLICY } from '../config/referralPolicy';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';
import { DF_REFERRAL_SOURCE_ID } from '../../../../../shared/site00-digital-foundation/referralSources.js';

export function ReferralsPage() {
  const { openOverlay } = useFounderWorkspaceOverlay();
  const [artifacts, setArtifacts] = useState<FoundationAdminListRow[]>([]);
  const [sources, setSources] = useState<ReferralSourceRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void foundationAdminApi
      .list()
      .then((j) => {
        setArtifacts(j.artifacts ?? []);
        setSources(j.referral_sources ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, []);

  const attributionCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of artifacts) {
      const id = a.referral_source_id ?? 'none';
      m.set(id, (m.get(id) ?? 0) + 1);
    }
    return m;
  }, [artifacts]);

  const aioSource = sources.find((s) => s.kind === 'AIO');

  return (
    <FounderWorkspacePageFrame destination="referrals">
      <div className="ifw-referrals">
        {error ? (
          <p role="alert" className="ifw-inline-error">
            {error}
          </p>
        ) : null}
        <section className="ifw-panel ifw-panel--blocked">
          <h2 className="ifw-panel__title">Commission ledger</h2>
          <p>
            Fixed fees ${REFERRAL_COMMISSION_POLICY.standardUsd} / ${REFERRAL_COMMISSION_POLICY.establishedUsd} / cap $
            {REFERRAL_COMMISSION_POLICY.universalCapUsd}. Accrual blocked until verified payment evidence exists.
          </p>
          <button type="button" className="ifw-btn ifw-btn--ghost" disabled aria-describedby="ifw-comm-block">
            Approve commission
          </button>
          <p id="ifw-comm-block" className="ifw-muted">
            BLOCKED BY POLICY · record-only when backend authorized
          </p>
        </section>

        <section className="ifw-panel">
          <h2 className="ifw-panel__title">Partner registry</h2>
          <ul className="ifw-partner-list">
            {sources.map((s) => (
              <li key={s.referral_source_id}>
                <strong>{s.label}</strong>
                <span className="fw-data">{s.kind}</span>
                <span className="ifw-muted">{attributionCounts.get(s.referral_source_id) ?? 0} attributed artifacts</span>
                {s.kind === 'AIO' ? (
                  <span className="ifw-status ifw-status--warn">
                    {AIO_PARTNER_DISPLAY.classification.replace(/_/g, ' ')} · not auto-active
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="ifw-panel">
          <h2 className="ifw-panel__title">Card studio</h2>
          <div className="ifw-card-preview">
            <div className="ifw-card-preview__face">
              <p>{CARD_STUDIO_COPY.frontLine1}</p>
              <p>{CARD_STUDIO_COPY.frontLine2}</p>
            </div>
            <div className="ifw-card-preview__face ifw-card-preview__face--back">
              <p>{CARD_STUDIO_COPY.backLine}</p>
              <p className="ifw-card-preview__partner">{CARD_STUDIO_COPY.partnerName}</p>
            </div>
          </div>
          <p className="ifw-muted">Print readiness: BLOCKED — link and QR gates must pass before PRINT READY.</p>
          <div className="ifw-actions-row">
            <button type="button" className="ifw-btn ifw-btn--ghost" onClick={() => openOverlay('RO-11')}>
              Print preview
            </button>
            <button type="button" className="ifw-btn ifw-btn--ghost" onClick={() => openOverlay('RO-09')}>
              Link validation
            </button>
            <button type="button" className="ifw-btn ifw-btn--ghost" onClick={() => openOverlay('RO-01')}>
              Partner create
            </button>
          </div>
          {aioSource ? (
            <p className="ifw-muted fw-data">
              AIO fixture id {DF_REFERRAL_SOURCE_ID.AIO} · proposed ${AIO_PARTNER_DISPLAY.proposedFeeUsd} · activation requires executed terms
            </p>
          ) : null}
        </section>
      </div>
    </FounderWorkspacePageFrame>
  );
}
