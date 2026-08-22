import { useState } from 'react';

type IntakeGuestAccessCaptureProps = {
  intakeType: 'IDENTITY' | 'BUILDER';
  onRequestAccess: (email: string) => Promise<{ accessToken: string; expiresAt: string } | null>;
  alreadyIssued: boolean;
};

/**
 * Minimal, non-redesigned email capture at the durable-save boundary (VI). Deliberately plain —
 * this infra sprint does not art-direct this UI; a separate visual pass may restyle it later.
 * Copy is truthful about delivery: we never claim an email was sent unless the provider is
 * actually configured (XXX) — see api/_lib/email/sendEmail.ts sendEmailAsync.
 */
export function IntakeGuestAccessCapture({ intakeType, onRequestAccess, alreadyIssued }: IntakeGuestAccessCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(alreadyIssued ? 'sent' : 'idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('ENTER A VALID EMAIL ADDRESS.');
      return;
    }
    setStatus('sending');
    const result = await onRequestAccess(email.trim());
    if (result) {
      setStatus('sent');
      setErrorMessage(null);
    } else {
      setStatus('error');
      setErrorMessage('COULD NOT SAVE YOUR ACCESS RIGHT NOW. TRY AGAIN.');
    }
  };

  if (status === 'sent') {
    return (
      <div className="site00-intake-guest-access">
        <p className="site00-intake-guest-access__confirmation">
          YOUR {intakeType === 'BUILDER' ? 'BUILDER' : 'IDENTITY'} INTAKE IS SAVED TO THIS EMAIL. A SECURE ACCESS LINK
          WILL BE ISSUED WHEN EMAIL DELIVERY IS CONFIGURED — UNTIL THEN, YOU CAN CONTINUE FROM THIS BROWSER.
        </p>
      </div>
    );
  }

  return (
    <form className="site00-intake-guest-access" onSubmit={handleSubmit}>
      <p className="site00-intake-guest-access__label">WHERE SHOULD WE KEEP THIS?</p>
      <div className="site00-intake-guest-access__row">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          className="site00-intake-guest-access__input"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email for secure intake access"
        />
        <button type="submit" className="site00-intake-guest-access__btn" disabled={status === 'sending'}>
          {status === 'sending' ? 'SAVING…' : 'SAVE MY ACCESS →'}
        </button>
      </div>
      {status === 'error' && errorMessage && <p className="site00-intake-guest-access__error">{errorMessage}</p>}
    </form>
  );
}
