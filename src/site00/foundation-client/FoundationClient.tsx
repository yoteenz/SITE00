/**
 * Digital Foundation — client artifact at `/foundation/:token` (Board 01 + Board 02).
 *
 * One URL for the whole relationship. The server resolves the surface; this component picks the parent
 * inside it and keeps that choice in history state (never in the path), so back/forward work without a
 * per-stage URL and no client data reaches the address bar.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DF_FEATURE_FLAGS, isDigitalFoundationFlagEnabled } from '../../../shared/site00-digital-foundation/featureFlags.js';
import DigitalFoundationCompleteSurface from '../pages/foundation/DigitalFoundationCompleteSurface';
import { saveIntake } from './api';
import { resolveDfRoute, validateBusinessInfo, type CheckoutParam, type DfView, type IntakeErrors } from './model';
import { P01Entry, P02Intake, P03Configure, SaveChip } from './parents/EntryIntake';
import { P04Recommendation } from './parents/Recommendation';
import { InterimOverview, P05Review, P06Activation } from './parents/CheckoutActivation';
import { DfCta, DfFrame, DfLoading, DfMenu, DfSystemPanel, type DfObjectKind } from './shell';
import { DfToastProvider, useDfToasts } from './components';
import { useFoundationArtifact, useIntakeDraft, usePaymentVerification, useQuoteSelections, type SaveStatus } from './useFoundationArtifact';
import '../styles/site00-df-client.css';
import '../styles/site00-df-components.css';

const OBJECT_FOR: Record<DfView, DfObjectKind> = {
  P01: 'hero',
  P02: 'corner',
  P03: 'corner',
  P04: 'crown',
  P05: 'crown',
  P06: 'crown',
  OVERVIEW: 'crown',
};

function seenKey(artifactId: string) {
  return `site00.df.activation-seen.${artifactId}`;
}

function readSeen(artifactId: string | undefined): boolean {
  if (!artifactId) return false;
  try {
    return window.localStorage.getItem(seenKey(artifactId)) === '1';
  } catch {
    return false;
  }
}

function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const prevTitle = document.title;
    document.title = 'DIGITAL FOUNDATION — SITE 00';
    return () => {
      meta.remove();
      document.title = prevTitle;
    };
  }, []);
}

function InvalidLink({ onMintPreview, mintBusy }: { onMintPreview?: () => void; mintBusy?: boolean }) {
  const cloudPreview = import.meta.env.VITE_SITE00_CLOUD_PREVIEW === '1';
  return (
    <DfSystemPanel
      index="00"
      label="FOUNDATION LINK"
      lines={['THIS LINK', "ISN'T ACTIVE"]}
      body={
        cloudPreview
          ? 'THIS PREVIEW LINK EXPIRED WHEN THE SERVER RESTARTED OR YOU OPENED A BOOKMARK FROM ANOTHER SESSION. OPEN A FRESH BLANK TEMPLATE BELOW — P01 WITH NO CLIENT DATA.'
          : 'CHECK THAT YOU OPENED THE FULL LINK SITE 00 SENT YOU. IF IT STILL DOESN\'T OPEN, REPLY TO THE MESSAGE IT CAME IN.'
      }
      action={
        cloudPreview && onMintPreview ? (
          <DfCta
            label="OPEN BLANK TEMPLATE"
            onClick={onMintPreview}
            busy={mintBusy}
            busyLabel="OPENING…"
          />
        ) : undefined
      }
    />
  );
}

function Unavailable() {
  return (
    <DfSystemPanel
      index="00"
      label="DIGITAL FOUNDATION"
      lines={['TEMPORARILY', 'UNAVAILABLE']}
      body="DIGITAL FOUNDATION IS NOT OPEN RIGHT NOW. YOUR LINK AND ANYTHING YOU SAVED ARE KEPT. PLEASE TRY AGAIN LATER."
    />
  );
}

export function FoundationClient({ token }: { token: string }) {
  useNoIndex();
  const enabled = isDigitalFoundationFlagEnabled(DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1);
  const { payload, setPayload, catalog, load, reload, retry } = useFoundationArtifact(enabled ? token : '');
  const location = useLocation();
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const checkoutRaw = params.get('checkout');
  const checkout: CheckoutParam = checkoutRaw === 'return' || checkoutRaw === 'cancel' ? checkoutRaw : null;
  const simulated = params.get('simulated_checkout') === '1';
  const navState = location.state as { dfView?: DfView; dfAnchor?: string } | null;
  const stateView = (navState?.dfView ?? null) as DfView | null;
  const stateAnchor = navState?.dfAnchor ?? null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [beginBusy, setBeginBusy] = useState(false);
  const [beginError, setBeginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [p02Errors, setP02Errors] = useState<IntakeErrors | undefined>(undefined);
  const [seenTick, setSeenTick] = useState(0);
  const [mintBusy, setMintBusy] = useState(false);

  const mintPreviewTemplate = useCallback(async () => {
    setMintBusy(true);
    try {
      const res = await fetch('/api/dev/site00-digital-foundation-preview-bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: true }),
      });
      const json = (await res.json()) as { public_token?: string; error?: string };
      if (!res.ok || !json.public_token) throw new Error(json.error ?? 'Preview bootstrap failed');
      window.location.assign(`/foundation/${json.public_token}`);
    } catch {
      setMintBusy(false);
    }
  }, []);

  const intake = useIntakeDraft(token, payload, reload);
  const quoteSel = useQuoteSelections(token, payload, setPayload);

  const artifactId = payload?.artifact.artifact_id;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activationSeen = useMemo(() => readSeen(artifactId), [artifactId, seenTick]);
  const route = payload ? resolveDfRoute(payload, { checkout, activationSeen }) : null;
  const view: DfView | null =
    route?.kind === 'views' ? (stateView && route.views.includes(stateView) ? stateView : route.defaultView) : null;

  const paid = payload?.artifact.payment_state === 'PAID';
  const verifying = Boolean(payload && view === 'P06' && checkout === 'return' && !paid && payload.surface !== 'PAYMENT_RECOVERY');
  const verification = usePaymentVerification(verifying, reload);

  const go = useCallback(
    (v: DfView, opts: { replace?: boolean; dropQuery?: boolean; anchor?: string } = {}) => {
      navigate(
        { pathname: location.pathname, search: opts.dropQuery ? '' : location.search },
        { state: opts.anchor ? { dfView: v, dfAnchor: opts.anchor } : { dfView: v }, replace: opts.replace },
      );
      setMenuOpen(false);
      window.scrollTo(0, 0);
      if (rootRef.current) rootRef.current.scrollTop = 0;
    },
    [navigate, location.pathname, location.search],
  );

  // Once Stripe's webhook has marked the artifact PAID, drop the return marker so a reload is just the portal link.
  useEffect(() => {
    if (checkout === 'return' && paid) go('P06', { replace: true, dropQuery: true });
  }, [checkout, paid, go]);

  useEffect(() => {
    if (!stateAnchor || view !== stateView) return undefined;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(stateAnchor)?.scrollIntoView({ block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [stateAnchor, stateView, view, location.key]);

  if (!token) return <InvalidLink onMintPreview={mintPreviewTemplate} mintBusy={mintBusy} />;
  if (!enabled) return <Unavailable />;
  if (load.status === 'loading' && !payload) return <DfLoading />;
  if (load.status === 'error' && !payload) {
    if (load.error.status === 404 || load.error.code.includes('NOT_FOUND')) {
      return <InvalidLink onMintPreview={mintPreviewTemplate} mintBusy={mintBusy} />;
    }
    if (load.error.status === 503) return <Unavailable />;
    return (
      <DfSystemPanel
        index="00"
        label="DIGITAL FOUNDATION"
        lines={["WE COULDN'T", 'LOAD THIS']}
        body={
          load.error.status === 0
            ? "WE COULDN'T REACH SITE 00. CHECK YOUR CONNECTION AND TRY AGAIN."
            : 'SOMETHING WENT WRONG ON OUR SIDE. NOTHING YOU SAVED WAS LOST. PLEASE TRY AGAIN.'
        }
        action={<DfCta label="TRY AGAIN" onClick={retry} />}
      />
    );
  }
  if (!payload || !route) return <DfLoading />;

  if (route.kind === 'complete') {
    return <DigitalFoundationCompleteSurface token={token} payload={payload} reload={reload} />;
  }
  if (route.kind === 'closed') {
    return (
      <DfSystemPanel
        index="00"
        label="FOUNDATION LINK"
        lines={['THIS LINK', 'HAS BEEN', 'CLOSED']}
        body="THIS DIGITAL FOUNDATION LINK IS NO LONGER ACTIVE. IF YOU THINK THAT'S A MISTAKE, REPLY TO THE MESSAGE IT CAME IN."
      />
    );
  }
  if (!view) return <DfLoading />;

  const config = catalog?.config ?? null;
  const save = <SaveChip status={intake.status} savedAt={intake.savedAt} onRetry={() => void intake.retry()} />;

  const begin = async () => {
    setBeginError(null);
    if (payload.artifact.intake_state !== 'NOT_STARTED') {
      go('P02');
      return;
    }
    setBeginBusy(true);
    try {
      await saveIntake(token, {}, undefined, false);
      await reload();
      go('P02');
    } catch {
      setBeginError("WE COULDN'T START YOUR FOUNDATION. CHECK YOUR CONNECTION AND TRY AGAIN.");
    } finally {
      setBeginBusy(false);
    }
  };

  const submitIntake = async (errors: IntakeErrors) => {
    setSubmitError(null);
    if (!intake.draft) return;
    const business = validateBusinessInfo(intake.draft);
    if (Object.keys(business).length) {
      setP02Errors(business);
      go('P02');
      return;
    }
    if (Object.keys(errors).length) return;
    setSubmitting(true);
    const res = await intake.complete();
    setSubmitting(false);
    if (res.ok) {
      setP02Errors(undefined);
      go('P04');
    } else {
      setSubmitError(
        res.code === 'NETWORK'
          ? "WE COULDN'T REACH SITE 00. YOUR CHOICES ARE STILL HERE — TRY AGAIN."
          : "WE COULDN'T BUILD YOUR RECOMMENDATION. YOUR CHOICES ARE STILL HERE — TRY AGAIN.",
      );
    }
  };

  const markSeen = () => {
    try {
      window.localStorage.setItem(seenKey(payload.artifact.artifact_id), '1');
    } catch {
      /* private mode: P06 shows again next visit, which is harmless */
    }
    setSeenTick((t) => t + 1);
  };

  let body: JSX.Element | null = null;
  let state: string | undefined;
  switch (view) {
    case 'P01':
      body = <P01Entry config={config} onBegin={begin} busy={beginBusy} error={beginError} />;
      break;
    case 'P02':
      body = intake.draft ? (
        <P02Intake
          draft={intake.draft}
          update={intake.update}
          editable={intake.editable}
          errors={p02Errors}
          save={save}
          onSaveForLater={intake.flush}
          onContinue={() => {
            setP02Errors(undefined);
            void intake.flush();
            go('P03');
          }}
        />
      ) : null;
      break;
    case 'P03':
      body = intake.draft ? (
        <P03Configure
          draft={intake.draft}
          update={intake.update}
          editable={intake.editable}
          onSubmit={submitIntake}
          submitting={submitting}
          submitError={submitError}
          save={save}
        />
      ) : null;
      break;
    case 'P04':
      body = (
        <P04Recommendation
          payload={payload}
          catalog={catalog?.catalog ?? null}
          config={config}
          desired={quoteSel.desired}
          syncStatus={quoteSel.status}
          syncError={quoteSel.error}
          onToggle={quoteSel.toggle}
          onQuantity={quoteSel.setQuantity}
          onRefresh={() => void quoteSel.refresh()}
          onContinue={() => go('P05')}
        />
      );
      state = quoteSel.status;
      break;
    case 'P05':
      body = (
        <P05Review
          token={token}
          payload={payload}
          config={config}
          setPayload={setPayload}
          reload={reload}
          checkout={checkout}
          onEditAddons={() => go('P04')}
        />
      );
      break;
    case 'P06':
      body = (
        <P06Activation
          payload={payload}
          verify={verification.phase}
          attempt={verification.attempt}
          attempts={verification.attempts}
          simulated={simulated}
          onOverview={() => {
            markSeen();
            go('OVERVIEW', { dropQuery: true });
          }}
          onRetry={() => {
            if (checkout === 'return') verification.restart();
            else void reload().catch(() => undefined);
          }}
        />
      );
      break;
    case 'OVERVIEW':
      body = <InterimOverview payload={payload} onActivation={() => go('P06')} />;
      break;
  }

  return (
    <DfToastProvider>
      <div
        className={`df-root${menuOpen ? ' df-root--menu-open' : ''}`}
        ref={rootRef}
        data-surface={payload.surface}
      >
        <DfFrame
          view={view}
          object={OBJECT_FOR[view]}
          onMenu={() => setMenuOpen((o) => !o)}
          menuOpen={menuOpen}
          state={state}
        >
          {body}
        </DfFrame>
        <DfMenu open={menuOpen} onClose={() => setMenuOpen(false)} views={route.views} current={view} onNavigate={(v, anchor) => go(v, { anchor })} />
        <SaveStatusToasts status={intake.status} />
      </div>
    </DfToastProvider>
  );
}

/** Announces autosave failures (persistently) and their recovery once — never a toast per routine autosave. */
function SaveStatusToasts({ status }: { status: SaveStatus }) {
  const toasts = useDfToasts();
  const prev = useRef<SaveStatus>(status);
  const failed = useRef(false);
  useEffect(() => {
    const was = prev.current;
    prev.current = status;
    if (status === 'error' && was !== 'error') {
      failed.current = true;
      toasts.push({ tone: 'error', message: 'SOMETHING WENT WRONG. PLEASE TRY AGAIN.', key: 'intake-save', persistent: true });
    } else if (status === 'saved' && failed.current) {
      failed.current = false;
      toasts.dismiss('intake-save');
      toasts.push({ tone: 'success', message: 'CHANGES SAVED SUCCESSFULLY.', key: 'intake-saved' });
    }
  }, [status, toasts]);
  return null;
}
