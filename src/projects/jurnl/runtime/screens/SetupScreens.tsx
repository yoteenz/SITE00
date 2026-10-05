/**
 * F02 SETUP — live family. Plates and header marks come from the canonical mount.
 * Screen authorities are not rendered.
 */

import { useState, type ReactNode } from 'react';
import { JurnlIcon } from '../components/icons';
import {
  JurnlButton,
  JurnlChoice,
  JurnlDrawer,
  JurnlErrorPanel,
  JurnlHeadline,
  JurnlIconButton,
  JurnlInput,
  JurnlLines,
  JurnlSuccessPanel,
  JurnlToggle,
} from '../components/primitives';
import { F02_EMBLEMS, F02_LOCKUPS, type F02EmblemId, type F02PlateId } from '../../data/f02/plates';
import {
  F02_CADENCES,
  F02_HORIZONS,
  F02_KINDS,
  F02_NEXT,
  F02_PATH,
  F02_PRIORITIES,
  F02_SCREENS,
  F02_STATE_SCREENS,
  isSetupAmount,
  type F02ScreenDef,
} from '../../data/f02/screens';
import { patchSetup, resetSetup, useSetup, type SetupDraft } from '../../data/f02/setupDraft';
import { useJurnl } from '../state/store';
import { JurnlScreen } from './JurnlScreen';

function segments(phase: number) {
  return (
    <span className="jrn-setup__segs" aria-label="SETUP PROGRESS">
      {[1, 2, 3, 4].map((n) => (
        <i key={n} data-on={n <= phase ? 'true' : 'false'} />
      ))}
    </span>
  );
}

function Brand({ screen, validation }: { screen: F02ScreenDef; validation?: boolean }) {
  const state = validation ? F02_STATE_SCREENS['F02.ST.VALIDATION'] : null;
  const lockupId = state?.lockup ?? (screen.header === 'LOCKUP' ? screen.lockup : null);
  const emblemId = state ? null : screen.header === 'EMBLEM' ? screen.emblem : null;
  if (lockupId) {
    return <img className="jrn-setup__lockup" src={F02_LOCKUPS[lockupId]} alt="" data-asset-id={lockupId} draggable={false} />;
  }
  if (!emblemId) return null;
  return (
    <span className="jrn-setup__mark">
      <img className="jrn-setup__emblem" src={F02_EMBLEMS[emblemId]} alt="" data-asset-id={emblemId} draggable={false} />
      <span className="jrn-setup__word">JURNL</span>
    </span>
  );
}

function Frame({
  screen,
  title,
  sub,
  children,
  cta,
  onCta,
  ctaDisabled,
  secondary,
  foot,
  validation,
  plate,
  headerEmblem,
}: {
  screen: F02ScreenDef;
  title: readonly string[];
  sub?: string;
  children?: ReactNode;
  cta: string;
  onCta: () => void;
  ctaDisabled?: boolean;
  secondary?: ReactNode;
  foot?: string;
  validation?: boolean;
  plate?: F02PlateId;
  headerEmblem?: F02EmblemId;
}) {
  const { go, forcedState } = useJurnl();
  const draft = useSetup();
  const showResumeMark = !headerEmblem && screen.id === 'F02.00' && forcedState !== 'fresh' && (draft.started || forcedState === 'resume');
  const emblemOverride = headerEmblem ?? (showResumeMark && !validation ? F02_STATE_SCREENS['F02.ST.RESUME'].emblem : null);
  return (
    <JurnlScreen screenId={screen.id} plate={plate ?? screen.plate} family={screen.id === 'F02.00'} layout="form">
      <div className="jrn-setup" data-runtime-bounds="copy">
        <div className="jrn-setup__top">
          {screen.back ?
            <JurnlIconButton icon="back" label="BACK" trigger="setup-back" onClick={() => go(screen.back!)} />
          : <span />}
          {segments(screen.phase)}
        </div>
        {emblemOverride ?
          <span className="jrn-setup__mark">
            <img className="jrn-setup__emblem" src={F02_EMBLEMS[emblemOverride]} alt="" data-asset-id={emblemOverride} draggable={false} />
            <span className="jrn-setup__word">JURNL</span>
          </span>
        : <Brand screen={screen} validation={validation} />}
        <span className="jrn-eyebrow">SETUP</span>
        <JurnlHeadline lines={title} />
        {sub ? <JurnlLines lines={[sub]} /> : null}
        {children}
      </div>
      <div className="jrn-cta" data-runtime-bounds="cta">
        <JurnlButton trigger="setup-continue" onClick={onCta} disabled={ctaDisabled}>
          {cta}
        </JurnlButton>
        {secondary}
        {foot ? <p className="jrn-setup__foot">{foot}</p> : null}
      </div>
    </JurnlScreen>
  );
}

function screenOf(id: string): F02ScreenDef {
  return F02_SCREENS.find((s) => s.id === id)!;
}

function remember(id: string) {
  patchSetup({ resumeAt: id });
}

export function SetupParentScreen() {
  const { go, forcedState } = useJurnl();
  const draft = useSetup();
  const resume = forcedState === 'resume' || (draft.started && forcedState !== 'fresh');
  const s = screenOf('F02.00');
  return (
    <Frame
      screen={s}
      title={resume ? ['CONTINUE', 'SETUP.'] : ['THE SHAPE', 'OF YOUR', 'LIFE.']}
      sub={resume ? 'PICK UP WHERE YOU LEFT THE SHAPE.' : 'JURNL LEARNS ONLY WHAT IT NEEDS.'}
      cta={resume ? 'CONTINUE SETUP' : 'CONTINUE'}
      onCta={() => {
        remember('F02.01');
        go(resume ? draft.resumeAt : 'F02.01');
      }}
      foot={resume ? undefined : 'A FEW QUIET MINUTES.'}
      secondary={resume ?
        <JurnlButton variant="secondary" trigger="setup-start-over" onClick={() => resetSetup()}>
          START OVER
        </JurnlButton>
      : null}
    >
      <ul className="jrn-setup__path">
        {F02_PATH.map((item) => (
          <li key={item}>
            <i />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

export function SetupHouseholdScreen() {
  const { go } = useJurnl();
  const draft = useSetup();
  const s = screenOf('F02.01');
  return (
    <Frame
      screen={s}
      title={['WHO THIS', 'IS FOR.']}
      sub="THE HOUSEHOLD JURNL WILL KEEP IN VIEW."
      cta="CONTINUE"
      ctaDisabled={!draft.household}
      onCta={() => {
        remember('F02.02');
        go('F02.02');
      }}
    >
      <div className="jrn-setup__choices" role="radiogroup" aria-label="HOUSEHOLD">
        {(['JUST ME', 'SHARED'] as const).map((label) => {
          const value = label === 'JUST ME' ? 'JUST_ME' : 'SHARED';
          return (
            <JurnlChoice key={value} selected={draft.household === value} trigger={`setup-household-${value}`} onSelect={() => patchSetup({ household: value })}>
              {label}
            </JurnlChoice>
          );
        })}
      </div>
    </Frame>
  );
}

export function SetupAccountsScreen() {
  const { go, overlay, openOverlay, closeOverlay, forcedState } = useJurnl();
  const draft = useSetup();
  const s = screenOf('F02.02');
  const connected = forcedState === 'connected' || draft.accounts === 'CONNECTED';
  return (
    <Frame
      screen={s}
      plate={overlay === 'permission' ? 'ENV.QUIET' : connected ? F02_STATE_SCREENS['F02.ST.CONNECTED'].plate : s.plate}
      headerEmblem={connected ? F02_STATE_SCREENS['F02.ST.CONNECTED'].emblem : undefined}
      title={['WHERE IT', 'LIVES.']}
      sub="CONNECT A SOURCE, NAME ONE, OR LEAVE IT FOR LATER."
      cta="CONTINUE"
      onCta={() => {
        remember('F02.03');
        go('F02.03');
      }}
      secondary={
        <JurnlButton variant="quiet" trigger="setup-skip" onClick={() => openOverlay('skip')}>
          SKIP FOR NOW
        </JurnlButton>
      }
    >
      {connected ?
        <div data-jrn-state="connected">
          <JurnlSuccessPanel title="ACCOUNT LINKED" body="JURNL CAN SEE THE SHAPE. NOT THE LEDGER." testId="setup-connected" />
        </div>
      : null}
      <div className="jrn-setup__choices">
        <JurnlChoice selected={draft.accounts === 'CONNECTED'} trigger="setup-connect" onSelect={() => openOverlay('permission')}>
          <JurnlIcon name="link" size={16} /> CONNECT AN ACCOUNT
        </JurnlChoice>
        <JurnlChoice selected={draft.accounts === 'NAMED'} trigger="setup-name-account" onSelect={() => go('F02.02.1')}>
          <JurnlIcon name="account" size={16} /> NAME AN ACCOUNT
        </JurnlChoice>
      </div>
      {overlay === 'permission' ?
        <JurnlDrawer
          size="long"
          testId="setup-permission"
          title="CONNECTION PERMISSION"
          eyebrow="QUIET ROOM"
          lead="A LINK MAY READ ACCOUNT NAMES AND BALANCES. JURNL DOES NOT MOVE MONEY."
          onClose={closeOverlay}
          footer={
            <>
              <JurnlButton
                trigger="setup-permission-continue"
                onClick={() => {
                  patchSetup({ accounts: 'CONNECTED' });
                  closeOverlay();
                }}
              >
                CONTINUE
              </JurnlButton>
              <JurnlButton variant="secondary" trigger="setup-permission-dismiss" onClick={closeOverlay}>
                NOT NOW
              </JurnlButton>
            </>
          }
        >
          <p className="jrn-body">NO PROVIDER IS OPENED UNTIL YOU CONTINUE.</p>
        </JurnlDrawer>
      : null}
      {overlay === 'skip' ? <SkipSheet next="F02.03" onSkip={() => patchSetup({ accounts: 'SKIPPED' })} /> : null}
    </Frame>
  );
}

export function SetupNameAccountScreen() {
  const { go, forcedState } = useJurnl();
  const draft = useSetup();
  const s = screenOf('F02.02.1');
  const named = draft.accountName.trim().length >= 2;
  const showError = forcedState === 'validation' && !named;
  return (
    <Frame
      screen={s}
      validation={forcedState === 'validation'}
      title={['NAME AN', 'ACCOUNT.']}
      sub="A LABEL AND A KIND. NO BALANCE."
      cta="SAVE"
      ctaDisabled={!named || !draft.accountKind}
      onCta={() => {
        if (!draft.accountName.trim() || !draft.accountKind) return;
        patchSetup({ accounts: 'NAMED', resumeAt: 'F02.02' });
        go('F02.02');
      }}
    >
      <JurnlInput label="ACCOUNT NAME" value={draft.accountName} onValue={(accountName) => patchSetup({ accountName })} trigger="setup-account-name" invalid={showError} error={showError ? 'NEEDS A NAME' : null} />
      <div className="jrn-setup__choices" role="radiogroup" aria-label="ACCOUNT KIND">
        {F02_KINDS.map((kind) => (
          <JurnlChoice key={kind} selected={draft.accountKind === kind} trigger={`setup-kind-${kind}`} onSelect={() => patchSetup({ accountKind: kind })}>
            {kind}
          </JurnlChoice>
        ))}
      </div>
    </Frame>
  );
}

export function SetupIncomeScreen() {
  const { go, forcedState } = useJurnl();
  const draft = useSetup();
  const s = screenOf('F02.03');
  const bad = draft.amount.trim().length > 0 && !isSetupAmount(draft.amount);
  const showError = forcedState === 'validation' || bad;
  return (
    <Frame
      screen={s}
      validation={forcedState === 'validation'}
      title={['WHAT', 'ARRIVES.']}
      sub="A CADENCE AND ONE APPROXIMATE AMOUNT."
      cta="CONTINUE"
      ctaDisabled={!draft.cadence || !isSetupAmount(draft.amount)}
      onCta={() => {
        if (!draft.cadence || !isSetupAmount(draft.amount)) return;
        remember('F02.04');
        go(F02_NEXT['F02.03']!);
      }}
    >
      {showError ? <JurnlErrorPanel title="FIELD NEEDS A NUMBER" body="USE A PLAIN AMOUNT." testId="setup-validation" /> : null}
      <div className="jrn-setup__choices" role="radiogroup" aria-label="CADENCE">
        {F02_CADENCES.map((cadence) => (
          <JurnlChoice key={cadence} selected={draft.cadence === cadence} trigger={`setup-cadence-${cadence}`} onSelect={() => patchSetup({ cadence })}>
            <JurnlIcon name="clock" size={16} /> {cadence}
          </JurnlChoice>
        ))}
      </div>
      <JurnlInput label="APPROXIMATE AMOUNT" value={draft.amount} onValue={(amount) => patchSetup({ amount })} trigger="setup-amount" inputMode="decimal" invalid={showError} error={showError ? 'NEEDS A NUMBER' : null} />
    </Frame>
  );
}

export function SetupCommitmentsScreen() {
  const { go, overlay, openOverlay, closeOverlay, forcedState } = useJurnl();
  const draft = useSetup();
  const s = screenOf('F02.04');
  return (
    <Frame
      screen={s}
      title={['WHAT', 'REPEATS.']}
      sub="A FEW OBLIGATIONS. NOT THE CALENDAR."
      cta="CONTINUE"
      onCta={() => {
        remember('F02.05');
        go('F02.05');
      }}
      secondary={
        <JurnlButton variant="quiet" trigger="setup-skip" onClick={() => openOverlay('skip')}>
          SKIP FOR NOW
        </JurnlButton>
      }
    >
      <ul className="jrn-setup__list">
        {draft.obligations.length === 0 ?
          <li className="jrn-setup__empty">NONE YET</li>
        : draft.obligations.map((item) => (
            <li key={`${item.name}-${item.cadence}`}>
              <span>{item.name}</span>
              <small>{item.cadence}</small>
            </li>
          ))}
      </ul>
      <JurnlButton variant="secondary" trigger="setup-add" onClick={() => openOverlay('add')}>
        <JurnlIcon name="plus" size={16} /> ADD ANOTHER
      </JurnlButton>
      {overlay === 'add' || forcedState === 'validation' ? <AddSheet onClose={closeOverlay} invalid={forcedState === 'validation'} /> : null}
      {overlay === 'skip' ? <SkipSheet next="F02.05" onSkip={() => patchSetup({ obligationsSkipped: true })} /> : null}
    </Frame>
  );
}

function AddSheet({ onClose, invalid }: { onClose: () => void; invalid: boolean }) {
  const draft = useSetup();
  const [pendingName, setPendingName] = useState('');
  const [pendingCadence, setPendingCadence] = useState<string>('MONTHLY');
  return (
    <JurnlDrawer
      size="long"
      testId="setup-add"
      title="ADD A COMMITMENT"
      lead="A NAME AND A CADENCE. AN AMOUNT CAN WAIT."
      onClose={onClose}
      footer={
        <JurnlButton
          trigger="setup-add-save"
          disabled={!pendingName.trim()}
          onClick={() => {
            if (!pendingName.trim()) return;
            patchSetup({
              obligations: [...draft.obligations, { name: pendingName.trim(), cadence: pendingCadence }],
            });
            onClose();
          }}
        >
          SAVE
        </JurnlButton>
      }
    >
      {invalid ? <JurnlErrorPanel title="NEEDS A NAME" testId="setup-add-validation" /> : null}
      <JurnlInput label="NAME" value={pendingName} onValue={setPendingName} trigger="setup-obligation-name" />
      <div className="jrn-setup__choices">
        {F02_CADENCES.map((cadence) => (
          <JurnlChoice key={cadence} selected={pendingCadence === cadence} onSelect={() => setPendingCadence(cadence)} trigger={`setup-obligation-${cadence}`}>
            <JurnlIcon name="clock" size={16} /> {cadence}
          </JurnlChoice>
        ))}
      </div>
    </JurnlDrawer>
  );
}

export function SetupPrioritiesScreen() {
  const { go } = useJurnl();
  const draft = useSetup();
  const s = screenOf('F02.05');
  const toggle = (item: string) => {
    const has = draft.priorities.includes(item);
    if (has) patchSetup({ priorities: draft.priorities.filter((p) => p !== item) });
    else if (draft.priorities.length < 3) patchSetup({ priorities: [...draft.priorities, item] });
  };
  return (
    <Frame
      screen={s}
      title={['WHAT MATTERS', 'FIRST.']}
      sub="UP TO THREE. THE REST CAN WAIT."
      cta="CONTINUE"
      onCta={() => {
        const next = draft.priorities.includes('A GOAL') ? 'F02.05.1' : 'F02.06';
        remember(next);
        go(next);
      }}
    >
      <div className="jrn-setup__choices">
        {F02_PRIORITIES.map((item) => (
          <JurnlChoice key={item} selected={draft.priorities.includes(item)} trigger={`setup-priority-${item}`} onSelect={() => toggle(item)}>
            {item}
          </JurnlChoice>
        ))}
      </div>
    </Frame>
  );
}

export function SetupGoalScreen() {
  const { go, forcedState } = useJurnl();
  const draft = useSetup();
  const s = screenOf('F02.05.1');
  const showError = forcedState === 'validation' && !draft.goalName.trim();
  return (
    <Frame
      screen={s}
      validation={forcedState === 'validation'}
      title={['NAME A', 'GOAL.']}
      sub="ONE INTENTION AND A LOOSE HORIZON."
      cta="SAVE"
      ctaDisabled={!draft.goalName.trim() || !draft.goalHorizon}
      onCta={() => {
        remember('F02.06');
        go('F02.06');
      }}
    >
      {showError ? <JurnlErrorPanel title="NEEDS A NAME" testId="setup-goal-validation" /> : null}
      <JurnlInput label="GOAL" value={draft.goalName} onValue={(goalName) => patchSetup({ goalName })} trigger="setup-goal-name" invalid={showError} error={showError ? 'NEEDS A NAME' : null} />
      <div className="jrn-setup__choices" role="radiogroup" aria-label="HORIZON">
        {F02_HORIZONS.map((horizon) => (
          <JurnlChoice key={horizon} selected={draft.goalHorizon === horizon} trigger={`setup-horizon-${horizon}`} onSelect={() => patchSetup({ goalHorizon: horizon })}>
            {horizon}
          </JurnlChoice>
        ))}
      </div>
    </Frame>
  );
}

export function SetupProtectedScreen() {
  const { go, overlay, openOverlay, closeOverlay, forcedState } = useJurnl();
  const draft = useSetup();
  const s = screenOf('F02.06');
  const back = draft.priorities.includes('A GOAL') ? 'F02.05.1' : s.back;
  const bad = !draft.protectedSkipped && draft.protectedAmount.trim().length > 0 && !isSetupAmount(draft.protectedAmount);
  const showError = forcedState === 'validation' || bad;
  return (
    <Frame
      screen={{ ...s, back }}
      validation={forcedState === 'validation'}
      title={['WHAT SHOULD', 'STAY.']}
      sub="ONE PROTECTED AMOUNT. OR NONE FOR NOW."
      cta="CONTINUE"
      ctaDisabled={!draft.protectedSkipped && !isSetupAmount(draft.protectedAmount)}
      onCta={() => {
        if (!draft.protectedSkipped && !isSetupAmount(draft.protectedAmount)) return;
        remember('F02.07');
        go('F02.07');
      }}
      secondary={
        <JurnlButton variant="quiet" trigger="setup-skip" onClick={() => openOverlay('skip')}>
          SKIP FOR NOW
        </JurnlButton>
      }
    >
      {showError ? <JurnlErrorPanel title="FIELD NEEDS A NUMBER" testId="setup-protected-validation" /> : null}
      <JurnlInput
        label="PROTECTED AMOUNT"
        value={draft.protectedAmount}
        onValue={(protectedAmount) => patchSetup({ protectedAmount, protectedSkipped: false })}
        trigger="setup-protected"
        inputMode="decimal"
        invalid={showError}
        error={showError ? 'NEEDS A NUMBER' : null}
      />
      {overlay === 'skip' ?
        <SkipSheet
          next="F02.07"
          onSkip={() => patchSetup({ protectedSkipped: true, protectedAmount: '' })}
          close={closeOverlay}
        />
      : null}
    </Frame>
  );
}

export function SetupBoundariesScreen() {
  const { go } = useJurnl();
  const draft = useSetup();
  const [open, setOpen] = useState(false);
  const s = screenOf('F02.07');
  return (
    <Frame
      screen={s}
      title={['WHAT JURNL', 'MAY KEEP.']}
      sub="YOU DECIDE WHAT STAYS."
      cta="CONTINUE"
      onCta={() => {
        remember('F02.08');
        go('F02.08');
      }}
    >
      <div className="jrn-setup__consents">
        <Consent icon="shield" label="REMEMBER THIS SETUP" sub="SAVES YOUR PREFERENCES." checked={draft.consentRemember} onChange={(consentRemember) => patchSetup({ consentRemember })} trigger="setup-consent-remember" />
        <Consent icon="privacy" label="LINKED ACCOUNTS STAY OPTIONAL" sub="YOU ARE ALWAYS IN CONTROL." checked={draft.consentLinks} onChange={(consentLinks) => patchSetup({ consentLinks })} trigger="setup-consent-links" />
        <Consent icon="info" label="NOTHING IS SOLD" sub="YOUR CONTENT STAYS YOURS." checked={draft.consentSale} onChange={(consentSale) => patchSetup({ consentSale })} trigger="setup-consent-sale" />
      </div>
      <button type="button" className="jrn-row jrn-setup__read" data-jrn-trigger="setup-boundary-read" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span>READ THE BOUNDARY</span>
        <JurnlIcon name="chevron" size={16} />
      </button>
      {open ? <p className="jrn-body">JURNL KEEPS ONLY WHAT YOU ALLOW. NOTHING IS SOLD.</p> : null}
    </Frame>
  );
}

function Consent({ icon, label, sub, checked, onChange, trigger }: { icon: 'shield' | 'privacy' | 'info'; label: string; sub: string; checked: boolean; onChange: (v: boolean) => void; trigger: string }) {
  return (
    <div className="jrn-setup__consent">
      <JurnlIcon name={icon} size={16} />
      <span>
        <b>{label}</b>
        <small>{sub}</small>
      </span>
      <JurnlToggle checked={checked} onChange={onChange} label={label} trigger={trigger} />
    </div>
  );
}

export function SetupReadyScreen() {
  const { go } = useJurnl();
  const draft = useSetup();
  const s = screenOf('F02.08');
  const lines = [
    draft.household === 'SHARED' ? 'SHARED' : 'JUST YOU',
    draft.cadence ? `${draft.cadence} INCOME` : 'INCOME STILL QUIET',
    draft.priorities[0] ? `${draft.priorities[0]} FIRST` : 'NO PRIORITY YET',
    draft.consentRemember ? 'PRIVATE BY DEFAULT' : 'NOTHING HELD',
  ];
  return (
    <Frame
      screen={s}
      title={['JURNL IS', 'READY.']}
      sub="THIS IS THE SHAPE IT LEARNED."
      cta="OPEN TODAY"
      ctaDisabled={!draft.voice}
      onCta={() => {
        patchSetup({ started: true, resumeAt: 'F02.08' });
        go('F03');
      }}
    >
      <ul className="jrn-setup__summary">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <div className="jrn-setup__choices" role="radiogroup" aria-label="VOICE">
        {(['GUIDED', 'QUIET'] as const).map((voice) => (
          <JurnlChoice key={voice} selected={draft.voice === voice} trigger={`setup-voice-${voice}`} onSelect={() => patchSetup({ voice })}>
            {draft.voice === voice ? <JurnlIcon name="check" size={14} /> : null} {voice}
          </JurnlChoice>
        ))}
      </div>
    </Frame>
  );
}

function SkipSheet({ next, onSkip, close }: { next: string; onSkip: () => void; close?: () => void }) {
  const { go, closeOverlay } = useJurnl();
  const shut = close ?? closeOverlay;
  return (
    <JurnlDrawer
      size="short"
      testId="setup-skip"
      title="ADD THIS LATER"
      lead="THIS STEP CAN BE FINISHED LATER. NOTHING HERE IS LOST."
      onClose={shut}
      footer={
        <>
          <JurnlButton
            trigger="setup-skip-continue"
            onClick={() => {
              onSkip();
              remember(next);
              shut();
              go(next);
            }}
          >
            CONTINUE
          </JurnlButton>
          <JurnlButton variant="secondary" trigger="setup-skip-back" onClick={shut}>
            GO BACK
          </JurnlButton>
        </>
      }
    />
  );
}

export function TodayBoundaryScreen() {
  const { go } = useJurnl();
  return (
    <JurnlScreen screenId="F03.BOUNDARY" scene="boundary" family>
      <div className="jrn-col__head jrn-hero-copy--wide" data-runtime-bounds="copy">
        <JurnlHeadline lines={['TODAY']} />
        <i className="jrn-rule" aria-hidden />
        <p className="jrn-body">SETUP IS COMPLETE. TODAY IS THE NEXT FAMILY.</p>
      </div>
      <div className="jrn-cta" data-runtime-bounds="cta">
        <JurnlButton variant="secondary" trigger="today-back" onClick={() => go('F02.08')}>
          BACK TO SETUP
        </JurnlButton>
      </div>
    </JurnlScreen>
  );
}

export const JURNL_F02_SCREEN_COMPONENTS = {
  'F02.00': SetupParentScreen,
  'F02.01': SetupHouseholdScreen,
  'F02.02': SetupAccountsScreen,
  'F02.03': SetupIncomeScreen,
  'F02.04': SetupCommitmentsScreen,
  'F02.05': SetupPrioritiesScreen,
  'F02.06': SetupProtectedScreen,
  'F02.07': SetupBoundariesScreen,
  'F02.08': SetupReadyScreen,
  'F02.02.1': SetupNameAccountScreen,
  'F02.05.1': SetupGoalScreen,
} as const;
