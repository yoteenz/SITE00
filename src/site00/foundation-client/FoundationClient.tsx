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
import { P05Review, P06Activation } from './parents/CheckoutActivation';
import { P03IntakeSubmitted } from './parents/IntakeSubmittedStatus';
import {
  CommunicationPreferences,
  P07ProjectOverview,
  P08Roadmap,
  P09StageDetail,
  P10NeedsYou,
  RecordDetail,
  RecordsLibrary,
} from './parents/ProjectPortal';
import type { ProjectStageCode } from '../../../shared/site00-digital-foundation/types.js';
import { updateCommunicationPreferences } from './api';
import { useFoundationPwaHead } from './useFoundationPwaHead';
import { DfCta, DfFrame, DfLoading, DfMenu, DfSystemPanel, type DfObjectKind } from './shell';
import { useFoundationArtifact, useIntakeDraft, usePaymentVerification, useQuoteSelections } from './useFoundationArtifact';
import './foundationDfStyles';

const OBJECT_FOR: Record<DfView, DfObjectKind> = {
  P01: 'hero',
  P02: 'corner',
  P03: 'corner',
  P04: 'crown',
  P05: 'crown',
  P06: 'crown',
  OVERVIEW: 'crown',
  ROADMAP: 'crown',
  STAGE: 'crown',
  NEEDS_YOU: 'crown',
  RECORDS: 'crown',
  RECORD: 'crown',
  COMM_PREFS: 'corner',
  COMPLETE: 'crown',
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
  return (
    <DfSystemPanel
      index="00"
      label="FOUNDATION LINK"
      lines={['THIS LINK', "ISN'T ACTIVE"]}
      body="CHECK THAT YOU OPENED THE FULL LINK SITE 00 SENT YOU. IF IT STILL DOESN'T OPEN, REPLY TO THE MESSAGE IT CAME IN."
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

type NavState = { dfView?: DfView; dfAnchor?: string; dfStageCode?: ProjectStageCode; dfRecordId?: string };

export function FoundationClient({ token, pwaScope = true }: { token: string; pwaScope?: boolean }) {
  useNoIndex();
  useFoundationPwaHead(pwaScope);
  const enabled = isDigitalFoundationFlagEnabled(DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1);
  const { payload, setPayload, catalog, load, reload, retry } = useFoundationArtifact(enabled ? token : '');
  const location = useLocation();
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const checkoutRaw = params.get('checkout');
  const checkout: CheckoutParam = checkoutRaw === 'return' || checkoutRaw === 'cancel' ? checkoutRaw : null;
  const simulated = params.get('simulated_checkout') === '1';
  const navState = location.state as NavState | null;
  const stateView = (navState?.dfView ?? null) as DfView | null;
  const stateAnchor = navState?.dfAnchor ?? null;
  const stateStageCode = navState?.dfStageCode ?? null;
  const stateRecordId = navState?.dfRecordId ?? null;

  const [prefsBusy, setPrefsBusy] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(() => new Date());

  const [menuOpen, setMenuOpen] = useState(false);
  const [beginBusy, setBeginBusy] = useState(false);
  const [beginError, setBeginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [p02Errors, setP02Errors] = useState<IntakeErrors | undefined>(undefined);
  const [seenTick, setSeenTick] = useState(0);

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

  useEffect(() => {
    if (payload) setFetchedAt(new Date());
  }, [payload]);

  const go = useCallback(
    (
      v: DfView,
      opts: {
        replace?: boolean;
        dropQuery?: boolean;
        anchor?: string;
        stageCode?: ProjectStageCode;
        recordId?: string;
      } = {},
    ) => {
      const state: NavState = { dfView: v };
      if (opts.anchor) state.dfAnchor = opts.anchor;
      if (opts.stageCode) state.dfStageCode = opts.stageCode;
      if (opts.recordId) state.dfRecordId = opts.recordId;
      navigate(
        { pathname: location.pathname, search: opts.dropQuery ? '' : location.search },
        {
          state,
          replace: opts.replace,
        },
      );
      setMenuOpen(false);
      window.scrollTo(0, 0);
      if (rootRef.current) rootRef.current.scrollTop = 0;
    },
    [navigate, location.pathname, location.search],
  );

  useEffect(() => {
    if (!stateAnchor) return;
    const el = document.getElementById(stateAnchor);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [stateAnchor, view]);

  // Once Stripe's webhook has marked the artifact PAID, drop the return marker so a reload is just the portal link.
  useEffect(() => {
    if (checkout === 'return' && paid) go('P06', { replace: true, dropQuery: true });
  }, [checkout, paid, go]);

  if (!token) return <InvalidLink />;
  if (!enabled) return <Unavailable />;
  if (load.status === 'loading' && !payload) return <DfLoading />;
  if (load.status === 'error' && !payload) {
    if (load.error.status === 404 || load.error.code.includes('NOT_FOUND')) return <InvalidLink />;
    if (load.error.status === 503) return <Unavailable />;
    if (load.error.code === 'INVALID_API_RESPONSE' || load.error.code === 'INVALID_PAYLOAD') {
      return <Unavailable />;
    }
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
      await reload();
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
            go('P03');
          }}
        />
      ) : null;
      break;
    case 'P03':
      body =
        payload.surface === 'INTAKE_SUBMITTED' ? (
          <P03IntakeSubmitted
            payload={payload}
            fetchedAt={fetchedAt}
            busy={load.status === 'loading'}
            onRefresh={() => void reload()}
          />
        ) : intake.draft ? (
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
      body = (
        <P07ProjectOverview
          payload={payload}
          verify={verification.phase}
          onRoadmap={() => go('ROADMAP')}
          onNeedsYou={() => go('NEEDS_YOU')}
          onRecords={() => go('RECORDS')}
          onStage={(code) => go('STAGE', { stageCode: code })}
          onActivation={() => go('P06')}
          onPrefs={() => go('COMM_PREFS')}
        />
      );
      break;
    case 'ROADMAP':
      body = (
        <P08Roadmap
          payload={payload}
          onStage={(code) => go('STAGE', { stageCode: code })}
          onOverview={() => go('OVERVIEW')}
        />
      );
      break;
    case 'STAGE':
      body = (
        <P09StageDetail
          payload={payload}
          stageCode={stateStageCode ?? payload.stages[0]?.stage_code ?? '01_DETAILS_RECEIVED'}
          onRoadmap={() => go('ROADMAP')}
        />
      );
      break;
    case 'NEEDS_YOU':
      body = (
        <P10NeedsYou token={token} payload={payload} onReload={reload} onOverview={() => go('OVERVIEW')} />
      );
      break;
    case 'RECORDS':
      body = (
        <RecordsLibrary
          payload={payload}
          onOpen={(id) => go('RECORD', { recordId: id })}
          onOverview={() => go('OVERVIEW')}
        />
      );
      break;
    case 'RECORD':
      body = (
        <RecordDetail
          payload={payload}
          recordId={stateRecordId ?? ''}
          onBack={() => go('RECORDS')}
        />
      );
      break;
    case 'COMM_PREFS':
      body = (
        <CommunicationPreferences
          prefs={payload.communication_preferences}
          busy={prefsBusy}
          onSave={(next) => {
            setPrefsBusy(true);
            void updateCommunicationPreferences(token, next)
              .then((p) => {
                setPayload(p);
              })
              .finally(() => setPrefsBusy(false));
          }}
          onOverview={() => go('OVERVIEW')}
        />
      );
      break;
    case 'COMPLETE':
      body = <DigitalFoundationCompleteSurface token={token} payload={payload} reload={reload} embedded />;
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
      <DfMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        views={route.views}
        current={view}
        onNavigate={(v, anchor) => go(v, { anchor })}
      />
    </div>
  );
}
