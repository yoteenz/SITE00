import { useEffect, useState } from 'react';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { site00ProductionApi } from '../../services/productionApi';
import type { AdminActivityItem } from '../../types/operations';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}M AGO`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}H AGO`;
  return `${Math.floor(hrs / 24)}D AGO`;
}

export default function ActivityPage() {
  const [items, setItems] = useState<AdminActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    site00ProductionApi
      .activity(100)
      .then((data) => setItems((data.items ?? []) as AdminActivityItem[]))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD ACTIVITY'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <h1 className="site00-admin-page-title">[ ACTIVITY ]</h1>
          <p className="site00-admin-page-subtitle">FULL ADMIN ACTIVITY FEED.</p>
        </div>
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="Loading activity" />
      ) : (
        <section className="site00-admin-panel">
          {items.length === 0 ? (
            <p className="site00-admin-empty">NO ACTIVITY RECORDED YET.</p>
          ) : (
            <ul className="site00-admin-activity-list">
              {items.map((item) => (
                <li key={item.id} className="site00-admin-activity-list__item">
                  <div>
                    <p className="site00-admin-activity-list__summary">{item.summary}</p>
                    {item.entity_label ? (
                      <p className="site00-admin-activity-list__entity">
                        {item.entity_type.toUpperCase()} — {item.entity_label}
                      </p>
                    ) : (
                      <p className="site00-admin-activity-list__entity">{item.event_type.replace(/\./g, ' ').toUpperCase()}</p>
                    )}
                  </div>
                  <time dateTime={item.created_at}>{timeAgo(item.created_at)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </Site00AdminShell>
  );
}
