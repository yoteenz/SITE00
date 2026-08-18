type ArrowActionProps = {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'red';
  disabled?: boolean;
};

export function ArrowAction({ label, onClick, variant = 'default', disabled }: ArrowActionProps) {
  const className = `site00-action-link ${variant === 'red' ? 'site00-action-link--red' : ''}`.trim();

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick} disabled={disabled}>
        {label}
        <ArrowIcon />
      </button>
    );
  }

  return (
    <span className={className}>
      {label}
      <ArrowIcon />
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">
      <path d="M0 6H18M18 6L13 1M18 6L13 11" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function ArrowIconSmall() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
      <path d="M0 5H12M12 5L8 1M12 5L8 9" stroke="var(--site-red)" strokeWidth="1" />
    </svg>
  );
}
