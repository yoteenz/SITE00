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
import { resolveDigitalFoundationArtifactUiStep } from '../../../shared/site00-digital-foundation/artifactUiStep.js';
import DigitalFoundationCompleteSurface from '../pages/foundation/DigitalFoundationCompleteSurface';
import { saveIntake } from './api';
import { growthOf } from './growth/model';
import { useAmbitionSave, useBuildInterest, useGrowthSelections } from './growth/useGrowth';
import { GAmbition, GPath, GPlan, GRoadmap, GrowthCheckoutNote, GrowthInvite, GrowthPortalPanel } from './parents/Growth';
import { resolveDfRoute, validateBusinessInfo, type CheckoutParam, type DfView, type IntakeErrors } from './model';
import { P01Entry, P02Intake, P03Configure, SaveChip } from './parents/EntryIntake';
import { P04Recommendation } from './parents/Recommendation';
import { InterimOverview, P05Review, P06Activation } from './parents/CheckoutActivation';
import { DfCta, DfFrame, DfLoading, DfMenu, DfSystemPanel, type DfObjectKind } from './shell';
import { useFoundationArtifact, useIntakeDraft, usePaymentVerification, useQuoteSelections } from './useFoundationArtifact';
import '../styles/site00-df-client.css';
import '../styles/site00-df-growth.css';

const OBJECT_FOR: Record<DfView, DfObjectKind> = {
  P01: 'hero',
  P02: 'corner',
  P03: 'corner',
  P04: 'crown',
  P05: 'crown',
  P06: 'crown',
  OVERVIEW: 'crown',
  AMBITION: 'growth',
  GROWTH: 'growth',
  PLAN: 'growth',
  ROADMAP: 'growth',
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

function InvalidLink() {
  const cloudPreview = import.meta.env.VITE_SITE00_CLOUD_PREVIEW === '1';
  return (
    <DfSystemPanel
      index="00"
      label="FOUNDATION LINK"
      lines={['THIS LINK', "ISN'T ACTIVE"]}
      body={
        cloudPreview
          ? 'PREVIEW LINKS RESET WHEN THE TUNNEL RESTARTS UNLESS THEY WERE CREATED ON THIS ENVIRONMENT. OPEN THE FOUNDER CONSOLE AND USE CLIENT INTAKE FOR A FRESH LINK.'
          : "CHECK THAT YOU OPENED THE FULL LINK SITE 00 SENT YOU. IF IT STILL DOESN'T OPEN, REPLY TO THE MESSAGE IT CAME IN."
      }
      action={
        cloudPreview ? (
          <a className="df-link df-link--row" href="/admin/site00/foundation">
            DIGITAL FOUNDATION ADMIN
          </a>
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
  const preferIntake = params.get('step') === 'intake';
  const stateView = ((location.state as { dfView?: DfView } | null)?.dfView ?? null) as DfView | null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [beginBusy, setBeginBusy] = useState(false);
  const [beginError, setBeginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [p02Errors, setP02Errors] = useState<IntakeErrors | undefined>(undefined);
  const [seenTick, setSeenTick] = useState(0);

  const intake = useIntakeDraft(token, payload, reload);
  const quoteSel = useQuoteSelections(token, payload, setPayload);
  const growth = growthOf(payload);
  const growthOn = Boolean(growth);
  const ambition = useAmbitionSave(token, setPayload);
  const growthSel = useGrowthSelections(token, growth, setPayload);
  const bldr = useBuildInterest(token, setPayload);
  const deepLinkDone = useRef(false);

  const artifactId = payload?.artifact.artifact_id;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activationSeen = useMemo(() => readSeen(artifactId), [artifactId, seenTick]);
  const route = payload ? resolveDfRoute(payload, { checkout, activationSeen, growth: growthOn }) : null;
  const view: DfView | null =
    route?.kind === 'views' ? (stateView && route.views.includes(stateView) ? stateView : route.defaultView) : null;

  const paid = payload?.artifact.payment_state === 'PAID';
  const verifying = Boolean(payload && view === 'P06' && checkout === 'return' && !paid && payload.surface !== 'PAYMENT_RECOVERY');
  const verification = usePaymentVerification(verifying, reload);

  const go = useCallback(
    (v: DfView, opts: { replace?: boolean; dropQuery?: boolean } = {}) => {
      navigate(
        { pathname: location.pathname, search: opts.dropQuery ? '' : location.search },
        { state: { dfView: v }, replace: opts.replace },
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

  // `?step=intake` deep link (founder-sent "start intake" links): open business information directly.
  useEffect(() => {
    if (!preferIntake || deepLinkDone.current || !payload || stateView) return;
    if (resolveDigitalFoundationArtifactUiStep(payload, { preferIntake: true }) !== 'intake') return;
    deepLinkDone.current = true;
    if (payload.artifact.intake_state !== 'NOT_STARTED') {
      go('P02', { replace: true });
      return;
    }
    void saveIntake(token, {}, undefined, false)
      .then(() => reload())
      .then(() => go('P02', { replace: true }))
      .catch(() => undefined);
  }, [preferIntake, payload, stateView, token, reload, go]);

  if (!token) return <InvalidLink />;
  if (!enabled) return <Unavailable />;
  if (load.status === 'loading' && !payload) return <DfLoading />;
  if (load.status === 'error' && !payload) {
    if (load.error.status === 404 || load.error.code.includes('NOT_FOUND')) return <InvalidLink />;
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
  const intakeDone = payload.artifact.intake_state === 'COMPLETE';
  const hasGoals = Boolean(growth?.ambition && !growth.ambition.skipped && growth.ambition.goals.length);
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
          onContinue={() => {
            setP02Errors(undefined);
            void intake.flush();
            go(growthOn && route.views.includes('AMBITION') ? 'AMBITION' : 'P03');
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
          onContinue={() => go(growthOn && hasGoals && route.views.includes('GROWTH') ? 'GROWTH' : 'P05')}
          growthSlot={growth && route.views.includes('GROWTH') ? <GrowthInvite growth={growth} onOpen={() => go('GROWTH')} /> : undefined}
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
          growthSlot={growth ? <GrowthCheckoutNote growth={growth} /> : undefined}
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
      body = (
        <InterimOverview
          payload={payload}
          onActivation={() => go('P06')}
          growthSlot={growth && route.views.includes('ROADMAP') ? <GrowthPortalPanel growth={growth} onRoadmap={() => go('ROADMAP')} /> : undefined}
        />
      );
      break;
    case 'AMBITION':
      body = growth ? (
        <GAmbition
          key={`${growth.ambition?.started_at ?? 'new'}`}
          growth={growth}
          saveStatus={ambition.status}
          saveError={ambition.error}
          nextLabel={intakeDone ? 'SEE MY GROWTH PATH' : 'CONTINUE TO MY FOUNDATION'}
          onSave={async (draft) => {
            const ok = await ambition.save({ draft, complete: true });
            if (ok) go(intakeDone ? 'GROWTH' : 'P03');
            return ok;
          }}
          onSkip={async () => {
            const ok = await ambition.save({ skipped: true });
            if (ok) go(intakeDone ? 'P04' : 'P03');
            return ok;
          }}
        />
      ) : null;
      state = ambition.status;
      break;
    case 'GROWTH':
      body = growth ? (
        <GPath
          growth={growth}
          payload={payload}
          desired={growthSel.desired}
          selectionStatus={growthSel.status}
          selectionError={growthSel.error}
          onToggle={growthSel.toggle}
          onClear={growthSel.clear}
          onEditGoals={() => go('AMBITION')}
          onContinue={() => go('PLAN')}
          onFoundationOnly={() => go(route.views.includes('P05') ? 'P05' : 'PLAN')}
          onBldrInterest={() => void bldr.record()}
          bldrStatus={bldr.status}
        />
      ) : null;
      state = growthSel.status;
      break;
    case 'PLAN':
      body = growth ? (
        <GPlan
          growth={growth}
          payload={payload}
          onBack={() => go('GROWTH')}
          onContinue={() => go(route.views.includes('P05') ? 'P05' : 'P04')}
          onRoadmap={() => go('ROADMAP')}
        />
      ) : null;
      break;
    case 'ROADMAP':
      body = growth ? (
        <GRoadmap
          growth={growth}
          payload={payload}
          onBack={() => go(route.views.includes('OVERVIEW') ? 'OVERVIEW' : route.views.includes('PLAN') ? 'PLAN' : route.defaultView)}
          backLabel={route.views.includes('OVERVIEW') ? 'BACK TO PROJECT OVERVIEW' : route.views.includes('PLAN') ? 'BACK TO INVESTMENT + DELIVERY' : 'BACK'}
        />
      ) : null;
      break;
  }

  return (
    <div className="df-root" ref={rootRef} data-surface={payload.surface}>
      <DfFrame
        view={view}
        object={OBJECT_FOR[view]}
        onMenu={() => setMenuOpen((o) => !o)}
        menuOpen={menuOpen}
        state={state}
      >
        {body}
      </DfFrame>
      <DfMenu open={menuOpen} onClose={() => setMenuOpen(false)} views={route.views} current={view} onNavigate={(v) => go(v)} />
    </div>
  );
}
