import { Link } from 'react-router-dom';

type AdminKpiCardProps = {
  label: string;
  value: string | number;
  deltaLabel?: string;
  href?: string;
};

export function AdminKpiCard({ label, value, deltaLabel, href }: AdminKpiCardProps) {
  const inner = (
    <article className="site00-admin-kpi">
      <p className="site00-admin-kpi__label">{label}</p>
      <p className="site00-admin-kpi__value">{value}</p>
      {deltaLabel ? <p className="site00-admin-kpi__delta">{deltaLabel}</p> : null}
    </article>
  );

  if (href) {
    return (
      <Link to={href} className="site00-admin-kpi-link">
        {inner}
      </Link>
    );
  }

  return inner;
}
