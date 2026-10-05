type AccessCredentialStatusProps = {
  credentialDisplay: string;
  statusLabel?: string;
  visible?: boolean;
  className?: string;
};

export function AccessCredentialStatus({
  credentialDisplay,
  statusLabel = 'AUTHORIZED',
  visible = true,
  className = '',
}: AccessCredentialStatusProps) {
  return (
    <div
      className={[
        'site00-access-status',
        visible ? 'site00-access-status--visible' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="site00-access-status__block">
        <span className="site00-access-status__label">CREDENTIAL</span>
        <span className="site00-access-status__code">{credentialDisplay}</span>
      </div>
      <div className="site00-access-status__block">
        <span className="site00-access-status__label">STATUS</span>
        <span className="site00-access-status__value">{statusLabel}</span>
      </div>
    </div>
  );
}
