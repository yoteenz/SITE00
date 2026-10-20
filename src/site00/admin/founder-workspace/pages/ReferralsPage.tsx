import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { foundationAdminApi, type FoundationAdminListRow, type ReferralSourceRow } from '../../services/foundationAdminApi';
import { DF_REFERRAL_SOURCE_ID } from '../../../../../shared/site00-digital-foundation/referralSources.js';
import { AIO_PARTNER_DISPLAY, CARD_STUDIO_COPY, REFERRAL_COMMISSION_POLICY } from '../config/referralPolicy';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../config/routes';
import { formatReferralActivityTime, referralActivityFromRegistry } from '../data/referralActivityEvents';
import { nameOf } from '../data/foundationViews';
import { age, readLifecycle } from '../data/lifecycle';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';
import { REFERRAL_OVERLAY_IDS, type ReferralOverlayId } from '../overlay/overlayRegistry';
import { Amt, Checklist, Cs, FounderCard, Ledger, PartnerThumb, QrPlaceholder, RfHead, RfSecNav, RfSignals, RfTag, Timeline, TwoLine, type RfSection, type TimelineItem } from '../referrals/rfKit';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';
import { useInspectorDocked } from '../shell/useWorkspaceTier';
import { WsBanner, WsButton, WsChip, WsEmpty, WsGap, WsIcon, WsInspHead, WsKv, WsLinkButton, WsPanel, WsSearch, WsSegCtl, WsSkel, WsStatus, WsTabs, WsTechDetail } from '../shell/wsKit';
import '../styles/ifw-referrals.css';

/**
 * Referral partner as shown in the workspace. There is no partner table yet (G-RF): the only partner is the PLANNED
 * strategic partner (AIO, never auto-activated), and the other rows are the real attribution sources from the registry.
 */
type Partner = {
  id: string;
  name: string;
  type: string;
  planned: boolean;
  img: 'pav' | 'door' | 'tall' | 'inv';
  source: ReferralSourceRow | null;
  refs: number;
  conv: number;
};

type AttributedRow = { a: FoundationAdminListRow; name: string; source: ReferralSourceRow | null; partner: string };

const P_STATUS = (p: Partner) =>
  p.planned ? <Cs k="planned">PLANNED · NOT ACTIVE</Cs> : p.source?.active ? <WsStatus kind="idle">SOURCE · RECORDED</WsStatus> : <WsStatus kind="done">SOURCE · INACTIVE</WsStatus>;

const POLICY_LINES: Array<[string, string]> = [
  ['STANDARD FEE', `$${REFERRAL_COMMISSION_POLICY.standardUsd} PER QUALIFYING CLIENT`],
  ['ESTABLISHED FEE', `$${REFERRAL_COMMISSION_POLICY.establishedUsd}`],
  ['STRATEGIC MAXIMUM', `$${REFERRAL_COMMISSION_POLICY.strategicMaxUsd}`],
  ['AIO (PROPOSED)', `$${REFERRAL_COMMISSION_POLICY.aioProposedUsd} · NOT ACTIVE`],
  ['ABSOLUTE CAP', `$${REFERRAL_COMMISSION_POLICY.universalCapUsd} · NO PERCENTAGES`],
  ['QUALIFYING PRODUCT', `$${REFERRAL_COMMISSION_POLICY.qualifyingBasePackageUsd} IDNTY BASE PACKAGE ONLY · NO ADD-ON COMMISSION`],
  ['ATTRIBUTION WINDOW', `${REFERRAL_COMMISSION_POLICY.attributionWindowDays} DAYS`],
  ['PAYMENT HOLD', `${REFERRAL_COMMISSION_POLICY.holdDaysAfterVerifiedPayment} DAYS AFTER VERIFIED PAYMENT`],
  ['PAYOUT TARGET', `MONTHLY · THE ${REFERRAL_COMMISSION_POLICY.payoutTargetDayOfMonth}TH`],
  ['EXECUTION', 'MANUAL EXTERNAL PAYOUT · RECORD-ONLY'],
];

/**
 * 06 REFERRALS — OPUS3 R01–R42: overview, partners (+ inspector + detail), attribution ledger + source trace,
 * commissions, payouts, card studio (founder-selected card), activity. Real data = foundation registry attribution
 * (artifact referral_source_id + referral sources). Commission / payout ledgers have no backend (G-RF) and are shown
 * empty and policy-gated: no fabricated revenue, payments, commissions or active partners. Every RO-01…RO-20 trigger
 * stays reachable.
 */
export function ReferralsPage() {
  const docked = useInspectorDocked();
  const { openOverlay } = useFounderWorkspaceOverlay();
  const [section, setSection] = useState<RfSection>('OVERVIEW');
  const [artifacts, setArtifacts] = useState<FoundationAdminListRow[]>([]);
  const [sources, setSources] = useState<ReferralSourceRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerSheet, setPartnerSheet] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [traceId, setTraceId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    void foundationAdminApi
      .list()
      .then((j) => {
        setArtifacts(j.artifacts ?? []);
        setSources(j.referral_sources ?? []);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Load failed'))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const sourceById = useMemo(() => new Map(sources.map((s) => [s.referral_source_id, s])), [sources]);
  const attributed: AttributedRow[] = useMemo(
    () =>
      artifacts
        .filter((a) => a.referral_source_id)
        .map((a) => {
          const source = sourceById.get(a.referral_source_id ?? '') ?? null;
          return { a, name: nameOf(a), source, partner: source?.kind === 'AIO' ? AIO_PARTNER_DISPLAY.legalName : (source?.label ?? 'UNKNOWN SOURCE').toUpperCase() };
        })
        .sort((x, y) => (y.a.last_activity_at ?? y.a.created_at).localeCompare(x.a.last_activity_at ?? x.a.created_at)),
    [artifacts, sourceById],
  );
  const referred = attributed.filter((r) => r.source?.kind !== 'DIRECT');
  const converted = referred.filter((r) => r.a.payment_state === 'PAID');

  const partners: Partner[] = useMemo(() => {
    const aioSource = sources.find((s) => s.kind === 'AIO') ?? null;
    const count = (s: ReferralSourceRow | null) => (s ? attributed.filter((r) => r.source?.referral_source_id === s.referral_source_id) : []);
    const aioRefs = count(aioSource);
    const list: Partner[] = [
      { id: 'aio', name: AIO_PARTNER_DISPLAY.legalName, type: 'STRATEGIC PARTNER · PLANNED', planned: true, img: 'pav', source: aioSource, refs: aioRefs.length, conv: aioRefs.filter((r) => r.a.payment_state === 'PAID').length },
    ];
    for (const s of sources) {
      if (s.kind === 'AIO' || s.kind === 'DIRECT') continue;
      const rs = count(s);
      list.push({ id: s.referral_source_id, name: s.label.toUpperCase(), type: `ATTRIBUTION SOURCE · ${s.kind.replace(/_/g, ' ')}`, planned: false, img: s.kind === 'CLIENT_REFERRAL' ? 'door' : s.kind === 'SITE00' ? 'tall' : 'inv', source: s, refs: rs.length, conv: rs.filter((r) => r.a.payment_state === 'PAID').length });
    }
    return list;
  }, [sources, attributed]);

  const activityEvents = useMemo(() => referralActivityFromRegistry(artifacts, sources), [artifacts, sources]);
  const selectedEvent = activityEvents.find((e) => e.id === selectedEventId) ?? activityEvents[0] ?? null;
  const partner = partners.find((p) => p.id === partnerId) ?? (docked && section === 'PARTNERS' ? partners[0] : null) ?? null;
  const detail = partners.find((p) => p.id === detailId) ?? null;

  const ro = (id: ReferralOverlayId, extra: Record<string, unknown> = {}) =>
    openOverlay(id, { partner_label: (detail ?? partner)?.name ?? AIO_PARTNER_DISPLAY.legalName, partner_kind: (detail ?? partner)?.source?.kind ?? 'AIO', planned: (detail ?? partner)?.planned ?? true, ...extra });

  const go = (s: RfSection) => {
    setSection(s);
    setDetailId(null);
    setTraceId(null);
    setPartnerSheet(false);
  };

  const pickPartner = (p: Partner) => {
    setPartnerId(p.id);
    if (!docked) setPartnerSheet(true);
  };

  const noLedger = '—';
  const signalsOverview = [
    { label: 'ACTIVE PARTNERS', value: '0', def: 'NO PARTNER RECORD IS ACTIVE · AIO PLANNED', icon: 'users' },
    { label: 'REFERRED LEADS', value: loading ? '—' : String(referred.length), def: 'ATTRIBUTED ARTIFACTS · NOT DIRECT', icon: 'document' },
    { label: 'PAID REFERRED CLIENTS', value: loading ? '—' : String(converted.length), def: 'PAYMENT STATE PAID · EVIDENCE NOT LINKED', icon: 'complete' },
    { label: 'PENDING APPROVAL', value: noLedger, def: 'NO COMMISSION LEDGER (G-RF)', icon: 'time' },
    { label: 'TOTAL PAID OUT', value: noLedger, def: 'NO PAYOUT RECORD (G-RF)', icon: 'receipt' },
  ];

  const policyPanel = (
    <WsPanel title="COMMISSION POLICY · FOUNDER LOCKED" right={<WsChip kind="policy" icon="lock">RECORD-ONLY</WsChip>}>
      <WsKv rows={POLICY_LINES.map(([k, v]) => [k, v])} />
    </WsPanel>
  );

  const attributionLedger = (rows: AttributedRow[], select?: (r: AttributedRow) => void) => (
    <Ledger
      label="ATTRIBUTION LEDGER"
      rows={rows}
      rowKey={(r) => r.a.artifact_id}
      sel={traceId}
      onSelect={select}
      mobile={(r) => [<TwoLine key="a" a={r.name} b={`${r.partner} · ${age(r.a.last_activity_at ?? r.a.created_at)}`} />, <AttrCs key="b" r={r} />]}
      cols={[
        { h: 'CLIENT', t: 'minmax(140px,1.2fr)', d: 'minmax(150px,1.2fr)', r: (r) => <TwoLine a={r.name} b={formatReferralActivityTime(r.a.created_at).toUpperCase()} /> },
        { h: 'SOURCE', t: 'minmax(130px,1fr)', d: 'minmax(150px,1fr)', r: (r) => <span className="ws-body">{r.partner}</span> },
        { h: 'INTAKE', t: null, d: '120px', r: (r) => <span className="ws-body">{(r.a.intake_state ?? 'NOT_STARTED').replace(/_/g, ' ')}</span> },
        { h: 'CONVERSION', t: null, d: 'minmax(120px,1fr)', r: (r) => <span className="ws-body ws-2l">{readLifecycle(r.a).label}</span> },
        { h: 'COMMISSION', t: 'minmax(150px,auto)', d: 'minmax(150px,auto)', r: (r) => <AttrCs r={r} /> },
      ]}
    />
  );

  const emptyLedger = (what: string) => (
    <WsEmpty label={`NO ${what} ENTRIES`} title={`THE ${what} LEDGER IS NOT BUILT YET`}>
      NO {what} IS CREATED, APPROVED OR PAID FROM THIS SCREEN UNTIL THE LEDGER BACKEND (G-RF) AND STRIPE PAYMENT EVIDENCE EXIST. NOTHING HERE IS PAYABLE.
    </WsEmpty>
  );

  let head: ReactNode;
  let body: ReactNode;
  const tag = <RfTag>REAL REGISTRY DATA · COMMISSION + PAYOUT LEDGERS NOT IMPLEMENTED (G-RF)</RfTag>;

  if (error && !artifacts.length) {
    head = <RfHead title="REFERRALS" sub="PARTNERS · ATTRIBUTION · COMMISSIONS · PAYOUTS" />;
    body = (
      <>
        <WsBanner tone="red" icon="warning">
          REFERRAL DATA COULD NOT LOAD. NO FINANCIAL ACTION IS AVAILABLE UNTIL IT REFRESHES.
        </WsBanner>
        <div className="ws-btn-row" style={{ marginTop: 12 }}>
          <WsButton icon="retry" onClick={load}>
            RETRY
          </WsButton>
        </div>
        <WsTechDetail action="list (referral_sources)" message={error} open onOpen={() => openOverlay('OL-20', { action: 'list (referral_sources)', message: error, status: 'REQUEST FAILED' })} />
      </>
    );
  } else if (detail) {
    head = null;
    body = <PartnerDetail p={detail} attributed={attributed.filter((r) => (detail.source ? r.source?.referral_source_id === detail.source.referral_source_id : false))} onBack={() => setDetailId(null)} ro={ro} ledger={attributionLedger} emptyLedger={emptyLedger} policy={policyPanel} />;
  } else if (section === 'OVERVIEW') {
    head = (
      <RfHead
        title="REFERRALS"
        sub="PARTNERS · ATTRIBUTION · COMMISSIONS · PAYOUTS"
        tag={tag}
        acts={
          <>
            <WsButton tone="out" size="sm" icon="qr" onClick={() => go('CARD STUDIO')}>
              CARD STUDIO
            </WsButton>
            <WsButton size="sm" icon="add" onClick={() => ro('RO-01')}>
              NEW PARTNER
            </WsButton>
          </>
        }
      />
    );
    body = (
      <div className="rfo">
        <div className="rfo__sig">
          <RfSignals items={signalsOverview} />
        </div>
        <section className="ws-focus rfo__focus" style={{ boxShadow: 'inset 3px 0 0 var(--ws-ink)' }}>
          <div className="ws-focus__k">
            <WsStatus kind="idle">NO COMMISSION AWAITS APPROVAL</WsStatus>
          </div>
          <p className="ws-statement" style={{ fontSize: 22 }}>
            AIO IS PLANNED · NOT ACTIVE
            <i className="ws-period" />
          </p>
          <WsButton size="sm" arrow onClick={() => setDetailId('aio')}>
            OPEN AIO
          </WsButton>
        </section>
        <WsPanel
          title="PARTNERS"
          className="rfo__partners"
          flush
          right={
            <button type="button" className="ws-link-quiet" onClick={() => go('PARTNERS')}>
              VIEW ALL · {partners.length} →
            </button>
          }
        >
          <div className="prt" role="table" aria-label="PARTNERS PREVIEW">
            {partners.slice(0, 4).map((p) => (
              <div key={p.id} className="prt__r" role="row" tabIndex={0} onClick={() => setDetailId(p.id)} onKeyDown={(e) => e.key === 'Enter' && setDetailId(p.id)}>
                <span className="prt__who">
                  <PartnerThumb name={p.name} img={p.img} />
                  <span className="ws-who">
                    <b>{p.name}</b>
                    <span>{p.type}</span>
                    <span style={{ marginTop: 2 }}>{P_STATUS(p)}</span>
                  </span>
                </span>
                <span className="prt__n">
                  <span className="ws-num">{p.refs}</span>
                  <span className="ws-label">REFERRALS</span>
                </span>
                <span className="c-chev">
                  <WsIcon name="next" />
                </span>
              </div>
            ))}
          </div>
        </WsPanel>
        <WsPanel
          title="COMMISSIONS / PAYOUTS"
          className="rfo__money"
          right={
            <button type="button" className="ws-link-quiet" onClick={() => go('COMMISSIONS')}>
              LEDGER →
            </button>
          }
        >
          <WsBanner tone="policy" icon="lock">
            NO COMMISSION OR PAYOUT IS RECORDED. FIXED FEES ONLY (${REFERRAL_COMMISSION_POLICY.standardUsd} / ${REFERRAL_COMMISSION_POLICY.establishedUsd} · CAP ${REFERRAL_COMMISSION_POLICY.universalCapUsd}) ON THE ${REFERRAL_COMMISSION_POLICY.qualifyingBasePackageUsd} BASE PACKAGE AFTER VERIFIED PAYMENT + {REFERRAL_COMMISSION_POLICY.holdDaysAfterVerifiedPayment}-DAY HOLD.
          </WsBanner>
        </WsPanel>
        <WsPanel
          title="REFERRAL ACTIVITY"
          className="rfo__act"
          right={
            <button type="button" className="ws-link-quiet" onClick={() => go('ACTIVITY')}>
              ALL →
            </button>
          }
        >
          {loading ? (
            <WsSkel w="70%" />
          ) : activityEvents.length ? (
            activityEvents.slice(0, 5).map((ev) => (
              <div key={ev.id} className="ws-act">
                <time>{age(ev.occurred_at)}</time>
                <span className="ws-mk ws-mk--client" aria-hidden="true" />
                <p>
                  {ev.subject.toUpperCase()}
                  <span>
                    {ev.verb.toUpperCase()} · {ev.partner_label.toUpperCase()}
                  </span>
                </p>
              </div>
            ))
          ) : (
            <p className="ws-meta" style={{ margin: 0 }}>
              NO ATTRIBUTED CLIENT IN THE REGISTRY YET.
            </p>
          )}
        </WsPanel>
        <section className="ws-panel rfo__cards">
          <div className="ws-panel__h">
            <h2 className="ws-h3">CARD STUDIO</h2>
            <span className="ws-meta">SHARE · PRINT (GATED)</span>
          </div>
          <div className="ws-panel__b" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 14, alignItems: 'center' }}>
            <FounderCard side="back" partner={CARD_STUDIO_COPY.partnerName} width={260} />
            <div className="ws-btn-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <WsButton size="sm" icon="qr" onClick={() => go('CARD STUDIO')}>
                OPEN STUDIO
              </WsButton>
              <WsButton tone="out" size="sm" icon="link" onClick={() => ro('RO-06')}>
                LINK
              </WsButton>
              <WsButton tone="out" size="sm" icon="payment" onClick={() => go('PAYOUTS')}>
                PAYOUTS
              </WsButton>
            </div>
          </div>
        </section>
      </div>
    );
  } else if (section === 'PARTNERS') {
    head = (
      <RfHead
        title="PARTNERS"
        sub={`${partners.length} RECORDS · 0 ACTIVE · 1 PLANNED (AIO)`}
        tag={tag}
        acts={
          <WsButton size="sm" icon="add" onClick={() => ro('RO-01')}>
            NEW PARTNER
          </WsButton>
        }
      />
    );
    body = <PartnersRegistry partners={partners} sel={partner?.id ?? null} onPick={pickPartner} onOpen={(p) => setDetailId(p.id)} loading={loading} />;
  } else if (section === 'ATTRIBUTION') {
    const tr = attributed.find((r) => r.a.artifact_id === traceId) ?? null;
    head = <RfHead title={tr ? 'SOURCE TRACE' : 'ATTRIBUTION'} sub={tr ? `${tr.name} · ${tr.partner}` : 'WHO REFERRED WHOM · BY WHICH SOURCE · WITH WHAT RESULT'} tag={tag} />;
    body = tr ? (
      <SourceTrace r={tr} onBack={() => setTraceId(null)} ro={ro} />
    ) : (
      <>
        <WsBanner icon="info">EVERY ROW LINKS TO THE CANONICAL CLIENT RECORD IN FOUNDATIONS. ATTRIBUTION ADDS SOURCE METADATA; IT NEVER COPIES INTAKE, QUOTES OR PAYMENTS.</WsBanner>
        <div style={{ marginTop: 'var(--ws-gap)' }}>
          <RfSignals
            items={[
              { label: 'ATTRIBUTED', value: String(attributed.length), def: 'ARTIFACTS WITH A REFERRAL SOURCE', icon: 'document' },
              { label: 'REFERRED', value: String(referred.length), def: 'SOURCE IS NOT DIRECT', icon: 'share' },
              { label: 'PAID', value: String(converted.length), def: 'PAYMENT STATE PAID', icon: 'complete' },
              { label: 'OPEN EXCEPTIONS', value: noLedger, def: 'EXCEPTION QUEUE NOT BUILT (G-RF)', icon: 'warning' },
            ]}
            cls="rf-signals--4"
          />
        </div>
        <div className="ws-btn-row" style={{ margin: 'var(--ws-gap) 0 12px', justifyContent: 'space-between' }}>
          <span className="ws-meta">SELECT A ROW FOR ITS SOURCE TRACE</span>
          <span className="ws-btn-row">
            <WsButton tone="out" size="sm" icon="warning" onClick={() => ro('RO-18')}>
              EXCEPTION
            </WsButton>
            <WsButton tone="out" size="sm" icon="edit" onClick={() => ro('RO-19')}>
              MANUAL CORRECTION
            </WsButton>
          </span>
        </div>
        {loading ? <WsSkel w="80%" /> : attributed.length ? attributionLedger(attributed, (r) => setTraceId(r.a.artifact_id)) : <WsEmpty label="NO ATTRIBUTION" title="NO ATTRIBUTED CLIENT YET">A CLIENT IS ATTRIBUTED WHEN A FOUNDATION IS CREATED WITH A REFERRAL SOURCE.</WsEmpty>}
      </>
    );
  } else if (section === 'COMMISSIONS') {
    head = <RfHead title="COMMISSIONS" sub="ELIGIBILITY · APPROVAL · ADJUSTMENTS · NEVER EQUAL TO PAID" tag={tag} />;
    body = (
      <div className="ifw-stack">
        <RfSignals
          cls="rf-signals--4"
          items={[
            { label: 'PENDING APPROVAL', value: noLedger, def: 'NO LEDGER (G-RF)', icon: 'time' },
            { label: 'APPROVED UNPAID', value: noLedger, def: 'NO LEDGER (G-RF)', icon: 'payment' },
            { label: 'TOTAL PAID OUT', value: noLedger, def: 'NO PAYOUT RECORD', icon: 'receipt' },
            { label: 'REVERSED / ADJUSTED', value: noLedger, def: 'NO LEDGER (G-RF)', icon: 'refund' },
          ]}
        />
        <div className="ws-btn-row" style={{ justifyContent: 'space-between' }}>
          <WsTabs
            label="COMMISSION STATES"
            value="ALL"
            onChange={() => undefined}
            items={[
              { id: 'ALL', label: 'ALL', count: 0 },
              { id: 'PENDING', label: 'PENDING APPROVAL' },
              { id: 'APPROVED', label: 'APPROVED' },
              { id: 'PAID', label: 'PAID' },
            ]}
          />
          <span className="ws-btn-row">
            <WsButton tone="out" size="sm" icon="edit" onClick={() => ro('RO-05')}>
              TERMS
            </WsButton>
            <WsButton tone="out" size="sm" onClick={() => ro('RO-11')}>
              DETAIL
            </WsButton>
            <WsButton tone="out" size="sm" onClick={() => ro('RO-12')}>
              APPROVE…
            </WsButton>
            <WsButton tone="out" size="sm" onClick={() => ro('RO-13')}>
              ADJUST…
            </WsButton>
          </span>
        </div>
        {emptyLedger('COMMISSION')}
        {policyPanel}
      </div>
    );
  } else if (section === 'PAYOUTS') {
    head = <RfHead title="PAYOUTS" sub="RECORDED PAYMENTS TO PARTNERS · APPROVE ≠ PAID" tag={tag} />;
    body = (
      <div className="ifw-stack">
        <WsBanner tone="policy" icon="lock">
          SITE 00 HAS NO CONNECTED PAYOUT PROVIDER. PAYOUTS ARE PAID OUTSIDE THE PRODUCT (MANUAL, MONTHLY ON THE {REFERRAL_COMMISSION_POLICY.payoutTargetDayOfMonth}TH) AND RECORDED HERE WITH A REFERENCE. “SEND PAYMENT” DOES NOT EXIST.
        </WsBanner>
        <RfSignals
          cls="rf-signals--4"
          items={[
            { label: 'APPROVED UNPAID', value: noLedger, def: 'NO LEDGER (G-RF)', icon: 'payment' },
            { label: 'TOTAL PAID OUT', value: noLedger, def: 'NO PAYOUT RECORD', icon: 'receipt' },
            { label: 'REVERSED', value: noLedger, def: 'NO PAYOUT RECORD', icon: 'refund' },
            { label: 'NEXT TARGET', value: `${REFERRAL_COMMISSION_POLICY.payoutTargetDayOfMonth}TH`, def: 'MONTHLY TARGET · NOTHING SCHEDULED', icon: 'calendar' },
          ]}
        />
        <div className="ws-btn-row" style={{ justifyContent: 'flex-end' }}>
          <WsButton tone="out" size="sm" onClick={() => ro('RO-14')}>
            PAYOUT DETAIL
          </WsButton>
          <WsButton tone="out" size="sm" onClick={() => ro('RO-15')}>
            RECORD PAYMENT…
          </WsButton>
          <WsButton tone="out" size="sm" onClick={() => ro('RO-16')}>
            CONFIRM PAYMENT…
          </WsButton>
          <WsButton tone="out" size="sm" onClick={() => ro('RO-17')}>
            REVERSAL…
          </WsButton>
        </div>
        {emptyLedger('PAYOUT')}
      </div>
    );
  } else if (section === 'CARD STUDIO') {
    head = <RfHead title="CARD STUDIO" sub="PARTNER REFERRAL CARDS · CONNECTED TO ATTRIBUTION, NOT DECORATIVE" img="door" tag={<RfTag>FOUNDER-SELECTED DESIGN · NOT PRINT-APPROVED</RfTag>} />;
    body = <CardStudio partners={partners} ro={ro} />;
  } else {
    head = <RfHead title="ACTIVITY" sub="RECORDED EVENTS ONLY · NEVER INFERRED" tag={tag} />;
    const items: TimelineItem[] = activityEvents.map((ev) => ({ id: ev.id, time: formatReferralActivityTime(ev.occurred_at).toUpperCase(), title: ev.verb.toUpperCase(), sub: `${ev.subject.toUpperCase()} · ${ev.partner_label.toUpperCase()}`, actor: 'REGISTRY', tone: 'done' }));
    body = (
      <section className="ifw-referral-activity" aria-busy={loading}>
        <WsBanner tone="policy" icon="lock">
          THE PARTNER COMMERCE EVENT API (<span className="ws-data">GET /api/admin/referrals/events</span>) IS NOT DEPLOYED. THIS TIMELINE SHOWS PERSISTED ATTRIBUTION SNAPSHOTS FROM THE FOUNDATION REGISTRY ONLY — NO FABRICATED COMMISSIONS OR PAYOUTS.
        </WsBanner>
        <div className="pd" style={{ marginTop: 'var(--ws-gap)' }}>
          <div>
            <WsPanel title="TIMELINE" className="ifw-activity-stream" right={<span className="ws-meta">{activityEvents.length} EVENTS</span>}>
              {loading ? <WsSkel w="70%" /> : items.length ? <Timeline items={items} onSelect={setSelectedEventId} sel={selectedEvent?.id ?? null} /> : <p className="ws-meta" style={{ margin: 0 }}>NO ATTRIBUTED CLIENTS IN THE REGISTRY YET.</p>}
            </WsPanel>
          </div>
          <div>
            <WsPanel title="EVENT DETAIL">
              {selectedEvent ? (
                <WsKv
                  rows={[
                    ['EVENT', selectedEvent.category.toUpperCase()],
                    ['AT', formatReferralActivityTime(selectedEvent.occurred_at).toUpperCase()],
                    ['ACTOR', 'REGISTRY SNAPSHOT'],
                    ['CLIENT', selectedEvent.subject.toUpperCase()],
                    ['PARTNER / SOURCE', selectedEvent.partner_label.toUpperCase()],
                    ['ARTIFACT', selectedEvent.artifact_id, true],
                  ]}
                />
              ) : (
                <p className="ws-meta" style={{ margin: 0 }}>
                  SELECT AN EVENT
                </p>
              )}
              {selectedEvent ? (
                <div style={{ marginTop: 12 }}>
                  <WsLinkButton tone="out" size="sm" icon="external" to={IDNTY_FOUNDER_WORKSPACE_ROUTES.client(selectedEvent.artifact_id)}>
                    CLIENT RECORD
                  </WsLinkButton>
                </div>
              ) : null}
            </WsPanel>
          </div>
        </div>
      </section>
    );
  }

  const inspector =
    section === 'PARTNERS' && !detail && partner && (docked || partnerSheet) ? (
      <PartnerInspector p={partner} onClose={docked ? undefined : () => setPartnerSheet(false)} onOpen={() => setDetailId(partner.id)} ro={ro} />
    ) : null;

  return (
    <FounderWorkspacePageFrame destination="referrals" crumb={detail ? ['PARTNERS', detail.name] : section === 'OVERVIEW' ? [] : [section]} header={<></>} inspector={inspector} onInspectorClose={() => setPartnerSheet(false)}>
      {head}
      {detail ? null : <RfSecNav value={section} onChange={go} counts={{ PARTNERS: partners.length, ATTRIBUTION: attributed.length }} />}
      {body}
      <details className="ws-panel" style={{ marginTop: 'var(--ws-gap)' }}>
        <summary className="ws-panel__h ws-label" style={{ cursor: 'pointer', listStyle: 'none' }}>
          REFERRAL OVERLAY FAMILIES · {REFERRAL_OVERLAY_IDS.length}
        </summary>
        <div className="ws-panel__b" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {REFERRAL_OVERLAY_IDS.map((id) => (
            <WsButton key={id} tone="ghost" size="xs" onClick={() => ro(id)}>
              {id}
            </WsButton>
          ))}
        </div>
      </details>
      <p className="ws-meta" style={{ margin: '12px 0 0' }}>
        AIO SOURCE ID <span className="ws-data">{DF_REFERRAL_SOURCE_ID.AIO}</span> · {AIO_PARTNER_DISPLAY.classification.replace(/_/g, ' ')} · AUTO-ACTIVATION {AIO_PARTNER_DISPLAY.autoActive ? 'ON' : 'OFF'}
      </p>
    </FounderWorkspacePageFrame>
  );
}

function AttrCs({ r }: { r: AttributedRow }) {
  if (r.source?.kind === 'DIRECT') return <Cs k="noteligible">DIRECT · NO PARTNER</Cs>;
  if (r.a.payment_state === 'PAID') return <Cs k="tracked">PAID · EVIDENCE NOT LINKED</Cs>;
  return <Cs k="noteligible">NOT YET ELIGIBLE</Cs>;
}

type Ro = (id: ReferralOverlayId, extra?: Record<string, unknown>) => void;

function PartnersRegistry({ partners, sel, onPick, onOpen, loading }: { partners: Partner[]; sel: string | null; onPick: (p: Partner) => void; onOpen: (p: Partner) => void; loading: boolean }) {
  const [q, setQ] = useState('');
  const [view, setView] = useState<'ALL' | 'PLANNED' | 'SOURCES'>('ALL');
  const rows = partners.filter((p) => (view === 'ALL' || (view === 'PLANNED' ? p.planned : !p.planned)) && (!q || p.name.toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <div className="reg-toolbar">
        <WsSearch value={q} onChange={setQ} placeholder="PARTNER OR SOURCE NAME" kbd="" ariaLabel="SEARCH PARTNERS" />
        <WsTabs
          label="PARTNER STATUS"
          value={view}
          onChange={setView}
          items={[
            { id: 'ALL', label: 'ALL', count: partners.length },
            { id: 'PLANNED', label: 'PLANNED', count: partners.filter((p) => p.planned).length },
            { id: 'SOURCES', label: 'SOURCES', count: partners.filter((p) => !p.planned).length || '' },
          ]}
        />
      </div>
      {loading ? (
        <div className="ws-panel" style={{ padding: 20 }}>
          <WsSkel w="70%" />
        </div>
      ) : (
        <div className="prt" role="table" aria-label="PARTNERS">
          <div className="prt__h" role="row">
            <span>PARTNER</span>
            <span className="c-type">TYPE · STATUS</span>
            <span className="c-ref" style={{ justifyContent: 'flex-end' }}>
              REFERRALS
            </span>
            <span className="c-conv" style={{ justifyContent: 'flex-end' }}>
              PAID
            </span>
            <span className="c-owed" style={{ justifyContent: 'flex-end' }}>
              OWED
            </span>
            <span className="c-card">CARD</span>
            <span />
          </div>
          {rows.map((p) => (
            <div
              key={p.id}
              className={`prt__r ${p.id === sel ? 'prt__r--sel' : ''}`.trim()}
              role="row"
              tabIndex={0}
              aria-selected={p.id === sel}
              onClick={() => onPick(p)}
              onDoubleClick={() => onOpen(p)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onOpen(p);
                if (e.key === ' ') {
                  e.preventDefault();
                  onPick(p);
                }
              }}
            >
              <span className="prt__who" role="cell">
                <PartnerThumb name={p.name} img={p.img} />
                <span className="ws-who">
                  <b>{p.name}</b>
                  <span className="c-mref">{p.type}</span>
                  <span className="c-mref" style={{ marginTop: 2 }}>
                    {P_STATUS(p)}
                  </span>
                </span>
              </span>
              <span className="c-type" role="cell">
                <span className="ws-meta">{p.type}</span>
                <span style={{ display: 'block', marginTop: 6 }}>{P_STATUS(p)}</span>
              </span>
              <span className="prt__n c-mref" role="cell">
                <span className="ws-num">{p.refs}</span>
                <span className="ws-label">REFERRALS</span>
              </span>
              <span className="c-ref ws-body" role="cell">
                {p.refs}
              </span>
              <span className="c-conv ws-body" role="cell">
                {p.conv}
              </span>
              <span className="c-owed" role="cell">
                <Amt minor={null} />
              </span>
              <span className="c-card ws-meta" role="cell" style={{ color: 'var(--ws-ink-2)' }}>
                {p.planned ? 'DESIGN ONLY' : 'NONE'}
              </span>
              <span className="c-chev" role="cell">
                <WsIcon name="next" />
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="reg-foot">
        <span className="ws-meta">OWED = APPROVED + SCHEDULED, UNPAID · NO LEDGER YET, SO NOTHING IS OWED</span>
      </div>
    </>
  );
}

function PartnerInspector({ p, onClose, onOpen, ro }: { p: Partner; onClose?: () => void; onOpen: () => void; ro: Ro }) {
  return (
    <>
      <WsInspHead kicker="PARTNER" onClose={onClose} onExpand={onOpen}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: 14, alignItems: 'center' }}>
          <span className={`rf-img rf-img--${p.img} rf-thumb`} style={{ width: 84, height: 64 }} aria-hidden="true" />
          <span className="ws-who">
            <b style={{ fontSize: 16, whiteSpace: 'normal' }}>{p.name}</b>
            <span>{p.type}</span>
            <span style={{ marginTop: 4 }}>{P_STATUS(p)}</span>
          </span>
        </div>
      </WsInspHead>
      <div className="ws-insp__body">
        <div className="msum" style={{ gridTemplateColumns: 'repeat(2,minmax(0,1fr))' }}>
          <div>
            <span className="ws-label">REFERRALS</span>
            <span className="ws-num" style={{ fontSize: 28 }}>
              {p.refs}
            </span>
          </div>
          <div>
            <span className="ws-label">PAID</span>
            <span className="ws-num" style={{ fontSize: 28 }}>
              {p.conv}
            </span>
          </div>
          <div>
            <span className="ws-label">OWED</span>
            <Amt minor={null} />
          </div>
          <div>
            <span className="ws-label">PAID OUT</span>
            <Amt minor={null} />
          </div>
        </div>
        <WsKv
          rows={[
            ['REFERRAL LINK', 'NOT ISSUED'],
            ['CARD', p.planned ? 'FOUNDER DESIGN · DESIGN ONLY' : 'NONE'],
            ['TERMS', p.planned ? `PROPOSED $${AIO_PARTNER_DISPLAY.proposedFeeUsd} · NOT ACTIVE` : 'NOT A PARTNER'],
            ['ATTRIBUTION SOURCE', p.source ? `${p.source.kind} · ${p.source.active ? 'RECORDED' : 'INACTIVE'}` : 'NONE', false],
          ]}
        />
        {p.planned ? (
          <WsBanner tone="policy" icon="lock">
            PLANNED PARTNER · NO PARTNER RECORD EXISTS YET. ACTIVATION NEEDS SIGNED TERMS AND A VERIFIED LINK — IT IS NEVER AUTOMATIC.
          </WsBanner>
        ) : null}
      </div>
      <div className="ws-insp__foot">
        <WsButton block arrow onClick={onOpen}>
          OPEN PARTNER
        </WsButton>
        <WsButton tone="out" iconOnly icon="link" ariaLabel="REFERRAL LINK" onClick={() => ro('RO-06')} />
        <span data-anchor="rowmenu">
          <WsButton tone="out" iconOnly icon="edit" ariaLabel="EDIT PARTNER" onClick={() => ro('RO-02')} />
        </span>
      </div>
    </>
  );
}

const PSECTIONS = ['OVERVIEW', 'REFERRALS', 'COMMISSIONS', 'PAYOUTS', 'CARDS', 'TERMS', 'ACTIVITY'] as const;
type PSection = (typeof PSECTIONS)[number];

function PartnerDetail({ p, attributed, onBack, ro, ledger, emptyLedger, policy }: { p: Partner; attributed: AttributedRow[]; onBack: () => void; ro: Ro; ledger: (rows: AttributedRow[]) => ReactNode; emptyLedger: (what: string) => ReactNode; policy: ReactNode }) {
  const [sec, setSec] = useState<PSection>('OVERVIEW');
  const linkBlock = (
    <WsPanel title="REFERRAL LINK + QR" right={<WsChip kind="muted">NO LINK</WsChip>}>
      <div className="qsw">
        <div className="qrsplit">
          <div style={{ display: 'grid', gap: 10, minWidth: 0 }}>
            <div className="ws-link">
              <code className="ws-data">NOT ISSUED</code>
            </div>
            <WsKv
              rows={[
                ['ROUTE', 'EXISTING /invite/:code ENTRY'],
                ['TARGET', 'DIGITAL FOUNDATION ACTIVATION'],
                ['STATUS', 'NO DURABLE LINK · G-RF'],
                ['SCAN CHECK', 'NOT DONE ON A DEVICE'],
              ]}
            />
          </div>
          <div className="qrsplit__qr">
            <QrPlaceholder seed={p.id} />
          </div>
        </div>
      </div>
    </WsPanel>
  );
  const bodies: Record<PSection, ReactNode> = {
    OVERVIEW: p.planned ? (
      <div className="pd">
        <div>
          <WsBanner tone="policy" icon="lock">
            {AIO_PARTNER_DISPLAY.legalName} IS THE FIRST PLANNED PARTNER. NO PARTNER RECORD, AGREEMENT, LINK OR PAYMENT EXISTS. AIO IS NEVER ACTIVATED AUTOMATICALLY.
          </WsBanner>
          <WsPanel title="BEFORE AIO CAN REFER CLIENTS" flush>
            <Checklist
              rows={[
                { label: 'REFERRAL POLICY LOCKED', sub: 'FIXED FEES · $50 CAP · 90-DAY WINDOW', state: 'ok', chip: ['ok', 'DONE'] },
                { label: 'PARTNER AGREEMENT IN PLACE', sub: 'OUTSIDE THE PRODUCT · FOUNDER', state: 'wait', chip: ['muted', 'OPEN'] },
                { label: 'PARTNER RECORD CREATED', sub: 'REQUIRES THE PARTNER DATA MODEL (G-RF)', state: 'wait', chip: ['muted', 'OPEN'] },
                { label: 'TERMS VERSION 1 SET', sub: `PROPOSED $${AIO_PARTNER_DISPLAY.proposedFeeUsd}`, state: 'wait', chip: ['muted', 'OPEN'] },
                { label: 'DURABLE REFERRAL LINK ISSUED', sub: 'VERIFIED PRODUCTION URL', state: 'wait', chip: ['muted', 'OPEN'] },
                { label: 'QR VERIFIED ON A REAL PHONE', sub: 'DEVICE SCAN RECORDED', state: 'wait', chip: ['muted', 'OPEN'] },
                { label: 'CARD PROOF VALIDATED', sub: 'PRINT PROOF APPROVED', state: 'wait', chip: ['muted', 'OPEN'] },
              ]}
            />
          </WsPanel>
        </div>
        <div>
          <WsPanel title="WHY AIO">
            <p className="ws-meta" style={{ margin: 0, lineHeight: 1.6, color: 'var(--ws-ink-2)' }}>
              AIO SERVES TRUCKING BUSINESSES (PERMITS, AUTHORITIES, DISPATCH, BOOKKEEPING, COMPLIANCE). ITS CLIENTS OFTEN NEED A DOMAIN, PROFESSIONAL EMAIL AND EMAIL SECURITY — THE DIGITAL FOUNDATION SCOPE.
            </p>
          </WsPanel>
          <WsPanel title="CARD PREVIEW · DESIGN ONLY">
            <div style={{ display: 'grid', placeItems: 'center', padding: '8px 0' }}>
              <FounderCard side="back" partner={p.name} width={300} />
            </div>
          </WsPanel>
        </div>
      </div>
    ) : (
      <div className="pd">
        <div>
          <div className="msum">
            <div>
              <span className="ws-label">ATTRIBUTED</span>
              <span className="ws-num" style={{ fontSize: 30 }}>
                {p.refs}
              </span>
            </div>
            <div>
              <span className="ws-label">PAID</span>
              <span className="ws-num" style={{ fontSize: 30 }}>
                {p.conv}
              </span>
            </div>
            <div>
              <span className="ws-label">PENDING · APPROVED</span>
              <Amt minor={null} />
            </div>
            <div>
              <span className="ws-label">PAID OUT</span>
              <Amt minor={null} />
            </div>
          </div>
          <WsPanel title="REFERRED CLIENTS" flush>
            {attributed.length ? ledger(attributed) : <p className="ws-meta" style={{ margin: 0, padding: 14 }}>NO CLIENT IS ATTRIBUTED TO THIS SOURCE.</p>}
          </WsPanel>
        </div>
        <div>{linkBlock}</div>
      </div>
    ),
    REFERRALS: (
      <WsPanel title={`REFERRALS · ATTRIBUTED TO ${p.name}`} flush>
        {attributed.length ? ledger(attributed) : <p className="ws-meta" style={{ margin: 0, padding: 14 }}>NO CLIENT IS ATTRIBUTED YET.</p>}
      </WsPanel>
    ),
    COMMISSIONS: emptyLedger('COMMISSION'),
    PAYOUTS: emptyLedger('PAYOUT'),
    CARDS: (
      <div className="pd">
        <div>
          <WsPanel title="PRINT STATUS" flush>
            <Checklist
              rows={[
                { label: 'CARD COPY · FOUNDER-SELECTED', state: 'ok', chip: ['ok', 'DONE'] },
                { label: 'PRODUCTION URL VERIFIED', state: 'wait', chip: ['unver', 'OPEN'] },
                { label: 'QR SCANNED ON DEVICE', state: 'wait', chip: ['unver', 'OPEN'] },
                { label: 'PROOF VALIDATED', state: 'wait', chip: ['unver', 'OPEN'] },
                { label: 'BATCH ORDERED', state: 'wait', chip: ['policy', 'NOT ALLOWED'] },
              ]}
            />
          </WsPanel>
        </div>
        <div>
          <WsPanel title="CURRENT · FOUNDER DESIGN">
            <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
              <FounderCard side="front" partner={p.name} width={320} />
              <FounderCard side="back" partner={p.name} width={320} />
              <div className="ws-btn-row">
                <span data-anchor="share">
                  <WsButton size="sm" icon="share" onClick={() => ro('RO-08')}>
                    SHARE
                  </WsButton>
                </span>
                <WsButton tone="out" size="sm" icon="download" onClick={() => ro('RO-09')}>
                  DIGITAL PNG
                </WsButton>
                <WsButton size="sm" disabled>
                  PRINT PACKAGE
                </WsButton>
              </div>
            </div>
          </WsPanel>
        </div>
      </div>
    ),
    TERMS: (
      <div className="pd">
        <div>
          {policy}
          <WsButton tone="out" size="sm" icon="edit" onClick={() => ro('RO-05')}>
            EDIT TERMS…
          </WsButton>
        </div>
        <div>
          <WsPanel title="NEVER ON THE CARD">
            <p className="ws-meta" style={{ margin: 0, lineHeight: 1.6 }}>
              COMMISSION TERMS ARE PRIVATE BETWEEN SITE 00 AND THE PARTNER. NO RATE, DOLLAR AMOUNT OR TIER EVER APPEARS ON CARDS, PUBLIC LINKS OR THE PROSPECT ENTRY.
            </p>
          </WsPanel>
        </div>
      </div>
    ),
    ACTIVITY: (
      <WsPanel title={`ACTIVITY · ${p.name}`}>
        {attributed.length ? (
          <Timeline items={attributed.map((r) => ({ id: r.a.artifact_id, time: formatReferralActivityTime(r.a.created_at).toUpperCase(), title: 'ATTRIBUTED CLIENT IN REGISTRY', sub: r.name, actor: 'REGISTRY', tone: 'done' }))} />
        ) : (
          <p className="ws-meta" style={{ margin: 0 }}>
            NO RECORDED EVENTS.
          </p>
        )}
      </WsPanel>
    ),
  };
  return (
    <>
      <header className="pd-head">
        <span className={`rf-img rf-img--${p.img}`} aria-hidden="true" />
        <div className="pd-head__name">
          <h1 className="ws-title">
            {p.name}
            <i aria-hidden="true" />
          </h1>
          <div className="pd-head__meta">
            {P_STATUS(p)}
            <span className="ws-meta">{p.type}</span>
            <span className="ws-meta">OWNER · FOUNDER</span>
          </div>
        </div>
        <div className="pd-head__acts">
          <WsButton tone="ghost" size="sm" icon="back" onClick={onBack}>
            PARTNERS
          </WsButton>
          {p.planned ? (
            <>
              <WsButton size="sm" arrow onClick={() => ro('RO-01')}>
                PREPARE RECORD
              </WsButton>
              <WsButton tone="out" size="sm" icon="send" onClick={() => ro('RO-03')}>
                INVITE
              </WsButton>
            </>
          ) : (
            <WsButton tone="out" size="sm" icon="link" onClick={() => ro('RO-06')}>
              LINK
            </WsButton>
          )}
          <WsButton tone="out" size="sm" onClick={() => ro('RO-04')}>
            STATUS…
          </WsButton>
          <WsButton tone="danger" size="sm" onClick={() => ro('RO-20')}>
            REVOKE ACCESS…
          </WsButton>
        </div>
      </header>
      <WsTabs label="PARTNER SECTIONS" value={sec} onChange={setSec} items={PSECTIONS.map((s) => ({ id: s, label: s }))} />
      <div style={{ marginTop: 'var(--ws-gap)' }}>{bodies[sec]}</div>
    </>
  );
}

function SourceTrace({ r, onBack, ro }: { r: AttributedRow; onBack: () => void; ro: Ro }) {
  const life = readLifecycle(r.a);
  const paid = r.a.payment_state === 'PAID';
  const tagOf = (k: string) => <WsChip kind={k === 'OBSERVED' ? 'ok' : k === 'ATTRIBUTED' ? 'test' : 'unver'}>{k}</WsChip>;
  const steps: TimelineItem[] = [
    { id: 'card', time: '—', title: 'CARD OR LINK HANDED OUT', sub: 'OFFLINE · NOT MEASURABLE', tone: 'gap', tag: tagOf('UNAVAILABLE') },
    { id: 'created', time: formatReferralActivityTime(r.a.created_at).toUpperCase(), title: 'ARTIFACT CREATED · ATTRIBUTION PERSISTED', sub: `SOURCE ${r.partner} · ONE ATTRIBUTION PER ARTIFACT`, tone: 'done', tag: tagOf('ATTRIBUTED') },
    { id: 'intake', time: r.a.intake_state === 'COMPLETE' ? 'DONE' : '—', title: `INTAKE ${(r.a.intake_state ?? 'NOT_STARTED').replace(/_/g, ' ')}`, sub: 'CLIENT · PERMANENT LINK (SAME ARTIFACT)', tone: r.a.intake_state === 'COMPLETE' ? 'done' : 'gap', tag: tagOf(r.a.intake_state === 'COMPLETE' ? 'OBSERVED' : 'UNAVAILABLE') },
    { id: 'pay', time: paid ? 'PAID' : '—', title: paid ? 'PAYMENT STATE PAID' : `PAYMENT ${r.a.payment_state.replace(/_/g, ' ')}`, sub: paid ? 'STRIPE EVIDENCE NOT LINKED TO A COMMISSION (G-RF)' : 'NO QUALIFYING PAYMENT', tone: paid ? 'done' : 'gap', tag: tagOf(paid ? 'OBSERVED' : 'UNAVAILABLE') },
    { id: 'comm', time: '—', title: 'COMMISSION', sub: 'NOT CREATED · LEDGER NOT IMPLEMENTED · NOTHING PAYABLE', tone: 'red', tag: tagOf('UNAVAILABLE') },
  ];
  return (
    <div className="pd">
      <div>
        <WsPanel title="FROM CARD TO PAYOUT">
          <Timeline items={steps} />
        </WsPanel>
      </div>
      <div>
        <WsPanel title="EVIDENCE CLASSES">
          <WsKv
            rows={[
              ['OBSERVED', 'RECORDED BY THE SYSTEM AT THE TIME'],
              ['ATTRIBUTED', 'DERIVED FROM OBSERVED EVENTS'],
              ['UNAVAILABLE', 'NOT MEASURED OR NOT BUILT'],
            ]}
          />
        </WsPanel>
        <WsPanel title="LINKED RECORDS">
          <WsKv
            rows={[
              ['CLIENT', r.name],
              ['STATE', life.label],
              ['ARTIFACT', r.a.artifact_id, true],
            ]}
          />
          <div className="ws-btn-row" style={{ marginTop: 12 }}>
            <WsLinkButton tone="out" size="sm" icon="external" to={IDNTY_FOUNDER_WORKSPACE_ROUTES.client(r.a.artifact_id)}>
              CLIENT RECORD
            </WsLinkButton>
            <WsButton tone="out" size="sm" onClick={() => ro('RO-18', { artifact_id: r.a.artifact_id })}>
              EXCEPTION
            </WsButton>
            <WsButton tone="ghost" size="sm" icon="back" onClick={onBack}>
              LEDGER
            </WsButton>
          </div>
        </WsPanel>
      </div>
    </div>
  );
}

function CardStudio({ partners, ro }: { partners: Partner[]; ro: Ro }) {
  const [side, setSide] = useState<'front' | 'back'>('front');
  const planned = partners.filter((p) => p.planned);
  const p = planned[0];
  const gate: Array<[string, boolean, string?]> = [
    ['CARD COPY · FOUNDER-SELECTED', true],
    ['PARTNER EXISTS + ACTIVE', false, 'AIO PLANNED'],
    ['REFERRAL LINK VALID', false, 'NOT ISSUED'],
    ['QR DESTINATION VERIFIED (PRODUCTION)', false],
    ['PRINT SPEC CONFIRMED', false],
    ['PROOF VALIDATED', false],
    ['SCAN TESTED ON A REAL PHONE', false],
  ];
  const open = gate.filter((g) => !g[1]).length;
  return (
    <div className="cs-wb">
      <section className="ws-panel cs-pick">
        <div className="ws-panel__h">
          <h2 className="ws-h3">PARTNER</h2>
        </div>
        <div>
          {planned.map((x) => (
            <div key={x.id} className="q-item q-item--sel" style={{ gridTemplateColumns: 'auto minmax(0,1fr)' }}>
              <PartnerThumb name={x.name} img={x.img} size="sm" />
              <span className="ws-who">
                <b>{x.name}</b>
                <span>DESIGN ONLY · PLANNED</span>
              </span>
            </div>
          ))}
        </div>
      </section>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ws-gap)', minWidth: 0 }}>
        <div className="ws-btn-row" style={{ justifyContent: 'space-between' }}>
          <span className="ws-btn-row">
            <span className="ws-label">PARTNER</span>
            <span className="ws-name">{p?.name ?? CARD_STUDIO_COPY.partnerName}</span>
          </span>
          <WsSegCtl
            label="CARD SIDE"
            value={side}
            onChange={setSide}
            items={[
              { id: 'front', label: 'FRONT' },
              { id: 'back', label: 'BACK' },
            ]}
          />
        </div>
        <div className="cs-stage">
          <FounderCard side={side} partner={p?.name ?? CARD_STUDIO_COPY.partnerName} width={520} />
          <span className="ws-meta" style={{ textAlign: 'center' }}>
            FOUNDER-APPROVED ORIGINAL ARTWORK · REFERRAL LINK NOT ISSUED · QR ON BACK IMAGE UNVERIFIED · NOT FOR DISTRIBUTION
          </span>
        </div>
        <div className="tpl" role="radiogroup" aria-label="CARD SIDES">
          {(['front', 'back'] as const).map((s) => (
            <button key={s} type="button" role="radio" aria-checked={side === s} className={`tpl__i ${side === s ? 'tpl__i--on' : ''}`.trim()} onClick={() => setSide(s)}>
              <FounderCard side={s} partner={p?.name ?? CARD_STUDIO_COPY.partnerName} width={220} />
              <span className="ws-label" style={{ color: 'var(--ws-ink)' }}>
                {s === 'front' ? `FRONT · ${CARD_STUDIO_COPY.frontLine1} ${CARD_STUDIO_COPY.frontLine2}` : `BACK · ${CARD_STUDIO_COPY.backLine}`}
              </span>
            </button>
          ))}
        </div>
      </div>
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ws-gap)', minWidth: 0 }}>
        <WsPanel title="REFERRAL LINK" right={<WsChip kind="muted">MISSING</WsChip>}>
          <WsKv
            rows={[
              ['URL', 'NOT ISSUED'],
              ['TARGET', 'DIGITAL FOUNDATION ENTRY'],
              ['ROUTE', 'EXISTING /invite/:code'],
              ['QR PAYLOAD', 'HTTPS · PUBLIC CODE ONLY · NO SECRETS'],
            ]}
          />
        </WsPanel>
        <WsPanel title="FINISH">
          <div className="ifw-finish">
            <span className="ifw-finish__sw" aria-hidden="true" />
            <span>
              <span className="ws-name" style={{ display: 'block' }}>
                REFLECTIVE RED METALLIC FOIL
              </span>
              <span className="ws-meta">ON SELECTED RED TYPOGRAPHY + ACCENTS · PREFERRED · NOT PROOFED</span>
            </span>
          </div>
        </WsPanel>
        <WsPanel title="PRINT GATE" flush right={<WsChip kind="req">BLOCKED · {open} OPEN</WsChip>}>
          <Checklist rows={gate.map(([label, ok, sub]) => ({ label, sub, state: ok ? 'ok' : 'wait', chip: ok ? ['ok', 'PASS'] : ['unver', 'OPEN'] }))} />
        </WsPanel>
        <div className="ws-btn-row">
          <span data-anchor="share">
            <WsButton icon="share" onClick={() => ro('RO-08')}>
              SHARE CARD
            </WsButton>
          </span>
          <WsButton tone="out" icon="download" onClick={() => ro('RO-09')}>
            DIGITAL PNG
          </WsButton>
          <WsButton tone="out" icon="link" onClick={() => ro('RO-06')}>
            LINK
          </WsButton>
          <WsButton tone="out" icon="qr" onClick={() => ro('RO-07')}>
            QR CHECK
          </WsButton>
          <WsButton tone="out" icon="lock" onClick={() => ro('RO-10')}>
            PRINT PROOF
          </WsButton>
        </div>
        <p className="ws-meta" style={{ margin: 0 }}>
          NO PRODUCTION QR WITHOUT A VERIFIED URL · NO PRINT-READY STATUS WITHOUT A VALIDATED PROOF · NO PHYSICAL PRINT ORDER FROM THIS STUDIO. <WsGap id="G-RF" />
        </p>
      </aside>
    </div>
  );
}
