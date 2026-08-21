import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ensureAuthRestoredFromBackup } from '../../../utils/adminAuth';
import { getSupabase, isSupabaseConfigured, signOutIfSessionEmailUnconfirmed } from '../../../utils/supabase';
import {
  buildMinimalUserFromSupabaseSession,
  applyMinimalUserToStorage,
  buildProfilePayloadForBackend,
  didLastProfileSyncError,
  syncAllFromApi,
} from '../../../utils/syncFromApi';
import { onSignInSuccess } from '../../../utils/adminAuth';
import { registerServerSessionCookie } from '../../../utils/sessionRestore';
import { tryServerSessionRestore } from '../../../utils/sessionRestore';
import { trackActivity } from '../../../utils/activity';
import {
  site00RequestPasswordReset,
  site00SignInWithMagicLink,
  site00SignInWithPassword,
} from '../../../utils/auth/site00SignInActions';
import { resolveSite00ReturnToAfterSignIn } from '../../../utils/signInReturnTo';
import { SITE00_ROUTES } from '../../config/routes';

type Site00SignInFormProps = {
  layout?: 'desktop' | 'mobile';
};

export function Site00SignInForm({ layout = 'desktop' }: Site00SignInFormProps) {
  const location = useLocation();
  const formId = `site00-signin-form-${layout}`;
  const emailInputId = `site00-signin-email-${layout}`;
  const passwordInputId = `site00-signin-password-${layout}`;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const feedbackRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!error && !info) return;
    feedbackRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [error, info]);

  const redirectAfterSignIn = () => {
    const returnTo = new URLSearchParams(location.search).get('returnTo');
    const target = resolveSite00ReturnToAfterSignIn(returnTo, location.state as { from?: string } | null);
    window.setTimeout(() => {
      window.location.href = target;
    }, 280);
  };

  useEffect(() => {
    let cancelled = false;
    ensureAuthRestoredFromBackup();
    if (localStorage.getItem('isSignedIn') !== 'true') return;

    const go = () => {
      if (cancelled) return;
      redirectAfterSignIn();
    };

    if (!isSupabaseConfigured()) {
      go();
      return () => {
        cancelled = true;
      };
    }

    const supabase = getSupabase();
    if (!supabase) return () => { cancelled = true; };

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled || !session?.access_token) return;
      go();
    });

    return () => {
      cancelled = true;
    };
  }, [location.search, location.state]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;
    let cancelled = false;

    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      if (await signOutIfSessionEmailUnconfirmed(supabase, session)) return;
      if (!session) {
        void tryServerSessionRestore();
        return;
      }
      const profile = await syncAllFromApi();
      if (cancelled) return;
      if (profile) {
        localStorage.setItem('isSignedIn', 'true');
        onSignInSuccess('session_restore');
        registerServerSessionCookie(session.access_token, session.refresh_token);
        trackActivity('sign_in', { method: 'session_restore' });
        window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
        redirectAfterSignIn();
        return;
      }
      const minimal = buildMinimalUserFromSupabaseSession(session.user);
      applyMinimalUserToStorage(minimal);
      onSignInSuccess('session_restore');
      registerServerSessionCookie(session.access_token, session.refresh_token);
      if (!didLastProfileSyncError()) {
        const { patchProfile } = await import('../../../utils/api');
        await patchProfile(buildProfilePayloadForBackend(minimal)).catch(() => {});
      }
      localStorage.setItem('isSignedIn', 'true');
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
      redirectAfterSignIn();
    });

    return () => {
      cancelled = true;
    };
  }, [location.search, location.state]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    try {
      const result = await site00SignInWithPassword(
        emailRef.current?.value ?? email,
        passwordRef.current?.value ?? password,
      );
      if (!result.ok) {
        setError(result.message);
        return;
      }
      redirectAfterSignIn();
    } finally {
      setSubmitting(false);
    }
  };

  const onMagicLink = async () => {
    setError('');
    setInfo('');
    const emailValue = (emailRef.current?.value ?? email).trim();
    if (!emailValue) {
      setError('EMAIL IS REQUIRED.');
      return;
    }
    setSubmitting(true);
    try {
      const returnTo = new URLSearchParams(location.search).get('returnTo');
      const target = resolveSite00ReturnToAfterSignIn(returnTo, location.state as { from?: string } | null);
      const result = await site00SignInWithMagicLink(emailValue, target);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setInfo('CHECK YOUR EMAIL FOR A MAGIC LINK TO SIGN IN.');
    } finally {
      setSubmitting(false);
    }
  };

  const onForgotPassword = async () => {
    setError('');
    setInfo('');
    const emailValue = (emailRef.current?.value ?? email).trim();
    if (!emailValue) {
      setError('ENTER YOUR EMAIL TO RESET PASSWORD.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await site00RequestPasswordReset(emailValue);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setInfo('PASSWORD RESET EMAIL SENT. CHECK YOUR INBOX.');
    } finally {
      setSubmitting(false);
    }
  };

  const createAccountHref = `/sign-in?returnTo=${encodeURIComponent(
    resolveSite00ReturnToAfterSignIn(new URLSearchParams(location.search).get('returnTo'), null),
  )}`;

  return (
    <div className={`site00-signin-form site00-signin-form--${layout}`.trim()}>
      {layout === 'desktop' ? (
        <Link to={SITE00_ROUTES.originAlias} className="site00-signin-form__back">
          ← BACK TO SITE 00
        </Link>
      ) : null}

      <form id={formId} className="site00-signin-form__body" onSubmit={onSubmit} autoComplete="on">
        <label className="site00-signin-form__label" htmlFor={emailInputId}>
          EMAIL
        </label>
        <input
          ref={emailRef}
          id={emailInputId}
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="site00-signin-form__input"
          disabled={submitting}
        />

        <label className="site00-signin-form__label" htmlFor={passwordInputId}>
          PASSWORD
        </label>
        <div className="site00-signin-form__password-wrap">
          <input
            ref={passwordRef}
            id={passwordInputId}
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="site00-signin-form__input site00-signin-form__input--password"
            disabled={submitting}
          />
          <button
            type="button"
            className="site00-signin-form__show"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-pressed={showPassword}
          >
            {showPassword ? 'HIDE' : 'SHOW'}
          </button>
        </div>

        <button type="button" className="site00-signin-form__link" onClick={() => void onForgotPassword()} disabled={submitting}>
          FORGOT PASSWORD?
        </button>

        <button type="submit" className="site00-signin-form__cta" disabled={submitting}>
          SIGN IN →
        </button>

        <div className="site00-signin-form__divider" role="separator">
          <span>OR</span>
        </div>

        <button type="button" className="site00-signin-form__magic" onClick={() => void onMagicLink()} disabled={submitting}>
          <span className="site00-signin-form__magic-icon" aria-hidden="true">
            ✉
          </span>
          <span className="site00-signin-form__magic-label">SIGN IN WITH MAGIC LINK</span>
        </button>

        {error ? (
          <p
            ref={feedbackRef}
            className="site00-signin-form__message site00-signin-form__message--error"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {info ? (
          <p
            ref={feedbackRef}
            className="site00-signin-form__message site00-signin-form__message--info"
            role="status"
          >
            {info}
          </p>
        ) : null}
      </form>

      <p className="site00-signin-form__footer">
        NEW TO SITE 00?
        <Link to={createAccountHref} className="site00-signin-form__footer-link">
          CREATE ACCOUNT
        </Link>
      </p>
    </div>
  );
}
