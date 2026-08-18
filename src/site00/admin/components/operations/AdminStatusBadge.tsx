type AdminStatusBadgeProps = {
  status: string;
  tone?: 'default' | 'green' | 'red' | 'gray';
};

function resolveTone(status: string, tone?: AdminStatusBadgeProps['tone']) {
  if (tone && tone !== 'default') return tone;
  const upper = status.toUpperCase();
  if (['PAID', 'COMPLETE', 'APPROVED', 'LIVE', 'OK', 'ACTIVE', 'REVIEWED', 'CONVERTED', 'QUALIFIED'].includes(upper)) {
    return 'green';
  }
  if (['OVERDUE', 'BLOCKED', 'LOST', 'FAILED', 'CRITICAL', 'ERROR'].includes(upper) || upper.includes('ISSUE')) {
    return 'red';
  }
  if (['DRAFT', 'NOT_STARTED', 'INACTIVE', 'ARCHIVED'].includes(upper)) {
    return 'gray';
  }
  return 'default';
}

export function AdminStatusBadge({ status, tone }: AdminStatusBadgeProps) {
  const resolved = resolveTone(status, tone);
  return (
    <span className={`site00-admin-badge site00-admin-badge--${resolved}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
