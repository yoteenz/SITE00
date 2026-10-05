import { Link } from 'react-router-dom';

type AccessCTAProps = {
  label?: string;
  onClick?: () => void;
  href?: string;
  visible?: boolean;
  disabled?: boolean;
  className?: string;
};

export function AccessCTA({
  label = 'ENTER SITE 00 →',
  onClick,
  href,
  visible = true,
  disabled = false,
  className = '',
}: AccessCTAProps) {
  const classes = [
    'site00-access-cta',
    visible ? 'site00-access-cta--visible' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <Link to={href} className={classes}>
        {label}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick} disabled={disabled || !visible}>
      {label}
    </button>
  );
}
