import { FormEvent, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { site00SignUpWithPassword } from '../../../utils/auth/site00CreateAccountActions';
import { resolveSite00ReturnToAfterSignIn } from '../../../utils/signInReturnTo';
import { SITE00_ROUTES } from '../../config/routes';

type Site00CreateAccountFormProps = {
  layout?: 'desktop' | 'mobile';
};

export function Site00CreateAccountForm({ layout = 'desktop' }: Site00CreateAccountFormProps) {
  const location = useLocation();
  const formId = `site00-create-account-form-${layout}`;
  const emailInputId = `site00-create-account-email-${layout}`;
  const passwordInputId = `site00-create-account-password-${layout}`;
  const confirmInputId = `site00-create-account-confirm-${layout}`;
  const nameInputId = `site00-create-account-name-${layout}`;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const feedbackRef = useRef<HTMLParagraphElement>(null);

  const returnTo = resolveSite00ReturnToAfterSignIn(
    new URLSearchParams(location.search).get('returnTo'),
    location.state as { from?: string } | null,
  );

  const redirectAfterAuth = () => {
    window.setTimeout(() => {
      window.location.href = returnTo;
    }, 280);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await site00SignUpWithPassword({
        email,
        password,
        confirmPassword,
        displayName: displayName.trim() || undefined,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      if (result.kind === 'verification_required') {
        setVerificationEmail(result.email);
        return;
      }
      redirectAfterAuth();
    } finally {
      setSubmitting(false);
    }
  };

  const signInTo = (() => {
    const rawReturnTo = new URLSearchParams(location.search).get('returnTo');
    if (rawReturnTo) {
      return {
        pathname: SITE00_ROUTES.signIn,
        search: `?returnTo=${encodeURIComponent(rawReturnTo.slice(0, 1024))}`,
      };
    }
    return {
      pathname: SITE00_ROUTES.signIn,
      search: `?returnTo=${encodeURIComponent(returnTo)}`,
    };
  })();

  if (verificationEmail) {
    return (
      <div className={`site00-signin-form site00-signin-form--${layout} site00-create-account-form`.trim()}>
        <h2 className="site00-create-account-form__title">CHECK YOUR INBOX.</h2>
        <p className="site00-create-account-form__verification" role="status">
          WE SENT THE ACCESS LINK TO:
          <br />
          <strong>{verificationEmail}</strong>
        </p>
        <p className="site00-create-account-form__hint">
          CONFIRM YOUR EMAIL, THEN SIGN IN TO CONTINUE.
        </p>
        <Link to={signInTo} className="site00-signin-form__cta site00-create-account-form__cta-link">
          RETURN TO SIGN IN →
        </Link>
      </div>
    );
  }

  return (
    <div className={`site00-signin-form site00-signin-form--${layout} site00-create-account-form`.trim()}>
      {layout === 'desktop' ? (
        <Link to={SITE00_ROUTES.originAlias} className="site00-signin-form__back">
          ← BACK TO SITE 00
        </Link>
      ) : null}

      <h2 className="site00-create-account-form__title">CREATE ACCOUNT</h2>
      <p className="site00-create-account-form__subtitle">TURN YOUR GUEST PROGRESS INTO AN OWNED CLIENT IDENTITY.</p>

      <form id={formId} className="site00-signin-form__body" onSubmit={onSubmit} autoComplete="on">
        <label className="site00-signin-form__label" htmlFor={emailInputId}>
          EMAIL
        </label>
        <input
          id={emailInputId}
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="site00-signin-form__input"
          disabled={submitting}
          required
        />

        <label className="site00-signin-form__label" htmlFor={nameInputId}>
          NAME <span className="site00-create-account-form__optional">(OPTIONAL)</span>
        </label>
        <input
          id={nameInputId}
          name="name"
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="site00-signin-form__input"
          disabled={submitting}
        />

        <label className="site00-signin-form__label" htmlFor={passwordInputId}>
          PASSWORD
        </label>
        <div className="site00-signin-form__password-wrap">
          <input
            id={passwordInputId}
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="site00-signin-form__input site00-signin-form__input--password"
            disabled={submitting}
            required
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
        <p className="site00-create-account-form__hint">USE THE PASSWORD REQUIREMENTS FROM YOUR EMAIL PROVIDER.</p>

        <label className="site00-signin-form__label" htmlFor={confirmInputId}>
          CONFIRM PASSWORD
        </label>
        <input
          id={confirmInputId}
          name="confirm-password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="site00-signin-form__input"
          disabled={submitting}
          required
        />

        <button type="submit" className="site00-signin-form__cta" disabled={submitting}>
          CREATE ACCOUNT →
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
      </form>

      <p className="site00-signin-form__footer">
        ALREADY HAVE AN ACCOUNT?
        <Link to={signInTo} className="site00-signin-form__footer-link">
          SIGN IN
        </Link>
      </p>
    </div>
  );
}
