import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { IdntyControlRowStatus } from '../../../hooks/useIdntyControlCenterMeta';
import { AccountControlIconFrame } from './AccountControlIconFrame';

type AccountControlRowProps = {
  index: string;
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  status?: IdntyControlRowStatus;
  destructive?: boolean;
};

export function AccountControlRow({
  index,
  title,
  description,
  href,
  icon,
  status,
  destructive = false,
}: AccountControlRowProps) {
  const rowClass = `site00-idnty-control-row ${destructive ? 'site00-idnty-control-row--destructive' : ''}`.trim();

  return (
    <Link to={href} className={rowClass}>
      <AccountControlIconFrame destructive={destructive}>{icon}</AccountControlIconFrame>
      <div className="site00-idnty-control-row__main">
        <p className="site00-idnty-control-row__index">{index}</p>
        <div className="site00-idnty-control-row__copy">
          <p className="site00-idnty-control-row__title">{title}</p>
          <p className="site00-idnty-control-row__desc">{description}</p>
        </div>
      </div>
      {status ? (
        <div className="site00-idnty-control-row__status" aria-label={`${status.primary} ${status.secondary ?? ''}`.trim()}>
          <span className="site00-idnty-control-row__status-primary">{status.primary}</span>
          {status.secondary ? <span className="site00-idnty-control-row__status-secondary">{status.secondary}</span> : null}
        </div>
      ) : null}
      <span className="site00-idnty-control-row__action">
        MANAGE
        <span aria-hidden="true"> →</span>
      </span>
    </Link>
  );
}
