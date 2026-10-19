import type { FoundationAdminListRow } from '../../services/foundationAdminApi';
import { intakeColumnStatusKind, normalizeIntakeColumnLabel } from '../data/intakeColumn';
import { formatReferralActivityTime } from '../data/referralActivityEvents';

type Props = {
  rows: FoundationAdminListRow[];
  selectedId: string | null;
  loading: boolean;
  onSelect: (artifactId: string) => void;
  onRowActions: (row: FoundationAdminListRow) => void;
};

function nextActionLabel(row: FoundationAdminListRow): string {
  if (row.payment_state && row.payment_state !== 'NONE' && row.payment_state !== 'UNPAID') {
    return row.payment_state.replace(/_/g, ' ');
  }
  if (row.intake_state === 'COMPLETE') return 'Review pipeline';
  if (row.intake_state === 'IN_PROGRESS') return 'Resume intake';
  return 'Open intake';
}

function lastActivityLabel(row: FoundationAdminListRow): string {
  const iso = row.last_activity_at ?? row.created_at;
  return formatReferralActivityTime(iso);
}

export function FoundationsRegistry({ rows, selectedId, loading, onSelect, onRowActions }: Props) {
  return (
    <div className="ifw-registry ifw-registry--responsive" role="region" aria-label="Client registry">
      {loading ? <p className="ifw-muted">Loading…</p> : null}
      {!loading && !rows.length ? <p className="ifw-muted">No records match</p> : null}

      <div className="ifw-registry__head" aria-hidden={!rows.length}>
        <span>Client</span>
        <span>Lifecycle</span>
        <span className="ifw-registry__col--intake">Intake</span>
        <span className="ifw-registry__col--next">Next action</span>
        <span className="ifw-registry__col--activity">Last activity</span>
      </div>

      <ul className="ifw-registry__list">
        {rows.map((r) => {
          const selected = selectedId === r.artifact_id;
          return (
            <li key={r.artifact_id}>
              <div
                className={`ifw-registry-row ${selected ? 'ifw-registry-row--selected' : ''}`.trim()}
                data-testid="foundations-registry-row"
              >
                <button
                  type="button"
                  className="ifw-registry-row__main"
                  onClick={() => onSelect(r.artifact_id)}
                  onDoubleClick={() => onRowActions(r)}
                >
                  <span className="ifw-registry-row__name">{r.business_name || 'Unnamed'}</span>
                  <span className="ifw-registry-row__lifecycle">{r.state}</span>
                  <span className={`ifw-status ifw-status--${intakeColumnStatusKind(r)} ifw-registry__col--intake`}>
                    {normalizeIntakeColumnLabel(r)}
                  </span>
                  <span className="ifw-registry-row__next ifw-registry__col--next">{nextActionLabel(r)}</span>
                  <span className="ifw-registry-row__meta ifw-registry__col--activity">{lastActivityLabel(r)}</span>
                </button>
                <button
                  type="button"
                  className="ifw-registry-row__menu"
                  aria-label={`Actions for ${r.business_name || 'client'}`}
                  onClick={() => onRowActions(r)}
                >
                  ⋯
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
