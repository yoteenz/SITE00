import { useCallback, useEffect, useState } from 'react';
import { fetchSessionPayload, requestDfReentry, verifyDfReentry } from '../../foundation-client/api';
import { FoundationClient } from '../../foundation-client/FoundationClient';
import { DfField } from '../../foundation-client/components';
import { DfCta, DfHeadline, DfLede, DfLoading, DfSystemPanel } from '../../foundation-client/shell';
import { dfInputDisplayUpper } from '../../foundation-client/dfInputText';

/** `/foundation/return` — PWA start URL + session restore (G-09). */
export default function DigitalFoundationReturnPage() {
  const [token, setToken] = useState<string | null>(null);
  const [phase, setPhase] = useState<'loading' | 'reentry' | 'ready' | 'error'>('loading');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    setPhase('loading');
    setError(null);
    try {
      const payload = await fetchSessionPayload();
      setToken(payload.artifact.public_token);
      setPhase('ready');
    } catch {
      setPhase('reentry');
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  if (phase === 'loading') return <DfLoading />;
  if (phase === 'ready' && token) return <FoundationClient token={token} pwaScope />;

  const sendCode = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await requestDfReentry(email);
      if (res.dev_code) setDevCode(res.dev_code);
    } catch {
      setError('WE COULD NOT START VERIFICATION. TRY AGAIN.');
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await verifyDfReentry(email, code);
      setToken(res.payload.artifact.public_token);
      setPhase('ready');
    } catch {
      setError('THAT CODE DID NOT MATCH. CHECK YOUR EMAIL AND TRY AGAIN.');
    } finally {
      setBusy(false);
    }
  };

  if (phase === 'error') {
    return (
      <DfSystemPanel
        index="00"
        label="MY FOUNDATION"
        lines={['TEMPORARILY', 'UNAVAILABLE']}
        body="WE COULD NOT RESTORE YOUR SESSION. OPEN THE LINK FROM YOUR SITE 00 EMAIL OR TRY AGAIN."
        action={<DfCta label="TRY AGAIN" onClick={() => void loadSession()} />}
      />
    );
  }

  return (
    <div className="df-root" data-surface="PROSPECT">
      <div className="df-frame">
        <DfHeadline lines={["CONFIRM", "IT'S YOU"]} />
        <DfLede>ENTER THE EMAIL SITE 00 USES FOR YOUR FOUNDATION. WE SEND A ONE-TIME CODE — NO PASSWORD.</DfLede>
        <DfField id="df-reentry-email" label="EMAIL">
          <input
            className="df-input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(dfInputDisplayUpper(e.target.value))}
          />
        </DfField>
        {devCode && (
          <p className="df-section__note" role="status">
            DEV CODE: {devCode}
          </p>
        )}
        <div className="df-actions">
          <DfCta label="SEND CODE" busy={busy} onClick={() => void sendCode()} />
        </div>
        <DfField id="df-reentry-code" label="6-DIGIT CODE">
          <input
            className="df-input"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
        </DfField>
        {error && (
          <p className="df-field__error" role="alert">
            {error}
          </p>
        )}
        <div className="df-actions">
          <DfCta label="CONTINUE" busy={busy} onClick={() => void verify()} />
        </div>
      </div>
    </div>
  );
}
