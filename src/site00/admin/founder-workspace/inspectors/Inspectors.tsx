/**
 * Inspector bodies shared by the docked inspector (≥ 1100 px) and their sheet overlays (OL-19 client preview ·
 * OL-12 task detail · OL-16 module detail), so a page and its overlay never drift apart.
 */
import { digitalFoundationClientIntakePath } from '../../services/foundationAdminApi';
import { normalizeIntakeColumnLabel } from '../data/intakeColumn';
import type { FoundationRow } from '../data/foundationViews';
import type { SystemModule } from '../data/systemModules';
import { TASK_KIND, human, type OpsTask } from '../data/opsTasks';
import { WsBanner, WsButton, WsChip, WsGap, WsInspHead, WsJourney, WsKv, WsMode, WsPlate, WsStatus } from '../shell/wsKit';


export function ClientInspector({ row: r, referral, onClose, onOpen, onCopy, onMore }: { row: FoundationRow; referral: string | null; onClose?: () => void; onOpen: () => void; onCopy: () => void; onMore: () => void }) {
  const jk = r.life.kind === 'client' ? 'client' : r.life.kind === 'blocked' ? 'blocked' : 'cur';
  return (
    <>
      <WsInspHead kicker="CLIENT PREVIEW" onClose={onClose} onExpand={onOpen}>
        <div className="ws-ident" style={{ gap: 14 }}>
          <WsPlate name={r.name} attn={r.life.kind === 'founder'} size="lg" />
          <span className="ws-who">
            <b style={{ fontSize: 16, whiteSpace: 'normal' }}>{r.name}</b>
            <span>DIGITAL FOUNDATION</span>
            <span className="ws-data--nowrap" style={{ fontSize: 13, color: 'var(--ws-ink-2)' }} title={r.artifact_id}>
              {r.artifact_id}
            </span>
          </span>
        </div>
      </WsInspHead>
      <div className="ws-insp__body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <WsStatus kind={r.life.kind}>{r.life.label}</WsStatus>
          <span className="ws-meta">STEP {r.life.phase + 1} OF 8</span>
        </div>
        <WsJourney phase={r.life.phase} kind={jk} abbr />
        <div className="ws-focus" style={{ padding: '14px 16px', gap: 8, boxShadow: `inset 3px 0 0 ${r.life.kind === 'founder' ? 'var(--ws-red)' : 'var(--ws-ink)'}` }}>
          <span className="ws-label">NEXT ACTION · {r.life.owner === '—' ? 'NONE' : r.life.owner}</span>
          <span className="ws-name">{r.life.action}</span>
        </div>
        <WsKv
          rows={[
            ['PERSONAL LINK', `${digitalFoundationClientIntakePath(r.public_token).slice(0, 22)}…`, true],
            ['INTAKE', normalizeIntakeColumnLabel(r).toUpperCase()],
            ['PAYMENT', r.payment_state.replace(/_/g, ' ')],
            ['REFERRAL', referral ?? 'DIRECT / NONE'],
            ['LAST ACTIVITY', r.last === '—' ? '—' : `${r.last} AGO`],
          ]}
        />
        <div>
          <span className="ws-label">
            RECENT MOVEMENT <WsGap id="G-03" />
          </span>
          <p className="ws-meta" style={{ margin: '8px 0 0', lineHeight: 1.5 }}>
            THE EVENT FEED IS NOT PART OF THE LIST RESPONSE. OPEN THE FOUNDATION FOR ITS RECORDED EVENTS.
          </p>
        </div>
      </div>
      <div className="ws-insp__foot">
        <WsButton block arrow onClick={onOpen}>
          OPEN FOUNDATION
        </WsButton>
        <WsButton tone="out" iconOnly icon="link" ariaLabel="COPY PERSONAL LINK" onClick={onCopy} />
        <span data-anchor="rowmenu">
          <WsButton tone="out" iconOnly icon="more" ariaLabel="MORE ACTIONS" onClick={onMore} />
        </span>
      </div>
    </>
  );
}

export function TaskInspector({ task: t, stage, onClose, onStart, onBlock }: { task: OpsTask; stage: string; onClose: () => void; onStart: () => void; onBlock: () => void }) {
  const st = String(t.status ?? 'UNKNOWN');
  return (
    <>
      <WsInspHead kicker={`TASK · ${stage}`} onClose={onClose}>
        <h2 className="ws-h2">
          {(t.title ?? t.task_id).toUpperCase()}
          <i className="ws-period" />
        </h2>
        <div className="ws-btn-row" style={{ marginTop: 10 }}>
          {t.execution_mode ? <WsMode mode={t.execution_mode} /> : null}
          <WsStatus kind={TASK_KIND[st] ?? 'idle'}>{human(st)}</WsStatus>
        </div>
      </WsInspHead>
      <div className="ws-insp__body">
        <WsKv
          rows={[
            ['TASK KEY', t.task_type ?? t.task_id, true],
            ['STARTED', t.started_at ? new Date(t.started_at).toLocaleString() : 'NOT STARTED'],
            ['COMPLETED', t.completed_at ? new Date(t.completed_at).toLocaleString() : 'NOT COMPLETE'],
            ['DEPENDS ON', t.dependency_task_ids?.length ? `${t.dependency_task_ids.length} TASKS` : 'NONE'],
            ['BLOCKER', t.blocker_category ? `${human(t.blocker_category)}${t.blocked_reason ? ` · ${t.blocked_reason}` : ''}` : 'NONE'],
          ]}
        />
        {t.description ? (
          <div>
            <span className="ws-label">INSTRUCTIONS · INTERNAL ONLY</span>
            <p className="ws-meta" style={{ lineHeight: 1.6, margin: '8px 0 0', color: 'var(--ws-ink-2)' }}>
              {t.description}
            </p>
          </div>
        ) : null}
        {t.execution_mode === 'EXTERNAL_MANUAL' || t.execution_mode === 'ASSISTED' ? (
          <WsBanner tone="policy" icon="lock">
            PROVIDER WORK HAPPENS OUTSIDE SITE 00. THIS TASK IS MARKED DONE ONLY WHEN YOU RECORD IT — NOTHING IS EXECUTED FROM HERE.
          </WsBanner>
        ) : null}
      </div>
      <div className="ws-insp__foot">
        <WsButton block disabled={st !== 'READY'} onClick={onStart}>
          {st === 'READY' ? 'START TASK…' : human(st)}
        </WsButton>
        <span data-anchor="block">
          <WsButton tone="out" icon="blocked" onClick={onBlock}>
            BLOCK
          </WsButton>
        </span>
      </div>
    </>
  );
}

export function ModuleInspector({ m, onClose, onRerun, busy }: { m: SystemModule; onClose?: () => void; onRerun?: () => void; busy?: boolean }) {
  return (
    <>
      <WsInspHead kicker={`DIAGNOSTICS · ${m.area}`} onClose={onClose}>
        <h2 className="ws-h2">
          {m.title}
          <i className="ws-period" />
        </h2>
        <div style={{ marginTop: 10 }}>
          <WsChip kind={m.chip[0]} icon={m.chip[2]}>
            {m.chip[1]}
          </WsChip>
        </div>
      </WsInspHead>
      <div className="ws-insp__body">
        <div>
          <span className="ws-label">SUMMARY</span>
          <p className="ws-meta" style={{ lineHeight: 1.6, margin: '8px 0 0', color: 'var(--ws-ink-2)' }}>
            {m.detail}
          </p>
        </div>
        {m.checks.length ? (
          <div>
            <span className="ws-label">CHECKS</span>
            <div style={{ marginTop: 6 }}>
              {m.checks.map(([t, k, l]) => (
                <div key={t} className="ifw-check-row">
                  <span className="ws-meta">{t}</span>
                  <WsChip kind={k}>{l}</WsChip>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {m.envNames.length ? (
          <details open style={{ border: '1px solid var(--ws-rule)', padding: '10px 12px' }}>
            <summary className="ws-label" style={{ cursor: 'pointer' }}>
              ENVIRONMENT · NAMES ONLY
            </summary>
            <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
              {m.envNames.map((n) => (
                <span key={n} className="ws-data--nowrap ws-meta" style={{ color: 'var(--ws-ink)' }} title={n}>
                  {n}
                </span>
              ))}
            </div>
          </details>
        ) : null}
      </div>
      {onRerun ? (
        <div className="ws-insp__foot">
          <WsButton block tone="out" icon="retry" busy={busy} onClick={onRerun}>
            RE-RUN READINESS REPORT
          </WsButton>
        </div>
      ) : null}
    </>
  );
}
