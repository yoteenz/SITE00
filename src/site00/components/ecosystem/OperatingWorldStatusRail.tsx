import { SITE00_STATUS_STRIP } from '../../config/status';

/** Operating World contextual status rail — compact system readout. */
export function OperatingWorldStatusRail() {
  return (
    <footer className="site00-operating-status-rail" role="region" aria-label="Workspace status">
      <div className="site00-operating-status-rail__cells">
        {SITE00_STATUS_STRIP.slice(0, 4).map((item) => (
          <div key={item.id} className="site00-operating-status-rail__cell">
            <span className="site00-operating-status-rail__label">{item.label}</span>
            <span className="site00-operating-status-rail__value">{item.value}</span>
          </div>
        ))}
      </div>
      <p className="site00-operating-status-rail__hint">NEED ASSISTANCE? TALK TO OUR BUILD TEAM.</p>
    </footer>
  );
}
