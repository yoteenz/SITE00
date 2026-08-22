import { Link } from 'react-router-dom';

type CurrentProductionStateProps = {
  title: string;
  description: string;
  resolved: number;
  total: number;
  route: string;
};

export function CurrentProductionState({ title, description, resolved, total, route }: CurrentProductionStateProps) {
  return (
    <section className="site00-studio-panel site00-studio-panel--primary" aria-labelledby="studio-current-op">
      <h2 id="studio-current-op" className="site00-studio-panel__eyebrow">CURRENT PRODUCTION STATE</h2>
      <div className="site00-studio-current">
        <div className="site00-studio-current__diagram" aria-hidden="true">
          <svg viewBox="0 0 64 64" className="site00-studio-current__cube">
            <path d="M32 8 L56 24 L56 48 L32 64 L8 48 L8 24 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M32 8 L32 64 M8 24 L56 48 M56 24 L8 48" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
          </svg>
        </div>
        <div className="site00-studio-current__body">
          <p className="site00-studio-current__title">{title}</p>
          <p className="site00-studio-current__desc">{description}</p>
          <p className="site00-studio-current__metric">
            <span className="site00-studio-current__metric-value">{String(resolved).padStart(2, '0')}</span>
            <span className="site00-studio-current__metric-sep"> / </span>
            <span className="site00-studio-current__metric-total">{String(total).padStart(2, '0')}</span>
            <span className="site00-studio-current__metric-label"> SYSTEMS RESOLVED</span>
          </p>
          <Link to={route} className="site00-studio-panel__cta">ENTER OPERATION →</Link>
        </div>
      </div>
    </section>
  );
}
