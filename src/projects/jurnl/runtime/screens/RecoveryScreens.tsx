/** F01.05 FORGOT PASSWORD · F01.06 RESET EMAIL SENT · F01.07 CREATE NEW PASSWORD · F01.08 PASSWORD RESET SUCCESS */

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { F01_COPY, isValidEmail, passwordRuleState, passwordSatisfied } from '../../data/f01/copy';
import {
  JurnlButton,
  JurnlErrorPanel,
  JurnlHeadline,
  JurnlInlineExpansion,
  JurnlInput,
  JurnlLines,
  JurnlLogo,
  JurnlPasswordRequirements,
  JurnlTextLink,
  JurnlTile,
} from '../components/primitives';
import { useJurnl } from '../state/store';
import { MailHandoff, useNetworkToast } from './EntryScreens';
import { JurnlScreen } from './JurnlScreen';

const C = F01_COPY;

/* ───────────── F01.05 FORGOT PASSWORD ───────────── */
export function ForgotPasswordScreen() {
  const { forcedState, auth, setSession, go } = useJurnl();
  const [email, setEmail] = useState(forcedState === 'invalid_email' ? 'EMMA@' : '');
  const [invalid, setInvalid] = useState(forcedState === 'invalid_email');
  const [loading, setLoading] = useState(false);
  const netToast = useNetworkToast();
  const submit = async () => {
    if (!isValidEmail(email)) return setInvalid(true);
    setLoading(true);
    const res = await auth.requestPasswordReset(email);
    setLoading(false);
    if (!res.ok) return netToast(res.code);
    setSession({ pendingEmail: email.trim().toUpperCase() });
    go('F01.06');
  };
  return (
    <JurnlScreen screenId="F01.05" scene="forgot" layout="form">
      <div className="jrn-col__head" data-runtime-bounds="copy">
        <JurnlLogo />
        <div style={{ marginTop: 'clamp(40px, 9vh, 90px)' }} />
        <JurnlHeadline lines={C.forgot.headline} xl />
        <p className="jrn-kicker" style={{ marginTop: 18, maxWidth: 320 }}>
          {C.forgot.lead}
        </p>
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
        <JurnlInput label={C.forgot.email} type="email" value={email} onValue={(v) => (setEmail(v), setInvalid(false))} invalid={invalid} trigger="forgot-email" autoComplete="email" />
        {invalid ? <JurnlErrorPanel testId="forgot-error-email" title={C.forgot.invalid} /> : null}
        <JurnlButton type="submit" trigger="forgot-submit" loading={loading} loadingLabel={C.forgot.loading} onClick={() => void submit()}>
          {C.forgot.submit}
        </JurnlButton>
        <JurnlTextLink trigger="forgot-back" onClick={() => go('F01.03')}>
          {C.forgot.back}
        </JurnlTextLink>
      </form>
    </JurnlScreen>
  );
}

/* ───────────── F01.06 RESET EMAIL SENT ───────────── */
export function ResetSentScreen() {
  const { forcedState, overlay, openOverlay, auth, session, showToast, go } = useJurnl();
  const [resending, setResending] = useState(false);
  const netToast = useNetworkToast();
  const resend = async () => {
    setResending(true);
    const res = await auth.requestPasswordReset(session.pendingEmail ?? '');
    setResending(false);
    if (!res.ok) return netToast(res.code);
    showToast({ tone: 'success', title: C.resetSent.toastTitle, body: C.resetSent.toastBody, testId: 'toast-reset-resent' });
  };
  return (
    <JurnlScreen screenId="F01.06" scene="reset-sent" layout="center">
      <div className="jrn-col__head" data-runtime-bounds="copy">
        <JurnlLogo />
      </div>
      <div className="jrn-card jrn-card--paper jrn-sheet-paper" data-runtime-bounds="card">
        <JurnlHeadline lines={C.resetSent.headline} xl />
        <i className="jrn-rule" aria-hidden />
        <JurnlLines lines={C.resetSent.sub} />
      </div>
      <div className="jrn-cta" data-runtime-bounds="cta" style={{ width: '82%' }}>
        {forcedState === 'expired_link' ?
          <JurnlErrorPanel
            testId="reset-sent-error-expired"
            title={C.newPassword.invalidTitle}
            body={C.newPassword.invalidBody}
            action={{ label: C.newPassword.requestNew, onClick: () => go('F01.05'), trigger: 'reset-sent-request-new' }}
          />
        : null}
        <JurnlButton trigger="reset-sent-open-mail" onClick={() => openOverlay('mail')}>
          {C.resetSent.openMail}
        </JurnlButton>
        <JurnlButton variant="secondary" trigger="reset-sent-resend" loading={resending} onClick={() => void resend()}>
          {C.resetSent.resend}
        </JurnlButton>
        <JurnlTextLink trigger="reset-sent-back" onClick={() => go('F01.03')}>
          {C.resetSent.back}
        </JurnlTextLink>
      </div>
      {overlay === 'mail' ? <MailHandoff /> : null}
    </JurnlScreen>
  );
}

/* ───────────── F01.07 CREATE NEW PASSWORD ───────────── */
const FORCED_NEWPW: Record<string, { pw: string; confirm: string }> = {
  mismatch: { pw: 'Jurnl-2026!', confirm: 'Jurnl-2025!' },
  weak: { pw: 'jurnl', confirm: 'jurnl' },
  network_error: { pw: 'Jurnl-2026!', confirm: 'Jurnl-2026!' },
};

export function NewPasswordScreen() {
  const { forcedState, auth, mode, session, showToast, go } = useJurnl();
  const [params] = useSearchParams();
  const rawToken = params.get('token') ?? (mode === 'design-preview' ? 'preview' : null);
  const token = rawToken === 'preview' ? `preview:${session.pendingEmail ?? ''}` : rawToken;
  const forced = FORCED_NEWPW[forcedState ?? ''];
  const [pw, setPw] = useState(forced?.pw ?? '');
  const [confirm, setConfirm] = useState(forced?.confirm ?? '');
  const [attempted, setAttempted] = useState(forcedState === 'mismatch' || forcedState === 'weak');
  const [invalidLink, setInvalidLink] = useState(forcedState === 'invalid_reset_link');
  const [loading, setLoading] = useState(false);
  const netToast = useNetworkToast();
  const shown = useRef(false);

  useEffect(() => {
    if (forcedState === 'network_error' && !shown.current) {
      shown.current = true;
      showToast({ tone: 'error', title: C.newPassword.networkTitle, body: C.newPassword.networkBody, testId: 'toast-network' });
    }
  }, [forcedState, showToast]);
  useEffect(() => {
    if (forcedState) return;
    let alive = true;
    void auth.validateResetToken(token).then((res) => {
      if (alive && !res.ok && res.code === 'INVALID_LINK') setInvalidLink(true);
    });
    return () => {
      alive = false;
    };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const weak = attempted && !passwordSatisfied(pw);
  const mismatch = attempted && !weak && confirm !== pw;
  const submit = async () => {
    setAttempted(true);
    if (!passwordSatisfied(pw) || confirm !== pw) return;
    setLoading(true);
    const res = await auth.resetPassword(token, pw);
    setLoading(false);
    if (!res.ok) {
      if (res.code === 'INVALID_LINK') return setInvalidLink(true);
      return netToast(res.code);
    }
    go('F01.08', { banner: '1' });
  };

  return (
    <JurnlScreen screenId="F01.07" scene="newpw" layout="card">
      <div className="jrn-col__head">
        <JurnlLogo />
      </div>
      <div className="jrn-card jrn-card--travertine jrn-newpw-card" data-runtime-bounds="card">
        <JurnlHeadline lines={C.newPassword.headline} />
        {invalidLink ?
          <JurnlErrorPanel
            block
            testId="newpw-error-invalid-link"
            title={C.newPassword.invalidTitle}
            body={C.newPassword.invalidBody}
            action={{ label: C.newPassword.requestNew, onClick: () => go('F01.05'), trigger: 'newpw-request-new', variant: 'primary' }}
          />
        : <form
            className="jrn-stack"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <JurnlInput label={C.newPassword.newPassword} type="password" revealable value={pw} onValue={setPw} invalid={weak} trigger="newpw-password" autoComplete="new-password" />
            <JurnlInput
              label={C.newPassword.confirm}
              type="password"
              revealable
              value={confirm}
              onValue={setConfirm}
              invalid={mismatch}
              trigger="newpw-confirm"
              autoComplete="new-password"
            />
            {mismatch ? <JurnlErrorPanel testId="newpw-error-mismatch" title={C.newPassword.mismatch} /> : null}
            {weak ? <JurnlErrorPanel testId="newpw-error-weak" title={C.newPassword.weak} /> : null}
            <JurnlInlineExpansion open>
              <JurnlPasswordRequirements rules={passwordRuleState(pw)} flagUnmet={weak} testId="newpw-requirements" />
            </JurnlInlineExpansion>
            <JurnlButton type="submit" trigger="newpw-submit" loading={loading} loadingLabel={C.newPassword.loading} onClick={() => void submit()}>
              {C.newPassword.submit}
            </JurnlButton>
          </form>
        }
      </div>
    </JurnlScreen>
  );
}

/* ───────────── F01.08 PASSWORD RESET SUCCESS ───────────── */
export function ResetSuccessScreen() {
  const { showToast, go } = useJurnl();
  const [params] = useSearchParams();
  const shown = useRef(false);
  useEffect(() => {
    if (params.get('banner') === '1' && !shown.current) {
      shown.current = true;
      showToast({ tone: 'success', title: C.resetSuccess.bannerTitle, testId: 'toast-reset-success' });
    }
  }, [params, showToast]);
  return (
    <JurnlScreen screenId="F01.08" scene="success" layout="center">
      <div className="jrn-col__head" data-runtime-bounds="copy">
        <JurnlLogo small />
        <span style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 26px' }} data-jrn-trigger="reset-success-mark">
          <JurnlTile icon="check" tone="emerald" large size={30} />
        </span>
        <JurnlHeadline lines={C.resetSuccess.headline} xl />
        <i className="jrn-rule jrn-rule--emerald" aria-hidden />
        <JurnlLines lines={C.resetSuccess.sub} />
      </div>
      <div className="jrn-cta" data-runtime-bounds="cta" style={{ width: '100%' }}>
        <JurnlButton trigger="reset-success-sign-in" onClick={() => go('F01.03')}>
          {C.resetSuccess.signIn}
        </JurnlButton>
      </div>
    </JurnlScreen>
  );
}
