import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode, type Ref } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { InvitationEntryPresentation } from '../../../../shared/site00-invitation-system/contracts/entryPresentation.js';
import { SITE00_ROUTES } from '../../config/routes.js';
import {
  FOUNDATION_PROGRESS_COPY,
  INVITATION_STAGES,
  InvitationRequestError,
  beginActivation,
  clearInvitationDeviceRecord,
  completeActivation,
  formatMinor,
  foundationProgress,
  invitationAvailability,
  isFoundationRoute,
  isPlausibleEmail,
  loadFoundationCatalogConfig,
  loadFoundationPayload,
  readInvitationDeviceRecord,
  resolveInvitation,
  writeInvitationDeviceRecord,
  type FoundationCatalogConfig,
  type FoundationProgress,
  type InvitationAvailability,
  type InvitationFailureKind,
  type InvitationStageIndex,
  type VerificationDelivery,
} from './invitationJourney';
import '../../styles/site00-invitation.css';

export type InvitationView =
  | { kind: 'RESOLVING' }
  | { kind: 'FAILED'; failure: 'NETWORK' | 'SERVER' }
  | { kind: 'UNAVAILABLE'; availability: Exclude<InvitationAvailability, 'OPEN'> }
  | { kind: 'CHECKING_RETURN' }
  | { kind: 'RETURNING'; route: string; progress: FoundationProgress | null }
  | { kind: 'RESET' }
  | { kind: 'WELCOME' }
  | { kind: 'ACTIVATE_EMAIL' }
  | { kind: 'ACTIVATE_BLOCKED' }
  | { kind: 'ACTIVATE_VERIFY'; activationId: string; email: string; developmentCode: string | null }
  | { kind: 'READY'; route: string };

export function stageForView(view: InvitationView): InvitationStageIndex {
  switch (view.kind) {
    case 'ACTIVATE_EMAIL':
    case 'ACTIVATE_BLOCKED':
    case 'ACTIVATE_VERIFY':
      return 2;
    case 'READY':
      return 3;
    case 'RETURNING':
      return view.progress ? FOUNDATION_PROGRESS_COPY[view.progress].stage : 3;
    default:
      return 1;
  }
}

export function maskEmail(email: string): string {
  const [local = '', domain = ''] = email.trim().split('@');
  if (!domain) return email;
  return `${local.slice(0, 1)}${'•'.repeat(Math.max(2, Math.min(local.length - 1, 5)))}@${domain}`;
}

const FAILURE_COPY: Partial<Record<InvitationFailureKind, string>> = {
  NETWORK: 'CONNECTION LOST. CHECK YOUR SIGNAL AND TRY AGAIN.',
  SERVER: 'SITE 00 COULD NOT COMPLETE THAT STEP. TRY AGAIN IN A MOMENT.',
  VERIFICATION: 'THAT CODE DID NOT MATCH. CHECK IT AND TRY AGAIN.',
  INPUT: 'SOMETHING IN THAT REQUEST WAS NOT ACCEPTED. CHECK YOUR EMAIL AND TRY AGAIN.',
};

const FOUNDATION_ITEMS = [
  { n: '01', t: 'DOMAIN', d: 'Your business address on the web, registered so you control it.' },
  { n: '02', t: 'PROFESSIONAL EMAIL', d: 'Mail at your own domain instead of a personal inbox.' },
  { n: '03', t: 'DNS + SECURITY', d: 'Records configured so your mail is delivered and trusted.' },
  { n: '04', t: 'DEVICE + SIGNATURE', d: 'Your primary device and email signature set up.' },
  { n: '05', t: 'OWNERSHIP', d: 'Accounts recorded in your name, not ours.' },
] as const;

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/* ───────────────────────── Presentational layer ───────────────────────── */

export type InvitationExperienceProps = {
  view: InvitationView;
  presentation: InvitationEntryPresentation | null;
  delivery: VerificationDelivery;
  inMemory: boolean;
  config: FoundationCatalogConfig | null;
  busy: boolean;
  error: string | null;
  announcement: string;
  reducedMotion: boolean;
  headingRef?: Ref<HTMLHeadingElement>;
  onRetry: () => void;
  onBegin: () => void;
  onBack: () => void;
  onSubmitEmail: (email: string) => void;
  onSubmitCode: (code: string) => void;
  onStartFresh: () => void;
};

function Wordmark() {
  return (
    <span className="s00inv__wm">
      SITE 00<i className="s00inv__dia" aria-hidden="true" />
    </span>
  );
}

function ThresholdWorld({ stage }: { stage: InvitationStageIndex }) {
  return (
    <div className="s00inv__world" data-world-stage={stage} aria-hidden="true">
      <div className="s00inv__room">
        <span className="s00inv__frame s00inv__frame--1" />
        <span className="s00inv__frame s00inv__frame--2" />
        <span className="s00inv__frame s00inv__frame--3" />
        <span className="s00inv__frame s00inv__frame--4" />
        <span className="s00inv__aperture" />
        <span className="s00inv__glass" />
        <span className="s00inv__floor" />
        <span className="s00inv__line" />
      </div>
      <div className="s00inv__card">
        <span className="s00inv__card-wm">
          SITE 00<i />
        </span>
        <span className="s00inv__card-num">
          INVITATION <b>001</b>
        </span>
        <span className="s00inv__card-hl">
          YOUR BUSINESS
          <br />
          HAS AN ADDRESS.
        </span>
        <span className="s00inv__card-rule" />
      </div>
    </div>
  );
}

function StageRail({ stage }: { stage: InvitationStageIndex }) {
  return (
    <nav className="s00inv__rail" aria-label="Invitation progress">
      <ol>
        {INVITATION_STAGES.map((s, i) => {
          const state = i < stage ? 'done' : i === stage ? 'current' : 'next';
          return (
            <li key={s.n} data-state={state} aria-current={state === 'current' ? 'step' : undefined}>
              <span className="s00inv__rail-n">{s.n}</span>
              <span className="s00inv__rail-l">{s.label}</span>
              <span className="visually-hidden">
                {state === 'done' ? ' (complete)' : state === 'current' ? ' (current step)' : ''}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Heading({ children, headingRef, level = 1 }: { children: ReactNode; headingRef?: Ref<HTMLHeadingElement>; level?: 1 | 2 }) {
  const Tag = level === 1 ? 'h1' : 'h2';
  return (
    <Tag className="s00inv__h" ref={headingRef} tabIndex={-1} id="s00inv-heading">
      {children}
    </Tag>
  );
}

function ErrorLine({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p className="s00inv__error" role="alert" id="s00inv-error">
      {error}
    </p>
  );
}

function BldrDiscovery() {
  return (
    <aside className="s00inv__next" aria-labelledby="s00inv-next-title">
      <p className="s00inv__eyebrow">05 · DISCOVER WHAT COMES NEXT</p>
      <h2 id="s00inv-next-title" className="s00inv__next-title">
        SITE 00 BLDR
      </h2>
      <p>
        Once your foundation is in place, BLDR is where the website for your address is designed and built. Look around
        whenever you are ready. Exploring it does not start a project or a charge.
      </p>
      <Link className="s00inv__link" to={SITE00_ROUTES.bldr}>
        EXPLORE BLDR <span aria-hidden="true">→</span>
      </Link>
    </aside>
  );
}

function PriceDisclosure({ config }: { config: FoundationCatalogConfig | null }) {
  return (
    <section className="s00inv__price" aria-labelledby="s00inv-price-title">
      <h3 id="s00inv-price-title" className="s00inv__label">
        WHAT IT COSTS
      </h3>
      {config ? (
        <>
          <p className="s00inv__price-figure">
            <span>DIGITAL FOUNDATION</span>
            <strong>FROM {formatMinor(config.base_price_minor, config.base_currency)}</strong>
          </p>
          <p>
            Typical timeline: {config.base_min_business_days}–{config.base_max_business_days} business days from when your
            details are complete.
          </p>
          <p className="s00inv__fine">{config.third_party_cost_notice}</p>
        </>
      ) : null}
      <p className="s00inv__assure">YOUR SCOPE AND FINAL PRICE ARE SHOWN BEFORE CHECKOUT. ACTIVATING DOES NOT CHARGE YOU.</p>
    </section>
  );
}

function PreviewNotice({ inMemory }: { inMemory: boolean }) {
  if (!inMemory) return null;
  return (
    <p className="s00inv__devnote" data-testid="persistence-note">
      PREVIEW ENVIRONMENT · ACTIVATIONS ARE HELD IN SERVER MEMORY AND RESET WHEN IT RESTARTS.
    </p>
  );
}

function EmailForm({ busy, error, onSubmit, onBack }: { busy: boolean; error: string | null; onSubmit: (email: string) => void; onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const invalid = touched && !isPlausibleEmail(email);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isPlausibleEmail(email) || busy) return;
    onSubmit(email);
  };
  return (
    <form className="s00inv__form" onSubmit={submit} noValidate>
      <label className="s00inv__label" htmlFor="s00inv-email">
        EMAIL
      </label>
      <input
        id="s00inv-email"
        className="s00inv__input"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        value={email}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? 's00inv-email-hint s00inv-email-invalid' : 's00inv-email-hint'}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setTouched(true)}
        disabled={busy}
      />
      <p className="s00inv__hint" id="s00inv-email-hint">
        Used only to verify it is you. It never appears in a link.
      </p>
      {invalid ? (
        <p className="s00inv__error" id="s00inv-email-invalid">
          ENTER A COMPLETE EMAIL ADDRESS.
        </p>
      ) : null}
      <ErrorLine error={error} />
      <div className="s00inv__actions">
        <button type="submit" className="s00inv__cta" disabled={busy} aria-busy={busy || undefined}>
          {busy ? 'SENDING…' : 'CONTINUE'}
        </button>
        <button type="button" className="s00inv__ghost" onClick={onBack} disabled={busy}>
          BACK
        </button>
      </div>
    </form>
  );
}

function CodeForm({
  view,
  busy,
  error,
  onSubmit,
}: {
  view: Extract<InvitationView, { kind: 'ACTIVATE_VERIFY' }>;
  busy: boolean;
  error: string | null;
  onSubmit: (code: string) => void;
}) {
  const [code, setCode] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || busy) return;
    onSubmit(code);
  };
  return (
    <form className="s00inv__form" onSubmit={submit} noValidate>
      {view.developmentCode ? (
        <div className="s00inv__devpanel" role="note" aria-label="Development verification code">
          <p className="s00inv__devpanel-tag">DEVELOPMENT ONLY · NOT PRODUCTION DELIVERY</p>
          <p>
            In production this code arrives through SITE 00 identity verification. This environment shows it here so the
            flow can be tested.
          </p>
          <div className="s00inv__devpanel-row">
            <code className="s00inv__devcode">{view.developmentCode}</code>
            <button type="button" className="s00inv__ghost" onClick={() => setCode(view.developmentCode ?? '')} disabled={busy}>
              USE THIS CODE
            </button>
          </div>
        </div>
      ) : null}
      <label className="s00inv__label" htmlFor="s00inv-code">
        VERIFICATION CODE
      </label>
      <input
        id="s00inv-code"
        className="s00inv__input s00inv__input--code"
        type="text"
        inputMode="text"
        autoComplete="one-time-code"
        autoCapitalize="characters"
        spellCheck={false}
        required
        value={code}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? 's00inv-code-hint s00inv-error' : 's00inv-code-hint'}
        onChange={(e) => setCode(e.target.value)}
        disabled={busy}
      />
      <p className="s00inv__hint" id="s00inv-code-hint">
        Code for {maskEmail(view.email)}.
      </p>
      <ErrorLine error={error} />
      <div className="s00inv__actions">
        <button type="submit" className="s00inv__cta" disabled={busy || !code.trim()} aria-busy={busy || undefined}>
          {busy ? 'VERIFYING…' : 'VERIFY AND OPEN MY FOUNDATION'}
        </button>
      </div>
    </form>
  );
}

function StageBody(props: InvitationExperienceProps) {
  const { view, presentation, delivery, config, busy, error, headingRef } = props;

  switch (view.kind) {
    case 'RESOLVING':
    case 'CHECKING_RETURN':
      return (
        <div className="s00inv__body" aria-busy="true">
          <p className="s00inv__eyebrow">01 · SCAN THE INVITATION</p>
          <Heading headingRef={headingRef}>{view.kind === 'RESOLVING' ? 'OPENING YOUR INVITATION.' : 'CHECKING YOUR FOUNDATION.'}</Heading>
          <span className="s00inv__pulse" aria-hidden="true" />
        </div>
      );

    case 'FAILED':
      return (
        <div className="s00inv__body">
          <p className="s00inv__eyebrow">{view.failure === 'NETWORK' ? 'NETWORK UNAVAILABLE' : 'SERVICE UNAVAILABLE'}</p>
          <Heading headingRef={headingRef}>{view.failure === 'NETWORK' ? 'YOU APPEAR TO BE OFFLINE.' : 'THIS INVITATION COULD NOT OPEN.'}</Heading>
          <p className="s00inv__lede">
            {view.failure === 'NETWORK'
              ? 'Reconnect and try again. Nothing has been submitted.'
              : 'The problem is on our side, not with your card. Try again in a moment.'}
          </p>
          <div className="s00inv__actions">
            <button type="button" className="s00inv__cta" onClick={props.onRetry}>
              TRY AGAIN
            </button>
          </div>
        </div>
      );

    case 'UNAVAILABLE': {
      const copy = {
        UNAVAILABLE: {
          h: 'THIS INVITATION IS NOT AVAILABLE.',
          p: 'Check the link printed on your card. If it still does not open, you can visit SITE 00 directly.',
        },
        EXPIRED: {
          h: 'THIS INVITATION HAS EXPIRED.',
          p: 'Invitations are issued for a limited time. Ask the office that gave you this card for a current one.',
        },
        PAUSED: {
          h: 'THIS INVITATION IS PAUSED.',
          p: 'Activations from this invitation are on hold for now. Your card will work again when it resumes.',
        },
      }[view.availability];
      return (
        <div className="s00inv__body" data-availability={view.availability}>
          <p className="s00inv__eyebrow">INVITATION</p>
          <Heading headingRef={headingRef}>{copy.h}</Heading>
          <p className="s00inv__lede">{copy.p}</p>
          <div className="s00inv__actions">
            <Link className="s00inv__ghost" to={SITE00_ROUTES.origin}>
              VISIT SITE 00
            </Link>
          </div>
        </div>
      );
    }

    case 'RESET':
      return (
        <div className="s00inv__body">
          <p className="s00inv__eyebrow">WELCOME BACK</p>
          <Heading headingRef={headingRef}>WE COULD NOT FIND YOUR FOUNDATION.</Heading>
          <p className="s00inv__lede">
            This device remembers a Foundation workspace that the server no longer has. In this preview environment,
            activations are held in memory and are cleared when the server restarts.
          </p>
          <div className="s00inv__actions">
            <button type="button" className="s00inv__cta" onClick={props.onStartFresh}>
              START AGAIN
            </button>
          </div>
        </div>
      );

    case 'RETURNING': {
      const copy = view.progress ? FOUNDATION_PROGRESS_COPY[view.progress] : null;
      return (
        <div className="s00inv__body" data-progress={view.progress ?? 'UNCONFIRMED'}>
          <p className="s00inv__eyebrow">
            <span className="s00inv__tick" aria-hidden="true" />
            WELCOME BACK
          </p>
          <Heading headingRef={headingRef}>{copy ? copy.headline : 'YOUR FOUNDATION IS WAITING.'}</Heading>
          <p className="s00inv__lede">
            {copy ? copy.detail : 'We could not confirm its status just now. Your workspace link still works.'}
          </p>
          <div className="s00inv__actions">
            <Link className="s00inv__cta" to={view.route} data-testid="foundation-handoff">
              {copy ? copy.action : 'OPEN YOUR FOUNDATION'} <span aria-hidden="true">→</span>
            </Link>
            <button type="button" className="s00inv__ghost" onClick={props.onStartFresh}>
              NOT YOU? START A NEW ACTIVATION
            </button>
          </div>
          <BldrDiscovery />
        </div>
      );
    }

    case 'WELCOME':
      return (
        <div className="s00inv__body">
          <p className="s00inv__eyebrow">
            <span className="s00inv__tick" aria-hidden="true" />
            {presentation?.collection_label ?? 'INVITATION'} · RECEIVED
          </p>
          <Heading headingRef={headingRef}>
            YOUR BUSINESS HAS AN ADDRESS.
            <span className="s00inv__h-sub">NOW GIVE IT A PRESENCE.</span>
          </Heading>
          <p className="s00inv__lede">
            You have been invited to set up your {presentation?.primary_service ?? 'SITE 00 DIGITAL FOUNDATION'}: the domain,
            professional email, and security your business uses to exist online, owned in your name.
          </p>
          <div className="s00inv__actions">
            <button type="button" className="s00inv__cta" onClick={props.onBegin}>
              ACTIVATE YOUR FOUNDATION
            </button>
            <a className="s00inv__ghost" href="#s00inv-welcome">
              WHAT IS INCLUDED
            </a>
          </div>

          <section className="s00inv__welcome" id="s00inv-welcome" aria-labelledby="s00inv-welcome-title">
            <p className="s00inv__eyebrow">02 · WELCOME TO YOUR NEXT ADDRESS</p>
            <h2 id="s00inv-welcome-title" className="s00inv__h2">
              YOUR DIGITAL FOUNDATION.
            </h2>
            <ol className="s00inv__items">
              {FOUNDATION_ITEMS.map((item) => (
                <li key={item.n}>
                  <span className="s00inv__items-n">{item.n}</span>
                  <span className="s00inv__items-t">{item.t}</span>
                  <span className="s00inv__items-d">{item.d}</span>
                </li>
              ))}
            </ol>
            <PriceDisclosure config={config} />
            <section className="s00inv__how" aria-labelledby="s00inv-how-title">
              <h3 id="s00inv-how-title" className="s00inv__label">
                HOW ACTIVATION WORKS
              </h3>
              <ol>
                <li>Confirm your email.</li>
                <li>Verify it is you.</li>
                <li>Your private Foundation workspace opens.</li>
              </ol>
            </section>
            <p className="s00inv__privacy">
              THIS CARD IS SHARED. IT OPENS THIS INVITATION, NOT AN ACCOUNT. YOUR WORKSPACE OPENS ONLY AFTER YOU VERIFY.
            </p>
            <div className="s00inv__actions">
              <button type="button" className="s00inv__cta" onClick={props.onBegin}>
                ACTIVATE YOUR FOUNDATION
              </button>
            </div>
          </section>
        </div>
      );

    case 'ACTIVATE_BLOCKED':
      return (
        <div className="s00inv__body" data-delivery={delivery}>
          <p className="s00inv__eyebrow">03 · ACTIVATE YOUR FOUNDATION</p>
          <Heading headingRef={headingRef}>ACTIVATION OPENS SOON.</Heading>
          <p className="s00inv__status">VERIFICATION REQUIRED · NOT YET AVAILABLE</p>
          <p className="s00inv__lede">
            Identity verification for invitations is still being connected to SITE 00. Until it is, a Foundation workspace
            cannot be opened from this card, so we are not asking for your details yet.
          </p>
          <div className="s00inv__actions">
            <button type="button" className="s00inv__ghost" onClick={props.onBack}>
              BACK
            </button>
          </div>
        </div>
      );

    case 'ACTIVATE_EMAIL':
      return (
        <div className="s00inv__body">
          <p className="s00inv__eyebrow">03 · ACTIVATE YOUR FOUNDATION</p>
          <Heading headingRef={headingRef}>WHERE SHOULD WE REACH YOU?</Heading>
          <p className="s00inv__lede">Enter the email your Foundation workspace should belong to. We will verify it before anything opens.</p>
          <EmailForm busy={busy} error={error} onSubmit={props.onSubmitEmail} onBack={props.onBack} />
        </div>
      );

    case 'ACTIVATE_VERIFY':
      return (
        <div className="s00inv__body">
          <p className="s00inv__eyebrow">03 · ACTIVATE YOUR FOUNDATION</p>
          <Heading headingRef={headingRef}>VERIFY IT IS YOU.</Heading>
          <CodeForm view={view} busy={busy} error={error} onSubmit={props.onSubmitCode} />
        </div>
      );

    case 'READY':
      return (
        <div className="s00inv__body">
          <p className="s00inv__eyebrow">
            <span className="s00inv__tick" aria-hidden="true" />
            IDENTITY VERIFIED
          </p>
          <Heading headingRef={headingRef}>YOUR FOUNDATION IS OPEN.</Heading>
          <p className="s00inv__lede">
            Your private Digital Foundation workspace is ready. Tell us about your business there, review your scope and
            price, and decide when to begin.
          </p>
          <div className="s00inv__actions">
            <Link className="s00inv__cta" to={view.route} data-testid="foundation-handoff">
              COMPLETE YOUR DIGITAL FOUNDATION <span aria-hidden="true">→</span>
            </Link>
          </div>
          <PreviewNotice inMemory={props.inMemory} />
          <BldrDiscovery />
        </div>
      );
  }
}

const RAIL_HIDDEN: ReadonlySet<InvitationView['kind']> = new Set(['UNAVAILABLE', 'FAILED', 'RESET']);

export function InvitationExperience(props: InvitationExperienceProps) {
  const stage = stageForView(props.view);
  const generic = props.view.kind === 'UNAVAILABLE' && props.view.availability === 'UNAVAILABLE';
  const meta = generic ? null : props.presentation;
  return (
    <main
      className="s00inv"
      data-view={props.view.kind}
      data-stage={stage}
      data-motion={props.reducedMotion ? 'reduced' : 'full'}
      aria-labelledby="s00inv-heading"
    >
      <header className="s00inv__mast">
        <Link to={SITE00_ROUTES.origin} className="s00inv__home" aria-label="SITE 00 home">
          <Wordmark />
        </Link>
        <span className="s00inv__collection">{meta?.collection_label ?? 'INVITATION'}</span>
      </header>
      <ThresholdWorld stage={stage} />
      <div className="s00inv__column">
        {RAIL_HIDDEN.has(props.view.kind) ? null : <StageRail stage={stage} />}
        <p className="visually-hidden" aria-live="polite" aria-atomic="true">
          {props.announcement}
        </p>
        <StageBody {...props} />
        <footer className="s00inv__foot">
          {meta ? (
            <>
              <span>{meta.partner_presented_through}</span>
              <span>
                INVITATION SYSTEM {meta.invitation_system_version} · POLICY {meta.policy_version}
              </span>
            </>
          ) : null}
        </footer>
      </div>
    </main>
  );
}

/* ───────────────────────── Stateful page ───────────────────────── */

export default function InvitationEntryPage() {
  const { code = '' } = useParams<{ code: string }>();
  const reducedMotion = useReducedMotion();
  const [view, setView] = useState<InvitationView>({ kind: 'RESOLVING' });
  const [presentation, setPresentation] = useState<InvitationEntryPresentation | null>(null);
  const [visitId, setVisitId] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<VerificationDelivery>('PENDING_IDNTY');
  const [inMemory, setInMemory] = useState(false);
  const [config, setConfig] = useState<FoundationCatalogConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const inFlight = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstView = useRef(true);

  const go = useCallback((next: InvitationView) => {
    setError(null);
    setView(next);
  }, []);

  const checkReturning = useCallback(
    async (route: string) => {
      go({ kind: 'CHECKING_RETURN' });
      try {
        const payload = await loadFoundationPayload(route);
        go({ kind: 'RETURNING', route, progress: foundationProgress(payload) });
      } catch (e) {
        if (e instanceof InvitationRequestError && e.kind === 'SESSION_LOST') {
          clearInvitationDeviceRecord(code);
          go({ kind: 'RESET' });
          return;
        }
        go({ kind: 'RETURNING', route, progress: null });
      }
    },
    [code, go],
  );

  const resolve = useCallback(async () => {
    if (!code) {
      go({ kind: 'UNAVAILABLE', availability: 'UNAVAILABLE' });
      return;
    }
    go({ kind: 'RESOLVING' });
    try {
      const data = await resolveInvitation(code);
      setPresentation(data.presentation);
      setVisitId(data.visit_id);
      setDelivery(data.verification_delivery ?? 'PENDING_IDNTY');
      setInMemory(data.persistence !== 'PERSISTENT');
      const availability = invitationAvailability(data.presentation.resolution);
      if (availability !== 'OPEN') {
        go({ kind: 'UNAVAILABLE', availability });
        return;
      }
      const record = readInvitationDeviceRecord(code);
      if (record) {
        await checkReturning(record.foundation_route);
        return;
      }
      go({ kind: 'WELCOME' });
    } catch (e) {
      const kind = e instanceof InvitationRequestError ? e.kind : 'SERVER';
      if (kind === 'NETWORK') go({ kind: 'FAILED', failure: 'NETWORK' });
      else if (kind === 'SERVER') go({ kind: 'FAILED', failure: 'SERVER' });
      else go({ kind: 'UNAVAILABLE', availability: 'UNAVAILABLE' });
    }
  }, [code, go, checkReturning]);

  useLayoutEffect(() => {
    document.body.classList.add('s00inv-body');
    return () => document.body.classList.remove('s00inv-body');
  }, []);

  useEffect(() => {
    void resolve();
    void loadFoundationCatalogConfig().then(setConfig);
  }, [resolve]);

  useEffect(() => {
    const stage = INVITATION_STAGES[stageForView(view)];
    setAnnouncement(`STEP ${stage.n} OF 05: ${stage.label}`);
    if (firstView.current) {
      if (view.kind !== 'RESOLVING') firstView.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [view.kind, reducedMotion]);

  const fail = (e: unknown) => {
    const kind = e instanceof InvitationRequestError ? e.kind : 'SERVER';
    if (kind === 'UNAVAILABLE') {
      go({ kind: 'UNAVAILABLE', availability: 'UNAVAILABLE' });
      return;
    }
    if (kind === 'SESSION_LOST') {
      setError(null);
      void resolve();
      return;
    }
    setError(FAILURE_COPY[kind] ?? FAILURE_COPY.SERVER!);
  };

  const onSubmitEmail = async (email: string) => {
    if (inFlight.current || !visitId) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      const json = await beginActivation(code, visitId, email);
      setPresentation(json.presentation);
      go({
        kind: 'ACTIVATE_VERIFY',
        activationId: json.activation_id,
        email,
        developmentCode: json.verification_delivery === 'DEVELOPMENT_INLINE' ? json.development_verification_code ?? null : null,
      });
    } catch (e) {
      fail(e);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const onSubmitCode = async (secret: string) => {
    if (inFlight.current || view.kind !== 'ACTIVATE_VERIFY') return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      const json = await completeActivation(code, view.activationId, secret);
      if (!isFoundationRoute(json.foundation_route)) throw new InvitationRequestError('SERVER', 'Unexpected route');
      setPresentation(json.presentation);
      writeInvitationDeviceRecord(code, json.foundation_route);
      go({ kind: 'READY', route: json.foundation_route });
    } catch (e) {
      fail(e);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  return (
    <InvitationExperience
      view={view}
      presentation={presentation}
      delivery={delivery}
      inMemory={inMemory}
      config={config}
      busy={busy}
      error={error}
      announcement={announcement}
      reducedMotion={reducedMotion}
      headingRef={headingRef}
      onRetry={() => void resolve()}
      onBegin={() => go(delivery === 'DEVELOPMENT_INLINE' ? { kind: 'ACTIVATE_EMAIL' } : { kind: 'ACTIVATE_BLOCKED' })}
      onBack={() => go({ kind: 'WELCOME' })}
      onSubmitEmail={(email) => void onSubmitEmail(email)}
      onSubmitCode={(c) => void onSubmitCode(c)}
      onStartFresh={() => {
        clearInvitationDeviceRecord(code);
        void resolve();
      }}
    />
  );
}
