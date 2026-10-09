/**
 * Business Growth parents inside the Foundation link:
 * G1 BUSINESS AMBITION · G2 GROWTH PATH · G3 INVESTMENT + DELIVERY · G4 GROWTH ROADMAP,
 * plus the connectors shown on P04, P05 and the project overview.
 */
import { useId, useMemo, useState, type ReactNode } from 'react';
import type { AmbitionContextKey } from '../../../../shared/site00-business-growth-intelligence/clientContext.js';
import type { BusinessAmbitionGoalId, BusinessGrowthServiceId } from '../../../../shared/site00-business-growth-intelligence/types.js';
import type { DfPayload } from '../api';
import { DfIcon } from '../icons';
import {
  ambitionDraftFrom,
  ambitionSummaryLine,
  CATEGORY_PRESENTATION,
  checkoutTotal,
  familyGroups,
  followUpsFor,
  GOAL_PRESENTATION,
  hasOpportunityInterest,
  investmentSections,
  LIFECYCLE_LABEL,
  MILESTONE_STATUS_LABEL,
  QUESTION_COPY,
  READINESS_LABEL,
  readinessDimensions,
  recommendationCards,
  roadmapActions,
  roadmapVersionLine,
  selectedServices,
  serviceCard,
  serviceOf,
  timelineView,
  toggleGoal,
  wantsDigitalLocation,
  type AmbitionDraft,
  type GrowthContext,
  type ServiceCard,
} from '../growth/model';
import type { GrowthSaveStatus } from '../growth/useGrowth';
import { DfAlert, DfCta, DfHeadline, DfLede, DfRail, DfSheet, DfTrust } from '../shell';

const BLDR_PATH = '/bldr';

function Badge({ tone, children }: { tone: 'red' | 'ink' | 'muted'; children: ReactNode }) {
  return <span className={`df-tag df-tag--${tone}`}>{children}</span>;
}

function SectionLabel({ id, children, red }: { id?: string; children: ReactNode; red?: boolean }) {
  return (
    <h2 className={`df-section__label${red ? ' df-section__label--red' : ''}`} id={id}>
      {children}
    </h2>
  );
}

function selectionStatusCopy(status: GrowthSaveStatus, error: string | null): string | null {
  if (status === 'pending' || status === 'saving') return 'SAVING YOUR PLAN…';
  if (status === 'saved') return 'PLAN SAVED';
  if (status === 'error') {
    if (error === 'GROWTH_SELECTION_LOCKED') return 'YOUR SCOPE IS ACCEPTED, SO GROWTH SELECTIONS CAN NO LONGER CHANGE HERE.';
    if (error === 'NETWORK') return "WE COULDN'T REACH SITE 00 — YOUR CHANGE WAS NOT SAVED.";
    return 'YOUR CHANGE WAS NOT SAVED. TRY AGAIN.';
  }
  return null;
}

// ─── Architecture: the ambition colonnade ──────────────────────────────────────────────────────

/** Twelve glass columns, one per canonical goal; chosen goals turn to red threshold glass. Decorative only. */
export function GrowthColonnade({ options, goals }: { options: { id: BusinessAmbitionGoalId }[]; goals: BusinessAmbitionGoalId[] }) {
  const uid = useId().replace(/:/g, '');
  const n = options.length;
  const w = 360;
  const gap = 6;
  const colW = (w - gap * (n - 1)) / n;
  return (
    <svg className="df-g-colonnade__svg" viewBox={`0 0 ${w} 180`} preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#dfe3e5" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`${uid}-red`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0474d" />
          <stop offset="0.6" stopColor="#d3121b" />
          <stop offset="1" stopColor="#8f0a10" />
        </linearGradient>
        <linearGradient id={`${uid}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2e1dd" />
          <stop offset="1" stopColor="#d3d1cc" />
        </linearGradient>
      </defs>
      <rect x="0" y="160" width={w} height="20" fill={`url(#${uid}-floor)`} />
      <path d={`M0 160 H${w}`} stroke="#c9c7c2" strokeWidth="0.8" />
      {options.map((o, i) => {
        const on = goals.includes(o.id);
        const h = 70 + Math.round(((i + 1) / n) * 80);
        const x = i * (colW + gap);
        return (
          <g key={o.id} className={`df-g-col${on ? ' df-g-col--on' : ''}`}>
            <rect x={x} y={160 - h} width={colW} height={h} fill={on ? `url(#${uid}-red)` : `url(#${uid}-glass)`} stroke={on ? '#a80c13' : '#cfd3d5'} strokeWidth="0.7" />
            <rect x={x + colW * 0.62} y={160 - h} width={colW * 0.38} height={h} fill={on ? '#7d080d' : '#e6e9ea'} opacity={on ? 0.35 : 0.6} />
            {on && <rect x={x} y={162} width={colW} height={12} fill="#d3121b" opacity="0.18" />}
          </g>
        );
      })}
    </svg>
  );
}

// ─── G1 BUSINESS AMBITION ──────────────────────────────────────────────────────────────────────

function BoolQuestion({
  field,
  value,
  onChange,
  disabled,
}: {
  field: AmbitionContextKey;
  value: boolean | null | undefined;
  onChange: (v: boolean | null) => void;
  disabled: boolean;
}) {
  const copy = QUESTION_COPY[field];
  const name = `df-g-${field}`;
  const choices: { label: string; v: boolean | null; key: string }[] = [
    { label: 'YES', v: true, key: 'yes' },
    { label: 'NO', v: false, key: 'no' },
    { label: 'NOT SURE', v: null, key: 'unsure' },
  ];
  return (
    <fieldset className="df-g-q" data-field={field}>
      <legend className="df-g-q__q">{copy.q}</legend>
      <p className="df-g-q__help">{copy.help}</p>
      <div className="df-g-seg">
        {choices.map((c) => {
          const checked = value === undefined ? false : value === c.v;
          return (
            <label key={c.key} className={`df-g-seg__opt${checked ? ' df-g-seg__opt--on' : ''}`}>
              <input type="radio" name={name} checked={checked} disabled={disabled} onChange={() => onChange(c.v)} />
              <span>{c.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function TextQuestion({
  field,
  value,
  onChange,
  disabled,
}: {
  field: AmbitionContextKey;
  value: string | null | undefined;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const copy = QUESTION_COPY[field];
  const id = `df-g-${field}`;
  if (copy.kind === 'choice') {
    return (
      <fieldset className="df-g-q" data-field={field}>
        <legend className="df-g-q__q">{copy.q}</legend>
        <p className="df-g-q__help">{copy.help}</p>
        <div className="df-g-seg df-g-seg--wrap">
          {(copy.options ?? []).map((o) => (
            <label key={o} className={`df-g-seg__opt${value === o ? ' df-g-seg__opt--on' : ''}`}>
              <input type="radio" name={id} checked={value === o} disabled={disabled} onChange={() => onChange(o)} />
              <span>{o}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }
  return (
    <div className="df-g-q" data-field={field}>
      <label className="df-g-q__q" htmlFor={id}>
        {copy.q}
      </label>
      <p className="df-g-q__help" id={`${id}-help`}>
        {copy.help}
      </p>
      <input
        id={id}
        className="df-input"
        value={value ?? ''}
        placeholder={copy.placeholder}
        maxLength={200}
        disabled={disabled}
        aria-describedby={`${id}-help`}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function GAmbition({
  growth,
  saveStatus,
  saveError,
  onSave,
  onSkip,
  nextLabel,
}: {
  growth: GrowthContext;
  saveStatus: GrowthSaveStatus;
  saveError: string | null;
  /** Saves and moves on; resolves false when the save failed (the draft stays on screen). */
  onSave: (draft: AmbitionDraft) => Promise<boolean>;
  onSkip: () => Promise<boolean>;
  nextLabel: string;
}) {
  const [draft, setDraft] = useState<AmbitionDraft>(() => ambitionDraftFrom(growth));
  const [phase, setPhase] = useState<'goals' | 'followups'>('goals');
  const editable = growth.selection.ambition_editable;
  const followUps = followUpsFor(draft.goals, growth.known_context);
  const saving = saveStatus === 'saving';
  const knownIndustry = growth.known_context.industry;

  const setContext = (field: AmbitionContextKey, v: boolean | string | null) =>
    setDraft((d) => ({ ...d, context: { ...d.context, [field]: v } }));

  const continueFromGoals = async () => {
    if (followUps.length) {
      setPhase('followups');
      window.scrollTo(0, 0);
      return;
    }
    await onSave(draft);
  };

  const errorLine =
    saveStatus === 'error'
      ? saveError === 'NETWORK'
        ? "WE COULDN'T REACH SITE 00. YOUR ANSWERS ARE STILL HERE — TRY AGAIN."
        : saveError === 'GROWTH_AMBITION_LOCKED'
          ? 'YOUR FOUNDATION IS PAID, SO THESE ANSWERS CAN NO LONGER CHANGE HERE.'
          : "WE COULDN'T SAVE YOUR ANSWERS. TRY AGAIN."
      : null;

  return (
    <>
      <DfRail index="G1" label="BUSINESS AMBITION" />
      {phase === 'goals' ? (
        <>
          <DfHeadline lines={["WHAT'S NEXT", 'FOR YOUR', 'BUSINESS']} />
          <DfLede>
            TELL US WHERE YOU WANT YOUR BUSINESS TO GO. <strong>SITE 00 WILL HELP IDENTIFY PRACTICAL NEXT STEPS</strong> — YOUR
            FOUNDATION STAYS THE SAME EITHER WAY.
          </DfLede>
          <div className="df-g-aside df-g-colonnade">
            <GrowthColonnade options={growth.goal_options} goals={draft.goals} />
            <p className="df-g-colonnade__count" aria-live="polite">
              {draft.goals.length ? `${draft.goals.length} SELECTED` : 'CHOOSE ANY THAT FIT'}
            </p>
          </div>
          <div className="df-g-goals" role="group" aria-label="BUSINESS GOALS — CHOOSE ANY THAT FIT">
            {growth.goal_options.map((o) => {
              const p = GOAL_PRESENTATION[o.id];
              const on = draft.goals.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  className={`df-g-goal${on ? ' df-g-goal--on' : ''}`}
                  data-goal={o.id}
                  disabled={!editable}
                  onClick={() => setDraft((d) => ({ ...d, goals: toggleGoal(d.goals, o.id) }))}
                >
                  <DfIcon name={p.icon} className="df-g-goal__icon" />
                  <span className="df-g-goal__title">{p.title}</span>
                  <span className="df-g-goal__sub">{p.sub}</span>
                  <span className={`df-check${on ? ' df-check--on' : ''}`} aria-hidden="true">
                    {on && <DfIcon name="check" />}
                  </span>
                </button>
              );
            })}
          </div>
          {errorLine && <DfAlert role="alert">{errorLine}</DfAlert>}
          <DfCta
            label={followUps.length ? 'CONTINUE' : nextLabel}
            onClick={() => void continueFromGoals()}
            disabled={!editable || draft.goals.length === 0}
            busy={saving}
            busyLabel="SAVING…"
          />
          <button type="button" className="df-link df-link--row df-g-skip" onClick={() => void onSkip()} disabled={saving || !editable}>
            SKIP FOR NOW — CONTINUE WITH MY FOUNDATION
            <DfIcon name="chevron" />
          </button>
          <DfTrust text="OPTIONAL. NOTHING IS ADDED TO YOUR QUOTE." />
        </>
      ) : (
        <>
          <DfHeadline lines={['A FEW', 'QUICK', 'QUESTIONS']} />
          <DfLede>
            ONLY WHAT MATTERS FOR <strong>{ambitionSummaryLine(draft.goals)}</strong>. NOT SURE IS ALWAYS A GOOD ANSWER.
          </DfLede>
          {knownIndustry && (
            <p className="df-g-known">
              <DfIcon name="check" /> INDUSTRY FROM YOUR BUSINESS INFORMATION: {knownIndustry.toUpperCase()}
            </p>
          )}
          <div className="df-g-qs">
            {followUps.map((f) =>
              QUESTION_COPY[f].kind === 'bool' ? (
                <BoolQuestion
                  key={f}
                  field={f}
                  value={draft.context[f] as boolean | null | undefined}
                  disabled={!editable}
                  onChange={(v) => setContext(f, v)}
                />
              ) : (
                <TextQuestion
                  key={f}
                  field={f}
                  value={draft.context[f] as string | null | undefined}
                  disabled={!editable}
                  onChange={(v) => setContext(f, v)}
                />
              ),
            )}
          </div>
          {errorLine && <DfAlert role="alert">{errorLine}</DfAlert>}
          <DfCta label={nextLabel} onClick={() => void onSave(draft)} disabled={!editable} busy={saving} busyLabel="SAVING YOUR ANSWERS…" />
          <button type="button" className="df-link df-link--row" onClick={() => setPhase('goals')} disabled={saving}>
            BACK TO GOALS
            <DfIcon name="chevron" />
          </button>
          <DfTrust text="YOUR ANSWERS SHAPE GUIDANCE, NOT YOUR PRICE." />
        </>
      )}
    </>
  );
}

// ─── Service card + inspection ─────────────────────────────────────────────────────────────────

function ServiceTile({
  card,
  editable,
  onToggle,
  onInspect,
  showReason,
}: {
  card: ServiceCard;
  editable: boolean;
  onToggle: () => void;
  onInspect: () => void;
  showReason?: boolean;
}) {
  const { service: s, recommendation: r } = card;
  const cat = r ? CATEGORY_PRESENTATION[r.category] : null;
  const canAdd = s.selectable && editable;
  return (
    <li className={`df-g-svc${card.selected ? ' df-g-svc--on' : ''}`} data-service={s.service_id}>
      <div className="df-g-svc__head">
        <span className="df-g-svc__name">{s.display_name.toUpperCase()}</span>
        {cat && <Badge tone={cat.tone}>{cat.label}</Badge>}
      </div>
      {showReason && r && <p className="df-g-svc__why">{r.reason.toUpperCase()}</p>}
      {!showReason && <p className="df-g-svc__why">{s.description.toUpperCase()}</p>}
      <dl className="df-g-svc__facts">
        <div>
          <dt>INVESTMENT</dt>
          <dd>
            {card.price.label}
            <span>{card.price.detail}</span>
          </dd>
        </div>
        <div>
          <dt>DELIVERY</dt>
          <dd>
            {card.delivery.label}
            <span>{card.delivery.detail}</span>
          </dd>
        </div>
      </dl>
      {card.dependsOn.length > 0 && <p className="df-g-svc__dep">BUILDS ON {card.dependsOn.join(' + ')}</p>}
      <div className="df-g-svc__actions">
        <button type="button" className="df-link" onClick={onInspect} aria-haspopup="dialog">
          WHAT&apos;S INCLUDED
        </button>
        {s.selectable ? (
          <button
            type="button"
            role="checkbox"
            aria-checked={card.selected}
            aria-label={`${card.selected ? 'REMOVE' : 'ADD'} ${s.display_name.toUpperCase()} ${card.selected ? 'FROM' : 'TO'} MY PLAN`}
            className={`df-g-add${card.selected ? ' df-g-add--on' : ''}`}
            disabled={!canAdd}
            onClick={onToggle}
          >
            {card.selected ? (
              <>
                <DfIcon name="check" /> IN MY PLAN
              </>
            ) : (
              <>
                <DfIcon name="plus" /> ADD TO MY PLAN
              </>
            )}
          </button>
        ) : (
          <span className="df-g-add df-g-add--na">NOT YET AVAILABLE</span>
        )}
      </div>
    </li>
  );
}

function ServiceSheet({ growth, card, onClose }: { growth: GrowthContext; card: ServiceCard | null; onClose: () => void }) {
  const s = card?.service;
  return (
    <DfSheet open={Boolean(card)} title={s ? s.display_name.toUpperCase() : ''} onClose={onClose}>
      {card && s && (
        <div className="df-g-sheet">
          <p className="df-g-sheet__lede">{s.description.toUpperCase()}</p>
          {card.recommendation && (
            <p className="df-g-sheet__why">
              <strong>WHY WE SUGGEST IT · </strong>
              {card.recommendation.reason.toUpperCase()}
            </p>
          )}
          <h3 className="df-section__label">WHAT IT INCLUDES</h3>
          <ul className="df-bullets">
            {s.deliverables.map((d) => (
              <li key={d}>{d.toUpperCase()}</li>
            ))}
          </ul>
          <h3 className="df-section__label">WHAT IT DOES NOT INCLUDE</h3>
          <ul className="df-bullets df-bullets--muted">
            {s.exclusions.map((d) => (
              <li key={d}>{d.toUpperCase()}</li>
            ))}
          </ul>
          {s.dependencies.length > 0 && (
            <>
              <h3 className="df-section__label">DEPENDS ON</h3>
              <ul className="df-bullets">
                {s.dependencies.map((d) => (
                  <li key={d}>{(serviceOf(growth, d)?.display_name ?? d).toUpperCase()}</li>
                ))}
              </ul>
            </>
          )}
          {s.delivery.client_dependencies.length > 0 && (
            <>
              <h3 className="df-section__label">WHAT WE NEED FROM YOU</h3>
              <ul className="df-bullets">
                {s.delivery.client_dependencies.map((d) => (
                  <li key={d}>{d.toUpperCase()}</li>
                ))}
              </ul>
            </>
          )}
          <dl className="df-g-svc__facts df-g-svc__facts--sheet">
            <div>
              <dt>INVESTMENT</dt>
              <dd>
                {card.price.label}
                <span>{card.price.detail}</span>
              </dd>
            </div>
            <div>
              <dt>DELIVERY</dt>
              <dd>
                {card.delivery.label}
                <span>{card.delivery.detail}</span>
              </dd>
            </div>
          </dl>
          <p className="df-sheet__note">
            {card.price.payable
              ? 'APPROVED PRICING.'
              : 'NOT PAYABLE TODAY. ADDING IT TO YOUR PLAN ASKS SITE 00 TO CONFIRM SCOPE AND PRICING — NOTHING IS CHARGED.'}
          </p>
        </div>
      )}
    </DfSheet>
  );
}

// ─── Shared cards: BLDR, AIO, opportunity ──────────────────────────────────────────────────────

function BldrBridge({
  growth,
  onInterest,
  interestStatus,
}: {
  growth: GrowthContext;
  onInterest: () => void;
  interestStatus: 'idle' | 'saving' | 'error';
}) {
  const recorded = growth.bldr.interest_recorded;
  return (
    <section className="df-g-bridge" aria-labelledby="df-g-bldr-h" data-card="bldr">
      <p className="df-g-bridge__kicker">BLDR · DIGITAL LOCATION</p>
      <h3 className="df-g-bridge__title" id="df-g-bldr-h">
        YOUR WEBSITE IS ITS OWN PROJECT<span className="df-headline__period">.</span>
      </h3>
      <p className="df-g-bridge__body">
        A PROFESSIONAL DIGITAL LOCATION IS DESIGNED AND BUILT WITH BLDR — SCOPED BY THE BLDR ESTIMATOR AND MEASURED IN MONTHS, NOT
        DAYS. IT IS NOT PART OF YOUR FOUNDATION AND NOTHING IS PURCHASED HERE.
      </p>
      <div className="df-g-bridge__actions">
        {recorded ? (
          <span className="df-g-bridge__done" role="status">
            <DfIcon name="check" /> INTEREST NOTED — SITE 00 WILL FOLLOW UP
          </span>
        ) : (
          <button type="button" className="df-g-add" onClick={onInterest} disabled={interestStatus === 'saving'} aria-busy={interestStatus === 'saving' || undefined}>
            {interestStatus === 'saving' ? 'SAVING…' : "I'M INTERESTED IN BLDR"}
          </button>
        )}
        <a className="df-link" href={BLDR_PATH} target="_blank" rel="noopener noreferrer">
          EXPLORE BLDR <DfIcon name="arrow" />
        </a>
      </div>
      {interestStatus === 'error' && <p className="df-field__error">WE COULDN&apos;T SAVE THAT. TRY AGAIN.</p>}
    </section>
  );
}

function AioCard({ growth, payload }: { growth: GrowthContext; payload: DfPayload }) {
  if (!growth.aio.referrals.length) return null;
  const partner = payload.referral_channel?.kind === 'AIO';
  return (
    <section className="df-g-bridge df-g-bridge--quiet" aria-labelledby="df-g-aio-h" data-card="aio">
      <p className="df-g-bridge__kicker">PARTNER SERVICES · AIO</p>
      <h3 className="df-g-bridge__title" id="df-g-aio-h">
        SOME NEXT STEPS SIT OUTSIDE DIGITAL<span className="df-headline__period">.</span>
      </h3>
      {growth.aio.referrals.map((r) => (
        <p key={r} className="df-g-bridge__body">
          {r.toUpperCase()}
        </p>
      ))}
      <p className="df-g-bridge__fine">
        AIO IS A SEPARATE COMPANY WITH SEPARATE BILLING. SITE 00 SHARES NOTHING ABOUT YOUR BUSINESS WITH AIO WITHOUT YOUR PERMISSION.
        {partner ? ' YOU CAME TO SITE 00 THROUGH A PARTNER — YOUR SITE 00 SCOPE AND PRICING ARE THE SAME.' : ''}
      </p>
    </section>
  );
}

function OpportunityCard() {
  return (
    <section className="df-g-bridge df-g-bridge--quiet" aria-labelledby="df-g-opp-h" data-card="opportunity">
      <p className="df-g-bridge__kicker">GRANTS · CONTRACTS · PROGRAMS</p>
      <h3 className="df-g-bridge__title" id="df-g-opp-h">
        ASSESSMENT PENDING<span className="df-headline__period">.</span>
      </h3>
      <p className="df-g-bridge__body">
        SITE 00 HAS NOT VERIFIED ANY SPECIFIC GRANT, CONTRACT OR PROGRAM FOR YOUR BUSINESS YET. OPPORTUNITY READINESS PREPARES YOUR
        DOCUMENTATION AND CLARIFIES FIT FIRST.
      </p>
      <p className="df-g-bridge__fine">NO FUNDING, CONTRACT, CERTIFICATION OR VENDOR APPROVAL IS GUARANTEED.</p>
    </section>
  );
}

// ─── G2 GROWTH PATH ────────────────────────────────────────────────────────────────────────────

function PlanAside({
  growth,
  selectedIds,
  statusLine,
  children,
}: {
  growth: GrowthContext;
  selectedIds: BusinessGrowthServiceId[];
  statusLine: string | null;
  children?: ReactNode;
}) {
  const t = timelineView(growth);
  return (
    <aside className="df-g-aside df-g-plan" aria-label="YOUR PLAN">
      <p className="df-g-plan__kicker">YOUR PLAN</p>
      <ul className="df-g-plan__rows">
        <li>
          <span>DIGITAL FOUNDATION</span>
          <span>INCLUDED</span>
        </li>
        {selectedIds.map((id) => (
          <li key={id}>
            <span>{(serviceOf(growth, id)?.display_name ?? id).toUpperCase()}</span>
            <span className="df-g-plan__pending">PENDING APPROVAL</span>
          </li>
        ))}
        {!selectedIds.length && <li className="df-g-plan__empty">NO GROWTH SERVICES ADDED</li>}
      </ul>
      <dl className="df-g-plan__dates" aria-live="polite">
        <div>
          <dt>FOUNDATION READY</dt>
          <dd>{t.foundationReady}</dd>
        </div>
        <div>
          <dt>FULL PROJECT</dt>
          <dd>{t.fullProject}</dd>
        </div>
      </dl>
      {statusLine && (
        <p className="df-g-plan__status" role="status">
          {statusLine}
        </p>
      )}
      {children}
    </aside>
  );
}

export function GPath({
  growth,
  payload,
  desired,
  selectionStatus,
  selectionError,
  onToggle,
  onClear,
  onEditGoals,
  onContinue,
  onFoundationOnly,
  onBldrInterest,
  bldrStatus,
}: {
  growth: GrowthContext;
  payload: DfPayload;
  desired: BusinessGrowthServiceId[];
  selectionStatus: GrowthSaveStatus;
  selectionError: string | null;
  onToggle: (id: BusinessGrowthServiceId) => void;
  onClear: () => void;
  onEditGoals: () => void;
  onContinue: () => void;
  onFoundationOnly: () => void;
  onBldrInterest: () => void;
  bldrStatus: 'idle' | 'saving' | 'error';
}) {
  const [inspect, setInspect] = useState<BusinessGrowthServiceId | null>(null);
  const [explore, setExplore] = useState(false);
  const ids = useMemo(() => new Set<string>(desired), [desired]);
  const recs = recommendationCards(growth, ids);
  const families = familyGroups(growth, ids);
  const readiness = readinessDimensions(growth);
  const editable = growth.selection.editable;
  const updating = selectionStatus === 'pending' || selectionStatus === 'saving';
  const statusLine = selectionStatusCopy(selectionStatus, selectionError);
  const inspectCard = inspect ? (serviceOf(growth, inspect) ? serviceCard(growth, serviceOf(growth, inspect)!, ids) : null) : null;
  const skipped = Boolean(growth.ambition?.skipped);

  return (
    <>
      <DfRail index="G2" label="GROWTH PATH" />
      <DfHeadline lines={['YOUR', 'GROWTH', 'PATH']} />
      <DfLede>
        {skipped ? (
          <>YOU SKIPPED BUSINESS AMBITION. HERE IS WHERE SITE 00 CAN HELP WHEN YOU&apos;RE READY — ALL OPTIONAL.</>
        ) : (
          <>
            BASED ON <strong>{ambitionSummaryLine(growth.ambition?.goals ?? [])}</strong>. EVERYTHING HERE IS OPTIONAL — YOUR FOUNDATION
            STANDS ON ITS OWN.
          </>
        )}
      </DfLede>
      <button type="button" className="df-link df-link--row" onClick={onEditGoals} disabled={!growth.selection.ambition_editable}>
        {skipped ? 'TELL US YOUR GOALS' : 'EDIT MY GOALS'}
        <DfIcon name="chevron" />
      </button>

      <PlanAside growth={growth} selectedIds={desired} statusLine={statusLine}>
        <DfCta label="REVIEW INVESTMENT + DELIVERY" onClick={onContinue} disabled={updating} busy={updating} busyLabel="SAVING YOUR PLAN…" />
      </PlanAside>

      <section className="df-section" aria-labelledby="df-g-ready-h">
        <SectionLabel id="df-g-ready-h">BUSINESS READINESS</SectionLabel>
        <p className="df-section__note">FROM YOUR ANSWERS AND YOUR FOUNDATION — NOT A SCORE.</p>
        <ul className="df-g-ready">
          {readiness.map((d) => (
            <li key={d.id} className={`df-g-ready__row df-g-ready__row--${d.state.toLowerCase()}`} data-dimension={d.id}>
              <DfIcon name={d.icon} className="df-row__icon" />
              <span className="df-g-ready__text">
                <span className="df-g-ready__title">{d.title}</span>
                <span className="df-g-ready__detail">{d.detail}</span>
              </span>
              <span className="df-g-ready__state">{READINESS_LABEL[d.state]}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="df-section" aria-labelledby="df-g-recs-h">
        <SectionLabel id="df-g-recs-h" red>
          RECOMMENDED FOR YOU
        </SectionLabel>
        <p className="df-section__note">A RECOMMENDATION IS GUIDANCE, NOT A CHARGE. NOTHING IS ADDED UNLESS YOU ADD IT.</p>
        {recs.length ? (
          <ul className="df-g-svcs">
            {recs.map((c) => (
              <ServiceTile
                key={c.service.service_id}
                card={c}
                editable={editable && !updating}
                showReason
                onToggle={() => onToggle(c.service.service_id)}
                onInspect={() => setInspect(c.service.service_id)}
              />
            ))}
          </ul>
        ) : (
          <DfAlert tone="muted">NO GROWTH SERVICE IS RECOMMENDED FOR YOUR GOALS RIGHT NOW. YOUR FOUNDATION COVERS WHAT YOU NEED TODAY.</DfAlert>
        )}
      </section>

      {wantsDigitalLocation(growth, ids) && <BldrBridge growth={growth} onInterest={onBldrInterest} interestStatus={bldrStatus} />}
      {hasOpportunityInterest(growth) && <OpportunityCard />}
      <AioCard growth={growth} payload={payload} />

      <section className="df-section" aria-labelledby="df-g-explore-h">
        <SectionLabel id="df-g-explore-h">EXPLORE ALL GROWTH SERVICES</SectionLabel>
        <button type="button" className="df-link df-link--row" aria-expanded={explore} aria-controls="df-g-families" onClick={() => setExplore((o) => !o)}>
          {explore ? 'HIDE SERVICE FAMILIES' : 'VIEW 5 SERVICE FAMILIES'}
          <DfIcon name="chevron" />
        </button>
        {explore && (
          <div id="df-g-families" className="df-g-families">
            {families.map((f) => (
              <section key={f.family_id} className="df-g-family" aria-labelledby={`df-g-fam-${f.family_id}`} data-family={f.family_id}>
                <header className="df-g-family__head">
                  <DfIcon name={f.icon} className="df-row__icon" />
                  <span>
                    <span className="df-g-family__title" id={`df-g-fam-${f.family_id}`}>
                      {f.title}
                    </span>
                    <span className="df-g-family__sub">{f.sub}</span>
                  </span>
                </header>
                {f.cards.length ? (
                  <ul className="df-g-svcs df-g-svcs--compact">
                    {f.cards.map((c) => (
                      <ServiceTile
                        key={c.service.service_id}
                        card={c}
                        editable={editable && !updating}
                        onToggle={() => onToggle(c.service.service_id)}
                        onInspect={() => setInspect(c.service.service_id)}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="df-g-family__empty">{f.empty}</p>
                )}
              </section>
            ))}
          </div>
        )}
      </section>

      {!editable && <DfAlert tone="ink" icon="lock">YOUR FOUNDATION SCOPE IS ACCEPTED. GROWTH SELECTIONS ARE SHOWN AS SAVED.</DfAlert>}
      {selectionStatus === 'error' && statusLine && <DfAlert role="alert">{statusLine}</DfAlert>}

      <div className="df-g-endactions">
        <DfCta label="REVIEW INVESTMENT + DELIVERY" onClick={onContinue} disabled={updating} busy={updating} busyLabel="SAVING YOUR PLAN…" />
        {desired.length > 0 && editable ? (
          <button type="button" className="df-link df-link--row" onClick={onClear} disabled={updating}>
            REMOVE ALL GROWTH SERVICES ({desired.length})
            <DfIcon name="chevron" />
          </button>
        ) : (
          <button type="button" className="df-link df-link--row" onClick={onFoundationOnly} disabled={updating}>
            CONTINUE WITH FOUNDATION ONLY
            <DfIcon name="chevron" />
          </button>
        )}
      </div>
      <DfTrust text="OPTIONAL. TRANSPARENT. SCOPED FOR YOU." />
      <ServiceSheet growth={growth} card={inspectCard} onClose={() => setInspect(null)} />
    </>
  );
}

// ─── G3 INVESTMENT + DELIVERY ──────────────────────────────────────────────────────────────────

export function DeliveryRail({ growth }: { growth: GrowthContext }) {
  const t = timelineView(growth);
  const foundation = t.tracks.find((x) => x.kind === 'FOUNDATION_READY');
  return (
    <figure className="df-g-rail" aria-labelledby="df-g-rail-cap">
      <figcaption id="df-g-rail-cap" className="df-visually-hidden">
        DELIVERY TIMELINE. FOUNDATION READY {t.foundationReady}. FULL PROJECT DELIVERY {t.fullProject}.
      </figcaption>
      <div className="df-g-rail__scale" aria-hidden="true">
        {t.ticks.map((tick) => (
          <span key={tick} style={{ left: `${(tick / t.scaleMax) * 100}%` }}>
            {tick}
          </span>
        ))}
        <em>BUSINESS DAYS</em>
      </div>
      <ol className="df-g-rail__tracks">
        {t.tracks.map((tr) => (
          <li key={tr.id} className={`df-g-track df-g-track--${tr.kind.toLowerCase()} df-g-track--${tr.status.toLowerCase()}`} data-milestone={tr.kind}>
            <div className="df-g-track__meta">
              <span className="df-g-track__label">{tr.label}</span>
              <span className="df-g-track__range">{tr.range}</span>
              <span className="df-g-track__note">
                {tr.note} · {MILESTONE_STATUS_LABEL[tr.status]}
              </span>
            </div>
            <div className="df-g-track__lane" aria-hidden="true">
              {foundation?.end != null && <span className="df-g-track__marker" style={{ left: `${foundation.end}%` }} />}
              {tr.start != null && tr.end != null ? (
                <span className="df-g-track__bar" style={{ left: `${tr.start}%`, width: `${Math.max(1.5, tr.end - tr.start)}%` }}>
                  {tr.firm != null && tr.firm > tr.start && (
                    <span className="df-g-track__firm" style={{ width: `${((tr.firm - tr.start) / Math.max(0.1, tr.end - tr.start)) * 100}%` }} />
                  )}
                </span>
              ) : (
                <span className="df-g-track__open">SCOPED SEPARATELY</span>
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className="df-g-rail__legend">
        <span className="df-g-rail__key df-g-rail__key--firm" /> EARLIEST <span className="df-g-rail__key" /> LATEST ESTIMATE
        <span className="df-g-rail__key df-g-rail__key--marker" /> FOUNDATION READY
      </p>
    </figure>
  );
}

export function GPlan({
  growth,
  payload,
  onBack,
  onContinue,
  onRoadmap,
}: {
  growth: GrowthContext;
  payload: DfPayload;
  onBack: () => void;
  onContinue: () => void;
  onRoadmap: () => void;
}) {
  const sections = investmentSections(growth, payload);
  const t = timelineView(growth);
  const total = checkoutTotal(growth, payload);
  const growthCount = growth.unified_quote.growth_lines.length;
  return (
    <>
      <DfRail index="G3" label="INVESTMENT + DELIVERY" />
      <DfHeadline lines={['YOUR', 'INVESTMENT', '+ DELIVERY']} />
      <DfLede>
        EACH PART OF YOUR PLAN, PRICED AND TIMED ON ITS OWN. <strong>ONLY YOUR FOUNDATION IS PAYABLE AT CHECKOUT.</strong>
      </DfLede>

      <aside className="df-g-aside df-g-plan df-g-plan--total" aria-label="DUE AT FOUNDATION CHECKOUT">
        <p className="df-g-plan__kicker">DUE AT FOUNDATION CHECKOUT</p>
        <p className="df-g-plan__total">{total}</p>
        <p className="df-g-plan__caption">
          {growthCount ? `${growthCount} GROWTH SERVICE${growthCount === 1 ? '' : 'S'} CONFIRMED SEPARATELY — NEVER CHARGED HERE` : 'FOUNDATION ONLY'}
        </p>
        <dl className="df-g-plan__dates">
          <div>
            <dt>FOUNDATION READY</dt>
            <dd>{t.foundationReady}</dd>
          </div>
          <div>
            <dt>FULL PROJECT</dt>
            <dd>{t.fullProject}</dd>
          </div>
        </dl>
        <DfCta label="CONTINUE TO REVIEW" onClick={onContinue} />
      </aside>

      <section className="df-section" aria-labelledby="df-g-inv-h">
        <SectionLabel id="df-g-inv-h">INVESTMENT</SectionLabel>
        <ol className="df-g-ledger">
          {sections.map((s) => (
            <li key={s.id} className={`df-g-ledger__row${s.inCheckout ? ' df-g-ledger__row--checkout' : ''}`} data-section={s.id}>
              <div className="df-g-ledger__main">
                <span className="df-g-ledger__label">{s.label}</span>
                <span className="df-g-ledger__value">{s.value}</span>
              </div>
              <span className="df-g-ledger__caption">{s.caption}</span>
              {s.lines.length > 0 && (
                <ul className="df-g-ledger__lines">
                  {s.lines.map((l) => (
                    <li key={l.label}>
                      <span>{l.label}</span>
                      <span>{l.value}</span>
                      {l.note && <em>{l.note}</em>}
                    </li>
                  ))}
                </ul>
              )}
              <span className={`df-g-ledger__flag${s.inCheckout ? ' df-g-ledger__flag--in' : ''}`}>
                {s.inCheckout ? 'IN FOUNDATION CHECKOUT' : 'NOT IN THIS CHECKOUT'}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="df-section" aria-labelledby="df-g-del-h">
        <SectionLabel id="df-g-del-h">DELIVERY</SectionLabel>
        <div className="df-g-milestones">
          <div className="df-g-milestone df-g-milestone--foundation">
            <span className="df-g-milestone__label">FOUNDATION READY</span>
            <span className="df-g-milestone__value">{t.foundationReady}</span>
            <span className="df-g-milestone__note">YOUR DOMAIN, EMAIL AND OWNERSHIP — NEVER WAITS ON GROWTH WORK</span>
          </div>
          <div className="df-g-milestone">
            <span className="df-g-milestone__label">FULL PROJECT DELIVERY</span>
            <span className="df-g-milestone__value">{t.fullProject}</span>
            <span className="df-g-milestone__note">
              {t.sameAsFoundation ? 'SAME AS FOUNDATION — NO GROWTH WORK IN YOUR PLAN' : 'EVERYTHING IN YOUR PLAN, INCLUDING GROWTH WORK'}
            </span>
          </div>
        </div>
        <DeliveryRail growth={growth} />
        <p className="df-section__note">ESTIMATES START ONCE SITE 00 HAS WHAT IT NEEDS FROM YOU. GROWTH TIMING IS CONFIRMED WITH ITS SCOPE.</p>
      </section>

      <div className="df-g-endactions">
        <DfCta label="CONTINUE TO REVIEW" onClick={onContinue} />
        <button type="button" className="df-link df-link--row" onClick={onRoadmap}>
          VIEW MY GROWTH ROADMAP
          <DfIcon name="chevron" />
        </button>
        <button type="button" className="df-link df-link--row" onClick={onBack}>
          BACK TO MY GROWTH PATH
          <DfIcon name="chevron" />
        </button>
      </div>
      <DfTrust text="NO GROWTH CHARGE WITHOUT YOUR APPROVAL." />
    </>
  );
}

// ─── G4 GROWTH ROADMAP ─────────────────────────────────────────────────────────────────────────

function RoadmapBlock({ label, children, red, id }: { label: string; children: ReactNode; red?: boolean; id: string }) {
  return (
    <section className="df-g-rm" aria-labelledby={id}>
      <SectionLabel id={id} red={red}>
        {label}
      </SectionLabel>
      {children}
    </section>
  );
}

export function GRoadmap({ growth, payload, onBack, backLabel }: { growth: GrowthContext; payload: DfPayload; onBack: () => void; backLabel: string }) {
  const rm = growth.roadmap;
  const selected = selectedServices(growth);
  const selectedIds = new Set<string>(selected.map((s) => s.service_id));
  const next = growth.recommendations.filter((r) => !selectedIds.has(r.service_id) && r.category !== 'FUTURE_OPPORTUNITY');
  const actions = roadmapActions(growth, payload);
  const status = (id: string, fallback: string) => growth.milestone_status[id] ?? fallback;
  const completed = rm.delivery_milestones.filter((m) => status(m.milestone_id, m.status) === 'COMPLETE');
  const stagesDone = payload.stages.filter((s) => s.status === 'COMPLETE');
  return (
    <>
      <DfRail index="G4" label="GROWTH ROADMAP" />
      <DfHeadline lines={['YOUR', 'BUSINESS GROWTH', 'ROADMAP']} />
      <DfLede>
        WHERE YOUR BUSINESS STANDS, WHAT SITE 00 IS DOING, AND WHAT COMES NEXT. <strong>IT UPDATES AS YOUR PLAN CHANGES.</strong>
      </DfLede>
      <p className="df-g-version">{roadmapVersionLine(growth)}</p>

      <div className="df-g-aside df-g-lifecycle" aria-label="ENGAGEMENT STATUS">
        {(['foundation', 'growth', 'full_engagement'] as const).map((k) => (
          <div key={k} className={`df-g-lifecycle__cell df-g-lifecycle__cell--${growth.lifecycle[k].toLowerCase()}`} data-lifecycle={k}>
            <span className="df-g-lifecycle__k">{k === 'foundation' ? 'FOUNDATION' : k === 'growth' ? 'GROWTH SERVICES' : 'FULL ENGAGEMENT'}</span>
            <span className="df-g-lifecycle__v">{(LIFECYCLE_LABEL[k] as Record<string, string>)[growth.lifecycle[k]]}</span>
          </div>
        ))}
      </div>

      <RoadmapBlock id="df-g-rm-status" label="CURRENT FOUNDATION STATUS">
        <p className="df-g-rm__line">{(rm.foundation_readiness_summary ?? 'DIGITAL FOUNDATION').toUpperCase()}</p>
      </RoadmapBlock>

      <RoadmapBlock id="df-g-rm-goals" label="YOUR BUSINESS GOALS">
        {rm.client_goals.length ? (
          <ul className="df-g-chips">
            {rm.client_goals.map((g) => (
              <li key={g}>
                <DfIcon name={GOAL_PRESENTATION[g]?.icon ?? 'flag'} /> {GOAL_PRESENTATION[g]?.title ?? g}
              </li>
            ))}
          </ul>
        ) : (
          <p className="df-g-rm__muted">{growth.ambition?.skipped ? 'YOU SKIPPED BUSINESS AMBITION.' : 'NOT SHARED YET.'}</p>
        )}
      </RoadmapBlock>

      <RoadmapBlock id="df-g-rm-selected" label="SELECTED GROWTH SERVICES">
        {selected.length ? (
          <ul className="df-specs">
            {selected.map((s) => (
              <li key={s.service_id} className="df-g-rm__item">
                <span>{s.display_name.toUpperCase()}</span>
                <span className="df-g-plan__pending">AWAITING SCOPE + PRICING APPROVAL</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="df-g-rm__muted">NONE — YOUR PLAN IS FOUNDATION ONLY.</p>
        )}
      </RoadmapBlock>

      <RoadmapBlock id="df-g-rm-next" label="RECOMMENDED NEXT STEPS">
        {next.length ? (
          <ul className="df-specs">
            {next.map((r) => (
              <li key={r.service_id} className="df-g-rm__item">
                <span>{(serviceOf(growth, r.service_id)?.display_name ?? r.service_id).toUpperCase()}</span>
                <Badge tone={CATEGORY_PRESENTATION[r.category].tone}>{CATEGORY_PRESENTATION[r.category].label}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="df-g-rm__muted">NOTHING FURTHER RIGHT NOW.</p>
        )}
      </RoadmapBlock>

      <RoadmapBlock id="df-g-rm-milestones" label="DELIVERY MILESTONES">
        <ol className="df-stages">
          {rm.delivery_milestones.map((m) => {
            const st = status(m.milestone_id, m.status);
            return (
              <li key={m.milestone_id} className={`df-stage df-stage--${st === 'COMPLETE' ? 'complete' : st === 'IN_PROGRESS' ? 'in_progress' : 'pending'}`}>
                <span className="df-stage__node" aria-hidden="true">
                  {st === 'COMPLETE' && <DfIcon name="check" />}
                </span>
                <span className="df-stage__label">
                  {m.kind === 'FOUNDATION_READY' ? 'FOUNDATION READY' : m.kind === 'FULL_PROJECT' ? 'FULL PROJECT DELIVERY' : m.label.toUpperCase()}
                  <span className="df-g-rm__range">{(m.display_range ?? '').toUpperCase()}</span>
                </span>
                <span className="df-stage__status">{MILESTONE_STATUS_LABEL[st as keyof typeof MILESTONE_STATUS_LABEL]}</span>
              </li>
            );
          })}
        </ol>
      </RoadmapBlock>

      <RoadmapBlock id="df-g-rm-needs" label={`NEEDS YOU${actions.length ? ` · ${actions.length}` : ''}`} red={actions.length > 0}>
        {actions.length ? (
          <ul className="df-specs">
            {actions.map((a) => (
              <li key={a.label} className="df-g-rm__item df-g-rm__item--stack">
                <span>{a.label}</span>
                <span className="df-g-rm__muted">{a.detail}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="df-g-rm__muted">NOTHING NEEDS YOU RIGHT NOW.</p>
        )}
      </RoadmapBlock>

      <RoadmapBlock id="df-g-rm-bldr" label="BLDR OPPORTUNITY">
        <p className="df-g-rm__line">
          {rm.bldr_opportunity_notes
            ? rm.bldr_opportunity_notes.toUpperCase()
            : growth.bldr.interest_recorded
              ? 'YOU TOLD SITE 00 YOU ARE INTERESTED IN BLDR — A SEPARATE, MONTH-SCALE PROJECT.'
              : 'NO DIGITAL LOCATION PROJECT IN YOUR PLAN.'}
        </p>
      </RoadmapBlock>

      {(rm.aio_referrals.length > 0 || rm.specialist_referrals.length > 0) && (
        <RoadmapBlock id="df-g-rm-handoffs" label="HANDOFFS + SPECIALIST REVIEW">
          <ul className="df-bullets">
            {rm.aio_referrals.map((r) => (
              <li key={r}>AIO (SEPARATE COMPANY, SEPARATE BILLING): {r.toUpperCase()}</li>
            ))}
            {rm.specialist_referrals.map((r) => (
              <li key={r}>SPECIALIST REVIEW: {r.toUpperCase()}</li>
            ))}
          </ul>
        </RoadmapBlock>
      )}

      <RoadmapBlock id="df-g-rm-done" label="COMPLETED MILESTONES">
        {completed.length || stagesDone.length ? (
          <ul className="df-bullets">
            {completed.map((m) => (
              <li key={m.milestone_id}>{m.kind === 'FOUNDATION_READY' ? 'FOUNDATION READY' : m.label.toUpperCase()}</li>
            ))}
            {stagesDone.map((s) => (
              <li key={s.stage_code}>{s.stage_code.replace(/_/g, ' ')}</li>
            ))}
          </ul>
        ) : (
          <p className="df-g-rm__muted">NONE YET — COMPLETED WORK APPEARS HERE AS SITE 00 FINISHES IT.</p>
        )}
      </RoadmapBlock>

      {rm.future_options.length > 0 && (
        <RoadmapBlock id="df-g-rm-future" label="FUTURE OPPORTUNITIES">
          <ul className="df-bullets df-bullets--muted">
            {rm.future_options.map((f) => (
              <li key={f}>{f.toUpperCase()}</li>
            ))}
          </ul>
        </RoadmapBlock>
      )}

      <div className="df-actions">
        <DfCta tone="outline" label={backLabel} onClick={onBack} />
      </div>
      <DfTrust text="A LIVING PLAN. NOTHING STARTS WITHOUT YOUR APPROVAL." />
    </>
  );
}

// ─── Connectors on existing parents ────────────────────────────────────────────────────────────

/** P04 — the way into Growth, shown only when the server enables it. */
export function GrowthInvite({ growth, onOpen }: { growth: GrowthContext; onOpen: () => void }) {
  const answered = Boolean(growth.ambition && !growth.ambition.skipped && growth.ambition.goals.length);
  const count = growth.selection.selected.length;
  return (
    <button type="button" className="df-g-invite" onClick={onOpen} data-card="growth-invite">
      <span className="df-g-invite__kicker">BUSINESS GROWTH · OPTIONAL</span>
      <span className="df-g-invite__title">{answered ? 'YOUR GROWTH PATH' : "WHAT'S NEXT FOR YOUR BUSINESS?"}</span>
      <span className="df-g-invite__sub">
        {answered
          ? `${ambitionSummaryLine(growth.ambition!.goals)}${count ? ` · ${count} IN YOUR PLAN` : ''}`
          : 'SEE PRACTICAL NEXT STEPS FOR YOUR GOALS. NOTHING IS ADDED TO YOUR QUOTE.'}
      </span>
      <DfIcon name="arrow" className="df-g-invite__arrow" />
    </button>
  );
}

/** P05 — makes clear that Growth selections are not part of the Foundation checkout. */
export function GrowthCheckoutNote({ growth }: { growth: GrowthContext }) {
  const n = growth.selection.selected.length;
  if (!n) return null;
  return (
    <DfAlert tone="ink" icon="layers" role="status">
      YOUR {n} GROWTH SERVICE{n === 1 ? ' IS' : 'S ARE'} NOT PART OF THIS CHECKOUT. SITE 00 CONFIRMS SCOPE AND PRICING SEPARATELY — NOTHING
      FOR GROWTH IS CHARGED HERE.
    </DfAlert>
  );
}

/** Project overview — Growth in the context of what the client actually purchased. */
export function GrowthPortalPanel({ growth, onRoadmap }: { growth: GrowthContext; onRoadmap: () => void }) {
  const selected = selectedServices(growth);
  const next = growth.recommendations.find((r) => !selected.some((s) => s.service_id === r.service_id) && r.category !== 'FUTURE_OPPORTUNITY');
  return (
    <section className="df-section df-g-portal" aria-labelledby="df-g-portal-h" data-card="growth-portal">
      <SectionLabel id="df-g-portal-h">BUSINESS GROWTH</SectionLabel>
      <ul className="df-g-portal__rows">
        <li>
          <span>YOU PURCHASED</span>
          <span>DIGITAL FOUNDATION · {LIFECYCLE_LABEL.foundation[growth.lifecycle.foundation]}</span>
        </li>
        <li>
          <span>GROWTH SERVICES</span>
          <span>{selected.length ? `${selected.map((s) => s.display_name.toUpperCase()).join(' · ')} — AWAITING SCOPE + PRICING APPROVAL` : 'NONE SELECTED'}</span>
        </li>
        <li>
          <span>SITE 00 RECOMMENDS NEXT</span>
          <span>{next ? (serviceOf(growth, next.service_id)?.display_name ?? next.service_id).toUpperCase() : 'NOTHING FURTHER RIGHT NOW'}</span>
        </li>
      </ul>
      <button type="button" className="df-link df-link--row" onClick={onRoadmap}>
        VIEW MY GROWTH ROADMAP
        <DfIcon name="chevron" />
      </button>
    </section>
  );
}
