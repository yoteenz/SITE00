import { Link, useSearchParams } from 'react-router-dom';

/** Shown when a Production workspace was opened from the Hub; the Hub restores its exact prior context. */
export function HubReturnBar() {
  const [params] = useSearchParams();
  if (params.get('from') !== 'hub') return null;
  return (
    <Link to="/production" className="pw-hubreturn" data-testid="hub-return">
      ← RETURN TO PRODUCTION HUB
    </Link>
  );
}
