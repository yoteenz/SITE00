/**
 * F05–F16 parent review. One plate, one rail, no child routes.
 * Figures are preview. A closed control records the future child and does not open it.
 */

import { useEffect, useState } from 'react';
import { PARENTS, parentById, type ParentSpec } from '../../data/parents/catalog';
import { PARENT_PLATES } from '../../data/parents/plates';
import { JurnlProductNav } from '../components/ProductNav';
import { JurnlButton, JurnlPanel } from '../components/primitives';
import { useJurnl } from '../state/store';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { JurnlIconButton } from '../components/primitives';
import { JurnlScreen } from './JurnlScreen';
import { FamilyDiscoveryLinks } from '../components/FamilyDiscovery';

const STATUS_KEY = 'jurnl.parentReview';
const STATUSES = ['UNREVIEWED', 'LOVE_IT', 'REVISE', 'REJECT'] as const;
type FounderStatus = (typeof STATUSES)[number];

function readStatuses(): Record<string, FounderStatus> {
  if (typeof sessionStorage === 'undefined') return {};
  try {
    const raw = JSON.parse(sessionStorage.getItem(STATUS_KEY) ?? '{}') as Record<string, FounderStatus>;
    return raw;
  } catch {
    return {};
  }
}

function ParentViz({ spec }: { spec: ParentSpec }) {
  return (
    <div className={`jrn-viz jrn-viz--${spec.viz}`} data-jrn-viz={spec.viz} aria-hidden>
      {spec.rows.map((row) => (
        <span key={row.label} data-value={row.value} />
      ))}
    </div>
  );
}

export function ParentAuthorityScreen({ id }: { id: string }) {
  const spec = parentById(id);
  const { go, openOverlay, closeOverlay, overlay } = useJurnl();
  if (!spec) return null;
  const plate = PARENT_PLATES[spec.id];
  return (
    <JurnlScreen screenId={spec.screenId} familyPlate={plate} family review>
      <div className="jrn-home jrn-parent" data-jrn-signal={spec.viz} data-jrn-interference={spec.interference}>
        <div className="jrn-home__top" data-jrn-zone="chrome">
          <JurnlButton variant="utility" trigger={`${spec.route}-board`} onClick={() => go('parents')}>
            BOARD
          </JurnlButton>
          <span className="jrn-home__mark">JURNL</span>
          <JurnlIconButton icon="gear" label="ACCOUNT" trigger={`${spec.route}-account`} onClick={() => go('account')} />
          <JurnlIconButton icon="info" label="ASK JURNL" trigger={`${spec.route}-ask`} onClick={() => openOverlay('ask')} />
        </div>
        <div className="jrn-home__intro" data-jrn-zone="intro">
          <p className="jrn-home__label">{spec.id}</p>
          <h1 className="jrn-home__h">{spec.name}</h1>
          <p className="jrn-home__sub">{spec.question}</p>
        </div>
        <div className="jrn-parent__rail" data-jrn-zone="content-rail">
          <div className="jrn-home__signal" data-jrn-panel="signal">
            <p className="jrn-home__num">{spec.signal}</p>
            <p className="jrn-home__hint">{spec.hint}</p>
            <ParentViz spec={spec} />
          </div>
          <JurnlPanel role={spec.panelRole} className="jrn-home__panel">
            <b>{spec.panelTitle}</b>
            <ul className="jrn-parent__rows">
              {spec.rows.map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <b>{row.value}</b>
                </li>
              ))}
            </ul>
          </JurnlPanel>
          <JurnlButton variant="secondary" trigger={`${spec.route}-child`} disabled data-future-target={spec.futureTarget}>
            NOT OPEN YET
          </JurnlButton>
          {spec.id === 'F05' || spec.id === 'F08' || spec.id === 'F12' ? (
            <FamilyDiscoveryLinks hubFamily={spec.id} onGo={go} />
          ) : null}
        </div>
        <JurnlProductNav current={spec.nav} onGo={go} onAdd={() => openOverlay('quick-add')} />
      </div>
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId={spec.id} onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId={spec.id} nodeId={spec.screenId} onClose={closeOverlay} /> : null}
    </JurnlScreen>
  );
}

export function ParentReviewBoard() {
  const { go } = useJurnl();
  const [status, setStatus] = useState<Record<string, FounderStatus>>({});
  useEffect(() => {
    setStatus(readStatuses());
  }, []);
  const choose = (id: string, next: FounderStatus) => {
    const merged = { ...status, [id]: next };
    setStatus(merged);
    sessionStorage.setItem(STATUS_KEY, JSON.stringify(merged));
  };
  return (
    <JurnlScreen screenId="F05_F16.BOARD" field="bone" family review>
      <div className="jrn-home jrn-board">
        <div className="jrn-home__intro">
          <h1 className="jrn-home__h">PARENTS</h1>
          <p className="jrn-home__sub">F05 TO F16. REVIEW ONLY.</p>
        </div>
        <ul className="jrn-board__list">
          {PARENTS.map((parent) => {
            const mark = status[parent.id] ?? 'UNREVIEWED';
            return (
              <li key={parent.id} data-jrn-family={parent.id} data-founder-status={mark}>
                <JurnlButton variant="utility" trigger={`board-${parent.route}`} onClick={() => go(parent.id)}>
                  {parent.id} {parent.name}
                </JurnlButton>
                <p>{parent.summary}</p>
                <p>
                  {parent.interference === 'PASS' ? 'DISTINCT' : 'PLATE INTERFERENCE'} · {parent.plateOrigin} · {parent.credits} CREDITS
                </p>
                <div className="jrn-board__status">
                  {STATUSES.map((item) => (
                    <JurnlButton
                      key={item}
                      variant={item === 'LOVE_IT' ? 'approval' : 'utility'}
                      trigger={`status-${parent.route}-${item.toLowerCase()}`}
                      aria-pressed={mark === item}
                      onClick={() => choose(parent.id, item)}
                    >
                      {item.replace('_', ' ')}
                    </JurnlButton>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </JurnlScreen>
  );
}

export function parentScreen(id: string) {
  return function MountedParent() {
    return <ParentAuthorityScreen id={id} />;
  };
}
