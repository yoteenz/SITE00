import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';
import { AccessTargetMark } from './AccessTargetMark';

type AccessDesktopHeaderProps = {
  credentialCode: string;
};

export function AccessDesktopHeader({ credentialCode }: AccessDesktopHeaderProps) {
  return (
    <header className="site00-access-header site00-access-header--desktop">
      <div className="site00-access-header__brand">
        <Link to={SITE00_ROUTES.originAlias} className="site00-access-header__logo">
          SITE 00
        </Link>
        <span className="site00-diamond" aria-hidden="true" />
      </div>
      <p className="site00-access-header__protocol">[ ACCESS PROTOCOL ]</p>
      <div className="site00-access-header__id">
        <span className="site00-access-header__code">{credentialCode.toUpperCase()}</span>
        <AccessTargetMark />
      </div>
    </header>
  );
}
