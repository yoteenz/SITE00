/**
 * B5.8 — Recent package activity from audit/deliverable timestamps.
 */

import type { SocialPackageActivityEvent } from './types.js';

type Props = {
  events: SocialPackageActivityEvent[];
};

function formatWhen(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function RecentPackageActivity({ events }: Props) {
  if (events.length === 0) {
    return (
      <section className="site00-spp-activity">
        <h3>RECENT ACTIVITY</h3>
        <p className="site00-spp-activity__empty">No recorded activity yet.</p>
      </section>
    );
  }

  return (
    <section className="site00-spp-activity">
      <h3>RECENT ACTIVITY</h3>
      <ul>
        {events.map((ev, i) => (
          <li key={`${ev.at}-${i}`}>
            <time dateTime={ev.at}>{formatWhen(ev.at)}</time>
            <span>{ev.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
