import { Link } from 'react-router-dom';
import type { ClientStudioMilestone } from '../../services/clientProductionApi';

type MilestoneCardProps = {
  milestone: ClientStudioMilestone | null;
  viewAllRoute: string;
};

function formatMilestoneTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso)).toUpperCase();
  } catch {
    return '';
  }
}

export function MilestoneCard({ milestone, viewAllRoute }: MilestoneCardProps) {
  return (
    <section className="site00-studio-panel site00-studio-panel--milestone" aria-labelledby="studio-milestone">
      <h2 id="studio-milestone" className="site00-studio-panel__eyebrow">LATEST MILESTONE</h2>
      {milestone ? (
        <div className="site00-studio-milestone">
          <div className="site00-studio-milestone__icon" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <path d="M8 20 L16 8 L24 20 Z" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="24" cy="8" r="6" fill="var(--site-red)" />
              <path d="M22 8 L23.5 9.5 L26.5 6" fill="none" stroke="#fff" strokeWidth="1.25" />
            </svg>
          </div>
          <div>
            <p className="site00-studio-milestone__title">{milestone.title}</p>
            <p className="site00-studio-milestone__status">{milestone.statusLabel}</p>
            <p className="site00-studio-milestone__time">{formatMilestoneTime(milestone.timestamp)}</p>
          </div>
        </div>
      ) : (
        <p className="site00-studio-panel__empty">NEXT MILESTONE IS BEING PREPARED</p>
      )}
      <Link to={viewAllRoute} className="site00-studio-panel__link">VIEW MILESTONES →</Link>
    </section>
  );
}
