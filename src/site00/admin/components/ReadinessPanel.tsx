import { Link } from 'react-router-dom';

export type ReadinessDimensions = {
  creative: string;
  assets: string;
  access: string;
  dependencies: string;
  approval: string;
  payment: string;
};

export type ReadinessBlocker = {
  type: string;
  reason: string;
  owner: string;
  action_route?: string;
  action_type?: string;
  service_key?: string;
};

export type DeliverableReadiness = {
  overall: string;
  workflow_status?: string;
  dimensions: ReadinessDimensions;
  blockers: ReadinessBlocker[];
};

function dimLabel(status: string): string {
  return status.replace(/_/g, ' ').toUpperCase();
}

export function ReadinessPanel({
  title,
  readiness,
  actionHref,
  actionLabel,
}: {
  title: string;
  readiness: DeliverableReadiness | null | undefined;
  actionHref?: string;
  actionLabel?: string;
}) {
  if (!readiness) return null;

  const primaryBlocker = readiness.blockers[0];

  return (
    <article className="site00-admin-readiness">
      <header className="site00-admin-readiness__head">
        <h3>{title}</h3>
        <span className={`site00-admin-readiness__status site00-admin-readiness__status--${readiness.overall}`}>
          {readiness.overall.toUpperCase()}
        </span>
      </header>
      <dl className="site00-admin-readiness__dims">
        {Object.entries(readiness.dimensions).map(([key, val]) => (
          <div key={key}>
            <dt>{key.toUpperCase()}</dt>
            <dd className={`site00-admin-readiness__dim site00-admin-readiness__dim--${val}`}>{dimLabel(val)}</dd>
          </div>
        ))}
      </dl>
      {primaryBlocker ? (
        <div className="site00-admin-readiness__blocker">
          <p className="site00-admin-readiness__blocker-label">BLOCKER</p>
          <p>{primaryBlocker.reason}</p>
          <p className="site00-admin-readiness__blocker-owner">OWNER: {primaryBlocker.owner.toUpperCase()}</p>
          {actionHref ? (
            <Link className="site00-admin-btn site00-admin-btn--primary" to={actionHref}>
              {actionLabel ?? 'VIEW →'}
            </Link>
          ) : null}
        </div>
      ) : actionHref && readiness.overall === 'ready' ? (
        <Link className="site00-admin-btn site00-admin-btn--primary" to={actionHref}>
          {actionLabel ?? 'GENERATE BRIEF →'}
        </Link>
      ) : null}
    </article>
  );
}
