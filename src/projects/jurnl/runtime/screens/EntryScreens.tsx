/**
 * F01.00 WELCOME · F01.14 VALUE PROPOSITION · F01.15 KEY BENEFITS · F01.16 GET STARTED · F01.01 CREATE ACCOUNT ·
 * F01.02 EMAIL VERIFICATION · F01.03 SIGN IN (ENTRY v2 01–07) · F01.04 RETURNING USER UNLOCK
 */

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { F01_COPY, isValidEmail, passwordRuleState, passwordSatisfied } from '../../data/f01/copy';
import { JurnlIcon } from '../components/icons';
import {
  JurnlButton,
  JurnlDrawer,
  JurnlErrorPanel,
  JurnlExternalHandoff,
  JurnlHeadline,
  JurnlInlineExpansion,
  JurnlInput,
  JurnlLines,
  JurnlLogo,
  JurnlModal,
  JurnlNativeHandoff,
  JurnlRow,
  JurnlSheet,
  JurnlTextLink,
  JurnlTile,
} from '../components/primitives';
import { EntrySurface, EntryV2Stage } from '../components/EntryV2Stage';
import { E2Brand, E2Button, E2Check, E2Field, E2Link, E2Note, E2Text, at, down, downT, fitLine, grow } from '../components/EntryV2Parts';
import { ENTRY_V2_BEGIN, ENTRY_V2_BENEFITS, ENTRY_V2_CREATE, ENTRY_V2_SIGNIN, ENTRY_V2_VALUE, ENTRY_V2_VERIFY, ENTRY_V2_WELCOME } from '../layout/entryV2Layout';
import type { RefBox, RefType } from '../layout/referenceLayout';
import plateWelcome from '../../families/F01_ENTRY/ENTRY_V2/plates/ENTRY_V2_01_WELCOME_PLATE.jpg';
import plateValue from '../../families/F01_ENTRY/ENTRY_V2/plates/ENTRY_V2_02_VALUE_PROPOSITION_PLATE.jpg';
import plateBenefits from '../../families/F01_ENTRY/ENTRY_V2/plates/ENTRY_V2_03_KEY_BENEFITS_PLATE.jpg';
import plateBegin from '../../families/F01_ENTRY/ENTRY_V2/plates/ENTRY_V2_04_GET_STARTED_PLATE.jpg';
import plateCreate from '../../families/F01_ENTRY/ENTRY_V2/plates/ENTRY_V2_05_CREATE_ACCOUNT_PLATE.jpg';
import plateVerify from '../../families/F01_ENTRY/ENTRY_V2/plates/ENTRY_V2_06_EMAIL_VERIFICATION_PLATE.jpg';
import plateSignIn from '../../families/F01_ENTRY/ENTRY_V2/plates/ENTRY_V2_07_SIGN_IN_PLATE.jpg';
import lockupSprig from '../../families/F09_SAFE/REFERENCE_REPLICA/assets/LOCKUP_SPRIG.png';
import type { AuthErrorCode, SocialProvider } from '../state/adapters';
import { initialsOf, rememberAccount, useJurnl, type RememberedAccount } from '../state/store';
import { JurnlScreen } from './JurnlScreen';

const C = F01_COPY;

/** Shared post-auth routing (sign in, unlock): verification → Face ID → device trust → entry complete. */
export function usePostAuthRoute() {
  const { device, go } = useJurnl();
  return (account: { emailVerified: boolean }) => {
    if (!account.emailVerified) return go('F01.02');
    if (device.biometric === 'UNDECIDED') return go('F01.09');
    if (device.deviceTrust === 'UNDECIDED') return go('F01.10');
    return go('F01.13');
  };
}

export function useNetworkToast() {
  const { showToast } = useJurnl();
  return (code: AuthErrorCode) => {
    if (code === 'NETWORK' || code === 'OFFLINE') showToast({ tone: 'error', title: C.network.title, body: C.network.body, testId: 'toast-network' });
    else if (code === 'NOT_CONFIGURED') showToast({ tone: 'error', title: C.unconfigured.title, body: C.unconfigured.body, testId: 'toast-unconfigured' });
  };
}

/* ───────────── social auth boundary (shared by F01.01 + F01.03) ───────────── */
export function SocialAuthBoundary({ provider }: { provider: SocialProvider }) {
  const { auth, closeOverlay, postToHost } = useJurnl();
  const [phase, setPhase] = useState<'confirm' | 'waiting' | 'unavailable'>('confirm');
  const name = provider === 'APPLE' ? 'APPLE' : 'GOOGLE';
  if (phase === 'unavailable') {
    return (
      <JurnlModal
        testId={`social-${provider.toLowerCase()}`}
        title={C.social.unavailableTitle(name)}
        body={C.social.unavailableBody}
        icon="alert"
        tone="wine"
        onCancel={closeOverlay}
        cancelLabel={C.common.close}
      />
    );
  }
  return (
    <JurnlNativeHandoff
      testId={`social-${provider.toLowerCase()}`}
      icon={provider === 'APPLE' ? 'apple' : 'google'}
      title={C.social.redirecting(name)}
      body={C.social.redirectBody}
      waiting={phase === 'waiting'}
      waitingLabel={C.social.redirecting(name)}
      continueLabel={C.common.continue}
      onContinue={async () => {
        setPhase('waiting');
        postToHost({ type: 'handoff', target: `${name}_SIGN_IN`, boundary: 'SOCIAL_AUTH' });
        const res = await auth.social(provider);
        if (!res.ok) setPhase('unavailable');
      }}
      onCancel={closeOverlay}
    />
  );
}

export function MailHandoff({ target = 'MAIL' }: { target?: 'MAIL' | 'SUPPORT' }) {
  const { bridge, closeOverlay } = useJurnl();
  const copy = target === 'MAIL' ? C.mailHandoff : C.supportHandoff;
  return (
    <JurnlExternalHandoff
      testId={target === 'MAIL' ? 'mail' : 'support'}
      icon={target === 'MAIL' ? 'email' : 'external'}
      title={copy.title}
      body={copy.body}
      continueLabel={copy.continue}
      onContinue={async () => {
        await bridge.openExternal(target);
        closeOverlay();
      }}
      onCancel={closeOverlay}
    />
  );
}

/* ───────────── ENTRY v2 (P0.JURNL.ENTRY-V2.FIRST-7.AUTHORITY-PLUS-PLATE-LIVE-WIRING1) ─────────────
 * The seven ENTRY v2 parents are drawn on their approved plates (EntryV2Stage): each authority is the layout, its
 * plate is the page's environment, and every line, field and control below is live, at the authority's measured
 * place (layout/entryV2Layout.ts, scripts/jurnl/entry-v2). Behaviour is the F01 runtime's own. */
const E2_PLATES = {
  welcome: { src: plateWelcome, assetId: 'ENTRY_V2.01_WELCOME.PLATE', screen: '01_WELCOME' },
  value: { src: plateValue, assetId: 'ENTRY_V2.02_VALUE_PROPOSITION.PLATE', screen: '02_VALUE_PROPOSITION' },
  benefits: { src: plateBenefits, assetId: 'ENTRY_V2.03_KEY_BENEFITS.PLATE', screen: '03_KEY_BENEFITS' },
  begin: { src: plateBegin, assetId: 'ENTRY_V2.04_GET_STARTED.PLATE', screen: '04_GET_STARTED' },
  create: { src: plateCreate, assetId: 'ENTRY_V2.05_CREATE_ACCOUNT.PLATE', screen: '05_CREATE_ACCOUNT' },
  verify: { src: plateVerify, assetId: 'ENTRY_V2.06_EMAIL_VERIFICATION.PLATE', screen: '06_EMAIL_VERIFICATION' },
  signin: { src: plateSignIn, assetId: 'ENTRY_V2.07_SIGN_IN.PLATE', screen: '07_SIGN_IN' },
} as const;

/* ───────────── F01.00 WELCOME (ENTRY v2 01) ───────────── */
export function WelcomeScreen() {
  const { go } = useJurnl();
  const L = ENTRY_V2_WELCOME;
  const T = L.text;
  const head = [T.h1, T.h2, T.h3, T.h4, T.h5];
  return (
    <EntryV2Stage screenId="F01.00" plate={E2_PLATES.welcome} ui={L.ui} focal={L.focal} label="WELCOME">
      <E2Brand t={T.brand} label={`JURNL. ${C.brand.line}`} className="jrn-e2--light">
        <img className="jrn-e2__sprig" src={lockupSprig} alt="" aria-hidden draggable={false} style={at(L.box.sprig)} />
        <E2Text t={T.brandLine} as="span" aria-hidden>
          {C.brand.line}
        </E2Text>
      </E2Brand>
      <h1 className="jrn-e2__h jrn-e2--light">
        {C.welcome.headline.map((line, i) => (
          <E2Text key={line} t={head[i]!} as="span">
            {line}
          </E2Text>
        ))}
      </h1>
      <span className="jrn-e2__rule jrn-e2--light" aria-hidden style={at(L.box.rule)} />
      <p className="jrn-e2--light">
        <E2Text t={T.tag1} as="span">{C.welcome.tagline[0]}</E2Text>
        <E2Text t={T.tag2} as="span">{C.welcome.tagline[1]}</E2Text>
      </p>
      <E2Button box={L.box.getStarted} t={T.getStarted} tone="olive" trigger="welcome-get-started" onClick={() => go('F01.14')}>
        {C.welcome.getStarted}
      </E2Button>
      <E2Button box={L.box.signIn} t={T.signIn} tone="cream" trigger="welcome-sign-in" onClick={() => go('F01.03')}>
        {C.welcome.signIn}
      </E2Button>
    </EntryV2Stage>
  );
}

/* ───────────── F01.14 VALUE PROPOSITION (ENTRY v2 02): the broadside is the interface surface ───────────── */
export function ValuePropositionScreen() {
  const { go } = useJurnl();
  const L = ENTRY_V2_VALUE;
  const T = L.text;
  const head = [T.h1, T.h2, T.h3];
  const body = [T.b1, T.b2, T.b3, T.b4, T.b5];
  return (
    <EntryV2Stage screenId="F01.14" plate={E2_PLATES.value} ui={L.ui} focal={L.focal} label="WHAT JURNL IS FOR">
      <h1 className="jrn-e2__h jrn-e2__h--heavy">
        {C.value.headline.map((line, i) => (
          // The broadside's brand mark is its own headline word.
          <E2Text key={line} t={head[i]!} as="span" data-jrn-logo={line === C.brand.word ? 'entry-v2' : undefined}>
            {line}
          </E2Text>
        ))}
      </h1>
      <p className="jrn-e2__body">
        {C.value.body.map((line, i) => (
          <E2Text key={line} t={body[i]!} as="span">
            {line}
          </E2Text>
        ))}
      </p>
      <E2Button box={L.box.cont} t={T.cont} tone="olive" trigger="value-continue" onClick={() => go('F01.15')}>
        {C.value.continue}
      </E2Button>
    </EntryV2Stage>
  );
}

/* ───────────── F01.15 KEY BENEFITS (ENTRY v2 03): printed on the stacked slips ───────────── */
export function KeyBenefitsScreen() {
  const { go } = useJurnl();
  const L = ENTRY_V2_BENEFITS;
  const T = L.text;
  const slips = [
    { m: L.surfaces.slip1, a: T.s1a, b: T.s1b },
    { m: L.surfaces.slip2, a: T.s2a, b: T.s2b },
    { m: L.surfaces.slip3, a: T.s3a, b: T.s3b },
    { m: L.surfaces.slip4, a: T.s4a, b: T.s4b },
  ];
  return (
    <EntryV2Stage screenId="F01.15" plate={E2_PLATES.benefits} ui={L.ui} focal={L.focal} label="WHAT JURNL HELPS YOU DO">
      <E2Brand t={T.brand} className="jrn-e2--olive" />
      <EntrySurface m={L.surfaces.olive}>
        <h1 className="jrn-e2__h jrn-e2--light">
          <E2Text t={T.o1} as="span">{C.benefits.headline[0]}</E2Text>
          <E2Text t={T.o2} as="span">{C.benefits.headline[1]}</E2Text>
        </h1>
      </EntrySurface>
      <ul className="jrn-e2__list">
        {C.benefits.items.map(([a, b], i) => (
          <li key={a}>
            <EntrySurface m={slips[i]!.m}>
              <E2Text t={slips[i]!.a} as="span">{a}</E2Text>
              <E2Text t={slips[i]!.b} as="span">{b}</E2Text>
            </EntrySurface>
          </li>
        ))}
      </ul>
      <E2Button box={L.box.cont} t={T.cont} tone="olive" trigger="benefits-continue" onClick={() => go('F01.16')}>
        {C.benefits.continue}
      </E2Button>
    </EntryV2Stage>
  );
}

/* ───────────── F01.16 GET STARTED (ENTRY v2 04): the standing invitation ───────────── */
export function GetStartedScreen() {
  const { go } = useJurnl();
  const L = ENTRY_V2_BEGIN;
  const T = L.text;
  return (
    <EntryV2Stage screenId="F01.16" plate={E2_PLATES.begin} ui={L.ui} focal={L.focal} label="BEGIN">
      <E2Brand t={T.brand} />
      <h1 className="jrn-e2__h">
        <E2Text t={T.h} as="span">{C.begin.headline}</E2Text>
      </h1>
      <E2Text t={T.sub}>{C.begin.sub}</E2Text>
      <EntrySurface m={L.surfaces.card}>
        <E2Button box={L.box.getStarted} t={T.getStarted} tone="olive" trigger="begin-get-started" onClick={() => go('F01.01')}>
          {C.begin.getStarted}
        </E2Button>
        <E2Button box={L.box.signIn} t={T.signIn} tone="outline" trigger="begin-sign-in" onClick={() => go('F01.03')}>
          {C.begin.signIn}
        </E2Button>
      </EntrySurface>
    </EntryV2Stage>
  );
}

/* ───────────── F01.01 CREATE ACCOUNT ───────────── */
type CreateForm = { firstName: string; lastName: string; email: string; password: string; agree: boolean };
const EMPTY_CREATE: CreateForm = { firstName: '', lastName: '', email: '', password: '', agree: false };
const FORCED_CREATE: Record<string, CreateForm> = {
  validation_error: { firstName: '', lastName: '', email: 'ALEX@', password: '123', agree: false },
  email_in_use: { firstName: 'ALEX', lastName: 'TAYLOR', email: 'ALEX@EXAMPLE.COM', password: 'Jurnl-2026!', agree: true },
  password_satisfied: { firstName: 'ALEX', lastName: 'TAYLOR', email: 'ALEX@EXAMPLE.COM', password: 'Jurnl-2026!', agree: true },
  loading: { firstName: 'ALEX', lastName: 'TAYLOR', email: 'ALEX@EXAMPLE.COM', password: 'Jurnl-2026!', agree: true },
};

function validateCreate(f: CreateForm) {
  const e: Partial<Record<keyof CreateForm, string>> = {};
  if (!f.firstName.trim()) e.firstName = C.create.errors.firstName;
  if (!f.lastName.trim()) e.lastName = C.create.errors.lastName;
  if (!isValidEmail(f.email)) e.email = C.create.errors.email;
  if (!passwordSatisfied(f.password)) e.password = C.create.errors.password;
  if (!f.agree) e.agree = C.create.errors.terms;
  return e;
}

export function CreateAccountScreen() {
  const { forcedState, overlay, openOverlay, closeOverlay, auth, setSession, go } = useJurnl();
  const [form, setForm] = useState<CreateForm>(() => FORCED_CREATE[forcedState ?? ''] ?? EMPTY_CREATE);
  const [errors, setErrors] = useState(() => (forcedState === 'validation_error' ? validateCreate(FORCED_CREATE.validation_error!) : {}));
  const [emailInUse, setEmailInUse] = useState(forcedState === 'email_in_use');
  const [loading, setLoading] = useState(forcedState === 'loading');
  const [pwFocused, setPwFocused] = useState(false);
  const netToast = useNetworkToast();
  const set = (k: keyof CreateForm) => (v: string | boolean) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
    if (k === 'email') setEmailInUse(false);
  };
  const rules = passwordRuleState(form.password);
  const showReqs = pwFocused || form.password.length > 0;
  const summary = Object.values(errors).filter(Boolean) as string[];

  const submit = async () => {
    const e = validateCreate(form);
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    setLoading(true);
    const res = await auth.signUp(form);
    setLoading(false);
    if (!res.ok) {
      if (res.code === 'EMAIL_IN_USE') setEmailInUse(true);
      else netToast(res.code);
      return;
    }
    setSession({ account: res.value, status: 'ACTIVE', pendingEmail: res.value.email });
    go('F01.02');
  };

  const L = ENTRY_V2_CREATE;
  const T = L.text;
  const B = L.box;
  // Each field: its label's foot to its rule. The rule is the field's edge, as printed on the sheet.
  const field = (labelT: RefType, rule: RefBox): RefBox => [rule[0], labelT.ink[3] + 6, rule[2], rule[1] - 2];
  // Inline password requirements open under the password rule; everything printed below moves down by that much.
  const reqTop = B.passwordRule[3] + (errors.password ? 36 : 10);
  const shift = showReqs ? Math.max(0, reqTop + 74 + 10 - B.check[1]) : 0;
  const note: RefBox = [165, 640, 865, 712];
  return (
    <EntryV2Stage
      screenId="F01.01"
      plate={E2_PLATES.create}
      ui={L.ui}
      focal={L.focal}
      label="CREATE YOUR ACCOUNT"
      outside={
        <>
          {overlay === 'terms' || overlay === 'privacy-policy' ?
            <LegalDrawer kind={overlay} onAgree={() => (overlay === 'terms' ? set('agree')(true) : undefined)} onClose={closeOverlay} />
          : null}
          {overlay === 'social-apple' ? <SocialAuthBoundary provider="APPLE" /> : null}
          {overlay === 'social-google' ? <SocialAuthBoundary provider="GOOGLE" /> : null}
        </>
      }
    >
      <EntrySurface m={L.surfaces.sheet}>
        <E2Brand t={T.brand} />
        <h1 className="jrn-e2__h">
          <E2Text t={T.h1} as="span">{C.create.headline[0]}</E2Text>
          <span aria-label={C.create.headline[1]}>
            <E2Text t={T.h2a} as="span" aria-hidden>{C.create.headline[1].split(' ')[0]}</E2Text>
            <E2Text t={T.h2b} as="span" aria-hidden>{C.create.headline[1].split(' ').slice(1).join(' ')}</E2Text>
          </span>
        </h1>
        <p>
          <E2Text t={T.sub1} as="span">{C.create.sub[0]}</E2Text>
          <E2Text t={T.sub2} as="span">{C.create.sub[1]}</E2Text>
        </p>
        <form
          className="jrn-e2__form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          {emailInUse ?
            <E2Note
              box={note}
              trigger="create-error-email-in-use"
              title={C.create.errors.emailInUseTitle}
              body={C.create.errors.emailInUseBody}
              action={{ label: C.create.errors.goToSignIn, onClick: () => go('F01.03'), trigger: 'create-go-sign-in' }}
            />
          : summary.length > 1 ?
            <E2Note box={note} trigger="create-error-validation" title={C.create.errors.summaryTitle} srItems={summary} />
          : null}
          <E2Field label={C.create.firstName} labelT={T.first} input={field(T.first, B.firstRule)} rule={B.firstRule} value={form.firstName} onValue={set('firstName')} error={errors.firstName} trigger="create-first-name" autoComplete="given-name" inputSize={30} />
          <E2Field label={C.create.lastName} labelT={T.last} input={field(T.last, B.lastRule)} rule={B.lastRule} value={form.lastName} onValue={set('lastName')} error={errors.lastName} trigger="create-last-name" autoComplete="family-name" inputSize={30} />
          <E2Field
            label={C.create.email}
            labelT={T.email}
            input={field(T.email, B.emailRule)}
            rule={B.emailRule}
            type="email"
            value={form.email}
            onValue={set('email')}
            error={errors.email}
            trigger="create-email"
            autoComplete="email"
            forceFocused={forcedState === 'focused'}
            inputSize={30}
          />
          <E2Field
            label={C.create.password}
            labelT={T.password}
            input={field(T.password, B.passwordRule)}
            rule={B.passwordRule}
            type="password"
            revealable
            value={form.password}
            onValue={set('password')}
            error={errors.password}
            trigger="create-password"
            autoComplete="new-password"
            onFocusChange={setPwFocused}
            inputSize={30}
          />
          <div className="jrn-e2__reqs" data-open={showReqs ? 'true' : 'false'} data-jrn-trigger="create-password-requirements" aria-hidden={!showReqs} style={at([165, reqTop, 865, reqTop + 74])}>
            <ul aria-label={C.create.requirementsTitle}>
              {rules.map((r) => (
                <li key={r.id} className="jrn-req" data-met={r.met ? 'true' : 'false'} data-flagged={errors.password ? 'true' : 'false'}>
                  <i aria-hidden>{r.met ? '✓' : ''}</i>
                  {r.label}
                </li>
              ))}
            </ul>
          </div>
          <E2Check box={down(B.check, shift)} checked={form.agree} onChange={set('agree')} trigger="create-agree" ariaLabel={`${C.create.agreeLead} ${C.create.terms} ${C.create.and} ${C.create.privacy}`} />
          <E2Text t={downT(T.agree, shift)} className="jrn-e2__agree">
            {C.create.agreeLead}{' '}
            <button type="button" className="jrn-e2__inline" data-jrn-trigger="create-terms-link" onClick={() => openOverlay('terms')}>
              {C.create.terms}
            </button>{' '}
            {C.create.and}{' '}
            <button type="button" className="jrn-e2__inline" data-jrn-trigger="create-privacy-link" onClick={() => openOverlay('privacy-policy')}>
              {C.create.privacy}
            </button>
          </E2Text>
          {errors.agree && summary.length <= 1 ?
            <p className="jrn-e2__err" role="alert" style={at(down([230, B.check[3] + 6, 865, B.check[3] + 30], shift))}>
              {errors.agree}
            </p>
          : null}
          <E2Button box={down(B.apple, shift)} t={downT(T.apple, shift)} tone="social" trigger="create-apple" onClick={() => openOverlay('social-apple')} icon={{ node: <JurnlIcon name="apple" size={34} />, box: down(grow(B.appleIcon, 1.45), shift) }}>
            {C.create.apple}
          </E2Button>
          <E2Button box={down(B.google, shift)} t={downT(T.google, shift)} tone="social" trigger="create-google" onClick={() => openOverlay('social-google')} icon={{ node: <JurnlIcon name="google" size={34} />, box: down(B.googleIcon, shift) }}>
            {C.create.google}
          </E2Button>
          <E2Button box={down(B.submit, shift)} t={downT(T.submit, shift)} tone="olive" type="submit" trigger="create-submit" loading={loading} loadingLabel={C.create.loading}>
            {C.create.submit}
          </E2Button>
          <E2Text t={downT(T.foot, shift)} className="jrn-e2__foot">
            {C.create.haveAccount}{' '}
            <button type="button" className="jrn-e2__inline" data-jrn-trigger="create-sign-in" onClick={() => go('F01.03')}>
              {C.create.signIn}
            </button>
          </E2Text>
        </form>
      </EntrySurface>
    </EntryV2Stage>
  );
}

function LegalDrawer({ kind, onAgree, onClose }: { kind: 'terms' | 'privacy-policy'; onAgree: () => void; onClose: () => void }) {
  const L = C.legal;
  const terms = kind === 'terms';
  const [open, setOpen] = useState<string | null>(null);
  return (
    <JurnlDrawer
      size="long"
      testId={kind}
      title={terms ? L.termsTitle : L.privacyTitle}
      lead={terms ? L.termsLead : L.privacyLead}
      onClose={onClose}
      footer={
        <JurnlButton
          trigger={`${kind}-accept`}
          onClick={() => {
            onAgree();
            onClose();
          }}
        >
          {terms ? L.termsAgree : L.privacyAgree}
        </JurnlButton>
      }
    >
      <div className="jrn-list">
        {(terms ? L.termsSections : L.privacySections).map((s) => (
          <div key={s}>
            <JurnlRow title={s} onClick={() => setOpen((o) => (o === s ? null : s))} trigger={`${kind}-section`} />
            <JurnlInlineExpansion open={open === s}>
              <p className="jrn-body" style={{ padding: '10px 14px 4px' }}>
                {L.pendingText}
              </p>
            </JurnlInlineExpansion>
          </div>
        ))}
      </div>
    </JurnlDrawer>
  );
}

/* ───────────── F01.02 EMAIL VERIFICATION ───────────── */
export function VerifyEmailScreen() {
  const { mode, forcedState, overlay, openOverlay, closeOverlay, auth, session, setSession, showToast, go } = useJurnl();
  const [params] = useSearchParams();
  // `?link=valid|expired` simulates the emailed link's outcome in the design workspace only.
  const link = mode === 'design-preview' ? params.get('link') : null;
  const [phase, setPhase] = useState<'pending' | 'expired' | 'verified'>(() =>
    forcedState === 'expired_link' ? 'expired' : forcedState === 'verification_success' ? 'verified' : 'pending',
  );
  const [resending, setResending] = useState(false);
  const netToast = useNetworkToast();
  const email = session.pendingEmail ?? session.account?.email ?? null;
  const shown = useRef(false);

  useEffect(() => {
    if (forcedState === 'resent' && !shown.current) {
      shown.current = true;
      showToast({ tone: 'success', title: C.verify.toastTitle, body: C.verify.toastBody, testId: 'toast-verify-resent' });
    }
  }, [forcedState, showToast]);

  useEffect(() => {
    if (!link) return;
    let alive = true;
    void auth.confirmEmailLink(email ?? '', link).then((res) => {
      if (!alive) return;
      if (res.ok) {
        setPhase('verified');
        if (session.account) setSession({ account: { ...session.account, emailVerified: true } });
      } else if (res.code === 'INVALID_LINK') setPhase('expired');
      else netToast(res.code);
    });
    return () => {
      alive = false;
    };
  }, [link]); // eslint-disable-line react-hooks/exhaustive-deps

  const resend = async () => {
    setResending(true);
    const res = await auth.resendVerification(email ?? '');
    setResending(false);
    if (!res.ok) return netToast(res.code);
    setPhase('pending');
    showToast({ tone: 'success', title: C.verify.toastTitle, body: C.verify.toastBody, testId: 'toast-verify-resent' });
  };

  const L = ENTRY_V2_VERIFY;
  const T = L.text;
  const B = L.box;
  // The authority ends the fallback sentence with a full stop; a real address is printed as it is.
  const address = email ?? `${C.verify.fallbackEmail}.`;
  // A long address is set smaller so it stays on its line (the authority's line holds about 33 characters).
  const addressT = fitLine(T.address, address, 640, 19);
  const slot: RefBox = [70, 404, 640, 488];
  return (
    <EntryV2Stage
      screenId="F01.02"
      plate={E2_PLATES.verify}
      ui={L.ui}
      focal={L.focal}
      label="CHECK YOUR EMAIL"
      outside={
        <>
          {overlay === 'mail' ? <MailHandoff /> : null}
          {overlay === 'change-email' ? <ChangeEmailDrawer current={email} onClose={closeOverlay} /> : null}
        </>
      }
    >
      <E2Brand t={T.brand} />
      <h1 className="jrn-e2__h">
        <E2Text t={T.h1} as="span">{C.verify.headline[0]}</E2Text>
        <E2Text t={T.h2} as="span">{C.verify.headline[1]}</E2Text>
      </h1>
      {phase === 'expired' ?
        <E2Note box={slot} trigger="verify-error-expired" title={C.verify.expiredTitle} body={C.verify.expiredBody} />
      : phase === 'verified' ?
        <E2Note box={slot} tone="success" trigger="verify-success" title={C.verify.successTitle} body={`${C.verify.successBody} ${C.verify.successNext}`} />
      : <p data-jrn-trigger="verify-email-address">
          <E2Text t={T.lead} as="span">{C.verify.lead}</E2Text>
          <E2Text t={addressT} as="span">{address}</E2Text>
        </p>
      }
      {phase === 'verified' ?
        <E2Button box={B.open} t={T.open} tone="olive" trigger="verify-success-continue" onClick={() => go('F01.09')}>
          {C.common.continue}
        </E2Button>
      : <>
          <E2Button box={B.open} t={T.open} tone="olive" trigger="verify-open-mail" onClick={() => openOverlay('mail')}>
            {C.verify.openMail}
          </E2Button>
          <E2Button box={B.resend} t={T.resend} tone="cream" trigger="verify-resend" loading={resending} onClick={() => void resend()}>
            {C.verify.resend}
          </E2Button>
          <E2Link t={T.different} trigger="verify-change-email" underline={B.differentRule} onClick={() => openOverlay('change-email')}>
            {C.verify.change}
          </E2Link>
        </>
      }
    </EntryV2Stage>
  );
}

function ChangeEmailDrawer({ current, onClose }: { current: string | null; onClose: () => void }) {
  const { auth, setSession, session, showToast } = useJurnl();
  const [value, setValue] = useState(current ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!isValidEmail(value)) return setError(C.create.errors.email);
    setLoading(true);
    const res = await auth.changeEmail(current ?? '', value);
    setLoading(false);
    if (!res.ok) return setError(res.code === 'EMAIL_IN_USE' ? C.create.errors.emailInUseTitle : C.network.title);
    const next = value.trim().toUpperCase();
    setSession({ pendingEmail: next, account: session.account ? { ...session.account, email: next, emailVerified: false } : null });
    showToast({ tone: 'success', title: C.verify.toastTitle, body: C.verify.toastBody, testId: 'toast-verify-resent' });
    onClose();
  };
  return (
    <JurnlDrawer
      size="short"
      testId="change-email"
      title={C.verify.changeTitle}
      lead={C.verify.changeLead}
      onClose={onClose}
      footer={
        <>
          <JurnlButton trigger="change-email-submit" loading={loading} onClick={() => void submit()}>
            {C.verify.changeSubmit}
          </JurnlButton>
          <JurnlButton variant="quiet" trigger="change-email-cancel" onClick={onClose}>
            {C.common.cancel}
          </JurnlButton>
        </>
      }
    >
      <JurnlInput label={C.create.email} type="email" value={value} onValue={(v) => (setValue(v), setError(null))} error={error} trigger="change-email-input" />
    </JurnlDrawer>
  );
}

/* ───────────── F01.03 SIGN IN ───────────── */
type SignInErr = 'required' | 'incorrect' | 'not_found' | 'offline' | null;
const FORCED_SIGNIN: Record<string, { email: string; password: string; err: SignInErr }> = {
  incorrect_password: { email: 'EMMA@EXAMPLE.COM', password: 'wrong-pass', err: 'incorrect' },
  account_not_found: { email: 'NOTFOUND@EXAMPLE.COM', password: 'Jurnl-2026', err: 'not_found' },
  locked: { email: 'LOCKED@EXAMPLE.COM', password: 'Jurnl-2026', err: null },
  loading: { email: 'EMMA@EXAMPLE.COM', password: 'Jurnl-2026', err: null },
  offline: { email: 'EMMA@EXAMPLE.COM', password: 'Jurnl-2026', err: 'offline' },
};

export function SignInScreen() {
  const { forcedState, overlay, openOverlay, closeOverlay, auth, device, setDevice, setSession, go } = useJurnl();
  const forced = FORCED_SIGNIN[forcedState ?? ''];
  const [email, setEmail] = useState(forced?.email ?? '');
  const [password, setPassword] = useState(forced?.password ?? '');
  const [keep, setKeep] = useState(forcedState === 'loading');
  const [err, setErr] = useState<SignInErr>(forced?.err ?? null);
  const [loading, setLoading] = useState(forcedState === 'loading');
  const postAuth = usePostAuthRoute();
  const netToast = useNetworkToast();

  const submit = async () => {
    if (!email.trim() || !password) return setErr('required');
    setErr(null);
    setLoading(true);
    const res = await auth.signIn(email, password);
    setLoading(false);
    if (!res.ok) {
      if (res.code === 'INCORRECT_PASSWORD') return setErr('incorrect');
      if (res.code === 'ACCOUNT_NOT_FOUND') return setErr('not_found');
      if (res.code === 'LOCKED') return openOverlay('locked');
      if (res.code === 'OFFLINE') return setErr('offline');
      return netToast(res.code);
    }
    setSession({ account: res.value, status: 'ACTIVE', keepSignedIn: keep, pendingEmail: res.value.emailVerified ? null : res.value.email });
    if (keep) setDevice({ remembered: rememberAccount(device, res.value) });
    postAuth(res.value);
  };

  const L = ENTRY_V2_SIGNIN;
  const T = L.text;
  const B = L.box;
  const field = (labelT: RefType, rule: RefBox): RefBox => [rule[0], labelT.ink[3] + 6, rule[2], rule[1] - 2];
  // Kept from the F01 runtime and set in the card's small sans: KEEP ME SIGNED IN between the password rule and
  // SIGN IN, and the two provider sign-ins under CREATE ACCOUNT.
  const small = (top: number, cx: number): RefType => ({ ...T.forgot, top, cx, left: undefined });
  const keepBox: RefBox = [296, 1044, 600, 1074];
  const note: RefBox = [296, 786, 828, 856];
  const errNote =
    err === 'offline' ? { trigger: 'signin-error-offline', title: C.signIn.offlineTitle, body: C.signIn.offlineBody, action: { label: C.signIn.retry, onClick: () => void submit(), trigger: 'signin-retry' } }
    : err === 'not_found' ? { trigger: 'signin-error-not-found', title: C.signIn.notFoundTitle, body: C.signIn.notFoundBody, action: { label: C.signIn.create, onClick: () => go('F01.01'), trigger: 'signin-not-found-create' } }
    : err === 'required' ? { trigger: 'signin-error-required', title: C.signIn.required }
    : err === 'incorrect' ? { trigger: 'signin-error-incorrect', title: C.signIn.incorrectTitle, body: C.signIn.incorrectBody }
    : null;
  return (
    <EntryV2Stage
      screenId="F01.03"
      plate={E2_PLATES.signin}
      ui={L.ui}
      focal={L.focal}
      label="WELCOME BACK"
      outside={
        <>
          {overlay === 'locked' ?
            <JurnlDrawer
              size="short"
              tone="wine"
              testId="locked"
              title={C.signIn.lockedTitle}
              lead={C.signIn.lockedBody}
              onClose={closeOverlay}
              footer={
                <>
                  <JurnlButton variant="secondary" trigger="locked-support" onClick={() => openOverlay('support')}>
                    {C.signIn.contactSupport}
                  </JurnlButton>
                  <JurnlButton variant="quiet" trigger="locked-back" onClick={closeOverlay}>
                    {C.signIn.backToSignIn}
                  </JurnlButton>
                </>
              }
            />
          : null}
          {overlay === 'support' ? <MailHandoff target="SUPPORT" /> : null}
          {overlay === 'social-apple' ? <SocialAuthBoundary provider="APPLE" /> : null}
          {overlay === 'social-google' ? <SocialAuthBoundary provider="GOOGLE" /> : null}
        </>
      }
    >
      <EntrySurface m={L.surfaces.card}>
        <E2Brand t={T.brand} />
        <h1 className="jrn-e2__h">
          <E2Text t={T.h1} as="span">{C.signIn.headline[0]}</E2Text>
          <E2Text t={T.h2} as="span">{C.signIn.headline[1]}</E2Text>
        </h1>
        <form
          className="jrn-e2__form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          {errNote ? <E2Note box={note} {...errNote} /> : null}
          <E2Field label={C.signIn.email} labelT={T.emailLabel} input={field(T.emailLabel, B.emailRule)} rule={B.emailRule} type="email" value={email} onValue={(v) => (setEmail(v), setErr(null))} trigger="signin-email" autoComplete="email" inputSize={30} />
          <E2Field
            label={C.signIn.password}
            labelT={T.passwordLabel}
            input={field(T.passwordLabel, B.passwordRule)}
            rule={B.passwordRule}
            type="password"
            revealable
            value={password}
            onValue={(v) => (setPassword(v), setErr(null))}
            trigger="signin-password"
            autoComplete="current-password"
            invalid={err === 'incorrect'}
            inputSize={30}
          />
          <E2Check box={keepBox} square={[296, 1046, 322, 1072]} checked={keep} onChange={setKeep} trigger="signin-keep" ariaLabel={C.signIn.keep}>
            <E2Text t={{ ...T.forgot, top: 1050, left: 338, cx: undefined }} origin={keepBox} as="span">
              {C.signIn.keep}
            </E2Text>
          </E2Check>
          <E2Button box={B.submit} t={T.submit} tone="olive" type="submit" trigger="signin-submit" loading={loading} loadingLabel={C.signIn.loading}>
            {C.signIn.submit}
          </E2Button>
          <E2Link t={T.forgot} trigger="signin-forgot" onClick={() => go('F01.05')}>
            {C.signIn.forgot}
          </E2Link>
          <E2Link t={T.create} trigger="signin-create" onClick={() => go('F01.01')}>
            {C.signIn.create}
          </E2Link>
          <E2Link t={small(1364, T.forgot.cx ?? 562)} trigger="signin-apple" onClick={() => openOverlay('social-apple')}>
            {C.signIn.apple}
          </E2Link>
          <E2Link t={small(1392, T.forgot.cx ?? 562)} trigger="signin-google" onClick={() => openOverlay('social-google')}>
            {C.signIn.google}
          </E2Link>
        </form>
      </EntrySurface>
    </EntryV2Stage>
  );
}

/* ───────────── F01.04 RETURNING USER UNLOCK ───────────── */
const PREVIEW_REMEMBERED: RememberedAccount = { email: 'EMMA@EXAMPLE.COM', firstName: 'EMMA', lastName: 'S.' };

export function ReturningUnlockScreen() {
  const { forcedState, overlay, openOverlay, closeOverlay, bridge, device, setDevice, mode, signOut, setSession, go } = useJurnl();
  const remembered = device.remembered.length ? device.remembered : mode === 'design-preview' ? [PREVIEW_REMEMBERED] : [];
  const current = remembered[0] ?? null;
  const [faceErr, setFaceErr] = useState<'failed' | 'unavailable' | null>(forcedState === 'faceid_failed' ? 'failed' : null);
  const [waiting, setWaiting] = useState(false);

  const unlock = async () => {
    setFaceErr(null);
    setWaiting(true);
    const outcome = await bridge.requestBiometric('UNLOCK');
    setWaiting(false);
    if (outcome === 'GRANTED' && current) {
      closeOverlay();
      setSession({ account: { ...current, emailVerified: true }, status: 'ACTIVE' });
      go('F01.13');
      return;
    }
    closeOverlay();
    setFaceErr(outcome === 'UNAVAILABLE' ? 'unavailable' : 'failed');
  };

  return (
    <JurnlScreen screenId="F01.04" scene="unlock" layout="card">
      <div className="jrn-col__head jrn-hero-copy--wide" data-runtime-bounds="copy">
        <JurnlLogo />
        <JurnlHeadline lines={C.unlock.headline} lg />
        <i className="jrn-rule jrn-rule--emerald" aria-hidden />
        <JurnlLines lines={C.unlock.sub} />
      </div>
      {forcedState === 'session_expired' ?
        <div className="jrn-state-slot">
          <JurnlErrorPanel testId="unlock-session-expired" title={C.unlock.sessionExpiredTitle} body={C.unlock.sessionExpiredBody} />
        </div>
      : forcedState === 'reauthentication' ?
        <div className="jrn-state-slot">
          <JurnlErrorPanel testId="unlock-reauthentication" title={C.unlock.reauthTitle} body={C.unlock.reauthBody} />
        </div>
      : null}
      <div className="jrn-card jrn-unlock-card" data-runtime-bounds="card">
        <span className="jrn-unlock-card__glyph" aria-hidden>
          <JurnlIcon name="face-id" size={58} />
        </span>
        {current ?
          <p className="jrn-unlock-card__who">{`${current.firstName} ${current.lastName}`.trim()}</p>
        : <p className="jrn-unlock-card__who">{C.unlock.noRemembered}</p>}
        {faceErr ?
          <JurnlErrorPanel
            testId="unlock-error-faceid"
            title={faceErr === 'failed' ? C.unlock.failedTitle : C.biometric.unavailableTitle}
            body={faceErr === 'failed' ? C.unlock.failedBody : C.biometric.unavailableBody}
            action={faceErr === 'failed' ? { label: C.common.tryAgain, onClick: () => openOverlay('faceid-unlock'), trigger: 'unlock-retry', variant: 'destructive' } : undefined}
          />
        : null}
        <JurnlButton trigger="unlock-faceid" disabled={!current || faceErr === 'unavailable'} onClick={() => openOverlay('faceid-unlock')}>
          {C.unlock.unlock}
        </JurnlButton>
        <JurnlButton variant="secondary" trigger="unlock-use-password" disabled={!current} onClick={() => openOverlay('use-password')}>
          {C.unlock.usePassword}
        </JurnlButton>
        <JurnlTextLink trigger="unlock-switch-account" onClick={() => openOverlay('switch-account')}>
          {C.unlock.switchAccount}
        </JurnlTextLink>
      </div>

      {overlay === 'faceid-unlock' ?
        <JurnlNativeHandoff
          testId="faceid-unlock"
          title={C.unlock.waitingTitle}
          body={C.unlock.waitingBody}
          waiting={waiting}
          waitingLabel={C.biometric.waiting}
          continueLabel={C.common.continue}
          onContinue={() => void unlock()}
          onCancel={() => {
            setWaiting(false);
            closeOverlay();
          }}
        />
      : null}
      {overlay === 'use-password' && current ? <UsePasswordSheet account={current} /> : null}
      {overlay === 'switch-account' ?
        <JurnlDrawer size="long" testId="switch-account" title={C.unlock.switchTitle} onClose={closeOverlay}>
          <div className="jrn-list">
            {remembered.map((a, i) => (
              <JurnlRow
                key={a.email}
                leading={
                  <span className="jrn-tile" aria-hidden>
                    {initialsOf(a)}
                  </span>
                }
                title={`${a.firstName} ${a.lastName}`.trim()}
                sub={i === 0 ? C.unlock.current : a.email}
                trigger={`switch-account-${i}`}
                onClick={() => {
                  setDevice({ remembered: [a, ...remembered.filter((r) => r.email !== a.email)] });
                  closeOverlay();
                }}
                end={i === 0 ? <JurnlTile icon="check" tone="emerald" size={14} /> : undefined}
              />
            ))}
            <JurnlRow icon="plus" title={C.unlock.addAccount} trigger="switch-add-account" onClick={() => go('F01.03')} />
            <JurnlButton variant="quiet" trigger="switch-sign-out" onClick={() => openOverlay('sign-out')}>
              {C.unlock.signOut}
            </JurnlButton>
          </div>
        </JurnlDrawer>
      : null}
      {overlay === 'sign-out' ?
        <JurnlModal
          testId="sign-out"
          title={C.unlock.signOutTitle}
          body={C.unlock.signOutBody}
          confirm={{
            label: C.unlock.signOut,
            trigger: 'sign-out-confirm',
            onClick: () => {
              setDevice({ remembered: device.remembered.filter((r) => r.email !== current?.email) });
              signOut();
              go('F01.00');
            },
          }}
          onCancel={closeOverlay}
        />
      : null}
    </JurnlScreen>
  );
}

function UsePasswordSheet({ account }: { account: RememberedAccount }) {
  const { auth, closeOverlay, setSession, go } = useJurnl();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const netToast = useNetworkToast();
  const submit = async () => {
    if (!password) return setError(C.signIn.required);
    setLoading(true);
    const res = await auth.signIn(account.email, password);
    setLoading(false);
    if (!res.ok) {
      if (res.code === 'INCORRECT_PASSWORD') return setError(`${C.signIn.incorrectTitle} — ${C.signIn.incorrectBody}`);
      if (res.code === 'LOCKED') return setError(C.signIn.lockedTitle);
      return netToast(res.code);
    }
    setSession({ account: res.value, status: 'ACTIVE' });
    go('F01.13');
  };
  return (
    <JurnlSheet
      testId="use-password"
      title={C.unlock.passwordTitle}
      onClose={closeOverlay}
      footer={
        <>
          <JurnlButton trigger="use-password-continue" loading={loading} onClick={() => void submit()}>
            {C.common.continue}
          </JurnlButton>
          <JurnlTextLink underline trigger="use-password-forgot" onClick={() => go('F01.05')}>
            {C.unlock.forgot}
          </JurnlTextLink>
        </>
      }
    >
      <JurnlHeadline lines={[C.unlock.passwordTitle]} />
      <p className="jrn-body">{C.unlock.passwordLead}</p>
      <p className="jrn-eyebrow">{account.email}</p>
      <JurnlInput label={C.signIn.password} icon="lock" type="password" revealable value={password} onValue={(v) => (setPassword(v), setError(null))} error={error} trigger="use-password-input" />
    </JurnlSheet>
  );
}
