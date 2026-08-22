import { Navigate, useParams } from 'react-router-dom';
import { SITE00_ADMIN_ROUTES } from '../site00/admin/config/routes';

/** Shorthand debug URLs → canonical admin email pack route (AdminGuard applies on destination). */
export function EmailPackRedirect() {
  const { templateId } = useParams();
  const target = templateId ? SITE00_ADMIN_ROUTES.emailTemplate(templateId) : SITE00_ADMIN_ROUTES.emailPack;
  return <Navigate to={target} replace />;
}
