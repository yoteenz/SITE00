import type { ReactNode } from 'react';
import type { IdntyCredentialStatus } from '../../../hooks/useIdntyControlCenterMeta';
import { Site00ThreeCornerMark } from '../../mark/Site00ThreeCornerMark';

type IdntyCredentialModuleProps = {
  displayName: string;
  initials: string;
  credentialStatuses: IdntyCredentialStatus[];
  accountReference: string | null;
  memberSince: string | null;
};

function CredentialTarget({ initials }: { initials: string }) {
  return (
    <div className="site00-idnty-control-credential__target" aria-hidden="true">
      <svg viewBox="0 0 72 72" fill="none" className="site00-idnty-control-credential__target-ring">
        <circle cx="36" cy="36" r="32" stroke="rgba(196,30,58,0.18)" strokeWidth="0.75" />
        <circle cx="36" cy="36" r="24" stroke="rgba(196,30,58,0.24)" strokeWidth="0.75" />
        <line x1="36" y1="8" x2="36" y2="64" stroke="rgba(196,30,58,0.12)" strokeWidth="0.75" />
        <line x1="8" y1="36" x2="64" y2="36" stroke="rgba(196,30,58,0.12)" strokeWidth="0.75" />
        <circle cx="36" cy="8" r="2" fill="var(--site-red)" />
      </svg>
      <span className="site00-idnty-control-credential__initials">{initials || '—'}</span>
    </div>
  );
}

function StatusRow({ label, value }: IdntyCredentialStatus) {
  return (
    <div className="site00-idnty-control-credential__status-row">
      <span className="site00-idnty-control-credential__status-dot" aria-hidden="true" />
      <span className="site00-idnty-control-credential__status-label">{label}</span>
      <span className="site00-idnty-control-credential__status-sep">/</span>
      <span className="site00-idnty-control-credential__status-value">{value}</span>
    </div>
  );
}

function MetaField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="site00-idnty-control-credential__meta-field">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function IdntyCredentialModule({
  displayName,
  initials,
  credentialStatuses,
  accountReference,
  memberSince,
}: IdntyCredentialModuleProps) {
  const resolvedName = displayName || 'SITE 00 ACCOUNT';

  return (
    <section className="site00-idnty-control-credential" aria-label="IDENTITY CREDENTIAL">
      <Site00ThreeCornerMark className="site00-idnty-control-credential__mark" />
      <div className="site00-idnty-control-credential__layout">
        <CredentialTarget initials={initials} />
        <div className="site00-idnty-control-credential__identity">
          <p className="site00-idnty-control-credential__name">{resolvedName}</p>
          {credentialStatuses.length > 0 ? (
            <div className="site00-idnty-control-credential__statuses">
              {credentialStatuses.map((status) => (
                <StatusRow key={`${status.label}-${status.value}`} {...status} />
              ))}
            </div>
          ) : null}
        </div>
        {accountReference || memberSince ? (
          <dl className="site00-idnty-control-credential__meta">
            {accountReference ? <MetaField label="ACCOUNT ID" value={accountReference} /> : null}
            {memberSince ? <MetaField label="MEMBER SINCE" value={memberSince} /> : null}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
