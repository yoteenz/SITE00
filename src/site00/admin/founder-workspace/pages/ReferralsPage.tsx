import { useEffect, useMemo, useState } from 'react';
import { foundationAdminApi, type FoundationAdminListRow, type ReferralSourceRow } from '../../services/foundationAdminApi';
import { AIO_PARTNER_DISPLAY, CARD_STUDIO_COPY, REFERRAL_COMMISSION_POLICY } from '../config/referralPolicy';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';
import { REFERRAL_OVERLAY_IDS, OVERLAY_META } from '../overlay/overlayRegistry';
import { DF_REFERRAL_SOURCE_ID } from '../../../../../shared/site00-digital-foundation/referralSources.js';
import {
  formatReferralActivityTime,
  referralActivityFromRegistry,
} from '../data/referralActivityEvents';

type ReferralsSection = 'overview' | 'partners' | 'attribution' | 'commissions' | 'payouts' | 'card' | 'activity';

export function ReferralsPage() {
  const { openOverlay } = useFounderWorkspaceOverlay();
  const [section, setSection] = useState<ReferralsSection>('overview');
  const [artifacts, setArtifacts] = useState<FoundationAdminListRow[]>([]);
  const [sources, setSources] = useState<ReferralSourceRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<ReferralSourceRow | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    void foundationAdminApi
      .list()
      .then((j) => {
        setArtifacts(j.artifacts ?? []);
        setSources(j.referral_sources ?? []);
        setSelectedPartner(j.referral_sources?.[0] ?? null);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Load failed'))
      .finally(() => setLoading(false));
  }, []);

  const activityEvents = useMemo(() => referralActivityFromRegistry(artifacts, sources), [artifacts, sources]);
  const selectedEvent = activityEvents.find((e) => e.id === selectedEventId) ?? activityEvents[0] ?? null;

  useEffect(() => {
    if (selectedEvent && !selectedEventId) setSelectedEventId(selectedEvent.id);
  }, [selectedEvent, selectedEventId]);

  const attributionRows = useMemo(
    () =>
      artifacts.filter((a) => a.referral_source_id).map((a) => ({
        artifact_id: a.artifact_id,
        business_name: a.business_name,
        referral_source_id: a.referral_source_id,
        state: a.state,
      })),
    [artifacts],
  );

  const partnerPayload = {
    partner_label: selectedPartner?.label,
    partner_kind: selectedPartner?.kind,
    invite_path: selectedPartner?.kind === 'AIO' ? '/invite/aio-demo' : undefined,
  };

  const sectionNav: { id: ReferralsSection; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'partners', label: 'Partners' },
    { id: 'attribution', label: 'Attribution' },
    { id: 'commissions', label: 'Commissions' },
    { id: 'payouts', label: 'Payouts' },
    { id: 'card', label: 'Card studio' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <FounderWorkspacePageFrame destination="referrals">
      <div className="ifw-referrals">
        {error ? (
          <p role="alert" className="ifw-inline-error">
            {error}
          </p>
        ) : null}
        <nav className="ifw-section-nav" aria-label="Referrals sections">
          {sectionNav.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`ifw-section-nav__btn ${section === s.id ? 'ifw-section-nav__btn--active' : ''}`.trim()}
              onClick={() => setSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {section === 'overview' ? (
          <section className="ifw-panel">
            <h2 className="ifw-panel__title">Referral overview</h2>
            <p className="ifw-lede">
              {attributionRows.length} attributed artifacts · {sources.length} referral source kinds seeded
            </p>
            <p className="ifw-muted">
              Policy: ${REFERRAL_COMMISSION_POLICY.standardUsd} / ${REFERRAL_COMMISSION_POLICY.establishedUsd} / cap $
              {REFERRAL_COMMISSION_POLICY.universalCapUsd}
            </p>
          </section>
        ) : null}

        {section === 'partners' ? (
          <section className="ifw-panel">
            <h2 className="ifw-panel__title">Partner registry</h2>
            <ul className="ifw-partner-list">
              {sources.map((s) => (
                <li key={s.referral_source_id}>
                  <button type="button" className="ifw-partner-row" onClick={() => setSelectedPartner(s)}>
                    <strong>{s.label}</strong>
                    <span className="fw-data">{s.kind}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="ifw-actions-row">
              {(['RO-01', 'RO-02', 'RO-03', 'RO-04', 'RO-20'] as const).map((id) => (
                <button key={id} type="button" className="ifw-btn ifw-btn--ghost" onClick={() => openOverlay(id, partnerPayload)}>
                  {OVERLAY_META[id].title}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {section === 'attribution' ? (
          <section className="ifw-panel">
            <h2 className="ifw-panel__title">Attribution ledger</h2>
            <ul className="ifw-list">
              {attributionRows.length ? (
                attributionRows.map((r) => (
                  <li key={r.artifact_id} className="fw-data">
                    {r.business_name ?? r.artifact_id.slice(0, 8)} · {r.state}
                  </li>
                ))
              ) : (
                <li className="ifw-muted">No attributed artifacts in registry</li>
              )}
            </ul>
            <div className="ifw-actions-row">
              <button type="button" className="ifw-btn ifw-btn--ghost" onClick={() => openOverlay('RO-18', partnerPayload)}>
                Attribution exception
              </button>
              <button type="button" className="ifw-btn ifw-btn--ghost" onClick={() => openOverlay('RO-19', partnerPayload)}>
                Manual correction
              </button>
            </div>
          </section>
        ) : null}

        {section === 'commissions' ? (
          <section className="ifw-panel ifw-panel--blocked">
            <h2 className="ifw-panel__title">Commission ledger</h2>
            <p className="ifw-muted">No payable rows — payment evidence gap (G-RF).</p>
            <div className="ifw-actions-row">
              {(['RO-05', 'RO-11', 'RO-12', 'RO-13'] as const).map((id) => (
                <button key={id} type="button" className="ifw-btn ifw-btn--ghost" onClick={() => openOverlay(id, partnerPayload)}>
                  {OVERLAY_META[id].title}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {section === 'payouts' ? (
          <section className="ifw-panel ifw-panel--blocked">
            <h2 className="ifw-panel__title">Payout workspace</h2>
            <p className="ifw-muted">External manual record-only — not executable in this build.</p>
            <div className="ifw-actions-row">
              {(['RO-14', 'RO-15', 'RO-16', 'RO-17'] as const).map((id) => (
                <button key={id} type="button" className="ifw-btn ifw-btn--ghost" onClick={() => openOverlay(id, partnerPayload)}>
                  {OVERLAY_META[id].title}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {section === 'card' ? (
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
            <div className="ifw-actions-row">
              {(['RO-06', 'RO-07', 'RO-08', 'RO-09', 'RO-10'] as const).map((id) => (
                <button key={id} type="button" className="ifw-btn ifw-btn--ghost" onClick={() => openOverlay(id, partnerPayload)}>
                  {OVERLAY_META[id].title}
                </button>
              ))}
            </div>
            <p className="ifw-muted fw-data">AIO id {DF_REFERRAL_SOURCE_ID.AIO} · {AIO_PARTNER_DISPLAY.classification.replace(/_/g, ' ')}</p>
          </section>
        ) : null}

        {section === 'activity' ? (
          <section className="ifw-panel ifw-referral-activity" aria-busy={loading}>
            <h2 className="ifw-panel__title">Referral activity</h2>
            <p className="ifw-muted" role="status">
              Partner commerce event API (<span className="fw-data">GET /api/admin/referrals/events</span>) is not
              deployed. Timeline shows persisted attribution snapshots from the foundation registry only — no
              fabricated commissions or payouts.
            </p>
            {loading ? <p className="ifw-muted">Loading registry…</p> : null}
            {!loading && error ? (
              <p role="alert" className="ifw-inline-error">
                {error}
              </p>
            ) : null}
            {!loading && !error && !activityEvents.length ? (
              <p className="ifw-muted">No attributed clients in registry yet.</p>
            ) : null}
            {!loading && activityEvents.length ? (
              <div className="ifw-referral-activity__layout">
                <ul className="ifw-activity-stream" aria-label="Referral activity events">
                  {activityEvents.map((ev) => (
                    <li key={ev.id}>
                      <button
                        type="button"
                        className={`ifw-activity-stream__row ${selectedEvent?.id === ev.id ? 'ifw-activity-stream__row--selected' : ''}`.trim()}
                        onClick={() => setSelectedEventId(ev.id)}
                      >
                        <time className="ifw-activity-stream__time" dateTime={ev.occurred_at}>
                          {formatReferralActivityTime(ev.occurred_at)}
                        </time>
                        <span className="ifw-activity-stream__verb">{ev.verb}</span>
                        <span className="ifw-activity-stream__subject">{ev.subject}</span>
                        <span className="ifw-activity-stream__partner">{ev.partner_label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <aside className="ifw-activity-detail" aria-label="Event detail">
                  {selectedEvent ? (
                    <>
                      <h3 className="ifw-activity-detail__title">{selectedEvent.subject}</h3>
                      <dl className="ifw-kv">
                        <dt>When</dt>
                        <dd>{formatReferralActivityTime(selectedEvent.occurred_at)}</dd>
                        <dt>Partner</dt>
                        <dd>{selectedEvent.partner_label}</dd>
                        <dt>Category</dt>
                        <dd>{selectedEvent.category}</dd>
                        <dt>Artifact</dt>
                        <dd className="fw-data">{selectedEvent.artifact_id}</dd>
                      </dl>
                    </>
                  ) : (
                    <p className="ifw-muted">Select an event</p>
                  )}
                </aside>
              </div>
            ) : null}
          </section>
        ) : null}

        <details className="ifw-panel">
          <summary>Overlay registry ({REFERRAL_OVERLAY_IDS.length} families)</summary>
          <ul className="ifw-list">
            {REFERRAL_OVERLAY_IDS.map((id) => (
              <li key={id}>
                <button type="button" className="ifw-btn ifw-btn--ghost" onClick={() => openOverlay(id, partnerPayload)}>
                  {id} · {OVERLAY_META[id].title}
                </button>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </FounderWorkspacePageFrame>
  );
}
