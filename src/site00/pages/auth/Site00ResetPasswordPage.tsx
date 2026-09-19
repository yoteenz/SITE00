import { Link } from 'react-router-dom';
import { Site00AuthExperiencePage } from '../../components/experience/Site00AuthExperiencePage';
import { SITE00_ROUTES } from '../../config/routes';

export default function Site00ResetPasswordPage() {
  return (
    <Site00AuthExperiencePage pageLabel="RESET PASSWORD">
      <div className="site00-auth-form site00-auth-form--reset">
        <h1 className="site00-auth-form__title">RESET PASSWORD</h1>
        <p className="site00-auth-form__hint">SET A NEW PASSWORD FOR YOUR ACCOUNT.</p>
        <form className="site00-auth-form__fields" onSubmit={(e) => e.preventDefault()}>
          <label className="site00-auth-field">
            <span>NEW PASSWORD</span>
            <input type="password" name="password" autoComplete="new-password" required />
          </label>
          <label className="site00-auth-field">
            <span>CONFIRM PASSWORD</span>
            <input type="password" name="confirmPassword" autoComplete="new-password" required />
          </label>
          <button type="submit" className="site00-auth-form__submit">
            UPDATE PASSWORD
          </button>
        </form>
        <p className="site00-auth-form__footer">
          <Link to={SITE00_ROUTES.signIn}>BACK TO SIGN IN</Link>
        </p>
      </div>
    </Site00AuthExperiencePage>
  );
}
