import { useNavigate } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';
import { signOutAppAndSupabaseSession } from '../../../utils/adminAuth';
import { trackActivity } from '../../../utils/activity';

type CtrlRoomSignOutButtonProps = {
  className?: string;
  variant?: 'topnav' | 'mobile-bar' | 'inline';
};

export function CtrlRoomSignOutButton({ className = '', variant = 'inline' }: CtrlRoomSignOutButtonProps) {
  const navigate = useNavigate();

  const onSignOut = async () => {
    trackActivity('sign_out');
    await signOutAppAndSupabaseSession();
    navigate(SITE00_ROUTES.originAlias, { replace: true });
  };

  return (
    <button
      type="button"
      className={`site00-ctrl-sign-out site00-ctrl-sign-out--${variant} ${className}`.trim()}
      onClick={() => void onSignOut()}
    >
      SIGN OUT
    </button>
  );
}
