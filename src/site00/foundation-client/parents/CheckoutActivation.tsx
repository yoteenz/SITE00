/** Board 02 — P05 REVIEW + CHECKOUT · P06 ACTIVATION · interim project overview (P07 destination). */
import { useState, type ReactNode } from 'react';
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import { stageLabel } from '../../../../shared/site00-digital-foundation/projectStages.js';
import type { DigitalFoundationCommercialConfig, ProjectStageStatus } from '../../../../shared/site00-digital-foundation/types.js';
import { acceptQuote, DfApiError, startCheckout } from '../api';
import { DfIcon, type DfIconName } from '../icons';
import {
  activationTurnaround,
  addonPresentation,
  checkoutErrorCopy,
  DF_DISCLOSURES,
  deriveActivationState,
  deriveReviewState,
  formatMoney,
  foundationProgress,
  isPaidState,
  quoteFigures,
  quoteNeedsFounderReview,
  REVIEW_STATE_LABEL,
  type ActivationState,
  type CheckoutParam,
  type VerifyPhase,
} from '../model';
import { DfBottomSheet, DfCheckMark, DfEmptyState, DfModal, DfProgress } from '../components';
import { DfAlert, DfCta, DfHeadline, DfLede, DfRail, DfTrust } from '../shell';
import { IncludedList, ThirdPartySheet } from './Recommendation';

function SpecRow({
  icon,
  label,
  sub,
  value,
  valueSub,
  onOpen,
  wide,
}: {
  icon: DfIconName;
  label: string;
  sub?: ReactNode;
  value?: ReactNode;
  valueSub?: ReactNode;
  onOpen?: () => void;
  wide?: boolean;
}) {
  const inner = (
    <>
      <DfIcon name={icon} className="df-row__icon" />
      <span className="df-spec__text">
        <span className="df-spec__label">{label}</span>
        {sub && <span className="df-spec__sub">{sub}</span>}
      </span>
      {value !== undefined && (
        <span className="df-spec__value">
          <span className="df-spec__main" data-numeral={typeof value === 'string' && /^(\$[\d,.]+|\d+(–\d+)?)$/.test(value) ? '1' : undefined}>
            {value}
          </span>
          {valueSub && <span className="df-spec__vsub">{valueSub}</span>}
        </span>
      )}
      {onOpen && <DfIcon name="chevron" className="df-spec__chev" />}
    </>
  );
  const cls = `df-spec${wide ? ' df-spec--wide' : ''}${value === undefined ? ' df-spec--novalue' : ''}`;
  return (
    <li className={cls}>
      {onOpen ? (
        <button type="button" className="df-spec__btn" onClick={onOpen}>
          {inner}
        </button>
      ) : (
        <div className="df-spec__btn">{inner}</div>
      )}
    </li>
  );
}

function ScopeSheet({
  open,
  onClose,
  payload,
  onEdit,
}: {
  open: boolean;
  onClose: () => void;
  payload: ClientDigitalFoundationPayload;
  onEdit?: () => void;
}) {
  const q = payload.quote;
  if (!q) return null;
  return (
    <DfBottomSheet
      open={open}
      title="YOUR SCOPE"
      onClose={onClose}
      footer={onEdit ? <DfCta tone="outline" label="CHANGE ADD-ONS" onClick={onEdit} /> : undefined}
    >
      <IncludedList compact />
      {q.selected_addons.length > 0 && (
        <section className="df-section">
          <h3 className="df-section__label">ADD-ONS</h3>
          <ul className="df-lines">
            {q.selected_addons.map((l) => (
              <li key={l.addon_id}>
                <span>
                  {addonPresentation(l.addon_id)?.title ?? l.addon_id}
                  {l.quantity > 1 ? ` × ${l.quantity}` : ''}
                </span>
                <span>
                  {l.addon_id === 'CUSTOM_FOUNDATION_WORK' && l.line_total_minor <= 0
                    ? 'QUOTED AFTER REVIEW'
                    : formatMoney(l.line_total_minor, q.currency)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {(payload.recommendation?.client_must_provide.length ?? 0) > 0 && (
        <section className="df-section">
          <h3 className="df-section__label">WHAT WE&apos;LL NEED FROM YOU</h3>
          <ul className="df-bullets">
            {payload.recommendation!.client_must_provide.map((c) => (
              <li key={c}>{c.toUpperCase()}</li>
            ))}
          </ul>
        </section>
      )}
      <p className="df-sheet__note">
        QUOTE VERSION {q.quote_version} · VALID UNTIL{' '}
        {new Date(q.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
      </p>
    </DfBottomSheet>
  );
}

// ─── P05 ───────────────────────────────────────────────────────────────────────────────────────

export function P05Review({
  token,
  payload,
  config,
  setPayload,
  reload,
  checkout,
  onEditAddons,
}: {
  token: string;
  payload: ClientDigitalFoundationPayload;
  config: DigitalFoundationCommercialConfig | null;
  setPayload: (p: ClientDigitalFoundationPayload) => void;
  reload: () => Promise<ClientDigitalFoundationPayload | null>;
  checkout: CheckoutParam;
  onEditAddons: () => void;
}) {
  const { quote, acceptance } = payload;
  const accepted = Boolean(quote && quote.status === 'ACCEPTED' && acceptance?.quote_version === quote.quote_version);
  const [acks, setAcks] = useState<boolean[]>(() => DF_DISCLOSURES.map(() => false));
  const [creating, setCreating] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [confirmReopen, setConfirmReopen] = useState(false);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [costsOpen, setCostsOpen] = useState(false);
  const shownAcks = accepted ? DF_DISCLOSURES.map(() => true) : acks;
  const ackCount = shownAcks.filter(Boolean).length;
  const state = deriveReviewState({ payload, acknowledged: ackCount, checkout, creating, errorCode });
  const founderReview = quoteNeedsFounderReview(quote);
  const figures = quote && config ? quoteFigures(quote, config) : null;

  const openCheckout = async () => {
    setErrorCode(null);
    setCreating(true);
    try {
      const res = await startCheckout(token, window.location.origin);
      setPayload(res.payload);
      window.location.assign(res.checkout.checkout_url);
    } catch (e) {
      setCreating(false);
      setErrorCode(e instanceof DfApiError ? e.code : 'NETWORK');
    }
  };

  const proceed = async () => {
    setErrorCode(null);
    if (!accepted) {
      setAccepting(true);
      try {
        setPayload(await acceptQuote(token, DF_DISCLOSURES));
      } catch (e) {
        setErrorCode(e instanceof DfApiError ? e.code : 'NETWORK');
        return;
      } finally {
        setAccepting(false);
      }
      if (founderReview) return;
    }
    await openCheckout();
  };

  const check = async () => {
    setChecking(true);
    setErrorCode(null);
    try {
      await reload();
    } catch {
      setErrorCode('NETWORK');
    } finally {
      setChecking(false);
    }
  };

  let cta: ReactNode;
  let note: ReactNode = null;
  switch (state) {
    case 'NOT_READY':
      note = <DfAlert tone="muted" icon="clock">YOUR QUOTE IS BEING PREPARED.</DfAlert>;
      cta = <DfCta label="PROCEED TO CHECKOUT" disabled />;
      break;
    case 'READY_TO_REVIEW':
    case 'AWAITING_ACCEPTANCE':
    case 'SCOPE_CHANGED':
      if (state === 'SCOPE_CHANGED') {
        note = <DfAlert role="status">YOUR SCOPE WAS UPDATED BY SITE 00. REVIEW IT AND ACCEPT AGAIN TO CONTINUE.</DfAlert>;
      } else if (founderReview) {
        note = (
          <DfAlert tone="ink" icon="clock" role="status">
            PART OF THIS SCOPE IS CONFIRMED BY SITE 00 BEFORE PAYMENT. ACCEPT YOUR SCOPE NOW; CHECKOUT OPENS ONCE PRICING IS
            CONFIRMED.
          </DfAlert>
        );
      }
      cta = (
        <DfCta
          label={founderReview ? 'SUBMIT FOR CONFIRMATION' : 'PROCEED TO CHECKOUT'}
          onClick={proceed}
          disabled={ackCount < DF_DISCLOSURES.length}
          busy={accepting}
          busyLabel="RECORDING YOUR ACCEPTANCE…"
        />
      );
      break;
    case 'AWAITING_FOUNDER_PRICING':
      note = (
        <DfAlert tone="ink" icon="clock" role="status">
          YOUR SCOPE IS ACCEPTED. SITE 00 IS CONFIRMING PRICING FOR THE REVIEWED ITEMS. CHECKOUT OPENS HERE ONCE IT&apos;S
          CONFIRMED — NOTHING IS CHARGED UNTIL THEN.
        </DfAlert>
      );
      cta = (
        <>
          <DfCta label="AWAITING CONFIRMATION" disabled />
          <button type="button" className="df-link df-link--center" onClick={check} disabled={checking}>
            {checking ? 'CHECKING…' : 'CHECK FOR UPDATES'}
          </button>
        </>
      );
      break;
    case 'READY_FOR_CHECKOUT':
      cta = <DfCta label="PROCEED TO CHECKOUT" onClick={openCheckout} />;
      break;
    case 'CREATING_CHECKOUT':
      cta = <DfCta label="PROCEED TO CHECKOUT" busy busyLabel="OPENING SECURE CHECKOUT…" />;
      break;
    case 'CHECKOUT_ERROR':
      note = <DfAlert role="alert">{checkoutErrorCopy(errorCode, payload)}</DfAlert>;
      cta = <DfCta label="TRY AGAIN" onClick={accepted ? openCheckout : proceed} disabled={!accepted && ackCount < DF_DISCLOSURES.length} />;
      break;
    case 'PAYMENT_CANCELLED':
      note = <DfAlert role="status">CHECKOUT CANCELED — NOTHING WAS CHARGED.</DfAlert>;
      cta = <DfCta label="TRY AGAIN" onClick={openCheckout} />;
      break;
    case 'PAYMENT_PENDING':
      note = (
        <DfAlert tone="ink" icon="clock" role="status">
          A SECURE CHECKOUT WAS STARTED, AND STRIPE HASN&apos;T CONFIRMED A PAYMENT YET. IF YOU PAID, THIS PAGE WILL UPDATE —
          PLEASE DON&apos;T PAY TWICE.
        </DfAlert>
      );
      cta = (
        <>
          <DfCta label="CHECK PAYMENT STATUS" onClick={check} busy={checking} busyLabel="CHECKING…" />
          <DfCta tone="text" label="I DIDN’T FINISH CHECKOUT" onClick={() => setConfirmReopen(true)} action="reopen-checkout" />
          <DfModal
            open={confirmReopen}
            tone="warning"
            title="DIDN’T FINISH CHECKOUT?"
            onClose={() => setConfirmReopen(false)}
            busy={creating}
            primary={{ label: 'OPEN CHECKOUT AGAIN', busyLabel: 'OPENING SECURE CHECKOUT…', onClick: () => void openCheckout() }}
            secondary={{ label: 'CANCEL', onClick: () => setConfirmReopen(false) }}
          >
            <p>ONLY CONTINUE IF YOU DID NOT FINISH CHECKOUT.</p>
            <p>IF YOU ALREADY PAID, THIS PAGE WILL UPDATE ON ITS OWN — PLEASE DON’T PAY TWICE.</p>
          </DfModal>
        </>
      );
      break;
    case 'QUOTE_EXPIRED':
      note = accepted ? (
        <DfAlert role="alert">THIS QUOTE EXPIRED AFTER YOU ACCEPTED IT. SITE 00 NEEDS TO REISSUE IT BEFORE CHECKOUT.</DfAlert>
      ) : (
        <DfAlert role="alert">THIS QUOTE HAS EXPIRED. REFRESH IT ON YOUR RECOMMENDATION TO CONTINUE.</DfAlert>
      );
      cta = accepted ? <DfCta label="PROCEED TO CHECKOUT" disabled /> : <DfCta label="BACK TO RECOMMENDATION" onClick={onEditAddons} />;
      break;
  }

  return (
    <>
      <DfRail index="05" label="REVIEW + CHECKOUT" />
      <DfHeadline lines={['READY TO', 'MOVE', 'FORWARD']} />
      <DfLede>
        REVIEW YOUR FINAL SCOPE AND COMMERCIAL DETAILS. ONCE PAYMENT IS CONFIRMED, YOUR PROJECT IS ACTIVATED — WORK BEGINS AS SOON
        AS WE HAVE WHAT WE NEED.
      </DfLede>
      {quote && figures && (
        <ul className="df-specs">
          <SpecRow
            icon="cube"
            label="SERVICE"
            sub={
              <>
                DIGITAL FOUNDATION
                <br />
                {figures.addonCount ? `INCLUDES ${figures.addonCount} ADD-ON${figures.addonCount === 1 ? '' : 'S'}` : 'BASE FOUNDATION'}
              </>
            }
            onOpen={() => setScopeOpen(true)}
            wide
          />
          <SpecRow icon="dollar" label="INVESTMENT" sub="TOTAL DUE AT CHECKOUT" value={figures.total} valueSub={figures.caption} />
          <SpecRow
            icon="clock"
            label="TURNAROUND"
            sub="ESTIMATED COMPLETION"
            value={figures.turnaround}
            valueSub={
              <>
                BUSINESS DAYS
                <br />
                {figures.turnaroundCaption}
                {figures.reviewSuffix ? ` · ${figures.reviewSuffix}` : ''}
              </>
            }
          />
          <SpecRow icon="card" label="THIRD-PARTY COSTS" sub="DOMAIN, SOFTWARE, ETC." value="BILLED SEPARATELY" onOpen={() => setCostsOpen(true)} />
          <SpecRow icon="receipt" label="PAYMENT" sub="SECURE STRIPE CHECKOUT" value="ACTIVATES YOUR PROJECT" />
        </ul>
      )}
      <fieldset className="df-acks" disabled={accepted || accepting}>
        <legend className="df-section__label">AGREEMENT &amp; AUTHORIZATION</legend>
        {DF_DISCLOSURES.map((d, i) => (
          <label key={d} className={`df-ack${shownAcks[i] ? ' df-ack--on' : ''}`}>
            <input
              type="checkbox"
              checked={shownAcks[i]}
              onChange={(e) => setAcks((prev) => prev.map((v, j) => (j === i ? e.target.checked : v)))}
            />
            <DfCheckMark checked={shownAcks[i]} locked={accepted} />
            <span className="df-ack__text">{d}</span>
          </label>
        ))}
        {accepted && acceptance && (
          <p className="df-acks__done">
            ACCEPTED{' '}
            {new Date(acceptance.accepted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()} · QUOTE V
            {acceptance.quote_version}
          </p>
        )}
      </fieldset>
      <p className="df-status" data-review-state={state}>
        <span className="df-status__label">STATUS</span>
        <span className="df-status__value">{REVIEW_STATE_LABEL[state]}</span>
      </p>
      {note}
      <div className="df-actions">{cta}</div>
      <DfTrust text="YOUR INFORMATION IS SECURE." />
      <ScopeSheet
        open={scopeOpen}
        onClose={() => setScopeOpen(false)}
        payload={payload}
        onEdit={
          accepted
            ? undefined
            : () => {
                setScopeOpen(false);
                onEditAddons();
              }
        }
      />
      <ThirdPartySheet open={costsOpen} onClose={() => setCostsOpen(false)} payload={payload} />
    </>
  );
}

// ─── P06 ───────────────────────────────────────────────────────────────────────────────────────

const HEADLINES: Record<ActivationState, string[]> = {
  VERIFYING_PAYMENT: ['CONFIRMING', 'YOUR', 'PAYMENT'],
  PAYMENT_CONFIRMATION_PENDING: ['CONFIRMING', 'YOUR', 'PAYMENT'],
  PAYMENT_CONFIRMED: ['YOUR', 'FOUNDATION', 'IS ACTIVATING'],
  ACTIVATION_PENDING: ['YOUR', 'FOUNDATION', 'IS ACTIVATING'],
  PROJECT_ACTIVATED: ['YOUR', 'FOUNDATION', 'IS ACTIVE'],
  AWAITING_REQUIRED_INFORMATION: ['YOUR', 'FOUNDATION', 'IS ACTIVE'],
  AWAITING_CLIENT_AUTHORIZATION: ['YOUR', 'FOUNDATION', 'IS ACTIVE'],
  PRODUCTION_READY: ['YOUR', 'FOUNDATION', 'IS ACTIVE'],
  ACTIVATION_ERROR: ['WE COULDN’T', 'CONFIRM', 'YET'],
  PROJECT_PAUSED: ['YOUR', 'PROJECT', 'IS PAUSED'],
};

const LEDES: Record<ActivationState, string> = {
  VERIFYING_PAYMENT: "WE'RE CONFIRMING YOUR PAYMENT WITH STRIPE. THIS PAGE UPDATES ON ITS OWN — PLEASE DON'T PAY AGAIN.",
  PAYMENT_CONFIRMATION_PENDING:
    "STRIPE HASN'T CONFIRMED YOUR PAYMENT TO SITE 00 YET. IF YOU COMPLETED CHECKOUT, THERE'S NOTHING ELSE TO DO — THIS PAGE WILL UPDATE.",
  PAYMENT_CONFIRMED: "PAYMENT CONFIRMED. WE'RE SETTING UP YOUR PROJECT NOW.",
  ACTIVATION_PENDING: "PAYMENT CONFIRMED. WE'RE SETTING UP YOUR PROJECT NOW.",
  PROJECT_ACTIVATED: 'PAYMENT CONFIRMED. YOUR PROJECT IS ACTIVE.',
  AWAITING_REQUIRED_INFORMATION: 'PAYMENT CONFIRMED. YOUR PROJECT IS ACTIVE — PRODUCTION BEGINS ONCE WE HAVE WHAT WE NEED.',
  AWAITING_CLIENT_AUTHORIZATION: 'PAYMENT CONFIRMED. YOUR PROJECT IS ACTIVE — PRODUCTION BEGINS ONCE YOU AUTHORIZE THE NEXT STEP.',
  PRODUCTION_READY: 'PAYMENT CONFIRMED. YOUR PROJECT IS NOW IN PRODUCTION.',
  ACTIVATION_ERROR: "WE COULDN'T CHECK YOUR PAYMENT STATUS JUST NOW. THIS DOESN'T AFFECT YOUR PAYMENT. TRY AGAIN IN A MOMENT.",
  PROJECT_PAUSED: 'A REFUND OR PAYMENT DISPUTE WAS RECORDED, SO WORK ON THIS PROJECT IS PAUSED. SITE 00 WILL BE IN TOUCH.',
};

function confirmationCopy(state: ActivationState, attempt: number, attempts: number): { title: string; body: string; disc: 'check' | 'ring' | 'clock' | 'alert' } {
  switch (state) {
    case 'VERIFYING_PAYMENT':
      return { title: 'CONFIRMING PAYMENT', body: `CHECKING WITH STRIPE · ${Math.max(1, attempt)} OF ${attempts}`, disc: 'ring' };
    case 'PAYMENT_CONFIRMATION_PENDING':
      return { title: 'PAYMENT CONFIRMATION PENDING', body: 'NOT YET CONFIRMED BY STRIPE.', disc: 'clock' };
    case 'ACTIVATION_ERROR':
      return { title: 'ACTIVATION ERROR', body: 'PAYMENT STATUS UNAVAILABLE.', disc: 'alert' };
    case 'PROJECT_PAUSED':
      return { title: 'PROJECT PAUSED', body: 'NO WORK IS SCHEDULED WHILE PAUSED.', disc: 'alert' };
    case 'PRODUCTION_READY':
      return { title: 'PAYMENT CONFIRMED', body: 'YOUR DIGITAL FOUNDATION IS IN PRODUCTION.', disc: 'check' };
    case 'PAYMENT_CONFIRMED':
    case 'ACTIVATION_PENDING':
      return { title: 'PAYMENT CONFIRMED', body: 'YOUR PROJECT IS BEING SET UP.', disc: 'check' };
    default:
      return { title: 'PAYMENT CONFIRMED', body: 'YOUR DIGITAL FOUNDATION IS ACTIVE.', disc: 'check' };
  }
}

const STAGE_STATUS: Record<ProjectStageStatus, string> = {
  WAITING: 'UPCOMING',
  IN_PROGRESS: 'IN PROGRESS',
  NEEDS_CLIENT: 'NEEDS YOU',
  NEEDS_PROVIDER: 'WAITING ON PROVIDER',
  COMPLETE: 'COMPLETE',
  BLOCKED: 'PAUSED',
};

function currentPhase(payload: ClientDigitalFoundationPayload): { stage: string; status: string } | null {
  const code = payload.operations_summary?.current_stage;
  const stage = payload.stages.find((s) => s.stage_code === code) ?? payload.stages.find((s) => s.status !== 'COMPLETE');
  if (!stage) return null;
  return { stage: stageLabel(stage.stage_code).toUpperCase(), status: STAGE_STATUS[stage.status] };
}

function nextCopy(payload: ClientDigitalFoundationPayload, state: ActivationState): string {
  const first = payload.client_actions.find((a) => a.status === 'OPEN');
  if (first) return first.title.toUpperCase();
  if (state === 'PRODUCTION_READY' || state === 'PROJECT_ACTIVATED') return "WE'LL COMPLETE YOUR SETUP AND KEEP THIS PAGE UPDATED.";
  if (state === 'PAYMENT_CONFIRMED' || state === 'ACTIVATION_PENDING') return 'YOUR PROJECT PLAN APPEARS HERE SHORTLY.';
  if (state === 'PROJECT_PAUSED') return 'SITE 00 WILL CONTACT YOU.';
  return 'NO ACTION NEEDED — THIS PAGE UPDATES WHEN STRIPE CONFIRMS.';
}

export function P06Activation({
  payload,
  verify,
  attempt,
  attempts,
  simulated,
  onOverview,
  onRetry,
}: {
  payload: ClientDigitalFoundationPayload;
  verify: VerifyPhase;
  attempt: number;
  attempts: number;
  simulated: boolean;
  onOverview: () => void;
  onRetry: () => void;
}) {
  const state = deriveActivationState(payload, verify);
  const paid = isPaidState(state);
  const conf = confirmationCopy(state, attempt, attempts);
  const turnaround = activationTurnaround(payload);
  const business = payload.artifact.intake.business_name || payload.lead.business_name || '—';
  const q = payload.quote;
  const active = paid && payload.artifact.project_state !== 'NOT_STARTED' && payload.stages.length > 0;
  const phase = currentPhase(payload);
  const discIcon: DfIconName = conf.disc === 'check' ? 'check' : conf.disc === 'clock' ? 'clock' : conf.disc === 'alert' ? 'alert' : 'check';

  return (
    <>
      <DfRail index="06" label="ACTIVATION" />
      <DfHeadline lines={HEADLINES[state]} />
      <DfLede>{LEDES[state]}</DfLede>
      {simulated && !paid && (
        <DfAlert tone="muted" icon="alert" role="status">
          TEST CHECKOUT — NO PAYMENT WAS TAKEN. A PAYMENT IS ONLY CONFIRMED BY STRIPE, NEVER BY THIS REDIRECT.
        </DfAlert>
      )}
      <div className={`df-confirm-card df-confirm-card--${conf.disc}`} role="status" aria-live="polite" data-activation-state={state}>
        <span className={`df-confirm-card__disc df-confirm-card__disc--${conf.disc}`} aria-hidden="true">
          {conf.disc !== 'ring' && <DfIcon name={discIcon} />}
        </span>
        <span className="df-confirm-card__text">
          <span className="df-confirm-card__title">{conf.title}</span>
          <span className="df-confirm-card__body">{conf.body}</span>
        </span>
      </div>
      <ul className="df-specs df-specs--activation">
        <SpecRow icon="building" label="CLIENT" sub="BUSINESS NAME" value={business.toUpperCase()} />
        <SpecRow
          icon="cube"
          label="SERVICE"
          sub="DIGITAL FOUNDATION"
          value={q ? (q.selected_addons.length ? `${q.selected_addons.length} ADD-ON${q.selected_addons.length === 1 ? '' : 'S'}` : 'BASE') : undefined}
        />
        <SpecRow
          icon="card"
          label="PAYMENT STATUS"
          sub="VERIFIED BY STRIPE"
          value={paid ? 'CONFIRMED' : state === 'PROJECT_PAUSED' ? 'UNDER REVIEW' : state === 'VERIFYING_PAYMENT' ? 'CONFIRMING' : 'PENDING'}
        />
        {paid && (
          <SpecRow icon="gear" label="CURRENT PHASE" sub="PROJECT STAGE" value={phase?.stage ?? 'SETTING UP'} valueSub={phase?.status} />
        )}
        {paid && turnaround && (
          <SpecRow icon="clock" label="ESTIMATED TURNAROUND" sub={turnaround.caption} value={turnaround.value} valueSub={turnaround.unit} />
        )}
        <SpecRow icon="arrow" label="NEXT" sub="WHAT HAPPENS NOW" value={nextCopy(payload, state)} />
      </ul>
      <ul className="df-triad df-triad--proof" aria-label="ACTIVATION PROOF">
        <li data-on={paid ? '1' : '0'}>
          <DfIcon name="shield" />
          <span>PAYMENT</span>
          <span>{paid ? 'VERIFIED' : 'PENDING'}</span>
        </li>
        <li data-on={active ? '1' : '0'}>
          <DfIcon name="layers" />
          <span>PROJECT</span>
          <span>{active ? 'ACTIVE' : 'NOT YET ACTIVE'}</span>
        </li>
        <li data-on={paid ? '1' : '0'}>
          <DfIcon name="envelope" />
          <span>PORTAL</span>
          <span>{paid ? 'READY' : 'PENDING'}</span>
        </li>
      </ul>
      <div className="df-actions">
        {paid && <DfCta label="VIEW PROJECT OVERVIEW" onClick={onOverview} />}
        {state === 'VERIFYING_PAYMENT' && <DfCta label="VIEW PROJECT OVERVIEW" busy busyLabel="CONFIRMING PAYMENT…" />}
        {(state === 'PAYMENT_CONFIRMATION_PENDING' || state === 'ACTIVATION_ERROR') && <DfCta label="CHECK AGAIN" onClick={onRetry} />}
      </div>
      <DfTrust text="SAFE. SECURE. ON TRACK." />
    </>
  );
}

// ─── Interim overview (truthful P07 destination; P07 itself is a later sprint) ─────────────────

export function InterimOverview({ payload, onActivation }: { payload: ClientDigitalFoundationPayload; onActivation: () => void }) {
  const turnaround = activationTurnaround(payload);
  const open = payload.client_actions.filter((a) => a.status === 'OPEN');
  return (
    <>
      <DfRail index="07" label="PROJECT OVERVIEW" />
      <DfHeadline lines={['YOUR', 'PROJECT', 'OVERVIEW']} />
      <DfLede>
        LIVE PROJECT STATUS FROM SITE 00. <strong>INTERIM VIEW</strong> — THE FULL PROJECT PORTAL ARRIVES IN A LATER RELEASE ON
        THIS SAME LINK.
      </DfLede>
      {open.length > 0 && (
        <section className="df-section" aria-labelledby="df-needs-h">
          <h2 className="df-section__label df-section__label--red" id="df-needs-h">
            NEEDS YOU · {open.length}
          </h2>
          <ul className="df-specs">
            {open.map((a) => (
              <SpecRow key={a.request_id} icon="alert" label={a.title.toUpperCase()} sub={a.detail.toUpperCase()} wide />
            ))}
          </ul>
          <p className="df-section__note">SITE 00 WILL GUIDE YOU THROUGH EACH ITEM.</p>
        </section>
      )}
      <section className="df-section" aria-labelledby="df-journey-h">
        <h2 className="df-section__label" id="df-journey-h">
          YOUR FOUNDATION
        </h2>
        <DfProgress steps={foundationProgress(payload)} />
      </section>
      <section className="df-section" aria-labelledby="df-stages-h">
        <h2 className="df-section__label" id="df-stages-h">
          PROJECT STAGES
        </h2>
        <ol className="df-stages">
          {payload.stages.map((s) => (
            <li key={s.stage_code} className={`df-stage df-stage--${s.status.toLowerCase()}`}>
              <span className="df-stage__node" aria-hidden="true">
                {s.status === 'COMPLETE' && <DfIcon name="check" />}
              </span>
              <span className="df-stage__label">{stageLabel(s.stage_code).toUpperCase()}</span>
              <span className="df-stage__status">{STAGE_STATUS[s.status]}</span>
            </li>
          ))}
        </ol>
        {!payload.stages.length && (
          <DfEmptyState icon="roadmap" title="NO PROJECT STAGES YET." body="YOUR PROJECT PLAN WILL APPEAR HERE ONCE SITE 00 SETS IT UP." />
        )}
      </section>
      {turnaround && (
        <ul className="df-specs">
          <SpecRow icon="clock" label="ESTIMATED TURNAROUND" sub={turnaround.caption} value={turnaround.value} valueSub={turnaround.unit} />
        </ul>
      )}
      <div className="df-actions">
        <DfCta tone="outline" label="BACK TO ACTIVATION" onClick={onActivation} />
      </div>
      <DfTrust text="SAFE. SECURE. ON TRACK." />
    </>
  );
}

