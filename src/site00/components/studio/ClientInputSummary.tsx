import { Link } from 'react-router-dom';

type ClientInputSummaryProps = {
  requiredCount: number;
  route: string;
};

export function ClientInputSummary({ requiredCount, route }: ClientInputSummaryProps) {
  const hasInput = requiredCount > 0;

  return (
    <section className="site00-studio-panel site00-studio-panel--input" aria-labelledby="studio-client-input">
      <h2 id="studio-client-input" className="site00-studio-panel__eyebrow">CLIENT INPUT</h2>
      {hasInput ? (
        <>
          <p className="site00-studio-input-count">{String(requiredCount).padStart(2, '0')}</p>
          <p className="site00-studio-input-label">ITEMS REQUIRED</p>
          <p className="site00-studio-input-desc">WE ARE WAITING ON YOU TO KEEP PRODUCTION MOVING.</p>
          <Link to={route} className="site00-studio-panel__cta">OPEN INPUT →</Link>
        </>
      ) : (
        <>
          <p className="site00-studio-input-desc">NO CLIENT INPUT REQUIRED</p>
          <p className="site00-studio-input-sub">STUDIO IS CURRENTLY IN PRODUCTION</p>
        </>
      )}
    </section>
  );
}
