import type { KeyboardEvent } from 'react';
import { normalizeIntakeColumnLabel } from '../data/intakeColumn';
import type { FoundationRow } from '../data/foundationViews';
import { WsIcon, WsPlate, WsSegments, WsSkel, WsStatus } from '../shell/wsKit';

type Props = {
  rows: FoundationRow[];
  selectedId: string | null;
  loading: boolean;
  onSelect: (artifactId: string) => void;
  /** Enter / double activation → full record. */
  onOpen: (artifactId: string) => void;
  onRowActions: (row: FoundationRow) => void;
  sortLabel: string;
};

const INTAKE_SUB: Record<string, string> = {
  COMPLETE: 'SUBMITTED',
  IN_PROGRESS: 'SAVED · NOT SUBMITTED',
  NOT_STARTED: 'LINK NOT YET USED',
};

/**
 * 02 FOUNDATIONS registry — OPUS2 `registry()` composition: phone card rows (< 600 container),
 * CLIENT / STATUS / NEXT ACTION (600–919), CLIENT / LIFECYCLE / INTAKE / NEXT ACTION / LAST ACTIVITY (≥ 920).
 * Every cell is read from the artifact list + pipeline; nothing is illustrative.
 */
export function FoundationsRegistry({ rows, selectedId, loading, onSelect, onOpen, onRowActions, sortLabel }: Props) {
  if (loading && !rows.length) {
    return (
      <div className="reg" role="table" aria-label="FOUNDATIONS" aria-busy="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="reg__r" role="row">
            <span className="c-client">
              <span className="ws-plate ws-plate--sm" />
              <WsSkel w="60%" />
            </span>
            <span className="c-next">
              <WsSkel w="70%" />
            </span>
          </div>
        ))}
      </div>
    );
  }

  const onKey = (e: KeyboardEvent<HTMLDivElement>, r: FoundationRow) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onOpen(r.artifact_id);
    } else if (e.key === ' ') {
      e.preventDefault();
      onSelect(r.artifact_id);
    }
  };

  return (
    <div className="reg" role="table" aria-label="FOUNDATIONS" aria-rowcount={rows.length + 1}>
      <div className="reg__h" role="row">
        <span className="c-client" role="columnheader">
          CLIENT
        </span>
        <span className="c-status" role="columnheader">
          STATUS
        </span>
        <span className="c-life" role="columnheader">
          LIFECYCLE
        </span>
        <span className="c-intake" role="columnheader">
          INTAKE
        </span>
        <span className="c-next sort" role="columnheader" aria-sort="ascending" title={`SORT · ${sortLabel}`}>
          NEXT ACTION
        </span>
        <span className="c-last" role="columnheader" style={{ justifyContent: 'flex-end' }}>
          LAST ACTIVITY
        </span>
        <span className="c-chev" aria-hidden="true" />
      </div>
      {rows.map((r) => {
        const sel = r.artifact_id === selectedId;
        const ownerCls = r.life.owner === 'FOUNDER' ? 'reg__owner reg__owner--founder' : 'reg__owner';
        const intake = r.intake_state ?? 'NOT_STARTED';
        return (
          <div
            key={r.artifact_id}
            className={`reg__r ${sel ? 'reg__r--sel' : ''}`.trim()}
            role="row"
            tabIndex={0}
            aria-selected={sel}
            data-testid="foundations-registry-row"
            data-artifact-id={r.artifact_id}
            onClick={() => onSelect(r.artifact_id)}
            onDoubleClick={() => onOpen(r.artifact_id)}
            onKeyDown={(e) => onKey(e, r)}
          >
            <span className="c-client" role="cell">
              <WsPlate name={r.name} attn={r.life.kind === 'founder'} />
              <span className="ws-who">
                <b title={r.name}>{r.name}</b>
                <span>DIGITAL FOUNDATION · {r.payment_state === 'NONE' ? 'NOT PAID' : r.payment_state.replace(/_/g, ' ')}</span>
              </span>
            </span>
            <span className="reg__msub">
              <WsStatus kind={r.life.kind}>{r.life.label}</WsStatus>
              <span className="ws-meta">{r.last}</span>
            </span>
            <span className="reg__mseg">
              <WsSegments phase={r.life.phase} kind={r.life.kind} />
            </span>
            <span className="c-status reg__cell" role="cell">
              <WsStatus kind={r.life.kind}>{r.life.label}</WsStatus>
              <WsSegments phase={r.life.phase} kind={r.life.kind} wide />
              <span className="reg__sub">
                {r.last} · STEP {r.life.phase + 1} OF 8
              </span>
            </span>
            <span className="c-life reg__cell" role="cell">
              <WsStatus kind={r.life.kind}>{r.life.label}</WsStatus>
              <WsSegments phase={r.life.phase} kind={r.life.kind} wide />
              <span className="reg__sub">STEP {r.life.phase + 1} OF 8</span>
            </span>
            <span className="c-intake reg__cell" role="cell">
              <span className="ws-body">{normalizeIntakeColumnLabel(r).toUpperCase()}</span>
              <span className="reg__sub">{INTAKE_SUB[intake] ?? intake.replace(/_/g, ' ')}</span>
            </span>
            <span className="c-next reg__cell reg__next" role="cell">
              <span className={ownerCls}>{r.life.owner === '—' ? 'NO ACTION' : r.life.owner}</span>
              <b className="ws-2l" title={r.life.action}>
                {r.life.action}
              </b>
            </span>
            <span className="c-last" role="cell">
              <span className="ws-meta ws-num-tab" title={r.lastIso}>
                {r.last}
              </span>
            </span>
            <span className="c-chev" role="cell">
              <button
                type="button"
                className="ws-iconbtn"
                aria-label={`ACTIONS · ${r.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRowActions(r);
                }}
              >
                <WsIcon name="more" />
              </button>
            </span>
          </div>
        );
      })}
    </div>
  );
}
