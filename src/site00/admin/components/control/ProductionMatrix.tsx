import { Link } from 'react-router-dom';
import type { ControlMatrixCellState, ControlMatrixRow, ControlMatrixStage } from '../../types/control';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

type ProductionMatrixProps = {
  stages: ControlMatrixStage[];
  rows: ControlMatrixRow[];
};

function cellSymbol(state: ControlMatrixCellState): string {
  switch (state) {
    case 'COMPLETE':
      return '✓';
    case 'IN_PROGRESS':
      return '◎';
    case 'AWAITING_CLIENT':
      return '!';
    case 'BLOCKED':
      return '✕';
    case 'REVIEW':
      return '◉';
    case 'PAUSED':
      return '‖';
    default:
      return '○';
  }
}

function cellClass(state: ControlMatrixCellState): string {
  return `site00-control-matrix__cell site00-control-matrix__cell--${state.toLowerCase().replace(/_/g, '-')}`;
}

export function ProductionMatrix({ stages, rows }: ProductionMatrixProps) {
  if (!rows.length) {
    return <p className="site00-control-empty">NO ACTIVE PROJECTS IN PRODUCTION MATRIX</p>;
  }

  return (
    <section className="site00-control-panel site00-control-panel--matrix" aria-labelledby="control-matrix-heading">
      <div className="site00-control-panel__head">
        <h2 id="control-matrix-heading" className="site00-control-panel__title">PRODUCTION MATRIX</h2>
        <Link to={SITE00_ADMIN_ROUTES.projects} className="site00-control-panel__link">ALL PROJECTS →</Link>
      </div>
      <div className="site00-control-matrix-wrap">
        <table className="site00-control-matrix">
          <thead>
            <tr>
              <th scope="col">PROJECT</th>
              {stages.map((s) => (
                <th key={s.id} scope="col">{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.projectId}>
                <th scope="row">
                  <Link to={row.route} className="site00-control-matrix__project">{row.projectName}</Link>
                </th>
                {stages.map((s) => {
                  const state = row.cells[s.id] ?? 'UPCOMING';
                  return (
                    <td key={s.id}>
                      <Link
                        to={row.route}
                        className={cellClass(state)}
                        title={state.replace(/_/g, ' ')}
                        aria-label={`${row.projectName} ${s.label}: ${state.replace(/_/g, ' ')}`}
                      >
                        {cellSymbol(state)}
                      </Link>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="site00-control-matrix-legend" aria-hidden="true">
        <span>✓ COMPLETE</span>
        <span>◎ IN PROGRESS</span>
        <span>! AWAITING CLIENT</span>
        <span>✕ BLOCKED</span>
        <span>○ UPCOMING</span>
      </div>
    </section>
  );
}
