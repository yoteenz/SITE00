import { Link } from 'react-router-dom';
import { type ReactNode } from 'react';
import { SITE00_ROUTES } from '../../config/routes';
import { HubLegacySkin, PublicHubPage } from '../public-redesign/PublicHubLayouts';
import { Site00SignInForm } from './Site00SignInForm';
import { useSite00SignInBootstrap } from './useSite00SignInBootstrap';
import { useSite00AuthLayout } from './useSite00AuthLayout';
import { Site00CreateAccountForm } from './Site00CreateAccountForm';

type Site00AuthShellProps = {
  children?: ReactNode;
  /** Which auth surface to render when children are omitted. */
  variant?: 'sign-in' | 'create-account';
};

/**
 * Auth surfaces (`/origin/sign-in`, `/origin/create-account`) inside the public redesign: same shell, plate and hero
 * grammar as IDNTY. The forms (and every auth behaviour) are untouched; only their frame and material changed.
 */
export function Site00AuthShell({ children, variant = 'sign-in' }: Site00AuthShellProps) {
  useSite00SignInBootstrap();
  const authLayout = useSite00AuthLayout();

  const form = children ?? (variant === 'create-account' ? <Site00CreateAccountForm layout={authLayout} /> : <Site00SignInForm layout={authLayout} />);
  const isCreate = variant === 'create-account';

  return (
    <div data-site00-surface="sign-in">
      <PublicHubPage
        section="idnty"
        page={isCreate ? 'create-account' : 'sign-in'}
        envSlotId="ENV.IDNTY.ATRIUM"
        crumb={isCreate ? 'LOCATION / IDNTY / CREATE' : 'LOCATION / IDNTY / SIGN IN'}
        title={isCreate ? 'IDNTY' : 'SIGN IN'}
        subtitle={isCreate ? 'CREATE YOUR IDNTY. JOIN SITE 00.' : 'ACCESS YOUR CTRL ROOM'}
        body={isCreate ? undefined : 'TO MANAGE YOUR ACCOUNT & SITE 00 PROJECTS.'}
        width="narrow"
        hideBottomNav
      >
        <HubLegacySkin kind="auth" className="s00pr-hubpanel">
          {form}
        </HubLegacySkin>
        <p className="s00pr-hubstatus">
          SITE 00™ — CONTROL EVERYTHING. <Link to="/brand/terms">PRIVACY</Link> · <Link to="/brand/terms">TERMS</Link> ·{' '}
          <Link to="/brand/contact">SUPPORT</Link> · <Link to={SITE00_ROUTES.originAlias}>BACK TO SITE 00</Link>
        </p>
      </PublicHubPage>
    </div>
  );
}
