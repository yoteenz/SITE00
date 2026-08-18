import { type ReactNode } from 'react';

export type AdminTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  hideMobile?: boolean;
};

type AdminTableProps<T extends { id: string }> = {
  rows: T[];
  columns: AdminTableColumn<T>[];
  emptyMessage: string;
  onRowClick?: (row: T) => void;
};

export function AdminTable<T extends { id: string }>({ rows, columns, emptyMessage, onRowClick }: AdminTableProps<T>) {
  if (rows.length === 0) {
    return <p className="site00-admin-empty">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="site00-admin-table-wrap site00-admin-table-wrap--desktop">
        <table className="site00-admin-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={col.hideMobile ? 'site00-admin-table__hide-mobile' : undefined}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={onRowClick ? 'site00-admin-table__row--clickable' : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? 'button' : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className={col.hideMobile ? 'site00-admin-table__hide-mobile' : undefined}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="site00-admin-card-list site00-admin-card-list--mobile">
        {rows.map((row) => (
          <li key={row.id}>
            <button type="button" className="site00-admin-card-list__item" onClick={onRowClick ? () => onRowClick(row) : undefined}>
              {columns.slice(0, 3).map((col) => (
                <div key={col.key} className="site00-admin-card-list__row">
                  <span className="site00-admin-card-list__label">{col.header}</span>
                  <span className="site00-admin-card-list__value">{col.render(row)}</span>
                </div>
              ))}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
