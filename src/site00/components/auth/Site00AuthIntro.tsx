import { Site00OrbitalMark } from './Site00OrbitalMark';

type Site00AuthIntroProps = {
  variant?: 'desktop-panel' | 'mobile';
};

export function Site00AuthIntro({ variant = 'mobile' }: Site00AuthIntroProps) {
  return (
    <div className={`site00-auth-intro site00-auth-intro--${variant}`.trim()}>
      <p className="site00-auth-intro__mark">[ 00 ]</p>
      <h1 className="site00-auth-intro__title">SIGN IN</h1>
      <p className="site00-auth-intro__copy">
        ACCESS YOUR CTRL ROOM
        <br />
        TO MANAGE YOUR ACCOUNT
        <br />
        &amp; SITE 00 PROJECTS.
      </p>
      {variant === 'mobile' ? <Site00OrbitalMark className="site00-auth-intro__orbital" /> : null}
    </div>
  );
}
