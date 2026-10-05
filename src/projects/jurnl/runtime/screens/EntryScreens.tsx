/**
 * F01.00 WELCOME · F01.01 CREATE ACCOUNT · F01.02 EMAIL VERIFICATION · F01.03 SIGN IN · F01.04 RETURNING USER UNLOCK
 */

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { F01_COPY, isValidEmail, passwordRuleState, passwordSatisfied } from '../../data/f01/copy';
import { JurnlIcon } from '../components/icons';
import {
  JurnlButton,
  JurnlCheckbox,
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
  JurnlPasswordRequirements,
  JurnlRow,
  JurnlSheet,
  JurnlSuccessPanel,
  JurnlTextLink,
  JurnlTile,
} from '../components/primitives';
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

/* ───────────── F01.00 WELCOME ───────────── */
export function WelcomeScreen() {
  const { go } = useJurnl();
  return (
    <JurnlScreen screenId="F01.00" scene="welcome">
      <div className="jrn-col__head jrn-hero-copy" data-runtime-bounds="copy">
        <JurnlLogo />
        <JurnlHeadline lines={C.welcome.headline} />
        <i className="jrn-rule" aria-hidden />
        <JurnlLines lines={C.welcome.tagline} />
      </div>
      <div className="jrn-cta" data-runtime-bounds="cta">
        <JurnlButton trigger="welcome-get-started" onClick={() => go('F01.01')}>
          {C.welcome.getStarted}
        </JurnlButton>
        <JurnlButton variant="secondary" trigger="welcome-sign-in" onClick={() => go('F01.03')}>
          {C.welcome.signIn}
        </JurnlButton>
      </div>
    </JurnlScreen>
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

  return (
    <JurnlScreen screenId="F01.01" scene="create" layout="form">
      <div className="jrn-col__head" data-runtime-bounds="copy">
        <JurnlLogo />
        <JurnlHeadline lines={C.create.headline} />
        <JurnlLines lines={C.create.sub} />
      </div>
      <form
        className="jrn-form"
        data-runtime-bounds="form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        {emailInUse ?
          <JurnlErrorPanel
            testId="create-error-email-in-use"
            title={C.create.errors.emailInUseTitle}
            body={C.create.errors.emailInUseBody}
            action={{ label: C.create.errors.goToSignIn, onClick: () => go('F01.03'), trigger: 'create-go-sign-in' }}
          />
        : null}
        {summary.length > 1 ?
          <JurnlErrorPanel testId="create-error-validation" title={C.create.errors.summaryTitle} items={summary} />
        : null}
        <JurnlInput label={C.create.firstName} value={form.firstName} onValue={set('firstName')} error={errors.firstName} trigger="create-first-name" autoComplete="given-name" />
        <JurnlInput label={C.create.lastName} value={form.lastName} onValue={set('lastName')} error={errors.lastName} trigger="create-last-name" autoComplete="family-name" />
        <JurnlInput
          label={C.create.email}
          type="email"
          value={form.email}
          onValue={set('email')}
          error={errors.email}
          trigger="create-email"
          autoComplete="email"
          forceFocused={forcedState === 'focused'}
        />
        <JurnlInput
          label={C.create.password}
          type="password"
          revealable
          value={form.password}
          onValue={set('password')}
          error={errors.password}
          trigger="create-password"
          autoComplete="new-password"
          onFocusChange={setPwFocused}
        />
        <JurnlInlineExpansion open={showReqs} testId="create-password-requirements">
          <JurnlPasswordRequirements rules={rules} flagUnmet={!!errors.password} />
        </JurnlInlineExpansion>
        <div className="jrn-agree">
          <JurnlCheckbox checked={form.agree} onChange={set('agree')} trigger="create-agree" ariaLabel={`${C.create.agreeLead} ${C.create.terms} ${C.create.and} ${C.create.privacy}`} />
          <p className="jrn-legal">
            {C.create.agreeLead}{' '}
            <JurnlTextLink inline trigger="create-terms-link" onClick={() => openOverlay('terms')}>
              {C.create.terms}
            </JurnlTextLink>{' '}
            {C.create.and}{' '}
            <JurnlTextLink inline trigger="create-privacy-link" onClick={() => openOverlay('privacy-policy')}>
              {C.create.privacy}
            </JurnlTextLink>
          </p>
        </div>
        {errors.agree && summary.length <= 1 ? <p className="jrn-field__error">{errors.agree}</p> : null}
        <JurnlButton variant="social" icon={<JurnlIcon name="apple" size={20} />} trigger="create-apple" onClick={() => openOverlay('social-apple')}>
          {C.create.apple}
        </JurnlButton>
        <JurnlButton variant="social" icon={<JurnlIcon name="google" size={20} />} trigger="create-google" onClick={() => openOverlay('social-google')}>
          {C.create.google}
        </JurnlButton>
        <JurnlButton type="submit" trigger="create-submit" loading={loading} loadingLabel={C.create.loading} onClick={() => void submit()}>
          {C.create.submit}
        </JurnlButton>
        <p className="jrn-foot-note">
          <span>{C.create.haveAccount}</span>
          <JurnlTextLink strong underline trigger="create-sign-in" onClick={() => go('F01.03')}>
            {C.create.signIn}
          </JurnlTextLink>
        </p>
      </form>

      {overlay === 'terms' || overlay === 'privacy-policy' ?
        <LegalDrawer kind={overlay} onAgree={() => (overlay === 'terms' ? set('agree')(true) : undefined)} onClose={closeOverlay} />
      : null}
      {overlay === 'social-apple' ? <SocialAuthBoundary provider="APPLE" /> : null}
      {overlay === 'social-google' ? <SocialAuthBoundary provider="GOOGLE" /> : null}
    </JurnlScreen>
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

  return (
    <JurnlScreen screenId="F01.02" scene="verify">
      <div className="jrn-col__head jrn-hero-copy--wide" data-runtime-bounds="copy">
        <JurnlLogo />
        <JurnlHeadline lines={C.verify.headline} xl />
        <i className="jrn-rule" aria-hidden />
        <p className="jrn-kicker" data-jrn-trigger="verify-email-address">
          {C.verify.lead}
          <br />
          {email ?? C.verify.fallbackEmail}
        </p>
      </div>
      {phase === 'verified' ?
        <div className="jrn-cta" data-runtime-bounds="cta">
          <JurnlSuccessPanel testId="verify-success" title={C.verify.successTitle} body={`${C.verify.successBody} ${C.verify.successNext}`} />
          <JurnlButton trigger="verify-success-continue" onClick={() => go('F01.09')}>
            {C.common.continue}
          </JurnlButton>
        </div>
      : <div className="jrn-cta" data-runtime-bounds="cta">
          {phase === 'expired' ?
            <JurnlErrorPanel testId="verify-error-expired" title={C.verify.expiredTitle} body={C.verify.expiredBody} />
          : null}
          <JurnlButton trigger="verify-open-mail" onClick={() => openOverlay('mail')}>
            {C.verify.openMail}
          </JurnlButton>
          <JurnlButton variant="secondary" trigger="verify-resend" loading={resending} onClick={() => void resend()}>
            {C.verify.resend}
          </JurnlButton>
          <JurnlTextLink underline trigger="verify-change-email" onClick={() => openOverlay('change-email')}>
            {C.verify.change}
          </JurnlTextLink>
        </div>
      }
      {overlay === 'mail' ? <MailHandoff /> : null}
      {overlay === 'change-email' ? <ChangeEmailDrawer current={email} onClose={closeOverlay} /> : null}
    </JurnlScreen>
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

  return (
    <JurnlScreen screenId="F01.03" scene="signin" layout="form">
      <div className="jrn-col__head" data-runtime-bounds="copy">
        <JurnlLogo />
        <JurnlHeadline lines={C.signIn.headline} lg />
      </div>
      <form
        className="jrn-form"
        data-runtime-bounds="form"
        style={{ maxWidth: 'min(100%, 360px)' }}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        {err === 'offline' ?
          <JurnlErrorPanel testId="signin-error-offline" title={C.signIn.offlineTitle} body={C.signIn.offlineBody} action={{ label: C.signIn.retry, onClick: () => void submit(), trigger: 'signin-retry' }} />
        : null}
        {err === 'not_found' ?
          <JurnlErrorPanel
            testId="signin-error-not-found"
            title={C.signIn.notFoundTitle}
            body={C.signIn.notFoundBody}
            action={{ label: C.signIn.create, onClick: () => go('F01.01'), trigger: 'signin-not-found-create' }}
          />
        : null}
        {err === 'required' ? <JurnlErrorPanel testId="signin-error-required" title={C.signIn.required} /> : null}
        <JurnlInput label={C.signIn.email} icon="email" type="email" value={email} onValue={(v) => (setEmail(v), setErr(null))} trigger="signin-email" autoComplete="email" />
        <JurnlInput
          label={C.signIn.password}
          icon="lock"
          type="password"
          revealable
          value={password}
          onValue={(v) => (setPassword(v), setErr(null))}
          trigger="signin-password"
          autoComplete="current-password"
          invalid={err === 'incorrect'}
        />
        {err === 'incorrect' ? <JurnlErrorPanel testId="signin-error-incorrect" title={C.signIn.incorrectTitle} body={C.signIn.incorrectBody} /> : null}
        <JurnlCheckbox checked={keep} onChange={setKeep} trigger="signin-keep">
          {C.signIn.keep}
        </JurnlCheckbox>
        <JurnlButton type="submit" trigger="signin-submit" loading={loading} loadingLabel={C.signIn.loading} onClick={() => void submit()}>
          {C.signIn.submit}
        </JurnlButton>
        <JurnlTextLink underline trigger="signin-forgot" onClick={() => go('F01.05')}>
          {C.signIn.forgot}
        </JurnlTextLink>
        <JurnlButton variant="social" icon={<JurnlIcon name="apple" size={20} />} trigger="signin-apple" onClick={() => openOverlay('social-apple')}>
          {C.signIn.apple}
        </JurnlButton>
        <JurnlButton variant="social" icon={<JurnlIcon name="google" size={20} />} trigger="signin-google" onClick={() => openOverlay('social-google')}>
          {C.signIn.google}
        </JurnlButton>
        <div className="jrn-divider">
          <JurnlTextLink trigger="signin-create" onClick={() => go('F01.01')}>
            {C.signIn.create}
          </JurnlTextLink>
        </div>
      </form>
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
    </JurnlScreen>
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
