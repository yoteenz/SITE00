/** F15 AHEAD — Wave 4 derived projection only. */

import { type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { projectAhead } from '../../data/f15/aheadProjection';
import { formatMoney, useCurrency } from '../../data/home/money';
import { PARENT_PLATES } from '../../data/parents/plates';
import { parentById } from '../../data/parents/catalog';
import { FamilyChrome } from '../components/FamilyChrome';
import { JurnlProductNav } from '../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { JurnlButton, JurnlInlineAction, JurnlPanel } from '../components/primitives';
import { FramePanel, JurnlFamilyFrame, JurnlFamilyShell } from '../components/FamilyFrame';
import { daysUntil, formatRelativeDate, getTodayKey } from '../../data/foundation/dates';
import { useJurnl } from '../state/store';

function Shell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlFamilyShell
      screenId={screenId}
      familyId="F15"
      familyPlate={PARENT_PLATES.F15}
      nav={<JurnlProductNav current="PLAN" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F15" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F15" nodeId={screenId} onClose={closeOverlay} /> : null}
        </>
      }
    >
      {children}
    </JurnlFamilyShell>
  );
}

type Window = { id: string; label: string; test: (days: number | null) => boolean };

/** Forward windows. Each is one atomic panel; a long month paginates by window, never mid-window. */
const WINDOWS: Window[] = [
  { id: 'week', label: 'THIS WEEK', test: (d) => d != null && d <= 6 },
  { id: 'next', label: 'NEXT WEEK', test: (d) => d != null && d >= 7 && d <= 13 },
  { id: 'month', label: 'LATER THIS MONTH', test: (d) => d != null && d >= 14 && d <= 30 },
  { id: 'beyond', label: 'AFTER 30 DAYS', test: (d) => d != null && d > 30 },
  { id: 'undated', label: 'NO DATE YET', test: (d) => d == null },
];

/** F15 AHEAD — HORIZON / TIMELINE. Now → next 30 days → later, then what lands in each window, then the fork. */
export function AheadHubScreen() {
  const { go, openOverlay, closeOverlay, overlay } = useJurnl();
  useCurrency();
  const spec = parentById('F15')!;
  const ahead = projectAhead();
  const today = getTodayKey();
  const dated = ahead.items.map((item) => ({ item, days: item.due_date ? daysUntil(today, item.due_date) : null }));
  const windows = WINDOWS.map((w) => ({ ...w, rows: dated.filter((r) => w.test(r.days)).sort((a, b) => (a.days ?? 999) - (b.days ?? 999)) })).filter((w) => w.rows.length);
  const thin = ahead.completeness === 'THIN';
  return (
    <JurnlFamilyFrame
      screenId="F15.00"
      familyId="F15"
      familyPlate={PARENT_PLATES.F15}
      label="AHEAD"
      archetype="HORIZON_PATH"
      chrome={<FamilyChrome familyId="F15" nodeId="F15.00" backLabel="BACK TO TODAY" onBack={() => go('today')} onAsk={() => openOverlay('ask')} />}
      nav={<JurnlProductNav current="PLAN" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F15" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F15" nodeId="F15.00" onClose={closeOverlay} /> : null}
        </>
      }
    >
      <FramePanel id="horizon">
        <section className="jrn-hz" data-jrn-zone="intro">
          <h1 className="jrn-hz__fn">AHEAD</h1>
          <p className="jrn-lang__state">{thin ? 'TOO LITTLE IS KNOWN YET TO LOOK AHEAD HONESTLY.' : 'HERE’S WHAT THE NEXT 30 DAYS LOOK LIKE IF NOTHING CHANGES.'}</p>
          <ol className="jrn-hz__band" aria-label="TODAY, NEXT 30 DAYS, LATER">
            <li data-jrn-panel="signal">
              <span className="jrn-hz__when">TODAY</span>
              <b className="jrn-hz__fig">{formatMoney(ahead.safe_to_spend_now)}</b>
              <small>SAFE TO SPEND NOW</small>
            </li>
            <li>
              <span className="jrn-hz__when">NEXT 30 DAYS</span>
              <b className="jrn-hz__fig">{ahead.projected_net_30 != null ? formatMoney(ahead.projected_net_30) : '—'}</b>
              <small>{ahead.projected_net_30 != null ? 'PROJECTED NET' : 'NOT ENOUGH TO PROJECT'}</small>
            </li>
            <li>
              <span className="jrn-hz__when">LATER</span>
              <b className="jrn-hz__fig jrn-hz__fig--open">OPEN</b>
              <small>NOT PROJECTED</small>
            </li>
          </ol>
          {ahead.shortfall_risk ?
            <p className="jrn-hz__risk" role="status" data-jrn-trigger="ahead-shortfall">
              PROJECTED OUTFLOWS ARE MORE THAN WHAT’S AVAILABLE. NOT CERTAIN.
            </p>
          : null}
          <p className="jrn-lang__editorial">{spec.question}</p>
        </section>
      </FramePanel>
      {windows.length ?
        windows.map((w) => (
          <FramePanel key={w.id} id={`window-${w.id}`}>
            <section className="jrn-hz__window" aria-label={w.label}>
              <p className="jrn-hz__wlabel">
                <span>{w.label}</span>
                <small>{w.rows.length} {w.rows.length === 1 ? 'EVENT' : 'EVENTS'}</small>
              </p>
              <ol className="jrn-hz__events">
                {w.rows.map(({ item }) => (
                  <li key={item.ahead_id} className="jrn-hz__event" data-direction={item.direction}>
                    <span className="jrn-hz__date">{item.due_date ? formatRelativeDate(item.due_date, today) : '—'}</span>
                    <span className="jrn-hz__label">{item.label}</span>
                    <b className="jrn-hz__amt">
                      {item.direction === 'IN' ? '+' : '−'}
                      {formatMoney(item.amount)}
                    </b>
                    <small className="jrn-hz__cert">{item.certainty}</small>
                  </li>
                ))}
              </ol>
            </section>
          </FramePanel>
        ))
      : <FramePanel id="window-empty">
          <section className="jrn-hz__window" aria-label="NOTHING AHEAD">
            <p className="jrn-lang__task">NO INCOME, BILLS OR PLANS ARE DATED YET. ADD THEM IN INCOME AND UPCOMING.</p>
          </section>
        </FramePanel>
      }
      <FramePanel id="fork">
        <div className="jrn-hz__fork">
          <span className="jrn-hz__forkline" aria-hidden />
          <p className="jrn-lang__task">SEE HOW A DIFFERENT CHOICE CHANGES THE NEXT 30 DAYS.</p>
          <JurnlButton trigger="ahead-branch" onClick={() => go('ahead/base')}>TRY ANOTHER PATH</JurnlButton>
          <p className="jrn-hz__links">
            <JurnlInlineAction trigger="ahead-upcoming" onClick={() => go('upcoming')}>UPCOMING</JurnlInlineAction>
          </p>
        </div>
      </FramePanel>
    </JurnlFamilyFrame>
  );
}

export function AheadBranchScreen() {
  const { branchId } = useParams<{ branchId: string }>();
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const base = projectAhead();
  const label = branchId === 'extra-reserve' ? 'ASSUME MORE COMMITTED OUTFLOWS' : 'BASE PATH';
  return (
    <Shell screenId="F15.BRANCH">
      <FamilyChrome familyId="F15" nodeId="F15.BRANCH" backLabel="BACK" onBack={() => go('ahead')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro"><h1 className="jrn-home__h">{label}</h1><p className="jrn-home__sub">SIMULATED · NOT SOURCE TRUTH</p></div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <JurnlPanel role="detail" className="jrn-home__panel"><b>BASE NET</b><p>{base.projected_net_30 != null ? formatMoney(base.projected_net_30) : 'UNKNOWN'}</p></JurnlPanel>
        <JurnlPanel role="detail" className="jrn-home__panel"><b>BRANCH</b><p>{branchId ?? 'base'} · DERIVED COMPARISON ONLY</p></JurnlPanel>
        <JurnlButton trigger="ahead-discard" variant="secondary" onClick={() => go('ahead')}>LET THIS BRANCH GO</JurnlButton>
      </div>
    </Shell>
  );
}
