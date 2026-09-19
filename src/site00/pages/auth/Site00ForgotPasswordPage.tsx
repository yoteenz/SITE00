import { Link } from 'react-router-dom';
import { Site00AuthExperiencePage } from '../../components/experience/Site00AuthExperiencePage';
import { SITE00_ROUTES } from '../../config/routes';

export default function Site00ForgotPasswordPage() {
  return (
    <Site00AuthExperiencePage pageLabel="FORGOT PASSWORD">
      <div className="site00-auth-form site00-auth-form--forgot">
        <h1 className="site00-auth-form__title">FORGOT PASSWORD</h1>
        <p className="site00-auth-form__hint">ENTER YOUR EMAIL TO RECEIVE A RESET LINK.</p>
        <form className="site00-auth-form__fields" onSubmit={(e) => e.preventDefault()}>
          <label className="site00-auth-field">
            <span>EMAIL</span>
            <input type="email" name="email" autoComplete="email" required />
          </label>
          <button type="submit" className="site00-auth-form__submit">
            SEND RESET LINK
          </button>
        </form>
        <p className="site00-auth-form__footer">
          <Link to={SITE00_ROUTES.signIn}>BACK TO SIGN IN</Link>
        </p>
      </div>
    </Site00AuthExperiencePage>
  );
}
