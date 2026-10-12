/**
 * Digital Foundation completion and next-location experience (DF-C01 · C02 · F01 · F02).
 * One surface, four stations; the station lives in the URL hash so the token path never changes.
 * Client-owned verified records only — nothing here is shown unless the payload carries it.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import { SITE00_ROUTES } from '../../config/routes';
import {
  DfaCta, DfaIcon, DfaNote, DfaPill, DfaShell, DfaStatus, type DfaGlyph, type DfaMenuItem, type DfaTone,
} from '../../foundation-authority/DfAuthority';
import './digitalFoundationCompletion.css';

type Station = 'complete' | 'location' | 'credit' | 'bldr';
const STATIONS: Station[] = ['complete', 'location', 'credit', 'bldr'];
const GOOD = new Set(['CONFIGURED', 'PROTECTED', 'ACTIVE', 'VERIFIED', 'COMPLETE', 'REGISTERED']);

const money = (minor: number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: minor % 100 ? 2 : 0 }).format(minor / 100);
const word = (v: unknown) => String(v ?? '').replace(/_/g, ' ').toUpperCase();
const tone = (v: string): DfaTone => (GOOD.has(v) ? 'ok' : 'neutral');

function readStation(): { station: Station; records: boolean } {
  if (typeof window === 'undefined') return { station: 'complete', records: false };
  const hash = window.location.hash.replace('#', '');
  if (hash === 'records') return { station: 'complete', records: true };
  return { station: (STATIONS as string[]).includes(hash) ? (hash as Station) : 'complete', records: false };
}

async function captureBuildInterest(token: string, interest: 'INTERESTED' | 'SAVED_FOR_LATER') {
  const res = await fetch('/api/site00/digital-foundation-artifact?action=build-interest', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, interest }),
  });
  if (!res.ok) throw new Error('Request failed');
}

const BUILD_PATHS: { id: 'SIMPLE_BUILD' | 'ADVANCED_BUILD' | 'CUSTOM_BUILD'; name: string; note: string; icon: DfaGlyph }[] = [
  { id: 'SIMPLE_BUILD', name: 'SIMPLE', note: 'START WITH AN ESTABLISHED SYSTEM', icon: 'cube' },
  { id: 'ADVANCED_BUILD', name: 'ADVANCED', note: 'RESHAPE THE SYSTEM', icon: 'layers' },
  { id: 'CUSTOM_BUILD', name: 'CUSTOM', note: 'START FROM ZERO', icon: 'sliders' },
];
const BLDR_ROOMS: { name: string; note: string; icon: DfaGlyph }[] = [
  { name: 'PLACE', note: 'THE SITE', icon: 'cube' },
  { name: 'FEEL', note: 'THE TONE', icon: 'layers' },
  { name: 'WORK', note: 'THE STRUCTURE', icon: 'sliders' },
  { name: 'PACE', note: 'THE TIMELINE', icon: 'clock' },
];

export default function DigitalFoundationCompleteSurface({ token, payload, reload }: {
  token: string; payload: ClientDigitalFoundationPayload; reload: () => Promise<unknown>;
}) {
  const [{ station, records }, setNav] = useState(readStation);
  const [busy, setBusy] = useState<'INTERESTED' | 'SAVED_FOR_LATER' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const complete = payload.artifact.completion_state === 'COMPLETE';
  const ownership = payload.ownership_record;
  const credit = payload.credit?.status === 'AVAILABLE' ? payload.credit : null;
  const interestState = payload.artifact.build_interest;
  const recommended = payload.artifact.build_recommendation;
  const business = ownership?.business || payload.lead?.business_name || null;

  useEffect(() => {
    const onHash = () => setNav(readStation());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = useCallback((next: Station, withRecords = false) => {
    const hash = withRecords ? '#records' : next === 'complete' ? '' : `#${next}`;
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}${hash}`);
    setNav({ station: next, records: withRecords });
    setError(null);
    window.scrollTo({ top: 0 });
  }, []);

  const interest = async (choice: 'INTERESTED' | 'SAVED_FOR_LATER') => {
    setBusy(choice); setError(null);
    try {
      await captureBuildInterest(token, choice);
      await reload();
      if (choice === 'INTERESTED') go('bldr');
    } catch {
      setError('WE COULD NOT SAVE YOUR SELECTION. PLEASE TRY AGAIN.');
    } finally {
      setBusy(null);
    }
  };

  const menu: DfaMenuItem[] = [
    { label: 'COMPLETION RECORD', onSelect: () => go('complete'), current: station === 'complete' && !records },
    { label: 'YOUR RECORDS', onSelect: () => go('complete', true), current: records },
    { label: 'DIGITAL LOCATION', onSelect: () => go('location'), current: station === 'location' },
    { label: 'FOUNDATION CREDIT', onSelect: () => go('credit'), current: station === 'credit', disabled: !credit },
    { label: 'BLDR INTRODUCTION', onSelect: () => go('bldr'), current: station === 'bldr' },
  ];

  if (!complete) {
    return (
      <DfaShell code="11" kicker="FOUNDATION STATUS" title={['YOUR', 'FOUNDATION IS', 'IN PROGRESS']}
        lede="THE COMPLETION RECORD WILL APPEAR HERE AFTER SITE 00 HAS VERIFIED YOUR SETUP." plate="c01" footCode="C01"
        authority="mobile" menu={[{ label: 'COMPLETION RECORD', current: true, disabled: true }]}>
        <div className="dfc">
          <DfaStatus kind="empty">NO COMPLETION RECORD IS AVAILABLE YET.</DfaStatus>
        </div>
      </DfaShell>
    );
  }

  if (station === 'location') {
    return (
      <DfaShell code="12" kicker="DIGITAL LOCATION" title={['YOUR', 'DIGITAL', 'LOCATION']}
        lede="CHOOSE HOW THE FOUNDATION SHOULD LIVE AT THE DOMAIN." plate="c02" shard="c02" footCode="C02" authority="mobile" menu={menu}>
        <div className="dfc dfc--location">
          {credit && (
            <button type="button" className="dfc-credit" onClick={() => go('credit')}>
              <span className="dfc-credit__icon"><DfaIcon name="ticket" /></span>
              <span className="dfc-credit__body">
                <strong>{money(credit.amount_minor, credit.currency)}</strong>
                <small>FOUNDATION CREDIT AVAILABLE</small>
              </span>
            </button>
          )}
          <p className="dfa-label">CHOOSE YOUR BUILD PATH</p>
          <div className="dfa-rows dfa-rows--cards dfc-paths">
            {BUILD_PATHS.map((p) => (
              <button key={p.id} type="button" className="dfa-row" onClick={() => go('bldr')}>
                <span className="dfa-row__icon"><DfaIcon name={p.icon} className="dfa-ico" /></span>
                <span className="dfa-row__main">
                  <strong>{p.name}{recommended === p.id && <em className="dfc-tag">RECOMMENDED</em>}</strong>
                  <small>{p.note}</small>
                </span>
                <span />
                <span className="dfa-row__chev"><DfaIcon name="chevron" className="dfa-chev" /></span>
              </button>
            ))}
          </div>
          {error && <DfaStatus kind="error">{error}</DfaStatus>}
          <div className="dfc-actions">
            <DfaCta onClick={() => interest('INTERESTED')} disabled={busy !== null}>
              {busy === 'INTERESTED' ? 'SAVING…' : 'VIEW MY DIGITAL LOCATION'}
            </DfaCta>
            <DfaCta variant="secondary" onClick={() => interest('SAVED_FOR_LATER')} disabled={busy !== null}>
              {busy === 'SAVED_FOR_LATER' ? 'SAVING…' : interestState === 'SAVED_FOR_LATER' ? 'SAVED FOR LATER ✓' : 'SAVE THIS FOR LATER'}
            </DfaCta>
          </div>
          <DfaNote>YOUR FOUNDATION REMAINS ACTIVE.</DfaNote>
        </div>
      </DfaShell>
    );
  }

  if (station === 'credit') {
    return (
      <DfaShell code="F01" kicker="FOUNDATION CREDIT" title={['FOUNDATION', 'CREDIT']}
        lede={credit ? 'A CREDIT IS AVAILABLE ON THIS FOUNDATION.' : 'NO CREDIT IS AVAILABLE ON THIS FOUNDATION.'}
        plate="f01" shard="f01" footCode="F01" authority="mobile" menu={menu}>
        <div className="dfc dfc--credit">
          {credit ? (
            <div className="dfc-panel">
              <div className="dfc-panel__row">
                <span className="dfc-panel__icon"><DfaIcon name="ticket" /></span>
                <span className="dfc-panel__body">
                  <strong className="dfc-amount">{money(credit.amount_minor, credit.currency)} {credit.currency}</strong>
                  <small>AVAILABLE UNTIL {new Date(credit.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</small>
                </span>
              </div>
              <div className="dfc-panel__row">
                <span className="dfc-panel__icon"><DfaIcon name="alertCircle" /></span>
                <span className="dfc-panel__body"><p>APPLIES TO A QUALIFYING SITE 00 BUILD. TERMS ARE ON YOUR RECORD.</p></span>
              </div>
            </div>
          ) : (
            <DfaStatus kind="empty">A FOUNDATION CREDIT APPEARS HERE ONLY WHEN A VERIFIED, AVAILABLE CREDIT IS ON YOUR RECORD.</DfaStatus>
          )}
          <div className="dfc-actions">
            <DfaCta onClick={() => go('location')}>REVIEW BUILD PATHS</DfaCta>
          </div>
          <div className="dfc-panel dfc-panel--single">
            <div className="dfc-panel__row">
              <span className="dfc-panel__icon"><DfaIcon name="shieldCheck" /></span>
              <span className="dfc-panel__body"><p>NO CHARGE IS MADE HERE.</p></span>
            </div>
          </div>
        </div>
      </DfaShell>
    );
  }

  if (station === 'bldr') {
    return (
      <DfaShell code="F02" kicker="BLDR INTRODUCTION" title={['BUILD', 'THE NEXT', 'ROOM']}
        lede="BLDR IS THE STUDIO FOR PLACE, FEEL, WORK, AND PACE." plate="f02" footCode="F02" authority="mobile" menu={menu}>
        <div className="dfc dfc--bldr">
          <nav className="dfa-rows dfa-rows--cards dfc-rooms" aria-label="What BLDR shapes">
            {BLDR_ROOMS.map((r) => (
              <Link key={r.name} className="dfa-row dfa-row--divided" to={SITE00_ROUTES.bldrState}>
                <span className="dfa-row__icon"><DfaIcon name={r.icon} className="dfa-ico" /></span>
                <span className="dfa-row__main"><strong>{r.name}</strong><small>{r.note}</small></span>
                <span />
                <span className="dfa-row__chev"><DfaIcon name="chevron" className="dfa-chev" /></span>
              </Link>
            ))}
          </nav>
          <div className="dfc-actions">
            <DfaCta to={SITE00_ROUTES.bldrState}>OPEN BLDR</DfaCta>
            <DfaCta variant="secondary" onClick={() => go('complete')}>STAY ON THE FOUNDATION</DfaCta>
          </div>
          <DfaNote>INTRODUCTION ONLY. NOT A CONTRACT.</DfaNote>
        </div>
      </DfaShell>
    );
  }

  const rows = ownership ? [
    ownership.domain && { label: 'DOMAIN', sub: String(ownership.domain).toUpperCase(), status: ownership.registrar ? 'REGISTERED' : 'ON RECORD', icon: 'globe' as DfaGlyph },
    ownership.primary_mailbox && { label: 'PROFESSIONAL EMAIL', sub: String(ownership.primary_mailbox).toUpperCase(), status: 'ACTIVE', icon: 'envelope' as DfaGlyph },
    ownership.dns_status && { label: 'DNS', sub: word(ownership.dns_status), status: word(ownership.dns_status), icon: 'layers' as DfaGlyph },
    ownership.security_status && { label: 'EMAIL SECURITY', sub: word(ownership.security_status), status: word(ownership.security_status), icon: 'shield' as DfaGlyph },
  ].filter(Boolean) as { label: string; sub: string; status: string; icon: DfaGlyph }[] : [];
  const ownsAll = Boolean(ownership?.domain && ownership?.primary_mailbox && ownership?.security_status);

  return (
    <DfaShell code="11" kicker="FOUNDATION COMPLETE" title={['YOUR', 'FOUNDATION', 'IS COMPLETE']}
      lede={ownsAll
        ? 'YOUR DIGITAL INFRASTRUCTURE IS ESTABLISHED. YOU OWN THE DOMAIN, EMAIL, AND SECURITY.'
        : 'YOUR DIGITAL FOUNDATION HAS REACHED ITS VERIFIED COMPLETION STAGE.'}
      plate="c01" shard="c01" footCode="C01" authority="mobile" menu={menu}>
      <div className="dfc dfc--complete">
        {rows.length > 0 ? (
          <div className="dfa-rows dfa-rows--box dfc-record" aria-label="Verified ownership record">
            {rows.map((r) => (
              <div key={r.label} className="dfa-row dfa-row--divided">
                <span className="dfa-row__icon"><DfaIcon name={r.icon} className="dfa-ico" /></span>
                <span className="dfa-row__main"><strong>{r.label}</strong><small>{r.sub}</small></span>
                <span className="dfa-row__side"><DfaPill tone={tone(r.status)}>{r.status}</DfaPill></span>
                <span />
              </div>
            ))}
          </div>
        ) : (
          <DfaStatus kind="empty">YOUR VERIFIED OWNERSHIP DETAILS WILL APPEAR WHEN THE RECORD IS AVAILABLE.</DfaStatus>
        )}
        {business && <p className="dfc-business">{business.toUpperCase()}</p>}
        {records && ownership && (
          <dl className="dfc-records" id="dfc-records" aria-label="Full ownership record">
            {([
              ['BUSINESS', ownership.business], ['DOMAIN', ownership.domain], ['REGISTRAR', ownership.registrar],
              ['RENEWAL', ownership.renewal_date], ['EMAIL PROVIDER', ownership.email_provider], ['PRIMARY MAILBOX', ownership.primary_mailbox],
              ['ALIASES', ownership.aliases?.length ? ownership.aliases.join(', ') : null], ['DNS', ownership.dns_status && word(ownership.dns_status)],
              ['EMAIL SECURITY', ownership.security_status && word(ownership.security_status)], ['OWNER', ownership.owner],
              ['ADMINISTRATIVE ACCESS', ownership.administrative_access_model],
            ] as [string, unknown][]).map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v ? String(v).toUpperCase() : 'NOT RECORDED'}</dd></div>
            ))}
          </dl>
        )}
        <div className="dfc-actions">
          {ownership ? (
            <button type="button" className="dfa-cta dfa-cta--primary" aria-expanded={records} aria-controls="dfc-records"
              onClick={() => go('complete', !records)}>
              <span>{records ? 'HIDE RECORDS' : 'VIEW RECORDS'}</span>
              <DfaIcon name="arrow" className={`dfa-cta__arrow${records ? ' is-up' : ''}`} />
            </button>
          ) : (
            <DfaCta disabled>VIEW RECORDS</DfaCta>
          )}
        </div>
        <div className="dfc-note-row">
          <DfaNote>{ownership ? 'VERIFIED. DELIVERED. OWNED.' : 'VERIFIED BY SITE 00.'}</DfaNote>
          <button type="button" className="dfc-next" aria-label="Next: your digital location" onClick={() => go('location')}>
            <span>NEXT</span><DfaIcon name="arrow" />
          </button>
        </div>
      </div>
    </DfaShell>
  );
}
