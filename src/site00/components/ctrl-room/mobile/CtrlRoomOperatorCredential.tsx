import type { CtrlRoomOperatorMeta } from '../../../hooks/useCtrlRoomData';
import { Site00ThreeCornerMark } from '../../mark/Site00ThreeCornerMark';
import { Site00LockIcon } from '../../../icons/Site00HubIcons';

type CtrlRoomOperatorCredentialProps = {
  operator: CtrlRoomOperatorMeta;
};

export function CtrlRoomOperatorCredential({ operator }: CtrlRoomOperatorCredentialProps) {
  const name = operator.displayName || 'SITE 00 OPERATOR';

  return (
    <section className="site00-ctrl-room-credential" aria-label="OPERATOR CREDENTIAL">
      <Site00ThreeCornerMark className="site00-ctrl-room-credential__mark" />
      <div className="site00-ctrl-room-credential__layout">
        <div className="site00-ctrl-room-credential__target" aria-hidden="true">
          <svg viewBox="0 0 72 72" fill="none" className="site00-ctrl-room-credential__ring">
            <circle cx="36" cy="36" r="32" stroke="rgba(196,30,58,0.18)" strokeWidth="0.75" />
            <circle cx="36" cy="36" r="24" stroke="rgba(196,30,58,0.24)" strokeWidth="0.75" />
            <line x1="36" y1="8" x2="36" y2="64" stroke="rgba(196,30,58,0.12)" strokeWidth="0.75" />
            <line x1="8" y1="36" x2="64" y2="36" stroke="rgba(196,30,58,0.12)" strokeWidth="0.75" />
            <circle cx="36" cy="8" r="2" fill="var(--site-red)" />
          </svg>
          <span className="site00-ctrl-room-credential__initials">{operator.initials || '—'}</span>
        </div>

        <div className="site00-ctrl-room-credential__identity">
          <p className="site00-ctrl-room-credential__name">{name}</p>
          <div className="site00-ctrl-room-credential__statuses">
            <p>
              <span className="site00-ctrl-room-credential__dot site00-ctrl-room-credential__dot--active" aria-hidden="true" />
              ACCOUNT / ACTIVE
            </p>
            {operator.securityStatus ? (
              <p>
                <span className="site00-ctrl-room-credential__dot site00-ctrl-room-credential__dot--active" aria-hidden="true" />
                ACCESS / SESSION
              </p>
            ) : null}
            {operator.memberSince ? (
              <p className="site00-ctrl-room-credential__since">MEMBER SINCE / {operator.memberSince}</p>
            ) : null}
          </div>
        </div>

        <dl className="site00-ctrl-room-credential__meta">
          {operator.accountReference ? (
            <div>
              <dt>ACCOUNT ID</dt>
              <dd>{operator.accountReference}</dd>
            </div>
          ) : null}
          {operator.securityStatus ? (
            <div>
              <dt>
                <Site00LockIcon size={10} /> SECURITY
              </dt>
              <dd>
                <span className="site00-ctrl-room-credential__dot site00-ctrl-room-credential__dot--active" aria-hidden="true" />
                STATUS / {operator.securityStatus}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </section>
  );
}
