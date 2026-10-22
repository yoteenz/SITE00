import { useState, type ReactNode } from 'react';
import { AIO_PARTNER_DISPLAY, CARD_STUDIO_COPY, REFERRAL_COMMISSION_POLICY } from '../../config/referralPolicy';
import { OVERLAY_META, type ReferralOverlayId } from '../../overlay/overlayRegistry';
import { Amt, Checklist, FounderCard, QrPlaceholder } from '../../referrals/rfKit';
import { WsBanner, WsCheck, WsChoice, WsChoiceGroup, WsField, WsGap, WsInput, WsInspHead, WsKv, WsTextarea } from '../../shell/wsKit';
import '../../styles/ifw-referrals.css';
import { OverlayFormShell } from './OverlayFormShell';

type Props = {
  id: ReferralOverlayId;
  payload?: Record<string, unknown>;
  onClose: () => void;
  markDirty: (dirty: boolean) => void;
};

const P = REFERRAL_COMMISSION_POLICY;
const BACKEND = 'PARTNER RECORDS, LINKS AND THE COMMISSION LEDGER ARE NOT BUILT (G-RF). NOTHING IS SAVED FROM THIS DIALOG.';
const POLICY_PAY = `FIXED FEES ONLY ($${P.standardUsd} / $${P.establishedUsd} · CAP $${P.universalCapUsd}) ON THE $${P.qualifyingBasePackageUsd} BASE PACKAGE, AFTER VERIFIED STRIPE PAYMENT + ${P.holdDaysAfterVerifiedPayment}-DAY HOLD. PAYOUTS ARE MANUAL AND EXTERNAL; THIS PRODUCT ONLY RECORDS THEM.`;

/** The reason a referral family cannot act today: policy gate first, then the missing backend. */
export function referralGate(id: ReferralOverlayId): string | undefined {
  const meta = OVERLAY_META[id];
  if (meta.blockedByPolicy) return `${POLICY_PAY} NO PAYMENT EVIDENCE IS LINKED YET (G-RF).`;
  if (meta.blockedByBackend) return BACKEND;
  return undefined;
}

/**
 * RO-01 … RO-20 — OPUS3 referral overlay families in the OPUS2 containers. Each keeps its id, trigger and
 * content; every mutation is gated (policy or missing backend) and shown disabled, never hidden and never faked.
 * Financial confirmations ignore scrim clicks (host `scrimLocked`).
 */
export function ReferralOverlayBody({ id, payload, onClose, markDirty }: Props) {
  const partner = String(payload?.partner_label ?? CARD_STUDIO_COPY.partnerName).toUpperCase();
  const planned = payload?.planned !== false;
  const gate = referralGate(id) ?? 'NO VERIFIED REFERRAL LINK EXISTS YET · NOTHING TO COPY, SHARE OR EXPORT.';
  const [note, setNote] = useState('');
  const [tick, setTick] = useState(false);
  const [choice, setChoice] = useState(0);
  const dirty = (v: string) => {
    setNote(v);
    markDirty(v.trim() !== '');
  };

  const shell = (primary: string, body: ReactNode, opts: { tone?: '' | 'danger'; extra?: ReactNode; footNote?: ReactNode; noPrimary?: boolean } = {}) => (
    <OverlayFormShell id={id} primaryLabel={primary} primaryTone={opts.tone ?? ''} blockedReason={gate} primaryDisabled noPrimary={opts.noPrimary} extra={opts.extra} footNote={opts.footNote} secondaryLabel={opts.noPrimary ? 'Close' : 'Cancel'} onClose={onClose}>
      {body}
    </OverlayFormShell>
  );

  switch (id) {
    case 'RO-01':
      return shell(
        'Create draft',
        <>
          <div className="ifw-grid2">
            <WsField label="LEGAL NAME" req>
              <WsInput value={note} onChange={dirty} ariaLabel="LEGAL NAME" placeholder={AIO_PARTNER_DISPLAY.legalName} />
            </WsField>
            <WsField label="DISPLAY NAME" opt>
              <WsInput value="" onChange={() => undefined} readOnly ariaLabel="DISPLAY NAME" placeholder="AIO" />
            </WsField>
          </div>
          <div>
            <div className="ws-label" style={{ marginBottom: 10 }}>
              PARTNER TYPE · FEE TIER
            </div>
            <WsChoiceGroup label="PARTNER TYPE">
              <WsChoice on={choice === 0} title={`STANDARD · $${P.standardUsd}`} desc="PER QUALIFYING CLIENT" onSelect={() => setChoice(0)} />
              <WsChoice on={choice === 1} title={`ESTABLISHED · $${P.establishedUsd}`} desc="PROVEN REFERRER" onSelect={() => setChoice(1)} />
              <WsChoice on={choice === 2} title={`STRATEGIC · UP TO $${P.strategicMaxUsd}`} desc={`ABSOLUTE CAP $${P.universalCapUsd} · NO PERCENTAGES`} onSelect={() => setChoice(2)} />
            </WsChoiceGroup>
          </div>
          <WsBanner tone="policy" icon="lock">
            CREATES A DRAFT RECORD ONLY. NO LINK, CARD OR PORTAL ACCESS UNTIL TERMS ARE SIGNED AND THE PARTNER IS ACTIVATED BY THE FOUNDER — NEVER AUTOMATICALLY.
          </WsBanner>
        </>,
        { footNote: 'STATUS AFTER SAVE · DRAFT' },
      );

    case 'RO-02':
      return shell(
        'Save changes',
        <>
          <WsKv rows={[['PARTNER', partner], ['STATUS', planned ? 'PLANNED · NO RECORD' : 'ATTRIBUTION SOURCE']]} />
          <WsField label="NOTES · FOUNDER ONLY" opt>
            <WsTextarea value={note} onChange={dirty} rows={3} ariaLabel="NOTES" />
          </WsField>
          <p className="ws-meta">EDITS ARE AUDITED. NAME CHANGES NEVER CHANGE THE REFERRAL CODE OR PRINTED CARDS.</p>
        </>,
      );

    case 'RO-03':
      return shell(
        'Send invitation',
        <>
          <WsKv rows={[['PARTNER', partner], ['ACCESS', 'PARTNER PORTAL · NOT BUILT']]} />
          <WsCheck on={tick} onToggle={setTick} hint="EMAIL SENDING IS DISABLED BY POLICY ON STAGING. EVERY SEND NEEDS THIS TICK.">
            I APPROVE SENDING THIS INVITATION
          </WsCheck>
          <WsBanner icon="info">PORTAL ACCESS IS SEPARATE FROM THE REFERRAL LINK. A LINK OR QR NEVER LOGS ANYONE IN. NO PARTNER AUTHENTICATION FLOW IS INTRODUCED.</WsBanner>
        </>,
      );

    case 'RO-04':
      return shell(
        'Change status',
        <>
          <WsChoiceGroup label="PARTNER STATUS">
            <WsChoice on={choice === 0} title="ACTIVE" desc="LINKS RESOLVE · NEW REFERRALS ATTRIBUTE" onSelect={() => setChoice(0)} />
            <WsChoice on={choice === 1} title="SUSPENDED" desc="LINKS PAUSE · PROSPECTS CAN STILL BEGIN UNATTRIBUTED" onSelect={() => setChoice(1)} />
            <WsChoice on={choice === 2} title="ARCHIVED" desc="READ-ONLY · HISTORY KEPT" onSelect={() => setChoice(2)} />
          </WsChoiceGroup>
          <WsField label="REASON" req>
            <WsTextarea value={note} onChange={dirty} rows={3} ariaLabel="REASON" />
          </WsField>
          {planned ? <WsBanner tone="policy" icon="lock">{AIO_PARTNER_DISPLAY.legalName} IS PLANNED · AUTO-ACTIVATION IS OFF AND STAYS OFF.</WsBanner> : null}
        </>,
        { tone: 'danger' },
      );

    case 'RO-05':
      return shell(
        'Save terms',
        <>
          <WsBanner tone="policy" icon="lock">
            TERMS ARE FOUNDER-LOCKED: FIXED DOLLAR FEES ONLY, NEVER A PERCENTAGE. SAVING WOULD CREATE A NEW VERSION; PAST REFERRALS KEEP THEIR VERSION.
          </WsBanner>
          <WsKv
            rows={[
              ['STANDARD', `$${P.standardUsd}`],
              ['ESTABLISHED', `$${P.establishedUsd}`],
              ['STRATEGIC MAX', `$${P.strategicMaxUsd}`],
              ['AIO PROPOSED', `$${P.aioProposedUsd} · NOT ACTIVE`],
              ['CAP', `$${P.universalCapUsd}`],
              ['BASIS', `$${P.qualifyingBasePackageUsd} BASE PACKAGE ONLY · NO ADD-ONS`],
              ['WINDOW · HOLD', `${P.attributionWindowDays} DAYS · ${P.holdDaysAfterVerifiedPayment} DAYS`],
            ]}
          />
          <span className="ws-hint">AMOUNTS ARE STORED AS INTEGER MINOR UNITS (CENTS) · NEVER FLOATING POINT</span>
        </>,
      );

    case 'RO-06':
      return shell(
        'Copy',
        <>
          <div className="ws-link">
            <code className="ws-data">NOT ISSUED</code>
          </div>
          <WsKv
            rows={[
              ['RESOLVES TO', 'DIGITAL FOUNDATION ACTIVATION'],
              ['PARTNER', partner],
              ['STATUS', 'NO DURABLE LINK'],
              ['ROUTE', 'EXISTING /invite/:code'],
            ]}
          />
          <p className="ws-meta">THE PUBLIC CODE WILL CARRY NO PARTNER ID, NO TERMS AND NO SECRET. NO PRODUCTION QR IS GENERATED WITHOUT A VERIFIED URL.</p>
        </>,
      );

    case 'RO-07':
      return shell(
        'Record device scan',
        <div className="qsw">
          <div className="qrsplit qrsplit--l">
            <div className="qrsplit__qr">
              <QrPlaceholder seed={partner} />
            </div>
            <Checklist
              rows={[
                { label: 'URL IS HTTPS', state: 'wait', chip: ['unver', 'NOT RUN'] },
                { label: `CODE RESOLVES TO ${partner}`, state: 'wait', chip: ['unver', 'NO LINK'] },
                { label: 'TARGET IS DIGITAL FOUNDATION ENTRY', state: 'wait', chip: ['unver', 'NOT RUN'] },
                { label: 'PRODUCTION ORIGIN (NOT STAGING)', state: 'no', chip: ['req', 'NOT VERIFIED'] },
                { label: 'NO ADMIN PATH · NO SECRET IN PAYLOAD', state: 'wait', chip: ['unver', 'NOT RUN'] },
                { label: 'SCANNED ON A REAL PHONE', state: 'wait', chip: ['unver', 'NOT RECORDED'] },
              ]}
            />
          </div>
        </div>,
      );

    case 'RO-08':
      return shell(
        'Share',
        <>
          <div style={{ display: 'grid', placeItems: 'center' }}>
            <FounderCard side="back" partner={partner} width={300} />
          </div>
          <p className="ws-meta">SHARING NEEDS A VERIFIED REFERRAL LINK. THE CARD ABOVE IS A DESIGN PREVIEW WITH A NON-SCANNABLE QR.</p>
        </>,
      );

    case 'RO-09':
      return shell(
        'Export PNG',
        <>
          <WsChoiceGroup label="EXPORT">
            <WsChoice on={choice === 0} title="DIGITAL · PNG 1050 × 600" desc="NEEDS A VERIFIED LINK · BLOCKED" onSelect={() => setChoice(0)} />
            <WsChoice on={choice === 1} title="PRINT PACKAGE · PDF/X, CMYK, BLEED" desc="BLOCKED · PRINT GATE OPEN" onSelect={() => setChoice(1)} />
          </WsChoiceGroup>
          <Checklist
            rows={[
              { label: 'CARD COPY · FOUNDER-SELECTED', state: 'ok', chip: ['ok', 'DONE'] },
              { label: 'PRODUCTION URL VERIFIED', state: 'wait', chip: ['unver', 'OPEN'] },
              { label: 'DEVICE SCAN RECORDED', state: 'wait', chip: ['unver', 'OPEN'] },
              { label: 'PROOF VALIDATED', state: 'wait', chip: ['unver', 'OPEN'] },
            ]}
          />
        </>,
      );

    case 'RO-10':
      return shell(
        'Approve proof',
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            <FounderCard side="front" partner={partner} width={340} />
            <FounderCard side="back" partner={partner} width={340} />
          </div>
          <WsKv
            rows={[
              ['FINISH', 'REFLECTIVE RED METALLIC FOIL · RED TYPE + ACCENTS (PREFERRED)'],
              ['STOCK · QUANTITY', 'NOT DECIDED'],
              ['PRINTER', 'NOT SELECTED · NO PHYSICAL ORDER'],
              ['PROOF FILE', 'NOT GENERATED · PRINT GATE OPEN'],
            ]}
          />
        </>,
      );

    case 'RO-11':
    case 'RO-14': {
      const isPay = id === 'RO-14';
      return (
        <div className="ifw-insp-ov" data-overlay-body={id}>
          <WsInspHead kicker={isPay ? 'PAYOUT' : 'COMMISSION'} onClose={onClose}>
            <h2 className="ws-h2">
              <Amt minor={null} />
              <i className="ws-period" />
            </h2>
            <p className="ws-meta" style={{ margin: '8px 0 0' }}>
              {partner}
            </p>
          </WsInspHead>
          <div className="ws-insp__body">
            <WsBanner tone="policy" icon="lock">
              {BACKEND}
            </WsBanner>
            <div>
              <span className="ws-label">{isPay ? 'HOW A PAYOUT WILL BE RECORDED' : 'HOW A COMMISSION WILL BE CALCULATED'}</span>
              <div className="calc" style={{ marginTop: 8 }}>
                {isPay ? (
                  <>
                    <div className="calc__r">
                      <span>
                        APPROVED COMMISSIONS<span className="ws-meta">MONTHLY · TARGET THE {P.payoutTargetDayOfMonth}TH</span>
                      </span>
                      <Amt minor={null} />
                    </div>
                    <div className="calc__r">
                      <span>
                        PAID OUTSIDE SITE 00<span className="ws-meta">MANUAL · RECORDED WITH A REFERENCE</span>
                      </span>
                      <span className="ws-meta">RECORD-ONLY</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="calc__r">
                      <span>
                        QUALIFYING PAYMENT<span className="ws-meta">${P.qualifyingBasePackageUsd} BASE PACKAGE · VERIFIED STRIPE EVIDENCE</span>
                      </span>
                      <span className="ws-meta">REQUIRED</span>
                    </div>
                    <div className="calc__r">
                      <span>
                        HOLD<span className="ws-meta">AFTER VERIFIED PAYMENT</span>
                      </span>
                      <span className="ws-meta">{P.holdDaysAfterVerifiedPayment} DAYS</span>
                    </div>
                    <div className="calc__r">
                      <span>
                        FIXED FEE<span className="ws-meta">STANDARD / ESTABLISHED / STRATEGIC</span>
                      </span>
                      <span className="ws-meta">
                        ${P.standardUsd} / ${P.establishedUsd} / ≤ ${P.strategicMaxUsd}
                      </span>
                    </div>
                  </>
                )}
                <div className="calc__r calc__r--tot">
                  <span>{isPay ? 'TOTAL' : 'COMMISSION'}</span>
                  <Amt minor={null} />
                </div>
              </div>
            </div>
            <p className="ws-meta">
              NO ENTRY EXISTS · NOTHING HERE IS PAYABLE <WsGap id="G-RF" />
            </p>
          </div>
        </div>
      );
    }

    case 'RO-12':
      return shell(
        'Approve',
        <>
          <WsKv rows={[['PARTNER', partner], ['AMOUNT', '— · NO ENTRY'], ['EVIDENCE', 'NO VERIFIED STRIPE PAYMENT LINKED']]} />
          <p className="ws-meta" style={{ lineHeight: 1.5 }}>
            APPROVAL NEVER PAYS. IT WOULD ADD THE AMOUNT TO THE NEXT MONTHLY PAYOUT. UNVERIFIED COMMISSIONS CAN NEVER BE APPROVED.
          </p>
        </>,
      );

    case 'RO-13':
      return shell(
        'Record adjustment',
        <>
          <WsField label="REASON" req>
            <WsTextarea value={note} onChange={dirty} rows={3} ariaLabel="REASON" />
          </WsField>
          <p className="ws-meta">ADJUSTMENTS ARE NEW ROWS. THE ORIGINAL ENTRY IS NEVER EDITED.</p>
        </>,
      );

    case 'RO-15':
      return shell(
        'Continue',
        <>
          <WsBanner tone="policy" icon="lock">
            RECORDS A PAYMENT ALREADY MADE OUTSIDE SITE 00. IT DOES NOT SEND MONEY.
          </WsBanner>
          <WsField label="REFERENCE" req hint="IDEMPOTENCY KEY = PAYOUT ID + REFERENCE · A SECOND SUBMIT CANNOT CREATE A SECOND PAYMENT">
            <WsInput value={note} onChange={dirty} ariaLabel="REFERENCE" placeholder="BANK OR CHECK REFERENCE" />
          </WsField>
        </>,
      );

    case 'RO-16':
      return shell(
        'Mark paid',
        <>
          <WsKv rows={[['PARTNER', partner], ['AMOUNT', '— · NO PAYOUT ENTRY']]} />
          <WsCheck on={tick} onToggle={setTick} hint="WOULD MARK THE PAYOUT AND ITS COMMISSIONS PAID IN THE AUDIT TRAIL. UNAVAILABLE: NO PAYMENT EVIDENCE.">
            I CONFIRM THIS PAYMENT WAS MADE
          </WsCheck>
        </>,
      );

    case 'RO-17':
      return shell(
        'Record reversal',
        <>
          <WsChoiceGroup label="REVERSAL">
            <WsChoice on={choice === 0} title="RETURN COMMISSIONS TO APPROVED" desc="THEY JOIN THE NEXT PAYOUT" onSelect={() => setChoice(0)} />
            <WsChoice on={choice === 1} title="HOLD FOR REVIEW" desc="PARTNER PAYMENT DETAILS NEED UPDATING" onSelect={() => setChoice(1)} />
          </WsChoiceGroup>
          <WsField label="NOTE" req>
            <WsTextarea value={note} onChange={dirty} rows={3} ariaLabel="NOTE" />
          </WsField>
        </>,
        { tone: 'danger' },
      );

    case 'RO-18':
      return shell(
        'Continue to correction',
        <>
          <WsBanner icon="info">AN EXCEPTION IS RAISED WHEN TWO SOURCES CLAIM ONE CLIENT OR A SOURCE IS SUSPENDED. THE EXCEPTION QUEUE IS NOT BUILT YET.</WsBanner>
          <WsKv rows={[['ARTIFACT', String(payload?.artifact_id ?? '—'), Boolean(payload?.artifact_id)], ['POLICY', `ONE ATTRIBUTION PER ARTIFACT · ${P.attributionWindowDays}-DAY WINDOW`]]} />
          <WsChoiceGroup label="RESOLUTION">
            <WsChoice on={choice === 0} title="KEEP CURRENT" desc="NO CHANGE" onSelect={() => setChoice(0)} />
            <WsChoice on={choice === 1} title="REASSIGN" desc="CREATES A CORRECTION EVENT" onSelect={() => setChoice(1)} />
            <WsChoice on={choice === 2} title="NO PARTNER" desc="DISQUALIFY THE REFERRAL" onSelect={() => setChoice(2)} />
          </WsChoiceGroup>
        </>,
      );

    case 'RO-19':
      return shell(
        'Apply correction',
        <>
          <WsField label="EVIDENCE / REASON" req>
            <WsTextarea value={note} onChange={dirty} rows={3} ariaLabel="EVIDENCE" />
          </WsField>
          <WsCheck on={tick} onToggle={setTick} hint="BLOCKED AFTER A PAYOUT IS PAID.">
            I UNDERSTAND THIS CHANGES WHO IS PAID
          </WsCheck>
        </>,
      );

    case 'RO-20':
      return shell(
        'Revoke access',
        <>
          <div style={{ display: 'grid', gap: 10 }}>
            <WsCheck on={tick} onToggle={setTick} hint="SIGNS OUT EVERY SESSION">
              REVOKE PORTAL ACCESS
            </WsCheck>
            <WsCheck on={false} onToggle={() => undefined} disabled hint="NO LINK HAS BEEN ISSUED">
              REVOKE REFERRAL LINK
            </WsCheck>
          </div>
          <WsField label="TYPE REVOKE TO CONFIRM" req>
            <WsInput value={note} onChange={(v) => dirty(v.toUpperCase())} ariaLabel="TYPE REVOKE TO CONFIRM" />
          </WsField>
        </>,
        { tone: 'danger' },
      );

    default:
      return shell('Close', <p className="ws-meta">{String(id)}</p>, { noPrimary: true });
  }
}
